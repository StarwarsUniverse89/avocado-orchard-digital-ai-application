"use client";

import { useState, useEffect } from "react";
import { orchardNetwork } from "@/lib/orchardNetwork";
import { getMexicoAvocadoAnalytics } from "@/lib/mexicoAvocadoNetwork";

interface AnalyticsSummaryPanelProps {
  visible?: boolean;
  onClose?: () => void;
}

export default function AnalyticsSummaryPanel({
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
    
    // Get Mexico avocado analytics
    const mexicoAnalytics = getMexicoAvocadoAnalytics();
    
    // Calculate analytics from orchard network
    const totalOrchards = orchardNetwork.length + mexicoAnalytics.total_synthetic_orchards;
    const totalTrees = orchardNetwork.reduce((sum, o) => sum + o.treeCount, 0) +
                      mexicoAnalytics.total_estimated_trees;
    const avgHealthScore =
      orchardNetwork.reduce((sum, o) => sum + o.healthScore, 0) / orchardNetwork.length;

    // Find highest stress orchard (prioritize Mexico data)
    const highestStressOrchard = mexicoAnalytics.highest_risk_orchard;

    // Find lowest NDVI section across all orchards
    let lowestNDVISection = { name: "", ndvi: 1, orchardName: "" };
    orchardNetwork.forEach((orchard) => {
      orchard.sections.forEach((section) => {
        if (section.ndvi < lowestNDVISection.ndvi) {
          lowestNDVISection = {
            name: section.name,
            ndvi: section.ndvi,
            orchardName: orchard.name,
          };
        }
      });
    });
    
    // Check Mexico orchards for lower NDVI
    if (highestStressOrchard.ndvi_average < lowestNDVISection.ndvi) {
      lowestNDVISection = {
        name: highestStressOrchard.name,
        ndvi: highestStressOrchard.ndvi_average,
        orchardName: "Michoacán",
      };
    }

    // Count critical sections (high stress)
    const criticalSections = orchardNetwork.reduce((count, orchard) => {
      return (
        count + orchard.sections.filter((s) => s.stressLevel === "high").length
      );
    }, 0);

    // Calculate projected risk based on stress levels
    const stressMap = { low: 1, medium: 2, high: 3 };
    const highStressCount = orchardNetwork.filter(
      (o) => o.stressLevel === "high"
    ).length;
    const projectedYieldRisk = (highStressCount / orchardNetwork.length) * 100;

    // Use Mexico profit at risk data
    const projectedProfitImpact = mexicoAnalytics.projected_profit_at_risk_usd;

    // Determine recommended action
    let recommendedAction = "Continue monitoring";
    if (highestStressOrchard.stress_level === "high") {
      recommendedAction = `Priority: Address ${highestStressOrchard.name} in Michoacán (high stress, NDVI ${highestStressOrchard.ndvi_average})`;
    } else if (criticalSections > 0) {
      recommendedAction = `Immediate irrigation needed in ${criticalSections} section${criticalSections > 1 ? "s" : ""}`;
    } else if (highStressCount > 0) {
      recommendedAction = "Increase irrigation frequency";
    }

    setSummary({
      highestStressOrchard: highestStressOrchard.name,
      lowestNDVISection: `${lowestNDVISection.orchardName} - ${lowestNDVISection.name}`,
      projectedYieldRisk: Math.round(projectedYieldRisk),
      projectedProfitImpact,
      recommendedAction,
      totalOrchards,
      totalTrees,
      avgHealthScore: Math.round(avgHealthScore),
      criticalSections,
    });
  }, []);

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