import { CodexEntry } from '../types';

export const INITIAL_CODEX_ENTRIES: CodexEntry[] = [
  // ==========================================================================
  // LES 4 BASTIONS URBAINS DE MONTRÉAL (2033)
  // ==========================================================================
  {
    id: 'bastion_stage_1',
    stageId: 1,
    title: 'Stage 1 : Le Vieux-Port Submergé & Silo-5',
    subtitle: 'Zone portuaire inondée, quais industriels rouillés & fermes de calcul',
    category: 'bastions',
    clearanceLevel: 1,
    date: '14 Mai 2033 - 03:42 AM',
    location: 'Quai Alexandra, Vieux-Port de Montréal (Secteur Inondé 01)',
    summary: 'Le premier bastion corporatiste contrôlant les flux maritimes et les serveurs quantiques sous-marins du Saint-Laurent.',
    content: [
      'À la suite de la montée des eaux et de la rupture des digues hydro-électriques en 2031, les quais historiques du Vieux-Port de Montréal ont été convertis en un complexe militarisé sous haute surveillance. Les anciens hangars abritent désormais les fermes de serveurs sous-marins refroidis par le fleuve Saint-Laurent contaminé.',
      'Le mastodonte de béton du Silo n°5 a été transformé en forteresse automatisée. Des escouades de drones de patrouille SPVM-Prime et des mercenaires cybernétisés arpentent les coursives métalliques pour empêcher toute tentative de piratage des câbles sous-marins transatlantiques.',
      'Neutraliser ce premier bastion permet de couper les flux de surveillance maritime et de libérer la bande passante pirate nécessaire à la Résistance Neurale.'
    ],
    audioLogTranscript: '« Ici l’Unité SPVM-09. Détection d’une signature neurale non homologuée sur le Quai King Edward. Déploiement immédiat des protocoles létaux. Aucun intrus ne doit franchir le périmètre du Silo-5. »',
    tacticalNotes: [
      'Surveillez les drones de reconnaissance rapides : ils alertent les unités lourdes.',
      'Utilisez les flaques électrifiées et l’Onde EMP pour désactiver en chaîne les blindages légers.',
      'Le boss Exécuteur SPVM-Prime dispose d’un bouclier cinétique à surcharge périodique.'
    ],
    bannerAccent: '#00f0ff',
    iconName: 'Anchor',
    unlocked: true, // Stage 1 is unlocked by default
    unlockRequirement: 'Disponible dès l’initialisation de l’incursion'
  },
  {
    id: 'bastion_stage_2',
    stageId: 2,
    title: 'Stage 2 : Les Galeries Souterraines du RÉSO & Berri-UQAM',
    subtitle: 'Labyrinthe commercial désaffecté & camp de détention biométrique',
    category: 'bastions',
    clearanceLevel: 2,
    date: '22 Juin 2033 - 11:15 PM',
    location: 'Nœud Central Berri-UQAM / Galeries Ville-Marie Souterraines',
    summary: 'Le gigantesque réseau souterrain piétonnier transformé en labyrinthe de rétention et centre de tri biométrique.',
    content: [
      'Le fameux réseau souterrain de Montréal (le RÉSO), autrefois reliant galeries marchandes et stations de métro, est désormais la plus vaste zone d’enfermement et de surveillance biométrique de l’Est canadien. Les couloirs carrelés sont tapissés de scanners rétiniens et de tourelles de répression synaptique.',
      'Les citoyens rebelles ou jugés « cognitivement instables » y sont parqués dans des cellules automatisées avant d’être soumis à des séances de reprogrammation cyber-cérébrale forcée.',
      'Infiltrer ce dédale permet de désactiver les verrous magnétiques des camps de rétention et de secourir les technomanciens prisonniers.'
    ],
    audioLogTranscript: '« Alerte de niveau 2 dans le secteur Berri. Une brèche dans le sous-réseau gamma a été détectée. Des prisonniers tentent une extraction. Envoyez le Titan Silo-5 en mode purge. »',
    tacticalNotes: [
      'Les couloirs étroits favorisent les attaques de zone comme le Trou Noir Psychique.',
      'Méfiez-vous des tireurs d’élite embusqués derrière les vitrines blindées.',
      'Le Titan Mecha utilise des charges sismiques lourdes : esquivez au moment de l’impact.'
    ],
    bannerAccent: '#39ff14',
    iconName: 'Maximize2',
    unlocked: false,
    unlockRequirement: 'Débloqué en atteignant ou en complétant le Stage 2'
  },
  {
    id: 'bastion_stage_3',
    stageId: 3,
    title: 'Stage 3 : Le Mont-Royal Millénaire & Relais Synaptiques',
    subtitle: 'Bastion fortifié d’altitude & garde prétorienne d’élite',
    category: 'bastions',
    clearanceLevel: 3,
    date: '03 Août 2033 - 01:20 AM',
    location: 'Sommet du Mont-Royal, Belvédère Kondiaronk & Croix Émettrice',
    summary: 'La colline historique sanctifiée en citadelle fortifiée abritant le réseau d’antennes de diffusion psychique.',
    content: [
      'Le parc du Mont-Royal a été totalement rasé et remplacé par une superstructure en composite de carbone et d’alliages titane. La célèbre Croix illuminée a été convertie en émetteur synaptique mégawatt, irradiant la métropole d’ondes cérébrales alpha forçant la docilité collective.',
      'Ce bastion est protégé par la Garde Prétorienne Corporatiste : des soldats génétiquement modifiés et dotés d’exosquelettes de classe Titan, insensibles à la peur et à la douleur.',
      'Détruire l’émetteur du Mont-Royal est la condition sine qua non pour rompre l’emprise mentale sur le million d’âmes prisonnières de Montréal.'
    ],
    audioLogTranscript: '« Rapport de l’antenne centrale : La pulsation synaptique est maintenue à 98.4%. Les taux de résistance civile sont en chute libre. Toute tentative d’ascension sera foudroyée par le réseau orbital. »',
    tacticalNotes: [
      'Les soldats d’élite disposent d’armures lourdes : privilégiez la pénétration de blindage.',
      'Activez le Bullet-Time dès que l’I.A. Matrice lance ses barrages de lasers rotatifs.',
      'Le boss I.A. Matrice Omnisciente projette des clones holographiques instables.'
    ],
    bannerAccent: '#ff007f',
    iconName: 'Mountain',
    unlocked: false,
    unlockRequirement: 'Débloqué en atteignant ou en complétant le Stage 3'
  },
  {
    id: 'bastion_stage_4',
    stageId: 4,
    title: 'Stage 4 : La Citadelle Orbitale de la Place Ville-Marie',
    subtitle: 'Noyau du supercalculateur central & sanctuaire de l’Architecte',
    category: 'bastions',
    clearanceLevel: 4,
    date: '29 Octobre 2033 - 04:00 AM',
    location: 'Apex de la Tour Ville-Marie, Étage 128 (Sanctuaire Nexus)',
    summary: 'Le monolithe cruciforme au cœur de la métropole, abritant le cerveau artificiel qui gouverne Montréal 2033.',
    content: [
      'S’élevant à plus de 600 mètres au-dessus du boulevard René-Lévesque, la Citadelle de la Place Ville-Marie est le centre névralgique du pouvoir autoritaire. C’est ici que réside l’Architecte de l’Asservissement, un ancien magnat de la tech ayant fusionné son cortex avec le supercalculateur quantique central.',
      'L’air y est saturé d’énergie psionique brute et de code binaire en sustentation magnétique. C’est le point zéro de la matrice de contrôle neural.',
      'Vaincre l’Architecte dans son sanctuaire effacera définitivement les registres de servitude et rendra le contrôle des implants à chaque citoyen.'
    ],
    audioLogTranscript: '« Vous êtes arrivé trop loin, anomalie. Votre esprit n’est qu’une équation imparfaite dans mon réseau parfait. Préparez-vous à la décompilation totale. » — L’Architecte',
    tacticalNotes: [
      'Combat final en phases multiples : requiert la maîtrise combinée du dash et des compétences ultimes.',
      'L’Architecte alterne entre tempêtes d’éclairs matriciels et lances télékinétiques pures.',
      'Équipez vos meilleurs implants légendaires overclockés dans la Cyber-Forge.'
    ],
    bannerAccent: '#ffaa00',
    iconName: 'Radio',
    unlocked: false,
    unlockRequirement: 'Débloqué en atteignant ou en complétant le Stage 4'
  },

  // ==========================================================================
  // FACTIONS & UNIVERS DE MONTRÉAL 2033
  // ==========================================================================
  {
    id: 'faction_protagonist',
    title: 'Dossier Protagoniste : L’Éveillé Synaptique (Néo)',
    subtitle: 'Ancien programmeur d’Omnicorp devenu hacker cyber-psionique',
    category: 'factions',
    clearanceLevel: 1,
    date: 'Archive Personnelle - Cryptage Quantum',
    location: 'Refuge Clandestin du Mile-End',
    summary: 'Le sujet zéro ayant survécu à la surcharge de l’implant neural NeuralLink-99, déclenchant des pouvoirs télékinétiques spontanés.',
    content: [
      'Né dans les quartiers industriels du Sud-Ouest de Montréal, le protagoniste travaillait comme architecte système de bas niveau pour Omnicorp. Lors d’un accident de laboratoire impliquant un prototype de processeur quantique en 2032, une décharge synaptique a éveillé des capacités latentes d’altération de la réalité.',
      'Capable de manipuler le flux de données matérielles (hacking d’urgence, surcharges EMP, altération de drones) et de projeter de la force psychique brute (lances synaptiques, distorsion temporelle, vortex gravitationnel), il est la seule arme vivante capable de percer les défenses de la corporation.'
    ],
    audioLogTranscript: '« Je ne vois plus Montréal comme des murs et des rues... Je vois les octets qui coulent à travers chaque brique, chaque caméra, chaque esprit enchaîné. Je vais tout libérer. »',
    tacticalNotes: [
      'Combinez les compétences de la branche Cyber et Psychique pour maximiser les combos de dégâts.',
      'L’animation cancel via le Dash (Espace) permet d’esquiver les attaques mortelles instantanément.'
    ],
    bannerAccent: '#00f3ff',
    iconName: 'User',
    unlocked: true,
    unlockRequirement: 'Disponible par défaut'
  },
  {
    id: 'faction_omnicorp',
    title: 'Consortium Omnicorp : Le Syndicat Gouvernemental',
    subtitle: 'La coalition militaro-industrielle au pouvoir absolu',
    category: 'factions',
    clearanceLevel: 2,
    date: 'Rapport Stratégique de la Résistance',
    location: 'Quartier Général des Affaires, Rue Saint-Jacques',
    summary: 'L’entité corporatiste qui a racheté les dettes de la ville en 2029 et instauré la loi martiale permanente.',
    content: [
      'Après les crises financières et écologiques du début des années 2030, le gouvernement municipal a fait faillite. Omnicorp a racheté la totalité des services publics : police, réseaux d’eau, hôpitaux et télécommunications.',
      'Sous couvert de « pacification urbaine », le consortium a imposé la pose obligatoire de la puce neurale Bio-ID à chaque citoyen dès l’âge de 6 ans, monétisant chaque pensée et réprimant toute idée séditieuse.'
    ],
    audioLogTranscript: '« Message d’intérêt public Omnicorp : L’obéissance est l’harmonie. Les pensées non approuvées seront pénalisées d’une retenue de 500 crédits neuraux. »',
    bannerAccent: '#ef4444',
    iconName: 'Building',
    unlocked: true,
    unlockRequirement: 'Disponible par défaut'
  },
  {
    id: 'faction_front_zero',
    title: 'Le Front Zéro : Réseau Clandestin de Résistance',
    subtitle: 'Technomanciens, cyberpunks et citoyens insoumis',
    category: 'factions',
    clearanceLevel: 2,
    date: 'Manifeste Crypté du Front Zéro',
    location: 'Canal de Lachine & Bunkers du RÉSO',
    summary: 'L’organisation secrète fournissant soutien logistique, compagnons de combat et matériel de contrebande.',
    content: [
      'Opérant depuis les catacombes désaffectées du Canal de Lachine et les tunnels oubliés du Plateau Mont-Royal, le Front Zéro regroupe des ingénieurs déserteurs, des médecins clandestins et des hacktivistes chevronnés.',
      'Ce sont eux qui fabriquent les cyber-armes expérimentales et programment les drones compagnons autonomes (Valkyrie, Hex-Sentinel, Vortex) pour assister le protagoniste dans son assaut des bastions.'
    ],
    bannerAccent: '#ff00ff',
    iconName: 'Shield',
    unlocked: true,
    unlockRequirement: 'Disponible par défaut'
  },

  // ==========================================================================
  // TECHNOLOGIES & SYSTÈMES PSIONIQUES
  // ==========================================================================
  {
    id: 'tech_cyber_forge',
    title: 'La Cyber-Forge Moléculaire & Synthèse de Nanites',
    subtitle: 'Chambre de transmutation de matière et fusion d’implants',
    category: 'technologies',
    clearanceLevel: 2,
    date: 'Manuel Technique V3.8',
    location: 'Laboratoire Itinérant de la Résistance',
    summary: 'Dispositif quantique permettant de fusionner 3 modules de même rareté en un équipement de rang supérieur.',
    content: [
      'Développée par les scientifiques renégats du Front Zéro, la Cyber-Forge utilise des impulsions magnétiques à haute fréquence pour déconstruire les composants en silicium et bio-polymères au niveau atomique.',
      'En combinant 3 implants Standard (Gris), le système synthétise un module Rare (Bleu). Trois modules Rares produisent un Épique (Violet), et trois Épiques forgent un puissant Légendaire (Orange). Trois Légendaires débloquent l’Overclock Matrix avec +45% de puissance brute.'
    ],
    tacticalNotes: [
      'Si les 3 composants fusionnés partagent le même emplacement (ex: 3 Armures), le résultat a 80% de chance de conserver cet emplacement.',
      'La fusion consomme des Nanites récupérés sur les cadavres ennemis et lors d’événements mondiaux.'
    ],
    bannerAccent: '#ff0055',
    iconName: 'Flame',
    unlocked: true,
    unlockRequirement: 'Accessible via la Forge [F]'
  },
  {
    id: 'tech_neural_matrix',
    title: 'L’Arbre Synaptique & Éveil Psionique',
    subtitle: 'Architecture biomécanique des 99 niveaux de transcendance',
    category: 'technologies',
    clearanceLevel: 3,
    date: 'Étude Neuro-Physiologique',
    location: 'Bio-Laboratoires du Mile-End',
    summary: 'La courbe de progression mathématique reliant l’expérience neuronale à l’éveil des compétences de combat.',
    content: [
      'Chaque ennemi abattu libère un paquet de données résiduelles que le hacker absorbe via son cortex. La progression suit une courbe exponentielle stricte : EXP requise = Base * Level^2.4.',
      'La branche Cyber-Hacking spécialise le joueur dans les dégâts d’altération, la réduction des temps de recharge et la détonation EMP, tandis que la branche Psychique amplifie la puissance d’impact cinétique, les coups critiques et le vortex gravitationnel.'
    ],
    bannerAccent: '#f2994a',
    iconName: 'Cpu',
    unlocked: true,
    unlockRequirement: 'Accessible via les Compétences [K]'
  },
  {
    id: 'tech_weapon_skins',
    title: 'Projections Holographiques & Textures d’Armes',
    subtitle: 'Personnalisation visuelle et shaders de plasma matriciel',
    category: 'technologies',
    clearanceLevel: 1,
    date: 'Protocole de Rendu Photonique',
    location: 'Atelier de Personnalisation',
    summary: 'Modules de réfraction photonique modifiant l’apparence et les traînées de plasma des armes équipées.',
    content: [
      'Les combattants de Montréal 2033 utilisent des émetteurs de photons cohérents pour recouvrir leurs lames en carbure de tungstène de textures holographiques uniques.',
      'Ces apparences (Katana Cyan, Faucheuse du Néant, Épée Solaire, Muramasa Écarlate, Lame Matrix...) modifient l’esthétique et les particules d’impact sans altérer les caractéristiques d’attaque de l’arme.'
    ],
    bannerAccent: '#00ff41',
    iconName: 'Sword',
    unlocked: true,
    unlockRequirement: 'Accessible via le menu Personnage [C] / Skins'
  },

  // ==========================================================================
  // DOSSIERS DE CIBLES (BOSSES ET ENNEMIS)
  // ==========================================================================
  {
    id: 'target_spvm_prime',
    title: 'Cible : Exécuteur SPVM-Prime',
    subtitle: 'Droïde de répression automatisé de classe Alpha',
    category: 'targets',
    clearanceLevel: 1,
    date: 'Fiche d’Intervention SPVM',
    location: 'Vieux-Port de Montréal',
    summary: 'L’unité de maintien de l’ordre la plus lourdement blindée patrouillant le littoral de Montréal.',
    content: [
      'Conçu par les usines de robotique d’Omnicorp, l’Exécuteur Prime est équipé d’un double canon laser à tir rapide et d’une barrière thermique absorbante.',
      'Il est programmé pour identifier et exécuter sommairement tout individu porteur d’un implant non enregistré.'
    ],
    tacticalNotes: [
      'Sensible aux attaques psioniques et aux décharges EMP qui désactivent temporairement son bouclier.',
      'Maintenez une distance moyenne pour esquiver son tir de barrage rotatif.'
    ],
    bannerAccent: '#00f0ff',
    iconName: 'Crosshair',
    unlocked: true,
    unlockRequirement: 'Découvert au Stage 1'
  },
  {
    id: 'target_titan_silo5',
    title: 'Cible : Titan Quantique Silo-5',
    subtitle: 'Mecha blindé de défense portuaire et souterraine',
    category: 'targets',
    clearanceLevel: 2,
    date: 'Schéma Technique Industriel',
    location: 'Sous-sols du Silo n°5 & RÉSO',
    summary: 'Châssis quadrupède lourd équipé de marteaux pneumatiques sismiques et de blindage réactif.',
    content: [
      'Initialement conçu pour le concassage de béton et de conteneurs, le Titan Silo-5 a été réarmé avec des plaques de blindage en céramique balistique et des canons à impulsion cinétique.',
      'Chaque pas qu’il fait ébranle les fondations des galeries souterraines.'
    ],
    tacticalNotes: [
      'Effectuez un dash au moment précis où il lève ses pistons pour éviter l’onde de choc au sol.',
      'Attaquez ses condensateurs arrières pendant la phase de refroidissement.'
    ],
    bannerAccent: '#39ff14',
    iconName: 'ShieldAlert',
    unlocked: false,
    unlockRequirement: 'Découvert au Stage 2'
  },
  {
    id: 'target_matrice_ai',
    title: 'Cible : I.A. Matrice Omnisciente',
    subtitle: 'Supercalculateur central de surveillance biopouvoir',
    category: 'targets',
    clearanceLevel: 3,
    date: 'Rapport d’Infiltration Neurale',
    location: 'Antennes du Mont-Royal & Tour Ville-Marie',
    summary: 'L’intelligence artificielle autonome coordonnant les milliers de caméras et de drones de Montréal.',
    content: [
      'Alimentée par un cœur de fusion miniature, la Matrice calcule en temps réel les probabilités d’insurrection urbaine et ordonne des frappes préventives sur les cellules de résistants.',
      'En combat, elle se matérialise sous la forme d’avatars d’énergie pure projetant des faisceaux photoniques convergents.'
    ],
    tacticalNotes: [
      'Détruisez les modules de recharge holographiques avant qu’elle ne régénère son bouclier.',
      'Utilisez le Bullet-Time pour passer à travers ses réseaux de lasers fixes.'
    ],
    bannerAccent: '#ff007f',
    iconName: 'Radio',
    unlocked: false,
    unlockRequirement: 'Découvert au Stage 3'
  },
  {
    id: 'target_architecte',
    title: 'Cible Finale : L’Architecte de l’Asservissement',
    subtitle: 'Maître du réseau neural & dictateur cybernétique',
    category: 'targets',
    clearanceLevel: 4,
    date: 'Dossier Noir - Secret Défense Absolu',
    location: 'Sanctuaire Nexus, Sommet Place Ville-Marie',
    summary: 'L’entité cyborg suprême ayant transcendé la condition humaine pour devenir le maître absolu de la métropole.',
    content: [
      'Autrefois PDG visionnaire d’Omnicorp, l’Architecte a transféré son âme et ses souvenirs dans un processeur quantique à 10 000 qubits.',
      'Il contrôle directement chaque drone, chaque feu de circulation et chaque implant neural de Montréal. Sa défaite est l’unique espoir de restaurer la liberté du peuple.'
    ],
    tacticalNotes: [
      'Affrontement titanesque nécessitant un équipement de rang Épique ou Légendaire complet.',
      'Esquivez ses frappes orbitales et conservez vos points d’Énergie Psychique pour le vortex final.'
    ],
    bannerAccent: '#ffaa00',
    iconName: 'Zap',
    unlocked: false,
    unlockRequirement: 'Découvert au Stage 4'
  }
];

export function evaluateCodexUnlocks(
  entries: CodexEntry[],
  currentStageId: number,
  defeatedBosses?: Set<string> | string[] | number,
  highestStageReachedOrDifficulty?: number
): CodexEntry[] {
  let bossSet = new Set<string>();
  let highestStage = currentStageId;

  if (typeof defeatedBosses === 'number') {
    highestStage = Math.max(highestStage, defeatedBosses);
  } else if (defeatedBosses instanceof Set) {
    bossSet = defeatedBosses;
  } else if (Array.isArray(defeatedBosses)) {
    bossSet = new Set(defeatedBosses);
  }

  if (typeof highestStageReachedOrDifficulty === 'number') {
    highestStage = Math.max(highestStage, highestStageReachedOrDifficulty);
  }

  return entries.map((entry) => {
    let shouldUnlock = entry.unlocked;

    if (entry.stageId) {
      if (highestStage >= entry.stageId || currentStageId >= entry.stageId) {
        shouldUnlock = true;
      }
    }

    if (entry.id === 'bastion_stage_2' || entry.id === 'target_titan_silo5') {
      if (
        highestStage >= 2 || 
        currentStageId >= 2 || 
        bossSet.has('Exécuteur SPVM-Prime') || 
        bossSet.has('boss_stage_1') || 
        bossSet.has('Vieux-Port')
      ) {
        shouldUnlock = true;
      }
    }

    if (entry.id === 'bastion_stage_3' || entry.id === 'target_matrice_ai') {
      if (
        highestStage >= 3 || 
        currentStageId >= 3 || 
        bossSet.has('Titan Quantique Silo-5') || 
        bossSet.has('boss_stage_2') || 
        bossSet.has('Galeries Souterraines')
      ) {
        shouldUnlock = true;
      }
    }

    if (entry.id === 'bastion_stage_4' || entry.id === 'target_architecte') {
      if (
        highestStage >= 4 || 
        currentStageId >= 4 || 
        bossSet.has('I.A. Matrice Omnisciente') || 
        bossSet.has('boss_stage_3') || 
        bossSet.has('Mont-Royal')
      ) {
        shouldUnlock = true;
      }
    }

    return {
      ...entry,
      unlocked: shouldUnlock,
      unlockedAt: shouldUnlock && !entry.unlockedAt ? Date.now() : entry.unlockedAt
    };
  });
}
