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
app.get("/api/shadowbroker/recon", (req, res) => {
  res.json({
    reconStatus: "SECURED",
    activeSignals: 18,
    intercepts: [
      { freq: "144.825 MHz", source: "Cellule Inquisitrice", signalStrength: -68, threat: "ALPHA" },
      { freq: "433.920 MHz", source: "Avant-poste Cryptique", signalStrength: -82, threat: "BETA" },
    ]
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
