"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import SatelliteOrchardView from "@/components/SatelliteOrchardView";
import OrchardScene3D from "@/components/OrchardScene3D";
import AIAdvisorPanel from "@/components/AIAdvisorPanel";
import SimulationControls from "@/components/SimulationControls";
import AMDStatusPanel from "@/components/AMDStatusPanel";
import MetricCard from "@/components/MetricCard";
import {
  mockOrchards,
  generateTreeGrid,
  simulateLiveUpdate,
  applySimulation,
  generateRecommendations,
  OrchardData,
  TreeData,
  AIRecommendation,
} from "@/lib/mockData";
import gsap from "gsap";

export default function CommandCenter() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [orchardData, setOrchardData] = useState<OrchardData>(mockOrchards[0]);
  const [trees, setTrees] = useState<TreeData[]>(generateTreeGrid(10, 15));
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [viewMode, setViewMode] = useState<'satellite' | '3d'>('satellite');
  const viewContainerRef = useRef<HTMLDivElement>(null);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOrchardData((prev) => simulateLiveUpdate(prev));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update recommendations when orchard data changes
  useEffect(() => {
    setRecommendations(generateRecommendations(orchardData));
  }, [orchardData]);

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    // Regenerate trees for the selected section
    setTrees(generateTreeGrid(10, 15));
    // Auto-switch to 3D view when section is selected
    handleViewToggle('3d');
  };

  const handleViewToggle = (mode: 'satellite' | '3d') => {
    if (mode === viewMode) return;
    
    // GSAP animation for view transition
    if (viewContainerRef.current) {
      gsap.fromTo(
        viewContainerRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          onStart: () => setViewMode(mode)
        }
      );
    } else {
      setViewMode(mode);
    }
  };

  const handleSimulate = (scenario: {
    heat_change?: number;
    moisture_change?: number;
    pest_change?: number;
  }) => {
    setIsSimulating(true);
    const updated = applySimulation(orchardData, scenario);
    
    // Animate the change
    setTimeout(() => {
      setOrchardData(updated);
      setIsSimulating(false);
    }, 500);
  };

  const handleReset = () => {
    setOrchardData(mockOrchards[0]);
    setTrees(generateTreeGrid(10, 15));
  };

  const handleApplyRecommendation = () => {
    // Apply the top recommendation
    if (recommendations.length > 0) {
      const topRec = recommendations[0];
      if (topRec.recommendation.includes("Irrigation")) {
        handleSimulate({ moisture_change: 20 });
      } else if (topRec.recommendation.includes("Pest")) {
        handleSimulate({ pest_change: -15 });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="container mx-auto px-6 py-12 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Live System Active • {trees.length} Trees Monitored
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4 animate-fade-in">
              Orchard Command Center
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl animate-fade-in">
              Real-time digital twin monitoring, AI-driven recommendations, and
              GPU-accelerated simulation powered by AMD MI300X infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Average Yield"
              value={orchardData.yield_per_tree}
              unit="kg/tree"
              change={8.5}
              trend="up"
              icon="🥑"
              status="success"
            />
            <MetricCard
              title="Soil Moisture"
              value={orchardData.soil_moisture.toFixed(1)}
              unit="%"
              change={-5.2}
              trend={orchardData.soil_moisture < 50 ? "down" : "neutral"}
              icon="💧"
              status={orchardData.soil_moisture < 50 ? "warning" : "info"}
            />
            <MetricCard
              title="Temperature"
              value={orchardData.temperature.toFixed(1)}
              unit="°C"
              change={2.1}
              trend="up"
              icon="🌡️"
              status={orchardData.temperature > 30 ? "warning" : "info"}
            />
            <MetricCard
              title="Revenue Forecast"
              value={`$${(orchardData.revenue / 1000).toFixed(1)}k`}
              change={3.4}
              trend="up"
              icon="💰"
              status="success"
            />
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - View Toggle and Visualization */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Toggle */}
            <div className="glass-elevated rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  Visualization Mode
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewToggle('satellite')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      viewMode === 'satellite'
                        ? 'bg-primary text-gray-950 shadow-lg'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    🛰️ Satellite View
                  </button>
                  <button
                    onClick={() => handleViewToggle('3d')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      viewMode === '3d'
                        ? 'bg-primary text-gray-950 shadow-lg'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    🎮 3D Twin
                  </button>
                </div>
              </div>
            </div>

            {/* View Container with Animation */}
            <div ref={viewContainerRef}>
              {viewMode === 'satellite' ? (
                <SatelliteOrchardView onSectionSelect={handleSectionSelect} />
              ) : (
                <OrchardScene3D trees={trees} />
              )}
            </div>
          </div>

          {/* Right Column - AMD Status */}
          <div className="lg:col-span-1">
            <AMDStatusPanel />
          </div>
        </div>

        {/* Simulation Controls */}
        {selectedSection && (
          <div className="mb-8 animate-fade-in">
            <SimulationControls
              onSimulate={handleSimulate}
              onReset={handleReset}
              onApplyRecommendation={handleApplyRecommendation}
            />
          </div>
        )}

        {/* AI Advisor */}
        <section className="mb-8">
          <AIAdvisorPanel />
        </section>

        {/* Predictive Insights */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">
            Predictive Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-elevated rounded-xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center text-2xl">
                  📈
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                    Yield Forecast
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Next 90 days</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                {(orchardData.yield_per_tree * orchardData.trees_count).toLocaleString()} kg
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Expected harvest based on current conditions
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success font-medium">↑ 12%</span>
                <span className="text-gray-500 dark:text-gray-500">vs last season</span>
              </div>
            </div>

            <div className="glass-elevated rounded-xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-2xl">
                  💰
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                    Revenue Projection
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Market analysis</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                ${orchardData.revenue.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Estimated revenue at current market conditions
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary font-medium">Market: Strong</span>
              </div>
            </div>

            <div className="glass-elevated rounded-xl p-6 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center text-2xl">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-50">Risk Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Threat assessment</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                {orchardData.health_status === "healthy" ? "Low" : orchardData.health_status === "warning" ? "Medium" : "High"}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {recommendations.length} active recommendations
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-warning font-medium">
                  {recommendations.filter(r => r.priority === "high").length} High Priority
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Made with Bob
