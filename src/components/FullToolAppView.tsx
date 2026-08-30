import React, { useState, useEffect } from 'react';
import { 
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
  Search, 
  ExternalLink, 
  ArrowLeft, 
  Layers, 
  Maximize2, 
  Sparkles,
  MapPin,
  Terminal,
  Volume2,
  Award
} from 'lucide-react';
import { STMBusStatusReport } from '../services/stmService';
import { TacticalBridgeState } from '../utils/cyberToolsBridge';
import { sound } from '../utils/audio';
import { MontrealTacticalMap } from './MontrealTacticalMap';
import { MaxIntelOSINTAcademy } from './MaxIntelOSINTAcademy';

export type ToolAppId = 'world_monitor' | 'shadowbroker' | 'stm_transit' | 'god_eye_view' | 'deus_ex_sophia_ai' | 'map_montreal' | 'maxintel_academy';

interface FullToolAppViewProps {
  initialToolId?: ToolAppId;
  onBackToHub: () => void;
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
  onAwardBtcSats?: (sats: number) => void;
  onAwardXp?: (xp: number) => void;
}

export const FullToolAppView: React.FC<FullToolAppViewProps> = ({
  initialToolId = 'world_monitor',
  onBackToHub,
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
  addLog,
  onAwardBtcSats,
  onAwardXp
}) => {
  const [activeTool, setActiveTool] = useState<ToolAppId>(initialToolId);
  const [sophiaInput, setSophiaInput] = useState<string>('');
  const [chatLog, setChatLog] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'SOPHIA_AI',
      text: '« Systèmes autonomes de Montréal 2033 initialisés. Tous les flux géospatiaux, SIG et télémétriques sont connectés. »',
      time: new Date().toLocaleTimeString()
    }
  ]);

  // Sync with URL Hash
  useEffect(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash && ['world-monitor', 'shadowbroker', 'stm', 'god-eye', 'sophia', 'map', 'maxintel'].includes(hash)) {
      if (hash === 'world-monitor') setActiveTool('world_monitor');
      else if (hash === 'shadowbroker') setActiveTool('shadowbroker');
      else if (hash === 'stm') setActiveTool('stm_transit');
      else if (hash === 'god-eye') setActiveTool('god_eye_view');
      else if (hash === 'sophia') setActiveTool('deus_ex_sophia_ai');
      else if (hash === 'map') setActiveTool('map_montreal');
      else if (hash === 'maxintel') setActiveTool('maxintel_academy');
    }
  }, []);

  const handleSelectTool = (id: ToolAppId) => {
    sound.playLoot();
    setActiveTool(id);
    const hashName = id === 'world_monitor' ? 'world-monitor' :
                     id === 'shadowbroker' ? 'shadowbroker' :
                     id === 'stm_transit' ? 'stm' :
                     id === 'god_eye_view' ? 'god-eye' :
                     id === 'deus_ex_sophia_ai' ? 'sophia' :
                     id === 'maxintel_academy' ? 'maxintel' : 'map';
    window.location.hash = `#/${hashName}`;
    addLog(`APPLICATION PLEINE PAGE // ${id.toUpperCase()} chargée.`);
  };

  const handleOpenNewTab = () => {
    sound.playVictory();
    const hashName = activeTool === 'world_monitor' ? 'world-monitor' :
                     activeTool === 'shadowbroker' ? 'shadowbroker' :
                     activeTool === 'stm_transit' ? 'stm' :
                     activeTool === 'god_eye_view' ? 'god-eye' :
                     activeTool === 'deus_ex_sophia_ai' ? 'sophia' :
                     activeTool === 'maxintel_academy' ? 'maxintel' : 'map';
    const fullUrl = `${window.location.origin}${window.location.pathname}#/${hashName}`;
    window.open(fullUrl, '_blank');
  };

  const handleSendSophiaPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sophiaInput.trim()) return;
    const text = sophiaInput.trim();
    setSophiaInput('');
    sound.playLoot();
    setChatLog(prev => [...prev, { sender: 'OPERATEUR', text, time: new Date().toLocaleTimeString() }]);
    onSendSophiaMessage(text);
    setTimeout(() => {
      setChatLog(prev => [...prev, { 
        sender: 'SOPHIA_AI', 
        text: `« Directive reçue : "${text}". Analyse quantique complétée sur la grille de Montréal. »`, 
        time: new Date().toLocaleTimeString() 
      }]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#050811] text-white flex flex-col overflow-hidden font-mono select-none">
      
      {/* Top Application Header Bar */}
      <header className="px-4 py-2.5 bg-[#090e1a] border-b border-[#00f3ff33] flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg z-30">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playLoot();
              window.location.hash = '#/hub';
              onBackToHub();
            }}
            className="px-3 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-white/20 text-white rounded-lg font-orbitron font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:border-[#00f3ff]"
            title="Retour au Command Center Hub"
          >
            <ArrowLeft className="w-4 h-4 text-[#00f3ff]" />
            <span>COMMAND CENTER</span>
          </button>

          <div className="h-5 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-orbitron font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ff41] uppercase tracking-wider">
              {activeTool === 'world_monitor' ? '🌐 WORLD MONITOR MCP & SKYFI' :
               activeTool === 'shadowbroker' ? '🛰️ SHADOWBROKER OSINT' :
               activeTool === 'stm_transit' ? '🚇 STM REALTIME TRANSIT' :
               activeTool === 'god_eye_view' ? '👁️ GOD EYE VIEW 3D MATRIX' :
               activeTool === 'deus_ex_sophia_ai' ? '🧠 DEUS EX SOPHIA QUANTUM AI' :
               activeTool === 'maxintel_academy' ? '🕵️ MAXINTEL OSINT ACADEMY (MAXINTEL.ORG)' : '🗺️ CARTE TACTIQUE MONTRÉAL'}
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono bg-[#00ff4115] border border-[#00ff4155] text-[#00ff41] font-bold rounded">
              STANDALONE APP • 100% FONCTIONNEL
            </span>
          </div>
        </div>

        {/* Center: Tools Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#050811] p-1 rounded-lg border border-white/10 overflow-x-auto">
          <button
            onClick={() => handleSelectTool('maxintel_academy')}
            className={`px-3 py-1.5 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTool === 'maxintel_academy'
                ? 'bg-gradient-to-r from-[#00ff41] to-[#00f3ff] text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]'
                : 'text-[#00ff41] hover:text-white hover:bg-white/5 border border-[#00ff4133]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>MaxIntel OSINT</span>
          </button>

          <button
            onClick={() => handleSelectTool('world_monitor')}
            className={`px-3 py-1.5 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTool === 'world_monitor'
                ? 'bg-[#00f3ff] text-black shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>World Monitor</span>
          </button>

          <button
            onClick={() => handleSelectTool('shadowbroker')}
            className={`px-3 py-1.5 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTool === 'shadowbroker'
                ? 'bg-[#f59e0b] text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>ShadowBroker</span>
          </button>

          <button
            onClick={() => handleSelectTool('stm_transit')}
            className={`px-3 py-1.5 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTool === 'stm_transit'
                ? 'bg-[#38bdf8] text-black shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>STM Realtime</span>
          </button>

          <button
            onClick={() => handleSelectTool('god_eye_view')}
            className={`px-3 py-1.5 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTool === 'god_eye_view'
                ? 'bg-[#00ff41] text-black shadow-[0_0_12px_rgba(0,255,65,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>God Eye 3D</span>
          </button>

          <button
            onClick={() => handleSelectTool('deus_ex_sophia_ai')}
            className={`px-3 py-1.5 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTool === 'deus_ex_sophia_ai'
                ? 'bg-[#ff00ff] text-black shadow-[0_0_12px_rgba(255,0,255,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Sophia AI</span>
          </button>

          <button
            onClick={() => handleSelectTool('map_montreal')}
            className={`px-3 py-1.5 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTool === 'map_montreal'
                ? 'bg-[#a855f7] text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Carte Complète</span>
          </button>
        </div>

        {/* Right Actions: Open in new Tab & Launch Game */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNewTab}
            className="px-3 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-[#00f3ff55] text-[#00f3ff] rounded-lg text-xs font-orbitron font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            title="Ouvrir cette page exacte dans un nouvel onglet de navigateur"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">NOUVEL ONGLET</span>
          </button>

          <button
            onClick={() => {
              sound.playVictory();
              onLaunchGame();
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-[#00f3ff] to-[#00ff41] text-black font-orbitron font-black text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.4)] cursor-pointer hover:brightness-110 flex items-center gap-1.5 transition-all"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>JOUER AU JEU ARPG</span>
          </button>
        </div>
      </header>

      {/* Main Application Body Grid */}
      {activeTool === 'maxintel_academy' ? (
        <main className="flex-1 overflow-hidden relative">
          <MaxIntelOSINTAcademy
            onAwardBtcSats={onAwardBtcSats}
            onAwardXp={onAwardXp}
            onLaunchGame={onLaunchGame}
            isStandalone={true}
          />
        </main>
      ) : (
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* Left / Center Area: Full Interactive Montreal Tactical Map */}
          <section className="flex-1 h-[50vh] lg:h-full p-3 flex flex-col">
            <MontrealTacticalMap
              stmLiveReport={stmLiveReport}
              hackedPins={hackedPins}
              onHackPin={onHackPin}
              godEyeActive={godEyeActive}
              onTriggerOrbitalScan={onTriggerOrbitalScan}
              activeServiceId={activeTool}
              className="flex-1 w-full h-full"
            />
          </section>

          {/* Right Sidebar: Dedicated Interactive Control Suite for Active Tool */}
          <aside className="w-full lg:w-[460px] h-[50vh] lg:h-full bg-[#070a14] border-t lg:border-t-0 lg:border-l border-[#00f3ff33] flex flex-col overflow-y-auto p-4 space-y-4 shrink-0 shadow-2xl">
            
            {/* 1. WORLD MONITOR CONTROLS */}
            {activeTool === 'world_monitor' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#0c1222] border border-[#00f3ff44] rounded-lg">
                <h3 className="font-orbitron font-bold text-sm text-[#00f3ff] flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>59 OUTILS MCP & TÉLÉMÉTRIE SKYFI</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Surveillance mondiale géostratégique et imagerie satellite optique 0.3m.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    sound.playVictory();
                    onTriggerOrbitalScan();
                    addLog('WORLD MONITOR // Balayage complet des 59 outils MCP exécuté.');
                  }}
                  className="p-3 bg-[#00f3ff22] hover:bg-[#00f3ff33] border border-[#00f3ff] text-[#00f3ff] font-bold rounded-lg cursor-pointer transition-all flex flex-col items-center text-center gap-1.5"
                >
                  <Radio className="w-5 h-5 text-[#00f3ff]" />
                  <span>Scan Orbital SkyFi (0.3m)</span>
                </button>

                <button
                  onClick={() => {
                    sound.playLoot();
                    addLog('WORLD MONITOR // Sentinel-1 Radar SAR pénétrant les nuages activé.');
                  }}
                  className="p-3 bg-[#00ff4115] hover:bg-[#00ff4133] border border-[#00ff41] text-[#00ff41] font-bold rounded-lg cursor-pointer transition-all flex flex-col items-center text-center gap-1.5"
                >
                  <Activity className="w-5 h-5 text-[#00ff41]" />
                  <span>Radar SAR Sentinel-1</span>
                </button>
              </div>

              <div className="p-3 bg-[#090e1c] border border-white/10 rounded-lg space-y-2 text-xs">
                <span className="text-gray-400 font-bold uppercase block text-[10px]">
                  CHOKEPOINTS MARITIMES STRATÉGIQUES
                </span>
                <div className="flex justify-between items-center text-gray-300">
                  <span>Voie Maritime St-Laurent (Montréal)</span>
                  <span className="text-[#00ff41] font-bold">FLUX NORMAL</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>Détroit d'Ormuz</span>
                  <span className="text-[#f59e0b] font-bold">VIGILANCE</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span>Canal de Suez / Bab-el-Mandeb</span>
                  <span className="text-[#ff0055] font-bold">ALERTE CONFLIT</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. SHADOWBROKER OSINT CONTROLS */}
          {activeTool === 'shadowbroker' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#0c1222] border border-[#f59e0b44] rounded-lg">
                <h3 className="font-orbitron font-bold text-sm text-[#f59e0b] flex items-center gap-2">
                  <Satellite className="w-4 h-4" />
                  <span>RECONNAISSANCE OSINT & BALISES</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Infiltrez les balises et déployez le drone de reconnaissance sur Montréal.
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playVictory();
                  onTriggerShadowBrokerDrone();
                  addLog('SHADOWBROKER // Drone furtif déployé au-dessus de Ville-Marie.');
                }}
                className="w-full py-3 bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black font-orbitron font-bold text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <Satellite className="w-4 h-4" />
                <span>DÉPLOYER LE DRONE OSINT</span>
              </button>

              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase">
                  BALISES TACTIQUES MONTRÉALAISES ({hackedPins.length}/6 INFILTRÉES)
                </span>
                {tacticalState.shadowBroker.osintPins.map(pin => {
                  const isHacked = hackedPins.includes(pin.id);
                  return (
                    <div
                      key={pin.id}
                      className={`p-2.5 rounded border flex items-center justify-between text-xs transition-all ${
                        isHacked ? 'bg-[#00ff4110] border-[#00ff4155]' : 'bg-[#050811] border-white/10'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Crosshair className="w-3.5 h-3.5 text-[#f59e0b]" />
                          <span>{pin.label}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">{pin.description}</div>
                      </div>
                      <button
                        onClick={() => onHackPin(pin.id, pin.label)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                          isHacked ? 'bg-[#00ff41] text-black font-orbitron' : 'bg-[#f59e0b22] border border-[#f59e0b] text-[#f59e0b]'
                        }`}
                      >
                        {isHacked ? '✓ FAIT' : 'HACK'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. STM REALTIME TRANSIT CONTROLS */}
          {activeTool === 'stm_transit' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#0c1222] border border-[#38bdf844] rounded-lg">
                <h3 className="font-orbitron font-bold text-sm text-[#38bdf8] flex items-center gap-2">
                  <Train className="w-4 h-4" />
                  <span>TÉLÉMÉTRIE GTFS-REALTIME STM</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Positionnement en direct des bus et état des lignes de métro montréalaises.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={stmSearchRoute}
                  onChange={(e) => setStmSearchRoute(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSearchSTM(); }}
                  placeholder="Ligne de bus (ex: 136, 24, 106)..."
                  className="flex-1 bg-[#050811] border border-[#38bdf855] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#38bdf8]"
                />
                <button
                  onClick={() => onSearchSTM()}
                  disabled={isStmLoading}
                  className="px-4 py-2 bg-[#38bdf8] text-black font-orbitron font-bold text-xs uppercase rounded-lg cursor-pointer"
                >
                  {isStmLoading ? '...' : 'Filtrer'}
                </button>
              </div>

              {stmLiveReport && (
                <div className="p-3 bg-[#090e1c] border border-[#38bdf855] rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-white border-b border-white/10 pb-1">
                    <span>LIGNE {stmLiveReport.route}</span>
                    <span className="text-[#38bdf8]">{stmLiveReport.busCount} BUS ACTIFS</span>
                  </div>
                  <div className="text-[11px] text-gray-300">
                    Retard moyen : <span className="text-[#00ff41] font-bold">{stmLiveReport.averageDelayMinutes} min</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  sound.playVictory();
                  onTriggerSophiaSTMOverload();
                  addLog('STM TRANSIT // Surcharge tactique du métro exécutée.');
                }}
                className="w-full py-3 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-black font-orbitron font-black text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(56,189,248,0.4)] cursor-pointer flex items-center justify-center gap-2"
              >
                <Train className="w-4 h-4" />
                <span>SURCHARGE TACTIQUE DU RÉSEAU MÉTRO STM</span>
              </button>
            </div>
          )}

          {/* 4. GOD EYE VIEW CONTROLS */}
          {activeTool === 'god_eye_view' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#0c1222] border border-[#00ff4144] rounded-lg">
                <h3 className="font-orbitron font-bold text-sm text-[#00ff41] flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>MATRICE 3D & 384 CAMÉRAS URBAINES</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Surveillance biométrique du centre-ville et des galeries souterraines du RÉSO.
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playLevelUp();
                  onToggleGodEye();
                }}
                className={`w-full py-3 font-orbitron font-bold text-xs uppercase rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 ${
                  godEyeActive ? 'bg-[#00ff41] text-black shadow-[0_0_15px_rgba(0,255,65,0.4)]' : 'bg-[#111827] border border-[#00ff4155] text-[#00ff41]'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{godEyeActive ? 'DÉSACTIVER GOD EYE' : 'ACTIVER MATRICE GOD EYE'}</span>
              </button>

              <div className="p-3 bg-[#050811] border border-white/10 rounded-lg space-y-2 text-xs">
                <span className="text-gray-400 font-bold uppercase block text-[10px]">STATUT DU RÉSEAU BIOMÉTRIQUE</span>
                <div className="flex justify-between">
                  <span>Reconnaissance Faciale</span>
                  <span className="text-[#00ff41] font-bold">100% OPÉRATIONNEL</span>
                </div>
                <div className="flex justify-between">
                  <span>Galeries RÉSO Surveillées</span>
                  <span className="text-[#00f3ff] font-bold">33 / 33 KM</span>
                </div>
                <div className="flex justify-between">
                  <span>Penthouse Vance</span>
                  <span className="text-[#ff0055] font-bold">VERROUILLÉ 4K</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. DEUS EX SOPHIA AI CONTROLS */}
          {activeTool === 'deus_ex_sophia_ai' && (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="p-3 bg-[#0c1222] border border-[#ff00ff44] rounded-lg">
                <h3 className="font-orbitron font-bold text-sm text-[#ff00ff] flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>CERVEAU QUANTIQUE DEUS EX SOPHIA</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Inférence Gemini 3.7 Flash & Ollama Flash Attention local (0.2).
                </p>
              </div>

              <div className="p-3 bg-[#0c1222] border border-[#ff00ff44] rounded-lg space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">PROPAGANDE DEEPFAKE VANCE</span>
                  <span className="text-[#ff00ff] font-bold">{deepfakePercent}% DIFFUSÉ</span>
                </div>
                <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#ff00ff] to-[#00f3ff]" style={{ width: `${deepfakePercent}%` }} />
                </div>
                <button
                  onClick={() => {
                    onBoostDeepfake();
                    addLog('DEEPFAKE // Audio compromettant de Vance diffusé.');
                  }}
                  className="w-full py-2 bg-[#ff00ff] hover:bg-[#ff00ff]/90 text-black font-orbitron font-bold text-xs uppercase rounded cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Diffuser l'Audio de Vance (+5%)</span>
                </button>
              </div>

              {/* Interactive AI Chat Console */}
              <div className="flex-1 min-h-[160px] bg-[#050811] border border-white/10 rounded-lg p-3 overflow-y-auto space-y-2 text-xs">
                {chatLog.map((m, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="text-[9px] font-bold text-[#00f3ff] block">[{m.time}] {m.sender}</span>
                    <p className="text-gray-200">{m.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendSophiaPrompt} className="flex gap-2">
                <input
                  type="text"
                  value={sophiaInput}
                  onChange={(e) => setSophiaInput(e.target.value)}
                  placeholder="Poser une question tactique à Sophia..."
                  className="flex-1 bg-[#050811] border border-[#ff00ff55] rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff00ff]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff00ff] text-black font-orbitron font-bold text-xs rounded cursor-pointer uppercase"
                >
                  Envoyer
                </button>
              </form>
            </div>
          )}

          {/* 6. FULL MAP MONTRÉAL CONTROLS */}
          {activeTool === 'map_montreal' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#0c1222] border border-[#a855f744] rounded-lg">
                <h3 className="font-orbitron font-bold text-sm text-[#a855f7] flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>CONTRÔLEUR DU SIG GÉOSPATIAL</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Survolez l'île de Montréal avec imagerie haute résolution 0.3m, bus temps réel et réseau souterrain.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    sound.playVictory();
                    onTriggerOrbitalScan();
                  }}
                  className="p-3 bg-[#a855f722] hover:bg-[#a855f733] border border-[#a855f7] text-[#a855f7] font-bold rounded-lg cursor-pointer"
                >
                  🛰️ Scan Satellite
                </button>
                <button
                  onClick={() => {
                    sound.playLoot();
                    onSearchSTM();
                  }}
                  className="p-3 bg-[#38bdf822] hover:bg-[#38bdf833] border border-[#38bdf8] text-[#38bdf8] font-bold rounded-lg cursor-pointer"
                >
                  🚌 Actualiser Bus
                </button>
              </div>
            </div>
          )}

        </aside>
      </main>
      )}
    </div>
  );
};
