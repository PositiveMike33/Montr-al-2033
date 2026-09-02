// ═══════════════════════════════════════════════════════════════════════════════
// PROCEDURAL DUNGEON RENDER ENGINE (MONTRÉAL 2033 & DIABLO IV DARK FANTASY)
// 60+ FPS Frustum-Culled Tile Renderer, Wall Shadows, Dynamic Torches,
// Chests, Shrines, Hazards, and Real-Time Minimap Radar Overlay
// ═══════════════════════════════════════════════════════════════════════════════

import { ProceduralLevel, TileType, STAGE_ARCHETYPES, ShrineData, ChestData, ProceduralHazard } from './proceduralLevelGenerator';
import { StageInfo } from '../types';

export function renderProceduralDungeonFloor(
  ctx: CanvasRenderingContext2D,
  level: ProceduralLevel,
  stage: StageInfo,
  camera: { x: number; y: number },
  viewport: { width: number; height: number },
  time: number
): void {
  const ts = level.tileSize;
  const stageMeta = STAGE_ARCHETYPES[level.stageId] || STAGE_ARCHETYPES[1];

  // Frustum Culling: Only render tiles inside current camera view + 2 tile buffer
  const startTileX = Math.max(0, Math.floor((camera.x - 80) / ts));
  const endTileX = Math.min(level.gridWidth - 1, Math.ceil((camera.x + viewport.width + 80) / ts));
  const startTileY = Math.max(0, Math.floor((camera.y - 80) / ts));
  const endTileY = Math.min(level.gridHeight - 1, Math.ceil((camera.y + viewport.height + 80) / ts));

  // 1. Draw Void / Abyss Background
  ctx.fillStyle = '#030712';
  ctx.fillRect(camera.x, camera.y, viewport.width, viewport.height);

  // 2. Batch Render Walkable Floors and Walls
  for (let gy = startTileY; gy <= endTileY; gy++) {
    for (let gx = startTileX; gx <= endTileX; gx++) {
      const idx = gy * level.gridWidth + gx;
      const tile = level.tiles[idx];
      const isExplored = level.fogOfWar[idx] === 1;
      const wx = gx * ts;
      const wy = gy * ts;

      if (!isExplored) {
        // Completely black / fog of war
        ctx.fillStyle = '#000000';
        ctx.fillRect(wx, wy, ts, ts);
        continue;
      }

      if (tile === TileType.WALL) {
        // Wall 2.5D Isometric block rendering
        ctx.fillStyle = stageMeta.wallColor;
        ctx.fillRect(wx, wy, ts, ts);

        // Wall top bevel
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(wx, wy, ts, 4);

        // Wall bottom shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(wx, wy + ts - 6, ts, 6);

        // Subtle tech grid outline on walls
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(wx, wy, ts, ts);
      } else {
        // Walkable Floor (Slight checkerboard nuance for tactile depth)
        const isAlt = (gx + gy) % 2 === 0;
        ctx.fillStyle = isAlt ? stageMeta.floorColor : '#0a101d';
        ctx.fillRect(wx, wy, ts, ts);

        // Tile grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 1;
        ctx.strokeRect(wx, wy, ts, ts);

        // Ambient cyber accents per archetype
        if (level.archetype === 'catacombs') {
          // Crypt Rune Tile
          if ((gx * 7 + gy * 13) % 29 === 0) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
            ctx.beginPath();
            ctx.arc(wx + ts/2, wy + ts/2, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (level.archetype === 'docks') {
          // Wet metal grating line
          if ((gx + gy) % 4 === 0) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
            ctx.fillRect(wx + 4, wy + 4, ts - 8, 2);
          }
        } else if (level.archetype === 'megastructure') {
          // Power circuit trace
          if ((gx * 3 + gy) % 8 === 0) {
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.18)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(wx, wy + ts/2);
            ctx.lineTo(wx + ts, wy + ts/2);
            ctx.stroke();
          }
        } else if (level.archetype === 'citadel') {
          // Crimson obsidian altar mosaic
          if ((gx * 5 + gy * 3) % 19 === 0) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.16)';
            ctx.fillRect(wx + ts/4, wy + ts/4, ts/2, ts/2);
          }
        }
      }
    }
  }

  // 3. Render Environmental Hazards
  for (const h of level.hazards) {
    if (Math.hypot(h.x - (camera.x + viewport.width/2), h.y - (camera.y + viewport.height/2)) < viewport.width) {
      const pulse = 1 + Math.sin(time * 4 + h.x) * 0.1;
      const grad = ctx.createRadialGradient(h.x, h.y, 5, h.x, h.y, h.radius * pulse);
      
      if (h.type === 'necrotic_slime') {
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
        grad.addColorStop(0.7, 'rgba(5, 150, 105, 0.25)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (h.type === 'deep_water_current') {
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
        grad.addColorStop(0.7, 'rgba(14, 116, 144, 0.25)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (h.type === 'laser_conduit') {
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.55)');
        grad.addColorStop(0.7, 'rgba(217, 119, 6, 0.3)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
        grad.addColorStop(0.7, 'rgba(185, 28, 28, 0.3)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius * pulse, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Render Interactive Shrines
  for (const s of level.shrines) {
    if (Math.hypot(s.x - (camera.x + viewport.width/2), s.y - (camera.y + viewport.height/2)) < viewport.width) {
      renderShrineObject(ctx, s, time);
    }
  }

  // 5. Render Interactive Chests
  for (const c of level.chests) {
    if (Math.hypot(c.x - (camera.x + viewport.width/2), c.y - (camera.y + viewport.height/2)) < viewport.width) {
      renderChestObject(ctx, c, time);
    }
  }

  // 6. Render Boss Gateway & Extraction Portals
  renderPortalObject(ctx, level.bossGatePoint.x, level.bossGatePoint.y, 'boss', time);
  renderPortalObject(ctx, level.exfilPoint.x, level.exfilPoint.y, 'exfil', time);
}

/**
 * Render an Interactive Shrine with Pulsing Rune Aura
 */
function renderShrineObject(ctx: CanvasRenderingContext2D, shrine: ShrineData, time: number): void {
  const { x, y, activated, type } = shrine;

  // Base Pedestal
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x - 18, y - 10, 36, 20);
  ctx.strokeStyle = activated ? '#64748b' : '#38bdf8';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 18, y - 10, 36, 20);

  // Pulsing Crystal / Monolith
  const floatY = Math.sin(time * 3 + x) * 4;
  const auraColor = 
    type === 'channeling' ? '#38bdf8' :
    type === 'conduit' ? '#a855f7' :
    type === 'frenzy' ? '#f59e0b' :
    type === 'protection' ? '#10b981' :
    type === 'greed' ? '#eab308' : '#ef4444';

  if (!activated) {
    // Outer Glow
    ctx.fillStyle = `${auraColor}33`;
    ctx.beginPath();
    ctx.arc(x, y - 12 + floatY, 24, 0, Math.PI * 2);
    ctx.fill();

    // Floating Crystal
    ctx.fillStyle = auraColor;
    ctx.beginPath();
    ctx.moveTo(x, y - 26 + floatY);
    ctx.lineTo(x + 10, y - 12 + floatY);
    ctx.lineTo(x, y + 2 + floatY);
    ctx.lineTo(x - 10, y - 12 + floatY);
    ctx.closePath();
    ctx.fill();

    // Text Label floating above
    ctx.font = 'bold 9px "Orbitron", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(shrine.name.slice(0, 24), x, y - 32 + floatY);
  } else {
    // Inactive / Drained Crystal
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x + 8, y - 8);
    ctx.lineTo(x, y);
    ctx.lineTo(x - 8, y - 8);
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Render an Interactive Chest Container
 */
function renderChestObject(ctx: CanvasRenderingContext2D, chest: ChestData, time: number): void {
  const { x, y, opened, guaranteedRarity, isCursed } = chest;

  const chestColor = 
    isCursed ? '#ef4444' :
    guaranteedRarity === 'legendary' ? '#f59e0b' :
    guaranteedRarity === 'epic' ? '#a855f7' :
    guaranteedRarity === 'rare' ? '#38bdf8' : '#94a3b8';

  // Chest Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(x, y + 6, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!opened) {
    // Glowing Aura
    const pulse = 1 + Math.sin(time * 5 + x) * 0.15;
    ctx.fillStyle = `${chestColor}22`;
    ctx.beginPath();
    ctx.arc(x, y, 20 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Chest Body
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 14, y - 8, 28, 16);
    ctx.strokeStyle = chestColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 14, y - 8, 28, 16);

    // Lock Core
    ctx.fillStyle = chestColor;
    ctx.fillRect(x - 3, y - 2, 6, 6);

    // Overhead Label
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = chestColor;
    ctx.textAlign = 'center';
    ctx.fillText(isCursed ? '☠️ MAUDIT' : chest.guaranteedRarity.toUpperCase(), x, y - 14);
  } else {
    // Open chest
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 14, y - 4, 28, 12);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 14, y - 4, 28, 12);
  }
}

/**
 * Render Boss Gate or Extraction Portal
 */
function renderPortalObject(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  type: 'boss' | 'exfil', 
  time: number
): void {
  const color = type === 'boss' ? '#ef4444' : '#00f3ff';
  const label = type === 'boss' ? '⚡ SANCTUAIRE DU BOSS' : '🚀 EXTRACTION // EXFIL';

  const rot = time * (type === 'boss' ? 2 : 1.5);
  const pulse = 1 + Math.sin(time * 4) * 0.1;

  // Outer Ring
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 26 * pulse, 0, Math.PI * 2);
  ctx.stroke();

  // Cross Runes
  ctx.beginPath();
  ctx.moveTo(-28, 0);
  ctx.lineTo(28, 0);
  ctx.moveTo(0, -28);
  ctx.lineTo(0, 28);
  ctx.strokeStyle = `${color}66`;
  ctx.stroke();

  ctx.restore();

  // Center Vortex
  const grad = ctx.createRadialGradient(x, y, 4, x, y, 22 * pulse);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, 22 * pulse, 0, Math.PI * 2);
  ctx.fill();

  // Overhead Label
  ctx.font = 'bold 10px "Orbitron", monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y - 36);
}

/**
 * Render Mini-Radar Overlay (Top Right HUD)
 */
export function renderProceduralMinimap(
  ctx: CanvasRenderingContext2D,
  level: ProceduralLevel,
  playerPos: { x: number; y: number },
  radarX: number,
  radarY: number,
  radarSize: number = 140
): void {
  ctx.save();

  // Radar Box
  ctx.fillStyle = 'rgba(5, 8, 17, 0.85)';
  ctx.fillRect(radarX, radarY, radarSize, radarSize);
  ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(radarX, radarY, radarSize, radarSize);

  // Header Title
  ctx.font = 'bold 8px "Orbitron", monospace';
  ctx.fillStyle = '#00f3ff';
  ctx.textAlign = 'left';
  ctx.fillText(`CARTE PROCÉDURALE #${level.seed}`, radarX + 6, radarY + 12);

  const scale = radarSize / (level.gridWidth * level.tileSize);

  // Render Explored Rooms & Corridors
  for (let gy = 0; gy < level.gridHeight; gy += 2) {
    for (let gx = 0; gx < level.gridWidth; gx += 2) {
      const idx = gy * level.gridWidth + gx;
      if (level.fogOfWar[idx] === 1) {
        const tile = level.tiles[idx];
        if (tile !== TileType.WALL) {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
          ctx.fillRect(
            radarX + gx * level.tileSize * scale,
            radarY + gy * level.tileSize * scale,
            2,
            2
          );
        }
      }
    }
  }

  // Draw Unopened Chests
  for (const c of level.chests) {
    if (!c.opened) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(radarX + c.x * scale - 2, radarY + c.y * scale - 2, 4, 4);
    }
  }

  // Draw Active Shrines
  for (const s of level.shrines) {
    if (!s.activated) {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(radarX + s.x * scale, radarY + s.y * scale, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw Boss Gate
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(
    radarX + level.bossGatePoint.x * scale - 3,
    radarY + level.bossGatePoint.y * scale - 3,
    6,
    6
  );

  // Draw Player Position
  ctx.fillStyle = '#00ff88';
  ctx.beginPath();
  ctx.arc(radarX + playerPos.x * scale, radarY + playerPos.y * scale, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
