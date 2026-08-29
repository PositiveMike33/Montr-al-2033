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
  Train
} from 'lucide-react';
import { TacticalBridgeState, querySophiaInference } from '../utils/cyberToolsBridge';

export interface DockerServiceInfo {
  id: string;
  name: string;
  category: 'GAME' | 'MCP' | 'OSINT' | 'GATEWAY' | 'AI_MODEL' | 'TRANSIT';
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
    name: '🎮 Montréal 2033 (Jeu ARPG & Cyber-Deck)',
    category: 'GAME',
    port: 3033,
    hostUrl: 'http://localhost:3033',
    status: 'ONLINE',
    description: 'Application web principale Nginx Alpine (Thématique 2033). Action-RPG isométrique avec système de combat inspiré de Diablo 4, simulation réelle des rues de Montréal et Cyber-Deck.',
    role: 'Simulacre de Combat & Interface Tactique de Thirty3',
    badgeColor: '#00f3ff',
    icon: Gamepad2
  },
  {
    id: 'world_monitor',
    name: '🌐 World Monitor',
    category: 'MCP',
    port: 3000,
    hostUrl: 'http://localhost:3000/api/mcp',
    status: 'ONLINE',
    description: 'Serveur MCP 59 outils & surveillance de crise globale. Imagerie satellitaire haute résolution SkyFi / Sentinel (0.3m) et détection des anomalies sur les chokepoints urbains.',
    role: 'Renseignement Géostratégique & Télémétrie Satellitaire',
    badgeColor: '#00f3ff',
    icon: Globe
  },
  {
    id: 'shadowbroker',
    name: '🛰️ ShadowBroker & OpenClaw OSINT',
    category: 'OSINT',
    port: 8001,
    hostUrl: 'http://127.0.0.1:8001',
    status: 'ONLINE',
    description: 'Backend de reconnaissance géospatiale et injection de calques cartographiques. Détection des pins de surveillance SPVM-Prime et brouillage des radars ennemis.',
    role: 'Cartographie OSINT & Drones Infiltrateurs de Montréal',
    badgeColor: '#f59e0b',
    icon: Satellite
  },
  {
    id: 'sophia_gateway',
    name: '🧠 Deus Ex Sophia AI Gateway',
    category: 'GATEWAY',
    port: 8000,
    hostUrl: 'http://127.0.0.1:8000',
    status: 'ONLINE',
    description: 'Passerelle d\'inférence hybride locale connectée au moteur quantique. Orchestration du pipeline de génération des Deepfakes de vérité contre Viktor Vance.',
    role: 'Passerelle Neuronale & Pipeline de Vérité',
    badgeColor: '#ff00ff',
    icon: Zap
  },
  {
    id: 'ollama_sophia',
    name: '⚡ Ollama (deus_ex_sophia:latest)',
    category: 'AI_MODEL',
    port: 11434,
    hostUrl: 'http://localhost:11434',
    status: 'ONLINE',
    description: 'Moteur d\'inférence 8.0B Gemma-4 Uncensored (Q4_K_M, contexte 131k). IA compagne tactique de Thirty3 capable de raisonnement stratégique et génération temps réel.',
    role: 'Cerveau Quantique & Moteur d\'Inférence 8.0B Local',
    badgeColor: '#a855f7',
    icon: Cpu
  },
  {
    id: 'stm_redis_godeye',
    name: '🚇 STM Realtime Redis & God Eye',
    category: 'TRANSIT',
    port: 6379,
    hostUrl: 'http://127.0.0.1:6379',
    status: 'ONLINE',
    description: 'Données GTFS-Realtime du transit de Montréal (142 bus géolocalisés, lignes de métro Verte & Orange) et activation de la vision omnisciente God Eye sur la ville.',
    role: 'Surveillance Temps Réel du Transit & Matrice God Eye',
    badgeColor: '#00ff41',
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
  const [selectedServiceId, setSelectedServiceId] = useState<string>('game_arpg');
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedService = DOCKER_SERVICES.find(s => s.id === selectedServiceId) || DOCKER_SERVICES[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isGenerating]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isGenerating) return;

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

  const handleToggleGodEye = () => {
    setGodEyeActive(v => !v);
    const logText = !godEyeActive
      ? `[${new Date().toLocaleTimeString()}] PROTOCOLE GOD EYE ACTIVÉ // Triangulation satellite SkyFi + STM GTFS-Realtime (142 bus) déployée sur Montréal.`
      : `[${new Date().toLocaleTimeString()}] PROTOCOLE GOD EYE EN VEILLE // Flux standard rétabli.`;
    
    setChatMessages(prev => [
      ...prev,
      {
        id: 'godeye_' + Date.now(),
        sender: 'SYSTEM',
        text: logText,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#05060a] text-gray-200 overflow-hidden font-sans select-none">
      
      {/* ── TOP MASTER NAVIGATION BAR ── */}
      <header className="h-14 border-b border-[#00f3ff33] bg-[#090d16]/95 px-6 flex items-center justify-between shrink-0 z-30 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        
        {/* Title & Brand */}
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

        {/* Action Buttons & Navigation */}
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

      {/* ── MAIN SPLIT VIEW (66% SERVICES DOCKER / 33% DEUS EX SOPHIA CHAT) ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ════════════════════════════════════════════════════════════════════
            LEFT PANE (66% WIDTH) — DOCKER SERVICES DIRECTORY & CONTROL DECK
           ════════════════════════════════════════════════════════════════════ */}
        <main className="w-2/3 border-r border-[#00f3ff22] flex flex-col bg-[#070a12] p-5 overflow-y-auto space-y-5">
          
          {/* Header Stats Bar */}
          <div className="grid grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-[#0b101d] border border-[#00f3ff33] p-3 rounded flex items-center justify-between">
              <div className="text-gray-400 text-[10px]">RÉSEAU DOCKER</div>
              <div className="text-[#00ff41] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-ping" />
                6 / 6 ACTIFS
              </div>
            </div>

            <div className="bg-[#0b101d] border border-[#00f3ff33] p-3 rounded flex items-center justify-between">
              <div className="text-gray-400 text-[10px]">CIBLE PRINCIPALE</div>
              <div className="text-[#ff0055] font-bold">VIKTOR VANCE</div>
            </div>

            <div className="bg-[#0b101d] border border-[#00f3ff33] p-3 rounded flex items-center justify-between">
              <div className="text-gray-400 text-[10px]">TRANSIT STM</div>
              <div className="text-[#00f3ff] font-bold">142 BUS LIVE</div>
            </div>

            <div className="bg-[#0b101d] border border-[#00f3ff33] p-3 rounded flex items-center justify-between">
              <div className="text-gray-400 text-[10px]">MATRICE GOD EYE</div>
              <button 
                onClick={handleToggleGodEye}
                className={`text-xs font-bold px-2 py-0.5 border cursor-pointer transition-all ${godEyeActive ? 'bg-[#00ff41] text-black border-[#00ff41]' : 'bg-transparent text-gray-400 border-gray-600'}`}
              >
                {godEyeActive ? '👁️ GOD EYE ON' : 'VEILLE'}
              </button>
            </div>
          </div>

          {/* 6 Docker Services Grid */}
          <div className="space-y-3">
            <div className="text-xs font-orbitron font-bold text-[#00f3ff] uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-[#00f3ff]" />
              <span>SERVICES & OUTILS DOCKER INTERCONNECTÉS</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {DOCKER_SERVICES.map(srv => {
                const Icon = srv.icon;
                const isSelected = srv.id === selectedServiceId;

                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-4 rounded border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0f172a] border-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.2)]'
                        : 'bg-[#0a0e1a] border-[#ffffff15] hover:border-gray-500 hover:bg-[#0d1322]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" style={{ color: srv.badgeColor }} />
                          <span className="text-xs font-orbitron font-bold text-white">
                            {srv.name}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-mono bg-[#00ff4115] border border-[#00ff4155] text-[#00ff41] font-bold">
                          PORT {srv.port}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed mb-3">
                        {srv.description}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono">
                      <span className="text-gray-400">{srv.role}</span>
                      <a
                        href={srv.hostUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-[#00f3ff] hover:underline flex items-center gap-1"
                      >
                        <span>Ouvrir</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Service Detailed Control Panel */}
          <div className="bg-[#0b101f] border border-[#00f3ff44] p-4 rounded shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#00f3ff15] border border-[#00f3ff] text-[#00f3ff]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-orbitron font-bold text-white uppercase">
                    PANNEAU DE CONTRÔLE LIVE // {selectedService.name}
                  </div>
                  <div className="text-[10px] font-mono text-[#00f3ff]">
                    URL HÔTE : <span className="text-white">{selectedService.hostUrl}</span> • STATUT : <span className="text-[#00ff41]">EN LIGNE</span>
                  </div>
                </div>
              </div>

              {selectedService.id === 'game_arpg' && (
                <button
                  onClick={onLaunchGame}
                  className="px-3 py-1.5 bg-[#00f3ff] text-black font-orbitron font-bold text-xs uppercase rounded cursor-pointer hover:bg-[#00f3ff]/90 transition-all flex items-center gap-1.5"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>JOUER MAINTENANT</span>
                </button>
              )}
            </div>

            {/* Tactical Actions Bar for Quick Triggering */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                onClick={onTriggerOrbitalScan}
                disabled={!tacticalState.worldMonitor.orbitalScanReady}
                className={`py-2 px-3 rounded font-orbitron text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  tacticalState.worldMonitor.orbitalScanReady
                    ? 'bg-[#00f3ff22] border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff44]'
                    : 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>1. SCAN ORBITAL [6]</span>
              </button>

              <button
                onClick={onTriggerShadowBrokerDrone}
                disabled={!tacticalState.shadowBroker.reconDroneReady}
                className={`py-2 px-3 rounded font-orbitron text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  tacticalState.shadowBroker.reconDroneReady
                    ? 'bg-[#f59e0b22] border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b44]'
                    : 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Satellite className="w-3.5 h-3.5" />
                <span>2. DRONE OSINT [7]</span>
              </button>

              <button
                onClick={onTriggerSophiaSTMOverload}
                disabled={!tacticalState.sophiaSTM.matrixOverloadReady}
                className={`py-2 px-3 rounded font-orbitron text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  tacticalState.sophiaSTM.matrixOverloadReady
                    ? 'bg-[#ff00ff22] border border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff44]'
                    : 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>3. DEEPFAKE & STM [8]</span>
              </button>
            </div>
          </div>
        </main>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT PANE (33% WIDTH) — LIVE DEUS EX SOPHIA AI CHAT INTERFACE
           ════════════════════════════════════════════════════════════════════ */}
        <aside className="w-1/3 flex flex-col bg-[#060810] border-l border-[#00f3ff22]">
          
          {/* Chat Header */}
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

          {/* Chat Messages Log */}
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

          {/* Quick Tactical Prompt Chips */}
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

          {/* Message Input Box */}
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
