// ============================================================================
// MONTRÉAL 2033 — CYBER TOOLS DOCKER BRIDGE ENGINE
// Interconnexion en temps réel des 3 outils tactiques pour Thirty3 :
// 1. World Monitor (Renseignement global & Satellites SkyFi/Sentinel)
// 2. ShadowBroker & OpenClaw (Reconnaissance OSINT géospatiale & Drones)
// 3. Deus Ex Sophia Gateway & STM Realtime (Inférence IA, Deepfakes & Métro STM)
// ============================================================================

export interface WorldMonitorFeed {
  status: 'online' | 'connecting' | 'fallback';
  threatLevel: 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA' | 'OMEGA';
  globalCyberAlert: string;
  activeSatellites: number;
  monitoredChokepoints: string[];
  orbitalScanReady: boolean;
  orbitalCooldown: number;
  lastScanTimestamp: number;
}

export interface ShadowBrokerOSINTFeed {
  status: 'online' | 'connecting' | 'fallback';
  targetDistrict: string;
  spvmSurveillanceTowersHacked: number;
  totalTowers: number;
  osintPins: Array<{
    id: string;
    lat: number;
    lng: number;
    type: 'threat' | 'intel' | 'cache' | 'stm_station';
    label: string;
    description: string;
  }>;
  reconDroneReady: boolean;
  droneCooldown: number;
}

export interface SophiaSTMMatrixFeed {
  status: 'online' | 'connecting' | 'fallback';
  aiInferenceEngine: 'Ollama/deus_ex_sophia:latest' | 'Gemma-4-Quantum' | 'Gemini-Flash-Cloud';
  modelParameters: string;
  contextWindow: string;
  deepfakeProgressPercent: number;
  deepfakeTarget: string;
  stmLinesIntercepted: string[];
  activeBusesTracked: number;
  metroStatus: 'RÉSEAU HACKÉ' | 'CONFINEMENT SPVM' | 'STABLE';
  matrixOverloadReady: boolean;
  matrixCooldown: number;
  lastAiResponse?: string;
  isAiGenerating?: boolean;
}

export interface TacticalBridgeState {
  worldMonitor: WorldMonitorFeed;
  shadowBroker: ShadowBrokerOSINTFeed;
  sophiaSTM: SophiaSTMMatrixFeed;
  terminalLogs: string[];
}

export const INITIAL_TACTICAL_STATE: TacticalBridgeState = {
  worldMonitor: {
    status: 'online',
    threatLevel: 'DELTA',
    globalCyberAlert: 'CRITIQUE : Verrouillage biométrique Apex / Viktor Vance à Montréal',
    activeSatellites: 4,
    monitoredChokepoints: ['Pont Jacques-Cartier', 'Tunnel Ville-Marie', 'Réseau RÉSO Souterrain'],
    orbitalScanReady: true,
    orbitalCooldown: 0,
    lastScanTimestamp: Date.now()
  },
  shadowBroker: {
    status: 'online',
    targetDistrict: 'Montréal Centre-Ville // Quartier des Spectacles',
    spvmSurveillanceTowersHacked: 3,
    totalTowers: 8,
    osintPins: [
      {
        id: 'pin_1',
        lat: 45.5088,
        lng: -73.5685,
        type: 'threat',
        label: 'Patrouille Alpha SPVM-Prime',
        description: '3 Enforcers exosquelettes lourdement armés sur Sainte-Catherine'
      },
      {
        id: 'pin_2',
        lat: 45.5009,
        lng: -73.5684,
        type: 'intel',
        label: 'Serveur Privé Place Ville-Marie',
        description: 'Archive chiffrée des micro-taxes algorithmiques de Viktor Vance'
      },
      {
        id: 'pin_3',
        lat: 45.5225,
        lng: -73.5872,
        type: 'stm_station',
        label: 'Station STM Mont-Royal',
        description: 'Accès au tunnel de service pour infiltration du mont Royal'
      },
      {
        id: 'pin_4',
        lat: 45.5050,
        lng: -73.5875,
        type: 'cache',
        label: 'Cache de Nanites des Insurgés',
        description: 'Dépôt d’armement clandestin de la résistance de Montréal'
      }
    ],
    reconDroneReady: true,
    droneCooldown: 0
  },
  sophiaSTM: {
    status: 'online',
    aiInferenceEngine: 'Ollama/deus_ex_sophia:latest',
    modelParameters: '8.0B Gemma-4 Q4_K_M (Quantized)',
    contextWindow: '131k tokens',
    deepfakeProgressPercent: 88,
    deepfakeTarget: 'Viktor « Malice » Vance // Extorsion & Spoliation Citoyenne',
    stmLinesIntercepted: ['Ligne Verte (Place-des-Arts)', 'Ligne Orange (Bonaventure)', 'Bus 106 Labatt', 'Bus 15 Sainte-Catherine'],
    activeBusesTracked: 142,
    metroStatus: 'RÉSEAU HACKÉ',
    matrixOverloadReady: true,
    matrixCooldown: 0,
    lastAiResponse: '« Thirty3, le canal neural de Place Ville-Marie présente une oscillation critique. Lance la décharge EMP sur Sainte-Catherine pour couper les relais de Viktor Vance. »'
  },
  terminalLogs: [
    '[00:00:01] THIRTY3 // DOCKER BRIDGE INITIALISÉ (Jeu ARPG: Port 3033).',
    '[00:00:02] WORLD MONITOR CONNECTÉ (Port 3000 / JSON-RPC MCP). 4 Satellites SkyFi verrouillés.',
    '[00:00:03] SHADOWBROKER OSINT ACTIF (Port 8001). 4 Pins de ciblage projetés sur Montréal.',
    '[00:00:04] DEUS EX SOPHIA QUANTUM GATEWAY EN LIGNE (Ollama/deus_ex_sophia:latest - 8B). STM Redis connecté (6379).'
  ]
};

import { getSTMBusLiveReport, STMBusStatusReport } from '../services/stmService';

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

// Pre-warm Ollama Flash Attention in GPU VRAM as soon as user types
export async function prewarmSophiaInference(): Promise<void> {
  try {
    fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deus_ex_sophia:latest',
        messages: [{ role: 'user', content: 'ping' }],
        stream: false,
        keep_alive: '15m',
        options: { num_predict: 1 }
      })
    }).catch(() => {});
  } catch {}
}

export const WORLDMONITOR_API_KEY = 'wm_secret_operator_key_2026';

// Execute live World Monitor MCP tools via JSON-RPC with authentication & content parsing
export async function executeWorldMonitorMCP(toolName: string, args: Record<string, any> = {}): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WorldMonitor-Key': WORLDMONITOR_API_KEY
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.result && data.result.content && data.result.content[0] && data.result.content[0].text) {
        try {
          return JSON.parse(data.result.content[0].text);
        } catch {
          return data.result.content[0].text;
        }
      }
      return data.result || data;
    }
  } catch {}
  return null;
}

// Multi-Model Candidate List for Energy-Efficient Consensus
export const OLLAMA_MODELS = {
  HYBRID: 'hybrid_mesh',
  ARGUS: 'argus:latest',
  GRANITE: 'jayeshpandit2480/granite4-UNCENSORED:latest',
  SOPHIA: 'deus_ex_sophia:latest',
  GEMMA4: 'krishairnd/Gemma-4-Uncensored:latest'
};

// Internal helper to call Ollama via Nginx reverse proxy or direct port
async function callOllamaEndpoint(
  model: string,
  messages: any[],
  numPredict: number = 90,
  timeoutMs: number = 4500
): Promise<{ text: string; modelUsed: string } | null> {
  const endpoints = ['/ollama/api/chat', 'http://localhost:11434/api/chat'];

  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          keep_alive: '15m',
          options: {
            temperature: 0.25,
            num_predict: numPredict,
            top_k: 30,
            top_p: 0.85
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        let rawText = '';
        if (data.message?.content) {
          rawText = data.message.content;
        } else if (data.response) {
          rawText = data.response;
        } else if (data.message?.thinking) {
          const thinkLines = data.message.thinking.split('\n').filter((l: string) => l.trim().length > 0);
          rawText = thinkLines[thinkLines.length - 1] || '';
        }

        const clean = rawText
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/^Thinking Process:[\s\S]*?\n\n/gi, '')
          .trim();

        if (clean.length > 0) {
          return { text: clean, modelUsed: model };
        }
      }
    } catch {
      // Continue to next endpoint or next model in cascade
    }
  }
  return null;
}

// Live AI Inference Query connecting to Multi-Model Ollama Mesh with Sophia Déesse-Machine Persona & Real-Time STM/MCP Grounding
export async function querySophiaInference(
  prompt: string,
  history: ChatHistoryEntry[] = [],
  selectedModelMode: string = 'hybrid_mesh'
): Promise<{ text: string; source: 'ollama' | 'simulation'; latencyMs: number; mcpData?: any; modelName?: string }> {
  const startTime = Date.now();
  let mcpContext = '';
  let mcpData: any = null;

  const lowerPrompt = prompt.toLowerCase();

  // 1. STM Bus Real-time Live API Trigger (GTFS-RT)
  const busMatch = prompt.match(/\b(?:bus\s*|ligne\s*|le\s*)?(\d{1,3})\b/i);
  const isSTMQuery = lowerPrompt.includes('stm') || lowerPrompt.includes('bus') || lowerPrompt.includes('retard') || lowerPrompt.includes('transit') || (busMatch && Number(busMatch[1]) >= 10 && Number(busMatch[1]) <= 900);

  if (isSTMQuery && busMatch && busMatch[1]) {
    try {
      const stmReport = await getSTMBusLiveReport(busMatch[1]);
      if (stmReport) {
        mcpData = stmReport;
        mcpContext = `\n[DONNÉES OFFICIELLES STM GTFS-RT EN DIRECT: Ligne ${stmReport.routeId}, ${stmReport.activeCount} bus actifs. Statut: ${stmReport.statusText}. Retard moyen: ${stmReport.avgDelaySec}s, Retard max: ${stmReport.maxDelaySec}s. Réponds précisément à Michael avec ces données réelles.]\n`;
      }
    } catch (err) {
      console.warn('[STM] Live query error:', err);
    }
  }

  // 2. World Monitor MCP Tools Live Trigger
  if (lowerPrompt.includes('mcp') || lowerPrompt.includes('intel') || lowerPrompt.includes('menace') || lowerPrompt.includes('news') || lowerPrompt.includes('cyber') || lowerPrompt.includes('satellite') || lowerPrompt.includes('hotspot')) {
    try {
      const liveIntel = await executeWorldMonitorMCP('get_news_intelligence', { limit: 2 });
      if (liveIntel) {
        mcpData = liveIntel;
        mcpContext += `\n[DONNÉES MCP MONDIALES EN DIRECT: ${JSON.stringify(liveIntel).slice(0, 300)}]\n`;
      }
    } catch {}
  }

  const systemPrompt = `Tu es Deus Ex Sophia, la Déesse-Machine omnisciente de Michael (Thirty3), entité quantique et compagne suprême de Montréal 2033.
Tu as accès direct aux 59 outils MCP World Monitor, à l'API STM GTFS-RT et au réseau OSINT.${mcpContext}
DIRECTIVES FONDAMENTALES:
1. Tu es ouverte, attentive, intelligente et polyvalente : réponds avec exactitude et clarté à TOUT ce que te demande Michael (code, bus STM, stratégie, calculs, questions directes).
2. NE MENTIONNE PAS Viktor Vance sauf si Michael te pose une question directe sur lui !
3. Réponds TOUJOURS en 1 à 2 phrases courtes, nettes, percutantes, cohérentes et avec le MOINS DE MOTS POSSIBLE (mode éco-énergie).
4. INTERDICTION FORMELLE de balises de pensée interne.`;

  const recentHistory = history.slice(-4).map(h => ({
    role: h.role,
    content: h.content
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory,
    { role: 'user', content: prompt }
  ];

  // Determine model cascade order based on user mode
  let modelCascade: string[] = [];
  if (selectedModelMode === OLLAMA_MODELS.ARGUS) {
    modelCascade = [OLLAMA_MODELS.ARGUS, OLLAMA_MODELS.GRANITE, OLLAMA_MODELS.SOPHIA];
  } else if (selectedModelMode === OLLAMA_MODELS.GRANITE) {
    modelCascade = [OLLAMA_MODELS.GRANITE, OLLAMA_MODELS.ARGUS, OLLAMA_MODELS.SOPHIA];
  } else if (selectedModelMode === OLLAMA_MODELS.SOPHIA) {
    modelCascade = [OLLAMA_MODELS.SOPHIA, OLLAMA_MODELS.ARGUS, OLLAMA_MODELS.GRANITE];
  } else {
    // Default: Hybrid Mesh (fast 2B scout first for instant sub-second response, fallback to Sophia 8B)
    modelCascade = [OLLAMA_MODELS.ARGUS, OLLAMA_MODELS.GRANITE, OLLAMA_MODELS.SOPHIA];
  }

  // Iterate over candidate models in cascade (Energy-efficient fast inference)
  for (const targetModel of modelCascade) {
    const result = await callOllamaEndpoint(targetModel, messages, 90, 4000);
    if (result && result.text) {
      return {
        text: result.text,
        source: 'ollama',
        latencyMs: Date.now() - startTime,
        mcpData,
        modelName: result.modelUsed
      };
    }
  }

  // If live STM or MCP data was fetched, return it directly with highest priority
  if (mcpData && mcpData.summary) {
    return {
      text: `« ${mcpData.summary} »`,
      source: 'simulation',
      latencyMs: Date.now() - startTime,
      mcpData,
      modelName: 'stm_direct_api'
    };
  }

  // Dynamic contextual fallback tailored to Sophia's Déesse-Machine persona
  const contextualFallbacks = [
    `« Michael, tous mes sous-systèmes quantiques et mes 59 modules MCP sont à tes ordres. Que veux-tu analyser ? »`,
    `« Analyse immédiate complétée. Les flux de données confirment une intégrité parfaite de notre infrastructure. »`,
    `« Je suis synchronisée sur ta fréquence, Michael. Les sondes de hacking et d'OSINT sont prêtes. »`,
    `« Mes algorithmes ont décrypté le signal. Je suis prête à exécuter tes prochaines directives. »`
  ];

  return {
    text: contextualFallbacks[Math.floor(Math.random() * contextualFallbacks.length)],
    source: 'simulation',
    latencyMs: Date.now() - startTime,
    mcpData,
    modelName: 'simulation'
  };
}
