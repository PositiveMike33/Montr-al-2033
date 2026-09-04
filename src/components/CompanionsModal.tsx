import React, { useState } from 'react';
import { 
  Companion, 
  CompanionTacticalProtocol, 
  CompanionModId, 
  CraftingMaterialId 
} from '../types';
import { sound } from '../utils/audio';
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
  Award,
  Sliders,
  Flame,
  Activity,
  Cpu,
  Eye,
  ShieldCheck,
  Target
} from 'lucide-react';

interface CompanionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companions: Companion[];
  onToggleCompanion: (companionId: string) => void;
  onUpgradeCompanion: (companionId: string) => void;
  onUpdateTactics?: (
    companionId: string, 
    tactics: CompanionTacticalProtocol, 
    modId: CompanionModId
  ) => void;
  nanites: number;
  materials?: Record<CraftingMaterialId, number>;
}

const MODS_CATALOG: Array<{
  id: CompanionModId;
  name: string;
  desc: string;
  icon: string;
  color: string;
}> = [
  {
    id: 'nanite_booster',
    name: 'Booster Nanite Médical',
    desc: 'Diffuse un flux réparateur régénérant passivement 5% des PV max du joueur toutes les 4 secondes.',
    icon: 'Activity',
    color: '#00f3ff'
  },
  {
    id: 'overclock_relay',
    name: 'Relais Overclock Synaptique',
    desc: '+30% Vitesse d\'attaque & -25% Temps de recharge de la capacité spéciale du compagnon.',
    icon: 'Zap',
    color: '#00ff41'
  },
  {
    id: 'emp_reflector',
    name: 'Déflecteur Sismique EMP',
    desc: 'Renvoie 30% des dégâts subis sous la forme d\'une onde de choc radiale qui paralyse les ennemis.',
    icon: 'Shield',
    color: '#ff0044'
  },
  {
    id: 'vampiric_core',
    name: 'Noyau Vampirique Bioréactif',
    desc: '+15% de vol de vie partagé en temps réel avec Thirty3 sur chaque frappe infligée.',
    icon: 'Flame',
    color: '#ff00ff'
  }
];

export const CompanionsModal: React.FC<CompanionsModalProps> = ({
  isOpen,
  onClose,
  companions,
  onToggleCompanion,
  onUpgradeCompanion,
  onUpdateTactics,
  nanites,
  materials = {} as any
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>(companions[0]?.id || 'companion_sophia');

  if (!isOpen) return null;

  const activeCount = companions.filter(c => c.active).length;
  const currentComp = companions.find(c => c.id === selectedCompId) || companions[0];

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
        return <span className="px-2 py-0.5 text-[9px] font-orbitron font-bold border border-[#00f3ff] text-[#00f3ff] bg-[#00f3ff11]">DRONE SOUTIEN & SOIN</span>;
      case 'tank':
        return <span className="px-2 py-0.5 text-[9px] font-orbitron font-bold border border-[#ff0044] text-[#ff0044] bg-[#ff004411]">MELEE LOURD & TANK</span>;
      case 'offense':
        return <span className="px-2 py-0.5 text-[9px] font-orbitron font-bold border border-[#ff00ff] text-[#ff00ff] bg-[#ff00ff11]">HACKER FURTIF & DPS</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-orbitron font-bold border border-[#00ff41] text-[#00ff41] bg-[#00ff4111]">DILATATION TEMPORELLE</span>;
    }
  };

  const upgradeCost = currentComp ? currentComp.level * 150 : 150;
  const upgradeScrapCost = currentComp ? currentComp.level * 4 : 4;
  const hasScrapStock = (materials.scrap_metal || 0) >= upgradeScrapCost;
  const canUpgrade = currentComp && nanites >= upgradeCost && hasScrapStock;

  const handleProtocolChange = (protocol: CompanionTacticalProtocol) => {
    sound.playUiClick();
    if (onUpdateTactics && currentComp) {
      onUpdateTactics(
        currentComp.id, 
        protocol, 
        currentComp.installedMod || 'nanite_booster'
      );
    }
  };

  const handleModChange = (modId: CompanionModId) => {
    sound.playItemSlot();
    if (onUpdateTactics && currentComp) {
      onUpdateTactics(
        currentComp.id, 
        currentComp.tacticalProtocol || 'protective', 
        modId
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-chakra select-none text-[#c0c0c0]">
      <div className="bg-[#050506] border border-[#00f3ff44] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(0,243,255,0.15)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00ff41]" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#00f3ff33] bg-[#11111a]">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-[#00f3ff]" />
            <div>
              <h2 className="text-sm sm:text-base font-orbitron font-bold text-white tracking-wider uppercase italic">
                DROÏDES & ALLIÉS SYNAPTIQUES // ESCOUADE IA CONNECTÉE DANS DOCKER
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                Montréal 2033 // Personnages et drones tactiques connectés dans Docker (Max 2 alliés déployés)
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

        {/* Body Layout: Left list of companions, Right customization & tactics */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-cyber-radial">
          
          {/* LEFT 5 COLS: COMPANION ROSTER */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <span className="text-xs font-orbitron font-bold text-gray-300 uppercase flex items-center gap-2 px-1">
              <Bot className="w-3.5 h-3.5 text-[#00f3ff]" />
              Effectifs Disponibles
            </span>

            <div className="space-y-2.5">
              {companions.map((comp) => {
                const isSelected = comp.id === selectedCompId;
                return (
                  <div
                    key={comp.id}
                    onClick={() => {
                      sound.playUiClick();
                      setSelectedCompId(comp.id);
                    }}
                    className={`p-3.5 border transition-all cursor-pointer flex flex-col gap-2 relative bg-[#11111a] ${
                      isSelected
                        ? 'border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.25)] bg-[#181824]'
                        : 'border-[#ffffff11] opacity-80 hover:opacity-100 hover:border-[#ffffff33]'
                    }`}
                    style={{ borderLeftColor: comp.avatarColor, borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="p-2 border"
                          style={{ borderColor: comp.avatarColor, backgroundColor: `${comp.avatarColor}15`, color: comp.avatarColor }}
                        >
                          {getCompanionIcon(comp.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-orbitron font-bold text-xs sm:text-sm text-white">{comp.name}</h3>
                            <span className="text-[9px] font-mono bg-[#222] px-1 py-0.2 border border-white/20 text-[#f2994a] font-bold">
                              Niv. {comp.level}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono">{comp.title}</p>
                        </div>
                      </div>

                      {comp.active && (
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#00f3ff] text-black uppercase">
                          Déployé
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-2 border-t border-white/5">
                      <span>{comp.damage} DPS • {comp.hp} PV</span>
                      {getRoleBadge(comp.role)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT 7 COLS: DETAILED COMPANION MANAGEMENT & TACTICS */}
          {currentComp && (
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Profile Card */}
              <div className="bg-[#101018] border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold font-orbitron text-white">{currentComp.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{currentComp.title}</p>
                  </div>
                  {getRoleBadge(currentComp.role)}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 bg-[#050506] p-2.5 border border-white/10 text-center font-mono">
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase">Santé Blindée</span>
                    <span className="text-xs font-bold text-white">{currentComp.hp} / {currentComp.maxHp}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase">Puissance Attaque</span>
                    <span className="text-xs font-bold text-[#00f3ff]">{currentComp.damage} DPS</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase">Portée Radar</span>
                    <span className="text-xs font-bold text-[#f2994a]">{currentComp.attackRange}px</span>
                  </div>
                </div>

                {/* Signature Ability */}
                <div className="bg-[#181824] border border-white/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#00ff41] font-orbitron mb-1">
                    <Zap className="w-3.5 h-3.5 text-[#00ff41]" />
                    Capacité Active : {currentComp.abilityName}
                  </div>
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    {currentComp.abilityDesc}
                  </p>
                </div>

                {/* Passive Team Buff */}
                <div className="bg-[#00f3ff0a] border border-[#00f3ff22] p-2.5 text-xs font-mono text-[#00f3ff] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00f3ff] shrink-0" />
                  <span>Passif Équipe : {currentComp.passiveBonus}</span>
                </div>
              </div>

              {/* TACTICAL AI BEHAVIOR CONFIGURATION */}
              <div className="bg-[#101018] border border-white/10 p-4 space-y-3">
                <span className="text-xs font-orbitron font-bold text-gray-300 uppercase flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-[#ff0055]" />
                  Priorité de Ciblage & Conduite de Combat IA
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleProtocolChange('protective')}
                    className={`p-2.5 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      (currentComp.tacticalProtocol || 'protective') === 'protective'
                        ? 'bg-[#00f3ff15] border-[#00f3ff] text-white shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                        : 'bg-[#181824] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold font-orbitron text-xs mb-1 text-[#00f3ff]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Garde du Corps
                    </div>
                    <p className="text-[10px] text-gray-300 font-sans leading-tight">
                      Défend Thirty3, intercepte les attaquants à moins de 150px.
                    </p>
                  </button>

                  <button
                    onClick={() => handleProtocolChange('tactical_hunter')}
                    className={`p-2.5 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      currentComp.tacticalProtocol === 'tactical_hunter'
                        ? 'bg-[#ff00ff15] border-[#ff00ff] text-white shadow-[0_0_10px_rgba(255,0,255,0.2)]'
                        : 'bg-[#181824] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold font-orbitron text-xs mb-1 text-[#ff00ff]">
                      <Target className="w-3.5 h-3.5" />
                      Chasseur d'Élites
                    </div>
                    <p className="text-[10px] text-gray-300 font-sans leading-tight">
                      Verrouille en priorité absolue les Champions, Élites et Boss.
                    </p>
                  </button>

                  <button
                    onClick={() => handleProtocolChange('aggressive')}
                    className={`p-2.5 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      currentComp.tacticalProtocol === 'aggressive'
                        ? 'bg-[#f2994a15] border-[#f2994a] text-white shadow-[0_0_10px_rgba(242,153,74,0.2)]'
                        : 'bg-[#181824] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold font-orbitron text-xs mb-1 text-[#f2994a]">
                      <Flame className="w-3.5 h-3.5" />
                      Assaut Total
                    </div>
                    <p className="text-[10px] text-gray-300 font-sans leading-tight">
                      Charge l'ennemi le plus proche et engage le combat sans retenue.
                    </p>
                  </button>
                </div>
              </div>

              {/* SUB-CORE MODULE INSTALLATION */}
              <div className="bg-[#101018] border border-white/10 p-4 space-y-3">
                <span className="text-xs font-orbitron font-bold text-gray-300 uppercase flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-[#00ff41]" />
                  Sous-Module Tactique Équipé
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {MODS_CATALOG.map((mod) => {
                    const isEquipped = (currentComp.installedMod || 'nanite_booster') === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => handleModChange(mod.id)}
                        className={`p-2.5 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-white/10 border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.15)]'
                            : 'bg-[#181824] border-white/10 text-gray-400 hover:text-white'
                        }`}
                        style={{ borderLeftColor: mod.color, borderLeftWidth: '3px' }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold font-orbitron text-white">{mod.name}</span>
                          {isEquipped && <Check className="w-3.5 h-3.5 text-green-400" />}
                        </div>
                        <p className="text-[10px] text-gray-300 font-sans leading-tight">
                          {mod.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTION BUTTONS (DEPLOY & UPGRADE) */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => onToggleCompanion(currentComp.id)}
                  className={`w-full sm:flex-1 py-3 font-orbitron font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                    currentComp.active 
                      ? 'bg-[#00f3ff] text-black shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:bg-[#00f3ff]/80 cursor-pointer' 
                      : activeCount >= 2 
                        ? 'bg-[#222] text-gray-500 border border-white/10 cursor-not-allowed'
                        : 'bg-[#222] hover:bg-[#00f3ff22] border border-[#00f3ff] text-[#00f3ff] cursor-pointer'
                  }`}
                >
                  {currentComp.active ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>DÉPLOYÉ AUX CÔTÉS DU JOUEUR (ACTIF)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{activeCount >= 2 ? 'ESCOUADE PLEINE (2/2 ACTIFS)' : 'DÉPLOYER CE COMPAGNON'}</span>
                    </>
                  )}
                </button>

                <button
                  disabled={!canUpgrade}
                  onClick={() => onUpgradeCompanion(currentComp.id)}
                  className={`w-full sm:w-auto px-5 py-3 border font-orbitron font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 ${
                    canUpgrade 
                      ? 'bg-gradient-to-r from-[#f2994a] to-[#ff0055] hover:opacity-90 text-white shadow-[0_0_15px_rgba(242,153,74,0.4)] cursor-pointer' 
                      : 'bg-[#222] border-white/10 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>SURCADENCER (NIV.+ : {upgradeCost}N + {upgradeScrapCost} Ferraille)</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
