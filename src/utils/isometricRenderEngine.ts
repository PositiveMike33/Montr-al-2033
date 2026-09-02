import { 
  AvatarCustomization, 
  CombatEntity, 
  Companion, 
  StageInfo, 
  EquipmentItem 
} from '../types';
import { getWeaponSkinById, WeaponSkin } from './weaponSkinsData';
import { GeneratedLevel, TileType, InteractiveProp } from './proceduralDungeonEngine';

// ============================================================================
// ULTRA-OPTIMIZED HIGH-PERFORMANCE 2.5D RENDER ENGINE (MONTRÉAL 2033)
// 0 shadowBlur, Minimal Path Allocations, Frustum-Culling friendly, 60+ FPS
// ============================================================================

export interface IsometricPoint {
  x: number;
  y: number;
}

export function worldToIso(x: number, y: number): IsometricPoint {
  return {
    x: (x - y) * 0.866,
    y: (x + y) * 0.5
  };
}

/**
 * Procedural Dungeon Floor & 2.5D Wall Renderer with Viewport Culling
 */
export function drawProceduralDungeonFloorAndWalls(
  ctx: CanvasRenderingContext2D,
  level: GeneratedLevel,
  camera: { x: number; y: number },
  viewport: { width: number; height: number },
  time: number
) {
  const { cols, rows, tileSize, tiles, config } = level;

  // 1. Dark Base Void Fill
  ctx.fillStyle = config.fogColor || '#05070f';
  ctx.fillRect(camera.x - 20, camera.y - 20, viewport.width + 40, viewport.height + 40);

  // 2. Viewport Tile Range Calculation (Frustum Culling)
  const minGX = Math.max(0, Math.floor((camera.x - 40) / tileSize));
  const maxGX = Math.min(cols - 1, Math.ceil((camera.x + viewport.width + 40) / tileSize));
  const minGY = Math.max(0, Math.floor((camera.y - 40) / tileSize));
  const maxGY = Math.min(rows - 1, Math.ceil((camera.y + viewport.height + 40) / tileSize));

  // Color Palettes per Stage
  const isCatacombs = config.stageKey === 'catacombs';
  const isDocks = config.stageKey === 'docks';
  const isMegastructure = config.stageKey === 'megastructure';
  const isCitadel = config.stageKey === 'citadel';

  const floorBg = config.floorColor || '#0a0d16';
  const wallBase = config.wallColor || '#1c2438';
  const wallTop = isCatacombs ? '#2d2836' : isDocks ? '#223240' : isMegastructure ? '#38203d' : '#3d2816';
  const accent = config.accentColor || '#00f3ff';

  // 3. Render Floor Tiles & Corridors
  for (let gy = minGY; gy <= maxGY; gy++) {
    for (let gx = minGX; gx <= maxGX; gx++) {
      const tile = tiles[gy * cols + gx];
      const wx = gx * tileSize;
      const wy = gy * tileSize;

      if (tile === TileType.FLOOR || tile === TileType.CORRIDOR || tile === TileType.ALTAR) {
        // Floor tile base
        ctx.fillStyle = tile === TileType.CORRIDOR ? floorBg : floorBg;
        ctx.fillRect(wx, wy, tileSize, tileSize);

        // Subtle tile borders / grid
        ctx.strokeStyle = `${accent}12`;
        ctx.lineWidth = 1;
        ctx.strokeRect(wx, wy, tileSize, tileSize);

        // Stage specific thematic floor patterns
        if (isCatacombs && (gx + gy) % 3 === 0) {
          ctx.fillStyle = 'rgba(0, 243, 255, 0.02)';
          ctx.fillRect(wx + 2, wy + 2, tileSize - 4, tileSize - 4);
        } else if (isDocks && (gx % 4 === 0 || gy % 4 === 0)) {
          ctx.fillStyle = '#eab3080a';
          ctx.fillRect(wx + 4, wy + 4, tileSize - 8, tileSize - 8);
        } else if (isMegastructure && (gx * gy) % 5 === 0) {
          ctx.fillStyle = 'rgba(255, 0, 127, 0.03)';
          ctx.fillRect(wx + 3, wy + 3, tileSize - 6, tileSize - 6);
        } else if (isCitadel && (gx + gy) % 2 === 0) {
          ctx.fillStyle = 'rgba(255, 170, 0, 0.03)';
          ctx.fillRect(wx + 2, wy + 2, tileSize - 4, tileSize - 4);
        }
      } else if (tile === TileType.WATER_HAZARD || tile === TileType.PIT_CHASM) {
        // Water / Void ditch
        const wave = Math.sin(time * 0.003 + gx * 0.5 + gy * 0.5) * 0.15 + 0.85;
        ctx.fillStyle = isDocks ? `rgba(10, 30, 40, ${wave})` : isCatacombs ? `rgba(25, 5, 15, ${wave})` : '#020408';
        ctx.fillRect(wx, wy, tileSize, tileSize);
        ctx.strokeStyle = isDocks ? '#00f3ff33' : '#ff005533';
        ctx.lineWidth = 1;
        ctx.strokeRect(wx + 2, wy + 2, tileSize - 4, tileSize - 4);
      }
    }
  }

  // 4. Render 2.5D Isometric Wall Blocks & Pillars
  for (let gy = minGY; gy <= maxGY; gy++) {
    for (let gx = minGX; gx <= maxGX; gx++) {
      const tile = tiles[gy * cols + gx];
      const wx = gx * tileSize;
      const wy = gy * tileSize;

      if (tile === TileType.WALL) {
        // Only render walls that touch at least one floor tile (optimization & clean look)
        const hasFloorNeighbor = 
          (gx > 0 && tiles[gy * cols + (gx - 1)] === TileType.FLOOR) ||
          (gx < cols - 1 && tiles[gy * cols + (gx + 1)] === TileType.FLOOR) ||
          (gy > 0 && tiles[(gy - 1) * cols + gx] === TileType.FLOOR) ||
          (gy < rows - 1 && tiles[(gy + 1) * cols + gx] === TileType.FLOOR) ||
          (gx > 0 && tiles[gy * cols + (gx - 1)] === TileType.CORRIDOR) ||
          (gx < cols - 1 && tiles[gy * cols + (gx + 1)] === TileType.CORRIDOR) ||
          (gy > 0 && tiles[(gy - 1) * cols + gx] === TileType.CORRIDOR) ||
          (gy < rows - 1 && tiles[(gy + 1) * cols + gx] === TileType.CORRIDOR);

        if (hasFloorNeighbor) {
          // 2.5D Wall Top
          ctx.fillStyle = wallTop;
          ctx.fillRect(wx, wy - 8, tileSize, tileSize);

          // 2.5D Wall Front Face (South elevation)
          ctx.fillStyle = wallBase;
          ctx.fillRect(wx, wy + tileSize - 8, tileSize, 8);

          // Accent Edge Trim
          ctx.strokeStyle = `${accent}33`;
          ctx.lineWidth = 1;
          ctx.strokeRect(wx, wy - 8, tileSize, tileSize);
        } else {
          ctx.fillStyle = '#05070e';
          ctx.fillRect(wx, wy, tileSize, tileSize);
        }
      } else if (tile === TileType.PILLAR) {
        // Grand Obsidian / Gothic Pillar
        drawEntityShadow(ctx, wx + tileSize / 2, wy + tileSize / 2, tileSize * 0.45);
        ctx.fillStyle = wallTop;
        ctx.fillRect(wx + 4, wy - 14, tileSize - 8, tileSize);
        ctx.fillStyle = wallBase;
        ctx.fillRect(wx + 4, wy + tileSize - 14, tileSize - 8, 14);
        ctx.fillStyle = accent;
        ctx.fillRect(wx + tileSize / 2 - 2, wy - 8, 4, 4);
      }
    }
  }
}

/**
 * Interactive Props Renderer (Chests, Shrines, Breakables, Portal)
 */
export function drawProceduralInteractiveProp(
  ctx: CanvasRenderingContext2D,
  prop: InteractiveProp,
  time: number
) {
  const { worldX, worldY, type, opened, color, label } = prop;

  // 1. Shadow
  drawEntityShadow(ctx, worldX, worldY, prop.radius * 0.8);

  // 2. Dispatch Render based on Prop Type
  if (type === 'portal') {
    // Dimensional Exit Portal
    const pulse = Math.sin(time * 0.005) * 6;
    const rad = prop.radius + pulse;

    ctx.save();
    ctx.translate(worldX, worldY);
    ctx.rotate(time * 0.002);

    ctx.strokeStyle = color || '#00f3ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `${color}22`;
    ctx.fill();

    // Swirling inner rings
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // Portal Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🌀 PORTAIL D’EXTRACTION', worldX, worldY - rad - 8);
    ctx.textAlign = 'left';
    return;
  }

  if (type === 'shrine') {
    // Buff Shrine Pylon
    const floatY = Math.sin(time * 0.004) * 4;
    const rad = prop.radius;

    ctx.fillStyle = '#1a1f2c';
    ctx.fillRect(worldX - rad * 0.5, worldY - rad * 0.6, rad, rad * 1.2);
    ctx.strokeStyle = color || '#ff007f';
    ctx.lineWidth = 2;
    ctx.strokeRect(worldX - rad * 0.5, worldY - rad * 0.6, rad, rad * 1.2);

    // Floating Crystal Core
    if (!opened) {
      ctx.fillStyle = color || '#ff007f';
      ctx.beginPath();
      ctx.arc(worldX, worldY - rad * 0.8 + floatY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing Aura Ring
      ctx.strokeStyle = `${color}66`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(worldX, worldY, rad * 1.4, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#555566';
      ctx.beginPath();
      ctx.arc(worldX, worldY - rad * 0.4, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label
    ctx.fillStyle = opened ? '#718096' : color;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(opened ? '⚡ Sanctuaire Épuisé' : label, worldX, worldY - rad - 12);
    ctx.textAlign = 'left';
    return;
  }

  if (type === 'chest') {
    // Loot Chest
    const w = 24;
    const h = 16;
    const chestColor = opened ? '#4a5568' : (color || '#eab308');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(worldX - w / 2, worldY - h / 2, w, h);

    ctx.strokeStyle = chestColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(worldX - w / 2, worldY - h / 2, w, h);

    // Lock / Trim
    ctx.fillStyle = chestColor;
    ctx.fillRect(worldX - 3, worldY - 2, 6, 4);

    if (!opened) {
      // Glow Sparkle
      const glow = Math.sin(time * 0.006) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${glow})`;
      ctx.fillRect(worldX - 1, worldY - 1, 2, 2);

      // Label
      ctx.fillStyle = chestColor;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, worldX, worldY - h - 4);
      ctx.textAlign = 'left';
    }
    return;
  }

  if (type === 'breakable') {
    // Breakable Urn / Crate
    if (!opened) {
      ctx.fillStyle = '#4a5568';
      ctx.beginPath();
      ctx.arc(worldX, worldY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a0aec0';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

/**
 * Real-Time Tactical HUD Minimap
 */
export function drawProceduralMinimap(
  ctx: CanvasRenderingContext2D,
  level: GeneratedLevel,
  player: { x: number; y: number },
  enemies: CombatEntity[],
  props: InteractiveProp[],
  mapX: number,
  mapY: number,
  mapWidth: number,
  mapHeight: number
) {
  // 1. Radar Container Background
  ctx.fillStyle = 'rgba(5, 8, 16, 0.85)';
  ctx.fillRect(mapX, mapY, mapWidth, mapHeight);
  ctx.strokeStyle = `${level.config.accentColor}44`;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);

  // 2. Scale factors
  const scaleX = mapWidth / level.width;
  const scaleY = mapHeight / level.height;

  // 3. Draw Rooms & Corridors
  for (const room of level.rooms) {
    const rx = mapX + room.x * level.tileSize * scaleX;
    const ry = mapY + room.y * level.tileSize * scaleY;
    const rw = room.width * level.tileSize * scaleX;
    const rh = room.height * level.tileSize * scaleY;

    if (room.type === 'BOSS_SANCTUM') {
      ctx.fillStyle = 'rgba(255, 0, 85, 0.25)';
      ctx.strokeStyle = '#ff0055';
    } else if (room.type === 'TREASURY') {
      ctx.fillStyle = 'rgba(255, 170, 0, 0.2)';
      ctx.strokeStyle = '#ffaa00';
    } else if (room.type === 'ARENA') {
      ctx.fillStyle = 'rgba(255, 0, 255, 0.18)';
      ctx.strokeStyle = '#ff00ff';
    } else {
      ctx.fillStyle = 'rgba(0, 243, 255, 0.12)';
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
    }

    ctx.fillRect(rx, ry, rw, rh);
    ctx.lineWidth = 0.5;
    ctx.strokeRect(rx, ry, rw, rh);
  }

  // 4. Draw Props (Chests, Shrines, Portal)
  for (const p of props) {
    if (p.opened && p.type !== 'portal') continue;
    const px = mapX + p.worldX * scaleX;
    const py = mapY + p.worldY * scaleY;

    if (p.type === 'portal') {
      ctx.fillStyle = level.config.accentColor;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'chest') {
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
    } else if (p.type === 'shrine') {
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(px - 2, py - 2, 4, 4);
    }
  }

  // 5. Draw Enemies (Red Dots)
  for (const en of enemies) {
    const ex = mapX + en.x * scaleX;
    const ey = mapY + en.y * scaleY;
    ctx.fillStyle = en.isBoss ? '#ff0044' : en.isElite ? '#f59e0b' : '#ef4444';
    ctx.beginPath();
    ctx.arc(ex, ey, en.isBoss ? 3 : 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Draw Player (Green Beacon)
  const px = mapX + player.x * scaleX;
  const py = mapY + player.y * scaleY;
  ctx.fillStyle = '#00ff41';
  ctx.beginPath();
  ctx.arc(px, py, 3, 0, Math.PI * 2);
  ctx.fill();

  // Radar Scanner Sweep Line
  const sweepAngle = (Date.now() * 0.002) % (Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + Math.cos(sweepAngle) * 20, py + Math.sin(sweepAngle) * 20);
  ctx.stroke();

  // Minimap Title & Seed
  ctx.fillStyle = '#a0aec0';
  ctx.font = 'bold 8px monospace';
  ctx.fillText(`RADAR // SEED: #${level.seed}`, mapX + 6, mapY + 12);
}

/**
 * Legacy Floor Grid (Fallback)
 */
export function drawDiabloIsometricFloor(
  ctx: CanvasRenderingContext2D,
  stage: StageInfo,
  camera: { x: number; y: number },
  worldSize: { width: number; height: number },
  _time: number
) {
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  ctx.fillStyle = stage.bgDark || '#050811';
  ctx.fillRect(camera.x - 50, camera.y - 50, viewW + 100, viewH + 100);

  const step = 200;
  const startX = Math.max(0, Math.floor((camera.x - 50) / step) * step);
  const startY = Math.max(0, Math.floor((camera.y - 50) / step) * step);
  const endX = Math.min(worldSize.width, camera.x + viewW + 100);
  const endY = Math.min(worldSize.height, camera.y + viewH + 100);

  ctx.strokeStyle = stage.gridColor || 'rgba(0, 243, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = startX; x <= endX; x += step) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
  }
  for (let y = startY; y <= endY; y += step) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  }
  ctx.stroke();

  ctx.strokeStyle = stage.accentColor || '#00f3ff';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, worldSize.width, worldSize.height);
}

/**
 * Fast Entity Shadow (Flat ellipse)
 */
export function drawEntityShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  _heightOffset: number = 0
) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(x, y + 8, radius, radius * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Ultra-Optimized Protagonist (Thirty3)
 */
export function drawIsometricPlayerHeadToToe(
  ctx: CanvasRenderingContext2D,
  player: {
    x: number;
    y: number;
    angle: number;
    radius: number;
    isAttacking: boolean;
    comboStep: number;
    isDashing: boolean;
    dashTimer: number;
    trail: Array<{ x: number; y: number; alpha: number; color: string }>;
  },
  customization: AvatarCustomization,
  equippedWeapon?: EquipmentItem,
  time: number = Date.now()
) {
  const { x, y, angle, radius, isAttacking, isDashing, trail } = player;

  // 1. Dash Trail (Phantom afterimages)
  if (isDashing && trail.length > 0) {
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      ctx.fillStyle = `${t.color || '#00f3ff'}${Math.floor(t.alpha * 60).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Real-time Shadow
  drawEntityShadow(ctx, x, y, radius);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // 3. Body Armor (Neo-Trenchcoat / Kevlar)
  const suitColor = customization.suitColor || '#0ea5e9';
  ctx.fillStyle = '#0f172a'; // Base black exoskeleton
  ctx.fillRect(-12, -10, 24, 20);

  ctx.fillStyle = suitColor;
  ctx.fillRect(-8, -8, 16, 16);

  // 4. Cybernetic Arm (Left / Right Plasma)
  const armCol = customization.visorColor || '#00f3ff';
  ctx.fillStyle = armCol;
  ctx.fillRect(8, -6, 6, 12);

  // 5. Visor / Helmet (Glowing Cyan)
  ctx.fillStyle = customization.visorColor || '#00f3ff';
  ctx.fillRect(4, -4, 4, 8);

  // 6. Hair
  ctx.fillStyle = customization.hairColor || '#ffffff';
  ctx.fillRect(-10, -5, 6, 10);

  // 7. Weapon Rendering
  const bladeCol = customization.bladeColor || '#00f3ff';
  ctx.fillStyle = bladeCol;
  if (isAttacking) {
    // Extended Blade Swing
    ctx.fillRect(10, -4, 32, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, -2, 24, 4);
  } else {
    // Idle Sheathed / Hand Blade
    ctx.fillRect(6, -2, 18, 4);
  }

  ctx.restore();

  // 8. Overhead Level / Name Tag
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Thirty3', x, y - radius - 8);
  ctx.textAlign = 'left';
}

/**
 * Ultra-Optimized 3D Cyber Soldier (Enemies)
 */
export function draw3DCyberSoldier(
  ctx: CanvasRenderingContext2D,
  soldier: CombatEntity,
  isTargeted: boolean = false,
  _time: number = Date.now()
) {
  const angle = soldier.facingAngle !== undefined ? soldier.facingAngle : Math.atan2(0, 0);
  const col = soldier.color || '#ff0055';

  // 1. Shadow
  drawEntityShadow(ctx, soldier.x, soldier.y, soldier.radius);

  // 2. Target Reticle
  if (isTargeted) {
    ctx.strokeStyle = '#ff0044';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(soldier.x - soldier.radius - 3, soldier.y - soldier.radius - 3, (soldier.radius + 3) * 2, (soldier.radius + 3) * 2);
  }

  ctx.save();
  ctx.translate(soldier.x, soldier.y);
  ctx.rotate(angle);

  // 3. Body
  ctx.fillStyle = soldier.isBoss ? '#0f172a' : '#1e293b';
  const size = soldier.radius * 0.9;
  ctx.fillRect(-size, -size, size * 2, size * 2);

  // Accent Core
  ctx.fillStyle = col;
  ctx.fillRect(-2, -2, 4, 4);

  // Weapon Muzzle
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(size, -2, 8, 4);
  ctx.fillStyle = col;
  ctx.fillRect(size + 6, -1.5, 3, 3);

  // Helmet / Visor
  ctx.fillStyle = col;
  ctx.fillRect(size * 0.3, -3, 3, 6);

  ctx.restore();

  // 4. Overhead HP Bar (Fast flat render)
  if (!soldier.isBoss) {
    const hpPct = Math.max(0, soldier.hp / soldier.maxHp);
    const barW = soldier.radius * 2;
    const barH = 3;
    const barY = soldier.y - soldier.radius - 10;

    ctx.fillStyle = '#00000088';
    ctx.fillRect(soldier.x - barW / 2, barY, barW, barH);
    ctx.fillStyle = hpPct > 0.5 ? '#00ff41' : hpPct > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(soldier.x - barW / 2, barY, barW * hpPct, barH);
  }
}

/**
 * Ultra-Optimized Companion Drone
 */
export function draw3DCompanion(
  ctx: CanvasRenderingContext2D,
  companion: Companion,
  _time: number = Date.now()
) {
  const x = companion.x || 0;
  const y = companion.y || 0;
  const col = companion.avatarColor || '#00f3ff';

  drawEntityShadow(ctx, x, y, 10);

  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Weapon Skin Preview for UI
 */
export function drawWeaponSkinPreview(
  ctx: CanvasRenderingContext2D,
  skin: WeaponSkin,
  width: number,
  height: number,
  _time: number = Date.now()
) {
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;

  // Background
  ctx.fillStyle = '#080c14';
  ctx.fillRect(0, 0, width, height);

  // Blade
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 4);

  // Hilt
  ctx.fillStyle = '#334155';
  ctx.fillRect(-20, -3, 14, 6);

  // Crossguard
  ctx.fillStyle = skin.secondaryColor || '#ffffff';
  ctx.fillRect(-6, -8, 4, 16);

  // Blade Body
  ctx.fillStyle = skin.bladeColor;
  ctx.fillRect(-2, -3.5, 45, 7);

  ctx.restore();
}

