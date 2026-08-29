import React, { useRef, useEffect } from 'react';
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
  EquipmentItem
} from '../types';
import { sound } from '../utils/audio';

interface GameCanvasProps {
  playerStats: PlayerStats;
  customization: AvatarCustomization;
  currentStage: StageInfo;
  difficultyTier: number;
  bulletTimeActive: boolean;
  onEnemyKilled: (enemy: CombatEntity) => void;
  onLootDropped: (loot: LootDrop) => void;
  onPlayerDamaged: (amount: number) => void;
  onPlayerHealed: (amount: number) => void;
  onBossStateChange: (bossHp: number | null, bossMaxHp: number | null, bossName: string | null) => void;
  // Trigger actions from hotkeys/HUD
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
  onEnemyKilled,
  onLootDropped,
  onPlayerDamaged,
  onPlayerHealed,
  onBossStateChange,
  triggerAction,
  onActionTriggered,
  isPaused,
  equippedWeapon
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    keys: { [key: string]: boolean };
    mouse: { x: number; y: number; isDown: boolean };
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
    keys: {},
    mouse: { x: 0, y: 0, isDown: false },
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
    hitFreezeTimer: 0
  });

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
      // Primary Melee Strike
      p.isAttacking = true;
      p.attackTimer = 12;
      p.comboStep = (p.comboStep + 1) % 3;
      p.angle = Math.atan2(dirY, dirX);
      sound.playSlash();

      // Melee area arc effect
      s.areaEffects.push({
        id: 'slash_' + Math.random(),
        x: p.x + ndx * 30,
        y: p.y + ndy * 30,
        radius: 45,
        maxRadius: 55,
        currentRadius: 10,
        duration: 8,
        maxDuration: 8,
        damagePerTick: playerStats.physicalDamage,
        color: customization.bladeColor,
        type: 'blade_slash'
      });

      // Spawn slash particles
      for (let i = 0; i < 8; i++) {
        s.particles.push({
          x: p.x + ndx * 35,
          y: p.y + ndy * 35,
          vx: (Math.random() - 0.5) * 4 + ndx * 3,
          vy: (Math.random() - 0.5) * 4 + ndy * 3,
          size: Math.random() * 3 + 2,
          color: customization.bladeColor,
          alpha: 1,
          life: 12,
          maxLife: 12
        });
      }
    } else if (triggerAction.type === 'lance') {
      // Synaptic Lance (Pierce Beam)
      sound.playPsiLance();
      const speed = 16;
      s.projectiles.push({
        id: 'lance_' + Math.random(),
        x: p.x,
        y: p.y,
        vx: ndx * speed,
        vy: ndy * speed,
        radius: 12,
        damage: playerStats.psiDamage * 2.2,
        color: customization.auraColor || '#00f0ff',
        isEnemy: false,
        life: 45,
        maxLife: 45,
        isPiercing: true,
        hitEntities: new Set()
      });
    } else if (triggerAction.type === 'emp') {
      // EMP Shockwave (AOE Stun)
      sound.playEmpExplosion();
      s.areaEffects.push({
        id: 'emp_' + Math.random(),
        x: p.x,
        y: p.y,
        radius: 180,
        maxRadius: 180,
        currentRadius: 20,
        duration: 18,
        maxDuration: 18,
        damagePerTick: playerStats.psiDamage * 1.5,
        color: '#00f0ff',
        type: 'emp_shockwave'
      });
    } else if (triggerAction.type === 'vortex') {
      // Psychic Black Hole
      sound.playVortex();
      s.areaEffects.push({
        id: 'vortex_' + Math.random(),
        x: mouseWorldX,
        y: mouseWorldY,
        radius: 130,
        maxRadius: 130,
        currentRadius: 130,
        duration: 120, // 2 seconds
        maxDuration: 120,
        damagePerTick: playerStats.psiDamage * 0.4,
        color: '#9d00ff',
        type: 'vortex',
        pullsEnemies: true
      });
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

    // Input listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = true;
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

    // Initial enemies spawn
    const spawnInitialEnemies = () => {
      const s = stateRef.current;
      s.enemies = [];
      s.bossSpawned = false;
      s.activeBoss = null;
      onBossStateChange(null, null, null);

      for (let i = 0; i < 14; i++) {
        spawnEnemy(s);
      }
    };

    const spawnEnemy = (s: typeof stateRef.current, forceBoss = false) => {
      const p = s.player;
      const angle = Math.random() * Math.PI * 2;
      const dist = forceBoss ? 450 : 350 + Math.random() * 350;
      const x = Math.max(50, Math.min(s.worldSize.width - 50, p.x + Math.cos(angle) * dist));
      const y = Math.max(50, Math.min(s.worldSize.height - 50, p.y + Math.sin(angle) * dist));

      const tierMult = 1 + (difficultyTier - 1) * 0.22;
      const baseEnemyHp = (60 + Math.random() * 40) * tierMult;

      if (forceBoss) {
        const bossHp = 1800 * currentStage.bossHpMultiplier * tierMult;
        const boss: CombatEntity = {
          id: 'boss_' + Math.random(),
          type: 'boss',
          name: currentStage.bossName,
          x,
          y,
          radius: 36,
          hp: bossHp,
          maxHp: bossHp,
          speed: 2.2,
          color: currentStage.accentColor,
          isBoss: true,
          bossPhase: 1,
          attackCooldown: 0,
          attackRange: 320,
          damage: 35 * tierMult,
          xpReward: 1200 * currentStage.id * tierMult,
          behavior: 'boss',
          spriteType: 'boss_mecha'
        };
        s.enemies.push(boss);
        s.activeBoss = boss;
        s.bossSpawned = true;
        onBossStateChange(boss.hp, boss.maxHp, boss.name);
        return;
      }

      const types = ['drone', 'enforcer', 'hacker', 'turret'] as const;
      const chosenType = types[Math.floor(Math.random() * types.length)];

      let enemy: CombatEntity;
      if (chosenType === 'drone') {
        enemy = {
          id: 'enemy_' + Math.random(),
          type: 'drone',
          name: 'Drone SPVM Recon',
          x,
          y,
          radius: 14,
          hp: baseEnemyHp * 0.8,
          maxHp: baseEnemyHp * 0.8,
          speed: 3.8,
          color: '#00f0ff',
          attackCooldown: 30,
          attackRange: 260,
          damage: 12 * tierMult,
          xpReward: 35 * tierMult,
          behavior: 'ranged',
          spriteType: 'drone'
        };
      } else if (chosenType === 'enforcer') {
        enemy = {
          id: 'enemy_' + Math.random(),
          type: 'enemy',
          name: 'Enforcer Cyber-Biométrique',
          x,
          y,
          radius: 19,
          hp: baseEnemyHp * 1.5,
          maxHp: baseEnemyHp * 1.5,
          speed: 2.8,
          color: '#ff007f',
          attackCooldown: 25,
          attackRange: 35,
          damage: 22 * tierMult,
          xpReward: 50 * tierMult,
          behavior: 'melee',
          spriteType: 'enforcer'
        };
      } else if (chosenType === 'hacker') {
        enemy = {
          id: 'enemy_' + Math.random(),
          type: 'enemy',
          name: 'Technomancien SPVM',
          x,
          y,
          radius: 16,
          hp: baseEnemyHp,
          maxHp: baseEnemyHp,
          speed: 2.4,
          color: '#39ff14',
          attackCooldown: 50,
          attackRange: 300,
          damage: 18 * tierMult,
          xpReward: 60 * tierMult,
          behavior: 'ranged',
          spriteType: 'hacker'
        };
      } else {
        enemy = {
          id: 'enemy_' + Math.random(),
          type: 'enemy',
          name: 'Tourelle Laser Pivotante',
          x,
          y,
          radius: 20,
          hp: baseEnemyHp * 1.8,
          maxHp: baseEnemyHp * 1.8,
          speed: 0,
          color: '#ffaa00',
          attackCooldown: 40,
          attackRange: 350,
          damage: 20 * tierMult,
          xpReward: 70 * tierMult,
          behavior: 'turret',
          spriteType: 'turret'
        };
      }

      s.enemies.push(enemy);
    };

    spawnInitialEnemies();

    // -------------------------------------------------------------
    // MAIN LOOP
    // -------------------------------------------------------------
    const updateAndRender = () => {
      const s = stateRef.current;
      const p = s.player;

      if (!isPaused) {
        // Time factor for Bullet-Time
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
          // Dash shadow trail
          p.trail.push({ x: p.x, y: p.y, alpha: 0.8, color: customization.auraColor });
        } else {
          const currentSpeed = playerStats.moveSpeed;
          p.vx = moveX * currentSpeed;
          p.vy = moveY * currentSpeed;
          p.x += p.vx;
          p.y += p.vy;

          if (bulletTimeActive) {
            p.trail.push({ x: p.x, y: p.y, alpha: 0.5, color: '#00f0ff' });
          }
        }

        // Clamp inside map boundaries
        p.x = Math.max(p.radius, Math.min(s.worldSize.width - p.radius, p.x));
        p.y = Math.max(p.radius, Math.min(s.worldSize.height - p.radius, p.y));

        // Fade player trail
        p.trail.forEach(t => t.alpha -= 0.05);
        p.trail = p.trail.filter(t => t.alpha > 0);

        // Update aim angle towards cursor
        const mouseWorldX = s.mouse.x + s.camera.x;
        const mouseWorldY = s.mouse.y + s.camera.y;
        p.angle = Math.atan2(mouseWorldY - p.y, mouseWorldX - p.x);

        // Attack cooldown timer
        if (p.attackTimer > 0) p.attackTimer--;
        else p.isAttacking = false;

        // Camera follow player smoothly
        s.camera.x = p.x - canvas.width / 2;
        s.camera.y = p.y - canvas.height / 2;
        s.camera.x = Math.max(0, Math.min(s.worldSize.width - canvas.width, s.camera.x));
        s.camera.y = Math.max(0, Math.min(s.worldSize.height - canvas.height, s.camera.y));

        // Spawn periodic enemies if below cap (max 22)
        s.lastSpawnTime++;
        if (s.enemies.length < 18 && s.lastSpawnTime > 60) {
          spawnEnemy(s);
          s.lastSpawnTime = 0;
        }

        // Spawn Boss when objective is reached (e.g. 25 kills)
        const requiredKills = currentStage.id * 15;
        if (s.killCounter >= requiredKills && !s.bossSpawned) {
          spawnEnemy(s, true);
        }

        // Update Projectiles
        for (let i = s.projectiles.length - 1; i >= 0; i--) {
          const proj = s.projectiles[i];
          const projSpeedScale = proj.isEnemy ? timeScale : 1.0;
          proj.x += proj.vx * projSpeedScale;
          proj.y += proj.vy * projSpeedScale;
          proj.life--;

          // Check collisions with Player
          if (proj.isEnemy) {
            const distToPlayer = Math.hypot(proj.x - p.x, proj.y - p.y);
            if (distToPlayer < proj.radius + p.radius && !p.iFrames) {
              // Player hit!
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
            // Player projectile vs enemies
            for (let j = s.enemies.length - 1; j >= 0; j--) {
              const en = s.enemies[j];
              if (proj.hitEntities?.has(en.id)) continue;

              const distToEn = Math.hypot(proj.x - en.x, proj.y - en.y);
              if (distToEn < proj.radius + en.radius) {
                // Enemy Hit
                proj.hitEntities?.add(en.id);
                const isCrit = Math.random() * 100 < playerStats.critChance;
                const finalDmg = isCrit 
                  ? Math.round(proj.damage * (playerStats.critDamage / 100))
                  : Math.round(proj.damage);

                en.hp -= finalDmg;
                if (isCrit) sound.playCritHit();
                else sound.playHit();

                s.floatingTexts.push({
                  id: 'txt_' + Math.random(),
                  text: isCrit ? `CRIT ${finalDmg}!` : `${finalDmg}`,
                  x: en.x + (Math.random() - 0.5) * 20,
                  y: en.y - 20,
                  color: isCrit ? '#f59e0b' : '#00f0ff',
                  size: isCrit ? 20 : 15,
                  life: 35,
                  maxLife: 35,
                  isCrit
                });

                // Spawn blood/sparks particles
                for (let k = 0; k < 6; k++) {
                  s.particles.push({
                    x: en.x,
                    y: en.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    size: Math.random() * 3 + 1,
                    color: en.color,
                    alpha: 1,
                    life: 15,
                    maxLife: 15
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

        // Update Area Effects (EMP, Vortex, Slashes)
        for (let i = s.areaEffects.length - 1; i >= 0; i--) {
          const aoe = s.areaEffects[i];
          aoe.duration--;

          if (aoe.type === 'blade_slash' || aoe.type === 'emp_shockwave') {
            aoe.currentRadius += (aoe.maxRadius - aoe.currentRadius) * 0.25;
          }

          // Damage ticks to enemies inside
          s.enemies.forEach(en => {
            const dist = Math.hypot(en.x - aoe.x, en.y - aoe.y);
            if (dist < aoe.currentRadius + en.radius) {
              // Apply pull if vortex
              if (aoe.pullsEnemies) {
                const angle = Math.atan2(aoe.y - en.y, aoe.x - en.x);
                en.x += Math.cos(angle) * 3.5;
                en.y += Math.sin(angle) * 3.5;
              }

              // Periodic tick
              if (aoe.duration % 10 === 0) {
                const dmg = Math.round(aoe.damagePerTick);
                en.hp -= dmg;
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

              // Stun if EMP
              if (aoe.type === 'emp_shockwave') {
                en.stunTimer = 60; // 1 second stun
              }
            }
          });

          if (aoe.duration <= 0) {
            s.areaEffects.splice(i, 1);
          }
        }

        // Update Enemies AI & Combat
        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const en = s.enemies[i];

          // Check if dead
          if (en.hp <= 0) {
            s.killCounter++;
            onEnemyKilled(en);

            // Trigger loot drop check
            const dropChance = 0.45 * (1 + 0.15 * difficultyTier);
            if (Math.random() < dropChance || en.isBoss) {
              onLootDropped({
                id: 'loot_' + Math.random(),
                x: en.x,
                y: en.y,
                item: null as any, // Generated in parent
                nanites: Math.round(25 * difficultyTier + Math.random() * 30),
                spawnTime: Date.now()
              });
            }

            // If boss died, notify
            if (en.isBoss) {
              s.activeBoss = null;
              onBossStateChange(null, null, null);
            }

            s.enemies.splice(i, 1);
            continue;
          }

          // Handle stuns
          if (en.stunTimer && en.stunTimer > 0) {
            en.stunTimer--;
            continue;
          }

          const distToPlayer = Math.hypot(p.x - en.x, p.y - en.y) || 1;
          const dirX = (p.x - en.x) / distToPlayer;
          const dirY = (p.y - en.y) / distToPlayer;

          // Enemy Movement & Attacks
          const currentSpeed = en.speed * timeScale;

          if (en.behavior === 'melee') {
            if (distToPlayer > en.attackRange) {
              en.x += dirX * currentSpeed;
              en.y += dirY * currentSpeed;
            } else {
              // Melee attack
              en.attackCooldown--;
              if (en.attackCooldown <= 0 && !p.iFrames) {
                en.attackCooldown = 35;
                const dmg = Math.max(1, Math.round(en.damage - playerStats.armor * 0.25));
                onPlayerDamaged(dmg);
                sound.playHit();
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
          } else if (en.behavior === 'ranged' || en.behavior === 'turret') {
            // Keep distance
            if (distToPlayer > en.attackRange) {
              en.x += dirX * currentSpeed;
              en.y += dirY * currentSpeed;
            } else if (distToPlayer < en.attackRange * 0.4 && en.behavior !== 'turret') {
              en.x -= dirX * currentSpeed * 0.8;
              en.y -= dirY * currentSpeed * 0.8;
            }

            // Shoot projectile
            en.attackCooldown--;
            if (en.attackCooldown <= 0) {
              en.attackCooldown = en.behavior === 'turret' ? 45 : 60;
              s.projectiles.push({
                id: 'enemy_proj_' + Math.random(),
                x: en.x,
                y: en.y,
                vx: dirX * 6,
                vy: dirY * 6,
                radius: 6,
                damage: en.damage,
                color: en.color,
                isEnemy: true,
                life: 90,
                maxLife: 90
              });
            }
          } else if (en.behavior === 'boss') {
            // Boss Multi-Phase Attacks
            en.x += dirX * currentSpeed * 0.9;
            en.y += dirY * currentSpeed * 0.9;

            onBossStateChange(en.hp, en.maxHp, en.name);

            en.attackCooldown--;
            if (en.attackCooldown <= 0) {
              en.attackCooldown = 50;

              // Boss Pattern: 5-way bullet fan
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

        // Update Floating Combat Texts
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

      } // End if !isPaused

      // -------------------------------------------------------------
      // RENDERING (CANVAS 2D)
      // -------------------------------------------------------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background Grid (Cyberpunk Montréal 2033)
      ctx.fillStyle = currentStage.bgDark;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-s.camera.x, -s.camera.y);

      // World Boundary Grid
      const gridSize = 60;
      ctx.strokeStyle = currentStage.gridColor;
      ctx.lineWidth = 1;
      const startX = Math.floor(s.camera.x / gridSize) * gridSize;
      const startY = Math.floor(s.camera.y / gridSize) * gridSize;
      const endX = startX + canvas.width + gridSize;
      const endY = startY + canvas.height + gridSize;

      ctx.beginPath();
      for (let x = startX; x <= endX; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = startY; y <= endY; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();

      // Map Outer Borders
      ctx.strokeStyle = currentStage.accentColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, s.worldSize.width, s.worldSize.height);

      // Render Area Effects (EMP Shockwaves, Psychic Vortexes, Blade Arcs)
      s.areaEffects.forEach(aoe => {
        ctx.save();
        if (aoe.type === 'vortex') {
          // Rotating Black Hole with Event Horizon
          ctx.beginPath();
          ctx.arc(aoe.x, aoe.y, aoe.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(157, 0, 255, 0.15)';
          ctx.fill();
          ctx.strokeStyle = '#9d00ff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Swirl rings
          for (let r = 20; r < aoe.radius; r += 25) {
            ctx.beginPath();
            ctx.arc(aoe.x, aoe.y, r, (Date.now() * 0.005) + r, (Date.now() * 0.005) + r + Math.PI);
            ctx.strokeStyle = 'rgba(157, 0, 255, 0.6)';
            ctx.lineWidth = 3;
            ctx.stroke();
          }
        } else if (aoe.type === 'emp_shockwave') {
          // Expanding EMP Ring
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
          // Neon Slash Arc
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

      // Render Particles
      s.particles.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Enemies
      s.enemies.forEach(en => {
        ctx.save();
        ctx.translate(en.x, en.y);

        // Stun indicator
        if (en.stunTimer && en.stunTimer > 0) {
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, en.radius + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Enemy Body
        ctx.fillStyle = en.color;
        ctx.shadowColor = en.color;
        ctx.shadowBlur = en.isBoss ? 25 : 10;

        if (en.isBoss) {
          // Mecha Boss Body
          ctx.beginPath();
          ctx.arc(0, 0, en.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-8, -8, 16, 16);
        } else if (en.type === 'drone') {
          // Triangle Drone
          ctx.beginPath();
          ctx.moveTo(en.radius, 0);
          ctx.lineTo(-en.radius, -en.radius * 0.7);
          ctx.lineTo(-en.radius * 0.5, 0);
          ctx.lineTo(-en.radius, en.radius * 0.7);
          ctx.closePath();
          ctx.fill();
        } else {
          // Standard Cyber-Biped
          ctx.beginPath();
          ctx.arc(0, 0, en.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // HP Bar overhead
        if (!en.isBoss) {
          const hpPercent = Math.max(0, en.hp / en.maxHp);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(-en.radius, -en.radius - 12, en.radius * 2, 4);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-en.radius, -en.radius - 12, en.radius * 2 * hpPercent, 4);
        }

        ctx.restore();
      });

      // Render Player Trails (Shadow Clones / Bullet-Time Replicas)
      p.trail.forEach(t => {
        ctx.save();
        ctx.globalAlpha = t.alpha * 0.5;
        ctx.fillStyle = t.color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Player Character
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      // Psychic Aura Glow
      ctx.shadowColor = customization.auraColor;
      ctx.shadowBlur = 18;

      // Player Body / Tactical Exo Suit
      ctx.fillStyle = customization.suitColor || '#1f2937';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Visor HUD
      ctx.fillStyle = customization.visorColor;
      ctx.fillRect(p.radius * 0.2, -5, 6, 10);

      // Glowing Cyber-Blade / Psi-Gauntlet
      ctx.strokeStyle = customization.bladeColor;
      ctx.lineWidth = 4;
      ctx.shadowColor = customization.bladeColor;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(p.radius * 0.6, 8);
      ctx.lineTo(p.radius * 1.8, 12);
      ctx.stroke();

      ctx.restore();

      // Render Projectiles
      s.projectiles.forEach(proj => {
        ctx.save();
        ctx.fillStyle = proj.color;
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Floating Combat Text
      s.floatingTexts.forEach(txt => {
        ctx.save();
        ctx.font = txt.isCrit ? 'bold 18px Orbitron, sans-serif' : 'bold 14px Chakra Petch, sans-serif';
        ctx.fillStyle = txt.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.textAlign = 'center';
        ctx.fillText(txt.text, txt.x, txt.y);
        ctx.restore();
      });

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
  }, [playerStats, customization, currentStage, difficultyTier, bulletTimeActive, isPaused]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair block"
    />
  );
};
