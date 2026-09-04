/**
 * NPC Dialog Service — Phi3 Local LLM Integration
 * Generates dynamic NPC dialogue via Ollama Phi3
 * Energy-efficient: <1 sec latency, runs locally
 */

interface OllamaRequest {
  model: string;
  prompt: string;
  stream: boolean;
  temperature?: number;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

interface DialogContext {
  npcName: string;
  npcRole: "elite" | "minion" | "boss" | "boss_phase2";
  playerLevel: number;
  healthPercent: number;
  phase?: number; // For multi-phase bosses
}

const OLLAMA_BASE = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const MODEL = "deus_ex_sophia:latest";

// Dialog templates by NPC role — Phi3 will fill these with personality
const DIALOG_PROMPTS = {
  elite: (ctx: DialogContext) => `You are ${ctx.npcName}, a corporate elite enforcer in Montreal 2033. The hacker Thirty3 (player level ${ctx.playerLevel}) is attacking you.
Your health is at ${ctx.healthPercent}%.
Respond in ONE short, aggressive sentence (max 15 words) in French or English. Be menacing but brief.
Example: "Your neural implant is mine, hacker."
Now respond as ${ctx.npcName}:`,

  minion: (ctx: DialogContext) => `You are ${ctx.npcName}, a SPVM-Prime patrol unit in Montréal 2033. You're fighting Thirty3 (level ${ctx.playerLevel}).
Your armor is at ${ctx.healthPercent}%.
Respond in ONE short, defensive sentence (max 12 words) in French. Sound scared or determined.
Example: "Renfort en approche!"
Now respond:`,

  boss: (ctx: DialogContext) => `You are ${ctx.npcName}, a legendary boss guardian of Viktor Vance's Citadel (Montréal 2033). 
Thirty3 (level ${ctx.playerLevel}) is at ${ctx.healthPercent}% of your health.
Respond in ONE intense sentence (max 20 words) in French. Sound powerful and contemptuous.
Example: "Tu n'es qu'une fourmi face au pouvoir quantique."
Now speak as ${ctx.npcName}:`,

  boss_phase2: (ctx: DialogContext) => `You are ${ctx.npcName}, transforming into your ultimate form (Phase 2).
Thirty3 has dealt ${100 - ctx.healthPercent}% damage. You're at ${ctx.healthPercent}% health.
Respond in ONE epic sentence (max 18 words). Sound enraged, dramatic, in French/English mix.
Example: "VOS ARMES SONT INUTILES CONTRE MA VRAIE FORME!"
Now respond:`,
};

/**
 * Fetch NPC dialog from local Phi3
 */
export async function generateNPCDialog(context: DialogContext): Promise<string> {
  try {
    const promptKey = context.npcRole as keyof typeof DIALOG_PROMPTS;
    const promptFn = DIALOG_PROMPTS[promptKey];
    
    if (!promptFn) {
      console.warn(`[NPC Dialog] Unknown NPC role: ${context.npcRole}`);
      return `${context.npcName}: That's the end of the line, hacker.`;
    }

    const prompt = promptFn(context);

    const req: OllamaRequest = {
      model: MODEL,
      prompt,
      stream: false,
      temperature: 0.7, // Slightly creative but coherent
    };

    const response = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(5000), // 5 sec timeout
    });

    if (!response.ok) {
      throw new Error(`Ollama HTTP ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    const dialog = data.response.trim();

    // Strip any markdown or extra quotes
    const cleaned = dialog
      .replace(/^["«]*|["»]*$/g, "")
      .split("\n")[0] // Only first line
      .trim();

    return `${context.npcName}: ${cleaned}`;
  } catch (error: any) {
    console.error(
      `[NPC Dialog Error] ${context.npcName}:`,
      error.message || error
    );
    // Fallback to hardcoded if Phi3 fails
    return `${context.npcName}: Your fight ends here.`;
  }
}

/**
 * Generate multiple NPC dialogs in parallel (e.g., squad chatter)
 */
export async function generateSquadDialog(contexts: DialogContext[]): Promise<string[]> {
  return Promise.all(contexts.map((ctx) => generateNPCDialog(ctx)));
}

/**
 * Test connectivity to Ollama
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch (error) {
    console.warn("[Ollama Health Check] Failed:", error);
    return false;
  }
}
