import React, { useState, useEffect, useMemo } from 'react';
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
  RotateCcw,
  Brain,
  Award
} from 'lucide-react';
import { STMBusStatusReport } from '../services/stmService';
import { TacticalBridgeState, querySophiaInference } from '../utils/cyberToolsBridge';
import { sound } from '../utils/audio';
import { MontrealTacticalMap } from './MontrealTacticalMap';
import { PlanetaryGlobe3D } from './PlanetaryGlobe3D';
import { MaxIntelOSINTAcademy } from './MaxIntelOSINTAcademy';
import { TacticalMontrealApp } from './TacticalMontrealApp';
import { MontrealCyberARPG } from './MontrealCyberARPG';

export type ToolAppId = 'world_monitor' | 'shadowbroker' | 'stm_transit' | 'god_eye_view' | 'deus_ex_sophia_ai' | 'map_montreal' | 'maxintel_academy' | 'cyber_arpg';

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

export const WORLD_MONITOR_URL = 'http://localhost:3000/?lat=0.0019&lon=0.0000&zoom=1.00&view=global&timeRange=7d&layers=outages%2Cnatural';
export const SHADOWBROKER_URL = 'http://127.0.0.1:3001/';
export const DEFAULT_GOD_EYE_VIEW_URL = 'http://localhost:4173/#v=2&lat=45.5017&lon=-73.5673&alt=450&heading=15&pitch=-30&roll=360&style=normal&bloom=0&sharpen=0&bi=0&bv=2&si=49&hud=tactical&hv=1&dm=DENSE&dd=75&da=elastic&kf=7&ko=1&cr=0&sc=1&scf=11&map=osm&l=e.x&lo=f.e.1_f.m.a&ui=c.c.1_c.p.0_l.c.1_l.p.0_d.c.0_v.c.0_r.c.1_s.c.0_g.c.0_p.c.0_m.c.0';
export const GOD_EYE_AUSTIN_URL = 'http://localhost:4173/#v=2&lat=30.2672&lon=-97.7431&alt=600&heading=15&pitch=-30&roll=360&style=normal&bloom=0&sharpen=0&bi=0&bv=2&si=49&hud=tactical&hv=1&dm=DENSE&dd=75&da=elastic&kf=7&ko=1&cr=0&sc=1&scf=11&map=osm&l=e.x&lo=f.e.1_f.m.a&ui=c.c.1_c.p.0_l.c.1_l.p.0_d.c.0_v.c.0_r.c.1_s.c.0_g.c.0_p.c.0_m.c.0';
export const GOD_EYE_VIEW_URL = DEFAULT_GOD_EYE_VIEW_URL;

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
  const [mobileViewMode, setMobileViewMode] = useState<'split' | 'map' | 'controls'>('split');
  const [mapDisplayMode, setMapDisplayMode] = useState<'globe' | 'local_map' | 'live_matrix'>(
    initialToolId === 'god_eye_view' ? 'live_matrix' : 'globe'
  );
  const [godEyeLocation, setGodEyeLocation] = useState<'montreal' | 'austin' | 'global'>('montreal');
  const [godEyeStyle, setGodEyeStyle] = useState<'normal' | 'tech' | 'crt' | 'noir' | 'snow' | 'flir'>('normal');
  const [godEyeIframeKey, setGodEyeIframeKey] = useState<number>(0);
  const [sophiaInput, setSophiaInput] = useState<string>('');
  const [isSophiaThinking, setIsSophiaThinking] = useState<boolean>(false);
  const [chatLog, setChatLog] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'SOPHIA_AI',
      text: '« Systèmes autonomes de Montréal 2033 initialisés. Contexte mémoriel : Opérateur Thirty3 (Michael) • Grille neuronale et flux géospatiaux connectés. »',
      time: new Date().toLocaleTimeString()
    }
  ]);

  const currentGodEyeUrl = useMemo(() => {
    let lat = 45.5017;
    let lon = -73.5673;
    let alt = 800;
    if (godEyeLocation === 'austin') {
      lat = 30.2672;
      lon = -97.7431;
      alt = 600;
    } else if (godEyeLocation === 'global') {
      lat = 25.0;
      lon = -30.0;
      alt = 4500;
    }
    return `http://localhost:4173/#v=2&lat=${lat}&lon=${lon}&alt=${alt}&heading=15&pitch=-30&roll=360&style=${godEyeStyle}&bloom=0&sharpen=0&bi=0&bv=2&si=49&hud=tactical&hv=1&dm=DENSE&dd=75&da=elastic&kf=7&ko=1&cr=0&sc=1&scf=11&map=osm&l=e.x&lo=f.e.1_f.m.a&ui=c.c.1_c.p.0_l.c.1_l.p.0_d.c.0_v.c.0_r.c.1_s.c.0_g.c.0_p.c.0_m.c.0`;
  }, [godEyeLocation, godEyeStyle]);

  // Réinitialisation de la mémoire : purge l'historique et garde le strict minimum contextuel (identité, grille, ancre de suivi)
  const handleResetSophiaMemory = () => {
    sound.playEmpExplosion();
    
    // Identifier la dernière directive utilisateur pour former l'ancre minimale de suivi
    const lastUserMsg = [...chatLog].reverse().find(m => m.sender === 'OPERATEUR');
    const memoryAnchor = lastUserMsg 
      ? `Dernier fil de suivi : "${lastUserMsg.text.slice(0, 60)}${lastUserMsg.text.length > 60 ? '...' : ''}"`
      : 'Prête pour les opérations d’infiltration et de cyber-renseignement.';

    setChatLog([
      {
        sender: 'SOPHIA_AI',
        text: `⚡ MÉMOIRE ÉLAGUÉE AU STRICT MINIMUM // Historique volumineux purgé.\n• Ancre identité : Opérateur Thirty3 (Michael)\n• Ancre réseau : Grille Montréal 2033 & RÉSO\n• ${memoryAnchor}\n(Consommation tokens minimisée à 100%, suivi de conversation actif).`,
        time: new Date().toLocaleTimeString()
      }
    ]);

    addLog('DEUS EX SOPHIA // Mémoire de conversation élaguée au strict minimum contextuel.');
  };

  // Sync with URL Hash
  useEffect(() => {
    const raw = window.location.hash.replace('#/', '').replace('#', '');
    const hash = raw.split('?')[0];
    if (hash && ['world-monitor', 'shadowbroker', 'stm', 'god-eye', 'sophia', 'map', 'maxintel', 'arpg'].includes(hash)) {
      if (hash === 'world-monitor') setActiveTool('world_monitor');
      else if (hash === 'shadowbroker') setActiveTool('shadowbroker');
      else if (hash === 'stm') setActiveTool('stm_transit');
      else if (hash === 'god-eye') {
        setActiveTool('god_eye_view');
        setMapDisplayMode('live_matrix');
      }
      else if (hash === 'sophia') setActiveTool('deus_ex_sophia_ai');
      else if (hash === 'map') setActiveTool('map_montreal');
      else if (hash === 'maxintel') setActiveTool('maxintel_academy');
      else if (hash === 'arpg') setActiveTool('cyber_arpg');
    }
  }, []);

  const handleSelectTool = (id: ToolAppId) => {
    sound.playLoot();
    setActiveTool(id);
    if (id === 'god_eye_view') {
      setMapDisplayMode('live_matrix');
    }
    const hashName = id === 'world_monitor' ? 'world-monitor' :
                     id === 'shadowbroker' ? 'shadowbroker' :
                     id === 'stm_transit' ? 'stm' :
                     id === 'god_eye_view' ? 'god-eye' :
                     id === 'deus_ex_sophia_ai' ? 'sophia' :
                     id === 'maxintel_academy' ? 'maxintel' :
                     id === 'cyber_arpg' ? 'arpg' : 'map';
    window.location.hash = `#/${hashName}`;
    addLog(`APPLICATION PLEINE PAGE // ${id.toUpperCase()} chargée.`);
  };

  const handleOpenNewTab = () => {
    sound.playVictory();
    // Lien direct vers l'application externe réelle
    const externalUrls: Record<string, string> = {
      world_monitor: WORLD_MONITOR_URL,
      shadowbroker: SHADOWBROKER_URL,
      god_eye_view: GOD_EYE_VIEW_URL,
      maxintel_academy: 'https://maxintel.org/',
      stm_transit: 'https://www.stm.info/'
    };

    const targetUrl = externalUrls[activeTool];
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      const hashName = activeTool === 'deus_ex_sophia_ai' ? 'sophia' :
                       activeTool === 'cyber_arpg' ? 'arpg' : 'map';
      const fullUrl = `${window.location.origin}${window.location.pathname}#/${hashName}`;
      window.open(fullUrl, '_blank');
    }
  };

  const handleSendSophiaPrompt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sophiaInput.trim() || isSophiaThinking) return;
    const text = sophiaInput.trim();
    setSophiaInput('');
    sound.playLoot();

    const userEntry = { sender: 'OPERATEUR', text, time: new Date().toLocaleTimeString() };
    setChatLog(prev => [...prev, userEntry]);
    onSendSophiaMessage(text);
    setIsSophiaThinking(true);

    try {
      // Build lightweight context (last 2-3 exchanges max for strict minimum token overhead)
      const historyContext = chatLog.slice(-3).map(m => ({
        role: m.sender === 'OPERATEUR' ? ('user' as const) : ('assistant' as const),
        content: m.text
      }));

      const res = await querySophiaInference(text, historyContext);
      if (res && res.text) {
        sound.playVictory();
        setChatLog(prev => [
          ...prev,
          {
            sender: 'SOPHIA_AI',
            text: res.text,
            time: new Date().toLocaleTimeString()
          }
        ]);
      } else {
        setChatLog(prev => [
          ...prev,
          {
            sender: 'SOPHIA_AI',
            text: `« Directive reçue : "${text}". Analyse quantique exécutée sur la grille de Montréal. »`,
            time: new Date().toLocaleTimeString()
          }
        ]);
      }
    } catch {
      setChatLog(prev => [
        ...prev,
        {
          sender: 'SOPHIA_AI',
          text: `« Réseau quantique actif : "${text}". Traitement complété. »`,
          time: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsSophiaThinking(false);
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#050811] text-white flex flex-col overflow-hidden font-mono select-none">
      
      {/* Top Application Header Bar */}
      <header className="px-3 sm:px-4 py-2 bg-[#090e1a] border-b border-[#00f3ff33] flex flex-col gap-2 shrink-0 shadow-lg z-30">
        
        {/* Top Line: Back, Title & Quick Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => {
                sound.playLoot();
                window.location.hash = '#/hub';
                onBackToHub();
              }}
              className="px-2.5 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-white/20 text-white rounded-lg font-orbitron font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:border-[#00f3ff] shrink-0"
              title="Retour au Command Center Hub"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#00f3ff]" />
              <span className="hidden sm:inline">COMMAND CENTER</span>
              <span className="sm:hidden text-[10px]">RETOUR</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-orbitron font-black text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ff41] uppercase tracking-wider truncate">
                {activeTool === 'world_monitor' ? '🌐 WORLD MONITOR MCP' :
                 activeTool === 'shadowbroker' ? '🛰️ SHADOWBROKER OSINT' :
                 activeTool === 'stm_transit' ? '🚇 STM REALTIME TRANSIT' :
                 activeTool === 'god_eye_view' ? '👁️ GOD EYE VIEW 3D' :
                 activeTool === 'deus_ex_sophia_ai' ? '🧠 SOPHIA QUANTUM AI' :
                 activeTool === 'maxintel_academy' ? '🕵️ MAXINTEL OSINT' : '🗺️ CARTE TACTIQUE'}
              </span>
              <span className="hidden md:inline px-2 py-0.5 text-[9px] font-mono bg-[#00ff4115] border border-[#00ff4155] text-[#00ff41] font-bold rounded shrink-0">
                100% FONCTIONNEL
              </span>
            </div>
          </div>

          {/* Right Actions: Open in new Tab & Launch Game */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleOpenNewTab}
              className="px-2.5 py-1.5 bg-[#111827] hover:bg-[#1f2937] border border-[#00f3ff55] text-[#00f3ff] rounded-lg text-[11px] font-orbitron font-bold flex items-center gap-1 cursor-pointer transition-all"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">ONGLET</span>
            </button>

            <button
              onClick={() => {
                sound.playVictory();
                onLaunchGame();
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-[#00f3ff] to-[#00ff41] text-black font-orbitron font-black text-xs uppercase rounded-lg shadow-[0_0_12px_rgba(0,243,255,0.4)] cursor-pointer hover:brightness-110 flex items-center gap-1.5 transition-all shrink-0"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>JOUER</span>
            </button>
          </div>
        </div>

        {/* Bottom Line: Tools Switcher Tabs (Scrollable on mobile without squishing) */}
        <div className="flex items-center gap-1 bg-[#050811] p-1 rounded-lg border border-white/10 overflow-x-auto no-scrollbar max-w-full touch-pan-x">
          <button
            onClick={() => handleSelectTool('shadowbroker')}
            className={`px-3 py-1 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTool === 'shadowbroker'
                ? 'bg-[#f59e0b] text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>🛰️ ShadowBroker</span>
          </button>

          <button
            onClick={() => handleSelectTool('map_montreal')}
            className={`px-3 py-1 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTool === 'map_montreal'
                ? 'bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            <span>Carte SIG</span>
          </button>

          <button
            onClick={() => handleSelectTool('maxintel_academy')}
            className={`px-3 py-1 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
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
            className={`px-3 py-1 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTool === 'world_monitor'
                ? 'bg-[#00f3ff] text-black shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>World Monitor</span>
          </button>

          <button
            onClick={() => handleSelectTool('stm_transit')}
            className={`px-3 py-1 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
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
            className={`px-3 py-1 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
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
            className={`px-3 py-1 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTool === 'deus_ex_sophia_ai'
                ? 'bg-[#ff00ff] text-black shadow-[0_0_12px_rgba(255,0,255,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Sophia AI</span>
          </button>

          <button
            onClick={() => handleSelectTool('cyber_arpg')}
            className={`px-3 py-1 text-xs font-orbitron font-bold uppercase rounded cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTool === 'cyber_arpg'
                ? 'bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-black font-extrabold shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                : 'text-[#00f0ff] hover:text-white hover:bg-white/5 border border-cyan-500/30'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Moteur ARPG</span>
          </button>
        </div>
      </header>

      {/* Main Application Body Grid */}
      {activeTool === 'cyber_arpg' ? (
        <main className="flex-1 overflow-hidden relative">
          <MontrealCyberARPG onBack={onBackToHub} />
        </main>
      ) : activeTool === 'map_montreal' ? (
        <main className="flex-1 overflow-hidden relative">
          <TacticalMontrealApp
            onLaunchGame={onLaunchGame}
            onBackToHub={onBackToHub}
            stmLiveReport={stmLiveReport}
            hackedPins={hackedPins}
            onHackPin={onHackPin}
            onTriggerOrbitalScan={onTriggerOrbitalScan}
            isStandalone={true}
          />
        </main>
      ) : activeTool === 'maxintel_academy' ? (
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
          
          {/* Mobile Layout Switcher Bar (Visible on mobile/Android to toggle full map, full console or split) */}
          <div className="lg:hidden px-3 py-1.5 bg-[#090d18] border-b border-[#00f3ff33] flex items-center justify-between gap-2 shrink-0 z-20">
            <span className="text-[10px] font-orbitron text-gray-400 font-bold uppercase truncate">
              {activeTool === 'shadowbroker' ? '🛰️ CADRAGE ANDROID' : 'VUE TACTIQUE'} :
            </span>
            <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded border border-white/10 shrink-0">
              <button
                onClick={() => {
                  sound.playUiClick();
                  setMobileViewMode('controls');
                }}
                className={`px-2.5 py-1 rounded text-[10px] font-orbitron font-bold transition-all cursor-pointer ${
                  mobileViewMode === 'controls'
                    ? 'bg-[#f59e0b] text-black shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🛰️ Console
              </button>
              <button
                onClick={() => {
                  sound.playUiClick();
                  setMobileViewMode('map');
                }}
                className={`px-2.5 py-1 rounded text-[10px] font-orbitron font-bold transition-all cursor-pointer ${
                  mobileViewMode === 'map'
                    ? 'bg-[#00f3ff] text-black shadow-[0_0_8px_rgba(0,243,255,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🗺️ Carte
              </button>
              <button
                onClick={() => {
                  sound.playUiClick();
                  setMobileViewMode('split');
                }}
                className={`px-2.5 py-1 rounded text-[10px] font-orbitron font-bold transition-all cursor-pointer ${
                  mobileViewMode === 'split'
                    ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ⚡ Split
              </button>
            </div>
          </div>

          {/* Left / Center Area: Full Interactive 3D Planetary Globe OR Montreal Tactical Map */}
          <section className={`p-2 sm:p-3 flex flex-col min-w-0 ${
            mobileViewMode === 'map' 
              ? 'flex-1 h-full w-full' 
              : mobileViewMode === 'controls' 
                ? 'hidden lg:flex lg:flex-1 lg:h-full' 
                : 'flex-1 min-h-[320px] sm:min-h-[420px] lg:h-full lg:flex-1'
          }`}>
            {/* View Switcher Header (Live 3D Matrix vs Globe 3D vs Carte Locale) */}
            {['world_monitor', 'shadowbroker', 'god_eye_view'].includes(activeTool) && (
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 bg-[#080d1a] px-3 py-1.5 rounded-lg border border-[#00f3ff33] shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-orbitron font-bold text-gray-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#00f3ff]" />
                    <span>AFFICHAGE GÉOSPATIAL :</span>
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded border border-white/10 flex-wrap">
                  {activeTool === 'god_eye_view' && (
                    <button
                      onClick={() => {
                        sound.playUiClick();
                        setMapDisplayMode('live_matrix');
                      }}
                      className={`px-2.5 py-1 text-[10px] font-orbitron font-bold rounded cursor-pointer transition-all flex items-center gap-1 ${
                        mapDisplayMode === 'live_matrix'
                          ? 'bg-[#00ff41] text-black shadow-[0_0_10px_rgba(0,255,65,0.5)]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>MATRICE 3D LIVE (PORT 4173)</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      sound.playUiClick();
                      setMapDisplayMode('globe');
                    }}
                    className={`px-2.5 py-1 text-[10px] font-orbitron font-bold rounded cursor-pointer transition-all flex items-center gap-1 ${
                      mapDisplayMode === 'globe'
                        ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>GLOBE 3D PLANÉTAIRE</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playUiClick();
                      setMapDisplayMode('local_map');
                    }}
                    className={`px-2.5 py-1 text-[10px] font-orbitron font-bold rounded cursor-pointer transition-all flex items-center gap-1 ${
                      mapDisplayMode === 'local_map'
                        ? 'bg-[#f59e0b] text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>CARTE LOCALE MONTRÉAL (0.3M)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Display Live Matrix 3D iframe, Globe 3D or Leaflet Map */}
            {activeTool === 'god_eye_view' && mapDisplayMode === 'live_matrix' ? (
              <div className="flex-1 w-full h-full min-h-0 rounded-lg overflow-hidden border border-[#00ff4155] shadow-2xl relative flex flex-col bg-[#03060d]">
                {/* HUD Header Bar */}
                <div className="bg-[#080f1d] px-3 py-2 border-b border-[#00ff4133] flex flex-wrap items-center justify-between gap-2 text-xs z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-ping" />
                    <span className="font-orbitron font-bold text-[#00ff41] text-[11px]">
                      VISION DE DIEU // MATRICE GÉOSPATIALE 3D (PORT 4173)
                    </span>
                  </div>

                  {/* Preset Selector */}
                  <div className="flex items-center gap-1 bg-black/70 p-0.5 rounded border border-white/10 flex-wrap">
                    <button
                      onClick={() => {
                        sound.playUiClick();
                        setGodEyeLocation('montreal');
                        setGodEyeIframeKey(k => k + 1);
                        addLog('GOD EYE // Ciblage recentré : Montréal 2033 (Centre-Ville & RÉSO).');
                      }}
                      className={`px-2 py-0.5 text-[10px] font-orbitron font-bold rounded cursor-pointer transition-all ${
                        godEyeLocation === 'montreal'
                          ? 'bg-[#00ff41] text-black shadow-[0_0_8px_rgba(0,255,65,0.5)]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      📍 Montréal 2033
                    </button>
                    <button
                      onClick={() => {
                        sound.playUiClick();
                        setGodEyeLocation('austin');
                        setGodEyeIframeKey(k => k + 1);
                        addLog('GOD EYE // Ciblage basculé : Austin TX (Défaut 4173).');
                      }}
                      className={`px-2 py-0.5 text-[10px] font-orbitron font-bold rounded cursor-pointer transition-all ${
                        godEyeLocation === 'austin'
                          ? 'bg-[#00f3ff] text-black shadow-[0_0_8px_rgba(0,243,255,0.4)]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      📡 Austin TX
                    </button>
                    <button
                      onClick={() => {
                        sound.playUiClick();
                        setGodEyeLocation('global');
                        setGodEyeIframeKey(k => k + 1);
                        addLog('GOD EYE // Ciblage basculé : Orbite Planétaire.');
                      }}
                      className={`px-2 py-0.5 text-[10px] font-orbitron font-bold rounded cursor-pointer transition-all ${
                        godEyeLocation === 'global'
                          ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🌍 Orbite
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        sound.playLoot();
                        setGodEyeIframeKey(k => k + 1);
                        addLog('GOD EYE // Flux 4173 resynchronisé.');
                      }}
                      title="Recharger le flux 4173"
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/20 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-[#00ff41]" />
                      <span className="hidden sm:inline">Actualiser</span>
                    </button>
                    <button
                      onClick={() => {
                        sound.playUiClick();
                        setMapDisplayMode('globe');
                        addLog('GOD EYE // Basculement vers Globe 3D Planétaire Natif (WebGL Three.js).');
                      }}
                      title="Bascule vers le Globe 3D natif sans iframe"
                      className="px-2 py-1 bg-[#00f3ff22] hover:bg-[#00f3ff] hover:text-black text-[#00f3ff] border border-[#00f3ff55] rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Globe 3D Natif</span>
                    </button>
                    <button
                      onClick={() => window.open(currentGodEyeUrl, '_blank', 'noopener,noreferrer')}
                      className="px-2 py-1 bg-[#00ff4122] hover:bg-[#00ff41] hover:text-black text-[#00ff41] border border-[#00ff4155] rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="hidden md:inline">Onglet Externe</span>
                    </button>
                  </div>
                </div>

                {/* Sub-bar: Style Switcher */}
                <div className="bg-[#040813] px-3 py-1 border-b border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-orbitron text-gray-400">STYLE HUD :</span>
                    {(['normal', 'snow', 'crt', 'flir', 'noir'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          sound.playUiClick();
                          setGodEyeStyle(s);
                          setGodEyeIframeKey(k => k + 1);
                        }}
                        className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold transition-all cursor-pointer ${
                          godEyeStyle === s
                            ? 'bg-[#00ff4122] text-[#00ff41] border border-[#00ff41]'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <span className="text-[10px] text-gray-400 hidden lg:inline font-mono">
                    SRC : OSM // COORD : {godEyeLocation === 'montreal' ? '45.5017° N, 73.5673° W' : godEyeLocation === 'austin' ? '30.2672° N, 97.7431° W' : '0.0000° N, 0.0000° W'}
                  </span>
                </div>

                {/* Main Iframe */}
                <iframe
                  key={godEyeIframeKey}
                  src={currentGodEyeUrl}
                  title="God Eye View 3D Matrix"
                  className="w-full flex-1 border-0 bg-[#02050e]"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : ['world_monitor', 'shadowbroker', 'god_eye_view'].includes(activeTool) && mapDisplayMode === 'globe' ? (
              <div className="flex-1 w-full h-full min-h-0 rounded-lg overflow-hidden border border-[#00f3ff44] shadow-2xl relative">
                <PlanetaryGlobe3D
                  activeToolId={activeTool as any}
                  onSelectLocation={(loc) => {
                    addLog(`GÉODÉSIE // Cible [${loc.name}] sélectionnée sur le globe planétaire.`);
                  }}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <MontrealTacticalMap
                tacticalState={tacticalState}
                stmLiveReport={stmLiveReport}
                hackedPins={hackedPins}
                onHackPin={onHackPin}
                godEyeActive={godEyeActive}
                onTriggerOrbitalScan={onTriggerOrbitalScan}
                onTriggerShadowBrokerDrone={onTriggerShadowBrokerDrone}
                activeServiceId={activeTool}
                className="flex-1 w-full h-full"
              />
            )}
          </section>

          {/* Right Sidebar: Dedicated Interactive Control Suite for Active Tool */}
          <aside className={`w-full lg:w-[440px] xl:w-[480px] bg-[#070a14] border-t lg:border-t-0 lg:border-l border-[#00f3ff33] flex flex-col overflow-y-auto touch-pan-y p-2.5 sm:p-4 space-y-3 sm:space-y-4 shrink-0 shadow-2xl pb-16 lg:pb-4 ${
            mobileViewMode === 'controls' 
              ? 'flex-1 h-full' 
              : mobileViewMode === 'map' 
                ? 'hidden lg:flex lg:h-full' 
                : 'flex-1 min-h-0 lg:h-full'
          }`}>
            
            {/* 1. WORLD MONITOR CONTROLS */}
            {activeTool === 'world_monitor' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#0c1222] border border-[#00f3ff44] rounded-lg">
                <h3 className="font-orbitron font-bold text-sm text-[#00f3ff] flex items-center gap-2">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span className="truncate">59 OUTILS MCP & TÉLÉMÉTRIE SKYFI</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Surveillance mondiale géostratégique et imagerie satellite optique 0.3m.
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playVictory();
                  window.open(WORLD_MONITOR_URL, '_blank', 'noopener,noreferrer');
                }}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#00f3ff] to-[#00ff41] text-black font-orbitron font-black text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.4)] cursor-pointer flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>OUVRIR WORLD MONITOR LIVE (PORT 3000)</span>
              </button>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    sound.playVictory();
                    onTriggerOrbitalScan();
                    addLog('WORLD MONITOR // Balayage complet des 59 outils MCP exécuté.');
                  }}
                  className="p-2.5 sm:p-3 bg-[#00f3ff22] hover:bg-[#00f3ff33] border border-[#00f3ff] text-[#00f3ff] font-bold rounded-lg cursor-pointer transition-all flex flex-col items-center text-center gap-1.5"
                >
                  <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f3ff]" />
                  <span className="text-[11px] sm:text-xs">Scan Orbital (0.3m)</span>
                </button>

                <button
                  onClick={() => {
                    sound.playLoot();
                    addLog('WORLD MONITOR // Sentinel-1 Radar SAR pénétrant les nuages activé.');
                  }}
                  className="p-2.5 sm:p-3 bg-[#00ff4115] hover:bg-[#00ff4133] border border-[#00ff41] text-[#00ff41] font-bold rounded-lg cursor-pointer transition-all flex flex-col items-center text-center gap-1.5"
                >
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#00ff41]" />
                  <span className="text-[11px] sm:text-xs">Radar Sentinel-1</span>
                </button>
              </div>

              <div className="p-3 bg-[#090e1c] border border-white/10 rounded-lg space-y-2 text-xs">
                <span className="text-gray-400 font-bold uppercase block text-[10px]">
                  CHOKEPOINTS MARITIMES STRATÉGIQUES
                </span>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="truncate mr-2">Voie St-Laurent (Montréal)</span>
                  <span className="text-[#00ff41] font-bold shrink-0">FLUX NORMAL</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="truncate mr-2">Détroit d'Ormuz</span>
                  <span className="text-[#f59e0b] font-bold shrink-0">VIGILANCE</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="truncate mr-2">Canal de Suez / Bab-el-Mandeb</span>
                  <span className="text-[#ff0055] font-bold shrink-0">ALERTE</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. SHADOWBROKER OSINT CONTROLS */}
          {activeTool === 'shadowbroker' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-[#0c1222] border border-[#f59e0b44] rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-orbitron font-bold text-xs sm:text-sm text-[#f59e0b] flex items-center gap-2">
                    <Satellite className="w-4 h-4 text-[#f59e0b] shrink-0 animate-pulse" />
                    <span>SHADOWBROKER // OSINT LIVE</span>
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] font-mono bg-[#f59e0b22] text-[#f59e0b] border border-[#f59e0b55] rounded font-bold">
                    PORT 3001
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Surveillance du secteur <span className="text-white font-bold">{tacticalState.shadowBroker.targetDistrict}</span>. Infiltration des balises et tours de télécommunication.
                </p>
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-gray-400">Tours SPVM compromises :</span>
                  <span className="text-[#00ff41] font-bold">
                    {tacticalState.shadowBroker.spvmSurveillanceTowersHacked} / {tacticalState.shadowBroker.totalTowers}
                  </span>
                </div>
              </div>

              {/* Direct Open ShadowBroker Live Button */}
              <button
                onClick={() => {
                  sound.playVictory();
                  window.open(SHADOWBROKER_URL, '_blank', 'noopener,noreferrer');
                }}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-black font-orbitron font-black text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>OUVRIR SHADOWBROKER LIVE (PORT 3001)</span>
              </button>

              {/* Deploy Drone Button */}
              <button
                onClick={() => {
                  sound.playVictory();
                  if (mapDisplayMode !== 'local_map') {
                    setMapDisplayMode('local_map');
                  }
                  onTriggerShadowBrokerDrone();
                  const mission = tacticalState.shadowBroker.droneMission;
                  if (mission?.isActive) {
                    const nextTask = mission.tasks[(mission.currentTaskIndex + 1) % mission.tasks.length];
                    addLog(`SHADOWBROKER // Drone réassigné : Tâche ${((mission.currentTaskIndex + 1) % mission.tasks.length) + 1}/${mission.tasks.length} -> ${nextTask.title}.`);
                  } else {
                    addLog('SHADOWBROKER // Mini Drone Reaper OSINT déployé au-dessus de Ville-Marie. Télémétrie et balayage 360° activés.');
                  }
                }}
                className={`w-full py-2.5 sm:py-3 font-orbitron font-bold text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  tacticalState.shadowBroker.droneMission?.isActive
                    ? 'bg-gradient-to-r from-[#f59e0b] to-[#00f3ff] text-black shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse'
                    : 'bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black'
                }`}
              >
                <Satellite className="w-4 h-4 shrink-0" />
                {tacticalState.shadowBroker.droneMission?.isActive ? (
                  <div className="flex flex-col items-center leading-tight">
                    <span className="flex items-center gap-1.5 text-xs font-black">
                      <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                      DRONE EN MISSION // TÂCHE {(tacticalState.shadowBroker.droneMission.currentTaskIndex + 1)}/5
                    </span>
                    <span className="text-[10px] font-mono opacity-90 truncate max-w-[320px]">
                      {tacticalState.shadowBroker.droneMission.tasks[tacticalState.shadowBroker.droneMission.currentTaskIndex]?.title || 'Patrouille active'}
                    </span>
                  </div>
                ) : (
                  <span className="truncate">DÉPLOYER LE DRONE OSINT [TOUCHE 7]</span>
                )}
              </button>

              {/* Active Drone Mission Telemetry Card */}
              {tacticalState.shadowBroker.droneMission?.isActive && (
                <div className="p-3 bg-[#0a0f1d] border border-[#f59e0b66] rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.2)] space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-orbitron font-bold text-[#f59e0b] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-ping" />
                      REAPER OSINT EN ACTION
                    </span>
                    <span className="text-[10px] font-mono text-[#00ff41] font-bold">
                      BATTERIE: {tacticalState.shadowBroker.droneMission.batteryPercent}%
                    </span>
                  </div>

                  {(() => {
                    const mission = tacticalState.shadowBroker.droneMission!;
                    const currentTask = mission.tasks[mission.currentTaskIndex] || mission.tasks[0];
                    return (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center text-[10px] text-gray-300">
                          <span className="text-gray-400">Mission :</span>
                          <span className="text-[#00f3ff] font-bold">{currentTask.title}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-300">
                          <span className="text-gray-400">Cible :</span>
                          <span className="text-white font-bold">{currentTask.targetName}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                          <span>Alt: {mission.altitudeMeters}m</span>
                          <span>Vitesse: {mission.speedKmh} km/h</span>
                          <span>Cap: {mission.heading.toFixed(0)}°</span>
                        </div>
                        {currentTask.interceptedData && (
                          <div className="mt-1 p-1.5 bg-black/60 border border-[#f59e0b44] rounded text-[9px] font-mono text-amber-300 leading-tight">
                            {currentTask.interceptedData}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* OSINT Pins List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-300 uppercase text-[11px] flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>BALISES MONTRÉALAISES</span>
                  </span>
                  <span className="px-1.5 py-0.5 bg-black/60 rounded text-[10px] font-mono text-[#00ff41] border border-[#00ff4144]">
                    {hackedPins.length}/{tacticalState.shadowBroker.osintPins.length} INFILTRÉES
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[260px] sm:max-h-[320px] overflow-y-auto touch-pan-y pr-0.5 no-scrollbar">
                  {tacticalState.shadowBroker.osintPins.map(pin => {
                    const isHacked = hackedPins.includes(pin.id);
                    return (
                      <div
                        key={pin.id}
                        className={`p-2 sm:p-2.5 rounded-lg border flex items-center justify-between text-xs transition-all gap-2 ${
                          isHacked ? 'bg-[#00ff4110] border-[#00ff4155]' : 'bg-[#050811] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white flex items-center gap-1.5 truncate">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${pin.type === 'threat' ? 'bg-[#ff0055]' : pin.type === 'intel' ? 'bg-[#00f3ff]' : 'bg-[#00ff41]'}`} />
                            <span className="truncate text-xs">{pin.label}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 truncate mt-0.5">{pin.description}</div>
                          <div className="text-[9px] font-mono text-gray-500 mt-0.5">
                            {pin.lat.toFixed(4)}°N, {pin.lng.toFixed(4)}°W
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            sound.playLoot();
                            onHackPin(pin.id, pin.label);
                          }}
                          className={`px-2.5 py-1.5 text-[10px] font-bold rounded cursor-pointer transition-all shrink-0 font-orbitron ${
                            isHacked 
                              ? 'bg-[#00ff41] text-black shadow-[0_0_8px_rgba(0,255,65,0.4)]' 
                              : 'bg-[#f59e0b22] border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-black'
                          }`}
                        >
                          {isHacked ? '✓ INFILTRÉ' : 'HACK'}
                        </button>
                      </div>
                    );
                  })}
                </div>
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
                    <span className="text-[#38bdf8]">{stmLiveReport.activeCount} BUS ACTIFS</span>
                  </div>
                  <div className="text-[11px] text-gray-300">
                    Retard moyen : <span className="text-[#00ff41] font-bold">{Math.round(stmLiveReport.avgDelaySec / 60)} min</span>
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
                  <span>VISION DE DIEU // MATRICE 3D GÉOSPATIALE</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Surveillance biométrique urbaine, flux de circulation et satellite optique 0.3m.
                </p>
              </div>

              {/* Presets de Ciblage Rapide */}
              <div className="p-3 bg-[#080e1a] border border-white/10 rounded-lg space-y-2">
                <label className="text-[11px] font-orbitron font-bold text-gray-300 block">
                  🎯 CIBLAGE GÉODÉSIQUE :
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      sound.playUiClick();
                      setGodEyeLocation('montreal');
                      setGodEyeIframeKey(k => k + 1);
                      addLog('GOD EYE // Cible : Montréal 2033.');
                    }}
                    className={`py-2 px-1 text-[10px] font-orbitron font-bold rounded cursor-pointer transition-all text-center ${
                      godEyeLocation === 'montreal'
                        ? 'bg-[#00ff41] text-black shadow-[0_0_10px_rgba(0,255,65,0.4)]'
                        : 'bg-black/60 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    Montréal
                  </button>
                  <button
                    onClick={() => {
                      sound.playUiClick();
                      setGodEyeLocation('austin');
                      setGodEyeIframeKey(k => k + 1);
                      addLog('GOD EYE // Cible : Austin TX.');
                    }}
                    className={`py-2 px-1 text-[10px] font-orbitron font-bold rounded cursor-pointer transition-all text-center ${
                      godEyeLocation === 'austin'
                        ? 'bg-[#00f3ff] text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                        : 'bg-black/60 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    Austin TX
                  </button>
                  <button
                    onClick={() => {
                      sound.playUiClick();
                      setGodEyeLocation('global');
                      setGodEyeIframeKey(k => k + 1);
                      addLog('GOD EYE // Cible : Orbite Globale.');
                    }}
                    className={`py-2 px-1 text-[10px] font-orbitron font-bold rounded cursor-pointer transition-all text-center ${
                      godEyeLocation === 'global'
                        ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                        : 'bg-black/60 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    Planétaire
                  </button>
                </div>
              </div>

              {/* Styles Visuels */}
              <div className="p-3 bg-[#080e1a] border border-white/10 rounded-lg space-y-2">
                <label className="text-[11px] font-orbitron font-bold text-gray-300 block">
                  🎨 FILTRE OPTIQUE HUD :
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {(['normal', 'snow', 'crt', 'flir', 'noir'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        sound.playUiClick();
                        setGodEyeStyle(s);
                        setGodEyeIframeKey(k => k + 1);
                      }}
                      className={`py-1.5 text-[9px] uppercase font-bold rounded transition-all cursor-pointer text-center ${
                        godEyeStyle === s
                          ? 'bg-[#00ff41] text-black shadow-[0_0_8px_rgba(0,255,65,0.4)]'
                          : 'bg-black/40 text-gray-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bouton d'Ouverture et Fallback */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    sound.playVictory();
                    window.open(currentGodEyeUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-[#00ff41] to-[#00f3ff] text-black font-orbitron font-black text-xs uppercase rounded-lg shadow-[0_0_15px_rgba(0,255,65,0.4)] cursor-pointer flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>OUVRIR GOD EYE VIEW LIVE (PORT 4173)</span>
                </button>

                <button
                  onClick={() => {
                    sound.playUiClick();
                    setMapDisplayMode(mapDisplayMode === 'globe' ? 'live_matrix' : 'globe');
                    addLog(`GOD EYE // Mode affichage basculé : ${mapDisplayMode === 'globe' ? 'Matrice 4173' : 'Globe 3D Three.js'}.`);
                  }}
                  className="w-full py-2.5 bg-[#00f3ff15] hover:bg-[#00f3ff33] border border-[#00f3ff] text-[#00f3ff] font-orbitron font-bold text-xs uppercase rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>{mapDisplayMode === 'globe' ? 'VOIR FLUX CESIUM 4173' : 'BASCULER GLOBE 3D PLANÉTAIRE'}</span>
                </button>
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
                <span>{godEyeActive ? 'DÉSACTIVER OVERLAY GOD EYE' : 'ACTIVER OVERLAY GOD EYE'}</span>
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
                  <span>Moteur Rendu 3D</span>
                  <span className="text-[#00ff41] font-bold">OSM + THREE.JS // ACTIF</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. DEUS EX SOPHIA AI CONTROLS */}
          {activeTool === 'deus_ex_sophia_ai' && (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="p-3 bg-[#0c1222] border border-[#ff00ff44] rounded-lg flex items-start sm:items-center gap-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded overflow-hidden border-2 border-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.4)] relative">
                    <img src="/deus_ex_sophia_avatar.png" alt="Deus Ex Sophia" className="w-full h-full object-cover object-top" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end justify-center pb-1.5">
                       <span className="text-[10px] font-orbitron font-bold text-[#00ff41] animate-pulse shadow-black drop-shadow-md">CONNEXION NEURALE</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-orbitron font-black text-sm sm:text-lg text-[#ff00ff] flex items-center gap-2">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                      <span className="uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-[#ff00ff]">DEUS EX SOPHIA</span>
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-300 mt-1 mb-2 font-mono leading-relaxed">
                      // AVATAR QUANTIQUE LOCALISÉ<br/>
                      // SYNERGIE 2-LLM (GEMINI 1.5 + PHI-3)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-[#00ff4122] border border-[#00ff41] text-[#00ff41] rounded">FLASH ATTENTION</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-[#ff00ff22] border border-[#ff00ff] text-[#ff00ff] rounded">COGNITION CLOUD</span>
                    </div>
                  </div>
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

              {/* Interactive AI Chat Console with Strict Minimum Memory Reset */}
              <div className="flex-1 min-h-[220px] bg-[#050811] border border-[#ff00ff44] rounded-lg flex flex-col overflow-hidden">
                {/* Chat Console Header Bar with Reset & Memory Status */}
                <div className="px-3 py-2 bg-[#0c1222] border-b border-white/10 flex items-center justify-between flex-wrap gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-[#ff00ff22] text-[#ff00ff] rounded border border-[#ff00ff55]">
                      <Brain className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="text-[11px] font-orbitron font-bold text-white flex items-center gap-1.5">
                        <span>CONSOLE NEURALE SOPHIA</span>
                        <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30">
                          {chatLog.length} msg{chatLog.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-gray-400 block">
                        Statut : <strong className="text-[#00ff41]">Strict Minimum Actif</strong>
                      </span>
                    </div>
                  </div>

                  {/* RESET / ÉLAGUER MÉMOIRE AU STRICT MINIMUM */}
                  <button
                    type="button"
                    onClick={handleResetSophiaMemory}
                    className="px-2.5 py-1 bg-amber-950/50 hover:bg-amber-900/70 text-amber-300 hover:text-amber-200 border border-amber-500/50 hover:border-amber-400 text-[10px] font-orbitron font-bold rounded flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_10px_rgba(245,158,11,0.25)] active:scale-95"
                    title="Effacer le surplus d'historique et conserver uniquement le strict minimum de mémoire (identité Thirty3, grille Montréal 2033 et dernier fil conducteur)"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-400" />
                    <span>RESET MÉMOIRE</span>
                  </button>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs font-mono">
                  {chatLog.map((m, idx) => (
                    <div key={idx} className={`p-2 rounded border ${
                      m.sender === 'OPERATEUR' 
                        ? 'bg-[#0e1628] border-cyan-500/30 ml-3' 
                        : m.text.includes('MÉMOIRE ÉLAGUÉE') 
                          ? 'bg-amber-950/30 border-amber-500/50 text-amber-200' 
                          : 'bg-[#150e24] border-fuchsia-500/30 mr-3'
                    }`}>
                      <div className="flex items-center justify-between text-[9px] font-bold mb-1 opacity-80">
                        <span className={m.sender === 'OPERATEUR' ? 'text-[#00f3ff]' : 'text-[#ff00ff]'}>
                          [{m.time}] {m.sender}
                        </span>
                        {m.sender === 'SOPHIA_AI' && !m.text.includes('MÉMOIRE ÉLAGUÉE') && (
                          <span className="text-[8px] text-gray-400">Ollama FlashAttention 0.2</span>
                        )}
                      </div>
                      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    </div>
                  ))}
                  {isSophiaThinking && (
                    <div className="p-2 rounded border bg-[#150e24] border-fuchsia-500/30 mr-3 flex items-center gap-2 text-fuchsia-300 text-xs animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-fuchsia-400" />
                      <span>Sophia traite le signal avec mémoire ultra-compacte...</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendSophiaPrompt} className="p-2 bg-[#0c1222] border-t border-white/10 flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={sophiaInput}
                    onChange={(e) => setSophiaInput(e.target.value)}
                    disabled={isSophiaThinking}
                    placeholder="Poser une question tactique à Sophia..."
                    className="flex-1 bg-[#050811] border border-[#ff00ff55] rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff00ff]"
                  />
                  <button
                    type="submit"
                    disabled={isSophiaThinking || !sophiaInput.trim()}
                    className="px-4 py-2 bg-[#ff00ff] hover:bg-[#ff00ff]/90 disabled:opacity-50 text-black font-orbitron font-bold text-xs rounded cursor-pointer uppercase flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(255,0,255,0.3)]"
                  >
                    {isSophiaThinking ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    <span>Envoyer</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 6. FULL MAP MONTRÉAL CONTROLS */}
          {(activeTool as string) === 'map_montreal' && (
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
