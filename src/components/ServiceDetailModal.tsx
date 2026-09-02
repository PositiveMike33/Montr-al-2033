import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  Satellite, 
  Zap, 
  Eye, 
  Train, 
  Gamepad2, 
  Activity, 
  Radio, 
  ShieldAlert, 
  Crosshair, 
  Cpu, 
  Flame, 
  RefreshCw, 
  CheckCircle2, 
  Search, 
  ExternalLink,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';
import { STMBusStatusReport } from '../services/stmService';
import { TacticalBridgeState, executeSophiaOSINTRecon, OpenOSINTReconResponse } from '../utils/cyberToolsBridge';
import { sound } from '../utils/audio';

import { MontrealTacticalMap } from './MontrealTacticalMap';
import { PlanetaryGlobe3D } from './PlanetaryGlobe3D';

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: 'game_arpg' | 'world_monitor' | 'shadowbroker' | 'deus_ex_sophia_ai' | 'god_eye_view' | 'stm_transit';
  onSelectService: (id: 'game_arpg' | 'world_monitor' | 'shadowbroker' | 'deus_ex_sophia_ai' | 'god_eye_view' | 'stm_transit') => void;
  onLaunchGame: () => void;
  tacticalState: TacticalBridgeState;
  onTriggerOrbitalScan: () => void;
  onTriggerShadowBrokerDrone: () => void;
  onTriggerSophiaSTMOverload: () => void;
  stmSearchRoute: string;
  setStmSearchRoute: (route: string) => void;
  stmLiveReport: STMBusStatusReport | null;
  isStmLoading: boolean;
  onSearchSTM: (route?: string) => Promise<void>;
  deepfakePercent: number;
  onBoostDeepfake: () => void;
  hackedPins: string[];
  onHackPin: (pinId: string, label: string) => void;
  godEyeActive: boolean;
  onToggleGodEye: () => void;
  onSendSophiaMessage: (msg: string) => void;
  addLog: (log: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  onSelectService,
  onLaunchGame,
  tacticalState,
  onTriggerOrbitalScan,
  onTriggerShadowBrokerDrone,
  onTriggerSophiaSTMOverload,
  stmSearchRoute,
  setStmSearchRoute,
  stmLiveReport,
  isStmLoading,
  onSearchSTM,
  deepfakePercent,
  onBoostDeepfake,
  hackedPins,
  onHackPin,
  godEyeActive,
  onToggleGodEye,
  onSendSophiaMessage,
  addLog
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'tools' | 'logs'>('view');
  const [activeMcpCategory, setActiveMcpCategory] = useState<string>('all');

  // OpenOSINT Autonomous Scanner State
  const [osintTargetInput, setOsintTargetInput] = useState<string>('vance-dynamics.mtl');
  const [osintType, setOsintType] = useState<'domain' | 'ip' | 'username' | 'email' | 'phone'>('domain');
  const [osintResult, setOsintResult] = useState<OpenOSINTReconResponse | null>(null);
  const [isOsintScanning, setIsOsintScanning] = useState<boolean>(false);

  const handleRunOsintRecon = async (customTarget?: string, customType?: 'domain' | 'ip' | 'username' | 'email' | 'phone') => {
    const t = customTarget || osintTargetInput.trim();
    const type = customType || osintType;
    if (!t) return;
    setIsOsintScanning(true);
    sound.playLoot();
    addLog(`OPENOSINT // Lancement scan [${type.toUpperCase()}] sur "${t}"...`);
    const res = await executeSophiaOSINTRecon(t, type);
    setIsOsintScanning(false);
    if (res) {
      setOsintResult(res);
      sound.playVictory();
      addLog(`OPENOSINT // Résultat obtenu pour "${t}" en ${res.durationMs}ms (Cache: ${res.cached ? 'OUI (0ms)' : 'NON'}).`);
    } else {
      sound.playEmpExplosion();
      addLog(`OPENOSINT // Échec de connexion au service OpenOSINT.`);
    }
  };

  if (!isOpen) return null;

  const getServiceMetadata = () => {
    switch (serviceId) {
      case 'world_monitor':
        return {
          title: 'World Monitor MCP (59 Outils & SkyFi)',
          port: 3000,
          color: '#00f3ff',
          icon: Globe,
          desc: 'Renseignement géostratégique mondial, imagerie satellitaire SkyFi 0.3m et 59 outils MCP.',
          endpoint: '/api/worldmonitor/telemetry'
        };
      case 'shadowbroker':
        return {
          title: 'ShadowBroker & OpenClaw OSINT',
          port: 3001,
          color: '#f59e0b',
          icon: Satellite,
          desc: 'Reconnaissance géospatiale OSINT sur Montréal, balises tactiques et patrouilles SPVM-Prime.',
          endpoint: '/api/shadowbroker/recon'
        };
      case 'deus_ex_sophia_ai':
        return {
          title: 'Deus Ex Sophia AI Gateway (Gemini 3.7 Flash)',
          port: 11434,
          color: '#ff00ff',
          icon: Zap,
          desc: 'Cerveau Quantique IA, inférence locale Flash Attention (0.2) et pipeline Deepfake Vance.',
          endpoint: '/api/sophia/chat'
        };
      case 'god_eye_view':
        return {
          title: 'God Eye View 3D Matrix & Caméras',
          port: 4173,
          color: '#00ff41',
          icon: Eye,
          desc: 'Matrice 3D omnisciente, moteur tactique haute altitude, 384 flux caméras urbaines et surveillance biométrique du RÉSO.',
          endpoint: 'http://localhost:4173/'
        };
      case 'stm_transit':
        return {
          title: 'STM Realtime Cloud & GTFS-Realtime',
          port: 6379,
          color: '#38bdf8',
          icon: Train,
          desc: 'Télémétrie GTFS-Realtime en direct via Cloud API, suivi de 142 bus et contrôle du métro.',
          endpoint: '/api/stm/vehicles'
        };
      default:
        return {
          title: 'Montréal 2033 (Jeu ARPG)',
          port: 3000,
          color: '#00f3ff',
          icon: Gamepad2,
          desc: 'Simulateur Action-RPG cyberpunk montréalais.',
          endpoint: '#game'
        };
    }
  };

  const meta = getServiceMetadata();
  const Icon = meta.icon;

  const MCP_SAMPLE_TOOLS = [
    { id: 'skyfi_sat_opt', name: 'skyfi_satellite_optical_scan', category: 'imagery', status: 'ONLINE', latency: '42ms' },
    { id: 'sentinel_sar_rad', name: 'sentinel_sar_radar_penetration', category: 'imagery', status: 'ONLINE', latency: '68ms' },
    { id: 'chokepoint_stlaw', name: 'chokepoint_st_lawrence_seaway', category: 'maritime', status: 'ONLINE', latency: '19ms' },
    { id: 'panama_suez_mon', name: 'global_chokepoints_panama_suez', category: 'maritime', status: 'ONLINE', latency: '35ms' },
    { id: 'acled_conflict_mtl', name: 'acled_conflict_zone_montreal', category: 'geopolitics', status: 'ONLINE', latency: '24ms' },
    { id: 'spvm_radio_intercept', name: 'spvm_prime_police_intercept', category: 'sigint', status: 'ONLINE', latency: '12ms' },
    { id: 'reso_subway_mesh', name: 'montreal_reso_power_mesh', category: 'infrastructure', status: 'ONLINE', latency: '15ms' },
    { id: 'vance_corp_wiretap', name: 'vance_holdings_financial_ledger', category: 'finance', status: 'ONLINE', latency: '8ms' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fadeIn font-sans select-none">
      <div className="bg-[#070a14] border border-[#00f3ff55] rounded-xl w-full max-w-5xl h-[96vh] sm:h-[88vh] flex flex-col shadow-[0_0_50px_rgba(0,243,255,0.25)] overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-4 bg-[#0d1322] border-b border-[#00f3ff33] flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border shadow-lg shrink-0"
              style={{ borderColor: meta.color, backgroundColor: `${meta.color}15`, color: meta.color }}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-base font-orbitron font-black text-white uppercase tracking-wider truncate">
                  {meta.title}
                </h2>
                <span className="hidden xs:inline px-2 py-0.5 text-[9px] font-mono bg-[#00ff4115] border border-[#00ff4155] text-[#00ff41] font-bold rounded shrink-0">
                  PORT {meta.port}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-mono text-gray-400 truncate">
                {meta.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                sound.playVictory();
                const hash = 
                  serviceId === 'world_monitor' ? '#/world-monitor' :
                  serviceId === 'shadowbroker' ? '#/shadowbroker' :
                  serviceId === 'stm_transit' ? '#/stm' :
                  serviceId === 'god_eye_view' ? '#/god-eye' :
                  serviceId === 'deus_ex_sophia_ai' ? '#/sophia' : '#/game';
                window.location.hash = hash;
                onClose();
              }}
              className="px-2.5 sm:px-3 py-1.5 bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black rounded text-[11px] sm:text-xs font-orbitron font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,243,255,0.4)] transition-all"
              title="Ouvrir l'application et la carte complète en pleine page avec URL"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">APPLICATION PLEINE PAGE</span>
              <span className="sm:hidden text-[10px]">PLEINE PAGE</span>
            </button>

            {/* Service switcher pills */}
            <div className="hidden md:flex items-center gap-1 bg-[#050811] p-1 rounded border border-white/10">
              {(['world_monitor', 'shadowbroker', 'stm_transit', 'god_eye_view', 'deus_ex_sophia_ai'] as const).map(sid => (
                <button
                  key={sid}
                  onClick={() => {
                    sound.playLoot();
                    onSelectService(sid);
                  }}
                  className={`px-2 py-1 text-[10px] font-mono rounded cursor-pointer transition-all ${
                    serviceId === sid 
                      ? 'bg-[#00f3ff22] text-[#00f3ff] border border-[#00f3ff55] font-bold' 
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  {sid === 'world_monitor' ? '🌐 World Monitor' :
                   sid === 'shadowbroker' ? '🛰️ ShadowBroker' :
                   sid === 'stm_transit' ? '🚇 STM Realtime' :
                   sid === 'god_eye_view' ? '👁️ God Eye' : '🧠 Sophia'}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                sound.playLoot();
                onClose();
              }}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white bg-[#111827] hover:bg-[#1f2937] border border-white/20 rounded-lg cursor-pointer transition-all"
              title="Fermer la page"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-3 sm:px-6 py-2 bg-[#090e1a] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-4 py-1.5 text-xs font-orbitron font-bold uppercase rounded transition-all cursor-pointer ${
                activeTab === 'view'
                  ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Vue Opérationnelle
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-1.5 text-xs font-orbitron font-bold uppercase rounded transition-all cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              59 Outils MCP & API
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-1.5 text-xs font-orbitron font-bold uppercase rounded transition-all cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Journal & Diagnostics
            </button>
          </div>

          <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2">
            <span>ENDPOINT:</span>
            <span className="text-[#00f3ff]">{meta.endpoint}</span>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#070a12]">
          
          {activeTab === 'view' && (
            <div className="space-y-6">
              
              {/* 1. WORLD MONITOR VIEW */}
              {serviceId === 'world_monitor' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-[#0c1222] border border-[#00f3ff33] rounded-lg">
                      <span className="text-gray-400 text-[10px] block font-mono">CONSTELLATION SKYFI</span>
                      <span className="text-[#00f3ff] font-orbitron font-bold text-lg">4 SATELLITES</span>
                      <span className="text-[10px] text-gray-400 block mt-1">Liaison 0.3m optique active</span>
                    </div>
                    <div className="p-3 bg-[#0c1222] border border-[#00ff4133] rounded-lg">
                      <span className="text-gray-400 text-[10px] block font-mono">SENTINEL-1 SAR</span>
                      <span className="text-[#00ff41] font-orbitron font-bold text-lg">RADAR 24/7</span>
                      <span className="text-[10px] text-gray-400 block mt-1">Pénétration nuages 100%</span>
                    </div>
                    <div className="p-3 bg-[#0c1222] border border-[#f59e0b33] rounded-lg">
                      <span className="text-gray-400 text-[10px] block font-mono">CHOKEPOINTS MARITIMES</span>
                      <span className="text-[#f59e0b] font-orbitron font-bold text-lg">8 DÉTROITS</span>
                      <span className="text-[10px] text-gray-400 block mt-1">Surveillance Saint-Laurent</span>
                    </div>
                    <div className="p-3 bg-[#0c1222] border border-[#ff00ff33] rounded-lg">
                      <span className="text-gray-400 text-[10px] block font-mono">OUTILS MCP DISPONIBLES</span>
                      <span className="text-[#ff00ff] font-orbitron font-bold text-lg">59 / 59</span>
                      <span className="text-[10px] text-gray-400 block mt-1">Prêts pour interrogation</span>
                    </div>
                  </div>

                  {/* Live 3D Planetary Globe & Multi-Tool Interface for World Monitor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#00f3ff]" />
                        <span>VUE PLANÉTAIRE 3D INTERACTIVE & CONSTELLATION SATELLITAIRE</span>
                      </span>
                      <span className="text-[#00ff41] text-[10px] font-bold">● LIAISON GLOBALE 0.3M VERROUILLÉE</span>
                    </div>
                    <div className="h-80 sm:h-96 w-full rounded-lg border border-[#00f3ff44] overflow-hidden relative shadow-2xl">
                      <PlanetaryGlobe3D
                        activeToolId="world_monitor"
                        onSelectLocation={(loc) => {
                          onHackPin(loc.id, loc.name);
                        }}
                        className="w-full h-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        sound.playVictory();
                        onTriggerOrbitalScan();
                        addLog('WORLD MONITOR // Scan orbital SkyFi exécuté.');
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-[#00f3ff] to-[#00bfff] text-black font-orbitron font-black text-xs uppercase rounded-lg shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:brightness-110 cursor-pointer flex items-center justify-center gap-2 transition-all"
                    >
                      <Radio className="w-4 h-4" />
                      <span>DÉCLENCHER LE SCAN ORBITAL SKYFI IMMÉDIATEMENT</span>
                    </button>
                    <button
                      onClick={() => {
                        sound.playLoot();
                        addLog('WORLD MONITOR // Télémétrie des 59 outils MCP actualisée.');
                      }}
                      className="px-6 py-3 bg-[#111827] hover:bg-[#1f2937] border border-[#00f3ff44] text-[#00f3ff] font-orbitron font-bold text-xs uppercase rounded-lg cursor-pointer transition-all flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>ACTUALISER TÉLÉMÉTRIE</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. SHADOWBROKER VIEW */}
              {serviceId === 'shadowbroker' && (
                <div className="space-y-4">
                  <div className="p-3 sm:p-4 bg-[#0c1222] border border-[#f59e0b44] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-orbitron font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                        <Satellite className="w-4 h-4 text-[#f59e0b] shrink-0 animate-pulse" />
                        <span className="truncate">RECONNAISSANCE GÉOSPATIALE OSINT (MONTRÉAL 2033)</span>
                      </h3>
                      <p className="text-[11px] sm:text-xs font-mono text-gray-400 mt-1">
                        Infiltrez les balises et déployez le drone de reconnaissance pour révéler les faiblesses de Viktor Vance.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        sound.playVictory();
                        onTriggerShadowBrokerDrone();
                        addLog('SHADOWBROKER // Drone déployé avec succès.');
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black font-orbitron font-bold text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer flex items-center justify-center gap-2 transition-all shrink-0"
                    >
                      <Satellite className="w-4 h-4" />
                      <span>DÉPLOYER LE DRONE OSINT</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 font-mono text-xs">
                    {tacticalState.shadowBroker.osintPins.map(pin => {
                      const isHacked = hackedPins.includes(pin.id);
                      return (
                        <div
                          key={pin.id}
                          className={`p-2.5 sm:p-3.5 rounded-lg border flex items-center justify-between transition-all gap-2 ${
                            isHacked 
                              ? 'bg-[#00ff4110] border-[#00ff4155]' 
                              : 'bg-[#080d1a] border-white/10 hover:border-[#f59e0b]'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-white flex items-center gap-2 truncate">
                              <Crosshair className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                              <span className="truncate">{pin.label}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5 truncate">{pin.description}</div>
                          </div>

                          <button
                            onClick={() => onHackPin(pin.id, pin.label)}
                            className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded cursor-pointer transition-all shrink-0 font-orbitron ${
                              isHacked 
                                ? 'bg-[#00ff41] text-black shadow-[0_0_8px_rgba(0,255,65,0.4)]' 
                                : 'bg-[#f59e0b22] border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b44]'
                            }`}
                          >
                            {isHacked ? '✓ INFILTRÉ' : 'INFILTRER'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Live OSINT Planetary Globe */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#f59e0b] font-bold flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>CARTE PLANÉTAIRE OSINT & NŒUDS C2 SHADOWBROKER</span>
                      </span>
                      <span className="text-gray-400 text-[10px]">Liaison OpenClaw active</span>
                    </div>
                    <div className="h-80 sm:h-96 w-full rounded-lg border border-[#f59e0b44] overflow-hidden relative shadow-2xl">
                      <PlanetaryGlobe3D
                        activeToolId="shadowbroker"
                        onSelectLocation={(loc) => onHackPin(loc.id, loc.name)}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. STM REALTIME TRANSIT VIEW */}
              {serviceId === 'stm_transit' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0c1222] border border-[#38bdf844] rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-orbitron font-bold text-white text-sm flex items-center gap-2">
                          <Train className="w-4 h-4 text-[#38bdf8]" />
                          <span>TÉLÉMÉTRIE GTFS-REALTIME EN DIRECT (STM MONTRÉAL)</span>
                        </h3>
                        <p className="text-xs font-mono text-gray-400 mt-1">
                          Entrez un numéro de ligne de bus pour obtenir le positionnement GPS exact et le statut d'avance/retard.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-mono bg-[#38bdf822] text-[#38bdf8] border border-[#38bdf855] rounded">
                        API KEY VALIDÉE
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={stmSearchRoute}
                        onChange={(e) => setStmSearchRoute(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') onSearchSTM(); }}
                        placeholder="N° de ligne (ex: 136, 24, 106, 139, 45)..."
                        className="flex-1 bg-[#070a14] border border-[#38bdf855] rounded-lg px-4 py-2.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#38bdf8]"
                      />
                      <button
                        onClick={() => onSearchSTM()}
                        disabled={isStmLoading}
                        className="px-6 py-2.5 bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-black font-orbitron font-bold text-xs uppercase rounded-lg cursor-pointer transition-all flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        <span>{isStmLoading ? 'RECHERCHE...' : 'RECHERCHER'}</span>
                      </button>
                    </div>
                  </div>

                  {stmLiveReport && (
                    <div className="p-4 bg-[#090e1c] border border-[#38bdf855] rounded-lg space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="font-orbitron font-bold text-white text-sm">
                          LIGNE {stmLiveReport.route} • {stmLiveReport.activeCount} BUS ACTIFS EN SERVICE
                        </span>
                        <span className="text-[#38bdf8] font-bold">
                          {Math.round(stmLiveReport.avgDelaySec / 60) >= 0 ? `+${Math.round(stmLiveReport.avgDelaySec / 60)} min retard` : `${Math.round(stmLiveReport.avgDelaySec / 60)} min avance`}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {stmLiveReport.vehicles.slice(0, 6).map(v => (
                          <div key={v.id} className="p-2.5 bg-[#050811] border border-white/10 rounded">
                            <div className="text-white font-bold flex items-center justify-between">
                              <span>Bus #{v.label}</span>
                              <span className="text-[#00ff41]">{v.speedKmH} km/h</span>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1">
                              GPS: {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}
                            </div>
                            <div className="text-[10px] text-[#38bdf8] mt-0.5">
                              Retard: {Math.round(v.delaySeconds / 60)} min
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Tactical Leaflet Map for STM Transit */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#38bdf8] font-bold flex items-center gap-1.5">
                        <Train className="w-3.5 h-3.5" />
                        <span>POSITION GÉOSPATIALE DES VÉHICULES STM</span>
                      </span>
                      <span className="text-[#00ff41] text-[10px]">● GTFS-RT SYNCHRONISÉ</span>
                    </div>
                    <div className="h-64 w-full rounded-lg border border-[#38bdf844] overflow-hidden relative shadow-xl">
                      <MontrealTacticalMap
                        hackedPins={hackedPins}
                        stmLiveReport={stmLiveReport}
                        godEyeActive={godEyeActive}
                        onSelectPOI={(pin) => onHackPin(pin.id, pin.name)}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playVictory();
                      onTriggerSophiaSTMOverload();
                      addLog('STM TRANSIT // Surcharge tactique du métro exécutée.');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-black font-orbitron font-black text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(56,189,248,0.4)] cursor-pointer flex items-center justify-center gap-2 transition-all hover:brightness-110"
                  >
                    <Train className="w-4 h-4" />
                    <span>DÉCLENCHER LA SURCHARGE TACTIQUE DU RÉSEAU MÉTRO STM</span>
                  </button>
                </div>
              )}

              {/* 4. GOD EYE VIEW 3D MATRIX */}
              {serviceId === 'god_eye_view' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0c1222] border border-[#00ff4144] rounded-lg flex items-center justify-between">
                    <div>
                      <h3 className="font-orbitron font-bold text-white text-sm flex items-center gap-2">
                        <Eye className="w-4 h-4 text-[#00ff41]" />
                        <span>MATRICE 3D OMNISCIENTE & 384 CAMÉRAS URBAINES</span>
                      </h3>
                      <p className="text-xs font-mono text-gray-400 mt-1">
                        Surveillance biométrique haute résolution sur le secteur Ville-Marie et les galeries du RÉSO.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        sound.playLevelUp();
                        onToggleGodEye();
                      }}
                      className={`px-4 py-2 text-xs font-orbitron font-bold uppercase rounded-lg cursor-pointer transition-all ${
                        godEyeActive 
                          ? 'bg-[#00ff41] text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]' 
                          : 'bg-[#111827] border border-[#00ff4155] text-[#00ff41]'
                      }`}
                    >
                      {godEyeActive ? '👁️ DÉSACTIVER GOD EYE' : '👁️ ACTIVER GOD EYE'}
                    </button>
                  </div>

                  {/* 3D Planetary Globe with God Eye Overlay */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#00ff41] font-bold flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>FLUX MATRICE GLOBALE 3D & BALAYAGE ORBITAL LASER</span>
                      </span>
                      <span className="text-[#00ff41] text-[10px] animate-pulse">● COUVERTURE 360° ACTIVE</span>
                    </div>
                    <div className="h-80 sm:h-96 w-full rounded-lg border border-[#00ff4155] overflow-hidden relative shadow-2xl">
                      <PlanetaryGlobe3D
                        activeToolId="god_eye_view"
                        onSelectLocation={(loc) => onHackPin(loc.id, loc.name)}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. DEUS EX SOPHIA AI VIEW */}
              {serviceId === 'deus_ex_sophia_ai' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#0c1222] border border-[#ff00ff44] rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-orbitron font-bold text-white text-sm flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[#ff00ff]" />
                          <span>PIPELINE IA DEUS EX SOPHIA & PROPAGANDE DEEPFAKE</span>
                        </h3>
                        <p className="text-xs font-mono text-gray-400 mt-1">
                          Propulsée par Gemini 3.7 Flash Cloud & Ollama Flash Attention local (0.2).
                        </p>
                      </div>
                      <span className="text-[#ff00ff] font-orbitron font-bold text-base">
                        {deepfakePercent}% DIFFUSÉ
                      </span>
                    </div>

                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-[#ff00ff44]">
                      <div 
                        className="h-full bg-gradient-to-r from-[#ff00ff] to-[#00f3ff] rounded-full transition-all duration-500" 
                        style={{ width: `${deepfakePercent}%` }}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          onBoostDeepfake();
                          addLog('DEEPFAKE // Diffusion de l’audio de Viktor Vance amplifiée.');
                        }}
                        className="flex-1 py-3 bg-[#ff00ff] hover:bg-[#ff00ff]/90 text-black font-orbitron font-bold text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(255,0,255,0.4)] cursor-pointer flex items-center justify-center gap-2 transition-all"
                      >
                        <Flame className="w-4 h-4" />
                        <span>AMPLIFIER LA DIFFUSION DU DEEPFAKE DE VANCE (+5%)</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onSendSophiaMessage('Sophia, effectue un diagnostic complet des systèmes de Montréal 2033.');
                        }}
                        className="px-6 py-3 bg-[#111827] hover:bg-[#1f2937] border border-white/20 text-white font-orbitron font-bold text-xs uppercase rounded-lg cursor-pointer transition-all flex items-center gap-2"
                      >
                        <Cpu className="w-4 h-4" />
                        <span>OUVRIR LE CHAT QUANTIQUE</span>
                      </button>
                    </div>
                  </div>

                  {/* OpenOSINT Autonomous Reconnaissance Scanner for Sophia */}
                  <div className="p-4 bg-[#0a1124] border border-[#00f3ff55] rounded-lg space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-[#00f3ff22] text-[#00f3ff] rounded border border-[#00f3ff55]">
                          <Search className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-orbitron font-bold text-white text-xs">
                            AGENT OPENOSINT // RECONNAISSANCE MULTI-VECTEURS AUTONOME
                          </h4>
                          <span className="text-[10px] font-mono text-gray-400">
                            19 Outils connectés • Micro-Cache TTL (0ms sur cibles connues / 0 token LLM gaspillé)
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#00ff4122] text-[#00ff41] border border-[#00ff41] rounded">
                        ● AGENT COUPLÉ ACTIF
                      </span>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-gray-400">CIBLES RAPIDES :</span>
                      <button
                        onClick={() => {
                          setOsintTargetInput('+14382660386');
                          setOsintType('phone');
                          handleRunOsintRecon('+14382660386', 'phone');
                        }}
                        className="px-2 py-0.5 text-[10px] font-mono bg-[#111e38] hover:bg-[#1b2f56] text-[#00ff41] rounded border border-[#00ff4133] cursor-pointer"
                      >
                        📞 Tél. Montréal (+1 438 266 0386)
                      </button>
                      <button
                        onClick={() => {
                          setOsintTargetInput('vance-dynamics.mtl');
                          setOsintType('domain');
                          handleRunOsintRecon('vance-dynamics.mtl', 'domain');
                        }}
                        className="px-2 py-0.5 text-[10px] font-mono bg-[#111e38] hover:bg-[#1b2f56] text-[#00f3ff] rounded border border-[#00f3ff33] cursor-pointer"
                      >
                        🎯 Viktor Vance (vance-dynamics.mtl)
                      </button>
                      <button
                        onClick={() => {
                          setOsintTargetInput('oracle33');
                          setOsintType('username');
                          handleRunOsintRecon('oracle33', 'username');
                        }}
                        className="px-2 py-0.5 text-[10px] font-mono bg-[#111e38] hover:bg-[#1b2f56] text-[#ff00ff] rounded border border-[#ff00ff33] cursor-pointer"
                      >
                        👤 Thirty3 (oracle33)
                      </button>
                      <button
                        onClick={() => {
                          setOsintTargetInput('198.51.100.45');
                          setOsintType('ip');
                          handleRunOsintRecon('198.51.100.45', 'ip');
                        }}
                        className="px-2 py-0.5 text-[10px] font-mono bg-[#111e38] hover:bg-[#1b2f56] text-amber-400 rounded border border-amber-500/30 cursor-pointer"
                      >
                        🌐 SPVM Enforcers (198.51.100.45)
                      </button>
                    </div>

                    {/* Target Input and Run Button */}
                    <div className="flex gap-2">
                      <select
                        value={osintType}
                        onChange={(e) => setOsintType(e.target.value as any)}
                        className="bg-[#060a14] border border-[#00f3ff55] rounded px-3 py-2 text-xs font-mono text-[#00f3ff] focus:outline-none"
                      >
                        <option value="phone">TÉLÉPHONE</option>
                        <option value="domain">DOMAINE</option>
                        <option value="ip">ADRESSE IP</option>
                        <option value="username">PSEUDONYME</option>
                        <option value="email">EMAIL</option>
                      </select>

                      <input
                        type="text"
                        value={osintTargetInput}
                        onChange={(e) => setOsintTargetInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRunOsintRecon(); }}
                        placeholder="Entrez un téléphone (+1 438...), IP, domaine, alias ou email..."
                        className="flex-1 bg-[#060a14] border border-[#00f3ff55] rounded px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#00f3ff]"
                      />

                      <button
                        onClick={() => handleRunOsintRecon()}
                        disabled={isOsintScanning}
                        className="px-5 py-2 bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black font-orbitron font-bold text-xs uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,243,255,0.3)] shrink-0"
                      >
                        {isOsintScanning ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>SCAN EN COURS...</span>
                          </>
                        ) : (
                          <>
                            <Crosshair className="w-3.5 h-3.5" />
                            <span>LANCER RECON</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Scan Results Display */}
                    {osintResult && (
                      <div className="p-3 bg-[#060a16] border border-[#00f3ff44] rounded space-y-2.5 font-mono text-xs animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">CIBLE : {osintResult.target}</span>
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                              osintResult.riskLevel === 'OMEGA' || osintResult.riskLevel === 'HIGH' || osintResult.riskLevel === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-400 border border-red-500'
                                : 'bg-[#00ff4122] text-[#00ff41] border border-[#00ff41]'
                            }`}>
                              NIVEAU MENACE : {osintResult.riskLevel}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {osintResult.cached ? '⚡ RÉPONSE CACHE (0ms)' : `⏱️ ${osintResult.durationMs}ms`}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-300">{osintResult.summary}</p>

                        {/* Findings list */}
                        {osintResult.findings.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] text-[#00f3ff] font-bold block">VECTEURS DÉTECTÉS :</span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {osintResult.findings.map((f, idx) => (
                                <div key={idx} className="p-1.5 bg-[#0a1226] border border-white/10 rounded text-[10px]">
                                  <span className="text-gray-400 block">{f.label} :</span>
                                  <span className="text-white font-bold">{f.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dorks */}
                        {osintResult.dorks && osintResult.dorks.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] text-amber-400 font-bold block">GOOGLE DORKS GÉNÉRÉS :</span>
                            <div className="bg-[#03060c] p-2 rounded border border-amber-500/20 text-[10px] space-y-1 text-gray-300">
                              {osintResult.dorks.slice(0, 3).map((d, idx) => (
                                <div key={idx} className="truncate">
                                  <span className="text-[#00f3ff] font-bold mr-1.5">[{idx + 1}]</span>
                                  {d}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-orbitron font-bold text-[#00f3ff] uppercase tracking-wider">
                  CATALOGUE DES 59 OUTILS MCP & ENDPOINTS CLOUD
                </span>
                <span className="text-xs font-mono text-gray-400">
                  Tous les outils répondent avec une latence &lt; 50ms
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {MCP_SAMPLE_TOOLS.map(t => (
                  <div key={t.id} className="p-3 bg-[#0c1222] border border-white/10 rounded-lg flex items-center justify-between font-mono text-xs">
                    <div>
                      <div className="text-white font-bold">{t.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Catégorie: {t.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] px-2 py-0.5 bg-[#00ff4115] text-[#00ff41] border border-[#00ff4155] rounded font-bold">
                        {t.status}
                      </span>
                      <button
                        onClick={() => {
                          sound.playLoot();
                          addLog(`MCP CALL // ${t.name} exécuté en ${t.latency}.`);
                        }}
                        className="px-2.5 py-1 text-[10px] bg-[#00f3ff15] hover:bg-[#00f3ff33] text-[#00f3ff] border border-[#00f3ff55] rounded cursor-pointer transition-all"
                      >
                        Tester
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="p-4 bg-[#050811] border border-white/10 rounded-lg font-mono text-xs space-y-2 text-gray-300">
              <div className="text-xs font-orbitron font-bold text-[#00f3ff] border-b border-white/10 pb-2 mb-3">
                JOURNAL DE SYNCHRONISATION CLOUD & ÉTAT DU SERVICE {meta.title}
              </div>
              <div>[INFO] Port {meta.port} opérationnel avec reverse proxy nginx.</div>
              <div>[INFO] Intégration Cloud SQL et Gemini 3.7 Flash verrouillée.</div>
              <div>[INFO] Mode Flash Attention actif avec température 0.2 pour économie d'énergie maximale.</div>
              <div>[INFO] Télémétrie STM GTFS-Realtime connectée avec 142 bus actifs.</div>
              <div>[SUCCESS] Toutes les requêtes HTTP/2 sont validées et prêtes pour exécution instantanée.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
