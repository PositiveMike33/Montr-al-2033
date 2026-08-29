import { EquipmentItem, ItemRarity, ItemSlot, ItemAffix } from '../types';

export const EXP_BASE = 120;
export const EXP_EXPONENT = 2.4;

export function getRequiredExp(level: number): number {
  if (level >= 99) return Infinity;
  return Math.floor(EXP_BASE * Math.pow(level, EXP_EXPONENT));
}

const WEAPON_NAMES = [
  'Cyber-Lame Monofilament',
  'Katana Plasma Montréal-Nord',
  'Gantelet Psionique Apex',
  'Lame Haute Fréquence RÉSO',
  'Disrupteur Neuronal Silo-5',
  'Sabre Cryo-Quantique UQAM',
  'Griffe Électro-Magnétique',
  'Épée Éther de Ville-Marie'
];

const DECK_NAMES = [
  'Deck Neural Cyberdeck v4',
  'Cortex Matrix Overdrive 2033',
  'Puce Kernel Bypass SPVM',
  'Accélérateur Synaptique Noir',
  'Terminal Quantique Port-Royal',
  'Interface Bio-Digitale Apex'
];

const ARMOR_NAMES = [
  'Veste Tactique Exo-Kevlar',
  'Manteau Long Néo-Matrice',
  'Cuirasse Polymère Silo-5',
  'Harnais Blindé Anti-EMP',
  'Combinaison Furtive RÉSO',
  'Exosquelette Titane-Carbone'
];

const CHIP_NAMES = [
  'Puce Synaptique Overclock',
  'Implant Télékynésie Alpha',
  'Module Pare-feu Bio-Crypté',
  'Cœur Fusion Micro-Nucléaire',
  'Biopuce Neural-Spike v9',
  'Relais Réflexe Ultra-Rapide'
];

const BOOTS_NAMES = [
  'Bottes à Propulsion Gravitationnelle',
  'Grillages Cyber-Magnétiques',
  'Baskets Néo-Montréal Run',
  'Jambières Exo-Sprint SPVM',
  'Striders à Déphasage Quantique'
];

const LEGENDARY_PASSIVES: Array<{
  name: string;
  description: string;
  type: 'chain_lightning' | 'dodge_bullet_time' | 'emp_freeze' | 'psi_nova_on_kill' | 'vampiric_hack';
}> = [
  {
    name: 'Décharge Synaptique en Chaîne',
    description: 'Les coups critiques libèrent un éclair psychique rebondissant sur 3 cibles proches (150% dégâts).',
    type: 'chain_lightning'
  },
  {
    name: 'Bullet-Time Réflexe sur Esquive',
    description: 'Esquiver une attaque déclenche une distorsion temporelle de 2 secondes (ralentit les ennemis de 60%).',
    type: 'dodge_bullet_time'
  },
  {
    name: 'Surcharge Cryo-EMP',
    description: 'L’onde de choc EMP gèle instantanément les cibles robotiques et cybernétiques pendant 2.5s.',
    type: 'emp_freeze'
  },
  {
    name: 'Nova Psionique Funeste',
    description: 'Éliminer un ennemi provoque une implosion gravitationnelle infligeant 200% dégâts psychiques en zone.',
    type: 'psi_nova_on_kill'
  },
  {
    name: 'Extraction Malveillante Vampirique',
    description: 'Restaure 6% de Bio-Santé et 10 points de Mana Psychique sur chaque élimination.',
    type: 'vampiric_hack'
  }
];

const AFFIX_POOL: Array<{
  name: string;
  stat: ItemAffix['stat'];
  min: number;
  max: number;
}> = [
  { name: 'de Puissance Synaptique', stat: 'psiDamage', min: 8, max: 25 },
  { name: 'd’Impact Cybernétique', stat: 'damage', min: 10, max: 30 },
  { name: 'de Bio-Régénération', stat: 'health', min: 40, max: 150 },
  { name: 'd’Harmonisation Mentale', stat: 'psiEnergy', min: 20, max: 80 },
  { name: 'de Blindage Titane', stat: 'armor', min: 5, max: 20 },
  { name: 'de Précision Axonale', stat: 'critChance', min: 3, max: 10 },
  { name: 'de Surtension Critique', stat: 'critDamage', min: 15, max: 45 },
  { name: 'de Vitesse Synaptique', stat: 'moveSpeed', min: 5, max: 18 },
  { name: 'd’Overclocking Système', stat: 'cooldownReduction', min: 4, max: 12 },
  { name: 'de Parasitisme Neuronal', stat: 'lifeSteal', min: 2, max: 6 }
];

export function generateLootItem(playerLevel: number, difficultyTier: number, forcedRarity?: ItemRarity): EquipmentItem {
  const slots: ItemSlot[] = ['weapon', 'deck', 'armor', 'chip', 'boots'];
  const slot = slots[Math.floor(Math.random() * slots.length)];

  // Rarity roll based on difficulty tier:
  // Base drop chance scaled with: P(Drop) = Base * (1 + 0.15 * difficultyTier)
  let rarity: ItemRarity = 'standard';
  if (forcedRarity) {
    rarity = forcedRarity;
  } else {
    const roll = Math.random() * 100;
    const tierBonus = difficultyTier * 3.5; // Increases high rarity odds
    if (roll < 4 + tierBonus * 0.8) {
      rarity = 'legendary';
    } else if (roll < 18 + tierBonus * 1.5) {
      rarity = 'epic';
    } else if (roll < 48 + tierBonus * 2.0) {
      rarity = 'rare';
    } else {
      rarity = 'standard';
    }
  }

  // Base item name and base stat
  let namePool = WEAPON_NAMES;
  let baseStatName = 'Dégâts d’Impact';
  let baseStatBase = 15 + playerLevel * 4;
  let iconName = 'Sword';

  if (slot === 'deck') {
    namePool = DECK_NAMES;
    baseStatName = 'Puissance Psionique';
    baseStatBase = 12 + playerLevel * 3.5;
    iconName = 'Cpu';
  } else if (slot === 'armor') {
    namePool = ARMOR_NAMES;
    baseStatName = 'Armure Bio-Kevlar';
    baseStatBase = 10 + playerLevel * 3;
    iconName = 'Shield';
  } else if (slot === 'chip') {
    namePool = CHIP_NAMES;
    baseStatName = 'Énergie Psychique Max';
    baseStatBase = 25 + playerLevel * 5;
    iconName = 'Zap';
  } else if (slot === 'boots') {
    namePool = BOOTS_NAMES;
    baseStatName = 'Vitesse de Réflexe';
    baseStatBase = 8 + playerLevel * 2;
    iconName = 'Activity';
  }

  const baseItemName = namePool[Math.floor(Math.random() * namePool.length)];

  // Rarity multiplier on base stats
  const rarityMult = rarity === 'legendary' ? 2.2 : rarity === 'epic' ? 1.7 : rarity === 'rare' ? 1.3 : 1.0;
  const tierMult = 1 + (difficultyTier - 1) * 0.08;
  const finalBaseValue = Math.round(baseStatBase * rarityMult * tierMult);

  // Number of affixes
  const affixCount = rarity === 'legendary' ? 4 : rarity === 'epic' ? 3 : rarity === 'rare' ? 2 : 0;
  const affixes: ItemAffix[] = [];
  const usedAffixStats = new Set<string>();

  const shuffledPool = [...AFFIX_POOL].sort(() => Math.random() - 0.5);

  for (let i = 0; i < affixCount && i < shuffledPool.length; i++) {
    const template = shuffledPool[i];
    if (usedAffixStats.has(template.stat)) continue;
    usedAffixStats.add(template.stat);

    const scale = (playerLevel * 0.5 + 1) * rarityMult;
    const value = Math.round((template.min + Math.random() * (template.max - template.min)) * (1 + playerLevel * 0.03));
    affixes.push({
      name: template.name,
      stat: template.stat,
      value
    });
  }

  // Legendary unique passive
  let legendaryPassive = undefined;
  if (rarity === 'legendary') {
    legendaryPassive = LEGENDARY_PASSIVES[Math.floor(Math.random() * LEGENDARY_PASSIVES.length)];
  }

  const sellValue = Math.round(
    (rarity === 'legendary' ? 500 : rarity === 'epic' ? 250 : rarity === 'rare' ? 100 : 35) *
    (1 + playerLevel * 0.1) *
    tierMult
  );

  return {
    id: 'item_' + Math.random().toString(36).substr(2, 9),
    name: `${baseItemName} ${affixes.length > 0 ? affixes[0].name : ''}`,
    slot,
    rarity,
    levelReq: Math.max(1, playerLevel),
    baseStat: {
      name: baseStatName,
      value: finalBaseValue
    },
    affixes,
    legendaryPassive,
    sellValue,
    iconName
  };
}
