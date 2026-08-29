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
  LootDrop 
} from './types';
import { STAGES_DATA, INITIAL_SKILL_TREE } from './utils/stageData';
import { generateLootItem, getRequiredExp } from './utils/lootGenerator';
import { sound } from './utils/audio';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { InventoryModal } from './components/InventoryModal';
import { CharacterModal } from './components/CharacterModal';
import { SkillTreeModal } from './components/SkillTreeModal';
import { StageSelectorModal } from './components/StageSelectorModal';
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
  Crosshair
} from 'lucide-react';

export default function App() {
  // Game Flow State
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Player Progression
  const [level, setLevel] = useState<number>(1);
  const [currentExp, setCurrentExp] = useState<number>(0);
  const [unspentAttributePoints, setUnspentAttributePoints] = useState<number>(5);
  const [skillPoints, setSkillPoints] = useState<number>(1);
  const [nanites, setNanites] = useState<number>(150);
  const [killCount, setKillCount] = useState<number>(0);

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

  // Skill Tree
  const [skillNodes, setSkillNodes] = useState<SkillNode[]>(INITIAL_SKILL_TREE);

  // Avatar Customization
  const [customization, setCustomization] = useState<AvatarCustomization>({
    hairColor: '#00f0ff',
    visorColor: '#00f0ff',
    suitColor: '#111827',
    bladeColor: '#00f0ff',
    auraColor: '#00f0ff',
    gender: 'cyborg'
  });

  // Stages & Difficulty
  const [currentStage, setCurrentStage] = useState<StageInfo>(STAGES_DATA[0]);
  const [difficultyTier, setDifficultyTier] = useState<number>(1);

  // Modals Open State
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isCharacterOpen, setIsCharacterOpen] = useState<boolean>(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState<boolean>(false);
  const [isStagesOpen, setIsStagesOpen] = useState<boolean>(false);

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

  const [bulletTimeActive, setBulletTimeActive] = useState<boolean>(false);

  // Action Trigger for Canvas Engine
  const [triggerAction, setTriggerAction] = useState<{
    type: 'primary' | 'lance' | 'emp' | 'vortex' | 'bulletTime' | 'dash' | null;
    timestamp: number;
  }>({
    type: null,
    timestamp: 0
  });

  // Cooldown Max Values
  const maxCooldowns = useMemo(() => ({
    primary: 0.2,
    synapticLance: 2.0,
    empShockwave: 5.0,
    psychicVortex: 8.0,
    bulletTime: 14.0,
    dash: 1.2
  }), []);

  // Compute Total Player Stats based on level, attributes, gear, and skill nodes
  const stats: PlayerStats = useMemo(() => {
    // Base stats
    let maxHp = 250 + level * 20 + attributes.bioArmor * 25;
    let maxPsi = 100 + level * 10 + attributes.synapticPower * 12;
    let physicalDamage = 25 + level * 3 + attributes.neuralReflex * 2;
    let psiDamage = 30 + level * 4 + attributes.synapticPower * 4;
    let armor = 10 + attributes.bioArmor * 2;
    let critChance = 5 + attributes.synapticPower * 0.4 + attributes.neuralReflex * 0.2;
    let critDamage = 150;
    let moveSpeed = 4.5 + attributes.neuralReflex * 0.05;
    let cooldownReduction = Math.min(45, attributes.cyberOverclock * 0.3);
    let dodgeChance = Math.min(35, attributes.neuralReflex * 0.5);
    let lifeSteal = 0;
    let hpRegen = 1 + attributes.bioArmor * 0.2;
    let psiRegen = 2 + attributes.synapticPower * 0.3;

    // Add Equipped Item Stats & Affixes
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

    return {
      maxHp: Math.round(maxHp),
      currentHp: Math.round(maxHp), // dynamic clamp handled in state
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
  }, [level, attributes, equipped, skillNodes]);

  // Current HP & Mana state tracking
  const [currentHp, setCurrentHp] = useState<number>(stats.maxHp);
  const [currentPsi, setCurrentPsi] = useState<number>(stats.maxPsi);

  // Sync HP/Psi on max change
  useEffect(() => {
    setCurrentHp(prev => Math.min(stats.maxHp, prev || stats.maxHp));
    setCurrentPsi(prev => Math.min(stats.maxPsi, prev || stats.maxPsi));
  }, [stats.maxHp, stats.maxPsi]);

  // Passive HP/Mana Regeneration Tick
  useEffect(() => {
    if (!hasStarted || isGameOver || isVictory) return;
    const interval = setInterval(() => {
      setCurrentHp(hp => Math.min(stats.maxHp, hp + stats.hpRegen));
      setCurrentPsi(psi => Math.min(stats.maxPsi, psi + stats.psiRegen));
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isGameOver, isVictory, stats.maxHp, stats.maxPsi, stats.hpRegen, stats.psiRegen]);

  // Cooldown decrement loop
  useEffect(() => {
    if (!hasStarted || isPaused) return;
    const interval = setInterval(() => {
      setCooldowns(cd => ({
        primary: Math.max(0, cd.primary - 0.1),
        synapticLance: Math.max(0, cd.synapticLance - 0.1),
        empShockwave: Math.max(0, cd.empShockwave - 0.1),
        psychicVortex: Math.max(0, cd.psychicVortex - 0.1),
        bulletTime: Math.max(0, cd.bulletTime - 0.1),
        dash: Math.max(0, cd.dash - 0.1)
      }));
    }, 100);
    return () => clearInterval(interval);
  }, [hasStarted, isPaused]);

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
        setSkillPoints(pts => pts + 1);
        sound.playLevelUp();
        req = getRequiredExp(curLevel);
      }
      return newExp;
    });
  }, [level]);

  // Skill Execution Handlers
  const triggerSkill = useCallback((skillKey: 'primary' | 'lance' | 'emp' | 'vortex' | 'bulletTime' | 'dash') => {
    if (isGameOver || isVictory) return;

    if (skillKey === 'primary') {
      setTriggerAction({ type: 'primary', timestamp: Date.now() });
    } else if (skillKey === 'lance' && cooldowns.synapticLance <= 0) {
      if (currentPsi < 15) return;
      setCurrentPsi(psi => Math.max(0, psi - 15));
      const cd = maxCooldowns.synapticLance * (1 - stats.cooldownReduction / 100);
      setCooldowns(c => ({ ...c, synapticLance: cd }));
      setTriggerAction({ type: 'lance', timestamp: Date.now() });
    } else if (skillKey === 'emp' && cooldowns.empShockwave <= 0) {
      if (currentPsi < 25) return;
      setCurrentPsi(psi => Math.max(0, psi - 25));
      const cd = maxCooldowns.empShockwave * (1 - stats.cooldownReduction / 100);
      setCooldowns(c => ({ ...c, empShockwave: cd }));
      setTriggerAction({ type: 'emp', timestamp: Date.now() });
    } else if (skillKey === 'vortex' && cooldowns.psychicVortex <= 0) {
      if (currentPsi < 40) return;
      setCurrentPsi(psi => Math.max(0, psi - 40));
      const cd = maxCooldowns.psychicVortex * (1 - stats.cooldownReduction / 100);
      setCooldowns(c => ({ ...c, psychicVortex: cd }));
      setTriggerAction({ type: 'vortex', timestamp: Date.now() });
    } else if (skillKey === 'bulletTime' && cooldowns.bulletTime <= 0) {
      if (currentPsi < 50) return;
      setCurrentPsi(psi => Math.max(0, psi - 50));
      const cd = maxCooldowns.bulletTime * (1 - stats.cooldownReduction / 100);
      setCooldowns(c => ({ ...c, bulletTime: cd }));
      setBulletTimeActive(true);
      sound.playBulletTime();
      setTimeout(() => {
        setBulletTimeActive(false);
      }, 4000);
    } else if (skillKey === 'dash' && cooldowns.dash <= 0) {
      const cd = maxCooldowns.dash * (1 - stats.cooldownReduction / 100);
      setCooldowns(c => ({ ...c, dash: cd }));
      setTriggerAction({ type: 'dash', timestamp: Date.now() });
    }
  }, [cooldowns, currentPsi, isGameOver, isVictory, maxCooldowns, stats.cooldownReduction]);

  // Keyboard Shortcuts (Q, W, E, R, Space, I, C, K, M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasStarted) return;
      const key = e.key.toLowerCase();

      // UI Toggles
      if (key === 'i') {
        setIsInventoryOpen(prev => !prev);
      } else if (key === 'c') {
        setIsCharacterOpen(prev => !prev);
      } else if (key === 'k') {
        setIsSkillsOpen(prev => !prev);
      } else if (key === 'm') {
        setIsStagesOpen(prev => !prev);
      } else if (key === 'q' || key === '1') {
        triggerSkill('lance');
      } else if (key === 'w' || key === '2') {
        triggerSkill('emp');
      } else if (key === 'e' || key === '3') {
        triggerSkill('vortex');
      } else if (key === 'r' || key === '4') {
        triggerSkill('bulletTime');
      } else if (key === ' ' || key === 'shift') {
        triggerSkill('dash');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, triggerSkill]);

  // Combat Handlers
  const handleEnemyKilled = useCallback((enemy: CombatEntity) => {
    addExp(enemy.xpReward);
    setKillCount(k => k + 1);

    // If final stage boss is defeated
    if (enemy.isBoss && currentStage.id === 4) {
      setIsVictory(true);
    }
  }, [addExp, currentStage.id]);

  const handleLootDropped = useCallback((loot: LootDrop) => {
    // Generate actual procedural equipment item
    const newItem = generateLootItem(level, difficultyTier);
    sound.playLootDrop(newItem.rarity);

    setInventory(inv => {
      if (inv.length < 24) {
        return [newItem, ...inv];
      }
      return inv;
    });

    if (loot.nanites) {
      setNanites(n => n + loot.nanites!);
    }
  }, [level, difficultyTier]);

  const handlePlayerDamaged = useCallback((amount: number) => {
    // Check dodge
    if (Math.random() * 100 < stats.dodgeChance) {
      return; // Dodged!
    }

    setCurrentHp(hp => {
      const nextHp = hp - amount;
      if (nextHp <= 0) {
        setIsGameOver(true);
        return 0;
      }
      return nextHp;
    });
  }, [stats.dodgeChance]);

  const handlePlayerHealed = useCallback((amount: number) => {
    setCurrentHp(hp => Math.min(stats.maxHp, hp + amount));
  }, [stats.maxHp]);

  // Equipment & Inventory Handlers
  const handleEquipItem = (item: EquipmentItem) => {
    setEquipped(prev => {
      const previousEquipped = prev[item.slot];
      const nextEquipped = { ...prev, [item.slot]: item };

      // Swap in inventory
      setInventory(inv => {
        const filtered = inv.filter(i => i.id !== item.id);
        if (previousEquipped) {
          return [previousEquipped, ...filtered];
        }
        return filtered;
      });

      return nextEquipped;
    });
  };

  const handleUnequipItem = (slot: ItemSlot) => {
    setEquipped(prev => {
      const item = prev[slot];
      if (!item) return prev;
      if (inventory.length >= 24) return prev;

      setInventory(inv => [item, ...inv]);
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  };

  const handleScrapItem = (item: EquipmentItem) => {
    setInventory(inv => inv.filter(i => i.id !== item.id));
    setNanites(n => n + item.sellValue);
    sound.playSlash();
  };

  // Skill Tree Allocation
  const handleUpgradeSkill = (nodeId: string) => {
    if (skillPoints <= 0) return;
    setSkillNodes(nodes =>
      nodes.map(n => {
        if (n.id === nodeId && n.currentRank < n.maxRank) {
          setSkillPoints(pts => pts - 1);
          return { ...n, currentRank: n.currentRank + 1 };
        }
        return n;
      })
    );
  };

  const handleResetSkills = () => {
    let totalInvested = 0;
    skillNodes.forEach(n => {
      totalInvested += n.currentRank;
    });
    setSkillPoints(pts => pts + totalInvested);
    setSkillNodes(INITIAL_SKILL_TREE);
  };

  // Attribute Allocation
  const handleAllocateAttribute = (attr: keyof PlayerAttributes) => {
    if (unspentAttributePoints <= 0) return;
    setUnspentAttributePoints(pts => pts - 1);
    setAttributes(prev => ({
      ...prev,
      [attr]: prev[attr] + 1
    }));
  };

  // Audio Toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  // Start Game
  const handleStartGame = () => {
    setHasStarted(true);
    sound.startCyberpunkMusic();
  };

  // Restart after death or victory
  const handleRestart = () => {
    setIsGameOver(false);
    setIsVictory(false);
    setCurrentHp(stats.maxHp);
    setCurrentPsi(stats.maxPsi);
    setKillCount(0);
    setBossHp(null);
    setBossMaxHp(null);
    setBossName(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-chakra">
      {/* 60 FPS Real-time Action Engine Canvas */}
      {hasStarted && (
        <GameCanvas
          playerStats={{ ...stats, currentHp, currentPsi }}
          customization={customization}
          currentStage={currentStage}
          difficultyTier={difficultyTier}
          bulletTimeActive={bulletTimeActive}
          onEnemyKilled={handleEnemyKilled}
          onLootDropped={handleLootDropped}
          onPlayerDamaged={handlePlayerDamaged}
          onPlayerHealed={handlePlayerHealed}
          onBossStateChange={(hp, maxHp, name) => {
            setBossHp(hp);
            setBossMaxHp(maxHp);
            setBossName(name);
          }}
          triggerAction={triggerAction}
          onActionTriggered={() => setTriggerAction({ type: null, timestamp: 0 })}
          isPaused={isPaused || isInventoryOpen || isCharacterOpen || isSkillsOpen || isStagesOpen}
          equippedWeapon={equipped.weapon}
        />
      )}

      {/* Cyberpunk HUD Interface */}
      {hasStarted && !isGameOver && !isVictory && (
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
          bulletTimeActive={bulletTimeActive}
          attributes={attributes}
          equipped={equipped}
        />
      )}

      {/* Title & Start Screen with Immersive UI Styling */}
      {!hasStarted && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-[#050506] text-[#c0c0c0]"
          style={{ backgroundImage: 'radial-gradient(circle at center, #111118 0%, #050506 100%)' }}
        >
          {/* Subtle Grid Overlay */}
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          <div className="max-w-2xl w-full bg-[#11111a]/95 border border-[#00f3ff44] p-8 relative shadow-[0_0_80px_rgba(0,243,255,0.15)] flex flex-col items-center text-center z-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] via-[#ff00ff] to-[#00ff41]" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00f3ff22] border border-[#00f3ff] text-[#00f3ff] text-xs font-orbitron font-bold mb-4 tracking-widest">
              <Zap className="w-3.5 h-3.5" />
              ACTION-RPG HACK & SLASH // MONTRÉAL 2033
            </div>

            <h1 className="text-4xl sm:text-5xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-white to-[#ff00ff] tracking-wider mb-2 uppercase italic drop-shadow-[0_0_20px_rgba(0,243,255,0.6)]">
              NEURAL REBEL: OVERLOAD
            </h1>
            <p className="text-xs font-mono text-[#00f3ff] uppercase tracking-[0.2em] mb-6">
              Éveil Psychique & Insurrection Cybernétique
            </p>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-8 max-w-lg font-sans">
              Montréal 2033 est sous le joug d'une mégacorporation totalitaire asservissant la population par des implants neuraux obligatoires. Incarnez un hacker éveillé à des pouvoirs télékinétiques dévastateurs, traversez les 4 bastions urbains et libérez le réseau de la métropole.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-8 text-xs font-orbitron">
              <div className="bg-[#222] border-l-2 border-[#f2994a] p-3 text-left">
                <span className="text-[#f2994a] block font-bold text-xs uppercase">NIVEAU 1-99</span>
                <span className="text-[10px] text-gray-400 font-mono">Courbe Exp.</span>
              </div>
              <div className="bg-[#222] border-l-2 border-[#00f3ff] p-3 text-left">
                <span className="text-[#00f3ff] block font-bold text-xs uppercase">4 BASTIONS</span>
                <span className="text-[10px] text-gray-400 font-mono">Montréal 2033</span>
              </div>
              <div className="bg-[#222] border-l-2 border-[#9b51e0] p-3 text-left">
                <span className="text-[#9b51e0] block font-bold text-xs uppercase">LOOT LÉGENDAIRE</span>
                <span className="text-[10px] text-gray-400 font-mono">4 Raretés</span>
              </div>
              <div className="bg-[#222] border-l-2 border-[#ff00ff] p-3 text-left">
                <span className="text-[#ff00ff] block font-bold text-xs uppercase">MATRIX T1-10</span>
                <span className="text-[10px] text-gray-400 font-mono">Overclock</span>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full sm:w-auto px-10 py-3.5 bg-[#00f3ff] hover:bg-[#00f3ff]/90 text-black font-orbitron font-black text-sm tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(0,243,255,0.6)] flex items-center justify-center gap-3 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              LANCER L’INTRUSION
            </button>
          </div>
        </div>
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
              Votre enveloppe biométrique a succombé aux forces de sécurité corporatistes. Vos implants se réinitialisent.
            </p>
            <button
              onClick={handleRestart}
              className="w-full py-3 bg-[#ff0044] hover:bg-[#ff0044]/90 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,68,0.5)]"
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
          <div className="max-w-lg w-full bg-[#11111a] border border-[#f2994a] p-8 text-center shadow-[0_0_50px_rgba(242,153,74,0.5)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#f2994a]" />
            <Trophy className="w-16 h-16 text-[#f2994a] mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-orbitron font-bold text-[#f2994a] mb-2 uppercase italic">
              MONTRÉAL EST LIBÉRÉE !
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed mb-6 font-sans">
              L'Architecte de l'Asservissement est vaincu au sommet du Mont-Royal. Le coupe-circuit neural planétaire a été détruit. Le peuple de Montréal a retrouvé sa liberté et sa conscience numérique.
            </p>
            <div className="bg-[#222] border-l-2 border-[#00f3ff] p-4 mb-6 text-left text-xs font-mono text-[#00f3ff]">
              <div>Neutralisations Totales : {killCount}</div>
              <div>Nanites Récoltés : {nanites}</div>
              <div>Niveau Atteint : {level} / 99</div>
            </div>
            <button
              onClick={handleRestart}
              className="w-full py-3 bg-[#f2994a] hover:bg-[#f2994a]/90 text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(242,153,74,0.5)]"
            >
              <RotateCcw className="w-4 h-4" />
              CONTINUER L’AVENTURE EN OVERCLOCK TIER 10
            </button>
          </div>
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
      />

      <CharacterModal
        isOpen={isCharacterOpen}
        onClose={() => setIsCharacterOpen(false)}
        level={level}
        unspentAttributePoints={unspentAttributePoints}
        attributes={attributes}
        stats={stats}
        customization={customization}
        onAllocateAttribute={handleAllocateAttribute}
        onUpdateCustomization={(up) => setCustomization(c => ({ ...c, ...up }))}
      />

      <SkillTreeModal
        isOpen={isSkillsOpen}
        onClose={() => setIsSkillsOpen(false)}
        skillPoints={skillPoints}
        skillNodes={skillNodes}
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
        }}
        onSetDifficulty={(tier) => setDifficultyTier(tier)}
      />
    </div>
  );
}
