"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const GoogleCommandMapView = dynamic(() => import("@/components/GoogleCommandMapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[520px] items-center justify-center rounded-lg bg-black text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
      Loading Satellite Command Center
    </div>
  ),
});

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

type OperatorRole = "regional" | "municipality" | "owner";

const operationsModules: Array<{
  id: ActiveModule;
  label: string;
  status: "live" | "review" | "approval" | "ready";
}> = [
  { id: "command", label: "Satellite Command", status: "live" },
  { id: "regional", label: "Regional Command", status: "live" },
  { id: "network", label: "Orchards", status: "ready" },
  { id: "segmentation", label: "Segmentation Review", status: "review" },
  { id: "manual", label: "Manual Boundaries", status: "ready" },
  { id: "drone", label: "Drone Missions", status: "live" },
  { id: "inspection", label: "Inspection Analysis", status: "ready" },
  { id: "roi", label: "Financial Exposure", status: "ready" },
  { id: "tasking", label: "Task Delegation", status: "approval" },
  { id: "ml", label: "ML Label Archive", status: "ready" },
  { id: "analytics", label: "Analytics", status: "ready" },
  { id: "integrations", label: "Integrations", status: "ready" },
  { id: "settings", label: "Settings", status: "ready" },
];

const navSections: Array<{ label: string; items: ActiveModule[] }> = [
  { label: "Command", items: ["command", "regional"] },
  { label: "Operations", items: ["network", "segmentation", "manual", "drone", "inspection", "tasking"] },
  { label: "Intelligence", items: ["roi", "ml", "analytics"] },
  { label: "System", items: ["integrations", "settings"] },
];

const bottomKpis = [
  ["142K ha", "Area Monitored", "Esri Satellite"],
  ["847", "Orchard Blocks", "Active Monitoring"],
  ["91%", "Segmentation Confidence", "AI Review"],
  ["$210K", "Exposure Modeled", "High Risk Areas"],
  ["3", "Critical Alerts", "Requires Attention"],
  ["12", "Missions This Month", "Drone Operations"],
];

const insightCards = [
  ["Selected Block", "Block 7A", "text-gray-100", "Esri satellite"],
  ["Overall Health", "Good", "text-emerald-300", "Block condition"],
  ["Stress Areas", "12%", "text-amber-300", "Review required"],
  ["Tree Samples", "66", "text-cyan-200", "canopy points"],
  ["Manual Labels", "Ready", "text-emerald-300", "archive enabled"],
  ["Drone Route", "Planned", "text-cyan-300", "flight path"],
  ["Priority Zones", "2", "text-red-300", "field review"],
  ["Estimated Yield", "3.2 t/ha", "text-gray-100", "+8% vs last scan"],
];

const analysisSections: Array<{
  title: string;
  rows: Array<[string, string, number, "green" | "cyan" | "amber" | "red"]>;
}> = [
  {
    title: "Satellite Tile Context",
    rows: [
      ["Provider", "Esri", 76, "cyan"],
      ["Imagery", "Satellite", 84, "green"],
      ["deck.gl", "Active", 68, "green"],
      ["MapLibre", "Stable", 42, "cyan"],
    ],
  },
  {
    title: "Operational Layers",
    rows: [
      ["Segmentation", "3 blocks", 82, "green"],
      ["Manual Draw", "Ready", 68, "cyan"],
      ["Tree Samples", "66", 74, "green"],
      ["Priority Zones", "2", 42, "amber"],
    ],
  },
];

function StatusPill({ label, value, tone = "cyan" }: { label: string; value: string; tone?: "cyan" | "green" | "amber" }) {
  const tones = {
    cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
    green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    amber: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  };

  return (
    <div className={`rounded-md border px-3 py-2 ${tones[tone]}`}>
      <div className="text-[10px] uppercase tracking-[0.18em] opacity-70">{label}</div>
      <div className="mt-1 flex items-center gap-2 text-xs font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
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

function ModuleStatus({ status }: { status: "live" | "review" | "approval" | "ready" }) {
  const styles = {
    live: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    review: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    approval: "bg-red-400/10 text-red-300 border-red-400/20",
    ready: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
  };
  const labels = { live: "Live", review: "Review", approval: "Approval", ready: "Ready" };
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles[status]}`}>{labels[status]}</span>;
}

export default function GoogleCommandCenter() {
  const [activeModule, setActiveModule] = useState<ActiveModule>("command");
  const [operatorRole, setOperatorRole] = useState<OperatorRole>("regional");
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [selectedContextOpen, setSelectedContextOpen] = useState(true);

  return (
    <div className="h-screen overflow-hidden bg-[#03080d] text-gray-100">
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#050b11]/95 px-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-xs font-black text-cyan-200">
            GM
          </div>
          <div>
            <div className="text-base font-semibold leading-tight text-white">Satellite Command Center</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-500">MapLibre + deck.gl Tactical Operations</div>
          </div>
        </div>
        <nav className="hidden h-full items-center gap-8 text-sm font-medium text-gray-300 lg:flex">
          {["Satellite Command", "Regional Command", "Orchards", "Financial Exposure", "Integrations"].map((item, index) => (
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
          <StatusPill label="Provider" value="Esri Imagery" tone="green" />
          <StatusPill label="Renderer" value="MapLibre + deck.gl" tone="cyan" />
          <StatusPill label="Mode" value="Production Safe" tone="amber" />
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
                        <ModuleStatus status={module.status} />
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
          </div>
        </aside>

        <section className="min-h-0 p-3 xl:p-4">
          <div className="flex h-full min-h-0 flex-col rounded-lg border border-white/10 bg-[#07111a]/72 p-2.5 shadow-2xl shadow-black/40">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Satellite Command</div>
                <h1 className="mt-2 text-xl font-semibold text-white">Michoacan Orchard Operations</h1>
              </div>
              <span className="rounded-md border border-emerald-400/20 bg-emerald-400/15 px-3 py-1.5 text-xs font-semibold text-emerald-200">Cesium isolated on /command-center</span>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">MapLibre + deck.gl</span>
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-gray-300">Esri World Imagery</span>
              <span className="rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-200">Production Safe Map</span>
              <Link
                href="/command-center"
                className="ml-auto rounded-md border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-300/15"
              >
                Back to Cesium Command Center
              </Link>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-black">
              <GoogleCommandMapView
                selectedBlockId={selectedBlock?.block_id}
                onBlockSelected={(block) => {
                  setSelectedBlock(block);
                  setActiveModule("segmentation");
                }}
                className="h-full min-h-full rounded-none"
              />
            </div>
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
              Map Ops
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {insightCards.map(([label, value, tone, note]) => (
              <div key={label} className="rounded-md border border-white/10 bg-white/[0.04] p-2">
                <div className="truncate text-[10px] text-gray-500">{label}</div>
                <div className={`mt-1 text-[15px] font-semibold leading-tight ${tone}`}>{label === "Selected Block" ? selectedBlock?.name || value : value}</div>
                <div className="mt-0.5 truncate text-[9px] text-gray-600">{note}</div>
              </div>
            ))}
          </div>

          <div className="mt-2 space-y-1.5">
            {analysisSections.map((section) => (
              <div key={section.title} className="rounded-md border border-white/10 bg-white/[0.035] p-2.5">
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
              <IntelligenceRow label="Target" value={selectedBlock?.name || "No block selected"} />
              <IntelligenceRow label="Context type" value={selectedBlock ? "orchard block" : "regional map"} />
            </div>
            {selectedContextOpen && (
              <>
                <IntelligenceRow label="ID / Name" value={selectedBlock?.block_id || "Click a polygon"} />
                <IntelligenceRow label="Hectares" value={`${Number(selectedBlock?.estimated_hectares || 2.14).toLocaleString()} ha`} />
                <IntelligenceRow label="Stress" value={selectedBlock?.stress_level || "medium"} tone={selectedBlock?.stress_level === "high" ? "text-red-300" : "text-amber-300"} />
                <IntelligenceRow label="Tree estimate" value={Number(selectedBlock?.tree_count_estimate || 612).toLocaleString()} />
                <IntelligenceRow label="Confidence" value={`${Math.round((selectedBlock?.confidence_score || 0.91) * 100)}%`} />
                <IntelligenceRow label="Boundary source" value={selectedBlock?.boundary_source || "esri_satellite_ai"} />
              </>
            )}
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {[
                ["Segment Orchards", () => setActiveModule("segmentation")],
                ["Manual Boundary", () => setActiveModule("manual")],
                ["Dispatch Drone", () => setActiveModule("drone")],
                ["Analyze Inspection", () => setActiveModule("inspection")],
                ["Simulate ROI", () => setActiveModule("roi")],
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
