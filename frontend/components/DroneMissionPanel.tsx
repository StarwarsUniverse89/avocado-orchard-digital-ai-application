"use client";

import { useState } from "react";
import { planDroneMission } from "@/lib/api";

interface DroneMissionPanelProps {
  orchardId: string;
  onMissionPlanned?: (missionData: any) => void;
}

export default function DroneMissionPanel({ orchardId, onMissionPlanned }: DroneMissionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [missionData, setMissionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePlanMission = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await planDroneMission(orchardId);
      if (response.success && response.data) {
        setMissionData(response.data);
        if (onMissionPlanned) {
          onMissionPlanned(response.data);
        }
      } else {
        setError(response.error || "Failed to generate flight plan.");
      }
    } catch (err) {
      console.error("Drone Mission Panel Execution Error:", err);
      setError("System connection error. Verify backend status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-elevated rounded-xl p-4 animate-fade-in border-l-2 border-l-primary/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛸</span>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-50 uppercase tracking-tighter">
            Drone Mission Ops
          </h3>
        </div>
        <button
          onClick={handlePlanMission}
          disabled={loading || !orchardId}
          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            loading || !orchardId
              ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
              : "bg-primary text-gray-950 hover:bg-primary/90 shadow-[0_0_15px_rgba(0,212,255,0.3)]"
          }`}
        >
          {loading ? "Calculating Path..." : "Plan Drone Mission"}
        </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-3 text-[10px] text-error mb-4 font-mono">
          ERROR_LOG: {error}
        </div>
      )}

      {missionData ? (
        <div className="space-y-4 animate-slide-in">
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-500 block">MISSION_ID</span>
              <span className="text-gray-100">{missionData.mission_id}</span>
            </div>
            <div className="bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-500 block">OPERATIONAL_STATUS</span>
              <span className="text-success font-bold uppercase">{missionData.status}</span>
            </div>
            <div className="bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-500 block">EST_FLIGHT_TIME</span>
              <span className="text-gray-100">{missionData.estimated_duration_minutes} MIN</span>
            </div>
            <div className="bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-500 block">BATTERY_RESERVE</span>
              <span className="text-primary font-bold">{missionData.battery_estimate_percent}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase">Target Priorities</h4>
              <span className="text-[10px] text-primary">{missionData.priority_zones?.length || 0} SECTORS</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {missionData.priority_zones?.map((zone: any, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded bg-warning/10 text-warning text-[9px] border border-warning/20 font-bold uppercase">
                   {zone.severity} Stress Detected
                </span>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <h4 className="text-[10px] font-bold text-primary uppercase mb-1">Strategic Logic (Vertex AI)</h4>
            <p className="text-[11px] text-gray-400 italic leading-relaxed font-serif">
              "{missionData.agent_reasoning_summary}"
            </p>
          </div>
        </div>
      ) : !loading && (
        <div className="border border-dashed border-gray-800 rounded-lg py-10 flex flex-col items-center justify-center text-center opacity-60">
          <span className="text-2xl mb-2">📡</span>
          <p className="text-[10px] text-gray-500 max-w-[220px] uppercase font-bold tracking-tighter">
            Waiting for mission target acquisition. Select an orchard to initialize drone deploy sequence.
          </p>
        </div>
      )}
    </div>
  );
}