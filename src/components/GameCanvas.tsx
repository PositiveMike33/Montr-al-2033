import React, { useRef, useEffect, useState } from 'react';
import { 
  CombatEntity, 
  Projectile, 
  AreaEffect, 
  LootDrop, 
  FloatingText, 
  Particle, 
  PlayerStats, 
  AvatarCustomization, 
  StageInfo, 
  EquipmentItem, 
  Companion, 
  WorldEvent, 
  CyberSoldierClass,
  StatusEffect,
  StatusEffectType,
  DamageType
} from '../types';
import { sound } from '../utils/audio';
import { generateBossLootItem, generateLootItem } from '../utils/lootGenerator';
import { 
  rollEliteAffixes, 
  getDefaultResistances, 
  processEliteAffixes, 
  TelegraphedHazard, 
  ELITE_AFFIXES_CATALOG 
} from '../utils/eliteAffixes';
import { 
  drawDiabloIsometricFloor, 
  drawIsometricPlayerHeadToToe, 
  draw3DCyberSoldier, 
  draw3DCompanion,
  drawEntityShadow
} from '../utils/isometricRenderEngine';
import { TacticalGridEngine, WEATHER_CONDITIONS } from '../utils/TacticalGridEngine';
import { TacticalLayer, MissionState } from '../types/tacticalBattlespace';
import { BattlespaceTacticalOverlay } from './BattlespaceTacticalOverlay';

interface GameCanvasProps {
  playerStats: PlayerStats;
  customization: AvatarCustomization;
  currentStage: StageInfo;
  difficultyTier: number;
  bulletTimeActive: boolean;
  activeCompanions: Companion[];
  activeWorldEvent: WorldEvent | null;
  onEnemyKilled: (enemy: CombatEntity) => void;
  onLootDropped: (loot: LootDrop) => void;
  onPlayerDamaged: (amount: number) => void;
  onPlayerHealed: (amount: number) => void;
  onPsiGained: (amount: number) => void;
  onBossStateChange: (bossHp: number | null, bossMaxHp: number | null, bossName: string | null) => void;
  onEventProgress?: (progress: Partial<WorldEvent>) => void;
  onEventComplete?: (event: WorldEvent) => void;
  onEventFail?: (event: WorldEvent) => void;
  onPlayerNearTraderChange?: (isNear: boolean) => void;
  triggerAction: {
    type: 'primary' | 'lance' | 'emp' | 'vortex' | 'bulletTime' | 'dash' | null;
    timestamp: number;
  };
  onActionTriggered: () => void;
  isPaused: boolean;
  equippedWeapon?: EquipmentItem;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  playerStats,
  customization,
  currentStage,
  difficultyTier,
  bulletTimeActive,
  activeCompanions,
  activeWorldEvent,
  onEnemyKilled,
  onLootDropped,
  onPlayerDamaged,
  onPlayerHealed,
  onPsiGained,
  onBossStateChange,
  onEventProgress,
  onEventComplete,
  onEventFail,
  onPlayerNearTraderChange,
  triggerAction,
  onActionTriggered,
  isPaused,
  equippedWeapon
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tacticalEngineRef = useRef<TacticalGridEngine>(new TacticalGridEngine(80, 80, 32));
  
  // Tactical State & Layer Filters
  const [missionState, setMissionState] = useState<MissionState>(() => 
    tacticalEngineRef.current.generateMontrealStageTacticalMap(currentStage.id)
  );
  const [activeFilter, setActiveFilter] = useState<TacticalLayer>(TacticalLayer.NONE);
  const [stealthStatus, setStealthStatus] = useState<{
    stealthMultiplier: number;
    activeTags: string[];
    isUnderCover: boolean;
  }>({
    stealthMultiplier: 1.0,
    activeTags: [],
    isUnderCover: true
  });
  const [isNearTerminal, setIsNearTerminal] = useState<boolean>(false);
  const [isNearExfil, setIsNearExfil] = useState<boolean>(false);
  const [nearbyPoiId, setNearbyPoiId] = useState<string | null>(null);

  // Synchronized Props Reference to eliminate React re-render stutters & loop restarts
  const propsRef = useRef({
    playerStats,
    customization,
    currentStage,
    difficultyTier,
    bulletTimeActive,
    activeCompanions,
    activeWorldEvent,
    onEnemyKilled,
    onLootDropped,
    onPlayerDamaged,
    onPlayerHealed,
    onPsiGained,
    onBossStateChange,
    onEventProgress,
    onEventComplete,
    onEventFail,
    onPlayerNearTraderChange,
    isPaused,
    equippedWeapon
  });

  propsRef.current = {
    playerStats,
    customization,
    currentStage,
    difficultyTier,
    bulletTimeActive,
    activeCompanions,
    activeWorldEvent,
    onEnemyKilled,
    onLootDropped,
    onPlayerDamaged,
    onPlayerHealed,
    onPsiGained,
    onBossStateChange,
    onEventProgress,
    onEventComplete,
    onEventFail,
    onPlayerNearTraderChange,
    isPaused,
    equippedWeapon
  };

  // Mutable Game Loop State Ref for 60 FPS performance without React re-render lag
  const stateRef = useRef<{
    player: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      angle: number;
      isAttacking: boolean;
      attackTimer: number;
      comboStep: number;
      isDashing: boolean;
      dashTimer: number;
      iFrames: boolean;
      dashVx: number;
      dashVy: number;
      trail: Array<{ x: number; y: number; alpha: number; color: string }>;
    };
    companions: Array<{
      id: string;
      name: string;
      role: 'support' | 'tank' | 'offense';
      color: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      angle: number;
      targetId: string | null;
      attackCooldown: number;
      specialCooldown: number;
      hp: number;
      maxHp: number;
      damage: number;
      attackRange: number;
    }>;
    keys: { [key: string]: boolean };
    mouse: { x: number; y: number; isDown: boolean };
    hoveredEnemyId: string | null;
    enemies: CombatEntity[];
    projectiles: Projectile[];
    areaEffects: AreaEffect[];
    lootDrops: LootDrop[];
    floatingTexts: FloatingText[];
    particles: Particle[];
    lastSpawnTime: number;
    bossSpawned: boolean;
    activeBoss: CombatEntity | null;
    camera: { x: number; y: number };
    worldSize: { width: number; height: number };
    killCounter: number;
    hitFreezeTimer: number;
    eventSpawnedEnemies: boolean;
    screenShake: number;
    playerStatusEffects: StatusEffect[];
    luckyHitCooldown: number;
    hazards: TelegraphedHazard[];
  }>({
    player: {
      x: 1200,
      y: 1200,
      vx: 0,
      vy: 0,
      radius: 18,
      angle: 0,
      isAttacking: false,
      attackTimer: 0,
      comboStep: 0,
      isDashing: false,
      dashTimer: 0,
      iFrames: false,
      dashVx: 0,
      dashVy: 0,
      trail: []
    },
    companions: [],
    keys: {},
    mouse: { x: 0, y: 0, isDown: false },
    hoveredEnemyId: null,
    enemies: [],
    projectiles: [],
    areaEffects: [],
    lootDrops: [],
    floatingTexts: [],
    particles: [],
    lastSpawnTime: 0,
    bossSpawned: false,
    activeBoss: null,
    camera: { x: 0, y: 0 },
    worldSize: { width: 2400, height: 2400 },
    killCounter: 0,
    hitFreezeTimer: 0,
    eventSpawnedEnemies: false,
    screenShake: 0,
    playerStatusEffects: [] as StatusEffect[],
    luckyHitCooldown: 0,
    hazards: []
  });

  // Sync Companions state
  useEffect(() => {
    const s = stateRef.current;
    const existingList = s.companions;
    
    s.companions = activeCompanions.slice(0, 2).map((comp, idx) => {
      const existing = existingList.find(c => c.id === comp.id);
      const angleOffset = (idx === 0 ? 0.75 : -0.75) * Math.PI;
      return {
        id: comp.id,
        name: comp.name,
        role: comp.role,
        color: comp.avatarColor,
        x: existing ? existing.x : s.player.x + Math.cos(angleOffset) * 45,
        y: existing ? existing.y : s.player.y + Math.sin(angleOffset) * 45,
        vx: 0,
        vy: 0,
        radius: comp.role === 'tank' ? 16 : 12,
        angle: 0,
        targetId: null,
        attackCooldown: existing ? existing.attackCooldown : Math.floor(Math.random() * 20),
        specialCooldown: existing ? existing.specialCooldown : 60,
        hp: comp.hp,
        maxHp: comp.maxHp,
        damage: comp.damage,
        attackRange: comp.attackRange
      };
    });
  }, [activeCompanions]);

  // Handle Action Triggers from HUD/Keys
  useEffect(() => {
    if (!triggerAction.type) return;
    const s = stateRef.current;
    const p = s.player;
    const mouseWorldX = s.mouse.x + s.camera.x;
    const mouseWorldY = s.mouse.y + s.camera.y;
    const dirX = mouseWorldX - p.x;
    const dirY = mouseWorldY - p.y;
    const dist = Math.hypot(dirX, dirY) || 1;
    const ndx = dirX / dist;
    const ndy = dirY / dist;

    if (triggerAction.type === 'primary') {
      // Primary Attack (Cyber Slash / Psi Blast Combo)
      p.isAttacking = true;
      p.attackTimer = 12;
      p.comboStep = (p.comboStep + 1) % 3;

      sound.playSlash();

      // Blade slash area in facing direction
      s.areaEffects.push({
        id: 'slash_' + Math.random(),
        x: p.x + ndx * 25,
        y: p.y + ndy * 25,
        radius: 65,
        maxRadius: 65,
        currentRadius: 20,
        duration: 8,
        maxDuration: 8,
        damagePerTick: playerStats.physicalDamage * (1 + p.comboStep * 0.2),
        color: customization.bladeColor || '#00f0ff',
        type: 'blade_slash',
        damageType: 'physical' as DamageType
      });

      // Spawn slash particles
      for (let i = 0; i < 5; i++) {
        s.particles.push({
          x: p.x + ndx * 30 + (Math.random() - 0.5) * 15,
          y: p.y + ndy * 30 + (Math.random() - 0.5) * 15,
          vx: ndx * 4 + (Math.random() - 0.5) * 3,
          vy: ndy * 4 + (Math.random() - 0.5) * 3,
          size: Math.random() * 3 + 1.5,
          color: customization.bladeColor || '#00f0ff',
          alpha: 1,
          life: 14,
          maxLife: 14
        });
      }

    } else if (triggerAction.type === 'lance') {
      // Synaptic Lance (Piercing psychic spear)
      sound.playSynapticLance();
      s.projectiles.push({
        id: 'lance_' + Math.random(),
        x: p.x,
        y: p.y,
        vx: ndx * 16,
        vy: ndy * 16,
        radius: 12,
        damage: playerStats.psiDamage * 2.2,
        color: customization.auraColor || '#00f0ff',
        isEnemy: false,
        damageType: 'psi' as DamageType,
        life: 45,
        maxLife: 45,
        isPiercing: true,
        hitEntities: new Set()
      });
    } else if (triggerAction.type === 'emp') {
      // EMP Shockwave (AOE Stun with Electric Nova Particles)
      sound.playEmpExplosion();
      s.screenShake = Math.min(26, s.screenShake + 14);

      s.areaEffects.push({
        id: 'emp_' + Math.random(),
        x: p.x,
        y: p.y,
        radius: 190,
        maxRadius: 190,
        currentRadius: 20,
        duration: 20,
        maxDuration: 20,
        damagePerTick: playerStats.psiDamage * 1.6,
        color: '#00f0ff',
        type: 'emp_shockwave',
        damageType: 'cyber' as DamageType, appliesStatus: 'cryo_lock' as StatusEffectType
      });

      // Visual Particle Burst: 45+ radial electric lightning sparks and digital glitch fragments
      const empColors = ['#00f0ff', '#ffffff', '#7000ff', '#38bdf8', '#c084fc'];
      for (let i = 0; i < 48; i++) {
        const angle = (i / 48) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
        const speed = 5.5 + Math.random() * 8.5;
        s.particles.push({
          x: p.x + Math.cos(angle) * 12,
          y: p.y + Math.sin(angle) * 12,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3.5 + 1.5,
          color: empColors[Math.floor(Math.random() * empColors.length)],
          alpha: 1,
          life: 22 + Math.floor(Math.random() * 12),
          maxLife: 34
        });
      }
    } else if (triggerAction.type === 'vortex') {
      // Psychic Vortex (Black Hole with Inward Swirling Cosmic Particles)
      sound.playVortex();
      s.screenShake = Math.min(24, s.screenShake + 12);

      s.areaEffects.push({
        id: 'vortex_' + Math.random(),
        x: mouseWorldX,
        y: mouseWorldY,
        radius: 140,
        maxRadius: 140,
        currentRadius: 140,
        duration: 130,
        maxDuration: 130,
        damagePerTick: playerStats.psiDamage * 0.45,
        color: '#9d00ff',
        type: 'vortex',
        damageType: 'psi' as DamageType, appliesStatus: 'neural_breach' as StatusEffectType,
        pullsEnemies: true
      });

      // Visual Particle Burst: 40+ gravitational suction particles converging inward
      const vortexColors = ['#9d00ff', '#ff00ff', '#ec4899', '#00f0ff', '#a855f7'];
      for (let i = 0; i < 42; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spawnDist = 80 + Math.random() * 65;
        s.particles.push({
          x: mouseWorldX + Math.cos(angle) * spawnDist,
          y: mouseWorldY + Math.sin(angle) * spawnDist,
          vx: -Math.cos(angle) * (3.5 + Math.random() * 3),
          vy: -Math.sin(angle) * (3.5 + Math.random() * 3),
          size: Math.random() * 3.5 + 2,
          color: vortexColors[Math.floor(Math.random() * vortexColors.length)],
          alpha: 0.95,
          life: 28,
          maxLife: 28
        });
      }
    } else if (triggerAction.type === 'dash') {
      // Cyber Dash with i-frames
      sound.playDash();
      p.isDashing = true;
      p.dashTimer = 10;
      p.iFrames = true;
      p.dashVx = (ndx || 1) * 22;
      p.dashVy = (ndy || 0) * 22;
    }

    onActionTriggered();
  }, [triggerAction]);

  // Main 60 FPS Game Loop Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Tactical POI Actions
    const triggerTerminalHack = () => {
      const p = stateRef.current.player;
      const engine = tacticalEngineRef.current;
      const poi = engine.pois.find(item => item.type === 'TERMINAL_HUB' && !item.hacked && Math.hypot(p.x - item.worldX, p.y - item.worldY) < 65);
      if (poi) {
        poi.hacked = true;
        engine.bakeStaticTacticalLayers(activeFilter);
        sound.playLevelUp();
        onPsiGained(60);
        const rewardIntel = poi.intelReward || 35;
        const rewardNano = poi.nanoCreditsReward || 250;
        setMissionState(prev => ({
          ...prev,
          objectives: {
            ...prev.objectives,
            intelCollected: Math.min(prev.objectives.intelTotal, prev.objectives.intelCollected + rewardIntel)
          }
        }));
        stateRef.current.floatingTexts.push({
          id: 'txt_hack_' + Math.random(),
          text: `⚡ RELAIS PIRATÉ! +${rewardIntel}MB INTEL +${rewardNano} NANO-CRÉDITS`,
          x: p.x,
          y: p.y - 30,
          color: '#eab308',
          size: 16,
          life: 50,
          maxLife: 50,
          isCrit: true
        });
        // Surcharge EMP : étourdit les ennemis proches
        stateRef.current.enemies.forEach(en => {
          if (Math.hypot(en.x - p.x, en.y - p.y) < 420) {
            en.stunTimer = 90;
          }
        });
        setIsNearTerminal(false);
      }
    };

    const triggerExfilExtraction = () => {
      const p = stateRef.current.player;
      const engine = tacticalEngineRef.current;
      const poi = engine.pois.find(item => item.type === 'EXFIL_EXTRACTION' && Math.hypot(p.x - item.worldX, p.y - item.worldY) < 75);
      if (poi) {
        sound.playVictory();
        stateRef.current.floatingTexts.push({
          id: 'txt_exfil_' + Math.random(),
          text: `🎯 MISSION ACCOMPLIE // EXTRACTION RÉUSSIE SANS DÉTECTION!`,
          x: p.x,
          y: p.y - 40,
          color: '#00ff41',
          size: 20,
          life: 70,
          maxLife: 70,
          isCrit: true
        });
        setMissionState(prev => ({
          ...prev,
          exfilUnlocked: true,
          objectives: {
            ...prev.objectives,
            primaryCompleted: true
          }
        }));
      }
    };

    // Input listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'e') {
        triggerTerminalHack();
      }
      if (e.key.toLowerCase() === 'f') {
        triggerExfilExtraction();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.mouse.x = e.clientX - rect.left;
      stateRef.current.mouse.y = e.clientY - rect.top;
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        stateRef.current.mouse.isDown = true;
      }
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        stateRef.current.mouse.isDown = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Initial 3D Cyber Soldier Spawn
    const spawnInitialEnemies = () => {
      const s = stateRef.current;
      s.enemies = [];
      s.bossSpawned = false;
      s.activeBoss = null;
      onBossStateChange(null, null, null);

      for (let i = 0; i < 15; i++) {
        spawn3DCyberSoldier(s);
      }
    };

    const spawn3DCyberSoldier = (s: typeof stateRef.current, forceBoss = false, eventEnemy = false) => {
      const p = s.player;
      const angle = Math.random() * Math.PI * 2;
      const dist = forceBoss ? 450 : 320 + Math.random() * 380;
      const x = Math.max(80, Math.min(s.worldSize.width - 80, p.x + Math.cos(angle) * dist));
      const y = Math.max(80, Math.min(s.worldSize.height - 80, p.y + Math.sin(angle) * dist));

      const tierMult = 1 + (difficultyTier - 1) * 0.22;
      const baseEnemyHp = (65 + Math.random() * 40) * tierMult;

      if (forceBoss) {
        const bossHp = 2200 * currentStage.bossHpMultiplier * tierMult;
        const boss: CombatEntity = {
          id: 'boss_' + Math.random(),
          type: 'boss',
          name: currentStage.bossName,
          x,
          y,
          radius: 38,
          hp: bossHp,
          maxHp: bossHp,
          shieldHp: bossHp * 0.3,
          maxShieldHp: bossHp * 0.3,
          speed: 2.2,
          color: currentStage.accentColor,
          isBoss: true,
          bossPhase: 1,
          attackCooldown: 0,
          attackRange: 320,
          damage: 38 * tierMult,
          xpReward: 1400 * currentStage.id * tierMult,
          behavior: 'boss',
          spriteType: 'commandant_boss',
          soldierClass: 'commandant_boss',
          staggerValue: 0,
          maxStagger: 100,
          isStaggered: false,
          staggerDuration: 0,
          statusEffects: [],
          resistances: getDefaultResistances('commandant_boss')
        };
        s.enemies.push(boss);
        s.activeBoss = boss;
        s.bossSpawned = true;
        onBossStateChange(boss.hp, boss.maxHp, boss.name);
        return;
      }

      const soldierArchetypes: CyberSoldierClass[] = [
        'assault_trooper',
        'heavy_exo',
        'stealth_ninja',
        'cyber_sniper'
      ];
      const chosenClass = soldierArchetypes[Math.floor(Math.random() * soldierArchetypes.length)];

      // D4 Elite System Roll: 12% Champion (1 affix), 6% Elite (2-3 affixes)
      const eliteRoll = Math.random();
      const isElite = !eventEnemy && eliteRoll < 0.06;
      const isChampion = !eventEnemy && !isElite && eliteRoll < 0.18;
      const eliteTier: 'champion' | 'elite' | undefined = isElite ? 'elite' : isChampion ? 'champion' : undefined;
      const eliteAffixes = eliteTier ? rollEliteAffixes(eliteTier, difficultyTier) : undefined;

      const hpMult = isElite ? 3.4 : isChampion ? 2.1 : 1.0;
      const dmgMult = isElite ? 1.5 : isChampion ? 1.25 : 1.0;
      const xpMult = isElite ? 3.0 : isChampion ? 2.0 : 1.0;

      let enemy: CombatEntity;

      if (chosenClass === 'assault_trooper') {
        // 1. Soldat Cyber Fusilier
        enemy = {
          id: (eventEnemy ? 'event_enemy_' : 'enemy_') + Math.random(),
          type: 'enemy',
          name: isElite ? '🔥 Élite Commando SPVM' : isChampion ? '⚡ Champion Fusilier' : (eventEnemy ? 'Fusilier Commando Noir' : 'Soldat Cyber Fusilier SPVM'),
          x,
          y,
          radius: 17 + (isElite ? 5 : isChampion ? 2 : 0),
          hp: baseEnemyHp * (eventEnemy ? 1.4 : 1.1) * hpMult,
          maxHp: baseEnemyHp * (eventEnemy ? 1.4 : 1.1) * hpMult,
          speed: 2.9,
          color: isElite ? '#f59e0b' : isChampion ? '#38bdf8' : (eventEnemy ? '#ff0044' : '#00f0ff'),
          attackCooldown: 30,
          attackRange: 240,
          damage: 16 * tierMult * dmgMult,
          xpReward: 45 * tierMult * xpMult,
          behavior: 'ranged',
          spriteType: 'assault_trooper',
          soldierClass: 'assault_trooper',
          resistances: getDefaultResistances('assault_trooper'),
          isElite: !!eliteTier,
          eliteTier,
          eliteAffixes,
          statusEffects: []
        };
      } else if (chosenClass === 'heavy_exo') {
        // 2. Soldat Cyber Exo-Lourd
        enemy = {
          id: (eventEnemy ? 'event_enemy_' : 'enemy_') + Math.random(),
          type: 'enemy',
          name: isElite ? '🔥 Élite Titan Cyber-Lourd' : isChampion ? '⚡ Champion Exo-Garde' : (eventEnemy ? 'Titan Exo-Répression' : 'Soldat Cyber Exo-Lourd'),
          x,
          y,
          radius: 23 + (isElite ? 6 : isChampion ? 3 : 0),
          hp: baseEnemyHp * (eventEnemy ? 2.4 : 2.0) * hpMult,
          maxHp: baseEnemyHp * (eventEnemy ? 2.4 : 2.0) * hpMult,
          shieldHp: baseEnemyHp * 0.5 * hpMult,
          maxShieldHp: baseEnemyHp * 0.5 * hpMult,
          speed: 2.0,
          color: isElite ? '#f59e0b' : isChampion ? '#38bdf8' : '#f97316',
          attackCooldown: 25,
          attackRange: 45,
          damage: 28 * tierMult * dmgMult,
          xpReward: 75 * tierMult * xpMult,
          behavior: 'melee',
          spriteType: 'heavy_exo',
          soldierClass: 'heavy_exo',
          resistances: getDefaultResistances('heavy_exo'),
          isElite: !!eliteTier,
          eliteTier,
          eliteAffixes,
          statusEffects: []
        };
      } else if (chosenClass === 'stealth_ninja') {
        // 3. Soldat Infiltrateur Cyber-Ninja
        enemy = {
          id: (eventEnemy ? 'event_enemy_' : 'enemy_') + Math.random(),
          type: 'enemy',
          name: isElite ? '🔥 Élite Maître Assassin' : isChampion ? '⚡ Champion Cyber-Ninja' : 'Infiltrateur Cyber-Ninja',
          x,
          y,
          radius: 15 + (isElite ? 4 : isChampion ? 2 : 0),
          hp: baseEnemyHp * 0.9 * hpMult,
          maxHp: baseEnemyHp * 0.9 * hpMult,
          speed: 3.8,
          color: isElite ? '#f59e0b' : isChampion ? '#38bdf8' : '#38bdf8',
          attackCooldown: 20,
          attackRange: 38,
          damage: 24 * tierMult * dmgMult,
          xpReward: 60 * tierMult * xpMult,
          behavior: 'melee',
          spriteType: 'stealth_ninja',
          soldierClass: 'stealth_ninja',
          resistances: getDefaultResistances('stealth_ninja'),
          isElite: !!eliteTier,
          eliteTier,
          eliteAffixes,
          statusEffects: []
        };
      } else {
        // 4. Soldat Tireur d'Élite Cyber
        enemy = {
          id: (eventEnemy ? 'event_enemy_' : 'enemy_') + Math.random(),
          type: 'enemy',
          name: isElite ? '🔥 Élite Sniper Antimatière' : isChampion ? '⚡ Champion Railgunner' : 'Tireur d’Élite Railgun SPVM',
          x,
          y,
          radius: 16 + (isElite ? 4 : isChampion ? 2 : 0),
          hp: baseEnemyHp * 0.8 * hpMult,
          maxHp: baseEnemyHp * 0.8 * hpMult,
          speed: 2.2,
          color: isElite ? '#f59e0b' : isChampion ? '#38bdf8' : '#ef4444',
          attackCooldown: 55,
          attackRange: 380,
          damage: 32 * tierMult * dmgMult,
          xpReward: 70 * tierMult * xpMult,
          behavior: 'ranged',
          spriteType: 'cyber_sniper',
          soldierClass: 'cyber_sniper',
          resistances: getDefaultResistances('cyber_sniper'),
          isElite: !!eliteTier,
          eliteTier,
          eliteAffixes,
          statusEffects: []
        };
      }

      s.enemies.push(enemy);
    };

    spawnInitialEnemies();

    // -------------------------------------------------------------
    // MAIN 60 FPS LOOP
    // -------------------------------------------------------------
    const updateAndRender = () => {
      const {
        playerStats,
        customization,
        currentStage,
        difficultyTier,
        bulletTimeActive,
        isPaused,
        activeWorldEvent,
        onEnemyKilled,
        onLootDropped,
        onPlayerDamaged,
        onPlayerHealed,
        onPsiGained,
        onBossStateChange,
        onEventProgress,
        onEventComplete,
        onPlayerNearTraderChange,
        equippedWeapon
      } = propsRef.current;

      const s = stateRef.current;
      const p = s.player;

      if (!isPaused) {
        const timeScale = bulletTimeActive ? 0.25 : 1.0;

        // Player Movement (WASD / ZQSD / Arrows)
        let moveX = 0;
        let moveY = 0;

        if (s.keys['w'] || s.keys['z'] || s.keys['arrowup']) moveY -= 1;
        if (s.keys['s'] || s.keys['arrowdown']) moveY += 1;
        if (s.keys['a'] || s.keys['q'] || s.keys['arrowleft']) moveX -= 1;
        if (s.keys['d'] || s.keys['arrowright']) moveX += 1;

        const moveDist = Math.hypot(moveX, moveY);
        if (moveDist > 0) {
          moveX /= moveDist;
          moveY /= moveDist;
        }

        if (p.isDashing) {
          p.x += p.dashVx;
          p.y += p.dashVy;
          p.dashTimer--;
          if (p.dashTimer <= 0) {
            p.isDashing = false;
            p.iFrames = false;
          }
          // Dash trails
          p.trail.push({
            x: p.x,
            y: p.y,
            alpha: 1.0,
            color: customization.auraColor || '#00f0ff'
          });
        } else {
          const moveSpeed = playerStats.moveSpeed * 0.85;
          p.vx = moveX * moveSpeed;
          p.vy = moveY * moveSpeed;
          p.x += p.vx;
          p.y += p.vy;

          if (bulletTimeActive && Math.random() < 0.3) {
            p.trail.push({
              x: p.x,
              y: p.y,
              alpha: 0.8,
              color: '#00f0ff'
            });
          }
        }

        // Clamp inside world boundaries
        p.x = Math.max(40, Math.min(s.worldSize.width - 40, p.x));
        p.y = Math.max(40, Math.min(s.worldSize.height - 40, p.y));

        // Update trail decay
        for (let i = p.trail.length - 1; i >= 0; i--) {
          p.trail[i].alpha -= 0.08;
          if (p.trail[i].alpha <= 0) {
            p.trail.splice(i, 1);
          }
        }

        // Camera smoothly follows player (Diablo Center View)
        const targetCamX = p.x - canvas.width / 2;
        const targetCamY = p.y - canvas.height / 2;
        s.camera.x += (targetCamX - s.camera.x) * 0.12;
        s.camera.y += (targetCamY - s.camera.y) * 0.12;

        // Player Rotation towards Mouse
        const mouseWorldX = s.mouse.x + s.camera.x;
        const mouseWorldY = s.mouse.y + s.camera.y;
        p.angle = Math.atan2(mouseWorldY - p.y, mouseWorldX - p.x);

        // Check hover over enemies for Diablo targeting
        let foundHover: string | null = null;
        for (const en of s.enemies) {
          const distToMouse = Math.hypot(en.x - mouseWorldX, en.y - mouseWorldY);
          if (distToMouse < en.radius + 15) {
            foundHover = en.id;
            break;
          }
        }
        s.hoveredEnemyId = foundHover;

        // Primary attack timer
        if (p.isAttacking) {
          p.attackTimer--;
          if (p.attackTimer <= 0) {
            p.isAttacking = false;
          }
        }

        // Continuous mouse click primary attack
        if (s.mouse.isDown && !p.isAttacking) {
          p.isAttacking = true;
          p.attackTimer = 12;
          p.comboStep = (p.comboStep + 1) % 3;
          sound.playSlash();

          const dirX = Math.cos(p.angle);
          const dirY = Math.sin(p.angle);

          s.areaEffects.push({
            id: 'slash_' + Math.random(),
            x: p.x + dirX * 25,
            y: p.y + dirY * 25,
            radius: 65,
            maxRadius: 65,
            currentRadius: 20,
            duration: 8,
            maxDuration: 8,
            damagePerTick: playerStats.physicalDamage * (1 + p.comboStep * 0.2),
            color: customization.bladeColor || '#00f0ff',
            type: 'blade_slash',
            damageType: 'physical' as DamageType
          });
        }

        // Periodic Spawn of 3D Cyber Soldiers
        if (s.enemies.length < 18 && Date.now() - s.lastSpawnTime > 2500) {
          spawn3DCyberSoldier(s);
          s.lastSpawnTime = Date.now();
        }

        // Spawn Boss when threshold reached
        const requiredKills = 25 * currentStage.id;
        if (s.killCounter >= requiredKills && !s.bossSpawned && !s.activeBoss) {
          spawn3DCyberSoldier(s, true);
        }

        // Update AI Companions
        s.companions.forEach((comp, idx) => {
          const orbitAngle = (Date.now() * 0.002) + (idx * Math.PI);
          const targetX = p.x + Math.cos(orbitAngle) * 45;
          const targetY = p.y + Math.sin(orbitAngle) * 45;

          comp.x += (targetX - comp.x) * 0.1;
          comp.y += (targetY - comp.y) * 0.1;

          // Find nearest enemy to companion
          let closestEnemy: CombatEntity | null = null;
          let closestDist = Infinity;

          s.enemies.forEach(en => {
            const d = Math.hypot(en.x - comp.x, en.y - comp.y);
            if (d < closestDist) {
              closestDist = d;
              closestEnemy = en;
            }
          });

          if (closestEnemy && closestDist < comp.attackRange) {
            comp.angle = Math.atan2((closestEnemy as CombatEntity).y - comp.y, (closestEnemy as CombatEntity).x - comp.x);
            comp.attackCooldown--;

            if (comp.attackCooldown <= 0) {
              comp.attackCooldown = comp.role === 'offense' ? 35 : comp.role === 'tank' ? 45 : 55;

              if (comp.role === 'offense') {
                sound.playLaserShoot();
                const dirX = Math.cos(comp.angle);
                const dirY = Math.sin(comp.angle);
                s.projectiles.push({
                  id: 'comp_proj_' + Math.random(),
                  x: comp.x,
                  y: comp.y,
                  vx: dirX * 12,
                  vy: dirY * 12,
                  radius: 5,
                  damage: comp.damage,
                  color: comp.color,
                  isEnemy: false,
                  life: 40,
                  maxLife: 40
                });
              } else if (comp.role === 'tank') {
                (closestEnemy as CombatEntity).hp -= comp.damage;
                sound.playHit();
                s.floatingTexts.push({
                  id: 'txt_' + Math.random(),
                  text: `${Math.round(comp.damage)}`,
                  x: (closestEnemy as CombatEntity).x,
                  y: (closestEnemy as CombatEntity).y - 20,
                  color: comp.color,
                  size: 14,
                  life: 25,
                  maxLife: 25
                });
              } else if (comp.role === 'support') {
                onPlayerHealed(Math.round(comp.damage * 0.5));
                sound.playShieldRestore();
              }
            }
          } else {
            comp.angle = p.angle;
          }
        });

        // Update Projectiles
        for (let i = s.projectiles.length - 1; i >= 0; i--) {
          const proj = s.projectiles[i];
          const projSpeedScale = proj.isEnemy ? timeScale : 1.0;
          proj.x += proj.vx * projSpeedScale;
          proj.y += proj.vy * projSpeedScale;
          proj.life--;

          // Collisions with Player
          if (proj.isEnemy) {
            const distToPlayer = Math.hypot(proj.x - p.x, proj.y - p.y);
            if (distToPlayer < proj.radius + p.radius && !p.iFrames) {
              const dmg = Math.max(1, Math.round(proj.damage - playerStats.armor * 0.3));
              onPlayerDamaged(dmg);
              sound.playHit();
              s.floatingTexts.push({
                id: 'txt_' + Math.random(),
                text: `-${dmg}`,
                x: p.x,
                y: p.y - 15,
                color: '#ef4444',
                size: 16,
                life: 30,
                maxLife: 30
              });
              s.projectiles.splice(i, 1);
              continue;
            }
          } else {
            // Player / Companion projectile vs 3D Cyber Soldiers
            for (let j = s.enemies.length - 1; j >= 0; j--) {
              const en = s.enemies[j];
              if (proj.hitEntities?.has(en.id)) continue;

              const distToEn = Math.hypot(proj.x - en.x, proj.y - en.y);
              if (distToEn < proj.radius + en.radius) {
                proj.hitEntities?.add(en.id);
                const isCrit = Math.random() * 100 < playerStats.critChance;
                // D4: Check for Neural Breach (Vulnerability) status
                const hasNeuralBreach = en.statusEffects?.some(e => e.type === 'neural_breach') ?? false;
                const vulnMult = hasNeuralBreach ? 1.25 : 1.0;
                
                // D4: Elemental Resistance & Weakness Calculation
                const dmgType: DamageType = proj.damageType || 'psi';
                const resPct = en.resistances?.[dmgType] || 0;
                const resMult = Math.max(0.15, 1 - resPct / 100);

                const baseDmg = isCrit 
                  ? Math.round(proj.damage * (playerStats.critDamage / 100))
                  : Math.round(proj.damage);
                const finalDmg = Math.max(1, Math.round(baseDmg * vulnMult * resMult));

                en.hp -= finalDmg;

                // Resistance / Weakness Floating indicator
                if (resPct <= -15) {
                  s.floatingTexts.push({
                    id: 'txt_' + Math.random(), text: 'FAIBLESSE !', x: en.x + (Math.random()-0.5)*15,
                    y: en.y - 32, color: '#00ff41', size: 11, life: 25, maxLife: 25
                  });
                } else if (resPct >= 20) {
                  s.floatingTexts.push({
                    id: 'txt_' + Math.random(), text: 'RÉSISTE', x: en.x + (Math.random()-0.5)*15,
                    y: en.y - 32, color: '#9ca3af', size: 10, life: 20, maxLife: 20
                  });
                }
                
                // D4: Lucky Hit System
                if (Math.random() * 100 < (proj.luckyHitChance || 15)) {
                  // Lucky Hit triggered — restore Psi or apply status
                  const luckyRoll = Math.random();
                  if (luckyRoll < 0.4) {
                    onPsiGained(15);
                    s.floatingTexts.push({
                      id: 'txt_' + Math.random(), text: 'LUCKY HIT!', x: en.x, y: en.y - 35,
                      color: '#fbbf24', size: 16, life: 35, maxLife: 35, isCrit: true
                    });
                  } else if (luckyRoll < 0.7) {
                    // Apply Circuit Bleed
                    if (!en.statusEffects) en.statusEffects = [];
                    en.statusEffects.push({
                      type: 'circuit_bleed', duration: 240, maxDuration: 240,
                      value: playerStats.physicalDamage * 0.08, stacks: 1, source: 'player'
                    });
                    s.floatingTexts.push({
                      id: 'txt_' + Math.random(), text: 'BLEED!', x: en.x, y: en.y - 35,
                      color: '#ef4444', size: 14, life: 30, maxLife: 30
                    });
                  }
                }

                if (isCrit) {
                  sound.playCritHit();
                  s.screenShake = Math.min(22, s.screenShake + 7);
                } else {
                  sound.playHit();
                }

                s.floatingTexts.push({
                  id: 'txt_' + Math.random(),
                  text: isCrit ? `CRIT ${finalDmg}!` : `${finalDmg}`,
                  x: en.x + (Math.random() - 0.5) * 20,
                  y: en.y - 20,
                  color: isCrit ? '#f59e0b' : (proj.color || '#00f0ff'),
                  size: isCrit ? 20 : 15,
                  life: 35,
                  maxLife: 35,
                  isCrit
                });

                // Digital Voxel Blood Sparks
                for (let k = 0; k < 6; k++) {
                  s.particles.push({
                    x: en.x,
                    y: en.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    size: Math.random() * 3 + 1,
                    color: en.color || '#00f0ff',
                    alpha: 1,
                    life: 16,
                    maxLife: 16
                  });
                }

                if (!proj.isPiercing) {
                  s.projectiles.splice(i, 1);
                  break;
                }
              }
            }
          }

          if (proj.life <= 0) {
            s.projectiles.splice(i, 1);
          }
        }

        // Update Area Effects
        for (let i = s.areaEffects.length - 1; i >= 0; i--) {
          const aoe = s.areaEffects[i];
          aoe.duration--;

          if (aoe.type === 'blade_slash' || aoe.type === 'emp_shockwave') {
            aoe.currentRadius += (aoe.maxRadius - aoe.currentRadius) * 0.25;
          }

          // Continuous atmospheric particle streams for high-cost abilities
          if (aoe.type === 'vortex' && Math.random() < 0.65) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 35 + Math.random() * (aoe.radius - 20);
            const tangentX = -Math.sin(angle);
            const tangentY = Math.cos(angle);
            const inwardX = -Math.cos(angle);
            const inwardY = -Math.sin(angle);
            s.particles.push({
              x: aoe.x + Math.cos(angle) * dist,
              y: aoe.y + Math.sin(angle) * dist,
              vx: tangentX * 2.2 + inwardX * 2.8,
              vy: tangentY * 2.2 + inwardY * 2.8,
              size: Math.random() * 3 + 1.2,
              color: Math.random() < 0.5 ? '#9d00ff' : Math.random() < 0.5 ? '#ff00ff' : '#00ffff',
              alpha: 0.85,
              life: 18,
              maxLife: 18
            });
          } else if (aoe.type === 'emp_shockwave' && Math.random() < 0.5) {
            const angle = Math.random() * Math.PI * 2;
            s.particles.push({
              x: aoe.x + Math.cos(angle) * aoe.currentRadius,
              y: aoe.y + Math.sin(angle) * aoe.currentRadius,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              size: Math.random() * 2.5 + 1,
              color: '#00f0ff',
              alpha: 1,
              life: 12,
              maxLife: 12
            });
          }

          s.enemies.forEach(en => {
            const dist = Math.hypot(en.x - aoe.x, en.y - aoe.y);
            if (dist < aoe.currentRadius + en.radius) {
              if (aoe.pullsEnemies) {
                const angle = Math.atan2(aoe.y - en.y, aoe.x - en.x);
                en.x += Math.cos(angle) * 3.8;
                en.y += Math.sin(angle) * 3.8;
              }

              if (aoe.duration % 8 === 0) {
                const aoeDmgType: DamageType = aoe.damageType || (aoe.type === 'blade_slash' ? 'physical' : aoe.type === 'emp_shockwave' ? 'cyber' : 'psi');
                const aoeResPct = en.resistances?.[aoeDmgType] || 0;
                const aoeResMult = Math.max(0.15, 1 - aoeResPct / 100);
                const hasBreach = en.statusEffects?.some(e => e.type === 'neural_breach') ?? false;
                const breachMult = hasBreach ? 1.25 : 1.0;

                const dmg = Math.max(1, Math.round(aoe.damagePerTick * aoeResMult * breachMult));
                en.hp -= dmg;
                
                // D4: Basic attack generates Psi (Generator/Spender loop)
                if (aoe.type === 'blade_slash') {
                  onPsiGained(Math.round(8 + playerStats.psiDamage * 0.04));
                }

                // D4: Apply status effects from abilities
                if (aoe.appliesStatus && aoe.type !== 'blade_slash') {
                  if (!en.statusEffects) en.statusEffects = [];
                  const existing = en.statusEffects.find(e => e.type === aoe.appliesStatus);
                  if (existing) {
                    existing.duration = existing.maxDuration; // Refresh duration
                    existing.stacks = Math.min(existing.stacks + 1, 5);
                  } else {
                    en.statusEffects.push({
                      type: aoe.appliesStatus!,
                      duration: aoe.appliesStatus === 'cryo_lock' ? 180 : 180,
                      maxDuration: 180,
                      value: aoe.appliesStatus === 'neural_breach' ? 0.25 : playerStats.psiDamage * 0.15,
                      stacks: 1,
                      source: 'player'
                    });
                  }
                }

                s.floatingTexts.push({
                  id: 'txt_' + Math.random(),
                  text: `${dmg}`,
                  x: en.x,
                  y: en.y - 15,
                  color: aoe.color,
                  size: 14,
                  life: 25,
                  maxLife: 25
                });
              }

              if (aoe.type === 'emp_shockwave') {
                en.stunTimer = 60;
                // D4: CC contributes to Boss Stagger bar
                if (en.isBoss && en.maxStagger) {
                  en.staggerValue = (en.staggerValue || 0) + 15;
                  if (en.staggerValue >= en.maxStagger && !en.isStaggered) {
                    en.isStaggered = true;
                    en.staggerDuration = 240; // 4 seconds at 60fps
                    en.stunTimer = 240;
                    // Apply Neural Breach during stagger
                    if (!en.statusEffects) en.statusEffects = [];
                    en.statusEffects.push({
                      type: 'neural_breach',
                      duration: 240, maxDuration: 240, value: 0.25, stacks: 1, source: 'player'
                    });
                    s.screenShake = Math.min(35, s.screenShake + 20);
                    s.floatingTexts.push({
                      id: 'txt_' + Math.random(), text: 'STAGGERED!', x: en.x, y: en.y - 40,
                      color: '#f59e0b', size: 24, life: 60, maxLife: 60, isCrit: true
                    });
                  }
                }
              }
            }
          });

          if (aoe.duration <= 0) {
            s.areaEffects.splice(i, 1);
          }
        }

        // ── DIABLO 4: Status Effects Processing ──
        // Process status effects on all enemies
        for (const en of s.enemies) {
          if (!en.statusEffects) continue;
          for (let si = en.statusEffects.length - 1; si >= 0; si--) {
            const eff = en.statusEffects[si];
            eff.duration--;

            // Apply per-frame effects
            if (eff.type === 'circuit_bleed' && eff.duration % 15 === 0) {
              // Bleed DoT every 15 frames
              const bleedDmg = Math.round(eff.value * eff.stacks);
              en.hp -= bleedDmg;
              s.floatingTexts.push({
                id: 'txt_' + Math.random(), text: `${bleedDmg}`, x: en.x + (Math.random()-0.5)*10,
                y: en.y - 10, color: '#ef4444', size: 12, life: 20, maxLife: 20
              });
            } else if (eff.type === 'malware' && eff.duration % 20 === 0) {
              const malwareDmg = Math.round(eff.value);
              en.hp -= malwareDmg;
              s.floatingTexts.push({
                id: 'txt_' + Math.random(), text: `${malwareDmg}`, x: en.x + (Math.random()-0.5)*10,
                y: en.y - 10, color: '#22c55e', size: 12, life: 20, maxLife: 20
              });
            } else if (eff.type === 'cryo_lock') {
              // Slow effect (reduce speed)
              en.speed = en.speed * 0.97; // Gradual slowdown
              if (eff.duration < eff.maxDuration * 0.3) {
                // Freeze phase: full stop
                en.frozenTimer = Math.max(en.frozenTimer || 0, 2);
              }
            }

            if (eff.duration <= 0) {
              en.statusEffects.splice(si, 1);
            }
          }
        }

        // ── DIABLO 4: Boss Stagger System ──
        for (const en of s.enemies) {
          if (!en.isBoss) continue;
          if (en.isStaggered) {
            en.staggerDuration = (en.staggerDuration || 0) - 1;
            if (en.staggerDuration! <= 0) {
              en.isStaggered = false;
              en.staggerValue = 0;
            }
            continue;
          }
          // Decay stagger slowly if not being hit
          if (en.staggerValue && en.staggerValue > 0) {
            en.staggerValue = Math.max(0, en.staggerValue - 0.15);
          }
        }

        // Update 3D Cyber Soldiers AI & Combat
        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const en = s.enemies[i];

          // If Dead
          if (en.hp <= 0) {
            s.killCounter++;
            onEnemyKilled(en);

            if (activeWorldEvent && activeWorldEvent.status === 'active' && en.id.startsWith('event_enemy_')) {
              if (onEventProgress && activeWorldEvent.enemiesRemaining) {
                const remaining = Math.max(0, activeWorldEvent.enemiesRemaining - 1);
                onEventProgress({ enemiesRemaining: remaining });
                if (remaining === 0 && onEventComplete) {
                  onEventComplete(activeWorldEvent);
                }
              }
            }

            // Procedural Loot Drop with difficulty scaling + Boss Loot Table integration
            if (en.isBoss) {
              s.screenShake = Math.min(30, s.screenShake + 18);
              // Guaranteed Boss Set / Legendary item from Boss Loot Table!
              const bossItem = generateBossLootItem(en.name, 1, difficultyTier);
              onLootDropped({
                id: 'boss_loot_' + Math.random(),
                x: en.x,
                y: en.y,
                item: bossItem,
                nanites: Math.round(180 * difficultyTier + Math.random() * 100),
                spawnTime: Date.now()
              });
            } else {
              const dropChance = 0.45 * (1 + 0.15 * difficultyTier);
              if (Math.random() < dropChance) {
                const hasItem = Math.random() < 0.6;
                const droppedItem = hasItem ? generateLootItem(Math.max(1, currentStage.id * 3), difficultyTier) : null;
                onLootDropped({
                  id: 'loot_' + Math.random(),
                  x: en.x,
                  y: en.y,
                  item: droppedItem,
                  nanites: Math.round(25 * difficultyTier + Math.random() * 35),
                  spawnTime: Date.now()
                });
              }
            }

            // Boss Defeated
            if (en.isBoss) {
              s.activeBoss = null;
              onBossStateChange(null, null, null);
            }

            s.enemies.splice(i, 1);
            continue;
          }

          // D4: Stun and Freeze prevent action
          if (en.stunTimer && en.stunTimer > 0) {
            en.stunTimer--;
            continue;
          }
          if (en.frozenTimer && en.frozenTimer > 0) {
            en.frozenTimer--;
            continue;
          }

          // D4: Process Elite Affixes (Mortars, Mines, EMP Aura, etc.)
          if (en.isElite) {
            processEliteAffixes(
              en,
              p,
              s.hazards,
              s.projectiles,
              s.particles,
              s.floatingTexts,
              onPlayerDamaged,
              (amt) => onPsiGained(-amt)
            );
          }

          const distToPlayer = Math.hypot(p.x - en.x, p.y - en.y) || 1;
          const dirX = (p.x - en.x) / distToPlayer;
          const dirY = (p.y - en.y) / distToPlayer;
          en.facingAngle = Math.atan2(dirY, dirX);

          const currentSpeed = en.speed * timeScale;

          if (en.behavior === 'melee') {
            if (distToPlayer > en.attackRange) {
              en.x += dirX * currentSpeed;
              en.y += dirY * currentSpeed;
            } else {
              en.attackCooldown--;
              if (en.attackCooldown <= 0 && !p.iFrames) {
                en.attackCooldown = 32;
                const dmg = Math.max(1, Math.round(en.damage - playerStats.armor * 0.25));
                onPlayerDamaged(dmg);
                sound.playHit();
                s.screenShake = Math.min(20, s.screenShake + 8);
                s.floatingTexts.push({
                  id: 'txt_' + Math.random(),
                  text: `-${dmg}`,
                  x: p.x,
                  y: p.y - 20,
                  color: '#ef4444',
                  size: 17,
                  life: 30,
                  maxLife: 30
                });
              }
            }
          } else if (en.behavior === 'ranged') {
            // Keep tactical distance
            if (distToPlayer > en.attackRange) {
              en.x += dirX * currentSpeed;
              en.y += dirY * currentSpeed;
            } else if (distToPlayer < en.attackRange * 0.45) {
              en.x -= dirX * currentSpeed * 0.8;
              en.y -= dirY * currentSpeed * 0.8;
            }

            en.attackCooldown--;
            if (en.attackCooldown <= 0) {
              en.attackCooldown = en.soldierClass === 'cyber_sniper' ? 65 : 45;
              sound.playLaserShoot();
              s.projectiles.push({
                id: 'enemy_proj_' + Math.random(),
                x: en.x,
                y: en.y,
                vx: dirX * (en.soldierClass === 'cyber_sniper' ? 10 : 6.5),
                vy: dirY * (en.soldierClass === 'cyber_sniper' ? 10 : 6.5),
                radius: en.soldierClass === 'cyber_sniper' ? 8 : 6,
                damage: en.damage,
                color: en.color,
                isEnemy: true,
                life: 90,
                maxLife: 90
              });
            }
          } else if (en.behavior === 'boss') {
            en.x += dirX * currentSpeed * 0.9;
            en.y += dirY * currentSpeed * 0.9;

            onBossStateChange(en.hp, en.maxHp, en.name);

            en.attackCooldown--;
            if (en.attackCooldown <= 0) {
              en.attackCooldown = 50;
              // Boss Heavy Shock Wave Attack Screen Shake
              s.screenShake = Math.min(26, s.screenShake + 12);
              // 5-way projectile fan
              for (let a = -2; a <= 2; a++) {
                const angle = Math.atan2(dirY, dirX) + a * 0.25;
                s.projectiles.push({
                  id: 'boss_proj_' + Math.random(),
                  x: en.x,
                  y: en.y,
                  vx: Math.cos(angle) * 5.5,
                  vy: Math.sin(angle) * 5.5,
                  radius: 8,
                  damage: en.damage * 0.9,
                  color: en.color,
                  isEnemy: true,
                  life: 100,
                  maxLife: 100
                });
              }
            }
          }
        }

        // ── DIABLO 4: Telegraphed Hazards Update Loop ──
        for (let i = s.hazards.length - 1; i >= 0; i--) {
          const hz = s.hazards[i];
          hz.delayFrames--;

          if (hz.type === 'mortar') {
            if (hz.delayFrames <= 0) {
              // Mortar shell impact!
              const distToP = Math.hypot(p.x - hz.targetX, p.y - hz.targetY);
              if (distToP < hz.radius + p.radius && !p.iFrames) {
                const dmg = Math.max(1, Math.round(hz.damage - playerStats.armor * 0.25));
                onPlayerDamaged(dmg);
                sound.playHit();
                s.screenShake = Math.min(26, s.screenShake + 12);
                s.floatingTexts.push({
                  id: 'txt_' + Math.random(), text: `-${dmg} (MORTIER)`, x: p.x, y: p.y - 20,
                  color: '#f97316', size: 16, life: 30, maxLife: 30
                });
              }

              // Mortar explosion particles
              sound.playEmpExplosion();
              for (let k = 0; k < 22; k++) {
                const a = Math.random() * Math.PI * 2;
                const spd = 3 + Math.random() * 6;
                s.particles.push({
                  x: hz.targetX, y: hz.targetY,
                  vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
                  size: Math.random() * 4 + 2,
                  color: Math.random() < 0.5 ? '#f97316' : '#ef4444',
                  alpha: 1, life: 20, maxLife: 20
                });
              }

              s.hazards.splice(i, 1);
              continue;
            }
          } else if (hz.type === 'pulse_mine') {
            if (hz.delayFrames <= 0) {
              // Armed mine: check proximity to player
              const distToP = Math.hypot(p.x - hz.targetX, p.y - hz.targetY);
              if (distToP < hz.radius + p.radius && !p.iFrames) {
                const dmg = Math.max(1, Math.round(hz.damage - playerStats.armor * 0.2));
                onPlayerDamaged(dmg);
                sound.playEmpExplosion();
                s.screenShake = Math.min(24, s.screenShake + 10);
                s.floatingTexts.push({
                  id: 'txt_' + Math.random(), text: `-${dmg} (MINE)`, x: p.x, y: p.y - 20,
                  color: '#eab308', size: 16, life: 30, maxLife: 30
                });
                s.hazards.splice(i, 1);
                continue;
              }

              if (hz.activeDuration) {
                hz.activeDuration--;
                if (hz.activeDuration <= 0) {
                  s.hazards.splice(i, 1);
                  continue;
                }
              }
            }
          } else if (hz.type === 'firewall') {
            if (hz.delayFrames <= 0) {
              const distToP = Math.hypot(p.x - hz.targetX, p.y - hz.targetY);
              if (distToP < hz.radius + p.radius && !p.iFrames && hz.delayFrames % 10 === 0) {
                const dmg = Math.max(1, Math.round(hz.damage));
                onPlayerDamaged(dmg);
                s.floatingTexts.push({
                  id: 'txt_' + Math.random(), text: `-${dmg}`, x: p.x, y: p.y - 15,
                  color: '#ff3366', size: 13, life: 20, maxLife: 20
                });
              }
              if (hz.activeDuration) {
                hz.activeDuration--;
                if (hz.activeDuration <= 0) {
                  s.hazards.splice(i, 1);
                  continue;
                }
              }
            }
          }
        }

        // Update Floating Texts
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const txt = s.floatingTexts[i];
          txt.y -= 0.8;
          txt.life--;
          if (txt.life <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const pt = s.particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.alpha = pt.life / pt.maxLife;
          pt.life--;
          if (pt.life <= 0) {
            s.particles.splice(i, 1);
          }
        }

        // ── TACTICAL BATTLESPACE: Stealth & POI Proximity Loop (Throttled O(1)) ──
        if (Math.random() < 0.25) {
          let nearTerm = false;
          let nearEx = false;
          let foundPoiId: string | null = null;
          tacticalEngineRef.current.pois.forEach(poi => {
            const dist = Math.hypot(p.x - poi.worldX, p.y - poi.worldY);
            if (dist < 65) {
              foundPoiId = poi.id;
              if (poi.type === 'TERMINAL_HUB' && !poi.hacked) nearTerm = true;
              if (poi.type === 'EXFIL_EXTRACTION') nearEx = true;
            }
          });
          setIsNearTerminal(nearTerm);
          setIsNearExfil(nearEx);
          setNearbyPoiId(foundPoiId);

          const evalStealth = tacticalEngineRef.current.getStealthEvaluation(p.x, p.y, missionState);
          setStealthStatus({
            stealthMultiplier: evalStealth.stealthMultiplier,
            activeTags: evalStealth.activeTags,
            isUnderCover: evalStealth.isUnderCover
          });
        }

        // Decay dynamic screen shake
        s.screenShake *= 0.88;
        if (s.screenShake < 0.05) s.screenShake = 0;

      } // End if !isPaused

      // -------------------------------------------------------------
      // DIABLO-STYLE ISOMETRIC RENDERING PASS
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      const shakeOffsetX = s.screenShake > 0.1 ? (Math.random() - 0.5) * s.screenShake : 0;
      const shakeOffsetY = s.screenShake > 0.1 ? (Math.random() - 0.5) * s.screenShake : 0;
      ctx.translate(-s.camera.x + shakeOffsetX, -s.camera.y + shakeOffsetY);

      // 1. Render Diablo Isometric Cyberpunk Floor
      drawDiabloIsometricFloor(ctx, currentStage, s.camera, s.worldSize, Date.now());

      // 1.5. Render 7-Layer Battlespace Bitmask Grid on Offscreen Canvas (Zero GC)
      tacticalEngineRef.current.renderLayerToCanvas(ctx, s.camera.x, s.camera.y, activeFilter);

      // 1.6. Render Tactical POIs (Observation, Chokepoints, Terminals, HVT, Exfil)
      tacticalEngineRef.current.renderPOIs(ctx, s.camera.x, s.camera.y, Date.now() * 0.003);

      // 2. Render Active World Event Zones
      if (activeWorldEvent && activeWorldEvent.status === 'active') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(activeWorldEvent.x, activeWorldEvent.y, activeWorldEvent.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${activeWorldEvent.accentColor}11`;
        ctx.fill();
        ctx.strokeStyle = activeWorldEvent.accentColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(activeWorldEvent.x, activeWorldEvent.y, 16 + Math.sin(Date.now() * 0.005) * 4, 0, Math.PI * 2);
        ctx.fillStyle = activeWorldEvent.accentColor;
        ctx.shadowColor = activeWorldEvent.accentColor;
        ctx.shadowBlur = 15;
        ctx.fill();

        ctx.font = 'bold 12px Orbitron, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(activeWorldEvent.title, activeWorldEvent.x, activeWorldEvent.y - 25);
        ctx.restore();
      }

      // 3. Render Area Effects
      s.areaEffects.forEach(aoe => {
        ctx.save();
        if (aoe.type === 'vortex') {
          ctx.beginPath();
          ctx.arc(aoe.x, aoe.y, aoe.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(157, 0, 255, 0.15)';
          ctx.fill();
          ctx.strokeStyle = '#9d00ff';
          ctx.lineWidth = 2;
          ctx.stroke();

          for (let r = 20; r < aoe.radius; r += 25) {
            ctx.beginPath();
            ctx.arc(aoe.x, aoe.y, r, (Date.now() * 0.005) + r, (Date.now() * 0.005) + r + Math.PI);
            ctx.strokeStyle = 'rgba(157, 0, 255, 0.6)';
            ctx.lineWidth = 3;
            ctx.stroke();
          }
        } else if (aoe.type === 'emp_shockwave') {
          ctx.beginPath();
          ctx.arc(aoe.x, aoe.y, aoe.currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
          ctx.fill();
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 15;
          ctx.stroke();
        } else if (aoe.type === 'blade_slash') {
          ctx.beginPath();
          ctx.arc(aoe.x, aoe.y, aoe.currentRadius, p.angle - 0.8, p.angle + 0.8);
          ctx.strokeStyle = aoe.color;
          ctx.lineWidth = 5;
          ctx.shadowColor = aoe.color;
          ctx.shadowBlur = 20;
          ctx.stroke();
        }
        ctx.restore();
      });

      // 3.5. DIABLO 4: Render Telegraphed Ground Hazards (Mortars, Mines, Firewalls)
      s.hazards.forEach(hz => {
        ctx.save();
        if (hz.type === 'mortar') {
          const progress = Math.max(0, Math.min(1, 1 - hz.delayFrames / hz.maxDelayFrames));
          // Outer danger ring
          ctx.beginPath();
          ctx.arc(hz.targetX, hz.targetY, hz.radius, 0, Math.PI * 2);
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
          ctx.stroke();

          // Expanding inner fill (Telegraph Fill)
          ctx.beginPath();
          ctx.arc(hz.targetX, hz.targetY, hz.radius * progress, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(249, 115, 22, 0.25)';
          ctx.fill();

          // Pulsing central target reticle
          ctx.beginPath();
          ctx.arc(hz.targetX, hz.targetY, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
        } else if (hz.type === 'pulse_mine') {
          const isArmed = hz.delayFrames <= 0;
          ctx.beginPath();
          ctx.arc(hz.targetX, hz.targetY, hz.radius, 0, Math.PI * 2);
          ctx.fillStyle = isArmed ? 'rgba(234, 179, 8, 0.15)' : 'rgba(156, 163, 175, 0.1)';
          ctx.fill();
          ctx.strokeStyle = isArmed ? '#eab308' : '#9ca3af';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Core beacon
          ctx.beginPath();
          ctx.arc(hz.targetX, hz.targetY, 6, 0, Math.PI * 2);
          ctx.fillStyle = isArmed ? '#facc15' : '#6b7280';
          ctx.fill();
        } else if (hz.type === 'firewall') {
          ctx.beginPath();
          ctx.arc(hz.targetX, hz.targetY, hz.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 51, 102, 0.18)';
          ctx.fill();
          ctx.strokeStyle = '#ff3366';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
      });

      // 4. Render Particles (Limit to 30)
      if (s.particles.length > 30) s.particles = s.particles.slice(-30);
      s.particles.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. DIABLO-STYLE ISOMETRIC DEPTH-SORTED ENTITY RENDERING (With Frustum Culling)
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;
      const camLeft = s.camera.x - 100;
      const camRight = s.camera.x + viewW + 100;
      const camTop = s.camera.y - 100;
      const camBottom = s.camera.y + viewH + 100;

      type RenderableItem = 
        | { type: 'player'; y: number }
        | { type: 'enemy'; entity: CombatEntity; y: number }
        | { type: 'companion'; companion: typeof s.companions[0]; y: number };

      const renderQueue: RenderableItem[] = [];

      renderQueue.push({ type: 'player', y: p.y });

      // Frustum culling on enemies & companions
      s.enemies.forEach(en => {
        if (en.x >= camLeft && en.x <= camRight && en.y >= camTop && en.y <= camBottom) {
          renderQueue.push({ type: 'enemy', entity: en, y: en.y });
        }
      });
      s.companions.forEach(comp => {
        if (comp.x >= camLeft && comp.x <= camRight && comp.y >= camTop && comp.y <= camBottom) {
          renderQueue.push({ type: 'companion', companion: comp, y: comp.y });
        }
      });

      renderQueue.sort((a, b) => a.y - b.y);

      renderQueue.forEach(item => {
        if (item.type === 'player') {
          drawIsometricPlayerHeadToToe(
            ctx,
            p,
            customization,
            equippedWeapon,
            Date.now(),
            { vx: p.vx, vy: p.vy }
          );
        } else if (item.type === 'enemy') {
          const isTargeted = s.hoveredEnemyId === item.entity.id;

          // D4: Render Elite Ground Glowing Aura Ring
          if (item.entity.isElite) {
            ctx.save();
            const isGoldElite = item.entity.eliteTier === 'elite';
            const auraCol = isGoldElite ? '#f59e0b' : '#38bdf8';

            ctx.beginPath();
            ctx.ellipse(item.entity.x, item.entity.y + 8, item.entity.radius + 8, (item.entity.radius + 8) * 0.5, 0, 0, Math.PI * 2);
            ctx.strokeStyle = auraCol;
            ctx.lineWidth = isGoldElite ? 2.5 : 1.5;
            ctx.stroke();
            ctx.restore();
          }

          draw3DCyberSoldier(
            ctx,
            item.entity,
            Date.now(),
            isTargeted,
            { x: p.x, y: p.y }
          );

          // D4: Render status effect icons above enemy
          if (item.entity.statusEffects && item.entity.statusEffects.length > 0) {
            const iconSize = 8;
            const startX = item.entity.x - ((item.entity.statusEffects.length - 1) * (iconSize + 2)) / 2;
            item.entity.statusEffects.forEach((eff, idx) => {
              const colors: Record<string, string> = {
                neural_breach: '#f59e0b', circuit_bleed: '#ef4444', cryo_lock: '#38bdf8',
                malware: '#22c55e', stun: '#a855f7', bio_fortify: '#3b82f6', psi_barrier: '#8b5cf6'
              };
              ctx.fillStyle = colors[eff.type] || '#ffffff';
              ctx.fillRect(startX + idx * (iconSize + 2) - iconSize/2, item.entity.y - item.entity.radius - 28, iconSize, iconSize);
            });
          }

          // D4: Render Elite Affix Badges above health bar
          if (item.entity.isElite && item.entity.eliteAffixes && item.entity.eliteAffixes.length > 0) {
            ctx.save();
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            const badgeText = item.entity.eliteAffixes
              .map(a => ELITE_AFFIXES_CATALOG[a]?.badge || a.toUpperCase())
              .join(' • ');
            ctx.fillStyle = item.entity.eliteTier === 'elite' ? '#f59e0b' : '#38bdf8';
            ctx.fillText(`[${badgeText}]`, item.entity.x, item.entity.y - item.entity.radius - 20);
            ctx.restore();
          }

          // D4: Render stagger bar under boss HP bar
          if (item.entity.isBoss && item.entity.maxStagger) {
            const barWidth = 70;
            const barHeight = 4;
            const staggerPct = (item.entity.staggerValue || 0) / item.entity.maxStagger;
            ctx.fillStyle = '#333333';
            ctx.fillRect(item.entity.x - barWidth/2, item.entity.y - item.entity.radius - 38, barWidth, barHeight);
            ctx.fillStyle = item.entity.isStaggered ? '#ef4444' : '#f59e0b';
            ctx.fillRect(item.entity.x - barWidth/2, item.entity.y - item.entity.radius - 38, barWidth * Math.min(1, staggerPct), barHeight);
          }
        } else if (item.type === 'companion') {
          draw3DCompanion(ctx, item.companion as any, Date.now());
        }
      });

      // 6. Render Projectiles (Limit to 25)
      if (s.projectiles.length > 25) s.projectiles = s.projectiles.slice(-25);
      s.projectiles.forEach(proj => {
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 7. Render Floating Combat Text (Limit to 12)
      if (s.floatingTexts.length > 12) s.floatingTexts = s.floatingTexts.slice(-12);
      s.floatingTexts.forEach(txt => {
        ctx.font = txt.isCrit ? 'bold 16px monospace' : 'bold 12px monospace';
        ctx.fillStyle = txt.color;
        ctx.textAlign = 'center';
        ctx.fillText(txt.text, txt.x, txt.y);
      });

      // 8. Diablo-Style Hovered Target Nameplate & Reticle
      if (s.hoveredEnemyId) {
        const target = s.enemies.find(e => e.id === s.hoveredEnemyId);
        if (target) {
          ctx.save();
          ctx.translate(target.x, target.y - target.radius - 24);
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = target.isElite ? (target.eliteTier === 'elite' ? '#f59e0b' : '#38bdf8') : '#ffffff';
          ctx.fillText(target.name.toUpperCase(), 0, 0);
          ctx.restore();
        }
      }

      ctx.restore(); // Restore camera translation

      animationFrameId = requestAnimationFrame(updateAndRender);
    };

    animationFrameId = requestAnimationFrame(updateAndRender);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [currentStage.id]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-default block"
      />

      {/* 7-Layer Battlespace Tactical Command Overlay */}
      <BattlespaceTacticalOverlay
        missionState={missionState}
        activeFilter={activeFilter}
        onFilterChange={(layer) => {
          setActiveFilter(layer);
          tacticalEngineRef.current.bakeStaticTacticalLayers(layer);
        }}
        onToggleTimeOfDay={() => {
          setMissionState(prev => ({
            ...prev,
            timeOfDay: prev.timeOfDay === 'NIGHT' ? 'DAY' : 'NIGHT'
          }));
        }}
        onCycleWeather={() => {
          const list = Object.values(WEATHER_CONDITIONS);
          setMissionState(prev => {
            const curIdx = list.findIndex(w => w.type === prev.weather?.type);
            const nextWeather = list[(curIdx + 1) % list.length];
            return {
              ...prev,
              weather: nextWeather
            };
          });
        }}
        stealthTags={stealthStatus.activeTags}
        isUnderCover={stealthStatus.isUnderCover}
        stealthMultiplier={stealthStatus.stealthMultiplier}
        playerPos={{ x: stateRef.current.player.x, y: stateRef.current.player.y }}
        onHackTerminal={() => {
          const p = stateRef.current.player;
          const engine = tacticalEngineRef.current;
          const poi = engine.pois.find(item => item.type === 'TERMINAL_HUB' && !item.hacked && Math.hypot(p.x - item.worldX, p.y - item.worldY) < 65);
          if (poi) {
            poi.hacked = true;
            engine.bakeStaticTacticalLayers(activeFilter);
            sound.playLevelUp();
            onPsiGained(60);
            const rewardIntel = poi.intelReward || 35;
            const rewardNano = poi.nanoCreditsReward || 250;
            setMissionState(prev => ({
              ...prev,
              objectives: {
                ...prev.objectives,
                intelCollected: Math.min(prev.objectives.intelTotal, prev.objectives.intelCollected + rewardIntel)
              }
            }));
            stateRef.current.floatingTexts.push({
              id: 'txt_hack_' + Math.random(),
              text: `⚡ RELAIS PIRATÉ! +${rewardIntel}MB INTEL +${rewardNano} NANO-CRÉDITS`,
              x: p.x,
              y: p.y - 30,
              color: '#eab308',
              size: 16,
              life: 50,
              maxLife: 50,
              isCrit: true
            });
            setIsNearTerminal(false);
          }
        }}
        isNearTerminal={isNearTerminal}
        onTriggerExfil={() => {
          sound.playVictory();
          stateRef.current.floatingTexts.push({
            id: 'txt_exfil_' + Math.random(),
            text: `🎯 MISSION ACCOMPLIE // EXTRACTION RÉUSSIE SANS DÉTECTION!`,
            x: stateRef.current.player.x,
            y: stateRef.current.player.y - 40,
            color: '#00ff41',
            size: 20,
            life: 70,
            maxLife: 70,
            isCrit: true
          });
          setMissionState(prev => ({
            ...prev,
            exfilUnlocked: true,
            objectives: {
              ...prev.objectives,
              primaryCompleted: true
            }
          }));
        }}
        isNearExfil={isNearExfil}
      />
    </div>
  );
};
