import { 
  CraftingMaterialId, 
  CraftingMaterialInfo, 
  CraftingSkillState, 
  EquipmentItem, 
  ItemRarity, 
  ItemSlot, 
  ItemAffix,
  ItemPowerBracket,
  CompanionMod,
  CompanionModId
} from '../types';
import { generateLootItem } from './lootGenerator';

// ── 1. MATÉRIAUX DE FABRICATION PROCÉDURALE ──
export const CRAFTING_MATERIALS: Record<CraftingMaterialId, CraftingMaterialInfo> = {
  scrap_metal: {
    id: 'scrap_metal',
    name: 'Scrap Metal',
    nameFr: 'Ferraille Récupérée',
    description: 'Alliage composite et débris d’armures cybernétiques récupérés sur les mercenaires et soldats vaincus.',
    rarity: 'standard',
    iconName: 'Cpu',
    color: '#94a3b8',
    dropSource: 'Tout ennemi vaincu, caisses environnementales, recyclage d’équipements',
    craftEffect: 'Matière première de structure requise pour forger le châssis de base de tout équipement.'
  },
  neural_filament: {
    id: 'neural_filament',
    name: 'Neural Filaments',
    nameFr: 'Filaments Neuronaux',
    description: 'Micro-fibres biomorphiques conductrices extraites des processeurs psioniques et assassins cybernétiques.',
    rarity: 'rare',
    iconName: 'Activity',
    color: '#00f3ff',
    dropSource: 'Ennemis psioniques, snipers, cibles d’élite et boss',
    craftEffect: 'Catalyseur synaptique : amplifie les chances d’affixes Psioniques, Coup Critique et Réduction de Cooldown.'
  },
  quantum_processor: {
    id: 'quantum_processor',
    name: 'Quantum Processors',
    nameFr: 'Processeurs Quantiques',
    description: 'Puces quantiques supraconductrices à mémoire qubit scellée des laboratoires de Viktor Vance.',
    rarity: 'legendary',
    iconName: 'Zap',
    color: '#f2994a',
    dropSource: 'Boss mondiaux, cibles d’élite de haut rang, terminaux secrets',
    craftEffect: 'Catalyseur suprême : octroie +18% de chance de forger un Légendaire et augmente l’Item Power.'
  },
  titanium_alloy: {
    id: 'titanium_alloy',
    name: 'Titanium Alloy',
    nameFr: 'Alliage de Titane Néo-Kevlar',
    description: 'Plaques d’alliage ultra-denses issues des blindages des exosquelettes militaires SPVM.',
    rarity: 'rare',
    iconName: 'Shield',
    color: '#38bdf8',
    dropSource: 'Exo-soldats lourds, patrouilles SPVM blindées et conteneurs militaires',
    craftEffect: 'Renforce les statistiques défensives, la santé bio-active et la solidité du châssis.'
  },
  darknet_firmware: {
    id: 'darknet_firmware',
    name: 'Darknet Firmware',
    nameFr: 'Firmware Darknet Crypté',
    description: 'Modules d’exploits zero-day militaires clandestins récupérés dans les réseaux souterrains de Montréal.',
    rarity: 'epic',
    iconName: 'Terminal',
    color: '#ff00ff',
    dropSource: 'Terminaux piratés, événements mondiaux et boss de données',
    craftEffect: 'Débloque des affixes rares (Vol de vie, Pénétration d’Armure, Dégâts Psychiques).'
  }
};

// ── 2. MODULES D'AMÉLIORATION COMPAGNON (MOD CHIPS) ──
export const COMPANION_MODS: Record<CompanionModId, CompanionMod> = {
  vampiric_core: {
    id: 'vampiric_core',
    name: 'Noyau Siphon Vampirique',
    description: 'Convertit les frappes du compagnon en flux de nanites médicales.',
    statBonus: '+10% Dégâts du Compagnon & Régénère 5% PV à Thirty3 sur chaque élimination',
    iconName: 'Heart',
    color: '#ff0055'
  },
  overclock_relay: {
    id: 'overclock_relay',
    name: 'Relais Overclock Synaptique',
    description: 'Pousse les servo-moteurs et microprocesseurs au-delà de la limite nominale.',
    statBonus: '+30% Cadence d’Attaque & -25% Temps de Recharge de la Compétence Unique',
    iconName: 'Zap',
    color: '#00f3ff'
  },
  emp_reflector: {
    id: 'emp_reflector',
    name: 'Matrice Réflectrice EMP',
    description: 'Dissipe les impacts cinétiques ennemis sous forme d’ondes de foudre disruptive.',
    statBonus: '+40 Armure de l’Allié & Renvoie 30% des dégâts reçus sous forme d’éclair étourdissant',
    iconName: 'Shield',
    color: '#00ff41'
  },
  nanite_booster: {
    id: 'nanite_booster',
    name: 'Générateur Nanite d’Assistance',
    description: 'Émet une onde d’ondes télépathiques galvanisant Thirty3 sur le champ de bataille.',
    statBonus: 'Aura : +15% Dégâts Globaux et +12% Vitesse de Déplacement pour Thirty3',
    iconName: 'Activity',
    color: '#f2994a'
  }
};

// ── 3. TABLES DE BUTIN DE MATÉRIAUX (DROP DEFEATED ENEMIES & ENVIRONMENT) ──
export interface MaterialDropResult {
  materialId: CraftingMaterialId;
  count: number;
}

export function calculateEnemyMaterialDrop(
  isBoss: boolean,
  isElite: boolean,
  difficultyTier: number,
  playerLevel: number
): MaterialDropResult[] {
  const results: MaterialDropResult[] = [];
  const tierMult = 1 + (difficultyTier - 1) * 0.15;

  if (isBoss) {
    // Boss guarantees rich bundle of materials
    results.push({
      materialId: 'scrap_metal',
      count: Math.round((12 + Math.floor(Math.random() * 10)) * tierMult)
    });
    results.push({
      materialId: 'neural_filament',
      count: Math.round((3 + Math.floor(Math.random() * 4)) * tierMult)
    });
    results.push({
      materialId: 'quantum_processor',
      count: Math.max(1, Math.round((1 + Math.floor(Math.random() * 2)) * (difficultyTier >= 2 ? 1.3 : 1)))
    });
    if (Math.random() < 0.8) {
      results.push({
        materialId: 'titanium_alloy',
        count: Math.round((2 + Math.floor(Math.random() * 3)) * tierMult)
      });
    }
    if (Math.random() < 0.65) {
      results.push({
        materialId: 'darknet_firmware',
        count: Math.round(1 + Math.floor(Math.random() * 2))
      });
    }
  } else if (isElite) {
    // Elite enemies drop substantial materials
    results.push({
      materialId: 'scrap_metal',
      count: Math.round((3 + Math.floor(Math.random() * 5)) * tierMult)
    });
    if (Math.random() < 0.75) {
      results.push({
        materialId: 'neural_filament',
        count: Math.round(1 + Math.floor(Math.random() * 2))
      });
    }
    if (Math.random() < 0.5) {
      results.push({
        materialId: 'titanium_alloy',
        count: 1 + Math.floor(Math.random() * 2)
      });
    }
    if (Math.random() < (0.25 + difficultyTier * 0.05)) {
      results.push({
        materialId: 'quantum_processor',
        count: 1
      });
    }
  } else {
    // Standard defeated mob
    if (Math.random() < 0.7) {
      results.push({
        materialId: 'scrap_metal',
        count: 1 + Math.floor(Math.random() * 3)
      });
    }
    if (Math.random() < 0.18) {
      results.push({
        materialId: 'neural_filament',
        count: 1
      });
    }
    if (Math.random() < 0.14) {
      results.push({
        materialId: 'titanium_alloy',
        count: 1
      });
    }
  }

  return results;
}

export function calculateBreakableMaterialDrop(difficultyTier: number): MaterialDropResult[] {
  const results: MaterialDropResult[] = [];
  results.push({
    materialId: 'scrap_metal',
    count: 2 + Math.floor(Math.random() * 4)
  });
  if (Math.random() < 0.35) {
    results.push({
      materialId: 'neural_filament',
      count: 1
    });
  }
  if (Math.random() < 0.2) {
    results.push({
      materialId: 'darknet_firmware',
      count: 1
    });
  }
  return results;
}

// ── 4. RECETTES DE BASE & PROBABILITÉS DE FORGE ──
export interface CraftingRecipeConfig {
  slot: ItemSlot;
  label: string;
  baseScrapCost: number;
  baseNaniteCost: number;
  description: string;
}

export const CRAFTING_RECIPES: Record<ItemSlot, CraftingRecipeConfig> = {
  weapon: {
    slot: 'weapon',
    label: 'Arme de Mêlée / Lame Haute Fréquence',
    baseScrapCost: 20,
    baseNaniteCost: 150,
    description: 'Synthétise une arme tranchante ou psionique haute précision.'
  },
  deck: {
    slot: 'deck',
    label: 'Cyberdeck Neural & Interface Synaptique',
    baseScrapCost: 18,
    baseNaniteCost: 180,
    description: 'Conçoit un terminal de piratage amplifiant l’Énergie et la Puissance PSI.'
  },
  armor: {
    slot: 'armor',
    label: 'Armure Exo-Blindée / Manteau Néo-Kevlar',
    baseScrapCost: 25,
    baseNaniteCost: 160,
    description: 'Structure protectrice maximisant la Bio-Santé et l’Armure cinétique.'
  },
  chip: {
    slot: 'chip',
    label: 'Puce Implantaire & Cœur Énergétique',
    baseScrapCost: 15,
    baseNaniteCost: 200,
    description: 'Implant cybernétique régulant la recharge synaptique et les bonus de set.'
  },
  boots: {
    slot: 'boots',
    label: 'Bottes à Déphasage / Jambières Exo-Sprint',
    baseScrapCost: 16,
    baseNaniteCost: 140,
    description: 'Propulseurs de cheville améliorant la vitesse de course et l’esquive.'
  }
};

export interface CraftOdds {
  standard: number;
  rare: number;
  epic: number;
  legendary: number;
  mastercraftChance: number;
  minItemPower: number;
  maxItemPower: number;
}

export function calculateCraftingOdds(
  slot: ItemSlot,
  materialsUsed: Record<CraftingMaterialId, number>,
  craftingSkillLevel: number,
  playerLevel: number
): CraftOdds {
  const neuralCount = materialsUsed.neural_filament || 0;
  const quantumCount = materialsUsed.quantum_processor || 0;
  const darknetCount = materialsUsed.darknet_firmware || 0;
  const titaniumCount = materialsUsed.titanium_alloy || 0;

  // Base probabilities with standard materials
  let standardWeight = Math.max(5, 50 - (neuralCount * 12) - (quantumCount * 25));
  let rareWeight = 35 + (neuralCount * 10) + (titaniumCount * 8);
  let epicWeight = 10 + (neuralCount * 6) + (quantumCount * 18) + (darknetCount * 15);
  let legendaryWeight = 2 + (quantumCount * 20) + (darknetCount * 8) + (craftingSkillLevel * 0.8);

  // Skill level bonus
  const skillLegendaryBonus = craftingSkillLevel * 0.5;
  legendaryWeight += skillLegendaryBonus;
  standardWeight = Math.max(2, standardWeight - craftingSkillLevel * 0.5);

  const total = standardWeight + rareWeight + epicWeight + legendaryWeight;
  const standardPct = Math.round((standardWeight / total) * 100);
  const rarePct = Math.round((rareWeight / total) * 100);
  const epicPct = Math.round((epicWeight / total) * 100);
  const legendaryPct = Math.max(1, 100 - (standardPct + rarePct + epicPct));

  // Mastercraft (Coup de Maître): grants boosted stats + guaranteed socket
  const mastercraftChance = Math.min(45, Math.round(5 + (craftingSkillLevel * 1.2) + (quantumCount * 6) + (darknetCount * 4)));

  // Item Power estimation
  const baseIP = 150 + Math.round(playerLevel * 7.5);
  const catalystIPBonus = (neuralCount * 15) + (quantumCount * 35) + (titaniumCount * 10) + (darknetCount * 25);
  const skillIPBonus = craftingSkillLevel * 4;

  const minItemPower = Math.min(800, baseIP + catalystIPBonus + skillIPBonus - 30);
  const maxItemPower = Math.min(825, baseIP + catalystIPBonus + skillIPBonus + 50);

  return {
    standard: standardPct,
    rare: rarePct,
    epic: epicPct,
    legendary: legendaryPct,
    mastercraftChance,
    minItemPower: Math.max(100, minItemPower),
    maxItemPower: Math.max(160, maxItemPower)
  };
}

// ── 5. MOTEUR DE GÉNÉRATION D'ÉQUIPEMENT PROCÉDURAL ──
export interface ProceduralCraftResult {
  item: EquipmentItem;
  isMastercraft: boolean;
  expAwarded: number;
  newCraftingSkill: CraftingSkillState;
}

export function craftProceduralEquipment(
  slot: ItemSlot,
  materialsUsed: Record<CraftingMaterialId, number>,
  craftingSkill: CraftingSkillState,
  playerLevel: number,
  difficultyTier: number
): ProceduralCraftResult {
  const odds = calculateCraftingOdds(slot, materialsUsed, craftingSkill.level, playerLevel);

  // Roll Rarity
  const roll = Math.random() * 100;
  let rolledRarity: ItemRarity = 'standard';
  if (roll < odds.legendary) {
    rolledRarity = 'legendary';
  } else if (roll < odds.legendary + odds.epic) {
    rolledRarity = 'epic';
  } else if (roll < odds.legendary + odds.epic + odds.rare) {
    rolledRarity = 'rare';
  } else {
    rolledRarity = 'standard';
  }

  // Mastercraft roll
  const isMastercraft = Math.random() * 100 < odds.mastercraftChance;

  // Generate Base Item via existing generator with rolled rarity
  const effectiveLevel = Math.max(1, playerLevel);
  const baseItem = generateLootItem(effectiveLevel, difficultyTier, rolledRarity);
  baseItem.slot = slot;

  // Calculate procedural Item Power (100 - 820)
  const itemPower = Math.floor(odds.minItemPower + Math.random() * (odds.maxItemPower - odds.minItemPower + 1));
  let bracket: ItemPowerBracket = 'basique';
  if (itemPower >= 725) bracket = 'uber';
  else if (itemPower >= 600) bracket = 'ancestral';
  else if (itemPower >= 450) bracket = 'expert';
  else if (itemPower >= 300) bracket = 'avance';

  baseItem.itemPower = itemPower;
  baseItem.itemPowerBracket = bracket;

  // Names by slot & mastery
  const prefix = isMastercraft ? '[CHEF-D’ŒUVRE] ' : '[FORGÉ] ';
  const slotNames: Record<ItemSlot, string[]> = {
    weapon: ['Lame Neutronique', 'Sabre Plasma RÉSO', 'Épée Électrostatique', 'Glaive Silo-5', 'Katana Monofilament'],
    deck: ['Deck Neuro-Matrix', 'Cortex Bypass v9', 'Terminal Quantum-7', 'Processeur Hack SPVM'],
    armor: ['Exo-Cuirasse Kevlar', 'Manteau Fibre Polymère', 'Harnais Blindé Carbone', 'Plastron Réactif Titane'],
    chip: ['Implant Axonal Surcharge', 'Biopuce Synaptique Alpha', 'Noyau Mémoire Qubit', 'Accélérateur Neuro-Spike'],
    boots: ['Striders Déphasage', 'Bottes à Gravitation Silo', 'Baskets Néo-Sprint 2033', 'Jambières Électro-Cinétiques']
  };

  const namePool = slotNames[slot];
  const chosenBaseName = namePool[Math.floor(Math.random() * namePool.length)];
  baseItem.name = `${prefix}${chosenBaseName} Mk.${craftingSkill.level}`;

  // Tailor base stat
  if (slot === 'weapon') {
    baseItem.baseStat.name = 'Dégâts Tranchants & Psioniques';
    baseItem.baseStat.value = Math.round((50 + (itemPower * 0.22)) * (isMastercraft ? 1.3 : 1.0));
    baseItem.iconName = 'Sword';
  } else if (slot === 'deck') {
    baseItem.baseStat.name = 'Puissance Psionique Cérébrale';
    baseItem.baseStat.value = Math.round((45 + (itemPower * 0.20)) * (isMastercraft ? 1.3 : 1.0));
    baseItem.iconName = 'Cpu';
  } else if (slot === 'armor') {
    baseItem.baseStat.name = 'Armure Composite & Absorption';
    baseItem.baseStat.value = Math.round((40 + (itemPower * 0.18)) * (isMastercraft ? 1.3 : 1.0));
    baseItem.iconName = 'Shield';
  } else if (slot === 'chip') {
    baseItem.baseStat.name = 'Énergie PSI Max & Condensateur';
    baseItem.baseStat.value = Math.round((60 + (itemPower * 0.25)) * (isMastercraft ? 1.3 : 1.0));
    baseItem.iconName = 'Zap';
  } else if (slot === 'boots') {
    baseItem.baseStat.name = 'Agilité & Réflexes Néo-Moteurs';
    baseItem.baseStat.value = Math.round((25 + (itemPower * 0.12)) * (isMastercraft ? 1.3 : 1.0));
    baseItem.iconName = 'Activity';
  }

  // Influence affixes with used materials
  const catalystAffixes: ItemAffix[] = [];
  if ((materialsUsed.neural_filament || 0) >= 2) {
    catalystAffixes.push({
      name: 'de Résonance Synaptique Pure',
      stat: 'psiDamage',
      value: Math.round(18 + playerLevel * 0.8 + (materialsUsed.neural_filament || 0) * 4)
    });
  }
  if ((materialsUsed.titanium_alloy || 0) >= 2) {
    catalystAffixes.push({
      name: 'de Blindage Titane Renforcé',
      stat: 'armor',
      value: Math.round(20 + playerLevel * 0.7 + (materialsUsed.titanium_alloy || 0) * 5)
    });
  }
  if ((materialsUsed.darknet_firmware || 0) >= 1) {
    catalystAffixes.push({
      name: 'de Siphon Malveillant Darknet',
      stat: 'lifeSteal',
      value: Math.round(5 + (materialsUsed.darknet_firmware || 0) * 2)
    });
  }

  // Combine and deduplicate affixes
  if (catalystAffixes.length > 0) {
    baseItem.affixes = [...catalystAffixes, ...baseItem.affixes].slice(0, rolledRarity === 'legendary' ? 4 : rolledRarity === 'epic' ? 3 : 2);
  }

  // If Mastercraft, guarantee 1 or 2 sockets
  if (isMastercraft) {
    baseItem.sockets = rolledRarity === 'legendary' ? [null, null] : [null];
    baseItem.affixes = baseItem.affixes.map(aff => ({
      ...aff,
      value: Math.round(aff.value * 1.25)
    }));
  }

  // Award Crafting XP & update Crafting Skill
  const expGained = Math.round(
    (rolledRarity === 'legendary' ? 120 : rolledRarity === 'epic' ? 70 : rolledRarity === 'rare' ? 40 : 20) *
    (isMastercraft ? 1.5 : 1.0)
  );

  let newExp = craftingSkill.exp + expGained;
  let newLevel = craftingSkill.level;
  let newMaxExp = craftingSkill.maxExp;

  while (newExp >= newMaxExp && newLevel < 50) {
    newExp -= newMaxExp;
    newLevel++;
    newMaxExp = Math.floor(newMaxExp * 1.35);
  }

  const updatedSkillState: CraftingSkillState = {
    level: newLevel,
    exp: newExp,
    maxExp: newMaxExp,
    totalCrafts: craftingSkill.totalCrafts + 1,
    criticalCrafts: craftingSkill.criticalCrafts + (isMastercraft ? 1 : 0)
  };

  return {
    item: baseItem,
    isMastercraft,
    expAwarded: expGained,
    newCraftingSkill: updatedSkillState
  };
}

// ── 6. SYSTÈME D'AMÉLIORATION D'ÉQUIPEMENT EXISTANT (UPGRADE) ──
export interface UpgradeCost {
  scrapCost: number;
  filamentCost: number;
  titaniumCost: number;
  processorCost: number;
  naniteCost: number;
}

export function calculateUpgradeCost(item: EquipmentItem): UpgradeCost {
  const currentLevel = item.levelReq || 1;
  const mult = item.rarity === 'legendary' ? 2.5 : item.rarity === 'epic' ? 1.8 : item.rarity === 'rare' ? 1.3 : 1.0;

  return {
    scrapCost: Math.round(15 * mult),
    filamentCost: item.rarity === 'standard' ? 0 : Math.round(3 * mult),
    titaniumCost: Math.round(2 * mult),
    processorCost: item.rarity === 'legendary' ? 2 : item.rarity === 'epic' ? 1 : 0,
    naniteCost: Math.round(100 * mult * (1 + currentLevel * 0.1))
  };
}

export function upgradeExistingEquipment(
  item: EquipmentItem,
  craftingSkill: CraftingSkillState
): { upgradedItem: EquipmentItem; expGained: number; newSkillState: CraftingSkillState } {
  const upgradedItem: EquipmentItem = {
    ...item,
    id: item.id,
    itemPower: Math.min(825, (item.itemPower || 200) + 35 + Math.round(craftingSkill.level * 1.5)),
    baseStat: {
      name: item.baseStat.name,
      value: Math.round(item.baseStat.value * 1.18)
    },
    affixes: item.affixes.map(aff => ({
      ...aff,
      value: Math.round(aff.value * 1.15)
    }))
  };

  // Add socket if item has room
  if (!upgradedItem.sockets) {
    upgradedItem.sockets = [null];
  } else if (upgradedItem.sockets.length < 2 && Math.random() < 0.5) {
    upgradedItem.sockets.push(null);
  }

  // Update name if not already upgraded
  if (!upgradedItem.name.includes('[SURCADENCÉ]')) {
    upgradedItem.name = `[SURCADENCÉ] ${upgradedItem.name}`;
  }

  const expGained = 45;
  let newExp = craftingSkill.exp + expGained;
  let newLevel = craftingSkill.level;
  let newMaxExp = craftingSkill.maxExp;

  while (newExp >= newMaxExp && newLevel < 50) {
    newExp -= newMaxExp;
    newLevel++;
    newMaxExp = Math.floor(newMaxExp * 1.35);
  }

  return {
    upgradedItem,
    expGained,
    newSkillState: {
      ...craftingSkill,
      level: newLevel,
      exp: newExp,
      maxExp: newMaxExp,
      totalCrafts: craftingSkill.totalCrafts + 1
    }
  };
}
