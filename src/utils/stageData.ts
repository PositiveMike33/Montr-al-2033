import { StageInfo } from '../types';

export const STAGES_DATA: StageInfo[] = [
  {
    id: 1,
    name: 'Secteur 1 : Rue Sainte-Catherine & Quartier des Spectacles',
    subtitle: 'Intersections réelles : Sainte-Catherine / Saint-Urbain • Métro Place-des-Arts (GPS: 45.5088° N, 73.5685° W)',
    description: 'Thirty3 et Deus Ex Sophia pénètrent l’artère commerciale de Sainte-Catherine. L’oligarque psychopathe Viktor Vance y extorque les commerces et citoyens via les milices privées du SPVM-Prime. Neutralisez les patrouilles pour diffuser le premier Deepfake de vérité sur les écrans géants de la Place des Festivals.',
    bossName: 'Commandant Répression SPVM-Prime',
    bossTitle: 'Bras Armé de Viktor Vance • Milice d’Extorsion',
    bossHpMultiplier: 1.0,
    accentColor: '#00f3ff', // Cyber cyan
    bgDark: '#030a16',
    gridColor: '#00446622',
    objective: 'Éliminez 25 mercenaires sur Sainte-Catherine puis abattez le Commandant Répression.'
  },
  {
    id: 2,
    name: 'Secteur 2 : Boulevard René-Lévesque & Place Ville-Marie',
    subtitle: 'Intersections réelles : René-Lévesque / McGill College • RÉSO Souterrain (GPS: 45.5009° N, 73.5684° W)',
    description: 'Les serveurs financiers de Viktor Vance sont logés dans les sous-sols blindés de Place Ville-Marie. Sophia analyse les flux bancaires illégaux et génère un deepfake audio irréfutable prouvant le racket organisé contre la population montréalaise.',
    bossName: 'Titan Mecha Bancaire PVM',
    bossTitle: 'Garde Blindé des Comptes Secrets de Vance',
    bossHpMultiplier: 1.8,
    accentColor: '#39ff14', // Acid neon green
    bgDark: '#04120a',
    gridColor: '#10552022',
    objective: 'Détruisez 35 gardes d’élite et piratez le Titan Mecha de Place Ville-Marie.'
  },
  {
    id: 3,
    name: 'Secteur 3 : Boulevard Saint-Laurent & Plateau Mont-Royal',
    subtitle: 'Intersections réelles : Saint-Laurent / Mont-Royal • Ruelles & Escaliers Cyber (GPS: 45.5225° N, 73.5872° W)',
    description: 'La « Main » de Montréal est verrouillée par les escouades de choc psychopathes de Vance. Sophia pirate les relais 6G des toits du Plateau pour retransmettre en direct les aveux compromettants de Viktor Vance à tous les résidents.',
    bossName: 'I.A. Matrice Panoptique Saint-Laurent',
    bossTitle: 'Réseau Central de Surveillance Biométrique',
    bossHpMultiplier: 2.8,
    accentColor: '#ff007f', // Neon magenta
    bgDark: '#12020e',
    gridColor: '#66004422',
    objective: 'Purgez 45 agents de surveillance et anéantissez l’I.A. Matrice du Plateau.'
  },
  {
    id: 4,
    name: 'Secteur 4 : Citadelle du Belvédère Kondiaronk & Mont-Royal',
    subtitle: 'Sommet réel du Mont-Royal • Belvédère Camillien-Houde (GPS: 45.5050° N, 73.5875° W)',
    description: 'La forteresse privée de Viktor « Malice » Vance domine toute la métropole. Thirty3 et Deus Ex Sophia lancent l’assaut final pour détruire ses implants synaptiques, diffuser l’archive Deepfake ultime et libérer définitivement le peuple de Montréal.',
    bossName: 'Viktor « Malice » Vance',
    bossTitle: 'Oligarque Psychopathe & Extorqueur en Chef de Montréal',
    bossHpMultiplier: 4.2,
    accentColor: '#ffaa00', // Gold / amber overload
    bgDark: '#140c02',
    gridColor: '#66440022',
    objective: 'Éliminez la garde prétorienne et terrassez Viktor Vance au sommet du Mont-Royal !'
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
