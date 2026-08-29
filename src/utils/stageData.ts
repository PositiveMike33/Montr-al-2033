import { StageInfo } from '../types';

export const STAGES_DATA: StageInfo[] = [
  {
    id: 1,
    name: 'Stage 1 : Catacombes du RÉSO & Berri-UQAM',
    subtitle: 'Sous-sols inondés de Montréal, relais de données pirates',
    description: 'Infiltrez les tunnels sous-terrains du métro désaffecté et du réseau piétonnier souterrain de Montréal. Déjouez les patrouilles de drones automatisés du SPVM corporatif et neutralisez le premier coupe-circuit neural.',
    bossName: 'Exécuteur SPVM-Prime',
    bossTitle: 'Droïde de Répression Alpha 2033',
    bossHpMultiplier: 1.0,
    accentColor: '#00f0ff', // Cyber cyan
    bgDark: '#030a16',
    gridColor: '#00446622',
    objective: 'Éliminez 25 patrouilles SPVM puis abattez l’Exécuteur Prime.'
  },
  {
    id: 2,
    name: 'Stage 2 : Docks du Silo 5 & Vieux-Montréal',
    subtitle: 'Zone portuaire industrielle, conteneurs de serveurs quantiques',
    description: 'Les quais rouillés du Vieux-Port abritent les fermes de calcul quantique asservissant la métropole. Des mercenaires lourdement cybernétisés patrouillent parmi les conteneurs sous une pluie acide néon.',
    bossName: 'Titan Quantique Silo-5',
    bossTitle: 'Blindé Mecha de Sécurité Portuaire',
    bossHpMultiplier: 1.8,
    accentColor: '#39ff14', // Acid neon green
    bgDark: '#04120a',
    gridColor: '#10552022',
    objective: 'Détruisez 35 mercenaires cybernétiques et neutralisez le Titan Mecha.'
  },
  {
    id: 3,
    name: 'Stage 3 : Mégastructure Tour Ville-Marie',
    subtitle: 'Gratte-ciel corporatiste ultra-sécurisé, cœur du réseau panoptique',
    description: 'Pénétrez les étages supérieurs de la tour monolithique. Les agents de sécurité de l’élite corporatiste et les technomanciens contrôlent la surveillance biométrique intégrale des citoyens montréalais.',
    bossName: 'I.A. Matrice Omnisciente',
    bossTitle: 'Supercalculateur Central de Surveillance',
    bossHpMultiplier: 2.8,
    accentColor: '#ff007f', // Neon magenta
    bgDark: '#12020e',
    gridColor: '#66004422',
    objective: 'Purgez 45 agents d’élite et piratez le noyau de l’I.A. Matrice.'
  },
  {
    id: 4,
    name: 'Stage 4 : Citadelle Apex du Mont-Royal',
    subtitle: 'Sanctuaire orbital terrestre, bastion final de l’Architecte',
    description: 'Le sommet du Mont-Royal est transformé en forteresse d’antennes synaptiques générant le champ de soumission mentale. L’Architecte de l’Asservissement vous y attend pour l’affrontement final.',
    bossName: 'L’Architecte de l’Asservissement',
    bossTitle: 'Maître du Réseau Neural & Dictateur Cybernétique',
    bossHpMultiplier: 4.2,
    accentColor: '#ffaa00', // Gold / amber overload
    bgDark: '#140c02',
    gridColor: '#66440022',
    objective: 'Triomphez des vagues de garde d’élite et libérez Montréal pour toujours !'
  }
];

export const INITIAL_SKILL_TREE = [
  // Cyber-Hacking Branch
  {
    id: 'cyber_1',
    name: 'Injection Malware Overclock',
    branch: 'cyber' as const,
    icon: 'Terminal',
    description: 'Augmente les dégâts élémentaires de hacking et réduit les temps de recharge de 4% par rang.',
    maxRank: 5,
    currentRank: 0,
    reqPoints: 0,
    effect: { stat: 'cyberDamageBonus', perRank: 6 }
  },
  {
    id: 'cyber_2',
    name: 'EMP Amplifié & Déstabilisation',
    branch: 'cyber' as const,
    icon: 'Radio',
    description: 'L’Onde de Choc EMP inflige +20% de dégâts supplémentaires et étourdit 0.5s plus longtemps par rang.',
    maxRank: 5,
    currentRank: 0,
    reqPoints: 2,
    effect: { stat: 'empDamageBonus', perRank: 20 }
  },
  {
    id: 'cyber_3',
    name: 'Nanites Réparateurs Réflexes',
    branch: 'cyber' as const,
    icon: 'ShieldAlert',
    description: 'Octroie +8% d’Armure Bio-Kevlar et régénère 1% de vos PV max toutes les 3 secondes par rang.',
    maxRank: 5,
    currentRank: 0,
    reqPoints: 5,
    effect: { stat: 'armorBonus', perRank: 8 }
  },
  {
    id: 'cyber_4',
    name: 'Protocole Matrix Zero (Ultime)',
    branch: 'cyber' as const,
    icon: 'Cpu',
    description: 'Pendant le Bullet-Time, chaque coup porté déclenche une explosion de code infligeant 100% de dégâts purs.',
    maxRank: 1,
    currentRank: 0,
    reqPoints: 10,
    effect: { stat: 'matrixExplosion', perRank: 100 }
  },

  // Psychic Branch
  {
    id: 'psi_1',
    name: 'Onde Synaptique Axonale',
    branch: 'psychic' as const,
    icon: 'Zap',
    description: 'Augmente la puissance psionique brute de +8% et la chance de critique psychique de +2% par rang.',
    maxRank: 5,
    currentRank: 0,
    reqPoints: 0,
    effect: { stat: 'psiPowerBonus', perRank: 8 }
  },
  {
    id: 'psi_2',
    name: 'Pénétration de Blindage Télékinétique',
    branch: 'psychic' as const,
    icon: 'Crosshair',
    description: 'La Lance Synaptique traverse 1 ennemi supplémentaire et inflige +15% de dégâts critiques par rang.',
    maxRank: 5,
    currentRank: 0,
    reqPoints: 2,
    effect: { stat: 'psiCritBonus', perRank: 15 }
  },
  {
    id: 'psi_3',
    name: 'Vortex Gravitationnel Dévastateur',
    branch: 'psychic' as const,
    icon: 'Disc',
    description: 'Augmente le rayon du Trou Noir Psychique de +15% et attire les ennemis avec une force doublée.',
    maxRank: 5,
    currentRank: 0,
    reqPoints: 5,
    effect: { stat: 'vortexRadiusBonus', perRank: 15 }
  },
  {
    id: 'psi_4',
    name: 'Transcendance Éveillée (Ultime)',
    branch: 'psychic' as const,
    icon: 'Flame',
    description: 'Débloque l’état d’Éveil Psionique Permanent : Vos attaques de mêlée projettent des lames d’ondes de choc.',
    maxRank: 1,
    currentRank: 0,
    reqPoints: 10,
    effect: { stat: 'transcendence', perRank: 1 }
  }
];
