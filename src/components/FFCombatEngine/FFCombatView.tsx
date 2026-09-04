// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Vue Principale d'Arène de Combat Cyberpunk (FF Combat View)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CombatState, 
  Combatant, 
  CombatAction, 
  TurnMode, 
  ActionRank 
} from '../../combat/core/types';
import { CombatHFSM } from '../../combat/core/HFSM';
import { 
  AttackCommand, 
  SpellCommand, 
  ItemCommand, 
  DefendCommand, 
  CheerCommand, 
  ICombatCommand 
} from '../../combat/core/Command';
import { applyMutationPacket, evaluateBattleOutcome } from '../../combat/core/Reducer';
import { CTBEngine } from '../../combat/scheduling/CTBEngine';
import { ATBEngine } from '../../combat/scheduling/ATBEngine';
import { GambitEngine, GambitRule } from '../../combat/ai/GambitEngine';
import { UtilityAIEngine } from '../../combat/ai/UtilityAI';
import { AsyncCombatSequencer } from '../../combat/presentation/AsyncCombatSequencer';
import { sound } from '../../utils/audio';

import { CTBTimelineBar } from './CTBTimelineBar';
import { ATBGaugeBar } from './ATBGaugeBar';
import { TacticalCommandMenu } from './TacticalCommandMenu';
import { FloatingDamageOverlay } from './FloatingDamageOverlay';
import { GambitConfigModal } from './GambitConfigModal';

import { 
  Swords, 
  ShieldAlert, 
  Zap, 
  RotateCcw, 
  Flame, 
  Clock, 
  Trophy, 
  Skull, 
  Coins, 
  Crosshair,
  Sliders
} from 'lucide-react';

interface FFCombatViewProps {
  initialState: CombatState;
  onVictory: (rewards: { exp: number; nanites: number; satoshis: number }) => void;
  onDefeat: () => void;
  onEscape: () => void;
}

export const FFCombatView: React.FC<FFCombatViewProps> = ({
  initialState,
  onVictory,
  onDefeat,
  onEscape
}) => {
  const [state, setState] = useState<CombatState>(initialState);
  const hfsmRef = useRef<CombatHFSM>(new CombatHFSM());
  const [screenShake, setScreenShake] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [hoveredRank, setHoveredRank] = useState<ActionRank | null>(null);
  const [isGambitModalOpen, setIsGambitModalOpen] = useState<boolean>(false);
  const [gambitRules, setGambitRules] = useState<GambitRule[]>([
    {
      id: 'g1',
      name: 'Allié PV < 35% -> Nanites de Soin',
      enabled: true,
      priority: 1,
      targetFilter: 'allies',
      predicateType: 'hp_less_than_percent',
      predicateValue: 35,
      actionId: 'cure_nanites'
    },
    {
      id: 'g2',
      name: 'Ennemi Faible Psi -> Psi Lance',
      enabled: true,
      priority: 2,
      targetFilter: 'enemies',
      predicateType: 'weak_to_element',
      predicateValue: 'psi',
      actionId: 'psi_lance'
    },
    {
      id: 'g3',
      name: 'Ennemi le plus proche -> Attaque Cyber-Lame',
      enabled: true,
      priority: 3,
      targetFilter: 'enemies',
      predicateType: 'always_true',
      actionId: 'attack'
    }
  ]);

  // Positions relatives pour l'overlay de dégâts flottants
  const [combatantPositions, setCombatantPositions] = useState<Record<string, { x: number; y: number }>>({
    thirty3: { x: 25, y: 55 },
    companion_drone: { x: 18, y: 40 },
    viktor_vance: { x: 75, y: 50 },
    spvm_elite: { x: 82, y: 65 }
  });

  const activeCombatant = state.activeCombatantId ? state.combatants[state.activeCombatantId] : null;

  // Initialisation du combat
  useEffect(() => {
    sound.playFF7BattleStart();
    const copy = { ...initialState };
    if (copy.turnMode === 'CTB') {
      CTBEngine.initializeBattleCT(copy.combatants);
      CTBEngine.advanceToNextTurn(copy);
    }
    setState(copy);
    hfsmRef.current.transitionTo('TIME_EVALUATION');
  }, []);

  // Déclencheur de secousse d'écran
  const handleTriggerScreenShake = useCallback((intensity: number) => {
    setScreenShake(intensity);
    setTimeout(() => setScreenShake(0), 300);
  }, []);

  // Exécution d'une commande
  const executeCommand = useCallback(async (command: ICombatCommand) => {
    if (isExecuting) return;
    setIsExecuting(true);
    hfsmRef.current.transitionTo('ACTION_RESOLVING');

    const validation = command.validate(state);
    if (!validation.isValid) {
      console.warn('[FFCombatView] Commande invalide:', validation.reason);
      setIsExecuting(false);
      hfsmRef.current.transitionTo('COMMAND_SELECTION');
      return;
    }

    const packet = command.execute(state);

    hfsmRef.current.transitionTo('ANIMATION_WAIT');

    await AsyncCombatSequencer.executeActionSequence({
      sourceId: command.sourceId,
      targetIds: command.targetIds,
      packet,
      onHitFrame: () => {
        setState(prev => applyMutationPacket(prev, packet));
      },
      onComplete: () => {
        setIsExecuting(false);
        postActionResolve(command.sourceId, command.action.rank);
      }
    });
  }, [state, isExecuting]);

  // Reprogrammation du tour et passage au combattant suivant
  const postActionResolve = useCallback((sourceId: string, rank: ActionRank) => {
    setState(prev => {
      const next = { ...prev };
      evaluateBattleOutcome(next);

      if (next.isBattleOver) {
        if (next.winner === 'player') {
          sound.playVictory();
          hfsmRef.current.transitionTo('VICTORY');
        } else {
          sound.playGameOver();
          hfsmRef.current.transitionTo('DEFEAT');
        }
        return next;
      }

      const source = next.combatants[sourceId];
      if (source) {
        if (next.turnMode === 'CTB') {
          CTBEngine.rescheduleCombatant(source, rank);
          CTBEngine.advanceToNextTurn(next);
        } else {
          ATBEngine.consumeATB(source);
          next.orderQueue = next.orderQueue.filter(id => id !== sourceId);
          next.activeCombatantId = next.orderQueue.length > 0 ? next.orderQueue[0] : null;
        }
      }

      return next;
    });
  }, []);

  // Macro-boucle d'arbitrage de l'IA (Boss / Ennemis ou Gambits alliés)
  useEffect(() => {
    if (isExecuting || state.isBattleOver || !activeCombatant) return;

    if (activeCombatant.side === 'enemy') {
      // Tour de l'IA Ennemie (Utility AI ou Gambits)
      const timer = setTimeout(() => {
        const aiCommand = UtilityAIEngine.selectBestAction(activeCombatant, state, 0.2);
        if (aiCommand) {
          executeCommand(aiCommand);
        } else {
          const defaultAction = activeCombatant.actions[0];
          const livingPlayers = Object.values(state.combatants).filter(c => c.side === 'player' && !c.isDead);
          if (livingPlayers.length > 0 && defaultAction) {
            executeCommand(new AttackCommand(defaultAction, activeCombatant.id, [livingPlayers[0].id]));
          }
        }
      }, 550);

      return () => clearTimeout(timer);
    } else {
      // Tour du Joueur : Vérifie si le mode Gambits auto-battle est activé
      if (activeCombatant.gambitsActive) {
        const autoCommand = GambitEngine.evaluateGambits(activeCombatant, gambitRules, state);
        if (autoCommand) {
          const timer = setTimeout(() => executeCommand(autoCommand), 400);
          return () => clearTimeout(timer);
        }
      }

      // Si pas de gambit ou gambits désactivés, ouvre le menu de sélection
      hfsmRef.current.transitionTo('COMMAND_SELECTION');
    }
  }, [activeCombatant, isExecuting, state, gambitRules, executeCommand]);

  // Boucle de cadence ATB (si mode ATB sélectionné)
  useEffect(() => {
    if (state.turnMode !== 'ATB' || state.isBattleOver || isExecuting) return;

    const interval = setInterval(() => {
      setState(prev => {
        const next = { ...prev };
        const isMenuOpenInWait = hfsmRef.current.getCurrentMenuSubState() !== 'ROOT_MENU';
        const ready = ATBEngine.stepATB(next, isMenuOpenInWait);

        if (ready.length > 0 && !next.activeCombatantId) {
          next.activeCombatantId = ready[0];
        }

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [state.turnMode, state.isBattleOver, isExecuting]);

  // Bascule du mode de tour CTB <-> ATB
  const toggleTurnMode = () => {
    sound.playUiClick();
    setState(prev => {
      const newMode: TurnMode = prev.turnMode === 'CTB' ? 'ATB' : 'CTB';
      const next = { ...prev, turnMode: newMode };
      if (newMode === 'CTB') {
        CTBEngine.initializeBattleCT(next.combatants);
        CTBEngine.advanceToNextTurn(next);
      }
      return next;
    });
  };

  // Bascule ATB Actif <-> Attente
  const toggleAtbWaitMode = () => {
    sound.playUiClick();
    setState(prev => ({
      ...prev,
      atbMode: prev.atbMode === 'active' ? 'wait' : 'active'
    }));
  };

  const handleActionExecute = (action: CombatAction, targetIds: string[]) => {
    if (!activeCombatant) return;

    let cmd: ICombatCommand;
    if (action.category === 'psi' || action.category === 'tech') {
      cmd = new SpellCommand(action, activeCombatant.id, targetIds);
    } else if (action.category === 'item') {
      cmd = new ItemCommand(action, activeCombatant.id, targetIds, action.id);
    } else if (action.category === 'defend') {
      cmd = new DefendCommand(action, activeCombatant.id, targetIds);
    } else {
      cmd = new AttackCommand(action, activeCombatant.id, targetIds);
    }

    executeCommand(cmd);
  };

  const livingPlayers = Object.values(state.combatants).filter(c => c.side === 'player');
  const livingEnemies = Object.values(state.combatants).filter(c => c.side === 'enemy');

  return (
    <div 
      className={`relative w-full h-full min-h-[680px] bg-gradient-to-b from-[#010817] via-[#021333] to-[#01091a] text-white flex flex-col justify-between p-4 select-none overflow-hidden font-sans ${
        screenShake > 0 ? 'translate-x-1 -translate-y-1' : ''
      }`}
    >
      {/* Background Cyberpunk Holo-Grid & Particle Atmosphere */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,180,255,0.12)_0%,transparent_70%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

      {/* Floating Damage & Cues Overlay */}
      <FloatingDamageOverlay
        combatantPositions={combatantPositions}
        onScreenShake={handleTriggerScreenShake}
      />

      {/* ─────────────────────────────────────────────────────────────
          TOP CONTROL BAR & SCHEDULING HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 space-y-2">
        <div className="flex items-center justify-between bg-[#020d24]/90 border border-cyan-500/40 rounded-lg px-4 py-2 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-600/90 border border-white flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,0,0,0.6)]">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-orbitron font-black text-white tracking-widest uppercase flex items-center gap-2">
                <span>INCURSION TACTIQUE // DÔME DE SÉCURITÉ VANCE</span>
                <span className="text-cyan-400">•</span>
                <span className="text-yellow-300">TOUR #{state.turnCount}</span>
              </div>
              <div className="text-[10px] font-mono text-cyan-200">
                Simulation déterministe FFX / FFVII • Global Tick : {state.globalTick}
              </div>
            </div>
          </div>

          {/* Mode Switchers */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTurnMode}
              className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 text-xs font-orbitron font-bold rounded flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,243,255,0.3)]"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>SYSTÈME : {state.turnMode}</span>
            </button>

            {state.turnMode === 'ATB' && (
              <button
                onClick={toggleAtbWaitMode}
                className="px-3 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-400 text-amber-200 text-xs font-orbitron font-bold rounded transition-all"
              >
                MODE : {state.atbMode.toUpperCase()}
              </button>
            )}

            <button
              onClick={() => setIsGambitModalOpen(true)}
              className="px-3 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-400 text-purple-200 text-xs font-orbitron font-bold rounded flex items-center gap-1.5 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>GAMBITS</span>
            </button>

            <button
              onClick={onEscape}
              className="px-3 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-300 text-xs font-orbitron font-bold rounded transition-all"
            >
              FUITE
            </button>
          </div>
        </div>

        {/* Dynamic Timeline Bar (CTB) or ATB Gauge Bar */}
        {state.turnMode === 'CTB' ? (
          <CTBTimelineBar
            timeline={state.timelinePreview}
            combatants={state.combatants}
            activeCombatantId={state.activeCombatantId}
            hoveredActionRank={hoveredRank}
          />
        ) : (
          <ATBGaugeBar
            combatants={state.combatants}
            orderQueue={state.orderQueue}
            atbMode={state.atbMode}
            isWaitPaused={hfsmRef.current.getCurrentMenuSubState() !== 'ROOT_MENU'}
          />
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MIDDLE BATTLE ARENA STAGE (PLAYERS vs ENEMIES)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 grid grid-cols-2 items-center px-6 py-4">
        
        {/* Left Side : Player Party */}
        <div className="space-y-6">
          {livingPlayers.map(player => {
            const isTurn = player.id === state.activeCombatantId;
            const hpRatio = (player.stats.hp / Math.max(1, player.stats.maxHp)) * 100;
            const mpRatio = (player.stats.mp / Math.max(1, player.stats.maxMp)) * 100;

            return (
              <div
                key={player.id}
                className={`relative flex items-center gap-4 transition-all duration-300 ${
                  isTurn ? 'translate-x-4 scale-105' : ''
                } ${player.isDead ? 'opacity-30 grayscale' : ''}`}
              >
                {/* Hologram Avatar Platform */}
                <div className={`relative w-20 h-20 rounded-xl border-2 flex items-center justify-center font-orbitron font-black text-2xl shadow-2xl transition-all ${
                  isTurn 
                    ? 'border-cyan-300 bg-gradient-to-br from-cyan-600 to-blue-900 shadow-[0_0_25px_rgba(0,243,255,0.8)] animate-pulse' 
                    : 'border-cyan-500/40 bg-[#041530]/80 text-cyan-200'
                }`}>
                  {player.name.slice(0, 2).toUpperCase()}
                  {player.isDefending && (
                    <div className="absolute -bottom-2 px-1.5 py-0.5 bg-blue-600 text-[8px] font-mono rounded-full text-white">
                      GARDE
                    </div>
                  )}
                </div>

                {/* Vitals HUD */}
                <div className="min-w-[170px] bg-[#020b1f]/90 border border-cyan-500/30 p-2.5 rounded-lg shadow-inner">
                  <div className="flex items-center justify-between text-xs font-orbitron font-black text-white mb-1">
                    <span>{player.name}</span>
                    <span className="text-[10px] text-cyan-300">NV {player.level}</span>
                  </div>

                  {/* HP Bar */}
                  <div className="space-y-0.5 mb-1.5">
                    <div className="flex justify-between text-[9px] font-mono text-gray-300">
                      <span>PV</span>
                      <span>{player.stats.hp} / {player.stats.maxHp}</span>
                    </div>
                    <div className="w-full h-2 bg-black/80 rounded-full overflow-hidden border border-white/20">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300" style={{ width: `${hpRatio}%` }} />
                    </div>
                  </div>

                  {/* MP Bar */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] font-mono text-gray-300">
                      <span>PSI / MP</span>
                      <span>{player.stats.mp} / {player.stats.maxMp}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden border border-white/20">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-300" style={{ width: `${mpRatio}%` }} />
                    </div>
                  </div>

                  {/* Status Tags Badges */}
                  {player.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {player.tags.map(t => (
                        <span key={t} className="text-[7px] font-mono px-1 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 uppercase">
                          {t.split('.').pop()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side : Enemy Formation */}
        <div className="space-y-6 flex flex-col items-end">
          {livingEnemies.map(enemy => {
            const isTurn = enemy.id === state.activeCombatantId;
            const hpRatio = (enemy.stats.hp / Math.max(1, enemy.stats.maxHp)) * 100;

            return (
              <div
                key={enemy.id}
                className={`relative flex items-center gap-4 transition-all duration-300 flex-row-reverse ${
                  isTurn ? '-translate-x-4 scale-105' : ''
                } ${enemy.isDead ? 'opacity-30 grayscale' : ''}`}
              >
                {/* Enemy Avatar Platform */}
                <div className={`relative w-24 h-24 rounded-xl border-2 flex items-center justify-center font-orbitron font-black text-3xl shadow-2xl transition-all ${
                  isTurn 
                    ? 'border-red-400 bg-gradient-to-br from-red-600 to-rose-950 shadow-[0_0_30px_rgba(255,0,0,0.8)] animate-pulse' 
                    : 'border-red-500/50 bg-[#240611]/80 text-red-200'
                }`}>
                  {enemy.isBoss ? '👑' : '👾'}
                </div>

                {/* Enemy Stats Card */}
                <div className="min-w-[200px] bg-[#1a040b]/90 border border-red-500/40 p-2.5 rounded-lg shadow-inner text-right">
                  <div className="flex items-center justify-between text-xs font-orbitron font-black text-white mb-1">
                    <span className="text-[9px] px-1 bg-red-900 border border-red-500 rounded text-red-200 uppercase">
                      {enemy.isBoss ? 'BOSS ALPHA' : 'MILICE'}
                    </span>
                    <span className="text-red-300">{enemy.name}</span>
                  </div>

                  <div className="space-y-0.5 mb-1.5">
                    <div className="flex justify-between text-[9px] font-mono text-gray-300">
                      <span>CIBLE EN VUE</span>
                      <span>{enemy.stats.hp} / {enemy.stats.maxHp} HP</span>
                    </div>
                    <div className="w-full h-2 bg-black/80 rounded-full overflow-hidden border border-white/20">
                      <div className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300" style={{ width: `${hpRatio}%` }} />
                    </div>
                  </div>

                  {enemy.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end mt-1">
                      {enemy.tags.map(t => (
                        <span key={t} className="text-[7px] font-mono px-1 py-0.2 rounded bg-red-950 border border-red-500/40 text-red-300 uppercase">
                          {t.split('.').pop()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM CONTROLLER : COMMAND MENU & STATUS DOCKS
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex justify-center mt-2">
        {activeCombatant && activeCombatant.side === 'player' && !state.isBattleOver && (
          <TacticalCommandMenu
            activeCombatant={activeCombatant}
            allCombatants={state.combatants}
            hfsm={hfsmRef.current}
            onExecuteAction={handleActionExecute}
            onOpenGambitModal={() => setIsGambitModalOpen(true)}
            onHoverActionRank={setHoveredRank}
            isExecuting={isExecuting}
          />
        )}

        {isExecuting && (
          <div className="p-3 bg-black/80 border border-cyan-400 rounded-lg text-xs font-orbitron font-bold text-cyan-300 animate-pulse">
            ⚡ RÉSOLUTION TACTIQUE EN COURS...
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VICTORY / DEFEAT MODALS
      ───────────────────────────────────────────────────────────── */}
      {state.isBattleOver && state.winner === 'player' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#00241b] via-[#01382b] to-[#001711] border-2 border-emerald-400 rounded-xl p-6 text-center shadow-[0_0_60px_rgba(0,255,136,0.6)] space-y-4">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto animate-bounce" />
            <div className="text-2xl font-orbitron font-black text-white tracking-widest uppercase">
              VICTOIRE TACTIQUE !
            </div>
            <p className="text-xs font-mono text-emerald-200">
              La milice corporative a été neutralisée. Les données d'intelligence ont été transférées vers votre Deck.
            </p>

            <div className="grid grid-cols-2 gap-3 p-3 bg-black/50 rounded-lg border border-emerald-500/30 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">BITCOIN // SATOSHIS</span>
                <span className="font-bold text-amber-300 font-orbitron">+750 Sats</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">NANITES & TECH</span>
                <span className="font-bold text-cyan-300 font-orbitron">+450 Nanites</span>
              </div>
            </div>

            <button
              onClick={() => onVictory({ exp: 1200, nanites: 450, satoshis: 750 })}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-orbitron font-black text-sm tracking-widest rounded shadow-lg hover:scale-102 transition-all uppercase"
            >
              RÉCUPÉRER LES PRIMES & CONTINUER
            </button>
          </div>
        </div>
      )}

      {state.isBattleOver && state.winner === 'enemy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#380008] via-[#240106] to-[#120003] border-2 border-red-500 rounded-xl p-6 text-center shadow-[0_0_60px_rgba(255,0,0,0.7)] space-y-4">
            <Skull className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
            <div className="text-2xl font-orbitron font-black text-white tracking-widest uppercase">
              K.O. // SURCHARGE NEURONALE
            </div>
            <p className="text-xs font-mono text-red-200">
              Vos circuits biométriques se sont éteints sous la violence de l'assaut. Protocole d'éjection d'urgence activé.
            </p>

            <button
              onClick={onDefeat}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-orbitron font-black text-sm tracking-widest rounded shadow-lg uppercase transition-all"
            >
              RÉAPPARITION AU CENTRE DE COMMANDE
            </button>
          </div>
        </div>
      )}

      {/* Gambit Rules Editor Modal */}
      <GambitConfigModal
        isOpen={isGambitModalOpen}
        onClose={() => setIsGambitModalOpen(false)}
        rules={gambitRules}
        availableActions={activeCombatant?.actions || []}
        onSaveRules={setGambitRules}
      />

    </div>
  );
};
