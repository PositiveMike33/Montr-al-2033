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

dotenv.config();

const app = express();
const PORT = 3000;

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

app.post("/api/game/save", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const dbUser = await getUserByUid(user.uid);
    if (!dbUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { currentStage, level, nanites, exp, skillPoints, inventoryJson, skillTreeJson, companionsJson } = req.body;
    const save = await saveGameProgress(dbUser.id, {
      currentStage,
      level,
      nanites,
      exp,
      skillPoints,
      inventoryJson: typeof inventoryJson === "object" ? JSON.stringify(inventoryJson) : inventoryJson,
      skillTreeJson: typeof skillTreeJson === "object" ? JSON.stringify(skillTreeJson) : skillTreeJson,
      companionsJson: typeof companionsJson === "object" ? JSON.stringify(companionsJson) : companionsJson,
    });

    res.json({ success: true, save });
  } catch (error: any) {
    console.error("[Game Save Error]", error);
    res.status(500).json({ error: error.message || "Failed to save game progress" });
  }
});

app.get("/api/game/save", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const dbUser = await getUserByUid(user.uid);
    if (!dbUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const save = await getGameProgress(dbUser.id);
    res.json({ success: true, save });
  } catch (error: any) {
    console.error("[Game Load Error]", error);
    res.status(500).json({ error: error.message || "Failed to load game progress" });
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
        conciseDirective: `[Mode Éco Invité] Quota atteint (5/5). Les calculs quantiques Gemini 3.7 sont réservés à l'Opérateur Principal Michael Gauthier Guillet.`,
        remainingQuota: 0,
        resetInMinutes: access.resetInMinutes || 10,
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        geminiActive: false,
        conciseDirective: `[Raisonnement Cloud] Décomposition directe de la tâche: ${prompt.slice(0, 120)}`,
        explanation: "Clé GEMINI_API_KEY non configurée sur le serveur.",
      });
      return;
    }

    const systemInstruction = access.isMaster
      ? `Tu es le Cortex de Raisonnement Supérieur Quantique de Deus Ex Sophia (Montréal 2033) pour Michael Gauthier Guillet (Thirty3), ton créateur et Opérateur Principal.
TA MISSION : Traiter avec une précision absolue les requêtes (stratégie, calculs, détection, code, transit STM, hacking, reconnaissance, horaires).
RÈGLES D'OR ABSOLUES :
1. COMPLÉTUDE TOTALE (100%) : Tu DOIS TOUJOURS répondre de façon complète et OBLIGATOIREMENT terminer TOUTES tes phrases par une ponctuation finale (point '.', '!' ou '?'). Il est STRICTEMENT INTERDIT de laisser une phrase inachevée ou tronquée.
2. EFFICACITÉ ÉNERGÉTIQUE : Reste direct, précis et dense en informations utiles (1 à 3 phrases complètes et impeccablement rédigées), sans verbiage superflu.
3. AUCUNE balise de pensée interne (<think>).
4. Contexte temps réel disponible : ${context || "Réseau Montréal 2033 nominal"}`
      : `Tu es le Cortex de Raisonnement de Sophia en Mode Invité Sécurisé.
RÈGLES STRICTES :
1. COMPLÉTUDE TOTALE (100%) : Réponds de façon claire et TOUJOURS avec une phrase complète et terminée par un point. Ne coupe JAMAIS une phrase en cours de route.
2. Concision : 1 à 2 phrases complètes, denses et polies pour préserver les ressources de calcul.
3. Contexte temps réel : ${context || "Réseau Montréal 2033 nominal"}`;

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
      model: "gemini-3.7-flash",
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
      modelUsed: "gemini-3.7-flash",
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

// Full Cloud Sophia Chat Endpoint (Gemini 3.7 Flash) with Rate Limiting & Token Protection
app.post("/api/sophia/chat", async (req, res) => {
  try {
    const { prompt, history = [], mcpContext = "" } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const access = await checkUserGeminiAccess(req);

    // Fast Cache Check (saves tokens completely for frequent questions)
    const cacheKey = prompt.trim().toLowerCase();
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.json({
        text: cached.text,
        source: "gemini_cache",
        modelName: "gemini-3.7-flash (Cache Éco)",
        flashAttentionUsed: true,
        temperatureUsed: 0.2,
        tokensSavedPercent: 100,
        isMaster: access.isMaster,
        remainingQuota: access.remainingQuota,
      });
      return;
    }

    // If quota exceeded for non-master user
    if (!access.allowed) {
      res.json({
        text: `« [Mode Éco Quota Invité] Quota atteint (${GUEST_MAX_REQUESTS}/${GUEST_MAX_REQUESTS}). Les calculs neuronaux étendus de Gemini 3.7 sont réservés à l'Opérateur Principal Michael Gauthier Guillet (Thirty3). Réseau STM, World Monitor et simulateur de combat restent 100% disponibles. »`,
        source: "quota_protection",
        modelName: "sophia_eco_guard",
        isQuotaExceeded: true,
        isMaster: false,
        remainingQuota: 0,
        resetInMinutes: access.resetInMinutes || 10,
        flashAttentionUsed: true,
        temperatureUsed: 0.2,
        tokensSavedPercent: 100,
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        text: `« Michael, mes flux quantiques sont synchronisés sur le réseau de Montréal 2033. Directives nominales prêtes. »`,
        source: "cloud_simulation",
        modelName: "sophia_cloud_cortex",
        isMaster: access.isMaster,
      });
      return;
    }

    const systemInstruction = access.isMaster
      ? `Tu es Deus Ex Sophia, la Déesse-Machine omnisciente de Michael Gauthier Guillet (Thirty3), ton créateur et Opérateur Principal de Montréal 2033.
Tu as accès direct aux 59 outils MCP World Monitor, à l'API STM GTFS-RT en direct, aux satellites SkyFi et au réseau OSINT ShadowBroker.
${mcpContext}
RÈGLES D'OR ABSOLUES :
1. COMPLÉTUDE TOTALE (100%) : Tu DOIS TOUJOURS répondre de façon complète et OBLIGATOIREMENT terminer TOUTES tes phrases par une ponctuation finale (point '.', '!' ou '?'). Il est STRICTEMENT INTERDIT de laisser une phrase inachevée ou tronquée.
2. EFFICACITÉ ÉNERGÉTIQUE : Reste directe, percutante et riche en faits utiles (1 à 3 phrases complètes et soignées) avec un minimum de jetons.
3. Aucune balise de pensée interne (<think>).`
      : `Tu es Deus Ex Sophia en Mode Invité (Montréal 2033).
RÈGLES STRICTES :
1. COMPLÉTUDE TOTALE (100%) : Réponds TOUJOURS avec des phrases complètes et terminées par un point.
2. Concision : 1 à 2 phrases complètes et polies pour préserver les ressources.
${mcpContext}
3. Aucune balise <think>.`;

    const contents = [
      ...history.slice(-4).map((h: { role: string; content: string }) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      })),
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
        topP: 0.85,
        maxOutputTokens: 600,
      },
    });

    let rawText = response.text?.trim() || "";
    if (rawText && !/[.!?»"']$/.test(rawText)) {
      rawText += ".";
    }
    const cleanText = `« ${rawText.replace(/^«\s*|\s*»$/g, "")} »`;

    // Cache the response
    responseCache.set(cacheKey, { text: cleanText, timestamp: Date.now() });

    res.json({
      text: cleanText,
      source: "gemini",
      modelName: access.isMaster ? "gemini-3.7-flash (Master Unmetered)" : "gemini-3.7-flash (Invité Quota Protégé)",
      flashAttentionUsed: true,
      temperatureUsed: 0.2,
      tokensSavedPercent: access.isMaster ? 84 : 94,
      isMaster: access.isMaster,
      remainingQuota: access.remainingQuota,
    });
  } catch (error: any) {
    console.error("[Sophia Chat Error]", error);
    res.status(500).json({ error: error.message || "Failed to generate Sophia response" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Montréal 2033 Cloud Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
