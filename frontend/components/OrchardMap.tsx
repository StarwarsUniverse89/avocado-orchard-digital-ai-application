"use client";

import { useState } from "react";

interface Tree {
  id: string;
  x: number;
  y: number;
  health: number;
  moisture: number;
  temperature: number;
}

export default function OrchardMap() {
  const [selectedOrchard, setSelectedOrchard] = useState("orchard_A");
  const [viewMode, setViewMode] = useState<"health" | "moisture" | "temperature">("health");

  // Generate deterministic mock tree data in a grid pattern.
  // Do NOT use Math.random() here because it causes Next.js hydration mismatch.
  const generateTrees = (): Tree[] => {
    const trees: Tree[] = [];
    const rows = 8;
    const cols = 12;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;

        trees.push({
          id: `tree-${row}-${col}`,
          x: col * 60 + 30,
          y: row * 60 + 30,
          health: 70 + ((index * 13) % 30),
          moisture: 40 + ((index * 17) % 40),
          temperature: 20 + ((index * 7) % 15),
        });
      }
    }

    return trees;
  };

  const [trees] = useState<Tree[]>(() => generateTrees());

  const getTreeColor = (tree: Tree): string => {
    let value: number;

    switch (viewMode) {
      case "health":
        value = tree.health;
        if (value >= 85) return "#00ff88";
        if (value >= 70) return "#00ffcc";
        if (value >= 50) return "#ffaa00";
        return "#ff4444";

      case "moisture":
        value = tree.moisture;
        if (value >= 70) return "#00d4ff";
        if (value >= 50) return "#00ffcc";
        if (value >= 30) return "#ffaa00";
        return "#ff4444";

      case "temperature":
        value = tree.temperature;
        if (value >= 18 && value <= 25) return "#00ff88";
        if (value >= 15 && value <= 30) return "#00ffcc";
        if (value >= 10 && value <= 35) return "#ffaa00";
        return "#ff4444";

      default:
        return "#00ffcc";
    }
  };

  const getMetricValue = (tree: Tree): string => {
    switch (viewMode) {
      case "health":
        return `${Math.round(tree.health)}%`;
      case "moisture":
        return `${Math.round(tree.moisture)}%`;
      case "temperature":
        return `${Math.round(tree.temperature)}°C`;
      default:
        return "";
    }
  };

  const healthyCount = trees.filter((tree) => tree.health >= 85).length;
  const monitoringCount = trees.filter(
    (tree) => tree.health >= 50 && tree.health < 85
  ).length;
  const riskCount = trees.filter((tree) => tree.health < 50).length;

  return (
    <div className="glass-elevated rounded-xl p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-50 mb-1">
            Digital Orchard Map
          </h2>
          <p className="text-sm text-gray-400">
            Real-time tree-level monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedOrchard}
            onChange={(event) => setSelectedOrchard(event.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="orchard_A">Orchard A</option>
            <option value="orchard_B">Orchard B</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setViewMode("health")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === "health"
              ? "bg-success/20 text-success border border-success/50"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Tree Health
        </button>

        <button
          type="button"
          onClick={() => setViewMode("moisture")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === "moisture"
              ? "bg-primary/20 text-primary border border-primary/50"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Soil Moisture
        </button>

        <button
          type="button"
          onClick={() => setViewMode("temperature")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === "temperature"
              ? "bg-warning/20 text-warning border border-warning/50"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Temperature
        </button>
      </div>

      <div className="relative bg-gray-900 rounded-lg p-8 overflow-hidden border border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 opacity-50" />

        <svg
          viewBox="0 0 720 480"
          className="w-full h-auto relative z-10"
          style={{ maxHeight: "500px" }}
          role="img"
          aria-label={`Digital orchard map for ${selectedOrchard}`}
        >
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(64, 64, 64, 0.3)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect width="720" height="480" fill="url(#grid)" />

          {trees.map((tree) => (
            <g key={tree.id} className="cursor-pointer group">
              <circle
                cx={tree.x}
                cy={tree.y}
                r="18"
                fill={getTreeColor(tree)}
                opacity="0.8"
                className="transition-all duration-300 group-hover:opacity-100"
              />

              <circle
                cx={tree.x}
                cy={tree.y}
                r="18"
                fill={getTreeColor(tree)}
                opacity="0.3"
                className="animate-pulse"
              />

              <text
                x={tree.x}
                y={tree.y + 4}
                textAnchor="middle"
                className="text-[10px] font-bold fill-gray-950 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {getMetricValue(tree)}
              </text>
            </g>
          ))}
        </svg>

        <div className="absolute bottom-4 right-4 glass rounded-lg p-3 text-xs">
          <div className="font-semibold text-gray-300 mb-2">Legend</div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-gray-400">Optimal</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-gray-400">Good</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-gray-400">Warning</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-error" />
              <span className="text-gray-400">Critical</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-50">{trees.length}</div>
          <div className="text-xs text-gray-400">Total Trees</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-success">{healthyCount}</div>
          <div className="text-xs text-gray-400">Healthy</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-warning">
            {monitoringCount}
          </div>
          <div className="text-xs text-gray-400">Monitoring</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-error">{riskCount}</div>
          <div className="text-xs text-gray-400">At Risk</div>
        </div>
      </div>
    </div>
  );
}