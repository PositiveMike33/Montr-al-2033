import React from 'react';
import { SkillNode } from '../types';
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
  RotateCcw
} from 'lucide-react';

interface SkillTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillPoints: number;
  skillNodes: SkillNode[];
  onUpgradeSkill: (nodeId: string) => void;
  onResetSkills: () => void;
}

export const SkillTreeModal: React.FC<SkillTreeModalProps> = ({
  isOpen,
  onClose,
  skillPoints,
  skillNodes,
  onUpgradeSkill,
  onResetSkills
}) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-chakra select-none text-[#c0c0c0]">
      <div className="bg-[#050506] border border-[#ff00ff44] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[0_0_60px_rgba(255,0,255,0.15)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00ff41]" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ff00ff33] bg-[#11111a]">
          <div className="flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-[#ff00ff]" />
            <div>
              <h2 className="text-base sm:text-lg font-orbitron font-bold text-white tracking-wider uppercase italic">
                ARBRE DE TALENTS // PROTOCOLES CYBER-PSI
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                Montréal 2033 // Spécialisation Cyber-Hacking & Éveil Psychique
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tree Content */}
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
      </div>
    </div>
  );
};
