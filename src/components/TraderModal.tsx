import React from 'react';
import { WorldEvent, EquipmentItem } from '../types';
import { 
  X, 
  ShoppingBag, 
  Sparkles, 
  Sword, 
  Cpu, 
  Shield, 
  Zap, 
  Activity,
  ArrowUpRight
} from 'lucide-react';

interface TraderModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: WorldEvent | null;
  nanites: number;
  onBuyItem: (item: EquipmentItem, cost: number) => void;
}

export const TraderModal: React.FC<TraderModalProps> = ({
  isOpen,
  onClose,
  event,
  nanites,
  onBuyItem
}) => {
  if (!isOpen || !event || event.type !== 'wandering_trader') return null;

  const items = event.traderInventory || [];

  const getSlotIcon = (slot: string) => {
    switch (slot) {
      case 'weapon': return <Sword className="w-5 h-5" />;
      case 'deck': return <Cpu className="w-5 h-5" />;
      case 'armor': return <Shield className="w-5 h-5" />;
      case 'chip': return <Zap className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-[#f2994a] text-[#f2994a] shadow-[0_0_15px_rgba(242,153,74,0.3)]';
      case 'epic': return 'border-[#ff00ff] text-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.3)]';
      default: return 'border-[#00f3ff] text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.3)]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-chakra select-none text-[#c0c0c0]">
      <div className="bg-[#050506] border border-[#f2994a] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_60px_rgba(242,153,74,0.2)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f2994a] via-[#ff00ff] to-[#00f3ff]" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f2994a33] bg-[#11111a]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-[#f2994a]" />
            <div>
              <h2 className="text-base sm:text-lg font-orbitron font-bold text-white tracking-wider uppercase italic">
                {event.title}
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                {event.subtitle} // Temps restant : {Math.max(0, Math.round(event.timeRemaining))}s
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
        <div className="p-6 overflow-y-auto flex flex-col gap-4 bg-cyber-radial">
          <p className="text-xs text-gray-300 font-sans leading-relaxed bg-[#11111a] p-3 border border-[#ffffff11]">
            {event.description} Implants cybernétiques non enregistrés et modules overclockés récupérés sur les cadavres de la mégacorporation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {items.map((item) => {
              const cost = item.sellValue * 3;
              const canAfford = nanites >= cost;

              return (
                <div 
                  key={item.id}
                  className={`bg-[#11111a] p-4 border flex flex-col justify-between ${getRarityStyle(item.rarity)}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase text-gray-400">{item.slot}</span>
                      <span className="text-[10px] font-bold font-orbitron uppercase">{item.rarity}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-[#050506] border border-white/10">
                        {getSlotIcon(item.slot)}
                      </div>
                      <h4 className="text-xs font-bold text-white font-orbitron leading-tight">{item.name}</h4>
                    </div>

                    {/* Stat */}
                    <div className="bg-[#050506] p-2 mb-2 text-xs font-mono text-[#00f3ff] font-bold border border-white/5">
                      +{item.baseStat.value} {item.baseStat.name}
                    </div>

                    {/* Affixes */}
                    {item.affixes.map((aff, i) => (
                      <div key={i} className="text-[10px] text-gray-300 font-mono flex justify-between py-0.5 border-b border-white/5">
                        <span>+{aff.value}</span>
                        <span className="text-gray-400">{aff.name}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => {
                      onBuyItem(item, cost);
                    }}
                    className={`mt-4 w-full py-2 font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      canAfford 
                        ? 'bg-[#f2994a] hover:bg-[#f2994a]/90 text-black shadow-[0_0_15px_rgba(242,153,74,0.4)]' 
                        : 'bg-[#222] border border-white/10 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Acheter ({cost} Nanites)</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
