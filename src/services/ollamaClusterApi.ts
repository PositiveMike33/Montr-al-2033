import { Router, Request, Response } from "express";
import {
  OLLAMA_CLUSTER_NODES,
  getClusterHealth,
  getNodeById,
  getNodeByModel,
  resolveNodeUrl,
  routeByPurpose,
  OllamaClusterNode,
} from "./ollamaModelRouter.ts";

export const ollamaClusterRouter = Router();

/**
 * GET /api/ollama/status
 * Health check global de tous les 8 nœuds Ollama.
 */
ollamaClusterRouter.get("/status", async (_req: Request, res: Response) => {
  try {
    const health = await getClusterHealth();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to audit cluster health" });
  }
});

/**
 * GET /api/ollama/models
 * Liste l'ensemble des 8 modèles, leurs spécifications et leurs conteneurs.
 */
ollamaClusterRouter.get("/models", (_req: Request, res: Response) => {
  const models = OLLAMA_CLUSTER_NODES.map((node) => ({
    id: node.id,
    container: node.containerName,
    model: node.model,
    aliases: node.aliases,
    role: node.role,
    description: node.description,
    type: node.type,
    size: node.size,
    hostPort: node.hostPort,
    internalPort: node.internalPort,
    purposes: node.purposes,
    resolvedUrl: resolveNodeUrl(node),
  }));
  res.json({ count: models.length, models });
});

/**
 * POST /api/ollama/models/:name/generate
 * Exécute une génération textuelle sur le conteneur du modèle spécifié.
 */
ollamaClusterRouter.post("/models/:name/generate", async (req: Request, res: Response) => {
  const modelQuery = req.params.name;
  const node = getNodeByModel(modelQuery) || getNodeById(modelQuery);

  if (!node) {
    res.status(404).json({
      error: `Model or node "${modelQuery}" not found in multi-container cluster.`,
      availableModels: OLLAMA_CLUSTER_NODES.map((n) => n.model),
    });
    return;
  }

  const { prompt, options, stream = false } = req.body;
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing required string parameter: prompt" });
    return;
  }

  const targetUrl = `${resolveNodeUrl(node)}/api/generate`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: node.model,
        prompt,
        stream,
        options: options || {},
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      res.status(response.status).json({
        error: `Target container ${node.containerName} responded with HTTP ${response.status}`,
        details: errText,
      });
      return;
    }

    const data = await response.json();
    res.json({
      node: node.id,
      container: node.containerName,
      model: node.model,
      ...data,
    });
  } catch (error: any) {
    res.status(502).json({
      error: `Failed to connect to container ${node.containerName} (${targetUrl})`,
      message: error.message,
    });
  }
});

/**
 * POST /api/ollama/models/:name/chat
 * Exécute une complétion de chat avec historique de messages sur le conteneur du modèle.
 */
ollamaClusterRouter.post("/models/:name/chat", async (req: Request, res: Response) => {
  const modelQuery = req.params.name;
  const node = getNodeByModel(modelQuery) || getNodeById(modelQuery);

  if (!node) {
    res.status(404).json({
      error: `Model or node "${modelQuery}" not found in cluster.`,
      availableModels: OLLAMA_CLUSTER_NODES.map((n) => n.model),
    });
    return;
  }

  const { messages, options, stream = false } = req.body;
  if (!Array.isArray(messages)) {
    res.status(400).json({ error: "Missing required array parameter: messages" });
    return;
  }

  const targetUrl = `${resolveNodeUrl(node)}/api/chat`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: node.model,
        messages,
        stream,
        options: options || {},
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      res.status(response.status).json({
        error: `Target container ${node.containerName} error`,
        details: errText,
      });
      return;
    }

    const data = await response.json();
    res.json({
      node: node.id,
      container: node.containerName,
      model: node.model,
      ...data,
    });
  } catch (error: any) {
    res.status(502).json({
      error: `Failed to connect to container ${node.containerName}`,
      message: error.message,
    });
  }
});

/**
 * POST /api/ollama/embeddings
 * Route une requête d'embedding vers le conteneur Snowflake ou Nomic dédié.
 */
ollamaClusterRouter.post("/embeddings", async (req: Request, res: Response) => {
  const { prompt, text, model = "snowflake-arctic-embed:latest" } = req.body;
  const content = prompt || text;

  if (!content || typeof content !== "string") {
    res.status(400).json({ error: "Missing required string parameter: prompt or text" });
    return;
  }

  // Si le modèle demandé est spécifié, on route dessus, sinon on prend le nœud snowflake ou nomic
  let node: OllamaClusterNode | undefined;
  if (model.includes("nomic")) {
    node = getNodeById("nomic-embed");
  } else {
    node = getNodeById("snowflake-embed") || routeByPurpose("embedding");
  }

  if (!node) {
    res.status(500).json({ error: "No embedding node available in cluster" });
    return;
  }

  const targetUrl = `${resolveNodeUrl(node)}/api/embeddings`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: node.model,
        prompt: content,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      res.status(response.status).json({
        error: `Embedding container ${node.containerName} failed`,
        details: errText,
      });
      return;
    }

    const data = await response.json();
    res.json({
      node: node.id,
      container: node.containerName,
      model: node.model,
      embedding: data.embedding,
    });
  } catch (error: any) {
    res.status(502).json({
      error: `Failed to reach embedding node ${node.containerName}`,
      message: error.message,
    });
  }
});

/**
 * GET /api/ollama/cluster-dashboard
 * Dashboard HTML cyberpunk Montréal 2033 en temps réel.
 */
ollamaClusterRouter.get("/cluster-dashboard", (_req: Request, res: Response) => {
  const nodesJson = JSON.stringify(OLLAMA_CLUSTER_NODES);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MONTRÉAL 2033 — Multi-Ollama Cluster Command Center</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&family=Orbitron:wght@600;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #070a10;
      --card-bg: rgba(13, 20, 36, 0.75);
      --card-border: rgba(0, 240, 255, 0.18);
      --card-border-hover: rgba(0, 240, 255, 0.5);
      --cyan: #00f0ff;
      --cyan-dim: rgba(0, 240, 255, 0.12);
      --green: #00ff88;
      --green-dim: rgba(0, 255, 136, 0.12);
      --red: #ff3366;
      --red-dim: rgba(255, 51, 102, 0.12);
      --amber: #ffaa00;
      --text-main: #d4e0ec;
      --text-dim: #7a8fa6;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text-main);
      font-family: 'JetBrains Mono', monospace;
      min-height: 100vh;
      padding: 24px;
      position: relative;
      overflow-x: hidden;
    }

    body::before {
      content: "";
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: radial-gradient(circle at 50% 15%, rgba(0, 240, 255, 0.07) 0%, transparent 60%),
                  radial-gradient(circle at 80% 80%, rgba(255, 51, 102, 0.04) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    .container {
      max-width: 1360px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      margin-bottom: 24px;
      border-bottom: 1px solid rgba(0, 240, 255, 0.15);
      flex-wrap: wrap;
      gap: 16px;
    }

    .title-group h1 {
      font-family: 'Orbitron', sans-serif;
      font-size: 24px;
      letter-spacing: 2px;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-group h1 .tag {
      font-size: 11px;
      padding: 3px 8px;
      background: var(--cyan-dim);
      border: 1px solid var(--cyan);
      color: var(--cyan);
      border-radius: 3px;
      letter-spacing: 1px;
      font-family: 'JetBrains Mono', monospace;
    }

    .title-group p {
      font-size: 13px;
      color: var(--text-dim);
      margin-top: 6px;
    }

    .actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    button.btn {
      background: var(--cyan-dim);
      border: 1px solid var(--cyan);
      color: var(--cyan);
      padding: 10px 18px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      letter-spacing: 0.5px;
    }

    button.btn:hover {
      background: var(--cyan);
      color: #050b14;
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
    }

    .summary-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      padding: 16px 20px;
      border-radius: 6px;
      backdrop-filter: blur(10px);
    }

    .stat-card .label {
      font-size: 11px;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .stat-card .val {
      font-family: 'Orbitron', sans-serif;
      font-size: 22px;
      margin-top: 6px;
      color: #fff;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 18px;
      margin-bottom: 32px;
    }

    .node-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 18px;
      backdrop-filter: blur(8px);
      transition: all 0.25s ease;
      position: relative;
    }

    .node-card:hover {
      border-color: var(--card-border-hover);
      box-shadow: 0 6px 20px rgba(0, 240, 255, 0.08);
      transform: translateY(-2px);
    }

    .node-card .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .node-card .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge.healthy { background: var(--green-dim); color: var(--green); border: 1px solid var(--green); }
    .badge.unreachable { background: var(--red-dim); color: var(--red); border: 1px solid var(--red); }
    .badge.checking { background: var(--cyan-dim); color: var(--cyan); border: 1px solid var(--cyan); }

    .node-title {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      font-family: 'Orbitron', sans-serif;
    }

    .node-role {
      font-size: 12px;
      color: var(--cyan);
      margin-top: 4px;
    }

    .node-details {
      margin-top: 14px;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      color: var(--text-dim);
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
      padding-bottom: 4px;
    }

    .detail-row span:last-child {
      color: #fff;
      font-weight: 500;
    }

    .node-desc {
      margin-top: 10px;
      font-size: 11px;
      line-height: 1.5;
      color: #8c9eb4;
    }

    /* Console d'expérimentation */
    .tester-section {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 24px;
      backdrop-filter: blur(12px);
    }

    .tester-section h2 {
      font-family: 'Orbitron', sans-serif;
      font-size: 18px;
      color: #fff;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
    }

    select, textarea, input {
      width: 100%;
      background: rgba(6, 10, 18, 0.8);
      border: 1px solid rgba(0, 240, 255, 0.25);
      border-radius: 4px;
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
      padding: 10px 12px;
      font-size: 13px;
      outline: none;
    }

    select:focus, textarea:focus, input:focus {
      border-color: var(--cyan);
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
    }

    textarea {
      resize: vertical;
      min-height: 90px;
    }

    .output-box {
      margin-top: 16px;
      background: #04060a;
      border: 1px solid rgba(0, 240, 255, 0.2);
      border-radius: 4px;
      padding: 16px;
      font-size: 13px;
      color: #00ffcc;
      white-space: pre-wrap;
      max-height: 350px;
      overflow-y: auto;
      display: none;
    }

    .output-box.show { display: block; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot.green { background: var(--green); box-shadow: 0 0 8px var(--green); }
    .dot.red { background: var(--red); box-shadow: 0 0 8px var(--red); }
    .dot.cyan { background: var(--cyan); box-shadow: 0 0 8px var(--cyan); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="title-group">
        <h1>MONTRÉAL 2033 <span class="tag">MULTI-OLLAMA CLUSTER</span></h1>
        <p>Orchestration décentralisée de 8 nœuds LLM Ollama conteneurisés en microservices indépendants</p>
      </div>
      <div class="actions">
        <button class="btn" onclick="refreshStatus()">
          <span>⚡ AUDITER LE CLUSTER</span>
        </button>
      </div>
    </header>

    <div class="summary-bar">
      <div class="stat-card">
        <div class="label">Nœuds Opérationnels</div>
        <div class="val" id="healthy-count">-- / 8</div>
      </div>
      <div class="stat-card">
        <div class="label">Plage de Ports Hôte</div>
        <div class="val">11435 — 11442</div>
      </div>
      <div class="stat-card">
        <div class="label">Réseau Virtuel</div>
        <div class="val" style="font-size: 16px;">montreal-2033-mesh</div>
      </div>
      <div class="stat-card">
        <div class="label">Dernier Ping</div>
        <div class="val" id="last-ping" style="font-size: 15px; color: var(--text-dim);">En attente...</div>
      </div>
    </div>

    <div class="grid" id="nodes-grid">
      <!-- Rendu dynamique des 8 nœuds -->
    </div>

    <div class="tester-section">
      <h2>CONSOLE D'INFÉRENCE MULTI-MODÈLE</h2>
      <div class="form-grid">
        <div>
          <label style="display:block; font-size: 11px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px;">Sélectionnez le Conteneur Cible</label>
          <select id="model-select"></select>
        </div>
        <div>
          <label style="display:block; font-size: 11px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px;">Prompt Tactique</label>
          <textarea id="prompt-input" placeholder="Ex: Analyse tactique de l'infrastructure de télécom du pont Jacques-Cartier..."></textarea>
        </div>
      </div>
      <button class="btn" id="btn-run" onclick="executeInference()">
        <span>ENVOYER AU NŒUD OLLAMA DÉDIÉ</span>
      </button>

      <div class="output-box" id="output-box"></div>
    </div>
  </div>

  <script>
    const NODES = ${nodesJson};

    function init() {
      const select = document.getElementById('model-select');
      select.innerHTML = NODES.map(n => 
        \`<option value="\${n.model}">[\${n.containerName}] \${n.model} — \${n.role}</option>\`
      ).join('');

      renderNodesSkeleton();
      refreshStatus();
    }

    function renderNodesSkeleton() {
      const grid = document.getElementById('nodes-grid');
      grid.innerHTML = NODES.map(node => \`
        <div class="node-card" id="card-\${node.id}">
          <div class="header">
            <div>
              <div class="node-title">\${node.containerName}</div>
              <div class="node-role">\${node.role}</div>
            </div>
            <span class="badge checking" id="badge-\${node.id}">
              <span class="dot cyan"></span> CHECKS
            </span>
          </div>
          <div class="node-details">
            <div class="detail-row">
              <span>Modèle</span>
              <span style="color: var(--cyan); font-family: monospace;">\${node.model}</span>
            </div>
            <div class="detail-row">
              <span>Port Hôte / Interne</span>
              <span>:\${node.hostPort} / :\${node.internalPort}</span>
            </div>
            <div class="detail-row">
              <span>Type / Taille</span>
              <span>\${node.type.toUpperCase()} / \${node.size}</span>
            </div>
            <div class="detail-row">
              <span>Latence Ping</span>
              <span id="latency-\${node.id}">-- ms</span>
            </div>
          </div>
          <div class="node-desc">\${node.description}</div>
        </div>
      \`).join('');
    }

    async function refreshStatus() {
      try {
        document.getElementById('last-ping').innerText = 'Pinging...';
        const res = await fetch('/api/ollama/status');
        const data = await res.json();

        document.getElementById('healthy-count').innerText = \`\${data.healthyCount} / \${data.totalNodes}\`;
        document.getElementById('last-ping').innerText = new Date(data.timestamp).toLocaleTimeString();

        data.nodes.forEach(n => {
          const badge = document.getElementById('badge-' + n.id);
          const latency = document.getElementById('latency-' + n.id);

          if (badge && latency) {
            latency.innerText = \`\${n.latencyMs} ms\`;
            if (n.status === 'healthy') {
              badge.className = 'badge healthy';
              badge.innerHTML = '<span class="dot green"></span> ACTIF';
            } else {
              badge.className = 'badge unreachable';
              badge.innerHTML = '<span class="dot red"></span> OFF';
            }
          }
        });
      } catch (err) {
        document.getElementById('last-ping').innerText = 'Erreur réseau';
      }
    }

    async function executeInference() {
      const select = document.getElementById('model-select');
      const prompt = document.getElementById('prompt-input').value.trim();
      const output = document.getElementById('output-box');
      const btn = document.getElementById('btn-run');

      if (!prompt) {
        alert('Veuillez saisir un prompt.');
        return;
      }

      const model = select.value;
      output.className = 'output-box show';
      output.innerText = \`[TRANSMISSION AU CONTENEUR \${model}] Traitement en cours...\`;
      btn.disabled = true;

      const startTime = Date.now();

      try {
        const res = await fetch(\`/api/ollama/models/\${encodeURIComponent(model)}/generate\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });

        const data = await res.json();
        const duration = Date.now() - startTime;

        if (res.ok) {
          output.innerText = \`[RÉPONSE DU NOEUD \${data.container} — \${duration}ms]\\n\\n\${data.response || JSON.stringify(data, null, 2)}\`;
        } else {
          output.innerText = \`[ERREUR \${res.status}] \${data.error || JSON.stringify(data)}\\nDétails: \${data.details || 'Vérifiez que le conteneur est démarré.'}\`;
        }
      } catch (err) {
        output.innerText = \`[EXCEPTION] Impossible de joindre l'API : \${err.message}\`;
      } finally {
        btn.disabled = false;
      }
    }

    init();
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});
