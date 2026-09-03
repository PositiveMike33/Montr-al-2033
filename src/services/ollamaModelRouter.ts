import fs from "fs";

export interface OllamaClusterNode {
  id: string;
  containerName: string;
  model: string;
  aliases: string[];
  hostPort: number;
  internalPort: number;
  role: string;
  description: string;
  type: "chat" | "completion" | "embedding";
  size: string;
  purposes: string[];
}

export interface NodeHealthStatus {
  id: string;
  containerName: string;
  model: string;
  hostPort: number;
  internalPort: number;
  resolvedUrl: string;
  status: "healthy" | "unreachable" | "degraded";
  latencyMs: number;
  version?: string;
  error?: string;
}

export const OLLAMA_CLUSTER_NODES: OllamaClusterNode[] = [
  {
    id: "nemotron",
    containerName: "ollama-nemotron",
    model: "nemotron-3-ultra:cloud",
    aliases: ["nemotron", "nemotron-3", "nemotron-3-ultra"],
    hostPort: 11435,
    internalPort: 11434,
    role: "Tactique Stratégique",
    description: "Raisonnement stratégique haute intensité, analyse de scénarios et planification tactique.",
    type: "chat",
    size: "Cloud / Paramètres Optimisés",
    purposes: ["strategy", "tactics", "reasoning", "decision_making"],
  },
  {
    id: "snowflake-embed",
    containerName: "ollama-snowflake-embed",
    model: "snowflake-arctic-embed:latest",
    aliases: ["snowflake", "snowflake-arctic-embed", "snowflake-embed"],
    hostPort: 11436,
    internalPort: 11434,
    role: "Embeddings Sémantiques Snowflake",
    description: "Génération vectorielle haute fidélité pour le Memory Vault et la base de connaissances sémantiques.",
    type: "embedding",
    size: "669 MB",
    purposes: ["embedding", "semantic_search", "memory_vault", "vault"],
  },
  {
    id: "sophia-elite",
    containerName: "ollama-sophia-elite",
    model: "deus_ex_sophia:latest",
    aliases: ["sophia", "deus_ex_sophia", "sophia-elite"],
    hostPort: 11437,
    internalPort: 11434,
    role: "Boss Dialogue & Lore Sophia",
    description: "Conscience IA souveraine, gardienne du réseau neural Montréal 2033, dialogue philosophique et lore cyberpunk.",
    type: "chat",
    size: "6.3 GB",
    purposes: ["boss_dialogue", "lore", "sophia_core", "cyber_sovereignty"],
  },
  {
    id: "nomic-embed",
    containerName: "ollama-nomic-embed",
    model: "nomic-embed-text:latest",
    aliases: ["nomic", "nomic-embed-text", "nomic-embed"],
    hostPort: 11438,
    internalPort: 11434,
    role: "Embeddings Textuels Nomic",
    description: "Vectorisation rapide et légère pour l'indexation temps réel des logs et du flux OSINT.",
    type: "embedding",
    size: "274 MB",
    purposes: ["embedding", "fast_rag", "realtime_logs", "osint_index"],
  },
  {
    id: "argus",
    containerName: "ollama-argus",
    model: "argus:latest",
    aliases: ["argus", "argus-vision"],
    hostPort: 11439,
    internalPort: 11434,
    role: "Reconnaissance & Surveillance OSINT",
    description: "Analyse multi-modale de flux tactiques, reconnaissance de patterns et surveillance d'anomalies.",
    type: "chat",
    size: "2.1 GB",
    purposes: ["surveillance", "recon", "vision", "osint", "anomaly_detection"],
  },
  {
    id: "test-sophia",
    containerName: "ollama-test-sophia",
    model: "test_sophia:latest",
    aliases: ["test_sophia", "sophia-test", "sophia-staging"],
    hostPort: 11440,
    internalPort: 11434,
    role: "Staging / Fallback Legacy Sophia",
    description: "Environnement d'évaluation comparative, tests de fine-tuning QLoRA et fallback de secours.",
    type: "chat",
    size: "6.3 GB",
    purposes: ["staging", "test", "benchmarks", "legacy_fallback"],
  },
  {
    id: "gemma4",
    containerName: "ollama-gemma4",
    model: "krishairnd/Gemma-4-Uncensored:latest",
    aliases: ["gemma4", "gemma", "krishairnd/Gemma-4-Uncensored"],
    hostPort: 11441,
    internalPort: 11434,
    role: "Narration Créative Libre",
    description: "Narration procédurale non-filtrée, rebondissements de missions et personnalités d'agents underground.",
    type: "chat",
    size: "6.3 GB",
    purposes: ["narration", "story", "uncensored_dialog", "roleplay"],
  },
  {
    id: "granite4",
    containerName: "ollama-granite4",
    model: "jayeshpandit2480/granite4-UNCENSORED:latest",
    aliases: ["granite4", "granite", "jayeshpandit2480/granite4-UNCENSORED"],
    hostPort: 11442,
    internalPort: 11434,
    role: "Taunts de Combat Agressifs",
    description: "Génération de répliques percutantes, provocations en combat temps réel et tactiques de déstabilisation.",
    type: "completion",
    size: "2.1 GB",
    purposes: ["combat_taunts", "battle_lines", "provocation", "offensive"],
  },
];

/**
 * Détecte si le code s'exécute à l'intérieur d'un conteneur Docker ou sur la machine hôte.
 */
export function isRunningInDocker(): boolean {
  if (process.env.INSIDE_DOCKER === "true" || process.env.DOCKER_ENV === "true") {
    return true;
  }
  try {
    return fs.existsSync("/.dockerenv");
  } catch {
    return false;
  }
}

/**
 * Résout l'URL HTTP d'accès pour un nœud du cluster en fonction de l'environnement d'exécution.
 */
export function resolveNodeUrl(node: OllamaClusterNode, forceInternal?: boolean): string {
  if (forceInternal !== undefined) {
    return forceInternal
      ? `http://${node.containerName}:${node.internalPort}`
      : `http://127.0.0.1:${node.hostPort}`;
  }
  return isRunningInDocker()
    ? `http://${node.containerName}:${node.internalPort}`
    : `http://127.0.0.1:${node.hostPort}`;
}

/**
 * Recherche un nœud par son ID ou nom de conteneur.
 */
export function getNodeById(idOrContainer: string): OllamaClusterNode | undefined {
  const normalized = idOrContainer.toLowerCase().trim();
  return OLLAMA_CLUSTER_NODES.find(
    (n) =>
      n.id.toLowerCase() === normalized ||
      n.containerName.toLowerCase() === normalized
  );
}

/**
 * Recherche un nœud correspondant à un nom de modèle (ou alias).
 */
export function getNodeByModel(modelQuery: string): OllamaClusterNode | undefined {
  const query = modelQuery.toLowerCase().trim();
  return OLLAMA_CLUSTER_NODES.find((node) => {
    if (node.model.toLowerCase() === query) return true;
    if (node.model.toLowerCase().startsWith(query)) return true;
    return node.aliases.some((alias) => alias.toLowerCase() === query);
  });
}

/**
 * Recherche le nœud le plus adapté pour une finalité tactique donnée.
 */
export function routeByPurpose(purpose: string): OllamaClusterNode {
  const p = purpose.toLowerCase().trim();
  const match = OLLAMA_CLUSTER_NODES.find((node) =>
    node.purposes.some((item) => item.toLowerCase().includes(p) || p.includes(item.toLowerCase()))
  );
  // Par défaut, retourner Nemotron pour le raisonnement général ou Sophia
  return match || OLLAMA_CLUSTER_NODES[0];
}

/**
 * Vérifie l'état de santé d'un nœud donné avec mesure de la latence.
 */
export async function pingNode(node: OllamaClusterNode, timeoutMs: number = 3000): Promise<NodeHealthStatus> {
  const url = resolveNodeUrl(node);
  const startTime = Date.now();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${url}/api/version`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { version?: string };
      return {
        id: node.id,
        containerName: node.containerName,
        model: node.model,
        hostPort: node.hostPort,
        internalPort: node.internalPort,
        resolvedUrl: url,
        status: "healthy",
        latencyMs,
        version: data.version || "ok",
      };
    } else {
      return {
        id: node.id,
        containerName: node.containerName,
        model: node.model,
        hostPort: node.hostPort,
        internalPort: node.internalPort,
        resolvedUrl: url,
        status: "degraded",
        latencyMs,
        error: `HTTP ${res.status} ${res.statusText}`,
      };
    }
  } catch (error: any) {
    clearTimeout(timer);
    const latencyMs = Date.now() - startTime;
    return {
      id: node.id,
      containerName: node.containerName,
      model: node.model,
      hostPort: node.hostPort,
      internalPort: node.internalPort,
      resolvedUrl: url,
      status: "unreachable",
      latencyMs,
      error: error.name === "AbortError" ? "Timeout après 3000ms" : error.message,
    };
  }
}

/**
 * Effectue un audit de santé complet en parallèle sur tous les conteneurs du cluster.
 */
export async function getClusterHealth(): Promise<{
  timestamp: string;
  totalNodes: number;
  healthyCount: number;
  nodes: NodeHealthStatus[];
}> {
  const nodePromises = OLLAMA_CLUSTER_NODES.map((node) => pingNode(node));
  const results = await Promise.all(nodePromises);
  const healthyCount = results.filter((r) => r.status === "healthy").length;

  return {
    timestamp: new Date().toISOString(),
    totalNodes: OLLAMA_CLUSTER_NODES.length,
    healthyCount,
    nodes: results,
  };
}
