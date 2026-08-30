import React from 'react';
import { StageInfo } from '../types';
import { STAGES_DATA } from '../utils/stageData';
import { 
  X, 
  Layers, 
  ShieldAlert, 
  Award, 
  Flame, 
  Skull, 
  Zap, 
  ArrowRight,
  CheckCircle2,
  Radio,
  Music
} from 'lucide-react';
import { ATMOSPHERE_STAGES } from '../utils/audio';

interface StageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStageId: number;
  difficultyTier: number;
  onSelectStage: (stage: StageInfo) => void;
  onSetDifficulty: (tier: number) => void;
}

export const StageSelectorModal: React.FC<StageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentStageId,
  difficultyTier,
  onSelectStage,
  onSetDifficulty
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-chakra select-none text-[#c0c0c0]">
      <div className="bg-[#050506] border border-[#00f3ff44] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[0_0_60px_rgba(0,243,255,0.15)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00ff41]" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#00f3ff33] bg-[#11111a]">
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-[#00f3ff]" />
            <div>
              <h2 className="text-base sm:text-lg font-orbitron font-bold text-white tracking-wider uppercase italic">
                BASTIONS URBAINS // MATRICE OVERCLOCK
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                Montréal 2033 // Sélection de secteur et calibrage du multiplicateur de loot (T1 à T10)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-cyber-radial">
          
          {/* 10 Difficulty Tiers Selector */}
          <div className="bg-[#11111a] p-4 border border-[#ffffff11] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#f2994a]" />
                <h3 className="font-orbitron font-bold text-xs sm:text-sm text-[#f2994a] uppercase">
                  Palier de Difficulté : Overclock Matrix (Tiers 1 à 10)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400">
                Bonus Butin : +{((difficultyTier - 1) * 15)}% Magic Find
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: 10 }).map((_, i) => {
                const tier = i + 1;
                const isSelected = difficultyTier === tier;
                return (
                  <button
                    key={tier}
                    onClick={() => onSetDifficulty(tier)}
                    className={`py-2 px-1 font-orbitron font-bold text-xs flex flex-col items-center gap-1 transition-all border ${
                      isSelected 
                        ? 'bg-[#f2994a] text-black border-[#f2994a] shadow-[0_0_15px_rgba(242,153,74,0.6)] scale-105' 
                        : 'bg-[#222] text-gray-400 border-[#ffffff22] hover:border-[#f2994a] hover:text-[#f2994a]'
                    }`}
                  >
                    <span>T{tier}</span>
                    <span className="text-[8px] opacity-80 font-mono">
                      +{i * 15}%
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-gray-400 bg-[#050506] px-3 py-2 border border-[#ffffff11] font-mono">
              <div className="flex items-center gap-1.5">
                <Skull className="w-3.5 h-3.5 text-[#ff0044]" />
                <span>Ennemis : <strong className="text-white">+{((difficultyTier - 1) * 20)}% PV & Dégâts</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#f2994a]" />
                <span>Multiplicateur Butin : <strong className="text-[#f2994a]">x{(1 + (difficultyTier - 1) * 0.15).toFixed(2)}</strong></span>
              </div>
            </div>
          </div>

          {/* 4 Montreal Stages */}
          <div className="flex flex-col gap-3">
            <h3 className="font-orbitron font-bold text-xs sm:text-sm text-[#00f3ff] flex items-center gap-2 uppercase">
              <Layers className="w-4 h-4" />
              Les 4 Bastions de Montréal 2033
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STAGES_DATA.map((stage) => {
                const isCurrent = currentStageId === stage.id;
                return (
                  <div
                    key={stage.id}
                    className={`p-5 border transition-all flex flex-col justify-between relative overflow-hidden group bg-[#11111a] ${
                      isCurrent 
                        ? 'border-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.2)]' 
                        : 'border-[#ffffff11] hover:border-[#ffffff33]'
                    }`}
                    style={{ borderLeftColor: stage.accentColor, borderLeftWidth: '3px' }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span 
                          className="font-orbitron font-bold text-[10px] px-2 py-0.5 border"
                          style={{ 
                            color: stage.accentColor, 
                            borderColor: `${stage.accentColor}55`,
                            backgroundColor: `${stage.accentColor}15`
                          }}
                        >
                          STAGE {stage.id}
                        </span>
                        {isCurrent && (
                          <span className="flex items-center gap-1 text-[10px] text-[#00f3ff] font-bold font-orbitron">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00f3ff]" />
                            ZONE ACTIVE
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white font-orbitron mb-1 uppercase">
                        {stage.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 mb-3 font-mono">
                        {stage.subtitle}
                      </p>
                      <p className="text-xs text-gray-300 leading-relaxed mb-4 font-sans">
                        {stage.description}
                      </p>

                      <div className="bg-[#050506] p-2.5 border border-[#ffffff11] mb-3">
                        <span className="text-[10px] font-orbitron font-bold text-gray-400 block uppercase mb-0.5">
                          Gardien du Bastion :
                        </span>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#ff0044] font-orbitron">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{stage.bossName}</span>
                        </div>
                      </div>

                      {/* Atmospheric Audio Soundscape Signature */}
                      {ATMOSPHERE_STAGES[stage.id] && (
                        <div className="bg-[#0c0c14] p-2.5 border border-[#ffffff0a] mb-4 flex items-center justify-between text-[10px] font-mono">
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Radio className="w-3 h-3 text-[#00f3ff]" />
                            <span className="truncate max-w-[200px]">{ATMOSPHERE_STAGES[stage.id].subtitle}</span>
                          </div>
                          <span 
                            className="font-bold font-orbitron text-[9px] px-1.5 py-0.5 border"
                            style={{ 
                              color: ATMOSPHERE_STAGES[stage.id].accentColor,
                              borderColor: `${ATMOSPHERE_STAGES[stage.id].accentColor}44`,
                              backgroundColor: `${ATMOSPHERE_STAGES[stage.id].accentColor}11`
                            }}
                          >
                            {ATMOSPHERE_STAGES[stage.id].bpm} BPM
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        onSelectStage(stage);
                        onClose();
                      }}
                      className={`w-full py-2.5 font-orbitron font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 uppercase ${
                        isCurrent
                          ? 'bg-[#222] text-[#00f3ff] border border-[#00f3ff]'
                          : 'bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                      }`}
                    >
                      <span>{isCurrent ? 'Secteur Actuel' : 'Déployer l’Incursion'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
