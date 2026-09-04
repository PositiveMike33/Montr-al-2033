// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Séquenceur Asynchrone Non-Bloquant & Barrières de Synchronisation
// ═══════════════════════════════════════════════════════════════════════════

import { MutationPacket } from '../core/types';
import { cueManager } from './GameplayCueManager';

export interface CancellationToken {
  isCancelled: boolean;
}

export interface AnimationSequenceConfig {
  sourceId: string;
  targetIds: string[];
  packet: MutationPacket;
  onHitFrame: () => void;
  onComplete: () => void;
  timeoutMs?: number;
}

export class AsyncCombatSequencer {
  /**
   * Orchestre le déroulement d'une action en jalons asynchrones coordonnés :
   * Déplacement -> Animation d'attaque -> Hit Frame -> Dispatch des Cues -> Barrière de synchro -> Retour
   */
  public static async executeActionSequence(
    config: AnimationSequenceConfig,
    token?: CancellationToken
  ): Promise<void> {
    const timeout = config.timeoutMs || 2500;
    
    // Promesse avec barrière de sécurité (Timeout anti-gel)
    await Promise.race([
      this.runPhases(config, token),
      new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn(`[AsyncCombatSequencer] Timeout de sécurité atteint (${timeout}ms), déblocage automatique.`);
          resolve();
        }, timeout);
      })
    ]);

    config.onComplete();
  }

  private static async runPhases(
    config: AnimationSequenceConfig,
    token?: CancellationToken
  ): Promise<void> {
    if (token?.isCancelled) return;

    // Jalon 1: Déplacement cinématique vers la cible
    await this.delay(180);
    if (token?.isCancelled) return;

    // Jalon 2: Déclenchement de l'animation d'attaque jusqu'à la Hit Frame
    await this.delay(220);
    if (token?.isCancelled) return;

    // Jalon 3: Hit Frame atteinte -> Émission parallèle des Cues et application atomique
    config.onHitFrame();
    cueManager.dispatchCues(config.packet.cues);

    // Jalon 4: Barrière de synchronisation : attente de la dissipation des impacts
    await Promise.all([
      this.delay(350),
      this.waitForVisualImpacts()
    ]);
    if (token?.isCancelled) return;

    // Jalon 5: Déplacement de retour vers la position d'attente
    await this.delay(180);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static async waitForVisualImpacts(): Promise<void> {
    // Peut être raccordé à des promesses de rendu Canvas/Three/Babylon
    return this.delay(100);
  }
}
