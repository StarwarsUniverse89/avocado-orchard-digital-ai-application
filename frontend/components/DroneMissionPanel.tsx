"use client";

import { useState, useEffect } from "react";
import { planDroneMission, analyzeDroneInspection, getDroneHistory } from "@/lib/api";

interface DroneMissionPanelProps {
  orchardId: string;
  targetType?: string;
  onMissionPlanned?: (missionData: any) => void;
}

export default function DroneMissionPanel({ orchardId, targetType = "demo", onMissionPlanned }: DroneMissionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [missionData, setMissionData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!orchardId) return;
      const res = await getDroneHistory(orchardId);
      if (res.success && res.data) {
        setHistory(res.data);
      }
    };
    fetchHistory();
  }, [orchardId, missionData, analysisData]);

  const handlePlanMission = async () => {
    setLoading(true);
    setError(null);
    setAnalysisData(null);
    try {
      const response = await planDroneMission(orchardId);
      console.log("🛸 DroneMissionPanel raw response:", response);

      const mission = response?.data ?? response;

      if (mission?.mission_id) {
        setMissionData(mission);

        if (onMissionPlanned) {
          console.log("🛸 Sending mission to parent:", mission);
          onMissionPlanned(mission);
        }
      } else {
        setError(response?.error || "Failed to generate flight plan.");
      }
    } catch (err) {
      console.error("Drone Mission Panel Execution Error:", err);
      setError("System connection error. Verify backend status.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeInspection = async () => {
    if (!missionData) return;
    
    setAnalysisLoading(true);
    setError(null);
    
    console.log("🧪 Initiating Drone Inspection Analysis...");
    console.log("🧪 Source Mission Data:", missionData);
    try {
      const payload = {
        mission_id: missionData.mission_id,
        orchard_id: missionData.orchard_id || orchardId,
        mock_image_targets: missionData.mock_image_targets || []
      };
      
      console.log("🧪 Sending Analysis Payload:", payload);
      const response = await analyzeDroneInspection(payload);
      if (response.success) {
        setAnalysisData(response.data);
      } else {
        setError(response.error || "Failed to analyze inspection data.");
      }
    } catch (err) {
      setError("Analysis system offline. Check backend logs.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="glass-elevated rounded-xl p-4 animate-fade-in border-l-2 border-l-primary/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛸</span>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-50 uppercase tracking-tighter">
            Mission Target: <span className="text-primary">{targetType} / {orchardId}</span>
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

          {/* Analysis Trigger Button */}
          {!analysisData && (
            <button
              onClick={handleAnalyzeInspection}
              disabled={analysisLoading || !missionData?.mission_id}
              className={`w-full py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-success/30 transition-all ${
                analysisLoading 
                  ? "bg-success/10 text-success/50 cursor-not-allowed" 
                  : "bg-success/10 text-success hover:bg-success/20 shadow-sm"
              }`}
            >
              {analysisLoading ? "Processing Imagery..." : "Analyze Inspection Results"}
            </button>
          )}

          {/* Analysis Results Display */}
          {analysisData && (
            <div className="space-y-4 pt-4 border-t border-gray-800 animate-slide-in">
               <div className="flex items-center gap-2 mb-2">
                 <span className="text-xs">🧠</span>
                 <h4 className="text-[10px] font-bold text-success uppercase">Inspection Findings</h4>
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-mono">
                   <span className="text-gray-500">SEVERITY</span>
                   <span className="text-warning font-bold uppercase">{analysisData.severity}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-mono">
                   <span className="text-gray-500">CONFIDENCE</span>
                   <span className="text-gray-100">{(analysisData.confidence * 100).toFixed(0)}%</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-mono">
                   <span className="text-gray-500">YIELD_RISK</span>
                   <span className="text-error">{analysisData.estimated_yield_risk}</span>
                 </div>
               </div>

               <div className="space-y-1">
                 <h5 className="text-[9px] font-bold text-gray-500 uppercase">Detected Anomalies</h5>
                 <ul className="text-[10px] space-y-1">
                   {analysisData.detected_issues.map((item: any, i: number) => {
                     const issueText = typeof item === 'string' ? item : (item.issue || item.description || "Anomaly detected");
                     return (
                       <li key={i} className="flex gap-2 text-gray-300">
                         <span className="text-success">•</span> {issueText}
                       </li>
                     );
                   })}
                 </ul>
               </div>

               <div className="space-y-1">
                 <h5 className="text-[9px] font-bold text-gray-500 uppercase">Recommended Interventions</h5>
                 <ul className="text-[10px] space-y-1">
                   {analysisData.recommended_actions.map((action: string, i: number) => (
                     <li key={i} className="flex gap-2 text-gray-300">
                       <span className="text-primary">→</span> {action}
                     </li>
                   ))}
                 </ul>
               </div>

               <div className="bg-success/5 border border-success/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-success uppercase">Gemini Vision Report</span>
                    <div className="flex-1 h-[1px] bg-success/20"></div>
                  </div>
                  <p className="text-[11px] text-gray-400 italic leading-relaxed font-serif">
                    "{analysisData.gemini_analysis_summary}"
                  </p>
               </div>

               <div className="bg-black/40 p-2 rounded border border-gray-800 text-[9px] font-mono">
                  <span className="text-gray-500 block uppercase">Follow-up Protocol</span>
                  <span className="text-primary">{analysisData.follow_up_recommendation}</span>
               </div>
            </div>
          )}

          {/* Operational History Section */}
          {history.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-gray-800">
              <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Recent Ops History</h4>
              <div className="space-y-2">
                {history.map((entry, i) => (
                  <div key={i} className="bg-black/20 p-2 rounded border border-gray-800/50 flex justify-between items-center text-[10px]">
                    <div className="flex flex-col">
                      <span className="text-gray-400 font-mono">
                        {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'Previous Scan'}
                      </span>
                      <span className="text-gray-500 italic truncate max-w-[120px]">
                        {entry.severity} severity detected
                      </span>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      entry.severity === 'high' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                    }`}>
                      {entry.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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