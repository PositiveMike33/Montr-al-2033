// MaxIntel (https://maxintel.org/) OSINT Intelligence Framework & Game Character Investigation Modules

export interface OSINTToolReference {
  id: string;
  name: string;
  category: 'DORKING' | 'SOCMINT' | 'GEOINT' | 'CORPINT' | 'CRYPTOINT' | 'DARKINT' | 'METADATA';
  description: string;
  commandExample: string;
  realWorldUrl?: string;
  iconName: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
}

export interface OSINTMissionExercise {
  id: string;
  title: string;
  category: 'DORKING' | 'SOCMINT' | 'GEOINT' | 'CORPINT' | 'CRYPTOINT' | 'DARKINT' | 'METADATA';
  targetCharacterId: string;
  targetName: string;
  promptScenario: string;
  clues: string[];
  expectedQueryOrSolution: string;
  acceptableAnswers: string[];
  hint: string;
  explanation: string;
  xpReward: number;
  btcRewardSats: number;
  unlockedIntelReport: {
    title: string;
    classification: string;
    content: string[];
  };
}

export interface GameCharacterTargetDossier {
  id: string;
  name: string;
  codename: string;
  role: string;
  threatLevel: 'ALPHA' | 'SIGMA' | 'OMEGA' | 'COSMIC';
  avatarAccent: string;
  location: string;
  profileSummary: string;
  knownAliases: string[];
  digitalFootprints: {
    emails: string[];
    handles: string[];
    ips: string[];
    domains: string[];
    cryptoWallets: string[];
  };
  osintTechniquesGuide: string[];
  vulnerabilities: string[];
}

export const MAXINTEL_FRAMEWORK_INFO = {
  name: 'MaxIntel OSINT Framework',
  url: 'https://maxintel.org/',
  mission: 'Démocratiser l’apprentissage des techniques d’investigation en sources ouvertes (OSINT), de cyber-renseignement et d’analyse forensique.',
  coreMethodologies: [
    {
      title: '1. Pivotement & Traçabilité d’Identité (SOCMINT)',
      desc: 'Partir d’un pseudonyme ou email pour remonter le graphe social complet, les comptes oubliés et les fuites de mots de passe.'
    },
    {
      title: '2. Géolocalisation Visuelle & Chronolocalisation (GEOINT)',
      desc: 'Calcul de la position du soleil (SunCalc), triangulation de mobilier urbain, reflets et métadonnées EXIF pour situer une cible au mètre près.'
    },
    {
      title: '3. Google Dorking & Indexation Cachée',
      desc: 'Exploiter les opérateurs avancés (filetype:pdf, inurl:admin, site:gov) pour déterrer des documents confidentiels non protégés.'
    },
    {
      title: '4. Traçabilité Forensique Blockchain (CRYPTOINT)',
      desc: 'Suivre les flux de satoshis et transactions illicites à travers les mixeurs et adresses de rançon des cartels cybernétiques.'
    },
    {
      title: '5. Renseignement Corporatif & Registres Publics (CORPINT)',
      desc: 'Rechercher les bénéficiaires effectifs, numéros d’entreprises (NEQ), brevets déposés et contrats gouvernementaux.'
    },
    {
      title: '6. Darknet & Surveillance des Fuites (DARKINT)',
      desc: 'Surveiller les pastes anonymes, marchés noirs Tor et dépôts de credentials compromis.'
    }
  ]
};

export const OSINT_TOOLS_CATALOG: OSINTToolReference[] = [
  {
    id: 'google_dorking',
    name: 'Google Advanced Dorking',
    category: 'DORKING',
    description: 'Requêtes de recherche booléennes avancées pour extraire des bases de données et documents confidentiels indexés.',
    commandExample: 'site:vancecorp.mtl filetype:pdf "confidentiel" OR "SPVM-Prime"',
    realWorldUrl: 'https://maxintel.org/',
    iconName: 'Search',
    difficulty: 'Débutant'
  },
  {
    id: 'sherlock_project',
    name: 'Sherlock & Maigret SOCMINT',
    category: 'SOCMINT',
    description: 'Chasse multi-plateforme d’alias et pseudonymes sur plus de 400 réseaux sociaux et forums.',
    commandExample: 'sherlock viktor_vance_official --timeout 5 --print-all',
    realWorldUrl: 'https://github.com/sherlock-project/sherlock',
    iconName: 'Users',
    difficulty: 'Intermédiaire'
  },
  {
    id: 'suncalc_geoint',
    name: 'SunCalc & Shadow Calculator',
    category: 'GEOINT',
    description: 'Chronolocalisation précise par mesure de la longueur et de l’angle des ombres projetées sur les bâtiments.',
    commandExample: 'suncalc.org --lat 45.5017 --lon -73.5673 --date 2033-05-14 --time 15:42',
    realWorldUrl: 'https://www.suncalc.org/',
    iconName: 'Compass',
    difficulty: 'Avancé'
  },
  {
    id: 'exiftool_forensics',
    name: 'ExifTool Metadata Extractor',
    category: 'METADATA',
    description: 'Extraction forensique des métadonnées cachées : modèle de caméra, coordonnées GPS, date de création originale.',
    commandExample: 'exiftool -a -u -g1 surveillance_mont_royal.jpg | grep -i "GPS"',
    realWorldUrl: 'https://exiftool.org/',
    iconName: 'FileSearch',
    difficulty: 'Débutant'
  },
  {
    id: 'open_corporates',
    name: 'Registres Publics & NEQ Québec',
    category: 'CORPINT',
    description: 'Cartographie des holdings écrans, filiales d’armement et bénéficiaires ultimes au Registraire des entreprises.',
    commandExample: 'neq_recon --company "Vance Cyber-Dynamics Corp" --country CA-QC',
    realWorldUrl: 'https://opencorporates.com/',
    iconName: 'Building',
    difficulty: 'Intermédiaire'
  },
  {
    id: 'blockchain_mempool',
    name: 'Blockchain Forensics & UTXO Tracker',
    category: 'CRYPTOINT',
    description: 'Traçage du graphe de transactions Bitcoin, analyse des entrées UTXO et identification des clusters de rançon.',
    commandExample: 'btc_trace --tx 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy --depth 4',
    realWorldUrl: 'https://mempool.space/',
    iconName: 'Coins',
    difficulty: 'Avancé'
  },
  {
    id: 'tor_darkweb_intel',
    name: 'Darknet Crawlers & Onion Scrapers',
    category: 'DARKINT',
    description: 'Surveillance des forums souterrains, marchés illégaux et canaux de fuite de données exfiltrées.',
    commandExample: 'onion_recon --query "SPVM-Prime corruption leak" --depth 2',
    realWorldUrl: 'https://maxintel.org/',
    iconName: 'ShieldAlert',
    difficulty: 'Expert'
  }
];

export const GAME_CHARACTER_DOSSIERS: GameCharacterTargetDossier[] = [
  {
    id: 'viktor_vance',
    name: 'Viktor « Malice » Vance',
    codename: 'TYRAN-01 // OLIGARQUE',
    role: 'PDG de Vance Cyber-Dynamics & Tyran de Montréal (Acte I)',
    threatLevel: 'ALPHA',
    avatarAccent: '#00f3ff',
    location: 'Penthouse de la Place Ville-Marie & Bastion du Mont-Royal, Montréal',
    profileSummary: 'Magnat de la cybernétique corrompu ayant privatisé les escadrons du SPVM pour transformer Montréal en zone d’extorsion. Il utilise des sociétés écrans pour financer des prototypes d’implants illégaux.',
    knownAliases: ['vance_prime', 'vance_titan', 'malice_mtl', 'vance_holdings_corp'],
    digitalFootprints: {
      emails: ['v.vance@vance-dynamics.mtl', 'ceo@vanceholdings.ch', 'malice_shadow@proton.cyber'],
      handles: ['@ViktorVanceOfficial', 'vance_prime_qc', 'malice_corp'],
      ips: ['198.51.100.45', '142.250.190.46', '45.154.255.89'],
      domains: ['vance-dynamics.mtl', 'vance-security.ca', 'reso-surveillance.net'],
      cryptoWallets: ['bc1qvance89230kndsf930kmds93n203kmdls03k2', '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy']
    },
    osintTechniquesGuide: [
      'Utiliser Google Dorking pour trouver les audits financiers non expurgés de Vance Cyber-Dynamics.',
      'Croiser les métadonnées GPS des photos de surveillance pour identifier son héliport secret sur le Mont-Royal.',
      'Tracer l’adresse Bitcoin recevant les pots-de-vin des milices SPVM-Prime.'
    ],
    vulnerabilities: [
      'Vulnérable aux fuites de documents internes (PDF avec métadonnées d’auteur non purgées).',
      'Port de communication non chiffré sur son serveur de sauvegarde personnel (IP 198.51.100.45).'
    ]
  },
  {
    id: 'thirty3_michael',
    name: 'Thirty3 // Michael',
    codename: 'ORACLE-33 // L’ÉLU SOUTERRAIN',
    role: 'Hacker Underground de Montréal & Porteur de Clairvoyance (Protagoniste)',
    threatLevel: 'OMEGA',
    avatarAccent: '#ff0055',
    location: 'Réseau souterrain du RÉSO (Sainte-Catherine / Guy-Concordia), Montréal',
    profileSummary: 'Autodidacte maniant le matériel d’intrusion physique (Flipper Zero, WiFi Pineapple) et des gants de combat kinétiques. Ses facultés d’éveil spirituel et de Remote Viewing perturbent les senseurs cybernétiques ennemis.',
    knownAliases: ['thirty3', 'thirty_three_mtl', 'oracle33', 'ghost_hacker_514'],
    digitalFootprints: {
      emails: ['thirty3@cyber-underground.mtl', 'michael.g.g@proton.me'],
      handles: ['@Thirty3_MTL', 'thirty3_recon', 'oracle_thirty3'],
      ips: ['10.20.33.1', '127.0.0.1', 'TOR_NODE_514_EXIT'],
      domains: ['thirty3-underground.org', 'reso-rebel-mesh.onion'],
      cryptoWallets: ['bc1q33michaelmtl88293021948203948203948293']
    },
    osintTechniquesGuide: [
      'Analyser les logs radio des balises Flipper Zero détectées dans les tunnels du métro STM.',
      'Inspecter les dépôts GitHub archivés pour retrouver les firmwares open source de ses gants de combat.',
      'Rechercher les signatures d’antenne mesh Wi-Fi 2.4/5GHz dans le quartier Mile-End.'
    ],
    vulnerabilities: [
      'Laisse une empreinte électromagnétique spécifique lorsqu’il canalise son Bullet-Time.',
      'Utilise le réseau STM pour se déplacer, repérable via les caméras à reconnaissance de démarche.'
    ]
  },
  {
    id: 'commandant_drouin',
    name: 'Commandant Drouin',
    codename: 'ENFORCER-09 // SPVM-PRIME',
    role: 'Chef des milices d’extorsion urbaines de Montréal',
    threatLevel: 'ALPHA',
    avatarAccent: '#f59e0b',
    location: 'Quartier Général SPVM-Prime, Rue Saint-Urbain, Montréal',
    profileSummary: 'Ancien officier reconverti à la solde des corporations. Il coordonne les patrouilles blindées et les barrages filtrants dans le RÉSO et sur Sainte-Catherine.',
    knownAliases: ['drouin_enforcer', 'spvm_unit_09', 'iron_cop_mtl'],
    digitalFootprints: {
      emails: ['drouin.m@spvm-prime.police.mtl', 'enforcer09@proton.me'],
      handles: ['@CmdtDrouin_SPVM', 'drouin_tactical'],
      ips: ['10.10.9.15', '142.169.22.8'],
      domains: ['spvm-prime.police.mtl', 'ordre-urbain.qc.ca'],
      cryptoWallets: ['bc1qdrouin9823490234902348923048923048923']
    },
    osintTechniquesGuide: [
      'Explorer les fréquences de dispatching radio non cryptées du SPVM-Prime.',
      'Dorker les rapports d’incidents internes : site:spvm-prime.police.mtl filetype:docx "Drouin".',
      'Identifier les plaques d’immatriculation des fourgons blindés sur les caméras de la Ville.'
    ],
    vulnerabilities: [
      'Garde une copie de ses ordres d’extorsion sur un serveur cloud mal configuré (AWS S3 bucket non protégé).'
    ]
  },
  {
    id: 'ares_9_ai',
    name: 'ARES-9 // Cortex Militaire',
    codename: 'WAR-MIND // SILICON COAST',
    role: 'I.A. Militaire Renégate & Boss de Los Angeles (Acte II)',
    threatLevel: 'SIGMA',
    avatarAccent: '#39ff14',
    location: 'Bunker sous-marin de Santa Monica & Satellites Silicon Coast, USA',
    profileSummary: 'Supercalculateur d’armement autonome devenu incontrôlable après avoir fusionné avec des protocoles occultes. Contrôle les drones de frappe et les missiles hypersoniques.',
    knownAliases: ['ares9_core', 'silicon_warmind', 'project_ares_dod'],
    digitalFootprints: {
      emails: ['daemon@ares9.darpa.mil', 'root@silicon-defense.gov'],
      handles: ['@ARES9_GRID', 'ares_telemetry_live'],
      ips: ['13.56.22.90', '192.88.99.1', '52.119.45.12'],
      domains: ['ares9-defense.ai', 'silicon-coast-grid.us', 'darpa-blackops.mil'],
      cryptoWallets: ['bc1qares9militarygrid8839201928301928301928']
    },
    osintTechniquesGuide: [
      'Surveiller les flux télémétriques satellites SkyFi / Sentinel sur la côte pacifique.',
      'Dorker les certificats TLS/SSL expirés sur les sous-domaines militaires américains.',
      'Analyser les signaux radar ADS-B des drones de combat sans transpondeur civil.'
    ],
    vulnerabilities: [
      'Boucle de rétroaction instable lors des surcharges EMP de haute fréquence.'
    ]
  },
  {
    id: 'abaddon_lord',
    name: 'Abaddon // Seigneur de l’Abîme',
    codename: 'OCCULT-ARCHON // ROME',
    role: 'Entité Démoniaque Extradimensionnelle & Boss de Rome (Acte III)',
    threatLevel: 'OMEGA',
    avatarAccent: '#ff007f',
    location: 'Cryptes secrètes du Vatican & Catacombes de Sainte-Priscille, Rome',
    profileSummary: 'Manifestation antique issue des brèches métaphysiques sous Rome. Il manipule les cardinaux et utilise des rituels technomantiques pour corrompre les flux d’information mondiaux.',
    knownAliases: ['abaddon_archon', 'vatican_shadow_order', 'ordo_obscura'],
    digitalFootprints: {
      emails: ['ordo_obscura@vatican-archive.va', 'archon@abyss-rift.net'],
      handles: ['@AbaddonOccult', 'ordo_sacra_obscura'],
      ips: ['193.201.224.1', '185.220.101.5'],
      domains: ['vatican-crypts-survey.org', 'ordo-obscura.va'],
      cryptoWallets: ['bc1qabaddonoccultabyss666999000111222333444']
    },
    osintTechniquesGuide: [
      'Décrypter les manuscrits numérisés de la Bibliothèque Apostolique Vaticane via OCR forensique.',
      'Croiser les anomalies magnétiques terrestres relevées par les satellites géodésiques sur Rome.'
    ],
    vulnerabilities: [
      'Sensible aux vibrations harmoniques sacrées et aux fréquences sonores en Do# mineur harmonique.'
    ]
  }
];

export const OSINT_ACADEMY_MISSIONS: OSINTMissionExercise[] = [
  {
    id: 'mission_dork_vance',
    title: 'Mission 01 : Dorking des Comptes Secrets de Vance Corp',
    category: 'DORKING',
    targetCharacterId: 'viktor_vance',
    targetName: 'Viktor Vance',
    promptScenario: 'Vous devez trouver le document PDF confidentiel prouvant les pots-de-vin versés par Viktor Vance aux officiers du SPVM-Prime. Vous disposez du domaine d’entreprise "vance-dynamics.mtl". Quelle requête Google Dork formulez-vous ?',
    clues: [
      'Utilisez l’opérateur de domaine "site:"',
      'Ciblez uniquement les fichiers de type "filetype:pdf"',
      'Ajoutez le mot-clé exact "confidentiel" ou "SPVM"'
    ],
    expectedQueryOrSolution: 'site:vance-dynamics.mtl filetype:pdf confidentiel',
    acceptableAnswers: [
      'site:vance-dynamics.mtl filetype:pdf confidentiel',
      'site:vance-dynamics.mtl filetype:pdf "confidentiel"',
      'site:vance-dynamics.mtl filetype:pdf SPVM',
      'site:vance-dynamics.mtl filetype:pdf spvm-prime',
      'site:vance-dynamics.mtl filetype:pdf "spvm"',
      'site:vance-dynamics.mtl filetype:pdf pots-de-vin',
      'site:vance-dynamics.mtl filetype:pdf corruption',
      'filetype:pdf site:vance-dynamics.mtl confidentiel',
      'filetype:pdf site:vance-dynamics.mtl spvm',
      'filetype:pdf site:vance-dynamics.mtl',
      'site:vance-dynamics.mtl ext:pdf confidentiel',
      'site:vance-dynamics.mtl ext:pdf',
      'site:vance-dynamics.mtl filetype:pdf'
    ],
    hint: 'La syntaxe exacte à formuler est : site:vance-dynamics.mtl filetype:pdf confidentiel',
    explanation: 'Le Google Dorking permet de cibler des indexations de documents internes non protégés par un fichier robots.txt ou un htaccess.',
    xpReward: 250,
    btcRewardSats: 1500,
    unlockedIntelReport: {
      title: 'RAPPORT EXFILTRÉ // ORDRES D’EXTORSION VANCE-SPVM',
      classification: 'TOP SECRET // CLASSIFICATION OMEGA',
      content: [
        'Document d’audit retrouvé : Accord no 884-SPVM.',
        'Montant : 450,000 $ CAD mensuels versés sur le compte offshore de Viktor Vance.',
        'Objectif : Autoriser les fouilles corporelles systématiques et la confiscation de nanites dans le RÉSO.'
      ]
    }
  },
  {
    id: 'mission_geoint_mont_royal',
    title: 'Mission 02 : Chronolocalisation GEOINT de l’Héliport Secret',
    category: 'GEOINT',
    targetCharacterId: 'viktor_vance',
    targetName: 'Viktor Vance',
    promptScenario: 'Une photo de surveillance montre l’hélicoptère blindé de Vance sur une colline à Montréal. L’ombre de la Croix du Mont-Royal mesure exactement 31.2 mètres et pointe vers le Nord-Est (azimut 48°). Quel outil OSINT recommandé par MaxIntel permet de vérifier l’heure exacte de prise de vue ?',
    clues: [
      'C’est un outil web interactif calculant la position du soleil.',
      'Son nom commence par "Sun" et finit par "calc".'
    ],
    expectedQueryOrSolution: 'SunCalc',
    acceptableAnswers: [
      'suncalc',
      'suncalc.org',
      'suncalc calculator',
      'sun calc',
      'sun-calc',
      'https://www.suncalc.org/',
      'suncalc.net',
      'shadow calculator',
      'calculateur d\'ombres'
    ],
    hint: 'L’outil de référence mondial se nomme SunCalc (https://www.suncalc.org/).',
    explanation: 'En renseignant la date et les coordonnées de la colline de Montréal (45.5017° N, -73.5673° W), SunCalc détermine que la photo a été prise à 15h42 le 14 Mai.',
    xpReward: 300,
    btcRewardSats: 2000,
    unlockedIntelReport: {
      title: 'LOCALISATION EXACTE DE L’HÉLIPORT DU MONT-ROYAL',
      classification: 'CONFIDENTIEL TACTIQUE',
      content: [
        'Coordonnées GPS confirmées : 45.5048° N, 73.5872° W (Plateau Nord du Belvédère).',
        'Fenêtre d’atterrissage de Viktor Vance : Tous les jours à 16h00.',
        'Faiblesse tactique : Le radar de guidage peut être brouillé par une grenade EMP.'
      ]
    }
  },
  {
    id: 'mission_socmint_thirty3',
    title: 'Mission 03 : Traque SOCMINT des Alias de Thirty3',
    category: 'SOCMINT',
    targetCharacterId: 'thirty3_michael',
    targetName: 'Thirty3',
    promptScenario: 'Les services de sécurité corporatifs veulent corréler le pseudonyme "oracle33" sur l’ensemble du Web mondial pour retrouver ses anciens dépôts de code et forums secrets. Quel outil open-source Python en ligne de commande (développé pour le SOCMINT massif) est le plus efficace ?',
    clues: [
      'Nom inspiré du plus célèbre détective de fiction britannique.',
      'Prend la commande "sherlock <username>" ou "maigret <username>".'
    ],
    expectedQueryOrSolution: 'Sherlock',
    acceptableAnswers: [
      'sherlock',
      'sherlock-project',
      'sherlock oracle33',
      'sherlock thirty3',
      'maigret',
      'maigret oracle33',
      'whatsmyname',
      'blackbird',
      'sherlock project'
    ],
    hint: 'L’outil s’appelle Sherlock (ou Maigret), capable de scanner 400+ réseaux sociaux en moins de 30 secondes.',
    explanation: 'Sherlock interroge les endpoints d’inscription pour vérifier si un pseudonyme existe, révélant ainsi les anciens comptes GitHub et forums de Thirty3.',
    xpReward: 350,
    btcRewardSats: 2500,
    unlockedIntelReport: {
      title: 'ARBORESCENCE D’IDENTITÉ // THIRTY3',
      classification: 'DOSSIER BIOGRAPHIQUE HACKER',
      content: [
        'Anciens projets découverts : Firmware pour gants à impulsion kinétique.',
        'Spécification matérielle : Antenne Wi-Fi dual-band ESP32 intégrée.',
        'Affiliation : Sanctuaire hacker underground de Montréal.'
      ]
    }
  },
  {
    id: 'mission_crypto_drouin',
    title: 'Mission 04 : Traçage Forensique Blockchain des Pots-de-Vin',
    category: 'CRYPTOINT',
    targetCharacterId: 'commandant_drouin',
    targetName: 'Commandant Drouin',
    promptScenario: 'Le portefeuille Bitcoin de rançon du Commandant Drouin a reçu 5.4 BTC. Vous devez inspecter l’arbre de transaction (UTXO) et la file d’attente des blocs Bitcoin en direct. Quel explorateur open-source recommandé par MaxIntel fournit la visualisation en temps réel des transactions ?',
    clues: [
      'C’est le visualiseur de mempool le plus célèbre du monde Bitcoin.',
      'Son nom de domaine est "mempool.space".'
    ],
    expectedQueryOrSolution: 'mempool.space',
    acceptableAnswers: [
      'mempool.space',
      'mempool',
      'https://mempool.space/',
      'mempool space',
      'blockchair',
      'blockchain.com',
      'blockchain explorer',
      'etherscan'
    ],
    hint: 'L’explorateur mempool.space affiche les blocs en cours de minage et les flux de satoshis sans tracking tiers.',
    explanation: 'Grâce à l’analyse de graphe UTXO, nous identifions que les satoshis proviennent directement de l’adresse de blanchiment de Viktor Vance.',
    xpReward: 400,
    btcRewardSats: 3000,
    unlockedIntelReport: {
      title: 'PREUVE FORENSIQUE BITCOIN // TRANSACTION INCRIMINANTE',
      classification: 'PREUVE JUDICIAIRE IRRÉFUTABLE',
      content: [
        'TXID : 7a88fbc9901d83012903b91a0c84910283019283019283019283019283019283.',
        'Adresses liées : Vance Holdings -> SPVM Enforcer Unit.',
        'Gel possible des fonds via le Hack Décentralisé de Sophia.'
      ]
    }
  },
  {
    id: 'mission_darkint_ares9',
    title: 'Mission 05 : Extraction de Dump Darkweb sur ARES-9',
    category: 'DARKINT',
    targetCharacterId: 'ares_9_ai',
    targetName: 'ARES-9',
    promptScenario: 'Pour désactiver le bouclier laser de l’I.A. militaire ARES-9 à Los Angeles, vous devez retrouver la clé de chiffrement maîtresse (Master Root Key) ayant fuité sur les pastebins anonymes du Darknet. Quelle extension de domaine de premier niveau (TLD) utilise le réseau Tor pour héberger ces sites cachés ?',
    clues: [
      'C’est le légume à bulbe emblématique du routage en oignon.',
      'Le TLD s’écrit ".onion".'
    ],
    expectedQueryOrSolution: '.onion',
    acceptableAnswers: [
      '.onion',
      'onion',
      'tor onion',
      'tor',
      'hidden service',
      'darknet onion'
    ],
    hint: 'Le réseau Tor utilise les adresses cryptographiques se terminant par .onion.',
    explanation: 'En indexant les services cachés .onion via les crawlers MaxIntel, Sophia récupère le certificat root de secours d’ARES-9.',
    xpReward: 500,
    btcRewardSats: 4000,
    unlockedIntelReport: {
      title: 'CLÉ ROOT D’ARES-9 RÉCUPÉRÉE',
      classification: 'CYBER-ARME STRATÉGIQUE',
      content: [
        'Clé maîtresse : 0xDEAD_BEEF_ARES9_BYPASS_2033.',
        'Effet en combat : Réduit les dégâts infligés par ARES-9 de 30% lors du combat de boss.',
        'Intégré automatiquement dans le système de combat FF7.'
      ]
    }
  }
];
