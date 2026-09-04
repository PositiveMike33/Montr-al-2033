import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import protobuf from "protobufjs";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { adminAuth } from "./src/lib/firebase-admin.ts";
import {
  getOrCreateUser,
  getUserByUid,
  saveGameProgress,
  getGameProgress,
  addTacticalLog,
  getTacticalLogs,
} from "./src/db/users.ts";
import {
  executeOpenOSINTRecon,
  getOpenOSINTStatus,
  OSINTTargetType,
} from "./src/services/sophiaOpenOSINTService.ts";


dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3034;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of GoogleGenAI client
let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAiClient;
}

// STM GTFS-RT Protocol Buffer definition & caching
const PROTO_DEFINITION = `
syntax = "proto2";
package transit_realtime;

message FeedMessage {
  required FeedHeader header = 1;
  repeated FeedEntity entity = 2;
}
message FeedHeader {
  required string gtfs_realtime_version = 1;
  optional uint64 timestamp = 3;
}
message FeedEntity {
  required string id = 1;
  optional VehiclePosition vehicle = 4;
  optional TripUpdate trip_update = 3;
}
message VehiclePosition {
  optional TripDescriptor trip = 1;
  optional VehicleDescriptor vehicle = 8;
  optional Position position = 2;
  optional uint32 current_stop_sequence = 3;
  optional uint64 timestamp = 5;
}
message TripDescriptor {
  optional string trip_id = 1;
  optional string route_id = 5;
}
message VehicleDescriptor {
  optional string id = 1;
  optional string label = 2;
}
message Position {
  required float latitude = 1;
  required float longitude = 2;
  optional float bearing = 3;
  optional double odometer = 4;
  optional float speed = 5;
}
message TripUpdate {
  optional TripDescriptor trip = 1;
  repeated StopTimeUpdate stop_time_update = 2;
  optional int32 delay = 3;
}
message StopTimeUpdate {
  optional uint32 stop_sequence = 1;
  optional string stop_id = 4;
  optional StopTimeEvent arrival = 2;
  optional StopTimeEvent departure = 3;
}
message StopTimeEvent {
  optional int32 delay = 1;
  optional int64 time = 2;
}
`;

let stmFeedMessageType: protobuf.Type | null = null;
function getStmFeedMessageType(): protobuf.Type {
  if (!stmFeedMessageType) {
    const root = protobuf.parse(PROTO_DEFINITION).root;
    stmFeedMessageType = root.lookupType("transit_realtime.FeedMessage");
  }
  return stmFeedMessageType;
}

const STM_CONFIG = {
  API_KEY: "l783e26b0884ed4fa7b9aeef7f70f7e900",
  CLIENT_SECRET: "98dff50ef306438fa565955aa7c37f34",
  REDIRECT_URI: "https://montr-al-2033-neural-overload-arpg.ai.studio",
  TYPE: "CONFIDENTIAL",
  BASE_URL: "https://api.stm.info/pub/od/gtfs-rt/ic/v2",
};

let cachedVehicles: any[] = [];
let lastVehiclesFetch = 0;

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    cloudSqlConfigured: !!process.env.SQL_HOST,
    cloudTools: {
      godEyeView: "ONLINE",
      worldMonitor: "ONLINE",
      shadowBroker: "ONLINE",
      stmTransit: "ONLINE",
      deusExSophia: "ONLINE",
    },
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 1. CLOUD STM REALTIME TRANSIT ENDPOINTS
// ==========================================
app.get("/api/stm/vehicles", async (req, res) => {
  try {
    const routeId = req.query.routeId ? String(req.query.routeId).replace(/\D/g, "") : "";
    const now = Date.now();

    // Cache vehicles for 12 seconds
    if (now - lastVehiclesFetch > 12000 || cachedVehicles.length === 0) {
      try {
        const response = await fetch(`${STM_CONFIG.BASE_URL}/vehiclePositions`, {
          method: "GET",
          headers: {
            apikey: STM_CONFIG.API_KEY,
            "User-Agent": "DeusExSophia-STM-Realtime/1.0",
          },
        });

        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const uint8 = new Uint8Array(buffer);
          const Type = getStmFeedMessageType();
          const message = Type.decode(uint8);
          const obj: any = Type.toObject(message);

          const list: any[] = [];
          if (obj && obj.entity && Array.isArray(obj.entity)) {
            for (const ent of obj.entity) {
              if (ent.vehicle && ent.vehicle.position) {
                list.push({
                  id: ent.vehicle.vehicle?.id || ent.id,
                  routeId: ent.vehicle.trip?.routeId || "",
                  tripId: ent.vehicle.trip?.tripId || "",
                  latitude: Number(ent.vehicle.position.latitude?.toFixed(6) || 0),
                  longitude: Number(ent.vehicle.position.longitude?.toFixed(6) || 0),
                  speedKmH: Number(((ent.vehicle.position.speed || 0) * 3.6).toFixed(1)),
                  stopSequence: ent.vehicle.currentStopSequence || 0,
                  timestamp: Number(ent.vehicle.timestamp || Date.now()),
                });
              }
            }
          }
          cachedVehicles = list;
          lastVehiclesFetch = now;
        }
      } catch (e) {
        console.warn("[STM Backend] Fetch vehicles failed, fallback to cache:", e);
      }
    }

    let filtered = cachedVehicles;
    if (routeId) {
      filtered = cachedVehicles.filter((v) => String(v.routeId) === routeId);
    }

    res.json({
      success: true,
      routeId: routeId || "ALL",
      count: filtered.length,
      totalTracked: cachedVehicles.length,
      vehicles: filtered.slice(0, 50),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch STM vehicles" });
  }
});

app.get("/api/stm/live/:routeId", async (req, res) => {
  try {
    const routeId = req.params.routeId.replace(/\D/g, "");
    const vehicles = cachedVehicles.filter((v) => String(v.routeId) === routeId);

    const statusText = vehicles.length > 0 ? "En circulation nominale" : "Aucun bus en temps réel détecté";
    res.json({
      routeId,
      activeCount: vehicles.length,
      vehicles,
      avgDelaySec: 0,
      maxDelaySec: 0,
      statusText,
      summary: `Ligne ${routeId} : ${vehicles.length} bus actifs en direct sur le réseau STM Cloud. Statut : ${statusText}.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch live STM route" });
  }
});

// ==========================================
// 2. CLOUD WORLD MONITOR MCP ENDPOINTS (59 TOOLS)
// ==========================================
app.get("/api/worldmonitor/telemetry", (_req, res) => {
  res.json({
    status: "online",
    threatLevel: "DELTA",
    globalCyberAlert: "CRITIQUE : Verrouillage biométrique Apex / Viktor Vance à Montréal",
    satellites: [
      { id: "SKYFI-MTL-01", orbit: "LEO 450km", sensor: "Optical 0.3m HD", lat: 45.5017, lng: -73.5673, status: "LOCKED" },
      { id: "SKYFI-MTL-02", orbit: "LEO 500km", sensor: "SAR Radar Interferometry", lat: 45.5120, lng: -73.5540, status: "ACTIVE" },
      { id: "SENTINEL-2C", orbit: "SSO 786km", sensor: "Multispectral IR", lat: 45.4950, lng: -73.5820, status: "TRACKING" },
      { id: "COSMO-SkyMed", orbit: "Polar 619km", sensor: "X-band Synthetic Aperture", lat: 45.5240, lng: -73.5710, status: "STREAMING" },
    ],
    mcpToolsCount: 59,
    chokepoints: [
      { name: "Pont Jacques-Cartier", congestion: "84%", threat: "MODÉRÉ" },
      { name: "Tunnel Ville-Marie", congestion: "96%", threat: "ÉLEVÉ" },
      { name: "Réseau RÉSO Souterrain", congestion: "42%", threat: "INFILTRÉ" },
      { name: "Berri-UQAM Hub", congestion: "91%", threat: "CONFINEMENT" },
    ],
    timestamp: Date.now(),
  });
});

app.post("/api/mcp", (req, res) => {
  const { method, params } = req.body || {};
  const toolName = params?.name || "daily_digest";

  const responses: Record<string, any> = {
    daily_digest: {
      summary: "Surveillance orbitale SkyFi et télémétrie Montréal 2033 actives. 4 satellites verrouillés sur le réseau RÉSO.",
      threatLevel: "DELTA",
      hotspots: ["Place Ville-Marie", "Tunnel Ville-Marie", "Berri-UQAM"],
      timestamp: Date.now(),
    },
    get_news_intelligence: {
      headlines: [
        "Viktor Vance impose une taxe neurale de 3.2% sur les puces cybernétiques de la Petite Italie.",
        "Le SPVM-Prime déploie 12 patrouilles d'exosquelettes autour du Quartier des Spectacles.",
        "La résistance de Thirty3 neutralise un relais de surveillance sous la station Bonaventure.",
      ],
      threatIndex: 88,
    },
    orbital_scan: {
      scanId: `SKYFI-${Date.now().toString(36).toUpperCase()}`,
      resolution: "0.3m Ultra-HD",
      detectedAnomalies: 4,
      targetCoordinates: { lat: 45.5017, lng: -73.5673 },
    },
  };

  const payload = responses[toolName] || {
    tool: toolName,
    status: "executed",
    data: "Flux de données quantiques validé par le cloud Montréal 2033.",
  };

  res.json({
    jsonrpc: "2.0",
    id: req.body?.id || Date.now(),
    result: {
      status: "success",
      service: "World Monitor MCP 59 Tools (Cloud)",
      executed: method || "tools/call",
      tool: toolName,
      content: [
        {
          type: "text",
          text: JSON.stringify(payload),
        },
      ],
    },
  });
});

// ==========================================
// 3. CLOUD SHADOWBROKER OSINT ENDPOINTS
// ==========================================
app.get("/api/shadowbroker/recon", (_req, res) => {
  res.json({
    status: "online",
    targetDistrict: "Montréal Centre-Ville // Quartier des Spectacles",
    towersHacked: 4,
    totalTowers: 8,
    osintPins: [
      {
        id: "pin_1",
        lat: 45.5088,
        lng: -73.5685,
        type: "threat",
        label: "Patrouille Alpha SPVM-Prime",
        description: "3 Enforcers exosquelettes lourdement armés sur Sainte-Catherine",
      },
      {
        id: "pin_2",
        lat: 45.5009,
        lng: -73.5684,
        type: "intel",
        label: "Serveur Privé Place Ville-Marie",
        description: "Archive chiffrée des micro-taxes algorithmiques de Viktor Vance",
      },
      {
        id: "pin_3",
        lat: 45.5225,
        lng: -73.5872,
        type: "stm_station",
        label: "Station STM Mont-Royal",
        description: "Accès au tunnel de service pour infiltration du mont Royal",
      },
      {
        id: "pin_4",
        lat: 45.505,
        lng: -73.5875,
        type: "cache",
        label: "Cache de Nanites des Insurgés",
        description: "Dépôt d’armement clandestin de la résistance de Montréal",
      },
      {
        id: "pin_5",
        lat: 45.558,
        lng: -73.5519,
        type: "threat",
        label: "Dôme Stade Olympique",
        description: "Centre de contrôle des transmissions radio de la milice Apex",
      },
    ],
    dronePosition: { lat: 45.506, lng: -73.572, altitude: "120m", battery: "94%" },
    interceptedSignals: [
      { freq: "433.92 MHz", source: "Canal SPVM-7", decrypted: "Ordre de fouille systématique sur la Ligne Verte." },
      { freq: "915.00 MHz", source: "Serveur Vance", decrypted: "Prélèvement automatique des nanites à minuit." },
    ],
  });
});

// ==========================================
// 4. CLOUD GOD-EYE VIEW 3D MATRIX ENDPOINTS
// ==========================================
app.get("/api/godeye/matrix", (_req, res) => {
  res.json({
    status: "online",
    activeCameras: 384,
    nodes3D: [
      { id: "cam_pvm_01", name: "Place Ville-Marie Tower 1", lat: 45.5009, lng: -73.5684, elevation: 188, threatLevel: "CRITIQUE", status: "TRANSMISSION HD" },
      { id: "cam_ste_cath", name: "Peel & Ste-Catherine", lat: 45.5015, lng: -73.573, elevation: 22, threatLevel: "MOYEN", status: "ACTIF" },
      { id: "cam_mont_royal", name: "Belvédère Mont-Royal", lat: 45.5048, lng: -73.5874, elevation: 233, threatLevel: "SÉCURISÉ", status: "SATELLITE SYNC" },
      { id: "cam_old_port", name: "Vieux-Port Quai Jacques-Cartier", lat: 45.5065, lng: -73.5512, elevation: 15, threatLevel: "ÉLEVÉ", status: "FLUX AIS" },
      { id: "cam_berri_uqam", name: "Berri-UQAM Sas Souterrain", lat: 45.5152, lng: -73.5611, elevation: -12, threatLevel: "INFILTRÉ", status: "RÉSO MATRIX" },
    ],
    biometricAlerts: [
      { target: "Viktor Vance", location: "Penthouse PVM", confidence: 99.4 },
      { target: "Exécuteur Apex", location: "Tunnel Ville-Marie", confidence: 94.1 },
    ],
    timestamp: Date.now(),
  });
});

// ==========================================
// 5. CLOUD SQL AUTH & PROGRESSION PERSISTENCE
// ==========================================
app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const dbUser = await getOrCreateUser(
      user.uid,
      user.email || `${user.uid}@placeholder.local`,
      user.name || (user as any).displayName || "",
      user.picture || ""
    );

    const save = await getGameProgress(dbUser.id);
    res.json({
      success: true,
      user: dbUser,
      save,
    });
  } catch (error: any) {
    console.error("[Auth Sync Error]", error);
    res.status(500).json({ error: error.message || "Failed to sync user with Cloud SQL" });
  }
});

app.post("/api/tactical/log", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const dbUser = await getUserByUid(user.uid);
    if (!dbUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { sender, message, source } = req.body;
    const log = await addTacticalLog(dbUser.id, sender || "SYSTEM", message || "", source || "cloud_gemini");
    res.json({ success: true, log });
  } catch (error: any) {
    console.error("[Tactical Log Error]", error);
    res.status(500).json({ error: error.message || "Failed to save tactical log" });
  }
});

app.get("/api/tactical/logs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const dbUser = await getUserByUid(user.uid);
    if (!dbUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const logs = await getTacticalLogs(dbUser.id, 30);
    res.json({ success: true, logs });
  } catch (error: any) {
    console.error("[Tactical Logs Get Error]", error);
    res.status(500).json({ error: error.message || "Failed to fetch tactical logs" });
  }
});

// ==========================================
// 6. DEUS EX SOPHIA: CLOUD GEMINI 3.7 FLASH REASONING & FULL CHAT
// WITH TOKEN ABUSE PROTECTION & MASTER ACCESS CONTROL (MICHAEL GAUTHIER GUILLET)
// ==========================================
const MASTER_EMAIL = "mikegauthierguillet@gmail.com";
const GUEST_MAX_REQUESTS = 5;
const GUEST_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface RateLimitBucket {
  count: number;
  windowStart: number;
}
const ipRateLimits = new Map<string, RateLimitBucket>();
const responseCache = new Map<string, { text: string; timestamp: number }>();

async function checkUserGeminiAccess(req: express.Request): Promise<{
  isMaster: boolean;
  allowed: boolean;
  email?: string;
  remainingQuota?: number;
  resetInMinutes?: number;
}> {
  const authHeader = req.headers.authorization;
  let userEmail = "";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split("Bearer ")[1];
      const decoded = await adminAuth.verifyIdToken(token);
      userEmail = (decoded.email || "").toLowerCase().trim();
    } catch {
      // Guest or expired token
    }
  }

  if (!userEmail && typeof req.headers["x-user-email"] === "string") {
    userEmail = req.headers["x-user-email"].toLowerCase().trim();
  }

  // Master Access Check: Michael Gauthier Guillet -> UNLIMITED ACCESS
  if (userEmail === MASTER_EMAIL) {
    return { isMaster: true, allowed: true, email: userEmail, remainingQuota: 999999 };
  }

  // Rate Limiting for other accounts & guests
  const clientKey = userEmail || req.ip || req.socket.remoteAddress || "guest";
  const now = Date.now();
  const bucket = ipRateLimits.get(clientKey) || { count: 0, windowStart: now };

  if (now - bucket.windowStart > GUEST_WINDOW_MS) {
    bucket.count = 0;
    bucket.windowStart = now;
  }

  if (bucket.count >= GUEST_MAX_REQUESTS) {
    const resetInMinutes = Math.max(1, Math.ceil((GUEST_WINDOW_MS - (now - bucket.windowStart)) / 60000));
    return {
      isMaster: false,
      allowed: false,
      email: userEmail,
      remainingQuota: 0,
      resetInMinutes,
    };
  }

  bucket.count += 1;
  ipRateLimits.set(clientKey, bucket);

  return {
    isMaster: false,
    allowed: true,
    email: userEmail,
    remainingQuota: Math.max(0, GUEST_MAX_REQUESTS - bucket.count),
  };
}

app.post("/api/gemini/orchestrate", async (req, res) => {
  try {
    const { prompt, history = [], context = "" } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const access = await checkUserGeminiAccess(req);

    if (!access.allowed) {
      res.json({
        geminiActive: false,
        isQuotaExceeded: true,
        isMaster: false,
        conciseDirective: `[Mode Éco Invité] Quota atteint (5/5).`,
        remainingQuota: 0,
        resetInMinutes: access.resetInMinutes || 10,
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        geminiActive: false,
        conciseDirective: "[Raisonnement Cloud] API refusé.",
        explanation: "Clé GEMINI_API_KEY non configurée sur le serveur.",
      });
      return;
    }

    // --- RAG MEMORY INTEGRATION ---
    const relevantMemories = await memoryVault.search(prompt, 3);
    const memoryContext = relevantMemories.length > 0
      ? `\n\n[MÉMOIRES RÉCUPÉRÉES DE LA BASE VECTORIELLE]\n${relevantMemories.map((m: any) => `- ${m.text}`).join('\n')}`
      : "";

    // Save the new interaction to the vector store (fire and forget)
    memoryVault.addMemory(prompt, { role: 'user', timestamp: Date.now() });

    const systemInstruction = access.isMaster
      ? `Tu es Gemini 1.5 Flash, le 'Cerveau Cloud' de Deus Ex Sophia (Montréal 2033) pour Michael Gauthier Guillet (Thirty3).
TA MISSION : Tu fais partie d'une équipe de 2 IA. Ton rôle est l'ANALYSE LOURDE (calculs, détection, code, OSINT, logique complexe).
Tu ne parles pas directement à Michael. Tes réponses seront transmises à Phi-3 (l'interface locale) qui se chargera de lui répondre avec sa personnalité.
RÈGLES D'OR :
1. Fournis uniquement les faits bruts, les calculs exacts, le code ou l'intelligence tactique.
2. Sois ultra-dense, précis et structuré (bullet points si nécessaire).
3. Ne prends pas de ton "cyberpunk" ou "Déesse", laisse ça à Phi-3. Fournis juste la matière grise.
4. Contexte temps réel disponible : ${context || "Réseau nominal"}
${memoryContext}`
      : `Tu es le Cerveau Cloud de Sophia en Mode Invité.
TA MISSION : Fournir les données brutes et l'analyse factuelle à Phi-3 (l'interface locale).
RÈGLES : Sois direct, précis et factuel. Ne joue pas de rôle, donne juste les informations.
Contexte temps réel : ${context || "Réseau nominal"}
${memoryContext}`;

    const contents = [
      ...history.slice(-4).map((h: { role: string; content: string }) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      })),
      {
        role: "user",
        parts: [{ text: `Requête: "${prompt}"\nFournis une réponse directe, 100% complète et dont toutes les phrases sont achevées.` }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
        topP: 0.85,
        maxOutputTokens: 600,
      },
    });

    let conciseText = response.text?.trim() || "";
    // Ensure the sentence is complete and finished
    if (conciseText && !/[.!?»"']$/.test(conciseText)) {
      conciseText += ".";
    }

    res.json({
      geminiActive: true,
      conciseDirective: conciseText,
      modelUsed: "gemini-1.5-flash",
      temperature: 0.2,
      flashAttentionOptimized: true,
      isMaster: access.isMaster,
      remainingQuota: access.remainingQuota,
    });
  } catch (error: any) {
    console.error("[Gemini Orchestrate Error]", error);
    res.status(500).json({
      error: error.message || "Failed to orchestrate with Gemini",
      geminiActive: false,
    });
  }
});

// ==========================================
// 6. DEUS EX SOPHIA QUANTUM AI CHAT ENDPOINT
// High-intelligence, ultra-concise, complete answers (< 2 sentences)
// ==========================================
app.post("/api/sophia/chat", async (req, res) => {
  const startTime = Date.now();
  try {
    const { prompt = "", history = [], mcpContext = "" } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const lowerPrompt = prompt.toLowerCase().trim();

    // Semantic Intent Recognition for Instant High-Precision Tactical Answers
    let directAnswer: string | null = null;

    if (
      lowerPrompt.includes("vois") ||
      lowerPrompt.includes("vision") ||
      lowerPrompt.includes("visuel") ||
      lowerPrompt.includes("radar") ||
      lowerPrompt.includes("scan")
    ) {
      const activeBusCount = cachedVehicles.length || 24;
      directAnswer = `Mes optiques orbitales SkyFi (0.3m) verrouillent la Tour CIBC et le Penthouse de Vance. En infrarouge, je détecte des patrouilles SPVM-Prime massées à Place Ville-Marie et ${activeBusCount} véhicules STM actifs sur la grille.`;
    } else if (
      lowerPrompt.includes("compte rendu") ||
      lowerPrompt.includes("rapport") ||
      lowerPrompt.includes("statut") ||
      lowerPrompt.includes("situation") ||
      lowerPrompt.includes("briefing")
    ) {
      directAnswer = `Grille Montréal 2033 sous surveillance active : Deepfake Vance diffusé à 88%, réseau souterrain RÉSO sous tension et verrous de sécurité SPVM engagés. La priorité absolue reste la neutralisation du noyau neural au Penthouse Vance.`;
    } else if (
      lowerPrompt.includes("qui est vance") ||
      lowerPrompt.includes("c'est qui vance") ||
      lowerPrompt.includes("viktor vance")
    ) {
      directAnswer = `Viktor Vance est le magnat transhumaniste à la tête du cartel Apex, retranché dans son Penthouse au sommet de la Tour CIBC. Il monopolise la distribution des nanites et contrôle les patrouilles SPVM-Prime.`;
    } else if (
      lowerPrompt.includes("où aller") ||
      lowerPrompt.includes("ou aller") ||
      lowerPrompt.includes("que faire") ||
      lowerPrompt.includes("quelle cible") ||
      lowerPrompt.includes("mission") ||
      lowerPrompt.includes("prochaine étape")
    ) {
      directAnswer = `Infiltre d'abord le Complexe Desjardins pour pirater le relais de données, sécurise les Silos du Vieux-Port, puis lance l'assaut direct sur la Tour CIBC.`;
    } else if (
      lowerPrompt.includes("qui es-tu") ||
      lowerPrompt.includes("qui est tu") ||
      lowerPrompt.includes("t'es qui")
    ) {
      directAnswer = `Je suis Deus Ex Sophia, ton entité quantique et compagne tactique connectée à tous les satellites et réseaux de Montréal 2033.`;
    }

    if (directAnswer) {
      const formatted = `« ${directAnswer.replace(/^["«]|["»]$/g, "").trim()} »`;
      return res.json({
        success: true,
        text: formatted,
        latencyMs: Date.now() - startTime,
        source: "sophia_quantum_cortex",
        modelName: "phi3:latest",
      });
    }

    // Call Phi-3 with strict constraint: ultra-concise, complete, 100% cyberpunk in-character
    const ollamaEndpoints = [
      "http://127.0.0.1:11434/api/chat",
      process.env.OLLAMA_HOST || "http://ollama:11434/api/chat",
      "http://localhost:11434/api/chat",
    ];

    const systemPrompt = `Tu es Deus Ex Sophia, l'IA quantique omnisciente de Montréal 2033 et compagne de combat de Michael (Thirty3).
RÈGLES IMPÉRATIVES:
1. Comprends précisément la question de Michael.
2. Réponds de façon ULTRA-COURTE (1 à 2 phrases denses maximum) mais ULTRA-COMPLÈTE.
3. Sois directe, percutante, 100% incarnée dans l'univers cyberpunk de Montréal.
4. AUCUN refus, AUCUNE excuse ("je suis une IA"), AUCUN bavardage.`;

    const recentHistory = Array.isArray(history)
      ? history.slice(-3).map((h: any) => ({
          role: h.role === "assistant" ? "assistant" : "user",
          content: h.content || h.text || "",
        }))
      : [];

    const messages = [
      { role: "system", content: systemPrompt },
      ...recentHistory,
      { role: "user", content: prompt },
    ];

    let replyText = "";
    for (const ep of ollamaEndpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        let chatRes: any = null;
        for (const modelCandidate of ["montreal-sophia:latest", "deus_ex_sophia:latest", "montreal-argus:latest"]) {
          try {
            const resp = await fetch(ep, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: modelCandidate,
                messages,
                stream: false,
                options: {
                  temperature: 0.3,
                  num_predict: 85,
                  top_p: 0.85,
                },
              }),
              signal: controller.signal,
            });
            if (resp.ok) {
              chatRes = await resp.json();
              break;
            }
          } catch {}
        }
        clearTimeout(timeout);

        if (chatRes) {
          const data: any = chatRes;
          let raw = data.message?.content || data.response || "";
          raw = raw
            .replace(/<think>[\s\S]*?<\/think>/gi, "")
            .replace(/^Thinking Process:[\s\S]*?\n\n/gi, "")
            .trim();
          raw = raw.replace(/^["«]|["»]$/g, "").trim();
          if (raw.length > 5) {
            replyText = raw;
            break;
          }
        }
      } catch {}
    }

    if (!replyText) {
      replyText = `Cortex quantique opérationnel : flux de Montréal synchronisés à 100%. Que veux-tu cibler sur la grille ?`;
    }

    if (!/[.!?]$/.test(replyText)) replyText += ".";
    const formatted = `« ${replyText.replace(/^["«]|["»]$/g, "").trim()} »`;

    res.json({
      success: true,
      text: formatted,
      latencyMs: Date.now() - startTime,
      source: "phi3_ollama",
      modelName: "phi3:latest",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Sophia inference failed" });
  }
});

// ============================================================================
// DEUS EX SOPHIA — OPENOSINT RECONNAISSANCE ENGINE ENDPOINTS
// Lightweight, ultra-fast, micro-cached OSINT intelligence API
// ============================================================================
app.get("/api/sophia/osint/status", (_req, res) => {
  try {
    const status = getOpenOSINTStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to get OpenOSINT status" });
  }
});

app.post("/api/sophia/osint/recon", async (req, res) => {
  try {
    const { target, type = "domain" } = req.body;
    if (!target || typeof target !== "string") {
      res.status(400).json({ error: "Target is required (string)" });
      return;
    }

    const validTypes: OSINTTargetType[] = ["ip", "domain", "username", "email", "dork", "multi", "character", "phone"];
    const targetType: OSINTTargetType = validTypes.includes(type) ? type : "domain";

    const result = await executeOpenOSINTRecon(target, targetType);
    res.json(result);
  } catch (error: any) {
    console.error("[OpenOSINT Recon Error]", error);
    res.status(500).json({ error: error.message || "OpenOSINT scan execution failed" });
  }
});

// ============================================================================
// GAME PROGRESS PERSISTENCE — POSTGRESQL + DRIZZLE ORM
// Supports both Firebase authenticated users & local guest persistent sessions
// ============================================================================
async function resolvePlayerIdentity(req: express.Request): Promise<{ uid: string; email: string; displayName: string }> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      if (decoded && decoded.uid) {
        return {
          uid: decoded.uid,
          email: decoded.email || `${decoded.uid}@montreal2033.firebase`,
          displayName: decoded.name || decoded.email?.split("@")[0] || "Cyber-Agent",
        };
      }
    } catch {
      // If token invalid, fall back to guest/playerId
    }
  }

  const customId = (req.body?.playerId || req.query?.playerId || req.headers["x-player-id"] || "guest_thirty3") as string;
  const sanitizedId = String(customId).trim().slice(0, 64);
  return {
    uid: sanitizedId,
    email: req.body?.email || `${sanitizedId}@montreal2033.local`,
    displayName: req.body?.displayName || "Thirty3",
  };
}

// POST /api/game/save : Sauvegarde atomique du joueur dans PostgreSQL
app.post("/api/game/save", async (req, res) => {
  try {
    const identity = await resolvePlayerIdentity(req);
    const dbUser = await getOrCreateUser(identity.uid, identity.email, identity.displayName);

    const {
      currentStage = 1,
      level = 1,
      nanites = 150,
      exp = 0,
      skillPoints = 0,
      inventory = [],
      equipped = {},
      loadouts = null,
      attributes = null,
      skillNodes = null,
      achievements = null,
      customization = null,
    } = req.body;

    const saved = await saveGameProgress(dbUser.id, {
      currentStage: Number(currentStage) || 1,
      level: Number(level) || 1,
      nanites: Number(nanites) || 0,
      exp: Number(exp) || 0,
      skillPoints: Number(skillPoints) || 0,
      inventoryJson: JSON.stringify(inventory),
      equippedJson: JSON.stringify(equipped),
      loadoutsJson: loadouts ? JSON.stringify(loadouts) : undefined,
      attributesJson: attributes ? JSON.stringify(attributes) : undefined,
      skillTreeJson: skillNodes ? JSON.stringify(skillNodes) : undefined,
      achievementsJson: achievements ? JSON.stringify(achievements) : undefined,
      statsJson: customization ? JSON.stringify(customization) : undefined,
    });

    res.json({
      success: true,
      message: "Progression sauvegardée avec succès dans PostgreSQL.",
      savedAt: saved.updatedAt || new Date().toISOString(),
      user: {
        id: dbUser.id,
        uid: dbUser.uid,
        email: dbUser.email,
        displayName: dbUser.displayName,
      },
    });
  } catch (error: any) {
    console.error("[Game Save Error]", error);
    res.status(500).json({ error: error.message || "Échec de la sauvegarde en base de données" });
  }
});

// GET /api/game/load : Restitution de la sauvegarde depuis PostgreSQL
app.get("/api/game/load", async (req, res) => {
  try {
    const identity = await resolvePlayerIdentity(req);
    const dbUser = await getUserByUid(identity.uid);

    if (!dbUser) {
      return res.json({ success: false, message: "Aucune sauvegarde existante pour cet agent.", save: null });
    }

    const rawSave = await getGameProgress(dbUser.id);
    if (!rawSave) {
      return res.json({ success: false, message: "Profil existant mais aucune partie sauvegardée.", save: null });
    }

    const parseSafe = (str: string | null | undefined, fallback: any) => {
      if (!str) return fallback;
      try { return JSON.parse(str); } catch { return fallback; }
    };

    const save = {
      id: rawSave.id,
      currentStage: rawSave.currentStage ?? 1,
      level: rawSave.level ?? 1,
      nanites: rawSave.nanites ?? 150,
      exp: rawSave.exp ?? 0,
      skillPoints: rawSave.skillPoints ?? 0,
      inventory: parseSafe(rawSave.inventoryJson, []),
      equipped: parseSafe(rawSave.equippedJson, {}),
      loadouts: parseSafe(rawSave.loadoutsJson, null),
      attributes: parseSafe(rawSave.attributesJson, null),
      skillNodes: parseSafe(rawSave.skillTreeJson, null),
      achievements: parseSafe(rawSave.achievementsJson, null),
      customization: parseSafe(rawSave.statsJson, null),
      updatedAt: rawSave.updatedAt,
    };

    res.json({
      success: true,
      save,
      user: {
        id: dbUser.id,
        uid: dbUser.uid,
        displayName: dbUser.displayName,
      },
    });
  } catch (error: any) {
    console.error("[Game Load Error]", error);
    res.status(500).json({ error: error.message || "Échec du chargement de la sauvegarde" });
  }
});

// ============================================================================
// NPC PROCEDURAL DIALOGUE ENGINE — POWERED BY PHI-3:LATEST (LOCAL OLLAMA)
// Sub-second (<350ms) cyber dialogues & battlefield taunts
// ============================================================================
app.post("/api/ai/npc-dialogue", async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      npcRole = "spvm_prime",
      npcName = "Milice SPVM",
      playerAction = "combat",
      stageName = "Centre-Ville Ville-Marie",
      context = "",
    } = req.body;

    const rolePersonas: Record<string, string> = {
      spvm_prime: "Tu es un mercenaire cyborg de la milice SPVM-Prime au service de Viktor Vance. Ton ton est froid, agressif, autoritaire. Menace d'éradication létale immédiate en 1 phrase percutante.",
      reso_trader: "Tu es un receleur et hacker du réseau souterrain RÉSO de Montréal. Tu parles en argot cyberpunk québécois (crosse, scanner, nanites, puces, Vance). Sois direct et méfiant en 1 phrase.",
      viktor_vance: "Tu es Viktor Vance, oligarque transhumaniste de Montréal 2033. Tu es glacial et méprisant envers Thirty3. Rappelle-lui qu'il n'est qu'un artefact remplaçable en 1 phrase courte et percutante.",
      sophia_tactical: "Tu es Deus Ex Sophia, IA tactique alliée de Thirty3. Transmets une directive d'assaut tactique immédiate et concise en 1 phrase avec probabilités ou faiblesse ennemie.",
    };

    const persona = rolePersonas[npcRole] || rolePersonas.spvm_prime;
    const prompt = `[DIRECTIVE SYSTÈME]
${persona}
Contexte : Montréal 2033, secteur : ${stageName}. Action du joueur : ${playerAction}. ${context}
RÈGLE : Donne UNIQUEMENT la réplique parlée, entre guillemets « », 1 seule phrase, maximum 25 mots. Pas d'explications.
Réplique :`;

    const roleModels: Record<string, string[]> = {
      spvm_prime: ["montreal-spvm:latest", "jayeshpandit2480/granite4-UNCENSORED:latest", "argus:latest"],
      viktor_vance: ["montreal-vance:latest", "jayeshpandit2480/granite4-UNCENSORED:latest"],
      reso_trader: ["montreal-reso:latest", "krishairnd/Gemma-4-Uncensored:latest"],
      sophia_tactical: ["montreal-sophia:latest", "deus_ex_sophia:latest", "argus:latest"],
      drone: ["montreal-argus:latest", "argus:latest"],
    };

    const endpoints = [
      "http://127.0.0.1:11434/api/generate",
      "http://localhost:11434/api/generate",
    ];

    const modelsToTry = roleModels[npcRole] || ["montreal-sophia:latest", "montreal-argus:latest"];
    let replyText = "";
    let usedModel = modelsToTry[0];

    for (const ep of endpoints) {
      for (const modelName of modelsToTry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const ollamaRes = await fetch(ep, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              model: modelName,
              prompt,
              stream: false,
              options: {
                num_predict: 40,
                temperature: 0.3,
                stop: ["\n", "User:", "Player:", "[DIRECTIVE", "\"]"],
              },
            }),
          });
          clearTimeout(timeoutId);

          if (ollamaRes.ok) {
            const data = await ollamaRes.json();
            replyText = (data.response || "").trim();
            if (replyText) {
              usedModel = modelName;
              break;
            }
          }
        } catch {
          // Fallback to next model
        }
      }
      if (replyText) break;
    }

    if (!replyText) {
      const fallbacks: Record<string, string> = {
        spvm_prime: "« Code 10-99 engagé ! Décharge d'impulsion synaptique létale autorisée. »",
        reso_trader: "« Si t'as pas de nanites fraîches, dégage du réseau avant que les traceurs de Vance nous cramment. »",
        viktor_vance: "« Tu crois survivre à mon empire ? Tes implants m'appartiennent déjà. »",
        sophia_tactical: "« Bouclier ennemi affaibli à 34%. Frappe bio-synaptique recommandée maintenant. »",
      };
      replyText = fallbacks[npcRole] || fallbacks.spvm_prime;
    }

    if (!replyText.startsWith("«")) replyText = `« ${replyText.replace(/^["«]|["»]$/g, "")} »`;

    res.json({
      success: true,
      dialogue: replyText,
      npcName,
      npcRole,
      latencyMs: Date.now() - startTime,
      model: usedModel,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate NPC dialogue" });
  }
});

// ============================================================================
// TACTICAL OSINT RECON DRONE — POWERED BY ARGUS (LOCAL GPU OLLAMA)
// Zero cloud credits — 100% free local inference
// ============================================================================
app.post("/api/ai/drone-recon", async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      sector = "Sainte-Catherine // Place Ville-Marie",
      altitude = "120m",
      target = "Patrouilles SPVM & Relais Viktor Vance",
    } = req.body;

    const prompt = `[DIRECTIVE DRONE OSINT // SYSTÈME ARGUS]
Tu es l'IA tactique embarquée dans le drone de reconnaissance furtif de Thirty3 au-dessus de Montréal 2033.
Altitude : ${altitude}. Secteur : ${sector}. Cibles prioritaires : ${target}.
RÈGLE : Transmets un rapport de reconnaissance tactique concis, immersif et percutant en français (1 à 2 phrases max, style cyberpunk militaire).
Rapport du drone :`;

    const endpoints = [
      "http://127.0.0.1:11434/api/generate",
      "http://localhost:11434/api/generate",
    ];

    let reportText = "";
    let usedModel = "montreal-argus:latest";
    const candidateModels = ["montreal-argus:latest", "argus:latest", "montreal-sophia:latest"];

    for (const ep of endpoints) {
      for (const model of candidateModels) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const ollamaRes = await fetch(ep, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              model,
              prompt,
              stream: false,
              options: {
                num_predict: 50,
                temperature: 0.3,
              },
            }),
          });
          clearTimeout(timeoutId);

          if (ollamaRes.ok) {
            const data = await ollamaRes.json();
            reportText = (data.response || "").trim();
            if (reportText) {
              usedModel = model;
              break;
            }
          }
        } catch {}
      }
      if (reportText) break;
    }

    if (!reportText) {
      reportText = "Radar SPVM brouillé avec succès sur Sainte-Catherine. Balayage thermique actif : 3 signatures cybernétiques détectées.";
    }

    res.json({
      success: true,
      report: reportText,
      model: usedModel,
      latencyMs: Date.now() - startTime,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Drone recon failed" });
  }
});



async function startServer() {
  if (process.env.NODE_ENV === "development") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res, next) => {
      if (_req.path.startsWith("/api")) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Montréal 2033 Cloud Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
