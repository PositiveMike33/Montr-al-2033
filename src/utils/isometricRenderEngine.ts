import { 
  AvatarCustomization, 
  CombatEntity, 
  Companion, 
  StageInfo, 
  EquipmentItem 
} from '../types';
import { getWeaponSkinById, WeaponSkin } from './weaponSkinsData';

// ============================================================================
// ISOMETRIC 2.5D DIABLO-STYLE RENDER ENGINE
// Montréal 2033: Neural Overload
// ============================================================================

export interface IsometricPoint {
  x: number;
  y: number;
}

/**
 * Converts standard 2D world coordinates to 2.5D Diablo-style isometric coordinates
 */
export function worldToIso(x: number, y: number): IsometricPoint {
  return {
    x: (x - y) * 0.866,
    y: (x + y) * 0.5
  };
}

/**
 * Draws the Diablo-style isometric floor with cyberpunk neon conduits, metal grid plates and puddles
 */
export function drawDiabloIsometricFloor(
  ctx: CanvasRenderingContext2D,
  stage: StageInfo,
  camera: { x: number; y: number },
  worldSize: { width: number; height: number },
  time: number
) {
  const tileSize = 80;
  const startX = Math.floor((camera.x - 200) / tileSize) * tileSize;
  const startY = Math.floor((camera.y - 200) / tileSize) * tileSize;
  const endX = camera.x + window.innerWidth + 300;
  const endY = camera.y + window.innerHeight + 300;

  // Base background fill
  ctx.fillStyle = stage.bgDark || '#040914';
  ctx.fillRect(camera.x - 100, camera.y - 100, window.innerWidth + 200, window.innerHeight + 200);

  // Isometric Diamond Tiles Grid
  for (let x = startX; x < endX; x += tileSize) {
    for (let y = startY; y < endY; y += tileSize) {
      // Deterministic tile variation
      const tileHash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      
      // Tile background
      ctx.fillStyle = tileHash > 0.7 
        ? `${stage.bgDark}ee` 
        : tileHash > 0.4 
          ? '#081020' 
          : '#0a1426';
      
      ctx.beginPath();
      ctx.moveTo(x + tileSize / 2, y);
      ctx.lineTo(x + tileSize, y + tileSize / 2);
      ctx.lineTo(x + tileSize / 2, y + tileSize);
      ctx.lineTo(x, y + tileSize / 2);
      ctx.closePath();
      ctx.fill();

      // Border lines
      ctx.strokeStyle = stage.gridColor || 'rgba(0, 243, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // High-tech circuit conduit lines on specific tiles
      if (tileHash > 0.8) {
        ctx.strokeStyle = `${stage.accentColor}25`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + tileSize * 0.3, y + tileSize * 0.5);
        ctx.lineTo(x + tileSize * 0.7, y + tileSize * 0.5);
        ctx.stroke();

        // Pulsing node
        const pulse = (Math.sin(time * 0.003 + x + y) + 1) * 0.5;
        ctx.fillStyle = `${stage.accentColor}${Math.floor(pulse * 150 + 50).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(x + tileSize * 0.5, y + tileSize * 0.5, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cyber puddle with reflection
      if (tileHash < 0.08) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 200, 255, 0.07)';
        ctx.strokeStyle = `${stage.accentColor}44`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(x + tileSize * 0.5, y + tileSize * 0.5, tileSize * 0.35, tileSize * 0.18, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // SIMULATION RÉELLE DES RUES DE MONTRÉAL (ASPHALTE, SIGNAUX, STM)
  // ══════════════════════════════════════════════════════════════
  const streetName = stage.id === 1 ? 'RUE SAINTE-CATHERINE OUEST'
    : stage.id === 2 ? 'BOULEVARD RENÉ-LÉVESQUE'
    : stage.id === 3 ? 'BOULEVARD SAINT-LAURENT'
    : 'AVENUE DU MONT-ROYAL';

  const metroStation = stage.id === 1 ? 'MÉTRO PLACE-DES-ARTS'
    : stage.id === 2 ? 'MÉTRO MCGILL / BONAVENTURE'
    : stage.id === 3 ? 'MÉTRO SAINT-LAURENT'
    : 'MÉTRO MONT-ROYAL';

  const gpsCoords = stage.id === 1 ? '45.5088° N, 73.5685° W'
    : stage.id === 2 ? '45.5009° N, 73.5684° W'
    : stage.id === 3 ? '45.5225° N, 73.5872° W'
    : '45.5050° N, 73.5875° W';

  // Major Montreal Main Avenue Asphalt Strip (Horizontal & Vertical Real Road Grid)
  const roadY = 1200;
  const roadX = 1200;

  // Horizontal Road (East-West Boulevard)
  ctx.save();
  ctx.fillStyle = '#060a12';
  ctx.fillRect(0, roadY - 90, worldSize.width, 180);
  
  // Road Yellow Centerline & Dashes
  ctx.strokeStyle = '#eab30866';
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(0, roadY);
  ctx.lineTo(worldSize.width, roadY);
  ctx.stroke();

  // Vertical Road (North-South Avenue)
  ctx.fillRect(roadX - 90, 0, 180, worldSize.height);
  ctx.beginPath();
  ctx.moveTo(roadX, 0);
  ctx.lineTo(roadX, worldSize.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Pedestrian Crosswalks (Passages piétons montréalais zébrés blancs)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let c = -70; c <= 70; c += 18) {
    // North crosswalk
    ctx.fillRect(roadX + c, roadY - 105, 12, 22);
    // South crosswalk
    ctx.fillRect(roadX + c, roadY + 85, 12, 22);
    // West crosswalk
    ctx.fillRect(roadX - 105, roadY + c, 22, 12);
    // East crosswalk
    ctx.fillRect(roadX + 85, roadY + c, 22, 12);
  }

  // Iconic Montreal Orange Construction Cones (Cônes Orange de Montréal)
  const coneLocations = [
    { x: roadX - 120, y: roadY - 110 },
    { x: roadX + 130, y: roadY - 110 },
    { x: roadX - 120, y: roadY + 120 },
    { x: roadX + 130, y: roadY + 120 },
    { x: roadX + 450, y: roadY - 80 },
    { x: roadX - 450, y: roadY + 80 }
  ];

  coneLocations.forEach(cone => {
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(cone.x, cone.y + 6, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cone body (Orange)
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(cone.x - 7, cone.y + 6);
    ctx.lineTo(cone.x + 7, cone.y + 6);
    ctx.lineTo(cone.x, cone.y - 14);
    ctx.closePath();
    ctx.fill();
    // White reflective stripes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cone.x - 4, cone.y - 4, 8, 3);
    ctx.fillRect(cone.x - 2, cone.y - 9, 4, 2);
    ctx.restore();
  });

  // Authentic Montreal Street Sign Plaque (Panneau de Rue Vert/Bleu de Montréal)
  const streetSignX = roadX + 115;
  const streetSignY = roadY - 115;
  ctx.fillStyle = '#065f46'; // Montreal street sign green
  ctx.fillRect(streetSignX - 6, streetSignY - 18, 175, 24);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(streetSignX - 6, streetSignY - 18, 175, 24);
  ctx.font = 'bold 9px Orbitron, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(streetName, streetSignX, streetSignY - 3);

  // STM Metro Station Entrance Pillar
  const metroX = roadX - 180;
  const metroY = roadY - 120;
  ctx.fillStyle = '#0284c7'; // STM blue
  ctx.fillRect(metroX - 4, metroY - 20, 160, 26);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(metroX - 4, metroY - 20, 160, 26);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px Orbitron, sans-serif';
  ctx.fillText(`Ⓜ️ ${metroStation}`, metroX + 2, metroY - 4);

  // Google Maps Style Live GPS Coordinates & Radar Decal
  ctx.font = '8px monospace';
  ctx.fillStyle = '#00f3ff88';
  ctx.fillText(`📡 GOOGLE MAPS GPS : ${gpsCoords} // MONTRÉAL 2033`, roadX - 170, roadY + 115);
  ctx.restore();

  // World Boundary Borders (Glowing Cyber Wall)
  ctx.save();
  ctx.strokeStyle = stage.accentColor;
  ctx.lineWidth = 4;
  ctx.shadowColor = stage.accentColor;
  ctx.shadowBlur = 20;
  ctx.strokeRect(0, 0, worldSize.width, worldSize.height);

  // Corner Beacons
  const corners = [
    [0, 0],
    [worldSize.width, 0],
    [worldSize.width, worldSize.height],
    [0, worldSize.height]
  ];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = stage.accentColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/**
 * Draws dynamic 3D isometric entity shadow
 */
export function drawEntityShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  heightOffset: number = 0
) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  // Flattened ellipse for 2.5D isometric ground contact
  ctx.ellipse(x, y + 10 + heightOffset, radius * 1.2, radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws the Protagonist from Head to Toe with full photo likeness traits,
 * Diablo-style isometric proportions, tactical outfit, glowing cyberware and weapon swings.
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
  time: number = Date.now(),
  moveVelocity: { vx: number; vy: number } = { vx: 0, vy: 0 }
) {
  const isMoving = Math.hypot(moveVelocity.vx, moveVelocity.vy) > 0.5;
  const walkSpeed = Math.hypot(moveVelocity.vx, moveVelocity.vy);
  const walkCycle = isMoving ? (time * 0.012 * Math.max(1, walkSpeed * 0.5)) : 0;
  const legOffsetLeft = Math.sin(walkCycle) * 7;
  const legOffsetRight = Math.sin(walkCycle + Math.PI) * 7;
  const torsoBob = isMoving ? Math.abs(Math.sin(walkCycle * 2)) * 2 : Math.sin(time * 0.003) * 1;

  // Colors & Configuration
  const skinTone = customization.skinTone || '#f5d0b5';
  const hairColor = customization.hairColor || '#00f3ff';
  const visorColor = customization.visorColor || '#00f3ff';
  const suitColor = customization.suitColor || '#111827';
  const bladeColor = customization.bladeColor || '#00f3ff';
  const auraColor = customization.auraColor || '#00f3ff';
  const outerwear = customization.outerwear || 'neo_trenchcoat';
  const hairstyle = customization.hairstyle || 'slick_back';
  const beardStyle = customization.beardStyle || 'stubble';
  const cyberArm = customization.cyberArm || 'left_chrome';

  // 1. Draw Ground Shadow
  drawEntityShadow(ctx, player.x, player.y, player.radius + 4, torsoBob * 0.5);

  // 2. Dash / Bullet-time Trail Shadows
  player.trail.forEach((t) => {
    ctx.save();
    ctx.globalAlpha = t.alpha * 0.45;
    ctx.fillStyle = t.color;
    ctx.beginPath();
    ctx.ellipse(t.x, t.y, player.radius * 1.1, player.radius * 0.9, player.angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  ctx.save();
  ctx.translate(player.x, player.y - torsoBob);

  // 3. Psychic Aura Halo (Back Glow)
  ctx.save();
  const auraPulse = (Math.sin(time * 0.006) + 1) * 0.5;
  ctx.shadowColor = auraColor;
  ctx.shadowBlur = 20 + auraPulse * 12;
  ctx.strokeStyle = `${auraColor}44`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, player.radius * 1.5, player.radius * 1.1, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Rotate to facing angle
  ctx.rotate(player.angle);

  // =========================================================================
  // HEAD-TO-TOE ANATOMICAL ISOMETRIC RENDERING
  // =========================================================================

  // A. BILLOWING TRENCHCOAT / CAPE TAILS (Drawn below legs/torso)
  if (outerwear === 'neo_trenchcoat' || outerwear === 'corp_duster') {
    ctx.save();
    const coatFlutter = isMoving ? Math.sin(time * 0.015) * 4 : Math.sin(time * 0.003) * 2;
    ctx.fillStyle = '#0a0d14';
    ctx.strokeStyle = `${auraColor}55`;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(-24 - (isMoving ? 8 : 2), -10 + coatFlutter);
    ctx.lineTo(-26 - (isMoving ? 10 : 3), 0);
    ctx.lineTo(-24 - (isMoving ? 8 : 2), 10 - coatFlutter);
    ctx.lineTo(-10, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Trenchcoat Neon Trim
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-24 - (isMoving ? 8 : 2), -10 + coatFlutter);
    ctx.lineTo(-26 - (isMoving ? 10 : 3), 0);
    ctx.lineTo(-24 - (isMoving ? 8 : 2), 10 - coatFlutter);
    ctx.stroke();
    ctx.restore();
  }

  // B. LEGS & TACTICAL COMBAT BOOTS (Feet to Hips)
  // Left Leg & Boot
  ctx.save();
  ctx.translate(legOffsetLeft, -7);
  // Cargo pants thigh
  ctx.fillStyle = suitColor;
  ctx.fillRect(-6, -3, 12, 6);
  // Knee armor plate
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, -3.5, 6, 7);
  // Combat Jump Boot
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(4, -4, 8, 8);
  // Boot sole energy tread
  ctx.fillStyle = visorColor;
  ctx.fillRect(6, -4, 2, 8);
  ctx.restore();

  // Right Leg & Boot
  ctx.save();
  ctx.translate(legOffsetRight, 7);
  // Cargo pants thigh
  ctx.fillStyle = suitColor;
  ctx.fillRect(-6, -3, 12, 6);
  // Knee armor plate
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, -3.5, 6, 7);
  // Combat Jump Boot
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(4, -4, 8, 8);
  // Boot sole energy tread
  ctx.fillStyle = visorColor;
  ctx.fillRect(6, -4, 2, 8);
  ctx.restore();

  // C. TORSO & TACTICAL EXO-CHESTPLATE
  ctx.save();
  // Base torso body
  ctx.fillStyle = suitColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Carbon composite armor plate (3D Shading)
  ctx.fillStyle = '#1f2937';
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-8, -7, 16, 14, 4);
  ctx.fill();
  ctx.stroke();

  // Pulsing Synaptic Arc Core (Center Chest)
  const corePulse = (Math.sin(time * 0.008) + 1) * 0.5;
  ctx.fillStyle = auraColor;
  ctx.shadowColor = auraColor;
  ctx.shadowBlur = 12 + corePulse * 8;
  ctx.beginPath();
  ctx.arc(1, 0, 3 + corePulse * 1, 0, Math.PI * 2);
  ctx.fill();

  // Neural harness straps & ammo pouches
  ctx.fillStyle = '#111827';
  ctx.fillRect(-6, -8, 3, 16);
  ctx.fillRect(2, -8, 3, 16);
  ctx.restore();

  // D. ARMS & WEAPONS
  // 1. Left Arm (Bionic Chrome / Neural Gauntlet)
  ctx.save();
  ctx.translate(3, -11);
  if (cyberArm === 'left_chrome' || cyberArm === 'dual_bionic') {
    // Chrome metallic plating
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(0, -3, 11, 6, 2);
    ctx.fill();
    ctx.stroke();

    // Neon wiring relay
    ctx.strokeStyle = visorColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(1, 0);
    ctx.lineTo(9, 0);
    ctx.stroke();
  } else {
    // Human tactical sleeve
    ctx.fillStyle = suitColor;
    ctx.fillRect(0, -3, 10, 6);
  }
  // Left Hand / Psi-Gauntlet
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(10, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Right Arm & Equipped Weapon / Cyber-Blade
  ctx.save();
  const attackSwingAngle = player.isAttacking 
    ? Math.sin((time * 0.03) + player.comboStep) * 0.8 
    : 0;
  ctx.translate(3, 11);
  ctx.rotate(attackSwingAngle);

  // Arm
  if (cyberArm === 'right_plasma' || cyberArm === 'dual_bionic') {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, -3, 11, 6);
    ctx.fillStyle = bladeColor;
    ctx.fillRect(2, -1, 7, 2);
  } else {
    ctx.fillStyle = suitColor;
    ctx.fillRect(0, -3, 10, 6);
  }

  // Hand Grip
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(10, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // WEAPON SKIN & BLADE RENDERING
  const weaponSkin = getWeaponSkinById(customization.activeWeaponSkinId);
  const skinBladeColor = weaponSkin ? weaponSkin.bladeColor : bladeColor;
  const skinTrailColor = weaponSkin ? weaponSkin.trailColor : bladeColor;
  const bladeStyle = weaponSkin ? weaponSkin.bladeStyle : 'katana';

  ctx.save();
  ctx.translate(11, 0);
  ctx.shadowColor = skinBladeColor;
  ctx.shadowBlur = weaponSkin ? weaponSkin.glowIntensity : 18;

  // Custom Hilt / Guard
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, -1.5, 6, 3);
  ctx.fillStyle = weaponSkin.secondaryColor || '#475569';
  ctx.fillRect(5, -4, 2, 8);

  // Blade geometry per style
  let bladeLength = 26;
  if (bladeStyle === 'plasma_cleaver') bladeLength = 24;
  else if (bladeStyle === 'void_reaper') bladeLength = 28;
  else if (bladeStyle === 'prismatic_god') bladeLength = 30;
  else if (bladeStyle === 'obsidian_stealth') bladeLength = 20;

  if (bladeStyle === 'plasma_cleaver') {
    // Heavy wide rectangular energy cleaver
    ctx.fillStyle = skinBladeColor;
    ctx.fillRect(6, -3.5, bladeLength, 7);
    ctx.strokeStyle = weaponSkin.secondaryColor || '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, -3.5, bladeLength, 7);
  } else if (bladeStyle === 'void_reaper') {
    // Curved scythe serrated blade
    ctx.strokeStyle = skinBladeColor;
    ctx.lineWidth = player.isAttacking ? 6 : 4;
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.quadraticCurveTo(18, -6, 6 + bladeLength, -2);
    ctx.stroke();

    // Void Core Pulse
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(14, -2, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (bladeStyle === 'matrix_glitch') {
    // Stepped digital binary sword
    ctx.strokeStyle = skinBladeColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(6 + bladeLength, 0);
    ctx.stroke();

    // Glitch digital notches
    ctx.fillStyle = '#ffffff';
    const glitchOffset = Math.sin(time * 0.05) * 2;
    ctx.fillRect(12 + glitchOffset, -3, 3, 2);
    ctx.fillRect(20 - glitchOffset, 1, 3, 2);
  } else if (bladeStyle === 'solar_flare') {
    // Flaming thermite blade
    const flameWiggle = Math.sin(time * 0.04) * 2;
    ctx.fillStyle = skinBladeColor;
    ctx.beginPath();
    ctx.moveTo(6, -2);
    ctx.lineTo(6 + bladeLength, 0 + flameWiggle);
    ctx.lineTo(6, 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fff066';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (bladeStyle === 'cryo_saber') {
    // Crystal Frost Rapier
    ctx.strokeStyle = skinBladeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(6 + bladeLength, 0);
    ctx.stroke();

    // Frost crystals
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, -2, 3, 4);
    ctx.fillRect(18, -2, 3, 4);
  } else if (bladeStyle === 'prismatic_god') {
    // Chroma Rainbow Overclock
    const hue = (time * 0.1) % 360;
    const chromaColor = `hsl(${hue}, 100%, 65%)`;
    ctx.strokeStyle = chromaColor;
    ctx.shadowColor = chromaColor;
    ctx.lineWidth = player.isAttacking ? 6 : 4.5;
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(6 + bladeLength, 0);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (bladeStyle === 'obsidian_stealth') {
    // Matte carbon dagger with gold edge
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(6, -2, bladeLength, 4);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(6, -2, bladeLength, 4);
  } else {
    // Standard Katana / Thunder Arc
    const gradient = ctx.createLinearGradient(6, 0, 6 + bladeLength, 0);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, skinBladeColor);
    gradient.addColorStop(1, `${skinBladeColor}00`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = player.isAttacking ? 5 : 3.5;
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(6 + bladeLength, 0);
    ctx.stroke();

    // Plasma Edge Shimmer
    ctx.strokeStyle = weaponSkin.secondaryColor || '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(6, -0.5);
    ctx.lineTo(6 + bladeLength * 0.7, -0.5);
    ctx.stroke();
  }
  ctx.restore();

  // Attack Slash Visual Arc Trail with Skin Color
  if (player.isAttacking) {
    ctx.save();
    ctx.strokeStyle = skinTrailColor;
    ctx.lineWidth = 4.5;
    ctx.shadowColor = skinTrailColor;
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(0, 0, 32, -0.75, 0.75);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // E. HEAD, FACE, HAIRSTYLE & VISOR (The Likeness Core)
  ctx.save();
  ctx.translate(2, 0); // Head centered slightly forward

  // 1. Neck
  ctx.fillStyle = skinTone;
  ctx.fillRect(-3, -3, 6, 6);

  // 2. Head Silhouette & Skin
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  // Isometric angled head shape
  ctx.ellipse(0, 0, 8, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Facial Hair / Beard Style
  if (beardStyle !== 'clean') {
    ctx.fillStyle = '#222222';
    if (beardStyle === 'stubble') {
      ctx.fillStyle = 'rgba(20, 20, 20, 0.45)';
      ctx.beginPath();
      ctx.arc(3, 0, 5.5, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.fill();
    } else if (beardStyle === 'cyber_goatee') {
      ctx.fillRect(5, -2, 3, 4);
    } else if (beardStyle === 'tactical_beard') {
      ctx.beginPath();
      ctx.arc(2, 0, 7, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.fill();
    }
  }

  // 4. Eyes or Cyber-Visor
  ctx.save();
  ctx.fillStyle = visorColor;
  ctx.shadowColor = visorColor;
  ctx.shadowBlur = 10;
  // Sleek AR Visor Glasses (Neo / Cyberpunk Style)
  ctx.beginPath();
  ctx.roundRect(3, -4.5, 4, 9, 1.5);
  ctx.fill();

  // Center Visor Laser Specular Reflection
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(4.5, -2.5, 1.5, 5);
  ctx.restore();

  // 5. Hairstyle Rendering
  ctx.save();
  ctx.fillStyle = hairColor;
  if (hairstyle === 'slick_back') {
    // Sharp slicked back hair
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(2, -6);
    ctx.lineTo(0, -4);
    ctx.lineTo(-8, 0);
    ctx.lineTo(0, 4);
    ctx.lineTo(2, 6);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fill();
  } else if (hairstyle === 'cyber_fade' || hairstyle === 'undercut') {
    // Modern cyber fade with top volume
    ctx.beginPath();
    ctx.roundRect(-6, -5, 8, 10, 2);
    ctx.fill();
    // Shaved sides
    ctx.fillStyle = '#111827';
    ctx.fillRect(-4, -6.5, 6, 2);
    ctx.fillRect(-4, 4.5, 6, 2);
  } else if (hairstyle === 'neon_mohawk') {
    // High neon mohawk crest
    ctx.shadowColor = hairColor;
    ctx.shadowBlur = 12;
    ctx.fillRect(-7, -1.5, 12, 3);
  } else if (hairstyle === 'samurai_bun') {
    // Topknot samourai bun
    ctx.beginPath();
    ctx.ellipse(-2, 0, 6, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bun on back
    ctx.beginPath();
    ctx.arc(-8, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (hairstyle === 'buzzcut') {
    // Close military crop
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.ellipse(-1, 0, 7.5, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Long flowing hair
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.lineTo(2, -6);
    ctx.lineTo(-12, -4);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-12, 4);
    ctx.lineTo(2, 6);
    ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Ear Neural Jack Implant
  ctx.fillStyle = '#00f3ff';
  ctx.fillRect(-1, -6.5, 2, 1.5);
  ctx.fillRect(-1, 5, 2, 1.5);

  ctx.restore(); // Restore Head

  ctx.restore(); // Restore Player Transform

  // F. FLOATING HOLOGRAPHIC LIKENESS AVATAR BADGE (If Photo Uploaded)
  if (customization.photoUrl) {
    ctx.save();
    ctx.translate(player.x + 22, player.y - 30);

    // Floating Holo Disc Frame
    ctx.fillStyle = '#050506';
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Connecting Holo Ray to Player Head
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(-8, 8);
    ctx.lineTo(-20, 25);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scan line animation over badge
    const scanLineY = Math.sin(time * 0.005) * 10;
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, scanLineY);
    ctx.lineTo(8, scanLineY);
    ctx.stroke();

    ctx.restore();
  }
}

/**
 * Draws 3D Cyber Soldiers with distinct military archetypes,
 * 3D shaded armor plates, laser targeters, heavy firearms, and walk cycles.
 */
export function draw3DCyberSoldier(
  ctx: CanvasRenderingContext2D,
  soldier: CombatEntity,
  time: number = Date.now(),
  isTargeted: boolean = false,
  playerPos: { x: number; y: number } = { x: 0, y: 0 }
) {
  const angleToPlayer = Math.atan2(playerPos.y - soldier.y, playerPos.x - soldier.x);
  const facing = soldier.facingAngle !== undefined ? soldier.facingAngle : angleToPlayer;
  const walkCycle = soldier.speed > 0 ? (time * 0.01 + Number(soldier.id.slice(-4)) || 0) : 0;
  const stepL = Math.sin(walkCycle) * 6;
  const stepR = Math.sin(walkCycle + Math.PI) * 6;
  const soldierClass = soldier.soldierClass || (soldier.isBoss ? 'commandant_boss' : 'assault_trooper');

  // 1. Draw 3D Ground Shadow
  drawEntityShadow(ctx, soldier.x, soldier.y, soldier.radius * 1.15, 0);

  ctx.save();
  ctx.translate(soldier.x, soldier.y);

  // Stun or EMP glitch overlay
  if (soldier.stunTimer && soldier.stunTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, soldier.radius + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Diablo-Style Target Highlight
  if (isTargeted) {
    ctx.save();
    ctx.strokeStyle = '#ff0044';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff0044';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(0, 8, soldier.radius * 1.3, soldier.radius * 0.65, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Rotate to facing angle
  ctx.rotate(facing);

  // =========================================================================
  // 3D CYBER SOLDIER ARCHETYPE RENDERING
  // =========================================================================

  if (soldierClass === 'assault_trooper') {
    // -----------------------------------------------------------------------
    // 1. SOLDAT CYBER FUSILIER (Composite Ballistic Soldier + Plasma Carbine)
    // -----------------------------------------------------------------------
    // Legs & Armored Greaves
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(stepL - 4, -8, 8, 5);
    ctx.fillRect(stepR - 4, 3, 8, 5);
    // Soles
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(stepL + 4, -8, 3, 5);
    ctx.fillRect(stepR + 4, 3, 3, 5);

    // Torso (Composite Armor + Ammo Rig)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(-10, -8, 18, 16, 4);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Red Power Battery Core
    ctx.fillStyle = soldier.color || '#ff0055';
    ctx.shadowColor = soldier.color || '#ff0055';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Shoulder Pauldrons
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-4, -11, 8, 4);
    ctx.fillRect(-4, 7, 8, 4);

    // 3D Plasma Assault Rifle (Gun Barrel & Laser Sight)
    ctx.save();
    ctx.translate(6, 4);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, -2, 18, 4); // Gun chassis
    ctx.fillStyle = '#64748b';
    ctx.fillRect(4, -3, 6, 2); // Magazine
    // Muzzle & glowing barrel
    ctx.fillStyle = soldier.color || '#ff0055';
    ctx.fillRect(16, -1.5, 3, 3);
    ctx.restore();

    // Laser Sight Beam pointing toward player
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 80, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(24, 4);
    ctx.lineTo(160, 4);
    ctx.stroke();
    ctx.restore();

    // Ballistic Helmet & Red Cyber Visor
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();
    // Angular Visor Slit
    ctx.fillStyle = soldier.color || '#ff0055';
    ctx.shadowColor = soldier.color || '#ff0055';
    ctx.shadowBlur = 8;
    ctx.fillRect(3, -4, 3.5, 8);

  } else if (soldierClass === 'heavy_exo') {
    // -----------------------------------------------------------------------
    // 2. SOLDAT CYBER EXO-LOURD (Heavy Armored Shock Juggernaut + Rotary Cannon)
    // -----------------------------------------------------------------------
    // Heavy Exo-Legs with Hydraulic Pistons
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(stepL - 6, -12, 12, 7);
    ctx.fillRect(stepR - 6, 5, 12, 7);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(stepL, -11, 4, 5); // Steel piston
    ctx.fillRect(stepR, 6, 4, 5);

    // Massive Reinforced Torso Plate
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-14, -13, 26, 26, 6);
    ctx.fill();
    ctx.stroke();

    // Heavy Cooling Vents & Fans (Emits orange glow)
    ctx.fillStyle = '#f97316';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 12;
    ctx.fillRect(-12, -4, 4, 8);
    ctx.shadowBlur = 0;

    // Heavy Rotary Cannon on Right Arm
    ctx.save();
    ctx.translate(8, 10);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, -4, 22, 8);
    // 3 Rotating barrels
    const barrelRot = time * 0.02;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(16, -3 + Math.sin(barrelRot) * 2, 8, 2);
    ctx.fillRect(16, 1 + Math.cos(barrelRot) * 2, 8, 2);
    ctx.restore();

    // Energy Shield Projector on Left Arm
    ctx.save();
    ctx.translate(6, -11);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    // Shield Hologram Arc
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(6, 0, 16, -Math.PI * 0.35, Math.PI * 0.35);
    ctx.stroke();
    ctx.restore();

    // Reinforced Juggernaut Helmet
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    // Heavy Cross Visor
    ctx.fillStyle = '#f97316';
    ctx.fillRect(4, -3, 3, 6);
    ctx.fillRect(2, -1, 6, 2);

  } else if (soldierClass === 'stealth_ninja') {
    // -----------------------------------------------------------------------
    // 3. SOLDAT INFILTRATEUR CYBER-NINJA (Agile Dual-Blades + Optical Camo)
    // -----------------------------------------------------------------------
    // Sleek Nano-fiber body with optical shimmer
    const camoAlpha = 0.65 + Math.sin(time * 0.01) * 0.25;
    ctx.globalAlpha = camoAlpha;

    // Agile Legs
    ctx.fillStyle = '#020617';
    ctx.fillRect(stepL - 3, -6, 7, 4);
    ctx.fillRect(stepR - 3, 2, 7, 4);

    // Slim Torso
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dual Thermal Mantis Blades
    // Left Blade
    ctx.save();
    ctx.translate(4, -9);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, -4);
    ctx.stroke();
    ctx.restore();

    // Right Blade
    ctx.save();
    ctx.translate(4, 9);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, 4);
    ctx.stroke();
    ctx.restore();

    // Cyber-Mask Head
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(2, -2.5, 3, 5);

    ctx.globalAlpha = 1.0;

  } else if (soldierClass === 'cyber_sniper') {
    // -----------------------------------------------------------------------
    // 4. SOLDAT TIREUR D'ÉLITE CYBER (Anti-Materiel Railgun)
    // -----------------------------------------------------------------------
    // Camo Cloak
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.lineTo(6, -7);
    ctx.lineTo(6, 7);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();

    // Heavy Long Anti-Materiel Railgun
    ctx.save();
    ctx.translate(4, 3);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, -2, 28, 4);
    // Railgun Capacitors
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.fillRect(8, -3, 10, 1.5);
    ctx.fillRect(8, 1.5, 10, 1.5);
    ctx.restore();

    // Red Scope Recon Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(3, 1.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // -----------------------------------------------------------------------
    // 5. COMMANDANT CYBERNÉTIQUE BOSS (Titan Mech General of Montréal 2033)
    // -----------------------------------------------------------------------
    // Heavy Armored Biped Mecha Legs
    ctx.fillStyle = '#020617';
    ctx.fillRect(stepL - 8, -16, 18, 9);
    ctx.fillRect(stepR - 8, 7, 18, 9);

    // Command Holographic Cape
    ctx.save();
    ctx.fillStyle = 'rgba(255, 0, 80, 0.25)';
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-16, -14);
    ctx.lineTo(-32 + Math.sin(time * 0.005) * 4, -18);
    ctx.lineTo(-34, 0);
    ctx.lineTo(-32 + Math.sin(time * 0.005) * 4, 18);
    ctx.lineTo(-16, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Gigantic Boss Armored Torso Chassis
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = soldier.color || '#ff0055';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = soldier.color || '#ff0055';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(-18, -16, 36, 32, 8);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Dual Shoulder Rocket Pods
    ctx.fillStyle = '#334155';
    ctx.fillRect(-8, -22, 14, 7);
    ctx.fillRect(-8, 15, 14, 7);
    // Rocket Tubes
    ctx.fillStyle = '#ef4444';
    for (let r = 0; r < 3; r++) {
      ctx.fillRect(4, -21 + r * 2, 2, 1.5);
      ctx.fillRect(4, 16 + r * 2, 2, 1.5);
    }

    // Twin Heavy Plasma Broadswords / Cleavers
    ctx.save();
    ctx.strokeStyle = soldier.color || '#ff0055';
    ctx.lineWidth = 4;
    ctx.shadowColor = soldier.color || '#ff0055';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(12, -14);
    ctx.lineTo(36, -20);
    ctx.moveTo(12, 14);
    ctx.lineTo(36, 20);
    ctx.stroke();
    ctx.restore();

    // Commander Crown Helm
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = soldier.color || '#ff0055';
    ctx.shadowColor = soldier.color || '#ff0055';
    ctx.shadowBlur = 14;
    ctx.fillRect(4, -4, 4, 8);
  }

  ctx.restore(); // Restore soldier rotate

  // Overhead 3D Health Bar & Rank Badge (If not boss)
  if (!soldier.isBoss) {
    const hpPercent = Math.max(0, soldier.hp / soldier.maxHp);
    const barWidth = soldier.radius * 2.2;
    const barHeight = 4;
    const barY = -soldier.radius - 14;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

    // HP fill with gradient
    ctx.fillStyle = hpPercent > 0.5 ? '#00ff41' : hpPercent > 0.25 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(-barWidth / 2, barY, barWidth * hpPercent, barHeight);

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-barWidth / 2, barY, barWidth, barHeight);
  }

  ctx.restore();
}

/**
 * Draws AI Companions in 3D Isometric View
 */
export function draw3DCompanion(
  ctx: CanvasRenderingContext2D,
  companion: Companion,
  time: number = Date.now()
) {
  const x = companion.x || 0;
  const y = companion.y || 0;
  const angle = companion.angle || 0;
  const radius = 14;

  // 1. Shadow
  drawEntityShadow(ctx, x, y, radius, 0);

  ctx.save();
  ctx.translate(x, y);

  // Floating hover bob
  const hoverBob = Math.sin(time * 0.005 + (companion.name.charCodeAt(0) || 0)) * 3;
  ctx.translate(0, hoverBob);

  ctx.rotate(angle);

  // Aura
  ctx.shadowColor = companion.avatarColor;
  ctx.shadowBlur = 16;

  if (companion.role === 'tank') {
    // Heavy Hex Sentinel Drone
    ctx.fillStyle = companion.avatarColor;
    ctx.beginPath();
    ctx.rect(-radius, -radius, radius * 2, radius * 2);
    ctx.fill();

    // Kinetic Armor Plates
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-radius * 0.7, -radius * 0.7, radius * 1.4, radius * 1.4);

    // Glowing Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

  } else if (companion.role === 'offense') {
    // Sleek Sniper Dart Drone
    ctx.fillStyle = companion.avatarColor;
    ctx.beginPath();
    ctx.moveTo(radius * 1.6, 0);
    ctx.lineTo(-radius, -radius * 0.8);
    ctx.lineTo(-radius * 0.3, 0);
    ctx.lineTo(-radius, radius * 0.8);
    ctx.closePath();
    ctx.fill();

    // Twin Laser Emitters
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(radius * 0.8, -3, 4, 2);
    ctx.fillRect(radius * 0.8, 1, 4, 2);

  } else {
    // Support Healing Orb with Orbiting Rings
    ctx.fillStyle = companion.avatarColor;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting Plasma Ring
    ctx.save();
    ctx.rotate(time * 0.004);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.3, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws a dedicated 3D showcase preview of a Weapon Skin with rotating lighting & particles
 */
export function drawWeaponSkinPreview(
  ctx: CanvasRenderingContext2D,
  skin: WeaponSkin,
  width: number,
  height: number,
  time: number = Date.now()
) {
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;

  // Background radial energy glow
  const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, width * 0.55);
  grad.addColorStop(0, `${skin.bladeColor}33`);
  grad.addColorStop(0.5, `${skin.bladeColor}11`);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Background subtle grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const step = 20;
  for (let x = 0; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Floating animated particles
  const particleCount = 12;
  for (let i = 0; i < particleCount; i++) {
    const angle = (time * 0.001 + i * (Math.PI * 2 / particleCount)) % (Math.PI * 2);
    const dist = 35 + Math.sin(time * 0.003 + i) * 15;
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * (dist * 0.5);

    ctx.fillStyle = i % 2 === 0 ? skin.bladeColor : skin.secondaryColor;
    ctx.shadowColor = skin.bladeColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(px, py, 1.8 + Math.sin(time * 0.005 + i) * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(cx, cy);

  // Gentle hovering and 3D angle tilting
  const tiltAngle = -Math.PI / 4 + Math.sin(time * 0.002) * 0.12;
  const bobY = Math.sin(time * 0.003) * 4;
  ctx.translate(0, bobY);
  ctx.rotate(tiltAngle);

  // Blade scale
  const scale = 2.2;
  ctx.scale(scale, scale);

  ctx.shadowColor = skin.bladeColor;
  ctx.shadowBlur = skin.glowIntensity * 1.2;

  // 1. Pommel & Hilt
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-16, -2, 10, 4);

  // Pommel Cap
  ctx.fillStyle = skin.secondaryColor;
  ctx.fillRect(-18, -3, 3, 6);

  // 2. Crossguard
  ctx.fillStyle = '#334155';
  ctx.fillRect(-6, -6, 3, 12);
  ctx.fillStyle = skin.bladeColor;
  ctx.fillRect(-5, -4, 1.5, 8);

  // 3. Blade Body per style
  let bladeLength = 40;
  if (skin.bladeStyle === 'plasma_cleaver') bladeLength = 36;
  else if (skin.bladeStyle === 'prismatic_god') bladeLength = 44;
  else if (skin.bladeStyle === 'obsidian_stealth') bladeLength = 32;

  if (skin.bladeStyle === 'plasma_cleaver') {
    ctx.fillStyle = skin.bladeColor;
    ctx.fillRect(-3, -5, bladeLength, 10);
    ctx.strokeStyle = skin.secondaryColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-3, -5, bladeLength, 10);
  } else if (skin.bladeStyle === 'void_reaper') {
    ctx.strokeStyle = skin.bladeColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.quadraticCurveTo(18, -9, -3 + bladeLength, -3);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(15, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (skin.bladeStyle === 'matrix_glitch') {
    ctx.strokeStyle = skin.bladeColor;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(-3 + bladeLength, 0);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    const glitchOffset = Math.sin(time * 0.05) * 3;
    ctx.fillRect(8 + glitchOffset, -4, 4, 3);
    ctx.fillRect(22 - glitchOffset, 1, 4, 3);
  } else if (skin.bladeStyle === 'solar_flare') {
    ctx.fillStyle = skin.bladeColor;
    ctx.beginPath();
    ctx.moveTo(-3, -3);
    ctx.lineTo(-3 + bladeLength, 0 + Math.sin(time * 0.04) * 2);
    ctx.lineTo(-3, 3);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fff066';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (skin.bladeStyle === 'prismatic_god') {
    const hue = (time * 0.1) % 360;
    const chromaColor = `hsl(${hue}, 100%, 65%)`;
    ctx.strokeStyle = chromaColor;
    ctx.shadowColor = chromaColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(-3 + bladeLength, 0);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (skin.bladeStyle === 'obsidian_stealth') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-3, -3, bladeLength, 6);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-3, -3, bladeLength, 6);
  } else {
    // Katana / Cryo / Thunder
    const gradient = ctx.createLinearGradient(-3, 0, -3 + bladeLength, 0);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, skin.bladeColor);
    gradient.addColorStop(1, `${skin.bladeColor}22`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(-3 + bladeLength, 0);
    ctx.stroke();

    ctx.strokeStyle = skin.secondaryColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-3, -0.8);
    ctx.lineTo(-3 + bladeLength * 0.75, -0.8);
    ctx.stroke();
  }

  ctx.restore();
}
