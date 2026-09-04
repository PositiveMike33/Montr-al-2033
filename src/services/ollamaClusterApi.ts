/**
 * Ollama Cluster Management API Endpoints
 * Monitor and manage all 8 Ollama model containers
 */

import express from "express";
import { checkOllamaClusterHealth, listAllOllamaModels, OLLAMA_MODELS } from "./ollamaModelRouter";

const router = express.Router();

/**
 * GET /api/ollama/status
 * Full cluster health check
 */
router.get("/status", async (_req, res) => {
  try {
    const health = await checkOllamaClusterHealth();
    res.json({
      cluster: "Montreal-2033-Ollama",
      status: health.healthy === health.total ? "healthy" : "degraded",
      healthy: health.healthy,
      total: health.total,
      models: health.models,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to check cluster health",
    });
  }
});

/**
 * GET /api/ollama/models
 * List all models with detailed info
 */
router.get("/models", async (_req, res) => {
  try {
    const models = await listAllOllamaModels();
    res.json({
      count: models.length,
      models: models.map((m) => ({
        name: m.name,
        purpose: m.purpose,
        port: m.port,
        available: m.available,
        url: m.url,
        gpu_required: m.gpu_required,
        error: m.error,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to list models",
    });
  }
});

/**
 * GET /api/ollama/models/:modelName
 * Get specific model details
 */
router.get("/models/:modelName", async (req, res) => {
  try {
    const { modelName } = req.params;
    const model = OLLAMA_MODELS[modelName];

    if (!model) {
      res.status(404).json({
        error: `Model '${modelName}' not found`,
      });
      return;
    }

    // Check if model is available
    const response = await fetch(`${model.url}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });

    res.json({
      name: model.name,
      purpose: model.purpose,
      port: model.port,
      url: model.url,
      gpu_required: model.gpu_required,
      available: response.ok,
      container: `montreal-2033-ollama-${model.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to get model details",
    });
  }
});

/**
 * POST /api/ollama/models/:modelName/generate
 * Generate text using specific model
 */
router.post("/models/:modelName/generate", async (req, res) => {
  try {
    const { modelName } = req.params;
    const { prompt, stream = false, temperature = 0.7 } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Prompt required" });
      return;
    }

    const model = OLLAMA_MODELS[modelName];
    if (!model) {
      res.status(404).json({ error: `Model '${modelName}' not found` });
      return;
    }

    const response = await fetch(`${model.url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        prompt,
        stream,
        temperature,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Model ${response.status}`);
    }

    const data = await response.json();
    res.json({
      model: model.name,
      response: data.response || "",
      done: data.done,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Generation failed",
    });
  }
});

/**
 * GET /api/ollama/cluster-dashboard
 * HTML dashboard for monitoring all models
 */
router.get("/cluster-dashboard", async (_req, res) => {
  try {
    const health = await checkOllamaClusterHealth();
    const models = await listAllOllamaModels();

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Montréal 2033 — Ollama Cluster Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0e27;
      color: #00f3ff;
      font-family: 'Courier New', monospace;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #00f3ff;
      padding-bottom: 20px;
    }
    h1 { font-size: 2.5em; text-shadow: 0 0 10px #00f3ff; }
    .health-badge {
      display: inline-block;
      margin-top: 10px;
      padding: 5px 15px;
      border-radius: 5px;
      font-weight: bold;
    }
    .health-badge.healthy { background: #00ff00; color: #000; }
    .health-badge.degraded { background: #ffaa00; color: #000; }
    .health-badge.critical { background: #ff0000; color: #fff; }
    .status-bar {
      text-align: center;
      margin: 20px 0;
      font-size: 1.2em;
    }
    .models-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }
    .model-card {
      border: 2px solid #00f3ff;
      padding: 20px;
      border-radius: 10px;
      background: rgba(0, 243, 255, 0.05);
      transition: all 0.3s;
    }
    .model-card:hover {
      box-shadow: 0 0 20px #00f3ff;
      background: rgba(0, 243, 255, 0.1);
    }
    .model-card h3 { margin-bottom: 10px; }
    .model-card .status {
      display: inline-block;
      margin: 5px 0;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 0.9em;
    }
    .model-card .status.online { background: #00ff00; color: #000; }
    .model-card .status.offline { background: #ff0000; color: #fff; }
    .model-card .purpose { font-size: 0.9em; color: #00ccff; margin-top: 10px; }
    .model-card .port { font-size: 0.85em; color: #888; margin-top: 5px; }
    footer {
      text-align: center;
      margin-top: 50px;
      color: #666;
      border-top: 1px solid #00f3ff;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚡ MONTRÉAL 2033 — OLLAMA CLUSTER DASHBOARD</h1>
    <div class="health-badge ${health.healthy === health.total ? "healthy" : health.healthy > 0 ? "degraded" : "critical"}">
      ${health.healthy}/${health.total} Services Online
    </div>
  </div>

  <div class="status-bar">
    Cluster Status: ${health.healthy === health.total ? "✓ NOMINAL" : health.healthy > 0 ? "⚠ DEGRADED" : "✗ CRITICAL"}
  </div>

  <div class="models-grid">
    ${models
      .map(
        (m) => `
    <div class="model-card">
      <h3>${m.name}</h3>
      <div class="status ${m.available ? "online" : "offline"}">
        ${m.available ? "🟢 ONLINE" : "🔴 OFFLINE"}
      </div>
      <div class="purpose">${m.purpose}</div>
      <div class="port">Port: ${m.port}</div>
      ${m.error ? `<div style="color: #ff6666; margin-top: 10px;">Error: ${m.error}</div>` : ""}
    </div>
    `
      )
      .join("")}
  </div>

  <footer>
    Last updated: ${new Date().toISOString()}
  </footer>
</body>
</html>
    `;

    res.type("text/html").send(html);
  } catch (error: any) {
    res.status(500).send(`<h1>Dashboard Error: ${error.message}</h1>`);
  }
});

export default router;
