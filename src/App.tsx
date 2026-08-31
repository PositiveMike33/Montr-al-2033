import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  PlayerAttributes, 
  PlayerStats, 
  EquipmentItem, 
  ItemSlot, 
  SkillNode, 
  AvatarCustomization, 
  StageInfo, 
  SkillCooldowns, 
  CombatEntity, 
  LootDrop,
  Companion,
  WorldEvent,
  Achievement,
  AchievementNotificationItem,
  EquipmentLoadoutType,
  AbilityType,
  AbilityMasteryData,
  PotionSystem,
  StoredAspect,
  NeuralModule
} from './types';
import { STAGES_DATA, INITIAL_SKILL_TREE } from './utils/stageData';
import { generateLootItem, getRequiredExp, NEURAL_MODULES_CATALOG } from './utils/lootGenerator';
import { INITIAL_COMPANIONS, generateWorldEvent, getTraderInventory } from './utils/eventData';
import { INITIAL_ACHIEVEMENTS, evaluateAchievements } from './utils/achievementData';
import { INITIAL_CODEX_ENTRIES, evaluateCodexUnlocks } from './utils/codexData';
import { WEAPON_SKINS_CATALOG } from './utils/weaponSkinsData';
import { INITIAL_ABILITY_MASTERY, recordAbilityUsage } from './utils/masteryData';
import { sound } from './utils/audio';
import { GameCanvas } from './components/GameCanvas';
import { Engine3DCanvas } from './components/Engine3DCanvas';
import { BabylonARPGEngine } from './components/BabylonARPGEngine';
import { HUD } from './components/HUD';
import { InventoryModal } from './components/InventoryModal';
import { CharacterModal } from './components/CharacterModal';
import { SkillTreeModal } from './components/SkillTreeModal';
import { StageSelectorModal } from './components/StageSelectorModal';
import { CompanionsModal } from './components/CompanionsModal';
import { TraderModal } from './components/TraderModal';
import { AchievementsModal } from './components/AchievementsModal';
import { CyberForgeModal } from './components/CyberForgeModal';
import { CodexModal } from './components/CodexModal';
import { NeuralArchitectModal } from './components/NeuralArchitectModal';
import { StoryIntroModal } from './components/StoryIntroModal';
import { TacticalDeckModal } from './components/TacticalDeckModal';
import { HackerArsenalModal } from './components/HackerArsenalModal';
import { WorldMonitorModal } from './components/WorldMonitorModal';
import { CommandCenterHub } from './components/CommandCenterHub';
import { SettingsModal } from './components/SettingsModal';
import { DeviceFramingContainer } from './components/DeviceFramingContainer';
import { DeviceViewportMode } from './types/deviceFraming';
import { FullToolAppView, ToolAppId } from './components/FullToolAppView';
import { FF7BattleEncounterModal, BattleEncounterData } from './components/FF7BattleEncounterModal';
import { INITIAL_TACTICAL_STATE, TacticalBridgeState, executeWorldMonitorMCP } from './utils/cyberToolsBridge';
import { 
  BitcoinWalletState, 
  INITIAL_BITCOIN_WALLET, 
  calculateEnemyBtcDrop,
  WorldMonitorHack,
  HackerGadgetItem 
} from './utils/hackerArsenalData';
import { getSTMBusLiveReport, STMBusStatusReport } from './services/stmService';
import { AchievementNotification } from './components/AchievementNotification';
import { EventNotificationBanner } from './components/EventNotificationBanner';
import { 
  Zap, 
  ShieldAlert, 
  Play, 
  RotateCcw, 
  Layers, 
  Sparkles, 
  Trophy,
  Volume2,
  VolumeX,
  Crosshair,
  Bot,
  BookOpen
} from 'lucide-react';

export default function App() {
  // Game Flow State
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [mainView, setMainView] = useState<'command_center' | 'game' | 'tool_app'>('command_center');
  const [activeToolApp, setActiveToolApp] = useState<ToolAppId>('world_monitor');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [viewportMode, setViewportMode] = useState<DeviceViewportMode>(() => {
    const saved = localStorage.getItem('montreal2033_viewport_mode');
    if (saved === 'android' || saved === 'desktop') return saved;
    return window.innerWidth < 768 ? 'android' : 'desktop';
  });

  // Tactical & GIS Tool States
  const [stmSearchRoute, setStmSearchRoute] = useState<string>('136');
  const [stmLiveReport, setStmLiveReport] = useState<STMBusStatusReport | null>(null);
  const [isStmLoading, setIsStmLoading] = useState<boolean>(false);
  const [deepfakePercent, setDeepfakePercent] = useState<number>(88);
  const [hackedPins, setHackedPins] = useState<string[]>([]);
  const [godEyeActive, setGodEyeActive] = useState<boolean>(false);
  const [is3DEngineActive, setIs3DEngineActive] = useState<boolean>(true);

  // Start Game
  const handleStartGame = useCallback(() => {
    setHasStarted(true);
    setIsGameOver(false);
    setIsVictory(false);
    sound.init();
    sound.playVictory();
  }, []);

  // Final Fantasy VII Combat Incursion Encounter State
  const [isFF7EncounterOpen, setIsFF7EncounterOpen] = useState<boolean>(false);
  const [battleEncounterData, setBattleEncounterData] = useState<BattleEncounterData | undefined>(undefined);

  const handleRequestBattle = useCallback((customData?: BattleEncounterData) => {
    setBattleEncounterData(customData);
    setIsFF7EncounterOpen(true);
  }, []);

  const handleConfirmBattle = useCallback(() => {
    setIsFF7EncounterOpen(false);
    setMainView('game');
    window.location.hash = '#/game';
    if (!hasStarted) {
      handleStartGame();
    }
  }, [hasStarted, handleStartGame]);

  const handleRefuseBattle = useCallback(() => {
    setIsFF7EncounterOpen(false);
    setMainView('command_center');
    window.location.hash = '#/hub';
  }, []);

  // Sync with Browser URL Hash - Priority to Command Center & World Monitor Tools
  useEffect(() => {
    const handleHash = () => {
      const raw = window.location.hash.replace('#/', '').replace('#', '');
      if (raw === 'game') {
        if (!hasStarted) {
          // Keep on command center and prompt FF7 battle encounter
          setMainView('command_center');
          setIsFF7EncounterOpen(true);
        } else {
          setMainView('game');
        }
      } else if (raw === 'hub' || raw === '' || raw === 'home') {
        setMainView('command_center');
      } else if (['world-monitor', 'shadowbroker', 'stm', 'god-eye', 'sophia', 'map', 'maxintel', 'arpg', 'cyber-arpg'].includes(raw)) {
        setMainView('tool_app');
        if (raw === 'world-monitor') setActiveToolApp('world_monitor');
        else if (raw === 'shadowbroker') setActiveToolApp('shadowbroker');
        else if (raw === 'stm') setActiveToolApp('stm_transit');
        else if (raw === 'god-eye') setActiveToolApp('god_eye_view');
        else if (raw === 'sophia') setActiveToolApp('deus_ex_sophia_ai');
        else if (raw === 'map') setActiveToolApp('map_montreal');
        else if (raw === 'maxintel') setActiveToolApp('maxintel_academy');
        else if (raw === 'arpg' || raw === 'cyber-arpg') setActiveToolApp('cyber_arpg');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [hasStarted]);

  const handleSearchSTM = async (routeQuery?: string) => {
    const route = routeQuery || stmSearchRoute;
    setIsStmLoading(true);
    try {
      const rep = await getSTMBusLiveReport(route);
      setStmLiveReport(rep);
    } catch {
      // Fallback
    } finally {
      setIsStmLoading(false);
    }
  };

  const handleOpenFullToolApp = (toolId: string) => {
    const validId: ToolAppId = 
      toolId === 'world_monitor' ? 'world_monitor' :
      toolId === 'shadowbroker' ? 'shadowbroker' :
      toolId === 'stm_transit' ? 'stm_transit' :
      toolId === 'god_eye_view' ? 'god_eye_view' :
      toolId === 'deus_ex_sophia_ai' ? 'deus_ex_sophia_ai' :
      toolId === 'maxintel' || toolId === 'maxintel_academy' ? 'maxintel_academy' :
      toolId === 'arpg' || toolId === 'cyber_arpg' ? 'cyber_arpg' : 'map_montreal';
    setActiveToolApp(validId);
    setMainView('tool_app');
    const hashName = validId === 'world_monitor' ? 'world-monitor' :
                     validId === 'shadowbroker' ? 'shadowbroker' :
                     validId === 'stm_transit' ? 'stm' :
                     validId === 'god_eye_view' ? 'god-eye' :
                     validId === 'deus_ex_sophia_ai' ? 'sophia' :
                     validId === 'maxintel_academy' ? 'maxintel' :
                     validId === 'cyber_arpg' ? 'arpg' : 'map';
    window.location.hash = `#/${hashName}`;
  };

  // Player Progression
  const [level, setLevel] = useState<number>(1);
  const [currentExp, setCurrentExp] = useState<number>(0);
  const [unspentAttributePoints, setUnspentAttributePoints] = useState<number>(5);
  const [skillPoints, setSkillPoints] = useState<number>(1);
  const [nanites, setNanites] = useState<number>(150);
  const [killCount, setKillCount] = useState<number>(0);

  // Diablo 4-Style Potion System
  const [potionSystem, setPotionSystem] = useState<PotionSystem>({
    charges: 4,
    maxCharges: 4,
    healPercent: 35,
    cooldownTimer: 0,
    cooldownMax: 90,
    killsToRecharge: 15,
    killCounter: 0
  });

  // Core Attributes
  const [attributes, setAttributes] = useState<PlayerAttributes>({
    synapticPower: 10,
    cyberOverclock: 10,
    bioArmor: 10,
    neuralReflex: 10
  });

  // Equipped Items & Inventory
  const [equipped, setEquipped] = useState<{ [key in ItemSlot]?: EquipmentItem }>({
    weapon: generateLootItem(1, 1, 'standard'),
    deck: generateLootItem(1, 1, 'standard')
  });
  const [inventory, setInventory] = useState<EquipmentItem[]>([
    generateLootItem(1, 1, 'rare')
  ]);

  // Equipment Loadouts (Hacking vs Combat)
  const [loadouts, setLoadouts] = useState<{
    combat: { [key in ItemSlot]?: EquipmentItem };
    hacking: { [key in ItemSlot]?: EquipmentItem };
  }>({
    combat: {
      weapon: generateLootItem(1, 1, 'standard'),
      deck: generateLootItem(1, 1, 'standard')
    },
    hacking: {
      weapon: generateLootItem(1, 1, 'standard'),
      deck: generateLootItem(1, 1, 'standard')
    }
  });
  const [activeLoadout, setActiveLoadout] = useState<EquipmentLoadoutType>('combat');

  // Ability Mastery Progression State
  const [abilityMastery, setAbilityMastery] = useState<Record<AbilityType, AbilityMasteryData>>(INITIAL_ABILITY_MASTERY);

  const trackAbilityUse = useCallback((ability: AbilityType) => {
    setAbilityMastery(prev => recordAbilityUsage(prev, ability));
  }, []);

  // Skill Tree
  const [skillNodes, setSkillNodes] = useState<SkillNode[]>(INITIAL_SKILL_TREE);

  // Avatar Customization & Ultra-Realistic Likeness
  const [customization, setCustomization] = useState<AvatarCustomization>({
    hairColor: '#111111',
    skinTone: '#f5d0b5',
    hairstyle: 'slick_back',
    beardStyle: 'stubble',
    outerwear: 'neo_trenchcoat',
    cyberArm: 'left_chrome',
    visorColor: '#00f3ff',
    suitColor: '#0b0f19',
    bladeColor: '#00f3ff',
    auraColor: '#00f3ff',
    gender: 'male',
    realName: 'Thirty3',
    personalBio: 'Hacker d’élite montréalais et insurgé psionique opérant avec l’IA Deus Ex Sophia pour anéantir le cartel criminel de Viktor Vance.',
    cyberImplantStyle: 'neural_mesh'
  });

  // Companions State (Max 2 active)
  const [companions, setCompanions] = useState<Companion[]>(INITIAL_COMPANIONS);
  const activeCompanions = useMemo(() => companions.filter(c => c.active), [companions]);

  // Dynamic World Events State
  const [activeWorldEvent, setActiveWorldEvent] = useState<WorldEvent | null>(null);
  const [isPlayerNearTrader, setIsPlayerNearTrader] = useState<boolean>(false);
  const [traderInventory, setTraderInventory] = useState<EquipmentItem[]>([]);

  // Stages & Difficulty
  const [currentStage, setCurrentStage] = useState<StageInfo>(STAGES_DATA[0]);
  const [difficultyTier, setDifficultyTier] = useState<number>(1);

  // Modals Open State
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isCharacterOpen, setIsCharacterOpen] = useState<boolean>(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState<boolean>(false);
  const [isStagesOpen, setIsStagesOpen] = useState<boolean>(false);
  const [isCompanionsOpen, setIsCompanionsOpen] = useState<boolean>(false);
  const [isTraderOpen, setIsTraderOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isForgeOpen, setIsForgeOpen] = useState<boolean>(false);
  const [isCodexOpen, setIsCodexOpen] = useState<boolean>(false);
  const [isArchitectOpen, setIsArchitectOpen] = useState<boolean>(false);
  const [isStoryIntroOpen, setIsStoryIntroOpen] = useState<boolean>(false);
  const [isTacticalDeckOpen, setIsTacticalDeckOpen] = useState<boolean>(false);
  const [isArsenalOpen, setIsArsenalOpen] = useState<boolean>(false);
  const [isWorldMonitorOpen, setIsWorldMonitorOpen] = useState<boolean>(false);
  const [bitcoinWallet, setBitcoinWallet] = useState<BitcoinWalletState>(() => {
    try {
      const saved = localStorage.getItem('mtl2033_btc_wallet');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_BITCOIN_WALLET;
  });
  const [tacticalState, setTacticalState] = useState<TacticalBridgeState>(INITIAL_TACTICAL_STATE);

  useEffect(() => {
    try {
      localStorage.setItem('mtl2033_btc_wallet', JSON.stringify(bitcoinWallet));
    } catch {}
  }, [bitcoinWallet]);

  // DIABLO 4: Stored Aspects Library (Occultist Codex)
  const [storedAspects, setStoredAspects] = useState<StoredAspect[]>([
    {
      id: 'asp_lightning_init',
      name: 'Aspect de la Surcharge Électrostatique',
      description: 'Les coups critiques déclenchent un arc d’éclair cybernétique sur 3 cibles proches.',
      type: 'chain_lightning',
      extractedFrom: 'Katana Prototype SPVM',
      rarity: 'legendary'
    }
  ]);

  // DIABLO 4: Neural Modules Bag (Gems)
  const [neuralModules, setNeuralModules] = useState<NeuralModule[]>(NEURAL_MODULES_CATALOG.slice(0, 3));

  // Codex Lore State
  const [codexEntries, setCodexEntries] = useState(INITIAL_CODEX_ENTRIES);

  // Weapon Skins Collection State
  const [unlockedWeaponSkinIds, setUnlockedWeaponSkinIds] = useState<string[]>([
    'skin_default',
    'skin_katana_overclock'
  ]);

  // Achievements & Milestones State
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [achievementNotifications, setAchievementNotifications] = useState<AchievementNotificationItem[]>([]);
  const [bulletTimeUses, setBulletTimeUses] = useState<number>(0);
  const [completedEventsCount, setCompletedEventsCount] = useState<number>(0);
  const [defeatedBosses, setDefeatedBosses] = useState<string[]>([]);
  const [foundLegendaryCount, setFoundLegendaryCount] = useState<number>(0);
  const [foundEpicOrBetterCount, setFoundEpicOrBetterCount] = useState<number>(0);
  const [forgedItemsCount, setForgedItemsCount] = useState<number>(0);

  // Boss Trackers
  const [bossHp, setBossHp] = useState<number | null>(null);
  const [bossMaxHp, setBossMaxHp] = useState<number | null>(null);
  const [bossName, setBossName] = useState<string | null>(null);

  // Skill Cooldowns
  const [cooldowns, setCooldowns] = useState<SkillCooldowns>({
    primary: 0,
    synapticLance: 0,
    empShockwave: 0,
    psychicVortex: 0,
    bulletTime: 0,
    dash: 0
  });

  const maxCooldowns = useMemo(() => ({
    primary: 0.2,
    synapticLance: 2.0,
    empShockwave: 5.0,
    psychicVortex: 8.0,
    bulletTime: 12.0,
    dash: 1.5
  }), []);

  // Bullet-Time Active Flag
  const [bulletTimeActive, setBulletTimeActive] = useState<boolean>(false);

  // Action Triggers for GameCanvas
  const [triggerAction, setTriggerAction] = useState<{
    type: 'primary' | 'lance' | 'emp' | 'vortex' | 'bulletTime' | 'dash' | null;
    timestamp: number;
  }>({ type: null, timestamp: 0 });

  // Calculate Aggregated Player Combat Stats with Achievement Bonuses
  const stats: PlayerStats = useMemo(() => {
    let maxHp = 100 + level * 20 + attributes.bioArmor * 15;
    let maxPsi = 100 + level * 15 + attributes.synapticPower * 12;
    let physicalDamage = 15 + level * 3 + attributes.cyberOverclock * 2.5;
    let psiDamage = 20 + level * 4 + attributes.synapticPower * 3.5;
    let armor = attributes.bioArmor * 2;
    let critChance = 5 + attributes.neuralReflex * 1.2;
    let critDamage = 150 + attributes.neuralReflex * 3;
    let moveSpeed = 4.0 + attributes.neuralReflex * 0.08;
    let hpRegen = 1.0 + attributes.bioArmor * 0.2;
    let psiRegen = 0.8 + attributes.synapticPower * 0.12;
    let cooldownReduction = attributes.cyberOverclock * 0.8;
    let dodgeChance = attributes.neuralReflex * 0.5;
    let lifeSteal = 0;

    // Add Equipped Gear Stats & Affixes
    (Object.values(equipped) as (EquipmentItem | undefined)[]).forEach((item) => {
      if (!item) return;
      if (item.slot === 'weapon') physicalDamage += item.baseStat.value;
      if (item.slot === 'deck') psiDamage += item.baseStat.value;
      if (item.slot === 'armor') armor += item.baseStat.value;
      if (item.slot === 'chip') maxPsi += item.baseStat.value;
      if (item.slot === 'boots') moveSpeed += item.baseStat.value * 0.04;

      item.affixes.forEach((aff) => {
        if (aff.stat === 'damage') physicalDamage += aff.value;
        if (aff.stat === 'psiDamage') psiDamage += aff.value;
        if (aff.stat === 'health') maxHp += aff.value;
        if (aff.stat === 'psiEnergy') maxPsi += aff.value;
        if (aff.stat === 'armor') armor += aff.value;
        if (aff.stat === 'critChance') critChance += aff.value;
        if (aff.stat === 'critDamage') critDamage += aff.value;
        if (aff.stat === 'moveSpeed') moveSpeed += aff.value * 0.03;
        if (aff.stat === 'cooldownReduction') cooldownReduction += aff.value;
        if (aff.stat === 'lifeSteal') lifeSteal += aff.value;
      });

      // Add Socketed Neural Module stats
      if (item.sockets) {
        item.sockets.forEach(sock => {
          if (!sock) return;
          if (sock.stat === 'physicalDamage') physicalDamage += sock.value;
          if (sock.stat === 'psiDamage') psiDamage += sock.value;
          if (sock.stat === 'armor') armor += sock.value;
          if (sock.stat === 'maxHp') maxHp += sock.value;
          if (sock.stat === 'maxPsi') maxPsi += sock.value;
          if (sock.stat === 'critChance') critChance += sock.value;
          if (sock.stat === 'critDamage') critDamage += sock.value;
          if (sock.stat === 'moveSpeed') moveSpeed += sock.value * 0.04;
          if (sock.stat === 'cooldownReduction') cooldownReduction += sock.value;
        });
      }
    });

    // Add Skill Tree Bonuses
    skillNodes.forEach((node) => {
      if (node.currentRank <= 0) return;
      if (node.id === 'cyber_1') {
        psiDamage += node.currentRank * 6;
        cooldownReduction += node.currentRank * 4;
      }
      if (node.id === 'cyber_3') {
        armor += node.currentRank * 8;
        hpRegen += node.currentRank * 1.5;
      }
      if (node.id === 'psi_1') {
        psiDamage += node.currentRank * 8;
        critChance += node.currentRank * 2;
      }
      if (node.id === 'psi_2') {
        critDamage += node.currentRank * 15;
      }
    });

    // Add Active Equipped Badge Bonus or Unlocked Achievement Passives
    achievements.forEach((ach) => {
      if (!ach.unlocked || !ach.statBonus) return;
      const { stat, value } = ach.statBonus;
      if (stat === 'damage') physicalDamage += value;
      if (stat === 'psiDamage') psiDamage += value;
      if (stat === 'maxHp') maxHp += value;
      if (stat === 'maxPsi') maxPsi += value;
      if (stat === 'armor') armor += value;
      if (stat === 'critChance') critChance += value;
      if (stat === 'critDamage') critDamage += value;
      if (stat === 'moveSpeed') moveSpeed += value;
      if (stat === 'cooldownReduction') cooldownReduction += value;
      if (stat === 'dodgeChance') dodgeChance += value;
    });

    return {
      maxHp: Math.round(maxHp),
      currentHp: Math.round(maxHp),
      maxPsi: Math.round(maxPsi),
      currentPsi: Math.round(maxPsi),
      hpRegen,
      psiRegen,
      physicalDamage: Math.round(physicalDamage),
      psiDamage: Math.round(psiDamage),
      armor: Math.round(armor),
      critChance: Math.min(80, critChance),
      critDamage,
      moveSpeed: Math.min(8.5, moveSpeed),
      cooldownReduction: Math.min(50, cooldownReduction),
      dodgeChance: Math.min(45, dodgeChance),
      lifeSteal
    };
  }, [level, attributes, equipped, skillNodes, achievements]);

  // Current HP & Mana state tracking
  const [currentHp, setCurrentHp] = useState<number>(stats.maxHp);
  const [currentPsi, setCurrentPsi] = useState<number>(stats.maxPsi);

  // Sync HP/Psi on max change
  useEffect(() => {
    setCurrentHp(prev => (prev > stats.maxHp ? stats.maxHp : prev || stats.maxHp));
    setCurrentPsi(prev => (prev > stats.maxPsi ? stats.maxPsi : prev || stats.maxPsi));
  }, [stats.maxHp, stats.maxPsi]);

  // Passive HP/Mana Regeneration Tick
  useEffect(() => {
    if (!hasStarted || isGameOver || isVictory) return;
    const interval = setInterval(() => {
      setCurrentHp(hp => Math.min(stats.maxHp, hp + stats.hpRegen));
      setCurrentPsi(psi => Math.min(stats.maxPsi, psi + stats.psiRegen));
      // Potion cooldown tick (roughly 60 frames per second, interval fires at 1s)
      setPotionSystem(pot => ({
        ...pot,
        cooldownTimer: Math.max(0, pot.cooldownTimer - 60)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isGameOver, isVictory, stats.maxHp, stats.maxPsi, stats.hpRegen, stats.psiRegen]);

  // Cooldown decrement loop (250ms tick = 4/sec for efficiency)
  useEffect(() => {
    if (!hasStarted || isPaused) return;
    const interval = setInterval(() => {
      setCooldowns(cd => ({
        primary: Math.max(0, cd.primary - 0.25),
        synapticLance: Math.max(0, cd.synapticLance - 0.25),
        empShockwave: Math.max(0, cd.empShockwave - 0.25),
        psychicVortex: Math.max(0, cd.psychicVortex - 0.25),
        bulletTime: Math.max(0, cd.bulletTime - 0.25),
        dash: Math.max(0, cd.dash - 0.25)
      }));
    }, 250);
    return () => clearInterval(interval);
  }, [hasStarted, isPaused]);

  // Dynamic World Events Spawner Interval (Every 45-60s or on stage start)
  useEffect(() => {
    if (!hasStarted || isGameOver || isVictory) return;
    
    // Spawn initial event after 15s if none active
    const timer = setTimeout(() => {
      if (!activeWorldEvent) {
        const ev = generateWorldEvent(currentStage.id, difficultyTier, 1200, 1200);
        setActiveWorldEvent(ev);
        sound.playEmpExplosion();
        if (ev.type === 'wandering_trader') {
          setTraderInventory(getTraderInventory(level, difficultyTier));
        }
      }
    }, 15000);

    const interval = setInterval(() => {
      if (!activeWorldEvent && Math.random() < 0.65) {
        const ev = generateWorldEvent(currentStage.id, difficultyTier, 1200, 1200);
        setActiveWorldEvent(ev);
        sound.playEmpExplosion();
        if (ev.type === 'wandering_trader') {
          setTraderInventory(getTraderInventory(level, difficultyTier));
        }
      }
    }, 55000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [hasStarted, isGameOver, isVictory, currentStage.id, difficultyTier, activeWorldEvent, level]);

  // Event Expiry & Tick
  useEffect(() => {
    if (!activeWorldEvent || activeWorldEvent.status !== 'active') return;
    const timer = setInterval(() => {
      setActiveWorldEvent(prev => {
        if (!prev || prev.status !== 'active') return null;
        if (prev.timeRemaining <= 1) {
          // If trader, conclude peacefully; if combat event, fail
          return { ...prev, status: prev.type === 'wandering_trader' ? 'completed' : 'failed' };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeWorldEvent]);

  // Experience & Level Up check
  const expToNext = useMemo(() => getRequiredExp(level), [level]);

  const addExp = useCallback((amount: number) => {
    setCurrentExp(prev => {
      let newExp = prev + amount;
      let curLevel = level;
      let req = getRequiredExp(curLevel);

      while (newExp >= req && curLevel < 99) {
        newExp -= req;
        curLevel += 1;
        setLevel(curLevel);
        setUnspentAttributePoints(pts => pts + 4);
        setSkillPoints(sp => sp + 1);
        setCurrentHp(stats.maxHp);
        setCurrentPsi(stats.maxPsi);
        sound.playLevelUp();
        req = getRequiredExp(curLevel);
      }
      return newExp;
    });
  }, [level, stats.maxHp, stats.maxPsi]);

  // Achievement Evaluation Hook
  // NOTE: nanites and addExp deliberately excluded from deps to prevent infinite re-render loops
  // (this effect SETS nanites via rewards, so including nanites would cause a cycle)
  useEffect(() => {
    const { updatedAchievements, newlyUnlocked } = evaluateAchievements(achievements, {
      killCount,
      level,
      nanites,
      difficultyTier,
      equipped,
      inventory,
      skillNodes,
      bulletTimeUses,
      completedEventsCount,
      defeatedBosses: new Set(defeatedBosses),
      foundLegendaryCount,
      foundEpicOrBetterCount,
      forgedItemsCount
    });

    const hasChanged = updatedAchievements.some((ach, i) => 
      ach.currentValue !== achievements[i]?.currentValue || 
      ach.unlocked !== achievements[i]?.unlocked
    );

    if (hasChanged) {
      setAchievements(updatedAchievements);
    }

    if (newlyUnlocked.length > 0) {
      sound.playAchievement();
      
      const newNotifs: AchievementNotificationItem[] = newlyUnlocked.map(ach => ({
        id: `${ach.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        achievement: ach,
        timestamp: Date.now()
      }));

      setAchievementNotifications(prev => [...prev, ...newNotifs]);

      // Auto reward nanites and exp
      newlyUnlocked.forEach(ach => {
        if (ach.rewardNanites > 0) setNanites(n => n + ach.rewardNanites);
        if (ach.rewardExp > 0) addExp(ach.rewardExp);
      });

      // Auto-equip first unlocked badge if player has no active badge yet
      setCustomization(c => {
        if (!c.activeBadgeId) {
          return { ...c, activeBadgeId: newlyUnlocked[0].id };
        }
        return c;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    killCount, 
    level, 
    foundLegendaryCount, 
    foundEpicOrBetterCount, 
    skillNodes, 
    bulletTimeUses, 
    completedEventsCount, 
    difficultyTier, 
    companions, 
    defeatedBosses,
    forgedItemsCount
  ]);

  // Dismiss achievement notification
  const handleDismissAchievementNotification = useCallback((notificationId: string) => {
    setAchievementNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Evaluate Codex Lore Unlocks when stage, boss, or difficulty updates
  useEffect(() => {
    setCodexEntries(prev => {
      const next = evaluateCodexUnlocks(prev, currentStage.id, defeatedBosses, difficultyTier);
      const hasChanged = next.some((entry, i) => entry.unlocked !== prev[i]?.unlocked);
      return hasChanged ? next : prev;
    });
  }, [currentStage.id, defeatedBosses, difficultyTier]);

  // Evaluate Weapon Skin Unlocks based on milestones
  useEffect(() => {
    setUnlockedWeaponSkinIds(prev => {
      const next = new Set(prev);
      next.add('skin_default');
      if (level >= 5 || defeatedBosses.length >= 1) next.add('skin_katana_overclock');
      if (level >= 15 || defeatedBosses.length >= 2) next.add('skin_obsidian_stealth');
      if (level >= 25 || defeatedBosses.includes('boss_stage_2') || currentStage.id >= 3) next.add('skin_matrix_glitch');
      if (difficultyTier >= 3 || defeatedBosses.includes('boss_stage_3') || currentStage.id >= 4) next.add('skin_solar_flare');
      if (difficultyTier >= 5 || defeatedBosses.length >= 3) next.add('skin_cryo_saber');
      if (isVictory || defeatedBosses.includes('boss_stage_4')) next.add('skin_void_reaper');
      if (level >= 45 || difficultyTier >= 7) next.add('skin_plasma_cleaver');
      if (difficultyTier >= 10 || (level >= 80 && isVictory)) next.add('skin_prismatic_god');

      if (next.size !== prev.length) {
        return Array.from(next);
      }
      return prev;
    });
  }, [level, defeatedBosses, currentStage.id, difficultyTier, isVictory]);

  // Equip Weapon Skin Handler
  const handleEquipWeaponSkin = useCallback((skinId: string) => {
    setCustomization(c => ({ ...c, activeWeaponSkinId: skinId }));
  }, []);

  // Direct Unlock Weapon Skin with Nanites Handler
  const handleUnlockWeaponSkin = useCallback((skinId: string, cost: number) => {
    if (nanites >= cost) {
      setNanites(n => n - cost);
      setUnlockedWeaponSkinIds(prev => [...new Set([...prev, skinId])]);
      setCustomization(c => ({ ...c, activeWeaponSkinId: skinId }));
    }
  }, [nanites]);

  // Keyboard Shortcuts for skills and quick actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Do not intercept keystrokes if typing inside an input or textarea (e.g. Deus Ex Sophia chat)
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const key = e.key.toLowerCase();

      // UI Windows toggles (only during game or if not typing)
      if (key === 'i') setIsInventoryOpen(v => !v);
      if (key === 'c') setIsCharacterOpen(v => !v);
      if (key === 'k') setIsSkillsOpen(v => !v);
      if (key === 'm') setIsStagesOpen(v => !v);
      if (key === 'p') setIsCompanionsOpen(v => !v);
      if (key === 'u') setIsAchievementsOpen(v => !v);
      if (key === 'g') setIsForgeOpen(v => !v);
      if (key === 'o') setIsArchitectOpen(v => !v);
      if (key === 'x') setIsCodexOpen(v => !v);
      if (key === 't' || key === 'tab') {
        e.preventDefault();
        setIsTacticalDeckOpen(v => !v);
      }
      if (key === '6') handleTriggerOrbitalScan();
      if (key === '7') handleTriggerShadowBrokerDrone();
      if (key === '8') handleTriggerSophiaSTMOverload();

      if (mainView !== 'game' || !hasStarted || isGameOver || isVictory || isPaused) return;

      // Combat Skills Activation
      if (key === '1') {
        // Skill 1: Synaptic Lance
        if (cooldowns.synapticLance <= 0 && currentPsi >= 20) {
          setCurrentPsi(p => p - 20);
          setCooldowns(cd => ({ ...cd, synapticLance: maxCooldowns.synapticLance * (1 - stats.cooldownReduction / 100) }));
          setTriggerAction({ type: 'lance', timestamp: Date.now() });
          trackAbilityUse('lance');
        }
      } else if (key === '2') {
        // Skill 2: EMP Shockwave
        if (cooldowns.empShockwave <= 0 && currentPsi >= 35) {
          setCurrentPsi(p => p - 35);
          setCooldowns(cd => ({ ...cd, empShockwave: maxCooldowns.empShockwave * (1 - stats.cooldownReduction / 100) }));
          setTriggerAction({ type: 'emp', timestamp: Date.now() });
          trackAbilityUse('emp');
        }
      } else if (key === '3') {
        // Skill 3: Psychic Vortex
        if (cooldowns.psychicVortex <= 0 && currentPsi >= 50) {
          setCurrentPsi(p => p - 50);
          setCooldowns(cd => ({ ...cd, psychicVortex: maxCooldowns.psychicVortex * (1 - stats.cooldownReduction / 100) }));
          setTriggerAction({ type: 'vortex', timestamp: Date.now() });
          trackAbilityUse('vortex');
        }
      } else if (key === '4') {
        // Skill 4: Bullet Time Overclock
        if (cooldowns.bulletTime <= 0 && currentPsi >= 40) {
          setCurrentPsi(p => p - 40);
          setCooldowns(cd => ({ ...cd, bulletTime: maxCooldowns.bulletTime * (1 - stats.cooldownReduction / 100) }));
          setBulletTimeActive(true);
          setBulletTimeUses(u => u + 1);
          trackAbilityUse('bulletTime');
          sound.playBulletTime();
          setTimeout(() => setBulletTimeActive(false), 3500);
        }
      } else if (key === ' ' || e.code === 'Space') {
        // Space: Cyber Dash
        if (cooldowns.dash <= 0) {
          setCooldowns(cd => ({ ...cd, dash: maxCooldowns.dash }));
          setTriggerAction({ type: 'dash', timestamp: Date.now() });
          trackAbilityUse('dash');
        }
      }

      // Diablo 4 Potion: F key
      if (key === 'f' && !isInventoryOpen && !isCharacterOpen && !isSkillsOpen && !isStagesOpen && !isCompanionsOpen && !isTraderOpen && !isAchievementsOpen && !isForgeOpen && !isCodexOpen) {
        e.preventDefault();
        setPotionSystem(pot => {
          if (pot.charges <= 0 || pot.cooldownTimer > 0) return pot;
          const healAmount = Math.round(stats.maxHp * (pot.healPercent / 100));
          setCurrentHp(hp => Math.min(stats.maxHp, hp + healAmount));
          sound.playShieldRestore();
          return {
            ...pot,
            charges: pot.charges - 1,
            cooldownTimer: pot.cooldownMax
          };
        });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, isGameOver, isVictory, isPaused, cooldowns, currentPsi, maxCooldowns, stats.cooldownReduction, isPlayerNearTrader, activeWorldEvent, trackAbilityUse]);

  // Audio Toggle
  const handleToggleMute = useCallback(() => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sound.setMuted(nextState);
  }, [isMuted]);

  // Allocate Attribute Point
  const handleAllocateAttribute = useCallback((attr: keyof PlayerAttributes) => {
    if (unspentAttributePoints <= 0) return;
    setUnspentAttributePoints(p => p - 1);
    setAttributes(a => ({ ...a, [attr]: a[attr] + 1 }));
    sound.playEquip();
  }, [unspentAttributePoints]);

  // Upgrade Skill Tree Node
  const handleUpgradeSkill = useCallback((nodeId: string) => {
    if (skillPoints <= 0) return;
    setSkillNodes(nodes => nodes.map(n => {
      if (n.id === nodeId && n.currentRank < n.maxRank) {
        setSkillPoints(sp => sp - 1);
        sound.playLevelUp();
        return { ...n, currentRank: n.currentRank + 1 };
      }
      return n;
    }));
  }, [skillPoints]);

  // Reset Skill Tree
  const handleResetSkills = useCallback(() => {
    let refunded = 0;
    setSkillNodes(nodes => nodes.map(n => {
      refunded += n.currentRank;
      return { ...n, currentRank: 0 };
    }));
    setSkillPoints(sp => sp + refunded);
  }, []);

  // Save Current Loadout Profile
  const handleSaveLoadout = useCallback((profile: EquipmentLoadoutType) => {
    setLoadouts(prev => ({
      ...prev,
      [profile]: { ...equipped }
    }));
    sound.playEquip();
  }, [equipped]);

  // Apply Loadout Profile
  const handleApplyLoadout = useCallback((profile: EquipmentLoadoutType) => {
    const targetLoadout = loadouts[profile];
    if (!targetLoadout) return;

    setActiveLoadout(profile);

    // Current equipped items that are not in target loadout go back to inventory
    const currentEquippedList = Object.values(equipped).filter(Boolean) as EquipmentItem[];
    const targetEquippedList = Object.values(targetLoadout).filter(Boolean) as EquipmentItem[];
    const targetIds = new Set(targetEquippedList.map(i => i.id));

    const updatedInventory = [...inventory, ...currentEquippedList.filter(curr => !targetIds.has(curr.id))]
      .filter(item => !targetIds.has(item.id));

    setEquipped({ ...targetLoadout });
    setInventory(updatedInventory);
    sound.playEquip();
  }, [loadouts, equipped, inventory]);

  // Equip Item
  const handleEquipItem = useCallback((item: EquipmentItem) => {
    const currentEquipped = equipped[item.slot];
    setEquipped(prev => ({ ...prev, [item.slot]: item }));
    setInventory(inv => {
      const filtered = inv.filter(i => i.id !== item.id);
      if (currentEquipped) {
        return [...filtered, currentEquipped];
      }
      return filtered;
    });
    sound.playEquip();
  }, [equipped]);

  // Unequip Item
  const handleUnequipItem = useCallback((slot: ItemSlot) => {
    const item = equipped[slot];
    if (!item) return;
    setEquipped(prev => {
      const updated = { ...prev };
      delete updated[slot];
      return updated;
    });
    setInventory(inv => [...inv, item]);
    sound.playEquip();
  }, [equipped]);

  // Scrap Item for Nanites
  const handleScrapItem = useCallback((itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    setInventory(inv => inv.filter(i => i.id !== itemId));
    setNanites(n => n + item.sellValue);
    sound.playLoot();
  }, [inventory]);

  // ── DIABLO 4: Neural Architect (Occultist) Handlers ──
  const handleExtractAspect = useCallback((item: EquipmentItem, cost: number) => {
    if (!item.legendaryPassive || nanites < cost) return;
    setNanites(n => n - cost);
    // Destroy item
    setInventory(inv => inv.filter(i => i.id !== item.id));
    // Save aspect to codex
    setStoredAspects(prev => [
      ...prev,
      {
        id: 'asp_' + Math.random().toString(36).substr(2, 9),
        name: item.legendaryPassive!.name,
        description: item.legendaryPassive!.description,
        type: item.legendaryPassive!.type,
        extractedFrom: item.name,
        rarity: item.rarity
      }
    ]);
    sound.playCritHit();
  }, [nanites]);

  const handleImprintAspect = useCallback((item: EquipmentItem, aspect: StoredAspect, cost: number) => {
    if (nanites < cost) return;
    setNanites(n => n - cost);
    const updatedItem: EquipmentItem = {
      ...item,
      rarity: 'legendary',
      legendaryPassive: {
        name: aspect.name,
        description: aspect.description,
        type: aspect.type
      },
      imprintedAspectName: aspect.name
    };
    setInventory(inv => inv.map(i => i.id === item.id ? updatedItem : i));
    setEquipped(prev => {
      const updated = { ...prev };
      if (updated[item.slot]?.id === item.id) {
        updated[item.slot] = updatedItem;
      }
      return updated;
    });
    sound.playShieldRestore();
  }, [nanites]);

  const handleRerollAffix = useCallback((item: EquipmentItem, affixIndex: number, cost: number) => {
    if (nanites < cost || affixIndex < 0 || affixIndex >= item.affixes.length) return;
    setNanites(n => n - cost);
    const possibleStats = ['physicalDamage', 'psiDamage', 'armor', 'critChance', 'critDamage', 'moveSpeed', 'cooldownReduction', 'lifeSteal'] as const;
    const rolledStat = possibleStats[Math.floor(Math.random() * possibleStats.length)];
    const rollValue = Math.round(15 + Math.random() * 30 * (1 + level * 0.05));
    
    const updatedAffixes = [...item.affixes];
    updatedAffixes[affixIndex] = {
      name: `Optimisé (${rolledStat})`,
      stat: rolledStat as any,
      value: rollValue
    };

    const updatedItem: EquipmentItem = {
      ...item,
      affixes: updatedAffixes,
      isEnchanted: true
    };

    setInventory(inv => inv.map(i => i.id === item.id ? updatedItem : i));
    setEquipped(prev => {
      const updated = { ...prev };
      if (updated[item.slot]?.id === item.id) {
        updated[item.slot] = updatedItem;
      }
      return updated;
    });
    sound.playEquip();
  }, [nanites, level]);

  const handleSocketModule = useCallback((item: EquipmentItem, socketIndex: number, module: NeuralModule) => {
    if (!item.sockets || socketIndex < 0 || socketIndex >= item.sockets.length) return;
    const updatedSockets = [...item.sockets];
    updatedSockets[socketIndex] = module;

    const updatedItem: EquipmentItem = {
      ...item,
      sockets: updatedSockets
    };

    setInventory(inv => inv.map(i => i.id === item.id ? updatedItem : i));
    setEquipped(prev => {
      const updated = { ...prev };
      if (updated[item.slot]?.id === item.id) {
        updated[item.slot] = updatedItem;
      }
      return updated;
    });
    sound.playEquip();
  }, []);

  const handleUnsocketModule = useCallback((item: EquipmentItem, socketIndex: number) => {
    if (!item.sockets || socketIndex < 0 || socketIndex >= item.sockets.length) return;
    const updatedSockets = [...item.sockets];
    updatedSockets[socketIndex] = null;

    const updatedItem: EquipmentItem = {
      ...item,
      sockets: updatedSockets
    };

    setInventory(inv => inv.map(i => i.id === item.id ? updatedItem : i));
    setEquipped(prev => {
      const updated = { ...prev };
      if (updated[item.slot]?.id === item.id) {
        updated[item.slot] = updatedItem;
      }
      return updated;
    });
    sound.playEquip();
  }, []);

  // ── DOCKER CYBER TOOLS TACTICAL HANDLERS ──
  const handleTriggerOrbitalScan = useCallback(() => {
    if (!tacticalState.worldMonitor.orbitalScanReady) return;
    sound.playShieldRestore();
    setTacticalState(prev => ({
      ...prev,
      worldMonitor: {
        ...prev.worldMonitor,
        orbitalScanReady: false,
        orbitalCooldown: 25,
        lastScanTimestamp: Date.now()
      },
      terminalLogs: [
        ...prev.terminalLogs,
        `[${new Date().toLocaleTimeString()}] [WORLD MONITOR] SCAN ORBITAL EXÉCUTÉ // Télémétrie satellite SkyFi actualisée (+20% Crit).`
      ]
    }));
    setNanites(n => n + 75);
    addExp(150);
  }, [tacticalState.worldMonitor.orbitalScanReady, addExp]);

  const handleTriggerShadowBrokerDrone = useCallback(() => {
    if (!tacticalState.shadowBroker.reconDroneReady) return;
    sound.playLaserShoot();
    setTacticalState(prev => ({
      ...prev,
      shadowBroker: {
        ...prev.shadowBroker,
        reconDroneReady: false,
        droneCooldown: 20
      },
      terminalLogs: [
        ...prev.terminalLogs,
        `[${new Date().toLocaleTimeString()}] [SHADOWBROKER] DRONE OSINT DÉPLOYÉ // Radar SPVM brouillé sur Sainte-Catherine (-40% vitesse).`
      ]
    }));
    setNanites(n => n + 50);
    addExp(120);
  }, [tacticalState.shadowBroker.reconDroneReady, addExp]);

  const handleTriggerSophiaSTMOverload = useCallback(() => {
    if (!tacticalState.sophiaSTM.matrixOverloadReady) return;
    sound.playVictory();
    setTacticalState(prev => ({
      ...prev,
      sophiaSTM: {
        ...prev.sophiaSTM,
        matrixOverloadReady: false,
        matrixCooldown: 30
      },
      terminalLogs: [
        ...prev.terminalLogs,
        `[${new Date().toLocaleTimeString()}] [DEUS EX SOPHIA] DEEPFAKE DE VÉRITÉ DIFFUSÉ // Réseau STM saturé ! Stagger de masse déclenché.`
      ]
    }));
    setKillCount(k => k + 5);
    setNanites(n => n + 150);
    addExp(350);
  }, [tacticalState.sophiaSTM.matrixOverloadReady, addExp]);

  // Cooldown ticker for Tactical Docker Tools
  useEffect(() => {
    const interval = setInterval(() => {
      setTacticalState(prev => {
        let changed = false;
        let wmCooldown = prev.worldMonitor.orbitalCooldown;
        let wmReady = prev.worldMonitor.orbitalScanReady;
        if (wmCooldown > 0) {
          wmCooldown--;
          if (wmCooldown <= 0) wmReady = true;
          changed = true;
        }

        let sbCooldown = prev.shadowBroker.droneCooldown;
        let sbReady = prev.shadowBroker.reconDroneReady;
        if (sbCooldown > 0) {
          sbCooldown--;
          if (sbCooldown <= 0) sbReady = true;
          changed = true;
        }

        let sophiaCooldown = prev.sophiaSTM.matrixCooldown;
        let sophiaReady = prev.sophiaSTM.matrixOverloadReady;
        if (sophiaCooldown > 0) {
          sophiaCooldown--;
          if (sophiaCooldown <= 0) sophiaReady = true;
          changed = true;
        }

        if (!changed) return prev;
        return {
          ...prev,
          worldMonitor: { ...prev.worldMonitor, orbitalCooldown: wmCooldown, orbitalScanReady: wmReady },
          shadowBroker: { ...prev.shadowBroker, droneCooldown: sbCooldown, reconDroneReady: sbReady },
          sophiaSTM: { ...prev.sophiaSTM, matrixCooldown: sophiaCooldown, matrixOverloadReady: sophiaReady }
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Companion Management Handlers
  const handleToggleCompanion = useCallback((companionId: string) => {
    setCompanions(prev => {
      const target = prev.find(c => c.id === companionId);
      if (!target) return prev;
      
      const currentlyActive = prev.filter(c => c.active);
      if (!target.active && currentlyActive.length >= 2) {
        return prev; // Max 2 active
      }

      return prev.map(c => c.id === companionId ? { ...c, active: !c.active } : c);
    });
    sound.playEquip();
  }, []);

  const handleUpgradeCompanion = useCallback((companionId: string) => {
    const companion = companions.find(c => c.id === companionId);
    if (!companion) return;
    const cost = companion.level * 150;
    if (nanites < cost) return;

    setNanites(n => n - cost);
    setCompanions(prev => prev.map(c => {
      if (c.id === companionId) {
        return {
          ...c,
          level: c.level + 1,
          damage: Math.round(c.damage * 1.2),
          hp: Math.round(c.hp * 1.25),
          maxHp: Math.round(c.maxHp * 1.25)
        };
      }
      return c;
    }));
    sound.playLevelUp();
  }, [companions, nanites]);

  // Trader Buy/Sell
  const handleBuyTraderItem = useCallback((item: EquipmentItem) => {
    if (nanites < item.sellValue * 2) return;
    setNanites(n => n - item.sellValue * 2);
    setInventory(inv => [...inv, item]);
    setTraderInventory(prev => prev.filter(i => i.id !== item.id));
    sound.playEquip();
  }, [nanites]);

  const handleSellTraderItem = useCallback((item: EquipmentItem) => {
    handleScrapItem(item.id);
  }, [handleScrapItem]);

  // Cyber-Forge Success Handler
  const handleForgeSuccess = useCallback((consumedItemIds: string[], forgedItem: EquipmentItem, naniteCost: number) => {
    setNanites(n => Math.max(0, n - naniteCost));
    setInventory(inv => {
      const remaining = inv.filter(i => !consumedItemIds.includes(i.id));
      return [...remaining, forgedItem];
    });
    setForgedItemsCount(c => c + 1);
    if (forgedItem.rarity === 'legendary') {
      setFoundLegendaryCount(c => c + 1);
      setFoundEpicOrBetterCount(c => c + 1);
    } else if (forgedItem.rarity === 'epic') {
      setFoundEpicOrBetterCount(c => c + 1);
    }
    addExp(250 + level * 25);
  }, [level, addExp]);

  // Event completion
  const handleEventComplete = useCallback((event: WorldEvent) => {
    setActiveWorldEvent(prev => prev ? { ...prev, status: 'completed' } : null);
    setCompletedEventsCount(c => c + 1);
    setNanites(n => n + event.rewardNanites);
    addExp(event.rewardExp);
    if (event.rewardItemRarity) {
      const loot = generateLootItem(level, difficultyTier, event.rewardItemRarity);
      if (loot.rarity === 'legendary') {
        setFoundLegendaryCount(c => c + 1);
        setFoundEpicOrBetterCount(c => c + 1);
      } else if (loot.rarity === 'epic') {
        setFoundEpicOrBetterCount(c => c + 1);
      }
      setInventory(inv => [...inv, loot]);
    }
    sound.playVictory();
  }, [addExp, level, difficultyTier]);

  // Enemy Killed Handler
  const handleEnemyKilled = useCallback((enemy: CombatEntity) => {
    setKillCount(k => k + 1);
    
    // Check if boss
    if (enemy.isBoss) {
      sound.playVictory();
      setDefeatedBosses(prev => [...new Set([...prev, enemy.id])]);
      if (currentStage.id >= 4) {
        setIsVictory(true);
      }
    }

    // Potion recharge
    setPotionSystem(pot => {
      const newCounter = pot.killCounter + 1;
      if (newCounter >= pot.killsToRecharge && pot.charges < pot.maxCharges) {
        return {
          ...pot,
          charges: Math.min(pot.maxCharges, pot.charges + 1),
          killCounter: 0
        };
      }
      return { ...pot, killCounter: newCounter };
    });

    // Award Nanites, EXP and Bitcoin Satoshis
    const expGained = Math.round((enemy.isBoss ? 450 : 35) * (1 + difficultyTier * 0.2));
    const nanitesGained = Math.round((enemy.isBoss ? 200 : 15) * (1 + difficultyTier * 0.25));
    const btcSatsGained = calculateEnemyBtcDrop(enemy.isBoss ? 'boss' : 'normal', level);
    addExp(expGained);
    setNanites(n => n + nanitesGained);
    setBitcoinWallet(prev => ({
      ...prev,
      satoshis: prev.satoshis + btcSatsGained,
      totalEarnedSatoshis: prev.totalEarnedSatoshis + btcSatsGained
    }));
  }, [currentStage.id, difficultyTier, addExp, level]);

  // Loot Dropped Handler
  const handleLootDropped = useCallback((drop: LootDrop) => {
    sound.playLoot();
    if (drop && drop.item) {
      setInventory(inv => [...inv, drop.item!]);
      if (drop.item.btcValue) {
        const bonusSats = Math.round(drop.item.btcValue * 0.05);
        setBitcoinWallet(prev => ({
          ...prev,
          satoshis: prev.satoshis + bonusSats,
          totalEarnedSatoshis: prev.totalEarnedSatoshis + bonusSats
        }));
      }
      if (drop.item.rarity === 'legendary') {
        setFoundLegendaryCount(c => c + 1);
        setFoundEpicOrBetterCount(c => c + 1);
      } else if (drop.item.rarity === 'epic') {
        setFoundEpicOrBetterCount(c => c + 1);
      }
    }
    if (drop && drop.nanites) {
      setNanites(n => n + drop.nanites!);
    }
  }, []);

  const handleUnlockHack = useCallback((hackId: string, btcPrice: number) => {
    setBitcoinWallet(prev => {
      if (prev.satoshis < btcPrice) return prev;
      return {
        ...prev,
        satoshis: prev.satoshis - btcPrice,
        unlockedHackIds: [...prev.unlockedHackIds, hackId]
      };
    });
  }, []);

  const handleUnlockArsenalItem = useCallback((itemId: string, btcPrice: number) => {
    setBitcoinWallet(prev => {
      if (prev.satoshis < btcPrice) return prev;
      return {
        ...prev,
        satoshis: prev.satoshis - btcPrice,
        unlockedArsenalIds: [...prev.unlockedArsenalIds, itemId]
      };
    });
  }, []);

  const handleExecuteHackLive = useCallback((hack: WorldMonitorHack) => {
    executeWorldMonitorMCP(hack.mcpToolName);
    sound.play('hackSuccess');
  }, []);

  const handleEquipHackerArsenalItem = useCallback((gadget: HackerGadgetItem) => {
    sound.play('equip');
    const newItem: EquipmentItem = {
      id: 'arsenal_' + gadget.id + '_' + Date.now(),
      name: gadget.name,
      slot: gadget.slot,
      rarity: gadget.rarity,
      levelReq: gadget.levelReq,
      itemPower: 650,
      itemPowerBracket: 'ancestral',
      baseStat: {
        name: gadget.slot === 'weapon' ? 'Dégâts Cyber & Physique' : gadget.slot === 'deck' ? 'Puissance de Hack' : 'Protection Crypto-Active',
        value: Math.round((gadget.stats.cyberDamage || gadget.stats.physicalDamage || gadget.stats.psiDamage || 60) * (1 + level * 0.05))
      },
      affixes: [
        { name: 'de Précision Axonale', stat: 'critChance', value: gadget.stats.critChance || 12 },
        { name: 'd’Overclocking Système', stat: 'cooldownReduction', value: 10 }
      ],
      legendaryPassive: gadget.passiveAbility ? {
        name: gadget.passiveAbility.name,
        description: gadget.passiveAbility.description,
        type: 'vampiric_hack'
      } : undefined,
      sellValue: 1200,
      btcValue: gadget.btcValue,
      realWorldSpecs: gadget.realWorldSpecs,
      githubUrl: gadget.githubUrl,
      educationalConcept: gadget.educationalConcept,
      iconName: gadget.icon || 'Cpu'
    };

    setEquipped(prev => ({
      ...prev,
      [gadget.slot]: newItem
    }));
  }, [level]);

  // Update Atmospheric Soundscape intensity based on stage & boss presence
  useEffect(() => {
    sound.updateAtmosphereStage(currentStage.id, bossHp !== null);
  }, [currentStage.id, bossHp]);

  // Clean up or pause atmosphere when game over or victory
  useEffect(() => {
    if (isGameOver) {
      sound.stopAtmosphericLoop(false);
    } else if (hasStarted && !isMuted) {
      sound.updateAtmosphereStage(currentStage.id, bossHp !== null);
    }
  }, [isGameOver, hasStarted, isMuted, currentStage.id, bossHp]);

  // Restart Game
  const handleRestart = useCallback(() => {
    setLevel(1);
    setCurrentExp(0);
    setUnspentAttributePoints(5);
    setSkillPoints(1);
    setNanites(150);
    setKillCount(0);
    setCurrentStage(STAGES_DATA[0]);
    setDifficultyTier(1);
    setAttributes({ synapticPower: 10, cyberOverclock: 10, bioArmor: 10, neuralReflex: 10 });
    setEquipped({
      weapon: generateLootItem(1, 1, 'standard'),
      deck: generateLootItem(1, 1, 'standard')
    });
    setInventory([generateLootItem(1, 1, 'rare')]);
    setSkillNodes(INITIAL_SKILL_TREE);
    setIsGameOver(false);
    setIsVictory(false);
    setBossHp(null);
    setBossMaxHp(null);
    setBossName(null);
    setActiveWorldEvent(null);
    setCurrentHp(150);
    setCurrentPsi(150);
    setBulletTimeUses(0);
    setPotionSystem({
      charges: 4,
      maxCharges: 4,
      healPercent: 35,
      cooldownTimer: 0,
      cooldownMax: 90,
      killsToRecharge: 15,
      killCounter: 0
    });
    setCompletedEventsCount(0);
    setDefeatedBosses([]);
    sound.playVictory();
    sound.updateAtmosphereStage(1, false);
  }, []);

  return (
    <DeviceFramingContainer
      externalMode={viewportMode}
      onModeChange={setViewportMode}
    >
      <div className="relative w-full h-full bg-black overflow-hidden select-none font-sans flex flex-col">
        
        {/* 1. MASTER COMMAND CENTER VIEW (66% Docker Services / 33% Deus Ex Sophia Chat) */}
        {mainView === 'command_center' && (
        <CommandCenterHub
          onLaunchGame={() => handleRequestBattle()}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSkills={() => setIsSkillsOpen(true)}
          onOpenTacticalDeck={() => setIsTacticalDeckOpen(true)}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenCodex={() => setIsCodexOpen(true)}
          onOpenFullApp={handleOpenFullToolApp}
          tacticalState={tacticalState}
          onTriggerOrbitalScan={handleTriggerOrbitalScan}
          onTriggerShadowBrokerDrone={handleTriggerShadowBrokerDrone}
          onTriggerSophiaSTMOverload={handleTriggerSophiaSTMOverload}
        />
      )}

      {/* 2. DEDICATED FULL STANDALONE APPLICATION & GIS MAP PAGE */}
      {mainView === 'tool_app' && (
        <FullToolAppView
          initialToolId={activeToolApp}
          onBackToHub={() => {
            setMainView('command_center');
            window.location.hash = '#/hub';
          }}
          onLaunchGame={() => handleRequestBattle()}
          tacticalState={tacticalState}
          onTriggerOrbitalScan={handleTriggerOrbitalScan}
          onTriggerShadowBrokerDrone={handleTriggerShadowBrokerDrone}
          onTriggerSophiaSTMOverload={handleTriggerSophiaSTMOverload}
          stmSearchRoute={stmSearchRoute}
          setStmSearchRoute={setStmSearchRoute}
          stmLiveReport={stmLiveReport}
          isStmLoading={isStmLoading}
          onSearchSTM={handleSearchSTM}
          deepfakePercent={deepfakePercent}
          onBoostDeepfake={() => setDeepfakePercent(p => Math.min(100, p + 5))}
          hackedPins={hackedPins}
          onHackPin={(id, label) => {
            sound.playVictory();
            setHackedPins(prev => prev.includes(id) ? prev : [...prev, id]);
          }}
          godEyeActive={godEyeActive}
          onToggleGodEye={() => setGodEyeActive(a => !a)}
          onSendSophiaMessage={(msg) => {
            // Sophia query
          }}
          addLog={(log) => {
            // Logs
          }}
          onAwardBtcSats={(sats) => {
            setBitcoinWallet(prev => ({
              ...prev,
              satoshis: prev.satoshis + sats
            }));
          }}
          onAwardXp={(xp) => {
            setCurrentExp(prev => prev + xp);
          }}
        />
      )}

      {/* 3. SIMULACRE // JEU ARPG COMBAT VIEW */}
      {mainView === 'game' && (
        <div className="relative w-full h-full">
          {/* Top Floating Hub Switcher */}
          <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
            <button
              onClick={() => setIs3DEngineActive(v => !v)}
              className={`px-3 py-1.5 font-orbitron font-black text-xs uppercase rounded border transition-all cursor-pointer flex items-center gap-1.5 ${
                is3DEngineActive 
                  ? 'bg-fuchsia-950/80 border-fuchsia-500 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.4)] hover:bg-fuchsia-900/90'
                  : 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-900/90'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{is3DEngineActive ? 'BABYLON.JS 3D // DIABLO × FF' : 'SIMULACRE 2D TACTIQUE'}</span>
            </button>

            <button
              onClick={() => setMainView('command_center')}
              className="px-3 py-1.5 bg-[#0b101d]/90 hover:bg-[#0b101d] border border-[#00f3ff] text-[#00f3ff] font-orbitron font-bold text-xs uppercase rounded shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>CENTRE DE COMMANDEMENT</span>
            </button>
            
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 bg-[#0b101d]/90 border border-white/20 hover:border-white text-gray-300 hover:text-white rounded transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
            </button>
          </div>

          {/* Game Engine Canvas (3D Isometric ARPG vs 2D Tactical) */}
          {is3DEngineActive ? (
            <BabylonARPGEngine
              playerStats={{ ...stats, currentHp, currentPsi }}
              customization={customization}
              currentStage={currentStage}
              difficultyTier={difficultyTier}
              bulletTimeActive={bulletTimeUses > 0}
              activeCompanions={activeCompanions}
              activeWorldEvent={activeWorldEvent}
              onEnemyKilled={handleEnemyKilled}
              onLootDropped={handleLootDropped}
              onPlayerDamaged={(damage: number) => {
                setCurrentHp(hp => {
                  const next = Math.max(0, hp - damage);
                  if (next === 0 && !isGameOver) {
                    setIsGameOver(true);
                    sound.playGameOver();
                  }
                  return next;
                });
              }}
              onPlayerHealed={(amt) => {
                setCurrentHp(hp => Math.min(stats.maxHp, hp + amt));
              }}
              onPsiGained={(amount: number) => {
                setCurrentPsi(psi => Math.min(stats.maxPsi, psi + amount));
              }}
              onBossStateChange={(hp, maxHp, name) => {
                setBossHp(hp);
                setBossMaxHp(maxHp);
                setBossName(name);
              }}
              triggerAction={triggerAction}
              onActionTriggered={() => setTriggerAction({ type: null, timestamp: 0 })}
              isPaused={isPaused || isInventoryOpen || isCharacterOpen || isSkillsOpen || isStagesOpen || isCompanionsOpen || isTraderOpen || isAchievementsOpen || isForgeOpen || isCodexOpen || isTacticalDeckOpen}
              equippedWeapon={equipped.weapon}
            />
          ) : (
            <GameCanvas
              playerStats={{ ...stats, currentHp, currentPsi }}
              customization={customization}
              currentStage={currentStage}
              difficultyTier={difficultyTier}
              activeWorldEvent={activeWorldEvent}
              activeCompanions={activeCompanions}
              onEnemyKilled={handleEnemyKilled}
              onLootDropped={handleLootDropped}
              onPlayerDamaged={(damage: number) => {
                setCurrentHp(hp => {
                  const next = Math.max(0, hp - damage);
                  if (next === 0 && !isGameOver) {
                    setIsGameOver(true);
                    sound.playGameOver();
                  }
                  return next;
                });
              }}
              onPlayerHealed={(amt) => {
                setCurrentHp(hp => Math.min(stats.maxHp, hp + amt));
              }}
              onPsiGained={(amount: number) => {
                setCurrentPsi(psi => Math.min(stats.maxPsi, psi + amount));
              }}
              onBossStateChange={(hp, maxHp, name) => {
                setBossHp(hp);
                setBossMaxHp(maxHp);
                setBossName(name);
              }}
              onEventProgress={(prog) => {
                setActiveWorldEvent(ev => ev ? { ...ev, ...prog } : null);
              }}
              onEventComplete={handleEventComplete}
              onPlayerNearTraderChange={(isNear) => setIsPlayerNearTrader(isNear)}
              triggerAction={triggerAction}
              onActionTriggered={() => setTriggerAction({ type: null, timestamp: 0 })}
              isPaused={isPaused || isInventoryOpen || isCharacterOpen || isSkillsOpen || isStagesOpen || isCompanionsOpen || isTraderOpen || isAchievementsOpen || isForgeOpen || isCodexOpen || isTacticalDeckOpen}
              equippedWeapon={equipped.weapon}
            />
          )}

          {/* Cyberpunk HUD Interface */}
          {!isGameOver && !isVictory && (
            <HUD
              level={level}
              currentExp={currentExp}
              expToNext={expToNext}
              stats={{ ...stats, currentHp, currentPsi }}
              cooldowns={cooldowns}
              maxCooldowns={maxCooldowns}
              currentStage={currentStage}
              difficultyTier={difficultyTier}
              nanites={nanites}
              killCount={killCount}
              requiredKillsForBoss={currentStage.id * 15}
              bossHp={bossHp}
              bossMaxHp={bossMaxHp}
              bossName={bossName}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onOpenInventory={() => setIsInventoryOpen(true)}
              onOpenCharacter={() => setIsCharacterOpen(true)}
              onOpenSkills={() => setIsSkillsOpen(true)}
              onOpenStages={() => setIsStagesOpen(true)}
              onOpenForge={() => setIsForgeOpen(true)}
              onOpenArchitect={() => setIsArchitectOpen(true)}
              onOpenTacticalDeck={() => setIsTacticalDeckOpen(true)}
              onOpenArsenal={() => setIsArsenalOpen(true)}
              bitcoinWallet={bitcoinWallet}
              onOpenCodex={() => setIsCodexOpen(true)}
              unlockedCodexCount={codexEntries.filter(e => e.unlocked).length}
              totalCodexCount={codexEntries.length}
              onOpenCompanions={() => setIsCompanionsOpen(true)}
              onOpenAchievements={() => setIsAchievementsOpen(true)}
              achievements={achievements}
              bulletTimeActive={bulletTimeActive}
              potionSystem={potionSystem}
              attributes={attributes}
              equipped={equipped}
              customization={customization}
              activeCompanionCount={activeCompanions.length}
              is3DEngineActive={is3DEngineActive}
              onToggle3DEngine={() => setIs3DEngineActive(v => !v)}
              onOpenWorldMonitor={() => setIsWorldMonitorOpen(true)}
            />
          )}

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
              <div className="max-w-md w-full bg-[#11111a] border border-[#ff0044] p-8 text-center shadow-[0_0_50px_rgba(255,0,68,0.4)] relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#ff0044]" />
                <ShieldAlert className="w-16 h-16 text-[#ff0044] mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-orbitron font-bold text-[#ff0044] mb-2 uppercase italic">
                  SIGNAL SYNAPTIQUE INTERROMPU
                </h2>
                <p className="text-xs text-gray-300 mb-6 font-mono">
                  Votre enveloppe biométrique a succombé aux mercenaires de Viktor Vance.
                </p>
                <button
                  onClick={handleRestart}
                  className="w-full py-3 bg-[#ff0044] hover:bg-[#ff0044]/90 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,68,0.5)] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  RÉINITIALISER LE LIEN NEURAL
                </button>
              </div>
            </div>
          )}

          {/* Victory Screen */}
          {isVictory && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
              <div className="max-w-lg w-full bg-[#11111a] border border-[#00ff41] p-8 text-center shadow-[0_0_50px_rgba(0,255,65,0.4)] relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#00ff41]" />
                <Trophy className="w-16 h-16 text-[#00ff41] mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-orbitron font-bold text-[#00ff41] mb-2 uppercase italic">
                  SECTEUR DE MONTRÉAL LIBÉRÉ !
                </h2>
                <p className="text-xs text-gray-300 leading-relaxed mb-6 font-sans">
                  Le cartel Apex a été chassé de ce secteur. Les données citoyennes ont été restaurées par Deus Ex Sophia.
                </p>
                <button
                  onClick={handleRestart}
                  className="w-full py-3 bg-[#00ff41] hover:bg-[#00ff41]/90 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,65,0.5)] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  SECTEUR SUIVANT
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={inventory}
        equipped={equipped}
        nanites={nanites}
        onEquipItem={handleEquipItem}
        onUnequipItem={handleUnequipItem}
        onScrapItem={handleScrapItem}
        onOpenForge={() => setIsForgeOpen(true)}
        onOpenArchitect={() => {
          setIsInventoryOpen(false);
          setIsArchitectOpen(true);
        }}
        loadouts={loadouts}
        activeLoadout={activeLoadout}
        onSaveLoadout={handleSaveLoadout}
        onApplyLoadout={handleApplyLoadout}
      />

      <CharacterModal
        isOpen={isCharacterOpen}
        onClose={() => setIsCharacterOpen(false)}
        level={level}
        unspentAttributePoints={unspentAttributePoints}
        attributes={attributes}
        stats={stats}
        customization={customization}
        achievements={achievements}
        unlockedWeaponSkinIds={unlockedWeaponSkinIds}
        nanites={nanites}
        onAllocateAttribute={handleAllocateAttribute}
        onUpdateCustomization={(up) => setCustomization(c => ({ ...c, ...up }))}
        onEquipBadge={(badgeId) => setCustomization(c => ({ ...c, activeBadgeId: badgeId }))}
        onEquipWeaponSkin={handleEquipWeaponSkin}
        onUnlockWeaponSkin={handleUnlockWeaponSkin}
        onOpenAchievements={() => {
          setIsCharacterOpen(false);
          setIsAchievementsOpen(true);
        }}
      />

      <SkillTreeModal
        isOpen={isSkillsOpen}
        onClose={() => setIsSkillsOpen(false)}
        skillPoints={skillPoints}
        skillNodes={skillNodes}
        abilityMastery={abilityMastery}
        onUpgradeSkill={handleUpgradeSkill}
        onResetSkills={handleResetSkills}
      />

      <StageSelectorModal
        isOpen={isStagesOpen}
        onClose={() => setIsStagesOpen(false)}
        currentStageId={currentStage.id}
        difficultyTier={difficultyTier}
        onSelectStage={(st) => {
          setCurrentStage(st);
          setKillCount(0);
          setBossHp(null);
          setBossMaxHp(null);
          setBossName(null);
          setActiveWorldEvent(null);
        }}
        onSetDifficulty={(tier) => setDifficultyTier(tier)}
      />

      <CompanionsModal
        isOpen={isCompanionsOpen}
        onClose={() => setIsCompanionsOpen(false)}
        companions={companions}
        nanites={nanites}
        onToggleCompanion={handleToggleCompanion}
        onUpgradeCompanion={handleUpgradeCompanion}
      />

      <TraderModal
        isOpen={isTraderOpen}
        onClose={() => setIsTraderOpen(false)}
        items={traderInventory}
        playerNanites={nanites}
        playerInventory={inventory}
        onBuyItem={handleBuyTraderItem}
        onSellItem={handleSellTraderItem}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
        activeBadgeId={customization.activeBadgeId}
        onEquipBadge={(badgeId) => setCustomization(c => ({ ...c, activeBadgeId: badgeId }))}
      />

      <CyberForgeModal
        isOpen={isForgeOpen}
        onClose={() => setIsForgeOpen(false)}
        inventory={inventory}
        nanites={nanites}
        playerLevel={level}
        difficultyTier={difficultyTier}
        onForgeSuccess={handleForgeSuccess}
      />

      <CodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        entries={codexEntries}
        currentStageId={currentStage.id}
      />

      <NeuralArchitectModal
        isOpen={isArchitectOpen}
        onClose={() => setIsArchitectOpen(false)}
        inventory={inventory}
        equipped={equipped}
        nanites={nanites}
        storedAspects={storedAspects}
        neuralModules={neuralModules}
        onExtractAspect={handleExtractAspect}
        onImprintAspect={handleImprintAspect}
        onRerollAffix={handleRerollAffix}
        onSocketModule={handleSocketModule}
        onUnsocketModule={handleUnsocketModule}
      />

      <StoryIntroModal
        isOpen={isStoryIntroOpen}
        onComplete={() => {
          setIsStoryIntroOpen(false);
          handleStartGame();
        }}
      />

      <TacticalDeckModal
        isOpen={isTacticalDeckOpen}
        onClose={() => setIsTacticalDeckOpen(false)}
        tacticalState={tacticalState}
        onTriggerOrbitalScan={handleTriggerOrbitalScan}
        onTriggerShadowBrokerDrone={handleTriggerShadowBrokerDrone}
        onTriggerSophiaSTMOverload={handleTriggerSophiaSTMOverload}
      />

      <HackerArsenalModal
        isOpen={isArsenalOpen}
        onClose={() => setIsArsenalOpen(false)}
        bitcoinWallet={bitcoinWallet}
        onUnlockHack={handleUnlockHack}
        onUnlockArsenalItem={handleUnlockArsenalItem}
        onEquipItem={handleEquipHackerArsenalItem}
        onExecuteHack={handleExecuteHackLive}
      />

      {/* Final Fantasy VII Style Combat Encounter Confirmation Dialog */}
      <FF7BattleEncounterModal
        isOpen={isFF7EncounterOpen}
        encounterData={battleEncounterData}
        playerLevel={level}
        playerHp={currentHp}
        playerMaxHp={stats.maxHp}
        playerPsi={currentPsi}
        playerMaxPsi={stats.maxPsi}
        currentStage={currentStage}
        onAcceptBattle={handleConfirmBattle}
        onRefuseBattle={handleRefuseBattle}
      />

      <WorldMonitorModal
        isOpen={isWorldMonitorOpen}
        onClose={() => setIsWorldMonitorOpen(false)}
        securityClearance={level >= 10 ? 5 : 2}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        viewportMode={viewportMode}
        onViewportModeChange={setViewportMode}
      />
      </div>
    </DeviceFramingContainer>
  );
}
