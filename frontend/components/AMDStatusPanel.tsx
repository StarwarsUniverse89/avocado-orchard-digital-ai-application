"use client";

import { useState, useEffect } from "react";

export default function AMDStatusPanel() {
  const [inferenceLatency, setInferenceLatency] = useState(45);

  // Simulate latency updates
  useEffect(() => {
    const interval = setInterval(() => {
      setInferenceLatency(40 + Math.random() * 15);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-elevated rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-error to-warning flex items-center justify-center">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
            AMD GPU Compute
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            MI300X Infrastructure
          </p>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-gray-800/30 dark:bg-gray-800/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              AMD Cloud
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Connected
          </div>
        </div>

        <div className="p-3 rounded-lg bg-gray-800/30 dark:bg-gray-800/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              ROCm
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            v5.7 Active
          </div>
        </div>

        <div className="p-3 rounded-lg bg-gray-800/30 dark:bg-gray-800/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              AI Models
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Qwen/Llama
          </div>
        </div>

        <div className="p-3 rounded-lg bg-gray-800/30 dark:bg-gray-800/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Inference
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            {inferenceLatency.toFixed(0)}ms
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/30">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              GPU-Accelerated Simulation
            </span>
          </div>
          <span className="text-xs text-success font-semibold">READY</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/30">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              3D Rendering Pipeline
            </span>
          </div>
          <span className="text-xs text-success font-semibold">ACTIVE</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Real-time AI Inference
            </span>
          </div>
          <span className="text-xs text-primary font-semibold">ONLINE</span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-6 pt-6 border-t border-gray-700 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>GPU Utilization</span>
          <span className="font-mono text-gray-900 dark:text-gray-50">78%</span>
        </div>
        <div className="mt-2 h-2 bg-gray-700 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: "78%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
