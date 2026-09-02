import React, { useState, useMemo } from 'react';
import { 
  EquipmentItem, 
  ItemRarity, 
  ItemSlot, 
  CraftingMaterialId, 
  CraftingSkillState 
} from '../types';
import { forgeEquipmentItem } from '../utils/lootGenerator';
import { 
  CRAFTING_MATERIALS, 
  proceduralCraftEquipment, 
  upgradeEquipmentItem, 
  rerollEquipmentAffixes, 
  calculateCraftingProbabilities, 
  getCraftingSkillTitle 
} from '../utils/craftingData';
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
  AlertCircle,
  Wrench,
  Hammer,
  Award,
  Box,
  ChevronRight,
  Sliders,
  Check
} from 'lucide-react';

interface CyberForgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: EquipmentItem[];
  playerLevel: number;
  difficultyTier: number;
  nanites: number;
  materials: Record<CraftingMaterialId, number>;
  craftingSkill: CraftingSkillState;
  onForgeSuccess: (consumedItemIds: string[], forgedItem: EquipmentItem, naniteCost: number) => void;
  onProceduralCraftSuccess: (
    craftedItem: EquipmentItem, 
    consumedMaterials: Partial<Record<CraftingMaterialId, number>>, 
    naniteCost: number, 
    expGained: number
  ) => void;
  onUpgradeItemSuccess: (
    updatedItem: EquipmentItem, 
    consumedMaterials: Partial<Record<CraftingMaterialId, number>>, 
    naniteCost: number, 
    expGained: number
  ) => void;
  onEquipItem?: (item: EquipmentItem) => void;
}

type ForgeTab = 'procedural' | 'upgrade' | 'materials' | 'fusion';

const NANITE_FORGE_COSTS: Record<ItemRarity, number> = {
  standard: 50,
  rare: 150,
  epic: 400,
  legendary: 800
};

export const CyberForgeModal: React.FC<CyberForgeModalProps> = ({
  isOpen,
  onClose,
  inventory,
  playerLevel,
  difficultyTier,
  nanites,
  materials,
  craftingSkill,
  onForgeSuccess,
  onProceduralCraftSuccess,
  onUpgradeItemSuccess,
  onEquipItem
}) => {
  const [activeTab, setActiveTab] = useState<ForgeTab>('procedural');

  // Procedural Craft State
  const [selectedSlot, setSelectedSlot] = useState<ItemSlot>('weapon');
  const [primaryMaterial, setPrimaryMaterial] = useState<CraftingMaterialId>('scrap_metal');
  const [catalystMaterial, setCatalystMaterial] = useState<CraftingMaterialId | null>('quantum_processor');
  const [useInfuser, setUseInfuser] = useState<boolean>(false);
  const [isCrafting, setIsCrafting] = useState<boolean>(false);
  const [craftProgress, setCraftProgress] = useState<number>(0);
  const [lastCraftedItem, setLastCraftedItem] = useState<EquipmentItem | null>(null);

  // Upgrade Chamber State
  const [selectedUpgradeItemId, setSelectedUpgradeItemId] = useState<string | null>(null);
  const [upgradeMode, setUpgradeMode] = useState<'overclock' | 'reroll' | 'socket'>('overclock');
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [upgradeSuccessNotice, setUpgradeSuccessNotice] = useState<string | null>(null);

  // Classic Fusion Chamber State
  const [selectedFusionItemIds, setSelectedFusionItemIds] = useState<string[]>([]);
  const [filterRarity, setFilterRarity] = useState<ItemRarity | 'all'>('all');
  const [isFusionActive, setIsFusionActive] = useState<boolean>(false);
  const [fusionProgress, setFusionProgress] = useState<number>(0);
  const [fusionResult, setFusionResult] = useState<EquipmentItem | null>(null);

  if (!isOpen) return null;

  // ══════════════════════════════════════════════════════════════════
  // PROCEDURAL CRAFTING COMPUTATIONS
  // ══════════════════════════════════════════════════════════════════
  const primaryCost = primaryMaterial === 'scrap_metal' ? 10 : 3;
  const catalystCost = catalystMaterial ? 2 : 0;
  const infuserCost = useInfuser ? 1 : 0;
  const proceduralNaniteCost = 80 + craftingSkill.level * 20 + (useInfuser ? 300 : 0);

  const hasPrimaryMat = (materials[primaryMaterial] || 0) >= primaryCost;
  const hasCatalystMat = !catalystMaterial || (materials[catalystMaterial] || 0) >= catalystCost;
  const hasInfuserMat = !useInfuser || (materials.darknet_firmware || 0) >= infuserCost;
  const hasEnoughCraftNanites = nanites >= proceduralNaniteCost;

  const canCraftProcedural = hasPrimaryMat && hasCatalystMat && hasInfuserMat && hasEnoughCraftNanites && !isCrafting;

  const probabilities = calculateCraftingProbabilities(
    primaryMaterial,
    catalystMaterial,
    useInfuser,
    craftingSkill.level
  );

  const handleExecuteProceduralCraft = () => {
    if (!canCraftProcedural) return;

    setIsCrafting(true);
    setCraftProgress(0);
    sound.playCyberForgeCharge();

    const startTime = Date.now();
    const duration = 1400;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setCraftProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        try {
          const { item, wasCritical, expGained } = proceduralCraftEquipment({
            slot: selectedSlot,
            primaryMat: primaryMaterial,
            catalystMat: catalystMaterial,
            useInfuser,
            craftingSkillLevel: craftingSkill.level,
            playerLevel,
            difficultyTier
          });

          const consumed: Partial<Record<CraftingMaterialId, number>> = {
            [primaryMaterial]: primaryCost
          };
          if (catalystMaterial) {
            consumed[catalystMaterial] = (consumed[catalystMaterial] || 0) + catalystCost;
          }
          if (useInfuser) {
            consumed.darknet_firmware = (consumed.darknet_firmware || 0) + 1;
          }

          sound.playCyberForgeSuccess();
          setLastCraftedItem(item);
          onProceduralCraftSuccess(item, consumed, proceduralNaniteCost, expGained);
        } catch (err) {
          console.error('Erreur craft procédural:', err);
        } finally {
          setIsCrafting(false);
          setCraftProgress(0);
        }
      }
    }, 40);
  };

  // ══════════════════════════════════════════════════════════════════
  // UPGRADE CHAMBER COMPUTATIONS
  // ══════════════════════════════════════════════════════════════════
  const selectedUpgradeItem = inventory.find(i => i.id === selectedUpgradeItemId);
  const currentUpgradeLevel = selectedUpgradeItem?.upgradeLevel || 0;
  const canOverclock = currentUpgradeLevel < 10;

  const overclockScrapCost = 5 + currentUpgradeLevel * 3;
  const overclockProcessorCost = currentUpgradeLevel >= 4 ? Math.floor(currentUpgradeLevel / 2) : 0;
  const overclockNaniteCost = 100 + currentUpgradeLevel * 75;

  const hasOverclockScrap = (materials.scrap_metal || 0) >= overclockScrapCost;
  const hasOverclockProc = overclockProcessorCost === 0 || (materials.quantum_processor || 0) >= overclockProcessorCost;
  const hasOverclockNanites = nanites >= overclockNaniteCost;
  const canPerformOverclock = selectedUpgradeItem && canOverclock && hasOverclockScrap && hasOverclockProc && hasOverclockNanites && !isUpgrading;

  const rerollFilamentCost = 2;
  const rerollNaniteCost = 250;
  const hasRerollFilament = (materials.neural_filament || 0) >= rerollFilamentCost;
  const hasRerollNanites = nanites >= rerollNaniteCost;
  const canPerformReroll = selectedUpgradeItem && hasRerollFilament && hasRerollNanites && !isUpgrading;

  const handleExecuteOverclock = () => {
    if (!canPerformOverclock || !selectedUpgradeItem) return;

    setIsUpgrading(true);
    sound.playItemSlot();

    setTimeout(() => {
      const { upgradedItem, statGain } = upgradeEquipmentItem(selectedUpgradeItem);
      const consumed: Partial<Record<CraftingMaterialId, number>> = {
        scrap_metal: overclockScrapCost
      };
      if (overclockProcessorCost > 0) {
        consumed.quantum_processor = overclockProcessorCost;
      }

      sound.playLevelUp();
      setUpgradeSuccessNotice(`Overclock réussi : ${upgradedItem.name} (+${statGain} ${upgradedItem.baseStat.name})`);
      onUpgradeItemSuccess(upgradedItem, consumed, overclockNaniteCost, 45);
      setIsUpgrading(false);
    }, 600);
  };

  const handleExecuteReroll = () => {
    if (!canPerformReroll || !selectedUpgradeItem) return;

    setIsUpgrading(true);
    sound.playItemSlot();

    setTimeout(() => {
      const rerolled = rerollEquipmentAffixes(selectedUpgradeItem, craftingSkill.level);
      const consumed: Partial<Record<CraftingMaterialId, number>> = {
        neural_filament: rerollFilamentCost
      };

      sound.playLevelUp();
      setUpgradeSuccessNotice(`Matrice d'affixes recalculée avec succès sur ${rerolled.name}`);
      onUpgradeItemSuccess(rerolled, consumed, rerollNaniteCost, 35);
      setIsUpgrading(false);
    }, 600);
  };

  // ══════════════════════════════════════════════════════════════════
  // FUSION CHAMBER (3 ITEMS) COMPUTATIONS
  // ══════════════════════════════════════════════════════════════════
  const selectedFusionItems: EquipmentItem[] = useMemo(() => {
    return selectedFusionItemIds
      .map(id => inventory.find(item => item.id === id))
      .filter((item): item is EquipmentItem => item !== undefined);
  }, [selectedFusionItemIds, inventory]);

  const fusionChamberRarity = selectedFusionItems.length > 0 ? selectedFusionItems[0].rarity : null;
  const isFusionConsistent = selectedFusionItems.length > 0 && selectedFusionItems.every(it => it.rarity === fusionChamberRarity);
  const isReadyToFuse = selectedFusionItems.length === 3 && isFusionConsistent;
  const requiredFusionNanites = fusionChamberRarity ? NANITE_FORGE_COSTS[fusionChamberRarity] : 0;
  const hasEnoughFusionNanites = nanites >= requiredFusionNanites;

  const handleSelectFusionItem = (item: EquipmentItem) => {
    sound.playItemSlot();
    if (selectedFusionItemIds.includes(item.id)) {
      setSelectedFusionItemIds(prev => prev.filter(id => id !== item.id));
      return;
    }
    if (selectedFusionItemIds.length >= 3) return;
    if (selectedFusionItems.length > 0 && selectedFusionItems[0].rarity !== item.rarity) {
      setSelectedFusionItemIds([item.id]);
      return;
    }
    setSelectedFusionItemIds(prev => [...prev, item.id]);
  };

  const handleExecuteFusion = () => {
    if (!isReadyToFuse || !hasEnoughFusionNanites || isFusionActive) return;

    setIsFusionActive(true);
    setFusionProgress(0);
    sound.playCyberForgeCharge();

    const startTime = Date.now();
    const duration = 1200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setFusionProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        try {
          const forged = forgeEquipmentItem(selectedFusionItems, playerLevel, difficultyTier);
          sound.playCyberForgeSuccess();
          setFusionResult(forged);
          onForgeSuccess(selectedFusionItemIds, forged, requiredFusionNanites);
          setSelectedFusionItemIds([]);
        } catch (e) {
          console.error(e);
        } finally {
          setIsFusionActive(false);
          setFusionProgress(0);
        }
      }
    }, 40);
  };

  const getRarityBadge = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'legendary': return 'text-[#f2994a] border-[#f2994a] bg-[#1a110a]';
      case 'epic': return 'text-[#ff00ff] border-[#ff00ff] bg-[#1a0a1a]';
      case 'rare': return 'text-[#00f3ff] border-[#00f3ff] bg-[#0a1520]';
      default: return 'text-gray-300 border-[#ffffff22] bg-[#11111a]';
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

  const skillInfo = getCraftingSkillTitle(craftingSkill.level);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md font-chakra select-none text-[#c0c0c0]">
      <div className="bg-[#07070c] border border-[#ff005544] w-full max-w-5xl max-h-[94vh] flex flex-col shadow-[0_0_60px_rgba(255,0,85,0.2)] overflow-hidden relative">
        
        {/* Glowing Top Energy Header Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff0055] via-[#f2994a] to-[#00f3ff]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#ff005533] bg-[#101018]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff005522] border border-[#ff0055] text-[#ff0055] shadow-[0_0_15px_rgba(255,0,85,0.3)]">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-orbitron font-bold text-white tracking-wider uppercase italic">
                  CYBER-FORGE MOLÉCULAIRE // FABRICATION & OVERCLOCK
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#ff005522] border border-[#ff0055] text-[#ff0055] font-bold">
                  v3.4
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono">
                Artisanat procédural, combinaisons de matériaux et amélioration d'implants de combat
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-[#0c0c14] border-b border-[#ffffff11] overflow-x-auto">
          <button
            onClick={() => { sound.playUiClick(); setActiveTab('procedural'); }}
            className={`px-4 py-2 text-xs font-orbitron font-bold uppercase transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'procedural'
                ? 'bg-[#ff0055] text-white shadow-[0_0_15px_rgba(255,0,85,0.4)]'
                : 'text-gray-400 hover:text-white bg-[#151522] hover:bg-[#202030]'
            }`}
          >
            <Hammer className="w-4 h-4" />
            <span>Forge Procédurale (Création)</span>
          </button>

          <button
            onClick={() => { sound.playUiClick(); setActiveTab('upgrade'); }}
            className={`px-4 py-2 text-xs font-orbitron font-bold uppercase transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'upgrade'
                ? 'bg-[#00f3ff] text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                : 'text-gray-400 hover:text-white bg-[#151522] hover:bg-[#202030]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Amélioration & Overclock</span>
          </button>

          <button
            onClick={() => { sound.playUiClick(); setActiveTab('materials'); }}
            className={`px-4 py-2 text-xs font-orbitron font-bold uppercase transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'materials'
                ? 'bg-[#f2994a] text-black shadow-[0_0_15px_rgba(242,153,74,0.4)]'
                : 'text-gray-400 hover:text-white bg-[#151522] hover:bg-[#202030]'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>Stock Matériaux & Savoir-Faire</span>
          </button>

          <button
            onClick={() => { sound.playUiClick(); setActiveTab('fusion'); }}
            className={`px-4 py-2 text-xs font-orbitron font-bold uppercase transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'fusion'
                ? 'bg-[#ff00ff] text-white shadow-[0_0_15px_rgba(255,0,255,0.4)]'
                : 'text-gray-400 hover:text-white bg-[#151522] hover:bg-[#202030]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Fusion Moléculaire (3 Items)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-cyber-radial">

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: FORGE PROCÉDURALE (CRÉATION DE NOUVEAUX ITEMS) */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'procedural' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* LEFT 7 COLS: CONFIGURATION DU PROTOCOLE DE FORGE */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                
                {/* 1. Sélection de l'Emplacement d'Équipement */}
                <div className="bg-[#101018] border border-[#ffffff11] p-4">
                  <span className="text-[11px] font-orbitron font-bold text-gray-300 uppercase block mb-2.5 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-[#ff0055]" />
                    Étape 1 : Choisissez le type d'équipement à forger
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {(['weapon', 'deck', 'armor', 'chip', 'boots'] as ItemSlot[]).map((slot) => (
                      <button
                        key={slot}
                        onClick={() => { sound.playUiClick(); setSelectedSlot(slot); }}
                        className={`p-2.5 border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          selectedSlot === slot
                            ? 'bg-[#ff005522] border-[#ff0055] text-white shadow-[0_0_15px_rgba(255,0,85,0.3)]'
                            : 'bg-[#181824] border-[#ffffff11] text-gray-400 hover:border-[#ffffff33] hover:text-gray-200'
                        }`}
                      >
                        {getSlotIcon(slot)}
                        <span className="text-[10px] font-orbitron font-bold uppercase">
                          {slot === 'weapon' ? 'Arme' : slot === 'deck' ? 'Deck' : slot === 'armor' ? 'Blindage' : slot === 'chip' ? 'Puce' : 'Bottes'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Sélection du Matériau Principal (Châssis) */}
                <div className="bg-[#101018] border border-[#ffffff11] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-orbitron font-bold text-gray-300 uppercase flex items-center gap-2">
                      <Box className="w-3.5 h-3.5 text-[#00f3ff]" />
                      Étape 2 : Châssis Principal (Détermine la puissance de base)
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      Coût : {primaryCost} unités
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(['scrap_metal', 'titanium_alloy', 'quantum_processor'] as CraftingMaterialId[]).map((matId) => {
                      const mat = CRAFTING_MATERIALS[matId];
                      const stock = materials[matId] || 0;
                      const hasStock = stock >= primaryCost;
                      const isSelected = primaryMaterial === matId;

                      return (
                        <button
                          key={matId}
                          onClick={() => { sound.playItemSlot(); setPrimaryMaterial(matId); }}
                          className={`p-2.5 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#00f3ff] bg-[#00f3ff11] shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                              : 'border-[#ffffff11] bg-[#181824] hover:border-[#ffffff33]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold font-orbitron text-white">{mat.nameFr}</span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${
                              hasStock ? 'text-green-400 border-green-500/40 bg-green-500/10' : 'text-red-400 border-red-500/40 bg-red-500/10'
                            }`}>
                              {stock} dispo
                            </span>
                          </div>
                          <p className="text-[9px] text-gray-400 font-sans line-clamp-2 leading-tight">
                            {mat.craftEffect}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Sélection du Catalyseur d'Affixes (Secondary) */}
                <div className="bg-[#101018] border border-[#ffffff11] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-orbitron font-bold text-gray-300 uppercase flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#ff00ff]" />
                      Étape 3 : Catalyseur d'Affixes (Oriente les statistiques)
                    </span>
                    <span className="text-[10px] font-mono text-fuchsia-400">
                      Coût : 2 unités
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(['quantum_processor', 'neural_filament', 'titanium_alloy'] as CraftingMaterialId[]).map((matId) => {
                      const mat = CRAFTING_MATERIALS[matId];
                      const stock = materials[matId] || 0;
                      const hasStock = stock >= 2;
                      const isSelected = catalystMaterial === matId;

                      return (
                        <button
                          key={matId}
                          onClick={() => {
                            sound.playItemSlot();
                            setCatalystMaterial(prev => prev === matId ? null : matId);
                          }}
                          className={`p-2.5 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#ff00ff] bg-[#ff00ff11] shadow-[0_0_15px_rgba(255,0,255,0.2)]'
                              : 'border-[#ffffff11] bg-[#181824] hover:border-[#ffffff33]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold font-orbitron text-white">{mat.nameFr}</span>
                            <span className={`text-[9px] font-mono font-bold px-1 py-0.5 border ${
                              hasStock ? 'text-green-400 border-green-500/40' : 'text-red-400 border-red-500/40'
                            }`}>
                              {stock}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#ff00ff] font-mono block">
                            {matId === 'quantum_processor' ? '+Crit / Cooldown' : matId === 'neural_filament' ? '+Psi / Vol de vie' : '+Armure / Santé'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Infuseur Suprême (Darknet Firmware) */}
                <div className="bg-[#181014] border border-[#ff005544] p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-[#ff0055]" />
                    <div>
                      <span className="text-xs font-bold font-orbitron text-white block">
                        Infuseur Suprême : Firmware Crypté Darknet
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Garantit +30% chance Légendaire, affixes maximaux et passif légendaire. (Stock : {materials.darknet_firmware || 0})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sound.playUiClick();
                      setUseInfuser(!useInfuser);
                    }}
                    className={`px-3 py-1.5 font-orbitron font-bold text-xs uppercase border transition-all ${
                      useInfuser
                        ? 'bg-[#ff0055] text-white border-[#ff0055] shadow-[0_0_10px_rgba(255,0,85,0.5)]'
                        : 'bg-[#101018] text-gray-400 border-[#ffffff22] hover:text-white'
                    }`}
                  >
                    {useInfuser ? 'ACTIVÉ (1x)' : 'DÉSACTIVÉ'}
                  </button>
                </div>

              </div>

              {/* RIGHT 5 COLS: PROBABILITY MATRIX & FORGE REACTOR */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                
                {/* Visual Odds Matrix */}
                <div className="bg-[#101018] border border-[#ffffff11] p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-orbitron font-bold text-white uppercase flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#f2994a]" />
                      Matrice Prédictive de Synthèse
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      Niv. Forge {craftingSkill.level}
                    </span>
                  </div>

                  {/* Rarity Probability Bars */}
                  <div className="flex flex-col gap-2 bg-[#08080f] p-3 border border-[#ffffff08]">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-gray-400">Standard</span>
                        <span className="text-gray-300 font-bold">{probabilities.standard}%</span>
                      </div>
                      <div className="w-full bg-[#181824] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gray-400 h-full transition-all duration-300" style={{ width: `${probabilities.standard}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-[#00f3ff]">Rare (Bleu)</span>
                        <span className="text-[#00f3ff] font-bold">{probabilities.rare}%</span>
                      </div>
                      <div className="w-full bg-[#181824] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#00f3ff] h-full transition-all duration-300" style={{ width: `${probabilities.rare}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-[#ff00ff]">Épique (Violet)</span>
                        <span className="text-[#ff00ff] font-bold">{probabilities.epic}%</span>
                      </div>
                      <div className="w-full bg-[#181824] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#ff00ff] h-full transition-all duration-300" style={{ width: `${probabilities.epic}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-[#f2994a]">Légendaire (Orange)</span>
                        <span className="text-[#f2994a] font-bold">{probabilities.legendary}%</span>
                      </div>
                      <div className="w-full bg-[#181824] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#f2994a] h-full transition-all duration-300" style={{ width: `${probabilities.legendary}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Crafting Skill Perk Summary */}
                  <div className="bg-[#00f3ff0a] border border-[#00f3ff22] p-2.5 text-[10px] font-mono text-[#00f3ff]">
                    <div className="font-bold flex items-center gap-1 mb-0.5">
                      <Award className="w-3.5 h-3.5" />
                      Bonus de Rang : {skillInfo.title}
                    </div>
                    <p className="text-gray-300">{skillInfo.perk}</p>
                  </div>

                  {/* Requirements & Cost */}
                  <div className="flex items-center justify-between p-2.5 bg-[#151522] border border-[#ffffff11] text-xs font-mono">
                    <span className="text-gray-400">Coût en Nanites :</span>
                    <span className={`font-bold ${hasEnoughCraftNanites ? 'text-[#f2994a]' : 'text-red-400'}`}>
                      {proceduralNaniteCost} / {nanites.toLocaleString()} N
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    disabled={!canCraftProcedural}
                    onClick={handleExecuteProceduralCraft}
                    className={`w-full py-3.5 font-orbitron font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                      canCraftProcedural
                        ? 'bg-gradient-to-r from-[#ff0055] to-[#f2994a] hover:from-[#ff0055]/90 hover:to-[#f2994a]/90 text-white shadow-[0_0_25px_rgba(255,0,85,0.4)] cursor-pointer'
                        : 'bg-[#222] border border-[#ffffff11] text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isCrafting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>SYNTHÈSE QUANTIQUE EN COURS ({craftProgress}%)</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-5 h-5" />
                        <span>ENGAGER LA FORGE QUANTIQUE</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Last Crafted Item Card */}
                {lastCraftedItem && (
                  <div className={`p-4 border ${getRarityBadge(lastCraftedItem.rarity)} flex flex-col gap-2 relative shadow-lg animate-fadeIn`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-orbitron font-bold text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        NOUVEL ÉQUIPEMENT FORGÉ !
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 font-bold">
                        Puissance : {lastCraftedItem.itemPower}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-black/60 border border-white/20">
                        {getSlotIcon(lastCraftedItem.slot)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold font-orbitron text-white">{lastCraftedItem.name}</h4>
                        <p className="text-xs text-gray-300 font-mono">
                          +{lastCraftedItem.baseStat.value} {lastCraftedItem.baseStat.name}
                        </p>
                      </div>
                    </div>

                    {/* Affixes */}
                    <div className="space-y-1 bg-black/40 p-2 border border-white/10 text-[10px] font-mono">
                      {lastCraftedItem.affixes.map((aff, i) => (
                        <div key={i} className="text-cyan-300">
                          • {aff.name} : +{aff.value}
                        </div>
                      ))}
                      {lastCraftedItem.legendaryPassive && (
                        <div className="text-[#f2994a] font-bold mt-1">
                          ★ {lastCraftedItem.legendaryPassive.name}
                        </div>
                      )}
                    </div>

                    {onEquipItem && (
                      <button
                        onClick={() => {
                          onEquipItem(lastCraftedItem);
                          sound.playEquip();
                        }}
                        className="w-full py-1.5 bg-[#00f3ff22] hover:bg-[#00f3ff] text-[#00f3ff] hover:text-black border border-[#00f3ff] font-orbitron font-bold text-xs uppercase transition-all"
                      >
                        ÉQUIPER IMMÉDIATEMENT
                      </button>
                    )}
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: ATELIER D'AMÉLIORATION & OVERCLOCK */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'upgrade' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* LEFT 6 COLS: ITEM SELECTION FROM INVENTORY */}
              <div className="lg:col-span-6 flex flex-col gap-3">
                <div className="flex items-center justify-between bg-[#101018] p-3 border border-[#ffffff11]">
                  <span className="text-xs font-orbitron font-bold text-white uppercase flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#00f3ff]" />
                    Sélectionnez l'implant à surcadencer ({inventory.length} pièces)
                  </span>
                </div>

                <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
                  {inventory.map((item) => {
                    const isSelected = item.id === selectedUpgradeItemId;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          sound.playItemSlot();
                          setSelectedUpgradeItemId(item.id);
                          setUpgradeSuccessNotice(null);
                        }}
                        className={`p-3 border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#00f3ff] bg-[#00f3ff15] shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                            : `${getRarityBadge(item.rarity)} hover:border-white/30`
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-black/60 border border-white/10">
                            {getSlotIcon(item.slot)}
                          </div>
                          <div>
                            <div className="text-xs font-bold font-orbitron text-white flex items-center gap-2">
                              <span>{item.name}</span>
                              {item.upgradeLevel ? (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#00f3ff22] border border-[#00f3ff] text-[#00f3ff] font-bold">
                                  +{item.upgradeLevel}
                                </span>
                              ) : null}
                            </div>
                            <span className="text-[10px] font-mono text-gray-400">
                              +{item.baseStat.value} {item.baseStat.name} • Niv. {item.levelReq}
                            </span>
                          </div>
                        </div>

                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 border border-white/20">
                          {item.rarity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT 6 COLS: UPGRADE MODES & WORKBENCH */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                {selectedUpgradeItem ? (
                  <div className="bg-[#101018] border border-[#00f3ff44] p-5 flex flex-col gap-4 shadow-lg">
                    
                    {/* Item Card Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-base font-bold font-orbitron text-white">
                          {selectedUpgradeItem.name}
                        </h3>
                        <p className="text-xs text-[#00f3ff] font-mono">
                          Stat actuelle : +{selectedUpgradeItem.baseStat.value} {selectedUpgradeItem.baseStat.name}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-1 bg-[#222] border border-white/20 text-[#f2994a]">
                        Puissance : {selectedUpgradeItem.itemPower || 200}
                      </span>
                    </div>

                    {/* Mode Selector */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { sound.playUiClick(); setUpgradeMode('overclock'); }}
                        className={`p-2.5 font-orbitron font-bold text-xs uppercase border transition-all ${
                          upgradeMode === 'overclock'
                            ? 'bg-[#00f3ff] text-black border-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                            : 'bg-[#181824] text-gray-400 border-white/10 hover:text-white'
                        }`}
                      >
                        ⚡ Overclock (+10% Stats)
                      </button>

                      <button
                        onClick={() => { sound.playUiClick(); setUpgradeMode('reroll'); }}
                        className={`p-2.5 font-orbitron font-bold text-xs uppercase border transition-all ${
                          upgradeMode === 'reroll'
                            ? 'bg-[#ff00ff] text-white border-[#ff00ff] shadow-[0_0_10px_rgba(255,0,255,0.4)]'
                            : 'bg-[#181824] text-gray-400 border-white/10 hover:text-white'
                        }`}
                      >
                        🎲 Re-roll Affixes
                      </button>
                    </div>

                    {/* Mode Details */}
                    {upgradeMode === 'overclock' && (
                      <div className="bg-[#0c0c14] p-4 border border-white/10 space-y-3">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-gray-400">Palier Overclock :</span>
                          <span className="text-white font-bold">+{currentUpgradeLevel} ➔ +{currentUpgradeLevel + 1} (Max +10)</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-gray-400">Gain de stat estimé :</span>
                          <span className="text-green-400 font-bold">+{Math.round(selectedUpgradeItem.baseStat.value * 0.1)} points</span>
                        </div>

                        <div className="p-3 bg-[#181824] border border-white/10 space-y-1.5 text-xs font-mono">
                          <div className="text-gray-300 font-bold mb-1">Coûts de surcadencage :</div>
                          <div className={hasOverclockScrap ? 'text-cyan-300' : 'text-red-400'}>
                            • Scrap Metal : {overclockScrapCost} / {materials.scrap_metal || 0}
                          </div>
                          {overclockProcessorCost > 0 && (
                            <div className={hasOverclockProc ? 'text-cyan-300' : 'text-red-400'}>
                              • Quantum Processors : {overclockProcessorCost} / {materials.quantum_processor || 0}
                            </div>
                          )}
                          <div className={hasOverclockNanites ? 'text-amber-400' : 'text-red-400'}>
                            • Nanites : {overclockNaniteCost} / {nanites.toLocaleString()} N
                          </div>
                        </div>

                        <button
                          disabled={!canPerformOverclock}
                          onClick={handleExecuteOverclock}
                          className={`w-full py-3 font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            canPerformOverclock
                              ? 'bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black shadow-[0_0_20px_rgba(0,243,255,0.4)] cursor-pointer'
                              : 'bg-[#222] border border-white/10 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isUpgrading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>INJECTION DU SURCADENÇAGE...</span>
                            </>
                          ) : (
                            <>
                              <Wrench className="w-4 h-4" />
                              <span>OVERCLOCKER CET ITEM (+10% STATS)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {upgradeMode === 'reroll' && (
                      <div className="bg-[#0c0c14] p-4 border border-white/10 space-y-3">
                        <p className="text-xs text-gray-300 font-mono">
                          Recalcule toutes les valeurs d'affixes de l'équipement avec un multiplicateur dépendant de votre compétence de forge.
                        </p>

                        <div className="p-3 bg-[#181824] border border-white/10 space-y-1.5 text-xs font-mono">
                          <div className="text-gray-300 font-bold mb-1">Coûts de recalibrage :</div>
                          <div className={hasRerollFilament ? 'text-fuchsia-400' : 'text-red-400'}>
                            • Neural Filaments : {rerollFilamentCost} / {materials.neural_filament || 0}
                          </div>
                          <div className={hasRerollNanites ? 'text-amber-400' : 'text-red-400'}>
                            • Nanites : {rerollNaniteCost} / {nanites.toLocaleString()} N
                          </div>
                        </div>

                        <button
                          disabled={!canPerformReroll}
                          onClick={handleExecuteReroll}
                          className={`w-full py-3 font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            canPerformReroll
                              ? 'bg-[#ff00ff] hover:bg-[#ff00ff]/90 text-white shadow-[0_0_20px_rgba(255,0,255,0.4)] cursor-pointer'
                              : 'bg-[#222] border border-white/10 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isUpgrading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>RECALIBRAGE SYNAPTIQUE...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>RE-CALIBRER LA MATRICE D'AFFIXES</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {upgradeSuccessNotice && (
                      <div className="p-3 bg-green-500/10 border border-green-500/40 text-green-400 font-mono text-xs flex items-center gap-2 animate-fadeIn">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>{upgradeSuccessNotice}</span>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="h-full min-h-[300px] border border-dashed border-white/20 bg-[#0c0c14] flex flex-col items-center justify-center text-center p-6">
                    <Wrench className="w-12 h-12 text-gray-600 mb-3" />
                    <h4 className="text-sm font-bold font-orbitron text-gray-400 uppercase">
                      Aucun équipement sélectionné
                    </h4>
                    <p className="text-xs text-gray-600 font-mono mt-1">
                      Choisissez un implant dans la colonne de gauche pour l'overclocker ou re-roller ses affixes.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: STOCK MATÉRIAUX & SAVOIR-FAIRE */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'materials' && (
            <div className="flex flex-col gap-5">
              
              {/* Crafting Skill Banner */}
              <div className="bg-[#101018] border border-[#f2994a44] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-[#f2994a]" />
                    <h3 className="text-base font-bold font-orbitron text-white uppercase">
                      Compétence d'Artisanat : Niveau {craftingSkill.level}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 bg-[#f2994a22] border border-[#f2994a] text-[#f2994a] font-bold">
                      {skillInfo.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    Chaque équipement forgé ou amélioré vous octroie de l'EXP d'artisanat, débloquant des sockets et de meilleurs jets de rareté.
                  </p>
                </div>

                <div className="w-full sm:w-64 bg-[#08080f] p-3 border border-white/10">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-gray-400">Progression EXP :</span>
                    <span className="text-[#f2994a] font-bold">{craftingSkill.exp} / {craftingSkill.maxExp}</span>
                  </div>
                  <div className="w-full bg-[#181824] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#f2994a] to-[#ff0055] h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (craftingSkill.exp / craftingSkill.maxExp) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Material Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Object.keys(CRAFTING_MATERIALS) as CraftingMaterialId[]).map((matId) => {
                  const mat = CRAFTING_MATERIALS[matId];
                  const stock = materials[matId] || 0;

                  return (
                    <div
                      key={matId}
                      className="p-4 border border-white/10 bg-[#101018] flex flex-col justify-between relative"
                      style={{ borderLeftColor: mat.color, borderLeftWidth: '3px' }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-bold font-orbitron text-white">{mat.nameFr}</h4>
                            <span className="text-[10px] font-mono text-gray-500 uppercase">{mat.name}</span>
                          </div>
                          <span className="text-lg font-bold font-mono text-white px-2 py-0.5 bg-black/60 border border-white/10">
                            {stock}
                          </span>
                        </div>

                        <p className="text-xs text-gray-300 font-sans leading-relaxed mb-3">
                          {mat.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex flex-col gap-1 text-[10px] font-mono">
                        <div className="text-gray-400">
                          <span className="text-gray-500">Source :</span> {mat.dropSource}
                        </div>
                        <div className="text-cyan-400">
                          <span className="text-gray-500">Effet :</span> {mat.craftEffect}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 4: FUSION MOLÉCULAIRE CLASSIQUE (3 ITEMS) */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'fusion' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* LEFT 7 COLS: THE 3 CHAMBERS */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-[#101018] border border-[#ffffff11] p-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-orbitron font-bold text-gray-400 uppercase flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#00f3ff]" />
                    Chambres de Fusion (3 items de rareté identique)
                  </span>
                  {selectedFusionItemIds.length > 0 && (
                    <button
                      onClick={() => setSelectedFusionItemIds([])}
                      className="px-2 py-1 bg-[#221010] text-red-400 border border-red-500/30 text-[10px] font-mono font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Vider
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((slotIdx) => {
                    const item = selectedFusionItems[slotIdx];
                    return (
                      <div
                        key={slotIdx}
                        onClick={() => {
                          if (item) {
                            setSelectedFusionItemIds(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                        className={`p-3 border min-h-[140px] flex flex-col justify-between transition-all ${
                          item
                            ? `${getRarityBadge(item.rarity)} cursor-pointer hover:border-red-500`
                            : 'border-dashed border-white/20 bg-[#0c0c14] flex items-center justify-center text-center'
                        }`}
                      >
                        <div className="flex justify-between text-[9px] font-mono text-gray-500 w-full">
                          <span>CHAMBRE 0{slotIdx + 1}</span>
                          {item && <span className="text-red-400 font-bold">✕ Retirer</span>}
                        </div>

                        {item ? (
                          <div className="flex flex-col items-center text-center my-auto">
                            <div className="p-2 bg-black/60 border border-white/10 mb-1">
                              {getSlotIcon(item.slot)}
                            </div>
                            <span className="text-xs font-bold font-orbitron text-white line-clamp-1">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400">
                              +{item.baseStat.value} {item.baseStat.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-gray-600">
                            <Plus className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-orbitron uppercase">Insérer</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Fusion Trigger Button */}
                <div className="bg-[#101018] p-4 border border-white/10 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-gray-400">Nanites Requis :</span>
                    <span className={hasEnoughFusionNanites ? 'text-amber-400 font-bold' : 'text-red-400'}>
                      {requiredFusionNanites} / {nanites.toLocaleString()} N
                    </span>
                  </div>

                  <button
                    disabled={!isReadyToFuse || !hasEnoughFusionNanites || isFusionActive}
                    onClick={handleExecuteFusion}
                    className={`w-full py-3.5 font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isReadyToFuse && hasEnoughFusionNanites && !isFusionActive
                        ? 'bg-[#ff00ff] hover:bg-[#ff00ff]/90 text-white shadow-[0_0_20px_rgba(255,0,255,0.4)] cursor-pointer'
                        : 'bg-[#222] border border-white/10 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isFusionActive ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>FUSION EN COURS ({fusionProgress}%)</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4" />
                        <span>FUSIONNER LES 3 IMPLANTS</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Result Card */}
                {fusionResult && (
                  <div className={`p-4 border ${getRarityBadge(fusionResult.rarity)} flex items-center justify-between animate-fadeIn`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-black/60 border border-white/20">
                        {getSlotIcon(fusionResult.slot)}
                      </div>
                      <div>
                        <span className="text-[10px] font-orbitron text-green-400 font-bold block">FUSION RÉUSSIE !</span>
                        <h4 className="text-sm font-bold font-orbitron text-white">{fusionResult.name}</h4>
                        <span className="text-xs text-gray-300 font-mono">+{fusionResult.baseStat.value} {fusionResult.baseStat.name}</span>
                      </div>
                    </div>
                    {onEquipItem && (
                      <button
                        onClick={() => onEquipItem(fusionResult)}
                        className="px-3 py-1.5 bg-[#00f3ff] text-black font-orbitron font-bold text-xs uppercase"
                      >
                        Équiper
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT 5 COLS: INVENTORY SELECTION */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="bg-[#101018] p-3 border border-white/10 flex justify-between items-center text-xs font-orbitron font-bold text-white">
                  <span>Inventaire d'Implants</span>
                  <div className="flex gap-1">
                    {(['all', 'standard', 'rare', 'epic'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setFilterRarity(r)}
                        className={`px-2 py-0.5 text-[9px] font-mono uppercase border ${
                          filterRarity === r ? 'bg-white/20 border-white text-white' : 'border-white/10 text-gray-500'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
                  {inventory
                    .filter(item => filterRarity === 'all' || item.rarity === filterRarity)
                    .map((item) => {
                      const isSelected = selectedFusionItemIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectFusionItem(item)}
                          className={`p-2.5 border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-[#ff00ff] bg-[#ff00ff15] shadow-[0_0_10px_rgba(255,0,255,0.3)]'
                              : `${getRarityBadge(item.rarity)} hover:border-white/40`
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-black/60 border border-white/10">
                              {getSlotIcon(item.slot)}
                            </div>
                            <div>
                              <div className="text-xs font-bold font-orbitron text-white line-clamp-1">{item.name}</div>
                              <span className="text-[9px] font-mono text-gray-400">+{item.baseStat.value} {item.baseStat.name}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 border border-white/20">
                            {item.rarity}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
