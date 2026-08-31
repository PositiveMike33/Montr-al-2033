import React, { useEffect, useState } from 'react';
import { 
  Swords, 
  ShieldAlert, 
  XOctagon, 
  Crosshair, 
  Coins, 
  Zap, 
  Flame, 
  Shield, 
  Cpu, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  Globe
} from 'lucide-react';
import { sound } from '../utils/audio';
import { StageInfo, PlayerStats } from '../types';

export interface BattleEncounterData {
  sectorName: string;
  sectorSub: string;
  enemyName: string;
  enemyType: string;
  threatLevel: 'FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ' | 'EXTRÊME' | 'CRITIQUE // BOSS';
  bountySatoshis: number;
  nanitesReward: number;
  bossHpEstimate?: number;
  weakness: string;
  description: string;
}

interface FF7BattleEncounterModalProps {
  isOpen: boolean;
  encounterData?: BattleEncounterData;
  playerLevel: number;
  playerHp: number;
  playerMaxHp: number;
  playerPsi: number;
  playerMaxPsi: number;
  currentStage?: StageInfo;
  onAcceptBattle: () => void;
  onRefuseBattle: () => void;
}

export const FF7BattleEncounterModal: React.FC<FF7BattleEncounterModalProps> = ({
  isOpen,
  encounterData,
  playerLevel,
  playerHp,
  playerMaxHp,
  playerPsi,
  playerMaxPsi,
  currentStage,
  onAcceptBattle,
  onRefuseBattle
}) => {
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<'ENGAGE' | 'REFUSE'>('ENGAGE');
  const [swirlActive, setSwirlActive] = useState<boolean>(true);

  const defaultEncounter: BattleEncounterData = {
    sectorName: currentStage?.name || 'PLACE VILLE-MARIE // TOUR VANCE',
    sectorSub: currentStage?.description || 'QG Corporation Vance - Dôme de Sécurité SPVM-Prime',
    enemyName: currentStage?.bossName || 'Viktor Vance & Milice Cyber-Renforcée',
    enemyType: 'Cible Prioritaire / Boss Corporatif Alpha',
    threatLevel: 'CRITIQUE // BOSS',
    bountySatoshis: 750,
    nanitesReward: 450,
    bossHpEstimate: currentStage ? currentStage.bossHpMultiplier * 5000 : 12000,
    weakness: 'Dégâts Psychiques (Psi Lance) & Surcharge EMP',
    description: 'Une unité d’intervention lourdement armée a été détectée sur la zone. Le combat ne démarrera que si vous acceptez explicitement l’incursion tactique.'
  };

  const encounter = encounterData || defaultEncounter;

  useEffect(() => {
    if (isOpen) {
      sound.playFF7BattleEncounter();
      setSwirlActive(true);
      const timer = setTimeout(() => {
        setSwirlActive(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isTransitioning) return;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        setSelectedOption('ENGAGE');
        sound.playUiClick();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        setSelectedOption('REFUSE');
        sound.playUiClick();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (selectedOption === 'ENGAGE') {
          handleEngage();
        } else {
          handleRefuse();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleRefuse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedOption, isTransitioning]);

  if (!isOpen) return null;

  const handleEngage = () => {
    setIsTransitioning(true);
    sound.playFF7BattleStart();
    setTimeout(() => {
      setIsTransitioning(false);
      onAcceptBattle();
    }, 600);
  };

  const handleRefuse = () => {
    sound.playFF7Escape();
    onRefuseBattle();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden select-none font-sans">
      
      {/* Background Dark Overlay with Retro Scanlines */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={handleRefuse}
      />

      {/* FF7 Battle Encounter Swirl Effect Animation */}
      {swirlActive && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          <div className="w-[200vw] h-[200vh] bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.4)_0%,rgba(255,0,255,0.3)_30%,transparent_70%)] animate-[spin_0.7s_ease-out]" />
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      )}

      {/* Battle Start Transition Flash */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-white z-50 animate-[ping_0.6s_ease-out] flex items-center justify-center pointer-events-none">
          <div className="text-black font-orbitron font-black text-4xl tracking-widest uppercase animate-bounce">
            ⚔️ ENGAGEMENT EN COURS...
          </div>
        </div>
      )}

      {/* Main FF7-Themed Holographic Battle Dialog Window */}
      <div className="relative z-10 w-full max-w-2xl bg-gradient-to-b from-[#02102e] via-[#041a4a] to-[#01091a] border-2 border-white/80 rounded-xl shadow-[0_0_50px_rgba(0,180,255,0.6),inset_0_0_25px_rgba(0,180,255,0.3)] overflow-hidden">
        
        {/* Top FF7 Style Header Bar with Bevel */}
        <div className="bg-gradient-to-r from-[#003884] via-[#005bb5] to-[#003884] border-b-2 border-white/60 px-5 py-3 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-red-600 border border-white flex items-center justify-center text-white animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.8)]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-orbitron font-black text-white tracking-widest flex items-center gap-2 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <span>FINAL FANTASY VII // ENCOUNTER SYSTEM</span>
                <span className="text-[#00f3ff]">•</span>
                <span className="text-yellow-300">ALERTE DE COMBAT IMMINENT</span>
              </div>
              <div className="text-[10px] font-mono text-cyan-200">
                Protocole de combat tactile • Approbation requise de Thirty3
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-red-950/80 border border-red-500 text-red-300 text-[10px] font-orbitron font-bold rounded animate-pulse">
              {encounter.threatLevel}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-white">
          
          {/* Sector and Target Details Card */}
          <div className="bg-[#020b20]/90 border border-cyan-400/40 rounded-lg p-3.5 shadow-inner space-y-2.5">
            <div className="flex items-start justify-between border-b border-cyan-500/20 pb-2">
              <div>
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SECTEUR D'INCURSION // {encounter.sectorName}</span>
                </div>
                <div className="text-base font-orbitron font-black text-white tracking-wide mt-0.5">
                  {encounter.enemyName}
                </div>
                <div className="text-xs text-gray-300 font-sans mt-0.5">
                  {encounter.enemyType}
                </div>
              </div>

              {encounter.bossHpEstimate && (
                <div className="text-right">
                  <span className="text-[9px] font-mono text-gray-400 block">ESTIMATION HP CIBLE</span>
                  <span className="text-xs font-orbitron font-black text-red-400">
                    {encounter.bossHpEstimate.toLocaleString()} HP
                  </span>
                </div>
              )}
            </div>

            {/* Description & Weakness */}
            <div className="text-xs text-gray-200 leading-relaxed font-mono bg-[#05122e] p-2.5 rounded border border-cyan-500/20">
              <p className="mb-1">{encounter.description}</p>
              <div className="flex items-center gap-2 text-[10px] text-yellow-300 font-bold mt-1">
                <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
                <span>FAIBLESSE RECOMMANDÉE : {encounter.weakness}</span>
              </div>
            </div>

            {/* Rewards & Bounty Satoshis */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#071738] border border-amber-400/40 p-2 rounded flex items-center justify-between">
                <span className="text-gray-300 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>PRIME BITCOIN</span>
                </span>
                <span className="text-amber-300 font-bold font-orbitron">
                  +{encounter.bountySatoshis} Satoshis
                </span>
              </div>

              <div className="bg-[#071738] border border-cyan-400/40 p-2 rounded flex items-center justify-between">
                <span className="text-gray-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>NANITES & TECH</span>
                </span>
                <span className="text-cyan-300 font-bold font-orbitron">
                  +{encounter.nanitesReward} Nanites
                </span>
              </div>
            </div>
          </div>

          {/* Player Readiness Mini Status Bar (FF7 Style HP/MP/Limit) */}
          <div className="bg-[#010917]/90 border border-white/30 rounded-lg p-3 grid grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <div className="text-[9px] text-gray-400">COMBATTANT // THIRTY3</div>
              <div className="text-white font-orbitron font-bold text-xs">NIVEAU {playerLevel}</div>
            </div>

            <div>
              <div className="text-[9px] text-emerald-400 font-bold">HP (SANTÉ CYBERNÉTIQUE)</div>
              <div className="text-emerald-300 font-orbitron font-bold text-xs">
                {Math.round(playerHp)} / {playerMaxHp}
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded mt-1 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${Math.max(5, (playerHp / playerMaxHp) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="text-[9px] text-cyan-400 font-bold">PSI (ÉNERGIE SYNAPTIQUE)</div>
              <div className="text-cyan-300 font-orbitron font-bold text-xs">
                {Math.round(playerPsi)} / {playerMaxPsi}
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded mt-1 overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full transition-all"
                  style={{ width: `${Math.max(5, (playerPsi / playerMaxPsi) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Strict Choice Box - Final Fantasy 7 Style Cursor */}
          <div className="pt-2 space-y-2">
            <div className="text-[11px] font-orbitron font-bold text-cyan-200 text-center uppercase tracking-wider">
              — VEUILLEZ CONFIRMER VOTRE INTENTION TACTIQUE —
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: ENGAGE BATTLE */}
              <button
                type="button"
                onClick={handleEngage}
                onMouseEnter={() => {
                  setSelectedOption('ENGAGE');
                  sound.playUiClick();
                }}
                className={`p-3 rounded-lg border-2 font-orbitron font-black text-xs uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer shadow-lg ${
                  selectedOption === 'ENGAGE'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black border-white shadow-[0_0_25px_rgba(0,243,255,0.7)] scale-[1.02]'
                    : 'bg-[#03112c] text-cyan-300 border-cyan-500/40 hover:border-cyan-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 transition-opacity ${selectedOption === 'ENGAGE' ? 'opacity-100 animate-bounce' : 'opacity-0'}`}>
                    <ChevronRight className="w-3.5 h-3.5 text-black stroke-[3]" />
                  </div>
                  <Swords className="w-4 h-4" />
                  <span>ENGAGER LE COMBAT</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-black/20 rounded">
                  [ENTER]
                </span>
              </button>

              {/* Option 2: REFUSE / RETURN TO TOOLS & WORLD MONITOR */}
              <button
                type="button"
                onClick={handleRefuse}
                onMouseEnter={() => {
                  setSelectedOption('REFUSE');
                  sound.playUiClick();
                }}
                className={`p-3 rounded-lg border-2 font-orbitron font-black text-xs uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer shadow-lg ${
                  selectedOption === 'REFUSE'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-white shadow-[0_0_25px_rgba(255,0,85,0.7)] scale-[1.02]'
                    : 'bg-[#03112c] text-gray-300 border-white/20 hover:border-red-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 transition-opacity ${selectedOption === 'REFUSE' ? 'opacity-100 animate-bounce' : 'opacity-0'}`}>
                    <ChevronRight className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                  <Globe className="w-4 h-4" />
                  <span>RESTER SUR LE WORLD MONITOR</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-black/20 rounded">
                  [ÉCHAP]
                </span>
              </button>
            </div>

            <div className="text-[10px] font-mono text-gray-400 text-center pt-1">
              💡 Le combat ne commencera jamais sans votre validation. Vous restez maître du Centre de Commandement et des 59 outils.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
