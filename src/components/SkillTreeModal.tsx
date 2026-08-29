import React, { useState } from 'react';
import { SkillNode, AbilityType, AbilityMasteryData } from '../types';
import { 
  X, 
  GitBranch, 
  Zap, 
  Terminal, 
  Radio, 
  ShieldAlert, 
  Cpu, 
  Crosshair, 
  Disc, 
  Flame, 
  Sparkles,
  Plus,
  RotateCcw,
  Award,
  CheckCircle2,
  Lock,
  Compass,
  Activity,
  Shield,
  Clock
} from 'lucide-react';

interface SkillTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillPoints: number;
  skillNodes: SkillNode[];
  abilityMastery?: Record<AbilityType, AbilityMasteryData>;
  onUpgradeSkill: (nodeId: string) => void;
  onResetSkills: () => void;
}

export const SkillTreeModal: React.FC<SkillTreeModalProps> = ({
  isOpen,
  onClose,
  skillPoints,
  skillNodes,
  abilityMastery,
  onUpgradeSkill,
  onResetSkills
}) => {
  const [activeTab, setActiveTab] = useState<'tree' | 'mastery'>('tree');

  if (!isOpen) return null;

  const cyberSkills = skillNodes.filter(s => s.branch === 'cyber');
  const psychicSkills = skillNodes.filter(s => s.branch === 'psychic');

  const getSkillIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal': return <Terminal className="w-5 h-5" />;
      case 'Radio': return <Radio className="w-5 h-5" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Crosshair': return <Crosshair className="w-5 h-5" />;
      case 'Disc': return <Disc className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getAbilityIcon = (type: AbilityType) => {
    switch (type) {
      case 'primary': return <Crosshair className="w-5 h-5 text-[#00f3ff]" />;
      case 'lance': return <Zap className="w-5 h-5 text-[#38bdf8]" />;
      case 'emp': return <Radio className="w-5 h-5 text-[#00ff41]" />;
      case 'vortex': return <Disc className="w-5 h-5 text-[#a855f7]" />;
      case 'bulletTime': return <Clock className="w-5 h-5 text-[#f59e0b]" />;
      case 'dash': return <Activity className="w-5 h-5 text-[#ec4899]" />;
      default: return <Zap className="w-5 h-5 text-[#00f3ff]" />;
    }
  };

  const renderSkillBranch = (skills: SkillNode[], title: string, subtitle: string, accentColor: string, isCyber: boolean) => (
    <div className="flex flex-col gap-4 flex-1">
      <div className={`p-3 border-l-2 ${isCyber ? 'border-[#00ff41]' : 'border-[#00f3ff]'} bg-[#11111a] border-t border-r border-b border-[#ffffff11]`}>
        <h3 className="font-orbitron font-bold text-sm tracking-wider flex items-center gap-2 text-white uppercase">
          {isCyber ? <Terminal className="w-4 h-4 text-[#00ff41]" /> : <Zap className="w-4 h-4 text-[#00f3ff]" />}
          {title}
        </h3>
        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-3">
        {skills.map((skill) => {
          const isMaxed = skill.currentRank >= skill.maxRank;
          const canUpgrade = skillPoints > 0 && !isMaxed;

          return (
            <div 
              key={skill.id}
              className={`p-4 border transition-all ${
                skill.currentRank > 0 
                  ? `${isCyber ? 'border-[#00ff41]/60 shadow-[0_0_15px_rgba(0,255,65,0.15)]' : 'border-[#00f3ff]/60 shadow-[0_0_15px_rgba(0,243,255,0.15)]'} bg-[#11111a]` 
                  : 'border-[#ffffff11] bg-[#050506] opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 ${skill.currentRank > 0 ? (isCyber ? 'bg-[#00ff41]/20 text-[#00ff41] border border-[#00ff41]' : 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]') : 'bg-[#222] text-gray-600'}`}>
                    {getSkillIcon(skill.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-white font-orbitron">{skill.name}</h4>
                      <span className={`text-[9px] font-orbitron font-bold px-1.5 py-0.5 border ${isMaxed ? 'bg-[#f2994a]/20 text-[#f2994a] border-[#f2994a]' : 'bg-[#222] text-gray-300 border-[#ffffff22]'}`}>
                        {skill.currentRank} / {skill.maxRank}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed font-sans">
                      {skill.description}
                    </p>
                  </div>
                </div>

                <button
                  disabled={!canUpgrade}
                  onClick={() => onUpgradeSkill(skill.id)}
                  className={`p-2 font-orbitron font-bold text-xs flex items-center gap-1 transition-all ${
                    canUpgrade 
                      ? 'bg-[#00f3ff] hover:bg-[#00f3ff]/80 text-black shadow-[0_0_10px_rgba(0,243,255,0.5)] cursor-pointer' 
                      : 'bg-[#222] text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const masteryList: AbilityMasteryData[] = abilityMastery ? Object.values(abilityMastery) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-chakra select-none text-[#c0c0c0]">
      <div className="bg-[#050506] border border-[#ff00ff44] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(255,0,255,0.15)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00ff41]" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ff00ff33] bg-[#11111a]">
          <div className="flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-[#ff00ff]" />
            <div>
              <h2 className="text-base sm:text-lg font-orbitron font-bold text-white tracking-wider uppercase italic">
                SYSTÈMES D'ÉVOLUTION // TALENTS & MAÎTRISE
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                Montréal 2033 // Spécialisation Cyber-Hacking & Progression des Aptitudes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'tree' && (
              <>
                <div className="flex items-center gap-2 bg-[#222] border border-[#ff00ff] px-3 py-1 text-[#ff00ff] font-orbitron font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-[#ff00ff]" />
                  <span>{skillPoints} Points de Talents</span>
                </div>
                <button
                  onClick={onResetSkills}
                  className="px-3 py-1 bg-[#222] hover:bg-gray-800 border border-[#ffffff22] text-gray-300 text-xs font-orbitron flex items-center gap-1 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser</span>
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-[#090912] border-b border-[#ffffff11] flex items-center gap-4">
          <button
            onClick={() => setActiveTab('tree')}
            className={`flex items-center gap-2 px-4 py-1.5 font-orbitron font-bold text-xs transition-all ${
              activeTab === 'tree'
                ? 'bg-[#ff00ff] text-white shadow-[0_0_15px_rgba(255,0,255,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-[#222]'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>ARBRE DE TALENTS CYBER-PSI</span>
          </button>
          <button
            onClick={() => setActiveTab('mastery')}
            className={`flex items-center gap-2 px-4 py-1.5 font-orbitron font-bold text-xs transition-all ${
              activeTab === 'mastery'
                ? 'bg-[#00f3ff] text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                : 'text-gray-400 hover:text-white hover:bg-[#222]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>MAÎTRISE DES APTITUDES & STATUTS</span>
          </button>
        </div>

        {/* Modal Content */}
        {activeTab === 'tree' ? (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-cyber-radial">
            {renderSkillBranch(
              cyberSkills,
              'Branche Cyber-Hacking & EMP',
              'Surcharge matérielle, dégâts de zone et contrôle de drones',
              'border-[#00ff41]',
              true
            )}
            {renderSkillBranch(
              psychicSkills,
              'Branche Éveil Psychique & Télékinésie',
              'Impacts bruts, trous noirs et distorsion temporelle',
              'border-[#00f3ff]',
              false
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-cyber-radial">
            <div className="p-3.5 bg-[#11111a] border-l-2 border-[#00f3ff] border-t border-r border-b border-[#ffffff11] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#00f3ff]" />
                  PROGRESSION CONTINUE PAR UTILISATION AU COMBAT
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Chaque aptitude gagne des bonus passifs (portée, durée, knockback, perce-armure, drain) au fil de vos exécutions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {masteryList.map((m) => {
                const nextTier = m.tiers.find(t => t.tier === m.currentTier + 1);
                const progressPct = nextTier 
                  ? Math.min(100, Math.round((m.usesCount / nextTier.reqUses) * 100))
                  : 100;

                return (
                  <div 
                    key={m.id} 
                    className="p-4 bg-[#11111a] border border-[#ffffff15] hover:border-[#00f3ff44] transition-all flex flex-col justify-between gap-3 shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#050506] border border-[#ffffff22]">
                            {getAbilityIcon(m.id)}
                          </div>
                          <div>
                            <h4 className="font-orbitron font-bold text-sm text-white">{m.name}</h4>
                            <span className="text-[10px] text-gray-400 font-mono">
                              Total utilisations : <strong className="text-[#00f3ff]">{m.usesCount}</strong>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-orbitron font-black text-[#f59e0b] px-2 py-0.5 bg-[#f59e0b]/10 border border-[#f59e0b]/30 inline-block">
                            TIER {m.currentTier} / 3
                          </span>
                        </div>
                      </div>

                      {/* Progress bar to next tier */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                          <span>
                            {nextTier ? `Prochain palier : ${nextTier.perkName}` : 'Maîtrise Maximale Atteinte'}
                          </span>
                          <span>
                            {nextTier ? `${m.usesCount} / ${nextTier.reqUses} (${progressPct}%)` : '100%'}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#050506] border border-[#ffffff22] overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#00f3ff] to-[#a855f7] transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tier bonuses list */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-[#ffffff11]">
                      {m.tiers.map((t) => (
                        <div 
                          key={t.tier}
                          className={`flex items-start gap-2 p-1.5 text-xs font-mono transition-all ${
                            t.unlocked 
                              ? 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/20' 
                              : 'bg-[#050506]/60 text-gray-500 border border-transparent'
                          }`}
                        >
                          {t.unlocked ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#00ff41]" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-600" />
                          )}
                          <div className="flex-1">
                            <span className="font-bold font-orbitron text-[10px] uppercase mr-1.5">
                              [T{t.tier} - {t.perkName}] :
                            </span>
                            <span className={t.unlocked ? 'text-gray-200' : 'text-gray-500'}>
                              {t.perkDesc}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
