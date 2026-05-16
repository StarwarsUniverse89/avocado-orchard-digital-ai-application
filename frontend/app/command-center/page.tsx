"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import type { GlobeCommandViewRef } from "@/components/GlobeCommandView";

// Dynamically import GlobeCommandView to avoid SSR issues with Cesium
const GlobeCommandView = dynamic(
  () => import("@/components/GlobeCommandView").then((mod) => ({ default: mod.GlobeCommandView })),
  { ssr: false }
);
import OrchardScene3D from "@/components/OrchardScene3D";
import AIAdvisorPanel from "@/components/AIAdvisorPanel";
import SimulationControls from "@/components/SimulationControls";
import AMDStatusPanel from "@/components/AMDStatusPanel";
import MetricCard from "@/components/MetricCard";
import RegionalOperationsPanel from "@/components/RegionalOperationsPanel";
import DroneMissionPanel from "@/components/DroneMissionPanel";
import OperatorWorkflowPanel from "@/components/OperatorWorkflowPanel";
import AnalyticsSummaryPanel from "@/components/AnalyticsSummaryPanel";
import FinancialPredictionPanel from "@/components/FinancialPredictionPanel";
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
import { UICommand, UICommandHandler } from "@/types/uiCommands";
import { resolveSelectionContext, SelectionContext, getContextDisplayName } from "@/lib/selectionContext";
import { getMLTrainingDatasetSummary, getOrchardBoundaryGeoJSONUrl } from "@/lib/api";
import gsap from "gsap";

export default function CommandCenter() {
  const [selectedOrchardId, setSelectedOrchardId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [orchardData, setOrchardData] = useState<OrchardData>(mockOrchards[0]);
  const [trees, setTrees] = useState<TreeData[]>(generateTreeGrid(10, 15));
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [viewMode, setViewMode] = useState<'globe' | '3d'>('globe');
  const [showAnalyticsSummary, setShowAnalyticsSummary] = useState(false);
  const [showFinancialPanel, setShowFinancialPanel] = useState(false);
  const [operatorRole, setOperatorRole] = useState<"regional" | "municipality" | "owner">("regional");
  const [networkSetupComplete, setNetworkSetupComplete] = useState(false);
  const viewContainerRef = useRef<HTMLDivElement>(null);
  const globeCommandRef = useRef<GlobeCommandViewRef>(null);

  // Selection state lifted from GlobeCommandView
  const [selectedMunicipality, setSelectedMunicipality] = useState<any>(null);
  const [selectedOrchardCandidate, setSelectedOrchardCandidate] = useState<any>(null);
  const [detectedOrchards, setDetectedOrchards] = useState<any[]>([]);
  const [archivedOrchards, setArchivedOrchards] = useState<any[]>([]);
  const [visionAnalysisResult, setVisionAnalysisResult] = useState<any>(null);
  const [activeDroneMission, setActiveDroneMission] = useState<any>(null);
  const [segmentedOrchardBlocks, setSegmentedOrchardBlocks] = useState<any[]>([]);
  const [selectedSegmentedBlock, setSelectedSegmentedBlock] = useState<any>(null);
  const [mlTrainingSummary, setMlTrainingSummary] = useState<any>(null);

  const visibleSegmentedBlocks = segmentedOrchardBlocks.filter((block, index) => {
    if (operatorRole === "regional") return true;
    if (operatorRole === "municipality") {
      return !selectedMunicipality?.id || block.municipality_id === selectedMunicipality.id;
    }
    return index < 2;
  });

  const handleSegmentedBlockSelected = (block: any) => {
    setSelectedSegmentedBlock(block);
    if (block?.block_id) {
      setSegmentedOrchardBlocks((prev) =>
        prev.map((item) => (item.block_id === block.block_id ? { ...item, ...block } : item))
      );
    }
  };

  // Resolve selection context for panels
  const selectionContext: SelectionContext = resolveSelectionContext({
    selectedOrchardCandidate: selectedSegmentedBlock || selectedOrchardCandidate,
    selectedArchivedOrchard: null, // TODO: implement archive selection
    selectedMunicipality,
  });

  // Determine drone mission target using explicit hierarchy priority
  const droneMissionTargetId = 
    selectedSegmentedBlock?.block_id ||
    selectedOrchardCandidate?.id || 
    selectedOrchardCandidate?.orchard_id || 
    selectedOrchardCandidate?.name || 
    selectedMunicipality?.id || 
    selectedMunicipality?.name || 
    "tancitaro";

  const droneMissionTargetType = 
    selectedSegmentedBlock ? "orchard_block" :
    selectedOrchardCandidate ? "orchard" : 
    selectedMunicipality ? "municipality" : 
    "demo";

  // Clear selectedOrchardCandidate when municipality changes
  useEffect(() => {
    if (selectedMunicipality && selectedOrchardCandidate) {
      // Only clear if the selected orchard doesn't belong to the new municipality
      if (selectedOrchardCandidate.municipality_id !== selectedMunicipality.id) {
        console.log('🔄 Municipality changed, clearing selected orchard candidate');
        setSelectedOrchardCandidate(null);
        setVisionAnalysisResult(null);
      }
    }
  }, [selectedMunicipality?.id]);

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

  useEffect(() => {
    const loadSummary = () => {
      getMLTrainingDatasetSummary().then((res) => {
        if (res.success) setMlTrainingSummary(res.data);
      });
    };
    loadSummary();
    const interval = setInterval(loadSummary, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOrchardSelect = (orchardId: string) => {
    setSelectedOrchardId(orchardId);
  };

  const handleSectionSelect = (orchardId: string, sectionId: string) => {
    setSelectedOrchardId(orchardId);
    setSelectedSection(sectionId);
    // Regenerate trees for the selected section
    setTrees(generateTreeGrid(10, 15));
    // Auto-switch to 3D view when section is selected
    handleViewToggle('3d');
  };

  const handleEnter3DTwin = (orchardId: string, sectionId?: string) => {
    setSelectedOrchardId(orchardId);
    if (sectionId) {
      setSelectedSection(sectionId);
    }
    handleViewToggle('3d');
  };

  const handleViewToggle = (mode: 'globe' | '3d') => {
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

  // Drone Mission placeholder for future Cesium route rendering
  const handleMissionPlanned = (missionData: any) => {
    console.log("🛸 Mission planned for Cesium visualization:", missionData);
    setActiveDroneMission(missionData);
  };

  // UI Command handler for AI advisor
  const handleUICommand: UICommandHandler = (command: UICommand) => {
    console.log('🎯 Executing command:', command);
    
    // Ensure we're in globe view for navigation commands
    const globeCommands = [
      'navigate_to_municipality',
      'show_avocado_belt',
      'show_production_clusters',
      'create_orchard_network',
      'scan_municipality_orchards',
      'navigate_to_orchard',
      'show_network',
      'show_stress_zones',
      'select_section',
      'select_orchard',
    ];
    
    if (globeCommands.includes(command.type) && viewMode !== 'globe') {
      setViewMode('globe');
    }
    
    switch (command.type) {
      // Mexico Network Commands - Pass directly to GlobeCommandView
      case 'navigate_to_municipality':
      case 'show_avocado_belt':
      case 'show_production_clusters':
      case 'create_orchard_network':
      case 'scan_municipality_orchards':
      case 'select_largest_orchard_candidate':
      case 'select_highest_stress_parcel':
      case 'save_orchard_to_archive':
      case 'run_vision_pipeline':
      case 'generate_3d_twin_from_orchard':
      case 'show_gps_boundary':
      case 'show_orchard_archive':
      case 'select_orchard':
        // These commands are handled by GlobeCommandView
        // Pass the command through via ref if available
        if (globeCommandRef.current?.handleCommand) {
          globeCommandRef.current.handleCommand(command);
        }
        break;
      
      // Data Query Commands
      case 'show_belt_metric':
        // Show analytics panel with belt-wide focus
        setShowAnalyticsSummary(true);
        setTimeout(() => {
          document.getElementById('analytics-panel')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
        break;
      
      case 'show_municipality_metric':
        // Show analytics panel focused on specific municipality
        setShowAnalyticsSummary(true);
        setTimeout(() => {
          document.getElementById('analytics-panel')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
        break;
      
      case 'show_detected_orchards':
      case 'show_archived_orchards':
      case 'show_high_stress_parcels':
        // Pass to GlobeCommandView to filter and display parcels
        if (globeCommandRef.current?.handleCommand) {
          globeCommandRef.current.handleCommand(command);
        }
        break;
      
      case 'show_selected_context_summary':
        // Show both analytics and financial panels
        setShowAnalyticsSummary(true);
        setShowFinancialPanel(true);
        setTimeout(() => {
          document.getElementById('analytics-panel')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
        break;
      
      case 'compare_municipalities':
        // TODO: Implement municipality comparison panel
        // For now, show analytics panel which will display comparison data
        setShowAnalyticsSummary(true);
        setTimeout(() => {
          document.getElementById('analytics-panel')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
        break;
        
      case 'navigate_to_orchard':
        // Switch to globe view if not already
        if (viewMode !== 'globe') {
          setViewMode('globe');
        }
        // Let GlobeCommandView handle the navigation
        setSelectedOrchardId(command.orchardId);
        break;
        
      case 'show_network':
        // Switch to globe view and reset selection
        setViewMode('globe');
        setSelectedOrchardId(null);
        setSelectedSection(null);
        break;
        
      case 'show_stress_zones':
        // Switch to globe view
        if (viewMode !== 'globe') {
          setViewMode('globe');
        }
        if (command.orchardId) {
          setSelectedOrchardId(command.orchardId);
        }
        break;
        
      case 'select_section':
        setSelectedOrchardId(command.orchardId);
        setSelectedSection(command.sectionId);
        if (viewMode !== 'globe') {
          setViewMode('globe');
        }
        break;
        
      case 'enter_3d_twin':
        handleEnter3DTwin(command.orchardId, command.sectionId);
        break;
        
      case 'run_simulation':
        // Map scenario type to simulation parameters
        const scenarioMap: Record<string, any> = {
          irrigation: { moisture_change: 20 },
          fertilization: { moisture_change: 10 },
          pest_control: { pest_change: -15 },
          harvest: {},
        };
        const params = scenarioMap[command.scenarioType] || { moisture_change: 10 };
        handleSimulate(params);
        break;
        
      case 'apply_recommendation':
        handleApplyRecommendation();
        break;
        
      case 'show_financial_impact':
        setShowFinancialPanel(true);
        // Scroll to financial panel
        setTimeout(() => {
          document.getElementById('financial-panel')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
        break;
        
      case 'create_analytics_summary':
        setShowAnalyticsSummary(true);
        // Scroll to analytics panel
        setTimeout(() => {
          document.getElementById('analytics-panel')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
        break;
        
      case 'reset_view':
        setViewMode('globe');
        setSelectedOrchardId(null);
        setSelectedSection(null);
        setShowAnalyticsSummary(false);
        setShowFinancialPanel(false);
        break;
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
              Operational Network Active • Gemini Mission Memory
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4 animate-fade-in">
              Gemini Orchard Operations OS
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl animate-fade-in">
              Map-driven mission planning, operational digital twin calibration,
              field execution, and human-in-the-loop approval for avocado agriculture.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Regional Operations Overview */}
        <RegionalOperationsPanel />

        {/* SaaS Role Simulation */}
        <section className="mb-6">
          <div className="glass-elevated rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">View Mode</h3>
              <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                Demo role simulation for operational network visibility.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["regional", "Regional Operator"],
                ["municipality", "Municipality Manager"],
                ["owner", "Orchard Owner"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setOperatorRole(value as typeof operatorRole)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    operatorRole === value
                      ? "bg-primary text-gray-950"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Debug: Current Context */}
        {process.env.NODE_ENV === 'development' && (
          <section className="mb-4">
            <div className="glass-elevated rounded-lg p-4 text-xs font-mono">
              <div className="font-bold text-primary mb-2">🔍 Debug: Current Context</div>
              <div className="grid grid-cols-2 gap-2 text-gray-300">
                <div>context_type: <span className="text-success">{selectionContext.context_type}</span></div>
                <div>context_id: <span className="text-success">{selectionContext.id}</span></div>
                <div>context_name: <span className="text-success">{selectionContext.name}</span></div>
                <div>municipality_id: <span className="text-success">{selectionContext.municipality_id || 'null'}</span></div>
                <div>selectedMunicipality: <span className="text-warning">{selectedMunicipality?.id || 'null'}</span></div>
                <div>selectedOrchardCandidate: <span className="text-warning">{selectedOrchardCandidate?.orchard_id || 'null'}</span></div>
                <div>detectedOrchards: <span className="text-info">{detectedOrchards.length}</span></div>
                <div>archivedOrchards: <span className="text-info">{archivedOrchards.length}</span></div>
              </div>
            </div>
          </section>
        )}
        
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Left Column - View Toggle and Visualization */}
          <div className="lg:col-span-3 space-y-6">
            {/* View Toggle */}
            <div className="glass-elevated rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  Primary Command Surface
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewToggle('globe')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      viewMode === 'globe'
                        ? 'bg-primary text-gray-950 shadow-lg'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    Globe Command
                  </button>
                  <button
                    onClick={() => handleViewToggle('3d')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      viewMode === '3d'
                        ? 'bg-primary text-gray-950 shadow-lg'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    Operational Digital Twin
                  </button>
                </div>
              </div>
            </div>

            {/* View Container with Animation */}
            <div ref={viewContainerRef}>
              {viewMode === 'globe' ? (
                <GlobeCommandView
                  ref={globeCommandRef}
                  onOrchardSelect={handleOrchardSelect}
                  onSectionSelect={handleSectionSelect}
                  onEnter3DTwin={handleEnter3DTwin}
                  selectedOrchardId={selectedOrchardId || undefined}
                  selectedSectionId={selectedSection || undefined}
                  commandHandler={handleUICommand}
                  onMunicipalitySelected={setSelectedMunicipality}
                  onOrchardCandidateSelected={setSelectedOrchardCandidate}
                  onDetectedOrchardsChanged={setDetectedOrchards}
                  onVisionAnalysisCompleted={setVisionAnalysisResult}
                  plannedMission={activeDroneMission}
                  segmentedOrchardBlocks={visibleSegmentedBlocks}
                  selectedSegmentedBlockId={selectedSegmentedBlock?.block_id}
                  onSegmentedBlockSelected={handleSegmentedBlockSelected}
                />
              ) : (
                <OrchardScene3D trees={trees} />
              )}
            </div>
          </div>

          {/* Right Column - Operator Workflow + AMD Status */}
          <div className="lg:col-span-1 space-y-6">
            <OperatorWorkflowPanel
              onMissionPlanned={handleMissionPlanned}
              defaultMunicipalityId={selectedMunicipality?.id || "tancitaro"}
              selectedBlock={selectedSegmentedBlock}
              segmentedBlocks={visibleSegmentedBlocks}
              onSegmentedBlocksChanged={setSegmentedOrchardBlocks}
              onBlockSelected={handleSegmentedBlockSelected}
              networkSetupComplete={networkSetupComplete}
              onNetworkSetupComplete={() => setNetworkSetupComplete(true)}
            />

            <AMDStatusPanel />

            {/* ML Training Data Feedback Loop */}
            <div className="glass-elevated rounded-xl p-4 animate-fade-in">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    ML Training Data
                  </h3>
                  <p className="text-[10px] text-gray-600 dark:text-gray-500 mt-1">
                    Human-labeled boundary archive · Training dataset preparation
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  mlTrainingSummary?.ready_for_training
                    ? "bg-emerald-900/40 text-emerald-400 border border-emerald-700/40"
                    : "bg-amber-900/40 text-amber-400 border border-amber-700/40"
                }`}>
                  {mlTrainingSummary?.ready_for_training ? "Ready" : "Preparing"}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total labels:</span>
                  <span className="text-gray-900 dark:text-gray-50 font-medium">
                    {mlTrainingSummary?.total_human_labeled_boundaries ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Accepted:</span>
                  <span className="text-success font-medium">{mlTrainingSummary?.accepted_labels ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Needs review:</span>
                  <span className="text-warning font-medium">{mlTrainingSummary?.needs_review_labels ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Non-orchard:</span>
                  <span className="text-gray-400 font-medium">{mlTrainingSummary?.non_orchard_labels ?? 0}</span>
                </div>
                <div className="pt-2 border-t border-gray-800/60">
                  <a
                    href={getOrchardBoundaryGeoJSONUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center py-1.5 rounded-lg text-xs font-semibold bg-cyan-700/80 text-white hover:bg-cyan-700 transition-colors"
                  >
                    Export GeoJSON
                  </a>
                </div>
                {mlTrainingSummary?.recommended_next_step && (
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    {mlTrainingSummary.recommended_next_step}
                  </p>
                )}
              </div>
            </div>

            {/* Drone Mission Control Panel */}
            <DroneMissionPanel 
              orchardId={droneMissionTargetId}
              targetType={droneMissionTargetType}
              onMissionPlanned={handleMissionPlanned}
            />
            
            {/* Current Selection Info */}
            {(selectedSegmentedBlock || selectedOrchardCandidate || selectedMunicipality) && (
              <div className="glass-elevated rounded-xl p-4 animate-fade-in">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3">
                  Current Selection
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="text-gray-900 dark:text-gray-50 font-medium capitalize">
                      {selectionContext.context_type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="text-gray-900 dark:text-gray-50 font-medium">
                      {getContextDisplayName(selectionContext)}
                    </span>
                  </div>
                  {(selectedSegmentedBlock?.estimated_tree_count || selectionContext.estimated_tree_count) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Trees:</span>
                      <span className="text-gray-900 dark:text-gray-50 font-medium">
                        {(selectedSegmentedBlock?.estimated_tree_count || selectionContext.estimated_tree_count).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectionContext.ndvi_average && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">NDVI:</span>
                      <span className="text-gray-900 dark:text-gray-50 font-medium">
                        {selectionContext.ndvi_average.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {(selectedSegmentedBlock?.stress_level || selectionContext.stress_level) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Stress:</span>
                      <span className={`font-medium ${
                        (selectedSegmentedBlock?.stress_level || selectionContext.stress_level) === 'high' ? 'text-error' :
                        (selectedSegmentedBlock?.stress_level || selectionContext.stress_level) === 'medium' ? 'text-warning' :
                        'text-success'
                      }`}>
                        {selectedSegmentedBlock?.stress_level || selectionContext.stress_level}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Financial Prediction - Compact */}
            {showFinancialPanel && (
              <div className="glass-elevated rounded-xl p-4 animate-fade-in">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-3">
                  Financial Impact
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                    <span className="text-success font-medium">${orchardData.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Forecast:</span>
                    <span className="text-primary font-medium">+12%</span>
                  </div>
                </div>
              </div>
            )}
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

        {/* AI Advisor - Compact */}
        <section className="mb-8">
          <AIAdvisorPanel onCommand={handleUICommand} />
        </section>

        {/* Analytics Summary Panel (conditionally shown) */}
        {showAnalyticsSummary && (
          <section id="analytics-panel" className="mb-8">
            <AnalyticsSummaryPanel
              selectionContext={selectionContext}
              selectedOrchardCandidate={selectedOrchardCandidate}
              selectedMunicipality={selectedMunicipality}
              detectedOrchards={detectedOrchards}
              archivedOrchards={archivedOrchards}
              visionAnalysisResult={visionAnalysisResult}
              visible={showAnalyticsSummary}
              onClose={() => setShowAnalyticsSummary(false)}
            />
          </section>
        )}

        {/* Financial Prediction Panel (conditionally shown) */}
        {showFinancialPanel && (
          <section id="financial-panel" className="mb-8">
            <FinancialPredictionPanel
              selectionContext={selectionContext}
              selectedOrchardCandidate={selectedOrchardCandidate}
              selectedMunicipality={selectedMunicipality}
              detectedOrchards={detectedOrchards}
              archivedOrchards={archivedOrchards}
              visible={showFinancialPanel}
              onClose={() => setShowFinancialPanel(false)}
            />
          </section>
        )}

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
