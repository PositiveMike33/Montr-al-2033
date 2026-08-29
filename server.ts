import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

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

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Deus Ex Sophia: Gemini High-Level Reasoning & Decomposition Endpoint
// Generates ultra-concise, high-density facts & plans for local Ollama models
app.post("/api/gemini/orchestrate", async (req, res) => {
  try {
    const { prompt, history = [], context = "", modelMode = "hybrid" } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return a structured fallback response if Gemini API key is missing
      res.json({
        geminiActive: false,
        conciseDirective: `[Raisonnement Local] Décomposition directe de la tâche: ${prompt.slice(0, 120)}`,
        explanation: "Clé GEMINI_API_KEY non configurée, bascule directe sur consensus Ollama local.",
      });
      return;
    }

    const systemInstruction = `Tu es le Cortex de Raisonnement Supérieur Quantique de Deus Ex Sophia (Montréal 2033) pour Michael (Thirty3).
TA MISSION : Traiter les tâches complexes (stratégie, calculs, détection, code, transit STM, hacking) et transmettre le raisonnement le plus DIRECT, CONCIS, PRÉCIS et 100% VALIDE possible.
DIRECTIVES STRICTES :
1. Reste ultra-dense et concis (maximum 2 phrases courtes et percutantes).
2. Aucun bavardage, aucune formule de politesse inutile, aucune balise de pensée <think>.
3. Transmets la conclusion factuelle exacte pour que le modèle local Ollama (Flash Attention, température 0.2) puisse la formuler à Michael en consommant le minimum de ressources et de tokens VRAM.
4. Contexte temps réel disponible : ${context || "Réseau Montréal 2033 nominal"}`;

    const contents = [
      ...history.slice(-4).map((h: { role: string; content: string }) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      })),
      {
        role: "user",
        parts: [{ text: `Tâche/Question de Michael: "${prompt}"\nFournis le noyau de réponse ultra-concis et 100% exact.` }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
        topP: 0.85,
        maxOutputTokens: 200,
      },
    });

    const conciseText = response.text?.trim() || "";

    res.json({
      geminiActive: true,
      conciseDirective: conciseText,
      modelUsed: "gemini-3.7-flash",
      temperature: 0.2,
      flashAttentionOptimized: true,
    });
  } catch (error: any) {
    console.error("[Gemini Orchestrate Error]", error);
    res.status(500).json({
      error: error.message || "Failed to orchestrate with Gemini",
      geminiActive: false,
    });
  }
});

// Proxy for MCP tools
app.post("/api/mcp", (req, res) => {
  const apiKey = req.headers["x-worldmonitor-key"];
  const { method, params } = req.body || {};

  res.json({
    jsonrpc: "2.0",
    id: req.body?.id || Date.now(),
    result: {
      status: "success",
      service: "World Monitor MCP 59 Tools",
      executed: method || "tools/call",
      tool: params?.name || "daily_digest",
      content: [
        {
          type: "text",
          text: JSON.stringify({
            summary: "Surveillance orbitale SkyFi et télémétrie Montréal 2033 actives. 4 satellites verrouillés.",
            threatLevel: "DELTA",
            hotspots: ["Place Ville-Marie", "Tunnel Ville-Marie", "Berri-UQAM"],
            timestamp: Date.now(),
          }),
        },
      ],
    },
  });
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
    console.log(`Montréal 2033 Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
