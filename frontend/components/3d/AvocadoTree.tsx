"use client";

import { useRef, useMemo } from 'react';
import { Mesh, Color, InstancedMesh, Object3D, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeData, HealthStatus, FruitStage } from '@/types/orchard3d';

interface AvocadoTreeProps {
  data: TreeData;
  selected?: boolean;
  hovered?: boolean;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

// Color mapping for health status
const HEALTH_COLORS: Record<HealthStatus, string> = {
  healthy: '#00ff88',
  warning: '#ffaa00',
  risk: '#ff4444',
};

// Fruit size mapping
const FRUIT_SIZES: Record<FruitStage, number> = {
  small: 0.08,
  medium: 0.12,
  large: 0.16,
};

export default function AvocadoTree({
  data,
  selected = false,
  hovered = false,
  onClick,
  onPointerOver,
  onPointerOut,
}: AvocadoTreeProps) {
  const trunkRef = useRef<Mesh>(null);
  const canopyRef = useRef<Mesh>(null);
  const fruitsRef = useRef<InstancedMesh>(null);
  const glowRef = useRef<Mesh>(null);

  // Calculate colors based on health
  const canopyColor = useMemo(() => {
    const baseColor = new Color(HEALTH_COLORS[data.health_status]);
    // Darken based on stress level
    const stressFactor = 1 - (data.stress_level / 200);
    return baseColor.multiplyScalar(stressFactor);
  }, [data.health_status, data.stress_level]);

  const trunkColor = useMemo(() => {
    return new Color('#8B4513'); // Saddle brown
  }, []);

  const fruitColor = useMemo(() => {
    // Avocado color changes with ripeness
    const colors = {
      small: '#4a7c59', // Dark green
      medium: '#5a8c69', // Medium green
      large: '#3d5a45', // Darker, riper
    };
    return new Color(colors[data.fruit_stage]);
  }, [data.fruit_stage]);

  // Generate fruit positions
  const fruitPositions = useMemo(() => {
    const positions: Vector3[] = [];
    const canopyRadius = 1.5 * data.canopy_size;
    const fruitSize = FRUIT_SIZES[data.fruit_stage];
    
    // Generate fruit clusters
    data.fruit_clusters.forEach((cluster) => {
      const clusterPos = new Vector3(...cluster.position);
      
      // Add fruits in cluster
      for (let i = 0; i < cluster.count; i++) {
        const angle = (i / cluster.count) * Math.PI * 2;
        const radius = Math.random() * 0.3;
        const x = clusterPos.x + Math.cos(angle) * radius;
        const y = clusterPos.y + (Math.random() - 0.5) * 0.2;
        const z = clusterPos.z + Math.sin(angle) * radius;
        
        positions.push(new Vector3(x, y, z));
      }
    });
    
    return positions;
  }, [data.fruit_clusters, data.canopy_size, data.fruit_stage]);

  // Update fruit instances
  useMemo(() => {
    if (fruitsRef.current && fruitPositions.length > 0) {
      const dummy = new Object3D();
      const fruitSize = FRUIT_SIZES[data.fruit_stage];
      
      fruitPositions.forEach((pos, i) => {
        dummy.position.copy(pos);
        dummy.scale.setScalar(fruitSize);
        dummy.updateMatrix();
        fruitsRef.current!.setMatrixAt(i, dummy.matrix);
      });
      
      fruitsRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [fruitPositions, data.fruit_stage]);

  // Animate glow effect for selected tree
  useFrame((state) => {
    if (glowRef.current && selected) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const canopyRadius = 1.5 * data.canopy_size;
  const trunkHeight = data.trunk_height;
  const trunkRadius = data.trunk_radius;

  return (
    <group
      position={data.position}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* Trunk */}
      <mesh
        ref={trunkRef}
        position={[0, trunkHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[trunkRadius, trunkRadius * 1.2, trunkHeight, 8]} />
        <meshStandardMaterial
          color={trunkColor}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Canopy */}
      <mesh
        ref={canopyRef}
        position={[0, trunkHeight + canopyRadius * 0.6, 0]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[canopyRadius, 16, 16]} />
        <meshStandardMaterial
          color={canopyColor}
          roughness={0.7}
          metalness={0.1}
          emissive={canopyColor}
          emissiveIntensity={hovered ? 0.2 : 0.05}
        />
      </mesh>

      {/* Fruits (Instanced) */}
      {fruitPositions.length > 0 && (
        <instancedMesh
          ref={fruitsRef}
          args={[undefined, undefined, fruitPositions.length]}
          castShadow
          position={[0, trunkHeight + canopyRadius * 0.6, 0]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial
            color={fruitColor}
            roughness={0.6}
            metalness={0.2}
          />
        </instancedMesh>
      )}

      {/* Selection Glow */}
      {selected && (
        <mesh
          ref={glowRef}
          position={[0, trunkHeight + canopyRadius * 0.6, 0]}
        >
          <sphereGeometry args={[canopyRadius * 1.2, 16, 16]} />
          <meshBasicMaterial
            color={HEALTH_COLORS[data.health_status]}
            transparent
            opacity={0.2}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Hover Outline */}
      {hovered && !selected && (
        <mesh position={[0, trunkHeight + canopyRadius * 0.6, 0]}>
          <sphereGeometry args={[canopyRadius * 1.05, 16, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Pest Infestation Effect */}
      {data.pest_infestation && (
        <mesh position={[0, trunkHeight + canopyRadius * 0.6, 0]}>
          <sphereGeometry args={[canopyRadius * 1.1, 16, 16]} />
          <meshBasicMaterial
            color="#ff0000"
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

// Made with Bob
