import React from 'react';
import { Companion } from '../types';
import { 
  X, 
  Bot, 
  Shield, 
  Crosshair, 
  Zap, 
  Sparkles, 
  Check, 
  Plus, 
  UserCheck, 
  AlertCircle,
  Activity,
  Award
} from 'lucide-react';

interface CompanionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companions: Companion[];
  onToggleCompanion: (companionId: string) => void;
  onUpgradeCompanion: (companionId: string) => void;
  nanites: number;
}

export const CompanionsModal: React.FC<CompanionsModalProps> = ({
  isOpen,
  onClose,
  companions,
  onToggleCompanion,
  onUpgradeCompanion,
  nanites
}) => {
  if (!isOpen) return null;

  const activeCount = companions.filter(c => c.active).length;

  const getCompanionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot': return <Bot className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'Crosshair': return <Crosshair className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      default: return <Bot className="w-5 h-5" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'support':
        return <span className="px-2 py-0.5 text-[9px] font-orbitron font-bold border border-[#00f3ff] text-[#00f3ff] bg-[#00f3ff11]">SOUTIEN & HEAL</span>;
      case 'tank':
        return <span className="px-2 py-0.5 text-[9px] font-orbitron font-bold border border-[#ff0044] text-[#ff0044] bg-[#ff004411]">TANK & PROVOCATION</span>;
      case 'offense':
        return <span className="px-2 py-0.5 text-[9px] font-orbitron font-bold border border-[#ff00ff] text-[#ff00ff] bg-[#ff00ff11]">ASSAUT DPS</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-chakra select-none text-[#c0c0c0]">
      <div className="bg-[#050506] border border-[#00f3ff44] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[0_0_60px_rgba(0,243,255,0.15)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00ff41]" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#00f3ff33] bg-[#11111a]">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-[#00f3ff]" />
            <div>
              <h2 className="text-base sm:text-lg font-orbitron font-bold text-white tracking-wider uppercase italic">
                DROÏDES & ALLIÉS SYNAPTIQUES // ESCOUADE IA
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                Montréal 2033 // Gestion des drones de combat autonomes (Maximum 2 actifs simultanément)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#222] border border-[#00f3ff] px-3 py-1 text-[#00f3ff] font-orbitron font-bold text-xs">
              <UserCheck className="w-4 h-4 text-[#00f3ff]" />
              <span>Escouade : {activeCount} / 2 Actifs</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-cyber-radial">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companions.map((comp) => {
              const upgradeCost = comp.level * 120;
              const canUpgrade = nanites >= upgradeCost;

              return (
                <div
                  key={comp.id}
                  className={`p-5 border transition-all flex flex-col justify-between relative bg-[#11111a] ${
                    comp.active 
                      ? 'border-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.2)]' 
                      : 'border-[#ffffff11] opacity-85 hover:opacity-100 hover:border-[#ffffff33]'
                  }`}
                  style={{ borderLeftColor: comp.avatarColor, borderLeftWidth: '3px' }}
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="p-2 border"
                          style={{ borderColor: comp.avatarColor, backgroundColor: `${comp.avatarColor}15`, color: comp.avatarColor }}
                        >
                          {getCompanionIcon(comp.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-orbitron font-bold text-sm text-white">{comp.name}</h3>
                            <span className="text-[10px] font-mono bg-[#222] px-1.5 py-0.5 border border-[#ffffff22] text-[#f2994a] font-bold">
                              NIV. {comp.level}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 font-mono">{comp.title}</p>
                        </div>
                      </div>
                      {getRoleBadge(comp.role)}
                    </div>

                    {/* Stats Matrix */}
                    <div className="grid grid-cols-3 gap-2 bg-[#050506] p-2.5 border border-[#ffffff11] mb-3 text-center">
                      <div>
                        <span className="text-[9px] text-gray-500 font-mono block uppercase">Santé Blindée</span>
                        <span className="text-xs font-bold text-white font-mono">{comp.hp} / {comp.maxHp}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 font-mono block uppercase">Puissance Frappe</span>
                        <span className="text-xs font-bold text-[#00f3ff] font-mono">{comp.damage} DPS</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 font-mono block uppercase">Portée Radar</span>
                        <span className="text-xs font-bold text-[#f2994a] font-mono">{comp.attackRange}px</span>
                      </div>
                    </div>

                    {/* Active Ability */}
                    <div className="bg-[#11111a] border border-[#ffffff11] p-3 mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#00ff41] font-orbitron mb-1">
                        <Zap className="w-3.5 h-3.5 text-[#00ff41]" />
                        Capacité : {comp.abilityName}
                      </div>
                      <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                        {comp.abilityDesc}
                      </p>
                    </div>

                    {/* Passive Buff for Protagonist */}
                    <div className="bg-[#00f3ff08] border border-[#00f3ff22] p-2.5 mb-4 text-[11px] font-mono text-[#00f3ff] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#00f3ff] shrink-0" />
                      <span>Passif Équipe : {comp.passiveBonus}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#ffffff11]">
                    <button
                      onClick={() => onToggleCompanion(comp.id)}
                      className={`flex-1 py-2 font-orbitron font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                        comp.active 
                          ? 'bg-[#00f3ff] text-black shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:bg-[#00f3ff]/80' 
                          : activeCount >= 2 
                            ? 'bg-[#222] text-gray-500 border border-[#ffffff11] cursor-not-allowed'
                            : 'bg-[#222] hover:bg-[#00f3ff22] border border-[#00f3ff] text-[#00f3ff]'
                      }`}
                    >
                      {comp.active ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>DÉPLOYÉ EN COMBAT</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>{activeCount >= 2 ? 'ESCOUADE MAX (2/2)' : 'DÉPLOYER AUX CÔTÉS DU JOUEUR'}</span>
                        </>
                      )}
                    </button>

                    <button
                      disabled={!canUpgrade}
                      onClick={() => onUpgradeCompanion(comp.id)}
                      className={`px-3 py-2 border font-orbitron font-bold text-xs transition-all flex items-center gap-1.5 ${
                        canUpgrade 
                          ? 'bg-[#f2994a]/20 hover:bg-[#f2994a] border-[#f2994a] text-[#f2994a] hover:text-black shadow-[0_0_10px_rgba(242,153,74,0.3)]' 
                          : 'bg-[#222] border-[#ffffff11] text-gray-600 cursor-not-allowed'
                      }`}
                      title={`Améliorer (+15% stats) : ${upgradeCost} Nanites`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>NIV.+ ({upgradeCost}N)</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
