"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { GlobeCommandViewRef } from "@/components/GlobeCommandView";
import AIAdvisorPanel from "@/components/AIAdvisorPanel";
import SimulationControls from "@/components/SimulationControls";
import DroneMissionPanel from "@/components/DroneMissionPanel";
import OperatorWorkflowPanel from "@/components/OperatorWorkflowPanel";
import AnalyticsSummaryPanel from "@/components/AnalyticsSummaryPanel";
import FinancialPredictionPanel from "@/components/FinancialPredictionPanel";
import {
  mockOrchards,
  simulateLiveUpdate,
  applySimulation,
  generateRecommendations,
  OrchardData,
  AIRecommendation,
} from "@/lib/mockData";
import { UICommand, UICommandHandler } from "@/types/uiCommands";
import { resolveSelectionContext, SelectionContext, getContextDisplayName } from "@/lib/selectionContext";
import { getMLTrainingDatasetSummary, getOrchardBoundaryGeoJSONUrl } from "@/lib/api";

const GlobeCommandView = dynamic(
  () => import("@/components/GlobeCommandView").then((mod) => ({ default: mod.GlobeCommandView })),
  { ssr: false }
);

const DigitalTwin3DView = dynamic(() => import("@/components/DigitalTwin3DView"), { ssr: false });

type OperatorRole = "regional" | "municipality" | "owner";
type TwinTab = "3D View" | "NDVI" | "Canopy Health" | "Soil Moisture" | "Thermal" | "Elevation";
type ActiveModule =
  | "command"
  | "regional"
  | "network"
  | "segmentation"
  | "manual"
  | "drone"
  | "inspection"
  | "roi"
  | "tasking"
  | "ml"
  | "analytics"
  | "integrations"
  | "settings";

const operationsModules: Array<{
  id: ActiveModule;
  label: string;
  kicker: string;
  status: "live" | "review" | "approval" | "ready";
}> = [
  { id: "command", label: "Command Center", kicker: "Mission Control", status: "live" },
  { id: "regional", label: "Regional Command", kicker: "Regional Command", status: "live" },
  { id: "network", label: "Orchards", kicker: "Owner Workspace", status: "ready" },
  { id: "segmentation", label: "Segmentation Review", kicker: "Review Required", status: "review" },
  { id: "drone", label: "Drone Missions", kicker: "Mission Control", status: "live" },
  { id: "inspection", label: "Inspection Analysis", kicker: "Field Intelligence", status: "ready" },
  { id: "roi", label: "Financial Exposure", kicker: "Financial Exposure", status: "ready" },
  { id: "tasking", label: "Task Delegation", kicker: "Field Tasking", status: "approval" },
  { id: "ml", label: "ML Label Archive", kicker: "Operational Memory", status: "ready" },
  { id: "analytics", label: "Analytics", kicker: "Performance Intelligence", status: "ready" },
  { id: "integrations", label: "Integrations", kicker: "Gemini + Memory", status: "ready" },
  { id: "settings", label: "Settings", kicker: "Operational Readiness", status: "ready" },
];

const navSections: Array<{
  label: string;
  items: ActiveModule[];
}> = [
  { label: "Command", items: ["command", "regional"] },
  { label: "Operations", items: ["network", "segmentation", "manual", "drone", "inspection", "tasking"] },
  { label: "Intelligence", items: ["roi", "ml", "analytics"] },
  { label: "System", items: ["integrations", "settings"] },
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

function StatusChip({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "green" | "amber" }) {
  const tones = {
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
    green: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  };
  return <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${tones[tone]}`}>{children}</span>;
}

function IntelligenceRow({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 py-1.5 last:border-0">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className={`text-right text-[11px] font-semibold ${tone || "text-gray-200"}`}>{value}</span>
    </div>
  );
}

function MetricBar({ value, tone }: { value: number; tone: "green" | "cyan" | "amber" | "red" }) {
  const tones = {
    green: "bg-emerald-400",
    cyan: "bg-cyan-300",
    amber: "bg-amber-300",
    red: "bg-red-400",
  };

  return (
    <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full ${tones[tone]}`} style={{ width: `${Math.max(8, Math.min(100, value))}%` }} />
    </div>
  );
}

function ContextDetailRow({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 py-1.5 last:border-0">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className={`text-right text-[11px] font-semibold ${tone || "text-gray-200"}`}>{value}</span>
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

const bottomKpis = [
  ["142K ha", "Area Monitored", "Regional Command"],
  ["847", "Orchard Blocks", "Active Monitoring"],
  ["91%", "Segmentation Confidence", "AI Review"],
  ["$210K", "Exposure Modeled", "High Risk Areas"],
  ["3", "Critical Alerts", "Requires Attention"],
  ["12", "Missions This Month", "Drone Operations"],
];

const twinTabs: TwinTab[] = ["3D View", "NDVI", "Canopy Health", "Soil Moisture", "Thermal", "Elevation"];

const insightCards = [
  ["Overall Health", "Good", "text-emerald-300", "Block condition"],
  ["Block Area", "2.14 ha", "text-gray-100", "12% of block"],
  ["Stress Areas", "12%", "text-amber-300", "Review required"],
  ["Canopy Variance", "14%", "text-cyan-200", "row-level spread"],
  ["NDVI Delta", "-0.06", "text-amber-300", "7 day trend"],
  ["Irrigation Variance", "-12%", "text-cyan-300", "reduce next cycle"],
  ["Stress Trend", "↑ 8%", "text-red-300", "48 hour movement"],
  ["Estimated Yield", "3.2 t/ha", "text-gray-100", "+8% vs last scan"],
];

const modeOverlays: Record<TwinTab, {
  label: string;
  summary: string;
  overlayClass: string;
  legend: Array<[string, string, string]>;
}> = {
  "3D View": {
    label: "Operational Digital Twin",
    summary: "Live Cesium command surface with segmentation, manual labels, drone routes, and priority zones.",
    overlayClass: "",
    legend: [["Boundary", "Live overlays", "bg-cyan-300"], ["Drone route", "planned", "bg-white"], ["Review", "required", "bg-amber-300"]],
  },
  NDVI: {
    label: "NDVI Vegetation Health",
    summary: "Mock vegetation index layer highlights healthy canopy, moderate stress, and high-risk rows.",
    overlayClass: "bg-[radial-gradient(circle_at_28%_48%,rgba(34,197,94,0.20),transparent_26%),radial-gradient(circle_at_56%_57%,rgba(250,204,21,0.24),transparent_24%),radial-gradient(circle_at_72%_66%,rgba(239,68,68,0.24),transparent_20%)] mix-blend-screen",
    legend: [["0.78", "healthy rows", "bg-emerald-400"], ["0.61", "moderate stress", "bg-amber-300"], ["0.43", "high stress", "bg-red-400"]],
  },
  "Canopy Health": {
    label: "Canopy Health Clusters",
    summary: "Tree-level canopy points are emphasized to show row alignment, density, and stress clusters.",
    overlayClass: "bg-[radial-gradient(circle_at_42%_46%,rgba(16,185,129,0.18),transparent_18%),radial-gradient(circle_at_61%_61%,rgba(251,191,36,0.22),transparent_17%),radial-gradient(circle_at_75%_55%,rgba(248,113,113,0.20),transparent_15%)]",
    legend: [["82%", "leaf density", "bg-emerald-400"], ["14%", "canopy variance", "bg-cyan-300"], ["12%", "stress rows", "bg-amber-300"]],
  },
  "Soil Moisture": {
    label: "Soil Moisture Gradient",
    summary: "Moisture layer indicates irrigation variance and likely deficit bands inside the selected orchard.",
    overlayClass: "bg-[linear-gradient(120deg,rgba(14,165,233,0.20),transparent_42%),radial-gradient(circle_at_67%_62%,rgba(120,53,15,0.28),transparent_22%)]",
    legend: [["67%", "soil moisture", "bg-sky-400"], ["1.2", "EC dS/m", "bg-cyan-200"], ["Low", "compaction", "bg-emerald-400"]],
  },
  Thermal: {
    label: "Thermal Stress",
    summary: "Heat-risk overlay identifies canopy temperature anomalies and irrigation timing exposure.",
    overlayClass: "bg-[radial-gradient(circle_at_66%_59%,rgba(239,68,68,0.30),transparent_24%),radial-gradient(circle_at_47%_48%,rgba(251,146,60,0.22),transparent_25%)] mix-blend-screen",
    legend: [["24.3 C", "canopy temp", "bg-orange-300"], ["High", "thermal edge", "bg-red-400"], ["-12%", "irrigation rec.", "bg-cyan-300"]],
  },
  Elevation: {
    label: "Terrain Variation",
    summary: "Contour styling shows slope, terrain variation, and drainage-sensitive rows.",
    overlayClass: "bg-[repeating-linear-gradient(28deg,rgba(255,255,255,0.00)_0px,rgba(255,255,255,0.00)_16px,rgba(103,232,249,0.16)_17px,rgba(103,232,249,0.00)_19px),radial-gradient(circle_at_35%_42%,rgba(34,197,94,0.12),transparent_22%)]",
    legend: [["7.4 m", "terrain range", "bg-cyan-300"], ["4.2 deg", "max slope", "bg-amber-300"], ["Good", "drainage", "bg-emerald-400"]],
  },
};

const analysisSectionsByMode: Record<TwinTab, Array<{
  title: string;
  rows: Array<[string, string, number, "green" | "cyan" | "amber" | "red"]>;
  image?: string;
  imageAlt?: string;
}>> = {
  "3D View": [
  {
    title: "Canopy Analysis",
    image: "/assets/orchard-real/leaf_canopy_closeup_01.png",
    imageAlt: "Close-up canopy analysis capture",
    rows: [
      ["Leaf Density", "82%", 82, "green"],
      ["Chlorophyll Index", "0.78", 78, "green"],
      ["Pest Indicators", "Low", 18, "cyan"],
      ["Canopy Temp.", "24.3 C", 42, "amber"],
    ],
  },
  {
    title: "Soil & Root Zone",
    image: "/assets/orchard-real/root_system_closeup.png",
    imageAlt: "Avocado root system close-up",
    rows: [
      ["Soil Moisture", "67%", 67, "cyan"],
      ["Soil EC", "1.2 dS/m", 38, "cyan"],
      ["Root Biomass", "High", 76, "green"],
      ["Compaction Risk", "Low", 22, "green"],
    ],
  },
  {
    title: "Fruit Estimation",
    image: "/assets/orchard-real/avocado_fruit_cluster.png",
    imageAlt: "Avocado fruit cluster",
    rows: [
      ["Avg Fruit / Tree", "124", 72, "green"],
      ["Size Distribution", "M-L", 64, "cyan"],
      ["Est. Yield", "3.2 t/ha", 70, "green"],
      ["Confidence", "91%", 91, "green"],
    ],
  },
  ],
  NDVI: [
    { title: "NDVI Layer", rows: [["Mean NDVI", "0.71", 71, "green"], ["Delta", "-0.06", 48, "amber"], ["Low vigor rows", "12%", 32, "amber"], ["Review Confidence", "91%", 91, "green"]] },
    { title: "Vegetation Risk", rows: [["Healthy canopy", "68%", 68, "green"], ["Moderate stress", "20%", 20, "amber"], ["High stress", "12%", 12, "red"], ["Trend", "↑ 8%", 56, "red"]] },
  ],
  "Canopy Health": [
    { title: "Canopy Structure", rows: [["Leaf Density", "82%", 82, "green"], ["Canopy Variance", "14%", 14, "amber"], ["Row Alignment", "0.88", 88, "green"], ["Gap Signal", "6%", 18, "cyan"]] },
    { title: "Stress Clusters", rows: [["Healthy points", "31", 74, "green"], ["Stressed points", "9", 36, "amber"], ["Diseased points", "3", 14, "red"], ["Sample coverage", "43 trees", 62, "cyan"]] },
  ],
  "Soil Moisture": [
    { title: "Moisture Profile", rows: [["Soil Moisture", "67%", 67, "cyan"], ["Dry band", "18%", 28, "amber"], ["Irrigation variance", "-12%", 42, "cyan"], ["Root zone risk", "Low", 24, "green"]] },
    { title: "Soil & Root Zone", rows: [["Soil EC", "1.2 dS/m", 38, "cyan"], ["Compaction Risk", "Low", 20, "green"], ["Drainage", "Good", 74, "green"], ["Next cycle", "Reduce", 44, "cyan"]] },
  ],
  Thermal: [
    { title: "Thermal Risk", rows: [["Canopy Temp.", "24.3 C", 52, "amber"], ["Heat anomaly", "High", 78, "red"], ["Stressed edge", "0.31 ha", 46, "red"], ["Cooling trend", "↓ 3%", 58, "green"]] },
    { title: "Intervention Timing", rows: [["Irrigation window", "36 hr", 64, "cyan"], ["Evap. pressure", "Medium", 55, "amber"], ["Priority", "87 / 100", 87, "red"], ["Yield risk", "-18%", 72, "red"]] },
  ],
  Elevation: [
    { title: "Terrain Variation", rows: [["Elevation range", "7.4 m", 44, "cyan"], ["Max slope", "4.2 deg", 42, "amber"], ["Drainage lines", "3", 36, "cyan"], ["Erosion risk", "Low", 22, "green"]] },
    { title: "Mission Planning", rows: [["Flight altitude", "72 m", 68, "cyan"], ["Terrain follow", "On", 82, "green"], ["Obstacle risk", "Low", 18, "green"], ["Coverage", "94%", 94, "green"]] },
  ],
};

export default function CommandCenter() {
  const [selectedOrchardId, setSelectedOrchardId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [orchardData, setOrchardData] = useState<OrchardData>(mockOrchards[0]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showAnalyticsSummary, setShowAnalyticsSummary] = useState(false);
  const [showFinancialPanel, setShowFinancialPanel] = useState(false);
  const [operatorRole, setOperatorRole] = useState<OperatorRole>("regional");
  const [networkSetupComplete, setNetworkSetupComplete] = useState(false);
  const [activeModule, setActiveModule] = useState<ActiveModule>("command");
  const [activeTwinTab, setActiveTwinTab] = useState<TwinTab>("3D View");
  const [agentChatOpen, setAgentChatOpen] = useState(false);
  const [selectedContextOpen, setSelectedContextOpen] = useState(true);
  const [workflowOpen, setWorkflowOpen] = useState(true);
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
  };

  const handleEnter3DTwin = (orchardId: string, sectionId?: string) => {
    setSelectedOrchardId(orchardId);
    if (sectionId) setSelectedSection(sectionId);
  };

  const handleMissionPlanned = (missionData: any) => {
    setActiveDroneMission(missionData);
    setActiveModule("drone");
  };

  const handleUICommand: UICommandHandler = (command: UICommand) => {
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
  };

  const handleApplyRecommendation = () => {
    const topRec = recommendations[0];
    if (!topRec) return;
    if (topRec.recommendation.includes("Irrigation")) handleSimulate({ moisture_change: 20 });
    if (topRec.recommendation.includes("Pest")) handleSimulate({ pest_change: -15 });
  };

  const contextName = getContextDisplayName(selectionContext);
  const memoryTone = mlTrainingSummary?.latest_export ? "green" : "amber";
  const activeOverlay = modeOverlays[activeTwinTab];
  const activeAnalysisSections = analysisSectionsByMode[activeTwinTab];
  const selectedContextObject = selectedSegmentedBlock || selectedOrchardCandidate || selectedMunicipality;
  const selectedContextType = selectedSegmentedBlock ? "orchard_block" : selectedOrchardCandidate ? "orchard" : selectedMunicipality ? "municipality" : "network";

  const handleTwinTabChange = (tab: TwinTab) => {
    console.log("Command Center view tab changed", tab);
    setActiveTwinTab(tab);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#03080d] text-gray-100">
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#050b11]/95 px-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-xs font-black text-cyan-200">
            GO
          </div>
          <div>
            <div className="text-base font-semibold leading-tight text-white">Gemini Orchard Operations OS</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-500">Operational Intelligence</div>
          </div>
        </div>
        <nav className="hidden h-full items-center gap-8 text-sm font-medium text-gray-300 lg:flex">
          {["Command Center", "Regional Command", "Orchards", "Financial Exposure", "Integrations"].map((item, index) => (
            <button
              key={item}
              onClick={() => setActiveModule(index === 0 ? "command" : index === 1 ? "regional" : index === 2 ? "network" : index === 3 ? "roi" : "integrations")}
              className={`h-full border-b-2 px-1 transition-colors ${
                (index === 0 && activeModule === "command") ||
                (index === 1 && activeModule === "regional") ||
                (index === 2 && activeModule === "network") ||
                (index === 3 && activeModule === "roi") ||
                (index === 4 && activeModule === "integrations")
                  ? "border-cyan-300 text-cyan-200"
                  : "border-transparent hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="hidden items-center gap-3 xl:flex">
          <StatusPill label="Gemini" value="Live / Mock" tone="green" />
          <StatusPill label="Memory" value={mlTrainingSummary?.latest_export ? "Live" : "Fallback"} tone={memoryTone} />
          <StatusPill label="Approval" value="Required" tone="amber" />
        </div>
      </header>

      <main className="grid h-[calc(100vh-56px)] grid-cols-1 grid-rows-[1fr_auto] overflow-hidden bg-[radial-gradient(circle_at_28%_0%,rgba(0,212,255,0.10),transparent_30%),linear-gradient(135deg,#03080d_0%,#071018_54%,#03070b_100%)] xl:grid-cols-[260px_minmax(0,1fr)_330px]">
        <aside className="hidden row-span-2 border-r border-white/10 bg-[#07111a]/82 p-2.5 backdrop-blur-xl xl:flex xl:flex-col">
          <div className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-cyan-300/90">Operations Navigation</div>
          <div className="mt-1.5 space-y-3">
            {navSections.map((section) => (
              <div key={section.label}>
                <div className="mb-1.5 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-600">{section.label}</div>
                <div className="space-y-0.5">
                  {section.items.map((id) => {
                    const module = operationsModules.find((item) => item.id === id);
                    if (!module) return null;
                    const active = activeModule === module.id;
                    return (
                      <button
                        key={module.id}
                        onClick={() => setActiveModule(module.id)}
                        className={`group relative flex min-h-8 w-full items-center justify-between rounded-md border px-2.5 py-1.5 text-left transition-all ${
                          active
                            ? "border-white/10 bg-white/[0.055] text-cyan-100"
                            : "border-transparent text-gray-400 hover:border-white/10 hover:bg-white/[0.035] hover:text-gray-200"
                        }`}
                      >
                        {active && <span className="absolute left-0 top-1.5 h-5 w-0.5 rounded-r bg-cyan-300" />}
                        <span className="flex min-w-0 items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-cyan-300" : "bg-gray-700 group-hover:bg-gray-500"}`} />
                          <span className="truncate text-[12px] font-semibold">{module.label}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          {module.status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />}
                          {module.status === "review" && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                          {module.status === "approval" && <span className="rounded bg-red-500/90 px-1 py-0.5 text-[9px] font-bold text-white">3</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto space-y-2.5 pt-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[9px] uppercase tracking-[0.18em] text-gray-500">Active Region</div>
                <StatusChip tone="green">Live</StatusChip>
              </div>
              <div className="mt-2 text-[13px] font-semibold text-white">Michoacan Avocado Belt</div>
              <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                <div className="rounded border border-white/5 bg-black/25 px-1 py-1">
                  <div className="text-[11px] font-semibold text-gray-200">8</div>
                  <div className="text-[9px] text-gray-600">Muni</div>
                </div>
                <div className="rounded border border-white/5 bg-black/25 px-1 py-1">
                  <div className="text-[11px] font-semibold text-gray-200">15</div>
                  <div className="text-[9px] text-gray-600">Orch</div>
                </div>
                <div className="rounded border border-white/5 bg-black/25 px-1 py-1">
                  <div className="text-[11px] font-semibold text-gray-200">142K</div>
                  <div className="text-[9px] text-gray-600">ha</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <StatusChip>Regional</StatusChip>
                <StatusChip tone="amber">Review</StatusChip>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1">
                {[
                  ["regional", "Regional"],
                  ["municipality", "Municipal"],
                  ["owner", "Owner"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setOperatorRole(value as OperatorRole)}
                    className={`rounded px-1.5 py-1 text-[9px] font-semibold ${
                      operatorRole === value ? "bg-cyan-300 text-gray-950" : "bg-black/35 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-[10px] font-bold text-cyan-200">FM</div>
                <div>
                  <div className="text-[12px] font-semibold text-white">F. Melgoza</div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <StatusChip>Owner Workspace</StatusChip>
                  </div>
                </div>
              </div>
              <div className="mt-2 border-t border-white/10 pt-2 text-[9px] text-gray-600">Last login: May 15, 2025 9:12 AM</div>
            </div>
          </div>
        </aside>

        <section className="min-h-0 p-3 xl:p-4">
          <div className="flex h-full min-h-0 flex-col rounded-lg border border-white/10 bg-[#07111a]/72 p-2.5 shadow-2xl shadow-black/40">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Digital Twin Preview</div>
                <h1 className="mt-2 text-xl font-semibold text-white">Los Reyes Orchard - Block 7A</h1>
              </div>
              <span className="rounded-md border border-emerald-400/20 bg-emerald-400/15 px-3 py-1.5 text-xs font-semibold text-emerald-200">Active</span>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {twinTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTwinTabChange(tab)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                    activeTwinTab === tab ? "border-cyan-300 bg-cyan-300 text-gray-950" : "border-white/10 bg-white/[0.04] text-gray-300 hover:border-cyan-300/35 hover:text-cyan-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-black">
              {activeTwinTab === "3D View" ? (
                <DigitalTwin3DView />
              ) : (
                <>
                  <div className="pointer-events-none absolute left-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2">
                    {["Select", "Target", "Route", "Draw", "Layers", "Focus"].map((item) => (
                      <div key={item} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/65 text-[10px] font-semibold text-gray-300 backdrop-blur-md">
                        {item.slice(0, 1)}
                      </div>
                    ))}
                  </div>
                  <div className={`pointer-events-none absolute inset-0 z-20 opacity-90 ${activeOverlay.overlayClass}`} />
                  <div className="pointer-events-none absolute bottom-4 right-4 z-30 rounded-lg border border-white/10 bg-black/70 p-3 backdrop-blur-md">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">{activeTwinTab} Legend</div>
                    <div className="space-y-1.5">
                      {activeOverlay.legend.map(([value, label, color]) => (
                        <div key={`${value}-${label}`} className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span className={`h-2 w-2 rounded-full ${color}`} />
                          <span className="font-semibold text-gray-200">{value}</span>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 w-[42%] -translate-x-1/2 rounded-lg border border-white/10 bg-black/70 px-3 py-2 backdrop-blur-md">
                    <div className="mb-1 text-center text-[11px] font-semibold text-gray-200">{activeOverlay.label}</div>
                    <div className="relative h-1 rounded-full bg-gray-700">
                      <span className="absolute left-[52%] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.7)]" />
                    </div>
                  </div>
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
                      setActiveModule("command");
                    }}
                    onOrchardCandidateSelected={setSelectedOrchardCandidate}
                    onDetectedOrchardsChanged={setDetectedOrchards}
                    onVisionAnalysisCompleted={setVisionAnalysisResult}
                    plannedMission={activeDroneMission}
                    segmentedOrchardBlocks={visibleSegmentedBlocks}
                    selectedSegmentedBlockId={selectedSegmentedBlock?.block_id}
                    onSegmentedBlockSelected={handleSegmentedBlockSelected}
                    className="h-full min-h-full rounded-none border-0"
                  />
                </>
              )}
            </div>

            {selectedSection && (
              <div className="mt-3">
                <SimulationControls onSimulate={handleSimulate} onReset={handleReset} onApplyRecommendation={handleApplyRecommendation} />
              </div>
            )}
          </div>
        </section>

        <aside className="min-h-0 overflow-y-auto border-l border-white/10 bg-[#07111a]/84 p-2.5 backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="flex rounded-md border border-white/10 bg-black/25 p-0.5">
              <button className="rounded bg-cyan-300 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-950">Block Insights</button>
              <button className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">AI Analysis</button>
            </div>
            <button
              onClick={() => setActiveModule("command")}
              className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1.5 text-[10px] font-semibold text-cyan-200 hover:bg-cyan-300/15"
            >
              Open Mission Control
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {insightCards.map(([label, value, tone, note]) => (
              <div key={label} className="rounded-md border border-white/10 bg-white/[0.04] p-2">
                <div className="truncate text-[10px] text-gray-500">{label}</div>
                <div className={`mt-1 text-[15px] font-semibold leading-tight ${tone}`}>{value}</div>
                <div className="mt-0.5 truncate text-[9px] text-gray-600">{note}</div>
              </div>
            ))}
          </div>

          <div className="mt-2 space-y-1.5">
            {activeAnalysisSections.map((section) => (
              <div key={section.title} className="rounded-md border border-white/10 bg-white/[0.035] p-2.5">
                {section.image && (
                  <div className="relative mb-2 h-20 overflow-hidden rounded-md border border-white/10 bg-black/40">
                    <img
                      src={section.image}
                      alt={section.imageAlt ?? section.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.10),rgba(0,0,0,0.54)),radial-gradient(circle_at_50%_35%,transparent_34%,rgba(0,0,0,0.36)_100%)]" />
                  </div>
                )}
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-400">{section.title}</div>
                  <div className="h-1 w-8 rounded-full bg-cyan-300/35" />
                </div>
                <div className="space-y-1">
                  {section.rows.map(([label, value, bar, tone]) => (
                    <div key={label} className="border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                      <IntelligenceRow label={label} value={value} />
                      <MetricBar value={bar} tone={tone} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 rounded-md border border-cyan-300/15 bg-cyan-300/[0.035] p-2.5">
            <button
              onClick={() => setSelectedContextOpen((value) => !value)}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Selected Context</span>
              <span className="text-[10px] font-semibold text-gray-500">{selectedContextOpen ? "Collapse" : "Expand"}</span>
            </button>
            <div className="mt-1.5">
              <IntelligenceRow label="Target" value={contextName} />
              <ContextDetailRow label="Context type" value={selectedContextType.replace("_", " ")} />
            </div>
            {selectedContextOpen && (
              <>
                {selectedContextObject && (
                  <>
                    <ContextDetailRow
                      label="ID / Name"
                      value={selectedContextObject.block_id || selectedContextObject.orchard_id || selectedContextObject.name || selectedContextObject.id || "Selected asset"}
                    />
                    <ContextDetailRow
                      label="Hectares"
                      value={`${Number(selectedContextObject.estimated_hectares || selectedContextObject.hectares || 2.14).toLocaleString()} ha`}
                    />
                    <ContextDetailRow
                      label="Stress"
                      value={selectedContextObject.stress_level || selectedContextObject.risk_level || "medium"}
                      tone={
                        selectedContextObject.stress_level === "high" || selectedContextObject.risk_level === "high"
                          ? "text-red-300"
                          : selectedContextObject.stress_level === "medium"
                            ? "text-amber-300"
                            : "text-emerald-300"
                      }
                    />
                    <ContextDetailRow
                      label="Tree estimate"
                      value={Number(selectedContextObject.tree_count_estimate || selectedContextObject.estimated_tree_count || selectedContextObject.estimated_trees || 612).toLocaleString()}
                    />
                    <ContextDetailRow
                      label="Confidence"
                      value={`${Math.round((selectedContextObject.confidence_score || selectedContextObject.confidence || 0.91) * 100)}%`}
                    />
                    <ContextDetailRow
                      label="Boundary source"
                      value={selectedContextObject.boundary_source || "ai_generated"}
                    />
                    <ContextDetailRow
                      label="Orchard feature"
                      value={`${Math.round((selectedContextObject.orchard_feature_score || 0.86) * 100)}%`}
                    />
                    <ContextDetailRow
                      label="Row alignment"
                      value={`${Math.round((selectedContextObject.row_alignment_score || 0.84) * 100)}%`}
                    />
                    <ContextDetailRow
                      label="Sampled trees"
                      value={selectedContextObject.tree_points?.length ?? 0}
                    />
                  </>
                )}
                <IntelligenceRow label="Visible blocks" value={visibleSegmentedBlocks.length} tone="text-cyan-300" />
                <IntelligenceRow label="Archived labels" value={archivedOrchards.length || mlTrainingSummary?.total_human_labeled_boundaries || 0} />
                <IntelligenceRow label="Workflow state" value={isSimulating ? "simulating" : networkSetupComplete ? "network active" : "setup required"} tone="text-emerald-300" />
              </>
            )}
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {[
                ["Segment Orchards", () => setActiveModule("segmentation")],
                ["Reconstruct Twin", () => handleTwinTabChange("3D View")],
                ["Dispatch Drone", () => setActiveModule("drone")],
                ["Analyze Inspection", () => setActiveModule("inspection")],
                ["Simulate ROI", () => {
                  setShowFinancialPanel(true);
                  setActiveModule("roi");
                }],
                ["Draft Field Task", () => setActiveModule("tasking")],
              ].map(([label, action]) => (
                <button
                  key={label as string}
                  onClick={action as () => void}
                  className="rounded border border-white/10 bg-white/[0.045] px-2 py-1 text-[9px] font-semibold text-gray-300 hover:border-cyan-300/30 hover:text-cyan-200"
                >
                  {label as string}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            <div className="rounded-md border border-white/10 bg-white/[0.035]">
              <button
                onClick={() => setWorkflowOpen((value) => !value)}
                className="flex w-full items-center justify-between px-2.5 py-2 text-left"
              >
                <span>
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-400">Workflow</span>
                  <span className="text-[11px] text-gray-500">Scan → Segment → Task → Approval</span>
                </span>
                <span className="rounded border border-white/10 bg-black/25 px-2 py-1 text-[10px] font-semibold text-gray-400">
                  {workflowOpen ? "Hide" : "Show"}
                </span>
              </button>
              {workflowOpen && (
                <div className="border-t border-white/10">
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
                </div>
              )}
            </div>

            {(activeModule === "drone" || activeModule === "tasking") && (
              <DroneMissionPanel orchardId={droneMissionTargetId} targetType={droneMissionTargetType} onMissionPlanned={handleMissionPlanned} />
            )}

            {(activeModule === "inspection" || activeModule === "analytics" || showAnalyticsSummary) && (
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
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">ML Label Archive</h3>
                  <ModuleStatus status={mlTrainingSummary?.ready_for_training ? "ready" : "review"} />
                </div>
                <IntelligenceRow label="Total labels" value={mlTrainingSummary?.total_human_labeled_boundaries ?? 0} />
                <IntelligenceRow label="Accepted" value={mlTrainingSummary?.accepted_labels ?? 0} tone="text-emerald-300" />
                <IntelligenceRow label="Needs review" value={mlTrainingSummary?.needs_review_labels ?? 0} tone="text-amber-300" />
                <a href={getOrchardBoundaryGeoJSONUrl()} target="_blank" rel="noreferrer" className="mt-3 block rounded-md bg-cyan-300 px-3 py-2 text-center text-xs font-bold text-gray-950">
                  Export GeoJSON
                </a>
              </div>
            )}

            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Agent Chat</div>
                  <div className="mt-1 text-xs text-gray-400">Gemini workflow assistant collapsed</div>
                </div>
                <button
                  onClick={() => setAgentChatOpen((value) => !value)}
                  className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-300/15"
                >
                  {agentChatOpen ? "Hide" : "Open"}
                </button>
              </div>
              {agentChatOpen && (
                <div className="mt-3 max-h-[360px] overflow-hidden rounded-lg border border-white/10">
                  <AIAdvisorPanel onCommand={handleUICommand} />
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="col-span-1 grid gap-2 border-t border-white/10 bg-black/45 p-2.5 md:grid-cols-3 xl:col-span-2 xl:grid-cols-6">
          {bottomKpis.map(([value, label, sublabel]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
              <div className="text-xl font-semibold text-white">{value}</div>
              <div className="mt-0.5 text-xs text-gray-300">{label}</div>
              <div className="mt-1 text-[10px] text-gray-500">{sublabel}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
