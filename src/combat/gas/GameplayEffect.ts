// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// GameplayEffects (GE) & Politiques d'Empilement et de Cycle de Vie
// ═══════════════════════════════════════════════════════════════════════════

export type EffectDurationPolicy = 'instant' | 'has_duration' | 'infinite';

export type StackingPolicy = 
  | 'ClearEntireStack' 
  | 'RemoveSingleStackAndRefreshDuration' 
  | 'RefreshDuration';

export type PeriodicTickTrigger = 'OnTurnStart' | 'OnTurnEnd';

export interface AttributeModifier {
  attribute: 'hp' | 'mp' | 'strength' | 'defense' | 'magic' | 'magicDefense' | 'agility';
  operation: 'add' | 'multiply' | 'override';
  magnitude: number;
}

export interface GameplayEffectDefinition {
  id: string;
  name: string;
  durationPolicy: EffectDurationPolicy;
  durationTurns: number; // Nombre de tours si has_duration
  stackingPolicy: StackingPolicy;
  maxStacks: number;
  periodicTrigger?: PeriodicTickTrigger;
  periodicMagnitude?: number; // Dégâts de poison ou soin de régénération par tour
  grantedTags: string[]; // Tags accordés à la cible tant que l'effet est actif
  modifiers: AttributeModifier[];
}

export interface ActiveGameplayEffect {
  instanceId: string;
  definition: GameplayEffectDefinition;
  remainingTurns: number;
  currentStacks: number;
  sourceId: string;
  appliedTimestamp: number;
}
