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
  Tv
} from 'lucide-react';
import { sound } from '../utils/audio';

// ═══════════════════════════════════════════════════════════════════
// PLANETARY 3D GLOBE ENGINE — WORLD MONITOR & GOD-EYE VIEW
// Montréal 2033: Global Geospatial Intelligence & Satellite Grid
// ═══════════════════════════════════════════════════════════════════

export interface PlanetaryPoint {
  id: string;
  name: string;
  category: 'city' | 'chokepoint' | 'conflict' | 'osint_c2' | 'satellite';
  lat: number;
  lng: number;
  altitude?: number;
  threatLevel: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ' | 'CRITIQUE' | 'ALPHA';
  details: string;
  status: string;
  color: string;
  stats?: {
    vessels?: number;
    bandwidth?: string;
    cctvCameras?: number;
    radiation?: string;
  };
}

export const GLOBAL_LOCATIONS: PlanetaryPoint[] = [
  // ── 4 Villes Clés du Jeu Montréal 2033 ──
  {
    id: 'mtl_hq',
    name: 'Montréal // Quartier Général (Acte 1)',
    category: 'city',
    lat: 45.5017,
    lng: -73.5673,
    threatLevel: 'ÉLEVÉ',
    details: 'Base d’opérations de Thirty3, réseau souterrain RÉSO, nœud quantique SPVM-Prime et téléporteur STM.',
    status: 'OPÉRATIONNEL',
    color: '#00f3ff',
    stats: { cctvCameras: 384, bandwidth: '128 Tbps', vessels: 42 }
  },
  {
    id: 'la_megacity',
    name: 'Los Angeles // Mégapole Cyber-Corpo (Acte 2)',
    category: 'city',
    lat: 34.0522,
    lng: -118.2437,
    threatLevel: 'CRITIQUE',
    details: 'Siège des corpos synthétiques mondiales, tours orbitales et réseau de drones tueurs automates.',
    status: 'SURVEILLANCE RENFORCÉE',
    color: '#f59e0b',
    stats: { cctvCameras: 1250, bandwidth: '450 Tbps', vessels: 18 }
  },
  {
    id: 'rome_sanctum',
    name: 'Rome // Sanctuaire Occulte Cyber-Vatican (Acte 3)',
    category: 'city',
    lat: 41.9028,
    lng: 12.4964,
    threatLevel: 'CRITIQUE',
    details: 'Archives secrètes du Vatican, catacombes cyber-occultes et reliques de transsubstantiation quantique.',
    status: 'ANOMALIE DÉTECTÉE',
    color: '#ff00ff',
    stats: { cctvCameras: 620, bandwidth: '88 Tbps', radiation: '0.42 μSv/h' }
  },
  {
    id: 'antarctica_citadel',
    name: 'Antarctique // Citadelle de l’AntiChrist (Acte 4)',
    category: 'city',
    lat: -82.8628,
    lng: 135.0000,
    threatLevel: 'ALPHA',
    details: 'Sanctuaire polaire cryogénique, monolithe noir, dernier bastion du Boss Final AntiChrist.',
    status: 'DANGER MORTEL // BOSS ZONE',
    color: '#ff0044',
    stats: { cctvCameras: 0, bandwidth: 'QUANTUM 100%', radiation: '9.8 μSv/h' }
  },

  // ── Chokepoints Maritimes Mondiaux (World Monitor) ──
  {
    id: 'choke_hormuz',
    name: 'Détroit d’Ormuz (Pétrole Brut & Gaz)',
    category: 'chokepoint',
    lat: 26.56,
    lng: 56.25,
    threatLevel: 'ÉLEVÉ',
    details: 'Transit de 21% de la consommation mondiale de pétrole liquide. Patrouilles de frégates furtives.',
    status: 'SURVEILLANCE RADAR ACTIVE',
    color: '#38bdf8',
    stats: { vessels: 142, bandwidth: '40 Gbps' }
  },
  {
    id: 'choke_suez',
    name: 'Canal de Suez (Passage Europe-Asie)',
    category: 'chokepoint',
    lat: 30.58,
    lng: 32.57,
    threatLevel: 'MOYEN',
    details: 'Artère logistique critique. 12% du commerce maritime international.',
    status: 'FLUIDE',
    color: '#38bdf8',
    stats: { vessels: 89, bandwidth: '25 Gbps' }
  },
  {
    id: 'choke_malacca',
    name: 'Détroit de Malacca (Corridor Indo-Pacifique)',
    category: 'chokepoint',
    lat: 1.43,
    lng: 102.89,
    threatLevel: 'ÉLEVÉ',
    details: 'Point névralgique de transport maritime des semi-conducteurs et hydrocarbures asiatiques.',
    status: 'TRAFIC INTENSE',
    color: '#38bdf8',
    stats: { vessels: 210, bandwidth: '60 Gbps' }
  },
  {
    id: 'choke_panama',
    name: 'Canal de Panama (Liaison Atlantique-Pacifique)',
    category: 'chokepoint',
    lat: 9.08,
    lng: -79.68,
    threatLevel: 'MOYEN',
    details: 'Écluses hydro-électriques et surveillance météorologique des niveaux de lacs.',
    status: 'FLUIDE',
    color: '#38bdf8',
    stats: { vessels: 48, bandwidth: '18 Gbps' }
  },
  {
    id: 'choke_babelmandeb',
    name: 'Bab-el-Mandeb (Mer Rouge / Golfe d’Aden)',
    category: 'chokepoint',
    lat: 12.58,
    lng: 43.33,
    threatLevel: 'CRITIQUE',
    details: 'Zone de tirs balistiques et drones marins autonomes. Escortes militaires obligatoires.',
    status: 'ZONE DE GUERRE ACTIVE',
    color: '#ef4444',
    stats: { vessels: 31, bandwidth: '12 Gbps' }
  },
  {
    id: 'choke_gibraltar',
    name: 'Détroit de Gibraltar (Méditerranée-Atlantique)',
    category: 'chokepoint',
    lat: 35.96,
    lng: -5.60,
    threatLevel: 'FAIBLE',
    details: 'Contrôle hydrographique et radar de surveillance de l’OTAN.',
    status: 'CALME',
    color: '#38bdf8',
    stats: { vessels: 115, bandwidth: '30 Gbps' }
  },

  // ── Zones de Conflits & Tensions Géopolitiques (World Monitor) ──
  {
    id: 'conf_taiwan',
    name: 'Détroit de Taïwan // Fonderies TSMC',
    category: 'conflict',
    lat: 24.0,
    lng: 119.5,
    threatLevel: 'CRITIQUE',
    details: '70% de la production mondiale de puces 2nm. Bulles de brouillage électromagnétique.',
    status: 'ALERTE JAUNE MILITAIRE',
    color: '#f97316',
    stats: { vessels: 95, bandwidth: '220 Tbps' }
  },
  {
    id: 'conf_blacksea',
    name: 'Bassin de la Mer Noire // Ports Céréaliers',
    category: 'conflict',
    lat: 43.5,
    lng: 34.0,
    threatLevel: 'ÉLEVÉ',
    details: 'Mines marines dérivantes, drones sous-marins et frappes de missiles hypersoniques.',
    status: 'ZONE HOSTILE',
    color: '#ef4444',
    stats: { vessels: 24, bandwidth: '10 Gbps' }
  },
  {
    id: 'conf_korea',
    name: 'Péninsule Coréenne // Zone Démilitarisée',
    category: 'conflict',
    lat: 38.0,
    lng: 127.0,
    threatLevel: 'ÉLEVÉ',
    details: 'Silos de missiles nucléaires et centres d’écoute cybernétiques de Pyongyang.',
    status: 'TENSION ÉLEVÉE',
    color: '#f97316',
    stats: { cctvCameras: 450, bandwidth: '15 Tbps' }
  },

  // ── Balises OSINT & Nœuds C2 ShadowBroker ──
  {
    id: 'osint_frankfurt',
    name: 'Nœud C2 Cyber // Francfort DE-CIX',
    category: 'osint_c2',
    lat: 50.1109,
    lng: 8.6821,
    threatLevel: 'ÉLEVÉ',
    details: 'Plus grand point d’échange Internet mondial. Cible de sniffing d’antennes SIGINT.',
    status: 'INTERCEPTION EN COURS',
    color: '#a855f7',
    stats: { bandwidth: '1400 Tbps' }
  },
  {
    id: 'osint_tokyo',
    name: 'Station d’Écoute Satellitaire // Tokyo Bay',
    category: 'osint_c2',
    lat: 35.6762,
    lng: 139.6503,
    threatLevel: 'MOYEN',
    details: 'Radômes de réception SkyFi et paraboles d’interception radio militaire.',
    status: 'CONNECTÉ',
    color: '#a855f7',
    stats: { bandwidth: '320 Tbps' }
  },
  {
    id: 'osint_sydney',
    name: 'Station Pine Gap // Désert Australien',
    category: 'osint_c2',
    lat: -23.6980,
    lng: 133.8807,
    threatLevel: 'CRITIQUE',
    details: 'Installation conjointe de renseignement spatial et interception des communications mondiales.',
    status: 'CONFIDENTIEL DÉFENSE',
    color: '#a855f7',
    stats: { bandwidth: '80 Tbps' }
  }
];

// Satellites en Orbite
export const SATELLITE_CONSTELLATION = [
  { id: 'skyfi_1', name: '🛰️ SkyFi-Optic 01 (0.3m HD)', speed: 0.008, radius: 13.5, inclination: 0.65, color: '#00f3ff' },
  { id: 'skyfi_2', name: '🛰️ SkyFi-Optic 02 (Super-Res)', speed: 0.006, radius: 14.2, inclination: -0.45, color: '#00f3ff' },
  { id: 'sentinel_1', name: '📡 Sentinel-1A (Radar SAR 24/7)', speed: 0.007, radius: 15.0, inclination: 1.1, color: '#00ff41' },
  { id: 'sentinel_2', name: '📡 Sentinel-2B (Multi-Spectral)', speed: 0.005, radius: 15.8, inclination: -0.85, color: '#00ff41' },
  { id: 'shadow_drone', name: '🛸 ShadowDrone Recon-X (Militaire)', speed: 0.012, radius: 12.8, inclination: 0.25, color: '#f59e0b' }
];

interface PlanetaryGlobe3DProps {
  activeToolId?: 'world_monitor' | 'shadowbroker' | 'god_eye_view' | 'stm_transit' | 'maxintel_academy';
  onSelectLocation?: (loc: PlanetaryPoint) => void;
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
  
  // State
  const [viewMode, setViewMode] = useState<'globe' | 'iframe' | 'split'>('globe');
  const [selectedPoint, setSelectedPoint] = useState<PlanetaryPoint | null>(GLOBAL_LOCATIONS[0]);
  const [activeLayers, setActiveLayers] = useState({
    cities: true,
    chokepoints: true,
    conflicts: true,
    osint: true,
    satellites: true,
    cyberArcs: true,
    radarScan: true,
    clouds: true
  });
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.002);
  const [cameraZoom, setCameraZoom] = useState(32);
  const [customAppUrl, setCustomAppUrl] = useState(
    activeToolId === 'shadowbroker' ? 'http://localhost:8001' :
    activeToolId === 'maxintel_academy' ? 'https://maxintel.org/' : defaultAppUrl
  );
  const [isLiveAppLoaded, setIsLiveAppLoaded] = useState(false);
  const [liveTelemetryLog, setLiveTelemetryLog] = useState<string[]>([
    '🌐 GOD-EYE VIEW // Initialisation du flux spatial orbital 0.3m...',
    '📡 SATELLITES // 5 orbites verrouillées (Sentinel-1, Sentinel-2, SkyFi, ShadowRecon).',
    '🗺️ GÉODÉSIE // 18 cibles tactiques géoréférencées sur le globe planétaire.'
  ]);

  // URLs externes configurées
  const externalToolUrls: Record<string, { label: string; url: string; port: number; desc: string }> = {
    world_monitor: {
      label: 'World Monitor MCP (Port 3000)',
      url: 'http://localhost:3000',
      port: 3000,
      desc: 'Application complète World Monitor avec 59 outils MCP et télémétrie mondiale'
    },
    shadowbroker: {
      label: 'ShadowBroker OpenClaw (Port 8001)',
      url: 'http://localhost:8001',
      port: 8001,
      desc: 'Plateforme OSINT géospatiale ShadowBroker et canal OpenClaw'
    },
    god_eye_view: {
      label: 'God-Eye View 3D Matrix (Port 3000/api)',
      url: 'http://localhost:3000/api/mcp',
      port: 3000,
      desc: 'Matrice 3D de surveillance globale et ciblage orbital laser'
    },
    maxintel_academy: {
      label: 'MaxIntel OSINT Framework & Academy',
      url: 'https://maxintel.org/',
      port: 443,
      desc: 'Académie et outils d’investigation OSINT en sources ouvertes'
    },
    stm_transit: {
      label: 'STM Montréal GTFS-Realtime Portal',
      url: 'https://www.stm.info/',
      port: 443,
      desc: 'Portail officiel des données ouvertes de transport de Montréal'
    }
  };

  const currentToolMeta = externalToolUrls[activeToolId] || externalToolUrls.world_monitor;

  // Helper pour convertir Lat/Lng en Coordonnées 3D Sphériques (x, y, z)
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Création procédurale de textures de la Terre haute définition sur Offscreen Canvas
  const createProceduralEarthTextures = () => {
    const width = 2048;
    const height = 1024;
    
    // 1. Texture de la Terre (Jour/Nuit Cyberpunk)
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = width;
    earthCanvas.height = height;
    const ctx = earthCanvas.getContext('2d')!;

    // Océans profonds bleu foncé / noir cyber
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, height);
    oceanGradient.addColorStop(0, '#030712');
    oceanGradient.addColorStop(0.5, '#050c1e');
    oceanGradient.addColorStop(1, '#02050e');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, width, height);

    // Grille de coordonnées néon (Latitude / Longitude lines)
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Continents simplifiés réalistes & néons urbains (Points lumineux)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#00f3ff33';
    ctx.lineWidth = 1.5;

    // Simulation stylisée des masses continentales (Amériques, Eurasie, Afrique, Océanie, Antarctique)
    const drawLandmass = (pts: [number, number][]) => {
      ctx.beginPath();
      pts.forEach(([px, py], i) => {
        const x = (px / 360 + 0.5) * width;
        const y = (-py / 180 + 0.5) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = '#0e1626';
      ctx.fill();
      ctx.stroke();
    };

    // Amérique du Nord
    drawLandmass([
      [-165, 65], [-140, 70], [-100, 72], [-60, 60], [-55, 45], 
      [-75, 25], [-90, 18], [-105, 20], [-120, 32], [-130, 50], [-165, 60]
    ]);
    // Amérique du Sud
    drawLandmass([
      [-80, 10], [-50, -5], [-35, -10], [-50, -50], [-70, -55], [-80, -20]
    ]);
    // Europe & Asie
    drawLandmass([
      [-10, 35], [30, 40], [40, 60], [10, 70], [60, 70], [140, 70], 
      [170, 65], [140, 35], [100, 10], [80, 15], [50, 25], [35, 30], [-10, 35]
    ]);
    // Afrique
    drawLandmass([
      [-15, 35], [35, 30], [50, 10], [40, -30], [20, -35], [10, 5], [-15, 15]
    ]);
    // Australie
    drawLandmass([
      [115, -20], [150, -15], [150, -35], [115, -35]
    ]);
    // Antarctique
    drawLandmass([
      [-180, -75], [180, -75], [180, -90], [-180, -90]
    ]);

    // Lumières néon des métropoles de nuit (Cyberpunk Night Lights)
    ctx.fillStyle = '#00f3ff';
    const citySpots: [number, number, number, string][] = [
      [-73.5, 45.5, 4, '#00f3ff'],   // Montréal
      [-118.2, 34.0, 5, '#f59e0b'],  // Los Angeles
      [-74.0, 40.7, 5, '#00f3ff'],   // New York
      [2.3, 48.8, 4, '#ff00ff'],     // Paris
      [12.5, 41.9, 4, '#ff00ff'],    // Rome
      [139.6, 35.6, 6, '#00ff41'],   // Tokyo
      [116.4, 39.9, 5, '#f97316'],   // Beijing
      [121.5, 25.0, 4, '#00f3ff'],   // Taipei
      [55.3, 25.2, 4, '#38bdf8'],    // Dubaï
      [8.6, 50.1, 4, '#a855f7'],     // Francfort
      [151.2, -33.8, 4, '#00f3ff'],  // Sydney
      [-43.1, -22.9, 3, '#f59e0b']   // Rio
    ];

    citySpots.forEach(([lng, lat, size, color]) => {
      const x = (lng / 360 + 0.5) * width;
      const y = (-lat / 180 + 0.5) * height;
      
      const rad = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      rad.addColorStop(0, color);
      rad.addColorStop(0.3, color + 'aa');
      rad.addColorStop(1, 'transparent');
      ctx.fillStyle = rad;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();
    });

    const earthTexture = new THREE.CanvasTexture(earthCanvas);

    // 2. Texture des Nuages & Météo Satellitaire
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = width;
    cloudCanvas.height = height;
    const cctx = cloudCanvas.getContext('2d')!;
    cctx.fillStyle = 'rgba(0, 0, 0, 0)';
    cctx.fillRect(0, 0, width, height);

    cctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 400; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const cr = 20 + Math.random() * 60;
      cctx.beginPath();
      cctx.arc(cx, cy, cr, 0, Math.PI * 2);
      cctx.fill();
    }
    const cloudTexture = new THREE.CanvasTexture(cloudCanvas);

    return { earthTexture, cloudTexture };
  };

  // ══════════════════════════════════════════════════════════════════
  // THREE.JS 3D PLANETARY RENDER LOOP
  // ══════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (viewMode === 'iframe') return;
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scène & Caméra
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, cameraZoom);
    camera.lookAt(0, 0, 0);

    // 2. Renderer WebGL
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current || undefined,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Éclairages
    const ambientLight = new THREE.AmbientLight(0x1a2540, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x00f3ff, 2.5);
    sunLight.position.set(50, 30, 40);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xff00ff, 1.0);
    rimLight.position.set(-50, -20, -40);
    scene.add(rimLight);

    // 4. Globe Terrestre 3D
    const { earthTexture, cloudTexture } = createProceduralEarthTextures();
    const globeRadius = 10;
    
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Sphère principale
    const earthGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.3,
      emissive: new THREE.Color(0x031024),
      emissiveIntensity: 0.4
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // Atmosphère lumineuse (Glow halo)
    const atmosGeo = new THREE.SphereGeometry(globeRadius * 1.03, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // Couche des Nuages
    const cloudGeo = new THREE.SphereGeometry(globeRadius * 1.015, 48, 48);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    globeGroup.add(cloudMesh);

    // 5. Anneaux Orbitaux & Satellites 3D
    const satelliteMeshes: { mesh: THREE.Mesh; orbitRadius: number; speed: number; angle: number; inc: number }[] = [];

    SATELLITE_CONSTELLATION.forEach((sat, idx) => {
      // Anneau d'orbite
      const orbitCurve = new THREE.EllipseCurve(0, 0, sat.radius, sat.radius, 0, 2 * Math.PI, false, 0);
      const orbitPoints = orbitCurve.getPoints(64).map(p => new THREE.Vector3(p.x, 0, p.y));
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMat = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(sat.color), 
        transparent: true, 
        opacity: 0.25 
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitLine.rotation.x = sat.inclination;
      orbitLine.rotation.y = idx * 0.4;
      scene.add(orbitLine);

      // Mesh du satellite
      const satGeo = new THREE.BoxGeometry(0.35, 0.2, 0.2);
      const satMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(sat.color),
        emissive: new THREE.Color(sat.color),
        emissiveIntensity: 0.8
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);

      // Panneaux solaires du satellite
      const panelGeo = new THREE.BoxGeometry(0.8, 0.05, 0.25);
      const panelMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      satMesh.add(panel);

      scene.add(satMesh);
      satelliteMeshes.push({
        mesh: satMesh,
        orbitRadius: sat.radius,
        speed: sat.speed,
        angle: Math.random() * Math.PI * 2,
        inc: sat.inclination
      });
    });

    // 6. Pins 3D Géospatiaux Interactifs sur le Globe
    const pinGroup = new THREE.Group();
    globeGroup.add(pinGroup);

    const pinRaycastTargets: { mesh: THREE.Mesh; data: PlanetaryPoint }[] = [];

    GLOBAL_LOCATIONS.forEach((loc) => {
      const pos = latLngToVector3(loc.lat, loc.lng, globeRadius);

      // Balise 3D principale
      const isCity = loc.category === 'city';
      const pinGeo = isCity 
        ? new THREE.CylinderGeometry(0.1, 0.25, 1.2, 8) 
        : new THREE.SphereGeometry(0.2, 12, 12);
      
      const pinMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(loc.color),
        emissive: new THREE.Color(loc.color),
        emissiveIntensity: 0.9,
        metalness: 0.8
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      
      pinMesh.position.copy(pos);
      pinMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      pinGroup.add(pinMesh);

      // Anneau pulsant sous le pin
      const ringGeo = new THREE.RingGeometry(0.3, 0.45, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(loc.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos.clone().multiplyScalar(1.01));
      ringMesh.quaternion.copy(pinMesh.quaternion);
      pinGroup.add(ringMesh);

      pinRaycastTargets.push({ mesh: pinMesh, data: loc });
    });

    // 7. Arcs de Données / Cyber-Attaques Balistiques (World Monitor)
    const arcGroup = new THREE.Group();
    globeGroup.add(arcGroup);

    const createCyberArc = (from: PlanetaryPoint, to: PlanetaryPoint, color: string) => {
      const p1 = latLngToVector3(from.lat, from.lng, globeRadius);
      const p2 = latLngToVector3(to.lat, to.lng, globeRadius);
      
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      mid.normalize().multiplyScalar(globeRadius + dist * 0.35); // Hauteur de l'arc

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(32);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.65
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcGroup.add(arcLine);
    };

    // Arcs connectant Montréal aux métropoles mondiales
    createCyberArc(GLOBAL_LOCATIONS[0], GLOBAL_LOCATIONS[1], '#00f3ff'); // MTL -> LA
    createCyberArc(GLOBAL_LOCATIONS[0], GLOBAL_LOCATIONS[2], '#ff00ff'); // MTL -> Rome
    createCyberArc(GLOBAL_LOCATIONS[0], GLOBAL_LOCATIONS[10], '#00ff41'); // MTL -> Francfort
    createCyberArc(GLOBAL_LOCATIONS[1], GLOBAL_LOCATIONS[11], '#f59e0b'); // LA -> Tokyo
    createCyberArc(GLOBAL_LOCATIONS[2], GLOBAL_LOCATIONS[3], '#ef4444');  // Rome -> Antarctique

    // 8. Réticule de Ciblage God-Eye View Laser 3D
    const godEyeReticle = new THREE.Group();
    const reticleRing = new THREE.RingGeometry(1.5, 1.6, 32);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0x00ff41,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const reticleMesh = new THREE.Mesh(reticleRing, reticleMat);
    godEyeReticle.add(reticleMesh);
    scene.add(godEyeReticle);
    godEyeReticle.visible = activeToolId === 'god_eye_view';

    // 9. Contrôles Interactifs à la Souris (Drag & Zoom)
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
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

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
          setSelectedPoint(hit.data);
          if (onSelectLocation) onSelectLocation(hit.data);
          
          setLiveTelemetryLog(prev => [
            `🎯 CIBLE SÉLECTIONNÉE // ${hit.data.name} (Lat: ${hit.data.lat.toFixed(2)}°, Lng: ${hit.data.lng.toFixed(2)}°)`,
            ...prev.slice(0, 4)
          ]);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCameraZoom(prev => {
        const next = Math.max(16, Math.min(50, prev + e.deltaY * 0.02));
        camera.position.z = next;
        return next;
      });
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 10. Boucle d'Animation 3D
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Rotation automatique du globe
      if (autoRotate && !isDragging) {
        globeGroup.rotation.y += rotationSpeed;
      }

      // Rotation indépendante des nuages
      cloudMesh.rotation.y += rotationSpeed * 1.3;

      // Déplacement des satellites sur leurs orbites
      satelliteMeshes.forEach(sat => {
        sat.angle += sat.speed;
        const x = Math.cos(sat.angle) * sat.orbitRadius;
        const z = Math.sin(sat.angle) * sat.orbitRadius;
        
        sat.mesh.position.set(x, Math.sin(sat.angle * 2) * 2, z);
        sat.mesh.rotation.y = sat.angle + Math.PI / 2;
      });

      // Animation du réticule God-Eye
      if (godEyeReticle.visible) {
        godEyeReticle.rotation.z += delta * 1.5;
        godEyeReticle.position.set(Math.sin(time * 0.8) * 4, Math.cos(time * 0.8) * 3, globeRadius + 3);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Redimensionnement
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
  }, [viewMode, autoRotate, rotationSpeed, activeToolId]);

  // Handler pour ouvrir l'application dans un nouvel onglet
  const handleLaunchExternalApp = (targetUrl?: string) => {
    sound.playVictory();
    const url = targetUrl || customAppUrl || currentToolMeta.url;
    if (onOpenExternalApp) {
      onOpenExternalApp(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`relative w-full h-full bg-[#030712] text-white flex flex-col overflow-hidden font-mono select-none ${className}`}>
      
      {/* ── Top Bar de Contrôle & Liens Directs vers les Outils ── */}
      <div className="px-3 py-2 bg-[#090e1a]/95 border-b border-[#00f3ff33] flex flex-wrap items-center justify-between gap-2 z-30 shadow-xl shrink-0 backdrop-blur-md">
        
        {/* Left: Outil Actif & Statut de Liaison */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#00f3ff15] border border-[#00f3ff44] text-[#00f3ff] rounded-lg">
              {activeToolId === 'shadowbroker' ? <Satellite className="w-4 h-4" /> :
               activeToolId === 'god_eye_view' ? <Eye className="w-4 h-4 text-[#00ff41]" /> :
               activeToolId === 'maxintel_academy' ? <ShieldAlert className="w-4 h-4 text-emerald-400" /> :
               <Globe className="w-4 h-4" />}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-orbitron font-black text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ff41] uppercase tracking-wider truncate">
                  {currentToolMeta.label}
                </span>
                <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold rounded">
                  PORT {currentToolMeta.port}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 hidden md:block truncate max-w-md">
                {currentToolMeta.desc}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Sélecteur de Mode de Visualisation (Globe 3D vs Live App Embedded) */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10 shrink-0">
          <button
            onClick={() => {
              sound.playUiClick();
              setViewMode('globe');
            }}
            className={`px-3 py-1 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              viewMode === 'globe'
                ? 'bg-[#00f3ff] text-black shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>GLOBE 3D</span>
          </button>

          <button
            onClick={() => {
              sound.playUiClick();
              setViewMode('iframe');
            }}
            className={`px-3 py-1 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              viewMode === 'iframe'
                ? 'bg-gradient-to-r from-[#f59e0b] to-[#ff0055] text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>LIVE APP (PORT {currentToolMeta.port})</span>
          </button>

          <button
            onClick={() => {
              sound.playUiClick();
              setViewMode('split');
            }}
            className={`px-2.5 py-1 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              viewMode === 'split'
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SPLIT</span>
          </button>
        </div>

        {/* Right: Bouton Direct OUVRIR DANS UN NOUVEL ONGLET */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => handleLaunchExternalApp()}
            className="px-3 py-1.5 bg-gradient-to-r from-[#00f3ff] to-[#00ff41] text-black font-orbitron font-black text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.4)] cursor-pointer hover:brightness-110 flex items-center gap-1.5 transition-all"
            title={`Ouvrir ${currentToolMeta.label} directement dans votre navigateur`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>OUVRIR L’APP (NOUVEL ONGLET ↗)</span>
          </button>
        </div>
      </div>

      {/* ── Corps Principal : Globe 3D / Live Iframe / Split ── */}
      <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        
        {/* Vue Globe 3D Planétaire */}
        {(viewMode === 'globe' || viewMode === 'split') && (
          <div 
            ref={containerRef} 
            className={`relative flex-1 h-full min-h-[350px] overflow-hidden ${
              viewMode === 'split' ? 'md:w-1/2 md:border-r border-[#00f3ff33]' : 'w-full'
            }`}
          >
            <canvas ref={canvasRef} className="w-full h-full outline-none cursor-grab active:cursor-grabbing" />

            {/* Overlay: HUD Télémétrique Spatial */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none space-y-2">
              <div className="bg-black/80 border border-[#00f3ff44] p-2.5 rounded-lg backdrop-blur-sm shadow-xl max-w-xs">
                <div className="flex items-center justify-between text-[10px] font-orbitron font-bold text-[#00f3ff] mb-1">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-[#00ff41] animate-pulse" />
                    TÉLÉMÉTRIE ORBITALE 0.3M
                  </span>
                  <span>FPS: 60</span>
                </div>
                <div className="text-[10px] space-y-0.5 text-gray-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Constellation :</span>
                    <span className="text-white font-bold">4 SkyFi + 2 Sentinel</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Résolution :</span>
                    <span className="text-[#00ff41] font-bold">0.3m HD Optique</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chokepoints :</span>
                    <span className="text-amber-400 font-bold">8 Détectés</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay: Contrôles Flottants du Globe (Rotation, Zoom, Filtres) */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playUiClick();
                  setAutoRotate(v => !v);
                }}
                className={`px-2.5 py-1.5 text-xs font-orbitron font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  autoRotate
                    ? 'bg-[#00f3ff22] border-[#00f3ff] text-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                    : 'bg-black/70 border-white/20 text-gray-400 hover:text-white'
                }`}
                title="Bascule de rotation automatique"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                <span>{autoRotate ? 'AUTO-ROTATION ON' : 'ROTATION PAUSE'}</span>
              </button>

              <button
                onClick={() => {
                  sound.playUiClick();
                  setSelectedPoint(GLOBAL_LOCATIONS[0]);
                }}
                className="px-2.5 py-1.5 bg-black/70 hover:bg-[#00f3ff22] border border-white/20 hover:border-[#00f3ff] text-white rounded-lg text-xs font-orbitron font-bold flex items-center gap-1 cursor-pointer transition-all"
                title="Recentrer la caméra sur Montréal"
              >
                <Crosshair className="w-3.5 h-3.5 text-[#00f3ff]" />
                <span>RECENTRER MONTRÉAL</span>
              </button>
            </div>

            {/* Overlay: Panneau d'Intelligence sur la Cible Sélectionnée */}
            {selectedPoint && (
              <div className="absolute top-3 right-3 z-20 max-w-sm w-full bg-black/90 border border-[#00f3ff55] p-3.5 rounded-xl shadow-[0_0_25px_rgba(0,243,255,0.25)] backdrop-blur-md">
                <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                  <div>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold"
                          style={{ backgroundColor: `${selectedPoint.color}22`, color: selectedPoint.color, border: `1px solid ${selectedPoint.color}66` }}>
                      {selectedPoint.category.toUpperCase()} // NIVEAU {selectedPoint.threatLevel}
                    </span>
                    <h3 className="font-orbitron font-black text-sm text-white mt-1">
                      {selectedPoint.name}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedPoint(null)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                  {selectedPoint.details}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#050811] p-2 rounded-lg border border-white/10 mb-3">
                  <div>
                    <span className="text-gray-400 block">Latitude :</span>
                    <span className="text-[#00f3ff] font-bold">{selectedPoint.lat.toFixed(4)}°</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Longitude :</span>
                    <span className="text-[#00f3ff] font-bold">{selectedPoint.lng.toFixed(4)}°</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Statut :</span>
                    <span className="text-[#00ff41] font-bold">{selectedPoint.status}</span>
                  </div>
                  {selectedPoint.stats?.bandwidth && (
                    <div>
                      <span className="text-gray-400 block">Bande Passante :</span>
                      <span className="text-fuchsia-400 font-bold">{selectedPoint.stats.bandwidth}</span>
                    </div>
                  )}
                  {selectedPoint.stats?.vessels !== undefined && (
                    <div>
                      <span className="text-gray-400 block">Navires Actifs :</span>
                      <span className="text-amber-400 font-bold">{selectedPoint.stats.vessels} navires</span>
                    </div>
                  )}
                  {selectedPoint.stats?.cctvCameras !== undefined && (
                    <div>
                      <span className="text-gray-400 block">Caméras HD :</span>
                      <span className="text-cyan-400 font-bold">{selectedPoint.stats.cctvCameras} flux</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      sound.playVictory();
                      setLiveTelemetryLog(prev => [
                        `⚡ SCAN APPROFONDI // Faisceau orbital 0.3m SkyFi verrouillé sur ${selectedPoint.name}.`,
                        ...prev
                      ]);
                    }}
                    className="flex-1 py-2 bg-[#00f3ff22] hover:bg-[#00f3ff33] border border-[#00f3ff] text-[#00f3ff] font-orbitron font-bold text-[11px] rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Scan SkyFi (0.3m)</span>
                  </button>

                  <button
                    onClick={() => handleLaunchExternalApp()}
                    className="px-3 py-2 bg-gradient-to-r from-[#f59e0b] to-[#ff0055] text-black font-orbitron font-black text-[11px] rounded-lg cursor-pointer transition-all flex items-center gap-1"
                    title="Ouvrir dans l'application externe"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lancer App</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vue Live Embedded Iframe (Application Réelle Connectée au Port 3000/8001) */}
        {(viewMode === 'iframe' || viewMode === 'split') && (
          <div className={`relative flex flex-col h-full bg-[#050811] ${
            viewMode === 'split' ? 'md:w-1/2' : 'w-full'
          }`}>
            {/* Barre d'adresse URL personnalisable */}
            <div className="px-3 py-2 bg-[#090e1a] border-b border-white/10 flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono text-gray-400 shrink-0 flex items-center gap-1">
                <Tv className="w-3 h-3 text-[#00ff41]" />
                URL APP :
              </span>
              <input
                type="text"
                value={customAppUrl}
                onChange={(e) => setCustomAppUrl(e.target.value)}
                className="flex-1 bg-[#050811] border border-white/20 rounded px-2 py-1 text-xs text-[#00f3ff] font-mono focus:outline-none focus:border-[#00f3ff]"
                placeholder="http://localhost:3000"
              />
              <button
                onClick={() => {
                  sound.playVictory();
                  setIsLiveAppLoaded(false);
                  setTimeout(() => setIsLiveAppLoaded(true), 100);
                }}
                className="p-1.5 bg-[#111827] hover:bg-[#1f2937] border border-white/20 text-white rounded cursor-pointer transition-all"
                title="Actualiser l'application embarquée"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleLaunchExternalApp(customAppUrl)}
                className="px-2 py-1 bg-[#00f3ff] text-black font-orbitron font-bold text-[10px] rounded cursor-pointer transition-all flex items-center gap-1 shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
                <span>ONGLET</span>
              </button>
            </div>

            {/* Frame de l'Application Réelle */}
            <div className="flex-1 relative w-full h-full bg-black">
              <iframe
                src={customAppUrl}
                title="Live Geospatial Application"
                className="w-full h-full border-0"
                allow="camera; microphone; geolocation; fullscreen"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                onLoad={() => setIsLiveAppLoaded(true)}
              />

              {/* Message de fallback si l'application locale n'est pas démarrée sur le port */}
              <div className="absolute bottom-4 right-4 z-10 bg-black/80 border border-amber-500/40 p-2.5 rounded-lg max-w-xs text-[10px] text-gray-300 pointer-events-auto backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>LIAISON SERVEUR LOCAL ({currentToolMeta.port})</span>
                </div>
                <p>
                  Si le serveur local n'est pas encore lancé sur le port {currentToolMeta.port}, vous pouvez utiliser la <strong>Vue Globe 3D</strong> intégrée ci-dessus ou cliquer sur <strong>Ouvrir l'App</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Bottom Ticker : Logs de Renseignement Géospatiaux ── */}
      <div className="px-3 py-1.5 bg-[#070b16] border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="text-[#00ff41] font-bold shrink-0">● FLUX EN DIRECT :</span>
          <span className="text-gray-200 truncate">{liveTelemetryLog[0]}</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0 font-mono text-[9px] text-gray-400">
          <span>LAT: 45.5017° N</span>
          <span>LNG: 73.5673° W</span>
          <span className="text-[#00f3ff]">ALT: 420 KM (ORBITE BASSE)</span>
        </div>
      </div>

    </div>
  );
};
