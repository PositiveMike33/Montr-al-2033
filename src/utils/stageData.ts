import { StageInfo } from '../types';

export const STAGES_DATA: StageInfo[] = [
  {
    id: 1,
    name: 'Acte I : Catacombs // RÉSO Souterrain & Cryptes Obscures',
    subtitle: 'Catacombes de Montréal (GPS: 45.5017° N, 73.5673° W) • Donjon Procédural : Cryptes & RÉSO',
    description: 'Thirty3 et Deus Ex Sophia s’infiltrent dans les sombres Catacombes sous le RÉSO montréalais. Un dédale organique de caveaux de pierre, de caveaux ancestraux et de canaux inondés où les patrouilles SPVM et les goules cybernétisées gardent les caches d’armes de Viktor Vance.',
    bossName: 'Viktor « Malice » Vance',
    bossTitle: 'Seigneur des Catacombes & Tyran de Montréal',
    bossHpMultiplier: 1.0,
    accentColor: '#00f3ff', // Cyber cyan
    bgDark: '#0a090e',
    gridColor: '#00f3ff1a',
    objective: 'Explorez le labyrinthe des Catacombes, pillez les reliques et terrassez Viktor Vance.'
  },
  {
    id: 2,
    name: 'Acte II : Docks // Port Industriel & Silicon Coast',
    subtitle: 'Port & Docks de Fret Maritime (GPS: 34.0522° N, 118.2437° W) • Donjon Procédural : Quais & Conteneurs',
    description: 'Les immenses Docks industriels de la côte ouest. Des quais métalliques suspendus sur des canaux d’eau toxique, des labyrinthes de conteneurs de fret et des terminaux automatisés régis par l’intelligence artificielle renégate ARES-9.',
    bossName: 'ARES-9 // I.A. Suprémaciste Militaire',
    bossTitle: 'Cortex Autonome Corrompu des Docks',
    bossHpMultiplier: 1.8,
    accentColor: '#39ff14', // Acid neon green
    bgDark: '#0c131a',
    gridColor: '#39ff141a',
    objective: 'Infiltrez les Docks maritimes, piratez les terminaux et détruisez le supercalculateur ARES-9.'
  },
  {
    id: 3,
    name: 'Acte III : Megastructure // Néo-Mégalopole & Cortex Hive',
    subtitle: 'Mégastructure Brutaliste Cybernétique (GPS: 41.9028° N, 12.4964° E) • Donjon Procédural : Skyways & Salles Serveurs',
    description: 'Une Mégastructure pyramidale infinie surplombant le néant. Des passerelles aériennes de verre, des salles de serveurs quantiques overclockés et des réacteurs dimensionnels où Abaddon déploie ses légions d’ombres et ses sous-routines tueuses.',
    bossName: 'Abaddon // Démon Primordial de l’Abîme',
    bossTitle: 'Maître du Cœur de la Mégastructure',
    bossHpMultiplier: 2.8,
    accentColor: '#ff007f', // Neon magenta
    bgDark: '#110a14',
    gridColor: '#ff007f1a',
    objective: 'Traversez les skyways de la Mégastructure et bannissez Abaddon dans le réacteur central.'
  },
  {
    id: 4,
    name: 'Acte IV : Citadel // Bastion Obscur & Sanctum du Trône',
    subtitle: 'Citadelle Sacrée des Abîmes (GPS: 82.8628° S, 135.0000° E) • Donjon Procédural : Nefs Gothiques & Trône',
    description: 'La monumentale Citadelle noire dressée au centre du cataclysme. Des colonnades d’obsidienne, des nefs cathédrales sacrées et des anneaux rituels ancestraux où l’Antéchrist vous attend pour le jugement final de l’humanité.',
    bossName: 'L’ANTÉCHRIST // L’Avènement de la Bête',
    bossTitle: 'Monarque Sombre de la Citadelle • Boss Final Ultime',
    bossHpMultiplier: 4.8,
    accentColor: '#ffaa00', // Gold & Blood Amber
    bgDark: '#120b04',
    gridColor: '#ffaa001a',
    objective: 'Gravissez les salles sacrées de la Citadelle et terrassez l’Antéchrist sur son trône obscur !'
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
