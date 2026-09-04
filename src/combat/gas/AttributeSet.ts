// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// AttributeSets Découplés (GAS Model)
// ═══════════════════════════════════════════════════════════════════════════

import { CombatStats } from '../core/types';

export class AttributeSet {
  constructor(private stats: CombatStats) {}

  public getRaw(): CombatStats {
    return this.stats;
  }

  public getHp(): number { return this.stats.hp; }
  public getMaxHp(): number { return this.stats.maxHp; }
  public getMp(): number { return this.stats.mp; }
  public getMaxMp(): number { return this.stats.maxMp; }
  public getStrength(): number { return this.stats.strength; }
  public getDefense(): number { return this.stats.defense; }
  public getMagic(): number { return this.stats.magic; }
  public getMagicDefense(): number { return this.stats.magicDefense; }
  public getAgility(): number { return this.stats.agility; }
  public getLuck(): number { return this.stats.luck; }
  public getCheerStacks(): number { return this.stats.cheerStacks; }

  public modifyHp(amount: number): number {
    this.stats.hp = Math.max(0, Math.min(this.stats.maxHp, this.stats.hp + amount));
    return this.stats.hp;
  }

  public modifyMp(amount: number): number {
    this.stats.mp = Math.max(0, Math.min(this.stats.maxMp, this.stats.mp + amount));
    return this.stats.mp;
  }

  public addCheerStack(): number {
    this.stats.cheerStacks = Math.min(5, (this.stats.cheerStacks || 0) + 1);
    return this.stats.cheerStacks;
  }

  public addFocusStack(): number {
    this.stats.focusStacks = Math.min(5, (this.stats.focusStacks || 0) + 1);
    return this.stats.focusStacks;
  }
}
