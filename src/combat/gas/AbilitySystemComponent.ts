// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Ability System Component (ASC)
// ═══════════════════════════════════════════════════════════════════════════

import { Combatant, CombatAction, VisualCueRequest } from '../core/types';
import { 
  ActiveGameplayEffect, 
  GameplayEffectDefinition, 
  PeriodicTickTrigger 
} from './GameplayEffect';
import { GameplayTagManager } from './GameplayTags';

export class AbilitySystemComponent {
  private activeEffects: ActiveGameplayEffect[] = [];

  constructor(public readonly owner: Combatant) {}

  public getActiveEffects(): ActiveGameplayEffect[] {
    return [...this.activeEffects];
  }

  /**
   * Applique un GameplayEffect à l'entité en respectant la politique d'empilement
   */
  public applyEffect(definition: GameplayEffectDefinition, sourceId: string): void {
    const existing = this.activeEffects.find(e => e.definition.id === definition.id);

    if (existing) {
      // Déjà présent : application de la politique d'empilement
      switch (definition.stackingPolicy) {
        case 'RefreshDuration': {
          existing.remainingTurns = definition.durationTurns;
          existing.currentStacks = Math.min(definition.maxStacks, existing.currentStacks + 1);
          break;
        }
        case 'RemoveSingleStackAndRefreshDuration': {
          existing.remainingTurns = definition.durationTurns;
          existing.currentStacks = Math.min(definition.maxStacks, existing.currentStacks + 1);
          break;
        }
        case 'ClearEntireStack': {
          existing.currentStacks = Math.min(definition.maxStacks, existing.currentStacks + 1);
          break;
        }
      }
    } else {
      // Nouvel effet actif
      const newEffect: ActiveGameplayEffect = {
        instanceId: `ge_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        definition,
        remainingTurns: definition.durationTurns,
        currentStacks: 1,
        sourceId,
        appliedTimestamp: Date.now()
      };
      this.activeEffects.push(newEffect);

      // Attribution des tags accordés
      for (const tag of definition.grantedTags) {
        if (!this.owner.tags.includes(tag)) {
          this.owner.tags.push(tag);
        }
      }
    }
  }

  /**
   * Exécution des ticks périodiques (OnTurnStart ou OnTurnEnd) :
   * Applique les dégâts récurrents (Poison, Saignement) ou soins (Regen),
   * puis décrémente les durées et purge selon la politique d'empilement.
   */
  public processPeriodicTicks(trigger: PeriodicTickTrigger): { 
    hpDelta: number; 
    cues: VisualCueRequest[] 
  } {
    let totalHpDelta = 0;
    const cues: VisualCueRequest[] = [];
    const expiredInstances: string[] = [];

    for (const effect of this.activeEffects) {
      // Exécution de l'effet périodique
      if (effect.definition.periodicTrigger === trigger && effect.definition.periodicMagnitude) {
        const tickVal = effect.definition.periodicMagnitude * effect.currentStacks;
        totalHpDelta += tickVal;

        cues.push({
          id: `cue_tick_${Date.now()}_${effect.instanceId}`,
          cueType: 'instant',
          category: tickVal < 0 ? 'damage_text' : 'heal_text',
          targetId: this.owner.id,
          value: Math.abs(tickVal),
          color: tickVal < 0 ? '#b026ff' : '#00ff88',
          soundName: tickVal < 0 ? 'poison_tick' : 'regen_tick'
        });
      }

      // Décompte de la durée (généralement à la fin du tour)
      if (trigger === 'OnTurnEnd' && effect.definition.durationPolicy === 'has_duration') {
        effect.remainingTurns -= 1;
        if (effect.remainingTurns <= 0) {
          if (effect.definition.stackingPolicy === 'RemoveSingleStackAndRefreshDuration' && effect.currentStacks > 1) {
            effect.currentStacks -= 1;
            effect.remainingTurns = effect.definition.durationTurns;
          } else {
            expiredInstances.push(effect.instanceId);
          }
        }
      }
    }

    // Purge des effets expirés et révocation des tags
    if (expiredInstances.length > 0) {
      for (const instId of expiredInstances) {
        const exp = this.activeEffects.find(e => e.instanceId === instId);
        if (exp) {
          for (const tag of exp.definition.grantedTags) {
            this.owner.tags = this.owner.tags.filter(t => t !== tag);
          }
        }
      }
      this.activeEffects = this.activeEffects.filter(e => !expiredInstances.includes(e.instanceId));
    }

    // Application du delta de PV sur l'entité
    if (totalHpDelta !== 0) {
      this.owner.stats.hp = Math.max(0, Math.min(this.owner.stats.maxHp, this.owner.stats.hp + totalHpDelta));
      if (this.owner.stats.hp === 0) {
        this.owner.isDead = true;
        if (!this.owner.tags.includes('State.Dead')) {
          this.owner.tags.push('State.Dead');
        }
      }
    }

    return { hpDelta: totalHpDelta, cues };
  }

  /**
   * Vérifie si le combattant possède un tag via le gestionnaire hiérarchique
   */
  public hasTag(tag: string): boolean {
    return GameplayTagManager.hasTag(this.owner.tags, tag);
  }
}
