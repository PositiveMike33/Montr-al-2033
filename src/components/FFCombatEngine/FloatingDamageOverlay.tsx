// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Overlay de Dégâts Flottants & Rétroactions de Cues Visuels
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { VisualCueRequest } from '../../combat/core/types';
import { cueManager } from '../../combat/presentation/GameplayCueManager';
import { sound } from '../../utils/audio';

interface FloatingItem {
  id: string;
  targetId: string;
  text: string | number;
  color: string;
  critical?: boolean;
  category: string;
  createdAt: number;
}

interface FloatingDamageOverlayProps {
  combatantPositions: Record<string, { x: number; y: number }>;
  onScreenShake?: (intensity: number) => void;
}

export const FloatingDamageOverlay: React.FC<FloatingDamageOverlayProps> = ({
  combatantPositions,
  onScreenShake
}) => {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    const unsub = cueManager.subscribe((cue: VisualCueRequest) => {
      if (cue.category === 'damage_text' || cue.category === 'heal_text' || cue.category === 'status_particle') {
        const newItem: FloatingItem = {
          id: cue.id,
          targetId: cue.targetId,
          text: cue.value || '',
          color: cue.color || (cue.category === 'heal_text' ? '#00ff88' : '#ffffff'),
          critical: cue.critical,
          category: cue.category,
          createdAt: Date.now()
        };

        setItems(prev => [...prev, newItem]);

        // Audio trigger
        if (cue.category === 'heal_text') {
          sound.playHeal();
        } else if (cue.critical) {
          sound.playHit();
        } else {
          sound.playHit();
        }

        // Auto remove after 1100ms
        setTimeout(() => {
          setItems(prev => prev.filter(it => it.id !== cue.id));
        }, 1100);
      } else if (cue.category === 'screen_shake' && onScreenShake) {
        onScreenShake(Number(cue.value) || 8);
      }
    });

    return unsub;
  }, [onScreenShake]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40 select-none">
      {items.map(item => {
        const pos = combatantPositions[item.targetId] || { x: 50, y: 50 };

        return (
          <div
            key={item.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 animate-[fadeUp_1.1s_ease-out_forwards]"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y - 8}%`
            }}
          >
            {item.critical && (
              <div className="text-[11px] font-orbitron font-black text-amber-300 tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,200,0,0.9)] animate-bounce text-center">
                CRITIQUE !
              </div>
            )}
            <div
              className={`font-orbitron font-black tracking-wider text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
                item.critical 
                  ? 'text-3xl text-amber-300 scale-125' 
                  : item.category === 'heal_text' 
                    ? 'text-2xl text-emerald-300' 
                    : 'text-2xl text-white'
              }`}
              style={{ color: item.color }}
            >
              {item.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};
