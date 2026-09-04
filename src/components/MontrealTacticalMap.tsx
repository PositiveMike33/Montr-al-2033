import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  Satellite, 
  Globe, 
  Train, 
  ShieldAlert, 
  Crosshair, 
  Eye, 
  EyeOff,
  Compass, 
  Maximize2, 
  Minimize2, 
  Search, 
  RefreshCw,
  MapPin,
  Radio,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Battery,
  Zap,
  Play,
  Video,
  Activity,
  Terminal,
  Target,
  Bus,
  Navigation
} from 'lucide-react';
import { STMBusStatusReport } from '../services/stmService';
import { sound } from '../utils/audio';
import { TacticalBridgeState, DroneMissionState, DroneTask, DRONE_CHARGING_STATIONS, DroneChargingStation } from '../utils/cyberToolsBridge';
import { STM_ROUTE_GEOMETRIES, STMRouteGeometry, STMStop } from '../data/stmRouteGeometries';

// Fix Leaflet's default icon paths for bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Map Tile Providers
const TILE_LAYERS = {
  dark: {
    name: 'Cyber Dark (CartoDB)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap'
  },
  satellite: {
    name: 'SkyFi Satellite 0.3m (ESRI HD)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; ESRI World Imagery &copy; SkyFi Constellation'
  },
  osm: {
    name: 'Infrastructure (OpenStreetMap)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  }
};

// Montreal Metro Network Coordinates (Key Stations & Lines)
const METRO_LINES = [
  {
    id: 'green',
    name: 'Ligne Verte (Green)',
    color: '#00aa44',
    stations: [
      { name: 'Angrignon', lat: 45.4464, lng: -73.6033 },
      { name: 'Lionel-Groulx', lat: 45.4828, lng: -73.5798 },
      { name: 'Atwater', lat: 45.4897, lng: -73.5862 },
      { name: 'Guy-Concordia', lat: 45.4952, lng: -73.5797 },
      { name: 'Peel', lat: 45.5008, lng: -73.5746 },
      { name: 'McGill (RÉSO Core)', lat: 45.5041, lng: -73.5714 },
      { name: 'Place-des-Arts', lat: 45.5081, lng: -73.5684 },
      { name: 'Berri-UQAM', lat: 45.5152, lng: -73.5611 },
      { name: 'Papineau', lat: 45.5238, lng: -73.5518 },
      { name: 'Honoré-Beaugrand', lat: 45.5966, lng: -73.5354 }
    ]
  },
  {
    id: 'orange',
    name: 'Ligne Orange (Orange)',
    color: '#ff8800',
    stations: [
      { name: 'Côte-Vertu', lat: 45.5143, lng: -73.6829 },
      { name: 'Snowdon', lat: 45.4854, lng: -73.6276 },
      { name: 'Lionel-Groulx', lat: 45.4828, lng: -73.5798 },
      { name: 'Bonaventure (Vance Hub)', lat: 45.4984, lng: -73.5667 },
      { name: 'Square-Victoria-OACI', lat: 45.5019, lng: -73.5630 },
      { name: 'Place-d\'Armes (Chinatown)', lat: 45.5064, lng: -73.5597 },
      { name: 'Champ-de-Mars', lat: 45.5103, lng: -73.5564 },
      { name: 'Berri-UQAM', lat: 45.5152, lng: -73.5611 },
      { name: 'Jean-Talon', lat: 45.5398, lng: -73.6139 },
      { name: 'Montmorency', lat: 45.5583, lng: -73.7214 }
    ]
  },
  {
    id: 'blue',
    name: 'Ligne Bleue (Blue)',
    color: '#0088ff',
    stations: [
      { name: 'Snowdon', lat: 45.4854, lng: -73.6276 },
      { name: 'Université-de-Montréal', lat: 45.5031, lng: -73.6186 },
      { name: 'Jean-Talon', lat: 45.5398, lng: -73.6139 },
      { name: 'Saint-Michel', lat: 45.5597, lng: -73.5997 }
    ]
  },
  {
    id: 'yellow',
    name: 'Ligne Jaune (Yellow)',
    color: '#ffee00',
    stations: [
      { name: 'Berri-UQAM', lat: 45.5152, lng: -73.5611 },
      { name: 'Jean-Drapeau (Île Sainte-Hélène)', lat: 45.5126, lng: -73.5332 },
      { name: 'Longueuil-Université-de-Sherbrooke', lat: 45.5250, lng: -73.5218 }
    ]
  }
];

// Montreal Key Cyberpunk POIs & Vance Holdings Landmarks
const MONTREAL_LANDMARKS = [
  {
    id: 'vance_hq',
    name: 'Tour CIBC - Vance Holdings Tower',
    category: 'target',
    lat: 45.4996,
    lng: -73.5717,
    desc: 'Quartier général fortifié de Viktor Vance. Penthouse sécurisé niveau 45.',
    threat: 'CRITIQUE',
    color: '#ff0055'
  },
  {
    id: 'pvm_hub',
    name: 'Place Ville-Marie (Centre Neuronal)',
    category: 'infrastructure',
    lat: 45.5015,
    lng: -73.5685,
    desc: 'Phare rotatif laser et centre de télécommunications sous contrôle corpo.',
    threat: 'ÉLEVÉE',
    color: '#00f3ff'
  },
  {
    id: 'reso_core',
    name: 'Cœur Souterrain RÉSO (McGill/Eaton)',
    category: 'underground',
    lat: 45.5038,
    lng: -73.5709,
    desc: '33km de galeries souterraines. Réseau des résistants et hackers.',
    threat: 'MOYENNE',
    color: '#00ff41'
  },
  {
    id: 'port_chokepoint',
    name: 'Vieux-Port & Voie Maritime Saint-Laurent',
    category: 'chokepoint',
    lat: 45.5050,
    lng: -73.5515,
    desc: 'Chokepoint maritime stratégique. Cargo automatisé sous embargo.',
    threat: 'SURVEILLANCE',
    color: '#f59e0b'
  },
  {
    id: 'spvm_station',
    name: 'Poste Central Milice SPVM-Prime (Quartier Chinois)',
    category: 'police',
    lat: 45.5085,
    lng: -73.5605,
    desc: 'Centre de déploiement des drones et unités d\'assaut robotisées.',
    threat: 'CRITIQUE',
    color: '#ff0000'
  },
  {
    id: 'jacques_cartier',
    name: 'Pont Jacques-Cartier (Barrage Tactique)',
    category: 'bridge',
    lat: 45.5205,
    lng: -73.5385,
    desc: 'Passage vers la Rive-Sud. Checkpoint biométrique automatisé.',
    threat: 'ÉLEVÉE',
    color: '#f59e0b'
  }
];

// Montreal OSINT Pins
const OSINT_TACTICAL_PINS = [
  { id: 'pin_pvm', label: 'Place Ville-Marie', lat: 45.5015, lng: -73.5685, desc: 'Phare radar 360° et station de brouillage.' },
  { id: 'pin_cibc', label: 'Tour CIBC (Penthouse)', lat: 45.4996, lng: -73.5717, desc: 'Serveurs privés et coffre-fort biométrique de Vance.' },
  { id: 'pin_reso', label: 'Complexe Desjardins (RÉSO)', lat: 45.5074, lng: -73.5652, desc: 'Nœud de fibre optique sous-terrain non documenté.' },
  { id: 'pin_vieux_port', label: 'Silos du Vieux-Port', lat: 45.4988, lng: -73.5489, desc: 'Antenne pirate et relais radio longue distance.' },
  { id: 'pin_pont_jc', label: 'Pilier Pont Jacques-Cartier', lat: 45.5205, lng: -73.5385, desc: 'Capteurs thermiques de surveillance fluviale.' },
  { id: 'pin_mont_royal', label: 'Croix du Mont-Royal', lat: 45.5088, lng: -73.5878, desc: 'Émetteur d\'urgence et balise de synchronisation GPS.' }
];

interface MontrealTacticalMapProps {
  stmLiveReport?: STMBusStatusReport | null;
  tacticalState?: TacticalBridgeState;
  hackedPins?: string[];
  onHackPin?: (pinId: string, label: string) => void;
  godEyeActive?: boolean;
  onTriggerOrbitalScan?: () => void;
  onTriggerShadowBrokerDrone?: () => void;
  onToggleDronePauseDock?: (stationId?: string) => void;
  onSelectPOI?: (poi: any) => void;
  onSelectBusRoute?: (routeId: string) => void;
  initialSelectedRoute?: string;
  activeServiceId?: string;
  activeFilter?: string;
  hoveredFilter?: string | null;
  className?: string;
}

export const MontrealTacticalMap: React.FC<MontrealTacticalMapProps> = ({
  stmLiveReport,
  tacticalState,
  hackedPins = [],
  onHackPin,
  godEyeActive = false,
  onTriggerOrbitalScan,
  onTriggerShadowBrokerDrone,
  onToggleDronePauseDock,
  onSelectPOI,
  onSelectBusRoute,
  initialSelectedRoute,
  activeServiceId = 'world_monitor',
  activeFilter = 'tour-vance',
  hoveredFilter = null,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});

  const [currentTileKey, setCurrentTileKey] = useState<keyof typeof TILE_LAYERS>('dark');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number }>({ lat: 45.5017, lng: -73.5673 });

  // STM Bus Route Isolation & Filter State
  const [selectedStmRoute, setSelectedStmRoute] = useState<string>(() => {
    if (initialSelectedRoute && STM_ROUTE_GEOMETRIES[initialSelectedRoute]) {
      return initialSelectedRoute;
    }
    if (stmLiveReport?.routeId && STM_ROUTE_GEOMETRIES[String(stmLiveReport.routeId)]) {
      return String(stmLiveReport.routeId);
    }
    return '24';
  });
  const [isolateStmRoute, setIsolateStmRoute] = useState<boolean>(true);

  // Sync with incoming stmLiveReport when it changes
  useEffect(() => {
    if (stmLiveReport?.routeId && STM_ROUTE_GEOMETRIES[String(stmLiveReport.routeId)]) {
      setSelectedStmRoute(String(stmLiveReport.routeId));
    }
  }, [stmLiveReport?.routeId]);
  
  // Drone Mission & PiP Video Feed State
  const droneMission = tacticalState?.shadowBroker?.droneMission;
  const [isDronePipOpen, setIsDronePipOpen] = useState<boolean>(true);
  const [droneVisionMode, setDroneVisionMode] = useState<'OPTICAL' | 'FLIR' | 'SIGINT'>('OPTICAL');

  // Automatically open PiP when drone becomes active
  useEffect(() => {
    if (droneMission?.isActive) {
      setIsDronePipOpen(true);
    }
  }, [droneMission?.isActive]);
  
  // Layer visibility state & panel open/collapse state
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState<boolean>(true);
  const [layersVisibility, setLayersVisibility] = useState({
    stmBuses: true,
    stmRouteTrace: true,
    metroLines: true,
    landmarks: true,
    osintPins: true,
    skyfiFootprint: true,
    spvmBarricades: true,
    godEyeCameras: true,
    osintDrone: true,
    chargingStations: true
  });

  const activeLayersCount = Object.values(layersVisibility).filter(Boolean).length;
  const totalLayersCount = Object.keys(layersVisibility).length;
  const areAllLayersActive = activeLayersCount === totalLayersCount;

  const toggleLayer = (layerKey: keyof typeof layersVisibility) => {
    sound.playLoot();
    setLayersVisibility(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const toggleAllLayers = (forceState?: boolean) => {
    sound.playLoot();
    const nextState = forceState !== undefined ? forceState : !areAllLayersActive;
    setLayersVisibility({
      stmBuses: nextState,
      stmRouteTrace: nextState,
      metroLines: nextState,
      landmarks: nextState,
      osintPins: nextState,
      skyfiFootprint: nextState,
      spvmBarricades: nextState,
      godEyeCameras: nextState,
      osintDrone: nextState,
      chargingStations: nextState
    });
  };

  // Center & Fit camera on the full selected STM route geometry
  const handleFitRouteBounds = () => {
    sound.playLoot();
    const routeGeo = STM_ROUTE_GEOMETRIES[selectedStmRoute];
    if (routeGeo && mapInstanceRef.current) {
      const bounds = L.latLngBounds(routeGeo.path.map(c => [c[0], c[1]]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  };

  // Initialize Map safely without container collisions
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Clean up previous instance if attached to avoid "Map container is already initialized"
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {}
      mapInstanceRef.current = null;
    }

    if ((mapContainerRef.current as any)._leaflet_id) {
      try {
        delete (mapContainerRef.current as any)._leaflet_id;
      } catch {}
    }

    let map: L.Map | null = null;
    try {
      map = L.map(mapContainerRef.current, {
        center: [45.5017, -73.5673],
        zoom: 14,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: true,
        attributionControl: true
      });
      mapInstanceRef.current = map;

      // Add initial base tile layer
      const initialTile = L.tileLayer(TILE_LAYERS[currentTileKey].url, {
        attribution: TILE_LAYERS[currentTileKey].attribution,
        maxZoom: 19
      }).addTo(map);
      tileLayerRef.current = initialTile;

      // Initialize Layer Groups
      layerGroupsRef.current = {
        stmBuses: L.layerGroup().addTo(map),
        stmRouteTrace: L.layerGroup().addTo(map),
        metroLines: L.layerGroup().addTo(map),
        landmarks: L.layerGroup().addTo(map),
        osintPins: L.layerGroup().addTo(map),
        skyfiFootprint: L.layerGroup().addTo(map),
        spvmBarricades: L.layerGroup().addTo(map),
        godEyeCameras: L.layerGroup().addTo(map),
        droneLayer: L.layerGroup().addTo(map),
        chargingStations: L.layerGroup().addTo(map)
      };

      // Track mouse coordinates
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setCursorCoords({
          lat: Number(e.latlng.lat.toFixed(5)),
          lng: Number(e.latlng.lng.toFixed(5))
        });
      });

      // Multiple Invalidate size attempts after mount to prevent grey tiles
      const invalidate = () => {
        try {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        } catch {}
      };
      setTimeout(invalidate, 100);
      setTimeout(invalidate, 350);
      setTimeout(invalidate, 800);
    } catch (err) {
      console.warn('Leaflet map initialization skipped or handled:', err);
    }

    // Attach ResizeObserver to keep tiles rendered during layout changes
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch {}
    };
  }, []);

  // Sync with active tactical filter: fly camera to designated sector & adapt tile layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (activeFilter === 'tour-vance') {
      map.flyTo([45.4996, -73.5717], 16, { duration: 1.2 });
    } else if (activeFilter === 'centre-ville') {
      map.flyTo([45.5017, -73.5673], 15, { duration: 1.2 });
    } else if (activeFilter === 'ile-complete') {
      map.flyTo([45.53, -73.65], 11.5, { duration: 1.2 });
    } else if (activeFilter === 'cyber-dark') {
      setCurrentTileKey('dark');
      map.flyTo([45.5038, -73.5709], 15, { duration: 1.2 });
    } else if (activeFilter === 'satellite') {
      setCurrentTileKey('satellite');
      map.flyTo([45.5050, -73.5515], 14, { duration: 1.2 });
    }
  }, [activeFilter]);

  // Trigger invalidateSize when toggling fullscreen
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Update Base Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTile = L.tileLayer(TILE_LAYERS[currentTileKey].url, {
      attribution: TILE_LAYERS[currentTileKey].attribution,
      maxZoom: 19
    }).addTo(map);
    tileLayerRef.current = newTile;
  }, [currentTileKey]);

  // Render Metro Lines
  useEffect(() => {
    const group = layerGroupsRef.current.metroLines;
    if (!group) return;
    group.clearLayers();

    if (!layersVisibility.metroLines) return;

    METRO_LINES.forEach(line => {
      const latlngs = line.stations.map(s => [s.lat, s.lng] as [number, number]);
      
      // Neon Metro Polyline
      const polyline = L.polyline(latlngs, {
        color: line.color,
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 4',
        lineCap: 'round'
      }).addTo(group);

      polyline.bindTooltip(`
        <div class="tactical-tooltip-content">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
            <span style="color: ${line.color}; font-weight: bold; font-size: 9px;">[RÉSEAU STM // MÉTRO SOUTERRAIN]</span>
            <span style="color: #00ff41; font-size: 8px;">ACTIF</span>
          </div>
          <div style="font-weight: bold; color: #fff; font-size: 11px;">Ligne ${line.name} (${line.stations.length} stations)</div>
          <div style="font-size: 9px; color: #cbd5e1; margin-top: 2px;">Transit lourd souterrain • Connecté au RÉSO 2033</div>
        </div>
      `, {
        sticky: true,
        className: 'tactical-marker-tooltip',
        opacity: 0.98
      });

      polyline.bindPopup(`
        <div style="font-family: monospace; font-size: 12px; color: #fff;">
          <strong style="color: ${line.color}; font-size: 13px;">🚇 STM MÉTRO // ${line.name.toUpperCase()}</strong>
          <p style="margin: 6px 0 0 0; color: #cbd5e1;">Réseau souterrain de transport lourd de Montréal. Connecté au RÉSO.</p>
        </div>
      `);

      // Station Circle Markers
      line.stations.forEach(st => {
        const stationIcon = L.divIcon({
          className: 'custom-metro-icon',
          html: `<div style="width: 10px; height: 10px; background: ${line.color}; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 8px ${line.color};"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        });

        const stationMarker = L.marker([st.lat, st.lng], { icon: stationIcon })
          .addTo(group);

        stationMarker.bindTooltip(`
          <div class="tactical-tooltip-content">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
              <span style="color: ${line.color}; font-weight: bold; font-size: 9px;">[STATION MÉTRO // ${line.name.toUpperCase()}]</span>
              <span style="color: #00ff41; font-size: 8px;">RÉSEAU STM</span>
            </div>
            <div style="font-weight: bold; color: #fff; font-size: 12px; margin-bottom: 2px;">Station ${st.name}</div>
            <div style="font-size: 9px; color: #cbd5e1; margin-bottom: 2px;">Pôle multimodal souterrain • RÉSO 2033</div>
            <div style="display: flex; justify-content: space-between; font-size: 9px; color: #00f3ff; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 2px;">
              <span>GPS: ${st.lat.toFixed(4)}, ${st.lng.toFixed(4)}</span>
              <span style="color: #94a3b8;">[Survol • Clic pour fiche]</span>
            </div>
          </div>
        `, {
          direction: 'top',
          offset: [0, -8],
          className: 'tactical-marker-tooltip',
          opacity: 0.98
        });

        stationMarker.bindPopup(`
          <div style="font-family: monospace; font-size: 12px; color: #fff;">
            <strong style="color: ${line.color};">STATION ${st.name.toUpperCase()}</strong>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Ligne: ${line.name} • Télémétrie STM GTFS</div>
          </div>
        `);
      });
    });
  }, [layersVisibility.metroLines]);

  // Render Landmarks & Vance POIs
  useEffect(() => {
    const group = layerGroupsRef.current.landmarks;
    if (!group) return;
    group.clearLayers();

    if (!layersVisibility.landmarks) return;

    const currentTargetFilter = hoveredFilter || activeFilter;

    MONTREAL_LANDMARKS.forEach(poi => {
      // Determine if this landmark is targeted by the current tactical filter
      const isTargeted = 
        currentTargetFilter === 'ile-complete' ||
        (currentTargetFilter === 'tour-vance' && poi.id === 'vance_hq') ||
        (currentTargetFilter === 'centre-ville' && (poi.id === 'pvm_hub' || poi.id === 'spvm_station')) ||
        (currentTargetFilter === 'cyber-dark' && poi.id === 'reso_core') ||
        (currentTargetFilter === 'satellite' && poi.id === 'port_chokepoint');

      const isHovered = hoveredFilter !== null && isTargeted;

      const icon = L.divIcon({
        className: `custom-landmark-icon ${isTargeted ? 'pin-pulse-active' : ''}`,
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
            <!-- Outer Tactical Pulse Ring -->
            <div style="position: absolute; width: ${isTargeted ? '46px' : '28px'}; height: ${isTargeted ? '46px' : '28px'}; border-radius: 50%; background: ${poi.color}${isTargeted ? '35' : '15'}; border: ${isTargeted ? '2px' : '1px'} solid ${poi.color}; animation: ping ${isHovered ? '0.9s' : isTargeted ? '1.3s' : '2.2s'} cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            
            ${isTargeted ? `
              <!-- Secondary Sonar Pulse Ring -->
              <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; border: 1.5px dashed ${poi.color}; animation: spin 4s linear infinite, ping 2s ease-out infinite;"></div>
            ` : ''}

            <!-- Center Core Marker -->
            <div style="width: ${isTargeted ? '18px' : '14px'}; height: ${isTargeted ? '18px' : '14px'}; background: ${poi.color}; border: 2px solid #ffffff; border-radius: ${isTargeted ? '4px' : '3px'}; box-shadow: 0 0 ${isTargeted ? '18px' : '10px'} ${poi.color}; transition: all 0.25s ease; ${isHovered ? 'transform: scale(1.3);' : ''}"></div>
          </div>
        `,
        iconSize: [isTargeted ? 46 : 28, isTargeted ? 46 : 28],
        iconAnchor: [isTargeted ? 23 : 14, isTargeted ? 23 : 14]
      });

      const marker = L.marker([poi.lat, poi.lng], { icon }).addTo(group);
      
      // Technical Hover Tooltip
      marker.bindTooltip(`
        <div class="tactical-tooltip-content">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 3px;">
            <span style="color: ${poi.color}; font-weight: bold; font-size: 9px;">[${poi.category.toUpperCase()} // MENACE: ${poi.threat}]</span>
            <span style="color: #64748b; font-size: 8px;">ID: ${poi.id}</span>
          </div>
          <div style="font-weight: bold; color: #fff; font-size: 12px; margin-bottom: 2px;">${poi.name}</div>
          <div style="color: #cbd5e1; font-size: 10px; line-height: 1.3; margin-bottom: 3px;">${poi.desc}</div>
          <div style="display: flex; justify-content: space-between; font-size: 9px; color: #00f3ff; border-top: 1px dashed rgba(0,243,255,0.3); padding-top: 3px;">
            <span>GPS: ${poi.lat.toFixed(4)}, ${poi.lng.toFixed(4)}</span>
            <span style="color: #f59e0b;">[Survol • Clic détails]</span>
          </div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -18],
        className: 'tactical-marker-tooltip',
        opacity: 0.98
      });

      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 12px; color: #fff; max-width: 240px;">
          <div style="font-size: 9px; color: ${poi.color}; font-weight: bold; text-transform: uppercase;">[POINT TACTIQUE • MENACE: ${poi.threat}]</div>
          <div style="font-size: 13px; font-weight: bold; color: #fff; margin-top: 2px;">${poi.name}</div>
          <p style="margin: 6px 0; color: #cbd5e1; font-size: 11px;">${poi.desc}</p>
          <div style="font-size: 10px; color: #00f3ff;">GPS: ${poi.lat.toFixed(4)}, ${poi.lng.toFixed(4)}</div>
        </div>
      `);

      marker.on('click', () => {
        sound.playLoot();
        if (onSelectPOI) onSelectPOI(poi);
      });
    });
  }, [layersVisibility.landmarks, onSelectPOI, activeFilter, hoveredFilter]);

  // Render OSINT Pins
  useEffect(() => {
    const group = layerGroupsRef.current.osintPins;
    if (!group) return;
    group.clearLayers();

    if (!layersVisibility.osintPins) return;

    const currentTargetFilter = hoveredFilter || activeFilter;

    OSINT_TACTICAL_PINS.forEach(pin => {
      const isHacked = hackedPins.includes(pin.id);
      const pinColor = isHacked ? '#00ff41' : '#f59e0b';

      const isTargeted = 
        currentTargetFilter === 'ile-complete' ||
        (currentTargetFilter === 'tour-vance' && pin.id === 'pin_cibc') ||
        (currentTargetFilter === 'centre-ville' && pin.id === 'pin_pvm') ||
        (currentTargetFilter === 'cyber-dark' && pin.id === 'pin_reso') ||
        (currentTargetFilter === 'satellite' && (pin.id === 'pin_mont_royal' || pin.id === 'pin_vieux_port'));

      const isHovered = hoveredFilter !== null && isTargeted;

      const icon = L.divIcon({
        className: `custom-osint-icon ${isTargeted ? 'pin-pulse-active' : ''}`,
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transition: all 0.3s ease; ${isHovered ? 'transform: scale(1.15) translateY(-2px);' : ''}">
            <div style="background: #090e1a; border: ${isTargeted ? '1.5px' : '1px'} solid ${pinColor}; color: ${pinColor}; font-size: ${isTargeted ? '10px' : '9px'}; font-weight: bold; padding: 2px 5px; border-radius: 3px; white-space: nowrap; box-shadow: 0 0 ${isTargeted ? '14px' : '8px'} ${pinColor}${isTargeted ? '88' : '55'};">
              ${isHacked ? '✓ ' : '📡 '}${pin.label}
            </div>
            <div style="width: ${isTargeted ? '3px' : '2px'}; height: ${isTargeted ? '8px' : '6px'}; background: ${pinColor};"></div>
            <div style="position: relative; width: ${isTargeted ? '12px' : '8px'}; height: ${isTargeted ? '12px' : '8px'}; background: ${pinColor}; border-radius: 50%; box-shadow: 0 0 ${isTargeted ? '12px' : '6px'} ${pinColor};">
              ${isTargeted ? `
                <div style="position: absolute; inset: -4px; border-radius: 50%; border: 1px solid ${pinColor}; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              ` : ''}
            </div>
          </div>
        `,
        iconSize: [90, 36],
        iconAnchor: [45, 30]
      });

      const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(group);
      
      // Technical Hover Tooltip
      marker.bindTooltip(`
        <div class="tactical-tooltip-content">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 3px;">
            <span style="color: ${pinColor}; font-weight: bold; font-size: 9px;">[BALISE OSINT // ${isHacked ? 'DÉCRYPTÉE' : 'CHIFFRÉE'}]</span>
            <span style="color: ${isHacked ? '#00ff41' : '#f59e0b'}; font-size: 8px; font-weight: bold;">${isHacked ? '100% INFILTRÉ' : 'VERROUILLÉE'}</span>
          </div>
          <div style="font-weight: bold; color: #fff; font-size: 12px; margin-bottom: 2px;">${pin.label}</div>
          <div style="color: #cbd5e1; font-size: 10px; line-height: 1.3; margin-bottom: 3px;">${pin.desc}</div>
          <div style="display: flex; justify-content: space-between; font-size: 9px; color: #00f3ff; border-top: 1px dashed rgba(245,158,11,0.3); padding-top: 3px;">
            <span>GPS: ${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}</span>
            <span style="color: ${isHacked ? '#00ff41' : '#f59e0b'};">[${isHacked ? 'Accès obtenu' : 'Clic pour pirater'}]</span>
          </div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -26],
        className: 'tactical-marker-tooltip',
        opacity: 0.98
      });

      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 12px; color: #fff;">
          <strong style="color: ${pinColor}; font-size: 13px;">📡 BALISE OSINT // ${pin.label.toUpperCase()}</strong>
          <p style="margin: 6px 0; color: #cbd5e1; font-size: 11px;">${pin.desc}</p>
          <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; color: ${isHacked ? '#00ff41' : '#f59e0b'}; font-weight: bold;">
              ${isHacked ? 'STATUT: INFILTRÉ (100%)' : 'STATUT: CHIFFRÉ'}
            </span>
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onHackPin && !isHacked) {
          onHackPin(pin.id, pin.label);
        }
      });
    });
  }, [layersVisibility.osintPins, hackedPins, onHackPin, activeFilter, hoveredFilter]);

  // Render STM Route Complete Trace Polyline & Key Waypoint Stops
  useEffect(() => {
    const group = layerGroupsRef.current.stmRouteTrace;
    if (!group) return;
    group.clearLayers();

    if (!layersVisibility.stmRouteTrace && !isolateStmRoute) return;
    if (!selectedStmRoute) return;

    const routeGeo = STM_ROUTE_GEOMETRIES[selectedStmRoute];
    if (!routeGeo) return;

    // 1. Broad Neon Aura Polyline
    L.polyline(routeGeo.path, {
      color: routeGeo.color,
      weight: 10,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(group);

    // 2. High-contrast Foreground Polyline with animated dash styling
    const tracePolyline = L.polyline(routeGeo.path, {
      color: routeGeo.color,
      weight: 4,
      opacity: 0.95,
      dashArray: '8, 5',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(group);

    tracePolyline.bindTooltip(`
      <div class="tactical-tooltip-content">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
          <span style="color: ${routeGeo.color}; font-weight: bold; font-size: 10px;">[TRACÉ COMPLET STM // LIGNE ${routeGeo.routeId}]</span>
          <span style="color: #00ff41; font-size: 8px; font-weight: bold;">${isolateStmRoute ? 'ISOLÉ SUR CARTE' : 'TRACÉ ACTIF'}</span>
        </div>
        <div style="font-weight: bold; color: #fff; font-size: 12px; margin-bottom: 2px;">${routeGeo.routeName}</div>
        <div style="font-size: 10px; color: #cbd5e1; margin-bottom: 3px;">${routeGeo.corridor}</div>
        <div style="display: flex; justify-content: space-between; font-size: 9px; color: #00f3ff; border-top: 1px dashed rgba(56,189,248,0.3); padding-top: 3px;">
          <span>Longueur: <strong>${routeGeo.stats.lengthKm} km</strong></span>
          <span style="color: #cbd5e1;">Fréq: <strong>${routeGeo.stats.frequencyMin} min</strong></span>
          <span style="color: #94a3b8;">${routeGeo.stats.fleetType}</span>
        </div>
      </div>
    `, {
      sticky: true,
      className: 'tactical-marker-tooltip',
      opacity: 0.98
    });

    // 3. Key Stops along the route
    routeGeo.keyStops.forEach((stop, idx) => {
      const isTerm = stop.isTerminal;
      const stopIcon = L.divIcon({
        className: 'custom-bus-stop-icon',
        html: `
          <div style="position: relative; width: ${isTerm ? '22px' : '16px'}; height: ${isTerm ? '22px' : '16px'}; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; background: #050811; border: 2px solid ${routeGeo.color}; border-radius: 50%; box-shadow: 0 0 ${isTerm ? '12px' : '6px'} ${routeGeo.color};"></div>
            <div style="width: ${isTerm ? '8px' : '6px'}; height: ${isTerm ? '8px' : '6px'}; background: ${isTerm ? '#ffffff' : routeGeo.color}; border-radius: 50%;"></div>
            ${isTerm ? `<div style="position: absolute; inset: -4px; border: 1.5px dashed ${routeGeo.color}; border-radius: 50%; animation: spin 4s linear infinite;"></div>` : ''}
          </div>
        `,
        iconSize: [isTerm ? 22 : 16, isTerm ? 22 : 16],
        iconAnchor: [isTerm ? 11 : 8, isTerm ? 11 : 8]
      });

      const stopMarker = L.marker(stop.coords, { icon: stopIcon }).addTo(group);

      stopMarker.bindTooltip(`
        <div class="tactical-tooltip-content">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
            <span style="color: ${routeGeo.color}; font-weight: bold; font-size: 9px;">[ARRÊT STM // LIGNE ${routeGeo.routeId}]</span>
            ${isTerm ? '<span style="color: #ff0055; font-size: 8px; font-weight: bold;">TERMINUS</span>' : `<span style="color: #38bdf8; font-size: 8px;">JALON #${idx + 1}</span>`}
          </div>
          <div style="font-weight: bold; color: #fff; font-size: 12px; margin-bottom: 2px;">${stop.name}</div>
          ${stop.connections && stop.connections.length > 0 ? `<div style="color: #94a3b8; font-size: 10px; margin-bottom: 3px;">Correspondances: <span style="color: #00ff41;">${stop.connections.join(' • ')}</span></div>` : ''}
          <div style="display: flex; justify-content: space-between; font-size: 9px; color: #00f3ff; border-top: 1px dashed rgba(56,189,248,0.3); padding-top: 3px;">
            <span>GPS: ${stop.coords[0].toFixed(4)}, ${stop.coords[1].toFixed(4)}</span>
            <span style="color: #94a3b8;">Cadence: ${routeGeo.stats.frequencyMin} min</span>
          </div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -10],
        className: 'tactical-marker-tooltip',
        opacity: 0.98
      });
    });
  }, [layersVisibility.stmRouteTrace, isolateStmRoute, selectedStmRoute]);

  // Render STM Live Buses (with dynamic filtering for selected line and technical tooltips)
  useEffect(() => {
    const group = layerGroupsRef.current.stmBuses;
    if (!group) return;
    group.clearLayers();

    if (!layersVisibility.stmBuses) return;

    const currentRouteGeo = STM_ROUTE_GEOMETRIES[selectedStmRoute];

    // Vehicles to render
    interface RenderBus {
      route: string;
      label: string;
      lat: number;
      lng: number;
      speed: number;
      delaySeconds: number;
      isLive: boolean;
      direction?: string;
    }

    const busesToRender: RenderBus[] = [];

    if (stmLiveReport && stmLiveReport.vehicles && stmLiveReport.vehicles.length > 0) {
      const reportRoute = String(stmLiveReport.route || stmLiveReport.routeId || '');
      
      stmLiveReport.vehicles.forEach(v => {
        // If isolateStmRoute is enabled, strictly include vehicles matching selected line
        if (isolateStmRoute) {
          if (reportRoute === selectedStmRoute || !reportRoute) {
            busesToRender.push({
              route: reportRoute || selectedStmRoute,
              label: v.label,
              lat: v.latitude,
              lng: v.longitude,
              speed: v.speedKmH,
              delaySeconds: v.delaySeconds,
              isLive: true,
              direction: currentRouteGeo?.routeName || 'Ligne Régulière'
            });
          }
        } else {
          busesToRender.push({
            route: reportRoute || 'STM',
            label: v.label,
            lat: v.latitude,
            lng: v.longitude,
            speed: v.speedKmH,
            delaySeconds: v.delaySeconds,
            isLive: true,
            direction: 'En service'
          });
        }
      });
    }

    // If isolating, ensure we display vehicles on the selected route track
    if (isolateStmRoute && busesToRender.length === 0 && currentRouteGeo) {
      const path = currentRouteGeo.path;
      const step1 = Math.max(1, Math.floor(path.length * 0.2));
      const step2 = Math.max(2, Math.floor(path.length * 0.55));
      const step3 = Math.max(3, Math.floor(path.length * 0.85));

      busesToRender.push(
        {
          route: selectedStmRoute,
          label: `${selectedStmRoute}-214`,
          lat: path[step1][0],
          lng: path[step1][1],
          speed: 26,
          delaySeconds: 0,
          isLive: true,
          direction: currentRouteGeo.keyStops[currentRouteGeo.keyStops.length - 1]?.name || 'Est'
        },
        {
          route: selectedStmRoute,
          label: `${selectedStmRoute}-308`,
          lat: path[step2][0],
          lng: path[step2][1],
          speed: 31,
          delaySeconds: 120,
          isLive: true,
          direction: currentRouteGeo.keyStops[0]?.name || 'Ouest'
        },
        {
          route: selectedStmRoute,
          label: `${selectedStmRoute}-412`,
          lat: path[step3][0],
          lng: path[step3][1],
          speed: 18,
          delaySeconds: 240,
          isLive: true,
          direction: currentRouteGeo.keyStops[currentRouteGeo.keyStops.length - 1]?.name || 'Est'
        }
      );
    } else if (!isolateStmRoute && busesToRender.length === 0) {
      // General demo buses across network when not isolating
      const demoBuses = [
        { route: '24', label: '42-101', lat: 45.5045, lng: -73.5742, speed: 28, delaySeconds: 120, isLive: false, direction: 'Sherbrooke Est' },
        { route: '136', label: '38-092', lat: 45.4982, lng: -73.5680, speed: 19, delaySeconds: 0, isLive: false, direction: 'Viau Sud' },
        { route: '55', label: '40-112', lat: 45.5160, lng: -73.5820, speed: 24, delaySeconds: 60, isLive: false, direction: 'St-Laurent Nord' },
        { route: '106', label: '41-884', lat: 45.5120, lng: -73.5550, speed: 34, delaySeconds: 300, isLive: false, direction: 'Newman' },
        { route: '139', label: '39-441', lat: 45.5310, lng: -73.5820, speed: 22, delaySeconds: 60, isLive: false, direction: 'Pie-IX Express' },
        { route: '747', label: '43-005', lat: 45.4850, lng: -73.6150, speed: 65, delaySeconds: 0, isLive: false, direction: 'YUL Aéroport' }
      ];
      demoBuses.forEach(b => busesToRender.push(b));
    }

    // Draw all prepared buses with custom icons, technical tooltips, and popups
    busesToRender.forEach(v => {
      const isDelayed = v.delaySeconds > 180;
      const busColor = isDelayed ? '#f59e0b' : currentRouteGeo?.routeId === v.route ? '#38bdf8' : '#00f3ff';
      const delayMin = Math.round(v.delaySeconds / 60);

      const icon = L.divIcon({
        className: 'custom-bus-icon',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background: #050811; border: 1.5px solid ${busColor}; color: #fff; font-size: 9px; font-family: monospace; font-weight: bold; padding: 1px 5px; border-radius: 3px; white-space: nowrap; box-shadow: 0 0 8px ${busColor};">
              🚌 L-${v.route} (#${v.label})
            </div>
            <div style="position: relative; width: 10px; height: 10px; background: ${busColor}; border: 1.5px solid #fff; border-radius: 50%; margin-top: 2px; box-shadow: 0 0 6px ${busColor};">
              <div style="position: absolute; inset: -4px; border: 1px solid ${busColor}; border-radius: 50%; animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            </div>
          </div>
        `,
        iconSize: [70, 28],
        iconAnchor: [35, 22]
      });

      const marker = L.marker([v.lat, v.lng], { icon }).addTo(group);

      // Technical Hover Tooltip (Without opening full popup)
      marker.bindTooltip(`
        <div class="tactical-tooltip-content">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
            <span style="color: #38bdf8; font-weight: bold; font-size: 9px;">[BUS STM GTFS-R // LIGNE ${v.route}]</span>
            <span style="color: ${isDelayed ? '#f59e0b' : '#00ff41'}; font-size: 8px; font-weight: bold;">${isDelayed ? 'RETARD' : 'À L\'HEURE'}</span>
          </div>
          <div style="font-weight: bold; color: #fff; font-size: 12px; margin-bottom: 2px;">Véhicule #${v.label} • Ligne ${v.route}</div>
          <div style="font-size: 9px; color: #cbd5e1; margin-bottom: 2px;">Direction: <span style="color: #fff;">${v.direction || 'En transit'}</span></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px; font-size: 9px; color: #cbd5e1; margin-bottom: 2px;">
            <div>Vitesse: <span style="color: #00ff41; font-weight: bold;">${v.speed} km/h</span></div>
            <div>Écart: <span style="color: ${isDelayed ? '#f59e0b' : '#00ff41'}; font-weight: bold;">${delayMin > 0 ? `+${delayMin} min` : 'Ponctuel'}</span></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 9px; color: #00f3ff; border-top: 1px dashed rgba(56,189,248,0.3); padding-top: 2px;">
            <span>GPS: ${v.lat.toFixed(4)}, ${v.lng.toFixed(4)}</span>
            <span style="color: #94a3b8;">[Survol • Clic pour fiche]</span>
          </div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -20],
        className: 'tactical-marker-tooltip',
        opacity: 0.98
      });

      // Full Details Popup on Click
      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 12px; color: #fff; min-width: 220px; background: #070a14; padding: 4px; border-radius: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(56,189,248,0.3); padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: #38bdf8; font-size: 12px;">🚌 STM BUS // LIGNE ${v.route}</strong>
            <span style="font-size: 9px; color: ${v.isLive ? '#00ff41' : '#f59e0b'}; font-weight: bold;">${v.isLive ? 'GTFS-R LIVE' : 'SIMULATION'}</span>
          </div>
          <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 4px;">
            Numéro d'immatriculation : <strong style="color: #fff;">#${v.label}</strong>
          </div>
          <div style="margin-top: 4px; font-size: 11px; color: #cbd5e1; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
            <div style="background: rgba(255,255,255,0.05); padding: 4px; border-radius: 3px;">
              <div style="font-size: 9px; color: #94a3b8;">Vitesse</div>
              <div style="color: #00ff41; font-weight: bold;">${v.speed} km/h</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 4px; border-radius: 3px;">
              <div style="font-size: 9px; color: #94a3b8;">Ponctualité</div>
              <div style="color: ${isDelayed ? '#f59e0b' : '#00ff41'}; font-weight: bold;">${delayMin > 0 ? `+${delayMin} min` : 'À l\'heure'}</div>
            </div>
          </div>
          <div style="margin-top: 6px; font-size: 10px; color: #00f3ff; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 4px;">
            Coordonnées GPS : ${v.lat.toFixed(5)}, ${v.lng.toFixed(5)}
          </div>
        </div>
      `);
    });
  }, [layersVisibility.stmBuses, stmLiveReport, selectedStmRoute, isolateStmRoute]);

  // Render SkyFi Optical Scan Polygon & Footprint
  useEffect(() => {
    const group = layerGroupsRef.current.skyfiFootprint;
    if (!group) return;
    group.clearLayers();

    if (!layersVisibility.skyfiFootprint) return;

    // Scanning polygon over Downtown Montreal & Port
    const skyfiBounds: [number, number][] = [
      [45.5180, -73.5850],
      [45.5120, -73.5420],
      [45.4880, -73.5550],
      [45.4940, -73.5950]
    ];

    const polygon = L.polygon(skyfiBounds, {
      color: '#00f3ff',
      weight: 2,
      fillColor: '#00f3ff',
      fillOpacity: 0.12,
      dashArray: '6, 6'
    }).addTo(group);

    polygon.bindTooltip(`
      <div class="tactical-tooltip-content">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
          <span style="color: #00f3ff; font-weight: bold; font-size: 9px;">[IMAGERIE SATELLITAIRE // SKYFI]</span>
          <span style="color: #00ff41; font-size: 8px; font-weight: bold;">RÉSOLUTION 0.3M HD</span>
        </div>
        <div style="font-weight: bold; color: #fff; font-size: 11px; margin-bottom: 2px;">Couverture Ville-Marie & Vieux-Port</div>
        <div style="font-size: 9px; color: #cbd5e1;">Pénétration multispectrale, détection thermique & infrarouge</div>
      </div>
    `, {
      sticky: true,
      className: 'tactical-marker-tooltip',
      opacity: 0.98
    });

    polygon.bindPopup(`
      <div style="font-family: monospace; font-size: 12px; color: #fff;">
        <strong style="color: #00f3ff;">🛰️ CONSTELLATION SKYFI // EMPREINTE OPTIQUE 0.3M HD</strong>
        <p style="margin: 4px 0; color: #cbd5e1; font-size: 11px;">Survol satellite haute résolution actif. Pénétration spectrale et thermographie.</p>
      </div>
    `);
  }, [layersVisibility.skyfiFootprint]);

  // Render God Eye Cameras & Biometric Mesh
  useEffect(() => {
    const group = layerGroupsRef.current.godEyeCameras;
    if (!group) return;
    group.clearLayers();

    if (!layersVisibility.godEyeCameras && !godEyeActive) return;

    const cameraLocations = [
      { id: 'cam_1', name: 'CAM #082 - Ste-Catherine / Peel', lat: 45.5002, lng: -73.5732 },
      { id: 'cam_2', name: 'CAM #119 - René-Lévesque / University', lat: 45.5020, lng: -73.5670 },
      { id: 'cam_3', name: 'CAM #204 - De Maisonneuve / McGill', lat: 45.5039, lng: -73.5710 },
      { id: 'cam_4', name: 'CAM #312 - St-Antoine / Place Bonaventure', lat: 45.4980, lng: -73.5660 },
      { id: 'cam_5', name: 'CAM #401 - St-Laurent / René-Lévesque', lat: 45.5080, lng: -73.5610 }
    ];

    cameraLocations.forEach(cam => {
      const icon = L.divIcon({
        className: 'custom-cam-icon',
        html: `
          <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; background: #00ff4122; border: 1px solid #00ff41; border-radius: 50%; box-shadow: 0 0 8px #00ff41;">
            <div style="width: 6px; height: 6px; background: #00ff41; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([cam.lat, cam.lng], { icon })
        .addTo(group);

      marker.bindTooltip(`
        <div class="tactical-tooltip-content">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
            <span style="color: #00ff41; font-weight: bold; font-size: 9px;">[CAMÉRA 4K // GOD-EYE]</span>
            <span style="color: #00ff41; font-size: 8px;">EN LIGNE</span>
          </div>
          <div style="font-weight: bold; color: #fff; font-size: 11px; margin-bottom: 2px;">${cam.name}</div>
          <div style="font-size: 9px; color: #cbd5e1; margin-bottom: 2px;">Capteur biométrique haute définition 360°</div>
          <div style="display: flex; justify-content: space-between; font-size: 9px; color: #00f3ff; border-top: 1px dashed rgba(0,255,65,0.3); padding-top: 2px;">
            <span>GPS: ${cam.lat.toFixed(4)}, ${cam.lng.toFixed(4)}</span>
            <span style="color: #94a3b8;">[Survol • Clic pour flux]</span>
          </div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -10],
        className: 'tactical-marker-tooltip',
        opacity: 0.98
      });

      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 12px; color: #fff;">
          <strong style="color: #00ff41;">👁️ GOD EYE // ${cam.name}</strong>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Flux vidéo 4K UHD • Reconnaissance biométrique active</div>
        </div>
      `);
    });
  }, [layersVisibility.godEyeCameras, godEyeActive]);

  // Mini Drone OSINT Layer Effect
  useEffect(() => {
    const group = layerGroupsRef.current.droneLayer;
    if (!group) return;
    group.clearLayers();

    if (!layersVisibility.osintDrone || !droneMission?.isActive) return;

    const { currentPosition, targetPosition, heading, altitudeMeters, speedKmh, batteryPercent, tasks, currentTaskIndex, status, currentStationId } = droneMission;
    const currentTask = tasks[currentTaskIndex] || tasks[0];
    const isCharging = status === 'charging';
    const isDocking = status === 'docking';
    const currentStation = DRONE_CHARGING_STATIONS.find(s => s.id === currentStationId);
    const droneColor = isCharging ? '#00ff41' : isDocking ? '#38bdf8' : '#f59e0b';

    // 1. Draw Target Laser Vector (Polyline between drone and current target)
    if (targetPosition) {
      L.polyline([[currentPosition.lat, currentPosition.lng], [targetPosition.lat, targetPosition.lng]], {
        color: droneColor,
        weight: 2,
        opacity: 0.85,
        dashArray: isDocking ? '4, 4' : '5, 8'
      }).addTo(group);

      // Target pulsing marker ring at destination (if in flight)
      if (!isCharging) {
        const targetIcon = L.divIcon({
          className: 'custom-drone-target-icon',
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; inset: 0; border: 1.5px dashed ${droneColor}; border-radius: 50%; animation: spin 4s linear infinite;"></div>
              <div style="position: absolute; inset: 4px; border: 1.5px solid ${droneColor}; border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 6px; height: 6px; background: ${droneColor}; border-radius: 50%; box-shadow: 0 0 10px ${droneColor};"></div>
              <div style="position: absolute; top: 34px; background: rgba(5,8,17,0.92); border: 1px solid ${droneColor}; color: ${droneColor}; font-size: 8px; font-weight: bold; padding: 2px 4px; border-radius: 2px; white-space: nowrap; box-shadow: 0 0 8px ${droneColor}55;">
                ${isDocking ? `⚡ PAD // ${currentStation?.name.toUpperCase()}` : `🎯 ${currentTask.targetName.toUpperCase()}`}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker([targetPosition.lat, targetPosition.lng], { icon: targetIcon }).addTo(group);
      }
    }

    // 2. Animated Cyber Drone Marker (Adapts if in flight vs docked/charging)
    const droneIcon = L.divIcon({
      className: 'custom-osint-drone-marker',
      html: `
        <div style="position: relative; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); transition: transform 0.4s ease;">
          ${!isCharging ? `
            <!-- Radar Sweep Ring Expanding outwards -->
            <div style="position: absolute; inset: -12px; border: 1.5px solid ${droneColor}; border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.65; pointer-events: none;"></div>
            <!-- Spotlight Cone Beam projecting forward -->
            <div style="position: absolute; top: -45px; left: 12px; width: 40px; height: 45px; background: linear-gradient(to top, ${droneColor}44, transparent); clip-path: polygon(50% 100%, 0% 0%, 100% 0%); pointer-events: none; opacity: 0.75;"></div>
          ` : `
            <!-- Charging Energy Field Halo -->
            <div style="position: absolute; inset: -10px; border: 2px solid #00ff41; border-radius: 50%; box-shadow: 0 0 20px #00ff41; animation: pulse 1s infinite; pointer-events: none;"></div>
          `}

          <!-- Drone Body SVG (Sleek Quadcopter) -->
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px ${droneColor});">
            <!-- Rotors arms -->
            <line x1="8" y1="8" x2="40" y2="40" stroke="${droneColor}" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="40" y1="8" x2="8" y2="40" stroke="${droneColor}" stroke-width="2.5" stroke-linecap="round"/>
            
            <!-- 4 Rotor Discs (Spinning if flying, halted if charging) -->
            <circle cx="8" cy="8" r="6" stroke="${isCharging ? '#00ff4155' : '#00f3ff'}" stroke-width="1.5" stroke-dasharray="3 3" style="${isCharging ? '' : 'animation: spin 0.25s linear infinite;'}"/>
            <circle cx="40" cy="8" r="6" stroke="${isCharging ? '#00ff4155' : '#00f3ff'}" stroke-width="1.5" stroke-dasharray="3 3" style="${isCharging ? '' : 'animation: spin 0.25s linear infinite;'}"/>
            <circle cx="8" cy="40" r="6" stroke="${isCharging ? '#00ff4155' : '#00f3ff'}" stroke-width="1.5" stroke-dasharray="3 3" style="${isCharging ? '' : 'animation: spin 0.25s linear infinite;'}"/>
            <circle cx="40" cy="40" r="6" stroke="${isCharging ? '#00ff4155' : '#00f3ff'}" stroke-width="1.5" stroke-dasharray="3 3" style="${isCharging ? '' : 'animation: spin 0.25s linear infinite;'}"/>

            <!-- Center Cockpit Pod -->
            <polygon points="24,10 32,24 24,34 16,24" fill="#0b0e14" stroke="${droneColor}" stroke-width="2"/>
            <!-- Sensor Lens -->
            <circle cx="24" cy="18" r="3" fill="${isCharging ? '#00ff41' : '#00f3ff'}"/>
            <!-- Strobe beacon -->
            <circle cx="24" cy="27" r="2" fill="${isCharging ? '#00ff41' : '#ff0055'}" style="animation: pulse 0.8s infinite;"/>
          </svg>

          <!-- Top Drone Telemetry Tag -->
          <div style="position: absolute; top: -24px; left: 50%; transform: translateX(-50%) rotate(${-heading}deg); background: rgba(5,8,17,0.95); border: 1px solid ${droneColor}; padding: 2px 6px; border-radius: 3px; font-size: 8px; font-family: monospace; font-weight: bold; color: ${droneColor}; white-space: nowrap; box-shadow: 0 0 10px ${droneColor}55; pointer-events: auto;">
            ${isCharging ? `⚡ RECHARGE EN COURS • ${batteryPercent}%` : isDocking ? `🛬 APPROCHE PAD // ${altitudeMeters}m` : `🛰️ REAPER OSINT // ${altitudeMeters}m • ${batteryPercent}%`}
          </div>
        </div>
      `,
      iconSize: [64, 64],
      iconAnchor: [32, 32]
    });

    const marker = L.marker([currentPosition.lat, currentPosition.lng], { icon: droneIcon, zIndexOffset: 1000 }).addTo(group);

    marker.bindTooltip(`
      <div class="tactical-tooltip-content">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
          <span style="color: ${droneColor}; font-weight: bold; font-size: 9px;">[DRONE OSINT // SHADOWBROKER]</span>
          <span style="color: ${droneColor}; font-size: 8px; font-weight: bold;">${isCharging ? 'EN CHARGE' : isDocking ? 'APPROCHE' : 'MISSION'}</span>
        </div>
        <div style="font-weight: bold; color: #fff; font-size: 11px; margin-bottom: 2px;">${currentTask.title}</div>
        <div style="font-size: 9px; color: #cbd5e1; margin-bottom: 2px;">Cible: <span style="color: #00f3ff;">${currentTask.targetName}</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 9px; color: #00f3ff; border-top: 1px dashed rgba(245,158,11,0.3); padding-top: 2px;">
          <span>Alt: ${altitudeMeters}m • ${speedKmh} km/h</span>
          <span style="color: ${batteryPercent < 20 ? '#ef4444' : '#00ff41'}; font-weight: bold;">⚡ ${batteryPercent}%</span>
        </div>
      </div>
    `, {
      direction: 'top',
      offset: [0, -32],
      className: 'tactical-marker-tooltip',
      opacity: 0.98
    });

    marker.bindPopup(`
      <div style="font-family: monospace; font-size: 11px; color: #fff; min-width: 250px; background: #070a14; padding: 6px; border-radius: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(245,158,11,0.3); padding-bottom: 4px; margin-bottom: 6px;">
          <strong style="color: ${droneColor}; font-size: 12px;">🛰️ DRONE OSINT SHADOWBROKER</strong>
          <span style="color: ${droneColor}; font-weight: bold; font-size: 9px;">
            ${isCharging ? 'EN RECHARGE (PAUSE)' : isDocking ? 'EN ATTERRISSAGE' : 'ACTIF (EN VOL)'}
          </span>
        </div>
        
        ${isCharging ? `
          <div style="background: rgba(0,255,65,0.1); border: 1px solid rgba(0,255,65,0.3); padding: 5px; border-radius: 3px; margin-bottom: 6px;">
            <div style="color: #00ff41; font-weight: bold; font-size: 10px;">⚡ STATION D'ACCUEIL : ${currentStation?.name || 'Pad Inductif'}</div>
            <div style="color: #a7f3d0; font-size: 9px;">Batterie : <strong>${batteryPercent}%</strong> (Recharge rapide en cours...)</div>
          </div>
          <button id="btn-resume-drone-popup" style="width: 100%; padding: 5px; background: #00ff41; color: #000; font-weight: bold; border: none; border-radius: 3px; font-size: 10px; cursor: pointer; text-transform: uppercase;">
            ▶️ REPRENDRE LA PATROUILLE OSINT
          </button>
        ` : isDocking ? `
          <div style="background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.3); padding: 5px; border-radius: 3px; margin-bottom: 6px;">
            <div style="color: #38bdf8; font-weight: bold; font-size: 10px;">🛬 DOCKING EN COURS : ${currentStation?.name || 'Station'}</div>
            <div style="color: #cbd5e1; font-size: 9px;">Descente vers le pad (Alt: ${altitudeMeters}m)...</div>
          </div>
          <button id="btn-abort-dock-popup" style="width: 100%; padding: 5px; background: #38bdf8; color: #000; font-weight: bold; border: none; border-radius: 3px; font-size: 10px; cursor: pointer; text-transform: uppercase;">
            ▶️ ANNULER & REPRENDRE LE VOL
          </button>
        ` : `
          <div style="color: #cbd5e1; font-size: 10px; margin-bottom: 4px;">
            <strong>Tâche [${currentTaskIndex + 1}/${tasks.length}] :</strong> ${currentTask.title}
          </div>
          <div style="color: #94a3b8; font-size: 9px; margin-bottom: 4px;">
            Cible : <span style="color: #00f3ff;">${currentTask.targetName}</span>
          </div>
          <div style="color: #64748b; font-size: 9px; font-family: monospace; margin-bottom: 6px;">
            Vitesse : ${speedKmh} km/h • Alt : ${altitudeMeters}m • Batterie : ${batteryPercent}%
          </div>
          ${currentTask.interceptedData ? `
            <div style="background: rgba(0,243,255,0.08); border: 1px solid rgba(0,243,255,0.3); color: #00f3ff; padding: 4px 6px; border-radius: 3px; font-size: 9px; margin-bottom: 6px;">
              ${currentTask.interceptedData}
            </div>
          ` : ''}
          <div style="display: flex; gap: 4px;">
            <button id="btn-next-drone-task" style="flex: 1; padding: 5px; background: #f59e0b; color: #000; font-weight: bold; border: none; border-radius: 3px; font-size: 10px; cursor: pointer; text-transform: uppercase;">
              🎯 SUIVANTE
            </button>
            <button id="btn-dock-drone-popup" style="flex: 1; padding: 5px; background: #00f3ff; color: #000; font-weight: bold; border: none; border-radius: 3px; font-size: 10px; cursor: pointer; text-transform: uppercase;">
              ⚡ DOCKER
            </button>
          </div>
        `}
      </div>
    `);

    marker.on('popupopen', () => {
      const btnNext = document.getElementById('btn-next-drone-task');
      if (btnNext && onTriggerShadowBrokerDrone) {
        btnNext.onclick = () => onTriggerShadowBrokerDrone();
      }
      const btnDock = document.getElementById('btn-dock-drone-popup');
      if (btnDock && onToggleDronePauseDock) {
        btnDock.onclick = () => onToggleDronePauseDock();
      }
      const btnResume = document.getElementById('btn-resume-drone-popup');
      if (btnResume && onToggleDronePauseDock) {
        btnResume.onclick = () => onToggleDronePauseDock();
      }
      const btnAbort = document.getElementById('btn-abort-dock-popup');
      if (btnAbort && onToggleDronePauseDock) {
        btnAbort.onclick = () => onToggleDronePauseDock();
      }
    });

  }, [droneMission, layersVisibility.osintDrone, onTriggerShadowBrokerDrone, onToggleDronePauseDock]);

  // Charging Stations Layer Effect
  useEffect(() => {
    const group = layerGroupsRef.current.chargingStations;
    if (!group) return;
    group.clearLayers();

    if (!layersVisibility.chargingStations) return;

    DRONE_CHARGING_STATIONS.forEach(station => {
      const isOccupied = droneMission?.currentStationId === station.id && (droneMission?.status === 'charging' || droneMission?.status === 'docking');
      const padColor = isOccupied ? '#00ff41' : '#00f3ff';

      const icon = L.divIcon({
        className: 'custom-charging-pad-icon',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <!-- Outer Hexagon / Pad ring -->
            <div style="position: absolute; inset: 4px; border: 2px solid ${padColor}; border-radius: 8px; background: rgba(5,8,17,0.85); box-shadow: 0 0 ${isOccupied ? '16px #00ff41' : '8px #00f3ff55'}; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 16px; filter: drop-shadow(0 0 6px ${padColor});">${isOccupied ? '⚡' : '🔋'}</span>
            </div>
            ${isOccupied ? `
              <div style="position: absolute; inset: -4px; border: 1.5px solid #00ff41; border-radius: 12px; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            ` : ''}
            <!-- Station Label -->
            <div style="position: absolute; bottom: -16px; background: rgba(5,8,17,0.92); border: 1px solid ${padColor}; color: ${padColor}; font-size: 8px; font-family: monospace; font-weight: bold; padding: 1px 4px; border-radius: 2px; white-space: nowrap; box-shadow: 0 0 6px ${padColor}44;">
              ${station.name.toUpperCase()}
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([station.coords.lat, station.coords.lng], { icon }).addTo(group);

      marker.bindTooltip(`
        <div class="tactical-tooltip-content">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px;">
            <span style="color: ${padColor}; font-weight: bold; font-size: 9px;">[STATION DRONE // INDUCTION]</span>
            <span style="color: ${isOccupied ? '#00ff41' : '#38bdf8'}; font-size: 8px; font-weight: bold;">${isOccupied ? 'OCCUPÉ' : 'DISPONIBLE'}</span>
          </div>
          <div style="font-weight: bold; color: #fff; font-size: 11px; margin-bottom: 2px;">${station.name}</div>
          <div style="font-size: 9px; color: #cbd5e1; margin-bottom: 2px;">Secteur: <span style="color: #00f3ff;">${station.district}</span></div>
          <div style="display: flex; justify-content: space-between; font-size: 9px; color: #00ff41; border-top: 1px dashed rgba(0,243,255,0.3); padding-top: 2px;">
            <span>Vitesse: +${station.chargeRatePercentPerSec}%/s</span>
            <span style="color: #94a3b8;">[Survol • Clic pour dock]</span>
          </div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -24],
        className: 'tactical-marker-tooltip',
        opacity: 0.98
      });

      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; color: #fff; min-width: 220px; background: #070a14; padding: 6px; border-radius: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,243,255,0.3); padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: ${padColor}; font-size: 12px;">⚡ STATION DE RECHARGE</strong>
            <span style="color: ${isOccupied ? '#00ff41' : '#38bdf8'}; font-weight: bold; font-size: 9px;">
              ${isOccupied ? 'OCCUPÉ (DRONE)' : 'DISPONIBLE'}
            </span>
          </div>
          <div style="color: #cbd5e1; font-weight: bold; font-size: 11px; margin-bottom: 2px;">
            ${station.name}
          </div>
          <div style="color: #94a3b8; font-size: 9px; margin-bottom: 4px;">
            Quartier : <span style="color: #00f3ff;">${station.district}</span>
          </div>
          <div style="color: #64748b; font-size: 9px; margin-bottom: 6px;">
            ${station.description}
          </div>
          <div style="background: rgba(0,255,65,0.1); border: 1px solid rgba(0,255,65,0.3); color: #00ff41; padding: 3px 5px; border-radius: 3px; font-size: 9px; font-weight: bold; margin-bottom: 6px;">
            Vitesse de charge : +${station.chargeRatePercentPerSec}% / sec
          </div>
          <button id="btn-dock-pad-${station.id}" style="width: 100%; padding: 5px; background: ${isOccupied ? '#00ff41' : '#00f3ff'}; color: #000; font-weight: bold; border: none; border-radius: 3px; font-size: 10px; cursor: pointer; text-transform: uppercase;">
            ${isOccupied ? '▶️ REPRENDRE LE VOL' : '⚡ FAIRE ATTERRIR LE DRONE ICI'}
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-dock-pad-${station.id}`);
        if (btn && onToggleDronePauseDock) {
          btn.onclick = () => {
            onToggleDronePauseDock(station.id);
          };
        }
      });
    });
  }, [layersVisibility.chargingStations, droneMission?.currentStationId, droneMission?.status, onToggleDronePauseDock]);

  // Center on Downtown Montreal
  const handleCenterDowntown = () => {
    sound.playLoot();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([45.5017, -73.5673], 15, { duration: 1.2 });
    }
  };

  // Center on Vance Holdings CIBC Tower
  const handleCenterVance = () => {
    sound.playVictory();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([45.4996, -73.5717], 17, { duration: 1.5 });
    }
  };

  // Zoom to Island Overview
  const handleCenterIsland = () => {
    sound.playLoot();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([45.53, -73.65], 11.5, { duration: 1.5 });
    }
  };

  return (
    <div className={`flex flex-col bg-[#050811] rounded-xl border border-[#00f3ff44] overflow-hidden shadow-2xl font-mono ${isFullscreen ? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none border-none' : 'relative w-full h-full'} ${className}`}>
      
      {/* Top Map HUD Bar */}
      <div className="px-4 py-2 bg-[#090e1a] border-b border-[#00f3ff33] flex flex-wrap items-center justify-between gap-2 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#00f3ff] animate-pulse" />
            <span className="text-xs font-orbitron font-bold text-white uppercase tracking-wider">
              CARTE TACTIQUE MONTRÉAL 2033 // SIG GÉOSPATIAL
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-[#00ff4115] text-[#00ff41] border border-[#00ff4155] rounded font-bold">
            LAT: {cursorCoords.lat} • LNG: {cursorCoords.lng}
          </span>
        </div>

        {/* Action Controls & Tile Switcher */}
        <div className="flex items-center gap-2">
          {/* Quick Presets */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCenterDowntown}
              className="px-2 py-1 bg-[#111827] hover:bg-[#1f2937] border border-white/10 text-gray-300 hover:text-white rounded text-[10px] cursor-pointer transition-all"
              title="Centrer sur Centre-Ville Ville-Marie"
            >
              Centre-Ville
            </button>
            <button
              onClick={handleCenterVance}
              className="px-2 py-1 bg-[#ff005522] hover:bg-[#ff005544] border border-[#ff005588] text-[#ff0055] rounded text-[10px] font-bold cursor-pointer transition-all"
              title="Centrer sur la Tour CIBC / Vance"
            >
              🎯 Tour Vance
            </button>
            <button
              onClick={handleCenterIsland}
              className="px-2 py-1 bg-[#111827] hover:bg-[#1f2937] border border-white/10 text-gray-300 hover:text-white rounded text-[10px] cursor-pointer transition-all"
              title="Vue d'ensemble de l'Île de Montréal"
            >
              Île Complète
            </button>
          </div>

          {/* Calques Toggle Button */}
          <button
            onClick={() => {
              sound.playUiClick();
              setIsLayersPanelOpen(prev => !prev);
            }}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              isLayersPanelOpen 
                ? 'bg-[#00f3ff22] text-[#00f3ff] border border-[#00f3ff88] shadow-[0_0_8px_rgba(0,243,255,0.2)]'
                : 'bg-[#111827] text-gray-300 hover:text-white border border-white/10 hover:border-cyan-400'
            }`}
            title={isLayersPanelOpen ? "Fermer le panneau des calques pour voir la carte complète" : "Ouvrir les calques tactiques"}
          >
            <Layers className="w-3.5 h-3.5 text-[#00f3ff]" />
            <span>{isLayersPanelOpen ? 'Calques [Ouvert]' : 'Calques [Fermé]'}</span>
            <span className="text-[9px] px-1 py-0.2 bg-black/40 rounded text-cyan-300">
              {activeLayersCount}/{totalLayersCount}
            </span>
          </button>

          {/* Tile Switcher Buttons */}
          <div className="flex items-center bg-[#050811] p-0.5 rounded border border-white/10">
            {(['dark', 'satellite', 'osm'] as const).map(tk => (
              <button
                key={tk}
                onClick={() => {
                  sound.playLoot();
                  setCurrentTileKey(tk);
                }}
                className={`px-2 py-1 text-[10px] rounded cursor-pointer transition-all ${
                  currentTileKey === tk
                    ? 'bg-[#00f3ff22] text-[#00f3ff] border border-[#00f3ff55] font-bold'
                    : 'text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                {tk === 'dark' ? '🌌 Cyber Dark' : tk === 'satellite' ? '🛰️ Satellite HD' : '🗺️ Carto'}
              </button>
            ))}
          </div>

          {onTriggerOrbitalScan && (
            <button
              onClick={() => {
                sound.playVictory();
                onTriggerOrbitalScan();
              }}
              className="px-2.5 py-1 bg-[#00f3ff] text-black font-orbitron font-bold text-[10px] uppercase rounded shadow-[0_0_10px_rgba(0,243,255,0.4)] hover:brightness-110 cursor-pointer flex items-center gap-1 transition-all"
              title="Exécuter un scan orbital SkyFi"
            >
              <Radio className="w-3 h-3" />
              <span>Scan SkyFi</span>
            </button>
          )}

          {onTriggerShadowBrokerDrone && (
            <button
              onClick={() => {
                sound.playVictory();
                if (!droneMission?.isActive) {
                  onTriggerShadowBrokerDrone();
                  setIsDronePipOpen(true);
                } else {
                  setIsDronePipOpen(prev => !prev);
                }
              }}
              className={`px-2.5 py-1 font-orbitron font-bold text-[10px] uppercase rounded shadow-[0_0_12px_rgba(245,158,11,0.4)] cursor-pointer flex items-center gap-1.5 transition-all ${
                droneMission?.isActive
                  ? 'bg-[#f59e0b] text-black shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse'
                  : 'bg-[#f59e0b22] hover:bg-[#f59e0b44] text-[#f59e0b] border border-[#f59e0b88]'
              }`}
              title={droneMission?.isActive ? "Afficher / masquer la console caméra du drone OSINT" : "Déployer le Mini Drone OSINT [Touche 7]"}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>{droneMission?.isActive ? 'DRONE EN VOL' : 'DRONE OSINT [7]'}</span>
            </button>
          )}

          {/* Fullscreen Expand / Collapse button */}
          <button
            onClick={() => {
              sound.playUiClick();
              setIsFullscreen(prev => !prev);
            }}
            className="p-1.5 bg-[#111827] hover:bg-[#1f2937] border border-white/10 hover:border-cyan-400 text-gray-300 hover:text-white rounded cursor-pointer transition-all"
            title={isFullscreen ? "Quitter le plein écran" : "Afficher la carte en plein écran"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Map Canvas Layer */}
      <div className="relative flex-1 w-full h-full min-h-[220px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Layer Controls overlay: Collapsible & Expandable to view full map */}
        {!isLayersPanelOpen ? (
          <button
            onClick={() => {
              sound.playUiClick();
              setIsLayersPanelOpen(true);
            }}
            className="absolute top-3 right-3 z-[1000] bg-[#090e1a]/95 hover:bg-[#0f172a] backdrop-blur-md border border-[#00f3ff66] hover:border-[#00f3ff] rounded-lg px-3 py-2 shadow-2xl text-[11px] font-mono text-white flex items-center gap-2.5 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] group"
            title="Ouvrir le panneau des calques tactiques"
          >
            <div className="p-1 rounded bg-[#00f3ff22] text-[#00f3ff] group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="font-orbitron font-bold text-[10px] text-[#00f3ff] tracking-wider">
                CALQUES TACTIQUES
              </span>
              <span className="text-[9px] text-gray-400">
                {activeLayersCount > 0 ? `${activeLayersCount}/${totalLayersCount} visibles` : 'Tous masqués'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 ml-1 group-hover:translate-y-0.5 transition-transform" />
          </button>
        ) : (
          <div className="absolute top-3 right-3 z-[1000] bg-[#090e1a]/95 backdrop-blur-md border border-[#00f3ff66] rounded-xl p-3 shadow-[0_0_25px_rgba(0,0,0,0.8)] text-[11px] font-mono space-y-2 max-w-xs w-[280px] animate-in fade-in zoom-in-95 duration-150">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-white font-bold text-[11px] font-orbitron">
                <Layers className="w-3.5 h-3.5 text-[#00f3ff]" />
                <span className="tracking-wide">CALQUES TACTIQUES</span>
                <span className="px-1.5 py-0.5 bg-[#00f3ff22] text-[#00f3ff] text-[9px] rounded-full font-bold">
                  {activeLayersCount}/{totalLayersCount}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Toggle all layers (view clear map) */}
                <button
                  onClick={() => toggleAllLayers()}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-cyan-300 transition-colors"
                  title={areAllLayersActive ? "Masquer tous les calques (Carte Épurée)" : "Afficher tous les calques"}
                >
                  {areAllLayersActive ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  ) : activeLayersCount === 0 ? (
                    <EyeOff className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </button>

                {/* Close / Collapse button */}
                <button
                  onClick={() => {
                    sound.playUiClick();
                    setIsLayersPanelOpen(false);
                  }}
                  className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                  title="Fermer pour voir la carte complète"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Layer Checkboxes */}
            <div className="space-y-1.5 py-0.5 max-h-[260px] overflow-y-auto pr-0.5">
              <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 text-gray-300 hover:text-white cursor-pointer select-none transition-colors">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layersVisibility.stmBuses}
                    onChange={() => toggleLayer('stmBuses')}
                    className="accent-[#38bdf8] rounded"
                  />
                  <span className="text-[#38bdf8]">🚌 Bus STM GTFS-R</span>
                </span>
                <span className="text-[9px] font-mono text-gray-500">142 Actifs</span>
              </label>

              <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 text-gray-300 hover:text-white cursor-pointer select-none transition-colors">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layersVisibility.metroLines}
                    onChange={() => toggleLayer('metroLines')}
                    className="accent-[#00ff41] rounded"
                  />
                  <span className="text-[#00ff41]">🚇 Lignes de Métro</span>
                </span>
                <span className="text-[9px] font-mono text-gray-500">4 Lignes</span>
              </label>

              <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 text-gray-300 hover:text-white cursor-pointer select-none transition-colors">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layersVisibility.landmarks}
                    onChange={() => toggleLayer('landmarks')}
                    className="accent-[#ff0055] rounded"
                  />
                  <span className="text-[#ff0055]">🏢 QG Vance & POI</span>
                </span>
                <span className="text-[9px] font-mono text-gray-500">5 Points</span>
              </label>

              <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 text-gray-300 hover:text-white cursor-pointer select-none transition-colors">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layersVisibility.osintPins}
                    onChange={() => toggleLayer('osintPins')}
                    className="accent-[#f59e0b] rounded"
                  />
                  <span className="text-[#f59e0b]">📡 Balises OSINT</span>
                </span>
                <span className="text-[9px] font-mono text-amber-400 font-bold">{hackedPins.length}/6</span>
              </label>

              <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 text-gray-300 hover:text-white cursor-pointer select-none transition-colors">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layersVisibility.skyfiFootprint}
                    onChange={() => toggleLayer('skyfiFootprint')}
                    className="accent-[#00f3ff] rounded"
                  />
                  <span className="text-[#00f3ff]">🛰️ Cône SkyFi 0.3m</span>
                </span>
                <span className="text-[9px] font-mono text-cyan-400">0.3m HD</span>
              </label>

              <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 text-gray-300 hover:text-white cursor-pointer select-none transition-colors">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layersVisibility.godEyeCameras}
                    onChange={() => toggleLayer('godEyeCameras')}
                    className="accent-[#00ff41] rounded"
                  />
                  <span className="text-[#00ff41]">👁️ Caméras God Eye</span>
                </span>
                <span className="text-[9px] font-mono text-emerald-400">384 Cam</span>
              </label>

              <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 text-gray-300 hover:text-white cursor-pointer select-none transition-colors">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layersVisibility.osintDrone}
                    onChange={() => toggleLayer('osintDrone')}
                    className="accent-[#f59e0b] rounded"
                  />
                  <span className="text-[#f59e0b]">🛰️ Mini Drone OSINT</span>
                </span>
                <span className="text-[9px] font-mono text-amber-400">
                  {droneMission?.status === 'charging' ? 'Recharge' : droneMission?.isActive ? 'En vol' : 'Prêt'}
                </span>
              </label>

              <label className="flex items-center justify-between p-1 rounded hover:bg-white/5 text-gray-300 hover:text-white cursor-pointer select-none transition-colors">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layersVisibility.chargingStations}
                    onChange={() => toggleLayer('chargingStations')}
                    className="accent-[#00f3ff] rounded"
                  />
                  <span className="text-[#00f3ff]">⚡ Stations de Recharge</span>
                </span>
                <span className="text-[9px] font-mono text-cyan-400">4 Pads</span>
              </label>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={() => toggleAllLayers(!areAllLayersActive)}
                className="flex-1 py-1 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-gray-300 hover:text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
                title={areAllLayersActive ? "Masquer tous les calques pour une vue carte épurée" : "Réactiver tous les calques"}
              >
                {areAllLayersActive ? <EyeOff className="w-3 h-3 text-red-400" /> : <Eye className="w-3 h-3 text-emerald-400" />}
                <span>{areAllLayersActive ? 'Carte Épurée' : 'Tous Actifs'}</span>
              </button>
              
              <button
                onClick={() => {
                  sound.playUiClick();
                  setIsLayersPanelOpen(false);
                }}
                className="py-1 px-2.5 bg-[#00f3ff22] hover:bg-[#00f3ff33] border border-[#00f3ff55] rounded text-[10px] text-[#00f3ff] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                title="Fermer pour voir la carte complète"
              >
                <span>Fermer</span>
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Floating Mini Drone OSINT Live PiP Camera & Recon HUD */}
        {droneMission && isDronePipOpen && (
          <div className="absolute bottom-4 left-3 z-[1000] w-72 sm:w-84 max-w-[92vw] bg-[#060a14]/95 backdrop-blur-md border border-[#f59e0b88] rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.3)] overflow-hidden font-mono text-white animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* HUD Header */}
            <div className="bg-[#0c1222] px-3 py-1.5 border-b border-[#f59e0b44] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  droneMission.status === 'charging' 
                    ? 'bg-[#00ff41] animate-pulse' 
                    : droneMission.status === 'docking' 
                      ? 'bg-[#38bdf8] animate-ping' 
                      : droneMission.isActive 
                        ? 'bg-[#00ff41] animate-ping' 
                        : 'bg-gray-500'
                }`} />
                <span className="font-orbitron font-bold text-[#f59e0b] text-[10px] tracking-wider flex items-center gap-1">
                  <Satellite className="w-3.5 h-3.5 text-[#f59e0b]" />
                  {droneMission.status === 'charging' 
                    ? 'DRONE // EN RECHARGE [PAUSE]' 
                    : droneMission.status === 'docking' 
                      ? 'DRONE // DOCKING EN COURS' 
                      : 'DRONE REAPER // EN VOL'}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <div className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border ${
                  droneMission.status === 'charging' 
                    ? 'text-[#00ff41] bg-[#00ff4122] border-[#00ff4166] animate-pulse' 
                    : 'text-[#00ff41] bg-black/60 border-[#00ff4133]'
                }`}>
                  <Battery className="w-3 h-3 text-[#00ff41]" />
                  <span>{droneMission.batteryPercent}%</span>
                </div>
                <button
                  onClick={() => setIsDronePipOpen(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Masquer la caméra drone"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Live Camera Screen */}
            <div className={`relative w-full h-32 sm:h-36 overflow-hidden border-b border-[#f59e0b33] flex flex-col justify-between p-2 select-none ${
              droneVisionMode === 'FLIR' 
                ? 'bg-gradient-to-b from-[#1a051d] via-[#380922] to-[#040b1a]' 
                : droneVisionMode === 'SIGINT' 
                  ? 'bg-gradient-to-b from-[#021814] to-[#010908]' 
                  : 'bg-gradient-to-b from-[#040813] to-[#020409]'
            }`}>
              {/* Scanline CRT overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-25" 
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.8) 2px, rgba(0, 0, 0, 0.8) 4px)' }}
              />

              {/* Thermal color map filter overlay if FLIR */}
              {droneVisionMode === 'FLIR' && (
                <div className="absolute inset-0 pointer-events-none opacity-30 bg-gradient-to-tr from-cyan-500 via-amber-500 to-fuchsia-600 mix-blend-color" />
              )}

              {/* Artificial Horizon / Pitch ladder */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-28 border-t border-dashed border-white" />
                <div className="absolute h-16 border-l border-dashed border-white" />
              </div>

              {/* Center Dynamic Crosshair Target Lock */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className={`absolute inset-0 border border-dashed rounded-full animate-spin ${droneVisionMode === 'FLIR' ? 'border-[#ff0055]' : 'border-[#f59e0b]'}`} style={{ animationDuration: '6s' }} />
                  <div className={`w-2 h-2 rounded-full ${droneVisionMode === 'FLIR' ? 'bg-[#ff0055]' : 'bg-[#00f3ff]'}`} />
                  <span className="absolute -top-3 text-[7px] font-mono text-gray-400 tracking-wider">
                    {droneMission.status === 'charging' ? 'STATUT: EN CHARGE' : 'LOCK: TARGET'}
                  </span>
                </div>
              </div>

              {/* Top Video Telemetry Overlay */}
              <div className="relative z-10 flex items-center justify-between text-[8px] font-mono">
                <span className="text-[#00ff41] bg-black/70 px-1 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  REC • {droneVisionMode}
                </span>
                <span className="text-[#00f3ff] bg-black/70 px-1 rounded">
                  ALT: {droneMission.altitudeMeters}M • SPD: {droneMission.speedKmh} KM/H
                </span>
              </div>

              {/* Bottom Video Telemetry Overlay */}
              <div className="relative z-10 flex items-center justify-between text-[8px] font-mono">
                <span className="text-gray-400 bg-black/70 px-1 rounded">
                  POS: {droneMission.currentPosition.lat.toFixed(4)}°N, {droneMission.currentPosition.lng.toFixed(4)}°W
                </span>
                <span className="text-[#f59e0b] bg-black/70 px-1 rounded">
                  CAP: {droneMission.heading.toFixed(0)}°
                </span>
              </div>
            </div>

            {/* Active Mission Card & Intercepted Signals */}
            <div className="p-2.5 space-y-2 text-[10px]">
              {(() => {
                const currentTask = droneMission.tasks[droneMission.currentTaskIndex] || droneMission.tasks[0];
                const currentStation = DRONE_CHARGING_STATIONS.find(s => s.id === droneMission.currentStationId);
                return (
                  <div>
                    {droneMission.status === 'charging' ? (
                      <div className="p-1.5 bg-[#00ff4115] border border-[#00ff4144] rounded space-y-1 mb-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[#00ff41] font-bold text-[9px] flex items-center gap-1">
                            <Zap className="w-3 h-3 text-[#00ff41]" />
                            RECHARGE EN COURS SUR PAD
                          </span>
                          <span className="text-[8px] text-gray-300 font-bold">
                            +{currentStation?.chargeRatePercentPerSec || 8}%/s
                          </span>
                        </div>
                        <div className="text-gray-300 text-[9px]">
                          Station : <strong className="text-white">{currentStation?.name || 'Héliport PVM'}</strong>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[#f59e0b] font-orbitron font-bold text-[9px] uppercase tracking-wide flex items-center gap-1">
                            <Activity className="w-3 h-3 text-[#f59e0b]" />
                            TÂCHE {droneMission.currentTaskIndex + 1}/{droneMission.tasks.length} : {currentTask.title}
                          </span>
                          <span className="text-[8px] text-[#00ff41] font-bold bg-[#00ff4115] px-1 py-0.2 rounded border border-[#00ff4133]">
                            +{currentTask.rewardNanites} Nanites
                          </span>
                        </div>

                        <div className="text-gray-300 text-[9px] leading-tight mb-1.5">
                          Cible : <span className="text-[#00f3ff] font-bold">{currentTask.targetName}</span>
                        </div>

                        {currentTask.interceptedData && (
                          <div className="bg-[#03060d] border border-[#00f3ff44] rounded p-1.5 font-mono text-[8px] text-[#00f3ff] leading-relaxed max-h-14 overflow-y-auto">
                            <div className="text-gray-400 font-bold mb-0.5 flex items-center gap-1">
                              <Terminal className="w-2.5 h-2.5 text-[#00f3ff]" />
                              SIGNAL INTERCEPTÉ (433.92 MHz) :
                            </div>
                            {currentTask.interceptedData}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Action Buttons: 2x2 Interactive Grid */}
              <div className="grid grid-cols-2 gap-1 pt-1 border-t border-white/10">
                <button
                  onClick={() => {
                    sound.playLoot();
                    setDroneVisionMode(v => v === 'OPTICAL' ? 'FLIR' : v === 'FLIR' ? 'SIGINT' : 'OPTICAL');
                  }}
                  className="py-1 px-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[8px] text-gray-300 hover:text-white text-center font-bold transition-all cursor-pointer truncate flex items-center justify-center gap-1"
                  title="Changer le mode de caméra drone"
                >
                  <span>👁️ VISION: {droneVisionMode}</span>
                </button>

                <button
                  onClick={() => {
                    if (onToggleDronePauseDock) {
                      onToggleDronePauseDock();
                    }
                  }}
                  className={`py-1 px-1.5 font-bold rounded text-[8px] text-center font-orbitron transition-all cursor-pointer truncate flex items-center justify-center gap-1 ${
                    droneMission.status === 'charging' || droneMission.status === 'docking'
                      ? 'bg-[#00ff41] hover:bg-[#00ff41]/90 text-black shadow-[0_0_8px_rgba(0,255,65,0.4)]'
                      : 'bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black shadow-[0_0_8px_rgba(0,243,255,0.4)]'
                  }`}
                  title={droneMission.status === 'charging' ? "Reprendre la patrouille" : "Mettre en pause et se recharger à une station"}
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>{droneMission.status === 'charging' || droneMission.status === 'docking' ? '▶️ REPRENDRE' : '⚡ RECHARGER'}</span>
                </button>

                <button
                  onClick={() => {
                    if (onTriggerShadowBrokerDrone) {
                      sound.playLaserShoot();
                      onTriggerShadowBrokerDrone();
                    }
                  }}
                  className="py-1 px-1.5 bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black font-bold rounded text-[8px] text-center font-orbitron transition-all cursor-pointer truncate shadow-[0_0_8px_rgba(245,158,11,0.4)] flex items-center justify-center gap-1"
                  title="Passer à la prochaine mission OSINT"
                >
                  <Target className="w-2.5 h-2.5" />
                  <span>PROCH. TÂCHE</span>
                </button>

                <button
                  onClick={() => {
                    sound.playUiClick();
                    if (mapInstanceRef.current && droneMission) {
                      mapInstanceRef.current.flyTo([droneMission.currentPosition.lat, droneMission.currentPosition.lng], 16, { duration: 1 });
                    }
                  }}
                  className="py-1 px-1.5 bg-[#00f3ff22] hover:bg-[#00f3ff44] border border-[#00f3ff88] text-[#00f3ff] rounded text-[8px] text-center font-bold transition-all cursor-pointer truncate flex items-center justify-center gap-1"
                  title="Centrer la carte sur la position du drone"
                >
                  <span>📍 SUIVRE</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tactical Crosshair Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
          <div className="w-80 h-80 rounded-full border border-[#00f3ff] border-dashed animate-[spin_60s_linear_infinite]" />
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className="px-4 py-1.5 bg-[#090e1a] border-t border-[#00f3ff22] flex items-center justify-between text-[10px] text-gray-400 z-20 shrink-0 font-mono">
        <div className="flex items-center gap-3">
          <span>RÉSO: <span className="text-[#00ff41] font-bold">ACTIF (33 KM)</span></span>
          <span>FLUX STM: <span className="text-[#38bdf8] font-bold">142 BUS SUIVIS</span></span>
          <span>MENACE SPVM: <span className="text-[#ff0055] font-bold">NIVEAU 4</span></span>
        </div>
        <div className="text-gray-500">
          SYSTÈME GÉOSPATIAL MONTRÉAL 2033 // CLOUD RUN NGINX ROUTED
        </div>
      </div>
    </div>
  );
};
