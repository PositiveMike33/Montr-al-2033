// ═══════════════════════════════════════════════════════════════════════════════
// PROCEDURAL DUNGEON ENGINE — DIABLO IV ARPG LEVEL GENERATION
// [WLD-06] LEVEL & PROCEDURAL DESIGNER × [SYS-02] ITEMIZATION & ENEMY PACING
// Supports: Catacombs, Docks, Megastructure, Citadel with deterministic PRNG
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  CombatEntity, 
  LootDrop, 
  StageInfo, 
  ItemRarity, 
  CyberSoldierClass,
  DamageType
} from '../types';
import { generateLootItem } from './lootGenerator';
import { rollEliteAffixes, getDefaultResistances } from './eliteAffixes';

// ── Tile & Grid Constants ──
export enum TileType {
  VOID = 0,
  FLOOR = 1,
  WALL = 2,
  CORRIDOR = 3,
  DOOR = 4,
  PILLAR = 5,
  WATER_HAZARD = 6,
  PIT_CHASM = 7,
  ALTAR = 8,
  CHEST = 9,
  SHRINE = 10,
  TERMINAL = 11,
  EXIT_PORTAL = 12,
  BREAKABLE = 13
}

export type RoomType = 
  | 'ENTRANCE' 
  | 'CHAMBER' 
  | 'ARENA' 
  | 'TREASURY' 
  | 'SHRINE_ROOM' 
  | 'CORRIDOR_HUB' 
  | 'BOSS_SANCTUM';

export interface DungeonRoom {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  type: RoomType;
  connectedTo: number[];
  cleared: boolean;
  themeAccent: string;
  name: string;
}

export interface InteractiveProp {
  id: string;
  type: 'chest' | 'shrine' | 'terminal' | 'breakable' | 'altar' | 'portal';
  subType?: 'normal_chest' | 'ornate_chest' | 'ancestral_vault' | 'shrine_crit' | 'shrine_speed' | 'shrine_armor' | 'shrine_healing' | 'urn' | 'crate' | 'server_cache';
  worldX: number;
  worldY: number;
  radius: number;
  opened: boolean;
  health?: number;
  maxHealth?: number;
  label: string;
  icon: string;
  color: string;
  rarity?: ItemRarity;
  buffEffect?: {
    type: 'crit' | 'speed' | 'armor' | 'healing';
    duration: number; // frames
    value: number;
  };
}

export interface ProceduralStageConfig {
  stageKey: 'catacombs' | 'docks' | 'megastructure' | 'citadel';
  displayName: string;
  algorithm: 'organic_crypts' | 'modular_piers' | 'bsp_skyways' | 'cathedral_sanctum';
  gridCols: number;
  gridRows: number;
  tileSize: number;
  minRooms: number;
  maxRooms: number;
  roomMinSize: number;
  roomMaxSize: number;
  wallColor: string;
  floorColor: string;
  accentColor: string;
  ambientLight: string;
  fogColor: string;
  densityFactor: number;
  chestCountRange: [number, number];
  shrineCountRange: [number, number];
  breakableDensity: number;
  hazardDensity: number;
  enemyClasses: CyberSoldierClass[];
  enemyThemes: string[];
}

export interface GeneratedLevel {
  seed: number;
  stageKey: string;
  width: number; // In pixels
  height: number;
  cols: number;
  rows: number;
  tileSize: number;
  tiles: Uint8Array;
  rooms: DungeonRoom[];
  spawnPoint: { x: number; y: number };
  exitPoint: { x: number; y: number };
  bossSanctum: DungeonRoom;
  props: InteractiveProp[];
  enemies: CombatEntity[];
  exploredTiles: Uint8Array;
  config: ProceduralStageConfig;
}

// ═══════════════════════════════════════════════════════════════════
// 1. DETERMINISTIC PSEUDO-RANDOM NUMBER GENERATOR (Mulberry32)
// ═══════════════════════════════════════════════════════════════════
export class SeededPRNG {
  private state: number;

  constructor(seed: number | string = Date.now()) {
    if (typeof seed === 'string') {
      let hash = 1779033703 ^ seed.length;
      for (let i = 0; i < seed.length; i++) {
        hash = Math.imul(hash ^ seed.charCodeAt(i), 3432918353);
        hash = (hash << 13) | (hash >>> 19);
      }
      this.state = hash >>> 0;
    } else {
      this.state = (seed | 0) >>> 0;
    }
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  public rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  public pick<T>(array: T[]): T {
    return array[this.rangeInt(0, array.length - 1)];
  }

  public chance(probability: number): boolean {
    return this.next() < probability;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2. PROCEDURAL STAGE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════
export const PROCEDURAL_CONFIGS: Record<number, ProceduralStageConfig> = {
  // 1: CATACOMBS (Subterranean Crypts & Montreal RÉSO)
  1: {
    stageKey: 'catacombs',
    displayName: 'Les Catacombes // RÉSO Souterrain & Cryptes Obscures',
    algorithm: 'organic_crypts',
    gridCols: 75,
    gridRows: 75,
    tileSize: 36,
    minRooms: 10,
    maxRooms: 16,
    roomMinSize: 6,
    roomMaxSize: 12,
    wallColor: '#1e1c24',
    floorColor: '#0a090e',
    accentColor: '#00f3ff',
    ambientLight: 'rgba(0, 243, 255, 0.06)',
    fogColor: '#06060c',
    densityFactor: 1.15,
    chestCountRange: [6, 10],
    shrineCountRange: [2, 4],
    breakableDensity: 0.08,
    hazardDensity: 0.04,
    enemyClasses: ['assault_trooper', 'stealth_ninja', 'heavy_exo'],
    enemyThemes: ['Goule Cyber-Squelette', 'Cultiste du RÉSO', 'Stalker d’Ombre', 'Spectre Cryo']
  },

  // 2: DOCKS (Silicon Coast & Industrial Shipping Container Harbors)
  2: {
    stageKey: 'docks',
    displayName: 'Les Docks // Port Industriel & Silicon Coast',
    algorithm: 'modular_piers',
    gridCols: 80,
    gridRows: 80,
    tileSize: 36,
    minRooms: 9,
    maxRooms: 14,
    roomMinSize: 8,
    roomMaxSize: 16,
    wallColor: '#17202a',
    floorColor: '#0c131a',
    accentColor: '#39ff14',
    ambientLight: 'rgba(57, 255, 20, 0.06)',
    fogColor: '#07100b',
    densityFactor: 1.0,
    chestCountRange: [7, 12],
    shrineCountRange: [3, 5],
    breakableDensity: 0.06,
    hazardDensity: 0.08,
    enemyClasses: ['assault_trooper', 'cyber_sniper', 'heavy_exo'],
    enemyThemes: ['Enforceur des Docks', 'Drone Cargo Armé', 'Sniper Conteneur', 'Mech Anti-Émeute']
  },

  // 3: MEGASTRUCTURE (Brutalist Cyber Hive & Quantum Server Cores)
  3: {
    stageKey: 'megastructure',
    displayName: 'La Mégastructure // Hive Cybernétique & Cortex Central',
    algorithm: 'bsp_skyways',
    gridCols: 85,
    gridRows: 85,
    tileSize: 36,
    minRooms: 12,
    maxRooms: 18,
    roomMinSize: 7,
    roomMaxSize: 14,
    wallColor: '#251528',
    floorColor: '#110a14',
    accentColor: '#ff007f',
    ambientLight: 'rgba(255, 0, 127, 0.07)',
    fogColor: '#100512',
    densityFactor: 1.25,
    chestCountRange: [8, 14],
    shrineCountRange: [3, 5],
    breakableDensity: 0.07,
    hazardDensity: 0.05,
    enemyClasses: ['stealth_ninja', 'cyber_sniper', 'assault_trooper', 'heavy_exo'],
    enemyThemes: ['Subroutine Corrompue', 'Infiltrateur Holographique', 'Tourelle Laser EMP', 'Nano-Exécuteur']
  },

  // 4: CITADEL (Gothic Cathedral Bastion & Dark Throne Sanctum)
  4: {
    stageKey: 'citadel',
    displayName: 'La Citadelle // Bastion Obscur & Sanctum du Trône',
    algorithm: 'cathedral_sanctum',
    gridCols: 90,
    gridRows: 90,
    tileSize: 36,
    minRooms: 11,
    maxRooms: 17,
    roomMinSize: 8,
    roomMaxSize: 18,
    wallColor: '#281c10',
    floorColor: '#120b04',
    accentColor: '#ffaa00',
    ambientLight: 'rgba(255, 170, 0, 0.08)',
    fogColor: '#140c03',
    densityFactor: 1.4,
    chestCountRange: [9, 15],
    shrineCountRange: [4, 6],
    breakableDensity: 0.09,
    hazardDensity: 0.06,
    enemyClasses: ['heavy_exo', 'stealth_ninja', 'cyber_sniper', 'assault_trooper'],
    enemyThemes: ['Templier Abyssal', 'Archon de Sang', 'Dreadnought Primordial', 'Garde Prétorienne']
  }
};

// ═══════════════════════════════════════════════════════════════════
// 3. CORE PROCEDURAL LEVEL GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════════
export class ProceduralLevelGenerator {
  private prng: SeededPRNG;
  private config: ProceduralStageConfig;
  private seed: number;
  private cols: number;
  private rows: number;
  private tileSize: number;
  private tiles: Uint8Array;
  private rooms: DungeonRoom[] = [];
  private props: InteractiveProp[] = [];
  private enemies: CombatEntity[] = [];

  constructor(stageId: number = 1, customSeed?: number | string) {
    this.seed = typeof customSeed === 'number' ? customSeed : customSeed ? new SeededPRNG(customSeed).rangeInt(100000, 999999) : Math.floor(Math.random() * 1000000);
    this.prng = new SeededPRNG(this.seed);
    this.config = PROCEDURAL_CONFIGS[stageId] || PROCEDURAL_CONFIGS[1];
    this.cols = this.config.gridCols;
    this.rows = this.config.gridRows;
    this.tileSize = this.config.tileSize;
    this.tiles = new Uint8Array(this.cols * this.rows);
  }

  /**
   * Main Pipeline : Generate Level (Grid, Topology, Props, Enemies, Shrines)
   */
  public generate(difficultyTier: number = 1, stageInfo?: StageInfo): GeneratedLevel {
    // 1. Reset grids
    this.tiles.fill(TileType.WALL);
    this.rooms = [];
    this.props = [];
    this.enemies = [];

    // 2. Algorithm Dispatch based on Stage Architecture
    switch (this.config.algorithm) {
      case 'organic_crypts':
        this.generateCatacombs();
        break;
      case 'modular_piers':
        this.generateDocks();
        break;
      case 'bsp_skyways':
        this.generateMegastructure();
        break;
      case 'cathedral_sanctum':
      default:
        this.generateCitadel();
        break;
    }

    // 3. Connect Graph & Carve Hallways
    this.connectRooms();

    // 4. Surround Floors with Thick Walls and Pillars
    this.refineWallBoundaries();

    // 5. Assign Room Specializations (Entrance, Boss, Treasuries, Arenas)
    this.classifyRooms();

    // 6. Spawn Interactive Props & Loot Nodes (Chests, Shrines, Terminals, Breakables)
    this.spawnInteractiveProps(difficultyTier);

    // 7. Procedural Enemy Placement with Pacing & Threat Budgeting
    this.spawnProceduralEnemies(difficultyTier, stageInfo);

    // 8. Identify Spawn & Exit coordinates
    const entranceRoom = this.rooms.find(r => r.type === 'ENTRANCE') || this.rooms[0];
    const bossRoom = this.rooms.find(r => r.type === 'BOSS_SANCTUM') || this.rooms[this.rooms.length - 1];

    const spawnPoint = {
      x: entranceRoom.centerX * this.tileSize,
      y: entranceRoom.centerY * this.tileSize
    };

    const exitPoint = {
      x: bossRoom.centerX * this.tileSize,
      y: bossRoom.centerY * this.tileSize
    };

    // Place Exit Portal Prop in Boss Room
    this.props.push({
      id: 'exit_portal_' + this.seed,
      type: 'portal',
      worldX: exitPoint.x,
      worldY: exitPoint.y,
      radius: 32,
      opened: false,
      label: '🌀 PORTAIL DIMENSIONNEL // EXTRACTION',
      icon: 'DoorOpen',
      color: this.config.accentColor
    });

    const exploredTiles = new Uint8Array(this.cols * this.rows);

    return {
      seed: this.seed,
      stageKey: this.config.stageKey,
      width: this.cols * this.tileSize,
      height: this.rows * this.tileSize,
      cols: this.cols,
      rows: this.rows,
      tileSize: this.tileSize,
      tiles: this.tiles,
      rooms: this.rooms,
      spawnPoint,
      exitPoint,
      bossSanctum: bossRoom,
      props: this.props,
      enemies: this.enemies,
      exploredTiles,
      config: this.config
    };
  }

  // ── 1. CATACOMBS GENERATOR : Dense organic crypts & arched vaults ──
  private generateCatacombs(): void {
    const roomCount = this.prng.rangeInt(this.config.minRooms, this.config.maxRooms);
    let attempts = 0;

    while (this.rooms.length < roomCount && attempts < 150) {
      attempts++;
      const w = this.prng.rangeInt(this.config.roomMinSize, this.config.roomMaxSize);
      const h = this.prng.rangeInt(this.config.roomMinSize, this.config.roomMaxSize);
      const x = this.prng.rangeInt(3, this.cols - w - 4);
      const y = this.prng.rangeInt(3, this.rows - h - 4);

      if (!this.checkRoomOverlap(x, y, w, h, 2)) {
        this.carveRoom(x, y, w, h, 'CHAMBER');
      }
    }

    // Add subterranean water canals and crypt alcoves
    this.addWaterCanals();
  }

  // ── 2. DOCKS GENERATOR : Modular piers, container blocks & water channels ──
  private generateDocks(): void {
    const pierCount = this.prng.rangeInt(this.config.minRooms, this.config.maxRooms);
    let attempts = 0;

    // Create main Central Pier Corridor
    const midY = Math.floor(this.rows / 2);
    this.carveRect(6, midY - 3, this.cols - 12, 6, TileType.FLOOR);

    while (this.rooms.length < pierCount && attempts < 150) {
      attempts++;
      const w = this.prng.rangeInt(this.config.roomMinSize + 2, this.config.roomMaxSize + 4);
      const h = this.prng.rangeInt(this.config.roomMinSize, this.config.roomMaxSize);
      const x = this.prng.rangeInt(4, this.cols - w - 5);
      const y = this.prng.rangeInt(4, this.rows - h - 5);

      if (!this.checkRoomOverlap(x, y, w, h, 2)) {
        this.carveRoom(x, y, w, h, 'CHAMBER');
      }
    }

    // Add water channels between piers
    this.addDockWaterChannels();
  }

  // ── 3. MEGASTRUCTURE GENERATOR : BSP recursive slicing & high-tech skyways ──
  private generateMegastructure(): void {
    const root = { x: 3, y: 3, w: this.cols - 6, h: this.rows - 6 };
    const leaves: Array<{ x: number; y: number; w: number; h: number }> = [];

    const split = (node: { x: number; y: number; w: number; h: number }, depth: number) => {
      if (depth >= 4 || (node.w < 18 && node.h < 18)) {
        leaves.push(node);
        return;
      }

      const splitHorizontally = node.w < node.h ? true : node.h < node.w ? false : this.prng.chance(0.5);
      if (splitHorizontally) {
        const splitY = this.prng.rangeInt(Math.floor(node.h * 0.35), Math.floor(node.h * 0.65));
        split({ x: node.x, y: node.y, w: node.w, h: splitY }, depth + 1);
        split({ x: node.x, y: node.y + splitY, w: node.w, h: node.h - splitY }, depth + 1);
      } else {
        const splitX = this.prng.rangeInt(Math.floor(node.w * 0.35), Math.floor(node.w * 0.65));
        split({ x: node.x, y: node.y, w: splitX, h: node.h }, depth + 1);
        split({ x: node.x + splitX, y: node.y, w: node.w - splitX, h: node.h }, depth + 1);
      }
    };

    split(root, 0);

    for (const leaf of leaves) {
      const rw = Math.max(6, leaf.w - this.prng.rangeInt(2, 4));
      const rh = Math.max(6, leaf.h - this.prng.rangeInt(2, 4));
      const rx = leaf.x + Math.floor((leaf.w - rw) / 2);
      const ry = leaf.y + Math.floor((leaf.h - rh) / 2);

      this.carveRoom(rx, ry, rw, rh, 'CHAMBER');
    }
  }

  // ── 4. CITADEL GENERATOR : Symmetrical Cathedral, Axial Nave & Throne Sanctum ──
  private generateCitadel(): void {
    const midX = Math.floor(this.cols / 2);
    
    // Grand Central Nave (Axis)
    const naveWidth = 10;
    const naveHeight = this.rows - 16;
    this.carveRoom(midX - Math.floor(naveWidth / 2), 8, naveWidth, naveHeight, 'CORRIDOR_HUB');

    // Grand Entrance Narthex
    this.carveRoom(midX - 7, this.rows - 16, 14, 10, 'ENTRANCE');

    // Royal Throne Sanctum
    this.carveRoom(midX - 10, 6, 20, 14, 'BOSS_SANCTUM');

    // Symmetrical Side Chapels & Reliquary Wings
    const sideChambers = this.prng.rangeInt(4, 7);
    for (let i = 0; i < sideChambers; i++) {
      const cy = 22 + i * 10;
      if (cy < this.rows - 20) {
        const cw = this.prng.rangeInt(7, 11);
        const ch = this.prng.rangeInt(6, 9);
        // Left Wing
        this.carveRoom(midX - 18 - cw, cy, cw, ch, 'CHAMBER');
        // Right Wing (Symmetrical)
        this.carveRoom(midX + 18, cy, cw, ch, 'CHAMBER');
      }
    }
  }

  // ── Helper : Carve Room and Register ──
  private carveRoom(x: number, y: number, w: number, h: number, type: RoomType): DungeonRoom {
    this.carveRect(x, y, w, h, TileType.FLOOR);

    // Optional interior pillars for cathedral / crypt feeling
    if (w >= 10 && h >= 10 && type !== 'ENTRANCE') {
      const px1 = x + 3;
      const px2 = x + w - 4;
      const py1 = y + 3;
      const py2 = y + h - 4;
      this.setTile(px1, py1, TileType.PILLAR);
      this.setTile(px2, py1, TileType.PILLAR);
      this.setTile(px1, py2, TileType.PILLAR);
      this.setTile(px2, py2, TileType.PILLAR);
    }

    const room: DungeonRoom = {
      id: this.rooms.length + 1,
      x,
      y,
      width: w,
      height: h,
      centerX: Math.floor(x + w / 2),
      centerY: Math.floor(y + h / 2),
      type,
      connectedTo: [],
      cleared: false,
      themeAccent: this.config.accentColor,
      name: `Secteur 0${this.rooms.length + 1}`
    };

    this.rooms.push(room);
    return room;
  }

  private carveRect(x: number, y: number, w: number, h: number, tileType: TileType): void {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.setTile(x + dx, y + dy, tileType);
      }
    }
  }

  private setTile(x: number, y: number, tileType: TileType): void {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      this.tiles[y * this.cols + x] = tileType;
    }
  }

  private getTile(x: number, y: number): TileType {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return TileType.WALL;
    return this.tiles[y * this.cols + x] as TileType;
  }

  private checkRoomOverlap(x: number, y: number, w: number, h: number, padding: number = 1): boolean {
    for (const r of this.rooms) {
      if (
        x - padding < r.x + r.width &&
        x + w + padding > r.x &&
        y - padding < r.y + r.height &&
        y + h + padding > r.y
      ) {
        return true;
      }
    }
    return false;
  }

  // ── Delaunay / Minimum Spanning Tree Room Connectivity ──
  private connectRooms(): void {
    if (this.rooms.length < 2) return;

    for (let i = 0; i < this.rooms.length - 1; i++) {
      const rA = this.rooms[i];
      // Find closest neighbor
      let bestDist = Infinity;
      let closestIdx = i + 1;

      for (let j = i + 1; j < this.rooms.length; j++) {
        const rB = this.rooms[j];
        const dist = Math.hypot(rA.centerX - rB.centerX, rA.centerY - rB.centerY);
        if (dist < bestDist) {
          bestDist = dist;
          closestIdx = j;
        }
      }

      const rTarget = this.rooms[closestIdx];
      this.carveCorridor(rA.centerX, rA.centerY, rTarget.centerX, rTarget.centerY);
      rA.connectedTo.push(rTarget.id);
      rTarget.connectedTo.push(rA.id);
    }

    // Connect remaining stranded rooms or add loop paths for high replayability
    if (this.rooms.length >= 5) {
      const extraA = this.rooms[0];
      const extraB = this.rooms[Math.floor(this.rooms.length / 2)];
      this.carveCorridor(extraA.centerX, extraA.centerY, extraB.centerX, extraB.centerY);
    }
  }

  private carveCorridor(x1: number, y1: number, x2: number, y2: number): void {
    let cx = x1;
    let cy = y1;
    const corridorWidth = this.config.stageKey === 'catacombs' ? 2 : 3;

    // Horizontal then vertical or vice versa
    const horizontalFirst = this.prng.chance(0.5);

    if (horizontalFirst) {
      while (cx !== x2) {
        for (let w = 0; w < corridorWidth; w++) {
          if (this.getTile(cx, cy + w) === TileType.WALL) {
            this.setTile(cx, cy + w, TileType.CORRIDOR);
          }
        }
        cx += cx < x2 ? 1 : -1;
      }
      while (cy !== y2) {
        for (let w = 0; w < corridorWidth; w++) {
          if (this.getTile(cx + w, cy) === TileType.WALL) {
            this.setTile(cx + w, cy, TileType.CORRIDOR);
          }
        }
        cy += cy < y2 ? 1 : -1;
      }
    } else {
      while (cy !== y2) {
        for (let w = 0; w < corridorWidth; w++) {
          if (this.getTile(cx + w, cy) === TileType.WALL) {
            this.setTile(cx + w, cy, TileType.CORRIDOR);
          }
        }
        cy += cy < y2 ? 1 : -1;
      }
      while (cx !== x2) {
        for (let w = 0; w < corridorWidth; w++) {
          if (this.getTile(cx, cy + w) === TileType.WALL) {
            this.setTile(cx, cy + w, TileType.CORRIDOR);
          }
        }
        cx += cx < x2 ? 1 : -1;
      }
    }
  }

  private addWaterCanals(): void {
    for (let i = 0; i < 4; i++) {
      const y = this.prng.rangeInt(10, this.rows - 10);
      for (let x = 6; x < this.cols - 6; x++) {
        if (this.getTile(x, y) === TileType.FLOOR && this.prng.chance(0.6)) {
          this.setTile(x, y, TileType.WATER_HAZARD);
        }
      }
    }
  }

  private addDockWaterChannels(): void {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.getTile(x, y) === TileType.WALL && this.prng.chance(0.25)) {
          this.setTile(x, y, TileType.WATER_HAZARD);
        }
      }
    }
  }

  private refineWallBoundaries(): void {
    // Fill perimeter
    for (let x = 0; x < this.cols; x++) {
      this.setTile(x, 0, TileType.WALL);
      this.setTile(x, this.rows - 1, TileType.WALL);
    }
    for (let y = 0; y < this.rows; y++) {
      this.setTile(0, y, TileType.WALL);
      this.setTile(this.cols - 1, y, TileType.WALL);
    }
  }

  // ── Classify Room Types ──
  private classifyRooms(): void {
    if (this.rooms.length === 0) return;

    // Room 0 is always Entrance if not already assigned
    const entrance = this.rooms[0];
    entrance.type = 'ENTRANCE';
    entrance.name = '🛡️ Zone d’Insertion Sécurisée';

    // Farthest room from entrance is Boss Sanctum
    let maxDist = -1;
    let bossIdx = this.rooms.length - 1;

    for (let i = 1; i < this.rooms.length; i++) {
      const r = this.rooms[i];
      const dist = Math.hypot(r.centerX - entrance.centerX, r.centerY - entrance.centerY);
      if (dist > maxDist) {
        maxDist = dist;
        bossIdx = i;
      }
    }

    const bossRoom = this.rooms[bossIdx];
    bossRoom.type = 'BOSS_SANCTUM';
    bossRoom.name = '👑 Sanctum du Tyran // Trône d’Exécution';

    // Other rooms get categorized
    for (let i = 1; i < this.rooms.length; i++) {
      if (i === bossIdx) continue;
      const r = this.rooms[i];
      const roll = this.prng.next();

      if (roll < 0.22) {
        r.type = 'TREASURY';
        r.name = '💎 Crypte aux Reliques & Coffres Ancestraux';
      } else if (roll < 0.44) {
        r.type = 'ARENA';
        r.name = '⚔️ Arène de Confrontation // Guet-apens Élite';
      } else if (roll < 0.65) {
        r.type = 'SHRINE_ROOM';
        r.name = '⚡ Pylône d’Éveil & Shrines Psioniques';
      } else {
        r.type = 'CHAMBER';
        r.name = `Bastion ${this.config.stageKey.toUpperCase()}-${r.id}`;
      }
    }
  }

  // ── Spawn Interactive Props (Chests, Shrines, Breakables) ──
  private spawnInteractiveProps(difficultyTier: number): void {
    const chestCount = this.prng.rangeInt(this.config.chestCountRange[0], this.config.chestCountRange[1]);
    const shrineCount = this.prng.rangeInt(this.config.shrineCountRange[0], this.config.shrineCountRange[1]);

    // 1. Shrines
    const shrineTypes: Array<{
      subType: 'shrine_crit' | 'shrine_speed' | 'shrine_armor' | 'shrine_healing';
      label: string;
      icon: string;
      color: string;
      effect: { type: 'crit' | 'speed' | 'armor' | 'healing'; duration: number; value: number };
    }> = [
      {
        subType: 'shrine_crit',
        label: '⚡ Sanctuaire Synaptique (+50% Crit / 30s)',
        icon: 'Zap',
        color: '#ff007f',
        effect: { type: 'crit', duration: 1800, value: 50 }
      },
      {
        subType: 'shrine_speed',
        label: '🚀 Sanctuaire d’Overclock (+40% Vitesse / 30s)',
        icon: 'Flame',
        color: '#00f3ff',
        effect: { type: 'speed', duration: 1800, value: 40 }
      },
      {
        subType: 'shrine_armor',
        label: '🛡️ Sanctuaire de Blindage Bio-Kevlar (+60% Armure / 30s)',
        icon: 'Shield',
        color: '#39ff14',
        effect: { type: 'armor', duration: 1800, value: 60 }
      },
      {
        subType: 'shrine_healing',
        label: '❤️ Fontaine de Régénération Nanite (5% PV/sec / 20s)',
        icon: 'Heart',
        color: '#ffaa00',
        effect: { type: 'healing', duration: 1200, value: 5 }
      }
    ];

    for (let i = 0; i < shrineCount; i++) {
      const room = this.prng.pick(this.rooms.filter(r => r.type !== 'ENTRANCE'));
      if (!room) continue;

      const shrineData = this.prng.pick(shrineTypes);
      const wx = (room.centerX + this.prng.rangeInt(-2, 2)) * this.tileSize;
      const wy = (room.centerY + this.prng.rangeInt(-2, 2)) * this.tileSize;

      this.props.push({
        id: `shrine_${i}_${this.seed}`,
        type: 'shrine',
        subType: shrineData.subType,
        worldX: wx,
        worldY: wy,
        radius: 22,
        opened: false,
        label: shrineData.label,
        icon: shrineData.icon,
        color: shrineData.color,
        buffEffect: shrineData.effect
      });
    }

    // 2. Chests (Normal, Ornate, Ancestral)
    for (let i = 0; i < chestCount; i++) {
      const room = this.prng.pick(this.rooms.filter(r => r.type !== 'ENTRANCE'));
      if (!room) continue;

      const isTreasury = room.type === 'TREASURY';
      const rarityRoll = this.prng.next() + (isTreasury ? 0.35 : 0) + (difficultyTier * 0.05);

      let rarity: ItemRarity = 'standard';
      let label = '📦 Coffre de Ravitaillement';
      let color = '#a0aec0';
      let subType: 'normal_chest' | 'ornate_chest' | 'ancestral_vault' = 'normal_chest';

      if (rarityRoll > 1.1) {
        rarity = 'legendary';
        label = '👑 Reliquaire Ancestral // Trésor Béni';
        color = '#ffaa00';
        subType = 'ancestral_vault';
      } else if (rarityRoll > 0.75) {
        rarity = 'epic';
        label = '🔥 Coffre Orné de Haute Sécurité';
        color = '#b026ff';
        subType = 'ornate_chest';
      } else if (rarityRoll > 0.45) {
        rarity = 'rare';
        label = '⚡ Cache Militaire Cryptée';
        color = '#00f3ff';
        subType = 'ornate_chest';
      }

      const rx = this.prng.rangeInt(room.x + 2, room.x + room.width - 3);
      const ry = this.prng.rangeInt(room.y + 2, room.y + room.height - 3);

      this.props.push({
        id: `chest_${i}_${this.seed}`,
        type: 'chest',
        subType,
        worldX: rx * this.tileSize,
        worldY: ry * this.tileSize,
        radius: 20,
        opened: false,
        label,
        icon: 'Archive',
        color,
        rarity
      });
    }

    // 3. Breakables (Urns, Crates, Server Caches)
    for (const room of this.rooms) {
      const propCount = Math.floor(room.width * room.height * this.config.breakableDensity);
      for (let k = 0; k < propCount; k++) {
        const bx = this.prng.rangeInt(room.x + 1, room.x + room.width - 2);
        const by = this.prng.rangeInt(room.y + 1, room.y + room.height - 2);

        if (this.getTile(bx, by) === TileType.FLOOR) {
          const propName = this.config.stageKey === 'catacombs' ? 'Urne Funéraire' 
            : this.config.stageKey === 'docks' ? 'Caisse de Fret' 
            : this.config.stageKey === 'megastructure' ? 'Rack Serveur Overclock' 
            : 'Vase d’Obsidienne Sacré';

          this.props.push({
            id: `break_${room.id}_${k}_${this.seed}`,
            type: 'breakable',
            subType: this.config.stageKey === 'catacombs' ? 'urn' : 'crate',
            worldX: bx * this.tileSize + this.tileSize / 2,
            worldY: by * this.tileSize + this.tileSize / 2,
            radius: 12,
            opened: false,
            health: 20,
            maxHealth: 20,
            label: propName,
            icon: 'Package',
            color: '#718096'
          });
        }
      }
    }
  }

  // ── 7. Procedural Enemy Placement with Mathematical Pacing & Threat Budgeting ──
  private spawnProceduralEnemies(difficultyTier: number, stageInfo?: StageInfo): void {
    const tierMult = 1 + (difficultyTier - 1) * 0.22;

    for (const room of this.rooms) {
      if (room.type === 'ENTRANCE') continue; // Safe zone

      // Threat Budget Formula: Area * StageDensity * RoomMultiplier * TierMultiplier
      let roomMult = 1.0;
      if (room.type === 'ARENA') roomMult = 2.4;
      if (room.type === 'TREASURY') roomMult = 1.6;
      if (room.type === 'SHRINE_ROOM') roomMult = 1.2;

      const area = room.width * room.height;
      const packCount = Math.max(1, Math.floor((area / 40) * this.config.densityFactor * roomMult));

      // Handle Boss Sanctum
      if (room.type === 'BOSS_SANCTUM' && stageInfo) {
        const bossHp = 2400 * stageInfo.bossHpMultiplier * tierMult;
        const boss: CombatEntity = {
          id: `boss_${room.id}_${this.seed}`,
          type: 'boss',
          name: stageInfo.bossName,
          x: room.centerX * this.tileSize,
          y: room.centerY * this.tileSize,
          radius: 38,
          hp: bossHp,
          maxHp: bossHp,
          shieldHp: bossHp * 0.35,
          maxShieldHp: bossHp * 0.35,
          speed: 2.3,
          color: this.config.accentColor,
          isBoss: true,
          bossPhase: 1,
          attackCooldown: 0,
          attackRange: 320,
          damage: 42 * tierMult,
          xpReward: 1600 * stageInfo.id * tierMult,
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
        this.enemies.push(boss);

        // Add 2 Royal Guards
        for (let g = 0; g < 2; g++) {
          const gx = (room.centerX + (g === 0 ? -4 : 4)) * this.tileSize;
          const gy = room.centerY * this.tileSize;
          const eliteAffixes = rollEliteAffixes('champion', difficultyTier);
          this.enemies.push({
            id: `boss_guard_${g}_${this.seed}`,
            type: 'enemy',
            name: `🛡️ Garde Noir du Tyran`,
            x: gx,
            y: gy,
            radius: 20,
            hp: 280 * tierMult,
            maxHp: 280 * tierMult,
            speed: 2.1,
            color: '#f59e0b',
            attackCooldown: 25,
            attackRange: 60,
            damage: 26 * tierMult,
            xpReward: 90 * tierMult,
            behavior: 'melee',
            spriteType: 'heavy_exo',
            soldierClass: 'heavy_exo',
            isElite: true,
            eliteTier: 'champion',
            eliteAffixes,
            statusEffects: [],
            resistances: getDefaultResistances('heavy_exo')
          });
        }
        continue;
      }

      // Standard / Arena / Treasury Packs
      for (let p = 0; p < packCount; p++) {
        const ex = this.prng.rangeInt(room.x + 2, room.x + room.width - 3) * this.tileSize;
        const ey = this.prng.rangeInt(room.y + 2, room.y + room.height - 3) * this.tileSize;

        const chosenClass = this.prng.pick(this.config.enemyClasses);
        const themeName = this.prng.pick(this.config.enemyThemes);

        // Elite roll : 8% Elite, 16% Champion (Boosted in Treasury/Arena)
        const eliteBonus = room.type === 'ARENA' ? 0.25 : room.type === 'TREASURY' ? 0.15 : 0;
        const roll = this.prng.next();
        const isElite = (roll < 0.08 + eliteBonus);
        const isChampion = !isElite && (roll < 0.24 + eliteBonus);
        const eliteTier = isElite ? 'elite' : isChampion ? 'champion' : undefined;
        const eliteAffixes = eliteTier ? rollEliteAffixes(eliteTier, difficultyTier) : undefined;

        const hpMult = (isElite ? 3.4 : isChampion ? 2.1 : 1.0) * tierMult;
        const dmgMult = (isElite ? 1.5 : isChampion ? 1.25 : 1.0) * tierMult;
        const xpMult = (isElite ? 3.0 : isChampion ? 2.0 : 1.0) * tierMult;

        const baseHp = (70 + this.prng.range(0, 35)) * hpMult;
        const baseDmg = (16 + this.prng.range(0, 8)) * dmgMult;

        const enemyPrefix = isElite ? '🔥 Élite ' : isChampion ? '⚡ Champion ' : '';

        this.enemies.push({
          id: `enemy_${room.id}_${p}_${this.seed}`,
          type: 'enemy',
          name: `${enemyPrefix}${themeName}`,
          x: ex,
          y: ey,
          radius: isElite ? 22 : isChampion ? 19 : 16,
          hp: baseHp,
          maxHp: baseHp,
          speed: chosenClass === 'stealth_ninja' ? 3.6 : chosenClass === 'heavy_exo' ? 2.0 : 2.7,
          color: isElite ? '#f59e0b' : isChampion ? '#38bdf8' : this.config.accentColor,
          attackCooldown: 25,
          attackRange: chosenClass === 'cyber_sniper' ? 380 : chosenClass === 'assault_trooper' ? 240 : 45,
          damage: baseDmg,
          xpReward: Math.round(50 * xpMult),
          behavior: chosenClass === 'cyber_sniper' || chosenClass === 'assault_trooper' ? 'ranged' : 'melee',
          spriteType: chosenClass,
          soldierClass: chosenClass,
          isElite: !!eliteTier,
          eliteTier,
          eliteAffixes,
          statusEffects: [],
          resistances: getDefaultResistances(chosenClass)
        });
      }
    }
  }

  /**
   * Fast O(1) Collision Check on Tile Grid
   */
  public isBlocked(worldX: number, worldY: number, radius: number = 16): boolean {
    const minGX = Math.floor((worldX - radius) / this.tileSize);
    const maxGX = Math.floor((worldX + radius) / this.tileSize);
    const minGY = Math.floor((worldY - radius) / this.tileSize);
    const maxGY = Math.floor((worldY + radius) / this.tileSize);

    for (let gy = minGY; gy <= maxGY; gy++) {
      for (let gx = minGX; gx <= maxGX; gx++) {
        if (gx < 0 || gx >= this.cols || gy < 0 || gy >= this.rows) return true;
        const t = this.tiles[gy * this.cols + gx];
        if (t === TileType.WALL || t === TileType.PILLAR || t === TileType.PIT_CHASM) {
          return true;
        }
      }
    }
    return false;
  }
}
