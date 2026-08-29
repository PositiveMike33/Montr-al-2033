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

export function getDropProbability(difficultyTier: number): number {
  return Math.min(0.85, 0.30 * (1 + 0.15 * difficultyTier));
}

export function generateLootItem(playerLevel: number, difficultyTier: number, forcedRarity?: ItemRarity): EquipmentItem {
  const slots: ItemSlot[] = ['weapon', 'deck', 'armor', 'chip', 'boots'];
  const slot = slots[Math.floor(Math.random() * slots.length)];

  // Rarity roll based on mathematical loot engine:
  let rarity: ItemRarity = 'standard';
  if (forcedRarity) {
    rarity = forcedRarity;
  } else {
    const roll = Math.random(); // [0, 1]
    const legThreshold = Math.max(0.70, 0.94 - (difficultyTier * 0.01));
    const epicThreshold = Math.max(0.50, 0.75 - (difficultyTier * 0.01));
    const rareThreshold = Math.max(0.20, 0.45 - (difficultyTier * 0.02));

    if (roll >= legThreshold) {
      rarity = 'legendary';
    } else if (roll >= epicThreshold) {
      rarity = 'epic';
    } else if (roll >= rareThreshold) {
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

  // ── DIABLO 4: Item Power (1 to 800) & Power Brackets ──
  const basePower = Math.min(780, playerLevel * 7.5 + difficultyTier * 45 + Math.floor(Math.random() * 40));
  const itemPower = Math.max(15, Math.min(800, basePower + (rarity === 'legendary' ? 80 : rarity === 'epic' ? 45 : rarity === 'rare' ? 20 : 0)));
  
  let itemPowerBracket: 'basique' | 'avance' | 'expert' | 'ancestral' | 'uber' = 'basique';
  if (itemPower >= 726) itemPowerBracket = 'uber';
  else if (itemPower >= 526) itemPowerBracket = 'ancestral';
  else if (itemPower >= 341) itemPowerBracket = 'expert';
  else if (itemPower >= 151) itemPowerBracket = 'avance';

  // ── DIABLO 4: Sockets & Neural Modules ──
  const socketCount = rarity === 'legendary' ? 2 : rarity === 'epic' ? (Math.random() < 0.6 ? 2 : 1) : rarity === 'rare' ? (Math.random() < 0.5 ? 1 : 0) : 0;
  const sockets = socketCount > 0 ? Array(socketCount).fill(null) : undefined;

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
    itemPower,
    itemPowerBracket,
    baseStat: {
      name: baseStatName,
      value: finalBaseValue
    },
    affixes,
    sockets,
    legendaryPassive,
    sellValue,
    iconName
  };
}

// ═══════════════════════════════════════════════════════════════
// NEURAL MODULES CATALOG (DIABLO 4 GEMS SYSTEM)
// ═══════════════════════════════════════════════════════════════
export const NEURAL_MODULES_CATALOG: import('../types').NeuralModule[] = [
  {
    id: 'mod_atk_phys',
    name: 'Puce d’Amplification Cinétique',
    type: 'attack',
    stat: 'physicalDamage',
    value: 22,
    rarity: 'rare',
    icon: 'Sword',
    description: '+22 Dégâts d’Impact Physique pour les katanas et lames.'
  },
  {
    id: 'mod_atk_psi',
    name: 'Cristal Synaptique Overclock',
    type: 'attack',
    stat: 'psiDamage',
    value: 28,
    rarity: 'epic',
    icon: 'Zap',
    description: '+28 Puissance Psionique & Surcharge Télékinétique.'
  },
  {
    id: 'mod_crit',
    name: 'Gyro-Stabilisateur Laser',
    type: 'attack',
    stat: 'critChance',
    value: 6,
    rarity: 'rare',
    icon: 'Crosshair',
    description: '+6% Chance de Coup Critique.'
  },
  {
    id: 'mod_crit_dmg',
    name: 'Injecteur Quantique Brutal',
    type: 'attack',
    stat: 'critDamage',
    value: 35,
    rarity: 'epic',
    icon: 'Sparkles',
    description: '+35% Dégâts Critiques dévastateurs.'
  },
  {
    id: 'mod_def_armor',
    name: 'Nano-Plaque Carbon-Kevlar',
    type: 'defense',
    stat: 'armor',
    value: 30,
    rarity: 'rare',
    icon: 'Shield',
    description: '+30 Armure Bio-Kevlar et résistance aux impacts.'
  },
  {
    id: 'mod_def_hp',
    name: 'Régénérateur Cellulaire T-44',
    type: 'defense',
    stat: 'maxHp',
    value: 75,
    rarity: 'rare',
    icon: 'Activity',
    description: '+75 Points de Vie Maximaux.'
  },
  {
    id: 'mod_util_speed',
    name: 'Servomoteur Axonal Hyper-Vitesse',
    type: 'utility',
    stat: 'moveSpeed',
    value: 8,
    rarity: 'rare',
    icon: 'FastForward',
    description: '+8% Vitesse de déplacement et esquive.'
  },
  {
    id: 'mod_util_cdr',
    name: 'Processeur Quantique Zéro-Latence',
    type: 'utility',
    stat: 'cooldownReduction',
    value: 10,
    rarity: 'legendary',
    icon: 'Cpu',
    description: '+10% Réduction de tous les temps de recharge.'
  }
];

/**
 * Cyber-Forge Synthesizer
 * Combines 3 items of the same rarity to synthesize a random item of the NEXT higher rarity tier.
 * Standard (Gris) -> Rare (Bleu) -> Epic (Violet) -> Legendary (Orange) -> Overclocked Prime Legendary
 */
export function forgeEquipmentItem(
  sourceItems: EquipmentItem[],
  playerLevel: number,
  difficultyTier: number
): EquipmentItem {
  if (sourceItems.length !== 3) {
    throw new Error('La Cyber-Forge requiert exactement 3 pièces d\'équipement.');
  }

  const baseRarity = sourceItems[0].rarity;
  let targetRarity: ItemRarity = 'rare';

  if (baseRarity === 'standard') {
    targetRarity = 'rare';
  } else if (baseRarity === 'rare') {
    targetRarity = 'epic';
  } else if (baseRarity === 'epic') {
    targetRarity = 'legendary';
  } else if (baseRarity === 'legendary') {
    targetRarity = 'legendary';
  }

  // Check if all 3 items share the same slot (e.g. 3 weapons). If so, 80% chance to guarantee that slot!
  const allSameSlot = sourceItems.every((item) => item.slot === sourceItems[0].slot);
  const slots: ItemSlot[] = ['weapon', 'deck', 'armor', 'chip', 'boots'];
  const forcedSlot: ItemSlot = allSameSlot && Math.random() < 0.8
    ? sourceItems[0].slot
    : slots[Math.floor(Math.random() * slots.length)];

  // Item level calculation: based on maximum of player level and average forged item levels + 1 bonus level
  const avgLevel = Math.round(sourceItems.reduce((acc, item) => acc + item.levelReq, 0) / 3);
  const effectiveLevel = Math.max(playerLevel, avgLevel);

  // Generate base item with target rarity
  const resultItem = generateLootItem(effectiveLevel, difficultyTier, targetRarity);
  resultItem.slot = forcedSlot;

  // Re-adjust base item name pool and stat based on forced slot if needed
  if (forcedSlot === 'weapon') {
    resultItem.baseStat.name = 'Dégâts d’Impact';
    resultItem.iconName = 'Sword';
  } else if (forcedSlot === 'deck') {
    resultItem.baseStat.name = 'Puissance Psionique';
    resultItem.iconName = 'Cpu';
  } else if (forcedSlot === 'armor') {
    resultItem.baseStat.name = 'Armure Bio-Kevlar';
    resultItem.iconName = 'Shield';
  } else if (forcedSlot === 'chip') {
    resultItem.baseStat.name = 'Énergie Psychique Max';
    resultItem.iconName = 'Zap';
  } else if (forcedSlot === 'boots') {
    resultItem.baseStat.name = 'Vitesse de Réflexe';
    resultItem.iconName = 'Activity';
  }

  // If 3 legendary items were forged, create an Overclocked/Prime Legendary with amplified affixes and stats!
  if (baseRarity === 'legendary') {
    resultItem.name = `[FORGÉ-OVERCLOCK] ${resultItem.name.replace(/\[.*?\]\s*/g, '')}`;
    resultItem.baseStat.value = Math.round(resultItem.baseStat.value * 1.4);
    resultItem.affixes = resultItem.affixes.map((aff) => ({
      ...aff,
      value: Math.round(aff.value * 1.35)
    }));
    resultItem.sellValue = Math.round(resultItem.sellValue * 1.5);
  }

  return resultItem;
}

export interface BossSpecificDropTemplate {
  name: string;
  slot: ItemSlot;
  setName?: string;
  baseStatName: string;
  baseStatValue: number;
  iconName: string;
  affixes: ItemAffix[];
  legendaryPassive: {
    name: string;
    description: string;
    type: 'chain_lightning' | 'dodge_bullet_time' | 'emp_freeze' | 'psi_nova_on_kill' | 'vampiric_hack';
  };
}

const BOSS_LOOT_TABLE: Record<string, BossSpecificDropTemplate[]> = {
  'Exécuteur SPVM-Prime': [
    {
      name: '[Set: Ordre Répression 2033] Gantelet d’Émeute SPVM-Prime',
      slot: 'weapon',
      setName: 'Ordre Répression 2033',
      baseStatName: 'Dégâts de Choc Kinétique',
      baseStatValue: 75,
      iconName: 'Sword',
      affixes: [
        { name: 'de Neutralisation Tactique', stat: 'damage', value: 35 },
        { name: 'de Blindage Lourd', stat: 'armor', value: 18 },
        { name: 'de Choc Critique', stat: 'critDamage', value: 40 },
        { name: 'de Drain Électrique', stat: 'lifeSteal', value: 5 }
      ],
      legendaryPassive: {
        name: 'Surcharge Taser SPVM',
        description: 'Les attaques au corps-à-corps libèrent un arc électrique assommant les ennemis proches (150% dégâts).',
        type: 'chain_lightning'
      }
    },
    {
      name: '[Set: Ordre Répression 2033] Cuirasse Blindée Anti-Émeute',
      slot: 'armor',
      setName: 'Ordre Répression 2033',
      baseStatName: 'Armure Bio-Kevlar Renforcée',
      baseStatValue: 65,
      iconName: 'Shield',
      affixes: [
        { name: 'de Blindage Titane', stat: 'armor', value: 25 },
        { name: 'de Résistance aux Chocs', stat: 'health', value: 160 },
        { name: 'de Réflexe d\'Encaissement', stat: 'damage', value: 20 }
      ],
      legendaryPassive: {
        name: 'Impulsion Cryo-EMP Réactive',
        description: 'Subir une attaque lourde déclenche instantanément une contre-onde de choc EMP qui gèle les agresseurs.',
        type: 'emp_freeze'
      }
    },
    {
      name: '[Légendaire Boss] Puce de Contrôle Biométrique SPVM',
      slot: 'chip',
      baseStatName: 'Énergie Psychique & Surcharge',
      baseStatValue: 90,
      iconName: 'Zap',
      affixes: [
        { name: 'd\'Overclocking Cérébral', stat: 'psiDamage', value: 30 },
        { name: 'de Cadence Axonale', stat: 'cooldownReduction', value: 14 },
        { name: 'de Drain Synaptique', stat: 'lifeSteal', value: 6 }
      ],
      legendaryPassive: {
        name: 'Extraction Malveillante Vampirique',
        description: 'Chaque ennemi éliminé régénère 8% de Santé Maximale et 15 Énergie Psionique.',
        type: 'vampiric_hack'
      }
    }
  ],
  'Titan Quantique Silo-5': [
    {
      name: '[Set: Silo-5 Heavy Tech] Lame à Fusion Silo-5',
      slot: 'weapon',
      setName: 'Silo-5 Heavy Tech',
      baseStatName: 'Dégâts Thermiques Lourds',
      baseStatValue: 95,
      iconName: 'Sword',
      affixes: [
        { name: 'd\'Impact Thermobarrique', stat: 'damage', value: 45 },
        { name: 'de Précision Axonale', stat: 'critChance', value: 12 },
        { name: 'de Surtension Critique', stat: 'critDamage', value: 50 },
        { name: 'de Pénétration de Blindage', stat: 'psiDamage', value: 25 }
      ],
      legendaryPassive: {
        name: 'Nova Psionique Funeste',
        description: 'Terrasser une cible déclenche une implosion gravitationnelle infligeant 220% dégâts en zone.',
        type: 'psi_nova_on_kill'
      }
    },
    {
      name: '[Set: Silo-5 Heavy Tech] Blindage Réactif Titan Silo-5',
      slot: 'armor',
      setName: 'Silo-5 Heavy Tech',
      baseStatName: 'Blindage Exosquelette Titane',
      baseStatValue: 85,
      iconName: 'Shield',
      affixes: [
        { name: 'de Coque Renforcée', stat: 'armor', value: 30 },
        { name: 'de Régénération Bio-Active', stat: 'health', value: 200 },
        { name: 'd\'Amortisseur Cinétique', stat: 'psiEnergy', value: 60 }
      ],
      legendaryPassive: {
        name: 'Bullet-Time Réflexe sur Esquive',
        description: 'Esquiver une attaque déclenche une distorsion temporelle de 2.5 secondes.',
        type: 'dodge_bullet_time'
      }
    },
    {
      name: '[Légendaire Boss] Noyau Quantique Déstabilisé',
      slot: 'chip',
      baseStatName: 'Réserve d\'Énergie Quantique',
      baseStatValue: 120,
      iconName: 'Zap',
      affixes: [
        { name: 'de Résonance Psionique', stat: 'psiDamage', value: 38 },
        { name: 'd\'Accélération Synaptique', stat: 'cooldownReduction', value: 15 },
        { name: 'de Siphon Quantique', stat: 'lifeSteal', value: 7 }
      ],
      legendaryPassive: {
        name: 'Décharge Synaptique en Chaîne',
        description: 'Les coups critiques génèrent des arcs de foudre quantique ricochant sur 4 cibles proches.',
        type: 'chain_lightning'
      }
    }
  ],
  'I.A. Matrice Omnisciente': [
    {
      name: '[Set: Protocole Omniscience] Cyberdeck Neuro-Sonde Omnisciente',
      slot: 'deck',
      setName: 'Protocole Omniscience',
      baseStatName: 'Puissance Psionique Suprême',
      baseStatValue: 110,
      iconName: 'Cpu',
      affixes: [
        { name: 'de Calcul Matriciel Parallèle', stat: 'psiDamage', value: 50 },
        { name: 'd\'Overclocking Cérébral', stat: 'cooldownReduction', value: 16 },
        { name: 'de Précision Neuronale', stat: 'critChance', value: 14 },
        { name: 'de Surcharge Axonale', stat: 'critDamage', value: 55 }
      ],
      legendaryPassive: {
        name: 'Décharge Synaptique en Chaîne',
        description: 'Les flux de piratage et coups critiques foudroient instantanément les processeurs de 5 ennemis.',
        type: 'chain_lightning'
      }
    },
    {
      name: '[Set: Protocole Omniscience] Puce Interface Mont-Royal',
      slot: 'chip',
      setName: 'Protocole Omniscience',
      baseStatName: 'Flux de Données Éthéré',
      baseStatValue: 140,
      iconName: 'Zap',
      affixes: [
        { name: 'd\'Harmonisation Mentale', stat: 'psiEnergy', value: 90 },
        { name: 'de Vitesse Synaptique', stat: 'moveSpeed', value: 20 },
        { name: 'de Vampirisme Psionique', stat: 'lifeSteal', value: 8 }
      ],
      legendaryPassive: {
        name: 'Extraction Malveillante Vampirique',
        description: 'Absorbe l\'énergie vitale et psychique des programmes détruits sur le champ de bataille.',
        type: 'vampiric_hack'
      }
    },
    {
      name: '[Légendaire Boss] Lame Éther de l\'Omniscience',
      slot: 'weapon',
      baseStatName: 'Dégâts de Données Pures',
      baseStatValue: 105,
      iconName: 'Sword',
      affixes: [
        { name: 'de Découpe Psionique', stat: 'psiDamage', value: 45 },
        { name: 'd\'Impact Critique', stat: 'critDamage', value: 60 },
        { name: 'de Cadence Rapide', stat: 'moveSpeed', value: 15 }
      ],
      legendaryPassive: {
        name: 'Nova Psionique Funeste',
        description: 'Chaque mise à mort fait exploser le spectre d\'ondes psychiques infligeant 250% dégâts en zone.',
        type: 'psi_nova_on_kill'
      }
    }
  ],
  'L’Architecte Central PVM': [
    {
      name: '[Set: Maître de la Cité] Sceptre d’Onde Orbitale PVM',
      slot: 'weapon',
      setName: 'Maître de la Cité',
      baseStatName: 'Dégâts d\'Impact Cosmique',
      baseStatValue: 140,
      iconName: 'Sword',
      affixes: [
        { name: 'de Décharge Orbitale', stat: 'damage', value: 60 },
        { name: 'de Puissance Psionique Absolue', stat: 'psiDamage', value: 60 },
        { name: 'de Précision Parfaite', stat: 'critChance', value: 18 },
        { name: 'de Multiplicateur Surtension', stat: 'critDamage', value: 70 }
      ],
      legendaryPassive: {
        name: 'Décharge Synaptique en Chaîne',
        description: 'Libère un rayon orbital foudroyant qui ricoche sur toutes les cibles de l\'écran.',
        type: 'chain_lightning'
      }
    },
    {
      name: '[Set: Maître de la Cité] Cyberdeck Central de l’Architecte',
      slot: 'deck',
      setName: 'Maître de la Cité',
      baseStatName: 'Puissance IA Centrale',
      baseStatValue: 150,
      iconName: 'Cpu',
      affixes: [
        { name: 'de Surcharge Totale', stat: 'psiDamage', value: 65 },
        { name: 'de Réduction Instantanée', stat: 'cooldownReduction', value: 20 },
        { name: 'de Drain d\'Âmes Numériques', stat: 'lifeSteal', value: 10 }
      ],
      legendaryPassive: {
        name: 'Nova Psionique Funeste',
        description: 'Génère un vortex cataclysmique détruisant les défenses ennemies.',
        type: 'psi_nova_on_kill'
      }
    },
    {
      name: '[Set: Maître de la Cité] Exo-Armure Orbitale de Place-Ville-Marie',
      slot: 'armor',
      setName: 'Maître de la Cité',
      baseStatName: 'Blindage Impénétrable',
      baseStatValue: 130,
      iconName: 'Shield',
      affixes: [
        { name: 'de Barrière Quantique', stat: 'armor', value: 45 },
        { name: 'de Bio-Régénération Maximale', stat: 'health', value: 300 },
        { name: 'de Déphasage Protecteur', stat: 'psiEnergy', value: 100 }
      ],
      legendaryPassive: {
        name: 'Impulsion Cryo-EMP Réactive',
        description: 'Gèle et paralyse tous les attaquants qui osent frapper le joueur.',
        type: 'emp_freeze'
      }
    }
  ]
};

/**
 * Boss Loot Table Drop Generator
 * Guaranteed high-tier drop (Legendary / Set item) customized to the boss slain.
 */
export function generateBossLootItem(
  bossName: string,
  playerLevel: number,
  difficultyTier: number
): EquipmentItem {
  // Normalize boss name
  let matchedTemplates: BossSpecificDropTemplate[] | undefined;
  for (const key of Object.keys(BOSS_LOOT_TABLE)) {
    if (bossName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(bossName.toLowerCase())) {
      matchedTemplates = BOSS_LOOT_TABLE[key];
      break;
    }
  }

  // Fallback to default high tier legendary if boss name not in explicit map
  if (!matchedTemplates || matchedTemplates.length === 0) {
    const genericItem = generateLootItem(playerLevel, difficultyTier, 'legendary');
    genericItem.bossSource = bossName;
    return genericItem;
  }

  // Select a random boss-specific template
  const template = matchedTemplates[Math.floor(Math.random() * matchedTemplates.length)];
  const tierMult = 1 + (difficultyTier - 1) * 0.15;
  const levelMult = 1 + playerLevel * 0.05;

  const finalBaseValue = Math.round(template.baseStatValue * levelMult * tierMult);
  const scaledAffixes = template.affixes.map((aff) => ({
    name: aff.name,
    stat: aff.stat,
    value: Math.round(aff.value * (1 + playerLevel * 0.02) * (1 + difficultyTier * 0.05))
  }));

  const sellValue = Math.round(800 * (1 + playerLevel * 0.12) * tierMult);

  return {
    id: 'boss_loot_' + Math.random().toString(36).substr(2, 9),
    name: template.name,
    slot: template.slot,
    rarity: 'legendary',
    levelReq: Math.max(1, playerLevel),
    baseStat: {
      name: template.baseStatName,
      value: finalBaseValue
    },
    affixes: scaledAffixes,
    legendaryPassive: template.legendaryPassive,
    setName: template.setName,
    bossSource: bossName,
    sellValue,
    iconName: template.iconName
  };
}


