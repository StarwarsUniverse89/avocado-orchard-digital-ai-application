# Frontend Integration Guide - Orchard Detection

## Status: Backend Complete, Frontend Integration Required

### ✅ Already Completed

1. **Backend Detection Pipeline** - Fully functional
2. **API Endpoints** - All detection/archive endpoints working
3. **API Client Functions** - `frontend/lib/api.ts` updated with all functions
4. **OrchardCandidatePanel Component** - Ready to use
5. **Mexico Data Integration** - GlobeCommandView uses Mexico network

### ⏳ Required Frontend Changes

## 1. GlobeCommandView.tsx - Add Scan Functionality

**File:** `frontend/components/GlobeCommandView.tsx`

### Add State Variables (after line 69)
```typescript
// Detection state
const [detectedParcels, setDetectedParcels] = useState<any[]>([]);
const [selectedParcel, setSelectedParcel] = useState<any | null>(null);
const [scanning, setScanning] = useState(false);
const [scanError, setScanError] = useState<string | null>(null);
```

### Add Import
```typescript
import { scanMunicipalityForOrchards } from '@/lib/api';
import OrchardCandidatePanel from './OrchardCandidatePanel';
```

### Add Scan Handler (after line 232)
```typescript
const handleScanMunicipality = async (municipalityId: string) => {
  setScanning(true);
  setScanError(null);
  
  try {
    const result = await scanMunicipalityForOrchards(municipalityId, false);
    
    if (result.success && result.data?.parcels) {
      setDetectedParcels(result.data.parcels);
      console.log(`Detected ${result.data.parcels.length} orchard parcels`);
    } else {
      setScanError(result.error || 'Scan failed');
    }
  } catch (error) {
    setScanError(String(error));
  } finally {
    setScanning(false);
  }
};

const handleParcelClick = (parcel: any) => {
  setSelectedParcel(parcel);
};

const handleClearParcels = () => {
  setDetectedParcels([]);
  setSelectedParcel(null);
};
```

### Add Scan Button (in Controls section, after line 332)
```typescript
{selectedMunicipalityId && (
  <div className="pt-2 border-t border-gray-600">
    <button
      onClick={() => handleScanMunicipality(selectedMunicipalityId)}
      disabled={scanning}
      className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm font-semibold transition-colors"
    >
      {scanning ? 'Scanning...' : 'Scan Area for Orchards'}
    </button>
    {detectedParcels.length > 0 && (
      <div className="mt-2 text-xs">
        <div>Detected: {detectedParcels.length} parcels</div>
        <button
          onClick={handleClearParcels}
          className="mt-1 text-red-400 hover:text-red-300"
        >
          Clear Parcels
        </button>
      </div>
    )}
    {scanError && (
      <div className="mt-2 text-xs text-red-400">{scanError}</div>
    )}
  </div>
)}
```

### Render Detected Parcel Polygons (after municipality rendering, around line 468)
```typescript
{/* Render detected orchard parcels */}
{detectedParcels.map((parcel) => {
  const isSelected = selectedParcel?.archive_id === parcel.archive_id;
  const stressColor = parcel.stress_level === 'high' ? Color.RED :
                     parcel.stress_level === 'medium' ? Color.YELLOW :
                     Color.GREEN;
  
  return (
    <Entity
      key={parcel.archive_id}
      name={parcel.orchard_id}
      description={`
        <div style="font-family: sans-serif;">
          <h3>${parcel.orchard_id}</h3>
          <p><strong>GPS Center:</strong> ${parcel.center_lat.toFixed(6)}, ${parcel.center_lng.toFixed(6)}</p>
          <p><strong>Area:</strong> ${parcel.estimated_hectares} ha (${parcel.estimated_acres} acres)</p>
          <p><strong>Trees:</strong> ${parcel.estimated_tree_count.toLocaleString()}</p>
          <p><strong>NDVI:</strong> ${parcel.ndvi_average.toFixed(2)}</p>
          <p><strong>Stress:</strong> ${parcel.stress_level}</p>
          <p><strong>Confidence:</strong> ${(parcel.confidence * 100).toFixed(0)}%</p>
          <p><strong>Detection:</strong> ${parcel.detection_method}</p>
          <p><strong>Imagery:</strong> ${parcel.imagery_source}</p>
        </div>
      `}
      onClick={() => handleParcelClick(parcel)}
    >
      <PolygonGraphics
        hierarchy={Cartesian3.fromDegreesArray(
          parcel.boundary_coordinates.flatMap(([lat, lng]: number[]) => [lng, lat])
        )}
        material={
          isSelected
            ? Color.CYAN.withAlpha(0.4)
            : stressColor.withAlpha(0.3)
        }
        outline={true}
        outlineColor={isSelected ? Color.CYAN : Color.WHITE}
        outlineWidth={isSelected ? 3 : 2}
        heightReference={HeightReference.CLAMP_TO_GROUND}
      />
      <PointGraphics
        pixelSize={8}
        color={isSelected ? Color.CYAN : stressColor}
        outlineColor={Color.WHITE}
        outlineWidth={1}
        heightReference={HeightReference.CLAMP_TO_GROUND}
      />
    </Entity>
  );
})}
```

### Render OrchardCandidatePanel (at end of component, before closing div)
```typescript
{/* Orchard Candidate Panel */}
{selectedParcel && (
  <OrchardCandidatePanel
    candidate={selectedParcel}
    onClose={() => setSelectedParcel(null)}
    onSaveSuccess={(archiveId) => {
      console.log('Saved to archive:', archiveId);
    }}
    onAnalysisComplete={(analysisData) => {
      console.log('Analysis complete:', analysisData);
    }}
    onGenerate3DTwin={(candidate, analysisData) => {
      // Switch to 3D twin view
      onEnter3DTwin?.(candidate.orchard_id);
      setSelectedParcel(null);
    }}
  />
)}
```

## 2. AI Command Parser - Add Detection Commands

**File:** `frontend/lib/aiCommandParser.ts`

### Add Detection Command Patterns
```typescript
// Detection commands
if (command.includes('scan') && command.includes('for orchards')) {
  const municipality = extractMunicipalityName(command);
  return {
    type: 'scan_municipality',
    args: { municipality_id: municipality },
  };
}

if (command.includes('detect orchard parcels')) {
  const municipality = extractMunicipalityName(command);
  return {
    type: 'scan_municipality',
    args: { municipality_id: municipality },
  };
}

if (command.includes('select largest') && command.includes('orchard')) {
  return { type: 'select_largest_parcel' };
}

if (command.includes('select highest stress') && command.includes('parcel')) {
  return { type: 'select_highest_stress_parcel' };
}

if (command.includes('save') && command.includes('archive')) {
  return { type: 'save_to_archive' };
}

if (command.includes('run vision pipeline') || command.includes('run vision')) {
  return { type: 'run_vision_analysis' };
}

if (command.includes('generate 3d twin') || command.includes('generate twin')) {
  return { type: 'generate_3d_twin' };
}

if (command.includes('show gps boundary')) {
  return { type: 'show_gps_boundary' };
}

if (command.includes('show orchard archive') || command.includes('show archive')) {
  return { type: 'show_archive' };
}
```

## 3. Command Center Page - Wire 3D Twin Generation

**File:** `frontend/app/command-center/page.tsx`

### Add State for Selected Orchard
```typescript
const [selectedOrchardForTwin, setSelectedOrchardForTwin] = useState<any | null>(null);
const [visionAnalysisData, setVisionAnalysisData] = useState<any | null>(null);
```

### Pass to GlobeCommandView
```typescript
<GlobeCommandView
  onEnter3DTwin={(orchardId, sectionId) => {
    setView('3d-twin');
    setSelectedOrchardForTwin({ orchardId, sectionId });
  }}
  // ... other props
/>
```

### Show Badge in 3D Twin View
```typescript
{view === '3d-twin' && selectedOrchardForTwin && (
  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-purple-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
    3D Twin generated from selected orchard parcel
  </div>
)}
```

## 4. Fix Component URLs to Port 8001

### AMDStatusPanel.tsx
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
```

### AnalyticsSummaryPanel.tsx
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
```

### FinancialPredictionPanel.tsx
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
```

### AIAdvisorPanel.tsx
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
```

## 5. README.md Update

**File:** `README.md`

```markdown
# Avocado Orchard Digital AI Application

## Overview

AI-powered avocado orchard management platform with real-time detection, 3D digital twins, and AMD MI300X GPU inference.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Port 3000)                     │
│  Next.js + Cesium Globe + React Three Fiber               │
│  - Municipality selection                                   │
│  - Orchard parcel detection                                │
│  - 3D digital twin visualization                           │
│  - AI advisor with AMD MI300X                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Port 8001)                    │
│  - Orchard detection service                               │
│  - Satellite imagery service                               │
│  - Orchard archive service                                 │
│  - Vision/3D analysis service                              │
│  - Mexico avocado network                                  │
│  - AMD agent integration                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Orchard Detection Pipeline                        │
│  1. Satellite Imagery Ingestion                            │
│  2. ML/CV Detection (Model/SAMGeo/OpenCV/Fallback)        │
│  3. Parcel Polygon Extraction                              │
│  4. Tree Count Estimation                                  │
│  5. NDVI & Stress Analysis                                 │
│  6. Archive Storage                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              AMD MI300X vLLM (Port 8000)                    │
│  Model: Qwen/Qwen2.5-7B-Instruct                          │
│  - Live inference for AI recommendations                   │
│  - OpenAI-compatible API                                   │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Orchard Detection
- Scan municipalities for orchard parcels
- Vision-model-ready detection pipeline
- GPS boundary extraction
- Hectare/acre estimation
- Tree count estimation
- NDVI and stress analysis
- Archive system for persistence

### 3D Digital Twin
- Generate 3D twins from detected parcels
- Vision/3D analysis integration
- Canopy volume estimation
- Fruit count estimation
- Tree health visualization
- Interactive 3D scene

### AI Advisor
- AMD MI300X GPU-powered recommendations
- Natural language commands
- Mexico avocado network integration
- Real-time orchard analysis

## Environment Variables

### Backend (.env)
```bash
AMD_API_KEY=your_key_here
AMD_MODEL_ENDPOINT=http://localhost:8000/v1/chat/completions
AMD_MODEL_NAME=Qwen/Qwen2.5-7B-Instruct
MODEL_NAME=Qwen/Qwen2.5-7B-Instruct
AMD_GPU_TARGET=AMD MI300X
AMD_GPU_ENABLED=true

# Optional
ORCHARD_DETECTION_MODEL_PATH=/path/to/custom/model.pth
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_CESIUM_ION_TOKEN=your_cesium_token
```

## Installation & Running

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### vLLM (AMD MI300X)
```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-7B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --tensor-parallel-size 1
```

## Testing

### Backend Detection
```bash
curl -X POST http://localhost:8001/api/v1/orchard-detection/scan-municipality \
  -H "Content-Type: application/json" \
  -d '{"municipality_id": "tancitaro", "save_to_archive": false}'
```

### AMD Live Inference
```bash
API_BASE_URL=http://localhost:8001 bash TEST_LIVE_AMD_INFERENCE.sh
```

## Ports

- **3000:** Next.js Frontend
- **8000:** vLLM Server (AMD MI300X)
- **8001:** FastAPI Backend

## Documentation

- `ORCHARD_DETECTION_PIPELINE.md` - Complete detection architecture
- `FRONTEND_INTEGRATION_GUIDE.md` - Frontend integration guide
- `IMPLEMENTATION_STATUS.md` - Current implementation status
- `AMD_LIVE_MODE_FINAL_FIXES.md` - AMD integration details

## License

MIT
```

## Summary

**Backend:** ✅ 100% Complete
**Frontend:** ⏳ Requires integration of above code changes
**Estimated Time:** 4-6 hours for complete integration

All code snippets above are ready to copy-paste into the respective files. The backend is fully functional and tested.

# Made with Bob