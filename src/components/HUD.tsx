import React, { useState } from 'react';
import { PlayerStats, SkillCooldowns, StageInfo, PlayerAttributes, EquipmentItem, ItemSlot, AvatarCustomization, Achievement, PotionSystem } from '../types';
import { 
  Shield, 
  Zap, 
  Activity, 
  Terminal, 
  Disc, 
  Radio, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Layers, 
  User, 
  Briefcase, 
  GitBranch, 
  Crosshair,
  Skull,
  ChevronLeft,
  ChevronRight,
  Eye,
  Bot,
  Trophy,
  Flame,
  BookOpen,
  Cpu
} from 'lucide-react';

interface HUDProps {
  level: number;
  currentExp: number;
  expToNext: number;
  stats: PlayerStats;
  cooldowns: SkillCooldowns;
  maxCooldowns: { [key: string]: number };
  currentStage: StageInfo;
  difficultyTier: number;
  nanites: number;
  killCount: number;
  requiredKillsForBoss: number;
  bossHp: number | null;
  bossMaxHp: number | null;
  bossName: string | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenInventory: () => void;
  onOpenCharacter: () => void;
  onOpenSkills: () => void;
  onOpenStages: () => void;
  onOpenForge?: () => void;
  onOpenArchitect?: () => void;
  onOpenTacticalDeck?: () => void;
  onOpenCodex?: () => void;
  unlockedCodexCount?: number;
  totalCodexCount?: number;
  onOpenCompanions?: () => void;
  onOpenAchievements?: () => void;
  achievements?: Achievement[];
  bulletTimeActive: boolean;
  potionSystem?: PotionSystem;
  attributes?: PlayerAttributes;
  equipped?: { [key in ItemSlot]?: EquipmentItem };
  customization?: AvatarCustomization;
  activeCompanionCount?: number;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  currentExp,
  expToNext,
  stats,
  cooldowns,
  maxCooldowns,
  currentStage,
  difficultyTier,
  nanites,
  killCount,
  requiredKillsForBoss,
  bossHp,
  bossMaxHp,
  bossName,
  isMuted,
  onToggleMute,
  onOpenInventory,
  onOpenCharacter,
  onOpenSkills,
  onOpenStages,
  onOpenForge,
  onOpenArchitect,
  onOpenTacticalDeck,
  onOpenCodex,
  unlockedCodexCount = 4,
  totalCodexCount = 10,
  onOpenCompanions,
  onOpenAchievements,
  achievements = [],
  bulletTimeActive,
  potionSystem,
  attributes = { synapticPower: 10, cyberOverclock: 10, bioArmor: 10, neuralReflex: 10 },
  equipped = {} as { [key in ItemSlot]?: EquipmentItem },
  customization,
  activeCompanionCount = 2
}) => {
  const [showSidebars, setShowSidebars] = useState<boolean>(true);

  const hpPercent = Math.max(0, Math.min(100, (stats.currentHp / stats.maxHp) * 100));
  const psiPercent = Math.max(0, Math.min(100, (stats.currentPsi / stats.maxPsi) * 100));
  const expPercent = Math.max(0, Math.min(100, (currentExp / expToNext) * 100));

  const weaponItem = (equipped as { [key in ItemSlot]?: EquipmentItem })?.weapon;
  const armorItem = (equipped as { [key in ItemSlot]?: EquipmentItem })?.armor;
  const chipItem = (equipped as { [key in ItemSlot]?: EquipmentItem })?.chip;

  const activeBadge = achievements.find((a) => a.id === customization?.activeBadgeId);
  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-4 select-none font-sans overflow-hidden text-[#c0c0c0]">
      {/* Background Cyber Grid lines for subtle ambiance */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Top Header: Immersive UI Header */}
      <header className="pointer-events-auto flex flex-wrap justify-between items-center mb-2 border-b border-[#00f3ff33] pb-2 z-20 w-full bg-[#050506]/85 backdrop-blur-md px-3 py-2">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-[#00f3ff22] border border-[#00f3ff] px-2.5 sm:px-3 py-1 text-xs tracking-widest text-[#00f3ff] font-bold font-orbitron">
            LVL {level}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-lg font-bold tracking-tighter text-white uppercase italic font-orbitron flex items-center gap-2">
                NEURAL REBEL: <span className="text-[#00f3ff]">{customization?.realName || currentStage.name.split(' ')[0]}</span>
              </h1>

              {/* Active Badge Tag on HUD */}
              {activeBadge && (
                <div 
                  onClick={onOpenAchievements}
                  className="cursor-pointer flex items-center gap-1 px-2 py-0.5 border text-[10px] sm:text-xs font-mono font-bold transition-all hover:scale-105"
                  style={{
                    borderColor: activeBadge.badgeColor,
                    color: activeBadge.badgeColor,
                    backgroundColor: `${activeBadge.badgeColor}18`,
                    boxShadow: `0 0 10px ${activeBadge.badgeColor}44`
                  }}
                  title={`Badge Équipé : ${activeBadge.badgeTitle} (${activeBadge.title})`}
                >
                  <span>{activeBadge.badgeIcon}</span>
                  <span>{activeBadge.badgeTitle}</span>
                </div>
              )}
            </div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] opacity-60 text-gray-300 font-mono">
              Montréal 2033 // Sector 0{currentStage.id}: {currentStage.name}
            </p>
          </div>
        </div>

        {/* Middle Quick Actions & Nanites */}
        <div className="flex items-center gap-2 my-1 sm:my-0">
          <button
            onClick={onOpenStages}
            className="px-2.5 py-1 text-[11px] bg-[#11111a] hover:bg-[#00f3ff22] text-[#00f3ff] border border-[#00f3ff44] hover:border-[#00f3ff] transition-all flex items-center gap-1 font-orbitron font-bold cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SECTEURS [M]</span>
            <span className="sm:hidden">STAGES</span>
          </button>
          <button
            onClick={onOpenCharacter}
            className="px-2.5 py-1 text-[11px] bg-[#11111a] hover:bg-[#00f3ff22] text-gray-200 hover:text-[#00f3ff] border border-[#ffffff22] hover:border-[#00f3ff44] transition-all flex items-center gap-1 font-orbitron font-bold cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#00f3ff]" />
            <span className="hidden sm:inline">PROFIL [C]</span>
          </button>
          <button
            onClick={onOpenInventory}
            className="px-2.5 py-1 text-[11px] bg-[#11111a] hover:bg-[#f2994a22] text-gray-200 hover:text-[#f2994a] border border-[#ffffff22] hover:border-[#f2994a44] transition-all flex items-center gap-1 font-orbitron font-bold cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 text-[#f2994a]" />
            <span className="hidden sm:inline">INVENTAIRE [I]</span>
          </button>
          {onOpenForge && (
            <button
              onClick={onOpenForge}
              className="px-2.5 py-1 text-[11px] bg-[#11111a] hover:bg-[#ff005522] text-gray-200 hover:text-[#ff0055] border border-[#ff005544] hover:border-[#ff0055] transition-all flex items-center gap-1 font-orbitron font-bold cursor-pointer shadow-[0_0_8px_rgba(255,0,85,0.2)]"
            >
              <Flame className="w-3.5 h-3.5 text-[#ff0055] animate-pulse" />
              <span className="hidden sm:inline">FORGE [G]</span>
              <span className="sm:hidden">FORGE</span>
            </button>
          )}
          {onOpenArchitect && (
            <button
              onClick={onOpenArchitect}
              className="px-2.5 py-1 text-[11px] bg-[#11111a] hover:bg-[#a855f722] text-gray-200 hover:text-[#c084fc] border border-[#a855f744] hover:border-[#a855f7] transition-all flex items-center gap-1 font-orbitron font-bold cursor-pointer shadow-[0_0_8px_rgba(168,85,247,0.2)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c084fc] animate-pulse" />
              <span className="hidden sm:inline">OCCULTISTE [O]</span>
              <span className="sm:hidden">ARCHITECTE</span>
            </button>
          )}
          {onOpenTacticalDeck && (
            <button
              onClick={onOpenTacticalDeck}
              className="px-2.5 py-1 text-[11px] bg-[#00f3ff22] hover:bg-[#00f3ff44] text-[#00f3ff] border border-[#00f3ff] transition-all flex items-center gap-1.5 font-orbitron font-bold cursor-pointer shadow-[0_0_12px_rgba(0,243,255,0.4)]"
            >
              <Cpu className="w-3.5 h-3.5 text-[#00f3ff] animate-spin" />
              <span className="hidden sm:inline">CYBER-DECK [T]</span>
              <span className="sm:hidden">DOCKER</span>
            </button>
          )}
          <button
            onClick={onOpenSkills}
            className="px-2.5 py-1 text-[11px] bg-[#11111a] hover:bg-[#ff00ff22] text-gray-200 hover:text-[#ff00ff] border border-[#ffffff22] hover:border-[#ff00ff44] transition-all flex items-center gap-1 font-orbitron font-bold cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5 text-[#ff00ff]" />
            <span className="hidden sm:inline">TALENTS [K]</span>
          </button>
          {onOpenCodex && (
            <button
              onClick={onOpenCodex}
              className="px-2.5 py-1 text-[11px] bg-[#11111a] hover:bg-[#00f3ff22] text-gray-200 hover:text-[#00f3ff] border border-[#00f3ff44] hover:border-[#00f3ff] transition-all flex items-center gap-1 font-orbitron font-bold cursor-pointer shadow-[0_0_8px_rgba(0,243,255,0.2)]"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#00f3ff]" />
              <span className="hidden sm:inline">CODEX ({unlockedCodexCount}/{totalCodexCount}) [X]</span>
              <span className="sm:hidden">CODEX</span>
            </button>
          )}
          {onOpenAchievements && (
            <button
              onClick={onOpenAchievements}
              className="px-2.5 py-1 text-[11px] bg-[#11111a] hover:bg-[#f59e0b22] text-gray-200 hover:text-[#f59e0b] border border-[#f59e0b44] hover:border-[#f59e0b] transition-all flex items-center gap-1 font-orbitron font-bold cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span className="hidden sm:inline">SUCCÈS ({unlockedAchievementsCount}/{achievements.length}) [U]</span>
              <span className="sm:hidden">SUCCÈS</span>
            </button>
          )}
          {onOpenCompanions && (
            <button
              onClick={onOpenCompanions}
              className="px-2.5 py-1 text-[11px] bg-[#11111a] hover:bg-[#00ff4122] text-gray-200 hover:text-[#00ff41] border border-[#00ff4144] hover:border-[#00ff41] transition-all flex items-center gap-1 font-orbitron font-bold cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-[#00ff41]" />
              <span className="hidden sm:inline">ALLIÉS ({activeCompanionCount}/2) [P]</span>
              <span className="sm:hidden">ALLIÉS</span>
            </button>
          )}
          <button
            onClick={onToggleMute}
            className="p-1.5 bg-[#11111a] hover:bg-[#222] border border-[#ffffff22] text-gray-300 transition-all flex items-center justify-center cursor-pointer"
            title={isMuted ? 'Activer Audio' : 'Couper Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#ff0044]" /> : <Volume2 className="w-3.5 h-3.5 text-[#00f3ff]" />}
          </button>
          <button
            onClick={() => setShowSidebars(prev => !prev)}
            className="hidden lg:flex p-1.5 bg-[#11111a] hover:bg-[#222] border border-[#ffffff22] text-gray-300 transition-all items-center justify-center text-[10px] font-mono cursor-pointer"
            title="Toggle Tactical Telemetry"
          >
            <Eye className="w-3.5 h-3.5 text-[#00ff41]" />
          </button>
        </div>

        {/* Right Overclock Tier & Exp */}
        <div className="text-right">
          <div className="text-[#ff00ff] font-bold text-xs sm:text-sm tracking-widest uppercase font-orbitron">
            Tier 0{difficultyTier}: Overclock Matrix
          </div>
          <div className="w-36 sm:w-48 h-1.5 bg-[#222] mt-1 relative overflow-hidden border border-[#ffffff11]">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00f3ff] to-[#ff00ff] transition-all duration-150"
              style={{ width: `${expPercent}%` }}
            />
          </div>
          <div className="text-[9px] mt-0.5 opacity-60 uppercase font-mono text-gray-300">
            EXP: {currentExp.toLocaleString()} / {expToNext.toLocaleString()} ({expPercent.toFixed(0)}%)
          </div>
        </div>
      </header>

      {/* Main Center Area with Tactical Sidebars & In-Game View HUD Elements */}
      <div className="flex-1 flex gap-4 overflow-hidden relative z-10">
        
        {/* Left Aside: Synaptic Rig Tactical Panel (Desktop) */}
        {showSidebars && (
          <aside className="hidden xl:flex w-60 flex-col gap-3 pointer-events-auto shrink-0 animate-in fade-in slide-in-from-left-4 duration-200">
            <div className="bg-[#11111a]/90 backdrop-blur-md border border-[#00f3ff44] p-3 flex flex-col gap-2.5 relative shadow-[0_0_20px_rgba(0,243,255,0.08)]">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#00f3ff]" />
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#00f3ff] font-orbitron">
                  Synaptic Rig
                </h2>
                <span className="text-[9px] font-mono text-gray-400">STATUS: OVERLOCKED</span>
              </div>
              
              <div className="space-y-2.5 text-xs">
                {/* Synaptic Power */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] uppercase text-gray-300 font-mono">Synaptic Power</span>
                    <span className="text-white font-mono font-bold">{attributes.synapticPower}</span>
                  </div>
                  <div className="w-full h-1 bg-[#222]">
                    <div 
                      className="h-full bg-[#00f3ff] shadow-[0_0_8px_#00f3ff]" 
                      style={{ width: `${Math.min(100, attributes.synapticPower * 3)}%` }} 
                    />
                  </div>
                </div>

                {/* Cyber Overclock */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] uppercase text-gray-300 font-mono">Cyber Overclock</span>
                    <span className="text-white font-mono font-bold">{attributes.cyberOverclock}</span>
                  </div>
                  <div className="w-full h-1 bg-[#222]">
                    <div 
                      className="h-full bg-[#ff00ff] shadow-[0_0_8px_#ff00ff]" 
                      style={{ width: `${Math.min(100, attributes.cyberOverclock * 3)}%` }} 
                    />
                  </div>
                </div>

                {/* Bio-Armor */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] uppercase text-gray-300 font-mono">Bio-Armor</span>
                    <span className="text-white font-mono font-bold">{attributes.bioArmor}</span>
                  </div>
                  <div className="w-full h-1 bg-[#222]">
                    <div 
                      className="h-full bg-[#00ff41] shadow-[0_0_8px_#00ff41]" 
                      style={{ width: `${Math.min(100, attributes.bioArmor * 3)}%` }} 
                    />
                  </div>
                </div>

                {/* Neural Reflex */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] uppercase text-gray-300 font-mono">Neural Reflex</span>
                    <span className="text-white font-mono font-bold">{attributes.neuralReflex}</span>
                  </div>
                  <div className="w-full h-1 bg-[#222]">
                    <div 
                      className="h-full bg-[#f2994a] shadow-[0_0_8px_#f2994a]" 
                      style={{ width: `${Math.min(100, attributes.neuralReflex * 3)}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Neural Deck Active Passives */}
            <div className="bg-[#11111a]/90 backdrop-blur-md border border-[#ffffff11] p-3 flex flex-col gap-2">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-white mb-1 font-orbitron">
                Neural Rig Chips
              </h2>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="aspect-square bg-[#222] border border-[#f2994a] relative flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#f2994a44] rounded-full blur-sm" />
                  <div className="text-[8px] absolute bottom-0.5 right-1 opacity-60 italic font-mono text-[#f2994a]">T1</div>
                </div>
                <div className="aspect-square bg-[#222] border border-[#9b51e0] flex items-center justify-center">
                  <div className="w-3.5 h-3.5 bg-[#9b51e044] rotate-45 border border-[#9b51e0]" />
                </div>
                <div className="aspect-square bg-[#222] border border-[#00f3ff] flex items-center justify-center">
                  <div className="w-3 h-3 bg-[#00f3ff44] border border-[#00f3ff]" />
                </div>
                <div className="aspect-square bg-[#222] border border-[#ffffff22] flex items-center justify-center text-[9px] text-gray-600">+</div>
                <div className="aspect-square bg-[#222] border border-[#ffffff22] flex items-center justify-center text-[9px] text-gray-600">+</div>
                <div className="aspect-square bg-[#222] border border-[#ffffff22] flex items-center justify-center text-[9px] text-gray-600">+</div>
              </div>
              <div className="mt-1 p-2 bg-[#ff00ff11] border border-[#ff00ff44] text-[9px] italic text-gray-300">
                <span className="text-[#ff00ff] font-bold font-mono">DPS BURST:</span> {stats.physicalDamage + stats.psiDamage} PTS // CRIT: {stats.critChance}%
              </div>
            </div>
          </aside>
        )}

        {/* Center Canvas Overlay Indicators (Boss Bar, Bullet Time, Watermarks) */}
        <div className="flex-1 flex flex-col justify-between items-center pointer-events-none relative">
          
          {/* Top Canvas Watermarks */}
          <div className="w-full flex justify-between items-start text-[10px] font-mono px-2 pt-1 opacity-80">
            <span className="text-[#00f3ff] bg-[#050506]/70 px-2 py-0.5 border border-[#00f3ff22]">
              SIM_ACTIVE_60FPS // NODE_{currentStage.id}
            </span>
            <span className="text-[#ff00ff] bg-[#050506]/70 px-2 py-0.5 border border-[#ff00ff22]">
              MTL_RÉSO_NODE_B4 // ASSAULT
            </span>
          </div>

          {/* Boss Bar (if active) */}
          {bossHp !== null && bossMaxHp !== null && bossName && (
            <div className="w-full max-w-lg bg-[#050506]/95 border-2 border-[#ff0044] p-3 shadow-[0_0_30px_rgba(255,0,68,0.4)] animate-pulse my-auto">
              <div className="flex items-center justify-between text-xs font-orbitron mb-1.5">
                <span className="text-[#ff0044] font-bold tracking-wider flex items-center gap-1.5">
                  <Skull className="w-4 h-4 text-[#ff0044]" />
                  {bossName.toUpperCase()}
                </span>
                <span className="text-white font-mono text-xs">
                  {Math.max(0, Math.round(bossHp))} / {Math.round(bossMaxHp)} PV
                </span>
              </div>
              <div className="w-full h-3 bg-[#111] overflow-hidden border border-[#ff0044]/60">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-100 shadow-[0_0_12px_#ff0044]"
                  style={{ width: `${Math.max(0, (bossHp / bossMaxHp) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Bullet Time Indicator */}
          {bulletTimeActive && (
            <div className="bg-[#050506]/95 border-2 border-[#00f3ff] px-6 py-2 text-[#00f3ff] font-orbitron text-xs sm:text-sm font-bold tracking-widest shadow-[0_0_30px_#00f3ff] animate-pulse">
              ⚡ DISTORSION TEMPORELLE // MATRIX OVERDRIVE ⚡
            </div>
          )}

          <div />
        </div>

        {/* Right Aside: Active Manifest & Objective (Desktop) */}
        {showSidebars && (
          <aside className="hidden xl:flex w-60 bg-[#11111a]/90 backdrop-blur-md border border-[#ffffff11] p-3 flex-col gap-3 shrink-0 pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex justify-between items-center border-b border-[#ffffff11] pb-2">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-white font-orbitron">
                Active Manifest
              </h2>
              <span className="text-[9px] font-mono text-[#00ff41]">{nanites} NANITES</span>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {/* Manifest Item 1 */}
              <div className="p-2 bg-[#222] border-l-2 border-[#f2994a]">
                <div className="text-[9px] text-[#f2994a] uppercase font-bold font-mono">
                  {weaponItem ? weaponItem.rarity.toUpperCase() : 'LEGENDARY WEAPON'}
                </div>
                <div className="text-xs text-white font-bold leading-tight font-orbitron truncate">
                  {weaponItem ? weaponItem.name : 'LAME PLASMA QUANTIQUE'}
                </div>
                <div className="text-[8px] text-gray-400 mt-1 font-mono">
                  +DPS: {stats.physicalDamage} PTS // SPEED: {stats.moveSpeed.toFixed(1)}
                </div>
              </div>

              {/* Manifest Item 2 */}
              <div className="p-2 bg-[#222] border-l-2 border-[#9b51e0]">
                <div className="text-[9px] text-[#9b51e0] uppercase font-bold font-mono">
                  {armorItem ? armorItem.rarity.toUpperCase() : 'EPIC ARMOR'}
                </div>
                <div className="text-xs text-white font-bold leading-tight font-orbitron truncate">
                  {armorItem ? armorItem.name : 'VESTE TACTIQUE EXO'}
                </div>
                <div className="text-[8px] text-gray-400 mt-1 font-mono">
                  +{stats.armor} BIO-ARMOR // -{stats.cooldownReduction}% CD
                </div>
              </div>

              {/* Manifest Item 3 */}
              <div className="p-2 bg-[#222] border-l-2 border-[#00f3ff] opacity-80">
                <div className="text-[9px] text-[#00f3ff] uppercase font-bold font-mono">
                  {chipItem ? chipItem.rarity.toUpperCase() : 'RARE CHIP'}
                </div>
                <div className="text-xs text-white font-bold leading-tight font-orbitron truncate">
                  {chipItem ? chipItem.name : 'PUCE SYNAPTIQUE X9'}
                </div>
                <div className="text-[8px] text-gray-400 mt-1 font-mono">
                  +{stats.psiDamage} PSI POWER // +{stats.psiRegen}/s
                </div>
              </div>
            </div>

            {/* Objective Box */}
            <div className="mt-auto space-y-2">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#00ff41] font-orbitron flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-[#00ff41]" />
                Objectif Bastion
              </h2>
              <div className="text-[11px] leading-relaxed text-white opacity-90 bg-[#00ff410a] p-2.5 border border-[#00ff4122]">
                Neutraliser <span className="text-[#00ff41] font-bold">{killCount}/{requiredKillsForBoss}</span> unités ennemies pour forcer l'apparition du boss <span className="text-[#ff0044] font-bold">{currentStage.bossName}</span>.
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={onOpenInventory}
                  className="bg-[#222] hover:bg-[#333] text-[10px] py-1.5 uppercase font-bold border border-[#ffffff22] text-white transition-all"
                >
                  Inventaire
                </button>
                <button 
                  onClick={onOpenSkills}
                  className="bg-[#00f3ff22] hover:bg-[#00f3ff44] text-[10px] py-1.5 uppercase font-bold border border-[#00f3ff] text-[#00f3ff] transition-all"
                >
                  Talents
                </button>
              </div>
            </div>
          </aside>
        )}

      </div>

      {/* Bottom ARPG Cockpit Action Bar & Orbs (Immersive UI Layout) */}
      <div className="pointer-events-auto w-full max-w-5xl mx-auto flex items-center justify-between gap-3 sm:gap-6 bg-[#0a0a0f]/95 border border-[#ffffff11] px-4 sm:px-8 py-3 relative shadow-[0_0_40px_rgba(0,0,0,0.8)] z-20">
        
        {/* Floating Skill Hotkeys above the bottom bar */}
        <div className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3">
          {/* Primary Strike */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 border border-[#00ff41] bg-[#000] flex flex-col items-center justify-center text-[#00ff41] font-bold font-orbitron text-xs shadow-[0_0_10px_rgba(0,255,65,0.3)]">
            <span>CLIC</span>
          </div>
          
          {/* Q: Synaptic Lance */}
          <div className={`w-8 h-8 sm:w-10 sm:h-10 border ${cooldowns.synapticLance > 0 ? 'border-gray-700 text-gray-500' : 'border-[#00f3ff] text-[#00f3ff]'} bg-[#000] flex flex-col items-center justify-center font-bold font-orbitron text-xs shadow-[0_0_10px_rgba(0,243,255,0.3)] relative`}>
            <span>Q</span>
            {cooldowns.synapticLance > 0 && (
              <span className="absolute text-[9px] text-[#00f3ff] bg-black/90 inset-0 flex items-center justify-center">
                {cooldowns.synapticLance.toFixed(1)}
              </span>
            )}
          </div>

          {/* W: EMP Shockwave */}
          <div className={`w-8 h-8 sm:w-10 sm:h-10 border ${cooldowns.empShockwave > 0 ? 'border-gray-700 text-gray-500' : 'border-[#00f3ff] text-[#00f3ff]'} bg-[#000] flex flex-col items-center justify-center font-bold font-orbitron text-xs shadow-[0_0_10px_rgba(0,243,255,0.3)] relative`}>
            <span>W</span>
            {cooldowns.empShockwave > 0 && (
              <span className="absolute text-[9px] text-[#00f3ff] bg-black/90 inset-0 flex items-center justify-center">
                {cooldowns.empShockwave.toFixed(1)}
              </span>
            )}
          </div>

          {/* E: Psychic Vortex */}
          <div className={`w-8 h-8 sm:w-10 sm:h-10 border ${cooldowns.psychicVortex > 0 ? 'border-gray-700 text-gray-500' : 'border-[#00f3ff] text-[#00f3ff]'} bg-[#000] flex flex-col items-center justify-center font-bold font-orbitron text-xs shadow-[0_0_10px_rgba(0,243,255,0.3)] relative`}>
            <span>E</span>
            {cooldowns.psychicVortex > 0 && (
              <span className="absolute text-[9px] text-[#00f3ff] bg-black/90 inset-0 flex items-center justify-center">
                {cooldowns.psychicVortex.toFixed(1)}
              </span>
            )}
          </div>

          {/* R: Bullet Time Overdrive */}
          <div className={`w-8 h-8 sm:w-10 sm:h-10 border ${cooldowns.bulletTime > 0 ? 'border-gray-700 text-gray-500' : 'border-[#ff00ff] text-[#ff00ff]'} bg-[#000] flex flex-col items-center justify-center font-bold font-orbitron text-xs shadow-[0_0_15px_rgba(255,0,255,0.4)] relative`}>
            <span>R</span>
            {cooldowns.bulletTime > 0 && (
              <span className="absolute text-[9px] text-[#ff00ff] bg-black/90 inset-0 flex items-center justify-center">
                {cooldowns.bulletTime.toFixed(1)}
              </span>
            )}
          </div>

          {/* Space: Dash */}
          <div className={`w-14 sm:w-16 h-8 sm:h-10 border ${cooldowns.dash > 0 ? 'border-gray-700 text-gray-500' : 'border-[#00ff41] text-[#00ff41]'} bg-[#000] flex flex-col items-center justify-center font-bold font-orbitron text-[10px] shadow-[0_0_10px_rgba(0,255,65,0.3)] relative`}>
            <span>DASH</span>
            {cooldowns.dash > 0 && (
              <span className="absolute text-[9px] text-[#00ff41] bg-black/90 inset-0 flex items-center justify-center">
                {cooldowns.dash.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Left Immersive Health Indicator */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
            {/* D4 Potion Charges */}
            {potionSystem && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-1 items-center">
                <div className="text-[9px] font-mono text-gray-400 mr-1">[F]</div>
                {Array.from({ length: potionSystem.maxCharges }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-7 rounded-sm border transition-all duration-300 flex items-center justify-center ${
                      i < potionSystem.charges
                        ? 'border-red-500 bg-red-900/60 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                        : 'border-gray-700 bg-gray-900/40 opacity-40'
                    } ${potionSystem.cooldownTimer > 0 && i === potionSystem.charges ? 'animate-pulse' : ''}`}
                  >
                    <div className={`w-2.5 h-4 rounded-sm ${
                      i < potionSystem.charges ? 'bg-gradient-to-t from-red-700 to-red-400' : 'bg-gray-800'
                    }`} />
                  </div>
                ))}
                {potionSystem.cooldownTimer > 0 && (
                  <div className="text-[8px] font-mono text-red-400 ml-1">
                    {Math.ceil(potionSystem.cooldownTimer / 60)}s
                  </div>
                )}
              </div>
            )}
          <div className="absolute w-full h-full rounded-full border-4 border-[#111]" />
          <div 
            className="absolute w-full h-full rounded-full border-t-4 border-l-4 border-r-4 border-[#ff0044] shadow-[0_0_15px_#ff0044] transition-all"
            style={{ opacity: Math.max(0.3, hpPercent / 100) }}
          />
          <div className="text-center font-orbitron">
            <div className="text-[9px] sm:text-[10px] font-bold text-[#ff0044]">
              HP {Math.round(hpPercent)}%
            </div>
            <div className="text-[10px] sm:text-xs font-mono text-white font-bold">
              {Math.round(stats.currentHp)}
            </div>
          </div>
        </div>

        {/* Center Telemetry Bandwidth & Overclock Status */}
        <div className="flex-1 flex flex-col gap-1.5 sm:gap-2">
          <div className="flex justify-between text-[9px] sm:text-[10px] uppercase font-bold tracking-widest font-mono">
            <span className="text-[#00f3ff]">Neural Bandwidth</span>
            <span className="text-[#00f3ff]">{Math.round(stats.currentPsi)} / {stats.maxPsi} MHZ</span>
          </div>
          <div className="h-2.5 sm:h-3 bg-[#111] border border-[#00f3ff33] p-[2px]">
            <div 
              className="h-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff] transition-all duration-150"
              style={{ width: `${psiPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] opacity-60 font-mono text-gray-300">
            <span>UPSTREAM: 42.1 MB/S</span>
            <span>LATENCY: 4MS // STABLE</span>
          </div>
        </div>

        {/* Right Immersive PSI Energy Indicator */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
          <div className="absolute w-full h-full rounded-full border-4 border-[#111]" />
          <div 
            className="absolute w-full h-full rounded-full border-b-4 border-l-4 border-r-4 border-[#00f3ff] shadow-[0_0_15px_#00f3ff] transition-all"
            style={{ opacity: Math.max(0.3, psiPercent / 100) }}
          />
          <div className="text-center font-orbitron">
            <div className="text-[9px] sm:text-[10px] font-bold text-[#00f3ff]">
              PSI {Math.round(psiPercent)}%
            </div>
            <div className="text-[10px] sm:text-xs font-mono text-white font-bold">
              {Math.round(stats.currentPsi)}
            </div>
          </div>
        </div>

      </div>

      {/* Footer Telemetry Line (as specified in Immersive UI design) */}
      <footer className="mt-1 flex justify-between items-end text-[8px] sm:text-[9px] font-mono opacity-50 uppercase tracking-tighter text-gray-400 px-2">
        <div>ID: REBEL_{level} // AUTH: CRYPTO_HASH_{nanites}X // BUILD: 2033.4a</div>
        <div className="hidden sm:flex gap-4">
          <span>CPU: 12%</span>
          <span>GPU: 45%</span>
          <span>MEM: 1.2GB</span>
          <span className="text-[#00ff41] animate-pulse">CONNECTIVITY: STABLE</span>
        </div>
      </footer>
    </div>
  );
};
