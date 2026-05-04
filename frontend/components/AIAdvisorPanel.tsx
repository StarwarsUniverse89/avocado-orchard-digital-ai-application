"use client";

import { useState } from "react";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  impact: string;
  confidence: number;
}

export default function AIAdvisorPanel() {
  const [recommendations] = useState<Recommendation[]>([
    {
      id: "1",
      title: "Increase Irrigation in Zone B",
      description:
        "Soil moisture levels have dropped to 40% in Orchard B. Recommend increasing irrigation by 15% to prevent stress during fruit development phase.",
      priority: "high",
      impact: "+12% yield protection",
      confidence: 94,
    },
    {
      id: "2",
      title: "Pest Monitoring Alert",
      description:
        "Persea mite activity detected at 15% leaf damage threshold. Consider preventive treatment to avoid reaching economic injury level (17% PLAD).",
      priority: "medium",
      impact: "Prevent 5-15% yield loss",
      confidence: 87,
    },
    {
      id: "3",
      title: "Optimal Harvest Window",
      description:
        "Based on current fruit size and market prices, optimal harvest window is 14-21 days. Delaying harvest could increase fruit weight by 8%.",
      priority: "low",
      impact: "+$2,400 revenue potential",
      confidence: 91,
    },
  ]);

  const priorityColors = {
    high: "border-error/50 bg-error/10",
    medium: "border-warning/50 bg-warning/10",
    low: "border-info/50 bg-info/10",
  };

  const priorityLabels = {
    high: "High Priority",
    medium: "Medium Priority",
    low: "Low Priority",
  };

  return (
    <div className="glass-elevated rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse-glow">
            <svg
              className="w-6 h-6 text-gray-950"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-50">AI Advisor</h2>
            <p className="text-sm text-gray-400">
              Knowledge-grounded recommendations
            </p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors">
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`border rounded-lg p-4 ${priorityColors[rec.priority]} transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {priorityLabels[rec.priority]}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-400">
                    {rec.confidence}% confidence
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-50 mb-2">
                  {rec.title}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary">
                  Impact: {rec.impact}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors">
                  Details
                </button>
                <button className="px-3 py-1.5 rounded-md bg-primary hover:bg-primary-dark text-gray-950 text-xs font-semibold transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Powered by AMD MI300X GPU • Qwen/Llama Models
          </span>
          <button className="text-primary hover:text-primary-dark font-medium transition-colors">
            View All Recommendations →
          </button>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
