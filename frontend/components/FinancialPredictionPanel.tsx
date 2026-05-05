"use client";

import { useState, useEffect } from "react";

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
  orchardId?: string;
  scenario?: {
    temperature?: number;
    soil_moisture?: number;
    pest_pressure?: number;
    ndvi?: number;
  };
}

export default function FinancialPredictionPanel({
  orchardId = "orchard_A",
  scenario,
}: FinancialPredictionPanelProps) {
  const [prediction, setPrediction] = useState<FinancialPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scenario) {
      fetchPrediction();
    }
  }, [orchardId, scenario]);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/financial/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orchard_id: orchardId,
          scenario: scenario || {},
        }),
      });
      const data = await response.json();
      if (data.success) {
        setPrediction(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch financial prediction:", error);
      // Use mock data for demo
      setPrediction({
        orchard_id: orchardId,
        baseline: {
          estimated_yield: 19500,
          revenue: 54600,
          profit: 32400,
          roi: 8.5,
        },
        scenario: {
          estimated_yield: 17800,
          revenue: 49840,
          profit: 29640,
          roi: 7.8,
        },
        prediction: {
          projected_gain_or_loss: -2760,
          yield_change_percent: -8.7,
          roi: 7.8,
          risk_level: "medium",
          message: "Suboptimal conditions may reduce profit by $2,760.",
        },
      });
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
            Scenario vs. Baseline Comparison
          </p>
        </div>
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
          onClick={fetchPrediction}
          className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-gray-950 font-semibold transition-colors"
        >
          Refresh Prediction
        </button>
      </div>
    </div>
  );
}

// Made with Bob