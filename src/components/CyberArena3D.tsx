import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Plane, Box } from '@react-three/drei';
import * as THREE from 'three';

interface CyberArena3DProps {
  gameStateRef: any;
}

const EnemyMesh: React.FC<{ enemy: any; gameStateRef: any }> = ({ enemy, gameStateRef }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current && gameStateRef.enemies) {
      // Find the live enemy data
      const liveEn = gameStateRef.enemies.find((e: any) => e.id === enemy.id);
      if (liveEn) {
        meshRef.current.position.set(liveEn.x / 10, 1, liveEn.y / 10);
      } else {
        // If enemy died, hide it
        meshRef.current.visible = false;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[enemy.x / 10, 1, enemy.y / 10]} castShadow>
      <sphereGeometry args={[enemy.isBoss ? 3 : 1.5, 16, 16]} />
      <meshStandardMaterial color={enemy.isBoss ? "#ff00ff" : "#ff0055"} emissive={enemy.isBoss ? "#ff00ff" : "#ff0055"} emissiveIntensity={0.6} />
    </mesh>
  );
};

const SceneContent: React.FC<CyberArena3DProps> = ({ gameStateRef }) => {
  // We need state for the enemy list to add/remove components when enemies spawn/die
  const [enemiesList, setEnemiesList] = React.useState<any[]>([]);

  useFrame(() => {
    // Only update the react state if the length changed to avoid re-renders
    if (gameStateRef.enemies && gameStateRef.enemies.length !== enemiesList.length) {
      setEnemiesList([...gameStateRef.enemies]);
    }
  });
  const playerMeshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ camera }) => {
    if (playerMeshRef.current && gameStateRef && gameStateRef.playerPos) {
      const px = gameStateRef.playerPos.x / 10;
      const pz = gameStateRef.playerPos.y / 10;
      
      playerMeshRef.current.position.set(px, 1, pz);

      // Smoothly interpolate camera position to follow player (isometric offset)
      camera.position.lerp(new THREE.Vector3(px, 40, pz + 40), 0.1);
      camera.lookAt(px, 0, pz);
    }
  });

  return (
    <>
      
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#00f3ff" />
      <pointLight position={[-10, 5, -10]} intensity={2} color="#ff00ff" />
      <pointLight position={[0, 15, 0]} intensity={5} color="#ff0055" />

      <Environment preset="night" />

      <Plane args={[2000, 2000]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#030712" roughness={0.1} metalness={0.8} />
      </Plane>
      <gridHelper args={[2000, 200, "#ff00ff", "#00f3ff"]} position={[0, 0.01, 0]} />

      <Box ref={playerMeshRef} args={[2, 4, 2]} castShadow>
        <meshStandardMaterial color="#00ff41" emissive="#00ff41" emissiveIntensity={0.5} />
      </Box>

      {/* Render Enemies */}
      {enemiesList.map((en: any) => (
        <EnemyMesh key={en.id} enemy={en} gameStateRef={gameStateRef} />
      ))}

      <ContactShadows resolution={512} scale={100} blur={2} opacity={0.5} far={10} color="#000" />
    </>
  );
};

export const CyberArena3D: React.FC<CyberArena3DProps> = (props) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-black z-0">
      <Canvas shadows camera={{ position: [0, 40, 40], fov: 45 }}>
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
};
