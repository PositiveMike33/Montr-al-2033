// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Formules Mathématiques Non-Linéaires de Dégâts (Final Fantasy X)
// ═══════════════════════════════════════════════════════════════════════════

import { Combatant } from '../core/types';

export interface PhysicalDamageParams {
  source: Combatant;
  target: Combatant;
  dmCon?: number; // Constante d'action (défaut 16)
  piercing?: boolean; // Attaque perce-armure
  isCelestial?: boolean; // Arme céleste ignorant DefNum et scaling HP/MP
}

export interface MagicalDamageParams {
  source: Combatant;
  target: Combatant;
  spellPower?: number; // Puissance du sort (DmCon magique)
  element?: string;
}

export interface DamageCalculationResult {
  damage: number;
  isCritical: boolean;
  baseDamage: number;
  defNum: number;
  mitigationMultiplier: number;
}

/**
 * Calcul du facteur d'atténuation d'armure parabolique DefNum (FFX) :
 * DefNum = ⌊(Défense - 280.4)² / 110⌋ + 16
 * Cette courbure parabolique descendante confère des rendements décroissants
 * et empêche l'invulnérabilité absolue tout en restant efficace.
 */
export function calculateFFXDefNum(defense: number): number {
  const clampedDef = Math.max(0, Math.min(255, defense));
  const diff = clampedDef - 280.4;
  const raw = Math.floor((diff * diff) / 110) + 16;
  // Biais de sécurité entre 16 et 730
  return Math.max(16, Math.min(730, raw));
}

/**
 * Calcul complet des dégâts physiques selon l'ingénierie mathématique de FFX :
 * BaseDamage = ⌊((Force + Cheer)³ / 32) + 32⌋ × (DmCon / 16)
 * Dégâts réduits = ⌊(BaseDamage × DefNum) / 730⌋
 * Modificateurs conditionnels :
 * - Encouragement (Cheer) sur la cible : (15 - Stacks) / 15 (max 5 cumuls)
 * - Protect / Blindage ou posture de garde : division par 2
 * - Armure de cible massive : division par 3 sauf si Piercing
 * - Armes Célestes : court-circuit de DefNum (ignore l'armure) et ratio HP/MP
 */
export function calculateFFXPhysicalDamage(params: PhysicalDamageParams): DamageCalculationResult {
  const { source, target, dmCon = 16, piercing = false, isCelestial = false } = params;

  // 1. Force effective avec cumuls d'encouragement (Cheer) du lanceur
  const attackerCheer = Math.min(5, Math.max(0, source.stats.cheerStacks || 0));
  const effectiveStr = Math.min(255, source.stats.strength + attackerCheer);

  // 2. Base Damage brut
  const cubed = Math.floor((Math.pow(effectiveStr, 3) / 32) + 32);
  const baseDamage = Math.floor(cubed * (dmCon / 16));

  // 3. Calcul du DefNum ou court-circuit Arme Céleste
  let defNum = 730;
  let intermediateDmg = baseDamage;

  if (isCelestial) {
    // Arme céleste : ignore DefNum (armure complète court-circuitée)
    // Scale selon le ratio de PV restant du porteur (FFX Ultima Weapon)
    const hpRatio = Math.max(0.1, source.stats.hp / Math.max(1, source.stats.maxHp));
    intermediateDmg = Math.floor(baseDamage * hpRatio);
    defNum = 730; // Equivalent à zéro mitigation d'armure
  } else {
    defNum = calculateFFXDefNum(target.stats.defense);
    intermediateDmg = Math.floor((baseDamage * defNum) / 730);
  }

  // 4. Cascade de modificateurs
  let multiplier = 1.0;

  // A. Encouragement (Cheer) de la cible : (15 - Stacks) / 15
  const targetCheer = Math.min(5, Math.max(0, target.stats.cheerStacks || 0));
  if (targetCheer > 0) {
    multiplier *= (15 - targetCheer) / 15;
  }

  // B. Protect (Blindage) ou Posture de Défense : -50% dégâts
  const hasProtect = target.tags.some(t => t.includes('Buff.Protect') || t.includes('Buff.Blindage'));
  if (target.isDefending || hasProtect) {
    multiplier *= 0.5;
  }

  // C. Propriété d'Armure des cibles massives (Boss/Véhicules) : /3 si non-perçant
  const isArmored = target.tags.some(t => t.includes('Trait.Armored') || t.includes('Trait.Massive'));
  if (isArmored && !piercing && !isCelestial) {
    multiplier *= (1 / 3);
  }

  // 5. Calcul des coups critiques (basé sur la chance)
  const critChance = Math.min(0.8, (source.stats.luck - target.stats.luck + 10) / 100);
  const isCritical = Math.random() < Math.max(0.05, critChance);
  if (isCritical) {
    multiplier *= 1.5;
  }

  // 6. Dégâts finaux avec légère variance organique (+/- 5%)
  const variance = 0.95 + (Math.random() * 0.1);
  const finalDamage = Math.max(1, Math.floor(intermediateDmg * multiplier * variance));

  return {
    damage: finalDamage,
    isCritical,
    baseDamage,
    defNum,
    mitigationMultiplier: multiplier
  };
}

/**
 * Calcul des dégâts magiques selon le modèle FFX :
 * Base = ⌊(Magie² / 6) + SpellPower⌋ × 16
 * Atténuation par Magic Defense et statut Shell
 */
export function calculateFFXMagicalDamage(params: MagicalDamageParams): DamageCalculationResult {
  const { source, target, spellPower = 24, element } = params;

  const effectiveMag = Math.min(255, source.stats.magic + (source.stats.focusStacks || 0));
  const baseMagic = Math.floor((Math.pow(effectiveMag, 2) / 6) + spellPower) * 16;

  const defNum = calculateFFXDefNum(target.stats.magicDefense);
  let intermediateDmg = Math.floor((baseMagic * defNum) / 730);

  let multiplier = 1.0;

  // Statut Shell : division par 2
  const hasShell = target.tags.some(t => t.includes('Buff.Shell'));
  if (hasShell) {
    multiplier *= 0.5;
  }

  // Vulnérabilité / Résistance élémentaire déclarative via GameplayTags
  if (element) {
    if (target.tags.some(t => t.includes(`Weakness.${element}`))) {
      multiplier *= 1.5; // Faiblesse exploitée
    } else if (target.tags.some(t => t.includes(`Resist.${element}`))) {
      multiplier *= 0.5; // Résistance naturelle
    }
  }

  const critChance = Math.min(0.5, source.stats.luck / 150);
  const isCritical = Math.random() < critChance;
  if (isCritical) {
    multiplier *= 1.5;
  }

  const variance = 0.95 + (Math.random() * 0.1);
  const finalDamage = Math.max(1, Math.floor(intermediateDmg * multiplier * variance));

  return {
    damage: finalDamage,
    isCritical,
    baseDamage: baseMagic,
    defNum,
    mitigationMultiplier: multiplier
  };
}
