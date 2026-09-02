import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Globe, 
  Satellite, 
  Eye, 
  ShieldAlert, 
  Radio, 
  Layers, 
  Crosshair, 
  ExternalLink, 
  Maximize2, 
  RefreshCw, 
  Compass, 
  Activity, 
  Zap, 
  MapPin, 
  AlertTriangle, 
  Sliders, 
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  Tv,
  Anchor,
  Flame,
  Radiation,
  Plus,
  Minus,
  Home,
  Pin,
  Maximize,
  Volume2,
  Search,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { sound } from '../utils/audio';

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD MONITOR PRO — 1:1 REPLICA 3D GEOSPATIAL INTELLIGENCE GLOBE
// Accurate Landmasses, Real-World Conflicts, Military Bases, Nuclear, Waterways
// ═══════════════════════════════════════════════════════════════════════════════

export type IntelCategory = 'conflict' | 'base' | 'hotspot' | 'nuclear' | 'sanction' | 'waterway' | 'city';

export interface WorldMonitorPin {
  id: string;
  name: string;
  category: IntelCategory;
  lat: number;
  lng: number;
  type: 'red_triangle' | 'yellow_circle' | 'blue_triangle' | 'anchor' | 'amber_diamond' | 'city_pin' | 'pulsing_ring';
  threatLevel: 'INFO' | 'MOYEN' | 'ÉLEVÉ' | 'CRITIQUE' | 'ALPHA';
  details: string;
  source: string;
  timestamp: string;
  country?: string;
  casualties?: string;
  vesselsCount?: number;
  status: string;
}

// ── Jeu de Données Géopolitiques & Renseignement Mondial ──
export const WORLD_MONITOR_INTEL_PINS: WorldMonitorPin[] = [
  // ── Zones de Conflits Actifs & Frappes (Triangles Rouges & Cercles d'Alerte) ──
  {
    id: 'conf_sudan',
    name: 'Soudan // Khartoum & Corridor Mer Rouge',
    category: 'conflict',
    lat: 15.5007,
    lng: 32.5599,
    type: 'pulsing_ring',
    threatLevel: 'CRITIQUE',
    country: 'Soudan',
    details: 'Affrontements armés intenses, frappes de drones FPV sur les dépôts de carburant et exode civil.',
    source: 'ACLED / Sentinel-2 Sat',
    timestamp: 'Il y a 14 min',
    casualties: '42 victimes (24h)',
    status: 'ZONE HOSTILE ALPHA'
  },
  {
    id: 'conf_gaza_redsea',
    name: 'Bassin Mer Rouge // Tirs Balistiques Antinavires',
    category: 'conflict',
    lat: 13.8,
    lng: 42.8,
    type: 'red_triangle',
    threatLevel: 'CRITIQUE',
    country: 'Yémen / Mer Rouge',
    details: 'Attaques coordonnées de drones de surface autonomes et missiles de croisière sur les navires marchands.',
    source: 'UKMTO / US CENTCOM',
    timestamp: 'Il y a 28 min',
    vesselsCount: 14,
    status: 'ALERTE MAXIMUM'
  },
  {
    id: 'conf_ukraine_east',
    name: 'Front Est // Donbass & Ligne Pokrovsk',
    category: 'conflict',
    lat: 48.28,
    lng: 37.18,
    type: 'red_triangle',
    threatLevel: 'CRITIQUE',
    country: 'Ukraine',
    details: 'Duels d’artillerie lourde, guerre électronique EW et saturation par micro-drones thermiques.',
    source: 'DeepState / ISW Intel',
    timestamp: 'Il y a 6 min',
    status: 'COMBATS ACTIFS'
  },
  {
    id: 'conf_blacksea_sevastopol',
    name: 'Sébastopol // Base Navale Mer Noire',
    category: 'conflict',
    lat: 44.6167,
    lng: 33.5254,
    type: 'red_triangle',
    threatLevel: 'ÉLEVÉ',
    country: 'Crimée',
    details: 'Interceptions de drones sous-marins Magura V5 par la défense côtière.',
    source: 'OpenClaw OSINT',
    timestamp: 'Il y a 1h',
    status: 'ALERTE AÉRIENNE'
  },
  {
    id: 'conf_lebanon_border',
    name: 'Ligne Bleue // Sud-Liban & Galilée',
    category: 'conflict',
    lat: 33.15,
    lng: 35.35,
    type: 'red_triangle',
    threatLevel: 'CRITIQUE',
    country: 'Liban / Israël',
    details: 'Tirs de roquettes d’artillerie et frappes chirurgicales aériennes sur les infrastructures C2.',
    source: 'IDF Spokesperson / UNIFIL',
    timestamp: 'Il y a 35 min',
    status: 'BOMBARDEMENTS'
  },

  // ── Hotspots & Marchés / Alertes Économiques (Cercles Jaunes & Diamants) ──
  {
    id: 'hot_hormuz',
    name: 'Détroit d’Ormuz // Surveillance Pétrolière',
    category: 'hotspot',
    lat: 26.56,
    lng: 56.25,
    type: 'yellow_circle',
    threatLevel: 'ÉLEVÉ',
    country: 'Iran / Oman',
    details: '21% du pétrole brut mondial transite ici. 138 supertankers sous surveillance AIS.',
    source: 'World Monitor Maritime Tracker',
    timestamp: 'En direct',
    vesselsCount: 138,
    status: 'TRAFIC CRITIQUE'
  },
  {
    id: 'hot_taiwan_strait',
    name: 'Détroit de Taïwan // Fonderies TSMC & Zone ADIZ',
    category: 'hotspot',
    lat: 24.2,
    lng: 119.8,
    type: 'yellow_circle',
    threatLevel: 'ÉLEVÉ',
    country: 'Taïwan',
    details: 'Incursions répétées de 32 aéronefs militaires dans la zone d’identification de défense aérienne.',
    source: 'MND Taiwan / SkyFi 0.3m',
    timestamp: 'Il y a 45 min',
    status: 'SURVEILLANCE RENFORCÉE'
  },
  {
    id: 'hot_south_china_sea',
    name: 'Récif Second Thomas // Îles Spratleys',
    category: 'hotspot',
    lat: 9.75,
    lng: 115.85,
    type: 'yellow_circle',
    threatLevel: 'ÉLEVÉ',
    country: 'Philippines / Chine',
    details: 'Canons à eau et barrages de garde-côtes sur les missions de réapprovisionnement.',
    source: 'PCG / Satellite Sentinel-1',
    timestamp: 'Il y a 2h',
    status: 'BLOCUS TACTIQUE'
  },

  // ── Sites Nucléaires & Radiologiques (Symboles Jaunes / Nuances Radioactives) ──
  {
    id: 'nuc_zaporizhzhia',
    name: 'Centrale Nucléaire de Zaporijjia (ZNPP)',
    category: 'nuclear',
    lat: 47.51,
    lng: 34.58,
    type: 'yellow_circle',
    threatLevel: 'CRITIQUE',
    country: 'Ukraine',
    details: 'Plus grande centrale nucléaire d’Europe (6 réacteurs). Surveillance des lignes à haute tension.',
    source: 'IAEA / AIEA Télémétrie',
    timestamp: 'Il y a 10 min',
    status: 'SÉCURITÉ FRAGILE'
  },
  {
    id: 'nuc_natanz',
    name: 'Complexe d’Enrichissement d’Uranium de Natanz',
    category: 'nuclear',
    lat: 33.72,
    lng: 51.73,
    type: 'yellow_circle',
    threatLevel: 'ÉLEVÉ',
    country: 'Iran',
    details: 'Cascades de centrifugeuses IR-6 souterraines. Défense anti-aérienne S-300 active.',
    source: 'ISIS Intel / Maxar Optical',
    timestamp: 'Il y a 3h',
    status: 'FORTIFIÉ'
  },
  {
    id: 'nuc_yongbyon',
    name: 'Centre de Recherche Nucléaire de Yongbyon',
    category: 'nuclear',
    lat: 39.8,
    lng: 125.75,
    type: 'yellow_circle',
    threatLevel: 'ÉLEVÉ',
    country: 'Corée du Nord',
    details: 'Réacteur de 5 MWe en activité. Rejets thermiques visibles sur imagerie infrarouge.',
    source: '38 North / Sentinel SAR',
    timestamp: 'Il y a 4h',
    status: 'PRODUCTION DE PLUTONIUM'
  },

  // ── Bases Militaires Stratégiques (Triangles Bleus) ──
  {
    id: 'base_diego_garcia',
    name: 'Base Stratégique Navale // Diego Garcia',
    category: 'base',
    lat: -7.3195,
    lng: 72.4229,
    type: 'blue_triangle',
    threatLevel: 'INFO',
    country: 'Océan Indien',
    details: 'Piste pour bombardiers stratégiques B-52/B-2 et soutien logistique pour les flottes océaniques.',
    source: 'US Navy / DoD',
    timestamp: 'En direct',
    status: 'OPÉRATIONNEL'
  },
  {
    id: 'base_ramstein',
    name: 'Base Aérienne de Ramstein // Commandement OTAN',
    category: 'base',
    lat: 49.4369,
    lng: 7.6003,
    type: 'blue_triangle',
    threatLevel: 'INFO',
    country: 'Allemagne',
    details: 'Hub logistique aérien principal et centre de contrôle des opérations de drones européens.',
    source: 'USAFE / NATO HQ',
    timestamp: 'En direct',
    status: 'TRAFIC AÉRIEN MAX'
  },
  {
    id: 'base_guam',
    name: 'Base Aérienne Andersen & Base Navale de Guam',
    category: 'base',
    lat: 13.58,
    lng: 144.92,
    type: 'blue_triangle',
    threatLevel: 'INFO',
    country: 'Guam (USA)',
    details: 'Défense antimissile THAAD et sous-marins nucléaires d’attaque classe Virginia.',
    source: 'US INDOPACOM',
    timestamp: 'En direct',
    status: 'PRÊT AU COMBAT'
  },
  {
    id: 'base_djibouti',
    name: 'Base Navale Multinationale // Djibouti (Doraleh)',
    category: 'base',
    lat: 11.59,
    lng: 43.15,
    type: 'blue_triangle',
    threatLevel: 'MOYEN',
    country: 'Djibouti',
    details: 'Seul point de coexistence directe des bases US (Lemonnier), chinoise (PLA Navy) et française.',
    source: 'GeoInt SkyFi',
    timestamp: 'Il y a 1h',
    status: 'SURVEILLANCE CROISÉE'
  },
  {
    id: 'base_norfolk',
    name: 'Naval Station Norfolk // Plus Grande Base Navale Mondiale',
    category: 'base',
    lat: 36.95,
    lng: -76.3,
    type: 'blue_triangle',
    threatLevel: 'INFO',
    country: 'USA',
    details: 'Port d’attache de 5 porte-avions nucléaires classe Nimitz et Gerald R. Ford.',
    source: 'US Fleet Forces',
    timestamp: 'En direct',
    status: 'MAINTENANCE FLOTTE'
  },

  // ── Chokepoints Maritimes Clés (Symboles Ancres) ──
  {
    id: 'chk_suez',
    name: 'Canal de Suez // Égypte',
    category: 'waterway',
    lat: 30.58,
    lng: 32.57,
    type: 'anchor',
    threatLevel: 'MOYEN',
    country: 'Égypte',
    details: '82 porte-conteneurs en transit. Revenus en baisse suite au détour par le Cap de Bonne-Espérance.',
    source: 'Suez Canal Authority',
    timestamp: 'En direct',
    vesselsCount: 82,
    status: 'CONVOIS EN ROUTE'
  },
  {
    id: 'chk_malacca',
    name: 'Détroit de Malacca // Singapour',
    category: 'waterway',
    lat: 1.43,
    lng: 102.89,
    type: 'anchor',
    threatLevel: 'ÉLEVÉ',
    country: 'Singapour / Malaisie',
    details: 'Densité de trafic la plus élevée au monde. Surveillance des pirateries et brouillage GPS.',
    source: 'ReCAAP ISC',
    timestamp: 'En direct',
    vesselsCount: 224,
    status: 'TRAFIC SATURÉ'
  },
  {
    id: 'chk_panama',
    name: 'Canal de Panama // Écluses Miraflores',
    category: 'waterway',
    lat: 9.08,
    lng: -79.68,
    type: 'anchor',
    threatLevel: 'INFO',
    country: 'Panama',
    details: 'Niveaux d’eau du lac Gatún rétablis à 26.8m. Tirant d’eau autorisé à 50 pieds.',
    source: 'ACP Panama',
    timestamp: 'En direct',
    vesselsCount: 36,
    status: 'OPÉRATIONS NORMALES'
  },
  {
    id: 'chk_gibraltar',
    name: 'Détroit de Gibraltar',
    category: 'waterway',
    lat: 35.96,
    lng: -5.60,
    type: 'anchor',
    threatLevel: 'INFO',
    country: 'Espagne / Maroc',
    details: 'Surveillance des routes migratoires et passage des sous-marins de la flotte atlantique.',
    source: 'Frontex / SIVE',
    timestamp: 'En direct',
    vesselsCount: 110,
    status: 'RADAR ACTIF'
  },
  {
    id: 'chk_bosphorus',
    name: 'Détroit du Bosphore & Dardanelles',
    category: 'waterway',
    lat: 41.11,
    lng: 29.07,
    type: 'anchor',
    threatLevel: 'MOYEN',
    country: 'Turquie',
    details: 'Application de la Convention de Montreux régulant le passage des navires de guerre vers la Mer Noire.',
    source: 'Turkish Maritime Admin',
    timestamp: 'En direct',
    vesselsCount: 65,
    status: 'CONTRÔLE STRICT'
  },

  // ── 4 Villes du Jeu Montréal 2033 (Cyberpunk ARPG) ──
  {
    id: 'city_montreal',
    name: '🇨🇦 Montréal // Secteur 01 (Base de Thirty3)',
    category: 'city',
    lat: 45.5017,
    lng: -73.5673,
    type: 'city_pin',
    threatLevel: 'ÉLEVÉ',
    country: 'Québec, Canada',
    details: 'Quartier général des insurgés, réseau RÉSO, serveur Sophia Cloud et patrouilles SPVM-Prime.',
    source: 'Deus Ex Sophia AI',
    timestamp: 'Temps Réel 2033',
    status: 'ACTE 1 // QUARTIER GÉNÉRAL'
  },
  {
    id: 'city_losangeles',
    name: '🇺🇸 Los Angeles // Secteur 02 (Mégapole Cyber-Corpo)',
    category: 'city',
    lat: 34.0522,
    lng: -118.2437,
    type: 'city_pin',
    threatLevel: 'CRITIQUE',
    country: 'Californie, USA',
    details: 'Bastion corpo de Viktor Vance, réseau de serveurs quantiques et tours orbitales de diffusion.',
    source: 'ShadowBroker Recon',
    timestamp: 'Temps Réel 2033',
    status: 'ACTE 2 // BASTION CORPO'
  },
  {
    id: 'city_rome',
    name: '🇮🇹 Rome // Secteur 03 (Sanctuaire Cyber-Vatican)',
    category: 'city',
    lat: 41.9028,
    lng: 12.4964,
    type: 'city_pin',
    threatLevel: 'CRITIQUE',
    country: 'Italie',
    details: 'Catacombes occultes cybernétiques, reliques sacrées et nœud de transsubstantiation quantique.',
    source: 'Vatican Cyber-Archives',
    timestamp: 'Temps Réel 2033',
    status: 'ACTE 3 // SANCTUAIRE OCCULTE'
  },
  {
    id: 'city_antarctica',
    name: '🇦🇶 Antarctique // Secteur 04 (Citadelle de l’AntiChrist)',
    category: 'city',
    lat: -82.8628,
    lng: 135.0000,
    type: 'city_pin',
    threatLevel: 'ALPHA',
    country: 'Pôle Sud',
    details: 'Sanctuaire cryogénique final sous la glace éternelle. Antre du Boss Final AntiChrist.',
    source: 'HigherSelf Remote Viewing',
    timestamp: 'Temps Réel 2033',
    status: 'ACTE 4 // BOSS FINAL ANTICHRIST'
  }
];

interface PlanetaryGlobe3DProps {
  activeToolId?: 'world_monitor' | 'shadowbroker' | 'god_eye_view' | 'stm_transit' | 'maxintel_academy';
  onSelectLocation?: (pin: WorldMonitorPin) => void;
  onOpenExternalApp?: (url: string) => void;
  className?: string;
  defaultAppUrl?: string;
}

export const PlanetaryGlobe3D: React.FC<PlanetaryGlobe3DProps> = ({
  activeToolId = 'world_monitor',
  onSelectLocation,
  onOpenExternalApp,
  className = '',
  defaultAppUrl = 'http://localhost:3000'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // État UI et Filtres de Couches (identique aux toggles de World Monitor de l'image)
  const [viewDimension, setViewDimension] = useState<'3D' | '2D'>('3D');
  const [selectedPin, setSelectedPin] = useState<WorldMonitorPin | null>(WORLD_MONITOR_INTEL_PINS[0]);
  const [hoveredPin, setHoveredPin] = useState<WorldMonitorPin | null>(null);
  const [isCouchesOpen, setIsCouchesOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraDistance, setCameraDistance] = useState(26);
  const [utcTime, setUtcTime] = useState<string>(new Date().toUTCString().replace('GMT', 'UTC'));
  const [viewMode, setViewMode] = useState<'globe' | 'iframe' | 'split'>('globe');

  const WORLD_MONITOR_DEFAULT_URL = 'http://localhost:3000/?lat=0.0019&lon=0.0000&zoom=1.00&view=global&timeRange=7d&layers=outages%2Cnatural';
  const SHADOWBROKER_DEFAULT_URL = 'http://127.0.0.1:3001/';
  const GOD_EYE_VIEW_DEFAULT_URL = 'http://localhost:4173/#v=2&lat=45.5017&lon=-73.5673&alt=450&heading=15&pitch=-30&roll=360&style=normal&bloom=0&sharpen=0&bi=0&bv=2&si=49&hud=tactical&hv=1&dm=DENSE&dd=75&da=elastic&kf=7&ko=1&cr=0&sc=1&scf=11&map=osm&l=e.x&lo=f.e.1_f.m.a&ui=c.c.1_c.p.0_l.c.1_l.p.0_d.c.0_v.c.0_r.c.1_s.c.0_g.c.0_p.c.0_m.c.0';

  const getActiveAppInfo = () => {
    switch (activeToolId) {
      case 'shadowbroker':
        return {
          name: 'SHADOWBROKER',
          port: 3001,
          url: SHADOWBROKER_DEFAULT_URL,
          title: 'Ouvrir ShadowBroker OSINT (http://127.0.0.1:3001/) dans un nouvel onglet',
          btnHeader: 'OUVRIR SHADOWBROKER (3001)',
          btnCard: 'Ouvrir dans ShadowBroker'
        };
      case 'god_eye_view':
        return {
          name: 'GOD EYE',
          port: 4173,
          url: GOD_EYE_VIEW_DEFAULT_URL,
          title: 'Ouvrir God Eye View 3D Matrix (http://localhost:4173/) dans un nouvel onglet',
          btnHeader: 'OUVRIR GOD EYE (4173)',
          btnCard: 'Ouvrir dans God Eye View'
        };
      case 'maxintel_academy':
        return {
          name: 'MAXINTEL',
          port: 443,
          url: 'https://maxintel.org/',
          title: 'Ouvrir MaxIntel OSINT Academy (https://maxintel.org/)',
          btnHeader: 'OUVRIR MAXINTEL.ORG',
          btnCard: 'Ouvrir dans MaxIntel'
        };
      case 'world_monitor':
      default:
        return {
          name: 'WORLD MONITOR',
          port: 3000,
          url: WORLD_MONITOR_DEFAULT_URL,
          title: 'Ouvrir World Monitor (http://localhost:3000) dans un nouvel onglet',
          btnHeader: 'OUVRIR WORLD MONITOR (3000)',
          btnCard: 'Ouvrir dans World Monitor'
        };
    }
  };

  const activeAppInfo = getActiveAppInfo();

  // Couches activées (exactement les paramètres de la capture d'écran: layers=conflicts,bases,hotspots,nuclear,sanctions,weather,economic,waterways)
  const [layers, setLayers] = useState({
    conflicts: true,
    bases: true,
    hotspots: true,
    nuclear: true,
    sanctions: true,
    weather: true,
    economic: true,
    waterways: true,
    gameCities: true,
    countryBorders: true,
    cyberArcs: true
  });

  // Mise à jour de l'horloge UTC en direct
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const str = d.toUTCString().replace('GMT', 'UTC');
      setUtcTime(str);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Conversion Lat/Lng en Coordonnées Sphériques 3D
  const latLngToVec3 = useCallback((lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // GÉNÉRATION DE TEXTURE HAUTE FIDÉLITÉ (COASTLINES RÉALISTES + NUIT)
  // ═══════════════════════════════════════════════════════════════════
  const createWorldMonitorHighResEarthTextures = () => {
    const width = 4096;
    const height = 2048;

    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = width;
    earthCanvas.height = height;
    const ctx = earthCanvas.getContext('2d')!;

    // Fond océanique bleu nuit profond / noir spatial fidèle à la capture
    ctx.fillStyle = '#020612';
    ctx.fillRect(0, 0, width, height);

    // Dégradé atmosphérique subtil
    const oceanGrad = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, width);
    oceanGrad.addColorStop(0, '#040d24');
    oceanGrad.addColorStop(0.7, '#020614');
    oceanGrad.addColorStop(1, '#01030a');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // Fonction de dessin géométrique des continents & îles
    const project = (lng: number, lat: number): [number, number] => [
      (lng / 360 + 0.5) * width,
      (-lat / 180 + 0.5) * height
    ];

    const drawPolygon = (pts: [number, number][], fillColor: string, strokeColor: string, lineWidth: number = 1.5) => {
      ctx.beginPath();
      pts.forEach(([lng, lat], idx) => {
        const [x, y] = project(lng, lat);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    // Masses Continentales Haute Définition (Couleur bleu-gris/cyan foncé)
    const LAND_COLOR = '#09152b';
    const COAST_COLOR = 'rgba(0, 243, 255, 0.4)';

    // Amérique du Nord & Groenland
    drawPolygon([
      [-168, 65], [-160, 71], [-130, 70], [-100, 74], [-70, 70], [-55, 60], [-52, 47],
      [-65, 44], [-70, 42], [-75, 35], [-80, 25], [-82, 23], [-97, 26], [-97, 20],
      [-88, 15], [-77, 8], [-83, 8], [-92, 14], [-105, 20], [-115, 30], [-124, 38],
      [-125, 49], [-135, 57], [-150, 60], [-165, 60], [-168, 65]
    ], LAND_COLOR, COAST_COLOR, 2);

    // Groenland
    drawPolygon([
      [-50, 83], [-20, 83], [-20, 70], [-35, 60], [-55, 60], [-60, 75], [-50, 83]
    ], '#0a1a33', COAST_COLOR);

    // Amérique du Sud
    drawPolygon([
      [-77, 8], [-55, 6], [-50, 0], [-35, -5], [-35, -10], [-40, -22], [-50, -30],
      [-58, -35], [-65, -55], [-75, -55], [-73, -40], [-70, -20], [-80, -5], [-77, 8]
    ], LAND_COLOR, COAST_COLOR, 2);

    // Europe
    drawPolygon([
      [-10, 36], [0, 38], [15, 38], [25, 35], [30, 42], [30, 46], [20, 45], [12, 44],
      [5, 44], [-2, 48], [-5, 48], [2, 51], [8, 54], [10, 58], [25, 60], [30, 70],
      [15, 70], [5, 60], [0, 50], [-5, 43], [-10, 36]
    ], LAND_COLOR, COAST_COLOR, 2);

    // Scandinavie
    drawPolygon([
      [5, 58], [12, 56], [20, 60], [28, 70], [20, 71], [10, 64], [5, 58]
    ], LAND_COLOR, COAST_COLOR);

    // Royaume-Uni & Irlande
    drawPolygon([[-5, 50], [1.5, 51], [0, 58], [-5, 58], [-5, 50]], LAND_COLOR, COAST_COLOR);
    drawPolygon([[-10, 51], [-6, 51], [-6, 55], [-10, 55], [-10, 51]], LAND_COLOR, COAST_COLOR);

    // Afrique (Masse Principale)
    drawPolygon([
      [-17, 15], [-17, 28], [-5, 36], [10, 37], [25, 32], [32, 31], [35, 28], [43, 12],
      [51, 12], [42, -5], [35, -25], [28, -34], [18, -34], [12, -15], [9, 4], [0, 6],
      [-10, 5], [-17, 15]
    ], LAND_COLOR, COAST_COLOR, 2);

    // Madagascar
    drawPolygon([[43, -12], [50, -14], [47, -25], [43, -25], [43, -12]], LAND_COLOR, COAST_COLOR);

    // Asie (Russie, Chine, Inde, Asie du Sud-Est, Moyen-Orient)
    drawPolygon([
      [30, 42], [40, 42], [50, 40], [60, 40], [70, 40], [80, 40], [90, 45], [110, 40],
      [130, 42], [140, 50], [160, 55], [175, 65], [180, 70], [130, 75], [70, 73], [40, 68],
      [35, 55], [30, 42]
    ], LAND_COLOR, COAST_COLOR, 2);

    // Inde & Péninsule Arabique
    drawPolygon([[35, 30], [55, 25], [60, 22], [55, 12], [45, 13], [35, 30]], LAND_COLOR, COAST_COLOR);
    drawPolygon([[68, 24], [78, 8], [88, 22], [80, 28], [68, 24]], LAND_COLOR, COAST_COLOR);

    // Asie de l'Est & Japon
    drawPolygon([[100, 20], [110, 20], [120, 25], [122, 38], [118, 40], [100, 20]], LAND_COLOR, COAST_COLOR);
    drawPolygon([[130, 31], [141, 38], [142, 44], [135, 35], [130, 31]], LAND_COLOR, COAST_COLOR); // Japon
    drawPolygon([[120, 22], [122, 25], [120, 25], [120, 22]], LAND_COLOR, '#00f3ff'); // Taïwan

    // Australie & Nouvelle-Zélande
    drawPolygon([
      [114, -22], [125, -14], [135, -12], [148, -20], [153, -28], [145, -38],
      [135, -35], [115, -35], [114, -22]
    ], LAND_COLOR, COAST_COLOR, 2);
    drawPolygon([[168, -38], [178, -38], [174, -46], [168, -46]], LAND_COLOR, COAST_COLOR);

    // Antarctique (Calotte Glaciaire Polaire)
    drawPolygon([
      [-180, -70], [180, -70], [180, -90], [-180, -90]
    ], '#0d2244', '#00f3ff', 2);

    // Grille de coordonnées Latitude / Longitude (Lignes subtiles comme sur World Monitor)
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += width / 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += height / 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // ── Clusters de Lumières Nocturnes des Métropoles (City Night Lights) ──
    // Dense concentration de points dorés et cyan le long des côtes
    const drawCityCluster = (centerLng: number, centerLat: number, radiusPx: number, density: number, color: string) => {
      const [cx, cy] = project(centerLng, centerLat);
      for (let i = 0; i < density; i++) {
        const ang = Math.random() * Math.PI * 2;
        const rad = Math.pow(Math.random(), 1.5) * radiusPx;
        const x = cx + Math.cos(ang) * rad;
        const y = cy + Math.sin(ang) * rad * 0.8;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 0.8 + Math.random() * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Villes majeures illuminées (Europe, US East, US West, Japon, Asie, Golfe)
    drawCityCluster(-74, 40.7, 45, 80, '#ffea75');   // US East Coast (NYC / MTL / Boston)
    drawCityCluster(-118, 34, 35, 60, '#ffea75');   // US West (LA / SF)
    drawCityCluster(2.3, 48.8, 50, 110, '#ffea75');  // Europe Occidentale (Paris, Londres, Francfort)
    drawCityCluster(139.7, 35.6, 40, 90, '#00f3ff'); // Tokyo Megacity
    drawCityCluster(121.5, 31.2, 45, 85, '#ffea75'); // Shanghai / Côte Est Chine
    drawCityCluster(55.3, 25.2, 25, 45, '#00f3ff');  // Dubaï / Golfe
    drawCityCluster(77.2, 28.6, 35, 55, '#ffea75');  // Inde du Nord
    drawCityCluster(37.6, 55.7, 30, 50, '#ffea75');  // Moscou
    drawCityCluster(12.5, 41.9, 25, 40, '#ff00ff');  // Rome Cyber-Vatican
    drawCityCluster(-73.5, 45.5, 20, 35, '#00f3ff'); // Montréal

    const earthTexture = new THREE.CanvasTexture(earthCanvas);
    earthTexture.anisotropy = 16;
    return earthTexture;
  };

  // ═══════════════════════════════════════════════════════════════════
  // THREE.JS 3D SCENE & INTERACTION ENGINE
  // ═══════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (viewMode === 'iframe') return;
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scène & Caméra
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020612);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, cameraDistance);
    camera.lookAt(0, 0, 0);

    // 2. Renderer WebGL Haute Performance
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current || undefined,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Éclairage Spatial (Soleil Directionnel + Halo Rim Cyan)
    const ambientLight = new THREE.AmbientLight(0x101a35, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(40, 20, 50);
    scene.add(sunLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00f3ff, 1.8);
    cyanRimLight.position.set(-50, 10, -30);
    scene.add(cyanRimLight);

    // 4. Sphère Terrestre Principale
    const globeRadius = 10;
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Inclinaison axiale réaliste de la Terre (~23.4°)
    globeGroup.rotation.z = THREE.MathUtils.degToRad(23.4);

    const earthTex = createWorldMonitorHighResEarthTextures();
    const earthGeo = new THREE.SphereGeometry(globeRadius, 96, 96);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.7,
      metalness: 0.2,
      emissive: new THREE.Color(0x020a1c),
      emissiveIntensity: 0.5
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // Atmosphère Lumineuse (Fresnel Glow Rim)
    const atmosGeo = new THREE.SphereGeometry(globeRadius * 1.025, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.0, 0.95, 1.0, 1.0) * intensity * 0.7;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // 5. Polygone de Conflit Délimité en Rouge (ex: Région Mer Rouge / Soudan comme sur la photo)
    const conflictPolyCoords: [number, number][] = [
      [22, 10], [24, 22], [36, 22], [38, 18], [36, 12], [32, 4], [22, 10]
    ];
    const polyShapePoints = conflictPolyCoords.map(([lng, lat]) => latLngToVec3(lat, lng, globeRadius * 1.008));
    const polyGeo = new THREE.BufferGeometry().setFromPoints(polyShapePoints);
    const polyLineMat = new THREE.LineBasicMaterial({ color: 0xff0044, linewidth: 2 });
    const polyLine = new THREE.Line(polyGeo, polyLineMat);
    globeGroup.add(polyLine);

    // Remplissage semi-transparent du polygone de conflit
    const polyTriGeo = new THREE.BufferGeometry();
    const polyVerts: number[] = [];
    const centerPoint = latLngToVec3(14, 28, globeRadius * 1.005);
    for (let i = 0; i < polyShapePoints.length - 1; i++) {
      polyVerts.push(centerPoint.x, centerPoint.y, centerPoint.z);
      polyVerts.push(polyShapePoints[i].x, polyShapePoints[i].y, polyShapePoints[i].z);
      polyVerts.push(polyShapePoints[i+1].x, polyShapePoints[i+1].y, polyShapePoints[i+1].z);
    }
    polyTriGeo.setAttribute('position', new THREE.Float32BufferAttribute(polyVerts, 3));
    const polyTriMat = new THREE.MeshBasicMaterial({
      color: 0xff0033,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    const polyTriMesh = new THREE.Mesh(polyTriGeo, polyTriMat);
    globeGroup.add(polyTriMesh);

    // 6. Marqueurs & Icônes 3D World Monitor
    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);

    const pinRaycastTargets: { mesh: THREE.Mesh; data: WorldMonitorPin }[] = [];
    const animatedPulseRings: { mesh: THREE.Mesh; baseScale: number }[] = [];

    WORLD_MONITOR_INTEL_PINS.forEach((pin) => {
      // Filtrage par couches
      if (pin.category === 'conflict' && !layers.conflicts) return;
      if (pin.category === 'base' && !layers.bases) return;
      if (pin.category === 'hotspot' && !layers.hotspots) return;
      if (pin.category === 'nuclear' && !layers.nuclear) return;
      if (pin.category === 'waterway' && !layers.waterways) return;
      if (pin.category === 'city' && !layers.gameCities) return;

      const pos = latLngToVec3(pin.lat, pin.lng, globeRadius * 1.015);
      const isPulsing = pin.type === 'pulsing_ring' || pin.threatLevel === 'CRITIQUE' || pin.threatLevel === 'ALPHA';

      let markerMesh: THREE.Mesh;
      let markerColor = 0x00f3ff;

      if (pin.type === 'red_triangle') {
        // Triangle Rouge (Zone de Combat)
        markerColor = 0xff0033;
        const triGeo = new THREE.ConeGeometry(0.35, 0.6, 3);
        const triMat = new THREE.MeshBasicMaterial({ color: markerColor });
        markerMesh = new THREE.Mesh(triGeo, triMat);
      } else if (pin.type === 'yellow_circle' || pin.type === 'pulsing_ring') {
        // Cercle Jaune / Symbole d'Alerte Nucléaire / Menace
        markerColor = 0xffea00;
        const octGeo = new THREE.OctahedronGeometry(0.28, 0);
        const octMat = new THREE.MeshBasicMaterial({ color: markerColor });
        markerMesh = new THREE.Mesh(octGeo, octMat);
      } else if (pin.type === 'blue_triangle') {
        // Triangle Bleu (Base Militaire)
        markerColor = 0x38bdf8;
        const baseGeo = new THREE.ConeGeometry(0.3, 0.5, 4);
        const baseMat = new THREE.MeshBasicMaterial({ color: markerColor });
        markerMesh = new THREE.Mesh(baseGeo, baseMat);
      } else if (pin.type === 'anchor') {
        // Ancre Bleue / Blanche (Chokepoint Maritime)
        markerColor = 0x67e8f9;
        const ancGeo = new THREE.TorusGeometry(0.25, 0.08, 8, 16);
        const ancMat = new THREE.MeshBasicMaterial({ color: markerColor });
        markerMesh = new THREE.Mesh(ancGeo, ancMat);
      } else {
        // Pin Ville Montréal 2033 (Néon Cyan / Rouge)
        markerColor = pin.threatLevel === 'ALPHA' ? 0xff0055 : 0x00f3ff;
        const cityGeo = new THREE.CylinderGeometry(0.1, 0.35, 0.9, 8);
        const cityMat = new THREE.MeshStandardMaterial({
          color: markerColor,
          emissive: new THREE.Color(markerColor),
          emissiveIntensity: 0.9
        });
        markerMesh = new THREE.Mesh(cityGeo, cityMat);
      }

      markerMesh.position.copy(pos);
      markerMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      markerGroup.add(markerMesh);

      // Anneau d'onde de choc pulsante (Shockwave Ring)
      if (isPulsing) {
        const ringGeo = new THREE.RingGeometry(0.35, 0.5, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: markerColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos.clone().multiplyScalar(1.005));
        ringMesh.quaternion.copy(markerMesh.quaternion);
        markerGroup.add(ringMesh);
        animatedPulseRings.push({ mesh: ringMesh, baseScale: 1.0 });
      }

      pinRaycastTargets.push({ mesh: markerMesh, data: pin });
    });

    // 7. Contrôles Interactifs à la Souris (Drag libre, Zoom, Raycasting)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        
        globeGroup.rotation.y += deltaX * 0.005;
        globeGroup.rotation.x += deltaY * 0.005;

        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Détection de survol (Hover tooltip)
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(pinRaycastTargets.map(t => t.mesh));
        if (intersects.length > 0) {
          const hit = pinRaycastTargets.find(t => t.mesh === intersects[0].object);
          if (hit) setHoveredPin(hit.data);
        } else {
          setHoveredPin(null);
        }
      }
    };

    const onMouseUp = () => { isDragging = false; };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pinRaycastTargets.map(t => t.mesh));

      if (intersects.length > 0) {
        const hit = pinRaycastTargets.find(t => t.mesh === intersects[0].object);
        if (hit) {
          sound.playLoot();
          setSelectedPin(hit.data);
          if (onSelectLocation) onSelectLocation(hit.data);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCameraDistance(prev => {
        const next = Math.max(14, Math.min(48, prev + e.deltaY * 0.02));
        camera.position.z = next;
        return next;
      });
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 8. Boucle de Rendu
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Rotation automatique du globe
      if (autoRotate && !isDragging) {
        globeGroup.rotation.y += 0.0015;
      }

      // Animation des anneaux d'ondes de choc
      animatedPulseRings.forEach(r => {
        const scale = 1.0 + Math.sin(time * 4) * 0.45;
        r.mesh.scale.set(scale, scale, 1);
        (r.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0.2, 1.0 - (scale - 1.0));
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [viewMode, autoRotate, layers, cameraDistance, latLngToVec3, onSelectLocation]);

  // Handler pour lancer l'application externe réelle avec l'URL exacte du service
  const handleLaunchExternalApp = () => {
    sound.playVictory();
    const url = activeAppInfo.url;
    if (onOpenExternalApp) {
      onOpenExternalApp(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`relative w-full h-full bg-[#020612] text-white flex flex-col overflow-hidden font-mono select-none ${className}`}>
      
      {/* ── TOP HEADER BAR (EXACTEMENT COMME WORLD MONITOR v2.10.0) ── */}
      <header className="px-3 sm:px-4 py-2 bg-[#060b17] border-b border-[#00f3ff22] flex items-center justify-between gap-2 shrink-0 z-30 shadow-2xl">
        
        {/* Left Section: Icons & Branding */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button 
            onClick={handleLaunchExternalApp}
            className="px-2 py-1 bg-[#00ff4118] border border-[#00ff4155] hover:border-[#00ff41] text-[#00ff41] text-xs font-orbitron font-bold rounded flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_8px_rgba(0,255,65,0.3)] shrink-0"
            title={activeAppInfo.title}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-black tracking-wider">MONDE</span>
          </button>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="font-orbitron font-black text-sm text-white tracking-[0.25em] uppercase">
              MONITOR
            </span>
            <span className="text-[10px] text-gray-500 font-mono hidden md:inline">
              v2.10.0 @eliehabib
            </span>
            <span className="px-1.5 py-0.2 bg-[#00ff4122] text-[#00ff41] text-[9px] font-bold rounded border border-[#00ff4155] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
              EN DIRECT
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-black/50 px-2 py-0.5 rounded border border-white/10 text-xs">
            <span className="text-gray-400">Région :</span>
            <span className="text-[#00f3ff] font-bold">Mondial ▼</span>
          </div>
        </div>

        {/* Middle Section: UTC Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 font-mono tracking-wider">
          <Clock className="w-3.5 h-3.5 text-[#00f3ff]" />
          <span>{utcTime}</span>
        </div>

        {/* Right Section: 2D/3D Switcher, Fullscreen, Open In Browser */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center bg-black/60 p-0.5 rounded border border-white/10">
            <button
              onClick={() => {
                sound.playUiClick();
                setViewDimension('2D');
              }}
              className={`px-2 py-0.5 text-xs font-orbitron font-bold rounded transition-all cursor-pointer ${
                viewDimension === '2D' ? 'bg-[#00f3ff] text-black font-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => {
                sound.playUiClick();
                setViewDimension('3D');
              }}
              className={`px-2 py-0.5 text-xs font-orbitron font-bold rounded transition-all cursor-pointer ${
                viewDimension === '3D' ? 'bg-[#00ff41] text-black font-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              3D
            </button>
          </div>

          <button
            onClick={handleLaunchExternalApp}
            className="px-3 py-1 bg-gradient-to-r from-[#00f3ff] to-[#00ff41] hover:brightness-110 text-black font-orbitron font-black text-xs uppercase rounded flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_12px_rgba(0,243,255,0.4)]"
            title={activeAppInfo.title}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{activeAppInfo.btnHeader}</span>
            <span className="sm:hidden">{activeAppInfo.name}</span>
          </button>
        </div>
      </header>

      {/* ── SUB-BAR: SITUATION MONDIALE & COUCHES ── */}
      <div className="px-3 py-1.5 bg-[#040813] border-b border-white/5 flex items-center justify-between text-xs text-gray-400 z-20">
        <div className="flex items-center gap-3">
          <span className="font-orbitron font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#00f3ff]" />
            SITUATION MONDIALE
          </span>
          <span className="text-[10px] text-gray-500 hidden md:inline">
            | 7j • Conflits • Bases • Hotspots • Nucléaire • Voies Maritimes
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#00f3ff15] border border-[#00f3ff44] text-[#00f3ff] text-[9px] font-bold rounded">
            BETA v2.10
          </span>
        </div>
      </div>

      {/* ── CORPS PRINCIPAL : GLOBE 3D AVEC OVERLAYS WORLD MONITOR ── */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        
        {/* Conteneur WebGL 3D Three.js */}
        <div ref={containerRef} className="w-full h-full relative">
          <canvas ref={canvasRef} className="w-full h-full outline-none cursor-grab active:cursor-grabbing" />
        </div>

        {/* ── PANNEAU DÉROULANT DES COUCHES (GAUCHE) ── */}
        <div className="absolute top-4 left-4 z-20 space-y-2">
          <div className="bg-[#060b17]/90 border border-[#00f3ff44] rounded-lg backdrop-blur-md shadow-2xl p-2 max-w-[220px]">
            <button
              onClick={() => setIsCouchesOpen(v => !v)}
              className="w-full flex items-center justify-between text-xs font-orbitron font-bold text-[#00f3ff] uppercase pb-1 border-b border-white/10 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                COUCHES
              </span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isCouchesOpen ? 'rotate-90' : ''}`} />
            </button>

            {isCouchesOpen ? (
              <div className="pt-2 space-y-1.5 text-[11px] font-mono">
                {[
                  { key: 'conflicts', label: '🔥 Conflits Actifs', color: '#ff0033' },
                  { key: 'bases', label: '⚓ Bases Militaires', color: '#38bdf8' },
                  { key: 'hotspots', label: '⚠️ Hotspots / TSMC', color: '#ffea00' },
                  { key: 'nuclear', label: '☢️ Sites Nucléaires', color: '#f59e0b' },
                  { key: 'waterways', label: '🚢 Détroits & Chokepoints', color: '#67e8f9' },
                  { key: 'gameCities', label: '🏙️ 4 Villes Montréal 2033', color: '#00f3ff' }
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between gap-2 cursor-pointer text-gray-300 hover:text-white">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={(layers as any)[item.key]}
                      onChange={() => setLayers(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
                      className="accent-[#00f3ff] rounded"
                    />
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-gray-400 mt-1 font-mono">
                6 Couches Actives (Conflits, Bases, Nucléaire...)
              </div>
            )}
          </div>

          <div className="text-[9px] text-gray-500 font-mono bg-black/60 px-2 py-1 rounded border border-white/5">
            © Elie Habib • Montréal 2033
          </div>
        </div>

        {/* ── CONTRÔLES DE NAVIGATION FLOTTANTS (DROITE : +, -, HOME, FULLSCREEN) ── */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-[#060b17]/90 border border-white/10 p-1 rounded-lg backdrop-blur-md shadow-2xl">
          <button
            onClick={() => {
              sound.playUiClick();
              setCameraDistance(d => Math.max(14, d - 4));
            }}
            className="p-2 hover:bg-white/10 text-gray-300 hover:text-white rounded cursor-pointer transition-all"
            title="Zoom Avant"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sound.playUiClick();
              setCameraDistance(d => Math.min(48, d + 4));
            }}
            className="p-2 hover:bg-white/10 text-gray-300 hover:text-white rounded cursor-pointer transition-all"
            title="Zoom Arrière"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sound.playUiClick();
              setCameraDistance(26);
            }}
            className="p-2 hover:bg-white/10 text-gray-300 hover:text-white rounded cursor-pointer transition-all"
            title="Réinitialiser la Vue Mondiale"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sound.playUiClick();
              setAutoRotate(v => !v);
            }}
            className={`p-2 rounded cursor-pointer transition-all ${autoRotate ? 'text-[#00ff41] bg-[#00ff4115]' : 'text-gray-400 hover:text-white'}`}
            title="Bascule de Rotation Continue"
          >
            <RotateCcw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* ── TOOLTIP FLOTTANT AU SURVOL D'UN PIN (Hover Tooltip) ── */}
        {hoveredPin && !selectedPin && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 bg-black/90 border border-[#00f3ff] px-4 py-2 rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(0,243,255,0.4)] pointer-events-none text-center">
            <div className="text-xs font-orbitron font-bold text-[#00f3ff]">
              {hoveredPin.name}
            </div>
            <div className="text-[10px] text-gray-300 font-mono mt-0.5">
              {hoveredPin.country} • Menace : <span className="text-red-400 font-bold">{hoveredPin.threatLevel}</span>
            </div>
          </div>
        )}

        {/* ── FICHE DE RENSEIGNEMENT INTEL DÉTAILLÉE (PIN SÉLECTIONNÉ) ── */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-16 sm:bottom-6 sm:w-96 z-30 bg-[#060b17]/95 border border-[#00f3ff55] p-4 rounded-xl shadow-[0_0_30px_rgba(0,243,255,0.3)] backdrop-blur-md space-y-3">
            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                  {selectedPin.category.toUpperCase()} // MENACE {selectedPin.threatLevel}
                </span>
                <h3 className="font-orbitron font-black text-sm text-white mt-1">
                  {selectedPin.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {selectedPin.details}
            </p>

            <div className="grid grid-cols-2 gap-2 bg-[#020612] p-2.5 rounded-lg border border-white/10 text-[10px] font-mono">
              <div>
                <span className="text-gray-500 block">Source :</span>
                <span className="text-[#00f3ff] font-bold">{selectedPin.source}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Horodatage :</span>
                <span className="text-emerald-400 font-bold">{selectedPin.timestamp}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Coordonnées GPS :</span>
                <span className="text-amber-400 font-bold">{selectedPin.lat.toFixed(2)}°N, {selectedPin.lng.toFixed(2)}°E</span>
              </div>
              <div>
                <span className="text-gray-500 block">Statut Tactique :</span>
                <span className="text-white font-bold">{selectedPin.status}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleLaunchExternalApp}
                className="flex-1 py-2 bg-gradient-to-r from-[#00f3ff] to-[#00ff41] text-black font-orbitron font-black text-[11px] uppercase rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:brightness-110 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                title={activeAppInfo.title}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{activeAppInfo.btnCard}</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── FOOTER BAR : ATTRIBUTION & TÉLÉMÉTRIE SATELLITAIRE ── */}
      <footer className="px-4 py-1.5 bg-[#030610] border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400 shrink-0 font-mono">
        <div className="flex items-center gap-2 truncate">
          <span className="text-[#00ff41] font-bold">● COUVERTURE GLOBALE 100% :</span>
          <span className="text-gray-300 truncate">59 Outils MCP • Sentinel-1 SAR • SkyFi 0.3m • AIS Maritime</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-[9px] text-gray-500">
          <span>OpenStreetMap • Natural Earth</span>
        </div>
      </footer>

    </div>
  );
};
