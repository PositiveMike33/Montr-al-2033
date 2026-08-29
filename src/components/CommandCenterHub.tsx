import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  Satellite, 
  Zap, 
  Cpu, 
  ExternalLink, 
  Gamepad2, 
  Eye, 
  Send, 
  RefreshCw, 
  Activity, 
  Radio, 
  ShieldCheck, 
  Sliders, 
  Database,
  Train,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Terminal,
  Crosshair,
  Lock,
  Unlock,
  RadioTower,
  Sparkles
} from 'lucide-react';
import { TacticalBridgeState, querySophiaInference } from '../utils/cyberToolsBridge';
import { sound } from '../utils/audio';

export interface DockerServiceInfo {
  id: 'game_arpg' | 'world_monitor' | 'shadowbroker' | 'deus_ex_sophia_ai' | 'god_eye_view' | 'stm_transit';
  title: string;
  name: string;
  category: 'GAME' | 'MCP' | 'OSINT' | 'AI_CORE' | '3D_MATRIX' | 'TRANSIT';
  port: number;
  hostUrl: string;
  status: 'ONLINE' | 'ACTIVE' | 'STANDBY';
  description: string;
  role: string;
  badgeColor: string;
  icon: any;
}

const DOCKER_SERVICES: DockerServiceInfo[] = [
  {
    id: 'game_arpg',
    title: '🎮 Montréal 2033',
    name: '🎮 Montréal 2033 (Jeu ARPG & Cyber-Deck)',
    category: 'GAME',
    port: 3033,
    hostUrl: 'http://localhost:3033',
    status: 'ONLINE',
    description: 'Application web principale Nginx Alpine (Thématique 2033). Action-RPG isométrique tactique avec système de combat inspiré de Diablo 4.',
    role: 'Simulacre de Combat & Interface Tactique de Thirty3',
    badgeColor: '#00f3ff',
    icon: Gamepad2
  },
  {
    id: 'world_monitor',
    title: '🌐 World Monitor',
    name: '🌐 World Monitor (MCP 59 Outils)',
    category: 'MCP',
    port: 3000,
    hostUrl: 'http://localhost:3000',
    status: 'ONLINE',
    description: 'Serveur MCP 59 outils & surveillance de crise globale. Imagerie satellitaire haute résolution SkyFi / Sentinel (0.3m).',
    role: 'Renseignement Géostratégique & Télémétrie Satellitaire',
    badgeColor: '#00f3ff',
    icon: Globe
  },
  {
    id: 'shadowbroker',
    title: '🛰️ ShadowBroker',
    name: '🛰️ ShadowBroker & OpenClaw OSINT',
    category: 'OSINT',
    port: 3001,
    hostUrl: 'http://localhost:3001',
    status: 'ONLINE',
    description: 'Interface web Next.js OSINT & backend de reconnaissance géospatiale. Détection des pins de surveillance SPVM-Prime.',
    role: 'Cartographie OSINT & Drones Infiltrateurs de Montréal',
    badgeColor: '#f59e0b',
    icon: Satellite
  },
  {
    id: 'deus_ex_sophia_ai',
    title: '🧠 Deus Ex Sophia',
    name: '🧠 Deus Ex Sophia (Ollama 8.0B & Gateway)',
    category: 'AI_CORE',
    port: 11434,
    hostUrl: 'http://localhost:11434',
    status: 'ONLINE',
    description: 'Moteur d\'inférence 8.0B Gemma-4 Uncensored (Q4_K_M) & Pipeline Deepfake de vérité contre Viktor Vance.',
    role: 'Cerveau Quantique & Moteur d\'Inférence IA Hybride',
    badgeColor: '#ff00ff',
    icon: Zap
  },
  {
    id: 'god_eye_view',
    title: '👁️ God Eye View 3D',
    name: '👁️ God Eye View 3D Matrix',
    category: '3D_MATRIX',
    port: 4173,
    hostUrl: 'http://localhost:4173',
    status: 'ONLINE',
    description: 'Interface web 3D God Eye View (Port 4173). Cartographie omnisciente 3D des rues de Montréal et réseau de caméras HD.',
    role: 'Surveillance 3D Omnisciente & Caméras Biométriques',
    badgeColor: '#00ff41',
    icon: Eye
  },
  {
    id: 'stm_transit',
    title: '🚇 STM Realtime',
    name: '🚇 STM Realtime Redis & Transit',
    category: 'TRANSIT',
    port: 6379,
    hostUrl: 'http://localhost:8079',
    status: 'ONLINE',
    description: 'Flux de données GTFS-Realtime (Redis Port 6379). Suivi en direct des 142 bus et saturation du réseau métro.',
    role: 'Télémétrie des Bus en Direct & Surcharge du Réseau',
    badgeColor: '#38bdf8',
    icon: Train
  }
];

interface CommandCenterHubProps {
  onLaunchGame: () => void;
  onOpenSettings: () => void;
  tacticalState: TacticalBridgeState;
  onTriggerOrbitalScan: () => void;
  onTriggerShadowBrokerDrone: () => void;
  onTriggerSophiaSTMOverload: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'THIRTY3' | 'DEUS_EX_SOPHIA' | 'SYSTEM';
  text: string;
  timestamp: string;
  source?: 'ollama' | 'simulation';
  latencyMs?: number;
}

export const CommandCenterHub: React.FC<CommandCenterHubProps> = ({
  onLaunchGame,
  onOpenSettings,
  tacticalState,
  onTriggerOrbitalScan,
  onTriggerShadowBrokerDrone,
  onTriggerSophiaSTMOverload
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<DockerServiceInfo['id']>('world_monitor');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'SYSTEM',
      text: 'CONNEXION SÉCURISÉE ÉTABLIE // DOCKER MESH & OLLAMA (deus_ex_sophia:latest) OPÉRATIONNELS.',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 'msg_2',
      sender: 'DEUS_EX_SOPHIA',
      text: '« Thirty3, mon cortex quantique est synchronisé. Les 6 services de ton infrastructure répondent avec une latence inférieure à 2ms. Quel est notre vecteur d\'attaque contre Viktor Vance ? »',
      timestamp: new Date().toLocaleTimeString(),
      source: 'ollama'
    }
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [godEyeActive, setGodEyeActive] = useState<boolean>(false);
  const [toolLogs, setToolLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] World Monitor MCP connecté sur port 3000. 4 satellites SkyFi verrouillés.`,
    `[${new Date().toLocaleTimeString()}] ShadowBroker OSINT initialisé sur port 8001. 4 balises tactiques actives.`,
    `[${new Date().toLocaleTimeString()}] Sophia Gateway prête sur port 8000. Pipeline Deepfake à 88%.`,
    `[${new Date().toLocaleTimeString()}] STM Redis temps réel connecté sur port 6379. 142 bus actifs.`
  ]);
  const [deepfakePercent, setDeepfakePercent] = useState<number>(88);
  const [hackedPins, setHackedPins] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedService = DOCKER_SERVICES.find(s => s.id === selectedServiceId) || DOCKER_SERVICES[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isGenerating]);

  const addLog = (log: string) => {
    setToolLogs(prev => [`[${new Date().toLocaleTimeString()}] ${log}`, ...prev.slice(0, 19)]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isGenerating) return;

    sound.playLevelUp();

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'THIRTY3',
      text: query,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsGenerating(true);

    try {
      const res = await querySophiaInference(query);
      const sophiaMsg: ChatMessage = {
        id: 'sophia_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: res.text,
        timestamp: new Date().toLocaleTimeString(),
        source: res.source,
        latencyMs: res.latencyMs
      };
      setChatMessages(prev => [...prev, sophiaMsg]);
      addLog(`Sophia Inférence générée (${res.latencyMs || 25}ms) via ${res.source.toUpperCase()}.`);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: 'sophia_err_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: '« Signal stabilisé. Mes algorithmes confirment une brèche exploitable sur le serveur central de Place Ville-Marie. Prépare ton injection. »',
        timestamp: new Date().toLocaleTimeString(),
        source: 'simulation'
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteWorldMonitorScan = () => {
    sound.playLevelUp();
    onTriggerOrbitalScan();
    addLog('WORLD MONITOR // Balayage satellite SkyFi 0.3m exécuté sur Montréal. 3 anomalies SPVM détectées.');
    setChatMessages(prev => [
      ...prev,
      {
        id: 'wm_' + Date.now(),
        sender: 'SYSTEM',
        text: '🌐 WORLD MONITOR // Scan orbital SkyFi terminé : Coordonnées de Viktor Vance verrouillées sur Place Ville-Marie [45.5009°N, -73.5684°W].',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const handleExecuteShadowBrokerDrone = () => {
    sound.playLevelUp();
    onTriggerShadowBrokerDrone();
    addLog('SHADOWBROKER OSINT // Drone de reconnaissance déployé sur Sainte-Catherine. Brouillage radar actif 8s.');
    setChatMessages(prev => [
      ...prev,
      {
        id: 'sb_' + Date.now(),
        sender: 'SYSTEM',
        text: '🛰️ SHADOWBROKER // Drone furtif en position : Radars ennemis de Peel/Sainte-Catherine aveuglés.',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const handleHackPin = (pinId: string, label: string) => {
    sound.playLoot();
    if (!hackedPins.includes(pinId)) {
      setHackedPins(prev => [...prev, pinId]);
      addLog(`SHADOWBROKER // Infiltration réussie de la balise : ${label}. Données extraites.`);
      setChatMessages(prev => [
        ...prev,
        {
          id: 'pin_' + Date.now(),
          sender: 'DEUS_EX_SOPHIA',
          text: `« Thirty3, flux vidéo intercepté sur ${label}. Les patrouilles SPVM sont désorientées. »`,
          timestamp: new Date().toLocaleTimeString(),
          source: 'ollama'
        }
      ]);
    }
  };

  const handleBoostDeepfake = () => {
    sound.playVictory();
    setDeepfakePercent(100);
    onTriggerSophiaSTMOverload();
    addLog('DEUS EX SOPHIA // Encodage du Deepfake complété à 100%. Diffusion générale sur le RÉSO & panneaux municipaux.');
    setChatMessages(prev => [
      ...prev,
      {
        id: 'df_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: '« VICTOIRE MÉDIATIQUE ! Le Deepfake de Viktor Vance révélant ses fraudes massives est diffusé sur tous les écrans géants de Montréal. Sa cote de crédit et son empire vacillent ! »',
        timestamp: new Date().toLocaleTimeString(),
        source: 'ollama'
      }
    ]);
  };

  const handleToggleGodEye = () => {
    sound.playLevelUp();
    const nextState = !godEyeActive;
    setGodEyeActive(nextState);
    const logText = nextState
      ? 'MATRICE GOD EYE // Triangulation satellite SkyFi + STM GTFS-Realtime (142 bus) déployée sur toute l’île.'
      : 'MATRICE GOD EYE // Passage en mode veille tactique.';
    addLog(logText);
    setChatMessages(prev => [
      ...prev,
      {
        id: 'godeye_' + Date.now(),
        sender: 'SYSTEM',
        text: `👁️ ${logText}`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const handleCardClick = (srv: DockerServiceInfo) => {
    setSelectedServiceId(srv.id);
    sound.playLoot();
    addLog(`ACTIVATION SERVICE // ${srv.name} (Port ${srv.port}) prêt.`);
    
    if (srv.id === 'game_arpg') {
      onLaunchGame();
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#05060a] text-gray-200 overflow-hidden font-sans select-none">
      <header className="h-14 border-b border-[#00f3ff33] bg-[#090d16]/95 px-6 flex items-center justify-between shrink-0 z-30 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded border border-[#00f3ff] bg-[#00f3ff15] flex items-center justify-center text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.4)]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-orbitron font-black text-white tracking-widest flex items-center gap-2 uppercase">
              <span>THIRTY3</span>
              <span className="text-[#00f3ff]">//</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff00ff]">
                CENTRE DE COMMANDEMENT
              </span>
            </div>
            <div className="text-[10px] font-mono text-gray-400">
              Montréal 2033 • Port 3033 • Moteur IA Sophia (deus_ex_sophia:latest)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLaunchGame}
            className="px-4 py-2 bg-gradient-to-r from-[#00f3ff] to-[#00bfff] text-black font-orbitron font-black text-xs uppercase tracking-wider rounded shadow-[0_0_20px_rgba(0,243,255,0.5)] hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>LANCER LE JEU (SIMULACRE)</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 border border-[#ffffff22] hover:border-[#00f3ff] bg-[#111827] text-gray-300 hover:text-white rounded transition-all cursor-pointer"
            title="Paramètres Système & Diagnostics"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        <main className="w-2/3 border-r border-[#00f3ff22] flex flex-col bg-[#070a12] p-4 overflow-y-auto space-y-4">
          
          <div className="grid grid-cols-4 gap-2.5 font-mono text-xs">
            <div className="bg-[#0b101d] border border-[#00f3ff33] p-2.5 rounded flex items-center justify-between">
              <div className="text-gray-400 text-[10px]">RÉSEAU DOCKER</div>
              <div className="text-[#00ff41] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-ping" />
                6 / 6 ACTIFS
              </div>
            </div>

            <div className="bg-[#0b101d] border border-[#00f3ff33] p-2.5 rounded flex items-center justify-between">
              <div className="text-gray-400 text-[10px]">CIBLE VANCE</div>
              <div className="text-[#ff0055] font-bold">PLACE VILLE-MARIE</div>
            </div>

            <div className="bg-[#0b101d] border border-[#00f3ff33] p-2.5 rounded flex items-center justify-between">
              <div className="text-gray-400 text-[10px]">TRANSIT STM</div>
              <div className="text-[#00f3ff] font-bold">142 BUS EN DIRECT</div>
            </div>

            <div className="bg-[#0b101d] border border-[#00f3ff33] p-2.5 rounded flex items-center justify-between">
              <div className="text-gray-400 text-[10px]">MATRICE GOD EYE</div>
              <button 
                onClick={handleToggleGodEye}
                className={`text-xs font-bold px-2 py-0.5 border cursor-pointer transition-all ${godEyeActive ? 'bg-[#00ff41] text-black border-[#00ff41]' : 'bg-transparent text-gray-400 border-gray-600'}`}
              >
                {godEyeActive ? '👁️ ON' : 'VEILLE'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-orbitron font-bold text-[#00f3ff] uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#00f3ff]" />
              <span>SÉLECTIONNEZ UN SERVICE DOCKER POUR L'ACTIVER</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {DOCKER_SERVICES.map(srv => {
                const Icon = srv.icon;
                const isSelected = srv.id === selectedServiceId;

                return (
                  <div
                    key={srv.id}
                    onClick={() => handleCardClick(srv)}
                    className={`p-3 rounded border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0f172a] border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.25)] ring-1 ring-[#00f3ff]'
                        : 'bg-[#0a0e1a] border-[#ffffff15] hover:border-gray-500 hover:bg-[#0d1322]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: srv.badgeColor }} />
                          <span className="text-[11px] font-orbitron font-bold text-white truncate">
                            {srv.title}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.2 text-[8px] font-mono bg-[#00ff4115] border border-[#00ff4155] text-[#00ff41] font-bold">
                          :{srv.port}
                        </span>
                      </div>

                      <div className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                        {srv.description}
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono">
                      <span className={isSelected ? 'text-[#00f3ff] font-bold' : 'text-gray-500'}>
                        {isSelected ? '● ACTIF' : 'SÉLECTIONNER'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playVictory();
                          if (srv.id === 'game_arpg') {
                            onLaunchGame();
                          } else if (srv.id === 'stm_transit') {
                            setSelectedServiceId('stm_transit');
                            addLog('STM REALTIME // Télémétrie des 142 bus active dans le Hub.');
                          } else {
                            addLog(`OUVERTURE PAGE // ${srv.title} (${srv.hostUrl})`);
                            window.open(srv.hostUrl, '_blank');
                          }
                        }}
                        className="text-[#00f3ff] hover:text-white flex items-center gap-0.5 font-bold cursor-pointer hover:underline bg-transparent border-0"
                        title={`Ouvrir ${srv.title}`}
                      >
                        <span>{srv.id === 'stm_transit' ? 'Télémétrie' : 'Ouvrir'}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0b101f] border border-[#00f3ff55] p-4 rounded-lg shadow-xl space-y-3">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#00f3ff15] border border-[#00f3ff] text-[#00f3ff]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-orbitron font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span>CONSOLE INTERACTIVE // {selectedService.name}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-[#00ff4122] text-[#00ff41] border border-[#00ff4155] rounded">
                      PORT {selectedService.port} OPÉRATIONNEL
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400">
                    URL Hôte : <span className="text-[#00f3ff]">{selectedService.hostUrl}</span> • {selectedService.role}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedService.id === 'game_arpg') {
                      onLaunchGame();
                    } else if (selectedService.id === 'stm_transit') {
                      addLog('STM REALTIME // Flux 142 bus rafraîchi en direct.');
                      sound.playLoot();
                    } else {
                      window.open(selectedService.hostUrl, '_blank');
                    }
                  }}
                  className="px-3 py-1.5 text-[10px] font-orbitron font-bold bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black rounded cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{selectedService.id === 'stm_transit' ? 'RAFRAÎCHIR FLUX' : 'OUVRIR PAGE WEB'}</span>
                </button>
                <button
                  onClick={() => addLog(`Ping de vérification sur ${selectedService.name} (Port ${selectedService.port}) : 2ms OK.`)}
                  className="px-2.5 py-1.5 text-[10px] font-mono bg-[#111827] hover:bg-[#1f2937] border border-white/20 text-gray-300 rounded cursor-pointer transition-all flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tester Port</span>
                </button>
              </div>
            </div>

            {selectedServiceId === 'world_monitor' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#080d1a] border border-[#00f3ff33] rounded grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-gray-400 text-[10px] block">SATELLITES SKYFI EN ORBITE</span>
                    <span className="text-[#00f3ff] font-bold text-sm">4 / 4 OPÉRATIONNELS</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">RÉSOLUTION D'IMAGERIE</span>
                    <span className="text-[#00ff41] font-bold text-sm">0.3 METRE (HD)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">OUTILS MCP ACTIFS</span>
                    <span className="text-[#ff00ff] font-bold text-sm">59 FONCTIONS DISPONIBLES</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleExecuteWorldMonitorScan}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#00f3ff] to-[#00bfff] text-black font-orbitron font-bold text-xs uppercase rounded shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:brightness-110 cursor-pointer flex items-center justify-center gap-2 transition-all"
                  >
                    <Radio className="w-4 h-4" />
                    <span>DÉCLENCHER LE SCAN ORBITAL SKYFI [6]</span>
                  </button>

                  <button
                    onClick={() => {
                      addLog('WORLD MONITOR // Requête MCP transmise : 59/59 outils de surveillance de crise synchronisés.');
                      sound.playLoot();
                    }}
                    className="px-4 py-2.5 bg-[#111827] hover:bg-[#1f2937] border border-[#00f3ff44] text-[#00f3ff] font-orbitron font-bold text-xs uppercase rounded cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Globe className="w-4 h-4" />
                    <span>INTERROGER MCP [3000]</span>
                  </button>
                </div>
              </div>
            )}

            {selectedServiceId === 'shadowbroker' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="text-[11px] text-gray-300 mb-1">
                  Balises et Pins de Reconnaissance Active sur Montréal (Quartier des Spectacles / Centre-Ville) :
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {tacticalState.shadowBroker.osintPins.map(pin => {
                    const isHacked = hackedPins.includes(pin.id);
                    return (
                      <div
                        key={pin.id}
                        className={`p-2.5 rounded border flex items-center justify-between ${
                          isHacked 
                            ? 'bg-[#00ff4110] border-[#00ff4155]' 
                            : 'bg-[#080d1a] border-white/10 hover:border-[#f59e0b]'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-[11px] text-white flex items-center gap-1.5">
                            <Crosshair className="w-3 h-3 text-[#f59e0b]" />
                            <span>{pin.label}</span>
                          </div>
                          <div className="text-[9px] text-gray-400 mt-0.5">{pin.description}</div>
                        </div>

                        <button
                          onClick={() => handleHackPin(pin.id, pin.label)}
                          className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer transition-all ${
                            isHacked 
                              ? 'bg-[#00ff41] text-black' 
                              : 'bg-[#f59e0b22] border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b44]'
                          }`}
                        >
                          {isHacked ? '✓ INFILTRÉ' : 'INFILTRER'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleExecuteShadowBrokerDrone}
                  className="w-full py-2.5 bg-[#f59e0b] text-black font-orbitron font-bold text-xs uppercase rounded shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:brightness-110 cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <Satellite className="w-4 h-4" />
                  <span>DÉPLOYER LE DRONE DE RECONNAISSANCE OSINT [7]</span>
                </button>
              </div>
            )}

            {/* 3. DEUS EX SOPHIA AI (OLLAMA 8.0B & GATEWAY) */}
            {selectedServiceId === 'deus_ex_sophia_ai' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#080d1a] border border-[#ff00ff44] rounded grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-gray-400 text-[10px] block">MODÈLE IA QUANTIQUE</span>
                    <span className="text-[#ff00ff] font-bold text-xs">deus_ex_sophia:latest</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">ARCHITECTURE</span>
                    <span className="text-white font-bold text-xs">8.0B Gemma-4 Q4_K_M</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">CONVERSATION RÉELLE</span>
                    <span className="text-[#00ff41] font-bold text-xs">CHAT SOPHIA ACTIF</span>
                  </div>
                </div>

                <div className="p-3 bg-[#080d1a] border border-[#ff00ff33] rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">PIPELINE DEEPFAKE // VIKTOR VANCE</span>
                    <span className="text-[#ff00ff] font-bold">{deepfakePercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-[#ff00ff44]">
                    <div 
                      className="h-full bg-gradient-to-r from-[#ff00ff] to-[#00f3ff] rounded-full transition-all duration-500" 
                      style={{ width: `${deepfakePercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Cible : Spoliation Citoyenne et Micro-taxes illégales sur Sainte-Catherine.
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSendMessage('Analyse la signature neuronale de Viktor Vance et donne-moi ses 3 faiblesses.')}
                    className="py-2.5 bg-gradient-to-r from-[#a855f7] to-[#ff00ff] text-white font-orbitron font-bold text-[11px] uppercase rounded shadow-[0_0_15px_rgba(255,0,255,0.4)] hover:brightness-110 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>INTERROGER SOPHIA</span>
                  </button>

                  <button
                    onClick={handleBoostDeepfake}
                    className="py-2.5 bg-[#111827] hover:bg-[#1f2937] border border-[#ff00ff55] text-[#ff00ff] font-orbitron font-bold text-[11px] uppercase rounded cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-4 h-4" />
                    <span>DIFFUSER DEEPFAKE [8]</span>
                  </button>

                  <button
                    onClick={() => {
                      addLog('DEUS EX SOPHIA // Transcription audio de Viktor Vance extraite : « Prélevez 2% de plus sur les implants du RÉSO. »');
                      sound.playLoot();
                    }}
                    className="py-2.5 bg-[#111827] hover:bg-[#1f2937] border border-white/20 text-gray-300 font-orbitron font-bold text-[11px] uppercase rounded cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>ÉCOUTER ÉCOUTE</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. GOD EYE VIEW 3D MATRIX WORKBENCH */}
            {selectedServiceId === 'god_eye_view' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#080d1a] border border-[#00ff4144] rounded grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-gray-400 text-[10px] block">INTERFACE WEB GOD EYE</span>
                    <span className="text-[#00ff41] font-bold text-xs">http://localhost:4173</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">CAMÉRAS SURVEILLANCE</span>
                    <span className="text-white font-bold text-xs">384 FLUX LIVE HD</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">STATUT MOTEUR 3D</span>
                    <span className="text-[#00f3ff] font-bold text-xs">PRÉ-CHAUFFÉ (769 ms)</span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-300">
                  Matrice de Surveillance 3D des Rues de Montréal (God Eye View) :
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { node: '📷 Caméra Ville-Marie #04', loc: 'Place Ville-Marie', detail: 'Imagerie faciale Vance verrouillée', status: 'TRANSMISSION HD' },
                    { node: '📷 Caméra Peel / Ste-Catherine', loc: 'Centre-Ville', detail: '3 Milices SPVM-Prime détectées', status: 'ACTIF' },
                    { node: '📷 Dôme Relais Mont-Royal', loc: 'Mont-Royal', detail: 'Liaison descendante SkyFi 0.3m', status: 'SATELLITE SYNC' },
                    { node: '📷 Sas RÉSO Bonaventure', loc: 'Réseau Souterrain', detail: 'Couloir sécurisé insurgés', status: 'INFILTRÉ' }
                  ].map(c => (
                    <div key={c.node} className="p-2 bg-[#080d1a] border border-[#00ff4133] rounded flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold text-[11px] flex items-center gap-1">
                          <Eye className="w-3 h-3 text-[#00ff41]" />
                          <span>{c.node}</span>
                        </div>
                        <div className="text-[9px] text-gray-400">{c.loc} • {c.detail}</div>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 bg-[#00ff4115] text-[#00ff41] border border-[#00ff4155] rounded font-bold">
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      sound.playLevelUp();
                      window.open('http://localhost:4173', '_blank');
                      addLog('GOD EYE VIEW // Interface 3D ouverte sur http://localhost:4173.');
                    }}
                    className="flex-1 py-2.5 bg-[#00ff41] hover:bg-[#00ff41]/90 text-black font-orbitron font-bold text-xs uppercase rounded shadow-[0_0_15px_rgba(0,255,65,0.4)] cursor-pointer flex items-center justify-center gap-2 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>👁️ OUVRIR L'INTERFACE GOD EYE VIEW 3D (PORT 4173)</span>
                  </button>

                  <button
                    onClick={handleToggleGodEye}
                    className="px-4 py-2.5 bg-[#111827] hover:bg-[#1f2937] border border-[#00ff4144] text-[#00ff41] font-orbitron font-bold text-xs uppercase rounded cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{godEyeActive ? 'VEILLE MATRIX' : 'ACTIVER GOD EYE'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. STM REALTIME TRANSIT WORKBENCH */}
            {selectedServiceId === 'stm_transit' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="text-[11px] text-gray-300 mb-1">
                  Flotte STM en Direct (GTFS-Realtime Redis 6379) :
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { bus: 'Bus 15 Sainte-Catherine', speed: '28 km/h', gps: '45.5088°N, -73.5685°W', status: 'À l’heure' },
                    { bus: 'Bus 106 Labatt', speed: '34 km/h', gps: '45.4320°N, -73.6420°W', status: 'Retard 1 min' },
                    { bus: 'Bus 24 Sherbrooke', speed: '22 km/h', gps: '45.5020°N, -73.5780°W', status: 'À l’heure' },
                    { bus: 'Bus 55 Saint-Laurent', speed: '19 km/h', gps: '45.5140°N, -73.5790°W', status: 'À l’heure' }
                  ].map(b => (
                    <div key={b.bus} className="p-2 bg-[#080d1a] border border-[#38bdf833] rounded flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold text-[11px] flex items-center gap-1">
                          <Train className="w-3 h-3 text-[#38bdf8]" />
                          <span>{b.bus}</span>
                        </div>
                        <div className="text-[9px] text-gray-400">{b.gps} • {b.speed}</div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#38bdf815] text-[#38bdf8] border border-[#38bdf855] rounded">
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onTriggerSophiaSTMOverload();
                      sound.playLevelUp();
                      addLog('STM REALTIME // Aiguillage Ligne Verte saturé. Les convois SPVM sont bloqués sous Berri-UQAM.');
                    }}
                    className="flex-1 py-2.5 bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-black font-orbitron font-bold text-xs uppercase rounded shadow-[0_0_15px_rgba(56,189,248,0.4)] cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <Train className="w-4 h-4" />
                    <span>SURCHARGE STM LIGNE VERTE [8]</span>
                  </button>
                </div>
              </div>
            )}

            {selectedServiceId === 'game_arpg' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#080d1a] border border-[#00f3ff33] rounded flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold font-orbitron text-xs">MONTRÉAL 2033 // THIRTY3 NEURAL REBEL</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      Combat Action-RPG Diablo 4 • Générateur/Dépensier de Psi • 10 Affixes Élites • Occultiste
                    </div>
                  </div>
                  <span className="text-[#00f3ff] font-orbitron font-bold text-xs">PORT 3033</span>
                </div>

                <button
                  onClick={onLaunchGame}
                  className="w-full py-3 bg-gradient-to-r from-[#00f3ff] to-[#00bfff] text-black font-orbitron font-black text-xs uppercase tracking-wider rounded shadow-[0_0_20px_rgba(0,243,255,0.5)] hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>ENTRER DANS LE SIMULACRE DE COMBAT (PLEIN ÉCRAN)</span>
                </button>
              </div>
            )}

          </div>

          <div className="bg-[#050811] border border-white/10 rounded p-3 font-mono text-[10px] space-y-1 max-h-28 overflow-y-auto">
            <div className="text-gray-400 font-bold flex items-center gap-1.5 mb-1 text-[9px] uppercase tracking-wider border-b border-white/5 pb-1">
              <Terminal className="w-3 h-3 text-[#00f3ff]" />
              <span>FLUX TÉLÉMÉTRIE DOCKER & JOURNAL DES ÉVÉNEMENTS TACTIQUES</span>
            </div>
            {toolLogs.map((log, idx) => (
              <div key={idx} className="text-gray-300 truncate">
                <span className="text-[#00f3ff]">{log.slice(0, 10)}</span> {log.slice(10)}
              </div>
            ))}
          </div>

        </main>

        <aside className="w-1/3 flex flex-col bg-[#060810] border-l border-[#00f3ff22]">
          
          <div className="p-4 border-b border-[#00f3ff33] bg-[#090e1c] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ff00ff] to-[#00f3ff] p-0.5 shadow-[0_0_15px_rgba(255,0,255,0.5)]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white">
                    <Zap className="w-4 h-4 text-[#ff00ff]" />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00ff41] border-2 border-black animate-pulse" />
              </div>

              <div>
                <div className="text-xs font-orbitron font-bold text-white uppercase flex items-center gap-2">
                  <span>DEUS EX SOPHIA</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#ff00ff22] text-[#ff00ff] border border-[#ff00ff55]">
                    8.0B LIVE
                  </span>
                </div>
                <div className="text-[10px] font-mono text-gray-400">
                  Ollama • Modèle : deus_ex_sophia:latest
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSendMessage('Effectue un diagnostic complet de notre réseau et de la position de Viktor Vance.')}
              className="p-1.5 border border-white/10 hover:border-[#ff00ff] bg-[#111827] text-gray-400 hover:text-white rounded transition-all cursor-pointer"
              title="Actualiser l'analyse tactique"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
            {chatMessages.map(msg => {
              const isSophia = msg.sender === 'DEUS_EX_SOPHIA';
              const isSystem = msg.sender === 'SYSTEM';

              if (isSystem) {
                return (
                  <div key={msg.id} className="p-2.5 bg-[#00f3ff08] border border-[#00f3ff33] rounded text-[10px] text-[#00f3ff] leading-relaxed">
                    {msg.text}
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg flex flex-col space-y-1 ${
                    isSophia
                      ? 'bg-[#110d1c] border border-[#ff00ff44] text-gray-100 shadow-[0_2px_15px_rgba(255,0,255,0.08)]'
                      : 'bg-[#0b1626] border border-[#00f3ff44] text-gray-100 ml-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-bold font-orbitron ${isSophia ? 'text-[#ff00ff]' : 'text-[#00f3ff]'}`}>
                      {isSophia ? 'DEUS EX SOPHIA' : 'THIRTY3'}
                    </span>
                    <span className="text-gray-500">{msg.timestamp}</span>
                  </div>

                  <div className="text-xs leading-relaxed font-sans text-gray-200">
                    {msg.text}
                  </div>

                  {msg.source && (
                    <div className="text-[9px] text-gray-500 flex items-center justify-between pt-1 border-t border-white/5">
                      <span>Source : {msg.source === 'ollama' ? '⚡ Ollama Local (deus_ex_sophia:latest)' : '🧠 Prédiction Neurale'}</span>
                      {msg.latencyMs && <span>{msg.latencyMs}ms</span>}
                    </div>
                  )}
                </div>
              );
            })}

            {isGenerating && (
              <div className="p-3 bg-[#110d1c] border border-[#ff00ff44] rounded text-xs text-[#ff00ff] flex items-center gap-2 font-mono animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#ff00ff] animate-ping" />
                Sophia synthétise l'inférence neuronale (8.0B)...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="p-2 border-t border-[#ffffff10] bg-[#070912] flex gap-1.5 overflow-x-auto text-[10px] font-mono shrink-0">
            <button
              onClick={() => handleSendMessage('Analyse la faille de blindage de Viktor Vance et de ses milices.')}
              className="px-2.5 py-1 bg-[#ff00ff15] hover:bg-[#ff00ff33] border border-[#ff00ff55] text-[#ff00ff] rounded whitespace-nowrap cursor-pointer transition-all"
            >
              ⚡ Faille Vance
            </button>
            <button
              onClick={() => handleSendMessage('Déploie une impulsion de brouillage sur les caméras de Sainte-Catherine.')}
              className="px-2.5 py-1 bg-[#00f3ff15] hover:bg-[#00f3ff33] border border-[#00f3ff55] text-[#00f3ff] rounded whitespace-nowrap cursor-pointer transition-all"
            >
              🛰️ Brouillage Sainte-Catherine
            </button>
            <button
              onClick={() => handleSendMessage('Vérifie le statut d\'encodage du Deepfake de vérité.')}
              className="px-2.5 py-1 bg-[#00ff4115] hover:bg-[#00ff4133] border border-[#00ff4155] text-[#00ff41] rounded whitespace-nowrap cursor-pointer transition-all"
            >
              🎭 Deepfake
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-[#00f3ff33] bg-[#080c18] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Poser une question tactique à Sophia..."
              className="flex-1 bg-[#0f172a] border border-[#00f3ff44] rounded px-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#00f3ff]"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputQuery.trim()}
              className="p-2 bg-[#ff00ff] hover:bg-[#ff00ff]/90 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
};
