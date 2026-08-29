import React, { useState } from 'react';
import { 
  EquipmentItem, 
  StoredAspect, 
  NeuralModule, 
  ItemRarity, 
  ItemAffix 
} from '../types';
import { NEURAL_MODULES_CATALOG } from '../utils/lootGenerator';
import { 
  Sparkles, 
  Layers, 
  RefreshCw, 
  Cpu, 
  X, 
  ShieldAlert, 
  Zap, 
  Check, 
  ArrowRight, 
  Sword, 
  Shield, 
  Activity, 
  Crosshair 
} from 'lucide-react';

interface NeuralArchitectModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: EquipmentItem[];
  equipped: { [key: string]: EquipmentItem | undefined };
  nanites: number;
  storedAspects: StoredAspect[];
  neuralModules: NeuralModule[];
  onExtractAspect: (item: EquipmentItem, cost: number) => void;
  onImprintAspect: (item: EquipmentItem, aspect: StoredAspect, cost: number) => void;
  onRerollAffix: (item: EquipmentItem, affixIndex: number, cost: number) => void;
  onSocketModule: (item: EquipmentItem, socketIndex: number, module: NeuralModule) => void;
  onUnsocketModule: (item: EquipmentItem, socketIndex: number) => void;
}

export const NeuralArchitectModal: React.FC<NeuralArchitectModalProps> = ({
  isOpen,
  onClose,
  inventory,
  equipped,
  nanites,
  storedAspects,
  neuralModules,
  onExtractAspect,
  onImprintAspect,
  onRerollAffix,
  onSocketModule,
  onUnsocketModule
}) => {
  const [activeTab, setActiveTab] = useState<'extract' | 'imprint' | 'reroll' | 'sockets'>('extract');
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [selectedAspect, setSelectedAspect] = useState<StoredAspect | null>(null);
  const [selectedAffixIdx, setSelectedAffixIdx] = useState<number | null>(null);
  const [selectedSocketIdx, setSelectedSocketIdx] = useState<number | null>(null);
  const [selectedModule, setSelectedModule] = useState<NeuralModule | null>(null);

  if (!isOpen) return null;

  const extractCost = 350;
  const imprintCost = 500;
  const rerollCost = 250;

  const allItems = [...inventory];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-[#0b0f19] border border-[#a855f7]/40 shadow-[0_0_60px_rgba(168,85,247,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-gray-200">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#a855f7]/30 bg-[#121829]/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#a855f7]/20 border border-[#a855f7]">
              <Sparkles className="w-5 h-5 text-[#c084fc]" />
            </div>
            <div>
              <h2 className="text-lg font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] via-white to-[#00f3ff] uppercase tracking-wider">
                ARCHITECTE NEURAL // OCCULTISTE 2033
              </h2>
              <p className="text-[10px] font-mono text-[#a855f7] tracking-widest uppercase">
                Extraction & Imprégnation d'Aspects • Ré-encodage d'Affixes • Châsses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-black/60 border border-[#00f3ff]/40 font-mono text-xs text-[#00f3ff]">
              <Zap className="w-3.5 h-3.5 text-[#00f3ff]" />
              <span>{nanites} NANITES</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 border-b border-[#a855f7]/20 bg-[#0e1424] text-xs font-orbitron">
          <button
            onClick={() => { setActiveTab('extract'); setSelectedItem(null); }}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'extract'
                ? 'border-[#a855f7] text-[#c084fc] bg-[#a855f7]/10 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            1. EXTRAIRE ASPECT
          </button>
          <button
            onClick={() => { setActiveTab('imprint'); setSelectedItem(null); setSelectedAspect(null); }}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'imprint'
                ? 'border-[#00f3ff] text-[#00f3ff] bg-[#00f3ff]/10 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            2. IMPRÉGNER ASPECT
          </button>
          <button
            onClick={() => { setActiveTab('reroll'); setSelectedItem(null); setSelectedAffixIdx(null); }}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'reroll'
                ? 'border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/10 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            3. RÉ-ENCODER (ENCHANT)
          </button>
          <button
            onClick={() => { setActiveTab('sockets'); setSelectedItem(null); setSelectedSocketIdx(null); }}
            className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'sockets'
                ? 'border-[#10b981] text-[#10b981] bg-[#10b981]/10 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            4. CHÂSSES & MODULES
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          
          {/* Left Column: Item Selection */}
          <div className="bg-[#121829]/60 border border-gray-800 p-4 flex flex-col">
            <h3 className="text-xs font-orbitron font-bold text-gray-300 mb-3 flex items-center justify-between">
              <span>SÉLECTIONNER UN ÉQUIPEMENT</span>
              <span className="text-[10px] text-gray-400 font-mono">({allItems.length} OBJETS)</span>
            </h3>

            <div className="grid grid-cols-4 gap-2 flex-1 overflow-y-auto max-h-[360px] pr-1">
              {allItems.map(item => {
                const isSelected = selectedItem?.id === item.id;
                const canSelect = 
                  activeTab === 'extract' ? item.rarity === 'legendary' && !!item.legendaryPassive :
                  activeTab === 'imprint' ? (item.rarity === 'rare' || item.rarity === 'epic' || item.rarity === 'legendary') :
                  activeTab === 'reroll' ? item.affixes.length > 0 :
                  true;

                return (
                  <button
                    key={item.id}
                    disabled={!canSelect}
                    onClick={() => setSelectedItem(item)}
                    className={`p-2 rounded border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#00f3ff] bg-[#00f3ff]/20 shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                        : canSelect
                          ? 'border-gray-800 bg-[#162035] hover:border-gray-600'
                          : 'border-gray-900 bg-gray-950/40 opacity-30 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-gray-200 truncate w-full">
                      {item.name}
                    </div>
                    <div className={`text-[9px] font-mono uppercase mt-1 ${
                      item.rarity === 'legendary' ? 'text-[#f59e0b]' :
                      item.rarity === 'epic' ? 'text-[#c084fc]' :
                      item.rarity === 'rare' ? 'text-[#38bdf8]' : 'text-gray-400'
                    }`}>
                      {item.rarity}
                    </div>
                    {item.itemPower && (
                      <div className="text-[8px] font-mono text-cyan-400">
                        ⚡ {item.itemPower} IP
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedItem && (
              <div className="mt-4 p-3 bg-black/40 border border-gray-700 rounded text-xs">
                <div className="flex justify-between font-bold text-gray-200">
                  <span>{selectedItem.name}</span>
                  <span className="text-cyan-400">Puissance {selectedItem.itemPower || 100}</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-1">
                  {selectedItem.baseStat.name}: +{selectedItem.baseStat.value}
                </div>
                {selectedItem.legendaryPassive && (
                  <div className="mt-2 text-[10px] text-[#f59e0b] bg-[#f59e0b]/10 p-1.5 border border-[#f59e0b]/30">
                    <span className="font-bold">⭐ {selectedItem.legendaryPassive.name}: </span>
                    {selectedItem.legendaryPassive.description}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Action Execution */}
          <div className="bg-[#121829]/60 border border-gray-800 p-4 flex flex-col justify-between">
            
            {/* TAB 1: EXTRACTION */}
            {activeTab === 'extract' && (
              <div className="space-y-4">
                <h3 className="text-xs font-orbitron font-bold text-[#c084fc]">
                  EXTRAIRE LE PASSIF LÉGENDAIRE
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  Détruit l'objet légendaire sélectionné pour stocker son <strong className="text-white">Aspect Légendaire</strong> dans votre codex permanent. Cet Aspect pourra ensuite être gravé sur n'importe quel objet Rare.
                </p>

                {selectedItem?.legendaryPassive ? (
                  <div className="p-4 bg-[#a855f7]/10 border border-[#a855f7] rounded-lg">
                    <div className="text-xs font-bold text-[#c084fc] flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Aspect à Extraire : {selectedItem.legendaryPassive.name}
                    </div>
                    <div className="text-xs text-gray-300 mt-2">
                      {selectedItem.legendaryPassive.description}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs font-mono">
                      <span className="text-red-400 font-bold">⚠️ L'objet sera consommé</span>
                      <span className="text-cyan-400">Coût: {extractCost} Nanites</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-gray-700 text-center text-xs text-gray-500 font-mono">
                    Sélectionnez un équipement légendaire à gauche pour extraire son pouvoir.
                  </div>
                )}

                <button
                  disabled={!selectedItem?.legendaryPassive || nanites < extractCost}
                  onClick={() => {
                    if (selectedItem) {
                      onExtractAspect(selectedItem, extractCost);
                      setSelectedItem(null);
                    }
                  }}
                  className={`w-full py-3 font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedItem?.legendaryPassive && nanites >= extractCost
                      ? 'bg-[#a855f7] hover:bg-[#a855f7]/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  EXTRAIRE L'ASPECT DANS LE CODEX ({extractCost} NANITES)
                </button>
              </div>
            )}

            {/* TAB 2: IMPRINTING */}
            {activeTab === 'imprint' && (
              <div className="space-y-4">
                <h3 className="text-xs font-orbitron font-bold text-[#00f3ff]">
                  IMPRÉGNER UN ASPECT DU CODEX
                </h3>
                
                {storedAspects.length === 0 ? (
                  <div className="p-6 border border-dashed border-gray-700 text-center text-xs text-gray-400 font-mono">
                    Aucun Aspect dans le codex. Extrayez d'abord un légendaire dans l'onglet 1 !
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    <div className="text-[10px] font-mono text-gray-400 uppercase">Aspects Disponibles :</div>
                    {storedAspects.map(asp => (
                      <div
                        key={asp.id}
                        onClick={() => setSelectedAspect(asp)}
                        className={`p-2.5 rounded border text-xs cursor-pointer transition-all ${
                          selectedAspect?.id === asp.id
                            ? 'border-[#00f3ff] bg-[#00f3ff]/20 text-white'
                            : 'border-gray-800 bg-black/40 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <div className="font-bold text-[#f59e0b]">⭐ {asp.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{asp.description}</div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  disabled={!selectedItem || !selectedAspect || nanites < imprintCost}
                  onClick={() => {
                    if (selectedItem && selectedAspect) {
                      onImprintAspect(selectedItem, selectedAspect, imprintCost);
                      setSelectedItem(null);
                      setSelectedAspect(null);
                    }
                  }}
                  className={`w-full py-3 font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedItem && selectedAspect && nanites >= imprintCost
                      ? 'bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black shadow-[0_0_20px_rgba(0,243,255,0.5)]'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  IMPRÉGNER L'ASPECT ({imprintCost} NANITES)
                </button>
              </div>
            )}

            {/* TAB 3: REROLL AFFIX (ENCHANTING) */}
            {activeTab === 'reroll' && (
              <div className="space-y-4">
                <h3 className="text-xs font-orbitron font-bold text-[#f59e0b]">
                  RÉ-ENCODER UN AFFIXE (ENCHANTEMENT)
                </h3>
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  Choisissez un affixe indésirable sur l'objet sélectionné pour le relancer aléatoirement.
                </p>

                {selectedItem ? (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-gray-400 uppercase">Affixes de l'objet :</div>
                    {selectedItem.affixes.map((aff, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedAffixIdx(idx)}
                        className={`p-2.5 rounded border text-xs cursor-pointer flex justify-between items-center transition-all ${
                          selectedAffixIdx === idx
                            ? 'border-[#f59e0b] bg-[#f59e0b]/20 text-white font-bold'
                            : 'border-gray-800 bg-black/40 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <span>{aff.name} ({aff.stat})</span>
                        <span className="font-mono text-cyan-400">+{aff.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-gray-700 text-center text-xs text-gray-500 font-mono">
                    Sélectionnez un objet à gauche pour modifier ses affixes.
                  </div>
                )}

                <button
                  disabled={!selectedItem || selectedAffixIdx === null || nanites < rerollCost}
                  onClick={() => {
                    if (selectedItem && selectedAffixIdx !== null) {
                      onRerollAffix(selectedItem, selectedAffixIdx, rerollCost);
                      setSelectedAffixIdx(null);
                    }
                  }}
                  className={`w-full py-3 font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedItem && selectedAffixIdx !== null && nanites >= rerollCost
                      ? 'bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  RELANCER L'AFFIXE ({rerollCost} NANITES)
                </button>
              </div>
            )}

            {/* TAB 4: SOCKETS & MODULES */}
            {activeTab === 'sockets' && (
              <div className="space-y-4">
                <h3 className="text-xs font-orbitron font-bold text-[#10b981]">
                  CHÂSSES & MODULES NEURAUX (GEMMES)
                </h3>

                {selectedItem ? (
                  <div className="space-y-3">
                    <div className="text-[10px] font-mono text-gray-400 uppercase">
                      Châsses de l'objet ({selectedItem.sockets?.length || 0} disponibles) :
                    </div>
                    {(!selectedItem.sockets || selectedItem.sockets.length === 0) ? (
                      <div className="p-4 border border-dashed border-gray-700 text-center text-xs text-gray-500 font-mono">
                        Cet objet ne possède aucune châsse libre.
                      </div>
                    ) : (
                      selectedItem.sockets.map((sock, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3 border border-gray-700 bg-black/40 rounded flex items-center justify-between text-xs"
                        >
                          {sock ? (
                            <div className="flex items-center gap-2">
                              <Cpu className="w-4 h-4 text-emerald-400" />
                              <span className="text-white font-bold">{sock.name}</span>
                              <span className="text-emerald-400 font-mono">(+{sock.value} {sock.stat})</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 font-mono">[ Emplacement de Module Vide ]</span>
                          )}

                          {sock ? (
                            <button
                              onClick={() => onUnsocketModule(selectedItem, sIdx)}
                              className="px-2 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 text-[10px] rounded cursor-pointer"
                            >
                              Retirer
                            </button>
                          ) : (
                            <button
                              disabled={!selectedModule}
                              onClick={() => {
                                if (selectedModule) {
                                  onSocketModule(selectedItem, sIdx, selectedModule);
                                  setSelectedModule(null);
                                }
                              }}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer ${
                                selectedModule
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Insérer Module
                            </button>
                          )}
                        </div>
                      ))
                    )}

                    <div className="text-[10px] font-mono text-gray-400 uppercase mt-2">Modules Neuraux Disponibles :</div>
                    <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto">
                      {NEURAL_MODULES_CATALOG.map(mod => (
                        <div
                          key={mod.id}
                          onClick={() => setSelectedModule(mod)}
                          className={`p-2 border rounded text-[10px] cursor-pointer transition-all ${
                            selectedModule?.id === mod.id
                              ? 'border-emerald-400 bg-emerald-950/40 text-white'
                              : 'border-gray-800 bg-black/30 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <div className="font-bold text-gray-200">{mod.name}</div>
                          <div className="text-emerald-400 font-mono">+{mod.value} {mod.stat}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-gray-700 text-center text-xs text-gray-500 font-mono">
                    Sélectionnez un équipement à gauche pour insérer des modules.
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
