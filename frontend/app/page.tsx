import Link from "next/link";
import Header from "@/components/Header";

const outcomes = [
  {
    title: "Regional scan found 3 high-risk zones",
    body: "Belt-wide segmentation surfaced heat and canopy stress clusters before crews were dispatched.",
    metric: "3 zones",
  },
  {
    title: "Drone inspection reduced unnecessary field walks",
    body: "Mission routing focused scouting on blocks with row-pattern anomalies and elevated stress scores.",
    metric: "42% less scouting",
  },
  {
    title: "ROI simulation estimated $210K avoided loss",
    body: "Financial exposure was modeled before task approval, helping prioritize treatment timing.",
    metric: "$210K",
  },
];

const workflow = [
  "Scan Belt",
  "Segment Orchards",
  "Reconstruct Twin",
  "Dispatch Drone",
  "Analyze",
  "Simulate ROI",
  "Draft Field Task",
];

const whyItMatters = [
  "Reduce scouting time across large avocado regions",
  "Prioritize limited labor against the highest-risk blocks",
  "Catch canopy stress earlier with map-driven inspection",
  "Estimate financial exposure before field execution",
  "Turn human corrections into ML label archive examples",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#05070b] text-gray-100">
      <Header />

      <main className="bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.14),transparent_34%),linear-gradient(135deg,#05070b_0%,#10151f_52%,#07110d_100%)]">
        <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-[1540px] items-center gap-10 px-6 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(560px,1.1fr)]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-semibold text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300"></span>
              Gemini: Mock · MongoDB Memory: Live / Fallback · Human Approval: Required
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold text-white md:text-7xl">
              Gemini Orchard Operations OS
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              A premium operational intelligence platform for avocado agriculture: scan the belt, segment orchard blocks,
              dispatch drone inspection, simulate financial exposure, and approve field work from one command surface.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/command-center"
                className="rounded-lg bg-cyan-300 px-6 py-3 text-sm font-bold text-gray-950 shadow-[0_0_30px_rgba(0,212,255,0.2)] transition-opacity hover:opacity-90"
              >
                Launch Command Center
              </Link>
              <Link
                href="/orchards"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/[0.08]"
              >
                View Orchard Workspace
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="text-2xl font-semibold text-white">847</div>
                <div className="mt-1 text-xs text-gray-500">orchard clusters monitored</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="text-2xl font-semibold text-white">142K ha</div>
                <div className="mt-1 text-xs text-gray-500">regional operating area</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="text-2xl font-semibold text-white">91%</div>
                <div className="mt-1 text-xs text-gray-500">example segmentation confidence</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/35 p-3 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between px-2 pt-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Operational Preview</div>
                <div className="mt-1 text-lg font-semibold text-white">Orchard segmentation and mission routing</div>
              </div>
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold text-amber-300">
                Review Required
              </span>
            </div>
            <img
              src="/assets/orchard-operations-preview.svg"
              alt="Operational avocado orchard map showing segmented blocks, canopy row patterns, drone route, and yield risk overlay"
              className="h-auto w-full rounded-md border border-white/10"
            />
          </div>
        </section>

        <section className="mx-auto max-w-[1540px] px-6 pb-12">
          <div className="grid gap-4 md:grid-cols-3">
            {outcomes.map((outcome) => (
              <article key={outcome.title} className="rounded-lg border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
                <div className="mb-4 inline-flex rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                  {outcome.metric}
                </div>
                <h2 className="text-lg font-semibold text-white">{outcome.title}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-500">{outcome.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1540px] px-6 pb-12">
          <div className="rounded-lg border border-white/10 bg-black/35 p-6 backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Workflow Preview</div>
                <h2 className="mt-2 text-3xl font-semibold text-white">From regional scan to human-approved field execution</h2>
              </div>
              <Link href="/command-center" className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">
                Open live workflow
              </Link>
            </div>
            <div className="grid gap-2 lg:grid-cols-7">
              {workflow.map((step, index) => (
                <div key={step} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-[10px] font-semibold text-cyan-300">0{index + 1}</div>
                  <div className="mt-3 text-sm font-semibold text-gray-100">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1540px] px-6 pb-16">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Why This Matters</div>
              <h2 className="mt-3 text-3xl font-semibold text-white">Operational clarity for high-value avocado regions</h2>
              <p className="mt-4 text-sm leading-6 text-gray-500">
                The system does not ask operators to trust a generic map. It ties orchard boundaries, canopy evidence,
                mission planning, ROI, and human corrections into one operational memory loop.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {whyItMatters.map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-3 h-1.5 w-10 rounded-full bg-cyan-300"></div>
                  <div className="text-sm font-semibold leading-6 text-gray-100">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
