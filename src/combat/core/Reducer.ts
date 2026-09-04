// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Réducteur d'État Pur, Event Sourcing & Déterminisme Mathématique
// ═══════════════════════════════════════════════════════════════════════════

import { 
  CombatState, 
  CombatEvent, 
  StateMutation, 
  MutationPacket, 
  Combatant 
} from './types';

/**
 * Clonage profond immuable de l'état de combat (pour prédiction spéculative et simulation)
 */
export function cloneCombatState(state: CombatState): CombatState {
  const clonedCombatants: Record<string, Combatant> = {};
  for (const [id, c] of Object.entries(state.combatants)) {
    clonedCombatants[id] = {
      ...c,
      stats: { ...c.stats },
      tags: [...c.tags],
      actions: [...c.actions]
    };
  }

  return {
    ...state,
    combatants: clonedCombatants,
    orderQueue: [...state.orderQueue],
    timelinePreview: state.timelinePreview.map(tp => ({ ...tp })),
    history: [...state.history]
  };
}

/**
 * Application unitaire d'une mutation d'état
 */
export function applySingleMutation(state: CombatState, mutation: StateMutation): void {
  const target = state.combatants[mutation.targetId];
  if (!target) return;

  switch (mutation.type) {
    case 'MODIFY_HP': {
      const { amount } = mutation.payload;
      const newHp = Math.max(0, Math.min(target.stats.maxHp, target.stats.hp + amount));
      target.stats.hp = newHp;
      if (newHp === 0) {
        target.isDead = true;
        target.isDefending = false;
        // Ajout du tag Dead si non présent
        if (!target.tags.includes('State.Dead')) {
          target.tags.push('State.Dead');
        }
      }
      break;
    }

    case 'MODIFY_MP': {
      const { amount } = mutation.payload;
      target.stats.mp = Math.max(0, Math.min(target.stats.maxMp, target.stats.mp + amount));
      break;
    }

    case 'ADD_TAG': {
      const { tag } = mutation.payload;
      if (!target.tags.includes(tag)) {
        target.tags.push(tag);
      }
      break;
    }

    case 'REMOVE_TAG': {
      const { tag } = mutation.payload;
      target.tags = target.tags.filter(t => !t.startsWith(tag));
      break;
    }

    case 'SET_DEFENDING': {
      target.isDefending = !!mutation.payload.isDefending;
      break;
    }

    case 'SET_CT': {
      if (mutation.payload.deltaCt !== undefined) {
        target.currentTick += mutation.payload.deltaCt;
      } else if (mutation.payload.absoluteCt !== undefined) {
        target.currentTick = mutation.payload.absoluteCt;
      }
      break;
    }

    case 'SET_ATB': {
      if (mutation.payload.deltaAtb !== undefined) {
        target.atbCurrent = Math.min(target.atbMax, Math.max(0, target.atbCurrent + mutation.payload.deltaAtb));
      } else if (mutation.payload.absoluteAtb !== undefined) {
        target.atbCurrent = Math.min(target.atbMax, Math.max(0, mutation.payload.absoluteAtb));
      }
      break;
    }

    case 'ADD_CHEER': {
      const stacks = mutation.payload.stacks || 1;
      target.stats.cheerStacks = Math.min(5, (target.stats.cheerStacks || 0) + stacks);
      break;
    }

    case 'SET_DEAD': {
      target.isDead = !!mutation.payload.isDead;
      if (!target.isDead) {
        target.tags = target.tags.filter(t => t !== 'State.Dead');
        if (mutation.payload.restoreHp) {
          target.stats.hp = Math.min(target.stats.maxHp, mutation.payload.restoreHp);
        }
      }
      break;
    }
  }
}

/**
 * Vérifie l'état de victoire ou d'échec de la bataille
 */
export function evaluateBattleOutcome(state: CombatState): void {
  const allCombatants = Object.values(state.combatants);
  const livingPlayers = allCombatants.filter(c => c.side === 'player' && !c.isDead);
  const livingEnemies = allCombatants.filter(c => c.side === 'enemy' && !c.isDead);

  if (livingEnemies.length === 0) {
    state.isBattleOver = true;
    state.winner = 'player';
  } else if (livingPlayers.length === 0) {
    state.isBattleOver = true;
    state.winner = 'enemy';
  }
}

/**
 * Application d'un paquet complet de mutations atomiques (Packet)
 */
export function applyMutationPacket(state: CombatState, packet: MutationPacket): CombatState {
  const next = cloneCombatState(state);

  for (const mutation of packet.mutations) {
    applySingleMutation(next, mutation);
  }

  evaluateBattleOutcome(next);

  // Enregistrement dans l'historique Event Sourcing
  next.history.push({
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type: 'COMMAND_EXECUTED',
    timestamp: packet.timestamp,
    data: {
      actionId: packet.actionId,
      sourceId: packet.sourceId,
      targetIds: packet.targetIds,
      mutationCount: packet.mutations.length
    }
  });

  return next;
}

/**
 * Réducteur de combat pur (Reducer)
 */
export function combatReducer(state: CombatState, event: CombatEvent): CombatState {
  const next = cloneCombatState(state);
  next.history.push(event);

  switch (event.type) {
    case 'BATTLE_START': {
      next.turnCount = 1;
      next.globalTick = 0;
      next.isBattleOver = false;
      next.winner = null;
      break;
    }

    case 'TURN_STARTED': {
      next.activeCombatantId = event.data.combatantId;
      next.turnCount += 1;
      break;
    }

    case 'COMMAND_EXECUTED': {
      if (event.data.packet) {
        return applyMutationPacket(next, event.data.packet);
      }
      break;
    }

    case 'TICK_ADVANCED': {
      next.globalTick += event.data.delta || 1;
      break;
    }

    case 'BATTLE_WON': {
      next.isBattleOver = true;
      next.winner = 'player';
      break;
    }

    case 'BATTLE_LOST': {
      next.isBattleOver = true;
      next.winner = 'enemy';
      break;
    }
  }

  return next;
}

/**
 * Relecture pas-à-pas d'un combat (Step-by-step Event Replay)
 */
export function replayCombatHistory(initialState: CombatState, events: CombatEvent[]): CombatState {
  let currentState = cloneCombatState(initialState);
  for (const evt of events) {
    currentState = combatReducer(currentState, evt);
  }
  return currentState;
}
