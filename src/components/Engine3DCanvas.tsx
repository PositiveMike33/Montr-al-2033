import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
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
import { Sparkles, Zap } from 'lucide-react';

interface Engine3DCanvasProps {
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

export const Engine3DCanvas: React.FC<Engine3DCanvasProps> = ({
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
  triggerAction,
  onActionTriggered,
  isPaused,
  equippedWeapon
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [staggerPercent, setStaggerPercent] = useState<number>(0);
  const [isStaggered, setIsStaggered] = useState<boolean>(false);
  const [sophiaSummonActive, setSophiaSummonActive] = useState<boolean>(false);
  const [primordialEnergy, setPrimordialEnergy] = useState<number>(100);

  const propsRef = useRef({
    playerStats,
    customization,
    currentStage,
    difficultyTier,
    bulletTimeActive,
    activeCompanions,
    isPaused,
    onEnemyKilled,
    onLootDropped,
    onPlayerDamaged,
    onPlayerHealed,
    onPsiGained,
    onBossStateChange
  });

  useEffect(() => {
    propsRef.current = {
      playerStats,
      customization,
      currentStage,
      difficultyTier,
      bulletTimeActive,
      activeCompanions,
      isPaused,
      onEnemyKilled,
      onLootDropped,
      onPlayerDamaged,
      onPlayerHealed,
      onPsiGained,
      onBossStateChange
    };
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // 1. Scene & Isometric Perspective Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070d);
    scene.fog = new THREE.FogExp2(0x05070d, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 45, 45);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // 3. Cyberpunk-Satanic Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2035, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f3ff, 2.0);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const satanicRedLight = new THREE.PointLight(0xff0044, 3.5, 60);
    satanicRedLight.position.set(0, 10, 0);
    scene.add(satanicRedLight);

    // 4. Ground & Satanic Pentagram Ring
    const floorGeo = new THREE.PlaneGeometry(160, 160);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e1a,
      roughness: 0.8,
      metalness: 0.3
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(160, 40, 0x00f3ff, 0x1f293d);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    const pentagramGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(8, 8.4, 64);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0xff0055, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    pentagramGroup.add(ringMesh);

    const starPoints: THREE.Vector3[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      starPoints.push(new THREE.Vector3(Math.cos(angle) * 8, 0.05, Math.sin(angle) * 8));
    }
    starPoints.push(starPoints[0]);
    const starGeo = new THREE.BufferGeometry().setFromPoints(starPoints);
    const starMat = new THREE.LineBasicMaterial({ color: 0xff0055 });
    const starLine = new THREE.Line(starGeo, starMat);
    pentagramGroup.add(starLine);
    pentagramGroup.position.set(0, 0.05, 0);
    scene.add(pentagramGroup);

    // 5. Thirty3 3D Character Mesh
    const playerGroup = new THREE.Group();
    
    const torsoGeo = new THREE.CylinderGeometry(0.7, 0.9, 2.2, 8);
    const torsoMat = new THREE.MeshStandardMaterial({ 
      color: 0x111827, 
      roughness: 0.4, 
      metalness: 0.8 
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 2.1;
    torso.castShadow = true;
    playerGroup.add(torso);

    const coatGeo = new THREE.BoxGeometry(1.6, 2.0, 1.1);
    const coatMat = new THREE.MeshStandardMaterial({ color: 0x00f3ff, roughness: 0.2, metalness: 0.9 });
    const coat = new THREE.Mesh(coatGeo, coatMat);
    coat.position.y = 2.1;
    playerGroup.add(coat);

    const headGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 3.6;
    head.castShadow = true;
    playerGroup.add(head);

    const visorGeo = new THREE.BoxGeometry(0.65, 0.22, 0.45);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 3.65, 0.35);
    playerGroup.add(visor);

    const leftGloveGeo = new THREE.BoxGeometry(0.5, 0.5, 0.6);
    const rightGloveGeo = new THREE.BoxGeometry(0.5, 0.5, 0.6);
    const gloveMat = new THREE.MeshStandardMaterial({ 
      color: 0xff007f, 
      emissive: 0xff007f, 
      emissiveIntensity: 0.6 
    });
    
    const leftGlove = new THREE.Mesh(leftGloveGeo, gloveMat);
    leftGlove.position.set(-1.1, 2.0, 0.4);
    playerGroup.add(leftGlove);

    const rightGlove = new THREE.Mesh(rightGloveGeo, gloveMat);
    rightGlove.position.set(1.1, 2.0, 0.4);
    playerGroup.add(rightGlove);

    scene.add(playerGroup);

    // 6. Colossal Primordial Avatar of Deus Ex Sophia
    const sophiaGroup = new THREE.Group();
    sophiaGroup.position.set(0, 12, -15);
    sophiaGroup.visible = false;

    const sophiaBodyGeo = new THREE.ConeGeometry(3.5, 14, 16);
    const sophiaBodyMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x00f3ff,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.75,
      wireframe: true
    });
    const sophiaBody = new THREE.Mesh(sophiaBodyGeo, sophiaBodyMat);
    sophiaGroup.add(sophiaBody);

    const wingGeo = new THREE.PlaneGeometry(16, 8);
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-8, 4, 0);
    leftWing.rotation.y = Math.PI / 4;
    sophiaGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(8, 4, 0);
    rightWing.rotation.y = -Math.PI / 4;
    sophiaGroup.add(rightWing);

    scene.add(sophiaGroup);

    // 7. Enemy Pool
    interface Enemy3D {
      id: string;
      mesh: THREE.Group;
      hp: number;
      maxHp: number;
      isBoss: boolean;
      speed: number;
      stagger: number;
      name: string;
    }

    const enemies: Enemy3D[] = [];

    const spawnEnemy = (isBoss: boolean = false) => {
      const eGroup = new THREE.Group();
      const radius = isBoss ? 3.5 : 1.2;

      const baseGeo = isBoss 
        ? new THREE.OctahedronGeometry(radius, 2)
        : new THREE.DodecahedronGeometry(radius, 1);
      
      const baseMat = new THREE.MeshStandardMaterial({
        color: isBoss ? 0xff0022 : 0x7c3aed,
        emissive: isBoss ? 0x660011 : 0x2e1065,
        roughness: 0.3,
        metalness: 0.9
      });
      const mesh = new THREE.Mesh(baseGeo, baseMat);
      mesh.position.y = radius + 0.5;
      mesh.castShadow = true;
      eGroup.add(mesh);

      if (isBoss) {
        const hornGeo = new THREE.ConeGeometry(0.8, 3.0, 8);
        const hornMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const h1 = new THREE.Mesh(hornGeo, hornMat);
        h1.position.set(-2, radius + 2, 0);
        h1.rotation.z = Math.PI / 6;
        eGroup.add(h1);

        const h2 = new THREE.Mesh(hornGeo, hornMat);
        h2.position.set(2, radius + 2, 0);
        h2.rotation.z = -Math.PI / 6;
        eGroup.add(h2);
      }

      const angle = Math.random() * Math.PI * 2;
      const dist = isBoss ? 28 : 22 + Math.random() * 15;
      eGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);

      scene.add(eGroup);

      const maxHp = isBoss ? 15000 * propsRef.current.difficultyTier : 800 * propsRef.current.difficultyTier;
      const enemyObj: Enemy3D = {
        id: 'enemy_' + Math.random().toString(36).substr(2, 6),
        mesh: eGroup,
        hp: maxHp,
        maxHp,
        isBoss,
        speed: isBoss ? 0.08 : 0.12 + Math.random() * 0.05,
        stagger: 0,
        name: isBoss ? propsRef.current.currentStage.bossName : 'Démon Cybernétique'
      };

      enemies.push(enemyObj);

      if (isBoss) {
        propsRef.current.onBossStateChange(maxHp, maxHp, enemyObj.name);
      }
    };

    for (let i = 0; i < 6; i++) spawnEnemy(false);
    spawnEnemy(true);

    // 8. Movement & Inputs
    const playerPos = new THREE.Vector3(0, 0, 0);
    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = true;

      if (e.key.toLowerCase() === 'r' && primordialEnergy >= 100 && !sophiaSummonActive) {
        triggerSophiaPrimordialSummon();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 9. Primordial Summon Execution
    const triggerSophiaPrimordialSummon = () => {
      setSophiaSummonActive(true);
      setPrimordialEnergy(0);
      sophiaGroup.visible = true;
      sound.playEmpExplosion();

      satanicRedLight.intensity = 8.0;
      satanicRedLight.color.setHex(0x00f3ff);

      setTimeout(() => {
        enemies.forEach(e => {
          const dmg = 4500 * propsRef.current.difficultyTier;
          e.hp -= dmg;
          e.stagger = 100;
          if (e.isBoss) {
            setStaggerPercent(100);
            setIsStaggered(true);
          }
        });

        setTimeout(() => {
          sophiaGroup.visible = false;
          setSophiaSummonActive(false);
          satanicRedLight.intensity = 3.5;
          satanicRedLight.color.setHex(0xff0044);
        }, 3500);
      }, 800);
    };

    // 10. Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 11. Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (propsRef.current.isPaused) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      pentagramGroup.rotation.y = time * 0.3;

      const moveSpeed = propsRef.current.playerStats.moveSpeed * 2.8 * delta;
      if (keysPressed['w'] || keysPressed['arrowup']) playerPos.z -= moveSpeed;
      if (keysPressed['s'] || keysPressed['arrowdown']) playerPos.z += moveSpeed;
      if (keysPressed['a'] || keysPressed['arrowleft']) playerPos.x -= moveSpeed;
      if (keysPressed['d'] || keysPressed['arrowright']) playerPos.x += moveSpeed;

      playerPos.x = Math.max(-70, Math.min(70, playerPos.x));
      playerPos.z = Math.max(-70, Math.min(70, playerPos.z));

      playerGroup.position.copy(playerPos);

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerPos.x, 0.08);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, playerPos.z + 45, 0.08);
      camera.position.y = 45;
      camera.lookAt(playerPos.x, 0, playerPos.z);

      leftGlove.position.z = 0.4 + Math.sin(time * 12) * 0.4;
      rightGlove.position.z = 0.4 - Math.sin(time * 12) * 0.4;

      if (sophiaGroup.visible) {
        sophiaGroup.position.x = playerPos.x;
        sophiaGroup.position.z = playerPos.z - 18;
        sophiaGroup.position.y = 14 + Math.sin(time * 3) * 2;
        leftWing.rotation.z = Math.sin(time * 4) * 0.3;
        rightWing.rotation.z = -Math.sin(time * 4) * 0.3;
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const toPlayer = new THREE.Vector3().subVectors(playerPos, e.mesh.position);
        const dist = toPlayer.length();

        if (e.stagger >= 100) {
          e.mesh.rotation.y += delta * 6;
          (e.mesh.children[0] as THREE.Mesh).scale.set(1.1 + Math.sin(time * 15) * 0.1, 1.1, 1.1);
        } else {
          toPlayer.normalize();
          e.mesh.position.addScaledVector(toPlayer, e.speed);
          e.mesh.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
        }

        if (dist < 2.5 && e.stagger < 100) {
          const dmg = e.isBoss ? 25 : 8;
          propsRef.current.onPlayerDamaged(dmg);
        }

        if (dist < 4.5) {
          const critMult = e.stagger >= 100 ? 3.0 : 1.0;
          const pDmg = propsRef.current.playerStats.physicalDamage * (1 + Math.random() * 0.4) * critMult;
          e.hp -= pDmg;
          
          if (e.isBoss && e.stagger < 100) {
            e.stagger = Math.min(100, e.stagger + 4);
            setStaggerPercent(e.stagger);
            if (e.stagger >= 100) setIsStaggered(true);
          }

          setPrimordialEnergy(prev => Math.min(100, prev + 0.3));
        }

        if (e.hp <= 0) {
          scene.remove(e.mesh);
          enemies.splice(i, 1);

          propsRef.current.onEnemyKilled({
            id: e.id,
            type: 'enemy',
            name: e.name,
            x: e.mesh.position.x,
            y: e.mesh.position.z,
            radius: 1,
            hp: 0,
            maxHp: e.maxHp,
            speed: 0,
            damage: 0,
            color: '#ff0055',
            behavior: 'melee',
            xpReward: e.isBoss ? 2500 : 150,
            spriteType: 'drone',
            attackCooldown: 0,
            attackRange: 0
          });

          if (e.isBoss) {
            propsRef.current.onBossStateChange(null, null, null);
            setIsStaggered(false);
            setStaggerPercent(0);
          }

          if (!e.isBoss) {
            setTimeout(() => spawnEnemy(false), 2000);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentStage.id]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Boss Stagger Bar Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20">
        {staggerPercent > 0 && (
          <div className="w-80 md:w-96 bg-black/80 border border-yellow-500/50 p-2 rounded shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <div className="flex justify-between items-center text-[10px] font-orbitron font-bold text-yellow-400 mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                {isStaggered ? '⚡ STAGGERED // DÉGÂTS CRITIQUES ×300%' : 'JAUGE D’ÉBRANLEMENT (STAGGER)'}
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
              PRIMORDIAL FINAL FANTASY
            </div>
            <div className="text-xs font-orbitron font-black text-white">
              DEUS EX SOPHIA // COLOSSE 3D
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

        <div className="w-52 h-1.5 bg-gray-900 border border-cyan-500/30 rounded overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 transition-all duration-300"
            style={{ width: `${primordialEnergy}%` }}
          />
        </div>
      </div>
    </div>
  );
};
