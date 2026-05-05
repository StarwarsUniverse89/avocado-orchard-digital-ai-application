"use client";

import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import { TreeData } from '@/lib/mockData';
import AvocadoTree from './3d/AvocadoTree';
import SceneLighting from './3d/SceneLighting';
import { TreeData as TreeData3D, HealthStatus, FruitStage } from '@/types/orchard3d';
import * as THREE from 'three';
import gsap from 'gsap';

interface OrchardScene3DProps {
  trees: TreeData[];
  onTreeSelect?: (tree: TreeData) => void;
}

// Convert mock TreeData to 3D TreeData
function convertToTreeData3D(tree: TreeData, index: number): TreeData3D {
  const row = Math.floor(index / 10);
  const col = index % 10;
  const fruitStage: FruitStage = tree.fruit_count > 80 ? 'large' : tree.fruit_count > 40 ? 'medium' : 'small';
  
  return {
    id: tree.id,
    position: [col * 5 - 22.5, 0, row * 5 - 17.5] as [number, number, number],
    section: 'A1',
    health_status: tree.health_status as HealthStatus,
    health: tree.health,
    moisture: tree.moisture,
    temperature: tree.temperature,
    canopy_size: 0.8 + (tree.health / 100) * 0.4,
    trunk_height: 2.5,
    trunk_radius: 0.2,
    fruit_count: tree.fruit_count,
    fruit_stage: fruitStage,
    fruit_clusters: generateFruitClusters(tree.fruit_count, fruitStage),
    stress_level: 100 - tree.health,
    pest_infestation: tree.health_status === 'risk',
    disease_present: false,
  };
}

function generateFruitClusters(fruitCount: number, stage: FruitStage) {
  const clusterCount = Math.ceil(fruitCount / 15);
  const clusters = [];
  
  for (let i = 0; i < clusterCount; i++) {
    const angle = (i / clusterCount) * Math.PI * 2;
    const radius = 0.8 + Math.random() * 0.4;
    clusters.push({
      position: [
        Math.cos(angle) * radius,
        Math.random() * 0.5,
        Math.sin(angle) * radius,
      ] as [number, number, number],
      count: Math.floor(fruitCount / clusterCount),
      stage: stage,
    });
  }
  
  return clusters;
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading 3D Scene...</p>
      </div>
    </div>
  );
}

function Scene({ trees3D, onTreeClick, selectedTreeId }: { 
  trees3D: TreeData3D[], 
  onTreeClick: (tree: TreeData3D) => void,
  selectedTreeId: string | null 
}) {
  const [hoveredTreeId, setHoveredTreeId] = useState<string | null>(null);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 25, 35]} fov={50} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={80}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
      />
      
      <SceneLighting />
      
      <Environment preset="sunset" />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2d3a2e" roughness={0.8} />
      </mesh>
      
      {/* Grid */}
      <Grid
        args={[100, 100]}
        cellSize={5}
        cellThickness={0.5}
        cellColor="#3a4a3b"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#4a5a4b"
        fadeDistance={80}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />
      
      {/* Trees */}
      {trees3D.map((tree) => (
        <AvocadoTree
          key={tree.id}
          data={tree}
          selected={selectedTreeId === tree.id}
          hovered={hoveredTreeId === tree.id}
          onClick={() => onTreeClick(tree)}
          onPointerOver={() => setHoveredTreeId(tree.id)}
          onPointerOut={() => setHoveredTreeId(null)}
        />
      ))}
    </>
  );
}

export default function OrchardScene3D({ trees, onTreeSelect }: OrchardScene3DProps) {
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);
  const [trees3D, setTrees3D] = useState<TreeData3D[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const converted = trees.map((tree, index) => convertToTreeData3D(tree, index));
    setTrees3D(converted);
  }, [trees]);

  const handleTreeClick = (tree3D: TreeData3D) => {
    const originalTree = trees.find(t => t.id === tree3D.id);
    if (originalTree) {
      setSelectedTree(originalTree);
      onTreeSelect?.(originalTree);
      
      // Animate selection with GSAP
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { scale: 0.98 },
          { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );
      }
    }
  };

  const healthyCount = trees.filter(t => t.health_status === 'healthy').length;
  const warningCount = trees.filter(t => t.health_status === 'warning').length;
  const riskCount = trees.filter(t => t.health_status === 'risk').length;

  return (
    <div className="glass-elevated rounded-xl p-6" ref={containerRef}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-1">
            3D Digital Twin
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {trees.length} trees • Real-time 3D monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            React Three Fiber
          </span>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 dark:border-gray-800" style={{ height: '500px' }}>
        <Canvas shadows>
          <Suspense fallback={null}>
            <Scene 
              trees3D={trees3D} 
              onTreeClick={handleTreeClick}
              selectedTreeId={selectedTree?.id || null}
            />
          </Suspense>
        </Canvas>
        
        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 glass rounded-lg p-3 text-xs text-gray-300">
          <div className="font-semibold mb-2">Controls</div>
          <div className="space-y-1 text-gray-400">
            <div>🖱️ Left: Rotate</div>
            <div>🖱️ Right: Pan</div>
            <div>🖱️ Scroll: Zoom</div>
          </div>
        </div>
      </div>

      {/* Selected Tree Info */}
      {selectedTree && (
        <div className="mt-4 p-4 rounded-lg glass border border-gray-700 dark:border-gray-800 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-2">
                Tree {selectedTree.id}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Health:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-gray-50">
                    {selectedTree.health.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Moisture:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-gray-50">
                    {selectedTree.moisture.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Temperature:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-gray-50">
                    {selectedTree.temperature.toFixed(1)}°C
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Fruit Count:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-gray-50">
                    {selectedTree.fruit_count}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedTree(null)}
              className="p-1 rounded hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center p-3 rounded-lg bg-gray-800/30 dark:bg-gray-800/30">
          <div className="text-lg font-bold text-success">{healthyCount}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Healthy</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gray-800/30 dark:bg-gray-800/30">
          <div className="text-lg font-bold text-warning">{warningCount}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Warning</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gray-800/30 dark:bg-gray-800/30">
          <div className="text-lg font-bold text-error">{riskCount}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">At Risk</div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob