import React, { useState } from 'react';
import { Achievement, AchievementCategory } from '../types';
import { 
  X, 
  Trophy, 
  Award, 
  Sparkles, 
  Shield, 
  Crosshair, 
  Cpu, 
  Layers, 
  Activity, 
  CheckCircle2, 
  Lock, 
  Zap,
  Flame,
  Star
} from 'lucide-react';
import { sound } from '../utils/audio';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  activeBadgeId?: string;
  onEquipBadge: (badgeId: string) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  activeBadgeId,
  onEquipBadge
}) => {
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'badges_showcase'>('cards');

  if (!isOpen) return null;

  const totalAchievements = achievements.length;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const completionPercent = Math.round((unlockedCount / totalAchievements) * 100);

  const filteredAchievements = achievements.filter((ach) => {
    if (activeCategory === 'all') return true;
    return ach.category === activeCategory;
  });

  const activeBadge = achievements.find((a) => a.id === activeBadgeId);

  const handleSelectBadge = (ach: Achievement) => {
    if (!ach.unlocked) return;
    sound.playPowerUp();
    onEquipBadge(ach.id);
  };

  const getCategoryIcon = (cat: AchievementCategory) => {
    switch (cat) {
      case 'combat':
        return <Crosshair className="w-3.5 h-3.5 text-[#ff0044]" />;
      case 'loot':
        return <Layers className="w-3.5 h-3.5 text-[#f59e0b]" />;
      case 'skills':
        return <Cpu className="w-3.5 h-3.5 text-[#9d00ff]" />;
      case 'progression':
        return <Activity className="w-3.5 h-3.5 text-[#00f3ff]" />;
      case 'mastery':
        return <Award className="w-3.5 h-3.5 text-[#00ff41]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-chakra select-none text-[#c0c0c0]">
      <div className="bg-[#050508] border border-[#f59e0b44] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(245,158,11,0.15)] overflow-hidden relative">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f59e0b] via-[#ff00ff] to-[#00f3ff]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f59e0b33] bg-[#11111a]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f59e0b22] border border-[#f59e0b] text-[#f59e0b]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-orbitron font-bold text-white tracking-wider uppercase italic flex items-center gap-2">
                SYSTÈME DE SUCCÈS // JALONS ET TITRES DE PRESTIGE
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                Montréal 2033 // {unlockedCount} / {totalAchievements} Débloqués ({completionPercent}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex bg-[#050508] border border-[#ffffff22] p-0.5">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 text-xs font-orbitron font-bold transition-all ${
                  viewMode === 'cards' 
                    ? 'bg-[#f59e0b] text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                LISTE DES SUCCÈS
              </button>
              <button
                onClick={() => setViewMode('badges_showcase')}
                className={`px-3 py-1 text-xs font-orbitron font-bold transition-all ${
                  viewMode === 'badges_showcase' 
                    ? 'bg-[#ff00ff] text-black shadow-[0_0_10px_rgba(255,0,255,0.4)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                GALERIE DES BADGES ({unlockedCount})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Progress Bar & Active Badge Header */}
        <div className="px-5 py-2.5 bg-[#0a0a10] border-b border-[#ffffff11] flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between items-center text-[10px] font-mono mb-1">
              <span className="text-gray-300">PROGRESSION GLOBALE DES EXPLOITS</span>
              <span className="text-[#f59e0b] font-bold">{completionPercent}% ACCOMPLIS</span>
            </div>
            <div className="w-full h-2 bg-[#181824] border border-[#ffffff11] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#f59e0b] via-[#ff00ff] to-[#00f3ff] transition-all duration-300 shadow-[0_0_10px_#f59e0b]"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          {/* Active Badge on Profile Showcase */}
          <div className="flex items-center gap-2 bg-[#11111a] border border-[#ffffff1a] px-3 py-1.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Badge Actif :</span>
            {activeBadge ? (
              <div 
                className="flex items-center gap-1.5 px-2 py-0.5 border text-xs font-mono font-bold"
                style={{
                  borderColor: activeBadge.badgeColor,
                  color: activeBadge.badgeColor,
                  backgroundColor: `${activeBadge.badgeColor}15`,
                  boxShadow: `0 0 10px ${activeBadge.badgeColor}33`
                }}
              >
                <span>{activeBadge.badgeIcon}</span>
                <span>{activeBadge.badgeTitle}</span>
              </div>
            ) : (
              <span className="text-xs font-mono text-gray-500 italic">Aucun badge équipé</span>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        {viewMode === 'cards' && (
          <div className="flex flex-wrap gap-1.5 px-5 py-2.5 bg-[#050508] border-b border-[#ffffff0a] text-xs font-orbitron">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 text-xs border transition-all ${
                activeCategory === 'all'
                  ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b] font-bold'
                  : 'bg-[#11111a] border-[#ffffff11] text-gray-400 hover:text-white'
              }`}
            >
              TOUS ({achievements.length})
            </button>
            <button
              onClick={() => setActiveCategory('combat')}
              className={`px-3 py-1 text-xs border flex items-center gap-1.5 transition-all ${
                activeCategory === 'combat'
                  ? 'bg-[#ff0044]/20 border-[#ff0044] text-[#ff0044] font-bold'
                  : 'bg-[#11111a] border-[#ffffff11] text-gray-400 hover:text-white'
              }`}
            >
              <Crosshair className="w-3 h-3" />
              COMBAT & KILLS
            </button>
            <button
              onClick={() => setActiveCategory('loot')}
              className={`px-3 py-1 text-xs border flex items-center gap-1.5 transition-all ${
                activeCategory === 'loot'
                  ? 'bg-[#f59e0b]/20 border-[#f59e0b] text-[#f59e0b] font-bold'
                  : 'bg-[#11111a] border-[#ffffff11] text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              BUTIN & ÉQUIPEMENTS
            </button>
            <button
              onClick={() => setActiveCategory('skills')}
              className={`px-3 py-1 text-xs border flex items-center gap-1.5 transition-all ${
                activeCategory === 'skills'
                  ? 'bg-[#9d00ff]/20 border-[#9d00ff] text-[#9d00ff] font-bold'
                  : 'bg-[#11111a] border-[#ffffff11] text-gray-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3 h-3" />
              TALENTS & MATRICE
            </button>
            <button
              onClick={() => setActiveCategory('progression')}
              className={`px-3 py-1 text-xs border flex items-center gap-1.5 transition-all ${
                activeCategory === 'progression'
                  ? 'bg-[#00f3ff]/20 border-[#00f3ff] text-[#00f3ff] font-bold'
                  : 'bg-[#11111a] border-[#ffffff11] text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3" />
              PROGRESSION & TIERS
            </button>
            <button
              onClick={() => setActiveCategory('mastery')}
              className={`px-3 py-1 text-xs border flex items-center gap-1.5 transition-all ${
                activeCategory === 'mastery'
                  ? 'bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41] font-bold'
                  : 'bg-[#11111a] border-[#ffffff11] text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-3 h-3" />
              MAÎTRISE & BASTIONS
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-cyber-radial">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAchievements.map((ach) => {
                const isEquipped = activeBadgeId === ach.id;
                const progressPct = Math.min(100, Math.round((ach.currentValue / ach.targetValue) * 100));

                return (
                  <div
                    key={ach.id}
                    className={`p-4 border transition-all flex flex-col justify-between relative overflow-hidden ${
                      ach.unlocked
                        ? 'bg-[#11111a] border-[#f59e0b44] hover:border-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.06)]'
                        : 'bg-[#08080c] border-[#ffffff0f] opacity-80'
                    }`}
                  >
                    {/* Glowing Left Indicator */}
                    <div 
                      className="absolute top-0 left-0 w-1 h-full"
                      style={{ backgroundColor: ach.unlocked ? ach.badgeColor : '#333' }}
                    />

                    <div>
                      {/* Card Top Line */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          {/* Badge Icon */}
                          <div 
                            className={`w-9 h-9 flex items-center justify-center text-lg border rounded-xs ${
                              ach.unlocked 
                                ? 'bg-black/60 shadow-[0_0_10px_rgba(0,0,0,0.6)]' 
                                : 'bg-[#181820] text-gray-600 border-[#ffffff11]'
                            }`}
                            style={ach.unlocked ? { borderColor: ach.badgeColor } : {}}
                          >
                            {ach.unlocked ? ach.badgeIcon : <Lock className="w-4 h-4 text-gray-500" />}
                          </div>

                          <div>
                            <span className="text-[9px] font-orbitron font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                              {getCategoryIcon(ach.category)}
                              {ach.category}
                            </span>
                            <h3 className={`text-xs sm:text-sm font-orbitron font-bold ${ach.unlocked ? 'text-white' : 'text-gray-400'}`}>
                              {ach.title}
                            </h3>
                          </div>
                        </div>

                        {/* Status Chip */}
                        {ach.unlocked ? (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-[#00ff41] bg-[#00ff4115] border border-[#00ff4144] px-2 py-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>COMPLÉTÉ</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400 bg-black/40 border border-[#ffffff11] px-2 py-0.5">
                            <Lock className="w-3 h-3 text-gray-500" />
                            <span>{ach.currentValue} / {ach.targetValue}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-gray-300 font-sans leading-relaxed mb-3">
                        {ach.description}
                      </p>

                      {/* Progress Bar (if not unlocked) */}
                      {!ach.unlocked && (
                        <div className="mb-3">
                          <div className="flex justify-between text-[9px] font-mono text-gray-400 mb-1">
                            <span>Progression du jalon</span>
                            <span>{progressPct}% ({ach.currentValue} / {ach.targetValue})</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#181822] overflow-hidden">
                            <div 
                              className="h-full bg-[#00f3ff]"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Passive Stat Bonus granted */}
                      {ach.statBonus && (
                        <div className="mb-3 p-2 bg-[#050508] border border-[#ffffff0a] flex items-center justify-between text-[10px] font-mono">
                          <span className="text-gray-400">Bonus Passif Permanent :</span>
                          <span className="text-[#00ff41] font-bold">{ach.statBonus.description}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Badge Title & Equip Button */}
                    <div className="pt-2 border-t border-[#ffffff0a] flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[10px] font-mono font-bold px-2 py-0.5 border"
                          style={{
                            borderColor: ach.unlocked ? ach.badgeColor : '#333',
                            color: ach.unlocked ? ach.badgeColor : '#666',
                            backgroundColor: ach.unlocked ? `${ach.badgeColor}15` : 'transparent'
                          }}
                        >
                          Badge : {ach.badgeTitle}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          +{ach.rewardNanites} ⬡ / +{ach.rewardExp} EXP
                        </span>
                      </div>

                      {ach.unlocked && (
                        <button
                          onClick={() => handleSelectBadge(ach)}
                          className={`px-3 py-1 text-xs font-orbitron font-bold transition-all ${
                            isEquipped
                              ? 'bg-[#00ff41] text-black shadow-[0_0_10px_#00ff41]'
                              : 'bg-[#1a1a24] hover:bg-[#f59e0b] text-gray-200 hover:text-black border border-[#ffffff22] hover:border-[#f59e0b]'
                          }`}
                        >
                          {isEquipped ? '✓ BADGE ACTIF' : 'ÉQUIPER SUR LE PROFIL'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW 2: BADGES SHOWCASE GALLERY */
            <div className="flex flex-col gap-5">
              <div className="bg-[#11111a] border border-[#ff00ff33] p-4 text-center">
                <h3 className="text-sm font-orbitron font-bold text-[#ff00ff] uppercase tracking-wider mb-1">
                  GALERIE DES TITRES & INSIGNES HÉROÏQUES DE MONTRÉAL 2033
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  Sélectionnez n'importe quel badge déverrouillé pour l'afficher fièrement sur votre profil et dans l'interface de combat.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {achievements.map((ach) => {
                  const isEquipped = activeBadgeId === ach.id;

                  return (
                    <button
                      key={ach.id}
                      disabled={!ach.unlocked}
                      onClick={() => handleSelectBadge(ach)}
                      className={`p-4 border text-center flex flex-col items-center gap-2 transition-all relative ${
                        ach.unlocked
                          ? isEquipped
                            ? 'bg-[#181824] border-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.25)] scale-[1.02]'
                            : 'bg-[#11111a] border-[#ffffff18] hover:border-[#f59e0b] hover:bg-[#181822] cursor-pointer'
                          : 'bg-[#060608] border-[#ffffff0a] opacity-40 cursor-not-allowed'
                      }`}
                    >
                      {/* Top Equip Star */}
                      {isEquipped && (
                        <div className="absolute top-2 right-2 text-[#00ff41]">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}

                      {/* Icon */}
                      <div 
                        className="w-14 h-14 rounded-xs flex items-center justify-center text-2xl border"
                        style={{
                          borderColor: ach.unlocked ? ach.badgeColor : '#333',
                          backgroundColor: ach.unlocked ? `${ach.badgeColor}22` : '#111',
                          boxShadow: ach.unlocked ? `0 0 15px ${ach.badgeColor}44` : 'none'
                        }}
                      >
                        {ach.unlocked ? ach.badgeIcon : <Lock className="w-5 h-5 text-gray-500" />}
                      </div>

                      {/* Title */}
                      <div>
                        <div 
                          className="font-orbitron font-bold text-xs"
                          style={{ color: ach.unlocked ? ach.badgeColor : '#666' }}
                        >
                          {ach.badgeTitle}
                        </div>
                        <div className="text-[9px] font-mono text-gray-400 mt-0.5 line-clamp-1">
                          {ach.title}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="text-[9px] font-mono mt-1">
                        {ach.unlocked ? (
                          isEquipped ? (
                            <span className="text-[#00ff41] font-bold">ÉQUIPÉ</span>
                          ) : (
                            <span className="text-[#f59e0b]">CLIQUEZ POUR ÉQUIPER</span>
                          )
                        ) : (
                          <span className="text-gray-600">VERROUILLÉ</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
