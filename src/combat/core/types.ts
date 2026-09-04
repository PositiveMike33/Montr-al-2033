// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Types Fondamentaux & Contrats de Données du Domaine
// ═══════════════════════════════════════════════════════════════════════════

export type TurnMode = 'CTB' | 'ATB';

export type CombatSide = 'player' | 'enemy';

export type ActionCategory = 
  | 'attack' 
  | 'tech' 
  | 'psi' 
  | 'item' 
  | 'defend' 
  | 'flee' 
  | 'gambit_auto';

export type ActionRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type TargetScope = 
  | 'single_enemy' 
  | 'all_enemies' 
  | 'single_ally' 
  | 'all_allies' 
  | 'self';

export interface CombatStats {
  hp: number;
  maxHp: number;
  mp: number; // Psychic / Nano energy
  maxMp: number;
  strength: number; // Force brute
  defense: number; // Armure / Résistance physique
  magic: number; // Puissance cyber/psychique
  magicDefense: number; // Défense pare-feu
  agility: number; // Vitesse d'initiative
  luck: number; // Taux de coups critiques
  accuracy: number; // Précision
  evasion: number; // Esquive
  cheerStacks: number; // Cumuls d'encouragement (0 à 5)
  focusStacks: number; // Cumuls de concentration magique (0 à 5)
}

export interface CombatAction {
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  scope: TargetScope;
  mpCost: number;
  hpCost?: number;
  rank: ActionRank; // CTB Rank (1: Très rapide comme Quick Hit, 8: Ultra lourd)
  dmCon?: number; // FFX Action Constant (Défaut 16 pour attaque de base)
  piercing?: boolean; // Perce-armure (ignore la division par 3 d'Armure)
  isCelestial?: boolean; // Ignore DefNum et scale sur ratio HP/MP
  requiredTags?: string[]; // Tags nécessaires sur le lanceur
  prohibitedTags?: string[]; // Tags qui bloquent l'action (ex: State.Debuff.Silence)
  appliedTags?: string[]; // Tags appliqués à la cible
  element?: 'physical' | 'fire' | 'cryo' | 'lightning' | 'psi' | 'cyber';
  delayPower?: number; // Puissance d'attaque de délai (Delay Attack / Delay Buster)
  animationKey?: string;
  soundKey?: string;
}

export interface Combatant {
  id: string;
  name: string;
  side: CombatSide;
  isBoss?: boolean;
  avatarUrl?: string;
  level: number;
  stats: CombatStats;
  tags: string[]; // Arborescence de GameplayTags
  actions: CombatAction[];
  
  // CTB Scheduling State
  currentTick: number; // CT résiduel (plus petit = joue plus vite)
  tickSpeed: number; // TS calculé à partir de l'agilité
  
  // ATB Scheduling State
  atbCurrent: number; // Accumulateur (0 à atbMax)
  atbMax: number; // Typiquement 1000 ou 65535
  
  // Stances & Automation
  isDefending: boolean;
  gambitsActive: boolean;
  isDead: boolean;
}

export interface StateMutation {
  type: 
    | 'MODIFY_HP' 
    | 'MODIFY_MP' 
    | 'ADD_TAG' 
    | 'REMOVE_TAG' 
    | 'SET_DEFENDING' 
    | 'SET_CT' 
    | 'SET_ATB' 
    | 'ADD_CHEER' 
    | 'SET_DEAD';
  targetId: string;
  payload: any;
}

export interface MutationPacket {
  actionId: string;
  sourceId: string;
  targetIds: string[];
  mutations: StateMutation[];
  cues: VisualCueRequest[];
  timestamp: number;
}

export interface VisualCueRequest {
  id: string;
  cueType: 'instant' | 'continuous';
  category: 'damage_text' | 'heal_text' | 'hit_spark' | 'screen_shake' | 'status_particle' | 'audio';
  targetId: string;
  value?: number | string;
  critical?: boolean;
  color?: string;
  durationMs?: number;
  soundName?: string;
}

export interface CombatEvent {
  id: string;
  type: 
    | 'BATTLE_START' 
    | 'TURN_STARTED' 
    | 'COMMAND_SUBMITTED' 
    | 'COMMAND_EXECUTED' 
    | 'DAMAGE_DEALT' 
    | 'HEAL_DEALT' 
    | 'STATUS_APPLIED' 
    | 'STATUS_REMOVED' 
    | 'COMBATANT_DEFEATED' 
    | 'BATTLE_WON' 
    | 'BATTLE_LOST' 
    | 'TICK_ADVANCED';
  timestamp: number;
  data: any;
}

export interface TimelineEntry {
  combatantId: string;
  predictedTurnIndex: number;
  projectedTick: number;
}

export interface CombatState {
  id: string;
  turnMode: TurnMode;
  atbMode: 'active' | 'wait';
  globalTick: number;
  turnCount: number;
  activeCombatantId: string | null;
  combatants: Record<string, Combatant>;
  orderQueue: string[]; // Ordre d'action immédiat pour l'ATB
  timelinePreview: TimelineEntry[]; // Projection des N prochains tours (CTB)
  history: CombatEvent[];
  isBattleOver: boolean;
  winner: CombatSide | null;
  rewards?: {
    exp: number;
    nanites: number;
    satoshis: number;
    lootIds: string[];
  };
}
