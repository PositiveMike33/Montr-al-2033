/**
 * Sophia WebSocket Service — Real-time Combat Narration
 * Broadcasts dynamic battle commentary via Phi3 + Gemini orchestration
 */

import { WebSocket, WebSocketServer } from "ws";
import http from "http";

interface SophiaEvent {
  type:
    | "combat_start"
    | "player_hit"
    | "enemy_hit"
    | "phase_change"
    | "elite_spawn"
    | "boss_defeated"
    | "loot_drop"
    | "status_effect";
  payload: Record<string, any>;
  timestamp: number;
}

interface SophiaNarration {
  text: string;
  eventType: string;
  urgency: "low" | "medium" | "high" | "critical";
  voiceEmote?: string; // For future TTS
}

// In-memory WebSocket connections per player
const playerConnections = new Map<string, WebSocket>();

/**
 * Initialize Sophia WebSocket server
 */
export function initSophiaWebSocket(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/api/sophia/ws" });

  wss.on("connection", (ws: WebSocket, req) => {
    const playerId = new URL(req.url || "", "http://localhost").searchParams.get("playerId");

    if (!playerId) {
      ws.close(1008, "Player ID required");
      return;
    }

    console.log(`[Sophia WS] Player ${playerId} connected`);
    playerConnections.set(playerId, ws);

    ws.on("message", (data: string) => {
      try {
        const event: SophiaEvent = JSON.parse(data);
        handleCombatEvent(playerId, event);
      } catch (error) {
        console.error("[Sophia WS] Parse error:", error);
      }
    });

    ws.on("close", () => {
      playerConnections.delete(playerId);
      console.log(`[Sophia WS] Player ${playerId} disconnected`);
    });

    ws.on("error", (error) => {
      console.error(`[Sophia WS] Error for ${playerId}:`, error);
    });
  });

  return wss;
}

/**
 * Process combat event and broadcast narration
 */
async function handleCombatEvent(
  playerId: string,
  event: SophiaEvent
): Promise<void> {
  const ws = playerConnections.get(playerId);
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  try {
    const narration = await generateSophiaNarration(event);
    const response = {
      narration: narration.text,
      eventType: narration.eventType,
      urgency: narration.urgency,
      timestamp: Date.now(),
    };

    ws.send(JSON.stringify(response));
  } catch (error) {
    console.error(`[Sophia Narration Error] ${playerId}:`, error);
  }
}

/**
 * Generate dynamic narration based on combat event
 */
async function generateSophiaNarration(
  event: SophiaEvent
): Promise<SophiaNarration> {
  const narratorPrompt = buildNarratorPrompt(event);

  try {
    // Try Phi3 first (fast, local)
    const phi3Narration = await queryPhi3Narrator(narratorPrompt);
    return {
      text: phi3Narration,
      eventType: event.type,
      urgency: calculateUrgency(event),
      voiceEmote: getVoiceEmote(event.type),
    };
  } catch (error) {
    console.warn("[Sophia Narrator] Phi3 fallback, using static narrative");
    return getStaticNarration(event);
  }
}

/**
 * Build context-aware prompt for Phi3
 */
function buildNarratorPrompt(event: SophiaEvent): string {
  const base = `You are Deus Ex Sophia, the tactical AI companion of Thirty3 in Montréal 2033.
Narrate the following combat event in ONE SHORT sentence (max 12 words) in French or English.
Be dramatic, intense, and supportive. Example: "Neural breach detected! Enemy shields down!"
Event: ${JSON.stringify(event.payload)}
Now narrate:`;
  return base;
}

/**
 * Query local Phi3 for narration
 */
async function queryPhi3Narrator(prompt: string): Promise<string> {
  const OLLAMA_BASE = process.env.OLLAMA_URL || "http://ollama:11434";

  const response = await fetch(`${OLLAMA_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "phi3:latest",
      prompt,
      stream: false,
      temperature: 0.6,
    }),
    signal: AbortSignal.timeout(2000),
  });

  if (!response.ok) throw new Error(`Ollama ${response.status}`);

  const data = await response.json();
  return data.response?.trim() || "Combat engaged.";
}

/**
 * Fallback static narrations by event type
 */
function getStaticNarration(event: SophiaEvent): SophiaNarration {
  const narratives: Record<string, string> = {
    combat_start: "Système d'armes activé. Engage total.",
    player_hit: "Dégâts détectés. Psi régénérant...",
    enemy_hit: "Frappe confirmée. Cible affaiblie.",
    phase_change: "Reconfiguration détectée. Intensité accrue.",
    elite_spawn: "Unité d'élite en position. Menace maximale.",
    boss_defeated: "Boss neutralisé. Loot legendary confirmé!",
    loot_drop: "Trésor généré. Rareté optimale.",
    status_effect: "Effet neural appliqué avec succès.",
  };

  return {
    text: narratives[event.type] || "Opération en cours.",
    eventType: event.type,
    urgency: calculateUrgency(event),
    voiceEmote: getVoiceEmote(event.type),
  };
}

/**
 * Calculate urgency level
 */
function calculateUrgency(
  event: SophiaEvent
): "low" | "medium" | "high" | "critical" {
  const urgencyMap: Record<string, "low" | "medium" | "high" | "critical"> = {
    combat_start: "medium",
    player_hit: event.payload?.healthPercent < 30 ? "critical" : "high",
    enemy_hit: "low",
    phase_change: "high",
    elite_spawn: "high",
    boss_defeated: "medium",
    loot_drop: "low",
    status_effect: "medium",
  };

  return urgencyMap[event.type] || "medium";
}

/**
 * Get voice emote for text-to-speech
 */
function getVoiceEmote(eventType: string): string | undefined {
  const emotes: Record<string, string> = {
    combat_start: "neutral",
    player_hit: "concern",
    enemy_hit: "triumph",
    phase_change: "alert",
    elite_spawn: "warning",
    boss_defeated: "victory",
    loot_drop: "excitement",
    status_effect: "technical",
  };

  return emotes[eventType];
}

/**
 * Broadcast to all connected players
 */
export function broadcastSophiaAnnouncement(message: string): void {
  const announcement = {
    type: "announcement",
    text: message,
    timestamp: Date.now(),
  };

  playerConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(announcement));
    }
  });
}
