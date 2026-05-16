"use client";

import { useState, useEffect } from "react";
import { getRegionalSummary } from "@/lib/api";

export default function RegionalOperationsPanel() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await getRegionalSummary();
      if (res.success) setSummary(res.data);
      setLoading(false);
    };
    fetchSummary();
  }, []);

  if (loading || !summary) return null;

  return (
    <div className="glass-elevated rounded-2xl p-6 border-t-4 border-t-primary animate-fade-in mb-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Branding/Agent Status */}
        <div className="lg:w-1/4 border-r border-gray-800 pr-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse">
              <span className="text-gray-950 text-xs font-black">AI</span>
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-primary">
              Regional Operations Agent
            </h2>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Fleet Deployment Area</p>
            <p className="text-xl font-bold text-gray-100 leading-tight">{summary.region_name}</p>
          </div>
        </div>

        {/* Center: Stats Grid */}
        <div className="lg:flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
             <span className="text-[9px] text-gray-500 uppercase font-black">Monitored / Clusters</span>
             <p className="text-lg font-bold text-gray-100">{summary.total_municipalities_monitored} / {summary.total_orchards_monitored}</p>
          </div>
          <div className="space-y-1">
             <span className="text-[9px] text-gray-500 uppercase font-black">Estimated Hectares</span>
             <p className="text-lg font-bold text-gray-100">{summary.total_hectares_estimated.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
             <span className="text-[9px] text-gray-500 uppercase font-black">Yield at Risk (Tons)</span>
             <p className="text-lg font-bold text-error">{summary.estimated_yield_at_risk_tons}</p>
          </div>
          <div className="space-y-1">
             <span className="text-[9px] text-gray-500 uppercase font-black">Financial Exposure</span>
             <p className="text-lg font-bold text-warning">${(summary.estimated_financial_exposure / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        {/* Right: Summary / Recommendation */}
        <div className="lg:w-1/3 bg-primary/5 p-4 rounded-xl border border-primary/20">
          <h3 className="text-[10px] font-black uppercase text-primary mb-2 flex justify-between">
             Strategy Engine
             <span className="text-gray-500">Vertex AI / Gemini</span>
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed italic mb-3">
             "{summary.gemini_operations_summary}"
          </p>
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-bold text-gray-500 uppercase">Recommendation:</span>
             <span className="text-[9px] font-black text-gray-100 uppercase tracking-tighter bg-primary/20 px-2 py-0.5 rounded">
                {summary.recommended_next_mission}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}