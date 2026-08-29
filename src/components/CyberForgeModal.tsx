import React, { useState, useMemo } from 'react';
import { EquipmentItem, ItemRarity, ItemSlot } from '../types';
import { forgeEquipmentItem } from '../utils/lootGenerator';
import { sound } from '../utils/audio';
import { 
  X, 
  Sparkles, 
  Flame, 
  Shield, 
  Zap, 
  Cpu, 
  Activity, 
  Sword, 
  ArrowRight, 
  Layers, 
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CyberForgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: EquipmentItem[];
  playerLevel: number;
  difficultyTier: number;
  nanites: number;
  onForgeSuccess: (consumedItemIds: string[], forgedItem: EquipmentItem, naniteCost: number) => void;
  onEquipItem?: (item: EquipmentItem) => void;
}

const NANITE_FORGE_COSTS: Record<ItemRarity, number> = {
  standard: 50,
  rare: 150,
  epic: 400,
  legendary: 800
};

const RARITY_NAMES: Record<ItemRarity, string> = {
  standard: 'Standard (Gris)',
  rare: 'Rare (Bleu)',
  epic: 'Épique (Violet)',
  legendary: 'Légendaire (Orange)'
};

const NEXT_RARITY: Record<ItemRarity, { name: string; color: string; rarity: ItemRarity }> = {
  standard: { name: 'RARE (BLEU)', color: '#00f3ff', rarity: 'rare' },
  rare: { name: 'ÉPIQUE (VIOLET)', color: '#ff00ff', rarity: 'epic' },
  epic: { name: 'LÉGENDAIRE (ORANGE)', color: '#f2994a', rarity: 'legendary' },
  legendary: { name: 'OVERCLOCK LÉGENDAIRE', color: '#00ff41', rarity: 'legendary' }
};

export const CyberForgeModal: React.FC<CyberForgeModalProps> = ({
  isOpen,
  onClose,
  inventory,
  playerLevel,
  difficultyTier,
  nanites,
  onForgeSuccess,
  onEquipItem
}) => {
  // 3 input chamber item IDs
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [filterRarity, setFilterRarity] = useState<ItemRarity | 'all'>('all');
  const [isForging, setIsForging] = useState<boolean>(false);
  const [forgeProgress, setForgeProgress] = useState<number>(0);
  const [forgedResult, setForgedResult] = useState<EquipmentItem | null>(null);

  if (!isOpen) return null;

  // Selected items objects
  const selectedItems: EquipmentItem[] = useMemo(() => {
    return selectedItemIds
      .map(id => inventory.find(item => item.id === id))
      .filter((item): item is EquipmentItem => item !== undefined);
  }, [selectedItemIds, inventory]);

  // Current active rarity in the chamber
  const chamberRarity: ItemRarity | null = selectedItems.length > 0 ? selectedItems[0].rarity : null;

  // Validate if all slotted items have matching rarity
  const isRarityConsistent = selectedItems.length > 0 && selectedItems.every(it => it.rarity === chamberRarity);
  const isReadyToForge = selectedItems.length === 3 && isRarityConsistent;

  // Nanite cost for the fusion
  const requiredNanites = chamberRarity ? NANITE_FORGE_COSTS[chamberRarity] : 0;
  const hasEnoughNanites = nanites >= requiredNanites;

  // Filtered inventory list
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      if (filterRarity !== 'all' && item.rarity !== filterRarity) return false;
      return true;
    });
  }, [inventory, filterRarity]);

  const getRarityColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'legendary': return 'text-[#f2994a] border-[#f2994a] bg-[#1a110a]';
      case 'epic': return 'text-[#ff00ff] border-[#ff00ff] bg-[#1a0a1a]';
      case 'rare': return 'text-[#00f3ff] border-[#00f3ff] bg-[#0a1520]';
      default: return 'text-gray-300 border-[#ffffff22] bg-[#11111a]';
    }
  };

  const getRarityBadgeBg = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'legendary': return 'bg-[#f2994a22] text-[#f2994a] border-[#f2994a]';
      case 'epic': return 'bg-[#ff00ff22] text-[#ff00ff] border-[#ff00ff]';
      case 'rare': return 'bg-[#00f3ff22] text-[#00f3ff] border-[#00f3ff]';
      default: return 'bg-[#ffffff11] text-gray-300 border-[#ffffff33]';
    }
  };

  const getSlotIcon = (slot: ItemSlot) => {
    switch (slot) {
      case 'weapon': return <Sword className="w-4 h-4" />;
      case 'deck': return <Cpu className="w-4 h-4" />;
      case 'armor': return <Shield className="w-4 h-4" />;
      case 'chip': return <Zap className="w-4 h-4" />;
      case 'boots': return <Activity className="w-4 h-4" />;
    }
  };

  const handleSelectItem = (item: EquipmentItem) => {
    sound.playItemSlot();
    // If already in chamber, remove it
    if (selectedItemIds.includes(item.id)) {
      setSelectedItemIds(prev => prev.filter(id => id !== item.id));
      return;
    }

    // If chamber already has 3 items, cannot add more
    if (selectedItemIds.length >= 3) return;

    // If chamber has items and rarity doesn't match, warn or replace
    if (selectedItems.length > 0 && selectedItems[0].rarity !== item.rarity) {
      // Clear previous mismatched items and start with this new rarity
      setSelectedItemIds([item.id]);
      return;
    }

    setSelectedItemIds(prev => [...prev, item.id]);
  };

  const handleRemoveSlot = (index: number) => {
    sound.playUiClick();
    setSelectedItemIds(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleClearChamber = () => {
    sound.playUiClick();
    setSelectedItemIds([]);
  };

  const handleAutoFill = (rarity: ItemRarity) => {
    sound.playItemSlot();
    const available = inventory.filter(item => item.rarity === rarity);
    if (available.length >= 3) {
      setSelectedItemIds([available[0].id, available[1].id, available[2].id]);
      setFilterRarity(rarity);
    } else if (available.length > 0) {
      setSelectedItemIds(available.map(a => a.id));
      setFilterRarity(rarity);
    }
  };

  const handleExecuteForge = () => {
    if (!isReadyToForge || !hasEnoughNanites || isForging) return;

    setIsForging(true);
    setForgeProgress(0);
    sound.playCyberForgeCharge();

    const startTime = Date.now();
    const duration = 1200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setForgeProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        try {
          const forged = forgeEquipmentItem(selectedItems, playerLevel, difficultyTier);
          sound.playCyberForgeSuccess();
          setForgedResult(forged);
          onForgeSuccess(selectedItemIds, forged, requiredNanites);
          setSelectedItemIds([]);
        } catch (e) {
          console.error(e);
        } finally {
          setIsForging(false);
          setForgeProgress(0);
        }
      }
    }, 40);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-chakra select-none text-[#c0c0c0]">
      <div className="bg-[#07070c] border border-[#ff005544] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(255,0,85,0.2)] overflow-hidden relative">
        
        {/* Glowing Top Energy Header Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff0055] via-[#f2994a] to-[#00f3ff]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#ff005533] bg-[#101018]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff005522] border border-[#ff0055] text-[#ff0055] shadow-[0_0_15px_rgba(255,0,85,0.3)]">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-orbitron font-bold text-white tracking-wider uppercase italic">
                  CYBER-FORGE MOLÉCULAIRE // SYNTHÈSE QUANTIQUE
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#ff005522] border border-[#ff0055] text-[#ff0055] font-bold">
                  [F]
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono">
                Fusionnez 3 équipements de rareté identique pour synthétiser un implant de rang supérieur garanti
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#181824] border border-[#f2994a] px-3 py-1 text-[#f2994a] font-orbitron font-bold text-xs">
              <Sparkles className="w-4 h-4 text-[#f2994a]" />
              <span>{nanites.toLocaleString()} Nanites</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222] transition-colors border border-transparent hover:border-[#ffffff22]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-cyber-radial">
          
          {/* LEFT 7 COLS: THE FUSION REACTOR & 3 INPUT CHAMBERS */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Quick Auto-Fill Bar */}
            <div className="bg-[#101018] border border-[#ffffff11] p-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-orbitron font-bold text-gray-400 uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#00f3ff]" />
                Remplissage Auto :
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleAutoFill('standard')}
                  className="px-2 py-1 bg-[#181824] hover:bg-[#ffffff22] border border-[#ffffff22] text-[10px] font-mono font-bold text-gray-300 transition-all"
                >
                  +3 Standard
                </button>
                <button
                  onClick={() => handleAutoFill('rare')}
                  className="px-2 py-1 bg-[#0a1520] hover:bg-[#00f3ff22] border border-[#00f3ff44] text-[10px] font-mono font-bold text-[#00f3ff] transition-all"
                >
                  +3 Rare
                </button>
                <button
                  onClick={() => handleAutoFill('epic')}
                  className="px-2 py-1 bg-[#1a0a1a] hover:bg-[#ff00ff22] border border-[#ff00ff44] text-[10px] font-mono font-bold text-[#ff00ff] transition-all"
                >
                  +3 Épique
                </button>
                <button
                  onClick={() => handleAutoFill('legendary')}
                  className="px-2 py-1 bg-[#1a110a] hover:bg-[#f2994a22] border border-[#f2994a44] text-[10px] font-mono font-bold text-[#f2994a] transition-all"
                >
                  +3 Légendaire
                </button>
                {selectedItemIds.length > 0 && (
                  <button
                    onClick={handleClearChamber}
                    className="px-2 py-1 bg-[#221010] hover:bg-[#ff0044]/30 border border-[#ff004444] text-[10px] font-mono font-bold text-[#ff0044] transition-all flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Vider
                  </button>
                )}
              </div>
            </div>

            {/* 3 Input Chambers Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((slotIdx) => {
                const item = selectedItems[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    onClick={() => item && handleRemoveSlot(slotIdx)}
                    className={`relative p-3 border transition-all flex flex-col justify-between min-h-[145px] ${
                      item
                        ? `${getRarityColor(item.rarity)} cursor-pointer hover:border-[#ff0055] hover:scale-[1.02] shadow-[0_0_15px_rgba(0,0,0,0.5)]`
                        : 'border-dashed border-[#ffffff22] bg-[#0c0c14] text-gray-600 flex items-center justify-center'
                    }`}
                  >
                    {/* Chamber Index Header */}
                    <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 w-full mb-1">
                      <span>CHAMBRE 0{slotIdx + 1}</span>
                      {item && (
                        <span className="text-[#ff0055] text-[10px] hover:underline font-bold">✕ Retirer</span>
                      )}
                    </div>

                    {item ? (
                      <div className="flex flex-col items-center text-center my-auto">
                        <div className="p-2 bg-black/60 border border-[#ffffff11] mb-1.5">
                          {getSlotIcon(item.slot)}
                        </div>
                        <div className="text-[11px] font-orbitron font-bold text-white line-clamp-1 leading-tight w-full">
                          {item.name}
                        </div>
                        <div className="text-[9px] font-mono text-gray-400 mt-0.5">
                          Niv. {item.levelReq} • +{item.baseStat.value} {item.baseStat.name.split(' ')[0]}
                        </div>
                        <div className="mt-1">
                          <span className={`text-[8px] font-mono font-bold px-1 py-0.2 border ${getRarityBadgeBg(item.rarity)}`}>
                            {item.rarity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-2">
                        <div className="w-8 h-8 rounded-full border border-dashed border-[#ffffff33] flex items-center justify-center mb-1 text-gray-500">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-orbitron text-gray-500 uppercase">
                          Insérer Implant
                        </span>
                        <span className="text-[8px] font-mono text-gray-600">
                          {slotIdx === 0 ? 'Sélectionnez un item' : 'Même rareté requise'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Central Fusion Reactor Console */}
            <div className="bg-[#10101a] border border-[#ff005533] p-4 flex flex-col gap-3 relative overflow-hidden">
              
              {/* Animated Plasma reactor core visual */}
              <div className="flex items-center justify-between border-b border-[#ffffff11] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3.5 h-3.5 rounded-full ${isReadyToForge ? 'bg-[#00ff41] animate-ping' : 'bg-[#ff0055]'}`} />
                  <div>
                    <span className="text-xs font-orbitron font-bold text-white uppercase tracking-wider block">
                      RÉACTEUR DE FUSION // ÉTAT : {isReadyToForge ? 'PRÊT À LA SYNTHÈSE' : 'EN ATTENTE DE 3 IMPLANTS'}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {selectedItems.length}/3 Composants Moléculaires Insérés
                    </span>
                  </div>
                </div>

                {chamberRarity && NEXT_RARITY[chamberRarity] && (
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-gray-400 block">RÉSULTAT ESTIMÉ :</span>
                    <span 
                      className="text-xs font-orbitron font-bold tracking-wider"
                      style={{ color: NEXT_RARITY[chamberRarity].color }}
                    >
                      ★ {NEXT_RARITY[chamberRarity].name}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar during forge */}
              {isForging && (
                <div className="flex flex-col gap-1.5 my-2">
                  <div className="flex justify-between text-[10px] font-mono text-[#00f3ff]">
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SYNTHÈSE MOLECULAIRE EN COURS...
                    </span>
                    <span>{forgeProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#050508] border border-[#00f3ff44] overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#ff0055] via-[#f2994a] to-[#00f3ff] transition-all duration-75"
                      style={{ width: `${forgeProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Synthesis Specs & Cost */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono bg-[#080810] p-3 border border-[#ffffff0a]">
                <div>
                  <span className="text-[9px] text-gray-500 block">COÛT EN NANITES :</span>
                  <span className={`font-bold font-orbitron ${hasEnoughNanites ? 'text-[#f2994a]' : 'text-[#ff0044]'}`}>
                    {requiredNanites} Nanites
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 block">NIVEAU PRODUIT :</span>
                  <span className="font-bold text-white font-orbitron">
                    Niveau {playerLevel} (+1 Bonus)
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[9px] text-gray-500 block">GARANTIE :</span>
                  <span className="font-bold text-[#00ff41] font-orbitron">
                    100% Succès Tier +1
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                disabled={!isReadyToForge || !hasEnoughNanites || isForging}
                onClick={handleExecuteForge}
                className={`w-full py-3 font-orbitron font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                  isReadyToForge && hasEnoughNanites && !isForging
                    ? 'bg-gradient-to-r from-[#ff0055] to-[#f2994a] text-white border-[#ffffff44] hover:shadow-[0_0_25px_rgba(255,0,85,0.6)] cursor-pointer hover:scale-[1.01]'
                    : 'bg-[#181822] text-gray-600 border-[#ffffff11] cursor-not-allowed opacity-60'
                }`}
              >
                <Flame className="w-5 h-5" />
                {isForging ? 'SYNTHÈSE EN COURS...' : 'INITIER LA CYBER-FUSION'}
              </button>

              {!hasEnoughNanites && isReadyToForge && (
                <div className="text-[10px] font-mono text-[#ff0044] flex items-center gap-1 justify-center">
                  <AlertCircle className="w-3.5 h-3.5" /> Nanites insuffisants ({nanites}/{requiredNanites})
                </div>
              )}
            </div>

            {/* Forge Rules Tip Box */}
            <div className="bg-[#0a0a12] border border-[#ffffff0a] p-3 text-[11px] font-sans text-gray-400 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#00f3ff] shrink-0 mt-0.5" />
              <p>
                <strong className="text-white font-orbitron">Astuce Tactique :</strong> Si vous combinez 3 pièces du même type (ex: 3 armes ou 3 decks), vous avez <span className="text-[#00f3ff] font-bold">80% de chances</span> de synthétiser exactement ce type d'équipement dans le rang supérieur !
              </p>
            </div>

          </div>

          {/* RIGHT 5 COLS: INVENTORY MATRIX & FILTERS */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-orbitron font-bold text-[#00f3ff] tracking-wider uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Implants Disponibles ({filteredInventory.length})
              </h3>
              <span className="text-[9px] font-mono text-gray-400">
                Cliquez pour insérer
              </span>
            </div>

            {/* Rarity Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-[#101018] p-1.5 border border-[#ffffff11]">
              <button
                onClick={() => setFilterRarity('all')}
                className={`px-2 py-1 text-[10px] font-orbitron font-bold transition-all ${
                  filterRarity === 'all' ? 'bg-[#00f3ff] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                TOUS
              </button>
              <button
                onClick={() => setFilterRarity('standard')}
                className={`px-2 py-1 text-[10px] font-orbitron font-bold transition-all ${
                  filterRarity === 'standard' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                STANDARD
              </button>
              <button
                onClick={() => setFilterRarity('rare')}
                className={`px-2 py-1 text-[10px] font-orbitron font-bold transition-all ${
                  filterRarity === 'rare' ? 'bg-[#00f3ff] text-black' : 'text-[#00f3ff] hover:text-white'
                }`}
              >
                RARE
              </button>
              <button
                onClick={() => setFilterRarity('epic')}
                className={`px-2 py-1 text-[10px] font-orbitron font-bold transition-all ${
                  filterRarity === 'epic' ? 'bg-[#ff00ff] text-black' : 'text-[#ff00ff] hover:text-white'
                }`}
              >
                ÉPIQUE
              </button>
              <button
                onClick={() => setFilterRarity('legendary')}
                className={`px-2 py-1 text-[10px] font-orbitron font-bold transition-all ${
                  filterRarity === 'legendary' ? 'bg-[#f2994a] text-black' : 'text-[#f2994a] hover:text-white'
                }`}
              >
                LÉGEND.
              </button>
            </div>

            {/* Inventory Scroll Grid */}
            <div className="flex-1 overflow-y-auto bg-[#0a0a10] border border-[#ffffff11] p-2 flex flex-col gap-1.5 max-h-[440px]">
              {filteredInventory.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-mono text-xs flex flex-col items-center justify-center">
                  <AlertCircle className="w-6 h-6 mb-2 opacity-40 text-gray-400" />
                  Aucun équipement disponible dans cette catégorie.
                </div>
              ) : (
                filteredInventory.map((item) => {
                  const isSlotted = selectedItemIds.includes(item.id);
                  const isRarityMismatch = chamberRarity !== null && item.rarity !== chamberRarity;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`p-2.5 border transition-all flex items-center justify-between cursor-pointer ${
                        isSlotted
                          ? 'border-[#00ff41] bg-[#00ff4115] shadow-[0_0_10px_rgba(0,255,65,0.2)]'
                          : isRarityMismatch && selectedItems.length > 0
                            ? 'opacity-40 hover:opacity-100 ' + getRarityColor(item.rarity)
                            : getRarityColor(item.rarity) + ' hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-black/60 border border-[#ffffff11]">
                          {getSlotIcon(item.slot)}
                        </div>
                        <div>
                          <div className="text-xs font-orbitron font-bold text-white leading-tight">
                            {item.name}
                          </div>
                          <div className="text-[9px] font-mono text-gray-400 flex items-center gap-2">
                            <span>N.{item.levelReq}</span>
                            <span>•</span>
                            <span>+{item.baseStat.value} {item.baseStat.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border ${getRarityBadgeBg(item.rarity)}`}>
                          {item.rarity.toUpperCase()}
                        </span>
                        {isSlotted && (
                          <span className="text-[9px] font-mono font-bold text-[#00ff41] bg-black/80 px-1.5 py-0.5 border border-[#00ff41]">
                            ✓ INSÉRÉ
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>

        {/* REVEAL RESULT MODAL OVERLAY */}
        {forgedResult && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
            <div className="bg-[#0b0b14] border-2 border-[#00f3ff] max-w-md w-full p-6 shadow-[0_0_50px_rgba(0,243,255,0.4)] flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              
              <div className="p-3 bg-[#00f3ff22] border-2 border-[#00f3ff] text-[#00f3ff] rounded-full mb-3 shadow-[0_0_20px_rgba(0,243,255,0.5)]">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>

              <span className="text-[10px] font-orbitron font-bold text-[#00f3ff] uppercase tracking-widest mb-1">
                SYNTHÈSE MOLÉCULAIRE RÉUSSIE !
              </span>

              <h3 className="text-base sm:text-lg font-orbitron font-black text-white uppercase tracking-wider mb-2">
                {forgedResult.name}
              </h3>

              <div className="mb-3">
                <span className={`text-xs font-mono font-bold px-2.5 py-1 border ${getRarityBadgeBg(forgedResult.rarity)}`}>
                  ★ RARETÉ : {forgedResult.rarity.toUpperCase()} ★
                </span>
              </div>

              {/* Stats Card */}
              <div className="w-full bg-[#11111e] border border-[#ffffff18] p-3 mb-4 text-left font-mono">
                <div className="flex justify-between text-xs text-gray-400 mb-1 border-b border-[#ffffff11] pb-1">
                  <span>Slot : <strong className="text-white uppercase">{forgedResult.slot}</strong></span>
                  <span>Niveau Requis : <strong className="text-white">N.{forgedResult.levelReq}</strong></span>
                </div>

                <div className="bg-[#06060c] p-2 border border-[#ffffff11] my-2">
                  <span className="text-[10px] text-gray-400 block">{forgedResult.baseStat.name}</span>
                  <span className="text-base font-black text-[#00f3ff] font-orbitron">
                    +{forgedResult.baseStat.value}
                  </span>
                </div>

                {forgedResult.affixes.length > 0 && (
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-[9px] font-orbitron font-bold text-gray-400 uppercase">
                      Affixes Roulés :
                    </span>
                    {forgedResult.affixes.map((aff, idx) => (
                      <div key={idx} className="text-[10px] flex justify-between bg-black/40 px-2 py-0.5">
                        <span className="text-[#00ff41]">+{aff.value}</span>
                        <span className="text-gray-300">{aff.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {forgedResult.legendaryPassive && (
                  <div className="mt-2 p-2 bg-[#f2994a15] border border-[#f2994a44]">
                    <div className="text-[11px] font-orbitron font-bold text-[#f2994a] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {forgedResult.legendaryPassive.name}
                    </div>
                    <div className="text-[9px] text-gray-300 font-sans mt-0.5">
                      {forgedResult.legendaryPassive.description}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                {onEquipItem && (
                  <button
                    onClick={() => {
                      onEquipItem(forgedResult);
                      setForgedResult(null);
                    }}
                    className="flex-1 py-2.5 bg-[#00f3ff] hover:bg-[#00f3ff]/80 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                  >
                    ÉQUIPER IMMÉDIATEMENT
                  </button>
                )}
                <button
                  onClick={() => setForgedResult(null)}
                  className="flex-1 py-2.5 bg-[#181824] hover:bg-white text-gray-200 hover:text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all border border-[#ffffff22]"
                >
                  GARDER & CONTINUER
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
