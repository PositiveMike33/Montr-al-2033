import { 
  CraftingMaterialId, 
  CraftingMaterialInfo, 
  CraftingSkillState, 
  EquipmentItem, 
  ItemRarity, 
  ItemSlot, 
  ItemAffix 
} from '../types';

export const CRAFTING_MATERIALS: Record<CraftingMaterialId, CraftingMaterialInfo> = {
  scrap_metal: {
    id: 'scrap_metal',
    name: 'Scrap Metal',
    nameFr: 'Ferraille Récupérée',
    description: 'Blindages composites et fragments d\'alliages légers recyclés des patrouilles SPVM et drones tactiques.',
    rarity: 'standard',
    iconName: 'Wrench',
    color: '#9ca3af',
    dropSource: 'Ennemis cybernétiques de base, débris urbains et caisses tech',
    craftEffect: 'Matériau de base universel pour forger et réparer le châssis physique.'
  },
  conductive_wiring: {
    id: 'conductive_wiring' as any,
    name: 'Conductive Wiring',
    nameFr: 'Câbles Supraconducteurs',
    description: 'Faisceaux de graphène supraconducteur prélevés sur les relais électriques et snipers de Silo-5.',
    rarity: 'standard',
    iconName: 'Zap',
    color: '#38bdf8',
    dropSource: 'Relais réseau, snipers et unités d\'assaut électrique',
    craftEffect: 'Stabilise les transferts d\'énergie et favorise les affixes de vitesse et cadence.'
  },
  quantum_processor: {
    id: 'quantum_processor',
    name: 'Quantum Processors',
    nameFr: 'Processeurs Quantiques',
    description: 'Puces de calcul vectoriel à qubits supraconducteurs capables de briser les cryptographies militaires.',
    rarity: 'rare',
    iconName: 'Cpu',
    color: '#00f3ff',
    dropSource: 'Soldats d\'élite, serveurs réseau piratables et commandants',
    craftEffect: 'Augmente considérablement les chances de coups critiques et de réduction de temps de recharge.'
  },
  neural_filament: {
    id: 'neural_filament',
    name: 'Neural Filaments',
    nameFr: 'Filaments Synaptiques',
    description: 'Fibres bioréactives connectant les cortex cérébraux aux interfaces cérébro-spinales avancées.',
    rarity: 'epic',
    iconName: 'Activity',
    color: '#d946ef',
    dropSource: 'Champions bio-modifiés, kystes synaptiques et boss d\'étage',
    craftEffect: 'Canalise l\'énergie psionique et confère des affixes de vol de vie et dégâts psi.'
  },
  titanium_alloy: {
    id: 'titanium_alloy',
    name: 'Titanium Alloy',
    nameFr: 'Alliage Titane-Carbone',
    description: 'Blindage lourd résistant aux tirs de railgun et aux surpressions explosives des corpos.',
    rarity: 'rare',
    iconName: 'Shield',
    color: '#f59e0b',
    dropSource: 'Exosquelettes lourds, tourelles et coffres blindés',
    craftEffect: 'Renforce drastiquement la valeur d\'armure et les points de vie max.'
  },
  darknet_firmware: {
    id: 'darknet_firmware',
    name: 'Darknet Firmware',
    nameFr: 'Firmware Crypté Darknet',
    description: 'Protocoles clandestins non signés dérobés au consortium de Viktor Vance, débloquant le plein potentiel des implants.',
    rarity: 'legendary',
    iconName: 'Flame',
    color: '#ff0055',
    dropSource: 'Boss majeurs de fin de zone et coffres ancestraux sécurisés',
    craftEffect: 'Infuseur suprême garantissant un rang légendaire et des affixes surmultipliés.'
  },
  dark_matter_core: {
    id: 'dark_matter_core',
    name: 'Dark Matter Core',
    nameFr: 'Cœur de Matière Noire',
    description: 'Noyau instable générant des singularités gravitationnelles locales.',
    rarity: 'legendary',
    iconName: 'Atom',
    color: '#8b5cf6',
    dropSource: 'Anomalies de distorsion et boss occultes',
    craftEffect: 'Infuse des dégâts abyssaux et une gravité accrue.'
  },
  void_nanite_cluster: {
    id: 'void_nanite_cluster',
    name: 'Void Nanite Cluster',
    nameFr: 'Essaim de Nanites du Néant',
    description: 'Micro-machines autoréplicatives corrompues par l\'abîme dimensionnel.',
    rarity: 'legendary',
    iconName: 'Sparkles',
    color: '#ec4899',
    dropSource: 'Failles abyssales et exécuteurs corrompus',
    craftEffect: 'Confère une régénération nanotechnologique et une perforation d\'armure.'
  }
};

export const INITIAL_CRAFTING_MATERIALS: Record<CraftingMaterialId, number> = {
  scrap_metal: 15,
  conductive_wiring: 10,
  quantum_processor: 4,
  neural_filament: 2,
  titanium_alloy: 5,
  darknet_firmware: 1,
  dark_matter_core: 0,
  void_nanite_cluster: 0
};

export const INITIAL_CRAFTING_SKILL: CraftingSkillState = {
  level: 1,
  exp: 0,
  maxExp: 100,
  totalCrafts: 0,
  criticalCrafts: 0
};

export function getCraftingSkillTitle(level: number): { title: string; perk: string } {
  if (level >= 20) {
    return { 
      title: 'Maître Nanotechnologue Suprême', 
      perk: '+35% Rareté Supérieure & 100% de chance d\'obtenir 2 Sockets' 
    };
  }
  if (level >= 15) {
    return { 
      title: 'Grand Artificier Cybernétique', 
      perk: '+25% Valeur de Stat de Base & +20% chance d\'Épique/Légendaire' 
    };
  }
  if (level >= 10) {
    return { 
      title: 'Ingénieur Militaire RÉSO', 
      perk: '+15% Valeur de Stat de Base & 50% de chance d\'obtenir 1 Socket' 
    };
  }
  if (level >= 5) {
    return { 
      title: 'Technicien de la Pègre', 
      perk: '+10% chance de rareté Rare ou supérieure' 
    };
  }
  return { 
    title: 'Apprenti Forgeron des Rues', 
    perk: 'Fabrication artisanale de pièces standard et rares' 
  };
}

export function calculateCraftingProbabilities(
  primaryMat: CraftingMaterialId,
  catalystMat: CraftingMaterialId | null,
  useInfuser: boolean,
  skillLevel: number
): { standard: number; rare: number; epic: number; legendary: number } {
  let score = 0;

  // Base score from materials
  if (primaryMat === 'scrap_metal') score += 10;
  else if (primaryMat === 'titanium_alloy') score += 25;
  else if (primaryMat === 'quantum_processor') score += 40;
  else if (primaryMat === 'neural_filament') score += 60;
  else if (primaryMat === 'darknet_firmware') score += 90;

  if (catalystMat === 'quantum_processor') score += 20;
  else if (catalystMat === 'neural_filament') score += 35;
  else if (catalystMat === 'titanium_alloy') score += 15;
  else if (catalystMat === 'darknet_firmware') score += 50;

  if (useInfuser) {
    score += 65;
  }

  // Bonus from player crafting skill (each level grants +3.5 score)
  score += skillLevel * 3.5;

  let legP = 0;
  let epicP = 0;
  let rareP = 0;
  let stdP = 0;

  if (score >= 140) {
    legP = Math.min(85, Math.round(35 + (score - 140) * 0.7));
    epicP = Math.max(10, 100 - legP);
    rareP = 5;
    stdP = 0;
  } else if (score >= 90) {
    legP = Math.min(30, Math.round(10 + (score - 90) * 0.4));
    epicP = Math.min(65, Math.round(40 + (score - 90) * 0.5));
    rareP = Math.max(15, 100 - (legP + epicP));
    stdP = 0;
  } else if (score >= 45) {
    legP = Math.min(8, Math.round(2 + (score - 45) * 0.15));
    epicP = Math.min(30, Math.round(15 + (score - 45) * 0.35));
    rareP = Math.min(60, Math.round(50 + (score - 45) * 0.2));
    stdP = Math.max(5, 100 - (legP + epicP + rareP));
  } else {
    legP = 1;
    epicP = Math.min(10, Math.round(score * 0.2));
    rareP = Math.min(45, Math.round(20 + score * 0.6));
    stdP = Math.max(20, 100 - (legP + epicP + rareP));
  }

  // Normalize to 100%
  const total = stdP + rareP + epicP + legP;
  return {
    standard: Math.round((stdP / total) * 100),
    rare: Math.round((rareP / total) * 100),
    epic: Math.round((epicP / total) * 100),
    legendary: Math.round((legP / total) * 100)
  };
}

const SLOT_NAMES: Record<ItemSlot, { names: string[]; baseStatName: string; baseStatMin: number; baseStatMax: number }> = {
  weapon: {
    names: [
      'Lame Plasma Monomoléculaire',
      'Katana Cryo-Quantique Silo-5',
      'Disrupteur Neuronal RÉSO',
      'Sabre Éther de Ville-Marie',
      'Gantelet Télékynétique Apex',
      'Dague Fréquence Noire'
    ],
    baseStatName: 'Dégâts d\'Attaque',
    baseStatMin: 35,
    baseStatMax: 65
  },
  deck: {
    names: [
      'Cyberdeck Synaptique v4.2',
      'Cortex Matrix Overdrive 2033',
      'Terminal Quantique Port-Royal',
      'Puce Kernel Bypass SPVM',
      'Interface Bio-Digitale Apex'
    ],
    baseStatName: 'Puissance PSI',
    baseStatMin: 28,
    baseStatMax: 54
  },
  armor: {
    names: [
      'Cuirasse Polymère Silo-5',
      'Veste Tactique Exo-Kevlar',
      'Harnais Blindé Anti-EMP',
      'Combinaison Furtive RÉSO',
      'Exosquelette Titane-Carbone'
    ],
    baseStatName: 'Armure Physique',
    baseStatMin: 25,
    baseStatMax: 50
  },
  chip: {
    names: [
      'Puce Synaptique Overclock',
      'Biopuce Neural-Spike v9',
      'Module Pare-feu Bio-Crypté',
      'Cœur Fusion Micro-Nucléaire',
      'Relais Réflexe Ultra-Rapide'
    ],
    baseStatName: 'Énergie PSI Max',
    baseStatMin: 30,
    baseStatMax: 60
  },
  boots: {
    names: [
      'Bottes à Propulsion Gravitationnelle',
      'Rangers Tactiques Silo-5',
      'Bottes Magnétiques RÉSO',
      'Grèves Exo-Cinétiques Apex',
      'Bottes Furtives Mirage'
    ],
    baseStatName: 'Vitesse de Déplacement',
    baseStatMin: 15,
    baseStatMax: 30
  }
};

const AFFIX_POOL: Array<{
  name: string;
  stat: 'damage' | 'psiDamage' | 'health' | 'psiEnergy' | 'armor' | 'critChance' | 'critDamage' | 'moveSpeed' | 'cooldownReduction' | 'lifeSteal';
  minValue: number;
  maxValue: number;
  catalystWeight?: CraftingMaterialId;
}> = [
  { name: 'Surtension Cinétique', stat: 'damage', minValue: 12, maxValue: 35, catalystWeight: 'scrap_metal' },
  { name: 'Fréquence Psionique', stat: 'psiDamage', minValue: 14, maxValue: 40, catalystWeight: 'neural_filament' },
  { name: 'Blindage Nanotissé', stat: 'armor', minValue: 10, maxValue: 32, catalystWeight: 'titanium_alloy' },
  { name: 'Vigueur Biomécanique', stat: 'health', minValue: 40, maxValue: 120, catalystWeight: 'titanium_alloy' },
  { name: 'Condensateur Synaptique', stat: 'psiEnergy', minValue: 20, maxValue: 55, catalystWeight: 'neural_filament' },
  { name: 'Analyseur de Faiblesses', stat: 'critChance', minValue: 4, maxValue: 12, catalystWeight: 'quantum_processor' },
  { name: 'Multiplicateur Vectoriel', stat: 'critDamage', minValue: 15, maxValue: 45, catalystWeight: 'quantum_processor' },
  { name: 'Accélérateur Synaptique', stat: 'moveSpeed', minValue: 6, maxValue: 18, catalystWeight: 'conductive_wiring' as any },
  { name: 'Surcadençage Militaire', stat: 'cooldownReduction', minValue: 5, maxValue: 15, catalystWeight: 'quantum_processor' },
  { name: 'Siphon Vampirique', stat: 'lifeSteal', minValue: 3, maxValue: 8, catalystWeight: 'neural_filament' }
];

export function proceduralCraftEquipment(params: {
  slot: ItemSlot;
  primaryMat: CraftingMaterialId;
  catalystMat: CraftingMaterialId | null;
  useInfuser: boolean;
  craftingSkillLevel: number;
  playerLevel: number;
  difficultyTier: number;
}): { item: EquipmentItem; wasCritical: boolean; expGained: number } {
  const { slot, primaryMat, catalystMat, useInfuser, craftingSkillLevel, playerLevel, difficultyTier } = params;

  // 1. Determine Rarity roll
  const probs = calculateCraftingProbabilities(primaryMat, catalystMat, useInfuser, craftingSkillLevel);
  const roll = Math.random() * 100;

  let rarity: ItemRarity = 'standard';
  if (roll < probs.legendary) {
    rarity = 'legendary';
  } else if (roll < probs.legendary + probs.epic) {
    rarity = 'epic';
  } else if (roll < probs.legendary + probs.epic + probs.rare) {
    rarity = 'rare';
  } else {
    rarity = 'standard';
  }

  // Critical Craft Roll (chance to trigger high-power craft)
  const critChance = 5 + craftingSkillLevel * 2;
  const wasCritical = Math.random() * 100 < critChance;

  // 2. Base stat calculation
  const slotData = SLOT_NAMES[slot];
  const levelMult = 1 + (playerLevel - 1) * 0.08;
  const tierMult = 1 + (difficultyTier - 1) * 0.12;
  const skillMult = 1 + craftingSkillLevel * 0.02;
  const critMult = wasCritical ? 1.35 : 1.0;

  const baseRoll = slotData.baseStatMin + Math.random() * (slotData.baseStatMax - slotData.baseStatMin);
  const finalBaseValue = Math.round(baseRoll * levelMult * tierMult * skillMult * critMult);

  // 3. Affixes Generation
  let numAffixes = 1;
  if (rarity === 'legendary') numAffixes = 4 + (wasCritical ? 1 : 0);
  else if (rarity === 'epic') numAffixes = 3 + (wasCritical ? 1 : 0);
  else if (rarity === 'rare') numAffixes = 2;

  // Shuffle and pick affixes, giving preference to catalyst weight
  const weightedPool = [...AFFIX_POOL].sort((a, b) => {
    let wA = Math.random();
    let wB = Math.random();
    if (catalystMat && a.catalystWeight === catalystMat) wA += 0.8;
    if (catalystMat && b.catalystWeight === catalystMat) wB += 0.8;
    return wB - wA;
  });

  const affixes: ItemAffix[] = [];
  const usedStats = new Set<string>();

  for (const affixDef of weightedPool) {
    if (affixes.length >= numAffixes) break;
    if (usedStats.has(affixDef.stat)) continue;

    usedStats.add(affixDef.stat);
    const range = affixDef.maxValue - affixDef.minValue;
    const rollFrac = 0.5 + Math.random() * 0.5; // High craft quality
    let val = Math.round((affixDef.minValue + range * rollFrac) * (1 + playerLevel * 0.03) * critMult);

    if (rarity === 'legendary') val = Math.round(val * 1.3);
    else if (rarity === 'epic') val = Math.round(val * 1.15);

    affixes.push({
      name: affixDef.name,
      stat: affixDef.stat,
      value: val
    });
  }

  // 4. Sockets determination
  let sockets: (null)[] | undefined = undefined;
  const socketRoll = Math.random() * 100;
  if (craftingSkillLevel >= 15 && socketRoll < 75) {
    sockets = [null, null];
  } else if (craftingSkillLevel >= 5 && socketRoll < 50) {
    sockets = [null];
  } else if (rarity === 'legendary' && socketRoll < 60) {
    sockets = [null];
  }

  // 5. Legendary Passive
  let legendaryPassive: EquipmentItem['legendaryPassive'] = undefined;
  if (rarity === 'legendary') {
    const passives: NonNullable<EquipmentItem['legendaryPassive']>[] = [
      {
        name: 'Surcharge Synaptique en Chaîne',
        description: 'Chaque coup critique libère un arc électrique foudroyant 3 ennemis proches.',
        type: 'chain_lightning'
      },
      {
        name: 'Ralentisseur Temporel d\'Esquive',
        description: 'Esquiver une attaque déclenche 1.5s de Bullet-Time ultra-précis.',
        type: 'dodge_bullet_time'
      },
      {
        name: 'Pare-Feu Cryo-Stase EMP',
        description: 'Subir des dégâts critiques émet une onde de choc paralysant les assaillants.',
        type: 'emp_freeze'
      },
      {
        name: 'Nova Psionique d\'Exécution',
        description: 'Éliminer un ennemi déclenche une nova télékinétique dévastatrice.',
        type: 'psi_nova_on_kill'
      },
      {
        name: 'Piratage Biomécanique Vampirique',
        description: 'Régénère 15% de votre santé maximale à chaque ennemi d\'élite éliminé.',
        type: 'vampiric_hack'
      }
    ];
    legendaryPassive = passives[Math.floor(Math.random() * passives.length)];
  }

  const nameTemplate = slotData.names[Math.floor(Math.random() * slotData.names.length)];
  const prefix = wasCritical ? 'Chef-d\'Œuvre ' : '';
  const finalName = `${prefix}${nameTemplate} [Forge]`;

  const itemPower = Math.min(800, Math.round(150 + playerLevel * 20 + difficultyTier * 40 + (rarity === 'legendary' ? 120 : rarity === 'epic' ? 70 : 25)));

  const craftedItem: EquipmentItem = {
    id: 'craft_' + Math.random().toString(36).substring(2, 11),
    name: finalName,
    slot,
    rarity,
    levelReq: Math.max(1, playerLevel),
    itemPower,
    upgradeLevel: 0,
    crafted: true,
    craftedBy: 'Thirty3 Artisan',
    baseStat: {
      name: slotData.baseStatName,
      value: finalBaseValue
    },
    affixes,
    sockets,
    legendaryPassive,
    sellValue: Math.round(150 * (rarity === 'legendary' ? 10 : rarity === 'epic' ? 5 : rarity === 'rare' ? 2.5 : 1) * (1 + playerLevel * 0.1)),
    iconName: slot === 'weapon' ? 'Sword' : slot === 'deck' ? 'Cpu' : slot === 'armor' ? 'Shield' : slot === 'chip' ? 'Zap' : 'Activity'
  };

  const baseExp = rarity === 'legendary' ? 120 : rarity === 'epic' ? 60 : rarity === 'rare' ? 30 : 15;
  const expGained = Math.round(baseExp * (wasCritical ? 2.0 : 1.0));

  return {
    item: craftedItem,
    wasCritical,
    expGained
  };
}

export function upgradeEquipmentItem(item: EquipmentItem): { upgradedItem: EquipmentItem; statGain: number } {
  const currentUpgrade = item.upgradeLevel || 0;
  const nextUpgrade = Math.min(10, currentUpgrade + 1);
  const boostPercent = 0.10; // +10% base stat per upgrade level
  const baseStatVal = item.baseStat.value;
  const statGain = Math.round(baseStatVal * boostPercent);
  const newBaseStat = baseStatVal + statGain;

  const upgradedItem: EquipmentItem = {
    ...item,
    upgradeLevel: nextUpgrade,
    name: item.name.includes('+') ? item.name.replace(/\+\d+/, `+${nextUpgrade}`) : `${item.name} +${nextUpgrade}`,
    baseStat: {
      ...item.baseStat,
      value: newBaseStat
    },
    itemPower: (item.itemPower || 200) + 25,
    sellValue: Math.round(item.sellValue * 1.25)
  };

  return { upgradedItem, statGain };
}

export function rerollEquipmentAffixes(item: EquipmentItem, skillLevel: number): EquipmentItem {
  const critMult = 1 + skillLevel * 0.03;
  const rolledAffixes = item.affixes.map(aff => {
    const minRoll = Math.round(aff.value * 0.85);
    const maxRoll = Math.round(aff.value * 1.35 * critMult);
    const newVal = Math.round(minRoll + Math.random() * (maxRoll - minRoll));
    return {
      ...aff,
      value: newVal
    };
  });

  return {
    ...item,
    affixes: rolledAffixes,
    isEnchanted: true
  };
}
