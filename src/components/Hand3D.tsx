import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

function VeinPath({ points, color, glowIntensity = 1 }: { points: THREE.Vector3[], color: string, glowIntensity?: number }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const tubeGeometry = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.02, 8, false), [curve]);
  
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3 * glowIntensity;
    }
  });

  return (
    <mesh geometry={tubeGeometry}>
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.9}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

function HandModel() {
  const handRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (handRef.current) {
      handRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      handRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  // Create realistic vein paths
  const primaryVein = useMemo(() => [
    new THREE.Vector3(-0.3, -0.8, 0),
    new THREE.Vector3(-0.2, -0.4, 0.02),
    new THREE.Vector3(-0.1, 0, 0.03),
    new THREE.Vector3(0, 0.4, 0.02),
    new THREE.Vector3(0.1, 0.8, 0),
  ], []);

  const secondaryVein = useMemo(() => [
    new THREE.Vector3(0.3, -0.8, 0),
    new THREE.Vector3(0.25, -0.4, 0.01),
    new THREE.Vector3(0.15, 0, 0.02),
    new THREE.Vector3(0.1, 0.3, 0.01),
    new THREE.Vector3(0.05, 0.6, 0),
  ], []);

  const tertiaryVein = useMemo(() => [
    new THREE.Vector3(-0.15, -0.6, 0.01),
    new THREE.Vector3(0.05, -0.2, 0.02),
    new THREE.Vector3(0.2, 0.2, 0.01),
  ], []);

  return (
    <group ref={handRef} position={[0, 0, 0]}>
      {/* Semi-transparent hand/arm shape */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.4, 1.4, 16, 32]} />
        <meshPhysicalMaterial
          color="#f5d0c5"
          transparent
          opacity={0.35}
          roughness={0.5}
          metalness={0}
          transmission={0.3}
          thickness={0.5}
          clearcoat={0.2}
        />
      </mesh>

      {/* Inner tissue layer */}
      <mesh position={[0, 0, 0]} scale={0.9}>
        <capsuleGeometry args={[0.38, 1.3, 16, 32]} />
        <meshPhysicalMaterial
          color="#e8b4a8"
          transparent
          opacity={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Vein paths */}
      <VeinPath points={primaryVein} color="#22c55e" glowIntensity={1.5} />
      <VeinPath points={secondaryVein} color="#eab308" glowIntensity={1} />
      <VeinPath points={tertiaryVein} color="#ef4444" glowIntensity={0.8} />

      {/* Injection point marker */}
      <mesh position={[-0.1, 0, 0.05]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Injection point glow ring */}
      <mesh position={[-0.1, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.08, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Hand3D() {
  return (
    <div className="w-full h-full min-h-[400px] relative">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} color="#0ea5e9" />
        <pointLight position={[0, 0, 3]} intensity={0.5} color="#22c55e" />
        
        <HandModel />
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={5}
          autoRotate
          autoRotateSpeed={0.5}
        />
        <Environment preset="studio" />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-panel rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-vein-primary shadow-glow-success" />
          <span className="text-xs text-foreground">Primary Vein (Best)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning shadow-glow-warning" />
          <span className="text-xs text-foreground">Secondary Vein</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive shadow-glow-danger" />
          <span className="text-xs text-foreground">Avoid / Injection Point</span>
        </div>
      </div>
    </div>
  );
}
