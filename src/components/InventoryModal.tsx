import React, { useState } from 'react';
import { EquipmentItem, ItemSlot, ItemRarity } from '../types';
import { 
  X, 
  Sparkles, 
  Trash2, 
  ArrowUpRight, 
  Shield, 
  Zap, 
  Cpu, 
  Activity, 
  Sword,
  Info,
  HelpCircle
} from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: EquipmentItem[];
  equipped: { [key in ItemSlot]?: EquipmentItem };
  nanites: number;
  onEquipItem: (item: EquipmentItem) => void;
  onUnequipItem: (slot: ItemSlot) => void;
  onScrapItem: (item: EquipmentItem) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  equipped,
  nanites,
  onEquipItem,
  onUnequipItem,
  onScrapItem
}) => {
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);

  if (!isOpen) return null;

  const getRarityColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'legendary': return 'text-[#f2994a] border-[#f2994a] bg-[#222] border-l-2';
      case 'epic': return 'text-[#ff00ff] border-[#ff00ff] bg-[#222] border-l-2';
      case 'rare': return 'text-[#00f3ff] border-[#00f3ff] bg-[#222] border-l-2';
      default: return 'text-gray-300 border-[#ffffff22] bg-[#11111a] border-l-2';
    }
  };

  const getRarityGlow = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'legendary': return 'shadow-[0_0_15px_rgba(242,153,74,0.3)]';
      case 'epic': return 'shadow-[0_0_15px_rgba(255,0,255,0.3)]';
      case 'rare': return 'shadow-[0_0_15px_rgba(0,243,255,0.3)]';
      default: return '';
    }
  };

  const getSlotIcon = (slot: ItemSlot) => {
    switch (slot) {
      case 'weapon': return <Sword className="w-5 h-5" />;
      case 'deck': return <Cpu className="w-5 h-5" />;
      case 'armor': return <Shield className="w-5 h-5" />;
      case 'chip': return <Zap className="w-5 h-5" />;
      case 'boots': return <Activity className="w-5 h-5" />;
    }
  };

  const getSlotLabel = (slot: ItemSlot) => {
    switch (slot) {
      case 'weapon': return 'Arme Cyber / Lame';
      case 'deck': return 'Deck Neural Cyberdeck';
      case 'armor': return 'Veste Tactique Exo';
      case 'chip': return 'Puce Synaptique';
      case 'boots': return 'Bottes à Propulsion';
    }
  };

  const slotsOrder: ItemSlot[] = ['weapon', 'deck', 'armor', 'chip', 'boots'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-chakra select-none text-[#c0c0c0]">
      <div className="bg-[#050506] border border-[#00f3ff44] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[0_0_60px_rgba(0,243,255,0.15)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00ff41]" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#00f3ff33] bg-[#11111a]">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-[#00f3ff]" />
            <div>
              <h2 className="text-base sm:text-lg font-orbitron font-bold text-white tracking-wider uppercase italic">
                GESTIONNAIRE D'ÉQUIPEMENT // CYBER-INVENTAIRE
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                Montréal 2033 // Configuration des implants et matrice de combat
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#222] border border-[#f2994a] px-3 py-1 text-[#f2994a] font-orbitron font-bold text-xs">
              <Sparkles className="w-4 h-4 text-[#f2994a]" />
              <span>{nanites.toLocaleString()} Nanites</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-cyber-radial">
          
          {/* Left Column: 5 Equipped Slots */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h3 className="text-xs font-orbitron font-bold text-[#00f3ff] tracking-wider flex items-center gap-2 uppercase">
              <Shield className="w-4 h-4" />
              Implants Actifs
            </h3>

            <div className="flex flex-col gap-2.5">
              {slotsOrder.map((slot) => {
                const item = equipped[slot];
                return (
                  <div
                    key={slot}
                    onClick={() => item && setSelectedItem(item)}
                    className={`p-3 border transition-all cursor-pointer ${
                      item 
                        ? `${getRarityColor(item.rarity)} ${getRarityGlow(item.rarity)} hover:border-white` 
                        : 'border border-dashed border-[#ffffff22] bg-[#11111a]/40 text-gray-500 hover:border-gray-500'
                    } ${selectedItem?.id === item?.id ? 'ring-2 ring-[#00f3ff]' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${item ? 'bg-[#050506]' : 'bg-[#11111a]'}`}>
                          {getSlotIcon(slot)}
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">
                            {getSlotLabel(slot)}
                          </div>
                          <div className="text-xs sm:text-sm font-bold truncate max-w-[170px] text-white font-orbitron">
                            {item ? item.name : 'Emplacement Libre'}
                          </div>
                        </div>
                      </div>

                      {item && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnequipItem(slot);
                            if (selectedItem?.id === item.id) setSelectedItem(null);
                          }}
                          className="px-2 py-1 text-[9px] bg-[#ff0044]/20 hover:bg-[#ff0044] border border-[#ff0044] text-[#ff0044] hover:text-white font-orbitron transition-all"
                        >
                          Déséquiper
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Middle Column: Inventory Grid (24 slots) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-orbitron font-bold text-[#f2994a] tracking-wider flex items-center gap-2 uppercase">
                <Cpu className="w-4 h-4" />
                Matrice de Stockage ({inventory.length} / 24)
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">
                Inspecter // Équiper
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 bg-[#11111a] border border-[#ffffff11] min-h-[280px]">
              {Array.from({ length: 24 }).map((_, index) => {
                const item = inventory[index];
                if (!item) {
                  return (
                    <div 
                      key={index}
                      className="aspect-square border border-dashed border-[#ffffff11] bg-[#050506]/60 flex items-center justify-center text-gray-700"
                    >
                      <span className="text-[10px] font-mono">{index + 1}</span>
                    </div>
                  );
                }

                const isSelected = selectedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`aspect-square border p-1.5 flex flex-col items-center justify-between cursor-pointer transition-all ${getRarityColor(item.rarity)} ${getRarityGlow(item.rarity)} ${isSelected ? 'ring-2 ring-[#00f3ff] scale-105' : 'hover:scale-105'}`}
                  >
                    <div className="self-end text-[8px] font-orbitron font-bold opacity-80">
                      N.{item.levelReq}
                    </div>
                    <div className="my-auto">
                      {getSlotIcon(item.slot)}
                    </div>
                    <div className="text-[8px] text-center font-bold truncate w-full font-mono">
                      {item.slot.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Item Inspection & Comparison Tooltip */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h3 className="text-xs font-orbitron font-bold text-[#ff00ff] tracking-wider flex items-center gap-2 uppercase">
              <Info className="w-4 h-4" />
              Analyseur Neural
            </h3>

            {selectedItem ? (
              <div className={`p-4 border flex flex-col justify-between flex-1 bg-[#11111a] ${getRarityColor(selectedItem.rarity)} ${getRarityGlow(selectedItem.rarity)}`}>
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-orbitron uppercase tracking-widest text-gray-400 mb-1 font-mono">
                      <span>{selectedItem.slot}</span>
                      <span className="font-bold">{selectedItem.rarity}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white font-orbitron leading-tight">
                      {selectedItem.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Requis : Niveau {selectedItem.levelReq}
                    </span>
                  </div>

                  <div className="w-full h-px bg-[#ffffff11]" />

                  {/* Primary Base Stat */}
                  <div className="bg-[#050506] p-2.5 border border-[#ffffff11]">
                    <span className="text-[10px] text-gray-400 block font-mono">{selectedItem.baseStat.name}</span>
                    <span className="text-base font-black text-[#00f3ff] font-orbitron">
                      +{selectedItem.baseStat.value}
                    </span>
                  </div>

                  {/* Affixes */}
                  {selectedItem.affixes.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-orbitron font-bold text-gray-400 uppercase">
                        Affixes Procéduraux :
                      </span>
                      {selectedItem.affixes.map((aff, i) => (
                        <div key={i} className="text-[11px] text-gray-200 flex items-center justify-between font-mono bg-[#050506]/80 px-2 py-1 border border-[#ffffff0a]">
                          <span className="text-[#00f3ff]">+{aff.value}</span>
                          <span className="text-gray-400 truncate max-w-[130px]">{aff.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Legendary Passive */}
                  {selectedItem.legendaryPassive && (
                    <div className="bg-[#f2994a11] border border-[#f2994a44] p-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#f2994a] font-orbitron">
                        <Sparkles className="w-3.5 h-3.5 text-[#f2994a]" />
                        {selectedItem.legendaryPassive.name}
                      </div>
                      <p className="text-[10px] text-gray-300 mt-1 leading-snug font-sans">
                        {selectedItem.legendaryPassive.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions: Equip or Scrap */}
                <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-[#ffffff11]">
                  <button
                    onClick={() => {
                      onEquipItem(selectedItem);
                    }}
                    className="w-full py-2 bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    ÉQUIPER CET IMPLANT
                  </button>
                  <button
                    onClick={() => {
                      onScrapItem(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="w-full py-1.5 bg-[#222] hover:bg-[#ff0044]/20 border border-[#ffffff22] hover:border-[#ff0044] text-gray-300 hover:text-[#ff0044] font-orbitron text-xs transition-all flex items-center justify-center gap-2 font-mono"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Recycler (+{selectedItem.sellValue} Nanites)
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-[#11111a] border border-dashed border-[#ffffff22] flex flex-col items-center justify-center p-6 text-center text-gray-500">
                <HelpCircle className="w-8 h-8 mb-2 opacity-40 text-[#00f3ff]" />
                <p className="text-xs font-mono">Sélectionnez un équipement pour visualiser ses affixes et passifs légendaires.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
