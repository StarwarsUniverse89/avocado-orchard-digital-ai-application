import Link from "next/link";
import Header from "@/components/Header";

interface IntegratedCommandCenterPageProps {
  title: string;
  eyebrow: string;
  description: string;
  signals: string[];
  outcome?: string;
}

export default function IntegratedCommandCenterPage({
  title,
  eyebrow,
  description,
  signals,
  outcome = "Live workflow is consolidated in the map-driven Command Center.",
}: IntegratedCommandCenterPageProps) {
  return (
    <div className="min-h-screen bg-[#05070b] text-gray-100">
      <Header />
      <main className="min-h-[calc(100vh-73px)] bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.12),transparent_34%),linear-gradient(135deg,#05070b_0%,#10151f_52%,#07110d_100%)] px-6 py-10">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-lg border border-white/10 bg-black/35 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-400">{description}</p>
            <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Operational Status</div>
                <div className="mt-3 text-2xl font-semibold text-white">Integrated Command Module</div>
                <p className="mt-3 text-sm leading-6 text-gray-500">{outcome}</p>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-cyan-300/20 bg-cyan-300/10 p-3">
                    <div className="text-xs font-semibold text-cyan-200">Gemini</div>
                    <div className="mt-1 text-[11px] text-gray-500">Live / Mock</div>
                  </div>
                  <div className="rounded-md border border-emerald-300/20 bg-emerald-300/10 p-3">
                    <div className="text-xs font-semibold text-emerald-200">Memory</div>
                    <div className="mt-1 text-[11px] text-gray-500">Live / Fallback</div>
                  </div>
                  <div className="rounded-md border border-amber-300/20 bg-amber-300/10 p-3">
                    <div className="text-xs font-semibold text-amber-200">Approval</div>
                    <div className="mt-1 text-[11px] text-gray-500">Required</div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#07110d] p-5">
                <div className="h-48 rounded-md border border-white/10 bg-[linear-gradient(135deg,rgba(34,197,94,0.18),transparent_38%),linear-gradient(45deg,rgba(103,232,249,0.10)_25%,transparent_25%,transparent_50%,rgba(103,232,249,0.10)_50%,rgba(103,232,249,0.10)_75%,transparent_75%)] bg-[length:auto,34px_34px]">
                  <div className="flex h-full flex-col justify-end p-4">
                    <div className="rounded-md border border-cyan-300/20 bg-black/60 p-3">
                      <div className="text-sm font-semibold text-white">{eyebrow}</div>
                      <div className="mt-1 text-xs text-gray-400">Route opens the operational workflow panel.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {signals.map((signal) => (
                <div key={signal} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-3 h-1.5 w-10 rounded-full bg-cyan-300"></div>
                  <div className="text-sm font-semibold text-gray-100">{signal}</div>
                  <div className="mt-1 text-xs text-gray-500">Integrated in Command Center</div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/command-center"
                className="rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-gray-950 transition-opacity hover:opacity-90"
              >
                Open Command Center
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/[0.08]"
              >
                Product Overview
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
