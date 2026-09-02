import { Companion, WorldEvent, StageInfo, EquipmentItem } from '../types';
import { generateLootItem } from './lootGenerator';

export const INITIAL_COMPANIONS: Companion[] = [
  {
    id: 'companion_sophia',
    name: 'Deus Ex Sophia',
    title: 'Intelligence Artificielle Quantique Suprême',
    role: 'support',
    archetype: 'drone_support',
    tacticalProtocol: 'protective',
    installedMod: 'nanite_booster',
    avatarColor: '#00f3ff',
    iconName: 'Bot',
    level: 1,
    exp: 0,
    maxExp: 100,
    kills: 0,
    abilitiesUsed: 0,
    hp: 550,
    maxHp: 550,
    damage: 42,
    attackCooldown: 35,
    attackRange: 320,
    specialCooldown: 0,
    maxSpecialCooldown: 180, // 3s
    abilityName: 'Matrice Nanite & Surcharge Synaptique',
    abilityDesc: 'Pénètre les flux réseaux de Montréal, régénère 20% des PV de Thirty3, amplifie la puissance Psi et diffuse une onde d’overclock.',
    passiveBonus: '+25% Régénération PSI, +15% Réduction des Cooldowns & Soins Nanites',
    unlocked: true,
    active: true // Active by default with Thirty3
  },
  {
    id: 'companion_valkyrie',
    name: 'Valkyrie-X (Sentinelle Exo)',
    title: 'Cyborg de Répression Reprogrammée',
    role: 'tank',
    archetype: 'heavy_melee',
    tacticalProtocol: 'aggressive',
    installedMod: 'emp_reflector',
    avatarColor: '#ff0044',
    iconName: 'Shield',
    level: 1,
    exp: 0,
    maxExp: 100,
    kills: 0,
    abilitiesUsed: 0,
    hp: 950,
    maxHp: 950,
    damage: 60,
    attackCooldown: 30,
    attackRange: 80,
    specialCooldown: 0,
    maxSpecialCooldown: 240, // 4s
    abilityName: 'Forteresse Cinétique & Onde Sismique',
    abilityDesc: 'Charge au cœur de la mêlée, frappe le sol pour étourdir les ennemis et capte l’attention de tous les assaillants proches.',
    passiveBonus: '+35 Armure Globale, +15% Résistance aux Dégâts & Provocation de Zone',
    unlocked: true,
    active: true // Active by default (Max 2)
  },
  {
    id: 'companion_nyx',
    name: 'Nyx-7 (Ombre Cyber-Hacker)',
    title: 'Infiltratrice Stealth & Railgun Hack',
    role: 'offense',
    archetype: 'stealth_hacker',
    tacticalProtocol: 'tactical_hunter',
    installedMod: 'vampiric_core',
    avatarColor: '#ff00ff',
    iconName: 'Crosshair',
    level: 1,
    exp: 0,
    maxExp: 100,
    kills: 0,
    abilitiesUsed: 0,
    hp: 380,
    maxHp: 380,
    damage: 90,
    attackCooldown: 50,
    attackRange: 420,
    specialCooldown: 0,
    maxSpecialCooldown: 220,
    abilityName: 'Neuro-Virus & Tir Perforant Singularité',
    abilityDesc: 'Injecte un malware paralysant les armes des cibles prioritaires et décoche un tir railgun transperçant à très haute perforation critique.',
    passiveBonus: '+20% Dégâts Critiques, +10% Chance Critique & Cibles Prioritaires',
    unlocked: true,
    active: false
  },
  {
    id: 'companion_chrono',
    name: 'Chrono-0 (Distordeur Temporel)',
    title: 'IA Expérimentale de Dilatation Spatio-Temporelle',
    role: 'support',
    archetype: 'chronos',
    tacticalProtocol: 'protective',
    installedMod: 'overclock_relay',
    avatarColor: '#00ff41',
    iconName: 'Zap',
    level: 1,
    exp: 0,
    maxExp: 100,
    kills: 0,
    abilitiesUsed: 0,
    hp: 400,
    maxHp: 400,
    damage: 40,
    attackCooldown: 45,
    attackRange: 220,
    specialCooldown: 0,
    maxSpecialCooldown: 300,
    abilityName: 'Micro Bullet-Time Nova',
    abilityDesc: 'Ralentit temporairement tous les projectiles et assaillants dans un rayon de 300px pendant 2.5 secondes.',
    passiveBonus: '+20% Vitesse de Déplacement & +10% Esquive Temporelle',
    unlocked: true,
    active: false
  }
];

export function getTraderInventory(playerLevel: number, difficultyTier: number): EquipmentItem[] {
  return [
    generateLootItem(playerLevel, difficultyTier, 'legendary'),
    generateLootItem(playerLevel, difficultyTier, 'epic'),
    generateLootItem(playerLevel, difficultyTier, 'rare'),
    generateLootItem(playerLevel, difficultyTier, 'rare')
  ];
}

export function generateWorldEvent(stageId: number, difficultyTier: number, playerX: number, playerY: number): WorldEvent {
  const eventTypes: Array<{
    type: 'corporate_ambush' | 'escaped_prisoner' | 'wandering_trader';
    title: string;
    subtitle: string;
    description: string;
    accentColor: string;
    icon: string;
    objectiveText: string;
  }> = [
    {
      type: 'corporate_ambush',
      title: 'EMBUSCADE CORPORATISTE SPVM',
      subtitle: `Secteur 0${stageId} // Verrouillage d'urgence`,
      description: 'Une escouade d’élite d’assaut corporatiste et des drones tueurs ont convergé pour éliminer votre cellule rebelle.',
      accentColor: '#ff0044',
      icon: 'ShieldAlert',
      objectiveText: 'Éliminez l’escouade d’assaut d’élite avant la fin du compte à rebours.'
    },
    {
      type: 'escaped_prisoner',
      title: 'SAUVETAGE : HACKER ÉVADÉ',
      subtitle: `Lien Neural Détecté // Balise d'Insurrection`,
      description: 'Un résistant neural cybernétique s’est échappé du centre de détention biométrique. Protégez-le des androïdes de capture !',
      accentColor: '#00f3ff',
      icon: 'UserCheck',
      objectiveText: 'Protégez le prisonnier et repoussez les vagues de capture.'
    },
    {
      type: 'wandering_trader',
      title: 'CYBER-MARCHAND CLANDESTIN',
      subtitle: `Réseau Dark-Net Éphémère // Montréal 2033`,
      description: 'Un contrebandier de prothèses militaires illégales propose des implants et puces uniques pour quelques secondes.',
      accentColor: '#f2994a',
      icon: 'ShoppingBag',
      objectiveText: 'Approchez-vous du marchand clandestin pour acquérir de l’équipement exclusif.'
    }
  ];

  const chosen = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  
  // Position near player but with some distance (200 - 450 px)
  const angle = Math.random() * Math.PI * 2;
  const dist = 220 + Math.random() * 200;
  const x = Math.max(100, Math.min(2300, playerX + Math.cos(angle) * dist));
  const y = Math.max(100, Math.min(2300, playerY + Math.sin(angle) * dist));

  const traderItems: EquipmentItem[] = chosen.type === 'wandering_trader' 
    ? getTraderInventory(Math.max(1, stageId * 2), difficultyTier)
    : [];

  return {
    id: 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    type: chosen.type,
    title: chosen.title,
    subtitle: chosen.subtitle,
    description: chosen.description,
    x,
    y,
    radius: 180,
    status: 'active',
    timeRemaining: chosen.type === 'wandering_trader' ? 75 : 60,
    maxDuration: chosen.type === 'wandering_trader' ? 75 : 60,
    icon: chosen.icon,
    accentColor: chosen.accentColor,
    enemiesRemaining: chosen.type === 'corporate_ambush' ? 6 : (chosen.type === 'escaped_prisoner' ? 5 : 0),
    rewardNanites: Math.round((120 + stageId * 50) * (1 + (difficultyTier - 1) * 0.2)),
    rewardExp: Math.round((300 + stageId * 150) * (1 + (difficultyTier - 1) * 0.2)),
    rewardItemRarity: chosen.type === 'corporate_ambush' ? 'epic' : 'rare',
    prisonerHp: chosen.type === 'escaped_prisoner' ? 400 : undefined,
    maxPrisonerHp: chosen.type === 'escaped_prisoner' ? 400 : undefined,
    traderInventory: traderItems,
    objectiveText: chosen.objectiveText
  };
}
