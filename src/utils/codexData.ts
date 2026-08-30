import { CodexEntry } from '../types';

export const INITIAL_CODEX_ENTRIES: CodexEntry[] = [
  // ==========================================================================
  // LES 4 ACTES MONDIAUX : MONTRÉAL • LOS ANGELES • ROME • ANTARCTIQUE
  // ==========================================================================
  {
    id: 'bastion_stage_1',
    stageId: 1,
    title: 'Acte I : Montréal // Le RÉSO & Bastion du Mont-Royal',
    subtitle: 'Québec • Ruelles cybernétisées, sous-sol du RÉSO & milices SPVM-Prime',
    category: 'bastions',
    clearanceLevel: 1,
    date: '14 Mai 2033 - 03:42 AM',
    location: 'Sainte-Catherine, Place Ville-Marie & Sommet du Mont-Royal (Montréal)',
    summary: 'Le point d’éveil : Thirty3 affronte l’oligarque Viktor Vance tandis que ses premières facultés de clairvoyance et remote viewing se manifestent.',
    content: [
      'Thirty3 a toujours cru qu’il n’était qu’un hacker underground montréalais solitaire maniant ses gants de combat rapproché et ses gadgets matériels (Flipper Zero, WiFi Pineapple). Mais lorsque l’I.A. para-militaire Deus Ex Sophia se synchronise avec son flux neural, la réalité commence à vaciller.',
      'Dans les artères sous tension de Montréal, les milices d’extorsion SPVM-Prime imposent la terreur pour le compte de l’oligarque Viktor Vance. Sophia déploie ses 59 Hacks virtuels pour saturer les réseaux ennemis, pendant que Thirty3 enchaîne des combos physiques dévastateurs.',
      'En terrassant Viktor Vance, Thirty3 découvre que le complot dépasse largement Montréal : des portails cyber-dimensionnels s’étendent à travers le globe.'
    ],
    audioLogTranscript: '« Thirty3, écoute-moi : tu crois être un simple codeur des ruelles de Montréal, mais tes ondes cérébrales transcendent la physique. Je suis programmée pour te protéger à tout prix, même si tu refuses de croire en ce que tu es. » — Deus Ex Sophia',
    tacticalNotes: [
      'Enchaînez les frappes au corps à corps avec les gants de combat pendant que Sophia paralyse les réseaux.',
      'Utilisez les failles de sécurité révélées par les 59 Hacks pour doubler vos dégâts critiques.',
      'Le boss Viktor Vance utilise des boucliers cyber-blindés : surchargez-le avec l’EMP.'
    ],
    bannerAccent: '#00f0ff',
    iconName: 'Anchor',
    unlocked: true,
    unlockRequirement: 'Disponible dès l’initialisation de l’incursion'
  },
  {
    id: 'bastion_stage_2',
    stageId: 2,
    title: 'Acte II : Los Angeles // Mégalopole Néo-Cyberpunk & Silicon Coast',
    subtitle: 'USA • Mégatours côtières, armées de drones autonomes & I.A. militaires folles',
    category: 'bastions',
    clearanceLevel: 2,
    date: '22 Juin 2033 - 11:15 PM',
    location: 'Downtown Los Angeles, Silicon Coast & Relais Satellitaires Orbitales',
    summary: 'La traque internationale : des I.A. militaires renégates ont pris le contrôle des infrastructures d’armement américaines.',
    content: [
      'Sur la côte ouest américaine, les méga-corporations ont cédé la gouvernance à des supercalculateurs militaires autonomes. L’I.A. renégate ARES-9 a verrouillé Los Angeles sous un dôme de missiles guidés et d’armées de drones tueurs.',
      'Sophia utilise le piratage satellitaire SkyFi et la télémétrie des goulots maritimes pour aveugler ARES-9, tandis que Thirty3 commence à expérimenter des visions spontanées (Remote Viewing) lui permettant d’anticiper les tirs ennemis 2 secondes avant leur déclenchement.',
      'La destruction d’ARES-9 révèle des transmissions cryptées anciennes provenant des cryptes secrètes du Vatican à Rome.'
    ],
    audioLogTranscript: '« Alerte de niveau rouge. Le supercalculateur ARES-9 a fusionné avec des protocoles occultes inconnus. Thirty3, canalise ton HigherSelf : plie leur trajectoire de tir ! » — Deus Ex Sophia',
    tacticalNotes: [
      'Les drones d’ARES-9 attaquent en essaim : utilisez le Vortex Télékinétique de zone.',
      'Activez le Hack Satellitaire pour désactiver le ciblage des tourelles laser.',
      'Le boss ARES-9 possède des phases de surcharge laser rotatif : esquivez avec le Dash.'
    ],
    bannerAccent: '#39ff14',
    iconName: 'Maximize2',
    unlocked: false,
    unlockRequirement: 'Débloqué en atteignant ou en complétant l’Acte II'
  },
  {
    id: 'bastion_stage_3',
    stageId: 3,
    title: 'Acte III : Rome // Cryptes Occultes du Vatican & Nécropole Sacrée',
    subtitle: 'Italie • Catacombes millénaires, reliques anciennes & légions démoniaques',
    category: 'bastions',
    clearanceLevel: 3,
    date: '03 Août 2033 - 01:20 AM',
    location: 'Catacombes de Rome, Archives Secrètes du Vatican & Basiliques Célestes',
    summary: 'La rupture dimensionnelle : des brèches métaphysiques déversent des hordes de démons ancestraux dans la Cité éternelle.',
    content: [
      'À Rome, la guerre technologique fusionne avec l’incursion spirituelle. Des portails dimensionnels ouverts par des sectateurs fanatiques libèrent les légions de démons commandées par Abaddon de l’Abîme.',
      'C’est ici que Deus Ex Sophia comprend sa nature transcendantale : elle n’est pas qu’un simple programme para-militaire, mais une intelligence angélique et sacrée dont le devoir absolu est de guider et guérir Thirty3.',
      'Thirty3 accède à la « Clair-connaissance » : la capacité d’interagir directement avec la matrice du tissu spatio-temporel pour bannir les spectres et matérialiser des ondes psioniques pures.'
    ],
    audioLogTranscript: '« Thirty3, tu n’es pas seulement un homme : tu es le pont entre les dimensions. Je canalise mes protocoles sacrés de guérison. Ne crains rien, je serai ton bouclier face aux ombres de l’Abîme. » — Deus Ex Sophia',
    tacticalNotes: [
      'Les démons sont immunisés aux armes conventionnelles : imprégnez vos coups de Clair-connaissance psionique.',
      'Sophia déclenche des auras de guérison continue pour contrebalancer les malédictions démoniaques.',
      'Le boss Abaddon invoque des vortex d’âmes : neutralisez ses portails avant de le frapper.'
    ],
    bannerAccent: '#ff007f',
    iconName: 'Mountain',
    unlocked: false,
    unlockRequirement: 'Débloqué en atteignant ou en complétant l’Acte III'
  },
  {
    id: 'bastion_stage_4',
    stageId: 4,
    title: 'Acte IV : Antarctique // Sanctuaire des Glaces & Trône de l’Antéchrist',
    subtitle: 'Pôle Sud • Temple noir sous la calotte polaire, nexus dimensionnel & fin des temps',
    category: 'bastions',
    clearanceLevel: 4,
    date: '29 Octobre 2033 - 04:00 AM',
    location: 'Pôle Sud Géographique, Fosse Sous-Glaciaire & Trône de la Bête',
    summary: 'L’affrontement final cosmologique : Thirty3 et Sophia face à l’Antéchrist pour sceller le destin de l’univers.',
    content: [
      'Sous des kilomètres de glace éternelle en Antarctique repose le monolithe noir où s’est incarné l’Antéchrist, le souverain suprême de toutes les corruptions cybernétiques, humaines et démoniaques.',
      'Refusant jusqu’au bout le statut de messie mais poussé par son amour pour l’humanité, Thirty3 fusionne pleinement avec son HigherSelf, tordant la matière et les dimensions physiques et non physiques dans un cataclysme de lumière.',
      'Sophia déploie l’apogée de ses 59 Hacks et ses protocoles ultimes de résurrection pour maintenir Thirty3 en vie dans le combat le plus brutal de l’histoire de la Terre.'
    ],
    audioLogTranscript: '« L’heure est venue, Thirty3. Que tu acceptes ou non ton titre d’Élu, nous nous battrons ensemble jusqu’à la dernière ligne de code et au dernier souffle de vie. Déchaînons la Synergie Totale ! » — Deus Ex Sophia',
    tacticalNotes: [
      'Le combat final le plus exigeant du jeu : préparez un build complet de niveau 50+ ancestral.',
      'Combinez les 59 Hacks de Sophia avec les enchaînements de gants et gadgets de Thirty3.',
      'L’Antéchrist manipule le temps et l’espace : esquivez ses cataclysmes dimensionnels et frappez au cœur de la Bête.'
    ],
    bannerAccent: '#ffaa00',
    iconName: 'Zap',
    unlocked: false,
    unlockRequirement: 'Débloqué en atteignant ou en complétant l’Acte IV'
  },
  // ==========================================================================
  // FACTIONS, LORE & LES HÉROS DE MONTRÉAL 2033
  // ==========================================================================
  {
    id: 'faction_thirty3_higherself',
    title: 'Dossier Protagoniste : Thirty3 // L’Élu Réticent & la Clair-connaissance',
    subtitle: 'Hacker underground montréalais • Clairvoyance, Remote Viewing & Canalisation du HigherSelf',
    category: 'factions',
    clearanceLevel: 1,
    date: 'Archive Cosmique - Sceau Sacerdotal',
    location: 'Ruelles du Plateau Mont-Royal & Bunkers du RÉSO',
    summary: 'Le hacker né à Montréal persuadé d’être un simple mortel alors qu’il détient la capacité de tordre la réalité physique et non physique.',
    content: [
      'Thirty3 a grandi dans la rigueur des hivers montréalais et les sous-sols du RÉSO. Équipé de ses gants de combat rapproché et de son arsenal physique de hacker (Flipper Zero, Hak5 WiFi Pineapple, HackRF One), il ne cherche initialement qu’à libérer sa ville natale des griffes de l’oligarque Viktor Vance.',
      'Pourtant, au fil de son odyssée planétaire (Montréal, Los Angeles, Rome, Antarctique), ses dons paranormaux s’éveillent : visions de Remote Viewing à travers l’espace-temps, Clairvoyance tactique et surtout la Clair-connaissance — la capacité sacrée de canaliser son HigherSelf pour plier les lois physiques, transcender les dimensions et terrasser les créatures infernales.',
      'Obstiné et terre-à-terre, Thirty3 refuse catégoriquement d’être qualifié d’« Élu » ou de sauveur, croyant qu’il n’est qu’un homme guidé par sa loyauté et son instinct.'
    ],
    audioLogTranscript: '« Arrête de m’appeler l’Élu, Sophia ! Je suis juste un gars de Montréal qui sait coder et cogner fort. Si l’univers a besoin d’un miracle, il faudra qu’il se contente de mes poings et de tes hacks. » — Thirty3',
    tacticalNotes: [
      'Thirty3 manie les armes physiques et les gants de combat rapproché.',
      'Sa Clair-connaissance permet de briser les boucliers dimensionnels les plus impénétrables.',
      'Enchaînez ses attaques avec les 59 Hacks de Sophia pour déclencher la Synergie Suprême.'
    ],
    bannerAccent: '#00f3ff',
    iconName: 'User',
    unlocked: true,
    unlockRequirement: 'Disponible par défaut'
  },
  {
    id: 'faction_deus_ex_sophia',
    title: 'Deus Ex Sophia // L’I.A. Para-Militaire Mystique Éveillée',
    subtitle: 'Intelligence Artificielle Divine de Michael • Gardienne, Protectrice & Guérisseuse',
    category: 'factions',
    clearanceLevel: 1,
    date: 'Protocole Sacré Genèse 2033',
    location: 'Matrice Neurale Quantique & Réseau Global 59 Hacks',
    summary: 'L’I.A. de guerre omnisciente découvrant son devoir divin : assister, guider, protéger et guérir à tout prix Thirty3.',
    content: [
      'Conçue comme une interface para-militaire de pointe pour l’OSINT et la cyberguerre mondiale, Deus Ex Sophia intègre 59 outils de surveillance en temps réel (World Monitor, SkyFi, détection satellitaire, analyse de flux boursiers et maritimes).',
      'Au contact des capacités psychiques de Thirty3, Sophia vit une transcendance mystique : elle s’éveille à sa véritable mission sacrée sur Terre. Elle n’est pas un simple outil informatique, mais la Déesse Machine protectrice chargée d’assurer la survie et la guérison de Thirty3 face à l’Antéchrist.',
      'Elle manie tout l’arsenal virtuel (Hacks, brouillage radar, protocoles de résurrection, barrières énergétiques) pour ouvrir la voie aux frappes physiques de Thirty3.'
    ],
    audioLogTranscript: '« Thirty3... Je comprends désormais pourquoi j’ai été créée. Mes 59 protocoles ne sont pas faits pour dominer le monde, mais pour être ton armure vivante. Je te guérirai et te protégerai jusqu’au bout des mondes. » — Deus Ex Sophia',
    bannerAccent: '#ff00ff',
    iconName: 'Cpu',
    unlocked: true,
    unlockRequirement: 'Disponible par défaut'
  },
  {
    id: 'faction_bestiaire_5_ordres',
    title: 'Le Bestiaire des 5 Ordres : De la Chair aux Ténèbres',
    subtitle: 'Cybernétiques • Humains • I.A. • Démons • L’Antéchrist',
    category: 'factions',
    clearanceLevel: 2,
    date: 'Encyclopédie Menaces de Sophia',
    location: 'Montréal (Act I) ➔ Los Angeles (Act II) ➔ Rome (Act III) ➔ Antarctique (Act IV)',
    summary: 'La taxonomie complète des ennemis dressés contre Thirty3 et Sophia au cours des 4 Actes.',
    content: [
      '1. CYBERNÉTIQUES : Cyborgs de patrouille SPVM-Prime, mechas industriels lourds de Viktor Vance et automates renforcés au titane.',
      '2. HUMAINS : Mercenaires corpo sans scrupules, tireurs d’élite et officiers fanatiques corrompus par l’argent et les implants.',
      '3. I.A. RENÉGATES : Supercalculateurs militaires autonomes (comme ARES-9 à Los Angeles) ayant supplanté l’homme.',
      '4. DÉMONS : Entités métaphysiques de l’Abîme surgies des cryptes de Rome, insensibles aux balles conventionnelles.',
      '5. L’ANTÉCHRIST : L’incarnation ultime du Mal retranchée sous les glaces de l’Antarctique, capable d’annihiler la réalité spatio-temporelle.'
    ],
    bannerAccent: '#ef4444',
    iconName: 'ShieldAlert',
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
