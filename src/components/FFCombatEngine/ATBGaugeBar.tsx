// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Jauges ATB Temps Réel & Indicateurs de Mode (Actif / Attente)
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Combatant } from '../../combat/core/types';
import { Zap, Pause, Play, Flame } from 'lucide-react';

interface ATBGaugeBarProps {
  combatants: Record<string, Combatant>;
  orderQueue: string[];
  atbMode: 'active' | 'wait';
  isWaitPaused: boolean;
}

export const ATBGaugeBar: React.FC<ATBGaugeBarProps> = ({
  combatants,
  orderQueue,
  atbMode,
  isWaitPaused
}) => {
  const living = Object.values(combatants).filter(c => !c.isDead);

  return (
    <div className="bg-[#020b1e]/90 border border-amber-500/40 rounded-lg p-2.5 shadow-[0_0_20px_rgba(255,170,0,0.2)] backdrop-blur-md">
      <div className="flex items-center justify-between mb-2 border-b border-amber-500/30 pb-1.5 px-1">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-[10px] font-orbitron font-bold text-amber-300 tracking-widest uppercase">
            ACTIVE TIME BATTLE (ATB) // JAUGES TEMPORELLES
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
            isWaitPaused 
              ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse' 
              : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
          }`}>
            {isWaitPaused ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
            <span>MODE : {atbMode.toUpperCase()} {isWaitPaused ? '(EN PAUSE)' : '(ACTIF)'}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {living.map(combatant => {
          const isPlayer = combatant.side === 'player';
          const fillRatio = Math.min(100, Math.max(0, (combatant.atbCurrent / combatant.atbMax) * 100));
          const isReady = combatant.atbCurrent >= combatant.atbMax || orderQueue.includes(combatant.id);
          const hasHaste = combatant.tags.some(t => t.includes('Buff.Haste'));
          const hasSlow = combatant.tags.some(t => t.includes('Debuff.Slow'));

          return (
            <div 
              key={combatant.id}
              className={`p-1.5 rounded border transition-all ${
                isReady 
                  ? 'bg-amber-950/50 border-amber-400 shadow-[0_0_10px_rgba(255,180,0,0.4)]' 
                  : isPlayer
                    ? 'bg-[#041530]/60 border-cyan-500/30'
                    : 'bg-[#2a0815]/60 border-red-500/30'
              }`}
            >
              <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                <span className={`font-bold ${isPlayer ? 'text-cyan-300' : 'text-red-300'}`}>
                  {combatant.name.split(' ')[0]}
                </span>
                <div className="flex items-center gap-1">
                  {hasHaste && <span className="text-[7px] text-yellow-300 bg-yellow-950 px-1 rounded border border-yellow-500">HÂTE</span>}
                  {hasSlow && <span className="text-[7px] text-purple-300 bg-purple-950 px-1 rounded border border-purple-500">LENT</span>}
                  <span className={isReady ? 'text-amber-400 font-bold font-orbitron animate-pulse' : 'text-gray-400'}>
                    {isReady ? 'PRÊT !' : `${Math.floor(fillRatio)}%`}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-black/80 rounded-full overflow-hidden border border-white/20">
                <div 
                  className={`h-full transition-all duration-100 ${
                    isReady 
                      ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-white animate-pulse shadow-[0_0_8px_#ffcc00]' 
                      : hasHaste
                        ? 'bg-gradient-to-r from-cyan-500 to-yellow-400'
                        : isPlayer
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-400'
                          : 'bg-gradient-to-r from-red-700 to-red-400'
                  }`}
                  style={{ width: `${fillRatio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
