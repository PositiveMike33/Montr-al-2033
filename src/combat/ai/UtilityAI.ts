// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// IA d'Utilité Quantitative (Utility AI) & Distribution de Boltzmann
// ═══════════════════════════════════════════════════════════════════════════

import { Combatant, CombatState, CombatAction } from '../core/types';
import { ICombatCommand, AttackCommand, SpellCommand, DefendCommand } from '../core/Command';

export type ResponseCurveType = 'linear' | 'quadratic' | 'exponential' | 'sigmoid';

export interface UtilityConsideration {
  name: string;
  curveType: ResponseCurveType;
  weight?: number;
  evaluate: (source: Combatant, target: Combatant, state: CombatState) => number; // Sortie [0, 1]
}

export interface ActionUtilityOption {
  action: CombatAction;
  targetId: string;
  score: number;
}

export class UtilityResponseCurves {
  public static linear(x: number): number {
    return Math.max(0, Math.min(1, x));
  }

  public static quadratic(x: number): number {
    const clamped = Math.max(0, Math.min(1, x));
    return clamped * clamped;
  }

  public static exponential(x: number): number {
    const clamped = Math.max(0, Math.min(1, x));
    return (Math.exp(clamped) - 1) / (Math.E - 1);
  }

  public static sigmoid(x: number, midpoint: number = 0.5, steepness: number = 10): number {
    return 1 / (1 + Math.exp(-steepness * (x - midpoint)));
  }

  public static applyCurve(type: ResponseCurveType, input: number): number {
    switch (type) {
      case 'quadratic': return this.quadratic(input);
      case 'exponential': return this.exponential(input);
      case 'sigmoid': return this.sigmoid(input);
      case 'linear':
      default:
        return this.linear(input);
    }
  }
}

export class UtilityAIEngine {
  /**
   * Évalue l'ensemble des actions possibles d'un boss ou ennemi d'élite
   * en multipliant les considérations normalisées [0, 1].
   */
  public static selectBestAction(
    source: Combatant, 
    state: CombatState,
    temperature: number = 0.2 // Paramètre de température pour Boltzmann (0 = purement gourmand/argmax)
  ): ICombatCommand | null {
    if (source.isDead) return null;

    const enemies = Object.values(state.combatants).filter(c => c.side !== source.side && !c.isDead);
    const allies = Object.values(state.combatants).filter(c => c.side === source.side && !c.isDead);
    if (enemies.length === 0) return null;

    const evaluatedOptions: ActionUtilityOption[] = [];

    for (const action of source.actions) {
      // Vérification ressource
      if (action.mpCost > 0 && source.stats.mp < action.mpCost) {
        continue;
      }

      const candidateTargets = action.scope.includes('ally') || action.id.includes('cure') ? allies : enemies;

      for (const target of candidateTargets) {
        const score = this.calculateActionScore(action, source, target, state);
        if (score > 0) {
          evaluatedOptions.push({
            action,
            targetId: target.id,
            score
          });
        }
      }
    }

    if (evaluatedOptions.length === 0) {
      // Repli vers attaque standard sur la première cible
      const defaultAction = source.actions[0];
      return defaultAction ? new AttackCommand(defaultAction, source.id, [enemies[0].id]) : null;
    }

    // Arbitrage final : Argmax ou Boltzmann Softmax
    let chosen: ActionUtilityOption;
    if (temperature <= 0.05) {
      // Argmax strict
      chosen = evaluatedOptions.reduce((best, cur) => cur.score > best.score ? cur : best, evaluatedOptions[0]);
    } else {
      // Distribution de Boltzmann (Softmax)
      chosen = this.sampleBoltzmann(evaluatedOptions, temperature);
    }

    return this.createCommandForOption(chosen, source.id);
  }

  /**
   * Calcul multiplicatif des considérations : U = ∏ C_i(x)
   */
  private static calculateActionScore(
    action: CombatAction, 
    source: Combatant, 
    target: Combatant, 
    state: CombatState
  ): number {
    const considerations: number[] = [];

    // C1: Vulnérabilité de la cible (HP restant)
    const targetHpRatio = target.stats.hp / Math.max(1, target.stats.maxHp);
    if (action.category === 'attack' || action.category === 'tech') {
      // Plus la cible a peu de PV, plus on veut l'achever (courbe sigmoïde descendante)
      considerations.push(UtilityResponseCurves.sigmoid(1 - targetHpRatio, 0.6, 6));
    } else if (action.id.includes('cure') || action.id.includes('soin')) {
      // Soin : score élevé si l'allié est proche de mourir
      considerations.push(UtilityResponseCurves.exponential(1 - targetHpRatio));
    }

    // C2: Efficacité MP
    if (action.mpCost > 0) {
      const sourceMpRatio = source.stats.mp / Math.max(1, source.stats.maxMp);
      considerations.push(UtilityResponseCurves.linear(sourceMpRatio));
    } else {
      considerations.push(1.0);
    }

    // C3: Exploitation d'affinité élémentaire
    if (action.element && target.tags.some(t => t.includes(`Weakness.${action.element}`))) {
      considerations.push(1.0); // Bonus maximal pour faiblesse
    } else if (action.element && target.tags.some(t => t.includes(`Resist.${action.element}`))) {
      considerations.push(0.1); // Pénalité pour résistance
    }

    // Multiplication de toutes les considérations
    let finalScore = 1.0;
    for (const c of considerations) {
      finalScore *= Math.max(0, Math.min(1, c));
      if (finalScore === 0) return 0; // Court-circuit absolu
    }

    return finalScore;
  }

  /**
   * Tirage probabiliste par distribution de Boltzmann
   */
  private static sampleBoltzmann(options: ActionUtilityOption[], temperature: number): ActionUtilityOption {
    const exps = options.map(o => Math.exp(o.score / temperature));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    const probs = exps.map(e => e / sumExps);

    let rand = Math.random();
    for (let i = 0; i < options.length; i++) {
      if (rand < probs[i]) {
        return options[i];
      }
      rand -= probs[i];
    }

    return options[options.length - 1];
  }

  private static createCommandForOption(option: ActionUtilityOption, sourceId: string): ICombatCommand {
    if (option.action.category === 'psi' || option.action.category === 'tech') {
      return new SpellCommand(option.action, sourceId, [option.targetId]);
    }
    if (option.action.category === 'defend') {
      return new DefendCommand(option.action, sourceId, [option.targetId]);
    }
    return new AttackCommand(option.action, sourceId, [option.targetId]);
  }
}
