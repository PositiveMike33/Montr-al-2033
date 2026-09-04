// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Moteur Conditional Turn-Based (CTB) & Projection Déterministe sur N Tours
// ═══════════════════════════════════════════════════════════════════════════

import { Combatant, CombatState, ActionRank, TimelineEntry } from '../core/types';
import { MinHeap } from './MinHeap';

export interface CTBSimulationActor {
  id: string;
  currentTick: number;
  tickSpeed: number;
  hasHaste: boolean;
  hasSlow: boolean;
}

/**
 * Calcul du Tick Speed (TS) selon la statistique d'Agilité (Barème FFX)
 */
export function calculateTickSpeed(agility: number): number {
  if (agility >= 171) return 2;
  if (agility >= 71) return 3;
  if (agility >= 51) return 4;
  if (agility >= 36) return 5;
  if (agility >= 21) return 6;
  if (agility >= 11) return 7;
  return 8; // Vitesse de base pour agilité faible
}

export class CTBEngine {
  /**
   * Initialise les compteurs CT pour tous les combattants au début de la bataille
   */
  public static initializeBattleCT(combatants: Record<string, Combatant>): void {
    for (const c of Object.values(combatants)) {
      c.tickSpeed = calculateTickSpeed(c.stats.agility);
      // Premier tour initialement échelonné par l'agilité
      c.currentTick = Math.max(1, Math.floor(c.tickSpeed * 3 - (c.stats.agility / 20)));
    }
  }

  /**
   * Avance l'horloge CTB jusqu'au prochain tour d'action immédiat.
   * Retourne l'identifiant du combattant qui prend la main et le temps écoulé.
   */
  public static advanceToNextTurn(state: CombatState): { nextActorId: string; deltaTick: number } | null {
    const living = Object.values(state.combatants).filter(c => !c.isDead);
    if (living.length === 0) return null;

    // Trouve le plus petit CT
    let minCt = Infinity;
    let candidate: Combatant = living[0];

    for (const c of living) {
      if (c.currentTick < minCt) {
        minCt = c.currentTick;
        candidate = c;
      } else if (c.currentTick === minCt) {
        // En cas d'égalité, priorité au joueur puis à la vitesse d'agilité
        if (c.side === 'player' && candidate.side !== 'player') {
          candidate = c;
        } else if (c.stats.agility > candidate.stats.agility) {
          candidate = c;
        }
      }
    }

    const deltaTick = Math.max(0, minCt);

    // Déduit deltaTick de tous les combattants
    for (const c of living) {
      c.currentTick = Math.max(0, c.currentTick - deltaTick);
    }

    state.globalTick += deltaTick;
    state.activeCombatantId = candidate.id;

    // Recalcule la projection de timeline
    state.timelinePreview = this.projectTimeline(state, 12);

    return { nextActorId: candidate.id, deltaTick };
  }

  /**
   * Reprogramme le prochain tour d'un combattant après l'exécution d'une commande
   * ΔCT = TickSpeed × Rang × Modificateurs (Hâte / Lenteur)
   */
  public static rescheduleCombatant(combatant: Combatant, rank: ActionRank): number {
    const ts = combatant.tickSpeed || calculateTickSpeed(combatant.stats.agility);
    let deltaCt = ts * rank;

    const hasHaste = combatant.tags.some(t => t.includes('Buff.Haste') || t.includes('Buff.Hate'));
    const hasSlow = combatant.tags.some(t => t.includes('Debuff.Slow') || t.includes('Debuff.Lenteur'));

    if (hasHaste) {
      deltaCt = Math.max(1, Math.floor(deltaCt * 0.5));
    } else if (hasSlow) {
      deltaCt = Math.floor(deltaCt * 1.5);
    }

    combatant.currentTick = deltaCt;
    return deltaCt;
  }

  /**
   * Projection spéculative déterministe des N prochains tours de jeu.
   * Utilise une file de priorité Min-Heap sur une simulation légère.
   */
  public static projectTimeline(
    state: CombatState, 
    lookaheadCount: number = 12,
    overrideActionForActive?: { rank: ActionRank }
  ): TimelineEntry[] {
    const living = Object.values(state.combatants).filter(c => !c.isDead);
    if (living.length === 0) return [];

    const heap = new MinHeap<CTBSimulationActor>();

    // Initialisation des acteurs de simulation
    for (const c of living) {
      let initialCt = c.currentTick;

      // Si un override est demandé pour l'acteur actif courant (survol d'une capacité dans le menu)
      if (overrideActionForActive && c.id === state.activeCombatantId) {
        const ts = c.tickSpeed || calculateTickSpeed(c.stats.agility);
        let delta = ts * overrideActionForActive.rank;
        if (c.tags.some(t => t.includes('Buff.Haste'))) delta = Math.max(1, Math.floor(delta * 0.5));
        if (c.tags.some(t => t.includes('Debuff.Slow'))) delta = Math.floor(delta * 1.5);
        initialCt = delta;
      }

      heap.push(initialCt, {
        id: c.id,
        currentTick: initialCt,
        tickSpeed: c.tickSpeed || calculateTickSpeed(c.stats.agility),
        hasHaste: c.tags.some(t => t.includes('Buff.Haste')),
        hasSlow: c.tags.some(t => t.includes('Debuff.Slow'))
      });
    }

    const projectedTurns: TimelineEntry[] = [];
    let simulatedGlobalTick = state.globalTick;

    for (let turnIdx = 0; turnIdx < lookaheadCount; turnIdx++) {
      const top = heap.pop();
      if (!top) break;

      simulatedGlobalTick = top.key;
      projectedTurns.push({
        combatantId: top.data.id,
        predictedTurnIndex: turnIdx + 1,
        projectedTick: top.key
      });

      // Calcule le prochain passage du même acteur (considérant une action de Rang standard 3 par défaut)
      let nextDelta = top.data.tickSpeed * 3;
      if (top.data.hasHaste) nextDelta = Math.max(1, Math.floor(nextDelta * 0.5));
      if (top.data.hasSlow) nextDelta = Math.floor(nextDelta * 1.5);

      const nextKey = top.key + nextDelta;
      heap.push(nextKey, {
        ...top.data,
        currentTick: nextKey
      });
    }

    return projectedTurns;
  }
}
