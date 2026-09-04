// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Moteur de Gambits à Priorité Descendante O(R·E) (Final Fantasy XII)
// ═══════════════════════════════════════════════════════════════════════════

import { Combatant, CombatState, CombatAction } from '../core/types';
import { ICombatCommand, AttackCommand, SpellCommand, ItemCommand, DefendCommand } from '../core/Command';
import { GameplayTagManager } from '../gas/GameplayTags';

export type GambitTargetFilter = 'allies' | 'enemies' | 'self' | 'any';

export type GambitPredicateType = 
  | 'hp_less_than_percent'
  | 'hp_greater_than_percent'
  | 'has_tag'
  | 'lacks_tag'
  | 'is_dead'
  | 'weak_to_element'
  | 'always_true';

export interface GambitRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number; // 1 = Priorité maximale
  targetFilter: GambitTargetFilter;
  predicateType: GambitPredicateType;
  predicateValue?: any; // e.g. 30 (pour < 30% HP), 'State.Debuff.Poison', 'fire'
  actionId: string;
}

export class GambitEngine {
  /**
   * Évalue la liste ordonnée de règles d'un combattant selon l'algorithme O(R·E).
   * Interrompt immédiatement l'évaluation à la première règle validée avec ressources suffisantes.
   */
  public static evaluateGambits(
    source: Combatant, 
    rules: GambitRule[], 
    state: CombatState
  ): ICombatCommand | null {
    if (source.isDead) return null;

    // Trier les règles activées par priorité croissante (1 en premier)
    const activeRules = rules
      .filter(r => r.enabled)
      .sort((a, b) => a.priority - b.priority);

    const allCombatants = Object.values(state.combatants);

    for (const rule of activeRules) {
      // 1. Recherche de l'action associée
      const action = source.actions.find(a => a.id === rule.actionId);
      if (!action) continue;

      // Vérification des ressources du lanceur (MP)
      if (action.mpCost > 0 && source.stats.mp < action.mpCost) {
        continue;
      }

      // 2. Détermination du domaine de candidats (Target Filter)
      let candidates: Combatant[] = [];
      if (rule.targetFilter === 'self') {
        candidates = [source];
      } else if (rule.targetFilter === 'allies') {
        candidates = allCombatants.filter(c => c.side === source.side && (!c.isDead || rule.predicateType === 'is_dead'));
      } else if (rule.targetFilter === 'enemies') {
        candidates = allCombatants.filter(c => c.side !== source.side && !c.isDead);
      } else {
        candidates = allCombatants.filter(c => !c.isDead || rule.predicateType === 'is_dead');
      }

      // 3. Évaluation du prédicat sur chaque candidat
      for (const candidate of candidates) {
        const matches = this.evaluatePredicate(candidate, rule.predicateType, rule.predicateValue);
        if (matches) {
          // Règle validée ! Instanciation de la commande correspondante
          const command = this.instantiateCommand(action, source.id, [candidate.id]);
          const validation = command.validate(state);
          if (validation.isValid) {
            return command;
          }
        }
      }
    }

    return null;
  }

  private static evaluatePredicate(
    candidate: Combatant, 
    type: GambitPredicateType, 
    value: any
  ): boolean {
    const hpPercent = (candidate.stats.hp / Math.max(1, candidate.stats.maxHp)) * 100;

    switch (type) {
      case 'hp_less_than_percent':
        return hpPercent <= (Number(value) || 50);

      case 'hp_greater_than_percent':
        return hpPercent >= (Number(value) || 50);

      case 'is_dead':
        return candidate.isDead;

      case 'has_tag':
        return typeof value === 'string' && GameplayTagManager.hasTag(candidate.tags, value);

      case 'lacks_tag':
        return typeof value === 'string' && !GameplayTagManager.hasTag(candidate.tags, value);

      case 'weak_to_element':
        return typeof value === 'string' && candidate.tags.some(t => t.includes(`Weakness.${value}`));

      case 'always_true':
      default:
        return true;
    }
  }

  private static instantiateCommand(
    action: CombatAction, 
    sourceId: string, 
    targetIds: string[]
  ): ICombatCommand {
    if (action.category === 'item') {
      return new ItemCommand(action, sourceId, targetIds, action.id);
    }
    if (action.category === 'psi' || action.category === 'tech') {
      return new SpellCommand(action, sourceId, targetIds);
    }
    if (action.category === 'defend') {
      return new DefendCommand(action, sourceId, targetIds);
    }
    return new AttackCommand(action, sourceId, targetIds);
  }
}
