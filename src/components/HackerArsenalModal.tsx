import React, { useState } from 'react';
import { 
  Terminal, 
  Globe, 
  Radio, 
  Cpu, 
  ShieldAlert, 
  Zap, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Flame, 
  X, 
  Wifi, 
  DollarSign, 
  Layers, 
  Crosshair, 
  Activity, 
  FileCode, 
  Key, 
  Shield, 
  Compass, 
  Play, 
  Coins
} from 'lucide-react';
import { 
  WORLD_MONITOR_59_HACKS, 
  HACKER_HARDWARE_GADGETS, 
  CLOSE_COMBAT_GLOVES, 
  ELITE_HACKER_WEAPONS, 
  WorldMonitorHack, 
  HackerGadgetItem,
  BitcoinWalletState,
  formatSatoshis
} from '../utils/hackerArsenalData';
import { sound } from '../utils/audio';

interface HackerArsenalModalProps {
  isOpen: boolean;
  onClose: () => void;
  bitcoinWallet: BitcoinWalletState;
  onUnlockHack: (hackId: string, btcPrice: number) => void;
  onUnlockArsenalItem: (itemId: string, btcPrice: number) => void;
  onEquipItem?: (item: HackerGadgetItem) => void;
  onExecuteHack?: (hack: WorldMonitorHack) => void;
}

export const HackerArsenalModal: React.FC<HackerArsenalModalProps> = ({
  isOpen,
  onClose,
  bitcoinWallet,
  onUnlockHack,
  onUnlockArsenalItem,
  onEquipItem,
  onExecuteHack
}) => {
  const [activeTab, setActiveTab] = useState<'hacks_59' | 'gadgets' | 'gloves' | 'elite_weapons' | 'bitcoin_wallet'>('hacks_59');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeExecutedHack, setActiveExecutedHack] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Tous les 59 Hacks' },
    { id: 'Cyber-Guerre', label: 'Cyber-Guerre' },
    { id: 'Marchés & Finance', label: 'Marchés & Finance' },
    { id: 'Menaces & Conflits', label: 'Menaces & Conflits' },
    { id: 'Renseignement Géospatial', label: 'Géospatial' },
    { id: 'Surveillance & Satellites', label: 'Satellites SkyFi' },
    { id: 'Signal & OSINT', label: 'Signal & OSINT' },
    { id: 'Infrastructure & Énergie', label: 'Infrastructure' }
  ];

  const filteredHacks = WORLD_MONITOR_59_HACKS.filter(hack => {
    const matchesCat = selectedCategory === 'all' || hack.category === selectedCategory;
    const matchesSearch = hack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          hack.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          hack.mcpToolName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleTriggerHack = (hack: WorldMonitorHack) => {
    sound.play('hackSuccess');
    setActiveExecutedHack(hack.id);
    if (onExecuteHack) {
      onExecuteHack(hack);
    }
    setTimeout(() => {
      setActiveExecutedHack(null);
    }, 2500);
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]">Légendaire</span>;
      case 'epic':
        return <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]">Épique</span>;
      case 'rare':
        return <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-500/50">Rare</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-gray-600/20 text-gray-300 border border-gray-600/50">Standard</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md font-sans">
      <div className="relative w-full max-w-6xl bg-[#090c14] border border-[#00f3ff55] shadow-[0_0_60px_rgba(0,243,255,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-gray-200">
        
        {/* Header with Bitcoin Balance */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-[#0d121f] border-b border-[#00f3ff33] gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00f3ff22] border border-[#00f3ff] text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.3)]">
              <Terminal className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-orbitron font-black text-white tracking-wider flex items-center gap-2">
                ARSENAL DE HACKER <span className="text-[#00f3ff]">// 59 HACKS WORLD MONITOR & GADGETS</span>
              </h2>
              <p className="text-[11px] font-mono text-[#00f3ff]/70 tracking-widest uppercase">
                Outils Réels de Cybersécurité • Armes Élite Open Source • Économie Bitcoin (BTC)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Bitcoin Balance Badge */}
            <div className="px-3.5 py-1.5 bg-[#f59e0b18] border border-[#f59e0b] text-[#f59e0b] flex items-center gap-2 rounded-sm shadow-[0_0_15px_rgba(245,158,11,0.25)] font-mono">
              <Coins className="w-4 h-4 animate-bounce" />
              <div className="text-right">
                <div className="text-xs font-black">{formatSatoshis(bitcoinWallet.satoshis).satsFormatted}</div>
                <div className="text-[9px] text-[#f59e0b]/80">{formatSatoshis(bitcoinWallet.satoshis).btcFormatted}</div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-[#00f3ff22] bg-[#0b0e17]">
          <button
            onClick={() => setActiveTab('hacks_59')}
            className={`flex-1 min-w-[140px] py-3 px-3 flex items-center justify-center gap-2 font-orbitron text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'hacks_59'
                ? 'border-[#00f3ff] bg-[#00f3ff15] text-[#00f3ff] shadow-[0_4px_15px_rgba(0,243,255,0.2)]'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Globe className="w-4 h-4 text-[#00f3ff]" />
            <span>59 Hacks (World Monitor)</span>
          </button>

          <button
            onClick={() => setActiveTab('gadgets')}
            className={`flex-1 min-w-[140px] py-3 px-3 flex items-center justify-center gap-2 font-orbitron text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'gadgets'
                ? 'border-[#10b981] bg-[#10b98115] text-[#10b981] shadow-[0_4px_15px_rgba(16,185,129,0.2)]'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Radio className="w-4 h-4 text-[#10b981]" />
            <span>Gadgets Pentest (Flipper Zero, Wi-Fi...)</span>
          </button>

          <button
            onClick={() => setActiveTab('gloves')}
            className={`flex-1 min-w-[140px] py-3 px-3 flex items-center justify-center gap-2 font-orbitron text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'gloves'
                ? 'border-[#ef4444] bg-[#ef444415] text-[#ef4444] shadow-[0_4px_15px_rgba(239,68,68,0.2)]'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4 text-[#ef4444]" />
            <span>Gants Combat Rapproché</span>
          </button>

          <button
            onClick={() => setActiveTab('elite_weapons')}
            className={`flex-1 min-w-[140px] py-3 px-3 flex items-center justify-center gap-2 font-orbitron text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'elite_weapons'
                ? 'border-[#f59e0b] bg-[#f59e0b15] text-[#f59e0b] shadow-[0_4px_15px_rgba(245,158,11,0.2)]'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#f59e0b]" />
            <span>Armes Élite (HexStrike, Sherlock...)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-[#080a10]">
          
          {/* TAB 1: 59 HACKS WORLD MONITOR */}
          {activeTab === 'hacks_59' && (
            <div className="space-y-5">
              {/* Category Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#0e1422] p-3 border border-[#00f3ff22]">
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`px-2.5 py-1 text-[10px] font-mono uppercase transition-all cursor-pointer ${
                        selectedCategory === c.id
                          ? 'bg-[#00f3ff] text-black font-black shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer les 59 Hacks..."
                    className="w-full pl-8 pr-3 py-1.5 bg-black/60 border border-[#00f3ff33] text-xs font-mono text-[#00f3ff] focus:outline-none focus:border-[#00f3ff]"
                  />
                </div>
              </div>

              {/* Grid of 59 Hacks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHacks.map(hack => {
                  const isUnlocked = hack.unlockedByDefault || bitcoinWallet.unlockedHackIds.includes(hack.id);
                  const isExecuting = activeExecutedHack === hack.id;
                  const canAfford = bitcoinWallet.satoshis >= hack.unlockBtcPrice;

                  return (
                    <div 
                      key={hack.id}
                      className={`p-4 border transition-all flex flex-col justify-between ${
                        isExecuting 
                          ? 'bg-[#00f3ff22] border-[#00f3ff] shadow-[0_0_25px_rgba(0,243,255,0.5)] scale-[1.02]' 
                          : isUnlocked 
                            ? 'bg-[#0d1322] border-[#00f3ff33] hover:border-[#00f3ff88]' 
                            : 'bg-[#0a0d14] border-gray-800 opacity-75'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[9px] font-mono text-[#00f3ff]/70 uppercase tracking-widest">{hack.category}</span>
                            <h3 className="text-sm font-orbitron font-bold text-white flex items-center gap-1.5">
                              {hack.name}
                            </h3>
                          </div>
                          {getRarityBadge(hack.rarity)}
                        </div>

                        <p className="text-xs text-gray-300 mb-2.5 leading-relaxed font-sans">{hack.description}</p>
                        
                        {/* Real World Concept */}
                        <div className="p-2 bg-black/50 border border-white/5 mb-2.5 text-[10px] font-mono text-cyan-300/80">
                          <span className="text-gray-400 uppercase font-bold">📡 Utilisation Réelle : </span>
                          {hack.realWorldUsage}
                        </div>

                        {/* In-game effect */}
                        <div className="p-2 bg-[#00ff4110] border border-[#00ff4133] mb-3 text-[11px] font-mono text-[#00ff41]">
                          <span className="text-white font-bold">⚡ Effet de Combat : </span>
                          {hack.gameEffect}
                        </div>
                      </div>

                      {/* Bottom action buttons */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                        <div className="text-[10px] font-mono text-gray-400">
                          <span>PSI: <b className="text-[#00f3ff]">{hack.psiCost}</b></span> • <span>CD: <b className="text-amber-400">{hack.cooldownSec}s</b></span>
                        </div>

                        {isUnlocked ? (
                          <button
                            onClick={() => handleTriggerHack(hack)}
                            disabled={isExecuting}
                            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                              isExecuting
                                ? 'bg-[#00f3ff] text-black animate-pulse'
                                : 'bg-[#00f3ff22] border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:text-black shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                            }`}
                          >
                            <Play className="w-3 h-3" />
                            {isExecuting ? 'EXÉCUTION MCP...' : 'LANCER LE HACK'}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (canAfford) {
                                sound.play('levelUp');
                                onUnlockHack(hack.id, hack.unlockBtcPrice);
                              } else {
                                sound.play('enemyAlert');
                              }
                            }}
                            disabled={!canAfford}
                            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                              canAfford 
                                ? 'bg-[#f59e0b22] border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-black' 
                                : 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <Lock className="w-3 h-3" />
                            DÉBLOQUER ({hack.unlockBtcPrice} sats)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: GADGETS MATÉRIELS PENTEST */}
          {activeTab === 'gadgets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {HACKER_HARDWARE_GADGETS.map(gadget => {
                const isUnlocked = bitcoinWallet.unlockedArsenalIds.includes(gadget.id);
                const canAfford = bitcoinWallet.satoshis >= gadget.btcValue;

                return (
                  <div key={gadget.id} className="p-5 bg-[#0e1422] border border-[#10b98144] flex flex-col justify-between hover:border-[#10b981] transition-all">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-[#10b98122] border border-[#10b981] text-[#10b981]">
                            <Radio className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-orbitron font-bold text-white">{gadget.name}</h3>
                            <span className="text-[10px] font-mono text-[#10b981]">Équipement Matériel • Niveau requis : {gadget.levelReq}</span>
                          </div>
                        </div>
                        {getRarityBadge(gadget.rarity)}
                      </div>

                      <div className="space-y-2.5 mb-4 text-xs">
                        <div className="p-2.5 bg-black/60 border border-white/5 font-mono text-gray-300">
                          <span className="text-emerald-400 font-bold">🔧 Spécifications Réelles : </span>
                          {gadget.realWorldSpecs}
                        </div>
                        <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 font-mono text-emerald-300">
                          <span className="text-white font-bold">🎓 Concept Pédagogique : </span>
                          {gadget.educationalConcept}
                        </div>
                        <div className="p-2.5 bg-[#00f3ff10] border border-[#00f3ff33] font-mono text-[#00f3ff]">
                          <span className="text-white font-bold">⭐ Passif : {gadget.passiveAbility.name} : </span>
                          {gadget.passiveAbility.description}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="text-xs font-mono text-[#f59e0b] font-bold">
                        Prix : {gadget.btcValue} Satoshis
                      </div>

                      {isUnlocked ? (
                        <button
                          onClick={() => {
                            sound.play('equip');
                            if (onEquipItem) onEquipItem(gadget);
                          }}
                          className="px-4 py-1.5 bg-[#10b981] text-black font-mono font-bold text-xs uppercase hover:bg-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ÉQUIPER SUR THIRTY3
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (canAfford) {
                              sound.play('levelUp');
                              onUnlockArsenalItem(gadget.id, gadget.btcValue);
                            }
                          }}
                          disabled={!canAfford}
                          className={`px-4 py-1.5 font-mono font-bold text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                            canAfford 
                              ? 'bg-[#f59e0b] text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          FORGER LE GADGET
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: GANTS DE COMBAT RAPPROCHÉ */}
          {activeTab === 'gloves' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {CLOSE_COMBAT_GLOVES.map(glove => {
                const isUnlocked = bitcoinWallet.unlockedArsenalIds.includes(glove.id);
                const canAfford = bitcoinWallet.satoshis >= glove.btcValue;

                return (
                  <div key={glove.id} className="p-5 bg-[#140e14] border border-[#ef444444] flex flex-col justify-between hover:border-[#ef4444] transition-all">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-[#ef444422] border border-[#ef4444] text-[#ef4444]">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-orbitron font-bold text-white">{glove.name}</h3>
                            <span className="text-[10px] font-mono text-[#ef4444]">Arme Physique / Corps-à-Corps • Req : Lv.{glove.levelReq}</span>
                          </div>
                        </div>
                        {getRarityBadge(glove.rarity)}
                      </div>

                      <div className="space-y-2.5 mb-4 text-xs">
                        <div className="p-2.5 bg-black/60 border border-white/5 font-mono text-gray-300">
                          <span className="text-red-400 font-bold">🥊 Conception Physique : </span>
                          {glove.realWorldSpecs}
                        </div>
                        <div className="p-2.5 bg-red-950/20 border border-red-500/20 font-mono text-red-300">
                          <span className="text-white font-bold">⚡ Pouvoir Spécial : {glove.passiveAbility.name} : </span>
                          {glove.passiveAbility.description}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="text-xs font-mono text-[#f59e0b] font-bold">
                        Prix : {glove.btcValue} Satoshis
                      </div>

                      {isUnlocked ? (
                        <button
                          onClick={() => {
                            sound.play('equip');
                            if (onEquipItem) onEquipItem(glove);
                          }}
                          className="px-4 py-1.5 bg-[#ef4444] text-white font-mono font-bold text-xs uppercase hover:bg-red-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ÉQUIPER LES GANTS
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (canAfford) {
                              sound.play('levelUp');
                              onUnlockArsenalItem(glove.id, glove.btcValue);
                            }
                          }}
                          disabled={!canAfford}
                          className={`px-4 py-1.5 font-mono font-bold text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                            canAfford 
                              ? 'bg-[#f59e0b] text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          DÉBLOQUER LES GANTS
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: ARMES DE HACKER ÉLITE */}
          {activeTab === 'elite_weapons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {ELITE_HACKER_WEAPONS.map(weapon => {
                const isUnlocked = bitcoinWallet.unlockedArsenalIds.includes(weapon.id);
                const canAfford = bitcoinWallet.satoshis >= weapon.btcValue;

                return (
                  <div key={weapon.id} className="p-5 bg-[#141208] border border-[#f59e0b44] flex flex-col justify-between hover:border-[#f59e0b] transition-all">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-[#f59e0b22] border border-[#f59e0b] text-[#f59e0b]">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-orbitron font-bold text-white">{weapon.name}</h3>
                            <span className="text-[10px] font-mono text-[#f59e0b]">Arme de Hacker Élite Open Source • Req : Lv.{weapon.levelReq}</span>
                          </div>
                        </div>
                        {getRarityBadge(weapon.rarity)}
                      </div>

                      <div className="space-y-2.5 mb-4 text-xs">
                        <div className="p-2.5 bg-black/60 border border-white/5 font-mono text-gray-300">
                          <span className="text-amber-400 font-bold">💻 Code & Spécifications : </span>
                          {weapon.realWorldSpecs}
                        </div>
                        <div className="p-2.5 bg-amber-950/20 border border-amber-500/20 font-mono text-amber-300">
                          <span className="text-white font-bold">🎓 Apprentissage Cybersécurité : </span>
                          {weapon.educationalConcept}
                        </div>
                        <div className="p-2.5 bg-[#00f3ff10] border border-[#00f3ff33] font-mono text-[#00f3ff]">
                          <span className="text-white font-bold">⚡ Attaque Ultime : {weapon.passiveAbility.name} : </span>
                          {weapon.passiveAbility.description}
                        </div>

                        {weapon.githubUrl && (
                          <a
                            href={weapon.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#00f3ff] hover:underline bg-[#00f3ff10] px-2.5 py-1 border border-[#00f3ff33]"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Dépôt GitHub Officiel : {weapon.githubUrl.replace('https://github.com/', '')}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="text-xs font-mono text-[#f59e0b] font-bold">
                        Prix : {weapon.btcValue} Satoshis
                      </div>

                      {isUnlocked ? (
                        <button
                          onClick={() => {
                            sound.play('equip');
                            if (onEquipItem) onEquipItem(weapon);
                          }}
                          className="px-4 py-1.5 bg-[#f59e0b] text-black font-mono font-bold text-xs uppercase hover:bg-amber-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ÉQUIPER L'ARME ÉLITE
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (canAfford) {
                              sound.play('levelUp');
                              onUnlockArsenalItem(weapon.id, weapon.btcValue);
                            }
                          }}
                          disabled={!canAfford}
                          className={`px-4 py-1.5 font-mono font-bold text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                            canAfford 
                              ? 'bg-[#f59e0b] text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          DÉBLOQUER AVEC BITCOIN
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0d121f] border-t border-[#00f3ff33] flex flex-wrap items-center justify-between text-xs font-mono text-gray-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-ping" />
            <span className="text-[#00ff41] font-bold">DEUS EX SOPHIA :</span>
            <span>« Tout le savoir cybernétique est à votre disposition pour démanteler l’empire de Viktor Vance en toute légalité. »</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1 bg-white/10 hover:bg-white/20 text-white font-mono text-xs cursor-pointer"
          >
            Fermer le Terminal
          </button>
        </div>

      </div>
    </div>
  );
};
