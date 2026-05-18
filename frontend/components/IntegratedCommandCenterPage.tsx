import Link from "next/link";
import Header from "@/components/Header";

interface IntegratedCommandCenterPageProps {
  title: string;
  eyebrow: string;
  description: string;
  signals: string[];
}

export default function IntegratedCommandCenterPage({
  title,
  eyebrow,
  description,
  signals,
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
            <div className="mt-8 grid gap-3 md:grid-cols-3">
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
