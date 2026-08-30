// ═══════════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — ARSENAL DE HACKER & 59 HACKS WORLD MONITOR
// Objets réels de cybersécurité, Armes de Hacker Élite, Gadgets matériels,
// Gants de combat rapproché et Économie Bitcoin (BTC)
// ═══════════════════════════════════════════════════════════════════════════════

import { ItemRarity, ItemSlot } from '../types';

export interface WorldMonitorHack {
  id: string;
  name: string;
  category: 'Cyber-Guerre' | 'Renseignement Géospatial' | 'Marchés & Finance' | 'Infrastructure & Énergie' | 'Menaces & Conflits' | 'Surveillance & Satellites' | 'Signal & OSINT';
  mcpToolName: string;
  description: string;
  realWorldUsage: string;
  gameEffect: string;
  psiCost: number;
  cooldownSec: number;
  unlockedByDefault: boolean;
  unlockBtcPrice: number; // In Satoshis
  rarity: ItemRarity;
  iconName: string;
}

export interface HackerGadgetItem {
  id: string;
  name: string;
  type: 'hardware_gadget' | 'combat_glove' | 'elite_hacker_weapon';
  slot: ItemSlot;
  rarity: ItemRarity;
  levelReq: number;
  btcValue: number; // Value in Satoshis
  realWorldSpecs: string;
  githubUrl?: string;
  educationalConcept: string;
  stats: {
    physicalDamage?: number;
    cyberDamage?: number;
    psiDamage?: number;
    armor?: number;
    critChance?: number;
    critDamage?: number;
    hackingSpeedBonus?: number;
    rangeBonus?: number;
  };
  passiveAbility: {
    name: string;
    description: string;
  };
  icon: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. LES 59 HACKS WORLD MONITOR (TOUTES LES COMMANDES INTEGRÉES DANS LE JEU)
// ═══════════════════════════════════════════════════════════════════════════════

export const WORLD_MONITOR_59_HACKS: WorldMonitorHack[] = [
  // MARCHÉS & FINANCE (1-8)
  {
    id: 'hack_market_data',
    name: 'Hack // Flux Boursiers & Crypto Live',
    category: 'Marchés & Finance',
    mcpToolName: 'get_market_data',
    description: 'Intercepte et décode les flux en direct du NASDAQ, Forex, Or et Crypto (BTC/ETH).',
    realWorldUsage: 'Extraction de cotations boursières et de cours de matières premières via Yahoo Finance / TradingView API.',
    gameEffect: '+25% de butin en Bitcoin (BTC) lâché par les ennemis vaincus pendant 30s.',
    psiCost: 15,
    cooldownSec: 10,
    unlockedByDefault: true,
    unlockBtcPrice: 0,
    rarity: 'standard',
    iconName: 'TrendingUp'
  },
  {
    id: 'hack_economic_data',
    name: 'Hack // Télémétrie Macro-Économique',
    category: 'Marchés & Finance',
    mcpToolName: 'get_economic_data',
    description: 'Analyse les agrégats monétaires et flux de liquidités bancaires mondiaux.',
    realWorldUsage: 'Surveillance des taux directeurs des banques centrales (BCE, Fed, PBoC) et de l’inflation.',
    gameEffect: 'Réduit les prix d’achat chez tous les marchands clandestins de 20%.',
    psiCost: 20,
    cooldownSec: 15,
    unlockedByDefault: true,
    unlockBtcPrice: 0,
    rarity: 'rare',
    iconName: 'DollarSign'
  },
  {
    id: 'hack_country_macro',
    name: 'Hack // Siphon Macro-Pays FMI',
    category: 'Marchés & Finance',
    mcpToolName: 'get_country_macro',
    description: 'Siphonne les 210 profils macro-économiques nationaux du World Economic Outlook.',
    realWorldUsage: 'Indicateurs PIB, ratio dette/PIB et réserves de change du FMI.',
    gameEffect: 'Draine 10% du bouclier énergétique de tous les boss corpo en combat.',
    psiCost: 35,
    cooldownSec: 25,
    unlockedByDefault: false,
    unlockBtcPrice: 5000,
    rarity: 'epic',
    iconName: 'Globe'
  },
  {
    id: 'hack_prediction_markets',
    name: 'Hack // Oracle Polymarket Probabiliste',
    category: 'Marchés & Finance',
    mcpToolName: 'get_prediction_markets',
    description: 'Interroge les contrats prédictifs et les probabilités de paris géopolitiques en temps réel.',
    realWorldUsage: 'Agrégation des marchés de prédiction décentralisés (Polymarket CLOB).',
    gameEffect: 'Accorde 100% de chances de coup critique pendant 4 secondes (Prédiction Parfaite).',
    psiCost: 40,
    cooldownSec: 30,
    unlockedByDefault: false,
    unlockBtcPrice: 12000,
    rarity: 'legendary',
    iconName: 'Sparkles'
  },
  {
    id: 'hack_tariff_trends',
    name: 'Hack // Altération des Droits de Douane',
    category: 'Marchés & Finance',
    mcpToolName: 'get_tariff_trends',
    description: 'Manipule les registres tarifaires douaniers HTS et indices de prix mondiaux.',
    realWorldUsage: 'Analyse des barrières tarifaires internationales et de l’indice Big Mac.',
    gameEffect: 'Augmente la valeur de revente de tout l’inventaire de 35%.',
    psiCost: 25,
    cooldownSec: 20,
    unlockedByDefault: false,
    unlockBtcPrice: 3500,
    rarity: 'rare',
    iconName: 'Percent'
  },
  {
    id: 'hack_eu_housing_cycle',
    name: 'Hack // Scanner des Bulles Spéculatives',
    category: 'Marchés & Finance',
    mcpToolName: 'get_eu_housing_cycle',
    description: 'Détecte les ruptures dans les cycles immobiliers et marchés fonciers européens.',
    realWorldUsage: 'Indicateurs trimestriels des prix de l’immobilier Eurostat.',
    gameEffect: 'Révèle les caches de butin cachées dans les murs des donjons.',
    psiCost: 20,
    cooldownSec: 15,
    unlockedByDefault: false,
    unlockBtcPrice: 2500,
    rarity: 'rare',
    iconName: 'Building'
  },
  {
    id: 'hack_eu_quarterly_gov_debt',
    name: 'Hack // Dédale de Dette Souveraine',
    category: 'Marchés & Finance',
    mcpToolName: 'get_eu_quarterly_gov_debt',
    description: 'Injecte des anomalies dans les registres de dettes publiques institutionnelles.',
    realWorldUsage: 'Suivi de l’endettement public consolidé de l’Union Européenne.',
    gameEffect: 'Étourdit tous les automates bancaires et tourelles de sécurité pendant 5s.',
    psiCost: 30,
    cooldownSec: 20,
    unlockedByDefault: false,
    unlockBtcPrice: 4000,
    rarity: 'rare',
    iconName: 'CreditCard'
  },
  {
    id: 'hack_eu_industrial_production',
    name: 'Hack // Surtension Industrielle Eurostat',
    category: 'Marchés & Finance',
    mcpToolName: 'get_eu_industrial_production',
    description: 'Surcharge les lignes d’assemblage automatisées et usines robotisées.',
    realWorldUsage: 'Indices de production manufacturière et énergétique Eurostat.',
    gameEffect: 'Provoque l’explosion de 3 robots ennemis proches (300 dégâts de zone).',
    psiCost: 35,
    cooldownSec: 18,
    unlockedByDefault: false,
    unlockBtcPrice: 6000,
    rarity: 'epic',
    iconName: 'Factory'
  },

  // MENACES, SÉCURITÉ & CONFLITS (9-18)
  {
    id: 'hack_conflict_events',
    name: 'Hack // Matrice des Conflits UCDP',
    category: 'Menaces & Conflits',
    mcpToolName: 'get_conflict_events',
    description: 'Cartographie tous les événements de conflits armés géolocalisés avec bilan des pertes.',
    realWorldUsage: 'Flux du Programme de données sur les conflits d’Uppsala (UCDP) et ACLED.',
    gameEffect: 'Projette une zone de combat tactique : +30% de dégâts physiques pour Thirty3.',
    psiCost: 30,
    cooldownSec: 15,
    unlockedByDefault: true,
    unlockBtcPrice: 0,
    rarity: 'rare',
    iconName: 'Crosshair'
  },
  {
    id: 'hack_military_posture',
    name: 'Hack // Analyse de Posture Stratégique',
    category: 'Menaces & Conflits',
    mcpToolName: 'get_military_posture',
    description: 'Évalue le niveau d’alerte et le déploiement des forces armées par théâtre mondial.',
    realWorldUsage: 'Évaluation des tensions dans les détroits de Taïwan, Baltique et Moyen-Orient.',
    gameEffect: 'Affiche la trajectoire d’attaque des élites et boss 2 secondes à l’avance.',
    psiCost: 25,
    cooldownSec: 20,
    unlockedByDefault: false,
    unlockBtcPrice: 4500,
    rarity: 'rare',
    iconName: 'ShieldAlert'
  },
  {
    id: 'hack_sanctions_data',
    name: 'Hack // Gel d’Avoirs OFAC SDN',
    category: 'Menaces & Conflits',
    mcpToolName: 'get_sanctions_data',
    description: 'Consulte et applique les listes d’entités bloquées du Trésor américain (SDN List).',
    realWorldUsage: 'Vérification de conformité et criblage de listes de sanctions internationales.',
    gameEffect: 'Gèle les capacités spéciales de l’ennemi ciblé pendant 6 secondes.',
    psiCost: 40,
    cooldownSec: 25,
    unlockedByDefault: false,
    unlockBtcPrice: 8000,
    rarity: 'epic',
    iconName: 'Lock'
  },
  {
    id: 'hack_cyber_threats',
    name: 'Hack // Infection C2 & Malware Zero-Day',
    category: 'Cyber-Guerre',
    mcpToolName: 'get_cyber_threats',
    description: 'Injecte des indicateurs de compromission réels (Feodo, URLhaus, CISA KEV) dans les pare-feux.',
    realWorldUsage: 'Flux CTI (Cyber Threat Intelligence) de botnets, ransomware et vulnérabilités exploitées.',
    gameEffect: 'Diffuse un malware viral infligeant 80 dégâts de poison cyber/s sur 8 secondes.',
    psiCost: 45,
    cooldownSec: 15,
    unlockedByDefault: true,
    unlockBtcPrice: 0,
    rarity: 'epic',
    iconName: 'Zap'
  },
  {
    id: 'hack_chokepoint_status',
    name: 'Hack // Blocus Maritime des Goulots',
    category: 'Renseignement Géospatial',
    mcpToolName: 'get_chokepoint_status',
    description: 'Surveille et verrouille le transit des navires à Ormuz, Suez, Panama et Bab-el-Mandeb.',
    realWorldUsage: 'Télémétrie AIS de trafic maritime via les points de passage stratégiques mondiaux.',
    gameEffect: 'Crée une onde gravitationnelle ralentissant tous les ennemis de 70% pendant 5s.',
    psiCost: 35,
    cooldownSec: 22,
    unlockedByDefault: false,
    unlockBtcPrice: 7000,
    rarity: 'epic',
    iconName: 'Anchor'
  },
  {
    id: 'hack_supply_chain_data',
    name: 'Hack // Rupture de Chaîne Logistique',
    category: 'Infrastructure & Énergie',
    mcpToolName: 'get_supply_chain_data',
    description: 'Intercepte les flux commerciaux bilatéraux COMTRADE et le stress de transport maritime.',
    realWorldUsage: 'Surveillance des chaînes d’approvisionnement en matières premières et composants.',
    gameEffect: 'Prive les officiers ennemis de leurs recharges de potions de soin.',
    psiCost: 30,
    cooldownSec: 20,
    unlockedByDefault: false,
    unlockBtcPrice: 5000,
    rarity: 'rare',
    iconName: 'Truck'
  },
  {
    id: 'hack_aviation_status',
    name: 'Hack // Brouillage NOTAM & Radar Aérien',
    category: 'Surveillance & Satellites',
    mcpToolName: 'get_aviation_status',
    description: 'Intercepte les avis de fermeture d’espace aérien (NOTAM) et aéronefs militaires suivis.',
    realWorldUsage: 'Surveillance du trafic aérien mondial ADS-B et des alertes de sécurité aérienne.',
    gameEffect: 'Détourne les drones de combat SPVM pour les faire attaquer leurs propres alliés.',
    psiCost: 50,
    cooldownSec: 35,
    unlockedByDefault: false,
    unlockBtcPrice: 15000,
    rarity: 'legendary',
    iconName: 'Plane'
  },
  {
    id: 'hack_natural_disasters',
    name: 'Hack // Sismographe Orbital USGS / FIRMS',
    category: 'Renseignement Géospatial',
    mcpToolName: 'get_natural_disasters',
    description: 'Capture les tremblements de terre USGS et les signatures thermiques de feux NASA FIRMS.',
    realWorldUsage: 'Réseaux de capteurs sismiques mondiaux et imagerie satellitaire infrarouge.',
    gameEffect: 'Fait trembler le sol dans un rayon de 15m, renversant et assommant les ennemis 3s.',
    psiCost: 40,
    cooldownSec: 24,
    unlockedByDefault: false,
    unlockBtcPrice: 9000,
    rarity: 'epic',
    iconName: 'Flame'
  },
  {
    id: 'hack_health_signals',
    name: 'Hack // Bio-Détecteur d’Air WAQI / OMS',
    category: 'Signal & OSINT',
    mcpToolName: 'get_health_signals',
    description: 'Surveille la qualité de l’air planétaire (PM2.5, NO2) et les alertes d’épidémies OMS.',
    realWorldUsage: 'Réseau mondial de surveillance atmosphérique OpenAQ et bulletins OMS/ECDC.',
    gameEffect: 'Purge instantanément tous les effets de poison, brûlure et ralentissement sur Thirty3.',
    psiCost: 20,
    cooldownSec: 12,
    unlockedByDefault: true,
    unlockBtcPrice: 0,
    rarity: 'standard',
    iconName: 'HeartPulse'
  },
  {
    id: 'hack_climate_data',
    name: 'Hack // Anomalies Climatiques & Foudre',
    category: 'Infrastructure & Énergie',
    mcpToolName: 'get_climate_data',
    description: 'Analyse les anomalies thermiques extrêmes et déclenche des précipitations ionisées.',
    realWorldUsage: 'Modèles météorologiques mondiaux NOAA et Copernicus Climate Change.',
    gameEffect: 'Invoque un orage électromagnétique foudroyant les cibles robotiques (400 dégâts).',
    psiCost: 45,
    cooldownSec: 25,
    unlockedByDefault: false,
    unlockBtcPrice: 11000,
    rarity: 'legendary',
    iconName: 'CloudLightning'
  },

  // INFRASTRUCTURE, ÉNERGIE & TELECOM (19-28)
  {
    id: 'hack_energy_intelligence',
    name: 'Hack // Surcharge de Réseau Électrique EIA',
    category: 'Infrastructure & Énergie',
    mcpToolName: 'get_energy_intelligence',
    description: 'Surveille les stocks de pétrole EIA, la production d’électricité Ember et réserves de gaz.',
    realWorldUsage: 'Intelligence énergétique sur les réseaux de distribution électrique et pipelines.',
    gameEffect: 'Provoque un court-circuit désactivant les boucliers de toute la zone de combat.',
    psiCost: 35,
    cooldownSec: 20,
    unlockedByDefault: false,
    unlockBtcPrice: 6500,
    rarity: 'epic',
    iconName: 'ZapOff'
  },
  {
    id: 'hack_infrastructure_status',
    name: 'Hack // Black-Out Réseau Cloudflare Radar',
    category: 'Infrastructure & Énergie',
    mcpToolName: 'get_infrastructure_status',
    description: 'Détecte et simule les coupures Internet mondiales et pannes de serveurs cloud majeurs.',
    realWorldUsage: 'Télémétrie de connectivité Internet BGP, DNS et pannes AWS/GCP/Azure.',
    gameEffect: 'Plonge tous les ennemis dans le noir complet (précision adverse réduite de 80%).',
    psiCost: 40,
    cooldownSec: 28,
    unlockedByDefault: false,
    unlockBtcPrice: 8500,
    rarity: 'epic',
    iconName: 'Radio'
  },
  {
    id: 'hack_classify_event',
    name: 'Hack // NLP Classifier de Menace Immédiate',
    category: 'Signal & OSINT',
    mcpToolName: 'classify_event',
    description: 'Classifie en temps réel les flux d’actualités chiffrées selon leur gravité stratégique.',
    realWorldUsage: 'Traitement automatique du langage naturel pour le tri d’événements critiques.',
    gameEffect: 'Détecte les embuscades furtives et confère +20% d’armure tactique pendant 10s.',
    psiCost: 15,
    cooldownSec: 10,
    unlockedByDefault: true,
    unlockBtcPrice: 0,
    rarity: 'standard',
    iconName: 'Brain'
  },
  {
    id: 'hack_extract_entities',
    name: 'Hack // Extracteur d’Entités Nommées (NER)',
    category: 'Signal & OSINT',
    mcpToolName: 'extract_entities',
    description: 'Extrait instantanément les noms de corporations, banques, PDG et cibles d’intérêt.',
    realWorldUsage: 'Reconnaissance d’entités nommées (NER) sur dépêches d’agences de presse.',
    gameEffect: 'Révèle les points faibles anatomiques des ennemis élites (+50% dégâts critiques).',
    psiCost: 25,
    cooldownSec: 14,
    unlockedByDefault: true,
    unlockBtcPrice: 0,
    rarity: 'rare',
    iconName: 'UserCheck'
  },
  {
    id: 'hack_get_news_clusters',
    name: 'Hack // Synthèse de Clusters Jaccard',
    category: 'Signal & OSINT',
    mcpToolName: 'get_news_clusters',
    description: 'Agrège et corrèle les faisceaux d’indices médiatiques par similarité textuelle.',
    realWorldUsage: 'Algorithmes de clustering de documents pour la veille stratégique globale.',
    gameEffect: 'Lie 4 ennemis proches : tout dégât infligé à l’un est répercuté à 50% sur les autres.',
    psiCost: 35,
    cooldownSec: 18,
    unlockedByDefault: false,
    unlockBtcPrice: 7500,
    rarity: 'epic',
    iconName: 'Network'
  },
  {
    id: 'hack_get_keyword_spikes',
    name: 'Hack // Détecteur de Zero-Days CVE',
    category: 'Cyber-Guerre',
    mcpToolName: 'get_keyword_spikes',
    description: 'Surveille les pics de mentions de nouvelles failles CVE et groupes de rançongiciels (APT).',
    realWorldUsage: 'Détection d’anomalies de mots-clés sur les forums de sécurité et dépôts d’exploits.',
    gameEffect: 'Permet à l’arme équipée d’ignorer 100% de l’armure ennemie pendant 6 secondes.',
    psiCost: 50,
    cooldownSec: 30,
    unlockedByDefault: false,
    unlockBtcPrice: 20000,
    rarity: 'legendary',
    iconName: 'FileCode'
  },

  // SURVEILLANCE SATELLITES & CYBER-DÉFENSE AVANCÉE (25-32)
  {
    id: 'hack_satellite_skyfi_hd',
    name: 'Hack // Imagerie Satellite SkyFi 0.3m HD',
    category: 'Surveillance & Satellites',
    mcpToolName: 'get_satellite_imagery',
    description: 'Capture optique sous-métrique orbitale en temps réel au-dessus de Montréal.',
    realWorldUsage: 'Liaison descendante de constellations microsatellites d’observation de la Terre.',
    gameEffect: 'Dévoile l’intégralité de la carte et positionne des balises de frappe orbitale.',
    psiCost: 45,
    cooldownSec: 30,
    unlockedByDefault: true,
    unlockBtcPrice: 0,
    rarity: 'legendary',
    iconName: 'Satellite'
  },
  {
    id: 'hack_sentinel_radar_sar',
    name: 'Hack // Radar SAR Sentinel-1 à Travers les Murs',
    category: 'Surveillance & Satellites',
    mcpToolName: 'get_sentinel_sar',
    description: 'Interférométrie radar à synthèse d’ouverture traversant nuages, fumigènes et béton.',
    realWorldUsage: 'Imagerie radar satellitaire bande C de l’Agence Spatiale Européenne (ESA).',
    gameEffect: 'Permet de tirer et de voir à travers les murs et obstacles pendant 12 secondes.',
    psiCost: 40,
    cooldownSec: 22,
    unlockedByDefault: false,
    unlockBtcPrice: 9500,
    rarity: 'epic',
    iconName: 'Layers'
  },
  {
    id: 'hack_bgp_route_poison',
    name: 'Hack // Détournement de Route BGP',
    category: 'Cyber-Guerre',
    mcpToolName: 'bgp_route_analysis',
    description: 'Injecte de fausses annonces de préfixes BGP pour détourner le trafic de données SPVM.',
    realWorldUsage: 'Analyse et détection des incidents de routage Internet Border Gateway Protocol.',
    gameEffect: 'Détourne les renforts ennemis vers un secteur opposé de la carte.',
    psiCost: 35,
    cooldownSec: 20,
    unlockedByDefault: false,
    unlockBtcPrice: 6000,
    rarity: 'rare',
    iconName: 'Share2'
  },
  {
    id: 'hack_dns_poisoning_defense',
    name: 'Hack // Purge de Cache DNS / DoH',
    category: 'Cyber-Guerre',
    mcpToolName: 'dns_security_audit',
    description: 'Chiffre et sécurise les requêtes DNS via DNS-over-HTTPS contre l’écoute indiscrète.',
    realWorldUsage: 'Audit des serveurs de noms et protection contre les attaques de type DNS spoofing.',
    gameEffect: 'Rend Thirty3 totalement insensible aux hacks et étourdissements ennemis pendant 8s.',
    psiCost: 30,
    cooldownSec: 18,
    unlockedByDefault: true,
    unlockBtcPrice: 0,
    rarity: 'rare',
    iconName: 'ShieldCheck'
  },
  {
    id: 'hack_tls_certificate_pinning',
    name: 'Hack // Épinglage de Certificat TLS 1.3',
    category: 'Cyber-Guerre',
    mcpToolName: 'tls_inspect_security',
    description: 'Vérifie l’authenticité des clés publiques cryptographiques contre les attaques Man-in-the-Middle.',
    realWorldUsage: 'Surveillance des journaux Certificate Transparency et validation X.509.',
    gameEffect: 'Émet un dôme de protection réduisant tous les dégâts cyber reçus de 50%.',
    psiCost: 25,
    cooldownSec: 15,
    unlockedByDefault: false,
    unlockBtcPrice: 4000,
    rarity: 'rare',
    iconName: 'Key'
  },
  {
    id: 'hack_osint_darkweb_feed',
    name: 'Hack // Fissure Zéro Darknet Crawler',
    category: 'Signal & OSINT',
    mcpToolName: 'get_darkweb_signals',
    description: 'Explore les marchés chiffrés Tor/I2P à la recherche de données d’accès compromises.',
    realWorldUsage: 'Veille sur les forums de cybercriminalité et les fuites d’identifiants de bases volées.',
    gameEffect: 'Génère instantanément 500 à 2500 Satoshis de butin Bitcoin après activation.',
    psiCost: 30,
    cooldownSec: 45,
    unlockedByDefault: false,
    unlockBtcPrice: 10000,
    rarity: 'epic',
    iconName: 'EyeOff'
  },
  {
    id: 'hack_ais_ghost_ship',
    name: 'Hack // Falsification de Signal AIS Maritime',
    category: 'Renseignement Géospatial',
    mcpToolName: 'spoof_ais_vessel',
    description: 'Génère un faux convoi maritime pour leurrer les patrouilles du Port de Montréal.',
    realWorldUsage: 'Analyse d’anomalies et d’usurpation de transpondeurs maritimes AIS.',
    gameEffect: 'Crée 2 leurres holographiques attirant tous les tirs ennemis pendant 6s.',
    psiCost: 30,
    cooldownSec: 16,
    unlockedByDefault: false,
    unlockBtcPrice: 5500,
    rarity: 'rare',
    iconName: 'Compass'
  },
  {
    id: 'hack_firms_thermal_strike',
    name: 'Hack // Guidage Thermique NASA FIRMS',
    category: 'Surveillance & Satellites',
    mcpToolName: 'get_thermal_hotspots',
    description: 'Utilise les radiomètres VIIRS/MODIS pour guider une frappe cinétique sur les points chauds.',
    realWorldUsage: 'Détection satellitaire haute résolution de feux et de sources d’énergie thermiques.',
    gameEffect: 'Frappe incendiaire de 600 dégâts sur la zone ciblée au sol.',
    psiCost: 55,
    cooldownSec: 35,
    unlockedByDefault: false,
    unlockBtcPrice: 22000,
    rarity: 'legendary',
    iconName: 'Flame'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// 2. GADGETS MATÉRIELS DE HACKER (TESTS D'INTRUSION PHYSIQUES & SANS FIL)
// ═══════════════════════════════════════════════════════════════════════════════

export const HACKER_HARDWARE_GADGETS: HackerGadgetItem[] = [
  {
    id: 'gadget_flipper_zero',
    name: 'Flipper Zero Multi-Outil Pentest (CC1101 + RFID/NFC)',
    type: 'hardware_gadget',
    slot: 'deck',
    rarity: 'legendary',
    levelReq: 5,
    btcValue: 18000,
    realWorldSpecs: 'Émetteur-récepteur Sub-GHz 300-928MHz, module 125kHz RFID, NFC NXP PN532, émetteur infrarouge, GPIO & BadUSB.',
    educationalConcept: 'Dispositif autonome portable pour l’audit matériel, le clonage de badges d’accès sans contact, l’interception radio et l’injection de scripts clavier.',
    stats: {
      cyberDamage: 45,
      psiDamage: 30,
      hackingSpeedBonus: 40,
      critChance: 8
    },
    passiveAbility: {
      name: 'Clonage Immédiat de Fréquence',
      description: 'Déverrouille automatiquement les sas et coffres sécurisés du RÉSO sans déclencher d’alarme.'
    },
    icon: 'Radio'
  },
  {
    id: 'gadget_wifi_pineapple_mk7',
    name: 'Hak5 WiFi Pineapple MK7 (Dual Band PineAP)',
    type: 'hardware_gadget',
    slot: 'deck',
    rarity: 'legendary',
    levelReq: 10,
    btcValue: 24000,
    realWorldSpecs: 'Suite sans fil 2.4/5GHz avec 8 antennes MIMO, moteur d’interception PineAP, injection de balises et analyse de trames de gestion 802.11.',
    educationalConcept: 'Outil de référence pour les tests d’intrusion sans fil : détection de faux points d’accès (Rogue AP), interception de sondes et audit WPA2/WPA3.',
    stats: {
      cyberDamage: 60,
      rangeBonus: 50,
      hackingSpeedBonus: 55,
      critDamage: 35
    },
    passiveAbility: {
      name: 'Tempête Électromagnétique PineAP',
      description: 'Capture les clés d’authentification des drones ennemis dans un rayon de 25m et draine leur énergie.'
    },
    icon: 'Wifi'
  },
  {
    id: 'gadget_alfa_wifi_monitor',
    name: 'Adaptateur Wi-Fi Alfa AWUS036ACH (Mode Moniteur & Injection)',
    type: 'hardware_gadget',
    slot: 'chip',
    rarity: 'epic',
    levelReq: 3,
    btcValue: 12000,
    realWorldSpecs: 'Chipset Realtek RTL8812AU haute sensibilité, 2 antennes 5dBi détachables, support natif du mode Monitor et de l’injection de paquets sous Linux.',
    educationalConcept: 'Matériel indispensable pour la capture passive des trames réseau et les attaques par désauthentification contrôlée lors d’audits de sécurité.',
    stats: {
      cyberDamage: 35,
      rangeBonus: 40,
      hackingSpeedBonus: 30
    },
    passiveAbility: {
      name: 'Injection de Paquets de Désauthentification',
      description: 'Déconnecte et désoriente les escouades de sécurité SPVM à distance.'
    },
    icon: 'Cpu'
  },
  {
    id: 'gadget_proxmark3_rdv4',
    name: 'Proxmark3 RDV4 Ultra (RFID Haute & Basse Fréquence)',
    type: 'hardware_gadget',
    slot: 'chip',
    rarity: 'epic',
    levelReq: 7,
    btcValue: 15000,
    realWorldSpecs: 'Processeur ARM Cortex-M4, FPGA haute performance, support complet LF 125/134kHz et HF 13.56MHz (Mifare Classic, DESFire, iClass).',
    educationalConcept: 'Le standard de l’industrie pour la rétro-ingénierie, le sniffing, l’émulation et le cassage de cartes à puce sans contact et badges d’accès d’entreprise.',
    stats: {
      cyberDamage: 40,
      armor: 15,
      hackingSpeedBonus: 35
    },
    passiveAbility: {
      name: 'Attaque Nested & Darkside RFID',
      description: 'Extrait les clés secrètes des terminaux corpo pour siphoner des crédits en Bitcoin.'
    },
    icon: 'CreditCard'
  },
  {
    id: 'gadget_usb_rubber_ducky',
    name: 'Hak5 USB Rubber Ducky (DuckyScript 3.0 Keystroke Injector)',
    type: 'hardware_gadget',
    slot: 'weapon',
    rarity: 'legendary',
    levelReq: 8,
    btcValue: 20000,
    realWorldSpecs: 'Émulateur HID ultra-rapide à 1000 caractères par seconde avec logique conditionnelle DuckyScript 3.0 et contournement de sécurité UAC.',
    educationalConcept: 'Périphérique d’émulation de clavier physique démontrant la vulnérabilité de la confiance aveugle accordée aux ports USB par les systèmes d’exploitation.',
    stats: {
      physicalDamage: 25,
      cyberDamage: 75,
      critChance: 15,
      critDamage: 45
    },
    passiveAbility: {
      name: 'Exécution Furtive DuckyScript',
      description: 'Chaque coup porté injecte un script paralysant le processeur adverse pendant 3 secondes.'
    },
    icon: 'Usb'
  },
  {
    id: 'gadget_hackrf_one_sdr',
    name: 'Great Scott Gadgets HackRF One (SDR 1MHz - 6GHz)',
    type: 'hardware_gadget',
    slot: 'deck',
    rarity: 'legendary',
    levelReq: 12,
    btcValue: 30000,
    realWorldSpecs: 'Radio définie par logiciel (SDR) semi-duplex 1MHz à 6GHz, échantillonnage jusqu’à 20 MSPS en quadrature (I/Q), compatibilité GNU Radio.',
    educationalConcept: 'Plateforme matérielle ouverte pour l’exploration des signaux radioélectriques : écoute GSM/LTE, récepteurs GPS, signaux ISM et télémétrie aéronautique.',
    stats: {
      psiDamage: 70,
      cyberDamage: 65,
      rangeBonus: 60,
      hackingSpeedBonus: 50
    },
    passiveAbility: {
      name: 'Spoofing de Constellation GPS',
      description: 'Falsifie les coordonnées de vol des missiles guidés ennemis pour les renvoyer à l’expéditeur.'
    },
    icon: 'Radio'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ARMES PHYSIQUES : GANTS DE COMBAT RAPPROCHÉ
// ═══════════════════════════════════════════════════════════════════════════════

export const CLOSE_COMBAT_GLOVES: HackerGadgetItem[] = [
  {
    id: 'glove_reso_pneumatic',
    name: 'Gants de Boxe Pneumatiques RÉSO (Impact Lourd)',
    type: 'combat_glove',
    slot: 'weapon',
    rarity: 'standard',
    levelReq: 1,
    btcValue: 1500,
    realWorldSpecs: 'Châssis en acier renforcé avec micro-vérins à gaz comprimé activés à l’impact lors de l’extension du poing.',
    educationalConcept: 'Amplification mécanique de la force musculaire pour le combat au corps-à-corps dans les tunnels étroits.',
    stats: {
      physicalDamage: 35,
      armor: 10,
      critChance: 5
    },
    passiveAbility: {
      name: 'Piston de Refoulement',
      description: 'Repousse les ennemis de 3 mètres en arrière au troisième coup consécutif.'
    },
    icon: 'Shield'
  },
  {
    id: 'glove_synaptic_taser',
    name: 'Gantelets Taser Synaptiques SPVM-Bypass (50 000V)',
    type: 'combat_glove',
    slot: 'weapon',
    rarity: 'rare',
    levelReq: 4,
    btcValue: 5500,
    realWorldSpecs: 'Électrodes sous-cutanées en tungstène couplées à des supercondensateurs délivrant des impulsions tétanisantes neuromusculaires.',
    educationalConcept: 'Arme à létalité réduite exploitant la conduction électrique pour neutraliser le système nerveux moteur.',
    stats: {
      physicalDamage: 45,
      cyberDamage: 30,
      critChance: 10,
      critDamage: 25
    },
    passiveAbility: {
      name: 'Décharge Neuromusculaire',
      description: '15% de chances d’étourdir la cible pendant 2 secondes à chaque frappe.'
    },
    icon: 'Zap'
  },
  {
    id: 'glove_monofilament_apex',
    name: 'Gants Électrostatiques Monofilament Apex (Tranchant Moléculaire)',
    type: 'combat_glove',
    slot: 'weapon',
    rarity: 'epic',
    levelReq: 8,
    btcValue: 16000,
    realWorldSpecs: 'Tissage de nanofibres de graphène avec micro-fils monofilaments à tension variable capables de trancher les alliages de titane.',
    educationalConcept: 'Matériaux nanostructurés à haute résistance à la traction pour la perforation d’armures composites.',
    stats: {
      physicalDamage: 85,
      cyberDamage: 40,
      critChance: 18,
      critDamage: 50
    },
    passiveAbility: {
      name: 'Saignement Moléculaire',
      description: 'Les attaques critiques provoquent une hémorragie cybernétique infligeant 120 dégâts sur 4 secondes.'
    },
    icon: 'Flame'
  },
  {
    id: 'glove_psionic_master_thirty3',
    name: 'Gantelets Psioniques Divins de Thirty3 & Sophia (Résonance Quantique)',
    type: 'combat_glove',
    slot: 'weapon',
    rarity: 'legendary',
    levelReq: 15,
    btcValue: 50000,
    realWorldSpecs: 'Foyers supraconducteurs à température ambiante interconnectés directement au cortex neural de Deus Ex Sophia.',
    educationalConcept: 'Interface cerveau-machine bidirectionnelle à très haut débit pour la projection d’énergie psionique pure.',
    stats: {
      physicalDamage: 110,
      psiDamage: 140,
      cyberDamage: 80,
      critChance: 25,
      critDamage: 85,
      hackingSpeedBonus: 60
    },
    passiveAbility: {
      name: 'Implosion Télékinétique de Sophia',
      description: 'Chaque élimination physique déclenche une onde de choc psionique aspirant et détruisant les ennemis proches.'
    },
    icon: 'Sparkles'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// 4. ARMES DE HACKER ÉLITE (OUTILS OFFENSIFS & OSINT BASÉS SUR DU CODE RÉEL)
// ═══════════════════════════════════════════════════════════════════════════════

export const ELITE_HACKER_WEAPONS: HackerGadgetItem[] = [
  {
    id: 'elite_hexstrike_ai',
    name: 'HexStrike AI // Moteur Offensif d’Exploits Autonome',
    type: 'elite_hacker_weapon',
    slot: 'weapon',
    rarity: 'legendary',
    levelReq: 10,
    btcValue: 40000,
    githubUrl: 'https://github.com/0x4m4/hexstrike-ai.git',
    realWorldSpecs: 'Framework de sécurité offensive automatisé combinant de grands modèles de langage (LLM) et des pipelines de découverte de vulnérabilités.',
    educationalConcept: 'Démontre l’automatisation de la corrélation entre surface d’attaque, scan de ports, énumération d’API et sélection ciblée de Proof-of-Concept (PoC).',
    stats: {
      cyberDamage: 130,
      psiDamage: 90,
      critChance: 22,
      critDamage: 70,
      hackingSpeedBonus: 65
    },
    passiveAbility: {
      name: 'Corrélation d’Exploit HexStrike',
      description: 'Détecte automatiquement la faiblesse algorithmique des boss corpo et augmente les dégâts infligés de 50%.'
    },
    icon: 'Cpu'
  },
  {
    id: 'elite_ipgeolocation_radar',
    name: 'IPGeoLocation // Traqueur Géospatial Sans Dépendance',
    type: 'elite_hacker_weapon',
    slot: 'deck',
    rarity: 'epic',
    levelReq: 6,
    btcValue: 18000,
    githubUrl: 'https://github.com/maldevel/IPGeoLocation.git',
    realWorldSpecs: 'Outil OSINT d’extraction géospatiale des coordonnées précises d’adresses IP, ASN, FAI, villes et fuseaux horaires sans clés d’API payantes.',
    educationalConcept: 'Enseigne la cartographie d’infrastructure réseau, la géolocalisation d’adresses IP publiques et l’analyse des tables de routage BGP.',
    stats: {
      cyberDamage: 70,
      rangeBonus: 80,
      hackingSpeedBonus: 45,
      critChance: 12
    },
    passiveAbility: {
      name: 'Triangulation IP Immédiate',
      description: 'Révèle les positions exactes de toutes les unités ennemies dissimulées sur la carte tactique de Montréal.'
    },
    icon: 'MapPin'
  },
  {
    id: 'elite_sherlock_recon',
    name: 'Sherlock // Chasseur d’Empreintes Numériques Multi-Réseaux',
    type: 'elite_hacker_weapon',
    slot: 'chip',
    rarity: 'legendary',
    levelReq: 9,
    btcValue: 32000,
    githubUrl: 'https://github.com/sherlock-project/sherlock.git',
    realWorldSpecs: 'Outil d’investigation OSINT asynchrone énumérant l’existence d’un nom d’utilisateur à travers plus de 400 plateformes et réseaux sociaux mondiaux.',
    educationalConcept: 'Apprentissage de la corrélation d’identités numériques, de l’hygiène de pseudonymat et de la réduction de l’empreinte de surface d’attaque personnelle.',
    stats: {
      cyberDamage: 95,
      psiDamage: 60,
      critChance: 20,
      critDamage: 60,
      hackingSpeedBonus: 50
    },
    passiveAbility: {
      name: 'Doxx Ciblé Sherlock',
      description: 'Supprime l’anonymat des commandants de Viktor Vance, réduisant leur résistance à toutes les attaques de 40%.'
    },
    icon: 'Search'
  },
  {
    id: 'elite_nmap_cyber_trident',
    name: 'Nmap Cyber-Trident (Scanner Furtif SYN & Détection d’OS)',
    type: 'elite_hacker_weapon',
    slot: 'weapon',
    rarity: 'epic',
    levelReq: 5,
    btcValue: 14000,
    realWorldSpecs: 'Moteur de balayage réseau en paquets bruts (Raw Sockets), empreinte TCP/IP OS, détection de bannières de services et scripts Lua NSE.',
    educationalConcept: 'Le couteau suisse incontournable de l’audit réseau : cartographie de topologie, découverte d’hôtes et audit des ports ouverts.',
    stats: {
      physicalDamage: 50,
      cyberDamage: 80,
      critChance: 14,
      critDamage: 40
    },
    passiveAbility: {
      name: 'Balayage Furtif SYN Scan',
      description: 'Identifie instantanément les services vulnérables sur les cibles pour désactiver leurs boucliers.'
    },
    icon: 'Activity'
  },
  {
    id: 'elite_ghidra_reverse_blade',
    name: 'Ghidra Reverse-Blade (Décompilateur SRE NSA)',
    type: 'elite_hacker_weapon',
    slot: 'weapon',
    rarity: 'legendary',
    levelReq: 14,
    btcValue: 45000,
    realWorldSpecs: 'Suite d’ingénierie inverse développée par la NSA avec désassembleur multi-architectures (x86, ARM, MIPS, RISC-V), décompilateur C et analyse de graphes.',
    educationalConcept: 'Étude du fonctionnement interne des exécutables binaires, recherche de vulnérabilités dans le code compilé et analyse de malwares.',
    stats: {
      physicalDamage: 90,
      cyberDamage: 120,
      psiDamage: 80,
      critChance: 25,
      critDamage: 80
    },
    passiveAbility: {
      name: 'Décompilation en Direct',
      description: 'Décompile les sorts et attaques des ennemis pour les annuler avant qu’ils ne touchent Thirty3.'
    },
    icon: 'FileCode'
  },
  {
    id: 'elite_wireshark_scythe',
    name: 'Wireshark Packet-Scythe (Analyseur Profond de Trames PCAP)',
    type: 'elite_hacker_weapon',
    slot: 'weapon',
    rarity: 'epic',
    levelReq: 7,
    btcValue: 22000,
    realWorldSpecs: 'Analyseur de protocoles réseau avec dissection approfondie de centaines de protocoles (TCP, UDP, TLS, HTTP/2, DNS) et filtrage BPF.',
    educationalConcept: 'Inspection minutieuse des communications réseau pour le débogage, l’analyse médico-légale (Forensics) et la détection d’intrusions.',
    stats: {
      physicalDamage: 60,
      cyberDamage: 90,
      psiDamage: 50,
      hackingSpeedBonus: 40
    },
    passiveAbility: {
      name: 'Capture de Trames PCAP Vampirique',
      description: 'Vole 8% de points de mana psychique et 5% de santé à chaque paquet réseau intercepté.'
    },
    icon: 'Radio'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SYSTÈME DE PROGRESSION, ÉCONOMIE BITCOIN (BTC) & BUTIN
// ═══════════════════════════════════════════════════════════════════════════════

export interface BitcoinWalletState {
  satoshis: number;
  totalEarnedSatoshis: number;
  unlockedHackIds: string[];
  unlockedArsenalIds: string[];
}

export const INITIAL_BITCOIN_WALLET: BitcoinWalletState = {
  satoshis: 15000, // Starting reserve (0.00015 BTC)
  totalEarnedSatoshis: 15000,
  unlockedHackIds: [
    'hack_market_data',
    'hack_economic_data',
    'hack_conflict_events',
    'hack_cyber_threats',
    'hack_health_signals',
    'hack_classify_event',
    'hack_extract_entities',
    'hack_satellite_skyfi_hd',
    'hack_dns_poisoning_defense'
  ],
  unlockedArsenalIds: [
    'glove_reso_pneumatic',
    'gadget_alfa_wifi_monitor'
  ]
};

// Formats Satoshis to BTC and friendly human format
export function formatSatoshis(sats: number): { satsFormatted: string; btcFormatted: string } {
  const satsFormatted = sats.toLocaleString('fr-CA') + ' sats';
  const btcValue = (sats / 100000000).toFixed(8);
  return {
    satsFormatted,
    btcFormatted: `${btcValue} BTC`
  };
}

// Calculate Bitcoin reward from enemy drops based on difficulty and level
export function calculateEnemyBtcDrop(enemyTier: 'normal' | 'elite' | 'boss', stageLevel: number): number {
  const baseSats = stageLevel * 120;
  if (enemyTier === 'boss') {
    return Math.floor(baseSats * 15 + Math.random() * 2000); // 3000 - 8000 sats
  }
  if (enemyTier === 'elite') {
    return Math.floor(baseSats * 4 + Math.random() * 500);   // 800 - 2000 sats
  }
  return Math.floor(baseSats + Math.random() * 150);         // 150 - 400 sats
}
