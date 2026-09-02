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
  Sparkles,
  Volume2,
  VolumeX,
  Search,
  Bot,
  UserCheck,
  LogIn,
  LogOut,
  Maximize2,
  Coins,
  Swords,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { TacticalBridgeState, querySophiaInference, prewarmSophiaInference, executeWorldMonitorMCP, SophiaInferenceResult } from '../utils/cyberToolsBridge';
import { getSTMBusLiveReport, STMBusStatusReport } from '../services/stmService';
import { sound } from '../utils/audio';
import { ServiceDetailModal } from './ServiceDetailModal';
import { MontrealTacticalMap } from './MontrealTacticalMap';
import { PlanetaryGlobe3D } from './PlanetaryGlobe3D';
import { HackerArsenalModal } from './HackerArsenalModal';
import { 
  BitcoinWalletState, 
  INITIAL_BITCOIN_WALLET, 
  WorldMonitorHack, 
  HackerGadgetItem,
  formatSatoshis 
} from '../utils/hackerArsenalData';

export interface DockerServiceInfo {
  id: 'game_arpg' | 'cyber_arpg' | 'world_monitor' | 'shadowbroker' | 'deus_ex_sophia_ai' | 'god_eye_view' | 'stm_transit' | 'maxintel_academy';
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
    id: 'maxintel_academy',
    title: '🕵️ MaxIntel OSINT',
    name: '🕵️ MaxIntel OSINT Framework & Academy (MaxIntel.org)',
    category: 'OSINT',
    port: 3000,
    hostUrl: 'https://maxintel.org/',
    status: 'ONLINE',
    description: 'Enquêtes en sources ouvertes & investigations forensiques sur les personnages clés de Montréal 2033 (Viktor Vance, Thirty3, Drouin, ARES-9, SPVM-Prime).',
    role: 'Académie OSINT, Dorking, Chronolocalisation GEOINT & SOCMINT',
    badgeColor: '#00ff41',
    icon: Search
  },
  {
    id: 'world_monitor',
    title: '🌐 World Monitor',
    name: '🌐 World Monitor (Cloud MCP 59 Outils)',
    category: 'MCP',
    port: 3000,
    hostUrl: '/api/worldmonitor/telemetry',
    status: 'ONLINE',
    description: 'Surveillance géopolitique et 59 outils MCP connectés au Cloud. Imagerie satellitaire SkyFi / Sentinel (0.3m) et détection des chokepoints mondiaux.',
    role: 'Renseignement Géostratégique & Télémétrie Satellitaire Cloud',
    badgeColor: '#00f3ff',
    icon: Globe
  },
  {
    id: 'shadowbroker',
    title: '🛰️ ShadowBroker',
    name: '🛰️ ShadowBroker & OpenClaw OSINT',
    category: 'OSINT',
    port: 3000,
    hostUrl: '/api/shadowbroker/recon',
    status: 'ONLINE',
    description: 'Reconnaissance géospatiale OSINT sur Montréal. Détection des patrouilles SPVM-Prime, balises de surveillance et drones d\'interception.',
    role: 'Cartographie OSINT & Drones Infiltrateurs Cloud',
    badgeColor: '#f59e0b',
    icon: Satellite
  },
  {
    id: 'stm_transit',
    title: '🚇 STM Realtime',
    name: '🚇 STM Realtime Cloud & Transit',
    category: 'TRANSIT',
    port: 3000,
    hostUrl: '/api/stm/vehicles',
    status: 'ONLINE',
    description: 'Télémétrie GTFS-Realtime en direct via Cloud API. Suivi temps réel des bus, calcul d\'avance/retard et surcharge tactique du réseau métro.',
    role: 'Télémétrie des Bus en Direct & Surcharge du Réseau Cloud',
    badgeColor: '#38bdf8',
    icon: Train
  },
  {
    id: 'god_eye_view',
    title: '👁️ God Eye View 3D',
    name: '👁️ God Eye View 3D Matrix (Port 4173)',
    category: '3D_MATRIX',
    port: 4173,
    hostUrl: 'http://localhost:4173/#v=2&lat=45.5017&lon=-73.5673&alt=450&heading=15&pitch=-30&roll=360&style=normal&bloom=0&sharpen=0&bi=0&bv=2&si=49&hud=tactical&hv=1&dm=DENSE&dd=75&da=elastic&kf=7&ko=1&cr=0&sc=1&scf=11&map=osm&l=e.x&lo=f.e.1_f.m.a&ui=c.c.1_c.p.0_l.c.1_l.p.0_d.c.0_v.c.0_r.c.1_s.c.0_g.c.0_p.c.0_m.c.0',
    status: 'ONLINE',
    description: 'Matrice 3D omnisciente et moteur tactique haute altitude. Flux vidéo HD de 384 caméras urbaines, triangulation biométrique et surveillance du RÉSO.',
    role: 'Surveillance 3D Omnisciente & Caméras Biométriques',
    badgeColor: '#00ff41',
    icon: Eye
  },
  {
    id: 'deus_ex_sophia_ai',
    title: '🧠 Deus Ex Sophia',
    name: '🧠 Deus Ex Sophia (Gemini 3.7 Flash Cloud)',
    category: 'AI_CORE',
    port: 3000,
    hostUrl: '/api/sophia/chat',
    status: 'ONLINE',
    description: 'Intelligence Artificielle Quantique propulsée par Gemini 3.7 Flash. Raisonnement haute densité, accès direct aux 59 outils MCP et API STM en direct.',
    role: 'Cerveau Quantique & Moteur d\'Inférence IA Cloud',
    badgeColor: '#ff00ff',
    icon: Zap
  },
  {
    id: 'cyber_arpg',
    title: '🎮 ARPG Montréal 2033',
    name: '🎮 Moteur ARPG Hack & Smash 60FPS Montréal 2033',
    category: 'GAME',
    port: 3000,
    hostUrl: '#arpg',
    status: 'ONLINE',
    description: 'Moteur Hack & Smash Canvas 60FPS, loot procédural à 4 raretés, arbre neural hybride et 4 bastions urbains (Tiers 1-10).',
    role: 'Moteur de Combat Procédural & Évolution Neurale',
    badgeColor: '#00f0ff',
    icon: Gamepad2
  },
  {
    id: 'game_arpg',
    title: '⚔️ Incursion Combat FF7',
    name: '⚔️ Incursion Combat ARPG (Protocole FF7)',
    category: 'GAME',
    port: 3000,
    hostUrl: '#game',
    status: 'STANDBY',
    description: 'Simulacre Action-RPG cyberpunk. Démarrage sécurisé sous validation préalable (Demande de combat Final Fantasy VII).',
    role: 'Simulacre de Combat & Interface Tactique de Thirty3',
    badgeColor: '#ff0055',
    icon: Gamepad2
  }
];

interface CommandCenterHubProps {
  onLaunchGame: () => void;
  onOpenSettings: () => void;
  onOpenSkills?: () => void;
  onOpenTacticalDeck?: () => void;
  onOpenInventory?: () => void;
  onOpenCodex?: () => void;
  onOpenFullApp?: (toolId: string) => void;
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
  source?: 'gemini_ollama' | 'ollama' | 'gemini' | 'simulation' | 'quota_protection' | 'gemini_cache';
  latencyMs?: number;
  modelName?: string;
  geminiDirective?: string;
  flashAttentionUsed?: boolean;
  temperatureUsed?: number;
  tokensSavedPercent?: number;
}

export const CommandCenterHub: React.FC<CommandCenterHubProps> = ({
  onLaunchGame,
  onOpenSettings,
  onOpenSkills,
  onOpenTacticalDeck,
  onOpenInventory,
  onOpenCodex,
  onOpenFullApp,
  tacticalState,
  onTriggerOrbitalScan,
  onTriggerShadowBrokerDrone,
  onTriggerSophiaSTMOverload
}) => {
  const { user, idToken, signInWithGoogle, signOutUser } = useAuth();
  const isMasterUser = user?.email?.toLowerCase() === 'mikegauthierguillet@gmail.com';
  const [guestQuota, setGuestQuota] = useState<number>(5);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [selectedServiceId, setSelectedServiceId] = useState<DockerServiceInfo['id']>('world_monitor');
  const [selectedModelMode, setSelectedModelMode] = useState<string>('hybrid_mesh');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('mtl2033_sophia_chat_memory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(-10);
      }
    } catch {}
    return [
      {
        id: 'msg_1',
        sender: 'SYSTEM',
        text: 'CONNEXION SÉCURISÉE ÉTABLIE // CORTEX GEMINI 3.7 FLASH + OLLAMA MESH (OLLAMA_FLASH_ATTENTION, TEMP 0.2) SYNCHRONISÉS.',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 'msg_2',
        sender: 'DEUS_EX_SOPHIA',
        text: '« Michael, mon cortex quantique supérieur (Gemini 3.7) et mes modèles Ollama locaux en Flash Attention (0.2) sont connectés. Pose-moi une tâche complexe ou une question directe, je la traite avec le minimum de ressources et une exactitude absolue. »',
        timestamp: new Date().toLocaleTimeString(),
        source: 'gemini_ollama',
        flashAttentionUsed: true,
        temperatureUsed: 0.2,
        tokensSavedPercent: 82,
        modelName: 'gemini-3.7-flash + ollama_mesh'
      }
    ];
  });
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [godEyeActive, setGodEyeActive] = useState<boolean>(false);
  const [godEyeViewerMode, setGodEyeViewerMode] = useState<'matrix' | 'globe'>('matrix');
  const [toolLogs, setToolLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Pipeline IA Dual-Tier : Gemini 3.7 Flash -> Ollama Flash Attention (Temp 0.2) opérationnel.`,
    `[${new Date().toLocaleTimeString()}] World Monitor MCP connecté sur port 3000. 4 satellites SkyFi verrouillés.`,
    `[${new Date().toLocaleTimeString()}] ShadowBroker OSINT initialisé sur port 3001. 4 balises tactiques actives.`,
    `[${new Date().toLocaleTimeString()}] Deus Ex Sophia AI Gateway prête sur port 11434. Modèle 8.0B actif.`,
    `[${new Date().toLocaleTimeString()}] STM Redis temps réel connecté sur port 6379. 142 bus actifs.`
  ]);
  const [deepfakePercent, setDeepfakePercent] = useState<number>(88);
  const [hackedPins, setHackedPins] = useState<string[]>([]);
  const [stmSearchRoute, setStmSearchRoute] = useState<string>('136');
  const [stmLiveReport, setStmLiveReport] = useState<STMBusStatusReport | null>(null);
  const [isStmLoading, setIsStmLoading] = useState<boolean>(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [isArsenalModalOpen, setIsArsenalModalOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'services' | 'sophia'>('services');
  const [bitcoinWallet, setBitcoinWallet] = useState<BitcoinWalletState>(() => {
    try {
      const saved = localStorage.getItem('mtl2033_btc_wallet');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_BITCOIN_WALLET;
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('mtl2033_btc_wallet', JSON.stringify(bitcoinWallet));
    } catch {}
  }, [bitcoinWallet]);

  const selectedService = DOCKER_SERVICES.find(s => s.id === selectedServiceId) || DOCKER_SERVICES[0];

  useEffect(() => {
    sound.setMuted(isAudioMuted);
  }, [isAudioMuted]);

  const handleToggleMute = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    sound.setMuted(nextMuted);
    if (!nextMuted) {
      sound.playLoot();
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    try {
      localStorage.setItem('mtl2033_sophia_chat_memory', JSON.stringify(chatMessages.slice(-10)));
    } catch {}
  }, [chatMessages, isGenerating]);

  const addLog = (log: string) => {
    setToolLogs(prev => [`[${new Date().toLocaleTimeString()}] ${log}`, ...prev.slice(0, 19)]);
  };

  const handleSearchSTM = async (routeToSearch?: string) => {
    const route = (routeToSearch || stmSearchRoute || '136').replace(/\D/g, '');
    if (!route) return;
    setIsStmLoading(true);
    sound.playLoot();
    try {
      const report = await getSTMBusLiveReport(route);
      setStmLiveReport(report);
      addLog(`STM API // Ligne ${route} : ${report.activeCount} bus détectés. Statut : ${report.statusText}.`);
    } catch {
      addLog(`STM API // Erreur de requête sur la ligne ${route}.`);
    } finally {
      setIsStmLoading(false);
    }
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

    const lowerQuery = query.toLowerCase().trim();

    // 1. Interactive Command: /mcp -> Executes World Monitor MCP tools
    if (lowerQuery === '/mcp' || lowerQuery === '/tools' || lowerQuery === '/outils') {
      setSelectedServiceId('world_monitor');
      executeWorldMonitorMCP('get_daily_digest');
      const sophiaMsg: ChatMessage = {
        id: 'sophia_mcp_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: '« 59 outils MCP World Monitor opérationnels sur port 3000. Satellites SkyFi, flux maritimes AIS, alertes cyber et macro-indicateurs sous ton contrôle direct. »',
        timestamp: new Date().toLocaleTimeString(),
        source: 'ollama'
      };
      setChatMessages(prev => [...prev, sophiaMsg]);
      addLog('MCP WORLD MONITOR // 59 outils interrogés via JSON-RPC. Statut : ACTIF.');
      setIsGenerating(false);
      return;
    }

    // 2. Interactive Command: /scan or /sat -> Triggers SkyFi orbital satellite scan
    if (lowerQuery === '/scan' || lowerQuery === '/sat' || lowerQuery === '/satellite') {
      onTriggerOrbitalScan();
      setSelectedServiceId('world_monitor');
      const sophiaMsg: ChatMessage = {
        id: 'sophia_scan_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: '« Balayage satellite SkyFi 0.3m déclenché sur Montréal. Coordonnées thermiques et anomalies verrouillées. »',
        timestamp: new Date().toLocaleTimeString(),
        source: 'ollama'
      };
      setChatMessages(prev => [...prev, sophiaMsg]);
      addLog('WORLD MONITOR MCP // Balayage orbital SkyFi exécuté.');
      setIsGenerating(false);
      return;
    }

    // 3. Interactive Command: /drone or /osint -> Triggers ShadowBroker stealth drone
    if (lowerQuery === '/drone' || lowerQuery === '/osint' || lowerQuery === '/recon') {
      onTriggerShadowBrokerDrone();
      setSelectedServiceId('shadowbroker');
      const sophiaMsg: ChatMessage = {
        id: 'sophia_drone_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: '« Drone furtif ShadowBroker en vol sur Sainte-Catherine. Brouillage radar actif 8s. »',
        timestamp: new Date().toLocaleTimeString(),
        source: 'ollama'
      };
      setChatMessages(prev => [...prev, sophiaMsg]);
      addLog('SHADOWBROKER OSINT // Drone déployé avec succès.');
      setIsGenerating(false);
      return;
    }

    // 4. Interactive Command: /stm or /transit -> Triggers STM realtime search and subway overload
    if (lowerQuery.startsWith('/stm') || lowerQuery === '/transit' || lowerQuery === '/metro') {
      const busArgMatch = lowerQuery.match(/\/stm\s*(\d+)/i);
      const targetBus = busArgMatch ? busArgMatch[1] : stmSearchRoute || '136';
      setStmSearchRoute(targetBus);
      setSelectedServiceId('stm_transit');
      handleSearchSTM(targetBus);
      onTriggerSophiaSTMOverload();
      const sophiaMsg: ChatMessage = {
        id: 'sophia_stm_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: `« Télémétrie STM GTFS-Realtime ouverte pour la ligne ${targetBus}. Suivi des bus et calcul des retards en direct. »`,
        timestamp: new Date().toLocaleTimeString(),
        source: 'ollama'
      };
      setChatMessages(prev => [...prev, sophiaMsg]);
      addLog(`STM REALTIME // Consultation en direct de la Ligne ${targetBus}.`);
      setIsGenerating(false);
      return;
    }

    // 5. Interactive Command: /godeye -> Activates God Eye View 3D Matrix
    if (lowerQuery === '/godeye' || lowerQuery === '/3d' || lowerQuery === '/matrix') {
      setSelectedServiceId('god_eye_view');
      setGodEyeActive(true);
      const sophiaMsg: ChatMessage = {
        id: 'sophia_godeye_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: '« Matrice 3D God Eye View (Cesium WebGL) synchronisée sur port 4173. Cartographie omnisciente en ligne. »',
        timestamp: new Date().toLocaleTimeString(),
        source: 'ollama'
      };
      setChatMessages(prev => [...prev, sophiaMsg]);
      addLog('GOD EYE VIEW // Matrice 3D omnisciente activée.');
      setIsGenerating(false);
      return;
    }

    // 6. Interactive Command: /skill or /skills -> Opens Skills Modal
    if (lowerQuery === '/skill' || lowerQuery === '/skills' || lowerQuery === '/competence' || lowerQuery === '/competences' || lowerQuery === '/arbre') {
      const sophiaMsg: ChatMessage = {
        id: 'sophia_skill_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: '« Affichage de l’arbre des compétences synaptiques et des implants neuraux, Thirty3. Choisis tes améliorations de combat. »',
        timestamp: new Date().toLocaleTimeString(),
        source: 'ollama'
      };
      setChatMessages(prev => [...prev, sophiaMsg]);
      addLog('COMMANDE TACTIQUE // Ouverture de l’Arbre des Compétences via /skill.');
      setIsGenerating(false);
      onOpenSkills?.();
      return;
    }

    // 7. Interactive Command: /deck -> Opens Tactical Deck
    if (lowerQuery === '/deck' || lowerQuery === '/tactique' || lowerQuery === '/tactical') {
      const sophiaMsg: ChatMessage = {
        id: 'sophia_deck_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: '« Déploiement de l’interface du Cyber-Deck tactique et des leviers d’action sur Montréal. »',
        timestamp: new Date().toLocaleTimeString(),
        source: 'ollama'
      };
      setChatMessages(prev => [...prev, sophiaMsg]);
      addLog('COMMANDE TACTIQUE // Ouverture du Cyber-Deck via /deck.');
      setIsGenerating(false);
      onOpenTacticalDeck?.();
      return;
    }

    // 8. Interactive Command: /hack or /arsenal or /btc -> Opens Hacker Arsenal & 59 Hacks Modal
    if (lowerQuery === '/hack' || lowerQuery === '/hacks' || lowerQuery === '/arsenal' || lowerQuery === '/btc' || lowerQuery === '/bitcoin' || lowerQuery === '/flipper' || lowerQuery === '/hexstrike') {
      sound.play('equip');
      setIsArsenalModalOpen(true);
      const sophiaMsg: ChatMessage = {
        id: 'sophia_arsenal_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: '« Déploiement de l’Arsenal de Hacker Élite : 59 Hacks World Monitor, Gadgets Pentest (Flipper Zero, Hak5 WiFi Pineapple, HackRF One), Gants de combat rapproché et Armes Élite Open Source (HexStrike AI, IPGeoLocation, Sherlock). Tous tes butins en Bitcoin (BTC) y sont centralisés. »',
        timestamp: new Date().toLocaleTimeString(),
        source: 'ollama'
      };
      setChatMessages(prev => [...prev, sophiaMsg]);
      addLog('ARSENAL DE HACKER // Ouverture du terminal des 59 Hacks & Gadgets.');
      setIsGenerating(false);
      return;
    }

    // 9. Interactive Command: /inv -> Opens Inventory
    if (lowerQuery === '/inv' || lowerQuery === '/inventaire') {
      const sophiaMsg: ChatMessage = {
        id: 'sophia_inv_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: '« Accès à ton inventaire d’équipement et aux modules neuraux. »',
        timestamp: new Date().toLocaleTimeString(),
        source: 'ollama'
      };
      setChatMessages(prev => [...prev, sophiaMsg]);
      addLog('COMMANDE TACTIQUE // Ouverture de l’Inventaire via /inv.');
      setIsGenerating(false);
      onOpenInventory?.();
      return;
    }

    // 9. Interactive Command: /game -> Launches Game
    if (lowerQuery === '/game' || lowerQuery === '/jouer' || lowerQuery === '/combat') {
      const sophiaMsg: ChatMessage = {
        id: 'sophia_game_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: '« Initialisation du simulacre de combat plein écran dans les rues de Montréal. »',
        timestamp: new Date().toLocaleTimeString(),
        source: 'ollama'
      };
      setChatMessages(prev => [...prev, sophiaMsg]);
      addLog('COMMANDE TACTIQUE // Lancement du jeu de combat.');
      setIsGenerating(false);
      setTimeout(() => onLaunchGame(), 400);
      return;
    }

    // 5. Natural Conversation with Gemini reasoning cortex & Ollama Flash Attention (Temp 0.2)
    try {
      const historyContext = chatMessages
        .filter(m => m.sender === 'THIRTY3' || m.sender === 'DEUS_EX_SOPHIA')
        .slice(-4)
        .map(m => ({
          role: (m.sender === 'THIRTY3' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text
        }));

      const res = await querySophiaInference(
        query,
        historyContext,
        selectedModelMode,
        idToken,
        user?.email || null
      );
      if (res.remainingQuota !== undefined) {
        setGuestQuota(res.remainingQuota);
      }
      if (res.isQuotaExceeded !== undefined) {
        setQuotaExceeded(res.isQuotaExceeded);
      }

      const sophiaMsg: ChatMessage = {
        id: 'sophia_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: res.text,
        timestamp: new Date().toLocaleTimeString(),
        source: res.source,
        latencyMs: res.latencyMs,
        modelName: res.modelName,
        geminiDirective: res.geminiDirective,
        flashAttentionUsed: res.flashAttentionUsed,
        temperatureUsed: res.temperatureUsed,
        tokensSavedPercent: res.tokensSavedPercent
      };
      setChatMessages(prev => [...prev, sophiaMsg]);
      const sourceLabel = res.source === 'gemini_ollama' 
        ? 'GEMINI 3.7 + OLLAMA FLASH ATTENTION' 
        : res.source === 'quota_protection'
        ? '🛡️ QUOTA PROTÉGÉ (ÉCO JETONS)'
        : res.source.toUpperCase();
      addLog(`Sophia Inférence (${res.latencyMs || 25}ms) via ${sourceLabel} [${res.isMaster ? 'Master Illimité' : `Quota Invité: ${res.remainingQuota ?? 5}/5`}].`);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: 'sophia_err_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: '« Signal stabilisé. Mes algorithmes confirment une brèche exploitable sur le serveur central de Place Ville-Marie. Prépare ton injection. »',
        timestamp: new Date().toLocaleTimeString(),
        source: 'simulation',
        flashAttentionUsed: true,
        temperatureUsed: 0.2
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
    const mission = tacticalState.shadowBroker.droneMission;
    if (mission?.isActive) {
      const nextTask = mission.tasks[(mission.currentTaskIndex + 1) % mission.tasks.length];
      addLog(`SHADOWBROKER OSINT // Drone réassigné : Tâche ${((mission.currentTaskIndex + 1) % mission.tasks.length) + 1}/${mission.tasks.length} -> ${nextTask.title}.`);
      setChatMessages(prev => [
        ...prev,
        {
          id: 'sb_' + Date.now(),
          sender: 'SYSTEM',
          text: `🛰️ SHADOWBROKER // Drone Reaper en transit vers ${nextTask.targetName}. Scan OSINT actif.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } else {
      addLog('SHADOWBROKER OSINT // Mini Drone de reconnaissance furtif déployé au-dessus de Montréal. Télémétrie et sniffing radio 433.92 MHz actifs.');
      setChatMessages(prev => [
        ...prev,
        {
          id: 'sb_' + Date.now(),
          sender: 'SYSTEM',
          text: '🛰️ SHADOWBROKER // Mini Drone Reaper en vol au-dessus du centre-ville. Surveillance 360° et interception en cours.',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
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
    addLog(`ACTIVATION SERVICE // ${srv.name} (Port ${srv.port}) ouvert.`);
    
    if (srv.id === 'game_arpg') {
      onLaunchGame();
    } else if (srv.id === 'cyber_arpg') {
      if (onOpenFullApp) {
        onOpenFullApp('cyber_arpg');
      } else {
        setIsServiceModalOpen(true);
      }
    } else if (srv.id === 'maxintel_academy') {
      if (onOpenFullApp) {
        onOpenFullApp('maxintel_academy');
      } else {
        setIsServiceModalOpen(true);
      }
    } else {
      setIsServiceModalOpen(true);
      if (srv.id === 'stm_transit') {
        handleSearchSTM();
      } else if (srv.id === 'world_monitor') {
        handleExecuteWorldMonitorScan();
      } else if (srv.id === 'shadowbroker') {
        handleExecuteShadowBrokerDrone();
      } else if (srv.id === 'god_eye_view') {
        if (!godEyeActive) {
          handleToggleGodEye();
        }
      }
    }
  };

  const handleUnlockHack = (hackId: string, btcPrice: number) => {
    if (bitcoinWallet.satoshis >= btcPrice) {
      setBitcoinWallet(prev => ({
        ...prev,
        satoshis: prev.satoshis - btcPrice,
        unlockedHackIds: [...prev.unlockedHackIds, hackId]
      }));
      addLog(`ARSENAL // Hack [${hackId}] débloqué pour ${btcPrice} Satoshis.`);
      setChatMessages(prev => [
        ...prev,
        {
          id: 'unlock_' + Date.now(),
          sender: 'DEUS_EX_SOPHIA',
          text: `« Nouveau Hack déverrouillé avec succès dans le Cyber-Deck ! Tu peux l’exécuter immédiatement en combat ou en reconnaissance. »`,
          timestamp: new Date().toLocaleTimeString(),
          source: 'ollama'
        }
      ]);
    }
  };

  const handleUnlockArsenalItem = (itemId: string, btcPrice: number) => {
    if (bitcoinWallet.satoshis >= btcPrice) {
      setBitcoinWallet(prev => ({
        ...prev,
        satoshis: prev.satoshis - btcPrice,
        unlockedArsenalIds: [...prev.unlockedArsenalIds, itemId]
      }));
      addLog(`ARSENAL // Équipement [${itemId}] forgé pour ${btcPrice} Satoshis.`);
      setChatMessages(prev => [
        ...prev,
        {
          id: 'forge_' + Date.now(),
          sender: 'DEUS_EX_SOPHIA',
          text: `« Outil matériel / Arme de hacker forgée dans ton inventaire. Son potentiel éducatif et offensif est maintenant actif ! »`,
          timestamp: new Date().toLocaleTimeString(),
          source: 'ollama'
        }
      ]);
    }
  };

  const handleExecuteHackLive = (hack: WorldMonitorHack) => {
    executeWorldMonitorMCP(hack.mcpToolName);
    addLog(`HACK EXÉCUTÉ // ${hack.name} (Outil MCP: ${hack.mcpToolName}) lancé avec succès.`);
    setChatMessages(prev => [
      ...prev,
      {
        id: 'hack_exec_' + Date.now(),
        sender: 'DEUS_EX_SOPHIA',
        text: `« Hack ${hack.name} exécuté ! Effet appliqué : ${hack.gameEffect} »`,
        timestamp: new Date().toLocaleTimeString(),
        source: 'ollama'
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full w-full max-h-full max-w-full bg-[#05060a] text-gray-200 overflow-hidden font-sans select-none">
      <header className="h-14 border-b border-[#00f3ff33] bg-[#090d16]/95 px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded border border-[#00f3ff] bg-[#00f3ff15] flex items-center justify-center text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.4)] shrink-0">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-orbitron font-black text-white tracking-widest flex items-center gap-1.5 sm:gap-2 uppercase">
              <span>THIRTY3</span>
              <span className="text-[#00f3ff]">//</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff00ff]">
                CENTRE DE COMMANDEMENT
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] font-mono text-gray-400 truncate max-w-[220px] sm:max-w-none">
              Montréal 2033 • Port 3033 • Moteur IA Sophia
            </div>
          </div>
        </div>

        {/* Quick Access Tool Navigation Bar */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#050811] px-2 py-1 rounded-lg border border-white/10">
          <button
            onClick={() => {
              sound.playVictory();
              if (onOpenFullApp) onOpenFullApp('maxintel_academy');
              else setIsServiceModalOpen(true);
            }}
            className="px-2 py-1 bg-[#00ff4115] hover:bg-[#00ff4133] border border-[#00ff4155] text-[#00ff41] rounded text-[10px] font-orbitron font-bold flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(0,255,65,0.2)]"
            title="Ouvrir MaxIntel OSINT Framework & Academy (Enquêtes sur les Personnages)"
          >
            <Search className="w-3 h-3" />
            <span>🕵️ MAXINTEL OSINT</span>
          </button>
          <button
            onClick={() => {
              sound.playVictory();
              if (onOpenFullApp) onOpenFullApp('map_montreal');
              else setIsServiceModalOpen(true);
            }}
            className="px-2 py-1 bg-[#00f3ff15] hover:bg-[#00f3ff33] border border-[#00f3ff55] text-[#00f3ff] rounded text-[10px] font-orbitron font-bold flex items-center gap-1 cursor-pointer transition-all"
            title="Ouvrir la Carte Tactique Complète de Montréal (Plein Écran)"
          >
            <span>🗺️ CARTE SIG 3D</span>
          </button>
          <button
            onClick={() => {
              sound.playLoot();
              if (onOpenFullApp) onOpenFullApp(selectedServiceId);
              else setIsServiceModalOpen(true);
            }}
            className="px-2 py-1 bg-[#ff00ff15] hover:bg-[#ff00ff33] border border-[#ff00ff55] text-[#ff00ff] rounded text-[10px] font-orbitron font-bold flex items-center gap-1 cursor-pointer transition-all"
            title="Ouvrir l'Application Complète"
          >
            <span>⚡ PAGE COMPLÈTE</span>
          </button>
          <button
            onClick={() => setIsArsenalModalOpen(true)}
            className="px-2.5 py-1 bg-gradient-to-r from-[#f59e0b22] to-[#00f3ff22] hover:brightness-125 border border-[#f59e0b] text-[#f59e0b] rounded text-[10px] font-orbitron font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse"
            title="Ouvrir l'Arsenal de Hacker (59 Hacks World Monitor & Équipement)"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>⚡ 59 HACKS & BTC</span>
          </button>
          <button
            onClick={() => onOpenTacticalDeck && onOpenTacticalDeck()}
            className="px-2 py-1 bg-[#f59e0b15] hover:bg-[#f59e0b33] border border-[#f59e0b55] text-[#f59e0b] rounded text-[10px] font-orbitron font-bold flex items-center gap-1 cursor-pointer transition-all"
            title="Ouvrir le Cyber-Deck Tactique"
          >
            <span>⚡ DECK</span>
          </button>
          <button
            onClick={() => onOpenSkills && onOpenSkills()}
            className="px-2 py-1 bg-[#00ff4115] hover:bg-[#00ff4133] border border-[#00ff4155] text-[#00ff41] rounded text-[10px] font-orbitron font-bold flex items-center gap-1 cursor-pointer transition-all"
            title="Ouvrir l'Arbre de Talents"
          >
            <span>⚔️ TALENTS</span>
          </button>
          <button
            onClick={() => onOpenInventory && onOpenInventory()}
            className="px-2 py-1 bg-[#a855f715] hover:bg-[#a855f733] border border-[#a855f755] text-[#a855f7] rounded text-[10px] font-orbitron font-bold flex items-center gap-1 cursor-pointer transition-all"
            title="Ouvrir l'Inventaire & Équipement"
          >
            <span>🎒 INVENTAIRE</span>
          </button>
          <button
            onClick={() => onOpenCodex && onOpenCodex()}
            className="px-2 py-1 bg-[#38bdf815] hover:bg-[#38bdf833] border border-[#38bdf855] text-[#38bdf8] rounded text-[10px] font-orbitron font-bold flex items-center gap-1 cursor-pointer transition-all"
            title="Ouvrir le Codex de Montréal 2033"
          >
            <span>📜 CODEX</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#111827] border border-[#00f3ff44] rounded text-xs font-mono">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-5 h-5 rounded-full border border-[#00f3ff]" referrerPolicy="no-referrer" />
              ) : (
                <UserCheck className="w-4 h-4 text-[#00f3ff]" />
              )}
              <span className="text-gray-200 text-[11px] max-w-[120px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
              <button
                onClick={signOutUser}
                className="text-gray-400 hover:text-[#ff0055] transition-colors ml-1 cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="px-3 py-1.5 bg-[#00f3ff15] hover:bg-[#00f3ff25] border border-[#00f3ff55] text-[#00f3ff] font-mono text-xs rounded transition-all cursor-pointer flex items-center gap-1.5"
              title="Connexion Google pour synchronisation Cloud SQL"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>CONNEXION GOOGLE</span>
            </button>
          )}

          <button
            onClick={handleToggleMute}
            className={`px-3 py-2 border rounded font-mono text-xs cursor-pointer transition-all flex items-center gap-1.5 ${
              isAudioMuted
                ? 'bg-[#ff005515] border-[#ff005555] text-[#ff0055] hover:bg-[#ff005525]'
                : 'bg-[#00ff4115] border-[#00ff4155] text-[#00ff41] hover:bg-[#00ff4125]'
            }`}
            title={isAudioMuted ? 'Son désactivé (Coupé) - Cliquer pour activer' : 'Son actif - Cliquer pour couper'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="font-bold">{isAudioMuted ? 'SON : COUPÉ' : 'SON : ACTIF'}</span>
          </button>

          <button
            onClick={onLaunchGame}
            className="px-4 py-2 bg-gradient-to-r from-[#ff0055] via-[#ff00a0] to-[#00f3ff] text-white font-orbitron font-black text-xs uppercase tracking-wider rounded shadow-[0_0_20px_rgba(255,0,85,0.5)] hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
            title="Lancer la demande d'incursion de combat (Protocole Final Fantasy VII)"
          >
            <Swords className="w-4 h-4" />
            <span>DEMANDE DE COMBAT (FF7)</span>
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

      {/* Mobile Responsive Tab Switcher (Visible on mobile screens / Android framing) */}
      <div className="flex md:hidden bg-[#090d16] border-b border-[#00f3ff33] px-2 py-1.5 gap-2 shrink-0">
        <button
          onClick={() => {
            sound.playUiClick();
            setMobileTab('services');
          }}
          className={`flex-1 py-1.5 rounded text-[11px] font-orbitron font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === 'services'
              ? 'bg-[#00f3ff22] border border-[#00f3ff] text-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.3)]'
              : 'bg-black/40 border border-white/10 text-gray-400'
          }`}
        >
          <Database className="w-3 h-3" />
          <span>🌐 SERVICES & TACTIQUE</span>
        </button>
        <button
          onClick={() => {
            sound.playUiClick();
            setMobileTab('sophia');
          }}
          className={`flex-1 py-1.5 rounded text-[11px] font-orbitron font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === 'sophia'
              ? 'bg-[#ff00ff22] border border-[#ff00ff] text-[#ff00ff] shadow-[0_0_10px_rgba(255,0,255,0.3)]'
              : 'bg-black/40 border border-white/10 text-gray-400'
          }`}
        >
          <Zap className="w-3 h-3 text-[#ff00ff]" />
          <span>🧠 IA DEUS EX SOPHIA</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">

        <main data-scroll-container className={`${mobileTab === 'services' ? 'flex' : 'hidden'} md:flex w-full md:w-2/3 border-r border-[#00f3ff22] flex-col bg-[#070a12] p-2.5 sm:p-4 overflow-y-auto overflow-x-hidden touch-pan-y space-y-4 snap-scroll-y min-w-0 max-w-full box-border`}>
          
          <div data-snap-point="TÉLÉMESURE DOCKER" className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 font-mono text-xs snap-section">
            <div className="bg-[#0b101d]/90 border border-[#00f3ff33] p-2.5 sm:p-3 rounded-lg flex items-center justify-between gap-2 min-w-0 shadow-md ring-1 ring-white/5">
              <div className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider truncate">RÉSEAU DOCKER</div>
              <div className="text-[#00ff41] font-bold text-[11px] sm:text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap bg-[#00ff4110] px-2 py-0.5 rounded border border-[#00ff4133]">
                <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-ping" />
                6 / 6 ACTIFS
              </div>
            </div>

            <div className="bg-[#0b101d]/90 border border-[#00f3ff33] p-2.5 sm:p-3 rounded-lg flex items-center justify-between gap-2 min-w-0 shadow-md ring-1 ring-white/5">
              <div className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider truncate">CIBLE VANCE</div>
              <div className="text-[#ff0055] font-bold text-[10px] sm:text-xs truncate bg-[#ff005510] px-2 py-0.5 rounded border border-[#ff005533]">
                VILLE-MARIE
              </div>
            </div>

            <div className="bg-[#0b101d]/90 border border-[#00f3ff33] p-2.5 sm:p-3 rounded-lg flex items-center justify-between gap-2 min-w-0 shadow-md ring-1 ring-white/5">
              <div className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider truncate">TRANSIT STM</div>
              <div className="text-[#00f3ff] font-bold text-[10px] sm:text-xs shrink-0 whitespace-nowrap bg-[#00f3ff10] px-2 py-0.5 rounded border border-[#00f3ff33]">
                142 BUS EN DIRECT
              </div>
            </div>

            <div className="bg-[#0b101d]/90 border border-[#00f3ff33] p-2.5 sm:p-3 rounded-lg flex items-center justify-between gap-2 min-w-0 shadow-md ring-1 ring-white/5">
              <div className="text-gray-400 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider truncate">MATRICE GOD EYE</div>
              <button 
                onClick={handleToggleGodEye}
                className={`text-[10px] font-bold px-2.5 py-1 border rounded cursor-pointer transition-all shrink-0 whitespace-nowrap ${
                  godEyeActive 
                    ? 'bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_8px_#00ff41]' 
                    : 'bg-white/5 text-gray-300 border-gray-600 hover:text-white hover:border-[#00ff41]'
                }`}
              >
                {godEyeActive ? '👁️ ON' : 'VEILLE'}
              </button>
            </div>
          </div>

          <div data-snap-point="SERVICES DOCKER" className="space-y-2 snap-section">
            <div className="text-xs font-orbitron font-bold text-[#00f3ff] uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#00f3ff]" />
              <span>SÉLECTIONNEZ UN SERVICE DOCKER POUR L'ACTIVER</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-2.5 sm:gap-3">
              {DOCKER_SERVICES.map(srv => {
                const Icon = srv.icon;
                const isSelected = srv.id === selectedServiceId;

                return (
                  <div
                    key={srv.id}
                    onClick={() => handleCardClick(srv)}
                    className={`p-3 sm:p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#0f172a] border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.25)] ring-1 ring-[#00f3ff]'
                        : 'bg-[#0a0e1a] border-[#ffffff15] hover:border-gray-500 hover:bg-[#0d1322]'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: srv.badgeColor }} />
                          <span className="text-xs font-orbitron font-bold text-white truncate">
                            {srv.title}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#00ff4115] border border-[#00ff4155] text-[#00ff41] font-bold rounded shrink-0 whitespace-nowrap">
                          :{srv.port}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">
                        {srv.description}
                      </div>
                    </div>

                    {/* Isolated Footer Row with space-between: Zero Collision Guarantee */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[10px] font-mono shrink-0 select-none">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider shrink-0 whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#00f3ff22] text-[#00f3ff] border border-[#00f3ff55]'
                            : 'bg-white/5 text-gray-400 border border-white/5'
                        }`}
                      >
                        {isSelected ? '● ACTIF' : 'SÉLECTIONNER'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playVictory();
                          handleCardClick(srv);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-[#00f3ff] hover:text-black hover:bg-[#00f3ff] border border-[#00f3ff44] hover:border-[#00f3ff] flex items-center gap-1 transition-all cursor-pointer shrink-0 whitespace-nowrap"
                        title={`Ouvrir et activer ${srv.title}`}
                      >
                        <span>{srv.id === 'game_arpg' ? 'Lancer' : 'Ouvrir'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div data-snap-point="CONSOLE INTERACTIVE" className="bg-[#0b101f] border border-[#00f3ff55] p-3 sm:p-4 rounded-lg shadow-xl space-y-3 snap-section">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#00f3ff15] border border-[#00f3ff] text-[#00f3ff] shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-orbitron font-black text-white uppercase tracking-wider flex flex-wrap items-center gap-2">
                    <span>CONSOLE INTERACTIVE // {selectedService.name}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-[#00ff4122] text-[#00ff41] border border-[#00ff4155] rounded shrink-0">
                      PORT {selectedService.port} OPÉRATIONNEL
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 truncate">
                    URL Hôte : <span className="text-[#00f3ff]">{selectedService.hostUrl}</span> • {selectedService.role}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    sound.playLoot();
                    if (selectedService.id === 'game_arpg') {
                      onLaunchGame();
                    } else if (selectedService.id === 'stm_transit') {
                      handleSearchSTM();
                      addLog('STM REALTIME // Flux 142 bus et métros rafraîchi en direct.');
                    } else if (selectedService.id === 'world_monitor') {
                      handleExecuteWorldMonitorScan();
                      addLog('WORLD MONITOR // Télémétrie satellitaire SkyFi actualisée.');
                    } else if (selectedService.id === 'shadowbroker') {
                      handleExecuteShadowBrokerDrone();
                      addLog('SHADOWBROKER // Drone déployé et balises OSINT scannées.');
                    } else if (selectedService.id === 'god_eye_view') {
                      handleToggleGodEye();
                      addLog('GOD EYE VIEW // Matrice 3D et 384 caméras synchronisées.');
                    } else if (selectedService.id === 'deus_ex_sophia_ai') {
                      handleSendMessage('Sophia, effectue un diagnostic complet des systèmes de Montréal 2033.');
                    }
                  }}
                  className="px-3 py-1.5 text-[10px] font-orbitron font-bold bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black rounded cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,243,255,0.3)] shrink-0 whitespace-nowrap"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span className="whitespace-nowrap">
                    {selectedService.id === 'game_arpg'
                      ? 'LANCER LE JEU'
                      : selectedService.id === 'stm_transit'
                      ? 'RAFRAÎCHIR STM'
                      : selectedService.id === 'world_monitor'
                      ? 'SCAN SKYFI MCP'
                      : selectedService.id === 'shadowbroker'
                      ? 'DÉPLOYER DRONE'
                      : selectedService.id === 'god_eye_view'
                      ? 'BASCULER 3D'
                      : 'DIAGNOSTIC SOPHIA'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    sound.playLoot();
                    if (selectedService.id === 'game_arpg') {
                      onLaunchGame();
                    } else if (onOpenFullApp) {
                      onOpenFullApp(selectedService.id);
                    } else {
                      setIsServiceModalOpen(true);
                    }
                  }}
                  className="px-3 py-1.5 text-[10px] font-orbitron font-bold bg-[#00f3ff15] hover:bg-[#00f3ff33] border border-[#00f3ff] text-[#00f3ff] rounded cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,243,255,0.2)] shrink-0 whitespace-nowrap"
                  title="Ouvrir l'application et la carte complète via URL autonome"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="whitespace-nowrap">OUVRIR URL</span>
                </button>
                <button
                  onClick={() => {
                    sound.playVictory();
                    if (onOpenFullApp) {
                      onOpenFullApp('map_montreal');
                    } else {
                      setIsServiceModalOpen(true);
                    }
                  }}
                  className="px-3 py-1.5 text-[10px] font-orbitron font-bold bg-[#111827] hover:bg-[#1f2937] border border-[#ff00ff55] text-[#ff00ff] rounded cursor-pointer transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                  title="Ouvrir la Carte Tactique Complète de Montréal (SIG & STM)"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="whitespace-nowrap">CARTE SIG 3D</span>
                </button>
              </div>
            </div>

            {selectedServiceId === 'world_monitor' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#080d1a] border border-[#00f3ff33] rounded grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
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

                <div className="flex flex-col sm:flex-row gap-2">
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
                    className="px-4 py-2.5 bg-[#111827] hover:bg-[#1f2937] border border-[#00f3ff44] text-[#00f3ff] font-orbitron font-bold text-xs uppercase rounded cursor-pointer transition-all flex items-center justify-center gap-1.5"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tacticalState.shadowBroker.osintPins.map(pin => {
                    const isHacked = hackedPins.includes(pin.id);
                    return (
                      <div
                        key={pin.id}
                        className={`p-2.5 rounded border flex items-center justify-between gap-2 ${
                          isHacked 
                            ? 'bg-[#00ff4110] border-[#00ff4155]' 
                            : 'bg-[#080d1a] border-white/10 hover:border-[#f59e0b]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-[11px] text-white flex items-center gap-1.5 truncate">
                            <Crosshair className="w-3 h-3 text-[#f59e0b] shrink-0" />
                            <span className="truncate">{pin.label}</span>
                          </div>
                          <div className="text-[9px] text-gray-400 mt-0.5 truncate">{pin.description}</div>
                        </div>

                        <button
                          onClick={() => handleHackPin(pin.id, pin.label)}
                          className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer transition-all shrink-0 ${
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
                <div className="p-3 bg-[#080d1a] border border-[#ff00ff44] rounded grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                <div className="p-3 bg-[#080d1a] border border-[#00ff4144] rounded grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <span className="text-gray-400 text-[10px] block">MATRICE 3D CLOUD</span>
                    <span className="text-[#00ff41] font-bold text-xs">MONTRÉAL 3D ACTIF</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">CAMÉRAS SURVEILLANCE</span>
                    <span className="text-white font-bold text-xs">384 FLUX LIVE HD</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">STATUT MOTEUR 3D</span>
                    <span className="text-[#00f3ff] font-bold text-xs">SYNCHRO CLOUD (0.3m)</span>
                  </div>
                </div>

                {/* Interactive 3D Holographic Wireframe View of Montreal */}
                <div className="relative h-44 bg-[#050811] border border-[#00ff4144] rounded-lg overflow-hidden flex items-center justify-center p-2">
                  <div className="absolute inset-0 bg-[radial-gradient(#00ff4115_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  
                  {/* Rotating 3D Grid Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <div className="w-56 h-56 rounded-full border border-[#00ff41] border-dashed animate-[spin_25s_linear_infinite]" />
                    <div className="w-36 h-36 rounded-full border border-[#00f3ff] border-dotted animate-[spin_15s_linear_infinite_reverse]" />
                    <div className="w-16 h-16 rounded-full border border-[#ff0055] animate-ping" />
                  </div>

                  <div className="relative z-10 w-full h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 bg-[#00ff4122] text-[#00ff41] border border-[#00ff4155] rounded font-bold">
                        👁️ GOD EYE 3D // SECTEUR VILLE-MARIE
                      </span>
                      <span className="text-gray-400 font-mono text-[9px]">
                        ALT: 450m • SCAN: 360° • RESOLUTION: 0.3m
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-[#0b1220]/80 border border-[#00ff4133] p-1.5 rounded">
                        <span className="text-gray-400 block text-[8px]">PENTHOUSE VANCE</span>
                        <span className="text-[#ff0055] font-bold">CIBLE VERROUILLÉE</span>
                      </div>
                      <div className="bg-[#0b1220]/80 border border-[#00f3ff33] p-1.5 rounded">
                        <span className="text-gray-400 block text-[8px]">RÉSEAU RÉSO</span>
                        <span className="text-[#00f3ff] font-bold">96% INFILTRÉ</span>
                      </div>
                      <div className="bg-[#0b1220]/80 border border-[#00ff4133] p-1.5 rounded">
                        <span className="text-gray-400 block text-[8px]">CANAL SATELLITE</span>
                        <span className="text-[#00ff41] font-bold">SKYFI-01 LIAISON 4K</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-300">
                  Flux Vidéo HD Caméras & Satellites (Montréal 2033) :
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { node: '📷 Caméra Ville-Marie #04', loc: 'Place Ville-Marie', detail: 'Imagerie faciale Vance verrouillée', status: 'TRANSMISSION HD' },
                    { node: '📷 Caméra Peel / Ste-Catherine', loc: 'Centre-Ville', detail: '3 Milices SPVM-Prime détectées', status: 'ACTIF' },
                    { node: '📷 Dôme Relais Mont-Royal', loc: 'Mont-Royal', detail: 'Liaison descendante SkyFi 0.3m', status: 'SATELLITE SYNC' },
                    { node: '📷 Sas RÉSO Bonaventure', loc: 'Réseau Souterrain', detail: 'Couloir sécurisé insurgés', status: 'INFILTRÉ' }
                  ].map(c => (
                    <div key={c.node} className="p-2 bg-[#080d1a] border border-[#00ff4133] rounded flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-white font-bold text-[11px] flex items-center gap-1 truncate">
                          <Eye className="w-3 h-3 text-[#00ff41] shrink-0" />
                          <span className="truncate">{c.node}</span>
                        </div>
                        <div className="text-[9px] text-gray-400 truncate">{c.loc} • {c.detail}</div>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 bg-[#00ff4115] text-[#00ff41] border border-[#00ff4155] rounded font-bold shrink-0 whitespace-nowrap">
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      sound.playVictory();
                      window.open('http://localhost:4173/#v=2&lat=45.5017&lon=-73.5673&alt=450&heading=15&pitch=-30&roll=360&style=normal&bloom=0&sharpen=0&bi=0&bv=2&si=49&hud=tactical&hv=1&dm=DENSE&dd=75&da=elastic&kf=7&ko=1&cr=0&sc=1&scf=11&map=osm&l=e.x&lo=f.e.1_f.m.a&ui=c.c.1_c.p.0_l.c.1_l.p.0_d.c.0_v.c.0_r.c.1_s.c.0_g.c.0_p.c.0_m.c.0', '_blank', 'noopener,noreferrer');
                      addLog('GOD EYE VIEW // Moteur Cesium 3D ouvert dans un nouvel onglet.');
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#00ff41] to-[#00f3ff] hover:brightness-110 text-black font-orbitron font-black text-xs uppercase rounded shadow-[0_0_15px_rgba(0,255,65,0.4)] cursor-pointer flex items-center justify-center gap-2 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>OUVRIR GOD EYE LIVE (PORT 4173)</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playLevelUp();
                      handleToggleGodEye();
                      addLog('GOD EYE VIEW // Matrice 3D activée et synchronisée avec le Cloud.');
                    }}
                    className="px-4 py-2.5 bg-[#111827] hover:bg-[#1f2937] border border-[#00ff4144] text-[#00ff41] font-orbitron font-bold text-xs uppercase rounded shadow-[0_0_10px_rgba(0,255,65,0.2)] cursor-pointer flex items-center justify-center gap-2 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{godEyeActive ? '👁️ DÉSACTIVER OVERLAY' : '👁️ ACTIVER OVERLAY'}</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playLoot();
                      addLog('GOD EYE VIEW // Scan spatial 3D 360° exécuté. 384 caméras synchronisées.');
                    }}
                    className="px-4 py-2.5 bg-[#111827] hover:bg-[#1f2937] border border-[#00ff4144] text-[#00ff41] font-orbitron font-bold text-xs uppercase rounded cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>SCAN 360°</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. STM REALTIME TRANSIT WORKBENCH */}
            {selectedServiceId === 'stm_transit' && (
              <div className="space-y-3 font-mono text-xs">
                
                {/* Live STM Bus Query Bar */}
                <div className="p-3 bg-[#080d1a] border border-[#38bdf844] rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Train className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>API STM GTFS-REALTIME DIRECTE // RECHERCHE DE LIGNE</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-[#38bdf822] text-[#38bdf8] border border-[#38bdf855] rounded">
                      API KEY OFFICIELLE VALIDÉE
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={stmSearchRoute}
                      onChange={(e) => setStmSearchRoute(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSTM(); }}
                      placeholder="N° de ligne (ex: 136, 24, 106, 139)..."
                      className="flex-1 bg-[#0f172a] border border-[#38bdf855] rounded px-3 py-1.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#38bdf8]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSearchSTM()}
                      disabled={isStmLoading}
                      className="px-4 py-1.5 bg-[#38bdf8] hover:bg-[#38bdf8]/90 disabled:bg-gray-700 text-black font-orbitron font-bold text-xs rounded cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      {isStmLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                      <span>{isStmLoading ? 'RECHERCHE...' : 'INTERROGER STM'}</span>
                    </button>
                  </div>

                  {/* Quick line pills */}
                  <div className="flex gap-1.5 overflow-x-auto text-[10px]">
                    {['136', '24', '106', '15', '55', '139', '747'].map(route => (
                      <button
                        key={route}
                        type="button"
                        onClick={() => {
                          setStmSearchRoute(route);
                          handleSearchSTM(route);
                        }}
                        className={`px-2 py-0.5 rounded border text-[10px] transition-all cursor-pointer ${
                          stmSearchRoute === route
                            ? 'bg-[#38bdf8] text-black border-[#38bdf8] font-bold'
                            : 'bg-[#111827] text-gray-300 border-white/10 hover:border-[#38bdf8]'
                        }`}
                      >
                        Ligne {route}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Live Queried Bus Results */}
                {stmLiveReport ? (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-[#080d1a] border border-[#38bdf833] rounded flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold text-xs flex items-center gap-2">
                          <span>LIGNE {stmLiveReport.routeId}</span>
                          <span className="text-[10px] font-mono text-[#38bdf8]">
                            ({stmLiveReport.activeCount} bus en circulation)
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {stmLiveReport.summary}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                        stmLiveReport.maxDelaySec > 180
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-[#00ff4115] border-[#00ff4155] text-[#00ff41]'
                      }`}>
                        {stmLiveReport.statusText}
                      </span>
                    </div>

                    {stmLiveReport.vehicles.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                        {stmLiveReport.vehicles.map(v => (
                          <div key={v.id} className="p-2 bg-[#0c1222] border border-white/10 rounded text-[10px]">
                            <div className="flex items-center justify-between text-white font-bold">
                              <span>Bus #{v.id}</span>
                              <span className="text-[#38bdf8]">{v.speedKmH} km/h</span>
                            </div>
                            <div className="text-gray-400 text-[9px] mt-0.5">
                              GPS: {v.latitude}, {v.longitude}
                            </div>
                            <div className="text-gray-500 text-[9px]">
                              Arrêt séquence #{v.stopSequence}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
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
                )}

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
                <div className="p-3 bg-[#080d1a] border border-[#ff005544] rounded flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold font-orbitron text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#ff0055]" />
                      <span>INCURSION TACTIQUE // COMBAT FINAL FANTASY VII</span>
                    </div>
                    <div className="text-[10px] text-gray-300 mt-0.5">
                      Combat sécurisé sous demande d'approbation préalable. Le combat ne démarre que si vous acceptez explicitement l'incursion.
                    </div>
                  </div>
                  <span className="text-[#ff0055] font-orbitron font-bold text-xs bg-[#ff005515] px-2 py-1 border border-[#ff005555] rounded">
                    EN ATTENTE
                  </span>
                </div>

                <button
                  onClick={onLaunchGame}
                  className="w-full py-3 bg-gradient-to-r from-[#ff0055] via-[#ff00a0] to-[#00f3ff] text-white font-orbitron font-black text-xs uppercase tracking-wider rounded shadow-[0_0_20px_rgba(255,0,85,0.5)] hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <Swords className="w-4 h-4" />
                  <span>DEMANDER L'INCURSION DE COMBAT [PROTOCOLE FF7]</span>
                </button>
              </div>
            )}

          </div>

          {/* Interactive GIS Montreal Map Preview inside Hub */}
          <div data-snap-point="CARTE SIG TACTIQUE" className="bg-[#050811] border border-[#00f3ff33] rounded-lg p-2.5 sm:p-3 space-y-2 snap-section">
            <header className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-white/5 pb-2">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <Globe className="w-3.5 h-3.5 text-[#00f3ff] animate-spin shrink-0" />
                <span className="text-[11px] font-orbitron font-bold text-white uppercase truncate">
                  {selectedServiceId === 'god_eye_view'
                    ? '👁️ GOD EYE VIEW // MATRICE 3D CESIUM (PORT 4173)'
                    : ['world_monitor', 'shadowbroker'].includes(selectedServiceId)
                    ? `VUE PLANÉTAIRE 3D // ${selectedServiceId.toUpperCase()}`
                    : 'CARTE TACTIQUE SIG // MONTRÉAL 2033 (TEMPS RÉEL)'}
                </span>
                {selectedServiceId === 'god_eye_view' ? (
                  <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded border border-[#00ff4155]">
                    <button
                      onClick={() => {
                        sound.playUiClick();
                        setGodEyeViewerMode('matrix');
                      }}
                      className={`px-2 py-0.5 text-[9px] font-orbitron font-bold rounded cursor-pointer transition-all ${
                        godEyeViewerMode === 'matrix'
                          ? 'bg-[#00ff41] text-black shadow-[0_0_8px_rgba(0,255,65,0.4)]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      👁️ CESIUM 3D
                    </button>
                    <button
                      onClick={() => {
                        sound.playUiClick();
                        setGodEyeViewerMode('globe');
                      }}
                      className={`px-2 py-0.5 text-[9px] font-orbitron font-bold rounded cursor-pointer transition-all ${
                        godEyeViewerMode === 'globe'
                          ? 'bg-[#00f3ff] text-black shadow-[0_0_8px_rgba(0,243,255,0.4)]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      🌐 GLOBE
                    </button>
                  </div>
                ) : (
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-[#00ff4115] text-[#00ff41] border border-[#00ff4155] rounded font-bold shrink-0 whitespace-nowrap">
                    {['world_monitor', 'shadowbroker'].includes(selectedServiceId) ? 'GLOBE 3D ACTIF' : 'LEAFLET 2D/3D ACTIF'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    sound.playVictory();
                    if (onOpenFullApp) onOpenFullApp(selectedServiceId === 'game_arpg' ? 'map_montreal' : selectedServiceId as any);
                    else setIsServiceModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black text-[9px] font-orbitron font-bold rounded flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_8px_rgba(0,243,255,0.4)] shrink-0 whitespace-nowrap"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>AGRANDIR EN APPLICATION PLEINE PAGE</span>
                </button>
              </div>
            </header>

            <div className="h-64 sm:h-72 w-full rounded border border-white/10 overflow-hidden relative shadow-2xl bg-[#02050e]">
              {selectedServiceId === 'god_eye_view' && godEyeViewerMode === 'matrix' ? (
                <div className="w-full h-full relative flex flex-col bg-[#02050e]">
                  <iframe
                    src="http://localhost:4173/#v=2&lat=45.5017&lon=-73.5673&alt=450&heading=15&pitch=-30&roll=360&style=normal&bloom=0&sharpen=0&bi=0&bv=2&si=49&hud=tactical&hv=1&dm=DENSE&dd=75&da=elastic&kf=7&ko=1&cr=0&sc=1&scf=11&map=osm&l=e.x&lo=f.e.1_f.m.a&ui=c.c.1_c.p.0_l.c.1_l.p.0_d.c.0_v.c.0_r.c.1_s.c.0_g.c.0_p.c.0_m.c.0"
                    title="God Eye View 3D Matrix"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : ['world_monitor', 'shadowbroker', 'god_eye_view'].includes(selectedServiceId) ? (
                <PlanetaryGlobe3D
                  activeToolId={selectedServiceId as any}
                  onSelectLocation={(loc) => {
                    handleHackPin(loc.id, loc.name);
                  }}
                  className="w-full h-full"
                />
              ) : (
                <MontrealTacticalMap
                  hackedPins={hackedPins}
                  stmLiveReport={stmLiveReport}
                  godEyeActive={godEyeActive}
                  onSelectPOI={(poi) => {
                    handleHackPin(poi.id, poi.name);
                  }}
                />
              )}
            </div>
          </div>

          <div data-snap-point="JOURNAUX TACTIQUES" className="bg-[#050811] border border-white/10 rounded p-3 font-mono text-[10px] space-y-1 max-h-28 overflow-y-auto snap-section">
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

        <aside className={`${mobileTab === 'sophia' ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 flex-col bg-[#060810] border-l border-[#00f3ff22] min-w-0 max-w-full overflow-x-hidden box-border`}>
          
          <div className="p-3.5 border-b border-[#00f3ff33] bg-[#090e1c] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff00ff] to-[#00f3ff] p-0.5 shadow-[0_0_15px_rgba(255,0,255,0.5)]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white">
                    <Zap className="w-4 h-4 text-[#ff00ff]" />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00ff41] border-2 border-black animate-pulse" />
              </div>

              <div>
                <div className="text-xs font-orbitron font-bold text-white uppercase flex items-center gap-1.5">
                  <span>DEUS EX SOPHIA</span>
                  <span className="text-[8px] font-mono px-1 py-0.2 bg-[#00f3ff15] text-[#00f3ff] border border-[#00f3ff55] rounded">
                    GEMINI 3.7 + OLLAMA
                  </span>
                </div>
                <div className="text-[9px] font-mono text-gray-400 flex items-center gap-1">
                  <span className="text-[#00ff41]">● Flash Attention</span> • Temp 0.2 • VRAM Éco
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <select
                value={selectedModelMode}
                onChange={(e) => setSelectedModelMode(e.target.value)}
                className="bg-[#0c1222] border border-[#ff00ff55] hover:border-[#ff00ff] text-[#ff00ff] font-mono text-[9px] rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#ff00ff] max-w-[160px] sm:max-w-[210px] truncate cursor-pointer transition-colors"
                title="Sélectionnez le modèle LLM Ollama (Flash Attention & Temp 0.2)"
              >
                <option value="hybrid_mesh">⚡ Hybride Mesh (Flash Attention 0.2)</option>
                <option value="argus:latest">🦅 Argus 2.1B (Ultra-Rapide)</option>
                <option value="jayeshpandit2480/granite4-UNCENSORED:latest">💎 Granite-4 Uncensored</option>
                <option value="deus_ex_sophia:latest">🧠 Sophia 8.0B Gemma-4</option>
              </select>

              <button
                onClick={() => handleSendMessage('Effectue un diagnostic complet de notre réseau et de nos flux en direct.')}
                className="p-1.5 border border-white/10 hover:border-[#ff00ff] bg-[#111827] text-gray-400 hover:text-white rounded-md transition-all cursor-pointer shrink-0"
                title="Actualiser l'analyse tactique"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Access Control & Token Abuse Protection Banner */}
          <div className={`px-3 py-1.5 text-[9.5px] font-mono border-b flex items-center justify-between shrink-0 ${
            isMasterUser
              ? 'bg-[#00ff4110] border-[#00ff4133] text-[#00ff41]'
              : quotaExceeded
              ? 'bg-[#ff005515] border-[#ff005544] text-[#ff0055]'
              : 'bg-[#00f3ff0a] border-[#00f3ff22] text-gray-300'
          }`}>
            {isMasterUser ? (
              <div className="flex items-center gap-1.5">
                <span className="font-bold">👑 OPÉRATEUR MASTER (Michael)</span>
                <span className="text-[8.5px] opacity-80">• Accès Gemini 3.7 Flash Illimité</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#00f3ff]">🛡️ ACCÈS INVITÉ PROTÉGÉ</span>
                <span className={`px-1.5 py-0.2 rounded border text-[8.5px] font-bold ${
                  guestQuota <= 1
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-[#00f3ff15] border-[#00f3ff44] text-[#00f3ff]'
                }`}>
                  Quota : {guestQuota}/5
                </span>
                <span className="text-[8px] text-gray-400 hidden sm:inline">(Préserve les jetons de Michael)</span>
              </div>
            )}

            {!user && (
              <button
                onClick={signInWithGoogle}
                className="text-[8.5px] text-[#00f3ff] hover:underline cursor-pointer flex items-center gap-1"
                title="Connexion Google de Michael pour déverrouiller l'accès illimité"
              >
                <LogIn className="w-2.5 h-2.5" />
                <span>Connexion Michael</span>
              </button>
            )}
          </div>

          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-mono text-xs">
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
                  className={`p-3 rounded-lg flex flex-col space-y-1.5 ${
                    isSophia
                      ? 'bg-[#110d1c] border border-[#ff00ff44] text-gray-100 shadow-[0_2px_15px_rgba(255,0,255,0.08)]'
                      : 'bg-[#0b1626] border border-[#00f3ff44] text-gray-100 ml-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-bold font-orbitron flex items-center gap-1.5 ${isSophia ? 'text-[#ff00ff]' : 'text-[#00f3ff]'}`}>
                      {isSophia && <Bot className="w-3 h-3 text-[#ff00ff]" />}
                      <span>{isSophia ? 'DEUS EX SOPHIA' : 'MICHAEL (THIRTY3)'}</span>
                    </span>
                    <span className="text-gray-500 text-[9px]">{msg.timestamp}</span>
                  </div>

                  <div className="text-xs leading-relaxed font-sans text-gray-200">
                    {msg.text}
                  </div>

                  {msg.geminiDirective && (
                    <div className="p-2 bg-[#00f3ff0a] border border-[#00f3ff33] rounded text-[10px] font-mono text-gray-300">
                      <div className="text-[#00f3ff] font-bold text-[9px] flex items-center gap-1 mb-0.5">
                        <Sparkles className="w-3 h-3 text-[#00f3ff]" />
                        <span>SYNTHÈSE DIRECTE GEMINI 3.7 TRANSMIS AUX MODÈLES :</span>
                      </div>
                      <div className="text-gray-300 italic text-[10px] line-clamp-2">
                        {msg.geminiDirective}
                      </div>
                    </div>
                  )}

                  {isSophia && (
                    <div className="text-[8.5px] text-gray-400 flex flex-wrap items-center justify-between pt-1 border-t border-white/5 gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1 py-0.2 bg-[#00ff4115] text-[#00ff41] border border-[#00ff4144] rounded font-bold">
                          ⚡ FLASH ATTENTION
                        </span>
                        <span className="px-1 py-0.2 bg-[#ff00ff15] text-[#ff00ff] border border-[#ff00ff44] rounded">
                          TEMP: 0.2
                        </span>
                        {msg.tokensSavedPercent && (
                          <span className="px-1 py-0.2 bg-[#38bdf815] text-[#38bdf8] border border-[#38bdf844] rounded">
                            VRAM -{msg.tokensSavedPercent}%
                          </span>
                        )}
                      </div>
                      {msg.latencyMs && (
                        <span className="text-gray-500 font-mono">
                          {msg.latencyMs}ms
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {isGenerating && (
              <div className="p-3 bg-[#110d1c] border border-[#ff00ff44] rounded text-xs text-[#ff00ff] flex items-center gap-2 font-mono animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#ff00ff] animate-ping" />
                <span>Gemini 3.7 synthétise & Ollama Flash Attention exécute (Temp 0.2)...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div className="p-2 border-t border-[#ffffff10] bg-[#070912] flex gap-1.5 overflow-x-auto no-scrollbar text-[10px] font-mono shrink-0">
            <button
              type="button"
              onClick={() => handleSendMessage('Analyse les faiblesses structurelles de la Place Ville-Marie et propose un plan d’action optimal.')}
              className="px-2.5 py-1 bg-[#ff00ff15] hover:bg-[#ff00ff33] border border-[#ff00ff55] text-[#ff00ff] font-bold rounded whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
              title="Tâche complexe : Analyse quantique & décomposition via Gemini 3.7 + Ollama Flash Attention"
            >
              <Sparkles className="w-3 h-3 text-[#ff00ff]" />
              <span>🧠 Raisonnement Complexe</span>
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('/hack')}
              className="px-2.5 py-1 bg-gradient-to-r from-[#f59e0b22] to-[#00f3ff22] hover:brightness-125 border border-[#f59e0b] text-[#f59e0b] font-bold rounded whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse"
              title="Ouvrir l'Arsenal de Hacker (59 Hacks World Monitor & Gadgets)"
            >
              <span>⚡ /hack</span>
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('/mcp')}
              className="px-2.5 py-1 bg-[#00f3ff15] hover:bg-[#00f3ff33] border border-[#00f3ff55] text-[#00f3ff] font-bold rounded whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
              title="Interroger les 59 Outils MCP World Monitor"
            >
              <span>🌐 /mcp</span>
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('/scan')}
              className="px-2.5 py-1 bg-[#a855f715] hover:bg-[#a855f733] border border-[#a855f755] text-[#a855f7] font-bold rounded whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
              title="Déclencher un scan satellite orbital SkyFi"
            >
              <span>🛰️ /scan</span>
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('/stm 136')}
              className="px-2.5 py-1 bg-[#38bdf815] hover:bg-[#38bdf833] border border-[#38bdf855] text-[#38bdf8] font-bold rounded whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
              title="Interroger le statut et retard du Bus 136 en direct"
            >
              <span>🚌 Bus 136</span>
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('/skill')}
              className="px-2.5 py-1 bg-[#00ff4115] hover:bg-[#00ff4133] border border-[#00ff4155] text-[#00ff41] font-bold rounded whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
              title="Ouvrir l'Arbre des Compétences"
            >
              <span>🌳 /skill</span>
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('/deck')}
              className="px-2.5 py-1 bg-[#f59e0b15] hover:bg-[#f59e0b33] border border-[#f59e0b55] text-[#f59e0b] rounded whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
              title="Ouvrir le Cyber-Deck"
            >
              <span>⚡ /deck</span>
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
              onFocus={() => prewarmSophiaInference()}
              onChange={(e) => {
                setInputQuery(e.target.value);
                if (e.target.value.length === 1) prewarmSophiaInference();
              }}
              placeholder="Écrire à Sophia... (ex: /hack, /mcp, /scan, /drone, /stm, /skill, question libre)"
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

      {/* Dedicated Interactive Tool & Service Detail Page Modal */}
      <ServiceDetailModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        serviceId={selectedServiceId as any}
        onSelectService={(id) => setSelectedServiceId(id as any)}
        onLaunchGame={onLaunchGame}
        tacticalState={tacticalState}
        onTriggerOrbitalScan={handleExecuteWorldMonitorScan}
        onTriggerShadowBrokerDrone={handleExecuteShadowBrokerDrone}
        onTriggerSophiaSTMOverload={onTriggerSophiaSTMOverload}
        stmSearchRoute={stmSearchRoute}
        setStmSearchRoute={setStmSearchRoute}
        stmLiveReport={stmLiveReport}
        isStmLoading={isStmLoading}
        onSearchSTM={handleSearchSTM}
        deepfakePercent={deepfakePercent}
        onBoostDeepfake={handleBoostDeepfake}
        hackedPins={hackedPins}
        onHackPin={handleHackPin}
        godEyeActive={godEyeActive}
        onToggleGodEye={handleToggleGodEye}
        onSendSophiaMessage={handleSendMessage}
        addLog={addLog}
      />

      {/* Dedicated Hacker Arsenal & 59 World Monitor Hacks Modal */}
      <HackerArsenalModal
        isOpen={isArsenalModalOpen}
        onClose={() => setIsArsenalModalOpen(false)}
        bitcoinWallet={bitcoinWallet}
        onUnlockHack={handleUnlockHack}
        onUnlockArsenalItem={handleUnlockArsenalItem}
        onExecuteHack={handleExecuteHackLive}
      />
    </div>
  );
};
