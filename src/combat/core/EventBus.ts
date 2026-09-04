// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Bus d'Événements Fortement Typé (Observer Pattern)
// ═══════════════════════════════════════════════════════════════════════════

import { CombatEvent, VisualCueRequest, MutationPacket } from './types';

export type CombatEventType = CombatEvent['type'];

export type EventCallback<T = any> = (payload: T) => void;

export class CombatEventBus {
  private static instance: CombatEventBus;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  public static getInstance(): CombatEventBus {
    if (!CombatEventBus.instance) {
      CombatEventBus.instance = new CombatEventBus();
    }
    return CombatEventBus.instance;
  }

  public on<T = any>(event: CombatEventType | 'CUE_TRIGGERED' | 'ANIMATION_SEQUENCE_START', cb: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(cb);

    return () => {
      this.listeners.get(event)?.delete(cb);
    };
  }

  public emit<T = any>(event: CombatEventType | 'CUE_TRIGGERED' | 'ANIMATION_SEQUENCE_START', payload: T): void {
    const handlers = this.listeners.get(event);
    if (!handlers || handlers.size === 0) return;

    for (const handler of Array.from(handlers)) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[CombatEventBus] Erreur dans le listener pour ${event}:`, err);
      }
    }
  }

  public emitCue(cue: VisualCueRequest): void {
    this.emit('CUE_TRIGGERED', cue);
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const combatEventBus = CombatEventBus.getInstance();
