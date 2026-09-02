import React, { useState, useEffect, useRef, useCallback } from 'react';
const CyberArena3D = React.lazy(() => import('./CyberArena3D').then(m => ({ default: m.CyberArena3D })));
import { 
  Gamepad2, 
  Shield, 
  Zap, 
  Sparkles, 
  Terminal, 
  Cpu, 
  Crosshair, 
  Backpack, 
  Layers, 
  ChevronRight, 
  Skull, 
  Smartphone, 
  Monitor, 
  Flame, 
  Activity, 
  RotateCcw,
  Sliders,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

// ==========================================
// 1. TYPES & CONTRATS DE DONNÉES DU MOTEUR
// ==========================================

export type ItemRarity = 'standard' | 'rare' | 'epic' | 'legendary';
export type ItemSlot = 'deck' | 'armor' | 'weapon' | 'chip' | 'boots';

export interface LootItem {
  id: string;
  name: string;
  slot: ItemSlot;
  rarity: ItemRarity;
  itemLevel: number;
  stats: {
    rawDamage: number;
    armorPenetration: number;
    psychicAmp: number;
    synapticSpeed: number;
    bioArmor: number;
  };
  specialAffix?: string;
}

export interface ARPGPlayerStats {
  level: number;
  exp: number;
  expNext: number;
  bioHealth: number;
  maxBioHealth: number;
  psychicEnergy: number;
  maxPsychicEnergy: number;
  cyberOverclock: number;
  psychicMind: number;
  bioVigor: number;
  synapticSpeed: number;
  statPoints: number;
  avatarColor: string;
  auraIntensity: number;
}

export interface EnemyEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  health: number;
  maxHealth: number;
  damage: number;
  isBoss: boolean;
  color: string;
  vx: number;
  vy: number;
}

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

export interface GroundLoot {
  id: string;
  item: LootItem;
  x: number;
  y: number;
}

// ==========================================
// 2. CONSTANTES MATHÉMATIQUES & STAGES
// ==========================================

const STAGES = [
  {
    id: 1,
    name: 'Bassin du Vieux-Port Submergé',
    desc: 'Quais inondés, résidus de serveurs cryogéniques et drones SPVM automatisés.',
    bossName: 'Drone Sentinelle Apex v4',
    bgTheme: '#041019',
    accentColor: '#00f0ff'
  },
  {
    id: 2,
    name: 'Galeries Souterraines de Ville-Marie',
    desc: 'Réseau souterrain transformé en complexe de confinement et relais biométriques.',
    bossName: 'Overclocked Cyborg Enforcer',
    bgTheme: '#12071f',
    accentColor: '#a855f7'
  },
  {
    id: 3,
    name: 'Le Mont-Royal Millénaire',
    desc: 'Bastion lourdement armé gardant les antennes de transmission neuronale urbaines.',
    bossName: 'Général Cyber-Inquisiteur',
    bgTheme: '#1a050d',
    accentColor: '#f43f5e'
  },
  {
    id: 4,
    name: 'Citadelle Orbitale Place-Ville-Marie',
    desc: 'Cœur du supercalculateur central asservissant la grille neurale montréalaise.',
    bossName: 'Deus Ex Sophia // Core Prime',
    bgTheme: '#021814',
    accentColor: '#10b981'
  }
];

const RARITY_COLORS: Record<ItemRarity, { text: string; border: string; bg: string; glow: string }> = {
  standard: { text: '#94a3b8', border: '#475569', bg: 'rgba(71,85,105,0.2)', glow: 'rgba(148,163,184,0.3)' },
  rare: { text: '#38bdf8', border: '#0284c7', bg: 'rgba(2,132,199,0.2)', glow: 'rgba(56,189,248,0.5)' },
  epic: { text: '#c084fc', border: '#9333ea', bg: 'rgba(147,51,234,0.2)', glow: 'rgba(192,132,252,0.6)' },
  legendary: { text: '#fb923c', border: '#ea580c', bg: 'rgba(234,88,12,0.2)', glow: 'rgba(251,146,60,0.8)' }
};

// Formule d'expérience: EXP = Base * Level^2.4
const calculateExpForLevel = (lvl: number): number => {
  return Math.floor(120 * Math.pow(lvl, 2.4));
};

interface MontrealCyberARPGProps {
  onBack?: () => void;
}

// ==========================================
// 3. COMPOSANT MAÎTRE ARPG MONTRÉAL 2033
// ==========================================

export function MontrealCyberARPG({ onBack }: MontrealCyberARPGProps = {}) {
  // Mode de rendu & Platform viewport
  const [platformMode, setPlatformMode] = useState<'auto' | 'android' | 'desktop'>('auto');
  const [activeTab, setActiveTab] = useState<'game' | 'inventory' | 'character' | 'skills' | 'stages'>('game');
  
  // Progression & Difficulté
  const [difficultyTier, setDifficultyTier] = useState<number>(1);
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  
  // État du Joueur
  const [player, setPlayer] = useState<ARPGPlayerStats>({
    level: 1,
    exp: 0,
    expNext: calculateExpForLevel(1),
    bioHealth: 500,
    maxBioHealth: 500,
    psychicEnergy: 200,
    maxPsychicEnergy: 200,
    cyberOverclock: 10,
    psychicMind: 10,
    bioVigor: 10,
    synapticSpeed: 10,
    statPoints: 5,
    avatarColor: '#00f0ff',
    auraIntensity: 1
  });

  // Équipement Actif & Inventaire
  const [equipped, setEquipped] = useState<Record<ItemSlot, LootItem | null>>({
    deck: null,
    armor: null,
    weapon: null,
    chip: null,
    boots: null
  });
  const [inventory, setInventory] = useState<LootItem[]>([]);

  // Feedback Combat & Logs
  const [combatLogs, setCombatLogs] = useState<string[]>([
    '>> Système neural initialisé à Montréal (2033).',
    '>> Bastions corporatifs actifs. Prêt au combat.'
  ]);

  // Arbre de compétences (Points investis)
  const [skillPoints, setSkillPoints] = useState<{ cyberOverload: number; telekineticBlast: number; timeDilation: number; neuralShield: number }>({
    cyberOverload: 1,
    telekineticBlast: 1,
    timeDilation: 0,
    neuralShield: 0
  });

  // Canvas Refs & Game Engine State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef(player);
  playerRef.current = player;
  const equippedRef = useRef(equipped);
  equippedRef.current = equipped;

  const gameStateRef = useRef({
    playerPos: { x: 400, y: 300, vx: 0, vy: 0, radius: 18, isAttacking: false, attackCooldown: 0 },
    keys: { w: false, a: false, s: false, d: false, space: false, q: false, e: false },
    enemies: [] as EnemyEntity[],
    particles: [] as ParticleEffect[],
    groundLoot: [] as GroundLoot[],
    mousePos: { x: 400, y: 300 },
    lastFrameTime: performance.now(),
    isBossSpawned: false
  });

  // ----------------------------------------------------
  // SYSTÈME DE LOOT PROCÉDURAL PONDÉRÉ
  // P(Drop) = BaseDropRate * (1 + 0.15 * DifficultyTier)
  // ----------------------------------------------------
  const generateProceduralLoot = useCallback((stageLvl: number, isBoss: boolean): LootItem => {
    const slots: ItemSlot[] = ['deck', 'armor', 'weapon', 'chip', 'boots'];
    const selectedSlot = slots[Math.floor(Math.random() * slots.length)];

    const roll = Math.random() * 100;
    const bonusRarity = difficultyTier * 4.5 + (isBoss ? 35 : 0);

    let rarity: ItemRarity = 'standard';
    if (roll + bonusRarity > 92) rarity = 'legendary';
    else if (roll + bonusRarity > 70) rarity = 'epic';
    else if (roll + bonusRarity > 45) rarity = 'rare';

    const multiplier = rarity === 'legendary' ? 3.8 : rarity === 'epic' ? 2.4 : rarity === 'rare' ? 1.6 : 1.0;
    const baseStat = (stageLvl * 12 + difficultyTier * 8) * multiplier;

    const names: Record<ItemSlot, string[]> = {
      deck: ['Cyber-Deck Cyberia-X', 'Bio-Transmetteur Néo-MTL', 'Neural Splicer V8', 'Interface Racine PVM'],
      armor: ['Exo-Châssis Renforcé', 'Nano-Tunique Furtive', 'Plastron Polymère SPVM', 'Armure Psionique Éthérée'],
      weapon: ['Lame Haute-Fréquence', 'Gantelet Télékinétique', 'Fusil à Surcharge EMP', 'Faisceau Synaptique'],
      chip: ['Puce Overclock 33Hz', 'Coprocesseur Quantique', 'Implant Psychique Alpha', 'Noyau Anti-Gravité'],
      boots: ['Bottes Mag-Lev', 'Propulseurs Synaptiques', 'Baskets Runes-Néon', 'Stabilisateurs de Phase']
    };

    const slotNames = names[selectedSlot];
    const itemName = `${slotNames[Math.floor(Math.random() * slotNames.length)]} [T${difficultyTier}]`;

    const specialAffixes = [
      'Surcharge Synaptique : 15% de chance de foudre EMP',
      'Distorsion Astrale : Esquive augmentée de 20%',
      'Bouclier Récursif : Restaure 5% de Bio-Santé par élimination',
      'Vitesse Quantique : Réduit les temps de recharge de 25%'
    ];

    return {
      id: `loot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: itemName,
      slot: selectedSlot,
      rarity,
      itemLevel: stageLvl * 10 + difficultyTier,
      stats: {
        rawDamage: Math.round(baseStat * 1.4),
        armorPenetration: Math.round(baseStat * 0.8),
        psychicAmp: Math.round(baseStat * 1.2),
        synapticSpeed: Math.round(baseStat * 0.6),
        bioArmor: Math.round(baseStat * 1.1)
      },
      specialAffix: rarity === 'legendary' || rarity === 'epic' ? specialAffixes[Math.floor(Math.random() * specialAffixes.length)] : undefined
    };
  }, [difficultyTier]);

  // ----------------------------------------------------
  // GESTION DU GAIN D'EXP & MONTÉE EN PUISSANCE (1 à 99)
  // ----------------------------------------------------
  const addExperience = useCallback((amount: number) => {
    setPlayer(prev => {
      let currentExp = prev.exp + amount;
      let currentLvl = prev.level;
      let expTarget = prev.expNext;
      let earnedPoints = 0;

      while (currentExp >= expTarget && currentLvl < 99) {
        currentExp -= expTarget;
        currentLvl += 1;
        expTarget = calculateExpForLevel(currentLvl);
        earnedPoints += 4;
        setCombatLogs(logs => [`★ NIVEAU SUPÉRIEUR ! Niveau ${currentLvl} atteint. +4 Points d'Attributs`, ...logs.slice(0, 15)]);
      }

      return {
        ...prev,
        level: currentLvl,
        exp: currentExp,
        expNext: expTarget,
        statPoints: prev.statPoints + earnedPoints,
        maxBioHealth: 500 + prev.bioVigor * 25 + currentLvl * 30,
        maxPsychicEnergy: 200 + prev.psychicMind * 15 + currentLvl * 10
      };
    });
  }, []);

  // ----------------------------------------------------
  // POPULATION DES ENNEMIS PAR STAGE
  // ----------------------------------------------------
  const spawnStageEnemies = useCallback((stageId: number) => {
    const stage = STAGES.find(s => s.id === stageId) || STAGES[0];
    const enemies: EnemyEntity[] = [];
    const count = 6 + difficultyTier * 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 180 + Math.random() * 260;
      enemies.push({
        id: `enemy-${i}-${Date.now()}`,
        name: `Patrouilleur Cyber T${difficultyTier}`,
        x: 400 + Math.cos(angle) * dist,
        y: 300 + Math.sin(angle) * dist,
        radius: 14,
        health: (120 + stageId * 80) * (1 + difficultyTier * 0.4),
        maxHealth: (120 + stageId * 80) * (1 + difficultyTier * 0.4),
        damage: (15 + stageId * 8) * (1 + difficultyTier * 0.25),
        isBoss: false,
        color: '#f43f5e',
        vx: 0,
        vy: 0
      });
    }

    // Boss du Stage
    enemies.push({
      id: `boss-${stageId}`,
      name: stage.bossName,
      x: 400,
      y: 120,
      radius: 28,
      health: (1200 + stageId * 1000) * (1 + difficultyTier * 0.6),
      maxHealth: (1200 + stageId * 1000) * (1 + difficultyTier * 0.6),
      damage: (45 + stageId * 20) * (1 + difficultyTier * 0.35),
      isBoss: true,
      color: '#ec4899',
      vx: 0,
      vy: 0
    });

    gameStateRef.current.enemies = enemies;
    gameStateRef.current.groundLoot = [];
    gameStateRef.current.particles = [];
  }, [difficultyTier]);

  // Initialisation du stage
  useEffect(() => {
    spawnStageEnemies(currentStageId);
  }, [currentStageId, difficultyTier, spawnStageEnemies]);

  // ----------------------------------------------------
  // GESTION DES CLAVIERS & ENTRÉES
  // ----------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'z' || k === 'arrowup') gameStateRef.current.keys.w = true;
      if (k === 'a' || k === 'q' || k === 'arrowleft') gameStateRef.current.keys.a = true;
      if (k === 's' || k === 'arrowdown') gameStateRef.current.keys.s = true;
      if (k === 'd' || k === 'arrowright') gameStateRef.current.keys.d = true;
      if (k === ' ') gameStateRef.current.keys.space = true;
      if (k === '1') triggerSkill('cyber');
      if (k === '2') triggerSkill('psychic');
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'z' || k === 'arrowup') gameStateRef.current.keys.w = false;
      if (k === 'a' || k === 'q' || k === 'arrowleft') gameStateRef.current.keys.a = false;
      if (k === 's' || k === 'arrowdown') gameStateRef.current.keys.s = false;
      if (k === 'd' || k === 'arrowright') gameStateRef.current.keys.d = false;
      if (k === ' ') gameStateRef.current.keys.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Déclencheur des compétences
  const triggerSkill = (type: 'cyber' | 'psychic') => {
    const state = gameStateRef.current;
    if (type === 'cyber') {
      if (player.psychicEnergy < 35) return;
      setPlayer(p => ({ ...p, psychicEnergy: Math.max(0, p.psychicEnergy - 35) }));
      
      // AOE Surcharge Cybernétique
      for (let i = 0; i < 30; i++) {
        const ang = (Math.PI * 2 / 30) * i;
        state.particles.push({
          x: state.playerPos.x,
          y: state.playerPos.y,
          vx: Math.cos(ang) * 6,
          vy: Math.sin(ang) * 6,
          color: '#00f0ff',
          size: 4,
          alpha: 1,
          life: 25
        });
      }

      state.enemies.forEach(en => {
        const dx = en.x - state.playerPos.x;
        const dy = en.y - state.playerPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const dmg = (60 + player.cyberOverclock * 8) * (1 + (equipped.weapon?.stats.rawDamage || 0) * 0.05);
          en.health -= dmg;
          createDamageNumber(en.x, en.y, Math.round(dmg), '#00f0ff');
        }
      });
    } else {
      if (player.psychicEnergy < 50) return;
      setPlayer(p => ({ ...p, psychicEnergy: Math.max(0, p.psychicEnergy - 50) }));

      // Frappe Télékinétique de zone
      for (let i = 0; i < 40; i++) {
        state.particles.push({
          x: state.playerPos.x + (Math.random() - 0.5) * 120,
          y: state.playerPos.y + (Math.random() - 0.5) * 120,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          color: '#ec4899',
          size: 6,
          alpha: 1,
          life: 30
        });
      }

      state.enemies.forEach(en => {
        const dx = en.x - state.playerPos.x;
        const dy = en.y - state.playerPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 240) {
          const dmg = (110 + player.psychicMind * 12) * (1 + (equipped.chip?.stats.psychicAmp || 0) * 0.05);
          en.health -= dmg;
          createDamageNumber(en.x, en.y, Math.round(dmg), '#ec4899');
        }
      });
    }
  };

  const createDamageNumber = (x: number, y: number, dmg: number, color: string) => {
    gameStateRef.current.particles.push({
      x,
      y: y - 10,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -2,
      color,
      size: dmg, // size stocke la valeur de dégâts pour le texte
      alpha: 1,
      life: 35
    });
  };

  // ----------------------------------------------------
  // BOUCLE DE JEU PRINCIPALE (60 FPS CANVAS RENDERING & HI-DPI)
  // ----------------------------------------------------
  useEffect(() => {
    let animationFrameId: number;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const cssWidth = rect.width || (window.innerWidth < 1024 ? window.innerWidth - 32 : 900);
      const cssHeight = rect.height || 560;

      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvas.width / dpr;
      const cssHeight = canvas.height / dpr;

      const state = gameStateRef.current;
      const stage = STAGES.find(s => s.id === currentStageId) || STAGES[0];

      // Nettoyage & Background Cyberpunk
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // Grille matricielle
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < cssWidth; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, cssHeight);
        ctx.stroke();
      }
      for (let y = 0; y < cssHeight; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cssWidth, y);
        ctx.stroke();
      }

      // 1. Déplacement du Joueur
      const currentPlayer = playerRef.current;
      const currentEquipped = equippedRef.current;
      const speed = 3.5 + currentPlayer.synapticSpeed * 0.08;
      if (state.keys.w && state.playerPos.y > state.playerPos.radius) state.playerPos.y -= speed;
      if (state.keys.s && state.playerPos.y < canvas.height - state.playerPos.radius) state.playerPos.y += speed;
      if (state.keys.a && state.playerPos.x > state.playerPos.radius) state.playerPos.x -= speed;
      if (state.keys.d && state.playerPos.x < canvas.width - state.playerPos.radius) state.playerPos.x += speed;

      // Attaque de mêlée Smash (Barre d'espace)
      if (state.keys.space && state.playerPos.attackCooldown <= 0) {
        state.playerPos.isAttacking = true;
        state.playerPos.attackCooldown = 16; // frames
        
        // Particules de frappe
        for (let i = 0; i < 15; i++) {
          const ang = Math.random() * Math.PI * 2;
          state.particles.push({
            x: state.playerPos.x + Math.cos(ang) * 28,
            y: state.playerPos.y + Math.sin(ang) * 28,
            vx: Math.cos(ang) * 4,
            vy: Math.sin(ang) * 4,
            color: currentPlayer.avatarColor,
            size: 3,
            alpha: 1,
            life: 15
          });
        }

        // Dégâts aux ennemis à portée
        state.enemies.forEach(en => {
          const dx = en.x - state.playerPos.x;
          const dy = en.y - state.playerPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < state.playerPos.radius + en.radius + 35) {
            const rawDmg = (35 + currentPlayer.cyberOverclock * 4 + currentPlayer.psychicMind * 3) * (1 + (currentEquipped.weapon?.stats.rawDamage || 0) * 0.03);
            en.health -= rawDmg;
            createDamageNumber(en.x, en.y, Math.round(rawDmg), '#ffffff');
            
            // Recul de l'ennemi (Hit-Freeze vector)
            en.x += (dx / dist) * 12;
            en.y += (dy / dist) * 12;
          }
        });
      }

      if (state.playerPos.attackCooldown > 0) {
        state.playerPos.attackCooldown--;
      } else {
        state.playerPos.isAttacking = false;
      }

      // 2. Mise à jour & Rendu du Joueur (Avatar Stylisé Néo)
      const p = state.playerPos;
      
      // Aura Psychique
      const grad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.5, p.x, p.y, p.radius * 2.2);
      grad.addColorStop(0, currentPlayer.avatarColor);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Corps de l'Avatar
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = currentPlayer.avatarColor;
      ctx.stroke();

      // Cœur d'énergie neural
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Halo d'attaque si actif
      if (p.isAttacking) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 28, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. IA et Rendu des Ennemis
      let playerDamageTaken = 0;

      state.enemies = state.enemies.filter(en => {
        if (en.health <= 0) {
          // Mort ennemie : Drops & EXP
          const expGain = (en.isBoss ? 450 : 65) * (1 + difficultyTier * 0.3);
          addExperience(expGain);

          // Génération de loot au sol
          const dropChance = 0.45 * (1 + 0.15 * difficultyTier);
          if (Math.random() < dropChance || en.isBoss) {
            const item = generateProceduralLoot(currentStageId, en.isBoss);
            state.groundLoot.push({
              id: `loot-${Date.now()}-${Math.random()}`,
              item,
              x: en.x,
              y: en.y
            });
            setCombatLogs(l => [`[LOOT DROPPÉ] ${item.name} (${item.rarity.toUpperCase()})`, ...l.slice(0, 15)]);
          }

          // Particules d'explosion
          for (let i = 0; i < (en.isBoss ? 50 : 20); i++) {
            const ang = Math.random() * Math.PI * 2;
            state.particles.push({
              x: en.x,
              y: en.y,
              vx: Math.cos(ang) * (Math.random() * 5 + 1),
              vy: Math.sin(ang) * (Math.random() * 5 + 1),
              color: en.color,
              size: Math.random() * 4 + 2,
              alpha: 1,
              life: 25
            });
          }
          return false;
        }

        // Déplacement vers le joueur
        const dx = p.x - en.x;
        const dy = p.y - en.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
          const moveSpeed = en.isBoss ? 1.2 : 1.8;
          en.x += (dx / dist) * moveSpeed;
          en.y += (dy / dist) * moveSpeed;
        }

        // Attaque au contact du joueur
        if (dist < p.radius + en.radius) {
          const mitigation = (currentPlayer.bioVigor * 2 + (currentEquipped.armor?.stats.bioArmor || 0)) * 0.08;
          const actualDmg = Math.max(2, en.damage - mitigation);
          playerDamageTaken += actualDmg * 0.05;
        }

        // Rendu Ennemi
        ctx.fillStyle = en.isBoss ? 'rgba(236,72,153,0.3)' : 'rgba(244,63,94,0.2)';
        ctx.beginPath();
        ctx.arc(en.x, en.y, en.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(en.x, en.y, en.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = en.isBoss ? 3 : 2;
        ctx.strokeStyle = en.color;
        ctx.stroke();

        // Barre de vie ennemie
        const hpPct = en.health / en.maxHealth;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(en.x - 20, en.y - en.radius - 10, 40, 5);
        ctx.fillStyle = en.isBoss ? '#ec4899' : '#f43f5e';
        ctx.fillRect(en.x - 20, en.y - en.radius - 10, 40 * hpPct, 5);

        return true;
      });

      // Application des dégâts reçus si contact
      if (playerDamageTaken > 0) {
        setPlayer(pl => ({
          ...pl,
          bioHealth: Math.max(0, pl.bioHealth - playerDamageTaken)
        }));
      }

      // 4. Rendu du Butin au Sol
      state.groundLoot.forEach(gl => {
        const col = RARITY_COLORS[gl.item.rarity];
        
        // Rayonnement lumineux
        ctx.fillStyle = col.glow;
        ctx.beginPath();
        ctx.arc(gl.x, gl.y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = col.text;
        ctx.beginPath();
        ctx.arc(gl.x, gl.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Ramassage automatique par proximité
        const dx = p.x - gl.x;
        const dy = p.y - gl.y;
        if (Math.sqrt(dx * dx + dy * dy) < p.radius + 15) {
          setInventory(inv => [gl.item, ...inv]);
          setCombatLogs(l => [`[INVENTAIRE] ${gl.item.name} ramassé !`, ...l.slice(0, 15)]);
          state.groundLoot = state.groundLoot.filter(i => i.id !== gl.id);
        }
      });

      // 5. Particules & Numéros de Dégâts
      state.particles = state.particles.filter(pt => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        pt.alpha = pt.life / 35;

        if (pt.life <= 0) return false;

        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);

        if (pt.size > 10) {
          // Affichage de texte de dégâts
          ctx.font = 'bold 12px monospace';
          ctx.fillStyle = pt.color;
          ctx.fillText(`-${Math.round(pt.size)}`, pt.x, pt.y);
        } else {
          // Particule classique
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        return true;
      });

      ctx.restore(); // Restore scale
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentStageId, difficultyTier, addExperience, generateProceduralLoot]);

  // Régénération périodique (1x par seconde au lieu de chaque frame 60fps)
  useEffect(() => {
    const regenTimer = setInterval(() => {
      setPlayer(pl => {
        if (pl.psychicEnergy >= pl.maxPsychicEnergy) return pl;
        return {
          ...pl,
          psychicEnergy: Math.min(pl.maxPsychicEnergy, pl.psychicEnergy + 8)
        };
      });
    }, 1000);

    return () => clearInterval(regenTimer);
  }, []);

  // Équiper un objet de l'inventaire
  const equipItem = (item: LootItem) => {
    setEquipped(prev => {
      const currentEquipped = prev[item.slot];
      if (currentEquipped) {
        setInventory(inv => [currentEquipped, ...inv.filter(i => i.id !== item.id)]);
      } else {
        setInventory(inv => inv.filter(i => i.id !== item.id));
      }
      return { ...prev, [item.slot]: item };
    });
    setCombatLogs(l => [`Équipé : ${item.name}`, ...l.slice(0, 15)]);
  };

  // Attribution des points de stats
  const allocateStat = (statName: keyof Pick<ARPGPlayerStats, 'cyberOverclock' | 'psychicMind' | 'bioVigor' | 'synapticSpeed'>) => {
    if (player.statPoints <= 0) return;
    setPlayer(p => ({
      ...p,
      [statName]: p[statName] + 1,
      statPoints: p.statPoints - 1
    }));
  };

  const isMobile = platformMode === 'android' || (platformMode === 'auto' && typeof window !== 'undefined' && window.innerWidth < 1024);

  return (
    <div className="w-full min-h-screen bg-[#030712] text-slate-100 font-mono select-none overflow-x-hidden flex flex-col">
      
      {/* =========================================================================
          STYLES CSS INLINE POUR SCROLLBARS CYBERPUNK (ANDROÏD ET DESKTOP 17")
          ========================================================================= */}
      <style>{`
        /* Scrollbar personnalisée néon cyberpunk */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #090e1a;
          border-left: 1px solid rgba(6, 182, 212, 0.2);
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4, #a855f7);
          border-radius: 4px;
          border: 1px solid #00f0ff;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #22d3ee, #c084fc);
          box-shadow: 0 0 14px rgba(6, 182, 212, 0.8);
        }
        /* Mode tactile fluide pour Android */
        .cyber-scroll {
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #06b6d4 #090e1a;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

      {/* HEADER DE COMMANDE ET SELECTEUR DE VUE */}
      <header className="w-full bg-[#070d19]/95 border-b border-cyan-500/30 px-3 py-2 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 shadow-[0_4px_25px_rgba(0,255,255,0.08)]">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950 flex items-center gap-1 text-[10px] font-bold mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETOUR</span>
            </button>
          )}
          <div className="p-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/60 text-cyan-400">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black tracking-widest text-cyan-300 uppercase leading-none">
              MONTRÉAL 2033 // NEURAL ARPG
            </div>
            <div className="text-[9px] text-slate-400">HACK & SMASH ENGINE v2.4</div>
          </div>
        </div>

        {/* Commutateur de plateforme */}
        <div className="flex items-center bg-[#040813] p-1 rounded-lg border border-cyan-500/40">
          <button
            onClick={() => setPlatformMode('android')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
              platformMode === 'android' ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.7)]' : 'text-cyan-400/70 hover:text-cyan-300'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>ANDROID</span>
          </button>
          <button
            onClick={() => setPlatformMode('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
              platformMode === 'desktop' ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.7)]' : 'text-cyan-400/70 hover:text-cyan-300'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>DESKTOP 17"</span>
          </button>
          <button
            onClick={() => setPlatformMode('auto')}
            className={`px-2 py-1 rounded text-[9px] font-semibold transition-all ${
              platformMode === 'auto' ? 'text-cyan-300 underline' : 'text-slate-500'
            }`}
          >
            AUTO
          </button>
        </div>

        {/* Statut Difficulté Actuelle */}
        <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-500/40 px-2.5 py-1 rounded text-[10px] text-purple-300">
          <Flame className="w-3 h-3 text-pink-400 animate-bounce" />
          <span>DIFFICULTÉ : TIER {difficultyTier}</span>
        </div>
      </header>

      {/* NAVIGATION TACTIQUE SUPÉRIEURE */}
      <div className="w-full bg-[#050b14] border-b border-cyan-900/40 px-3 py-1.5 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'game', label: '🎮 Champ de Bataille', icon: Gamepad2 },
          { id: 'inventory', label: `🎒 Inventaire (${inventory.length})`, icon: Backpack },
          { id: 'character', label: '👤 Avatar & Stats', icon: Sliders },
          { id: 'skills', label: '⚡ Arbre Neural', icon: Zap },
          { id: 'stages', label: '🗺️ 4 Bastions', icon: Layers },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all border ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-[#091122] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONTENEUR PRINCIPAL ADAPTATIF */}
      <main className={`flex-1 w-full mx-auto p-2 sm:p-4 overflow-y-auto touch-pan-y ${isMobile ? 'max-w-md' : 'max-w-[1850px]'}`}>
        
        {/* VUE 1 : CHAMP DE BATAILLE ET COMBAT HIT & SMASH */}
        {activeTab === 'game' && (
          <div className={`${isMobile ? 'flex flex-col gap-3' : 'grid grid-cols-12 gap-4'}`}>
            
            {/* Colonne Gauche (Desktop) / Barre Haute (Mobile) - HUD & BIO-METRICS */}
            <div className={`${isMobile ? 'w-full' : 'col-span-3'} flex flex-col gap-3`}>
              
              {/* Jauge Bio-Santé & Énergie Psychique */}
              <div className="bg-[#091124]/90 border border-cyan-500/30 rounded-xl p-3 shadow-lg flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-400 border-b border-cyan-500/20 pb-1">
                  <span>BIO-TÉLÉMÉTRIE NÉO</span>
                  <span className="text-emerald-400 text-[10px]">60 FPS STABLE</span>
                </div>

                {/* Barre de Santé */}
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-rose-400 font-bold">BIO-SANTÉ</span>
                    <span className="text-rose-300 font-bold">{Math.round(player.bioHealth)} / {player.maxBioHealth}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-rose-900/60">
                    <div 
                      className="bg-gradient-to-r from-rose-600 to-pink-500 h-full transition-all duration-150"
                      style={{ width: `${(player.bioHealth / player.maxBioHealth) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Barre d'Énergie Psychique */}
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-purple-400 font-bold">ÉNERGIE PSYCHIQUE</span>
                    <span className="text-purple-300 font-bold">{Math.round(player.psychicEnergy)} / {player.maxPsychicEnergy}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-purple-900/60">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-150"
                      style={{ width: `${(player.psychicEnergy / player.maxPsychicEnergy) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Progression d'Expérience */}
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-cyan-400 font-bold">NIVEAU {player.level} / 99</span>
                    <span className="text-cyan-300 text-[9px]">{player.exp} / {player.expNext} EXP</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-cyan-900/60">
                    <div 
                      className="bg-cyan-400 h-full transition-all duration-150"
                      style={{ width: `${(player.exp / player.expNext) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Raccourcis de Compétences Actives */}
              <div className="bg-[#091124]/90 border border-cyan-500/30 rounded-xl p-3 shadow-lg flex flex-col gap-2">
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  Attaques Spéciales [Clavier / Clic]
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => triggerSkill('cyber')}
                    className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/50 hover:bg-cyan-900/60 text-left flex flex-col gap-0.5 active:scale-95 transition-all"
                  >
                    <span className="text-[9px] text-cyan-400 font-bold">[1] Surcharge EMP</span>
                    <span className="text-[8px] text-slate-400">Coût: 35 Psychique</span>
                  </button>
                  <button 
                    onClick={() => triggerSkill('psychic')}
                    className="p-2 rounded-lg bg-pink-950/60 border border-pink-500/50 hover:bg-pink-900/60 text-left flex flex-col gap-0.5 active:scale-95 transition-all"
                  >
                    <span className="text-[9px] text-pink-400 font-bold">[2] Frappe Astrale</span>
                    <span className="text-[8px] text-slate-400">Coût: 50 Psychique</span>
                  </button>
                </div>
                <div className="text-[9px] text-slate-500 text-center">
                  Contrôles : ZQSD / Flèches pour bouger • Espace pour Hit & Smash
                </div>
              </div>

            </div>

            {/* Zone Centrale (Canvas 2D de Jeu 60 FPS Fluid Hi-DPI) */}
            <div className={`${isMobile ? 'w-full' : 'col-span-6'} flex flex-col items-center`}>
              <div className="relative w-full h-[520px] lg:h-[580px] rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.2)] bg-black">
                <React.Suspense fallback={<div className="absolute inset-0 bg-black/90 flex items-center justify-center text-cyan-400 font-mono text-xs">CHARGEMENT ARÈNE 3D...</div>}>
                  <CyberArena3D gameStateRef={gameStateRef.current} />
                </React.Suspense>
                <canvas 
                  ref={canvasRef} 
                  className="absolute top-0 left-0 w-full h-full block cursor-crosshair z-10 pointer-events-none"
                />
                
                {/* Overlay Stage Badge */}
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur border border-cyan-500/40 rounded px-2.5 py-1 text-[10px] text-cyan-300 font-bold">
                  STAGE {currentStageId} : {STAGES.find(s => s.id === currentStageId)?.name}
                </div>

                {/* Bouton Reset / Respawn */}
                {player.bioHealth <= 0 && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
                    <Skull className="w-12 h-12 text-rose-500 mb-2 animate-bounce" />
                    <h2 className="text-lg font-black text-rose-400 mb-1">CONNEXION NEURALE ROMPUE</h2>
                    <p className="text-xs text-slate-400 mb-4 max-w-sm">
                      Votre bio-enveloppe a succombé aux défenses gouvernementales.
                    </p>
                    <button
                      onClick={() => {
                        setPlayer(p => ({ ...p, bioHealth: p.maxBioHealth, psychicEnergy: p.maxPsychicEnergy }));
                        spawnStageEnemies(currentStageId);
                      }}
                      className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-extrabold text-xs shadow-[0_0_15px_rgba(6,182,212,0.6)] hover:bg-cyan-400"
                    >
                      RÉINITIALISER LA MATRICE
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne Droite (Logs & Butin Rapide avec Scrollbar Fluide) */}
            <div className={`${isMobile ? 'w-full' : 'col-span-3'} flex flex-col gap-3`}>
              <div className="bg-[#091124]/90 border border-cyan-500/30 rounded-xl p-3 shadow-lg flex flex-col h-[300px]">
                <div className="text-[11px] font-bold text-cyan-400 border-b border-cyan-500/20 pb-1.5 mb-2 flex items-center justify-between">
                  <span>TERMINAL DE COMBAT</span>
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                
                {/* Zone de logs avec curseur de défilement dédié */}
                <div className="cyber-scroll flex-1 pr-1 space-y-1 text-[10px]">
                  {combatLogs.map((log, index) => (
                    <div key={index} className="text-slate-300 leading-tight">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Équipement Actif Actuel */}
              <div className="bg-[#091124]/90 border border-cyan-500/30 rounded-xl p-3 shadow-lg">
                <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-2">
                  Slots Équipés
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                  {(['deck', 'armor', 'weapon', 'chip', 'boots'] as ItemSlot[]).map(slot => (
                    <div key={slot} className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 uppercase block">{slot}</span>
                      <span className="font-bold text-cyan-300 truncate block">
                        {equipped[slot]?.name || 'Emplacement vide'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VUE 2 : INVENTAIRE & LOOT AVEC SCROLLBAR OPTIMISÉE */}
        {activeTab === 'inventory' && (
          <div className="bg-[#080e1d] border border-cyan-500/30 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-black text-cyan-300 uppercase">INVENTAIRE TACTIQUE & BUTIN PROCÉDURAL</h2>
                <p className="text-[10px] text-slate-400">Équipez vos modules cybernétiques et amplificateurs psychiques.</p>
              </div>
              <div className="text-xs text-purple-300 font-bold bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-500/30">
                Capacité : {inventory.length} Objets
              </div>
            </div>

            {/* Grille avec scrollbar tactile / desktop */}
            <div className="cyber-scroll max-h-[65dvh] pr-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {inventory.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 text-xs">
                  Aucun butin récupéré. Éliminez des patrouilleurs dans le secteur montréalais.
                </div>
              ) : (
                inventory.map(item => {
                  const col = RARITY_COLORS[item.rarity];
                  return (
                    <div 
                      key={item.id} 
                      className="rounded-xl p-3 flex flex-col justify-between transition-all"
                      style={{ background: col.bg, border: `1px solid ${col.border}` }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded" style={{ background: col.border, color: '#000' }}>
                            {item.rarity}
                          </span>
                          <span className="text-[9px] text-slate-400">Niv. {item.itemLevel}</span>
                        </div>
                        <h4 className="text-xs font-bold mb-2" style={{ color: col.text }}>{item.name}</h4>
                        
                        <div className="space-y-0.5 text-[10px] text-slate-300">
                          <div className="flex justify-between">
                            <span>Dégâts Bruts :</span>
                            <span className="text-cyan-300 font-bold">+{item.stats.rawDamage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pénétration Armure :</span>
                            <span className="text-cyan-300 font-bold">+{item.stats.armorPenetration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Amplification Psionique :</span>
                            <span className="text-purple-300 font-bold">+{item.stats.psychicAmp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bio-Armure :</span>
                            <span className="text-emerald-300 font-bold">+{item.stats.bioArmor}</span>
                          </div>
                        </div>

                        {item.specialAffix && (
                          <div className="mt-2 text-[9px] p-1.5 rounded bg-black/50 border border-amber-500/40 text-amber-300 italic">
                            ✦ {item.specialAffix}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => equipItem(item)}
                        className="mt-3 w-full py-1.5 rounded bg-cyan-500 text-black font-extrabold text-[10px] hover:bg-cyan-400 active:scale-95 transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                      >
                        ÉQUIPER SUR SLOT [{item.slot.toUpperCase()}]
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* VUE 3 : CUSTOMISATION DU PERSONNAGE & ATTRIBUTS */}
        {activeTab === 'character' && (
          <div className="bg-[#080e1d] border border-cyan-500/30 rounded-2xl p-4 shadow-2xl max-w-2xl mx-auto">
            <div className="border-b border-cyan-500/20 pb-3 mb-4">
              <h2 className="text-sm font-black text-cyan-300 uppercase">MODULATION DE L'AVATAR & ATTRIBUTS</h2>
              <p className="text-[10px] text-slate-400">Personnalisez votre signature d'onde et allouez vos points d'évolution.</p>
            </div>

            <div className="cyber-scroll max-h-[60dvh] pr-2 space-y-4">
              
              {/* Sélecteur de couleur de l'Aura Néo */}
              <div className="bg-[#0b1426] p-3 rounded-xl border border-cyan-500/30">
                <label className="text-xs font-bold text-cyan-300 mb-2 block">
                  Shader & Aura Psychique de l'Avatar
                </label>
                <div className="flex items-center gap-3">
                  {['#00f0ff', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#ffffff'].map(color => (
                    <button
                      key={color}
                      onClick={() => setPlayer(p => ({ ...p, avatarColor: color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        player.avatarColor === color ? 'scale-110 border-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Attribution des Statistiques (Points disponibles) */}
              <div className="bg-[#0b1426] p-3 rounded-xl border border-cyan-500/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-cyan-300">ATTRIBUTS DE PUISSANCE</span>
                  <span className="text-xs font-extrabold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                    Points Disponibles : {player.statPoints}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { key: 'cyberOverclock', name: 'Cyber Overclock (Dégâts EMP / Hacking)', val: player.cyberOverclock },
                    { key: 'psychicMind', name: 'Psychic Mind (Puissance des Frappes Astrales)', val: player.psychicMind },
                    { key: 'bioVigor', name: 'Bio Vigor (Santé Maximale & Résistance)', val: player.bioVigor },
                    { key: 'synapticSpeed', name: 'Synaptic Speed (Vitesse de Déplacement)', val: player.synapticSpeed }
                  ].map(stat => (
                    <div key={stat.key} className="flex items-center justify-between bg-slate-950/60 p-2 rounded border border-slate-800">
                      <div>
                        <div className="font-bold text-slate-200">{stat.name}</div>
                        <div className="text-[10px] text-cyan-400">Niveau Actuel : {stat.val}</div>
                      </div>
                      <button
                        onClick={() => allocateStat(stat.key as any)}
                        disabled={player.statPoints <= 0}
                        className={`px-3 py-1 rounded font-bold text-xs ${
                          player.statPoints > 0 ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        + AMÉLIORER
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VUE 4 : ARBRE NEURAL (CYBER-HACKING VS PSYCHIQUE) */}
        {activeTab === 'skills' && (
          <div className="bg-[#080e1d] border border-cyan-500/30 rounded-2xl p-4 shadow-2xl">
            <div className="border-b border-cyan-500/20 pb-3 mb-4">
              <h2 className="text-sm font-black text-cyan-300 uppercase">ARBRE DE COMPÉTENCES HYBRIDE</h2>
              <p className="text-[10px] text-slate-400">Branche Cyber-Hacking (Debuffs/AOE) et Branche Psychique (Impact brut).</p>
            </div>

            <div className="cyber-scroll max-h-[60dvh] pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Branche Cyber */}
              <div className="bg-[#071120] p-4 rounded-xl border border-cyan-500/30">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-3">
                  <Terminal className="w-4 h-4" />
                  <span>BRANCHE 1 : CYBER-HACKING</span>
                </div>
                <div className="space-y-3">
                  <div className="p-2.5 rounded bg-slate-950/70 border border-cyan-500/20">
                    <div className="font-bold text-xs text-cyan-200">Surcharge EMP Synaptique</div>
                    <div className="text-[10px] text-slate-400">Libère une décharge circulaire désactivant les boucliers ennemis.</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950/70 border border-cyan-500/20">
                    <div className="font-bold text-xs text-cyan-200">Malware Auto-Réplicant</div>
                    <div className="text-[10px] text-slate-400">Dégâts continus infligés aux serveurs et cyborgs dans un rayon de 20m.</div>
                  </div>
                </div>
              </div>

              {/* Branche Psychique */}
              <div className="bg-[#14081c] p-4 rounded-xl border border-purple-500/30">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-3">
                  <Sparkles className="w-4 h-4" />
                  <span>BRANCHE 2 : FACULTÉS PSYCHIQUES</span>
                </div>
                <div className="space-y-3">
                  <div className="p-2.5 rounded bg-slate-950/70 border border-purple-500/20">
                    <div className="font-bold text-xs text-purple-200">Télékinésie Cinétique Brutale</div>
                    <div className="text-[10px] text-slate-400">Projette les ennemis au sol et inflige des dégâts d'écrasement massifs.</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950/70 border border-purple-500/20">
                    <div className="font-bold text-xs text-purple-200">Distorsion Temporelle (Bullet-Time)</div>
                    <div className="text-[10px] text-slate-400">Ralentit les projectiles adverses de 60% pendant 4 secondes.</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VUE 5 : 4 BASTIONS DE MONTRÉAL & PALIERS DE DIFFICULTÉ */}
        {activeTab === 'stages' && (
          <div className="bg-[#080e1d] border border-cyan-500/30 rounded-2xl p-4 shadow-2xl">
            <div className="border-b border-cyan-500/20 pb-3 mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-black text-cyan-300 uppercase">SÉLECTEUR DE SECTEURS & PALIERS (1 À 10)</h2>
                <p className="text-[10px] text-slate-400">Chaque palier amplifie les statistiques ennemies et les chances d'objets Légendaires.</p>
              </div>
              
              {/* Sélecteur de Tier 1 à 10 */}
              <div className="flex items-center gap-1.5 bg-[#03060f] p-1.5 rounded-xl border border-purple-500/40">
                <span className="text-[10px] font-bold text-purple-300 mr-1">TIER :</span>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tier => (
                  <button
                    key={tier}
                    onClick={() => setDifficultyTier(tier)}
                    className={`w-6 h-6 rounded text-[10px] font-bold transition-all ${
                      difficultyTier === tier ? 'bg-pink-500 text-black shadow-[0_0_10px_rgba(236,72,153,0.8)]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Cartes des 4 Bastions avec scroll fluide */}
            <div className="cyber-scroll max-h-[60dvh] pr-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              {STAGES.map(stg => (
                <div
                  key={stg.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    currentStageId === stg.id ? 'bg-[#0e1b30] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-[#060c18] border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-cyan-400 font-bold">SECTEUR {stg.id}</span>
                      {currentStageId === stg.id && (
                        <span className="text-[9px] bg-cyan-500 text-black font-extrabold px-1.5 py-0.5 rounded">ACTIF</span>
                      )}
                    </div>
                    <h3 className="text-xs font-black text-slate-100 mb-1">{stg.name}</h3>
                    <p className="text-[10px] text-slate-400 mb-3">{stg.desc}</p>
                    <div className="text-[10px] text-pink-400 font-semibold">
                      Boss Gardien : {stg.bossName}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentStageId(stg.id);
                      setActiveTab('game');
                    }}
                    className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-bold text-xs shadow-[0_0_12px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all"
                  >
                    DÉPLOYER DANS CE BASTION
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}

export default MontrealCyberARPG;
