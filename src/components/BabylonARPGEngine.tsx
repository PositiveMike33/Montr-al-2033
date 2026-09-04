import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  PointLight,
  MeshBuilder,
  StandardMaterial,
  PBRMaterial,
  Color3,
  Color4,
  Vector3,
  Matrix,
  Mesh,
  TransformNode,
  GlowLayer,
  ParticleSystem,
  Texture,
  Animation,
  AnimationGroup,
  ActionManager,
  ExecuteCodeAction,
  ShadowGenerator,
  Space,
  GroundMesh,
} from '@babylonjs/core';

import {
  CombatEntity,
  LootDrop,
  PlayerStats,
  AvatarCustomization,
  StageInfo,
  EquipmentItem,
  Companion,
  WorldEvent
} from '../types';
import { sound } from '../utils/audio';
import { Sparkles, Zap, Shield, Skull, Swords } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// BABYLON.JS ARPG ENGINE — DIABLO IV × FINAL FANTASY XVI
// Montréal 2033: Neural Overload — Cyberpunk Satanic Combat Arena
// ═══════════════════════════════════════════════════════════════════

interface BabylonARPGEngineProps {
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
  triggerAction: {
    type: 'primary' | 'lance' | 'emp' | 'vortex' | 'bulletTime' | 'dash' | null;
    timestamp: number;
  };
  onActionTriggered: () => void;
  isPaused: boolean;
  equippedWeapon?: EquipmentItem;
}

// ── Enemy Data Structure ──
interface EnemyUnit {
  id: string;
  node: TransformNode;
  bodyMesh: Mesh;
  hp: number;
  maxHp: number;
  isBoss: boolean;
  speed: number;
  stagger: number;
  name: string;
  attackCooldown: number;
  hitFlashTimer: number;
  deathTimer: number;
}

// ── Floating Damage Number ──
interface DamageNumber {
  value: number;
  x: number;
  y: number;
  z: number;
  timer: number;
  isCrit: boolean;
}

export const BabylonARPGEngine: React.FC<BabylonARPGEngineProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const [staggerPercent, setStaggerPercent] = useState(0);
  const [isStaggered, setIsStaggered] = useState(false);
  const [sophiaSummonActive, setSophiaSummonActive] = useState(false);
  const [primordialEnergy, setPrimordialEnergy] = useState(0);
  const [comboCounter, setComboCounter] = useState(0);
  const [comboTimer, setComboTimer] = useState(0);
  const [killCount, setKillCount] = useState(0);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);

  // Stable ref for props in game loop (avoid stale closures)
  const propsRef = useRef(props);
  useEffect(() => { propsRef.current = props; });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ════════════════════════════════════════════════════════════
    // 1. ENGINE & SCENE SETUP
    // ════════════════════════════════════════════════════════════
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      adaptToDeviceRatio: true,
    });
    engineRef.current = engine;

    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.02, 0.027, 0.05, 1); // Deep cyberpunk black
    scene.ambientColor = new Color3(0.08, 0.1, 0.18);
    scene.fogMode = Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.008;
    scene.fogColor = new Color3(0.02, 0.03, 0.06);

    // Glow layer for neon effects
    const glowLayer = new GlowLayer('glow', scene, {
      mainTextureFixedSize: 512,
      blurKernelSize: 64,
    });
    glowLayer.intensity = 0.8;

    // ════════════════════════════════════════════════════════════
    // 2. ISOMETRIC CAMERA (Diablo IV Style)
    // ════════════════════════════════════════════════════════════
    const camera = new ArcRotateCamera(
      'isoCam',
      -Math.PI / 4,        // alpha (horizontal rotation — 45° offset)
      Math.PI / 3.5,       // beta (vertical tilt — ~51°, Diablo-style)
      35,                  // radius (distance from target)
      Vector3.Zero(),
      scene
    );
    camera.lowerRadiusLimit = 20;
    camera.upperRadiusLimit = 60;
    camera.lowerBetaLimit = 0.6;
    camera.upperBetaLimit = Math.PI / 2.8;
    camera.panningSensibility = 0;   // No panning — camera follows player
    camera.inputs.clear();           // Remove all default input — we control manually

    // ════════════════════════════════════════════════════════════
    // 3. CYBERPUNK-SATANIC LIGHTING
    // ════════════════════════════════════════════════════════════
    const ambientLight = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.4;
    ambientLight.diffuse = new Color3(0.1, 0.12, 0.2);
    ambientLight.groundColor = new Color3(0.05, 0.02, 0.08);

    const sunLight = new DirectionalLight('sun', new Vector3(-1, -3, 1), scene);
    sunLight.intensity = 1.5;
    sunLight.diffuse = new Color3(0, 0.95, 1);    // Cyan directional
    sunLight.position = new Vector3(20, 50, -20);

    // Shadow generator
    const shadowGen = new ShadowGenerator(1024, sunLight);
    shadowGen.useBlurExponentialShadowMap = true;
    shadowGen.blurKernel = 16;

    const satanicLight = new PointLight('satanic', new Vector3(0, 8, 0), scene);
    satanicLight.intensity = 4.0;
    satanicLight.diffuse = new Color3(1, 0, 0.27);   // Blood red
    satanicLight.range = 60;

    const magentaLight = new PointLight('magenta', new Vector3(-15, 5, 10), scene);
    magentaLight.intensity = 2.0;
    magentaLight.diffuse = new Color3(1, 0, 1);   // Magenta accent
    magentaLight.range = 40;

    // ════════════════════════════════════════════════════════════
    // 4. GROUND & SATANIC PENTAGRAM ARENA
    // ════════════════════════════════════════════════════════════
    const ground = MeshBuilder.CreateGround('ground', { width: 160, height: 160, subdivisions: 80 }, scene);
    const groundMat = new PBRMaterial('groundMat', scene);
    groundMat.albedoColor = new Color3(0.04, 0.055, 0.1);
    groundMat.metallic = 0.6;
    groundMat.roughness = 0.7;
    groundMat.emissiveColor = new Color3(0.01, 0.02, 0.04);
    ground.material = groundMat;
    ground.receiveShadows = true;

    // Grid lines
    const gridLines: Mesh[] = [];
    const gridMat = new StandardMaterial('gridMat', scene);
    gridMat.emissiveColor = new Color3(0, 0.5, 0.6);
    gridMat.alpha = 0.15;
    for (let i = -80; i <= 80; i += 4) {
      const lineH = MeshBuilder.CreateLines(`gridH${i}`, {
        points: [new Vector3(-80, 0.03, i), new Vector3(80, 0.03, i)]
      }, scene);
      lineH.color = new Color3(0, 0.6, 0.8);
      lineH.alpha = 0.12;
      gridLines.push(lineH);

      const lineV = MeshBuilder.CreateLines(`gridV${i}`, {
        points: [new Vector3(i, 0.03, -80), new Vector3(i, 0.03, 80)]
      }, scene);
      lineV.color = new Color3(0, 0.6, 0.8);
      lineV.alpha = 0.12;
      gridLines.push(lineV);
    }

    // Satanic Pentagram Ring
    const pentagramNode = new TransformNode('pentagram', scene);
    const pentaRing = MeshBuilder.CreateTorus('pentaRing', {
      diameter: 16,
      thickness: 0.3,
      tessellation: 64
    }, scene);
    const pentaMat = new StandardMaterial('pentaMat', scene);
    pentaMat.emissiveColor = new Color3(1, 0, 0.33);
    pentaMat.alpha = 0.85;
    pentaRing.material = pentaMat;
    pentaRing.parent = pentagramNode;
    pentaRing.position.y = 0.05;
    glowLayer.addIncludedOnlyMesh(pentaRing);

    // Star lines (pentagram)
    const starPts: Vector3[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      starPts.push(new Vector3(Math.cos(angle) * 8, 0.06, Math.sin(angle) * 8));
    }
    starPts.push(starPts[0]);
    const starMesh = MeshBuilder.CreateLines('star', { points: starPts }, scene);
    starMesh.color = new Color3(1, 0, 0.33);
    starMesh.parent = pentagramNode;

    // Inner concentric ring
    const innerRing = MeshBuilder.CreateTorus('innerRing', {
      diameter: 10,
      thickness: 0.15,
      tessellation: 48
    }, scene);
    const innerRingMat = new StandardMaterial('innerRingMat', scene);
    innerRingMat.emissiveColor = new Color3(1, 0, 1);
    innerRingMat.alpha = 0.5;
    innerRing.material = innerRingMat;
    innerRing.parent = pentagramNode;
    innerRing.position.y = 0.04;
    glowLayer.addIncludedOnlyMesh(innerRing);

    // ════════════════════════════════════════════════════════════
    // 5. THIRTY3 — PLAYER CHARACTER
    // ════════════════════════════════════════════════════════════
    const playerNode = new TransformNode('player', scene);

    // Torso
    const torso = MeshBuilder.CreateCylinder('torso', { height: 2.2, diameterTop: 1.4, diameterBottom: 1.8, tessellation: 12 }, scene);
    const torsoMat = new PBRMaterial('torsoMat', scene);
    torsoMat.albedoColor = new Color3(0.07, 0.09, 0.15);
    torsoMat.metallic = 0.85;
    torsoMat.roughness = 0.35;
    torso.material = torsoMat;
    torso.position.y = 2.1;
    torso.parent = playerNode;
    shadowGen.addShadowCaster(torso);

    // Cyber Coat
    const coat = MeshBuilder.CreateBox('coat', { width: 1.6, height: 2.0, depth: 1.1 }, scene);
    const coatMat = new PBRMaterial('coatMat', scene);
    coatMat.albedoColor = new Color3(0, 0.95, 1);
    coatMat.metallic = 0.9;
    coatMat.roughness = 0.15;
    coatMat.emissiveColor = new Color3(0, 0.3, 0.35);
    coat.material = coatMat;
    coat.position.y = 2.1;
    coat.parent = playerNode;
    glowLayer.addIncludedOnlyMesh(coat);

    // Head
    const head = MeshBuilder.CreateSphere('head', { diameter: 1.1, segments: 16 }, scene);
    const headMat = new PBRMaterial('headMat', scene);
    headMat.albedoColor = new Color3(0.95, 0.96, 0.97);
    headMat.metallic = 0.1;
    headMat.roughness = 0.6;
    head.material = headMat;
    head.position.y = 3.6;
    head.parent = playerNode;
    shadowGen.addShadowCaster(head);

    // Visor (neon green)
    const visor = MeshBuilder.CreateBox('visor', { width: 0.65, height: 0.22, depth: 0.45 }, scene);
    const visorMat = new StandardMaterial('visorMat', scene);
    visorMat.emissiveColor = new Color3(0.22, 1, 0.08);
    visor.material = visorMat;
    visor.position = new Vector3(0, 3.65, 0.35);
    visor.parent = playerNode;
    glowLayer.addIncludedOnlyMesh(visor);

    // Combat Gloves (magenta glow)
    const gloveMat = new PBRMaterial('gloveMat', scene);
    gloveMat.albedoColor = new Color3(1, 0, 0.5);
    gloveMat.emissiveColor = new Color3(0.8, 0, 0.4);
    gloveMat.metallic = 0.7;
    gloveMat.roughness = 0.2;

    const leftGlove = MeshBuilder.CreateBox('lGlove', { width: 0.5, height: 0.5, depth: 0.6 }, scene);
    leftGlove.material = gloveMat;
    leftGlove.position = new Vector3(-1.1, 2.0, 0.4);
    leftGlove.parent = playerNode;
    glowLayer.addIncludedOnlyMesh(leftGlove);

    const rightGlove = MeshBuilder.CreateBox('rGlove', { width: 0.5, height: 0.5, depth: 0.6 }, scene);
    rightGlove.material = gloveMat;
    rightGlove.position = new Vector3(1.1, 2.0, 0.4);
    rightGlove.parent = playerNode;
    glowLayer.addIncludedOnlyMesh(rightGlove);

    // ════════════════════════════════════════════════════════════
    // 6. DEUS EX SOPHIA — PRIMORDIAL COLOSSUS AVATAR
    // ════════════════════════════════════════════════════════════
    const sophiaNode = new TransformNode('sophia', scene);
    sophiaNode.position = new Vector3(0, 14, -18);
    sophiaNode.setEnabled(false);

    const sophiaBody = MeshBuilder.CreateCylinder('sophiaBody', {
      height: 16, diameterTop: 1, diameterBottom: 7, tessellation: 16
    }, scene);
    const sophiaMat = new PBRMaterial('sophiaMat', scene);
    sophiaMat.albedoColor = new Color3(0, 0.95, 1);
    sophiaMat.emissiveColor = new Color3(0, 0.6, 0.7);
    sophiaMat.alpha = 0.65;
    sophiaMat.wireframe = true;
    sophiaBody.material = sophiaMat;
    sophiaBody.parent = sophiaNode;
    glowLayer.addIncludedOnlyMesh(sophiaBody);

    // Sophia Wings
    const wingMat = new StandardMaterial('wingMat', scene);
    wingMat.emissiveColor = new Color3(1, 0, 1);
    wingMat.alpha = 0.5;
    wingMat.backFaceCulling = false;

    const leftWing = MeshBuilder.CreatePlane('lWing', { width: 16, height: 8 }, scene);
    leftWing.material = wingMat;
    leftWing.position = new Vector3(-9, 3, 0);
    leftWing.rotation.y = Math.PI / 4;
    leftWing.parent = sophiaNode;
    glowLayer.addIncludedOnlyMesh(leftWing);

    const rightWing = MeshBuilder.CreatePlane('rWing', { width: 16, height: 8 }, scene);
    rightWing.material = wingMat;
    rightWing.position = new Vector3(9, 3, 0);
    rightWing.rotation.y = -Math.PI / 4;
    rightWing.parent = sophiaNode;
    glowLayer.addIncludedOnlyMesh(rightWing);

    // Sophia Halo ring
    const haloRing = MeshBuilder.CreateTorus('halo', {
      diameter: 5, thickness: 0.2, tessellation: 32
    }, scene);
    const haloMat = new StandardMaterial('haloMat', scene);
    haloMat.emissiveColor = new Color3(1, 0.85, 0);
    haloRing.material = haloMat;
    haloRing.position.y = 9;
    haloRing.parent = sophiaNode;
    glowLayer.addIncludedOnlyMesh(haloRing);

    // ════════════════════════════════════════════════════════════
    // 7. ENEMY SPAWNING SYSTEM
    // ════════════════════════════════════════════════════════════
    const enemies: EnemyUnit[] = [];
    let nextEnemyId = 0;

    const ENEMY_NAMES = [
      'Démon Cybernétique', 'Spectre Quantique', 'Drone Sentinelle',
      'Golem de Données', 'Ombre Neurale', 'Virus Incarné'
    ];

    const spawnEnemy = (isBoss: boolean = false) => {
      const node = new TransformNode(`enemy_${nextEnemyId}`, scene);
      const radius = isBoss ? 3.5 : 1.0 + Math.random() * 0.4;

      const bodyMesh = isBoss
        ? MeshBuilder.CreatePolyhedron(`ebody_${nextEnemyId}`, { type: 1, size: radius }, scene)
        : MeshBuilder.CreateIcoSphere(`ebody_${nextEnemyId}`, { radius, subdivisions: 2 }, scene);

      const bodyMat = new PBRMaterial(`emat_${nextEnemyId}`, scene);
      bodyMat.albedoColor = isBoss ? new Color3(1, 0, 0.13) : new Color3(0.49, 0.23, 0.93);
      bodyMat.emissiveColor = isBoss ? new Color3(0.4, 0, 0.07) : new Color3(0.18, 0.06, 0.4);
      bodyMat.metallic = 0.9;
      bodyMat.roughness = 0.25;
      bodyMesh.material = bodyMat;
      bodyMesh.position.y = radius + 0.5;
      bodyMesh.parent = node;
      shadowGen.addShadowCaster(bodyMesh);

      // Boss horns
      if (isBoss) {
        const hornMat = new PBRMaterial(`hornMat_${nextEnemyId}`, scene);
        hornMat.albedoColor = new Color3(0.08, 0.08, 0.08);
        hornMat.metallic = 0.95;
        hornMat.roughness = 0.2;

        for (const side of [-1, 1]) {
          const horn = MeshBuilder.CreateCylinder(`horn_${nextEnemyId}_${side}`, {
            height: 3.5, diameterTop: 0.1, diameterBottom: 0.8, tessellation: 8
          }, scene);
          horn.material = hornMat;
          horn.position = new Vector3(side * 2.5, radius + 3, 0);
          horn.rotation.z = side * Math.PI / 6;
          horn.parent = node;
        }

        // Eye glow
        const eye = MeshBuilder.CreateSphere(`eye_${nextEnemyId}`, { diameter: 1.2, segments: 8 }, scene);
        const eyeMat = new StandardMaterial(`eyeMat_${nextEnemyId}`, scene);
        eyeMat.emissiveColor = new Color3(1, 0, 0);
        eye.material = eyeMat;
        eye.position = new Vector3(0, radius + 1.5, radius * 0.7);
        eye.parent = node;
        glowLayer.addIncludedOnlyMesh(eye);
      }

      // Random spawn position
      const angle = Math.random() * Math.PI * 2;
      const dist = isBoss ? 30 : 18 + Math.random() * 20;
      node.position = new Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);

      const difficulty = propsRef.current.difficultyTier;
      const maxHp = isBoss ? 18000 * difficulty : 600 * difficulty + Math.random() * 400 * difficulty;

      const enemy: EnemyUnit = {
        id: `enemy_${nextEnemyId++}`,
        node,
        bodyMesh,
        hp: maxHp,
        maxHp,
        isBoss,
        speed: isBoss ? 0.06 : 0.10 + Math.random() * 0.06,
        stagger: 0,
        name: isBoss ? propsRef.current.currentStage.bossName : ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)],
        attackCooldown: 0,
        hitFlashTimer: 0,
        deathTimer: -1,
      };

      enemies.push(enemy);

      if (isBoss) {
        propsRef.current.onBossStateChange(maxHp, maxHp, enemy.name);
      }
    };

    // Initial spawn: 8 mobs + 1 boss
    for (let i = 0; i < 8; i++) spawnEnemy(false);
    spawnEnemy(true);

    // ════════════════════════════════════════════════════════════
    // 8. INPUT SYSTEM (WASD + ABILITIES)
    // ════════════════════════════════════════════════════════════
    const keys: Record<string, boolean> = {};
    let sophiaSummonPending = false;

    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'r') {
        sophiaSummonPending = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ════════════════════════════════════════════════════════════
    // 9. GAME STATE
    // ════════════════════════════════════════════════════════════
    const playerPos = new Vector3(0, 0, 0);
    let localPrimordialEnergy = 0;
    let localSophiaActive = false;
    let sophiaTimer = 0;
    let localCombo = 0;
    let localComboTimer = 0;
    let localKills = 0;
    let attackTimer = 0;
    const ATTACK_INTERVAL = 0.15; // seconds between auto-attacks

    // ════════════════════════════════════════════════════════════
    // 10. PARTICLE SYSTEMS
    // ════════════════════════════════════════════════════════════
    // Attack impact particles
    const attackParticles = new ParticleSystem('attackPS', 100, scene);
    attackParticles.createPointEmitter(new Vector3(-0.5, 0, -0.5), new Vector3(0.5, 1, 0.5));
    attackParticles.color1 = new Color4(0, 0.95, 1, 1);
    attackParticles.color2 = new Color4(1, 0, 1, 1);
    attackParticles.colorDead = new Color4(0, 0, 0, 0);
    attackParticles.minSize = 0.1;
    attackParticles.maxSize = 0.4;
    attackParticles.minLifeTime = 0.1;
    attackParticles.maxLifeTime = 0.3;
    attackParticles.emitRate = 0; // Only burst on hit
    attackParticles.gravity = new Vector3(0, -5, 0);
    attackParticles.manualEmitCount = 0;

    // Sophia summon particles
    const summonParticles = new ParticleSystem('summonPS', 500, scene);
    summonParticles.createCylinderEmitter(10, 1, 0, 0);
    summonParticles.color1 = new Color4(0, 0.95, 1, 1);
    summonParticles.color2 = new Color4(1, 0, 1, 1);
    summonParticles.colorDead = new Color4(1, 0.85, 0, 0);
    summonParticles.minSize = 0.3;
    summonParticles.maxSize = 1.0;
    summonParticles.minLifeTime = 0.5;
    summonParticles.maxLifeTime = 2.0;
    summonParticles.emitRate = 0;
    summonParticles.gravity = new Vector3(0, 8, 0);

    // ════════════════════════════════════════════════════════════
    // 11. SOPHIA PRIMORDIAL SUMMON
    // ════════════════════════════════════════════════════════════
    const triggerSophiaSummon = () => {
      if (localPrimordialEnergy < 100 || localSophiaActive) return;

      localSophiaActive = true;
      localPrimordialEnergy = 0;
      sophiaTimer = 4.0; // 4 second summon duration
      sophiaNode.setEnabled(true);
      setSophiaSummonActive(true);
      setPrimordialEnergy(0);

      sound.playEmpExplosion();

      // Flash satanic light to cyan
      satanicLight.diffuse = new Color3(0, 0.95, 1);
      satanicLight.intensity = 10;

      // Massive damage burst to all enemies
      setTimeout(() => {
        const difficulty = propsRef.current.difficultyTier;
        for (const e of enemies) {
          const dmg = 5000 * difficulty;
          e.hp -= dmg;
          e.stagger = 100;
          if (e.isBoss) {
            setStaggerPercent(100);
            setIsStaggered(true);
          }
        }

        // Particle burst
        summonParticles.emitter = playerNode.position.clone();
        summonParticles.manualEmitCount = 300;
      }, 600);
    };

    // ════════════════════════════════════════════════════════════
    // 12. MAIN GAME LOOP — RENDER OBSERVABLE
    // ════════════════════════════════════════════════════════════
    let frameCounter = 0;

    scene.onBeforeRenderObservable.add(() => {
      if (propsRef.current.isPaused) return;

      const dt = engine.getDeltaTime() / 1000; // seconds
      const time = performance.now() / 1000;
      frameCounter++;

      // ── Pentagram rotation ──
      pentagramNode.rotation.y += dt * 0.3;

      // ── Player movement ──
      const moveSpeed = propsRef.current.playerStats.moveSpeed * 3.0 * dt;
      if (keys['w'] || keys['arrowup'])    playerPos.z -= moveSpeed;
      if (keys['s'] || keys['arrowdown'])  playerPos.z += moveSpeed;
      if (keys['a'] || keys['arrowleft'])  playerPos.x -= moveSpeed;
      if (keys['d'] || keys['arrowright']) playerPos.x += moveSpeed;

      // Boundary clamp
      playerPos.x = Math.max(-70, Math.min(70, playerPos.x));
      playerPos.z = Math.max(-70, Math.min(70, playerPos.z));
      playerNode.position.copyFrom(playerPos);

      // ── Camera LERP follow ──
      const camTarget = new Vector3(playerPos.x, 0, playerPos.z);
      camera.target = Vector3.Lerp(camera.target, camTarget, 0.08);

      // ── Glove combat animation ──
      leftGlove.position.z = 0.4 + Math.sin(time * 12) * 0.4;
      rightGlove.position.z = 0.4 - Math.sin(time * 12) * 0.4;

      // ── Sophia summon effects ──
      if (localSophiaActive) {
        sophiaNode.position.x = playerPos.x;
        sophiaNode.position.z = playerPos.z - 18;
        sophiaNode.position.y = 14 + Math.sin(time * 3) * 2;
        leftWing.rotation.z = Math.sin(time * 4) * 0.3;
        rightWing.rotation.z = -Math.sin(time * 4) * 0.3;
        haloRing.rotation.y += dt * 3;

        sophiaTimer -= dt;
        if (sophiaTimer <= 0) {
          localSophiaActive = false;
          sophiaNode.setEnabled(false);
          setSophiaSummonActive(false);
          satanicLight.diffuse = new Color3(1, 0, 0.27);
          satanicLight.intensity = 4.0;
        }
      }

      // ── Sophia summon trigger ──
      if (sophiaSummonPending) {
        sophiaSummonPending = false;
        triggerSophiaSummon();
      }

      // ── Combo timer decay ──
      if (localComboTimer > 0) {
        localComboTimer -= dt;
        if (localComboTimer <= 0) {
          localCombo = 0;
          setComboCounter(0);
        }
      }

      // ── Attack timer ──
      attackTimer -= dt;

      // ── Enemy AI & Combat ──
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const toPlayer = playerPos.subtract(e.node.position);
        const dist = toPlayer.length();

        // Hit flash decay
        if (e.hitFlashTimer > 0) {
          e.hitFlashTimer -= dt;
          const mat = e.bodyMesh.material as PBRMaterial;
          if (mat) {
            mat.emissiveColor = e.hitFlashTimer > 0
              ? new Color3(1, 1, 1)
              : (e.isBoss ? new Color3(0.4, 0, 0.07) : new Color3(0.18, 0.06, 0.4));
          }
        }

        // Staggered behavior
        if (e.stagger >= 100) {
          e.node.rotation.y += dt * 6;
          e.bodyMesh.scaling.x = 1.1 + Math.sin(time * 15) * 0.1;
          e.bodyMesh.scaling.z = 1.1 + Math.sin(time * 15) * 0.1;

          // Stagger decay over time
          e.stagger -= dt * 12;
          if (e.stagger < 0) {
            e.stagger = 0;
            if (e.isBoss) {
              setIsStaggered(false);
              setStaggerPercent(0);
            }
            e.bodyMesh.scaling.setAll(1);
          }
        } else {
          // Pursuit AI
          if (dist > 2.0) {
            const dir = toPlayer.normalize();
            const speed = e.speed * (propsRef.current.bulletTimeActive ? 0.3 : 1.0);
            e.node.position.addInPlace(dir.scale(speed));
            e.node.rotation.y = Math.atan2(dir.x, dir.z);
          }
        }

        // Enemy attacks player
        if (dist < 2.8 && e.stagger < 100) {
          e.attackCooldown -= dt;
          if (e.attackCooldown <= 0) {
            const dmg = e.isBoss ? 30 : 10;
            propsRef.current.onPlayerDamaged(dmg);
            e.attackCooldown = e.isBoss ? 1.5 : 0.8;
          }
        }

        // Player auto-attacks enemies in range
        if (dist < 5.0 && attackTimer <= 0) {
          attackTimer = ATTACK_INTERVAL;
          const critMult = e.stagger >= 100 ? 3.0 : 1.0;
          const pDmg = propsRef.current.playerStats.damage * (1 + Math.random() * 0.4) * critMult;
          e.hp -= pDmg;
          e.hitFlashTimer = 0.08;

          // Stagger build on boss
          if (e.isBoss && e.stagger < 100) {
            e.stagger = Math.min(100, e.stagger + 3);
            setStaggerPercent(e.stagger);
            if (e.stagger >= 100) setIsStaggered(true);
          }

          // Primordial energy gain
          localPrimordialEnergy = Math.min(100, localPrimordialEnergy + 0.25);
          if (frameCounter % 10 === 0) setPrimordialEnergy(Math.round(localPrimordialEnergy));

          // Combo
          localCombo++;
          localComboTimer = 3.0;
          if (frameCounter % 5 === 0) setComboCounter(localCombo);

          // Attack particle burst
          attackParticles.emitter = e.node.position.clone();
          attackParticles.manualEmitCount = 15;

          // Psi gain
          propsRef.current.onPsiGained(0.5);
        }

        // Enemy death
        if (e.hp <= 0) {
          // Dispose meshes
          e.node.getChildMeshes().forEach(m => m.dispose());
          e.node.dispose();
          enemies.splice(i, 1);

          localKills++;
          if (frameCounter % 3 === 0) setKillCount(localKills);

          propsRef.current.onEnemyKilled({
            id: e.id,
            name: e.name,
            x: e.node.position.x,
            y: e.node.position.z,
            radius: 1,
            hp: 0,
            maxHp: e.maxHp,
            speed: 0,
            damage: 0,
            color: '#ff0055',
            behavior: 'aggressive',
            expValue: e.isBoss ? 3000 : 180,
            naniteValue: e.isBoss ? 550 : 45
          });

          if (e.isBoss) {
            propsRef.current.onBossStateChange(null, null, null);
            setIsStaggered(false);
            setStaggerPercent(0);
            // Respawn boss after delay
            setTimeout(() => spawnEnemy(true), 8000);
          } else {
            // Respawn mob after delay
            setTimeout(() => spawnEnemy(false), 2500);
          }
        } else if (e.isBoss) {
          // Update boss HP in HUD
          if (frameCounter % 15 === 0) {
            propsRef.current.onBossStateChange(e.hp, e.maxHp, e.name);
          }
        }
      }
    });

    // ════════════════════════════════════════════════════════════
    // 13. RENDER LOOP & RESIZE
    // ════════════════════════════════════════════════════════════
    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    // ════════════════════════════════════════════════════════════
    // CLEANUP
    // ════════════════════════════════════════════════════════════
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engine.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentStage.id]);

  // ══════════════════════════════════════════════════════════════
  // RENDER — CANVAS + HUD OVERLAYS
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Babylon.js Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full outline-none"
        tabIndex={0}
        onFocus={(e) => e.target.focus()}
      />

      {/* Combo Counter */}
      {comboCounter > 2 && (
        <div className="absolute top-16 right-8 z-20 pointer-events-none animate-pulse">
          <div className="text-right">
            <div className="text-5xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-red-500 drop-shadow-[0_0_20px_rgba(0,243,255,0.6)]">
              {comboCounter}×
            </div>
            <div className="text-xs font-mono text-cyan-300 tracking-[0.3em] uppercase">
              combo hit
            </div>
          </div>
        </div>
      )}

      {/* Kill Counter */}
      <div className="absolute top-4 right-8 z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/70 border border-red-500/40 px-3 py-1.5 rounded-lg">
          <Skull className="w-4 h-4 text-red-400" />
          <span className="text-sm font-orbitron font-bold text-red-300">{killCount}</span>
        </div>
      </div>

      {/* Boss Stagger Bar Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20">
        {staggerPercent > 0 && (
          <div className="w-80 md:w-96 bg-black/80 border border-yellow-500/50 p-2 rounded shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <div className="flex justify-between items-center text-[10px] font-orbitron font-bold text-yellow-400 mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                {isStaggered ? '⚡ STAGGERED // DÉGÂTS CRITIQUES ×300%' : 'JAUGE D\'ÉBRANLEMENT (STAGGER)'}
              </span>
              <span>{Math.round(staggerPercent)}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-900 rounded overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  isStaggered
                    ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 animate-pulse shadow-[0_0_15px_#f59e0b]'
                    : 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                }`}
                style={{ width: `${staggerPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Primordial Summon Indicator */}
      <div className="absolute bottom-24 right-8 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="bg-black/90 border border-[#00f3ff]/60 p-3 rounded-lg shadow-[0_0_30px_rgba(0,243,255,0.3)] flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
              INVOCATION PRIMORDIALE
            </div>
            <div className="text-xs font-orbitron font-black text-white">
              DEUS EX SOPHIA // BABYLON 3D
            </div>
          </div>

          <button
            disabled={primordialEnergy < 100 || sophiaSummonActive}
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'r' });
              window.dispatchEvent(event);
            }}
            className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center font-orbitron font-black text-xs transition-all cursor-pointer ${
              primordialEnergy >= 100 && !sophiaSummonActive
                ? 'bg-gradient-to-t from-cyan-600 to-fuchsia-600 border-white text-white shadow-[0_0_25px_#00f3ff] animate-bounce hover:scale-105'
                : 'bg-gray-900 border-gray-700 text-gray-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span>[R]</span>
          </button>
        </div>

        {/* Energy bar */}
        <div className="w-52 h-1.5 bg-gray-900 border border-cyan-500/30 rounded overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 transition-all duration-300"
            style={{ width: `${primordialEnergy}%` }}
          />
        </div>
      </div>

      {/* Engine Badge */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-black/60 border border-cyan-500/30 px-2 py-1 rounded text-[9px] font-mono text-cyan-400/70">
          <Shield className="w-3 h-3" />
          BABYLON.JS ENGINE // HAVOK PHYSICS // WEBGPU
        </div>
      </div>
    </div>
  );
};
