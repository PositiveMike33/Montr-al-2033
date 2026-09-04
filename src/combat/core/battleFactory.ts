// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Fabrique d'État Initial de Combat (Battle State Factory)
// ═══════════════════════════════════════════════════════════════════════════

import { CombatState, Combatant, CombatAction, TurnMode } from './types';
import { calculateTickSpeed } from '../scheduling/CTBEngine';

export interface BattleFactoryParams {
  playerLevel: number;
  playerHp: number;
  playerMaxHp: number;
  playerPsi: number;
  playerMaxPsi: number;
  bossHp?: number;
  bossName?: string;
  sectorName?: string;
  turnMode?: TurnMode;
}

export function createFFBattleState(params: BattleFactoryParams): CombatState {
  const {
    playerLevel,
    playerHp,
    playerMaxHp,
    playerPsi,
    playerMaxPsi,
    bossHp = 8500,
    bossName = 'Viktor Vance & Milice SPVM-Prime',
    turnMode = 'CTB'
  } = params;

  // Actions de Thirty3
  const playerActions: CombatAction[] = [
    {
      id: 'attack',
      name: 'Attaque Cyber-Lame',
      description: 'Coup tranchant physique haute fréquence. (DmCon 16)',
      category: 'attack',
      scope: 'single_enemy',
      mpCost: 0,
      rank: 3,
      dmCon: 16
    },
    {
      id: 'quick_hit',
      name: 'Frappe Éclair (Quick Hit)',
      description: 'Attaque rapide à inertie minimale. Reprogramme le tour très vite. (Rang 1)',
      category: 'attack',
      scope: 'single_enemy',
      mpCost: 15,
      rank: 1,
      dmCon: 16
    },
    {
      id: 'psi_lance',
      name: 'Psi Lance Quantique',
      description: 'Focalisation psychique perçante exploitant les failles neuro-synaptiques.',
      category: 'psi',
      scope: 'single_enemy',
      mpCost: 24,
      rank: 4,
      dmCon: 32,
      element: 'psi',
      prohibitedTags: ['State.Debuff.Silence']
    },
    {
      id: 'emp_overload',
      name: 'Surcharge EMP Tactique',
      description: 'Décharge électromagnétique de zone affectant tous les adversaires.',
      category: 'tech',
      scope: 'all_enemies',
      mpCost: 35,
      rank: 5,
      dmCon: 28,
      element: 'cyber',
      delayPower: 4 // Delay Buster effect!
    },
    {
      id: 'cure_nanites',
      name: 'Nanites de Soin',
      description: 'Infusion de nanorobots réparateurs restaurant les points de vie.',
      category: 'tech',
      scope: 'single_ally',
      mpCost: 18,
      rank: 3
    },
    {
      id: 'cheer_protocol',
      name: 'Protocole Encouragement (Cheer)',
      description: 'Renforce la résistance physique de toute l’escouade (+1 Cheer Stack).',
      category: 'tech',
      scope: 'all_allies',
      mpCost: 10,
      rank: 2
    }
  ];

  // Actions du Drone Compagnon
  const droneActions: CombatAction[] = [
    {
      id: 'drone_laser',
      name: 'Mitraillage Laser Gatling',
      description: 'Tir cadencé du drone de reconnaissance.',
      category: 'attack',
      scope: 'single_enemy',
      mpCost: 0,
      rank: 2,
      dmCon: 14
    },
    {
      id: 'shield_barrier',
      name: 'Barrière Défensive Tactique',
      description: 'Déploie un champ de force protégeant Thirty3 (Protect).',
      category: 'tech',
      scope: 'single_ally',
      mpCost: 15,
      rank: 3,
      appliedTags: ['State.Buff.Protect']
    }
  ];

  // Actions du Boss Viktor Vance
  const bossActions: CombatAction[] = [
    {
      id: 'vance_strike',
      name: 'Fulgurance Électrostatique',
      description: 'Frappe lourde avec gantelet surchargé.',
      category: 'attack',
      scope: 'single_enemy',
      mpCost: 0,
      rank: 3,
      dmCon: 20
    },
    {
      id: 'corporate_mandate',
      name: 'Mandat d’Exécution Alpha',
      description: 'Assaut massif de la milice corporative SPVM.',
      category: 'tech',
      scope: 'single_enemy',
      mpCost: 25,
      rank: 5,
      dmCon: 36
    },
    {
      id: 'delay_buster',
      name: 'Onde de Choc Distorsive (Delay Buster)',
      description: 'Repousse la cible profondément dans la file CTB.',
      category: 'tech',
      scope: 'single_enemy',
      mpCost: 20,
      rank: 4,
      dmCon: 18,
      delayPower: 4
    }
  ];

  // Combattant : Thirty3 (Joueur principal - Leader d'escouade)
  const playerAgility = 45 + playerLevel * 2;
  const thirty3: Combatant = {
    id: 'thirty3',
    name: 'Thirty3 // Cyber-Mercenaire',
    side: 'player',
    level: playerLevel,
    stats: {
      hp: Math.max(100, playerHp),
      maxHp: Math.max(100, playerMaxHp),
      mp: Math.max(20, playerPsi),
      maxMp: Math.max(20, playerMaxPsi),
      strength: 40 + playerLevel * 3,
      defense: 35 + playerLevel * 2,
      magic: 45 + playerLevel * 3,
      magicDefense: 35 + playerLevel * 2,
      agility: playerAgility,
      luck: 25,
      accuracy: 95,
      evasion: 20,
      cheerStacks: 0,
      focusStacks: 0
    },
    tags: [],
    actions: playerActions,
    currentTick: 0,
    tickSpeed: calculateTickSpeed(playerAgility),
    atbCurrent: 800, // Démarre à 80% pour permettre une saisie d'ordre quasi immédiate
    atbMax: 1000,
    isDefending: false,
    gambitsActive: false,
    isDead: false
  };

  // Combattant : Drone Compagnon (Support tactique)
  const companionDrone: Combatant = {
    id: 'companion_drone',
    name: 'Drone Argus Recon',
    side: 'player',
    level: playerLevel,
    stats: {
      hp: 1200 + playerLevel * 50,
      maxHp: 1200 + playerLevel * 50,
      mp: 100,
      maxMp: 100,
      strength: 25 + playerLevel * 2,
      defense: 40 + playerLevel * 2,
      magic: 30 + playerLevel * 2,
      magicDefense: 45 + playerLevel * 2,
      agility: 42, // Cadencé légèrement après Thirty3 pour un relais tactique fluide
      luck: 30,
      accuracy: 99,
      evasion: 40,
      cheerStacks: 0,
      focusStacks: 0
    },
    tags: ['Trait.Mechanical'],
    actions: droneActions,
    currentTick: 0,
    tickSpeed: calculateTickSpeed(42),
    atbCurrent: 600, // Démarre à 60% en soutien
    atbMax: 1000,
    isDefending: false,
    gambitsActive: true, // Drone toujours automatisé en Gambit
    isDead: false
  };

  // Combattant : Viktor Vance (Boss)
  const bossAgility = 32 + Math.floor(playerLevel * 1.5);
  const boss: Combatant = {
    id: 'viktor_vance',
    name: bossName,
    side: 'enemy',
    isBoss: true,
    level: playerLevel + 2,
    stats: {
      hp: bossHp,
      maxHp: bossHp,
      mp: 500,
      maxMp: 500,
      strength: 50 + playerLevel * 3,
      defense: 65 + playerLevel * 2,
      magic: 45 + playerLevel * 2,
      magicDefense: 55 + playerLevel * 2,
      agility: bossAgility,
      luck: 20,
      accuracy: 90,
      evasion: 15,
      cheerStacks: 0,
      focusStacks: 0
    },
    tags: ['Trait.Boss', 'Trait.Armored', 'Weakness.psi'],
    actions: bossActions,
    currentTick: 0,
    tickSpeed: calculateTickSpeed(bossAgility),
    atbCurrent: 250, // 25% ATB pour donner une ouverture juste au joueur
    atbMax: 1000,
    isDefending: false,
    gambitsActive: true,
    isDead: false
  };

  // Combattant : Drone Milice SPVM
  const minionAgility = 28 + playerLevel;
  const spvmElite: Combatant = {
    id: 'spvm_elite',
    name: 'Milice SPVM-Prime // Escouade Alpha',
    side: 'enemy',
    level: playerLevel,
    stats: {
      hp: 1800 + playerLevel * 80,
      maxHp: 1800 + playerLevel * 80,
      mp: 120,
      maxMp: 120,
      strength: 35 + playerLevel * 2,
      defense: 50 + playerLevel * 2,
      magic: 25,
      magicDefense: 35,
      agility: minionAgility,
      luck: 15,
      accuracy: 85,
      evasion: 10,
      cheerStacks: 0,
      focusStacks: 0
    },
    tags: ['Trait.Mechanical'],
    actions: [
      {
        id: 'spvm_rifle',
        name: 'Tir de Répression Stroboscopique',
        description: 'Tir semi-automatique percutant.',
        category: 'attack',
        scope: 'single_enemy',
        mpCost: 0,
        rank: 3,
        dmCon: 15
      }
    ],
    currentTick: 0,
    tickSpeed: calculateTickSpeed(minionAgility),
    atbCurrent: 180, // 18% ATB, étalonné pour éviter un assaut simultané avec le boss
    atbMax: 1000,
    isDefending: false,
    gambitsActive: true,
    isDead: false
  };

  const combatants: Record<string, Combatant> = {
    thirty3,
    companion_drone: companionDrone,
    viktor_vance: boss,
    spvm_elite: spvmElite
  };

  return {
    id: `encounter_${Date.now()}`,
    turnMode,
    atbMode: 'active',
    globalTick: 0,
    turnCount: 1,
    activeCombatantId: turnMode === 'CTB' ? 'thirty3' : null,
    combatants,
    orderQueue: [],
    timelinePreview: [],
    history: [],
    isBattleOver: false,
    winner: null,
    rewards: {
      exp: 1200,
      nanites: 450,
      satoshis: 750,
      lootIds: ['legendary_cyber_blade', 'nanite_core_vance']
    }
  };
}
