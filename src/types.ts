// ═══════════════════════════════════════════════════════════════
// DIABLO 4 COMBAT SYSTEMS — Damage Types, Status Effects, Potions
// ═══════════════════════════════════════════════════════════════

export type DamageType = 'physical' | 'cyber' | 'psi' | 'cryo' | 'toxic';

export type StatusEffectType = 
  | 'neural_breach'   // Vulnerability: +25% damage taken (D4: Vulnerable)
  | 'bio_fortify'     // Damage reduction -15% (D4: Fortify)
  | 'psi_barrier'     // Temporary shield absorbing X damage (D4: Barrier)
  | 'circuit_bleed'   // Physical DoT over 4s (D4: Bleed)
  | 'cryo_lock'       // Slow → Freeze (immobilized 2s) (D4: Freeze)
  | 'malware'         // DoT + reduce healing -30% (D4: Poison)
  | 'stun';           // Existing stun, now formalized

export interface StatusEffect {
  type: StatusEffectType;
  duration: number;       // Remaining frames
  maxDuration: number;    // Total duration in frames
  value: number;          // Effect magnitude (damage per tick, slow %, etc.)
  stacks: number;         // Stack count (for bleed, malware)
  source: 'player' | 'enemy' | 'environment';
}

export interface PotionSystem {
  charges: number;
  maxCharges: number;
  healPercent: number;     // % of maxHp healed per potion
  cooldownTimer: number;   // Frames remaining before next potion use
  cooldownMax: number;     // Frames between potion uses (90 = 1.5s at 60fps)
  killsToRecharge: number; // Kills needed to recharge 1 charge
  killCounter: number;     // Current kill counter towards next recharge
}

export type EliteAffixType =
  | 'firewall'          // Laser wall barriers
  | 'mortar_protocol'   // Arc projectiles to player position
  | 'emp_aura'          // Drains Psi nearby
  | 'cloak_matrix'      // Periodic invisibility
  | 'reflector_shield'  // Reflects 20% projectile damage
  | 'overclock'         // +50% attack speed when <50% HP
  | 'holo_decoy'        // Creates holographic decoys
  | 'pulse_mine'        // Drops proximity mines
  | 'tether'            // Energy cable, slows player if far
  | 'resurrect_protocol'; // Revives nearby dead allies

export type EliteTier = 'champion' | 'elite';

export type ItemRarity = 'standard' | 'rare' | 'epic' | 'legendary';

export type ItemSlot = 'deck' | 'armor' | 'weapon' | 'chip' | 'boots';

export interface ItemAffix {
  name: string;
  stat: 'damage' | 'psiDamage' | 'health' | 'psiEnergy' | 'armor' | 'critChance' | 'critDamage' | 'moveSpeed' | 'cooldownReduction' | 'lifeSteal';
  value: number;
}

export interface NeuralModule {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'utility';
  stat: 'physicalDamage' | 'psiDamage' | 'armor' | 'maxHp' | 'maxPsi' | 'critChance' | 'critDamage' | 'moveSpeed' | 'cooldownReduction' | 'lifeSteal';
  value: number;
  rarity: ItemRarity;
  icon: string;
  description: string;
}

export interface StoredAspect {
  id: string;
  name: string;
  description: string;
  type: 'chain_lightning' | 'dodge_bullet_time' | 'emp_freeze' | 'psi_nova_on_kill' | 'vampiric_hack';
  extractedFrom: string;
  rarity: ItemRarity;
}

export type ItemPowerBracket = 'basique' | 'avance' | 'expert' | 'ancestral' | 'uber';

export interface EquipmentItem {
  id: string;
  name: string;
  slot: ItemSlot;
  rarity: ItemRarity;
  levelReq: number;
  itemPower?: number; // 1 to 800 (D4 Item Power)
  itemPowerBracket?: ItemPowerBracket;
  baseStat: {
    name: string;
    value: number;
  };
  affixes: ItemAffix[];
  sockets?: (NeuralModule | null)[]; // 0 to 2 sockets for Neural Modules
  legendaryPassive?: {
    name: string;
    description: string;
    type: 'chain_lightning' | 'dodge_bullet_time' | 'emp_freeze' | 'psi_nova_on_kill' | 'vampiric_hack';
  };
  imprintedAspectName?: string;
  isEnchanted?: boolean;
  setName?: string;
  bossSource?: string;
  sellValue: number;
  btcValue?: number;
  realWorldSpecs?: string;
  githubUrl?: string;
  educationalConcept?: string;
  iconName: string;
}

export interface StoryDialogue {
  id: string;
  speaker: 'Thirty3' | 'Deus Ex Sophia' | 'Viktor Vance' | 'Système';
  speakerTitle: string;
  avatarColor: string;
  text: string;
}

export type AbilityType = 'primary' | 'lance' | 'emp' | 'vortex' | 'bulletTime' | 'dash';

export interface AbilityMasteryTier {
  tier: number;
  reqUses: number;
  perkName: string;
  perkDesc: string;
  unlocked: boolean;
  statBonusDesc?: string;
}

export interface AbilityMasteryData {
  id: AbilityType;
  name: string;
  subtitle: string;
  icon: string;
  hotkey: string;
  branch: 'cyber' | 'psychic';
  usesCount: number;
  currentTier: number;
  tiers: AbilityMasteryTier[];
}

export type EquipmentLoadoutType = 'combat' | 'hacking';

export interface EquipmentLoadout {
  id: EquipmentLoadoutType;
  name: string;
  description: string;
  icon: string;
  accentColor: string;
  slots: { [key in ItemSlot]?: EquipmentItem };
}

export interface PlayerAttributes {
  synapticPower: number; // Psychic damage, mental range, psi crit
  cyberOverclock: number; // Elemental hacking damage, cooldown speed, armor pen
  bioArmor: number;       // Max HP, kinetic resistance, HP regen
  neuralReflex: number;   // Move speed, dodge chance, attack speed
}

export interface PlayerStats {
  maxHp: number;
  currentHp: number;
  maxPsi: number;
  currentPsi: number;
  hpRegen: number;
  psiRegen: number;
  physicalDamage: number;
  psiDamage: number;
  armor: number;
  critChance: number;
  critDamage: number;
  moveSpeed: number;
  cooldownReduction: number;
  dodgeChance: number;
  lifeSteal: number;
}

export interface SkillNode {
  id: string;
  name: string;
  branch: 'cyber' | 'psychic';
  icon: string;
  description: string;
  maxRank: number;
  currentRank: number;
  reqPoints: number;
  effect: {
    stat: string;
    perRank: number;
  };
}

export type HairstyleType = 
  | 'slick_back' 
  | 'cyber_fade' 
  | 'neon_mohawk' 
  | 'undercut' 
  | 'samurai_bun' 
  | 'cyber_dreads' 
  | 'buzzcut' 
  | 'long_flowing';

export type BeardType = 'clean' | 'stubble' | 'cyber_goatee' | 'tactical_beard';
export type OuterwearType = 'neo_trenchcoat' | 'stealth_jacket' | 'exo_tactical_vest' | 'corp_duster';
export type PantsType = 'tactical_cargo' | 'carbon_greaves' | 'nano_weave' | 'exo_struts';
export type BootsType = 'combat_jump_boots' | 'mag_lock_treads' | 'cyber_sneakers' | 'heavy_exo_boots';
export type CyberArmType = 'none' | 'left_chrome' | 'right_plasma' | 'dual_bionic';

export type AchievementCategory = 'combat' | 'loot' | 'skills' | 'progression' | 'mastery';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  iconName: string;
  badgeTitle: string;
  badgeIcon: string;
  badgeColor: string;
  targetValue: number;
  currentValue: number;
  unlocked: boolean;
  unlockedAt?: number;
  rewardNanites: number;
  rewardExp: number;
  statBonus?: {
    description: string;
    stat: keyof PlayerStats;
    value: number;
  };
}

export interface AchievementNotificationItem {
  id: string;
  achievement: Achievement;
  timestamp: number;
}

export interface AvatarCustomization {
  hairColor: string;
  visorColor: string;
  suitColor: string;
  bladeColor: string;
  auraColor: string;
  gender: 'masc' | 'femme' | 'cyborg';
  // Head-to-toe ultra-realistic recreation features
  realName?: string;
  personalBio?: string;
  photoUrl?: string;
  faceShape?: 'angular' | 'oval' | 'square' | 'cyber_jaw';
  eyeColor?: string;
  skinTone?: string;
  hairstyle?: HairstyleType;
  beardStyle?: BeardType;
  outerwear?: OuterwearType;
  pantsStyle?: PantsType;
  bootsStyle?: BootsType;
  cyberArm?: CyberArmType;
  psiGauntlet?: boolean;
  cyberImplantStyle?: 'subtle' | 'neural_mesh' | 'heavy_chrome' | 'holo_circuit';
  glowPattern?: 'neon_veins' | 'spine_relay' | 'matrix_glyphs' | 'quantum_lattice';
  cameraAngle?: 'diablo_isometric' | 'top_down';
  // Active equipped badge on profile & HUD
  activeBadgeId?: string;
  // Active equipped weapon skin
  activeWeaponSkinId?: string;
}

export type CodexCategory = 'bastions' | 'factions' | 'technologies' | 'targets';

export interface CodexEntry {
  id: string;
  stageId?: number;
  title: string;
  subtitle: string;
  category: CodexCategory;
  clearanceLevel: 1 | 2 | 3 | 4;
  date: string;
  location: string;
  summary: string;
  content: string[];
  audioLogTranscript?: string;
  tacticalNotes?: string[];
  bannerAccent: string;
  iconName: string;
  unlocked: boolean;
  unlockRequirement: string;
  unlockedAt?: number;
}

export type WeaponSkinBladeStyle = 
  | 'katana' 
  | 'plasma_cleaver' 
  | 'void_reaper' 
  | 'cryo_saber' 
  | 'matrix_glitch' 
  | 'solar_flare' 
  | 'prismatic_god' 
  | 'obsidian_stealth'
  | 'thunder_arc';

export interface WeaponSkin {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  rarity: ItemRarity;
  bladeStyle: WeaponSkinBladeStyle;
  bladeColor: string;
  secondaryColor: string;
  trailColor: string;
  particleType: 'plasma' | 'sparks' | 'glitch' | 'frost' | 'fire' | 'void' | 'rainbow' | 'thunder';
  glowIntensity: number;
  icon: string;
  unlockCondition: string;
  unlockType: 'default' | 'achievement' | 'trader' | 'stage_clear' | 'forge';
  priceNanites?: number;
}

export type WorldEventType = 'corporate_ambush' | 'escaped_prisoner' | 'wandering_trader';

export interface WorldEvent {
  id: string;
  type: WorldEventType;
  title: string;
  subtitle: string;
  description: string;
  x: number;
  y: number;
  radius: number;
  status: 'active' | 'completed' | 'failed';
  timeRemaining: number;
  maxDuration: number;
  icon: string;
  accentColor: string;
  enemiesRemaining?: number;
  rewardNanites: number;
  rewardExp: number;
  rewardItemRarity?: ItemRarity;
  // Specific data
  prisonerHp?: number;
  maxPrisonerHp?: number;
  traderInventory?: EquipmentItem[];
  objectiveText: string;
}

export type CompanionRole = 'offense' | 'support' | 'tank';

export interface Companion {
  id: string;
  name: string;
  title: string;
  role: CompanionRole;
  avatarColor: string;
  iconName: string;
  level: number;
  hp: number;
  maxHp: number;
  damage: number;
  attackCooldown: number;
  attackRange: number;
  specialCooldown: number;
  maxSpecialCooldown: number;
  abilityName: string;
  abilityDesc: string;
  passiveBonus: string;
  unlocked: boolean;
  active: boolean; // Up to 2 active
  // In-game live combat position & state
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  targetId?: string | null;
  angle?: number;
}

export interface StageInfo {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  bossName: string;
  bossTitle: string;
  bossHpMultiplier: number;
  accentColor: string;
  bgDark: string;
  gridColor: string;
  objective: string;
}

export type CyberSoldierClass = 
  | 'assault_trooper' 
  | 'heavy_exo' 
  | 'stealth_ninja' 
  | 'cyber_sniper' 
  | 'commandant_boss' 
  | 'surveillance_drone';

export interface CombatEntity {
  id: string;
  type: 'player' | 'enemy' | 'boss' | 'drone';
  name: string;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  shieldHp?: number;
  maxShieldHp?: number;
  speed: number;
  color: string;
  isBoss?: boolean;
  bossPhase?: number;
  attackCooldown: number;
  attackRange: number;
  damage: number;
  xpReward: number;
  stunTimer?: number;
  frozenTimer?: number;
  behavior: 'melee' | 'ranged' | 'charger' | 'turret' | 'boss';
  spriteType: string;
  soldierClass?: CyberSoldierClass;
  facingAngle?: number;
  walkCycle?: number;
  laserAiming?: boolean;
  cloaked?: boolean;
  // ── Diablo 4 Combat Systems ──
  statusEffects?: StatusEffect[];
  damageType?: DamageType;
  resistances?: Partial<Record<DamageType, number>>; // 0-100 resist %
  // Boss Stagger (D4: Stagger Bar)
  staggerValue?: number;     // Current stagger accumulation
  maxStagger?: number;       // Stagger threshold
  isStaggered?: boolean;     // Currently staggered (vulnerable window)
  staggerDuration?: number;  // Remaining stagger frames
  // Elite System (D4: Champion/Elite affixes)
  isElite?: boolean;
  eliteTier?: EliteTier;
  eliteAffixes?: EliteAffixType[];
  eliteAffixTimers?: Record<string, number>; // Per-affix cooldown timers
  // Lucky Hit
  luckyHitChance?: number;   // 0-100 proc chance
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  isEnemy: boolean;
  life: number;
  maxLife: number;
  isPiercing?: boolean;
  isEmp?: boolean;
  hitEntities?: Set<string>;
  damageType?: DamageType;
  luckyHitChance?: number;
  appliesStatus?: StatusEffectType;
}

export interface AreaEffect {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  currentRadius: number;
  duration: number;
  maxDuration: number;
  damagePerTick: number;
  color: string;
  type: 'vortex' | 'emp_shockwave' | 'psi_nova' | 'blade_slash';
  pullsEnemies?: boolean;
  damageType?: DamageType;
  appliesStatus?: StatusEffectType;
  luckyHitChance?: number;
}

export interface LootDrop {
  id: string;
  x: number;
  y: number;
  item?: EquipmentItem | null;
  nanites?: number;
  spawnTime: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  isCrit?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface SkillCooldowns {
  primary: number;       // Clic G / J
  synapticLance: number; // Q / Key 1 (Psychic Spear)
  empShockwave: number;  // W / Key 2 (EMP Blast)
  psychicVortex: number; // E / Key 3 (Black Hole Telekinesis)
  bulletTime: number;    // R / Key 4 (Matrix Temporal Overdrive)
  dash: number;          // Space / Shift
}
