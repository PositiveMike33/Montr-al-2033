// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Éditeur Visuel de Règles de Gambits (Final Fantasy XII Style)
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { GambitRule } from '../../combat/ai/GambitEngine';
import { CombatAction } from '../../combat/core/types';
import { sound } from '../../utils/audio';
import { 
  Cpu, 
  ArrowUp, 
  ArrowDown, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  Trash2, 
  X, 
  Check,
  Sparkles
} from 'lucide-react';

interface GambitConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: GambitRule[];
  availableActions: CombatAction[];
  onSaveRules: (updatedRules: GambitRule[]) => void;
}

export const GambitConfigModal: React.FC<GambitConfigModalProps> = ({
  isOpen,
  onClose,
  rules,
  availableActions,
  onSaveRules
}) => {
  const [localRules, setLocalRules] = React.useState<GambitRule[]>(rules);

  React.useEffect(() => {
    setLocalRules(rules);
  }, [rules]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    sound.playUiClick();
    setLocalRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    sound.playUiClick();
    setLocalRules(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next.map((r, i) => ({ ...r, priority: i + 1 }));
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= localRules.length - 1) return;
    sound.playUiClick();
    setLocalRules(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next.map((r, i) => ({ ...r, priority: i + 1 }));
    });
  };

  const handleSave = () => {
    sound.playSave();
    onSaveRules(localRules);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none font-sans">
      <div className="relative w-full max-w-2xl bg-[#020d24] border-2 border-purple-500/60 rounded-xl shadow-[0_0_50px_rgba(168,85,247,0.4)] overflow-hidden text-white">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 border-b border-purple-500/40 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
            <div>
              <div className="text-sm font-orbitron font-black text-purple-200 tracking-wider">
                PROGRAMMATION DES GAMBITS // MOTEUR D'AUTOMATISATION
              </div>
              <div className="text-[10px] font-mono text-purple-300/80">
                Évaluation descendante O(R·E) • Priorité 1 = Exécution immédiate
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Rules List */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2.5">
          {localRules.map((rule, idx) => (
            <div
              key={rule.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                rule.enabled 
                  ? 'bg-[#06163b]/90 border-purple-400/50 shadow-inner' 
                  : 'bg-black/40 border-gray-800 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Priority Badge */}
                <div className="w-7 h-7 rounded bg-purple-950 border border-purple-400 flex items-center justify-center font-orbitron font-bold text-xs text-purple-300">
                  #{rule.priority}
                </div>

                <div>
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    <span>{rule.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 border border-purple-500/40 text-purple-300 font-orbitron">
                      {rule.targetFilter.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    Action liée : <span className="text-cyan-300 font-bold">{rule.actionId}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMoveUp(idx)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/20 disabled:opacity-30"
                  title="Monter en priorité"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-gray-300" />
                </button>

                <button
                  disabled={idx === localRules.length - 1}
                  onClick={() => handleMoveDown(idx)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/20 disabled:opacity-30"
                  title="Descendre en priorité"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-gray-300" />
                </button>

                <button
                  onClick={() => handleToggle(rule.id)}
                  className="p-1 text-purple-400 hover:text-purple-300"
                  title={rule.enabled ? 'Désactiver' : 'Activer'}
                >
                  {rule.enabled ? <ToggleRight className="w-6 h-6 text-purple-400" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-[#01091a] border-t border-purple-500/40 p-4 flex items-center justify-between">
          <div className="text-[10px] font-mono text-gray-400">
            {localRules.filter(r => r.enabled).length} / {localRules.length} règles actives
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-mono text-gray-300 hover:text-white bg-white/5 rounded border border-white/20"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-1.5 text-xs font-orbitron font-bold text-black bg-purple-400 hover:bg-purple-300 rounded shadow-[0_0_15px_rgba(168,85,247,0.6)] flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>ENREGISTRER LES GAMBITS</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
