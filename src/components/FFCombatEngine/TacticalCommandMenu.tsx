// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Menu de Commandes Tactique Hiérarchique (FFVII / FFX Style)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { 
  Combatant, 
  CombatAction, 
  ActionRank 
} from '../../combat/core/types';
import { CombatHFSM, MenuSubState } from '../../combat/core/HFSM';
import { sound } from '../../utils/audio';
import { 
  Swords, 
  Zap, 
  Package, 
  Shield, 
  Cpu, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles,
  Flame,
  Crosshair
} from 'lucide-react';

interface TacticalCommandMenuProps {
  activeCombatant: Combatant;
  allCombatants: Record<string, Combatant>;
  hfsm: CombatHFSM;
  onExecuteAction: (action: CombatAction, targetIds: string[]) => void;
  onOpenGambitModal: () => void;
  onHoverActionRank: (rank: ActionRank | null) => void;
  isExecuting: boolean;
}

export const TacticalCommandMenu: React.FC<TacticalCommandMenuProps> = ({
  activeCombatant,
  allCombatants,
  hfsm,
  onExecuteAction,
  onOpenGambitModal,
  onHoverActionRank,
  isExecuting
}) => {
  const [menuSubState, setMenuSubState] = useState<MenuSubState>(() => hfsm.getCurrentMenuSubState() || 'ROOT_MENU');
  const [selectedAction, setSelectedAction] = useState<CombatAction | null>(null);
  const [selectedRootIndex, setSelectedRootIndex] = useState<number>(0);
  const [selectedSkillIndex, setSelectedSkillIndex] = useState<number>(0);
  const [selectedTargetIndex, setSelectedTargetIndex] = useState<number>(0);

  // Synchronisation avec l'automate à pile HFSM
  useEffect(() => {
    const unsub = hfsm.subscribe(snapshot => {
      setMenuSubState(snapshot.menuSubState || 'ROOT_MENU');
    });
    return unsub;
  }, [hfsm]);

  const rootOptions = [
    { key: 'attack', label: 'ATTAQUE CYBER-LAME', icon: Swords, color: 'text-white' },
    { key: 'skills', label: 'CYBER-TECHS & PSI', icon: Zap, color: 'text-cyan-400' },
    { key: 'items', label: 'ARSENAL & OBJETS', icon: Package, color: 'text-amber-400' },
    { key: 'defend', label: 'POSTURE DE DÉFENSE', icon: Shield, color: 'text-blue-400' },
    { key: 'gambits', label: 'GAMBITS AUTO-BATTLE', icon: Cpu, color: 'text-purple-400' }
  ];

  const skillActions = activeCombatant.actions.filter(a => ['tech', 'psi', 'attack'].includes(a.category) && a.id !== 'attack');
  const attackAction = activeCombatant.actions.find(a => a.id === 'attack') || activeCombatant.actions[0];
  const defendAction: CombatAction = {
    id: 'defend_action',
    name: 'Posture de Garde',
    description: 'Réduit les dégâts subis de 50% jusqu’au prochain tour.',
    category: 'defend',
    scope: 'self',
    mpCost: 0,
    rank: 2
  };

  // Détermination des cibles admissibles
  const livingCombatants = Object.values(allCombatants).filter(c => !c.isDead);
  const eligibleTargets = selectedAction?.scope.includes('ally') || selectedAction?.id.includes('cure')
    ? livingCombatants.filter(c => c.side === activeCombatant.side)
    : livingCombatants.filter(c => c.side !== activeCombatant.side);

  // Gestion des touches du clavier pour navigation fluide sans conflit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isExecuting) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        sound.playUiClick();
        if (menuSubState === 'ROOT_MENU') {
          setSelectedRootIndex(prev => (prev > 0 ? prev - 1 : rootOptions.length - 1));
        } else if (menuSubState === 'SUBMENU_SKILLS') {
          setSelectedSkillIndex(prev => (prev > 0 ? prev - 1 : skillActions.length - 1));
        } else if (menuSubState === 'TARGET_ACQUISITION') {
          setSelectedTargetIndex(prev => (prev > 0 ? prev - 1 : eligibleTargets.length - 1));
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        sound.playUiClick();
        if (menuSubState === 'ROOT_MENU') {
          setSelectedRootIndex(prev => (prev < rootOptions.length - 1 ? prev + 1 : 0));
        } else if (menuSubState === 'SUBMENU_SKILLS') {
          setSelectedSkillIndex(prev => (prev < skillActions.length - 1 ? prev + 1 : 0));
        } else if (menuSubState === 'TARGET_ACQUISITION') {
          setSelectedTargetIndex(prev => (prev < eligibleTargets.length - 1 ? prev + 1 : 0));
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sound.playUiClick();
        if (menuSubState === 'ROOT_MENU') {
          const opt = rootOptions[selectedRootIndex];
          handleSelectRoot(opt.key);
        } else if (menuSubState === 'SUBMENU_SKILLS') {
          if (skillActions[selectedSkillIndex]) {
            handleSelectSkill(skillActions[selectedSkillIndex]);
          }
        } else if (menuSubState === 'TARGET_ACQUISITION') {
          if (eligibleTargets[selectedTargetIndex] && selectedAction) {
            handleConfirmTarget(eligibleTargets[selectedTargetIndex].id);
          }
        }
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        sound.playUiClick();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuSubState, selectedRootIndex, selectedSkillIndex, selectedTargetIndex, eligibleTargets, selectedAction, isExecuting]);

  const handleSelectRoot = (key: string) => {
    if (key === 'attack') {
      setSelectedAction(attackAction);
      onHoverActionRank(attackAction.rank);
      hfsm.pushMenuSubState('TARGET_ACQUISITION');
    } else if (key === 'skills') {
      hfsm.pushMenuSubState('SUBMENU_SKILLS');
    } else if (key === 'items') {
      hfsm.pushMenuSubState('SUBMENU_ITEMS');
    } else if (key === 'defend') {
      onExecuteAction(defendAction, [activeCombatant.id]);
    } else if (key === 'gambits') {
      onOpenGambitModal();
    }
  };

  const handleSelectSkill = (action: CombatAction) => {
    setSelectedAction(action);
    onHoverActionRank(action.rank);
    if (action.scope === 'self') {
      onExecuteAction(action, [activeCombatant.id]);
      onHoverActionRank(null);
    } else if (action.scope === 'all_enemies') {
      const allEnemies = livingCombatants.filter(c => c.side !== activeCombatant.side).map(c => c.id);
      onExecuteAction(action, allEnemies);
      onHoverActionRank(null);
    } else {
      hfsm.pushMenuSubState('TARGET_ACQUISITION');
    }
  };

  const handleConfirmTarget = (targetId: string) => {
    if (!selectedAction) return;
    onHoverActionRank(null);
    onExecuteAction(selectedAction, [targetId]);
  };

  const handleBack = () => {
    onHoverActionRank(null);
    hfsm.popMenuSubState();
  };

  return (
    <div className="relative w-full max-w-xl bg-gradient-to-b from-[#02102e] via-[#041a4a] to-[#01091a] border-2 border-white/70 rounded-xl shadow-[0_0_40px_rgba(0,180,255,0.5)] p-4 text-white select-none backdrop-blur-md">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-cyan-500/40 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-orbitron font-black text-cyan-300 tracking-wider uppercase">
            ORDRES DE COMBAT // {activeCombatant.name.toUpperCase()}
          </span>
        </div>

        {menuSubState !== 'ROOT_MENU' && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-[10px] font-mono text-gray-300 hover:text-white bg-white/10 px-2 py-0.5 rounded border border-white/20 transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>RETOUR (ESC)</span>
          </button>
        )}
      </div>

      {/* Menu Sub-States Display */}
      {menuSubState === 'ROOT_MENU' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {rootOptions.map((opt, idx) => {
            const Icon = opt.icon;
            const isSelected = selectedRootIndex === idx;

            return (
              <button
                key={opt.key}
                onClick={() => {
                  setSelectedRootIndex(idx);
                  handleSelectRoot(opt.key);
                }}
                onMouseEnter={() => {
                  setSelectedRootIndex(idx);
                  sound.playUiClick();
                }}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-orbitron font-bold transition-all text-left ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-900/90 to-cyan-900/90 border-cyan-300 shadow-[0_0_15px_rgba(0,243,255,0.6)] translate-x-1'
                    : 'bg-[#030e24]/70 border-white/20 hover:border-cyan-400/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${opt.color}`} />
                  <span className={opt.color}>{opt.label}</span>
                </div>
                {isSelected && <ChevronRight className="w-4 h-4 text-cyan-300 animate-pulse" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Submenu Skills */}
      {menuSubState === 'SUBMENU_SKILLS' && (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {skillActions.map((action, idx) => {
            const isSelected = selectedSkillIndex === idx;
            const canAfford = activeCombatant.stats.mp >= action.mpCost;

            return (
              <button
                key={action.id}
                disabled={!canAfford}
                onClick={() => handleSelectSkill(action)}
                onMouseEnter={() => {
                  setSelectedSkillIndex(idx);
                  onHoverActionRank(action.rank);
                  sound.playUiClick();
                }}
                onMouseLeave={() => onHoverActionRank(null)}
                className={`w-full flex items-center justify-between p-2 rounded border text-xs font-mono transition-all text-left ${
                  !canAfford 
                    ? 'opacity-40 border-gray-700 bg-black/40 cursor-not-allowed'
                    : isSelected
                      ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border-cyan-300 shadow-[0_0_12px_rgba(0,243,255,0.5)] translate-x-1 text-white'
                      : 'bg-[#030e24]/80 border-white/20 text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <div>
                    <div className="font-bold text-cyan-200 flex items-center gap-2">
                      <span>{action.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-400 font-orbitron">
                        RANG {action.rank}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">{action.description}</div>
                  </div>
                </div>

                <div className="text-right font-orbitron">
                  <span className="text-xs font-black text-cyan-300">{action.mpCost} MP</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Submenu Target Acquisition */}
      {menuSubState === 'TARGET_ACQUISITION' && (
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 mb-1">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span>SÉLECTIONNEZ LA CIBLE DE L'ACTION // {selectedAction?.name.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {eligibleTargets.map((target, idx) => {
              const isSelected = selectedTargetIndex === idx;
              const isPlayer = target.side === 'player';
              const hpRatio = (target.stats.hp / Math.max(1, target.stats.maxHp)) * 100;

              return (
                <button
                  key={target.id}
                  onClick={() => handleConfirmTarget(target.id)}
                  onMouseEnter={() => {
                    setSelectedTargetIndex(idx);
                    sound.playUiClick();
                  }}
                  className={`p-2.5 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-950/90 to-purple-950/90 border-red-400 shadow-[0_0_15px_rgba(255,50,50,0.7)] scale-102'
                      : 'bg-[#030e24]/80 border-white/20 hover:border-red-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-orbitron font-bold">
                    <span className={isPlayer ? 'text-cyan-300' : 'text-red-300'}>{target.name}</span>
                    <span className="text-[10px] font-mono text-gray-300">
                      {target.stats.hp} / {target.stats.maxHp} HP
                    </span>
                  </div>

                  {/* HP Gauge Mini Bar */}
                  <div className="w-full h-1.5 bg-black/80 rounded-full mt-1.5 overflow-hidden border border-white/20">
                    <div
                      className={`h-full ${isPlayer ? 'bg-cyan-400' : 'bg-red-500'}`}
                      style={{ width: `${hpRatio}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Submenu Items / Nanites */}
      {menuSubState === 'SUBMENU_ITEMS' && (
        <div className="space-y-2">
          <div className="p-3 bg-[#030e24]/80 border border-white/20 rounded flex items-center justify-between text-xs font-mono">
            <div>
              <div className="font-bold text-amber-300 font-orbitron">NANITES DE RÉGÉNÉRATION</div>
              <div className="text-[10px] text-gray-300">Restaure 500 PV immédiatement à une cible.</div>
            </div>
            <button
              onClick={() => {
                const itemAction: CombatAction = {
                  id: 'item_nanite_potion',
                  name: 'Nanites de Régénération',
                  description: 'Restaure 500 PV',
                  category: 'item',
                  scope: 'single_ally',
                  mpCost: 0,
                  rank: 2
                };
                setSelectedAction(itemAction);
                hfsm.pushMenuSubState('TARGET_ACQUISITION');
              }}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-black font-orbitron font-black rounded"
            >
              UTILISER
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
