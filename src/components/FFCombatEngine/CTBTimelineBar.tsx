// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Barre Chronologique Déterministe CTB (Final Fantasy X Style)
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { TimelineEntry, Combatant } from '../../combat/core/types';
import { Clock, Shield, Sparkles } from 'lucide-react';

interface CTBTimelineBarProps {
  timeline: TimelineEntry[];
  combatants: Record<string, Combatant>;
  activeCombatantId: string | null;
  hoveredActionRank?: number | null;
}

export const CTBTimelineBar: React.FC<CTBTimelineBarProps> = ({
  timeline,
  combatants,
  activeCombatantId,
  hoveredActionRank
}) => {
  return (
    <div className="bg-[#020b1e]/90 border border-cyan-500/40 rounded-lg p-2.5 shadow-[0_0_20px_rgba(0,243,255,0.2)] backdrop-blur-md">
      <div className="flex items-center justify-between mb-2 border-b border-cyan-500/30 pb-1.5 px-1">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-[10px] font-orbitron font-bold text-cyan-300 tracking-widest uppercase">
            CHRONOLOGIE CTB // PROJECTION DES TOURS
          </span>
        </div>
        {hoveredActionRank && (
          <span className="text-[9px] font-mono text-yellow-300 bg-yellow-950/80 border border-yellow-500/50 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
            <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
            <span>PRÉDICTION SPÉCULATIVE : RANG {hoveredActionRank}</span>
          </span>
        )}
      </div>

      {/* Timeline Entry Portraits */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-cyan-500">
        {timeline.slice(0, 10).map((entry, idx) => {
          const combatant = combatants[entry.combatantId];
          if (!combatant) return null;

          const isCurrentActive = idx === 0 && combatant.id === activeCombatantId;
          const isPlayer = combatant.side === 'player';

          return (
            <div
              key={`${entry.combatantId}_turn_${idx}_${entry.projectedTick}`}
              className={`relative flex flex-col items-center justify-center min-w-[54px] p-1.5 rounded border transition-all duration-300 select-none ${
                isCurrentActive 
                  ? 'bg-gradient-to-b from-cyan-900/90 to-blue-950 border-cyan-300 scale-105 shadow-[0_0_12px_rgba(0,243,255,0.8)]' 
                  : isPlayer
                    ? 'bg-[#041530]/80 border-cyan-500/50 hover:border-cyan-300'
                    : 'bg-[#2a0815]/80 border-red-500/50 hover:border-red-300'
              }`}
            >
              {/* Turn Number Badge */}
              <div className="absolute -top-1.5 -left-1 text-[8px] font-orbitron font-bold px-1 rounded bg-black/90 border border-white/40 text-gray-200">
                #{entry.predictedTurnIndex}
              </div>

              {/* Combatant Avatar Circle */}
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold font-orbitron shadow-inner overflow-hidden ${
                isPlayer 
                  ? 'border-cyan-400 bg-cyan-950/90 text-cyan-200' 
                  : 'border-red-400 bg-red-950/90 text-red-200'
              }`}>
                {combatant.name.slice(0, 2).toUpperCase()}
              </div>

              {/* Name & Tick Speed */}
              <div className="mt-1 text-[9px] font-mono font-semibold text-center truncate max-w-[50px] text-gray-200">
                {combatant.name.split(' ')[0]}
              </div>

              <div className="text-[8px] font-mono text-gray-400">
                TS {combatant.tickSpeed}
              </div>

              {isCurrentActive && (
                <div className="absolute -bottom-2 px-1 bg-cyan-400 text-black text-[7px] font-black uppercase rounded shadow font-orbitron">
                  TOUR
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
