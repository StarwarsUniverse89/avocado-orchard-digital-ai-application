"use client";

import { useState, useEffect } from "react";
import { SelectionContext, getContextDisplayName } from "@/lib/selectionContext";

interface FinancialMetrics {
  estimated_yield: number;
  revenue: number;
  profit: number;
  roi: number;
}

interface FinancialPrediction {
  orchard_id: string;
  baseline: FinancialMetrics;
  scenario: FinancialMetrics;
  prediction: {
    projected_gain_or_loss: number;
    yield_change_percent: number;
    roi: number;
    risk_level: string;
    message: string;
  };
}

interface FinancialPredictionPanelProps {
  selectionContext: SelectionContext;
  selectedOrchardCandidate?: any;
  selectedMunicipality?: any;
  detectedOrchards?: any[];
  archivedOrchards?: any[];
  visible?: boolean;
  onClose?: () => void;
}

export default function FinancialPredictionPanel({
  selectionContext,
  selectedOrchardCandidate,
  selectedMunicipality,
  detectedOrchards = [],
  archivedOrchards = [],
  visible = true,
  onClose,
}: FinancialPredictionPanelProps) {
  const [prediction, setPrediction] = useState<FinancialPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate financial impact based on selection context
  useEffect(() => {
    calculateFinancialImpact();
  }, [selectionContext, selectedOrchardCandidate, selectedMunicipality]);

  const calculateFinancialImpact = () => {
    setLoading(true);
    
    try {
      // Priority 1: Selected orchard candidate (detected parcel)
      if (selectionContext.context_type === 'orchard_candidate' && selectedOrchardCandidate) {
        const candidate = selectedOrchardCandidate;
        const estimatedYield = (candidate.estimated_tree_count || 0) * 65; // kg per tree average
        const revenue = estimatedYield * 2.8; // $2.80 per kg
        const profit = revenue * 0.55; // 55% profit margin
        const profitAtRisk = candidate.stress_level === 'high' ? profit * 0.25 :
                            candidate.stress_level === 'medium' ? profit * 0.12 :
                            profit * 0.05;
        
        setPrediction({
          orchard_id: candidate.orchard_id || candidate.id,
          baseline: {
            estimated_yield: estimatedYield,
            revenue: Math.round(revenue),
            profit: Math.round(profit),
            roi: 8.5,
          },
          scenario: {
            estimated_yield: Math.round(estimatedYield * 0.92),
            revenue: Math.round(revenue * 0.92),
            profit: Math.round(profit * 0.92),
            roi: 7.8,
          },
          prediction: {
            projected_gain_or_loss: -Math.round(profitAtRisk),
            yield_change_percent: -8.0,
            roi: 7.8,
            risk_level: candidate.stress_level || 'medium',
            message: `${candidate.stress_level === 'high' ? 'High' : candidate.stress_level === 'medium' ? 'Medium' : 'Low'} stress detected. Estimated profit at risk: $${Math.round(profitAtRisk).toLocaleString()}.`,
          },
        });
      }
      // Priority 2: Selected municipality
      else if (selectionContext.context_type === 'municipality' && selectedMunicipality) {
        const muni = selectedMunicipality;
        const estimatedYield = (muni.estimated_hectares || 0) * 12000; // kg per hectare
        const revenue = estimatedYield * 2.8;
        const profit = revenue * 0.55;
        const profitAtRisk = muni.projected_profit_usd ? muni.projected_profit_usd * 0.15 : profit * 0.15;
        
        setPrediction({
          orchard_id: muni.id,
          baseline: {
            estimated_yield: estimatedYield,
            revenue: Math.round(revenue),
            profit: Math.round(profit),
            roi: 9.2,
          },
          scenario: {
            estimated_yield: Math.round(estimatedYield * 0.95),
            revenue: Math.round(revenue * 0.95),
            profit: Math.round(profit * 0.95),
            roi: 8.7,
          },
          prediction: {
            projected_gain_or_loss: -Math.round(profitAtRisk),
            yield_change_percent: -5.0,
            roi: 8.7,
            risk_level: muni.stress_level || 'medium',
            message: `Municipality-level estimate for ${muni.name}. Scan for orchards to get parcel-level accuracy.`,
          },
        });
      }
      // Priority 3: Mexico network fallback
      else {
        const totalHectares = selectionContext.estimated_hectares || 114500;
        const estimatedYield = totalHectares * 12000;
        const revenue = estimatedYield * 2.8;
        const profit = revenue * 0.55;
        const profitAtRisk = selectionContext.projected_profit_at_risk_usd || profit * 0.18;
        
        setPrediction({
          orchard_id: 'michoacan_network',
          baseline: {
            estimated_yield: estimatedYield,
            revenue: Math.round(revenue),
            profit: Math.round(profit),
            roi: 8.8,
          },
          scenario: {
            estimated_yield: Math.round(estimatedYield * 0.93),
            revenue: Math.round(revenue * 0.93),
            profit: Math.round(profit * 0.93),
            roi: 8.2,
          },
          prediction: {
            projected_gain_or_loss: -Math.round(profitAtRisk),
            yield_change_percent: -7.0,
            roi: 8.2,
            risk_level: 'medium',
            message: `Network-wide estimate for Michoacán avocado belt. Select a municipality and scan for orchards to get detailed analysis.`,
          },
        });
      }
    } catch (error) {
      console.error("Failed to calculate financial impact:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-error";
      case "medium":
        return "text-warning";
      case "low":
        return "text-success";
      case "opportunity":
        return "text-primary";
      default:
        return "text-gray-400";
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-error/10 border-error/30";
      case "medium":
        return "bg-warning/10 border-warning/30";
      case "low":
        return "bg-success/10 border-success/30";
      case "opportunity":
        return "bg-primary/10 border-primary/30";
      default:
        return "bg-gray-800 border-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="glass-elevated rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="glass-elevated rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">
          Financial Prediction
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Run a simulation to see financial impact
        </p>
      </div>
    );
  }

  const profitChange = prediction.prediction.projected_gain_or_loss;
  const isProfitable = profitChange >= 0;

  return (
    <div className="glass-elevated rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-1">
            Financial Impact Analysis
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getContextDisplayName(selectionContext)}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getRiskBgColor(
            prediction.prediction.risk_level
          )} ${getRiskColor(prediction.prediction.risk_level)}`}
        >
          {prediction.prediction.risk_level} Risk
        </div>
      </div>

      {/* Key Metrics Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Baseline */}
        <div className="border border-gray-700 rounded-lg p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Baseline
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Revenue</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-50">
                ${prediction.baseline.revenue.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Profit</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-50">
                ${prediction.baseline.profit.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">ROI</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {prediction.baseline.roi.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Scenario */}
        <div className="border border-gray-700 rounded-lg p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Scenario
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Revenue</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-50">
                ${prediction.scenario.revenue.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Profit</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-50">
                ${prediction.scenario.profit.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">ROI</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {prediction.scenario.roi.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div
        className={`border rounded-lg p-4 mb-4 ${getRiskBgColor(
          prediction.prediction.risk_level
        )}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Projected Impact
          </div>
          <div
            className={`text-2xl font-bold ${
              isProfitable ? "text-success" : "text-error"
            }`}
          >
            {isProfitable ? "+" : ""}${profitChange.toLocaleString()}
          </div>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          {prediction.prediction.message}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Yield Change: </span>
            <span
              className={`font-semibold ${
                prediction.prediction.yield_change_percent >= 0
                  ? "text-success"
                  : "text-error"
              }`}
            >
              {prediction.prediction.yield_change_percent >= 0 ? "+" : ""}
              {prediction.prediction.yield_change_percent.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">ROI: </span>
            <span className="font-semibold text-gray-900 dark:text-gray-50">
              {prediction.prediction.roi.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Yield Details */}
      <div className="border-t border-gray-700 pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Baseline Yield
            </div>
            <div className="font-semibold text-gray-900 dark:text-gray-50">
              {prediction.baseline.estimated_yield.toLocaleString()} kg
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Scenario Yield
            </div>
            <div className="font-semibold text-gray-900 dark:text-gray-50">
              {prediction.scenario.estimated_yield.toLocaleString()} kg
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <button
          onClick={calculateFinancialImpact}
          className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-gray-950 font-semibold transition-colors"
        >
          Recalculate Impact
        </button>
      </div>
    </div>
  );
}

// Made with Bob