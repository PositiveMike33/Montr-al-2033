// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Machine à États Finis Hiérarchique (HFSM) & Automate à Pile (PDA)
// ═══════════════════════════════════════════════════════════════════════════

export type CombatMasterState = 
  | 'INIT'
  | 'TIME_EVALUATION'
  | 'COMMAND_SELECTION'
  | 'ACTION_RESOLVING'
  | 'ANIMATION_WAIT'
  | 'CHECK_OUTCOME'
  | 'VICTORY'
  | 'DEFEAT';

export type MenuSubState = 
  | 'ROOT_MENU'
  | 'SUBMENU_SKILLS'
  | 'SUBMENU_ITEMS'
  | 'TARGET_ACQUISITION'
  | 'GAMBIT_OVERVIEW';

export interface HFSMStateSnapshot {
  masterState: CombatMasterState;
  menuSubState: MenuSubState | null;
  menuStackDepth: number;
}

export type StateChangeCallback = (snapshot: HFSMStateSnapshot) => void;

/**
 * Machine à États Finis Hiérarchique isolant hermétiquement les entrées utilisateur
 * et régulant la macro-boucle de combat sans conditions de course.
 */
export class CombatHFSM {
  private currentMasterState: CombatMasterState = 'INIT';
  private menuStack: MenuSubState[] = [];
  private listeners: StateChangeCallback[] = [];

  constructor() {
    this.transitionTo('INIT');
  }

  public subscribe(cb: StateChangeCallback): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    for (const cb of this.listeners) {
      cb(snapshot);
    }
  }

  public getSnapshot(): HFSMStateSnapshot {
    return {
      masterState: this.currentMasterState,
      menuSubState: this.getCurrentMenuSubState(),
      menuStackDepth: this.menuStack.length
    };
  }

  public getMasterState(): CombatMasterState {
    return this.currentMasterState;
  }

  public getCurrentMenuSubState(): MenuSubState | null {
    if (this.currentMasterState !== 'COMMAND_SELECTION') return null;
    return this.menuStack.length > 0 ? this.menuStack[this.menuStack.length - 1] : 'ROOT_MENU';
  }

  public transitionTo(nextState: CombatMasterState): void {
    if (this.currentMasterState === nextState) return;

    // Quitte l'état précédent
    if (this.currentMasterState === 'COMMAND_SELECTION') {
      this.menuStack = [];
    }

    this.currentMasterState = nextState;

    // Initialisation du nouvel état
    if (nextState === 'COMMAND_SELECTION') {
      this.menuStack = ['ROOT_MENU'];
    }

    this.notify();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Gestion de l'Automate à Pile (Pushdown Automaton) pour l'UI
  // ─────────────────────────────────────────────────────────────────────────

  public pushMenuSubState(subState: MenuSubState): void {
    if (this.currentMasterState !== 'COMMAND_SELECTION') return;
    this.menuStack.push(subState);
    this.notify();
  }

  public popMenuSubState(): MenuSubState | null {
    if (this.currentMasterState !== 'COMMAND_SELECTION') return null;
    if (this.menuStack.length <= 1) {
      // On reste sur ROOT_MENU
      return 'ROOT_MENU';
    }
    const popped = this.menuStack.pop();
    this.notify();
    return popped || null;
  }

  public resetMenuToRoot(): void {
    if (this.currentMasterState !== 'COMMAND_SELECTION') return;
    this.menuStack = ['ROOT_MENU'];
    this.notify();
  }

  /**
   * Consommateur d'entrée exclusif : vérifie si l'entrée appartient au sous-état actif
   * pour interdire la propagation de clics fantômes (Ghost Click bleed-through).
   */
  public canHandleInput(expectedSubState?: MenuSubState): boolean {
    if (this.currentMasterState !== 'COMMAND_SELECTION') return false;
    if (!expectedSubState) return true;
    return this.getCurrentMenuSubState() === expectedSubState;
  }
}
