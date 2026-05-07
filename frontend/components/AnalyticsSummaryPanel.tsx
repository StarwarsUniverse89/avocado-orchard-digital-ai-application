"use client";

import { useState, useEffect } from "react";
import { getMexicoAvocadoAnalytics, michoacanSyntheticOrchards } from "@/lib/mexicoAvocadoNetwork";
import { SelectionContext, getContextDisplayName } from "@/lib/selectionContext";

interface AnalyticsSummaryPanelProps {
  selectionContext: SelectionContext;
  selectedOrchardCandidate?: any;
  selectedMunicipality?: any;
  detectedOrchards?: any[];
  archivedOrchards?: any[];
  visionAnalysisResult?: any;
  visible?: boolean;
  onClose?: () => void;
}

export default function AnalyticsSummaryPanel({
  selectionContext,
  selectedOrchardCandidate,
  selectedMunicipality,
  detectedOrchards = [],
  archivedOrchards = [],
  visionAnalysisResult,
  visible = true,
  onClose,
}: AnalyticsSummaryPanelProps) {
  const [summary, setSummary] = useState({
    highestStressOrchard: "",
    lowestNDVISection: "",
    projectedYieldRisk: 0,
    projectedProfitImpact: 0,
    recommendedAction: "",
    totalOrchards: 0,
    totalTrees: 0,
    avgHealthScore: 0,
    criticalSections: 0,
  });
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
    
    // Priority 1: Selected orchard candidate (detected parcel)
    if (selectionContext.context_type === 'orchard_candidate' && selectedOrchardCandidate) {
      const candidate = selectedOrchardCandidate;
      const estimatedYield = (candidate.estimated_tree_count || 0) * 65;
      const profitAtRisk = candidate.stress_level === 'high' ? estimatedYield * 2.8 * 0.55 * 0.25 :
                          candidate.stress_level === 'medium' ? estimatedYield * 2.8 * 0.55 * 0.12 :
                          estimatedYield * 2.8 * 0.55 * 0.05;
      
      setSummary({
        highestStressOrchard: candidate.archive_id || candidate.orchard_id,
        lowestNDVISection: `NDVI: ${candidate.ndvi_average?.toFixed(2) || 'N/A'}`,
        projectedYieldRisk: candidate.stress_level === 'high' ? 25 : candidate.stress_level === 'medium' ? 12 : 5,
        projectedProfitImpact: Math.round(profitAtRisk),
        recommendedAction: candidate.stress_level === 'high'
          ? `High stress detected. Immediate irrigation and pest control recommended.`
          : candidate.stress_level === 'medium'
          ? `Medium stress. Monitor closely and increase irrigation frequency.`
          : `Low stress. Continue current management practices.`,
        totalOrchards: 1,
        totalTrees: candidate.estimated_tree_count || 0,
        avgHealthScore: candidate.stress_level === 'high' ? 60 : candidate.stress_level === 'medium' ? 75 : 85,
        criticalSections: candidate.stress_level === 'high' ? 1 : 0,
      });
    }
    // Priority 2: Selected municipality
    else if (selectionContext.context_type === 'municipality' && selectedMunicipality) {
      const muni = selectedMunicipality;
      const parcelsInMuni = detectedOrchards.filter(o => o.municipality_id === muni.id);
      const totalTrees = parcelsInMuni.reduce((sum, o) => sum + (o.estimated_tree_count || 0), 0);
      const highStressCount = parcelsInMuni.filter(o => o.stress_level === 'high').length;
      const profitAtRisk = muni.projected_profit_usd ? muni.projected_profit_usd * 0.15 : 0;
      
      setSummary({
        highestStressOrchard: muni.name,
        lowestNDVISection: `Avg NDVI: ${muni.ndvi_average?.toFixed(2) || 'N/A'}`,
        projectedYieldRisk: parcelsInMuni.length > 0 ? Math.round((highStressCount / parcelsInMuni.length) * 100) : 15,
        projectedProfitImpact: Math.round(profitAtRisk),
        recommendedAction: parcelsInMuni.length > 0
          ? `${parcelsInMuni.length} parcels detected. ${highStressCount} require immediate attention.`
          : `Scan ${muni.name} for orchards to get detailed parcel-level analytics.`,
        totalOrchards: parcelsInMuni.length,
        totalTrees: totalTrees,
        avgHealthScore: muni.stress_level === 'high' ? 65 : muni.stress_level === 'medium' ? 75 : 82,
        criticalSections: highStressCount,
      });
    }
    // Priority 3: Mexico network fallback
    else {
      const mexicoAnalytics = getMexicoAvocadoAnalytics();
      const highestStressOrchard = mexicoAnalytics.highest_risk_orchard;
      
      setSummary({
        highestStressOrchard: highestStressOrchard.name,
        lowestNDVISection: `Network Avg NDVI: ${mexicoAnalytics.average_ndvi.toFixed(2)}`,
        projectedYieldRisk: 18,
        projectedProfitImpact: mexicoAnalytics.projected_profit_at_risk_usd,
        recommendedAction: `Select a municipality and scan for orchards to get detailed analytics.`,
        totalOrchards: detectedOrchards.length + mexicoAnalytics.total_synthetic_orchards,
        totalTrees: mexicoAnalytics.total_estimated_trees,
        avgHealthScore: 78,
        criticalSections: Math.round(mexicoAnalytics.total_synthetic_orchards * 0.15),
      });
    }
  }, [selectionContext, selectedOrchardCandidate, selectedMunicipality, detectedOrchards]);

  if (!visible) return null;

  return (
    <div className="glass-elevated rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-50">
              Analytics Summary
            </h2>
            <p className="text-sm text-gray-400">
              Real-time network intelligence
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Network Overview</span>
            <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
              Live
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Total Orchards:</span>
              <span className="text-sm font-semibold text-gray-50">
                {summary.totalOrchards}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Total Trees:</span>
              <span className="text-sm font-semibold text-gray-50">
                {summary.totalTrees.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Avg Health Score:</span>
              <span className="text-sm font-semibold text-green-400">
                {summary.avgHealthScore}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Risk Assessment</span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                summary.criticalSections > 0
                  ? "bg-red-500/20 text-red-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {summary.criticalSections > 0 ? "Action Required" : "Stable"}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Yield Risk:</span>
              <span
                className={`text-sm font-semibold ${
                  summary.projectedYieldRisk > 20
                    ? "text-red-400"
                    : summary.projectedYieldRisk > 10
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {summary.projectedYieldRisk}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Critical Sections:</span>
              <span className="text-sm font-semibold text-red-400">
                {summary.criticalSections}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Profit at Risk:</span>
              <span className="text-sm font-semibold text-yellow-400">
                ${summary.projectedProfitImpact.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Insights */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Critical Insights
        </h3>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">⚠️</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-400 mb-1">
                Highest Stress Orchard
              </h4>
              <p className="text-sm text-gray-300">
                {summary.highestStressOrchard}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📊</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-400 mb-1">
                Lowest NDVI Section
              </h4>
              <p className="text-sm text-gray-300">
                {summary.lowestNDVISection}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">💡</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-400 mb-1">
                Recommended Next Action
              </h4>
              <p className="text-sm text-gray-300">
                {summary.recommendedAction}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-gray-400">AMD MI300X Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-gray-400">Synthetic Data Mode</span>
            </div>
          </div>
          <span className="text-gray-500 text-xs">
            Updated {lastUpdated}
          </span>
        </div>
      </div>
    </div>
  );
}

// Made with Bob