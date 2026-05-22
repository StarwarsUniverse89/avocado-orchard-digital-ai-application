import Link from "next/link";
import Header from "@/components/Header";
import DigitalTwinPreviewPanel from "@/components/DigitalTwinPreviewPanel";

interface IntegratedCommandCenterPageProps {
  title: string;
  eyebrow: string;
  description: string;
  signals: string[];
  outcome?: string;
  metrics?: Array<[string, string, string]>;
  records?: Array<[string, string, string, string]>;
  modules?: Array<[string, string, string]>;
}

export default function IntegratedCommandCenterPage({
  title,
  eyebrow,
  description,
  signals,
  outcome = "Live workflow is consolidated in the map-driven Command Center.",
  metrics = [
    ["Gemini", "Live / Mock", "Operations reasoning"],
    ["Memory", "Live / Fallback", "Mission archive"],
    ["Approval", "Required", "Human-in-the-loop"],
  ],
  records = [
    ["Tancitaro", "High stress", "Drone mission queued", "Review"],
    ["Uruapan", "Medium risk", "ROI modeled", "Ready"],
    ["Los Reyes", "Healthy", "Operational memory synced", "Live"],
  ],
  modules = [
    ["Gemini", "Live / Mock", "Reasoning layer"],
    ["MongoDB Memory", "Live / Fallback", "Mission archive"],
    ["Human Approval", "Required", "Field tasking"],
  ],
}: IntegratedCommandCenterPageProps) {
  return (
    <div className="min-h-screen bg-[#05070b] text-gray-100">
      <Header />
      <main className="min-h-[calc(100vh-73px)] bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.12),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.1),transparent_30%),linear-gradient(135deg,#05070b_0%,#10151f_52%,#07110d_100%)] px-6 py-10">
        <section className="mx-auto max-w-6xl">
          <div className="rounded-lg border border-white/10 bg-black/35 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</div>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-400">{description}</p>
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">Operational Status</div>
                <div className="mt-3 text-xl font-semibold text-white">Integrated Command Module</div>
                <p className="mt-3 text-sm leading-6 text-gray-500">{outcome}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {metrics.map(([label, value, note]) => (
                    <div key={label} className="rounded-md border border-cyan-300/20 bg-cyan-300/10 p-3">
                      <div className="text-xs font-semibold text-cyan-200">{label}</div>
                      <div className="mt-1 text-sm font-semibold text-gray-100">{value}</div>
                      <div className="mt-1 text-[11px] text-gray-500">{note}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-white/10 bg-black/25">
                  <div className="grid grid-cols-4 border-b border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                    <span>Asset</span>
                    <span>Status</span>
                    <span>Next Action</span>
                    <span className="text-right">State</span>
                  </div>
                  {records.map(([asset, status, action, state]) => (
                    <div key={`${asset}-${action}`} className="grid grid-cols-4 items-center border-b border-white/5 px-3 py-2 text-xs last:border-0">
                      <span className="font-semibold text-gray-200">{asset}</span>
                      <span className="text-gray-400">{status}</span>
                      <span className="text-gray-500">{action}</span>
                      <span className="text-right font-semibold text-cyan-200">{state}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <DigitalTwinPreviewPanel compact />
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
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {modules.map(([label, value, note]) => (
                <div key={label} className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500">{label}</div>
                  <div className="mt-1 text-xs font-semibold text-gray-200">{value}</div>
                  <div className="mt-1 text-[11px] text-gray-500">{note}</div>
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
