/**
 * Ollama Model Router — Multi-Model Service Discovery
 * Routes requests to appropriate Ollama containers by model type
 */

export interface OllamaModelConfig {
  name: string;
  port: number;
  url: string;
  purpose: string;
  gpu_required: boolean;
}

export const OLLAMA_MODELS: Record<string, OllamaModelConfig> = {
  // NPC Dialog & Decision Making
  "phi3:latest": {
    name: "Phi3",
    port: 11434,
    url: "http://ollama-phi3:11434",
    purpose: "Ultra-fast NPC dialogue, instant decisions, <300ms latency",
    gpu_required: false,
  },

  // Strategic Reasoning
  "nemotron-3-ultra:cloud": {
    name: "Nemotron-3-Ultra",
    port: 11435,
    url: "http://ollama-nemotron:11434",
    purpose: "Advanced tactical analysis, boss behavior planning, multi-step reasoning",
    gpu_required: true,
  },

  // Elite Boss Dialog & Lore
  "deus_ex_sophia:latest": {
    name: "Deus Ex Sophia (Elite)",
    port: 11436,
    url: "http://ollama-sophia-elite:11434",
    purpose: "Viktor Vance & elite boss monologues, deep lore delivery",
    gpu_required: true,
  },

  // Creative Narrative
  "krishairnd/Gemma-4-Uncensored:latest": {
    name: "Gemma-4-Uncensored",
    port: 11437,
    url: "http://ollama-gemma4:11434",
    purpose: "Creative loot descriptions, unique item narratives, unrestricted flavor text",
    gpu_required: true,
  },

  // Aggressive Combat Taunts
  "jayeshpandit2480/granite4-UNCENSORED:latest": {
    name: "Granite4-Uncensored",
    port: 11438,
    url: "http://ollama-granite4:11434",
    purpose: "Enemy combat taunts, aggressive one-liners, combat energy",
    gpu_required: true,
  },

  // Vision & Multi-Modal (Future)
  "argus:latest": {
    name: "Argus",
    port: 11439,
    url: "http://ollama-argus:11434",
    purpose: "Vision analysis, screenshot interpretation, visual scene understanding",
    gpu_required: true,
  },

  // Embeddings & Semantic Search
  "snowflake-arctic-embed:latest": {
    name: "Snowflake Arctic Embed",
    port: 11440,
    url: "http://ollama-embeddings:11434",
    purpose: "Semantic embeddings for vector database & similarity search",
    gpu_required: false,
  },

  "nomic-embed-text:latest": {
    name: "Nomic Embed Text",
    port: 11440,
    url: "http://ollama-embeddings:11434",
    purpose: "Text embeddings, lore retrieval, semantic search",
    gpu_required: false,
  },

  // Legacy Fallback
  "test_sophia:latest": {
    name: "Test Sophia (Legacy)",
    port: 11441,
    url: "http://ollama-test-sophia:11434",
    purpose: "Backward compatibility, fallback model when primary unavailable",
    gpu_required: true,
  },
};

/**
 * Get model config by name or alias
 */
export function getOllamaModel(modelName: string): OllamaModelConfig | null {
  const normalized = modelName.toLowerCase().trim();

  // Direct match
  if (OLLAMA_MODELS[normalized]) {
    return OLLAMA_MODELS[normalized];
  }

  // Partial match (e.g., "phi3" → "phi3:latest")
  for (const [key, config] of Object.entries(OLLAMA_MODELS)) {
    if (key.includes(normalized) || config.name.toLowerCase().includes(normalized)) {
      return config;
    }
  }

  return null;
}

/**
 * Get model by purpose (e.g., "npc-dialog" → Phi3)
 */
export function getModelByPurpose(purpose: string): OllamaModelConfig | null {
  const purposeLower = purpose.toLowerCase();

  for (const config of Object.values(OLLAMA_MODELS)) {
    if (config.purpose.toLowerCase().includes(purposeLower)) {
      return config;
    }
  }

  return null;
}

/**
 * List all available models with their status
 */
export async function listAllOllamaModels(): Promise<
  Array<OllamaModelConfig & { available: boolean; error?: string }>
> {
  const results = [];

  for (const config of Object.values(OLLAMA_MODELS)) {
    try {
      const response = await fetch(`${config.url}/api/tags`, {
        signal: AbortSignal.timeout(2000),
      });

      results.push({
        ...config,
        available: response.ok,
      });
    } catch (error: any) {
      results.push({
        ...config,
        available: false,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Health check for all Ollama services
 */
export async function checkOllamaClusterHealth(): Promise<{
  healthy: number;
  total: number;
  models: Array<{ name: string; healthy: boolean }>;
}> {
  const models = await listAllOllamaModels();
  const healthy = models.filter((m) => m.available).length;

  return {
    healthy,
    total: models.length,
    models: models.map((m) => ({
      name: m.name,
      healthy: m.available,
    })),
  };
}
