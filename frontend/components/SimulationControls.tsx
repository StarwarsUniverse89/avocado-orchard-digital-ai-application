"use client";

import { useState, useRef } from "react";
import gsap from "gsap";

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
  const [isSimulating, setIsSimulating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSimulate = () => {
    setIsSimulating(true);
    
    // Animate the simulation
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { scale: 0.98 },
        {
          scale: 1,
          duration: 0.3,
          ease: 'back.out(1.7)',
          onComplete: () => {
            onSimulate({
              heat_change: heatChange,
              moisture_change: moistureChange,
              pest_change: pestChange,
            });
            setTimeout(() => setIsSimulating(false), 500);
          }
        }
      );
    } else {
      onSimulate({
        heat_change: heatChange,
        moisture_change: moistureChange,
        pest_change: pestChange,
      });
      setTimeout(() => setIsSimulating(false), 500);
    }
  };

  const handleReset = () => {
    setHeatChange(0);
    setMoistureChange(0);
    setPestChange(0);
    onReset();
  };

  const handleQuickScenario = (scenario: string) => {
    let heat = 0, moisture = 0, pest = 0;
    
    switch (scenario) {
      case 'heat_stress':
        heat = 8;
        moisture = -20;
        break;
      case 'water_stress':
        moisture = -25;
        pest = 5;
        break;
      case 'pest_risk':
        pest = 15;
        break;
      case 'optimal':
        heat = -3;
        moisture = 15;
        pest = -5;
        break;
    }
    
    setHeatChange(heat);
    setMoistureChange(moisture);
    setPestChange(pest);
    
    // Auto-run simulation
    setTimeout(() => {
      onSimulate({ heat_change: heat, moisture_change: moisture, pest_change: pest });
    }, 300);
  };

  return (
    <div className="glass-elevated rounded-xl p-6" ref={containerRef}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-1">
            Simulation Controls
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Test scenarios and apply AI recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSimulating && (
            <span className="text-xs text-primary font-medium animate-pulse">
              Simulating...
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            GPU Accelerated
          </span>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
        </div>
      </div>

      {/* Quick Scenario Buttons */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Quick Scenarios
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickScenario('heat_stress')}
            disabled={isSimulating}
            className="px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 hover:border-orange-500 text-orange-300 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Heat Stress
          </button>
          <button
            onClick={() => handleQuickScenario('water_stress')}
            disabled={isSimulating}
            className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50 hover:border-blue-500 text-blue-300 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Water Stress
          </button>
          <button
            onClick={() => handleQuickScenario('pest_risk')}
            disabled={isSimulating}
            className="px-4 py-3 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 hover:border-red-500 text-red-300 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pest Risk
          </button>
          <button
            onClick={() => handleQuickScenario('optimal')}
            disabled={isSimulating}
            className="px-4 py-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 hover:border-green-500 text-green-300 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Optimal
          </button>
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
          disabled={isSimulating}
          className="px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-gray-950 font-semibold hover:opacity-90 transition-opacity glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSimulating ? 'Simulating...' : 'Run Custom'}
        </button>
        <button
          onClick={onApplyRecommendation}
          disabled={isSimulating}
          className="px-4 py-3 rounded-lg bg-success/20 border border-success/50 text-success font-semibold hover:bg-success/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply AI Fix
        </button>
        <button
          onClick={handleReset}
          disabled={isSimulating}
          className="px-4 py-3 rounded-lg bg-gray-800 dark:bg-gray-800 hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// Made with Bob
