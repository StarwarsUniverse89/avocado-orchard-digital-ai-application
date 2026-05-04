"use client";

import { useState, useEffect } from "react";
import { TreeData } from "@/lib/mockData";

interface OrchardTwin3DProps {
  trees: TreeData[];
  onTreeSelect?: (tree: TreeData) => void;
}

export default function OrchardTwin3D({ trees, onTreeSelect }: OrchardTwin3DProps) {
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  const getTreeColor = (tree: TreeData): string => {
    if (tree.health_status === "healthy") return "#00ff88";
    if (tree.health_status === "warning") return "#ffaa00";
    return "#ff4444";
  };

  const getTreeSize = (tree: TreeData): number => {
    const baseSize = 20;
    const healthMultiplier = tree.health / 100;
    return baseSize * healthMultiplier * zoom;
  };

  const handleTreeClick = (tree: TreeData) => {
    setSelectedTree(tree);
    onTreeSelect?.(tree);
  };

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-elevated rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-1">
            3D Digital Twin
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {trees.length} trees • Real-time health monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
            className="p-2 rounded-lg bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
            {(zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.2))}
            className="p-2 rounded-lg bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 3D-style Visualization */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden border border-gray-700 dark:border-gray-800">
        <div className="relative w-full" style={{ paddingBottom: "75%" }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 600 450"
            style={{
              transform: `perspective(1000px) rotateX(45deg) rotateZ(${rotation}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Ground Grid */}
            <defs>
              <pattern
                id="grid3d"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 30 0 L 0 0 0 30"
                  fill="none"
                  stroke="rgba(0, 212, 255, 0.1)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="600" height="450" fill="url(#grid3d)" opacity="0.5" />

            {/* Trees */}
            {trees.map((tree) => {
              const x = 50 + (tree.x / 6) * 40;
              const z = 50 + (tree.z / 6) * 30;
              const size = getTreeSize(tree);
              const color = getTreeColor(tree);
              const isSelected = selectedTree?.id === tree.id;

              return (
                <g key={tree.id} className="cursor-pointer group">
                  {/* Tree Shadow */}
                  <ellipse
                    cx={x}
                    cy={z + size * 0.8}
                    rx={size * 0.6}
                    ry={size * 0.3}
                    fill="rgba(0, 0, 0, 0.3)"
                    className="transition-all duration-300"
                  />

                  {/* Tree Trunk */}
                  <rect
                    x={x - size * 0.15}
                    y={z - size * 0.3}
                    width={size * 0.3}
                    height={size * 0.8}
                    fill="#8B4513"
                    className="transition-all duration-300"
                  />

                  {/* Tree Canopy */}
                  <circle
                    cx={x}
                    cy={z - size * 0.5}
                    r={size * 0.7}
                    fill={color}
                    opacity={isSelected ? 1 : 0.8}
                    stroke={isSelected ? "#ffffff" : color}
                    strokeWidth={isSelected ? 3 : 0}
                    className="transition-all duration-300 group-hover:opacity-100"
                    onClick={() => handleTreeClick(tree)}
                  />

                  {/* Glow effect for selected tree */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={z - size * 0.5}
                      r={size * 0.9}
                      fill={color}
                      opacity="0.3"
                      className="animate-pulse"
                    />
                  )}

                  {/* Health indicator */}
                  <text
                    x={x}
                    y={z - size * 1.2}
                    textAnchor="middle"
                    className="text-[8px] font-bold fill-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    {tree.health.toFixed(0)}%
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Camera Controls Overlay */}
          <div className="absolute top-4 right-4 glass rounded-lg p-2">
            <div className="text-xs text-gray-300 dark:text-gray-300 font-mono">
              Auto-Rotate: ON
            </div>
          </div>
        </div>
      </div>

      {/* Selected Tree Info */}
      {selectedTree && (
        <div className="mt-4 p-4 rounded-lg glass border border-gray-700 dark:border-gray-800">
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
          <div className="text-lg font-bold text-success">
            {trees.filter((t) => t.health_status === "healthy").length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Healthy</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gray-800/30 dark:bg-gray-800/30">
          <div className="text-lg font-bold text-warning">
            {trees.filter((t) => t.health_status === "warning").length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Warning</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-gray-800/30 dark:bg-gray-800/30">
          <div className="text-lg font-bold text-error">
            {trees.filter((t) => t.health_status === "risk").length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">At Risk</div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
