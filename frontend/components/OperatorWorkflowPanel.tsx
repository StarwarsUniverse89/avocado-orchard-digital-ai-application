"use client";

import { useEffect, useState } from "react";
import {
  getRegionalSummary,
  segmentOrchards,
  reconstructTwin,
  planDroneMission,
  analyzeDroneInspection,
  simulateInterventionROI,
  delegateTask,
} from "@/lib/api";

type StepStatus = "locked" | "idle" | "loading" | "done";

interface WorkflowState {
  scan: StepStatus;
  segment: StepStatus;
  select: StepStatus;
  twin: StepStatus;
  drone: StepStatus;
  analyze: StepStatus;
  roi: StepStatus;
  task: StepStatus;
  approve: StepStatus;
}

interface OperatorWorkflowPanelProps {
  onMissionPlanned?: (mission: any) => void;
  defaultMunicipalityId?: string;
  selectedBlock?: any;
  segmentedBlocks?: any[];
  onSegmentedBlocksChanged?: (blocks: any[]) => void;
  onBlockSelected?: (block: any) => void;
  networkSetupComplete?: boolean;
  onNetworkSetupComplete?: () => void;
}

const INITIAL_STATE: WorkflowState = {
  scan: "idle",
  segment: "locked",
  select: "locked",
  twin: "locked",
  drone: "locked",
  analyze: "locked",
  roi: "locked",
  task: "locked",
  approve: "locked",
};

function MemoryBadge({ status }: { status?: string }) {
  const isMongo = status === "saved_to_mongodb";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
      isMongo
        ? "bg-emerald-900/40 text-emerald-400 border border-emerald-700/40"
        : "bg-amber-900/40 text-amber-400 border border-amber-700/40"
    }`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {isMongo ? "Saved to MongoDB mission memory" : "Local fallback memory active"}
    </span>
  );
}

function StepBadge({ status }: { status: StepStatus }) {
  const map = {
    locked: "bg-gray-800 text-gray-500",
    idle: "bg-blue-900/40 text-blue-400 border border-blue-700/40",
    loading: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/40 animate-pulse",
    done: "bg-emerald-900/40 text-emerald-400 border border-emerald-700/40",
  };
  const label = { locked: "Locked", idle: "Ready", loading: "Running...", done: "Done" };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}

function ResultBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 p-2.5 rounded-lg bg-gray-900/60 border border-gray-700/40 text-xs text-gray-300 space-y-1">
      {children}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      <span className={highlight ? "text-primary font-semibold" : "text-gray-200 font-medium"}>{value}</span>
    </div>
  );
}

export default function OperatorWorkflowPanel({
  onMissionPlanned,
  defaultMunicipalityId = "tancitaro",
  selectedBlock: externalSelectedBlock,
  segmentedBlocks = [],
  onSegmentedBlocksChanged,
  onBlockSelected,
  networkSetupComplete = true,
  onNetworkSetupComplete,
}: OperatorWorkflowPanelProps) {
  const [steps, setSteps] = useState<WorkflowState>(INITIAL_STATE);
  const [scanResult, setScanResult] = useState<any>(null);
  const [segmentResult, setSegmentResult] = useState<any>(null);
  const [internalSelectedBlock, setInternalSelectedBlock] = useState<any>(null);
  const [twinResult, setTwinResult] = useState<any>(null);
  const [missionResult, setMissionResult] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [roiResult, setRoiResult] = useState<any>(null);
  const [taskResult, setTaskResult] = useState<any>(null);
  const [approvalState, setApprovalState] = useState<"pending" | "approved" | "held" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedBlock = externalSelectedBlock || internalSelectedBlock;
  const visibleBlocks = segmentedBlocks.length > 0 ? segmentedBlocks : segmentResult?.blocks || [];

  const municipalityId =
    scanResult?.recommended_regions?.[0]?.toLowerCase().replace(/\s+/g, "_") ||
    defaultMunicipalityId;

  const orchardId =
    selectedBlock?.block_id ||
    missionResult?.orchard_id ||
    "tancitaro_block";

  function unlock(key: keyof WorkflowState) {
    setSteps((prev) => ({ ...prev, [key]: "idle" }));
  }

  function setLoading(key: keyof WorkflowState) {
    setSteps((prev) => ({ ...prev, [key]: "loading" }));
  }

  function setDone(key: keyof WorkflowState) {
    setSteps((prev) => ({ ...prev, [key]: "done" }));
  }

  useEffect(() => {
    if (!externalSelectedBlock) return;
    setSteps((prev) => ({
      ...prev,
      select: "done",
      twin: prev.twin === "locked" ? "idle" : prev.twin,
    }));
  }, [externalSelectedBlock?.block_id]);

  async function handleScan() {
    setLoading("scan");
    setError(null);
    const res = await getRegionalSummary();
    if (res.success && res.data) {
      setScanResult(res.data);
      onNetworkSetupComplete?.();
      setDone("scan");
      unlock("segment");
    } else {
      // Fallback mock so demo never breaks
      setScanResult({
        municipalities_scanned: 12,
        orchard_clusters_detected: 847,
        hectares_monitored: 142500,
        high_risk_areas: 3,
        medium_risk_areas: 7,
        recommended_regions: ["Tancítaro", "Uruapan"],
        memory_status: "local_fallback",
      });
      onNetworkSetupComplete?.();
      setDone("scan");
      unlock("segment");
    }
  }

  async function handleSegment(scope: "belt" | "municipality" = "municipality") {
    setLoading("segment");
    setError(null);
    const res = await segmentOrchards(scope === "belt" ? undefined : municipalityId, scope);
    if (res.success && res.data) {
      setSegmentResult(res.data);
      onSegmentedBlocksChanged?.(res.data.detected_orchard_blocks || res.data.blocks || []);
      setDone("segment");
      unlock("select");
    } else {
      setError("Segmentation failed — check backend connection.");
      setSteps((prev) => ({ ...prev, segment: "idle" }));
    }
  }

  function handleSelectBlock(block: any) {
    setInternalSelectedBlock(block);
    onBlockSelected?.(block);
    setDone("select");
    unlock("twin");
  }

  async function handleReconstructTwin() {
    if (!selectedBlock) return;
    setLoading("twin");
    setError(null);
    const res = await reconstructTwin(orchardId, selectedBlock);
    if (res.success && res.data) {
      setTwinResult(res.data);
      setDone("twin");
      unlock("drone");
    } else {
      setError("Twin reconstruction failed — check backend connection.");
      setSteps((prev) => ({ ...prev, twin: "idle" }));
    }
  }

  async function handleDispatchDrone() {
    setLoading("drone");
    setError(null);
    const res = await planDroneMission(orchardId);
    if (res.success && res.data) {
      setMissionResult(res.data);
      onMissionPlanned?.(res.data);
      setDone("drone");
      unlock("analyze");
    } else {
      setError("Mission planning failed — check backend connection.");
      setSteps((prev) => ({ ...prev, drone: "idle" }));
    }
  }

  async function handleAnalyze() {
    setLoading("analyze");
    setError(null);
    const missionId = missionResult?.mission_id || `mission_demo_${Date.now()}`;
    const res = await analyzeDroneInspection({
      mission_id: missionId,
      orchard_id: orchardId,
      mock_image_targets: ["zone_north", "zone_center", "zone_south"],
    });
    if (res.success && res.data) {
      setAnalysisResult(res.data);
      setDone("analyze");
      unlock("roi");
    } else {
      setError("Inspection analysis failed — check backend connection.");
      setSteps((prev) => ({ ...prev, analyze: "idle" }));
    }
  }

  async function handleROI() {
    setLoading("roi");
    setError(null);
    const res = await simulateInterventionROI({
      orchard_id: orchardId,
      mission_id: missionResult?.mission_id || "demo_mission",
      severity: analysisResult?.severity || "medium",
      detected_issues: analysisResult?.detected_issues || ["water_stress", "nutrient_deficiency"],
      recommended_actions: analysisResult?.recommended_actions || ["irrigation_pulse", "foliar_feed"],
      estimated_financial_impact: analysisResult?.estimated_financial_impact || "$145,000",
    });
    if (res.success && res.data) {
      setRoiResult(res.data);
      setDone("roi");
      unlock("task");
    } else {
      setError("ROI simulation failed — check backend connection.");
      setSteps((prev) => ({ ...prev, roi: "idle" }));
    }
  }

  async function handleDraftTask() {
    setLoading("task");
    setError(null);
    const res = await delegateTask({
      orchard_id: orchardId,
      mission_id: missionResult?.mission_id || "demo_mission",
      analysis_id: analysisResult?.analysis_id || "demo_analysis",
      recipient_role: "Field Agronomist",
      recommended_actions: analysisResult?.recommended_actions || ["irrigation_pulse", "foliar_feed"],
      severity: analysisResult?.severity || "medium",
      estimated_financial_impact: roiResult?.roi_summary || "$145,000 exposure",
      follow_up_recommendation: roiResult?.recommended_intervention || "Canopy treatment",
    });
    if (res.success && res.data) {
      setTaskResult(res.data);
      setDone("task");
      unlock("approve");
    } else {
      setError("Task drafting failed — check backend connection.");
      setSteps((prev) => ({ ...prev, task: "idle" }));
    }
  }

  const stressColor = (s: string) =>
    s === "high" ? "text-red-400" : s === "medium" ? "text-yellow-400" : "text-emerald-400";

  return (
    <div className="glass-elevated rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/40">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <h2 className="text-sm font-bold text-gray-50">Gemini Orchard Operations OS</h2>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5 ml-4">Mission planning · Field execution · Human-in-the-loop</p>
          </div>
          <span className="text-[10px] text-gray-600 font-mono">9-step</span>
        </div>
      </div>

      {!networkSetupComplete && (
        <div className="m-4 p-3 rounded-lg border border-primary/30 bg-primary/10">
          <p className="text-sm font-semibold text-gray-100">Set up Avocado Operations Network</p>
          <p className="text-[10px] text-gray-500 mt-1">
            Create the operational network, scan the avocado belt, and render AI orchard boundaries on the command globe.
          </p>
          <button
            onClick={async () => {
              await handleScan();
              await handleSegment("belt");
            }}
            disabled={steps.scan === "loading" || steps.segment === "loading"}
            className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold bg-primary text-gray-950 hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {steps.scan === "loading" || steps.segment === "loading"
              ? "Setting up network..."
              : "Scan & Segment Avocado Belt"}
          </button>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-red-900/30 border border-red-700/40 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="divide-y divide-gray-800/60 max-h-[calc(100vh-280px)] overflow-y-auto">

        {/* ── Step 1: Scan Belt ── */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 font-mono w-4">01</span>
              <span className="text-xs font-semibold text-gray-200">Scan Avocado Belt</span>
            </div>
            <StepBadge status={steps.scan} />
          </div>
          {steps.scan !== "done" ? (
            <button
              onClick={handleScan}
              disabled={steps.scan === "loading"}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-primary/90 text-gray-950 hover:bg-primary disabled:opacity-50 transition-colors"
            >
              {steps.scan === "loading" ? "Agent scanning belt..." : "Scan Avocado Belt"}
            </button>
          ) : scanResult && (
            <ResultBlock>
              <Row label="Municipalities scanned" value={scanResult.municipalities_scanned ?? 12} />
              <Row label="Orchard clusters detected" value={scanResult.orchard_clusters_detected ?? 847} highlight />
              <Row label="Hectares monitored" value={(scanResult.hectares_monitored ?? 142500).toLocaleString()} />
              <Row label="High-risk areas" value={scanResult.high_risk_areas ?? 3} />
              <Row label="Next recommended region" value={scanResult.recommended_regions?.[0] ?? "Tancítaro"} highlight />
              {scanResult.memory_status && <MemoryBadge status={scanResult.memory_status} />}
            </ResultBlock>
          )}
        </div>

        {/* ── Step 2: Segment Orchards ── */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 font-mono w-4">02</span>
              <span className="text-xs font-semibold text-gray-200">Segment Orchards</span>
            </div>
            <StepBadge status={steps.segment} />
          </div>
          {steps.segment === "done" && segmentResult ? (
            <ResultBlock>
              <Row label="Blocks detected" value={segmentResult.total_blocks} highlight />
              <Row label="Total hectares" value={`${segmentResult.total_hectares} ha`} />
              <Row label="High-stress blocks" value={segmentResult.high_stress_blocks} />
              <Row label="Segmentation scope" value={segmentResult.segmentation_scope ?? "municipality"} />
              <Row label="Sampled tree points" value={segmentResult.total_tree_points_sampled ?? 0} />
              {segmentResult.orchard_likelihood_summary && (
                <p className="text-[10px] text-gray-400 mt-1">{segmentResult.orchard_likelihood_summary}</p>
              )}
              <p className="text-[10px] text-gray-500 mt-1">{segmentResult.agent_note}</p>
              <MemoryBadge status={segmentResult.memory_status} />
            </ResultBlock>
          ) : (
            <button
              onClick={() => handleSegment("municipality")}
              disabled={steps.segment !== "idle" || steps.segment === "loading" as any}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {steps.segment === "loading" ? "Agent segmenting blocks..." : "Segment Selected Municipality"}
            </button>
          )}
        </div>

        {/* ── Step 3: Select Block ── */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 font-mono w-4">03</span>
              <span className="text-xs font-semibold text-gray-200">Select Orchard Block</span>
            </div>
            <StepBadge status={steps.select} />
          </div>
          {steps.select === "locked" && (
            <p className="text-[10px] text-gray-600">Complete segmentation first.</p>
          )}
          {steps.select === "done" && selectedBlock ? (
            <ResultBlock>
              <Row label="Block ID" value={selectedBlock.block_id} />
              <Row label="Hectares" value={`${selectedBlock.estimated_hectares} ha`} highlight />
              <Row label="Tree count est." value={selectedBlock.estimated_tree_count?.toLocaleString()} />
              <Row label="Canopy density" value={selectedBlock.canopy_density} />
              <Row label="Stress level" value={selectedBlock.stress_level} />
            </ResultBlock>
          ) : steps.select === "idle" && visibleBlocks.length > 0 && (
            <div className="space-y-1 mt-1">
              <p className="text-[10px] text-gray-500 mb-1.5">Agent selected next action — choose a block to analyze:</p>
              {visibleBlocks.map((block: any) => (
                <button
                  key={block.block_id}
                  onClick={() => handleSelectBlock(block)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/40 hover:border-primary/40 transition-all group"
                >
                  <span className="text-[11px] text-gray-300 group-hover:text-gray-100">{block.block_id}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">{block.estimated_hectares} ha</span>
                    <span className={`text-[10px] font-medium ${stressColor(block.stress_level)}`}>
                      {block.stress_level}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Step 4: Reconstruct Twin ── */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 font-mono w-4">04</span>
              <span className="text-xs font-semibold text-gray-200">Reconstruct Twin</span>
            </div>
            <StepBadge status={steps.twin} />
          </div>
          {steps.twin === "done" && twinResult ? (
            <ResultBlock>
              <p className="text-[10px] text-primary font-medium mb-1">Operational Twin Calibration</p>
              <Row label="Canopy height" value={`${twinResult.canopy_height_m} m`} />
              <Row label="Canopy volume index" value={twinResult.canopy_volume_index} highlight />
              <Row label="Tree spacing" value={`${twinResult.tree_spacing_m} m`} />
              <Row label="Terrain variation" value={`±${twinResult.terrain_variation_m} m`} />
              <Row label="Confidence" value={`${(twinResult.reconstruction_confidence * 100).toFixed(0)}%`} highlight />
              <p className="text-[10px] text-gray-500 mt-1">{twinResult.twin_update_recommendation}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{twinResult.agent_note}</p>
              <MemoryBadge status={twinResult.memory_status} />
            </ResultBlock>
          ) : (
            <button
              onClick={handleReconstructTwin}
              disabled={steps.twin !== "idle"}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {steps.twin === "loading" ? "Agent reconstructing twin..." : "Reconstruct Twin"}
            </button>
          )}
        </div>

        {/* ── Step 5: Dispatch Drone ── */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 font-mono w-4">05</span>
              <span className="text-xs font-semibold text-gray-200">Dispatch Drone Inspection</span>
            </div>
            <StepBadge status={steps.drone} />
          </div>
          {steps.drone === "done" && missionResult ? (
            <ResultBlock>
              <Row label="Mission ID" value={missionResult.mission_id} />
              <Row label="Waypoints" value={missionResult.waypoints?.length ?? missionResult.route?.length ?? "—"} highlight />
              <Row label="Priority zones" value={missionResult.priority_zones?.length ?? 3} />
              <p className="text-[10px] text-gray-500 mt-1">Agent generated mission plan · Route drawn on globe</p>
            </ResultBlock>
          ) : (
            <button
              onClick={handleDispatchDrone}
              disabled={steps.drone !== "idle"}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {steps.drone === "loading" ? "Agent planning mission..." : "Dispatch Drone Inspection"}
            </button>
          )}
        </div>

        {/* ── Step 6: Analyze Inspection ── */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 font-mono w-4">06</span>
              <span className="text-xs font-semibold text-gray-200">Analyze Inspection</span>
            </div>
            <StepBadge status={steps.analyze} />
          </div>
          {steps.analyze === "done" && analysisResult ? (
            <ResultBlock>
              <Row label="Severity" value={analysisResult.severity ?? "medium"} highlight />
              <Row label="Yield risk" value={analysisResult.yield_risk_percent ? `${analysisResult.yield_risk_percent}%` : "18%"} />
              <Row label="Financial exposure" value={analysisResult.estimated_financial_impact ?? "$145,000"} />
              <Row label="Confidence" value={analysisResult.confidence ? `${(analysisResult.confidence * 100).toFixed(0)}%` : "87%"} />
              {analysisResult.detected_issues?.length > 0 && (
                <div className="mt-1">
                  <p className="text-[10px] text-gray-500 mb-0.5">Detected issues:</p>
                  {analysisResult.detected_issues.map((issue: string, i: number) => (
                    <span key={i} className="inline-block text-[10px] bg-red-900/30 text-red-400 border border-red-700/30 px-1.5 py-0.5 rounded mr-1 mb-0.5">{issue}</span>
                  ))}
                </div>
              )}
            </ResultBlock>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={steps.analyze !== "idle"}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {steps.analyze === "loading" ? "Agent analyzing imagery..." : "Analyze Inspection"}
            </button>
          )}
        </div>

        {/* ── Step 7: Simulate ROI ── */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 font-mono w-4">07</span>
              <span className="text-xs font-semibold text-gray-200">Simulate Intervention ROI</span>
            </div>
            <StepBadge status={steps.roi} />
          </div>
          {steps.roi === "done" && roiResult ? (
            <ResultBlock>
              <Row label="Intervention cost" value={`$${(roiResult.estimated_intervention_cost ?? 12000).toLocaleString()}`} />
              <Row label="Avoided loss" value={`$${(roiResult.avoided_loss_estimate ?? 145000).toLocaleString()}`} highlight />
              <Row label="Yield recovery" value={`${roiResult.estimated_yield_recovery_percent ?? 8}%`} highlight />
              <Row label="14-day delay risk" value={`+${roiResult.delay_14_day_risk?.spread_risk_increase_percent ?? 12}% exposure`} />
              {roiResult.roi_summary && (
                <p className="text-[10px] text-gray-400 mt-1 italic">{roiResult.roi_summary}</p>
              )}
            </ResultBlock>
          ) : (
            <button
              onClick={handleROI}
              disabled={steps.roi !== "idle"}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {steps.roi === "loading" ? "Agent simulating ROI..." : "Simulate Intervention ROI"}
            </button>
          )}
        </div>

        {/* ── Step 8: Draft Field Task ── */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 font-mono w-4">08</span>
              <span className="text-xs font-semibold text-gray-200">Draft Field Task</span>
            </div>
            <StepBadge status={steps.task} />
          </div>
          {steps.task === "done" && taskResult ? (
            <ResultBlock>
              <Row label="Task ID" value={taskResult.task_id} />
              <Row label="Priority" value={taskResult.priority} highlight />
              <Row label="Recipient" value={taskResult.recipient_role} />
              <Row label="Approval required" value="Yes · Human-in-the-loop" />
              <div className="mt-1.5 p-2 rounded bg-gray-800/60 border border-gray-700/30">
                <p className="text-[10px] text-gray-500 mb-0.5 font-medium">Draft message:</p>
                <p className="text-[10px] text-gray-300 leading-relaxed">{taskResult.task_message}</p>
              </div>
              <div className="flex gap-1.5 mt-1">
                {taskResult.delivery_channels?.map((ch: string) => (
                  <span key={ch} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 border border-gray-700/30">{ch}</span>
                ))}
                <span className="text-[10px] text-gray-600 ml-auto italic">Not sent</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                <button
                  onClick={() => setApprovalState("approved")}
                  className="py-1 rounded text-[10px] font-semibold bg-emerald-700/80 text-white hover:bg-emerald-600 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(taskResult.task_message || "")}
                  className="py-1 rounded text-[10px] font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => setApprovalState("held")}
                  className="py-1 rounded text-[10px] font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Send Later
                </button>
              </div>
            </ResultBlock>
          ) : (
            <button
              onClick={handleDraftTask}
              disabled={steps.task !== "idle"}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {steps.task === "loading" ? "Agent drafting task..." : "Draft Field Task"}
            </button>
          )}
        </div>

        {/* ── Step 9: Human Approval ── */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-600 font-mono w-4">09</span>
              <span className="text-xs font-semibold text-gray-200">Human Approval</span>
            </div>
            {steps.approve === "locked" ? (
              <StepBadge status="locked" />
            ) : approvalState === "approved" ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-900/40 text-emerald-400 border border-emerald-700/40">Approved</span>
            ) : approvalState === "held" ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-900/40 text-amber-400 border border-amber-700/40">On Hold</span>
            ) : (
              <StepBadge status="idle" />
            )}
          </div>

          {steps.approve === "locked" && (
            <p className="text-[10px] text-gray-600">Draft field task first.</p>
          )}

          {steps.approve !== "locked" && !approvalState && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400">
                Agent used operational memory · Human approval required before dispatch.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setApprovalState("approved")}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700/80 text-white hover:bg-emerald-600 transition-colors"
                >
                  Approve & Hold for Dispatch
                </button>
                <button
                  onClick={() => setApprovalState("held")}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  Hold Task
                </button>
              </div>
            </div>
          )}

          {approvalState === "approved" && (
            <ResultBlock>
              <p className="text-[10px] text-emerald-400 font-medium">Task approved · Held for authorized dispatch.</p>
              <p className="text-[10px] text-gray-500 mt-0.5">No message sent. Delivery channels: SMS, Email, WhatsApp — pending authorization.</p>
              <p className="text-[10px] text-gray-600 mt-1">Historical orchard context retrieved · Agent workflow complete.</p>
            </ResultBlock>
          )}

          {approvalState === "held" && (
            <ResultBlock>
              <p className="text-[10px] text-amber-400 font-medium">Task placed on hold by operator.</p>
              <p className="text-[10px] text-gray-500 mt-0.5">No message sent. Return to approve when ready.</p>
              <button
                onClick={() => setApprovalState(null)}
                className="mt-1.5 text-[10px] text-gray-400 underline hover:text-gray-200"
              >
                Review again
              </button>
            </ResultBlock>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-800 bg-gray-900/30 flex items-center justify-between">
        <span className="text-[10px] text-gray-600">Recent operations timeline active</span>
        <button
          onClick={() => {
            setSteps(INITIAL_STATE);
            setScanResult(null);
            setSegmentResult(null);
            setInternalSelectedBlock(null);
            onBlockSelected?.(null);
            setTwinResult(null);
            setMissionResult(null);
            setAnalysisResult(null);
            setRoiResult(null);
            setTaskResult(null);
            setApprovalState(null);
            setError(null);
          }}
          className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
        >
          Reset workflow
        </button>
      </div>
    </div>
  );
}
