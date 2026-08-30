import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Satellite, 
  Globe, 
  Train, 
  ShieldAlert, 
  Crosshair, 
  Eye, 
  Compass, 
  Maximize2, 
  Minimize2, 
  Search, 
  RefreshCw,
  MapPin,
  Radio,
  Sparkles
} from 'lucide-react';
import { STMBusStatusReport } from '../services/stmService';
import { sound } from '../utils/audio';

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
  hackedPins?: string[];
  onHackPin?: (pinId: string, label: string) => void;
  godEyeActive?: boolean;
  onTriggerOrbitalScan?: () => void;
  onSelectPOI?: (poi: any) => void;
  activeServiceId?: string;
  className?: string;
}

export const MontrealTacticalMap: React.FC<MontrealTacticalMapProps> = ({
  stmLiveReport,
  hackedPins = [],
  onHackPin,
  godEyeActive = false,
  onTriggerOrbitalScan,
  onSelectPOI,
  activeServiceId = 'world_monitor',
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});

  const [currentTileKey, setCurrentTileKey] = useState<keyof typeof TILE_LAYERS>('dark');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number }>({ lat: 45.5017, lng: -73.5673 });
  
  // Layer visibility state
  const [layersVisibility, setLayersVisibility] = useState({
    stmBuses: true,
    metroLines: true,
    landmarks: true,
    osintPins: true,
    skyfiFootprint: true,
    spvmBarricades: true,
    godEyeCameras: true
  });

  const toggleLayer = (layerKey: keyof typeof layersVisibility) => {
    sound.playLoot();
    setLayersVisibility(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
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
        metroLines: L.layerGroup().addTo(map),
        landmarks: L.layerGroup().addTo(map),
        osintPins: L.layerGroup().addTo(map),
        skyfiFootprint: L.layerGroup().addTo(map),
        spvmBarricades: L.layerGroup().addTo(map),
        godEyeCameras: L.layerGroup().addTo(map)
      };

      // Track mouse coordinates
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setCursorCoords({
          lat: Number(e.latlng.lat.toFixed(5)),
          lng: Number(e.latlng.lng.toFixed(5))
        });
      });

      // Invalidate size after mount to prevent grey tiles
      setTimeout(() => {
        try {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        } catch {}
      }, 250);
    } catch (err) {
      console.warn('Leaflet map initialization skipped or handled:', err);
    }

    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch {}
    };
  }, []);

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

        L.marker([st.lat, st.lng], { icon: stationIcon })
          .addTo(group)
          .bindPopup(`
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

    MONTREAL_LANDMARKS.forEach(poi => {
      const icon = L.divIcon({
        className: 'custom-landmark-icon',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: ${poi.color}25; border: 1px solid ${poi.color}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; background: ${poi.color}; border: 2px solid #ffffff; border-radius: 3px; box-shadow: 0 0 12px ${poi.color};"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([poi.lat, poi.lng], { icon }).addTo(group);
      
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
  }, [layersVisibility.landmarks, onSelectPOI]);

  // Render OSINT Pins
  useEffect(() => {
    const group = layerGroupsRef.current.osintPins;
    if (!group) return;
    group.clearLayers();

    if (!layersVisibility.osintPins) return;

    OSINT_TACTICAL_PINS.forEach(pin => {
      const isHacked = hackedPins.includes(pin.id);
      const pinColor = isHacked ? '#00ff41' : '#f59e0b';

      const icon = L.divIcon({
        className: 'custom-osint-icon',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="background: #090e1a; border: 1px solid ${pinColor}; color: ${pinColor}; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 3px; white-space: nowrap; box-shadow: 0 0 8px ${pinColor}55;">
              ${isHacked ? '✓ ' : '📡 '}${pin.label}
            </div>
            <div style="width: 2px; height: 6px; background: ${pinColor};"></div>
            <div style="width: 8px; height: 8px; background: ${pinColor}; border-radius: 50%; box-shadow: 0 0 6px ${pinColor};"></div>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 26]
      });

      const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(group);
      
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
  }, [layersVisibility.osintPins, hackedPins, onHackPin]);

  // Render STM Live Buses
  useEffect(() => {
    const group = layerGroupsRef.current.stmBuses;
    if (!group) return;
    group.clearLayers();

    if (!layersVisibility.stmBuses) return;

    if (stmLiveReport && stmLiveReport.vehicles && stmLiveReport.vehicles.length > 0) {
      stmLiveReport.vehicles.forEach(v => {
        const isDelayed = v.delaySeconds > 180;
        const busColor = isDelayed ? '#f59e0b' : '#38bdf8';

        const icon = L.divIcon({
          className: 'custom-bus-icon',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="background: #050811; border: 1px solid ${busColor}; color: #fff; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 3px; white-space: nowrap; box-shadow: 0 0 6px ${busColor};">
                🚌 ${stmLiveReport.route} (#${v.label})
              </div>
              <div style="width: 8px; height: 8px; background: ${busColor}; border-radius: 50%; margin-top: 2px;"></div>
            </div>
          `,
          iconSize: [60, 24],
          iconAnchor: [30, 20]
        });

        L.marker([v.latitude, v.longitude], { icon })
          .addTo(group)
          .bindPopup(`
            <div style="font-family: monospace; font-size: 12px; color: #fff;">
              <strong style="color: #38bdf8;">🚌 STM BUS // LIGNE ${stmLiveReport.route} (VÉHICULE #${v.label})</strong>
              <div style="margin-top: 6px; font-size: 11px; color: #cbd5e1;">
                <div>Vitesse : <span style="color: #00ff41; font-weight: bold;">${v.speedKmh} km/h</span></div>
                <div>Retard : <span style="color: ${isDelayed ? '#f59e0b' : '#00ff41'}; font-weight: bold;">${Math.round(v.delaySeconds / 60)} min</span></div>
                <div>GPS : ${v.latitude.toFixed(4)}, ${v.longitude.toFixed(4)}</div>
              </div>
            </div>
          `);
      });
    } else {
      // Default Montreal Demo bus cluster along Sherbrooke / René-Lévesque
      const demoBuses = [
        { route: '24', label: '42-101', lat: 45.5045, lng: -73.5742, speed: 28, delay: 2 },
        { route: '136', label: '38-092', lat: 45.4982, lng: -73.5680, speed: 19, delay: 0 },
        { route: '106', label: '41-884', lat: 45.5120, lng: -73.5550, speed: 34, delay: 5 },
        { route: '139', label: '39-441', lat: 45.5310, lng: -73.5820, speed: 22, delay: 1 }
      ];

      demoBuses.forEach(b => {
        const icon = L.divIcon({
          className: 'custom-bus-demo-icon',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="background: #050811; border: 1px solid #38bdf8; color: #38bdf8; font-size: 8px; font-weight: bold; padding: 1px 3px; border-radius: 2px; white-space: nowrap;">
                🚌 L-${b.route}
              </div>
              <div style="width: 6px; height: 6px; background: #38bdf8; border-radius: 50%; margin-top: 1px;"></div>
            </div>
          `,
          iconSize: [50, 20],
          iconAnchor: [25, 16]
        });

        L.marker([b.lat, b.lng], { icon })
          .addTo(group)
          .bindPopup(`
            <div style="font-family: monospace; font-size: 12px; color: #fff;">
              <strong style="color: #38bdf8;">🚌 STM BUS FLOTTE // LIGNE ${b.route} (#${b.label})</strong>
              <div style="font-size: 11px; margin-top: 4px;">Vitesse : ${b.speed} km/h • Retard : ${b.delay} min</div>
            </div>
          `);
      });
    }
  }, [layersVisibility.stmBuses, stmLiveReport]);

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

      L.marker([cam.lat, cam.lng], { icon })
        .addTo(group)
        .bindPopup(`
          <div style="font-family: monospace; font-size: 12px; color: #fff;">
            <strong style="color: #00ff41;">👁️ GOD EYE // ${cam.name}</strong>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Flux vidéo 4K UHD • Reconnaissance biométrique active</div>
          </div>
        `);
    });
  }, [layersVisibility.godEyeCameras, godEyeActive]);

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
    <div className={`relative w-full h-full flex flex-col bg-[#050811] rounded-xl border border-[#00f3ff44] overflow-hidden shadow-2xl font-mono ${className}`}>
      
      {/* Top Map HUD Bar */}
      <div className="px-4 py-2.5 bg-[#090e1a] border-b border-[#00f3ff33] flex flex-wrap items-center justify-between gap-2 z-20 shrink-0">
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
        </div>
      </div>

      {/* Map Canvas Layer */}
      <div className="relative flex-1 w-full h-full min-h-[400px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Layer Controls overlay */}
        <div className="absolute top-3 right-3 z-[1000] bg-[#090e1a]/90 backdrop-blur-md border border-[#00f3ff44] rounded-lg p-2.5 shadow-xl text-[11px] font-mono space-y-1.5 max-w-xs">
          <div className="flex items-center justify-between pb-1 border-b border-white/10 text-white font-bold text-[10px] uppercase font-orbitron">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#00f3ff]" />
              <span>Calques Tactiques</span>
            </span>
          </div>

          <label className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={layersVisibility.stmBuses}
              onChange={() => toggleLayer('stmBuses')}
              className="accent-[#38bdf8] rounded"
            />
            <span className="text-[#38bdf8]">🚌 Bus STM GTFS-Realtime</span>
          </label>

          <label className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={layersVisibility.metroLines}
              onChange={() => toggleLayer('metroLines')}
              className="accent-[#00ff41] rounded"
            />
            <span className="text-[#00ff41]">🚇 Lignes de Métro (4 Lignes)</span>
          </label>

          <label className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={layersVisibility.landmarks}
              onChange={() => toggleLayer('landmarks')}
              className="accent-[#ff0055] rounded"
            />
            <span className="text-[#ff0055]">🏢 QG Vance & Points Clés</span>
          </label>

          <label className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={layersVisibility.osintPins}
              onChange={() => toggleLayer('osintPins')}
              className="accent-[#f59e0b] rounded"
            />
            <span className="text-[#f59e0b]">📡 Balises OSINT ({hackedPins.length}/6)</span>
          </label>

          <label className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={layersVisibility.skyfiFootprint}
              onChange={() => toggleLayer('skyfiFootprint')}
              className="accent-[#00f3ff] rounded"
            />
            <span className="text-[#00f3ff]">🛰️ Cône Orbital SkyFi 0.3m</span>
          </label>

          <label className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={layersVisibility.godEyeCameras}
              onChange={() => toggleLayer('godEyeCameras')}
              className="accent-[#00ff41] rounded"
            />
            <span className="text-[#00ff41]">👁️ Caméras God Eye (384)</span>
          </label>
        </div>

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
