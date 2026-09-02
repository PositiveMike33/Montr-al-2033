// ═══════════════════════════════════════════════════════════════════════════════
// PROCEDURAL LEVEL GENERATION ENGINE (ARPG SANCTUAIRE / MONTRÉAL 2033)
// 4 Distinct Stage Archetypes: Catacombs, Docks, Megastructure, Citadel
// Binary Space Partitioning (BSP), Cellular Automata, Graph Walkers,
// Deterministic Seedable PRNG (Mulberry32), Enemy Pack Formations & Loot Placement
// ═══════════════════════════════════════════════════════════════════════════════

import { 
  CombatEntity, 
  LootDrop, 
  StageInfo, 
  EquipmentItem,
  CyberSoldierClass,
  EliteTier,
  EliteAffixType
} from '../types';
import { rollEliteAffixes, getDefaultResistances } from './eliteAffixes';
import { generateLootItem } from './lootGenerator';

export enum TileType {
  FLOOR          = 0, // Walkable ground (themed texture per stage)
  WALL           = 1, // Impassable collision wall
  HAZARD         = 2, // Environmental trap / hazard (DoT, slow, elemental)
  CHEST          = 3, // Interactive loot container
  SHRINE         = 4, // Ancient / Tech shrine buff
  LORE_TERMINAL  = 5, // Lore audio-log / Codex terminal
  DOOR_CHOKE     = 6, // Defensive chokepoint / archway
  BOSS_GATE      = 7, // Entrance to Boss Sanctum
  EXFIL_PORTAL   = 8, // Extraction portal
}

export type StageArchetype = 'catacombs' | 'docks' | 'megastructure' | 'citadel';

export interface ShrineData {
  id: string;
  x: number;
  y: number;
  type: 'channeling' | 'conduit' | 'frenzy' | 'protection' | 'greed' | 'blood_altar';
  name: string;
  buffDescription: string;
  activated: boolean;
  durationSeconds: number;
}

export interface ChestData {
  id: string;
  x: number;
  y: number;
  type: 'standard' | 'sarcophagus' | 'contraband' | 'overclocked' | 'royal_reliquary';
  name: string;
  opened: boolean;
  guaranteedRarity: 'standard' | 'rare' | 'epic' | 'legendary';
  nanitesMin: number;
  nanitesMax: number;
  isCursed?: boolean;
  cursedPackSpawned?: boolean;
}

export interface DungeonRoom {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  centerX: number;
  centerY: number;
  type: 'spawn' | 'standard' | 'corridor' | 'alcove' | 'shrine_chamber' | 'treasure_vault' | 'boss_arena';
  connectedTo: number[];
  explored: boolean;
}

export interface ProceduralHazard {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'necrotic_slime' | 'deep_water_current' | 'laser_conduit' | 'void_blood_fire';
  damagePerSec: number;
  slowMultiplier: number;
  color: string;
}

export interface ProceduralLevel {
  seed: number;
  stageId: number;
  archetype: StageArchetype;
  stageName: string;
  gridWidth: number;
  gridHeight: number;
  tileSize: number;
  tiles: Uint8Array; // 1D array of TileType
  fogOfWar: Uint8Array; // 0 = unexplored, 1 = explored/visible
  rooms: DungeonRoom[];
  spawnPoint: { x: number; y: number };
  bossGatePoint: { x: number; y: number };
  exfilPoint: { x: number; y: number };
  chests: ChestData[];
  shrines: ShrineData[];
  hazards: ProceduralHazard[];
  initialEnemies: CombatEntity[];
  stats: {
    totalRooms: number;
    totalChests: number;
    totalShrines: number;
    totalEnemyPacks: number;
    totalElites: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC SEEDABLE PRNG (Mulberry32)
// ─────────────────────────────────────────────────────────────────────────────
export class Mulberry32PRNG {
  private s: number;

  constructor(seed: number = Date.now()) {
    this.s = seed >>> 0;
    if (this.s === 0) this.s = 1;
  }

  public next(): number {
    let t = (this.s += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public randInt(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min + 1));
  }

  public randFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  public chance(probability: number): boolean {
    return this.next() < probability;
  }

  public pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  public shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCHETYPE THEME SPECIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const STAGE_ARCHETYPES: Record<number, {
  archetype: StageArchetype;
  name: string;
  themeTitle: string;
  primaryColor: string;
  secondaryColor: string;
  wallColor: string;
  floorColor: string;
  hazardType: 'necrotic_slime' | 'deep_water_current' | 'laser_conduit' | 'void_blood_fire';
  hazardDamage: number;
  chestType: 'sarcophagus' | 'contraband' | 'overclocked' | 'royal_reliquary';
  enemyTypes: CyberSoldierClass[];
}> = {
  1: {
    archetype: 'catacombs',
    name: 'Acte I : Catacombes & Nécropole du Mont-Royal',
    themeTitle: 'OSSUAIRE GOTHIC // CRYPTES CYBER-NÉCROTIQUES',
    primaryColor: '#00f3ff',
    secondaryColor: '#10b981',
    wallColor: '#1e293b',
    floorColor: '#090d16',
    hazardType: 'necrotic_slime',
    hazardDamage: 12,
    chestType: 'sarcophagus',
    enemyTypes: ['assault_trooper', 'stealth_ninja']
  },
  2: {
    archetype: 'docks',
    name: 'Acte II : Les Docks Submergés & Silos du Port',
    themeTitle: 'QUAIS INDUSTRIELS // CANAUX & BARGES ÉLECTRIFIÉES',
    primaryColor: '#38bdf8',
    secondaryColor: '#06b6d4',
    wallColor: '#132130',
    floorColor: '#05111a',
    hazardType: 'deep_water_current',
    hazardDamage: 18,
    chestType: 'contraband',
    enemyTypes: ['assault_trooper', 'heavy_exo', 'cyber_sniper']
  },
  3: {
    archetype: 'megastructure',
    name: 'Acte III : La Mégastructure Cybernétique & Cortex',
    themeTitle: 'COLOSSE CYBER-GOTHIC // CODES & COILS HAUTE TENSION',
    primaryColor: '#f59e0b',
    secondaryColor: '#ec4899',
    wallColor: '#27173e',
    floorColor: '#10051e',
    hazardType: 'laser_conduit',
    hazardDamage: 26,
    chestType: 'overclocked',
    enemyTypes: ['heavy_exo', 'stealth_ninja', 'cyber_sniper']
  },
  4: {
    archetype: 'citadel',
    name: 'Acte IV : La Citadelle Obscure & Trône Noir',
    themeTitle: 'CATHÉDRALE OBSIDIENNE // SANCTUAIRE IMPÉRIAL & FAILLE',
    primaryColor: '#ffaa00',
    secondaryColor: '#ef4444',
    wallColor: '#2b0e14',
    floorColor: '#140408',
    hazardType: 'void_blood_fire',
    hazardDamage: 38,
    chestType: 'royal_reliquary',
    enemyTypes: ['heavy_exo', 'stealth_ninja', 'cyber_sniper', 'assault_trooper']
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PROCEDURAL LEVEL GENERATOR CLASS
// ─────────────────────────────────────────────────────────────────────────────
export class ProceduralLevelGenerator {
  public static generate(
    stage: StageInfo, 
    difficultyTier: number = 1, 
    customSeed?: number
  ): ProceduralLevel {
    const seed = customSeed !== undefined ? customSeed : Math.floor(Math.random() * 1000000);
    const rng = new Mulberry32PRNG(seed);
    const stageId = stage.id || 1;
    const stageMeta = STAGE_ARCHETYPES[stageId] || STAGE_ARCHETYPES[1];

    // Grid Dimensions: 75x75 tiles of 40px each = 3000x3000px World
    const gridWidth = 75;
    const gridHeight = 75;
    const tileSize = 40;
    const totalTiles = gridWidth * gridHeight;
    const tiles = new Uint8Array(totalTiles);
    tiles.fill(TileType.WALL); // Fill whole map with Solid Wall

    const fogOfWar = new Uint8Array(totalTiles);
    fogOfWar.fill(0); // All unexplored initially

    const rooms: DungeonRoom[] = [];
    const chests: ChestData[] = [];
    const shrines: ShrineData[] = [];
    const hazards: ProceduralHazard[] = [];
    const initialEnemies: CombatEntity[] = [];

    // ───────────────────────────────────────────────────────────
    // 1. STAGE-SPECIFIC LAYOUT GENERATION ALGORITHMS
    // ───────────────────────────────────────────────────────────
    if (stageMeta.archetype === 'catacombs') {
      // ═════════════════════════════════════════════════════════
      // STAGE 1: CATACOMBS (BSP Rooms + Cave Cellular Automata)
      // ═════════════════════════════════════════════════════════
      this.generateCatacombsBSP(gridWidth, gridHeight, tiles, rooms, rng);
    } else if (stageMeta.archetype === 'docks') {
      // ═════════════════════════════════════════════════════════
      // STAGE 2: DOCKS (Piers, Walkways & Submerged Canals)
      // ═════════════════════════════════════════════════════════
      this.generateDocksArchipelago(gridWidth, gridHeight, tiles, rooms, rng);
    } else if (stageMeta.archetype === 'megastructure') {
      // ═════════════════════════════════════════════════════════
      // STAGE 3: MEGASTRUCTURE (Modular Sector Rings & Power Hubs)
      // ═════════════════════════════════════════════════════════
      this.generateMegastructureGrid(gridWidth, gridHeight, tiles, rooms, rng);
    } else {
      // ═════════════════════════════════════════════════════════
      // STAGE 4: CITADEL (Cruciform Cathedral & Grand Throne Hall)
      // ═════════════════════════════════════════════════════════
      this.generateCitadelCathedral(gridWidth, gridHeight, tiles, rooms, rng);
    }

    // Ensure at least 6 rooms were created
    if (rooms.length < 4) {
      this.fallbackRoomGeneration(gridWidth, gridHeight, tiles, rooms);
    }

    // Designate Roles to Rooms: Spawn, Standard, Alcoves, Boss Arena, Exfil
    const spawnRoom = rooms[0];
    spawnRoom.type = 'spawn';

    const bossRoom = rooms[rooms.length - 1];
    bossRoom.type = 'boss_arena';

    // Spawn & Objective Coordinates (World Pixels)
    const spawnPoint = {
      x: spawnRoom.centerX * tileSize,
      y: spawnRoom.centerY * tileSize
    };

    const bossGatePoint = {
      x: bossRoom.centerX * tileSize,
      y: bossRoom.centerY * tileSize
    };

    const exfilRoom = rooms.length > 2 ? rooms[rooms.length - 2] : bossRoom;
    const exfilPoint = {
      x: exfilRoom.centerX * tileSize + 60,
      y: exfilRoom.centerY * tileSize + 60
    };

    // Place Boss Gate and Exfil Tiles
    tiles[bossRoom.centerY * gridWidth + bossRoom.centerX] = TileType.BOSS_GATE;
    tiles[exfilRoom.centerY * gridWidth + exfilRoom.centerX] = TileType.EXFIL_PORTAL;

    // ───────────────────────────────────────────────────────────
    // 2. PROCEDURAL HAZARDS GENERATION
    // ───────────────────────────────────────────────────────────
    for (let i = 1; i < rooms.length; i++) {
      const r = rooms[i];
      if (r.type !== 'spawn' && rng.chance(0.65)) {
        const hazardCount = rng.randInt(1, 3);
        for (let h = 0; h < hazardCount; h++) {
          const hx = rng.randInt(r.x + 2, r.x + r.w - 3);
          const hy = rng.randInt(r.y + 2, r.y + r.h - 3);
          
          if (tiles[hy * gridWidth + hx] === TileType.FLOOR) {
            tiles[hy * gridWidth + hx] = TileType.HAZARD;
            hazards.push({
              id: `hazard_${i}_${h}`,
              x: hx * tileSize + tileSize / 2,
              y: hy * tileSize + tileSize / 2,
              radius: rng.randFloat(35, 60),
              type: stageMeta.hazardType,
              damagePerSec: stageMeta.hazardDamage * (1 + difficultyTier * 0.15),
              slowMultiplier: 0.65,
              color: stageMeta.secondaryColor
            });
          }
        }
      }
    }

    // ───────────────────────────────────────────────────────────
    // 3. PROCEDURAL CHESTS & SHRINKS PLACEMENT
    // ───────────────────────────────────────────────────────────
    let chestCounter = 0;
    let shrineCounter = 0;

    for (let i = 1; i < rooms.length; i++) {
      const r = rooms[i];

      // Chest Placement: 70% chance per non-spawn room
      if (rng.chance(0.75)) {
        const cx = rng.randInt(r.x + 1, r.x + r.w - 2);
        const cy = rng.randInt(r.y + 1, r.y + r.h - 2);
        
        if (tiles[cy * gridWidth + cx] === TileType.FLOOR) {
          tiles[cy * gridWidth + cx] = TileType.CHEST;
          chestCounter++;

          const isCursed = rng.chance(0.25);
          const rarityRoll = rng.next();
          const guaranteedRarity = 
            stageId === 4 ? (rarityRoll < 0.35 ? 'legendary' : 'epic') :
            stageId === 3 ? (rarityRoll < 0.25 ? 'legendary' : rarityRoll < 0.6 ? 'epic' : 'rare') :
            stageId === 2 ? (rarityRoll < 0.15 ? 'legendary' : rarityRoll < 0.5 ? 'epic' : 'rare') :
            (rarityRoll < 0.08 ? 'legendary' : rarityRoll < 0.35 ? 'epic' : rarityRoll < 0.75 ? 'rare' : 'standard');

          chests.push({
            id: `chest_${stageId}_${chestCounter}`,
            x: cx * tileSize + tileSize / 2,
            y: cy * tileSize + tileSize / 2,
            type: stageMeta.chestType,
            name: isCursed ? `☠️ Coffre Maudit de ${stageMeta.name}` : `Coffre Scellé : ${stageMeta.chestType.toUpperCase()}`,
            opened: false,
            guaranteedRarity,
            nanitesMin: 80 * stageId * difficultyTier,
            nanitesMax: 240 * stageId * difficultyTier,
            isCursed,
            cursedPackSpawned: false
          });
        }
      }

      // Shrine Placement: 40% chance in medium/large rooms
      if (r.type !== 'boss_arena' && rng.chance(0.40) && shrineCounter < 3) {
        const sx = r.centerX;
        const sy = r.centerY;

        if (tiles[sy * gridWidth + sx] === TileType.FLOOR) {
          tiles[sy * gridWidth + sx] = TileType.SHRINE;
          shrineCounter++;

          const shrineTypes: ShrineData['type'][] = [
            'channeling', 
            'conduit', 
            'frenzy', 
            'protection', 
            'greed', 
            'blood_altar'
          ];
          const chosenType = rng.pick(shrineTypes);

          const shrineNames: Record<ShrineData['type'], string> = {
            channeling: '⚡ Sanctuaire de Surcadence Psi (Coût Psi 0 & -50% CD)',
            conduit: '🌩️ Sanctuaire du Conduit (Éclairs Dévastateurs Automatiques)',
            frenzy: '🔥 Sanctuaire de Frénésie (+50% Vitesse d’Attaque & Vitesse)',
            protection: '🛡️ Sanctuaire de Blindage Invulnérable (Immunité Totale)',
            greed: '💎 Sanctuaire d’Avarice (Explosion de Nanites & Butin Réfracté)',
            blood_altar: '🩸 Autel de Sang Noir (-25% PV contre Butin Ancestral & Élite)'
          };

          const shrineDescs: Record<ShrineData['type'], string> = {
            channeling: 'Toutes vos compétences coûtent 0 Psi et leurs recharges sont réduites de 50%.',
            conduit: 'Projette des arcs d’éclairs à haute tension sur tous les ennemis à portée.',
            frenzy: '+50% Vitesse d’attaque et +30% vitesse de déplacement.',
            protection: 'Bouclier impénétrable absorbant 100% des dégâts reçus.',
            greed: 'Chaque ennemi abattu lâche le double de nano-crédits et des orbes d’expérience.',
            blood_altar: 'Sacrifie une portion de votre essence vitale pour invoquer un coffre légendaire.'
          };

          shrines.push({
            id: `shrine_${stageId}_${shrineCounter}`,
            x: sx * tileSize + tileSize / 2,
            y: sy * tileSize + tileSize / 2,
            type: chosenType,
            name: shrineNames[chosenType],
            buffDescription: shrineDescs[chosenType],
            activated: false,
            durationSeconds: chosenType === 'blood_altar' ? 0 : 25
          });
        }
      }
    }

    // ───────────────────────────────────────────────────────────
    // 4. PROCEDURAL ENEMY PACK PLACEMENT (MATHEMATICAL DENSITY)
    // ───────────────────────────────────────────────────────────
    let totalElitesCount = 0;
    let packCounter = 0;

    for (let i = 1; i < rooms.length; i++) {
      const r = rooms[i];
      if (r.type === 'spawn') continue;

      const roomArea = r.w * r.h;
      // Formula: Density = floor( Base * (1 + Area/180) * (1 + 0.15*Stage) * (1 + 0.1*Tier) )
      const basePackSize = r.type === 'boss_arena' ? 4 : rng.randInt(3, 6);
      const scaledPackSize = Math.min(
        10, 
        Math.floor(basePackSize * (1 + roomArea / 240) * (1 + stageId * 0.12) * (1 + difficultyTier * 0.08))
      );

      packCounter++;

      // Decide if room has a Champion or Elite Pack Commander
      const hasElite = r.type === 'boss_arena' ? true : rng.chance(0.35 + difficultyTier * 0.05);
      const isEliteHighTier = hasElite && rng.chance(0.35);
      const commanderTier: EliteTier | undefined = hasElite ? (isEliteHighTier ? 'elite' : 'champion') : undefined;

      // Pack Spawning Center
      const packCenterX = r.centerX * tileSize;
      const packCenterY = r.centerY * tileSize;

      for (let e = 0; e < scaledPackSize; e++) {
        const isCommander = e === 0 && hasElite;
        const angle = (e / scaledPackSize) * Math.PI * 2 + rng.randFloat(-0.3, 0.3);
        const radius = isCommander ? 0 : rng.randFloat(30, Math.min(r.w, r.h) * 14);

        const ex = Math.max(
          (r.x + 1) * tileSize + 20, 
          Math.min((r.x + r.w - 1) * tileSize - 20, packCenterX + Math.cos(angle) * radius)
        );
        const ey = Math.max(
          (r.y + 1) * tileSize + 20, 
          Math.min((r.y + r.h - 1) * tileSize - 20, packCenterY + Math.sin(angle) * radius)
        );

        const chosenClass = rng.pick(stageMeta.enemyTypes);
        const tierMult = 1 + (stageId - 1) * 0.35 + (difficultyTier - 1) * 0.25;

        const baseEnemyHp = Math.round(90 * tierMult * (stageId === 1 ? 1.0 : stageId === 2 ? 1.4 : stageId === 3 ? 2.0 : 2.8));
        const eliteTierVal = isCommander ? commanderTier : undefined;
        const eliteAffixes = eliteTierVal ? rollEliteAffixes(eliteTierVal, difficultyTier) : undefined;

        if (eliteTierVal) totalElitesCount++;

        const hpMult = eliteTierVal === 'elite' ? 3.5 : eliteTierVal === 'champion' ? 2.2 : 1.0;
        const dmgMult = eliteTierVal === 'elite' ? 1.6 : eliteTierVal === 'champion' ? 1.3 : 1.0;
        const xpMult = eliteTierVal === 'elite' ? 3.2 : eliteTierVal === 'champion' ? 2.0 : 1.0;

        let name = 'Assaillant';
        let radiusSize = 17;
        let speed = 2.8;
        let attackRange = 220;
        let attackCooldown = 30;
        let damage = Math.round(16 * tierMult * dmgMult);
        let behavior: CombatEntity['behavior'] = 'ranged';
        let color = stageMeta.primaryColor;

        if (chosenClass === 'assault_trooper') {
          name = isCommander ? (eliteTierVal === 'elite' ? '🔥 Élite Commando SPVM' : '⚡ Champion Fusilier') : 'Soldat Cyber-Fusilier';
          radiusSize = 17 + (eliteTierVal ? 4 : 0);
          speed = 2.9;
          behavior = 'ranged';
          color = eliteTierVal ? '#f59e0b' : stageMeta.primaryColor;
        } else if (chosenClass === 'heavy_exo') {
          name = isCommander ? (eliteTierVal === 'elite' ? '🔥 Élite Titan Cyber-Lourd' : '⚡ Champion Exo-Garde') : 'Goliath Cyber-Lourd';
          radiusSize = 23 + (eliteTierVal ? 5 : 0);
          speed = 2.0;
          damage = Math.round(28 * tierMult * dmgMult);
          attackRange = 45;
          behavior = 'melee';
          color = eliteTierVal ? '#f59e0b' : '#f97316';
        } else if (chosenClass === 'stealth_ninja') {
          name = isCommander ? (eliteTierVal === 'elite' ? '🔥 Élite Maître Assassin' : '⚡ Champion Infiltrateur') : 'Infiltrateur Cyber-Ninja';
          radiusSize = 15 + (eliteTierVal ? 3 : 0);
          speed = 3.8;
          damage = Math.round(24 * tierMult * dmgMult);
          attackRange = 40;
          behavior = 'melee';
          color = eliteTierVal ? '#f59e0b' : '#38bdf8';
        } else if (chosenClass === 'cyber_sniper') {
          name = isCommander ? (eliteTierVal === 'elite' ? '🔥 Élite Sniper Antimatière' : '⚡ Champion Railgunner') : 'Tireur d’Élite Railgun';
          radiusSize = 16 + (eliteTierVal ? 3 : 0);
          speed = 2.2;
          damage = Math.round(32 * tierMult * dmgMult);
          attackRange = 360;
          attackCooldown = 55;
          behavior = 'ranged';
          color = eliteTierVal ? '#f59e0b' : '#ef4444';
        }

        const enemy: CombatEntity = {
          id: `proc_enemy_${stageId}_${packCounter}_${e}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'enemy',
          name,
          x: ex,
          y: ey,
          radius: radiusSize,
          hp: Math.round(baseEnemyHp * hpMult),
          maxHp: Math.round(baseEnemyHp * hpMult),
          speed,
          color,
          attackCooldown,
          attackRange,
          damage,
          xpReward: Math.round(45 * tierMult * xpMult),
          behavior,
          spriteType: chosenClass,
          soldierClass: chosenClass,
          resistances: getDefaultResistances(chosenClass),
          isElite: !!eliteTierVal,
          eliteTier: eliteTierVal,
          eliteAffixes,
          statusEffects: []
        };

        initialEnemies.push(enemy);
      }
    }

    return {
      seed,
      stageId,
      archetype: stageMeta.archetype,
      stageName: stageMeta.name,
      gridWidth,
      gridHeight,
      tileSize,
      tiles,
      fogOfWar,
      rooms,
      spawnPoint,
      bossGatePoint,
      exfilPoint,
      chests,
      shrines,
      hazards,
      initialEnemies,
      stats: {
        totalRooms: rooms.length,
        totalChests: chests.length,
        totalShrines: shrines.length,
        totalEnemyPacks: packCounter,
        totalElites: totalElitesCount
      }
    };
  }

  // ───────────────────────────────────────────────────────────
  // ALGORITHM 1 : CATACOMBS BSP & CAVE CORRIDORS
  // ───────────────────────────────────────────────────────────
  private static generateCatacombsBSP(
    width: number, 
    height: number, 
    tiles: Uint8Array, 
    rooms: DungeonRoom[], 
    rng: Mulberry32PRNG
  ): void {
    const minRoomSize = 8;
    const maxRoomSize = 15;
    const roomCountTarget = rng.randInt(8, 12);

    for (let attempt = 0; attempt < 80 && rooms.length < roomCountTarget; attempt++) {
      const rw = rng.randInt(minRoomSize, maxRoomSize);
      const rh = rng.randInt(minRoomSize, maxRoomSize);
      const rx = rng.randInt(3, width - rw - 4);
      const ry = rng.randInt(3, height - rh - 4);

      // Check overlap
      let overlaps = false;
      for (const r of rooms) {
        if (rx < r.x + r.w + 3 && rx + rw + 3 > r.x && ry < r.y + r.h + 3 && ry + rh + 3 > r.y) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        const newRoom: DungeonRoom = {
          id: rooms.length,
          x: rx,
          y: ry,
          w: rw,
          h: rh,
          centerX: Math.floor(rx + rw / 2),
          centerY: Math.floor(ry + rh / 2),
          type: 'standard',
          connectedTo: [],
          explored: false
        };

        // Carve Room
        for (let dy = 0; dy < rh; dy++) {
          for (let dx = 0; dx < rw; dx++) {
            tiles[(ry + dy) * width + (rx + dx)] = TileType.FLOOR;
          }
        }

        // Add Bone Pillars in large rooms (Catacombs vibe)
        if (rw >= 11 && rh >= 11) {
          tiles[(ry + 3) * width + (rx + 3)] = TileType.WALL;
          tiles[(ry + 3) * width + (rx + rw - 4)] = TileType.WALL;
          tiles[(ry + rh - 4) * width + (rx + 3)] = TileType.WALL;
          tiles[(ry + rh - 4) * width + (rx + rw - 4)] = TileType.WALL;
        }

        rooms.push(newRoom);
      }
    }

    // Connect Rooms via Winding Corridors (MST-like + Organic Walks)
    for (let i = 0; i < rooms.length - 1; i++) {
      const rA = rooms[i];
      const rB = rooms[i + 1];
      this.carveCorridorLShaped(width, tiles, rA.centerX, rA.centerY, rB.centerX, rB.centerY, rng, 2);
      rA.connectedTo.push(rB.id);
      rB.connectedTo.push(rA.id);
    }
  }

  // ───────────────────────────────────────────────────────────
  // ALGORITHM 2 : DOCKS ARCHIPELAGO & PIER CHANNELS
  // ───────────────────────────────────────────────────────────
  private static generateDocksArchipelago(
    width: number, 
    height: number, 
    tiles: Uint8Array, 
    rooms: DungeonRoom[], 
    rng: Mulberry32PRNG
  ): void {
    // Generate Horizontal & Vertical Wharf Walkways with Intersecting Islands
    const pierWidth = 4;
    const islandCount = rng.randInt(7, 10);

    // Create Main Spine Pier (Long Walkway)
    const spineY = Math.floor(height / 2);
    for (let x = 6; x < width - 6; x++) {
      for (let py = -Math.floor(pierWidth/2); py <= Math.floor(pierWidth/2); py++) {
        tiles[(spineY + py) * width + x] = TileType.FLOOR;
      }
    }

    // Spawn 7-10 Island Warehouses / Cargo Docks
    for (let i = 0; i < islandCount; i++) {
      const rw = rng.randInt(10, 16);
      const rh = rng.randInt(8, 14);
      const isTop = i % 2 === 0;
      const rx = Math.floor(8 + (i / islandCount) * (width - 24) + rng.randInt(-2, 2));
      const ry = isTop ? rng.randInt(6, spineY - rh - 4) : rng.randInt(spineY + 5, height - rh - 6);

      const newRoom: DungeonRoom = {
        id: rooms.length,
        x: rx,
        y: ry,
        w: rw,
        h: rh,
        centerX: Math.floor(rx + rw / 2),
        centerY: Math.floor(ry + rh / 2),
        type: 'standard',
        connectedTo: [],
        explored: false
      };

      // Carve Pier Island
      for (let dy = 0; dy < rh; dy++) {
        for (let dx = 0; dx < rw; dx++) {
          tiles[(ry + dy) * width + (rx + dx)] = TileType.FLOOR;
        }
      }

      // Connect Island to Spine Pier via Bridge
      const bridgeX = newRoom.centerX;
      const startY = isTop ? (ry + rh) : spineY;
      const endY = isTop ? spineY : ry;

      for (let by = Math.min(startY, endY); by <= Math.max(startY, endY); by++) {
        for (let bx = -1; bx <= 1; bx++) {
          tiles[by * width + (bridgeX + bx)] = TileType.FLOOR;
        }
      }

      rooms.push(newRoom);
    }
  }

  // ───────────────────────────────────────────────────────────
  // ALGORITHM 3 : MEGASTRUCTURE MODULAR SECTOR GRID
  // ───────────────────────────────────────────────────────────
  private static generateMegastructureGrid(
    width: number, 
    height: number, 
    tiles: Uint8Array, 
    rooms: DungeonRoom[], 
    rng: Mulberry32PRNG
  ): void {
    // 3x3 Sector Core Array with Circuit Corridors & Power Hexagons
    const cols = 3;
    const rows = 3;
    const cellW = Math.floor((width - 12) / cols);
    const cellH = Math.floor((height - 12) / rows);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rw = rng.randInt(12, cellW - 4);
        const rh = rng.randInt(12, cellH - 4);
        const rx = Math.floor(6 + c * cellW + (cellW - rw) / 2);
        const ry = Math.floor(6 + r * cellH + (cellH - rh) / 2);

        const newRoom: DungeonRoom = {
          id: rooms.length,
          x: rx,
          y: ry,
          w: rw,
          h: rh,
          centerX: Math.floor(rx + rw / 2),
          centerY: Math.floor(ry + rh / 2),
          type: (r === 1 && c === 1) ? 'treasure_vault' : 'standard',
          connectedTo: [],
          explored: false
        };

        // Carve Geometric Modular Chamber
        for (let dy = 0; dy < rh; dy++) {
          for (let dx = 0; dx < rw; dx++) {
            tiles[(ry + dy) * width + (rx + dx)] = TileType.FLOOR;
          }
        }

        // Add Hex Core Centerpiece in Megastructure
        if (r === 1 && c === 1) {
          // Central Reactor Void ring
          tiles[(newRoom.centerY) * width + (newRoom.centerX)] = TileType.WALL;
        }

        rooms.push(newRoom);
      }
    }

    // Connect Adjacent Grid Cells (Circuit Conduits)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const currentIdx = r * cols + c;
        // Connect Right
        if (c < cols - 1) {
          const rightIdx = r * cols + (c + 1);
          this.carveCorridorLShaped(width, tiles, rooms[currentIdx].centerX, rooms[currentIdx].centerY, rooms[rightIdx].centerX, rooms[rightIdx].centerY, rng, 3);
          rooms[currentIdx].connectedTo.push(rooms[rightIdx].id);
        }
        // Connect Down
        if (r < rows - 1) {
          const downIdx = (r + 1) * cols + c;
          this.carveCorridorLShaped(width, tiles, rooms[currentIdx].centerX, rooms[currentIdx].centerY, rooms[downIdx].centerX, rooms[downIdx].centerY, rng, 3);
          rooms[currentIdx].connectedTo.push(rooms[downIdx].id);
        }
      }
    }
  }

  // ───────────────────────────────────────────────────────────
  // ALGORITHM 4 : CITADEL GRAND CRUCIFORM CATHEDRAL
  // ───────────────────────────────────────────────────────────
  private static generateCitadelCathedral(
    width: number, 
    height: number, 
    tiles: Uint8Array, 
    rooms: DungeonRoom[], 
    _rng: Mulberry32PRNG
  ): void {
    // 1. Grand Central Nave (Axis)
    const naveW = 16;
    const naveH = 50;
    const naveX = Math.floor(width / 2 - naveW / 2);
    const naveY = 12;

    const mainNave: DungeonRoom = {
      id: 0,
      x: naveX,
      y: naveY,
      w: naveW,
      h: naveH,
      centerX: Math.floor(width / 2),
      centerY: Math.floor(naveY + naveH / 2),
      type: 'spawn',
      connectedTo: [1, 2, 3],
      explored: false
    };

    for (let dy = 0; dy < naveH; dy++) {
      for (let dx = 0; dx < naveW; dx++) {
        tiles[(naveY + dy) * width + (naveX + dx)] = TileType.FLOOR;
      }
    }
    rooms.push(mainNave);

    // 2. Left Transept (Sanctuary West)
    const transeptW = 18;
    const transeptH = 14;
    const leftTranseptX = naveX - transeptW + 2;
    const leftTranseptY = Math.floor(naveY + naveH * 0.4);

    const leftRoom: DungeonRoom = {
      id: 1,
      x: leftTranseptX,
      y: leftTranseptY,
      w: transeptW,
      h: transeptH,
      centerX: Math.floor(leftTranseptX + transeptW / 2),
      centerY: Math.floor(leftTranseptY + transeptH / 2),
      type: 'shrine_chamber',
      connectedTo: [0],
      explored: false
    };

    for (let dy = 0; dy < transeptH; dy++) {
      for (let dx = 0; dx < transeptW; dx++) {
        tiles[(leftTranseptY + dy) * width + (leftTranseptX + dx)] = TileType.FLOOR;
      }
    }
    rooms.push(leftRoom);

    // 3. Right Transept (Sanctuary East)
    const rightTranseptX = naveX + naveW - 2;
    const rightTranseptY = Math.floor(naveY + naveH * 0.4);

    const rightRoom: DungeonRoom = {
      id: 2,
      x: rightTranseptX,
      y: rightTranseptY,
      w: transeptW,
      h: transeptH,
      centerX: Math.floor(rightTranseptX + transeptW / 2),
      centerY: Math.floor(rightTranseptY + transeptH / 2),
      type: 'treasure_vault',
      connectedTo: [0],
      explored: false
    };

    for (let dy = 0; dy < transeptH; dy++) {
      for (let dx = 0; dx < transeptW; dx++) {
        tiles[(rightTranseptY + dy) * width + (rightTranseptX + dx)] = TileType.FLOOR;
      }
    }
    rooms.push(rightRoom);

    // 4. Grand Imperial Throne Sanctum (Boss Arena at Head of Nave)
    const throneW = 24;
    const throneH = 20;
    const throneX = Math.floor(width / 2 - throneW / 2);
    const throneY = naveY + naveH - 4;

    const throneRoom: DungeonRoom = {
      id: 3,
      x: throneX,
      y: throneY,
      w: throneW,
      h: throneH,
      centerX: Math.floor(width / 2),
      centerY: Math.floor(throneY + throneH / 2),
      type: 'boss_arena',
      connectedTo: [0],
      explored: false
    };

    for (let dy = 0; dy < throneH; dy++) {
      for (let dx = 0; dx < throneW; dx++) {
        tiles[(throneY + dy) * width + (throneX + dx)] = TileType.FLOOR;
      }
    }
    rooms.push(throneRoom);
  }

  // ───────────────────────────────────────────────────────────
  // CORRIDOR CARVER HELPER
  // ───────────────────────────────────────────────────────────
  private static carveCorridorLShaped(
    width: number, 
    tiles: Uint8Array, 
    x1: number, 
    y1: number, 
    x2: number, 
    y2: number, 
    rng: Mulberry32PRNG,
    thickness: number = 2
  ): void {
    const halfThick = Math.floor(thickness / 2);
    const horizontalFirst = rng.chance(0.5);

    if (horizontalFirst) {
      // Horizontal segment
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        for (let t = -halfThick; t <= halfThick; t++) {
          tiles[(y1 + t) * width + x] = TileType.FLOOR;
        }
      }
      // Vertical segment
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        for (let t = -halfThick; t <= halfThick; t++) {
          tiles[y * width + (x2 + t)] = TileType.FLOOR;
        }
      }
    } else {
      // Vertical segment
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        for (let t = -halfThick; t <= halfThick; t++) {
          tiles[y * width + (x1 + t)] = TileType.FLOOR;
        }
      }
      // Horizontal segment
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        for (let t = -halfThick; t <= halfThick; t++) {
          tiles[(y2 + t) * width + x] = TileType.FLOOR;
        }
      }
    }
  }

  // ───────────────────────────────────────────────────────────
  // FALLBACK ROOM GENERATION (Guaranteed Connectivity)
  // ───────────────────────────────────────────────────────────
  private static fallbackRoomGeneration(
    width: number, 
    height: number, 
    tiles: Uint8Array, 
    rooms: DungeonRoom[]
  ): void {
    rooms.length = 0;
    const roomSpecs = [
      { x: 10, y: 10, w: 14, h: 14, type: 'spawn' as const },
      { x: 30, y: 12, w: 16, h: 14, type: 'standard' as const },
      { x: 50, y: 20, w: 14, h: 16, type: 'standard' as const },
      { x: 25, y: 40, w: 20, h: 18, type: 'boss_arena' as const },
    ];

    for (let i = 0; i < roomSpecs.length; i++) {
      const s = roomSpecs[i];
      const r: DungeonRoom = {
        id: i,
        x: s.x,
        y: s.y,
        w: s.w,
        h: s.h,
        centerX: Math.floor(s.x + s.w / 2),
        centerY: Math.floor(s.y + s.h / 2),
        type: s.type,
        connectedTo: [],
        explored: false
      };

      for (let dy = 0; dy < s.h; dy++) {
        for (let dx = 0; dx < s.w; dx++) {
          tiles[(s.y + dy) * width + (s.x + dx)] = TileType.FLOOR;
        }
      }
      rooms.push(r);
    }

    // Connect in ring
    for (let i = 0; i < rooms.length; i++) {
      const next = (i + 1) % rooms.length;
      const rA = rooms[i];
      const rB = rooms[next];
      for (let x = Math.min(rA.centerX, rB.centerX); x <= Math.max(rA.centerX, rB.centerX); x++) {
        tiles[rA.centerY * width + x] = TileType.FLOOR;
      }
      for (let y = Math.min(rA.centerY, rB.centerY); y <= Math.max(rA.centerY, rB.centerY); y++) {
        tiles[y * width + rB.centerX] = TileType.FLOOR;
      }
    }
  }

  // ───────────────────────────────────────────────────────────
  // CHECK TILE COLLISION (Solid Wall / Bounds)
  // ───────────────────────────────────────────────────────────
  public static isWalkable(level: ProceduralLevel, worldX: number, worldY: number): boolean {
    const gx = Math.floor(worldX / level.tileSize);
    const gy = Math.floor(worldY / level.tileSize);

    if (gx < 0 || gx >= level.gridWidth || gy < 0 || gy >= level.gridHeight) {
      return false; // Out of bounds
    }

    const tile = level.tiles[gy * level.gridWidth + gx];
    return tile !== TileType.WALL;
  }

  // ───────────────────────────────────────────────────────────
  // UPDATE FOG OF WAR (Player Exploration Line-of-Sight)
  // ───────────────────────────────────────────────────────────
  public static updateExplorationFog(level: ProceduralLevel, playerWorldX: number, playerWorldY: number, sightRadiusTiles: number = 8): void {
    const pX = Math.floor(playerWorldX / level.tileSize);
    const pY = Math.floor(playerWorldY / level.tileSize);

    const minX = Math.max(0, pX - sightRadiusTiles);
    const maxX = Math.min(level.gridWidth - 1, pX + sightRadiusTiles);
    const minY = Math.max(0, pY - sightRadiusTiles);
    const maxY = Math.min(level.gridHeight - 1, pY + sightRadiusTiles);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dist = Math.hypot(x - pX, y - pY);
        if (dist <= sightRadiusTiles) {
          level.fogOfWar[y * level.gridWidth + x] = 1;
        }
      }
    }

    // Mark current room as explored
    for (const r of level.rooms) {
      if (pX >= r.x && pX < r.x + r.w && pY >= r.y && pY < r.y + r.h) {
        r.explored = true;
      }
    }
  }
}
