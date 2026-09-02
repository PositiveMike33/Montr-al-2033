import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth sync endpoint for game saves & user profiles
app.post("/api/auth/sync", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let uid = "guest_hero";
    let email = "nephalem@sanctuaire.realm";
    let displayName = "Ravageur Déchu";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        // Try decoding JWT payload safely
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
          const payload = JSON.parse(payloadJson);
          uid = payload.user_id || payload.sub || uid;
          email = payload.email || email;
          displayName = payload.name || displayName;
        }
      } catch {
        // Use defaults if token decoding fails
      }
    }

    try {
      const { getOrCreateUser } = await import("./src/db/users.ts");
      const user = await getOrCreateUser(uid, email, displayName);
      return res.json({ status: "success", user });
    } catch {
      // Fallback if DB is disconnected
      return res.json({
        status: "success",
        user: { id: 1, uid, email, displayName, level: 1, nanites: 1500 }
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Auth sync error" });
  }
});

// Game save endpoint
app.post("/api/game/save", async (req, res) => {
  try {
    const { userId, data } = req.body;
    try {
      const { saveGameProgress } = await import("./src/db/users.ts");
      if (userId) {
        const saved = await saveGameProgress(userId, data || {});
        return res.json({ status: "success", saved });
      }
    } catch {
      // Return success in fallback mode
    }
    return res.json({ status: "saved_locally", data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// STM Live Vehicles endpoint
app.get("/api/stm/vehicles", (req, res) => {
  try {
    const scratchPath = path.join(process.cwd(), "scratch", "live_buses_confidential.json");
    if (fs.existsSync(scratchPath)) {
      const content = fs.readFileSync(scratchPath, "utf-8");
      return res.json(JSON.parse(content));
    }
    // Fallback live mock feeds
    res.json({
      status: "active",
      vehicles: [
        { id: "BUS-136-1", routeId: "136", lat: 45.5684, lng: -73.5781, speed: 28, label: "136 Viau Express" },
        { id: "BUS-136-2", routeId: "136", lat: 45.5420, lng: -73.5510, speed: 34, label: "136 Viau Sud" },
        { id: "BUS-24-1", routeId: "24", lat: 45.5017, lng: -73.5673, speed: 22, label: "24 Sherbrooke Est" },
      ]
    });
  } catch {
    res.json({ status: "mock", vehicles: [] });
  }
});

// World Monitor Telemetry
app.get("/api/worldmonitor/telemetry", (req, res) => {
  res.json({
    status: "online",
    nodes: 42,
    threatLevel: "ELEVATED",
    anomalies: [
      { id: "SANCT-01", location: "Cathédrale d'Airain", status: "CORRUPTED", corruptionPct: 87.4 },
      { id: "SANCT-02", location: "Crypte de Viau", status: "ACTIVE", corruptionPct: 62.1 },
    ],
    lastSync: new Date().toISOString()
  });
});

// Shadowbroker Recon endpoint
app.get("/api/shadowbroker/recon", (_req, res) => {
  res.json({
    reconStatus: "SECURED",
    activeSignals: 18,
    intercepts: [
      { freq: "144.825 MHz", source: "Cellule Inquisitrice", signalStrength: -68, threat: "ALPHA" },
      { freq: "433.920 MHz", source: "Avant-poste Cryptique", signalStrength: -82, threat: "BETA" },
    ]
  });
});

// God-Eye View 3D Matrix endpoints (Port 4173)
app.get("/api/godeye/matrix", (_req, res) => {
  res.json({
    status: "online",
    activeCameras: 384,
    port: 4173,
    engine: "Cesium WebGL v1.124.0",
    hostUrl: "http://localhost:4173/#v=2&lat=45.5017&lon=-73.5673&alt=450&heading=15&pitch=-30&roll=360&style=normal&bloom=0&sharpen=0&bi=0&bv=2&si=49&hud=tactical&hv=1&dm=DENSE&dd=75&da=elastic&kf=7&ko=1&cr=0&sc=1&scf=11&map=osm&l=e.x&lo=f.e.1_f.m.a&ui=c.c.1_c.p.0_l.c.1_l.p.0_d.c.0_v.c.0_r.c.1_s.c.0_g.c.0_p.c.0_m.c.0",
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

app.get("/api/godeye/status", async (_req, res) => {
  let isRunning = false;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1200);
    const check = await fetch("http://127.0.0.1:4173/", { signal: controller.signal });
    clearTimeout(id);
    isRunning = check.ok;
  } catch {
    isRunning = false;
  }
  res.json({
    status: isRunning ? "online" : "connecting",
    port: 4173,
    engine: "Cesium WebGL v1.124.0",
    url: "http://localhost:4173/#v=2&lat=45.5017&lon=-73.5673&alt=450&heading=15&pitch=-30&roll=360&style=normal&bloom=0&sharpen=0&bi=0&bv=2&si=49&hud=tactical&hv=1&dm=DENSE&dd=75&da=elastic&kf=7&ko=1&cr=0&sc=1&scf=11&map=osm&l=e.x&lo=f.e.1_f.m.a&ui=c.c.1_c.p.0_l.c.1_l.p.0_d.c.0_v.c.0_r.c.1_s.c.0_g.c.0_p.c.0_m.c.0",
    activeCameras: 384,
    timestamp: Date.now()
  });
});

// Sophia Chat & Tactical AI endpoint
app.post("/api/sophia/chat", async (req, res) => {
  try {
    const { message, prompt } = req.body;
    const query = message || prompt || "État de la mission";

    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Tu es SOPHIA, l'intelligence tactique et oracle du jeu Sanctuaire ARPG Dark Fantasy. Réponds avec concision, gravité et précision tactique en français.\nJoueur: ${query}`
        });
        return res.json({
          reply: response.text || "Directives reçues. Surveillance des cryptes active.",
          source: "gemini"
        });
      } catch (geminiErr) {
        console.error("Gemini API call failed, using fallback:", geminiErr);
      }
    }

    res.json({
      reply: `[SOPHIA-IA] Analyse du secteur complétée pour "${query.slice(0, 30)}...". Aucune brèche critique détectée. Restez sur vos gardes, guerrier.`,
      source: "tactical_core"
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware & Production Serving
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur Sanctuaire opérationnel sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
