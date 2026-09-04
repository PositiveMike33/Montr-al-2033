// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Moteur Active Time Battle (ATB) & Accumulateur Continu
// ═══════════════════════════════════════════════════════════════════════════

import { CombatState, Combatant } from '../core/types';

export interface ATBConfig {
  loopConstantC: number; // Constante C (ex: 64)
  battleSpeed: number; // 1 (rapide) à 5 (lent), défaut 3
  atbThreshold: number; // Seuil de saturation (ex: 1000)
}

export const DEFAULT_ATB_CONFIG: ATBConfig = {
  loopConstantC: 64,
  battleSpeed: 2, // Calibré pour un tempo de combat plus dynamique et réactif
  atbThreshold: 1000
};

export class ATBEngine {
  /**
   * Initialise les jauges ATB au début du combat.
   * Permet au joueur d'avoir une jauge quasi pleine (75-85%) pour agir rapidement,
   * tout en laissant une fenêtre tactique pour analyser l'ennemi avant sa première riposte.
   */
  public static initializeBattleATB(combatants: Record<string, Combatant>): void {
    let enemyIndex = 0;
    for (const c of Object.values(combatants)) {
      if (c.side === 'player') {
        const isLeader = c.id === 'thirty3';
        // Le joueur démarre à 80% pour ouvrir le bal presque immédiatement (~0.5s)
        c.atbCurrent = isLeader 
          ? Math.min(c.atbMax - 100, Math.floor(c.atbMax * 0.80 + (c.stats.agility * 1.5)))
          : Math.min(c.atbMax - 250, Math.floor(c.atbMax * 0.60 + (c.stats.agility * 1.2)));
      } else {
        // Les ennemis ont un délai d'ouverture échelonné (~20-35%)
        const stagger = enemyIndex * 60;
        enemyIndex++;
        c.atbCurrent = Math.max(120, Math.min(Math.floor(c.atbMax * 0.35), Math.floor(c.atbMax * 0.22 + (c.stats.agility * 1.0)) - stagger));
      }
    }
  }

  /**
   * Calcule le taux d'incrément ΔATB par tick pour un combattant (Formule FFVI canonique optimisée)
   * ΔATB = ⌊(20 / C) × (Vitesse + 24) × (255 - (BattleSpeed - 1) × 20) / 255⌋
   */
  public static calculateATBIncrement(combatant: Combatant, config: ATBConfig = DEFAULT_ATB_CONFIG): number {
    if (combatant.isDead) return 0;

    // Statut Stop / Stun : accumulateur complètement gelé
    if (combatant.tags.some(t => t.includes('State.Stun') || t.includes('State.Stop'))) {
      return 0;
    }

    const speed = Math.max(1, combatant.stats.agility);
    const speedFactor = speed + 24;
    const battleSpeedModifier = Math.max(0, 255 - (config.battleSpeed - 1) * 20);
    const baseIncrement = Math.floor((20 / config.loopConstantC) * speedFactor * (battleSpeedModifier / 255));

    // Modificateurs temporels de statut
    let rateMultiplier = 1.0;
    if (combatant.tags.some(t => t.includes('Buff.Haste') || t.includes('Buff.Hate'))) {
      rateMultiplier = 1.5; // Hâte : +50% de vitesse de jauge
    } else if (combatant.tags.some(t => t.includes('Debuff.Slow') || t.includes('Debuff.Lenteur'))) {
      rateMultiplier = 0.5; // Lenteur : -50%
    }

    return Math.max(1, Math.floor(baseIncrement * rateMultiplier));
  }

  /**
   * Avance d'un tick d'échantillonnage pour tous les accumulateurs ATB.
   * En mode 'wait', si le joueur parcourt les sous-menus, l'accumulation est suspendue.
   */
  public static stepATB(
    state: CombatState, 
    isMenuOpenInWaitMode: boolean = false,
    config: ATBConfig = DEFAULT_ATB_CONFIG
  ): string[] {
    // Si nous sommes en mode Attente (Wait Mode) et qu'un sous-menu est ouvert, les jauges sont gelées
    if (state.atbMode === 'wait' && isMenuOpenInWaitMode) {
      return [];
    }

    const readyCombatants: string[] = [];
    const living = Object.values(state.combatants).filter(c => !c.isDead);

    for (const c of living) {
      // Si le combattant est déjà dans la file d'attente d'ordres, il n'accumule plus
      if (state.orderQueue.includes(c.id)) continue;

      const inc = this.calculateATBIncrement(c, config);
      c.atbCurrent = Math.min(c.atbMax, c.atbCurrent + inc);

      if (c.atbCurrent >= c.atbMax) {
        state.orderQueue.push(c.id);
        readyCombatants.push(c.id);
      }
    }

    state.globalTick += 1;
    return readyCombatants;
  }

  /**
   * Consomme la jauge ATB du combattant après avoir émis une commande
   */
  public static consumeATB(combatant: Combatant): void {
    combatant.atbCurrent = 0;
  }
}
