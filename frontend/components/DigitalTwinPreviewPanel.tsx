import Link from "next/link";

const insightRows = [
  ["Overall Health", "Good", "text-emerald-300"],
  ["Block Area", "2.14 ha", "text-gray-100"],
  ["Stress Areas", "12% of block", "text-amber-300"],
  ["Estimated Yield", "3.2 t/ha", "text-gray-100"],
  ["Irrigation Recommendation", "-12%", "text-cyan-300"],
];

const analysisCards = [
  {
    title: "Canopy Analysis",
    rows: [
      ["Leaf Density", "82%"],
      ["Chlorophyll Index", "0.78"],
      ["Pest Indicators", "Low"],
      ["Canopy Temp", "24.3 C"],
    ],
    image: "/assets/orchard-real/leaf_canopy_closeup_01.png",
    imageAlt: "Close-up canopy analysis capture",
  },
  {
    title: "Soil & Root Zone",
    rows: [
      ["Soil Moisture", "67%"],
      ["Soil EC", "1.2 dS/m"],
      ["Root Biomass", "High"],
      ["Compaction Risk", "Low"],
    ],
    image: "/assets/orchard-real/root_system_closeup.png",
    imageAlt: "Avocado root system close-up",
  },
  {
    title: "Fruit Estimation",
    rows: [
      ["Avg Fruit / Tree", "124"],
      ["Size Distribution", "M-L"],
      ["Estimated Yield", "3.2 t/ha"],
      ["Confidence", "91%"],
    ],
    image: "/assets/orchard-real/avocado_fruit_cluster.png",
    imageAlt: "Avocado fruit cluster",
  },
];

function Thumbnail({ image, alt }: { image: string; alt: string }) {
  return (
    <div className="relative h-20 overflow-hidden rounded-md border border-white/10 bg-black/35">
      <img src={image} alt={alt} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.48)),radial-gradient(circle_at_50%_35%,transparent_32%,rgba(0,0,0,0.34)_100%)]" />
    </div>
  );
}

export default function DigitalTwinPreviewPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#071018] shadow-2xl shadow-cyan-950/25">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Digital Twin Preview</div>
          <div className="mt-1 text-lg font-semibold text-white">Los Reyes Orchard - Block 7A</div>
        </div>
        <Link href="/command-center" className="rounded-md bg-cyan-300 px-3 py-2 text-xs font-bold text-gray-950">
          Open Mission Control
        </Link>
      </div>

      <div className={`grid ${compact ? "lg:grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_320px]"} gap-0`}>
        <div className="relative min-h-[520px] overflow-hidden bg-[#0a130e]">
          <img
            src="/assets/orchard-real/aerial_orchard_overview_01.png"
            alt="Aerial avocado orchard overview"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_42%,rgba(0,0,0,0.50)_100%),linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.44))]" />

          <div className="absolute left-[5%] top-[5%] h-[82%] w-[88%] [clip-path:polygon(12%_56%,31%_17%,62%_20%,91%_43%,86%_79%,52%_86%,20%_77%)] border border-cyan-200/70 bg-emerald-300/[0.045] shadow-[0_0_22px_rgba(103,232,249,0.18)]" />
          <div className="absolute left-[28%] top-[50%] h-[22%] w-[29%] rotate-[-13deg] border border-amber-300/70 bg-amber-300/12" />
          <div className="absolute left-[51%] top-[58%] h-[18%] w-[31%] rotate-[8deg] border border-red-400/60 bg-red-500/16" />

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 900 540" preserveAspectRatio="none">
            <path d="M92 282 L266 96 L558 108 L816 238 L770 420 L470 466 L186 416 Z" fill="none" stroke="#BDEBFF" strokeOpacity="0.9" strokeWidth="2" />
            <path d="M460 132 C520 178 588 235 656 288 C704 326 737 347 775 355" fill="none" stroke="#F8FAFC" strokeOpacity="0.9" strokeWidth="3" strokeDasharray="10 10" />
            <path d="M448 130 l20 7 l-19 9 z" fill="#F8FAFC" />
          </svg>

          <div className="absolute left-4 top-4 flex gap-2">
            {["3D View", "NDVI", "Canopy Health", "Soil Moisture", "Thermal"].map((tab, index) => (
              <span key={tab} className={`rounded-md border px-3 py-1.5 text-[11px] font-semibold ${index === 0 ? "border-cyan-300 bg-cyan-300 text-gray-950" : "border-white/10 bg-black/45 text-gray-300"}`}>
                {tab}
              </span>
            ))}
          </div>

          <div className="absolute right-4 top-16 w-56 rounded-lg border border-white/10 bg-black/65 p-4 backdrop-blur-md">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">Selected Zone - <span className="text-red-300">High Risk</span></div>
            <div className="mt-3 space-y-2 text-xs">
              {["Zone Area|2.14 ha", "Tree Count (est.)|612", "Risk Level|High", "Est. Yield Impact|-18%", "Priority Score|87 / 100"].map((row) => {
                const [label, value] = row.split("|");
                return (
                  <div key={label} className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-100">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-4 left-4 w-56 overflow-hidden rounded-lg border border-white/10 bg-black/70">
            <div className="relative h-24 overflow-hidden">
              <img
                src="/assets/orchard-real/drone_capture_card.png"
                alt="Drone capture of avocado orchard canopy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/45" />
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold text-white">Drone Capture</div>
              <div className="mt-1 text-xs text-gray-500">May 15, 2025 9:08 AM</div>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 w-[46%] -translate-x-1/2 rounded-lg border border-white/10 bg-black/70 px-4 py-3">
            <div className="mb-2 text-center text-xs font-semibold text-gray-200">May 15, 2025 10:42 AM</div>
            <div className="relative h-1 rounded-full bg-gray-700">
              <span className="absolute left-[52%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.7)]" />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-gray-400">
              <span>May 10</span><span>May 12</span><span>May 15</span><span>May 18</span><span>May 21</span>
            </div>
          </div>
        </div>

        {!compact && (
          <aside className="border-l border-white/10 bg-black/35 p-4">
            <div className="mb-3 grid grid-cols-2 gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em]">
              <div className="border-b border-cyan-300 pb-2 text-gray-100">Block Insights</div>
              <div className="border-b border-white/10 pb-2 text-gray-500">AI Analysis</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {insightRows.map(([label, value, tone]) => (
                <div key={label} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <div className="text-[11px] text-gray-500">{label}</div>
                  <div className={`mt-2 text-lg font-semibold ${tone}`}>{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {analysisCards.map((card) => (
                <div key={card.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">{card.title}</div>
                  <div className="grid grid-cols-[104px_1fr] gap-3">
                    <Thumbnail image={card.image} alt={card.imageAlt} />
                    <div className="space-y-1.5">
                      {card.rows.map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-3 text-[11px]">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-semibold text-gray-100">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-white/10 bg-black/35 p-3 md:grid-cols-5">
        {[
          ["142K ha", "Area Monitored"],
          ["847", "Orchard Blocks"],
          ["91%", "Segmentation Confidence"],
          ["$210K", "Exposure Modeled"],
          ["12", "Missions This Month"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
            <div className="text-xl font-semibold text-white">{value}</div>
            <div className="mt-1 text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
