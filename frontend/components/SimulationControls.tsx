"use client";

import { useState } from "react";

interface SimulationControlsProps {
  onSimulate: (scenario: {
    heat_change?: number;
    moisture_change?: number;
    pest_change?: number;
  }) => void;
  onReset: () => void;
  onApplyRecommendation: () => void;
}

export default function SimulationControls({
  onSimulate,
  onReset,
  onApplyRecommendation,
}: SimulationControlsProps) {
  const [heatChange, setHeatChange] = useState(0);
  const [moistureChange, setMoistureChange] = useState(0);
  const [pestChange, setPestChange] = useState(0);

  const handleSimulate = () => {
    onSimulate({
      heat_change: heatChange,
      moisture_change: moistureChange,
      pest_change: pestChange,
    });
  };

  const handleReset = () => {
    setHeatChange(0);
    setMoistureChange(0);
    setPestChange(0);
    onReset();
  };

  return (
    <div className="glass-elevated rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-1">
            Simulation Controls
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adjust conditions and see AI recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            GPU Accelerated
          </span>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="space-y-6 mb-6">
        {/* Temperature Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Temperature Change
            </label>
            <span className="text-sm font-mono text-gray-900 dark:text-gray-50">
              {heatChange > 0 ? "+" : ""}
              {heatChange}°C
            </span>
          </div>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.5"
            value={heatChange}
            onChange={(e) => setHeatChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-warning"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
            <span>Cooler</span>
            <span>Hotter</span>
          </div>
        </div>

        {/* Moisture Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Soil Moisture Change
            </label>
            <span className="text-sm font-mono text-gray-900 dark:text-gray-50">
              {moistureChange > 0 ? "+" : ""}
              {moistureChange}%
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={moistureChange}
            onChange={(e) => setMoistureChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
            <span>Drier</span>
            <span>Wetter</span>
          </div>
        </div>

        {/* Pest Pressure Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pest Pressure Change
            </label>
            <span className="text-sm font-mono text-gray-900 dark:text-gray-50">
              {pestChange > 0 ? "+" : ""}
              {pestChange}%
            </span>
          </div>
          <input
            type="range"
            min="-20"
            max="20"
            step="1"
            value={pestChange}
            onChange={(e) => setPestChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-error"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
            <span>Lower</span>
            <span>Higher</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleSimulate}
          className="px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-gray-950 font-semibold hover:opacity-90 transition-opacity glow-primary"
        >
          Run Simulation
        </button>
        <button
          onClick={onApplyRecommendation}
          className="px-4 py-3 rounded-lg bg-success/20 border border-success/50 text-success font-semibold hover:bg-success/30 transition-colors"
        >
          Apply AI Fix
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-3 rounded-lg bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-300 font-semibold transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Quick Scenarios */}
      <div className="mt-6 pt-6 border-t border-gray-700 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Quick Scenarios
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setHeatChange(8);
              setMoistureChange(-20);
              setPestChange(0);
            }}
            className="px-3 py-2 rounded-lg bg-gray-800/50 dark:bg-gray-800/50 hover:bg-gray-700/50 dark:hover:bg-gray-700/50 text-gray-300 dark:text-gray-300 text-sm transition-colors"
          >
            🌡️ Heat Wave
          </button>
          <button
            onClick={() => {
              setHeatChange(0);
              setMoistureChange(-25);
              setPestChange(5);
            }}
            className="px-3 py-2 rounded-lg bg-gray-800/50 dark:bg-gray-800/50 hover:bg-gray-700/50 dark:hover:bg-gray-700/50 text-gray-300 dark:text-gray-300 text-sm transition-colors"
          >
            💧 Drought
          </button>
          <button
            onClick={() => {
              setHeatChange(0);
              setMoistureChange(0);
              setPestChange(15);
            }}
            className="px-3 py-2 rounded-lg bg-gray-800/50 dark:bg-gray-800/50 hover:bg-gray-700/50 dark:hover:bg-gray-700/50 text-gray-300 dark:text-gray-300 text-sm transition-colors"
          >
            🐛 Pest Outbreak
          </button>
          <button
            onClick={() => {
              setHeatChange(-3);
              setMoistureChange(15);
              setPestChange(-5);
            }}
            className="px-3 py-2 rounded-lg bg-gray-800/50 dark:bg-gray-800/50 hover:bg-gray-700/50 dark:hover:bg-gray-700/50 text-gray-300 dark:text-gray-300 text-sm transition-colors"
          >
            ✨ Optimal
          </button>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
