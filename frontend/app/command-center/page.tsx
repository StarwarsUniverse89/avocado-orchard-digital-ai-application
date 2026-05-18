"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import type { GlobeCommandViewRef } from "@/components/GlobeCommandView";
import OrchardScene3D from "@/components/OrchardScene3D";
import AIAdvisorPanel from "@/components/AIAdvisorPanel";
import SimulationControls from "@/components/SimulationControls";
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

const GlobeCommandView = dynamic(
  () => import("@/components/GlobeCommandView").then((mod) => ({ default: mod.GlobeCommandView })),
  { ssr: false }
);

type OperatorRole = "regional" | "municipality" | "owner";
type ViewMode = "globe" | "3d";
type ActiveModule =
  | "regional"
  | "network"
  | "segmentation"
  | "manual"
  | "drone"
  | "inspection"
  | "roi"
  | "tasking"
  | "ml"
  | "settings";

const operationsModules: Array<{
  id: ActiveModule;
  label: string;
  kicker: string;
  status: "live" | "review" | "approval" | "ready";
}> = [
  { id: "regional", label: "Regional Overview", kicker: "Regional Command", status: "live" },
  { id: "network", label: "Network Setup", kicker: "Owner Workspace", status: "ready" },
  { id: "segmentation", label: "Segmentation Review", kicker: "Review Required", status: "review" },
  { id: "manual", label: "Manual Boundary Archive", kicker: "ML Label Archive", status: "ready" },
  { id: "drone", label: "Drone Missions", kicker: "Mission Control", status: "live" },
  { id: "inspection", label: "Inspection Analysis", kicker: "Field Intelligence", status: "ready" },
  { id: "roi", label: "ROI / Financial Exposure", kicker: "Financial Exposure", status: "ready" },
  { id: "tasking", label: "Task Delegation", kicker: "Field Tasking", status: "approval" },
  { id: "ml", label: "ML Training Data", kicker: "Operational Memory", status: "ready" },
  { id: "settings", label: "Settings / Integrations", kicker: "Gemini + Memory", status: "ready" },
];

function StatusPill({ label, value, tone = "cyan" }: { label: string; value: string; tone?: "cyan" | "green" | "amber" | "red" }) {
  const tones = {
    cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
    green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    amber: "border-amber-400/25 bg-amber-400/10 text-amber-200",
    red: "border-red-400/25 bg-red-400/10 text-red-200",
  };

  return (
    <div className={`rounded-md border px-3 py-2 ${tones[tone]}`}>
      <div className="text-[10px] uppercase tracking-[0.18em] opacity-70">{label}</div>
      <div className="mt-1 flex items-center gap-2 text-xs font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
        {value}
      </div>
    </div>
  );
}

function IntelligenceRow({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 py-2 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-right text-xs font-semibold ${tone || "text-gray-200"}`}>{value}</span>
    </div>
  );
}

function ModuleStatus({ status }: { status: "live" | "review" | "approval" | "ready" }) {
  const styles = {
    live: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    review: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    approval: "bg-red-400/10 text-red-300 border-red-400/20",
    ready: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
  };
  const labels = {
    live: "Live",
    review: "Review",
    approval: "Approval",
    ready: "Ready",
  };

  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles[status]}`}>{labels[status]}</span>;
}

export default function CommandCenter() {
  const [selectedOrchardId, setSelectedOrchardId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [orchardData, setOrchardData] = useState<OrchardData>(mockOrchards[0]);
  const [trees, setTrees] = useState<TreeData[]>(generateTreeGrid(10, 15));
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("globe");
  const [showAnalyticsSummary, setShowAnalyticsSummary] = useState(false);
  const [showFinancialPanel, setShowFinancialPanel] = useState(false);
  const [operatorRole, setOperatorRole] = useState<OperatorRole>("regional");
  const [networkSetupComplete, setNetworkSetupComplete] = useState(false);
  const [activeModule, setActiveModule] = useState<ActiveModule>("regional");
  const viewContainerRef = useRef<HTMLDivElement>(null);
  const globeCommandRef = useRef<GlobeCommandViewRef>(null);

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
    if (operatorRole === "municipality") return !selectedMunicipality?.id || block.municipality_id === selectedMunicipality.id;
    return index < 2;
  });

  const handleSegmentedBlockSelected = (block: any) => {
    setSelectedSegmentedBlock(block);
    setActiveModule("segmentation");
    if (block?.block_id) {
      setSegmentedOrchardBlocks((prev) => prev.map((item) => (item.block_id === block.block_id ? { ...item, ...block } : item)));
    }
  };

  const selectionContext: SelectionContext = resolveSelectionContext({
    selectedOrchardCandidate: selectedSegmentedBlock || selectedOrchardCandidate,
    selectedArchivedOrchard: null,
    selectedMunicipality,
  });

  const droneMissionTargetId =
    selectedSegmentedBlock?.block_id ||
    selectedOrchardCandidate?.id ||
    selectedOrchardCandidate?.orchard_id ||
    selectedOrchardCandidate?.name ||
    selectedMunicipality?.id ||
    selectedMunicipality?.name ||
    "tancitaro";

  const droneMissionTargetType =
    selectedSegmentedBlock ? "orchard_block" : selectedOrchardCandidate ? "orchard" : selectedMunicipality ? "municipality" : "demo";

  useEffect(() => {
    if (selectedMunicipality && selectedOrchardCandidate && selectedOrchardCandidate.municipality_id !== selectedMunicipality.id) {
      setSelectedOrchardCandidate(null);
      setVisionAnalysisResult(null);
    }
  }, [selectedMunicipality?.id]);

  useEffect(() => {
    const interval = setInterval(() => setOrchardData((prev) => simulateLiveUpdate(prev)), 3000);
    return () => clearInterval(interval);
  }, []);

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

  const handleOrchardSelect = (orchardId: string) => setSelectedOrchardId(orchardId);

  const handleSectionSelect = (orchardId: string, sectionId: string) => {
    setSelectedOrchardId(orchardId);
    setSelectedSection(sectionId);
    setTrees(generateTreeGrid(10, 15));
    handleViewToggle("3d");
  };

  const handleEnter3DTwin = (orchardId: string, sectionId?: string) => {
    setSelectedOrchardId(orchardId);
    if (sectionId) setSelectedSection(sectionId);
    handleViewToggle("3d");
  };

  const handleViewToggle = (mode: ViewMode) => {
    if (mode === viewMode) return;
    if (viewContainerRef.current) {
      gsap.fromTo(
        viewContainerRef.current,
        { opacity: 0, scale: 0.98, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power2.out", onStart: () => setViewMode(mode) }
      );
    } else {
      setViewMode(mode);
    }
  };

  const handleMissionPlanned = (missionData: any) => {
    setActiveDroneMission(missionData);
    setActiveModule("drone");
  };

  const handleUICommand: UICommandHandler = (command: UICommand) => {
    const globeCommands = [
      "navigate_to_municipality",
      "show_avocado_belt",
      "show_production_clusters",
      "create_orchard_network",
      "scan_municipality_orchards",
      "navigate_to_orchard",
      "show_network",
      "show_stress_zones",
      "select_section",
      "select_orchard",
    ];

    if (globeCommands.includes(command.type) && viewMode !== "globe") setViewMode("globe");

    switch (command.type) {
      case "navigate_to_municipality":
      case "show_avocado_belt":
      case "show_production_clusters":
      case "create_orchard_network":
      case "scan_municipality_orchards":
      case "select_largest_orchard_candidate":
      case "select_highest_stress_parcel":
      case "save_orchard_to_archive":
      case "run_vision_pipeline":
      case "generate_3d_twin_from_orchard":
      case "show_gps_boundary":
      case "show_orchard_archive":
      case "select_orchard":
        globeCommandRef.current?.handleCommand(command);
        break;
      case "show_belt_metric":
      case "show_municipality_metric":
      case "show_selected_context_summary":
      case "compare_municipalities":
      case "create_analytics_summary":
        setShowAnalyticsSummary(true);
        setActiveModule("inspection");
        break;
      case "navigate_to_orchard":
        setSelectedOrchardId(command.orchardId);
        break;
      case "show_network":
        setViewMode("globe");
        setSelectedOrchardId(null);
        setSelectedSection(null);
        setActiveModule("network");
        break;
      case "show_stress_zones":
        if (command.orchardId) setSelectedOrchardId(command.orchardId);
        setActiveModule("segmentation");
        break;
      case "select_section":
        setSelectedOrchardId(command.orchardId);
        setSelectedSection(command.sectionId);
        setViewMode("globe");
        break;
      case "enter_3d_twin":
        handleEnter3DTwin(command.orchardId, command.sectionId);
        break;
      case "run_simulation":
        handleSimulate({ moisture_change: command.scenarioType === "irrigation" ? 20 : 10, pest_change: command.scenarioType === "pest_control" ? -15 : undefined });
        break;
      case "apply_recommendation":
        handleApplyRecommendation();
        break;
      case "show_financial_impact":
        setShowFinancialPanel(true);
        setActiveModule("roi");
        break;
      case "reset_view":
        setViewMode("globe");
        setSelectedOrchardId(null);
        setSelectedSection(null);
        setShowAnalyticsSummary(false);
        setShowFinancialPanel(false);
        break;
      default:
        break;
    }
  };

  const handleSimulate = (scenario: { heat_change?: number; moisture_change?: number; pest_change?: number }) => {
    setIsSimulating(true);
    const updated = applySimulation(orchardData, scenario);
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
    const topRec = recommendations[0];
    if (!topRec) return;
    if (topRec.recommendation.includes("Irrigation")) handleSimulate({ moisture_change: 20 });
    if (topRec.recommendation.includes("Pest")) handleSimulate({ pest_change: -15 });
  };

  const contextName = getContextDisplayName(selectionContext);
  const memoryTone = mlTrainingSummary?.latest_export ? "green" : "amber";

  return (
    <div className="min-h-screen bg-[#05070b] text-gray-100">
      <Header />

      <main className="relative h-auto min-h-[calc(100vh-73px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.12),transparent_34%),linear-gradient(135deg,#05070b_0%,#10151f_48%,#07110d_100%)]">
        <div className="grid min-h-[calc(100vh-73px)] grid-cols-1 gap-0 xl:grid-cols-[300px_minmax(0,1fr)_390px]">
          <aside className="border-r border-white/10 bg-black/35 px-4 py-5 backdrop-blur-xl xl:h-[calc(100vh-73px)] xl:overflow-y-auto">
            <div className="mb-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Operations Navigation</div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Regional Command</h1>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                Gemini Orchard Operations OS for mission planning, field execution, operational memory, and ML label archive readiness.
              </p>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-2">
              <StatusPill label="Gemini" value="Mock" tone="cyan" />
              <StatusPill label="MongoDB Memory" value={mlTrainingSummary?.latest_export ? "Live" : "Fallback"} tone={memoryTone} />
              <StatusPill label="Segmentation" value="Review Required" tone="amber" />
              <StatusPill label="Human Approval" value="Required" tone="red" />
            </div>

            <div className="space-y-1.5">
              {operationsModules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full rounded-lg border px-3 py-3 text-left transition-all ${
                    activeModule === module.id
                      ? "border-cyan-400/45 bg-cyan-400/12 shadow-[0_0_24px_rgba(0,212,255,0.12)]"
                      : "border-white/5 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-100">{module.label}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-gray-500">{module.kicker}</div>
                    </div>
                    <ModuleStatus status={module.status} />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500">View Mode</div>
              <div className="mt-3 grid gap-2">
                {[
                  ["regional", "Regional Operator"],
                  ["municipality", "Municipality Manager"],
                  ["owner", "Orchard Owner"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setOperatorRole(value as OperatorRole)}
                    className={`rounded-md px-3 py-2 text-left text-xs font-semibold transition-colors ${
                      operatorRole === value ? "bg-cyan-300 text-gray-950" : "bg-black/30 text-gray-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex min-h-[720px] flex-col p-4 xl:h-[calc(100vh-73px)] xl:min-h-0">
            <div className="mb-3 flex flex-col gap-3 rounded-lg border border-white/10 bg-black/30 p-3 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Geospatial Command Surface</div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {viewMode === "globe" ? "Cesium Mission Control" : "Operational Digital Twin Calibration"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewToggle("globe")}
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                    viewMode === "globe" ? "bg-cyan-300 text-gray-950" : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  Globe Command
                </button>
                <button
                  onClick={() => handleViewToggle("3d")}
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                    viewMode === "3d" ? "bg-cyan-300 text-gray-950" : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  Operational Digital Twin
                </button>
              </div>
            </div>

            <div ref={viewContainerRef} className="min-h-[620px] flex-1 overflow-hidden rounded-lg border border-cyan-300/20 bg-black shadow-2xl shadow-cyan-950/30">
              {viewMode === "globe" ? (
                <GlobeCommandView
                  ref={globeCommandRef}
                  onOrchardSelect={handleOrchardSelect}
                  onSectionSelect={handleSectionSelect}
                  onEnter3DTwin={handleEnter3DTwin}
                  selectedOrchardId={selectedOrchardId || undefined}
                  selectedSectionId={selectedSection || undefined}
                  commandHandler={handleUICommand}
                  onMunicipalitySelected={(municipality) => {
                    setSelectedMunicipality(municipality);
                    setActiveModule("regional");
                  }}
                  onOrchardCandidateSelected={setSelectedOrchardCandidate}
                  onDetectedOrchardsChanged={setDetectedOrchards}
                  onVisionAnalysisCompleted={setVisionAnalysisResult}
                  plannedMission={activeDroneMission}
                  segmentedOrchardBlocks={visibleSegmentedBlocks}
                  selectedSegmentedBlockId={selectedSegmentedBlock?.block_id}
                  onSegmentedBlockSelected={handleSegmentedBlockSelected}
                  className="h-full min-h-[620px] rounded-lg border-0"
                />
              ) : (
                <div className="h-full min-h-[620px]">
                  <OrchardScene3D trees={trees} />
                </div>
              )}
            </div>

            {selectedSection && (
              <div className="mt-3">
                <SimulationControls onSimulate={handleSimulate} onReset={handleReset} onApplyRecommendation={handleApplyRecommendation} />
              </div>
            )}
          </section>

          <aside className="border-l border-white/10 bg-black/35 px-4 py-5 backdrop-blur-xl xl:h-[calc(100vh-73px)] xl:overflow-y-auto">
            <div className="mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Active Intelligence / Workflow</div>
              <h2 className="mt-2 text-xl font-semibold text-white">{operationsModules.find((module) => module.id === activeModule)?.label}</h2>
            </div>

            <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">Selected Context</div>
                  <div className="mt-1 text-xs text-gray-500">{selectionContext.context_type.replace("_", " ")}</div>
                </div>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold text-cyan-300">
                  Command Context
                </span>
              </div>
              <IntelligenceRow label="Target" value={contextName} />
              <IntelligenceRow label="Visible blocks" value={visibleSegmentedBlocks.length} tone="text-cyan-300" />
              <IntelligenceRow label="Detected orchards" value={detectedOrchards.length} />
              <IntelligenceRow label="Archived boundaries" value={archivedOrchards.length || mlTrainingSummary?.total_human_labeled_boundaries || 0} />
              <IntelligenceRow label="Priority stress" value={selectedSegmentedBlock?.stress_level || selectionContext.stress_level || "monitoring"} tone="text-amber-300" />
              <IntelligenceRow label="Workflow state" value={isSimulating ? "simulating" : networkSetupComplete ? "network active" : "setup required"} tone="text-emerald-300" />
            </div>

            <OperatorWorkflowPanel
              onMissionPlanned={handleMissionPlanned}
              defaultMunicipalityId={selectedMunicipality?.id || "tancitaro"}
              selectedBlock={selectedSegmentedBlock}
              segmentedBlocks={visibleSegmentedBlocks}
              onSegmentedBlocksChanged={setSegmentedOrchardBlocks}
              onBlockSelected={handleSegmentedBlockSelected}
              networkSetupComplete={networkSetupComplete}
              onNetworkSetupComplete={() => {
                setNetworkSetupComplete(true);
                setActiveModule("segmentation");
              }}
            />

            <div className="mt-4 space-y-4">
              {(activeModule === "regional" || activeModule === "network") && <RegionalOperationsPanel />}

              {(activeModule === "drone" || activeModule === "tasking") && (
                <DroneMissionPanel orchardId={droneMissionTargetId} targetType={droneMissionTargetType} onMissionPlanned={handleMissionPlanned} />
              )}

              {(activeModule === "inspection" || showAnalyticsSummary) && (
                <AnalyticsSummaryPanel
                  selectionContext={selectionContext}
                  selectedOrchardCandidate={selectedOrchardCandidate}
                  selectedMunicipality={selectedMunicipality}
                  detectedOrchards={detectedOrchards}
                  archivedOrchards={archivedOrchards}
                  visionAnalysisResult={visionAnalysisResult}
                  visible
                  onClose={() => setShowAnalyticsSummary(false)}
                />
              )}

              {(activeModule === "roi" || showFinancialPanel) && (
                <FinancialPredictionPanel
                  selectionContext={selectionContext}
                  selectedOrchardCandidate={selectedOrchardCandidate}
                  selectedMunicipality={selectedMunicipality}
                  detectedOrchards={detectedOrchards}
                  archivedOrchards={archivedOrchards}
                  visible
                  onClose={() => setShowFinancialPanel(false)}
                />
              )}

              {activeModule === "ml" && (
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">ML Training Data</h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                        Human-labeled boundary archive for training dataset preparation. No automatic model training is running.
                      </p>
                    </div>
                    <ModuleStatus status={mlTrainingSummary?.ready_for_training ? "ready" : "review"} />
                  </div>
                  <IntelligenceRow label="Total labels" value={mlTrainingSummary?.total_human_labeled_boundaries ?? 0} />
                  <IntelligenceRow label="Accepted" value={mlTrainingSummary?.accepted_labels ?? 0} tone="text-emerald-300" />
                  <IntelligenceRow label="Needs review" value={mlTrainingSummary?.needs_review_labels ?? 0} tone="text-amber-300" />
                  <IntelligenceRow label="Non-orchard" value={mlTrainingSummary?.non_orchard_labels ?? 0} />
                  <a
                    href={getOrchardBoundaryGeoJSONUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block w-full rounded-md bg-cyan-300 px-3 py-2 text-center text-xs font-bold text-gray-950 transition-opacity hover:opacity-90"
                  >
                    Export GeoJSON
                  </a>
                </div>
              )}

              {activeModule === "settings" && (
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <h3 className="text-sm font-semibold text-white">Settings / Integrations</h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">
                    Gemini reasoning, MongoDB operational memory, Cesium routes, and field messaging are configured for a stable demo. Real messages are held for human approval.
                  </p>
                  <div className="mt-3 grid gap-2">
                    <StatusPill label="Field tasking" value="Send later only" tone="amber" />
                    <StatusPill label="Operational memory" value={mlTrainingSummary?.latest_export ? "Live" : "Fallback"} tone={memoryTone} />
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Gemini Agent Reasoning</h3>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold text-cyan-300">Mock</span>
                </div>
                <AIAdvisorPanel onCommand={handleUICommand} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
