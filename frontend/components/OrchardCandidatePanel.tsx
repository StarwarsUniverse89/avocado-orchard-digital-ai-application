'use client';

import React, { useState } from 'react';
import { saveOrchardToArchive, runVision3DAnalysis } from '@/lib/api';

interface OrchardCandidate {
  archive_id: string;
  orchard_id: string;
  municipality_id: string;
  center_lat: number;
  center_lng: number;
  boundary_coordinates: number[][];
  estimated_hectares: number;
  estimated_acres: number;
  estimated_tree_count: number;
  ndvi_average: number;
  stress_level: string;
  confidence: number;
  detection_method: string;
  imagery_source: string;
  row_pattern_detected?: boolean;
  row_spacing_m?: number;
  crown_density?: number;
}

interface OrchardCandidatePanelProps {
  candidate: OrchardCandidate | null;
  onClose: () => void;
  onSaveSuccess?: (archiveId: string) => void;
  onAnalysisComplete?: (analysisData: any) => void;
  onGenerate3DTwin?: (candidate: OrchardCandidate, analysisData?: any) => void;
}

export default function OrchardCandidatePanel({
  candidate,
  onClose,
  onSaveSuccess,
  onAnalysisComplete,
  onGenerate3DTwin,
}: OrchardCandidatePanelProps) {
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!candidate) return null;

  const handleSaveToArchive = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const result = await saveOrchardToArchive(candidate);
      
      if (result.success) {
        setSaved(true);
        onSaveSuccess?.(candidate.archive_id);
      } else {
        setError(result.error || 'Failed to save to archive');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    
    try {
      const result = await runVision3DAnalysis({
        archive_id: candidate.archive_id,
        orchard_id: candidate.orchard_id,
        boundary_coordinates: candidate.boundary_coordinates,
        estimated_area_hectares: candidate.estimated_hectares,
        estimated_tree_count: candidate.estimated_tree_count,
        ndvi_average: candidate.ndvi_average,
        stress_level: candidate.stress_level,
        confidence: candidate.confidence,
        imagery_source: candidate.imagery_source,
      });
      
      if (result.success) {
        setAnalysisData(result.data);
        onAnalysisComplete?.(result.data);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate3DTwin = () => {
    onGenerate3DTwin?.(candidate, analysisData);
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-10 bg-black/90 text-white p-6 rounded-lg max-w-md border border-cyan-500/30 shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg text-cyan-400">Detected Orchard Parcel</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm">
        {/* Orchard ID */}
        <div>
          <span className="text-gray-400">Orchard ID:</span>
          <span className="ml-2 font-mono text-cyan-300">{candidate.orchard_id}</span>
        </div>

        {/* GPS Center */}
        <div>
          <span className="text-gray-400">GPS Center:</span>
          <span className="ml-2 font-mono">
            {candidate.center_lat.toFixed(6)}, {candidate.center_lng.toFixed(6)}
          </span>
        </div>

        {/* Area */}
        <div>
          <span className="text-gray-400">Area:</span>
          <span className="ml-2">
            {candidate.estimated_hectares} ha ({candidate.estimated_acres} acres)
          </span>
        </div>

        {/* Tree Count */}
        <div>
          <span className="text-gray-400">Estimated Trees:</span>
          <span className="ml-2 font-semibold">{candidate.estimated_tree_count.toLocaleString()}</span>
        </div>

        {/* NDVI */}
        <div>
          <span className="text-gray-400">NDVI:</span>
          <span className="ml-2">{candidate.ndvi_average.toFixed(2)}</span>
        </div>

        {/* Stress Level */}
        <div>
          <span className="text-gray-400">Stress Level:</span>
          <span className={`ml-2 font-semibold ${getStressColor(candidate.stress_level)}`}>
            {candidate.stress_level.toUpperCase()}
          </span>
        </div>

        {/* Confidence */}
        <div>
          <span className="text-gray-400">Confidence:</span>
          <span className="ml-2">{(candidate.confidence * 100).toFixed(0)}%</span>
        </div>

        {/* Detection Method */}
        <div>
          <span className="text-gray-400">Detection:</span>
          <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded">
            {candidate.detection_method}
          </span>
        </div>

        {/* Imagery Source */}
        <div>
          <span className="text-gray-400">Imagery:</span>
          <span className="ml-2 text-xs">{candidate.imagery_source}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {saved && (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-300 text-sm">
          ✓ Saved to Orchard Archive
        </div>
      )}

      {/* Analysis Results */}
      {analysisData && (
        <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded space-y-2">
          <div className="font-semibold text-blue-300">Vision/3D Analysis Complete</div>
          <div className="text-xs space-y-1">
            <div>Canopy Volume: {analysisData.canopy_volume_m3?.toFixed(1)} m³</div>
            <div>Est. Fruit Count: {analysisData.estimated_fruit_count?.toLocaleString()}</div>
            <div>Avg Fruit Size: {analysisData.average_fruit_size_cm?.toFixed(1)} cm</div>
            <div>Tree Height: {analysisData.tree_height_m?.toFixed(1)} m</div>
            <div>Health Status: {analysisData.health_status}</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 space-y-2">
        <button
          onClick={handleSaveToArchive}
          disabled={saving || saved}
          className={`w-full px-4 py-2 rounded font-semibold transition-colors ${
            saved
              ? 'bg-green-600 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-700'
          }`}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved to Archive' : 'Save to Archive'}
        </button>

        <button
          onClick={handleRunAnalysis}
          disabled={analyzing || !!analysisData}
          className={`w-full px-4 py-2 rounded font-semibold transition-colors ${
            analysisData
              ? 'bg-blue-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {analyzing ? 'Analyzing...' : analysisData ? '✓ Analysis Complete' : 'Run Vision/3D Analysis'}
        </button>

        <button
          onClick={handleGenerate3DTwin}
          disabled={!analysisData}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded font-semibold transition-colors"
        >
          Generate 3D Twin
        </button>
      </div>

      {/* Archive ID */}
      <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
        Archive ID: {candidate.archive_id}
      </div>
    </div>
  );
}

// Made with Bob