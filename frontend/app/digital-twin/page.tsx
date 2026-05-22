"use client";

import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const DigitalTwin3DView = dynamic(() => import("@/components/DigitalTwin3DView"), {
  ssr: false,
  loading: () => <ImageTwinLayer activeTab="Digital Twin" orchardId="loading" />,
});

type TwinTab = "Digital Twin" | "3D View" | "NDVI" | "Canopy Health" | "Soil Moisture" | "Thermal" | "Elevation";
type OverlayTone = "operational" | "ndvi" | "canopy" | "soil" | "thermal" | "elevation";

const tacticalTabs: TwinTab[] = ["Digital Twin", "3D View", "NDVI", "Canopy Health", "Soil Moisture", "Thermal", "Elevation"];

const tabOverlays: Record<TwinTab, { tone: OverlayTone; label: string; metric: string; value: string }> = {
  "Digital Twin": { tone: "operational", label: "Operational Twin", metric: "Confidence", value: "91%" },
  "3D View": { tone: "operational", label: "3D Reconstruction", metric: "Canopy Samples", value: "150" },
  NDVI: { tone: "ndvi", label: "NDVI Vegetation", metric: "Mean NDVI", value: "0.72" },
  "Canopy Health": { tone: "canopy", label: "Canopy Health", metric: "Density", value: "84%" },
  "Soil Moisture": { tone: "soil", label: "Soil Moisture", metric: "Variance", value: "-12%" },
  Thermal: { tone: "thermal", label: "Thermal Stress", metric: "Hotspots", value: "3" },
  Elevation: { tone: "elevation", label: "Elevation Model", metric: "Slope", value: "6.4 deg" },
};

const analysisSections: Array<{
  title: string;
  image: string;
  imageAlt: string;
  rows: Array<[string, string, number, "green" | "cyan" | "amber" | "red"]>;
}> = [
  {
    title: "Drone Capture",
    image: "/assets/orchard-real/drone_capture_card.png",
    imageAlt: "Drone capture of orchard canopy",
    rows: [["Capture", "RGB / 42m", 82, "cyan"], ["Overlap", "74%", 74, "green"], ["Review", "Ready", 66, "green"]],
  },
  {
    title: "Canopy Analysis",
    image: "/assets/orchard-real/leaf_canopy_closeup_01.png",
    imageAlt: "Close view of avocado canopy",
    rows: [["Leaf Density", "84%", 84, "green"], ["Gaps", "9%", 36, "amber"], ["Vigor", "Stable", 72, "green"]],
  },
  {
    title: "Soil & Root Zone",
    image: "/assets/orchard-real/root_system_closeup.png",
    imageAlt: "Root zone closeup",
    rows: [["Moisture", "-12%", 44, "amber"], ["Compaction", "Low", 28, "green"], ["Irrigation", "Adjust", 62, "cyan"]],
  },
  {
    title: "Fruit Estimation",
    image: "/assets/orchard-real/avocado_fruit_cluster.png",
    imageAlt: "Avocado fruit cluster",
    rows: [["Fruit Load", "3.2 t/ha", 77, "green"], ["Size Class", "Medium", 58, "cyan"], ["Yield Delta", "+8%", 68, "green"]],
  },
];

const insightCards = [
  ["Overall Health", "Good", "text-emerald-300", "Block condition"],
  ["Stress Areas", "12%", "text-amber-300", "Review required"],
  ["NDVI Delta", "-0.06", "text-amber-300", "7 day trend"],
  ["Yield Forecast", "3.2 t/ha", "text-gray-100", "+8% vs last scan"],
];

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

function AnalysisRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 py-1.5 last:border-0">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-right text-[11px] font-semibold text-gray-200">{value}</span>
    </div>
  );
}

function ModeOverlay({ tone }: { tone: OverlayTone }) {
  if (tone === "ndvi") {
    return (
      <svg className="absolute inset-0 h-full w-full mix-blend-screen" viewBox="0 0 1000 640" preserveAspectRatio="none">
        <polygon points="90,382 170,192 384,102 694,126 912,272 858,516 596,586 266,548" fill="rgba(34,197,94,0.18)" />
        <polygon points="308,330 488,262 660,318 608,456 388,478" fill="rgba(250,204,21,0.24)" />
        <polygon points="600,354 812,360 760,496 552,472" fill="rgba(239,68,68,0.22)" />
      </svg>
    );
  }

  if (tone === "canopy") {
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 640" preserveAspectRatio="none">
        {Array.from({ length: 54 }).map((_, index) => {
          const x = 130 + (index % 9) * 88 + Math.sin(index) * 18;
          const y = 156 + Math.floor(index / 9) * 62 + Math.cos(index * 1.7) * 16;
          const healthy = index % 7 !== 0;
          return <circle key={index} cx={x} cy={y} r={healthy ? 19 : 13} fill={healthy ? "rgba(74,222,128,0.22)" : "rgba(250,204,21,0.20)"} stroke="rgba(220,252,231,0.32)" strokeWidth="1" />;
        })}
      </svg>
    );
  }

  if (tone === "soil") {
    return (
      <svg className="absolute inset-0 h-full w-full mix-blend-screen" viewBox="0 0 1000 640" preserveAspectRatio="none">
        <ellipse cx="312" cy="388" rx="210" ry="118" fill="rgba(59,130,246,0.16)" />
        <ellipse cx="674" cy="346" rx="188" ry="132" fill="rgba(146,64,14,0.18)" />
        <path d="M142 498 C 292 418, 396 452, 536 386 S 766 296, 872 338" fill="none" stroke="rgba(125,211,252,0.48)" strokeWidth="5" strokeDasharray="16 12" />
      </svg>
    );
  }

  if (tone === "thermal") {
    return (
      <svg className="absolute inset-0 h-full w-full mix-blend-screen" viewBox="0 0 1000 640" preserveAspectRatio="none">
        <radialGradient id="thermalHot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.46" />
          <stop offset="58%" stopColor="#f97316" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
        <circle cx="704" cy="410" r="176" fill="url(#thermalHot)" />
        <circle cx="456" cy="288" r="124" fill="rgba(251,146,60,0.20)" />
      </svg>
    );
  }

  if (tone === "elevation") {
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 640" preserveAspectRatio="none">
        {Array.from({ length: 9 }).map((_, index) => (
          <path
            key={index}
            d={`M ${104 + index * 18} ${516 - index * 38} C ${246 + index * 28} ${456 - index * 20}, ${404 + index * 20} ${178 + index * 30}, ${882 - index * 22} ${154 + index * 44}`}
            fill="none"
            stroke="rgba(236,253,245,0.36)"
            strokeWidth="1.3"
            strokeDasharray={index % 2 ? "8 8" : "none"}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 640" preserveAspectRatio="none">
      <polygon points="82,372 164,186 392,94 692,126 910,270 856,512 596,584 268,548" fill="rgba(16,185,129,0.045)" stroke="rgba(225,250,255,0.88)" strokeWidth="2" />
      <polygon points="312,336 486,266 658,318 608,454 390,480" fill="rgba(250,204,21,0.16)" stroke="rgba(250,204,21,0.70)" strokeWidth="1.3" />
      <polygon points="600,354 812,360 760,496 552,472" fill="rgba(239,68,68,0.18)" stroke="rgba(248,113,113,0.76)" strokeWidth="1.4" />
      <path d="M190 210 C 312 266, 386 302, 510 344 S 734 420, 832 516" fill="none" stroke="rgba(255,255,255,0.86)" strokeWidth="2" strokeDasharray="10 10" />
    </svg>
  );
}

function ImageTwinLayer({ activeTab, orchardId }: { activeTab: TwinTab; orchardId: string }) {
  const overlay = tabOverlays[activeTab] ?? tabOverlays["Digital Twin"];

  return (
    <div className="relative h-full min-h-[520px] overflow-hidden rounded-lg bg-black">
      <img
        src="/assets/orchard-real/aerial_orchard_overview_01.png"
        alt="Aerial avocado orchard overview"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_42%,rgba(0,0,0,0.50)_100%),linear-gradient(180deg,rgba(0,0,0,0.10),rgba(0,0,0,0.46))]" />
      <ModeOverlay tone={overlay.tone} />
      <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-white/10 bg-black/70 px-4 py-3 shadow-2xl backdrop-blur-md">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">{overlay.label}</div>
        <div className="mt-1 text-sm font-semibold text-white">{orchardId}</div>
        <div className="mt-2 grid grid-cols-3 gap-3 text-[10px] text-gray-400">
          <span><b className="text-gray-100">Drone</b> capture</span>
          <span><b className="text-amber-200">12%</b> stress</span>
          <span><b className="text-cyan-200">{overlay.value}</b> {overlay.metric}</span>
        </div>
      </div>
      <div className="pointer-events-none absolute right-5 top-5 w-64 rounded-lg border border-white/10 bg-black/70 p-4 shadow-2xl backdrop-blur-md">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
          Selected Zone - <span className="text-red-300">High Risk</span>
        </div>
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between border-b border-white/5 pb-1.5"><span className="text-gray-500">Zone Area</span><b className="text-gray-100">2.14 ha</b></div>
          <div className="flex justify-between border-b border-white/5 pb-1.5"><span className="text-gray-500">Tree Count</span><b className="text-gray-100">612</b></div>
          <div className="flex justify-between border-b border-white/5 pb-1.5"><span className="text-gray-500">Risk Level</span><b className="text-red-300">High</b></div>
          <div className="flex justify-between"><span className="text-gray-500">Priority Score</span><b className="text-cyan-200">87 / 100</b></div>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 w-[42%] -translate-x-1/2 rounded-lg border border-white/10 bg-black/70 px-4 py-3 backdrop-blur-md">
        <div className="mb-2 text-center text-xs font-semibold text-gray-200">May 15, 2025 10:42 AM</div>
        <div className="relative h-1 rounded-full bg-gray-700">
          <span className="absolute left-[52%] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.7)]" />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-gray-500">
          <span>May 10</span><span>May 12</span><span>May 15</span><span>May 18</span><span>May 21</span>
        </div>
      </div>
    </div>
  );
}

class TwinErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean; message: string }> {
  state = { failed: false, message: "" };

  static getDerivedStateFromError(error: Error) {
    return { failed: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Digital Twin route render failed", error, info);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="relative h-full min-h-[520px] overflow-hidden rounded-lg border border-amber-300/20 bg-black">
          {this.props.fallback}
          <div className="absolute left-4 top-4 rounded-md border border-amber-300/30 bg-amber-300/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100 backdrop-blur">
            3D fallback active: {this.state.message || "render error"}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function DigitalTwinPage() {
  const [activeTab, setActiveTab] = useState<TwinTab>("Digital Twin");
  const [orchardId, setOrchardId] = useState("los-reyes-block-7a");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrchardId(params.get("orchardId") || "los-reyes-block-7a");
  }, []);

  useEffect(() => {
    console.log("Digital Twin active tab", activeTab);
  }, [activeTab]);

  const tacticalActions = useMemo(
    () => [
      ["Create ROI Case", "Financial exposure"],
      ["Dispatch Drone", "Mission task"],
      ["Draft Field Task", "Approval workflow"],
      ["Export ML Label", "Training archive"],
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#03080d] text-gray-100">
      <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#050b11]/95 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-xs font-black text-cyan-200">
            DT
          </div>
          <div>
            <div className="text-base font-semibold leading-tight text-white">Digital Twin Operations</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray-500">{orchardId}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-emerald-400/20 bg-emerald-400/15 px-3 py-1.5 text-xs font-semibold text-emerald-200">Production isolated rendering mode</span>
          <Link href="/command-center" className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-gray-300 hover:border-cyan-300/35 hover:text-cyan-200">
            Back to Globe Command
          </Link>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-56px)] grid-cols-1 gap-3 bg-[radial-gradient(circle_at_28%_0%,rgba(0,212,255,0.10),transparent_30%),linear-gradient(135deg,#03080d_0%,#071018_54%,#03070b_100%)] p-3 xl:grid-cols-[minmax(0,1fr)_330px] xl:p-4">
        <section className="min-h-0 rounded-lg border border-white/10 bg-[#07111a]/72 p-2.5 shadow-2xl shadow-black/40">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {tacticalTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                  activeTab === tab ? "border-cyan-300 bg-cyan-300 text-gray-950" : "border-white/10 bg-white/[0.04] text-gray-300 hover:border-cyan-300/35 hover:text-cyan-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-black xl:h-[calc(100vh-130px)]">
            <TwinErrorBoundary fallback={<ImageTwinLayer activeTab="Digital Twin" orchardId={orchardId} />}>
              {activeTab === "3D View" ? <DigitalTwin3DView /> : <ImageTwinLayer activeTab={activeTab} orchardId={orchardId} />}
            </TwinErrorBoundary>
          </div>
        </section>

        <aside className="space-y-2.5 rounded-lg border border-white/10 bg-[#07111a]/84 p-2.5 backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-1.5">
            {insightCards.map(([label, value, tone, note]) => (
              <div key={label} className="rounded-md border border-white/10 bg-white/[0.04] p-2">
                <div className="truncate text-[10px] text-gray-500">{label}</div>
                <div className={`mt-1 text-[15px] font-semibold leading-tight ${tone}`}>{value}</div>
                <div className="mt-0.5 truncate text-[9px] text-gray-600">{note}</div>
              </div>
            ))}
          </div>

          {analysisSections.map((section) => (
            <div key={section.title} className="rounded-md border border-white/10 bg-white/[0.035] p-2.5">
              <div className="relative mb-2 h-24 overflow-hidden rounded-md border border-white/10 bg-black/40">
                <img src={section.image} alt={section.imageAlt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.58)),radial-gradient(circle_at_50%_35%,transparent_34%,rgba(0,0,0,0.32)_100%)]" />
              </div>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-400">{section.title}</div>
                <div className="h-1 w-8 rounded-full bg-cyan-300/35" />
              </div>
              <div className="space-y-1">
                {section.rows.map(([label, value, bar, tone]) => (
                  <div key={label} className="border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                    <AnalysisRow label={label} value={value} />
                    <MetricBar value={bar} tone={tone} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-md border border-cyan-300/15 bg-cyan-300/[0.035] p-2.5">
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-300">ROI / Task Workflow</div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {tacticalActions.map(([label, note]) => (
                <button
                  key={label}
                  className="rounded border border-white/10 bg-white/[0.045] px-2 py-1 text-left text-[9px] font-semibold text-gray-300 hover:border-cyan-300/30 hover:text-cyan-200"
                >
                  <span className="block">{label}</span>
                  <span className="mt-0.5 block text-[8px] font-medium text-gray-600">{note}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
