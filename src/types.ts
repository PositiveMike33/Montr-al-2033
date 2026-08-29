export type ItemRarity = 'standard' | 'rare' | 'epic' | 'legendary';

export type ItemSlot = 'deck' | 'armor' | 'weapon' | 'chip' | 'boots';

export interface ItemAffix {
  name: string;
  stat: 'damage' | 'psiDamage' | 'health' | 'psiEnergy' | 'armor' | 'critChance' | 'critDamage' | 'moveSpeed' | 'cooldownReduction' | 'lifeSteal';
  value: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  slot: ItemSlot;
  rarity: ItemRarity;
  levelReq: number;
  baseStat: {
    name: string;
    value: number;
  };
  affixes: ItemAffix[];
  legendaryPassive?: {
    name: string;
    description: string;
    type: 'chain_lightning' | 'dodge_bullet_time' | 'emp_freeze' | 'psi_nova_on_kill' | 'vampiric_hack';
  };
  sellValue: number;
  iconName: string;
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

export interface AvatarCustomization {
  hairColor: string;
  visorColor: string;
  suitColor: string;
  bladeColor: string;
  auraColor: string;
  gender: 'masc' | 'femme' | 'cyborg';
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

export interface CombatEntity {
  id: string;
  type: 'player' | 'enemy' | 'boss' | 'drone';
  name: string;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
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
}

export interface LootDrop {
  id: string;
  x: number;
  y: number;
  item: EquipmentItem;
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
