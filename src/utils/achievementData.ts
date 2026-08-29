import { Achievement, SkillNode, EquipmentItem, ItemSlot, StageInfo } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // COMBAT
  {
    id: 'kills_10',
    title: 'Premier Sang Cyber',
    description: 'Éliminer 10 agents ou drones corporatistes de Montréal.',
    category: 'combat',
    iconName: 'Crosshair',
    badgeTitle: 'Spectre Débutant',
    badgeIcon: '🎯',
    badgeColor: '#00f3ff',
    targetValue: 10,
    currentValue: 0,
    unlocked: false,
    rewardNanites: 100,
    rewardExp: 250,
    statBonus: {
      stat: 'physicalDamage',
      value: 3,
      description: '+3 Dégâts Physiques'
    }
  },
  {
    id: 'kills_100',
    title: 'Nettoyeur de Secteur',
    description: 'Éliminer 100 soldats et drones corporatistes.',
    category: 'combat',
    iconName: 'Skull',
    badgeTitle: 'Exécuteur SPVM',
    badgeIcon: '⚡',
    badgeColor: '#38bdf8',
    targetValue: 100,
    currentValue: 0,
    unlocked: false,
    rewardNanites: 350,
    rewardExp: 800,
    statBonus: {
      stat: 'critChance',
      value: 2,
      description: '+2% Chance de Coup Critique'
    }
  },
  {
    id: 'kills_500',
    title: 'Fléau Corporatiste',
    description: 'Neutraliser 500 unités de répression dans les bastions.',
    category: 'combat',
    iconName: 'Flame',
    badgeTitle: 'Boucher des Silos',
    badgeIcon: '🔥',
    badgeColor: '#f97316',
    targetValue: 500,
    currentValue: 0,
    unlocked: false,
    rewardNanites: 1200,
    rewardExp: 2500,
    statBonus: {
      stat: 'psiDamage',
      value: 12,
      description: '+12 Dégâts Psioniques'
    }
  },
  {
    id: 'kills_1000',
    title: '1000 Kills // Destructeur de Régime',
    description: 'Atteindre le palier légendaire de 1 000 ennemis exterminés.',
    category: 'combat',
    iconName: 'Trophy',
    badgeTitle: 'Annihilateur 2033',
    badgeIcon: '🏆',
    badgeColor: '#ff0055',
    targetValue: 1000,
    currentValue: 0,
    unlocked: false,
    rewardNanites: 3000,
    rewardExp: 6000,
    statBonus: {
      stat: 'critDamage',
      value: 25,
      description: '+25% Dégâts Critiques'
    }
  },

  // LOOT
  {
    id: 'legendary_loot',
    title: 'Trésor Quantique // Butin Légendaire',
    description: 'Découvrir votre tout premier équipement de rareté Légendaire (Orange).',
    category: 'loot',
    iconName: 'Sparkles',
    badgeTitle: 'Architecte d’Or',
    badgeIcon: '✨',
    badgeColor: '#f59e0b',
    targetValue: 1,
    currentValue: 0,
    unlocked: false,
    rewardNanites: 500,
    rewardExp: 1500,
    statBonus: {
      stat: 'psiDamage',
      value: 15,
      description: '+15 Dégâts Psioniques'
    }
  },
  {
    id: 'epic_loot_5',
    title: 'Arsenal Surdimensionné',
    description: 'Trouver au moins 5 équipements de rareté Épique ou Légendaire.',
    category: 'loot',
    iconName: 'Layers',
    badgeTitle: 'Seigneur du Butin',
    badgeIcon: '💎',
    badgeColor: '#ff00ff',
    targetValue: 5,
    currentValue: 0,
    unlocked: false,
    rewardNanites: 800,
    rewardExp: 2000,
    statBonus: {
      stat: 'armor',
      value: 10,
      description: '+10 Blindage Exo-Squelette'
    }
  },
  {
    id: 'full_gear',
    title: 'Cyborg Intégral',
    description: 'Équiper des pièces de combat dans les 5 slots (Arme, Deck, Armure, Puce, Bottes).',
    category: 'loot',
    iconName: 'Shield',
    badgeTitle: 'Guerrier Bionique',
    badgeIcon: '🦾',
    badgeColor: '#00ff41',
    targetValue: 5,
    currentValue: 0,
    unlocked: false,
    rewardNanites: 400,
    rewardExp: 1000,
    statBonus: {
      stat: 'maxHp',
      value: 100,
      description: '+100 Bio-Santé Max'
    }
  },
  {
    id: 'cyber_forge_first',
    title: 'Alchimiste Moléculaire',
    description: 'Fusionner 3 implants dans la Cyber-Forge pour synthétiser un équipement de rang supérieur.',
    category: 'loot',
    iconName: 'Flame',
    badgeTitle: 'Forgeron Neural',
    badgeIcon: '⚡',
    badgeColor: '#ff0055',
    targetValue: 1,
    currentValue: 0,
    unlocked: false,
    rewardNanites: 350,
    rewardExp: 1200,
    statBonus: {
      stat: 'physicalDamage',
      value: 6,
      description: '+6 Dégâts Physiques'
    }
  },
  {
    id: 'cyber_forge_5',
    title: 'Grand Maître Forgeron',
    description: 'Effectuer 5 fusions de matériel réussies dans la Cyber-Forge.',
    category: 'loot',
    iconName: 'Flame',
    badgeTitle: 'Maître de la Forge',
    badgeIcon: '🔥',
    badgeColor: '#f2994a',
    targetValue: 5,
    currentValue: 0,
    unlocked: false,
    rewardNanites: 1500,
    rewardExp: 4000,
    statBonus: {
      stat: 'critDamage',
      value: 15,
      description: '+15% Dégâts Critiques'
    }
  },

  // SKILLS & MATRIX
  {
    id: 'skill_nodes_maxed',
    title: 'Éveil Neural Absolu // Tous Talents Maxés',
    description: 'Monter tous les nœuds de l’arbre de talents hybride au rang maximum.',
    category: 'skills',
    iconName: 'Cpu',
    badgeTitle: 'Divinité Psychique',
    badgeIcon: '🧠',
    badgeColor: '#9d00ff',
    targetValue: 8, // Total nodes in INITIAL_SKILL_TREE
    currentValue: 0,
    unlocked: false,
    rewardNanites: 2500,
    rewardExp: 5000,
    statBonus: {
      stat: 'cooldownReduction',
      value: 10,
      description: '+10% Vitesse de Recharge des Sorts'
    }
  },
  {
    id: 'bullet_time_20',
    title: 'Chronomancien de la Matrice',
    description: 'Activer le mode Bullet-Time Overdrive à 20 reprises en combat.',
    category: 'skills',
    iconName: 'Zap',
    badgeTitle: 'Maître du Temps',
    badgeIcon: '⏳',
    badgeColor: '#00f3ff',
    targetValue: 20,
    currentValue: 0,
    unlocked: false,
    rewardNanites: 600,
    rewardExp: 1200,
    statBonus: {
      stat: 'dodgeChance',
      value: 5,
      description: '+5% Chance d’Esquive'
    }
  },

  // PROGRESSION
  {
    id: 'level_25',
    title: 'Vétéran Cybernétique',
    description: 'Dépasser les protocoles de sécurité et atteindre le niveau 25.',
    category: 'progression',
    iconName: 'Award',
    badgeTitle: 'Vétéran Rang 25',
    badgeIcon: '⭐',
    badgeColor: '#eab308',
    targetValue: 25,
    currentValue: 1,
    unlocked: false,
    rewardNanites: 1000,
    rewardExp: 2000,
    statBonus: {
      stat: 'maxPsi',
      value: 50,
      description: '+50 Énergie Mentale PSI'
    }
  },
  {
    id: 'level_50',
    title: 'Demi-Dieu Numérique',
    description: 'Atteindre le niveau 50 de puissance brute.',
    category: 'progression',
    iconName: 'Sparkles',
    badgeTitle: 'Légende Vivante 50+',
    badgeIcon: '🌟',
    badgeColor: '#ff00ff',
    targetValue: 50,
    currentValue: 1,
    unlocked: false,
    rewardNanites: 2500,
    rewardExp: 5000,
    statBonus: {
      stat: 'lifeSteal',
      value: 4,
      description: '+4% Vol de Vie Nanite'
    }
  },
  {
    id: 'tier_10',
    title: 'Overclock Suprême // Tier 10',
    description: 'Braver le danger maximal et jouer au Tier 10 de difficulté.',
    category: 'progression',
    iconName: 'Activity',
    badgeTitle: 'Maître de la Matrice',
    badgeIcon: '⚡',
    badgeColor: '#dc2626',
    targetValue: 10,
    currentValue: 1,
    unlocked: false,
    rewardNanites: 2000,
    rewardExp: 4000,
    statBonus: {
      stat: 'moveSpeed',
      value: 1.2,
      description: '+1.2 m/s Vitesse de Déplacement'
    }
  },

  // MASTERY & WORLD
  {
    id: 'stage_1_boss',
    title: 'Libérateur du Vieux-Port',
    description: 'Vaincre le boss Kraken-Mecha SPVM du Secteur 01.',
    category: 'mastery',
    iconName: 'Anchor',
    badgeTitle: 'Plongeur de l’Abîme',
    badgeIcon: '🌊',
    badgeColor: '#00f3ff',
    targetValue: 1,
    currentValue: 0,
    unlocked: false,
    rewardNanites: 500,
    rewardExp: 1500,
    statBonus: {
      stat: 'physicalDamage',
      value: 8,
      description: '+8 Dégâts Physiques'
    }
  },
  {
    id: 'all_stages_clear',
    title: 'Chute de la Citadelle Orbitale',
    description: 'Éliminer le Supercalculateur Central de la Place-Ville-Marie (Secteur 04).',
    category: 'mastery',
    iconName: 'ShieldAlert',
    badgeTitle: 'Libérateur de Montréal',
    badgeIcon: '🏙️',
    badgeColor: '#00ff41',
    targetValue: 1,
    currentValue: 0,
    unlocked: false,
    rewardNanites: 5000,
    rewardExp: 10000,
    statBonus: {
      stat: 'critChance',
      value: 5,
      description: '+5% Chance de Critique & +200 HP'
    }
  },
  {
    id: 'nanites_5000',
    title: 'Magnat de la Cryptomonnaie',
    description: 'Amasser un stock de plus de 5 000 Nanites en réserve.',
    category: 'mastery',
    iconName: 'Coins',
    badgeTitle: 'Baron des Données',
    badgeIcon: '💰',
    badgeColor: '#f59e0b',
    targetValue: 5000,
    currentValue: 150,
    unlocked: false,
    rewardNanites: 1500,
    rewardExp: 3000,
    statBonus: {
      stat: 'armor',
      value: 8,
      description: '+8 Blindage'
    }
  },
  {
    id: 'events_5',
    title: 'Protecteur du Peuple',
    description: 'Accomplir avec succès 5 événements mondiaux dynamiques.',
    category: 'mastery',
    iconName: 'Radio',
    badgeTitle: 'Héros Urbain',
    badgeIcon: '🛡️',
    badgeColor: '#38bdf8',
    targetValue: 5,
    currentValue: 0,
    unlocked: false,
    rewardNanites: 1200,
    rewardExp: 2500,
    statBonus: {
      stat: 'hpRegen',
      value: 4,
      description: '+4 PV/s Régénération'
    }
  }
];

export interface TrackGameState {
  killCount: number;
  level: number;
  nanites: number;
  difficultyTier: number;
  equipped: { [key in ItemSlot]?: EquipmentItem };
  inventory: EquipmentItem[];
  skillNodes: SkillNode[];
  bulletTimeUses: number;
  completedEventsCount: number;
  defeatedBosses: Set<string> | string[];
  foundLegendaryCount: number;
  foundEpicOrBetterCount: number;
  forgedItemsCount?: number;
}

export function evaluateAchievements(
  currentAchievements: Achievement[],
  state: TrackGameState
): {
  updatedAchievements: Achievement[];
  newlyUnlocked: Achievement[];
} {
  const newlyUnlocked: Achievement[] = [];
  const bossSet = state.defeatedBosses instanceof Set
    ? state.defeatedBosses
    : new Set(Array.isArray(state.defeatedBosses) ? state.defeatedBosses : []);

  const updatedAchievements = currentAchievements.map((ach) => {
    let currentVal = ach.currentValue;

    switch (ach.id) {
      case 'kills_10':
      case 'kills_100':
      case 'kills_500':
      case 'kills_1000':
        currentVal = state.killCount;
        break;
      case 'legendary_loot':
        currentVal = state.foundLegendaryCount;
        break;
      case 'epic_loot_5':
        currentVal = state.foundEpicOrBetterCount;
        break;
      case 'cyber_forge_first':
      case 'cyber_forge_5':
        currentVal = state.forgedItemsCount || 0;
        break;
      case 'full_gear': {
        const slots: ItemSlot[] = ['weapon', 'deck', 'armor', 'chip', 'boots'];
        const filled = slots.filter((slot) => !!state.equipped[slot]).length;
        currentVal = filled;
        break;
      }
      case 'skill_nodes_maxed': {
        const maxedCount = state.skillNodes.filter(
          (node) => node.currentRank >= node.maxRank
        ).length;
        currentVal = maxedCount;
        break;
      }
      case 'bullet_time_20':
        currentVal = state.bulletTimeUses;
        break;
      case 'level_25':
      case 'level_50':
        currentVal = state.level;
        break;
      case 'tier_10':
        currentVal = state.difficultyTier;
        break;
      case 'stage_1_boss':
        currentVal = bossSet.has('Vieux-Port') || bossSet.has('boss_1') || bossSet.has('Exécuteur SPVM-Prime') || bossSet.size >= 1 ? 1 : 0;
        break;
      case 'all_stages_clear':
        currentVal = bossSet.size >= 4 ? 1 : 0;
        break;
      case 'nanites_5000':
        currentVal = state.nanites;
        break;
      case 'events_5':
        currentVal = state.completedEventsCount;
        break;
      default:
        break;
    }

    const isNowUnlocked = currentVal >= ach.targetValue;

    if (!ach.unlocked && isNowUnlocked) {
      const unlockedAch: Achievement = {
        ...ach,
        currentValue: currentVal,
        unlocked: true,
        unlockedAt: Date.now()
      };
      newlyUnlocked.push(unlockedAch);
      return unlockedAch;
    }

    return {
      ...ach,
      currentValue: currentVal
    };
  });

  return {
    updatedAchievements,
    newlyUnlocked
  };
}
