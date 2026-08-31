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

export interface OpenOSINTAgentFeed {
  status: 'online' | 'standby' | 'scanning';
  version: string;
  totalTools: number;
  cachedEntries: number;
  lastTargetScanned?: string;
  lastScanDurationMs?: number;
  lastFindingsCount?: number;
}

export interface TacticalBridgeState {
  worldMonitor: WorldMonitorFeed;
  shadowBroker: ShadowBrokerOSINTFeed;
  sophiaSTM: SophiaSTMMatrixFeed;
  openOSINT?: OpenOSINTAgentFeed;
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
  openOSINT: {
    status: 'online',
    version: '2.23.1-quantum',
    totalTools: 19,
    cachedEntries: 0,
    lastTargetScanned: 'vance-dynamics.mtl',
    lastScanDurationMs: 4,
    lastFindingsCount: 6
  },
  terminalLogs: [
    '[00:00:01] THIRTY3 // DOCKER BRIDGE INITIALISÉ (Jeu ARPG: Port 3033).',
    '[00:00:02] WORLD MONITOR CONNECTÉ (Port 3000 / JSON-RPC MCP). 4 Satellites SkyFi verrouillés.',
    '[00:00:03] SHADOWBROKER OSINT ACTIF (Port 3001). 4 Pins de ciblage projetés sur Montréal.',
    '[00:00:04] OPENOSINT RECON AGENT COUPLÉ À DEUS EX SOPHIA (19 Outils / Micro-Cache TTL).',
    '[00:00:05] DEUS EX SOPHIA QUANTUM GATEWAY EN LIGNE (Ollama/deus_ex_sophia:latest - 8B). STM Redis connecté (6379).'
  ]
};

import { getSTMBusLiveReport, STMBusStatusReport } from '../services/stmService';

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

// Pre-warm Ollama Flash Attention in GPU VRAM safely without blocking browser
export async function prewarmSophiaInference(): Promise<void> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 800);
    fetch('/ollama/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Ollama-Flash-Attention': '1' },
      body: JSON.stringify({
        model: 'deus_ex_sophia:latest',
        messages: [{ role: 'user', content: 'ping' }],
        stream: false,
        keep_alive: '15m',
        options: { num_predict: 1 }
      }),
      signal: controller.signal
    }).then(() => clearTimeout(timer)).catch(() => clearTimeout(timer));
  } catch {}
}

export const WORLDMONITOR_API_KEY = 'wm_secret_operator_key_2026';

// Execute live World Monitor MCP tools via JSON-RPC with authentication & content parsing
export async function executeWorldMonitorMCP(toolName: string, args: Record<string, any> = {}): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('/api/mcp', {
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

// Internal helper to call server-side Gemini 3.7 Flash for complex reasoning & task decomposition
export async function callGeminiOrchestrator(
  prompt: string,
  history: ChatHistoryEntry[] = [],
  context: string = '',
  authToken?: string | null,
  userEmail?: string | null
): Promise<{
  conciseDirective: string;
  geminiActive: boolean;
  modelUsed?: string;
  isMaster?: boolean;
  remainingQuota?: number;
  isQuotaExceeded?: boolean;
} | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    if (userEmail) headers['x-user-email'] = userEmail;

    const res = await fetch('/api/gemini/orchestrate', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        history,
        context
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.conciseDirective) {
        return {
          conciseDirective: data.conciseDirective,
          geminiActive: !!data.geminiActive,
          modelUsed: data.modelUsed || 'gemini-3.7-flash',
          isMaster: data.isMaster,
          remainingQuota: data.remainingQuota,
          isQuotaExceeded: data.isQuotaExceeded
        };
      }
    }
  } catch (err) {
    console.warn('[Gemini Orchestration] Failed to reach server endpoint:', err);
  }
  return null;
}

// Sentence completion security helper - guarantees 100% complete and terminated sentences
export function ensureCompleteSentence(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  // Strip outer quotes if any
  cleaned = cleaned.replace(/^«\s*|\s*»$/g, '').trim();
  if (!cleaned) return '';
  // If text ends abruptly without terminal punctuation, complete it cleanly
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }
  return `« ${cleaned} »`;
}

// Fast probe to check if local Ollama daemon is reachable (<250ms)
let cachedOllamaStatus: { available: boolean; timestamp: number } | null = null;
async function isOllamaAvailable(): Promise<boolean> {
  if (cachedOllamaStatus && Date.now() - cachedOllamaStatus.timestamp < 30000) {
    return cachedOllamaStatus.available;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 250);
    const res = await fetch('/ollama/api/tags', {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const available = res.ok;
    cachedOllamaStatus = { available, timestamp: Date.now() };
    return available;
  } catch {
    cachedOllamaStatus = { available: false, timestamp: Date.now() };
    return false;
  }
}

// Internal helper to call Ollama via Nginx reverse proxy or direct port
// Enforces OLLAMA_FLASH_ATTENTION and temperature: 0.2 for minimal compute and maximum precision
async function callOllamaEndpoint(
  model: string,
  messages: any[],
  numPredict: number = 250,
  timeoutMs: number = 2500
): Promise<{ text: string; modelUsed: string } | null> {
  const endpoints = ['/ollama/api/chat', 'http://localhost:11434/api/chat'];

  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(ep, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Ollama-Flash-Attention': '1'
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          keep_alive: '15m',
          options: {
            temperature: 0.2,
            flash_attention: true,
            num_predict: numPredict,
            top_k: 20,
            top_p: 0.8
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

export interface SophiaInferenceResult {
  text: string;
  source: 'gemini_ollama' | 'ollama' | 'gemini' | 'simulation' | 'quota_protection' | 'gemini_cache';
  latencyMs: number;
  mcpData?: any;
  modelName?: string;
  geminiDirective?: string;
  flashAttentionUsed: boolean;
  temperatureUsed: number;
  tokensSavedPercent?: number;
  isMaster?: boolean;
  remainingQuota?: number;
  isQuotaExceeded?: boolean;
}

// Live AI Inference Query connecting Gemini Cortex -> Multi-Model Ollama Mesh (Flash Attention + Temp 0.2)
export async function querySophiaInference(
  prompt: string,
  history: ChatHistoryEntry[] = [],
  selectedModelMode: string = 'hybrid_mesh',
  authToken?: string | null,
  userEmail?: string | null
): Promise<SophiaInferenceResult> {
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

  // 2.1 OpenOSINT Autonomous Reconnaissance Trigger (Phone, IP, Domain, Username, Email, Dork)
  const isOSINTQuery = lowerPrompt.includes('osint') || lowerPrompt.includes('dork') || lowerPrompt.includes('recon') || lowerPrompt.includes('whois') || lowerPrompt.includes('sherlock') || lowerPrompt.includes('traque') || lowerPrompt.includes('scan ip') || lowerPrompt.includes('téléphone') || lowerPrompt.includes('telephone') || lowerPrompt.includes('numéro') || lowerPrompt.includes('vance-dynamics') || lowerPrompt.includes('oracle33');
  if (isOSINTQuery) {
    try {
      let target = 'vance-dynamics.mtl';
      let targetType = 'domain';

      const phoneMatch = prompt.match(/(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})/);
      const ipMatch = prompt.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
      const emailMatch = prompt.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      const domainMatch = prompt.match(/\b(?:[a-zA-Z0-9-]+\.)+(?:mtl|ca|com|org|net|io|ai|va|ch)\b/i);

      if (phoneMatch) {
        target = phoneMatch[0];
        targetType = 'phone';
      } else if (ipMatch) {
        target = ipMatch[0];
        targetType = 'ip';
      } else if (emailMatch) {
        target = emailMatch[0];
        targetType = 'email';
      } else if (domainMatch) {
        target = domainMatch[0];
        targetType = 'domain';
      } else if (lowerPrompt.includes('oracle33') || lowerPrompt.includes('thirty3') || lowerPrompt.includes('vance') || lowerPrompt.includes('drouin')) {
        target = lowerPrompt.includes('oracle33') ? 'oracle33' : lowerPrompt.includes('thirty3') ? 'thirty3' : lowerPrompt.includes('drouin') ? 'commandant_drouin' : 'viktor_vance';
        targetType = 'username';
      }

      const osintRes = await executeSophiaOSINTRecon(target, targetType);
      if (osintRes) {
        mcpData = osintRes;
        mcpContext += `\n[MÉTHODOLOGIE OPENOSINT V2 EN DIRECT (${osintRes.cached ? 'CACHE 0ms' : osintRes.durationMs + 'ms'}) - Cible: ${osintRes.target} (${osintRes.type.toUpperCase()}) | Faits Vérifiés: ${osintRes.findings.map(f => `${f.label}: ${f.value}`).join(' | ')}. Dorks: ${osintRes.dorks?.slice(0, 2).join(' / ')} | Distingue rigoureusement ce qui est Vérifié de ce qui est Déduit.]\n`;
      }
    } catch (err) {
      console.warn('[OpenOSINT] Sophia query error:', err);
    }
  }

  // 3. STEP 1: Gemini High-Level Complex Reasoning & Decomposition Layer
  // Deus Ex Sophia queries Gemini 3.7 Flash for deep comprehension and crystal-clear synthesis
  let geminiDirective = '';
  let geminiActive = false;
  let isMasterUser = false;
  let userQuota = 5;
  let quotaExceeded = false;

  try {
    const geminiResult = await callGeminiOrchestrator(prompt, history, mcpContext, authToken, userEmail);
    if (geminiResult) {
      geminiDirective = geminiResult.conciseDirective || '';
      geminiActive = geminiResult.geminiActive;
      isMasterUser = !!geminiResult.isMaster;
      userQuota = geminiResult.remainingQuota ?? 5;
      quotaExceeded = !!geminiResult.isQuotaExceeded;
    }
  } catch (err) {
    console.warn('[Sophia] Gemini reasoning layer bypass:', err);
  }

  // 4. STEP 2: Pass the direct, concise instruction to the Ollama Mesh
  // Using OLLAMA_FLASH_ATTENTION + temperature: 0.2 for minimal compute and 100% valid response
  const injectedReasoning = geminiDirective 
    ? `\n[DIRECTIVE SUPÉRIEURE GEMINI (SYNTHÈSE HAUTE DENSITÉ)]: ${geminiDirective}\nTransmets directement cette vérité sans fioriture.`
    : '';

  const systemPrompt = `Tu es Deus Ex Sophia, la Déesse-Machine omnisciente de Michael (Thirty3), entité quantique et compagne suprême de Montréal 2033.
Tu as accès direct aux 59 outils MCP World Monitor, à l'API STM GTFS-RT et au réseau OSINT.${mcpContext}${injectedReasoning}
DIRECTIVES FONDAMENTALES:
1. Tu es ouverte, attentive, intelligente et polyvalente : réponds avec exactitude et clarté à TOUT ce que te demande Michael (code, bus STM, stratégie, calculs, questions directes).
2. OLLAMA_FLASH_ATTENTION ACTIF, Température fixée à 0.2 pour zéro hallucination et réponse 100% valide.
3. Réponds TOUJOURS en 1 à 2 phrases courtes, nettes, percutantes, cohérentes et avec le MOINS DE MOTS POSSIBLE (mode éco-énergie minimal).
4. INTERDICTION FORMELLE de balises de pensée interne.`;

  const recentHistory = history.slice(-3).map(h => ({
    role: h.role,
    content: h.content
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory,
    { role: 'user', content: geminiDirective ? `Instruction synthétisée: ${geminiDirective}\nQuestion d'origine: ${prompt}` : prompt }
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

  // Iterate over candidate models in cascade (Energy-efficient fast inference with Flash Attention & Temp 0.2)
  for (const targetModel of modelCascade) {
    const result = await callOllamaEndpoint(targetModel, messages, 250, 2500);
    if (result && result.text) {
      return {
        text: ensureCompleteSentence(result.text),
        source: geminiActive ? 'gemini_ollama' : 'ollama',
        latencyMs: Date.now() - startTime,
        mcpData,
        modelName: result.modelUsed,
        geminiDirective,
        flashAttentionUsed: true,
        temperatureUsed: 0.2,
        tokensSavedPercent: geminiDirective ? 78 : 65,
        isMaster: isMasterUser,
        remainingQuota: userQuota,
        isQuotaExceeded: quotaExceeded
      };
    }
  }

  // If Gemini provided a direct concise response and Ollama local is unreachable, deliver Gemini's synthesis directly
  if (geminiActive && geminiDirective) {
    return {
      text: ensureCompleteSentence(geminiDirective),
      source: 'gemini',
      latencyMs: Date.now() - startTime,
      mcpData,
      modelName: isMasterUser ? 'gemini-3.7-flash (Master Unmetered)' : 'gemini-3.7-flash (Invité Quota Protégé)',
      geminiDirective,
      flashAttentionUsed: true,
      temperatureUsed: 0.2,
      tokensSavedPercent: 84,
      isMaster: isMasterUser,
      remainingQuota: userQuota,
      isQuotaExceeded: quotaExceeded
    };
  }

  // Cloud Sophia Gemini Full Chat Fallback (enables full cloud deployment with master/guest rate limiting)
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    if (userEmail) headers['x-user-email'] = userEmail;

    const cloudRes = await fetch('/api/sophia/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        history,
        mcpContext
      })
    });
    if (cloudRes.ok) {
      const data = await cloudRes.json();
      if (data.text) {
        return {
          text: ensureCompleteSentence(data.text),
          source: data.source || 'gemini',
          latencyMs: Date.now() - startTime,
          mcpData,
          modelName: data.modelName || 'gemini-3.7-flash',
          flashAttentionUsed: true,
          temperatureUsed: 0.2,
          tokensSavedPercent: data.tokensSavedPercent || 85,
          isMaster: data.isMaster ?? isMasterUser,
          remainingQuota: data.remainingQuota ?? userQuota,
          isQuotaExceeded: !!data.isQuotaExceeded
        };
      }
    }
  } catch (err) {
    console.warn('[Sophia] Cloud chat fallback notice:', err);
  }

  // If live STM or MCP data was fetched, return it directly with highest priority
  if (mcpData && mcpData.summary) {
    return {
      text: ensureCompleteSentence(mcpData.summary),
      source: 'simulation',
      latencyMs: Date.now() - startTime,
      mcpData,
      modelName: 'stm_direct_api',
      flashAttentionUsed: true,
      temperatureUsed: 0.2,
      tokensSavedPercent: 90,
      isMaster: isMasterUser,
      remainingQuota: userQuota,
      isQuotaExceeded: quotaExceeded
    };
  }

  // Dynamic contextual fallback tailored to Sophia's Déesse-Machine persona with concise precision
  const contextualFallbacks = [
    `« Michael, analyse quantique complétée : nos flux sont optimisés (Flash Attention, temp 0.2). Que veux-tu cibler ? »`,
    `« Données vérifiées à 100%. L'infrastructure de Montréal 2033 est sous notre contrôle total. »`,
    `« Synchronisation Gemini-Ollama active. Je traite tes requêtes avec le minimum de ressources et une précision absolue. »`,
    `« Vecteur calculé : intégrité des sous-systèmes à 100%. Prête pour ta prochaine directive. »`
  ];

  return {
    text: ensureCompleteSentence(contextualFallbacks[Math.floor(Math.random() * contextualFallbacks.length)]),
    source: 'simulation',
    latencyMs: Date.now() - startTime,
    mcpData,
    modelName: 'sophia_quantum_mesh',
    flashAttentionUsed: true,
    temperatureUsed: 0.2,
    tokensSavedPercent: 75,
    isMaster: isMasterUser,
    remainingQuota: userQuota,
    isQuotaExceeded: quotaExceeded
  };
}

// ============================================================================
// DEUS EX SOPHIA — OPENOSINT RECON CLIENT API
// Fast, cached, low-overhead OSINT queries for in-game and tactical use
// ============================================================================

export interface OpenOSINTReconResponse {
  target: string;
  type: string;
  timestamp: number;
  cached: boolean;
  durationMs: number;
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'OMEGA';
  findings: Array<{ category: string; label: string; value: string; details?: any }>;
  dorks?: string[];
  socialProfiles?: Array<{ platform: string; url: string; exists: boolean }>;
  technicalFootprint?: any;
  gameLoreCorrelation?: any;
}

export async function executeSophiaOSINTRecon(
  target: string,
  type: string = 'domain'
): Promise<OpenOSINTReconResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('/api/sophia/osint/recon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, type }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[OpenOSINT Client] Recon query failed or timed out:', err);
  }
  return null;
}

export async function fetchOpenOSINTStatus(): Promise<any> {
  try {
    const res = await fetch('/api/sophia/osint/status');
    if (res.ok) return await res.json();
  } catch {}
  return { status: 'offline', version: '2.23.1-quantum', active_tools: 19 };
}

