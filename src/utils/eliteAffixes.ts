// ═══════════════════════════════════════════════════════════════
// DIABLO 4 STYLE ELITE AFFIXES & ENEMY BEHAVIOR ENGINE
// Montréal 2033: Neural Overload ARPG
// ═══════════════════════════════════════════════════════════════

import { 
  CombatEntity, 
  EliteAffixType, 
  EliteTier, 
  DamageType, 
  CyberSoldierClass,
  AreaEffect,
  Projectile,
  FloatingText,
  Particle
} from '../types';

export interface EliteAffixMeta {
  id: EliteAffixType;
  name: string;
  badge: string;
  description: string;
  color: string;
  cooldownFrames: number;
}

export const ELITE_AFFIXES_CATALOG: Record<EliteAffixType, EliteAffixMeta> = {
  firewall: {
    id: 'firewall',
    name: 'Coupe-Feu Laser',
    badge: 'FIREWALL',
    description: 'Déploie des barrières lasers brûlantes bloquant les lignes de déplacement.',
    color: '#ff3366',
    cooldownFrames: 360 // 6 seconds
  },
  mortar_protocol: {
    id: 'mortar_protocol',
    name: 'Protocole Mortier',
    badge: 'MORTIER',
    description: 'Tire des salves de mortiers énergétiques télégraphiés au sol.',
    color: '#f97316',
    cooldownFrames: 240 // 4 seconds
  },
  emp_aura: {
    id: 'emp_aura',
    name: 'Aura IEM Siphon',
    badge: 'IEM AURA',
    description: 'Zone statique pulsante qui draine l’énergie Psi du joueur à proximité.',
    color: '#00f0ff',
    cooldownFrames: 120 // 2 seconds
  },
  cloak_matrix: {
    id: 'cloak_matrix',
    name: 'Matrice Camouflage',
    badge: 'CAMOUFLAGE',
    description: 'Disparaît périodiquement des radars et devient temporairement invisible.',
    color: '#38bdf8',
    cooldownFrames: 300 // 5 seconds
  },
  reflector_shield: {
    id: 'reflector_shield',
    name: 'Bouclier Réflecteur',
    badge: 'RÉFLECTEUR',
    description: 'Renvoie une partie des projectiles et réduit les dégâts à distance.',
    color: '#a855f7',
    cooldownFrames: 0 // Passif constant
  },
  overclock: {
    id: 'overclock',
    name: 'Surcadençage Berserk',
    badge: 'OVERCLOCK',
    description: 'Augmente la vitesse de déplacement et d’attaque de 60% sous 50% de PV.',
    color: '#ef4444',
    cooldownFrames: 0 // Passif conditionnel
  },
  holo_decoy: {
    id: 'holo_decoy',
    name: 'Leurres Holographiques',
    badge: 'LEURRES',
    description: 'Projette des clones holographiques pour désorienter le joueur.',
    color: '#ec4899',
    cooldownFrames: 420 // 7 seconds
  },
  pulse_mine: {
    id: 'pulse_mine',
    name: 'Mines de Proximité',
    badge: 'MINES',
    description: 'Éjecte des mines laser explosives au sol qui détonent au passage.',
    color: '#eab308',
    cooldownFrames: 280 // ~4.5 seconds
  },
  tether: {
    id: 'tether',
    name: 'Lien Cybernétique',
    badge: 'TETHER',
    description: 'Verrouille un câble d’énergie sur le joueur, le ralentissant s’il s’éloigne.',
    color: '#8b5cf6',
    cooldownFrames: 360 // 6 seconds
  },
  resurrect_protocol: {
    id: 'resurrect_protocol',
    name: 'Protocole Résurrection',
    badge: 'RÉSURRECTION',
    description: 'Réanime les unités cybernétiques alliées neutralisées aux alentours.',
    color: '#10b981',
    cooldownFrames: 480 // 8 seconds
  }
};

export const ALL_ELITE_AFFIXES = Object.keys(ELITE_AFFIXES_CATALOG) as EliteAffixType[];

// ═══════════════════════════════════════════════════════════════
// ELEMENTAL RESISTANCE PROFILES
// ═══════════════════════════════════════════════════════════════

export function getDefaultResistances(soldierClass?: CyberSoldierClass): Partial<Record<DamageType, number>> {
  switch (soldierClass) {
    case 'heavy_exo':
      return {
        physical: 35, // Robuste face aux lames physiques
        cyber: -20,   // Vulnérable aux IEM / piratage
        cryo: -15,    // Moteurs hydrauliques gèlent plus vite
        psi: 0,
        toxic: 20
      };
    case 'stealth_ninja':
      return {
        physical: -10,
        cryo: 25,
        psi: 25,      // Résistance mentale
        toxic: -30,   // Biologie exposée sensible aux virus/malware
        cyber: 10
      };
    case 'cyber_sniper':
      return {
        physical: -25, // Armure légère
        cyber: 35,    // Systèmes optiques isolés
        psi: -15,     // Focus mental vulnérable au Psi
        cryo: 0,
        toxic: 0
      };
    case 'assault_trooper':
      return {
        physical: 10,
        cyber: 5,
        psi: -15,
        cryo: 5,
        toxic: 10
      };
    case 'commandant_boss':
      return {
        physical: 20,
        cyber: 20,
        psi: 15,
        cryo: 15,
        toxic: 20
      };
    default:
      return {
        physical: 0,
        cyber: 0,
        psi: 0,
        cryo: 0,
        toxic: 0
      };
  }
}

// ═══════════════════════════════════════════════════════════════
// ELITE AFFIX ROLLER
// ═══════════════════════════════════════════════════════════════

export function rollEliteAffixes(tier: EliteTier, difficultyTier: number): EliteAffixType[] {
  const count = tier === 'champion' ? 1 : Math.min(3, 2 + (difficultyTier >= 5 ? 1 : 0));
  const pool = [...ALL_ELITE_AFFIXES];
  const rolled: EliteAffixType[] = [];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    rolled.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return rolled;
}

// ═══════════════════════════════════════════════════════════════
// TELEGRAPHED HAZARD STATE
// ═══════════════════════════════════════════════════════════════

export interface TelegraphedHazard {
  id: string;
  type: 'mortar' | 'pulse_mine' | 'firewall';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  delayFrames: number;      // Frames before explosion/activation
  maxDelayFrames: number;
  damage: number;
  damageType: DamageType;
  color: string;
  sourceEnemyId: string;
  activeDuration?: number;  // For persistent hazards like laser firewall
}

// ═══════════════════════════════════════════════════════════════
// PROCESS ELITE AFFIXES PER FRAME
// ═══════════════════════════════════════════════════════════════

export function processEliteAffixes(
  enemy: CombatEntity,
  player: { x: number; y: number; radius: number; iFrames?: boolean },
  hazards: TelegraphedHazard[],
  projectiles: Projectile[],
  particles: Particle[],
  floatingTexts: FloatingText[],
  onPlayerDamaged: (dmg: number) => void,
  onPsiDrained: (amount: number) => void
) {
  if (!enemy.isElite || !enemy.eliteAffixes || enemy.hp <= 0) return;

  if (!enemy.eliteAffixTimers) {
    enemy.eliteAffixTimers = {};
  }

  const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y) || 1;

  enemy.eliteAffixes.forEach(affixKey => {
    const meta = ELITE_AFFIXES_CATALOG[affixKey];
    if (!meta) return;

    const curTimer = enemy.eliteAffixTimers![affixKey] || 0;
    if (curTimer > 0) {
      enemy.eliteAffixTimers![affixKey] = curTimer - 1;
      return;
    }

    switch (affixKey) {
      case 'mortar_protocol': {
        // Launch 2-3 telegraphed mortar circles near player
        if (distToPlayer < 450) {
          enemy.eliteAffixTimers![affixKey] = meta.cooldownFrames;
          const mortarCount = 2;
          for (let m = 0; m < mortarCount; m++) {
            const spreadAngle = Math.random() * Math.PI * 2;
            const spreadDist = Math.random() * 60;
            const targetX = player.x + Math.cos(spreadAngle) * spreadDist;
            const targetY = player.y + Math.sin(spreadAngle) * spreadDist;

            hazards.push({
              id: 'mortar_' + Math.random(),
              type: 'mortar',
              x: enemy.x,
              y: enemy.y,
              targetX,
              targetY,
              radius: 48,
              delayFrames: 70, // ~1.15s warning circle
              maxDelayFrames: 70,
              damage: enemy.damage * 1.35,
              damageType: 'cyber',
              color: '#f97316',
              sourceEnemyId: enemy.id
            });
          }

          floatingTexts.push({
            id: 'txt_' + Math.random(),
            text: 'MORTIER ARME',
            x: enemy.x,
            y: enemy.y - 30,
            color: '#f97316',
            size: 11,
            life: 30,
            maxLife: 30
          });
        }
        break;
      }

      case 'pulse_mine': {
        // Drop a laser proximity mine near enemy
        if (distToPlayer < 350) {
          enemy.eliteAffixTimers![affixKey] = meta.cooldownFrames;
          hazards.push({
            id: 'mine_' + Math.random(),
            type: 'pulse_mine',
            x: enemy.x,
            y: enemy.y,
            targetX: enemy.x + (Math.random() - 0.5) * 40,
            targetY: enemy.y + (Math.random() - 0.5) * 40,
            radius: 36,
            delayFrames: 30, // 0.5s armed delay
            maxDelayFrames: 30,
            activeDuration: 600, // 10s lifetime
            damage: enemy.damage * 1.5,
            damageType: 'cyber',
            color: '#eab308',
            sourceEnemyId: enemy.id
          });
        }
        break;
      }

      case 'firewall': {
        // Drop a horizontal or vertical laser firewall hazard
        if (distToPlayer < 380) {
          enemy.eliteAffixTimers![affixKey] = meta.cooldownFrames;
          hazards.push({
            id: 'firewall_' + Math.random(),
            type: 'firewall',
            x: enemy.x,
            y: enemy.y,
            targetX: player.x,
            targetY: player.y,
            radius: 75,
            delayFrames: 45,
            maxDelayFrames: 45,
            activeDuration: 300, // 5s active wall
            damage: enemy.damage * 0.4, // DoT
            damageType: 'toxic',
            color: '#ff3366',
            sourceEnemyId: enemy.id
          });
        }
        break;
      }

      case 'emp_aura': {
        // If player is within aura, pulse damage & drain Psi
        if (distToPlayer < 120) {
          enemy.eliteAffixTimers![affixKey] = 40; // Pulse every ~0.66s
          onPsiDrained(6);
          onPlayerDamaged(Math.max(1, Math.round(enemy.damage * 0.15)));

          floatingTexts.push({
            id: 'txt_' + Math.random(),
            text: '-6 PSI (IEM)',
            x: player.x,
            y: player.y - 25,
            color: '#00f0ff',
            size: 12,
            life: 25,
            maxLife: 25
          });

          // Aura sparks
          for (let p = 0; p < 8; p++) {
            const a = Math.random() * Math.PI * 2;
            particles.push({
              x: enemy.x + Math.cos(a) * 50,
              y: enemy.y + Math.sin(a) * 50,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              size: 2,
              color: '#00f0ff',
              alpha: 0.9,
              life: 15,
              maxLife: 15
            });
          }
        }
        break;
      }

      case 'cloak_matrix': {
        // Toggle cloaking invisibility
        enemy.eliteAffixTimers![affixKey] = meta.cooldownFrames;
        enemy.cloaked = true;
        setTimeout(() => {
          enemy.cloaked = false;
        }, 2200); // 2.2 seconds invisible
        break;
      }

      case 'overclock': {
        // Active when HP is under 50%
        if (enemy.hp < enemy.maxHp * 0.5) {
          enemy.speed = (enemy.speed || 2.5) * 1.01; // subtle frame boost, capped
        }
        break;
      }

      default:
        break;
    }
  });
}
