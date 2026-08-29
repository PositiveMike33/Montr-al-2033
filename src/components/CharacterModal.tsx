import React from 'react';
import { PlayerAttributes, PlayerStats, AvatarCustomization } from '../types';
import { 
  X, 
  User, 
  Plus, 
  Shield, 
  Zap, 
  Activity, 
  Cpu, 
  Eye, 
  Palette, 
  Flame, 
  Sparkles,
  Award
} from 'lucide-react';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  unspentAttributePoints: number;
  attributes: PlayerAttributes;
  stats: PlayerStats;
  customization: AvatarCustomization;
  onAllocateAttribute: (attr: keyof PlayerAttributes) => void;
  onUpdateCustomization: (custom: Partial<AvatarCustomization>) => void;
}

const NEON_PALETTE = [
  '#00f3ff', // Cyber Cyan
  '#ff00ff', // Neon Magenta
  '#00ff41', // Bio-Green
  '#f2994a', // Solar Amber
  '#9b51e0', // Ultra Violet
  '#ff0044', // Crimson Red
  '#ffffff', // Ghost White
  '#2d9cdb'  // Electric Blue
];

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  level,
  unspentAttributePoints,
  attributes,
  stats,
  customization,
  onAllocateAttribute,
  onUpdateCustomization
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-chakra select-none text-[#c0c0c0]">
      <div className="bg-[#050506] border border-[#00f3ff44] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[0_0_60px_rgba(0,243,255,0.15)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00ff41]" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#00f3ff33] bg-[#11111a]">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-[#00f3ff]" />
            <div>
              <h2 className="text-base sm:text-lg font-orbitron font-bold text-white tracking-wider uppercase italic">
                PROFIL DU PROTAGONISTE // MATRICE BIOMÉTRIQUE
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                Montréal 2033 // Allocation synaptique et personnalisation du hacker
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {unspentAttributePoints > 0 && (
              <div className="flex items-center gap-2 bg-[#00f3ff22] border border-[#00f3ff] px-3 py-1 text-[#00f3ff] font-orbitron font-bold text-xs animate-pulse">
                <Sparkles className="w-4 h-4 text-[#00f3ff]" />
                <span>{unspentAttributePoints} Points Disponibles</span>
              </div>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-cyber-radial">
          
          {/* Column 1: The 4 Core Attributes (Tactical Rig Styling) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h3 className="text-xs font-orbitron font-bold text-[#00f3ff] tracking-wider flex items-center gap-2 uppercase">
              <Zap className="w-4 h-4" />
              Attributs Fondamentaux
            </h3>

            <div className="flex flex-col gap-3">
              {/* Synaptic Power */}
              <div className="p-3.5 bg-[#11111a] border-l-2 border-[#00f3ff] border-t border-r border-b border-[#ffffff11]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-orbitron font-bold text-xs sm:text-sm text-[#00f3ff] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#00f3ff]" />
                    Synaptic Power
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white font-mono">{attributes.synapticPower}</span>
                    {unspentAttributePoints > 0 && (
                      <button
                        onClick={() => onAllocateAttribute('synapticPower')}
                        className="p-1 bg-[#00f3ff] hover:bg-[#00f3ff]/80 text-black transition-all font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full h-1 bg-[#222] my-1.5">
                  <div className="h-full bg-[#00f3ff] shadow-[0_0_8px_#00f3ff]" style={{ width: `${Math.min(100, attributes.synapticPower * 3)}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 font-mono">
                  Dégâts psioniques (+3%), portée télékinétique et crit psychique (+0.4%).
                </p>
              </div>

              {/* Cyber Overclock */}
              <div className="p-3.5 bg-[#11111a] border-l-2 border-[#ff00ff] border-t border-r border-b border-[#ffffff11]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-orbitron font-bold text-xs sm:text-sm text-[#ff00ff] flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#ff00ff]" />
                    Cyber Overclock
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white font-mono">{attributes.cyberOverclock}</span>
                    {unspentAttributePoints > 0 && (
                      <button
                        onClick={() => onAllocateAttribute('cyberOverclock')}
                        className="p-1 bg-[#ff00ff] hover:bg-[#ff00ff]/80 text-black transition-all font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full h-1 bg-[#222] my-1.5">
                  <div className="h-full bg-[#ff00ff] shadow-[0_0_8px_#ff00ff]" style={{ width: `${Math.min(100, attributes.cyberOverclock * 3)}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 font-mono">
                  Dégâts de hacking/EMP (+3%), perforation et réduction des recharges (+0.3%).
                </p>
              </div>

              {/* Bio-Armor */}
              <div className="p-3.5 bg-[#11111a] border-l-2 border-[#00ff41] border-t border-r border-b border-[#ffffff11]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-orbitron font-bold text-xs sm:text-sm text-[#00ff41] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#00ff41]" />
                    Bio-Armor
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white font-mono">{attributes.bioArmor}</span>
                    {unspentAttributePoints > 0 && (
                      <button
                        onClick={() => onAllocateAttribute('bioArmor')}
                        className="p-1 bg-[#00ff41] hover:bg-[#00ff41]/80 text-black transition-all font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full h-1 bg-[#222] my-1.5">
                  <div className="h-full bg-[#00ff41] shadow-[0_0_8px_#00ff41]" style={{ width: `${Math.min(100, attributes.bioArmor * 3)}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 font-mono">
                  Points de vie max (+25 PV), absorption cinétique (+2 armure) et régénération.
                </p>
              </div>

              {/* Neural Reflex */}
              <div className="p-3.5 bg-[#11111a] border-l-2 border-[#f2994a] border-t border-r border-b border-[#ffffff11]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-orbitron font-bold text-xs sm:text-sm text-[#f2994a] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#f2994a]" />
                    Neural Reflex
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white font-mono">{attributes.neuralReflex}</span>
                    {unspentAttributePoints > 0 && (
                      <button
                        onClick={() => onAllocateAttribute('neuralReflex')}
                        className="p-1 bg-[#f2994a] hover:bg-[#f2994a]/80 text-black transition-all font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full h-1 bg-[#222] my-1.5">
                  <div className="h-full bg-[#f2994a] shadow-[0_0_8px_#f2994a]" style={{ width: `${Math.min(100, attributes.neuralReflex * 3)}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 font-mono">
                  Vitesse synaptique, chance d'esquive (+0.5%) et dégâts physiques au corps-à-corps.
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Derived Combat Telemetry */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h3 className="text-xs font-orbitron font-bold text-[#ff00ff] tracking-wider flex items-center gap-2 uppercase">
              <Award className="w-4 h-4" />
              Télémétrie de Combat
            </h3>

            <div className="bg-[#11111a] border border-[#ffffff11] p-4 flex flex-col gap-2.5">
              <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                <span className="text-gray-400 font-mono">Bio-Santé Maximale</span>
                <span className="font-bold text-[#ff0044] font-mono">{stats.maxHp} PV</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                <span className="text-gray-400 font-mono">Énergie Synaptique (PSI)</span>
                <span className="font-bold text-[#00f3ff] font-mono">{stats.maxPsi} MHZ</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                <span className="text-gray-400 font-mono">Dégâts Physiques / Lame</span>
                <span className="font-bold text-[#00ff41] font-mono">{stats.physicalDamage} PTS</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                <span className="text-gray-400 font-mono">Dégâts Psioniques & EMP</span>
                <span className="font-bold text-[#00f3ff] font-mono">{stats.psiDamage} PTS</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                <span className="text-gray-400 font-mono">Blindage Exo-Squelette</span>
                <span className="font-bold text-gray-200 font-mono">{stats.armor} PTS</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                <span className="text-gray-400 font-mono">Chance Coup Critique</span>
                <span className="font-bold text-[#f2994a] font-mono">{stats.critChance.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                <span className="text-gray-400 font-mono">Multiplicateur Critique</span>
                <span className="font-bold text-[#f2994a] font-mono">{stats.critDamage}%</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                <span className="text-gray-400 font-mono">Vitesse de Déplacement</span>
                <span className="font-bold text-gray-200 font-mono">{stats.moveSpeed.toFixed(1)} m/s</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#ffffff0a] text-xs">
                <span className="text-gray-400 font-mono">Réduction des Recharges</span>
                <span className="font-bold text-[#ff00ff] font-mono">{stats.cooldownReduction.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-1 text-xs">
                <span className="text-gray-400 font-mono">Chance d'Esquive Synaptique</span>
                <span className="font-bold text-[#00ff41] font-mono">{stats.dodgeChance.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Column 3: Live Avatar Customizer */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h3 className="text-xs font-orbitron font-bold text-[#00ff41] tracking-wider flex items-center gap-2 uppercase">
              <Palette className="w-4 h-4" />
              Cosmétiques & Shaders
            </h3>

            <div className="bg-[#11111a] border border-[#ffffff11] p-4 flex flex-col gap-3.5">
              {/* Visual Avatar Hologram Preview */}
              <div className="h-32 bg-[#050506] border border-[#00f3ff33] relative flex items-center justify-center overflow-hidden">
                <div 
                  className="w-16 h-16 rounded-full border border-white/20 relative flex items-center justify-center animate-pulse"
                  style={{
                    boxShadow: `0 0 25px ${customization.auraColor}`,
                    backgroundColor: customization.suitColor
                  }}
                >
                  {/* Visor Bar */}
                  <div 
                    className="w-10 h-2 rounded shadow-lg"
                    style={{ backgroundColor: customization.visorColor, boxShadow: `0 0 10px ${customization.visorColor}` }}
                  />
                </div>
                <div className="absolute bottom-1 right-2 text-[9px] font-mono text-[#00f3ff]">
                  HOLO_NODE: READY
                </div>
              </div>

              {/* Visière Cyber */}
              <div>
                <label className="text-[10px] font-orbitron text-gray-400 mb-1 block uppercase font-mono">
                  Teinte de Visière Néon
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {NEON_PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={() => onUpdateCustomization({ visorColor: color })}
                      className={`w-6 h-6 border transition-transform ${customization.visorColor === color ? 'border-white scale-110 ring-1 ring-cyan-400' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Lame Plasma */}
              <div>
                <label className="text-[10px] font-orbitron text-gray-400 mb-1 block uppercase font-mono">
                  Énergie de Lame Plasma
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {NEON_PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={() => onUpdateCustomization({ bladeColor: color })}
                      className={`w-6 h-6 border transition-transform ${customization.bladeColor === color ? 'border-white scale-110 ring-1 ring-cyan-400' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Aura Télékinétique */}
              <div>
                <label className="text-[10px] font-orbitron text-gray-400 mb-1 block uppercase font-mono">
                  Aura Psionique
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {NEON_PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={() => onUpdateCustomization({ auraColor: color })}
                      className={`w-6 h-6 border transition-transform ${customization.auraColor === color ? 'border-white scale-110 ring-1 ring-cyan-400' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
