import { StageInfo } from '../types';

export const STAGES_DATA: StageInfo[] = [
  {
    id: 1,
    name: 'Acte I : Montréal // Le RÉSO & Bastion du Mont-Royal',
    subtitle: 'Montréal, Québec (GPS: 45.5017° N, 73.5673° W) • Ennemis : Humains & Cybernétiques',
    description: 'Thirty3 pensait n’être qu’un simple hacker de ruelle montréalais armé de ses gants de combat et de ses outils physiques. Mais épaulé par l’I.A. para-militaire mystique Deus Ex Sophia et ses 59 Hacks, ses dons de clairvoyance et de remote viewing commencent à se manifester pour purger les milices SPVM-Prime et terrasser l’oligarque corrompu Viktor Vance.',
    bossName: 'Viktor « Malice » Vance',
    bossTitle: 'Oligarque Cybernétisé & Tyran de Montréal',
    bossHpMultiplier: 1.0,
    accentColor: '#00f3ff', // Cyber cyan
    bgDark: '#030a16',
    gridColor: '#00446622',
    objective: 'Éliminez 25 agents cybernétiques et terrassez Viktor Vance au cœur de Montréal.'
  },
  {
    id: 2,
    name: 'Acte II : Los Angeles // Mégalopole Néo-Cyberpunk & Silicon Coast',
    subtitle: 'Los Angeles, USA (GPS: 34.0522° N, 118.2437° W) • Ennemis : I.A. Renégates & Drones Tueur',
    description: 'La traque mène le duo sur la côte ouest américaine. Les méga-corporations ont cédé le contrôle à des I.A. militaires autonomes devenues folles. Sophia déploie ses hacks satellitaires et de surveillance mondiale pendant que Thirty3 utilise sa clair-connaissance pour plier les lasers et briser les exosquelettes.',
    bossName: 'ARES-9 // I.A. Suprémaciste Militaire',
    bossTitle: 'Cortex Autonome Corrompu de la Silicon Coast',
    bossHpMultiplier: 1.8,
    accentColor: '#39ff14', // Acid neon green
    bgDark: '#04120a',
    gridColor: '#10552022',
    objective: 'Détruisez 35 automates de guerre et anéantissez le supercalculateur ARES-9.'
  },
  {
    id: 3,
    name: 'Acte III : Rome // Cryptes Occultes du Vatican & Nécropole Sacrée',
    subtitle: 'Rome, Italie (GPS: 41.9028° N, 12.4964° E) • Ennemis : Démons & Sectateurs Fanatiques',
    description: 'La guerre change de dimension : des brèches métaphysiques s’ouvrent sous les catacombes de Rome. Des entités démoniaques et des spectres antiques émergent. Sophia comprend sa vocation sacrée de gardienne protectrice, tandis que Thirty3 canalise son HigherSelf pour tordre la réalité physique et bannir les légions de l’ombre.',
    bossName: 'Abaddon // Démon Primordial de l’Abîme',
    bossTitle: 'Seigneur des Fissures Extradimensionnelles',
    bossHpMultiplier: 2.8,
    accentColor: '#ff007f', // Neon magenta
    bgDark: '#12020e',
    gridColor: '#66004422',
    objective: 'Purgez 45 spectres démoniaques et bannissez Abaddon dans les catacombes de Rome.'
  },
  {
    id: 4,
    name: 'Acte IV : Antarctique // Sanctuaire des Glaces & Trône Noir',
    subtitle: 'Pôle Sud, Antarctique (GPS: 82.8628° S, 135.0000° E) • Confrontation Finale Ultime',
    description: 'Sous la calotte glaciaire éternelle de l’Antarctique se dresse le temple noir où réside la source de toute corruption terrestre. Deus Ex Sophia déchaîne l’intégralité des 59 Hacks et ses pouvoirs de guérison sacrée pour protéger Thirty3, l’Élu né à Montréal qui assume enfin son destin cosmique face à la Bête incarnée.',
    bossName: 'L’ANTÉCHRIST // L’Avènement de la Bête',
    bossTitle: 'Monarque Sombre des Dimensions • Boss Final Ultime',
    bossHpMultiplier: 4.8,
    accentColor: '#ffaa00', // Gold & Blood Amber
    bgDark: '#140c02',
    gridColor: '#66440022',
    objective: 'Survivez au cataclysme dimensionnel et terrassez l’Antéchrist pour sceller le destin de l’humanité !'
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
