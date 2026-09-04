// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Système de Balises Hiérarchiques (GameplayTags)
// ═══════════════════════════════════════════════════════════════════════════

export class GameplayTagManager {
  /**
   * Vérifie si une liste de balises contient une balise donnée ou l'un de ses parents hiérarchiques.
   * Ex: hasTag(['State.Debuff.Silence'], 'State.Debuff') -> true
   * Ex: hasTag(['State.Debuff.Silence'], 'State.Debuff.Silence') -> true
   * Ex: hasTag(['State.Buff.Haste'], 'State.Debuff') -> false
   */
  public static hasTag(tags: string[], queryTag: string): boolean {
    return tags.some(tag => tag === queryTag || tag.startsWith(queryTag + '.'));
  }

  /**
   * Vérifie si au moins une des balises recherchées est présente
   */
  public static hasAnyTag(tags: string[], queryTags: string[]): boolean {
    return queryTags.some(q => this.hasTag(tags, q));
  }

  /**
   * Vérifie si TOUTES les balises requises sont satisfaites
   */
  public static hasAllTags(tags: string[], requiredTags: string[]): boolean {
    return requiredTags.every(req => this.hasTag(tags, req));
  }
}

/**
 * Catalogue standardisé de GameplayTags pour Montréal 2033
 */
export const COMBAT_TAGS = {
  STATE: {
    DEAD: 'State.Dead',
    DEFENDING: 'State.Defending',
    STUN: 'State.Stun',
    DEBUFF: {
      SILENCE: 'State.Debuff.Silence',
      ZOMBIE: 'State.Debuff.Zombie',
      POISON: 'State.Debuff.Poison',
      SLOW: 'State.Debuff.Slow',
      BLIND: 'State.Debuff.Blind',
      VULNERABLE: 'State.Debuff.Vulnerable'
    },
    BUFF: {
      CHEER: 'State.Buff.Cheer',
      FOCUS: 'State.Buff.Focus',
      HASTE: 'State.Buff.Haste',
      PROTECT: 'State.Buff.Protect',
      SHELL: 'State.Buff.Shell',
      BARRIER: 'State.Buff.Barrier'
    }
  },
  DAMAGE: {
    ELEMENT: {
      PHYSICAL: 'Damage.Element.Physical',
      FIRE: 'Damage.Element.Fire',
      CRYO: 'Damage.Element.Cryo',
      LIGHTNING: 'Damage.Element.Lightning',
      PSI: 'Damage.Element.Psi',
      CYBER: 'Damage.Element.Cyber'
    },
    PROPERTY: {
      PIERCING: 'Damage.Property.Piercing',
      CELESTIAL: 'Damage.Property.Celestial'
    }
  },
  TRAIT: {
    ARMORED: 'Trait.Armored',
    MASSIVE: 'Trait.Massive',
    BOSS: 'Trait.Boss',
    MECHANICAL: 'Trait.Mechanical',
    ORGANIC: 'Trait.Organic'
  }
} as const;
