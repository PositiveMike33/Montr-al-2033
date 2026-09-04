// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE DE PERSISTANCE DE JEU & DIALOGUE IA PHI-3 // MONTRÉAL 2033
// PostgreSQL + Drizzle ORM + Local Ollama Phi-3 Integration
// ═══════════════════════════════════════════════════════════════════════════════

export interface GameSavePayload {
  currentStage: number;
  level: number;
  nanites: number;
  exp: number;
  skillPoints: number;
  inventory: any[];
  equipped: any;
  loadouts?: any;
  attributes?: any;
  skillNodes?: any;
  achievements?: any;
  customization?: any;
}

export interface LoadedGameSave extends GameSavePayload {
  id: number;
  updatedAt?: string;
}

export interface NpcDialogueResponse {
  success: boolean;
  dialogue: string;
  npcName: string;
  npcRole: string;
  latencyMs: number;
  model: string;
}

// Generate or retrieve persistent local player UID
export function getOrCreatePlayerUid(): string {
  const STORAGE_KEY = 'montreal2033_player_uid';
  let uid = localStorage.getItem(STORAGE_KEY);
  if (!uid) {
    uid = 'agent_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, uid);
  }
  return uid;
}

// Save player progress to PostgreSQL via Express API
export async function savePlayerProgress(
  data: GameSavePayload,
  authToken?: string | null,
  userEmail?: string | null,
  userDisplayName?: string | null
): Promise<{ success: boolean; message: string; savedAt?: string }> {
  try {
    const playerUid = getOrCreatePlayerUid();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-player-id': playerUid,
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch('/api/game/save', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        playerId: playerUid,
        email: userEmail,
        displayName: userDisplayName,
        ...data,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Erreur HTTP ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.warn('[GamePersistence] Erreur sauvegarde DB (repli localstorage actif):', error);
    // Fallback: save to localStorage to guarantee zero data loss
    try {
      localStorage.setItem('montreal2033_backup_save', JSON.stringify({
        ...data,
        savedAt: new Date().toISOString(),
      }));
    } catch {}
    return { success: false, message: error.message || 'Erreur de connexion' };
  }
}

// Load player progress from PostgreSQL via Express API
export async function loadPlayerProgress(
  authToken?: string | null
): Promise<LoadedGameSave | null> {
  try {
    const playerUid = getOrCreatePlayerUid();
    const headers: Record<string, string> = {
      'x-player-id': playerUid,
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`/api/game/load?playerId=${encodeURIComponent(playerUid)}`, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.save) {
        return data.save as LoadedGameSave;
      }
    }
  } catch (error) {
    console.warn('[GamePersistence] Impossible de contacter PostgreSQL, tentative de secours:', error);
  }

  // Fallback to local storage backup if DB offline
  try {
    const backup = localStorage.getItem('montreal2033_backup_save');
    if (backup) {
      return JSON.parse(backup) as LoadedGameSave;
    }
  } catch {}

  return null;
}

// Trigger real-time NPC Dialogue via local Phi-3 (Ollama)
export async function requestNpcDialogue(params: {
  npcRole: 'spvm_prime' | 'reso_trader' | 'viktor_vance' | 'sophia_tactical';
  npcName?: string;
  playerAction?: string;
  stageName?: string;
  context?: string;
}): Promise<NpcDialogueResponse> {
  try {
    const response = await fetch('/api/ai/npc-dialogue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[Phi3 Dialogue] Échec réseau, usage repli d\'urgence:', error);
  }

  // Instant emergency fallback
  const fallbacks: Record<string, string> = {
    spvm_prime: '« Cible détectée ! Armement tactique chargé. Halte ou neutralisation immédiate. »',
    reso_trader: '« T\'as des nanites ? Alors parle vite avant que les drones de Vance nous repèrent. »',
    viktor_vance: '« Tu ne fais que repousser l\'inévitable, Thirty3. Montréal m\'appartient. »',
    sophia_tactical: '« Point faible identifié sur le flanc gauche. Frappe conseillée. »',
  };

  return {
    success: false,
    dialogue: fallbacks[params.npcRole] || fallbacks.spvm_prime,
    npcName: params.npcName || 'PNJ',
    npcRole: params.npcRole,
    latencyMs: 10,
    model: 'fallback_procedural',
  };
}
