// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Patron Commande & Pipeline de Validation Atomique
// ═══════════════════════════════════════════════════════════════════════════

import { 
  CombatState, 
  CombatAction, 
  MutationPacket, 
  StateMutation, 
  VisualCueRequest 
} from './types';
import { calculateFFXPhysicalDamage, calculateFFXMagicalDamage } from '../gas/DamageCalculation';

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export interface ICombatCommand {
  readonly action: CombatAction;
  readonly sourceId: string;
  readonly targetIds: string[];
  validate(state: CombatState): ValidationResult;
  execute(state: CombatState): MutationPacket;
}

export class BaseCombatCommand implements ICombatCommand {
  constructor(
    public readonly action: CombatAction,
    public readonly sourceId: string,
    public readonly targetIds: string[]
  ) {}

  public validate(state: CombatState): ValidationResult {
    const source = state.combatants[this.sourceId];
    if (!source) {
      return { isValid: false, reason: `Combattant source introuvable (${this.sourceId})` };
    }
    if (source.isDead) {
      return { isValid: false, reason: `${source.name} est K.O. et ne peut pas agir.` };
    }

    // Vérification des coûts en ressources
    if (this.action.mpCost > 0 && source.stats.mp < this.action.mpCost) {
      return { isValid: false, reason: `Énergie insuffisante (${source.stats.mp}/${this.action.mpCost} MP)` };
    }

    // Vérification des balises hiérarchiques (GameplayTags)
    if (this.action.prohibitedTags && this.action.prohibitedTags.length > 0) {
      for (const pTag of this.action.prohibitedTags) {
        if (source.tags.some(t => t.startsWith(pTag))) {
          return { isValid: false, reason: `Action bloquée par le statut : ${pTag}` };
        }
      }
    }

    if (this.action.requiredTags && this.action.requiredTags.length > 0) {
      for (const rTag of this.action.requiredTags) {
        if (!source.tags.some(t => t.startsWith(rTag))) {
          return { isValid: false, reason: `Condition requise manquante : ${rTag}` };
        }
      }
    }

    // Vérification des cibles
    if (!this.targetIds || this.targetIds.length === 0) {
      return { isValid: false, reason: 'Aucune cible désignée.' };
    }

    for (const tId of this.targetIds) {
      const target = state.combatants[tId];
      if (!target) {
        return { isValid: false, reason: `Cible introuvable (${tId})` };
      }
      // Pour les actions offensives, la cible ne doit pas déjà être morte
      if (['attack', 'tech', 'psi'].includes(this.action.category) && target.isDead) {
        return { isValid: false, reason: `${target.name} est déjà hors de combat.` };
      }
    }

    return { isValid: true };
  }

  public execute(state: CombatState): MutationPacket {
    const source = state.combatants[this.sourceId];
    const mutations: StateMutation[] = [];
    const cues: VisualCueRequest[] = [];
    const timestamp = Date.now();

    // Déduction du coût MP
    if (this.action.mpCost > 0) {
      mutations.push({
        type: 'MODIFY_MP',
        targetId: this.sourceId,
        payload: { amount: -this.action.mpCost }
      });
    }

    // Réinitialisation de la garde au moment d'attaquer
    if (source.isDefending && this.action.category !== 'defend') {
      mutations.push({
        type: 'SET_DEFENDING',
        targetId: this.sourceId,
        payload: { isDefending: false }
      });
    }

    return {
      actionId: this.action.id,
      sourceId: this.sourceId,
      targetIds: this.targetIds,
      mutations,
      cues,
      timestamp
    };
  }
}

/**
 * Commande Attaque Standard & Compétences Physiques (FFX Damage Model)
 */
export class AttackCommand extends BaseCombatCommand {
  public override execute(state: CombatState): MutationPacket {
    const packet = super.execute(state);
    const source = state.combatants[this.sourceId];

    for (const targetId of this.targetIds) {
      const target = state.combatants[targetId];
      if (!target || target.isDead) continue;

      // Calcul des dégâts selon la formule non-linéaire FFX
      const damageResult = calculateFFXPhysicalDamage({
        source,
        target,
        dmCon: this.action.dmCon || 16,
        piercing: !!this.action.piercing,
        isCelestial: !!this.action.isCelestial
      });

      // Mutation des PV
      packet.mutations.push({
        type: 'MODIFY_HP',
        targetId,
        payload: { amount: -damageResult.damage }
      });

      // Cue visuel de dégâts
      packet.cues.push({
        id: `cue_dmg_${Date.now()}_${targetId}`,
        cueType: 'instant',
        category: 'damage_text',
        targetId,
        value: damageResult.damage,
        critical: damageResult.isCritical,
        color: damageResult.isCritical ? '#ffcc00' : '#ffffff',
        soundName: damageResult.isCritical ? 'crit_hit' : 'standard_hit'
      });

      // Secousse d'écran si coup critique ou fort impact
      if (damageResult.isCritical || damageResult.damage > 500) {
        packet.cues.push({
          id: `cue_shake_${Date.now()}`,
          cueType: 'instant',
          category: 'screen_shake',
          targetId,
          value: damageResult.isCritical ? 12 : 6,
          durationMs: 250
        });
      }

      // Application éventuelle d'une attaque de délai (Delay Attack / Delay Buster)
      if (this.action.delayPower && this.action.delayPower > 0) {
        const delayAmount = Math.floor(target.tickSpeed * (16 / this.action.delayPower));
        packet.mutations.push({
          type: 'SET_CT',
          targetId,
          payload: { deltaCt: delayAmount }
        });
        packet.cues.push({
          id: `cue_delay_${Date.now()}_${targetId}`,
          cueType: 'instant',
          category: 'damage_text',
          targetId,
          value: `RETARD +${delayAmount} CT`,
          color: '#00f3ff'
        });
      }

      // Application des tags de statut
      if (this.action.appliedTags) {
        for (const tag of this.action.appliedTags) {
          packet.mutations.push({
            type: 'ADD_TAG',
            targetId,
            payload: { tag }
          });
        }
      }
    }

    return packet;
  }
}

/**
 * Commande de Magie / Pouvoir Psychique / Cyber-Sort
 */
export class SpellCommand extends BaseCombatCommand {
  public override execute(state: CombatState): MutationPacket {
    const packet = super.execute(state);
    const source = state.combatants[this.sourceId];

    for (const targetId of this.targetIds) {
      const target = state.combatants[targetId];
      if (!target) continue;

      // Soin ou Dégâts
      if (this.action.id.includes('cure') || this.action.id.includes('soin') || this.action.id.includes('heal')) {
        const isZombie = target.tags.some(t => t.includes('Zombie'));
        const healBase = Math.floor(source.stats.magic * 12 + 100);
        
        if (isZombie) {
          // Zombie inverse le soin en dégâts directs !
          packet.mutations.push({
            type: 'MODIFY_HP',
            targetId,
            payload: { amount: -healBase }
          });
          packet.cues.push({
            id: `cue_zombie_${Date.now()}_${targetId}`,
            cueType: 'instant',
            category: 'damage_text',
            targetId,
            value: healBase,
            color: '#b026ff',
            soundName: 'zombie_reverse'
          });
        } else {
          packet.mutations.push({
            type: 'MODIFY_HP',
            targetId,
            payload: { amount: healBase }
          });
          packet.cues.push({
            id: `cue_heal_${Date.now()}_${targetId}`,
            cueType: 'instant',
            category: 'heal_text',
            targetId,
            value: `+${healBase}`,
            color: '#00ff88',
            soundName: 'cure_chime'
          });
        }
      } else {
        // Sort d'attaque magique (Psi Lance, Surcharge EMP, Brasier)
        const magicalDmg = calculateFFXMagicalDamage({
          source,
          target,
          spellPower: this.action.dmCon || 24,
          element: this.action.element
        });

        packet.mutations.push({
          type: 'MODIFY_HP',
          targetId,
          payload: { amount: -magicalDmg.damage }
        });

        packet.cues.push({
          id: `cue_magic_${Date.now()}_${targetId}`,
          cueType: 'instant',
          category: 'damage_text',
          targetId,
          value: magicalDmg.damage,
          critical: magicalDmg.isCritical,
          color: this.action.element === 'psi' ? '#00f3ff' : this.action.element === 'fire' ? '#ff4400' : '#ffffaa',
          soundName: 'magic_blast'
        });
      }

      // Application des GameplayTags
      if (this.action.appliedTags) {
        for (const tag of this.action.appliedTags) {
          packet.mutations.push({
            type: 'ADD_TAG',
            targetId,
            payload: { tag }
          });
        }
      }
    }

    return packet;
  }
}

/**
 * Commande de Posture de Défense (FF Protect / Guard)
 */
export class DefendCommand extends BaseCombatCommand {
  public override execute(state: CombatState): MutationPacket {
    const packet = super.execute(state);
    
    packet.mutations.push({
      type: 'SET_DEFENDING',
      targetId: this.sourceId,
      payload: { isDefending: true }
    });

    packet.cues.push({
      id: `cue_defend_${Date.now()}_${this.sourceId}`,
      cueType: 'instant',
      category: 'status_particle',
      targetId: this.sourceId,
      value: 'POSTURE DE DÉFENSE',
      color: '#0088ff',
      soundName: 'shield_up'
    });

    return packet;
  }
}

/**
 * Commande d'Encouragement (Cheer FFX) : +1 Cumul Cheer (réduit dégâts physiques subis)
 */
export class CheerCommand extends BaseCombatCommand {
  public override execute(state: CombatState): MutationPacket {
    const packet = super.execute(state);

    for (const targetId of this.targetIds) {
      packet.mutations.push({
        type: 'ADD_CHEER',
        targetId,
        payload: { stacks: 1 }
      });

      packet.cues.push({
        id: `cue_cheer_${Date.now()}_${targetId}`,
        cueType: 'instant',
        category: 'status_particle',
        targetId,
        value: 'ENCOURAGEMENT (CHEER +1)',
        color: '#ffaa00',
        soundName: 'buff_cheer'
      });
    }

    return packet;
  }
}

/**
 * Commande Utilisation d'Objet (Potion, Nanites, Queue de Phénix)
 */
export class ItemCommand extends BaseCombatCommand {
  constructor(
    action: CombatAction,
    sourceId: string,
    targetIds: string[],
    public readonly itemId: string
  ) {
    super(action, sourceId, targetIds);
  }

  public override execute(state: CombatState): MutationPacket {
    const packet = super.execute(state);
    
    for (const targetId of this.targetIds) {
      const target = state.combatants[targetId];
      if (!target) continue;

      if (this.itemId.includes('phoenix') || this.itemId.includes('revive')) {
        if (target.isDead) {
          packet.mutations.push({
            type: 'SET_DEAD',
            targetId,
            payload: { isDead: false, restoreHp: Math.floor(target.stats.maxHp * 0.3) }
          });
          packet.cues.push({
            id: `cue_revive_${Date.now()}_${targetId}`,
            cueType: 'instant',
            category: 'heal_text',
            targetId,
            value: 'RÉANIMATION !',
            color: '#ffff00',
            soundName: 'phoenix_down'
          });
        }
      } else {
        // Potion de soin standard
        const heal = 500;
        packet.mutations.push({
          type: 'MODIFY_HP',
          targetId,
          payload: { amount: heal }
        });
        packet.cues.push({
          id: `cue_potion_${Date.now()}_${targetId}`,
          cueType: 'instant',
          category: 'heal_text',
          targetId,
          value: `+${heal} HP`,
          color: '#00ff88',
          soundName: 'item_potion'
        });
      }
    }

    return packet;
  }
}
