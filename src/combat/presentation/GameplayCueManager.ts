// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Gestionnaire de GameplayCues (Effets Visuels & Sonores Découplés)
// ═══════════════════════════════════════════════════════════════════════════

import { VisualCueRequest } from '../core/types';
import { combatEventBus } from '../core/EventBus';

export type CueListener = (cue: VisualCueRequest) => void;

export class GameplayCueManager {
  private static instance: GameplayCueManager;
  private activeContinuousCues: Map<string, VisualCueRequest> = new Map();
  private cueListeners: Set<CueListener> = new Set();

  public static getInstance(): GameplayCueManager {
    if (!GameplayCueManager.instance) {
      GameplayCueManager.instance = new GameplayCueManager();
    }
    return GameplayCueManager.instance;
  }

  public subscribe(listener: CueListener): () => void {
    this.cueListeners.add(listener);
    return () => {
      this.cueListeners.delete(listener);
    };
  }

  /**
   * Émet un lot de GameplayCues générés par la résolution logique
   */
  public dispatchCues(cues: VisualCueRequest[]): void {
    for (const cue of cues) {
      if (cue.cueType === 'instant') {
        this.triggerInstantCue(cue);
      } else {
        this.addContinuousCue(cue);
      }
    }
  }

  public triggerInstantCue(cue: VisualCueRequest): void {
    // Diffuse aux composants abonnés (HUD, sons, canvas)
    combatEventBus.emitCue(cue);
    for (const listener of Array.from(this.cueListeners)) {
      listener(cue);
    }
  }

  public addContinuousCue(cue: VisualCueRequest): void {
    this.activeContinuousCues.set(cue.id, cue);
    combatEventBus.emitCue(cue);
    for (const listener of Array.from(this.cueListeners)) {
      listener(cue);
    }
  }

  public removeContinuousCue(cueId: string): void {
    this.activeContinuousCues.delete(cueId);
  }

  public getContinuousCues(): VisualCueRequest[] {
    return Array.from(this.activeContinuousCues.values());
  }

  public clear(): void {
    this.activeContinuousCues.clear();
  }
}

export const cueManager = GameplayCueManager.getInstance();
