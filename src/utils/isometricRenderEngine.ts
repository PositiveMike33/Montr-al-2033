import { 
  AvatarCustomization, 
  CombatEntity, 
  Companion, 
  StageInfo, 
  EquipmentItem 
} from '../types';
import { getWeaponSkinById, WeaponSkin } from './weaponSkinsData';

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
 * Hyper-fast floor renderer with batch grid and Montreal asphalt roadways
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

  // 1. Dark Base Background
  ctx.fillStyle = stage.bgDark || '#050811';
  ctx.fillRect(camera.x - 50, camera.y - 50, viewW + 100, viewH + 100);

  // 2. Ultra-Fast Batch Grid (200px step for performance)
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

  // 3. Real Montreal Roadways (Sainte-Catherine / René-Lévesque crossroad)
  const roadY = 1200;
  const roadX = 1200;

  // Horizontal Road
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, roadY - 80, worldSize.width, 160);

  // Vertical Road
  ctx.fillRect(roadX - 80, 0, 160, worldSize.height);

  // Yellow Centerline
  ctx.strokeStyle = '#eab30866';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, roadY);
  ctx.lineTo(worldSize.width, roadY);
  ctx.moveTo(roadX, 0);
  ctx.lineTo(roadX, worldSize.height);
  ctx.stroke();

  // 4. Street Signs & Montreal Metro Badge
  const streetName = stage.id === 1 ? 'RUE SAINTE-CATHERINE'
    : stage.id === 2 ? 'BOUL. RENÉ-LÉVESQUE'
    : stage.id === 3 ? 'BOUL. SAINT-LAURENT'
    : 'AV. DU MONT-ROYAL';

  const metroStation = stage.id === 1 ? 'MÉTRO PLACE-DES-ARTS'
    : stage.id === 2 ? 'MÉTRO MCGILL'
    : stage.id === 3 ? 'MÉTRO SAINT-LAURENT'
    : 'MÉTRO MONT-ROYAL';

  // Only render signs if within camera view
  if (Math.abs(camera.x + viewW/2 - roadX) < viewW && Math.abs(camera.y + viewH/2 - roadY) < viewH) {
    // Green Street Sign
    ctx.fillStyle = '#065f46';
    ctx.fillRect(roadX + 90, roadY - 95, 140, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(streetName, roadX + 95, roadY - 81);

    // STM Metro Sign
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(roadX - 220, roadY - 95, 140, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Ⓜ️ ${metroStation}`, roadX - 215, roadY - 81);
  }

  // 5. World Bounds
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
  _equippedWeapon?: EquipmentItem,
  time: number = Date.now(),
  moveVelocity: { vx: number; vy: number } = { vx: 0, vy: 0 }
) {
  const isMoving = (moveVelocity.vx * moveVelocity.vx + moveVelocity.vy * moveVelocity.vy) > 0.25;
  const walkBob = isMoving ? Math.sin(time * 0.015) * 2 : 0;

  const skinTone = customization.skinTone || '#f5d0b5';
  const hairColor = customization.hairColor || '#00f3ff';
  const visorColor = customization.visorColor || '#00f3ff';
  const suitColor = customization.suitColor || '#111827';
  const bladeColor = customization.bladeColor || '#00f3ff';

  // 1. Ground Shadow
  drawEntityShadow(ctx, player.x, player.y, player.radius);

  // 2. Dash trails (Limit to max 2)
  if (player.trail.length > 0) {
    ctx.fillStyle = `${bladeColor}44`;
    const t = player.trail[player.trail.length - 1];
    ctx.beginPath();
    ctx.arc(t.x, t.y, player.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(player.x, player.y + walkBob);
  ctx.rotate(player.angle);

  // 3. Torso & Trenchcoat
  ctx.fillStyle = suitColor;
  ctx.fillRect(-8, -6, 16, 12);

  // Coat tails
  ctx.fillStyle = '#0a0d14';
  ctx.beginPath();
  ctx.moveTo(-8, -5);
  ctx.lineTo(-18, -7);
  ctx.lineTo(-18, 7);
  ctx.lineTo(-8, 5);
  ctx.closePath();
  ctx.fill();

  // 4. Head & Cyber-Visor
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(2, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = hairColor;
  ctx.fillRect(-4, -6, 6, 12);

  // Visor
  ctx.fillStyle = visorColor;
  ctx.fillRect(4, -3, 3, 6);

  // 5. Cyber-Blade Weapon
  const weaponSkin = getWeaponSkinById(customization.activeWeaponSkinId);
  const skinBladeColor = weaponSkin ? weaponSkin.bladeColor : bladeColor;

  ctx.save();
  ctx.translate(6, 6);
  if (player.isAttacking) {
    ctx.rotate(Math.sin(time * 0.03) * 0.6);
  }
  // Hilt
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, -1.5, 4, 3);
  // Blade
  ctx.fillStyle = skinBladeColor;
  ctx.fillRect(4, -1, 20, 2);

  if (player.isAttacking) {
    // Attack Arc
    ctx.strokeStyle = skinBladeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 24, -0.6, 0.6);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
}

/**
 * Ultra-Optimized Cyber Soldier
 */
export function draw3DCyberSoldier(
  ctx: CanvasRenderingContext2D,
  soldier: CombatEntity,
  _time: number = Date.now(),
  isTargeted: boolean = false,
  playerPos: { x: number; y: number } = { x: 0, y: 0 }
) {
  const angle = soldier.facingAngle !== undefined 
    ? soldier.facingAngle 
    : Math.atan2(playerPos.y - soldier.y, playerPos.x - soldier.x);

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
