# AMD Agent Status and Mexico Avocado Network Integration

## Overview

This document provides a clear answer to the AMD Cloud GPU agent status and details the Mexico avocado network integration.

## AMD Cloud GPU Agent Status

### Current Status: **STUB MODE**

The backend AI agent is currently running in **safe stub mode** with deterministic logic. It is NOT using a live AMD Cloud GPU model endpoint.

### Configuration Details

#### Environment Variables

The following environment variables control the AMD agent behavior:

| Variable | Purpose | Current Status |
|----------|---------|----------------|
| `AMD_API_KEY` | AMD Cloud API authentication key | Can be configured in `backend/.env` |
| `AMD_API_URL` | AMD Cloud API base URL | Default: `https://api.amd.cloud/v1` |
| `AMD_MODEL_ENDPOINT` | Specific model endpoint URL | **NOT SET** (causes stub mode) |
| `MODEL_NAME` | Model identifier | Default: `Qwen/Qwen2.5-7B-Instruct` |
| `AMD_GPU_ENABLED` | Enable AMD GPU features | Default: `false` |

#### Agent Modes

The agent operates in three modes:

1. **stub** - No AMD configuration, uses deterministic logic
2. **configured_stub** - AMD API key set but no endpoint (current mode)
3. **live** - Full AMD Cloud endpoint configured and active

### What Happens When AMD_MODEL_ENDPOINT is Missing?

When `AMD_MODEL_ENDPOINT` is not set:

1. The agent falls back to **deterministic logic** in `ml/inference/amd_model_client.py`
2. Recommendations are generated based on rule-based analysis of:
   - Temperature thresholds
   - Soil moisture levels
   - NDVI values
   - Health status indicators
3. No actual LLM inference occurs
4. Responses are fast and predictable

### Fallback Behavior

The agent has **fallback enabled** by default:

- If AMD Cloud API call fails → falls back to deterministic logic
- If network error occurs → falls back to deterministic logic
- If model endpoint is unreachable → falls back to deterministic logic

This ensures the application always provides recommendations, even without live AMD inference.

### Key Files

| File | Purpose |
|------|---------|
| `backend/core/config.py` | Configuration management, loads environment variables |
| `ml/inference/amd_model_client.py` | AMD Cloud client with stub fallback logic |
| `backend/agents/knowledge_agent.py` | Main agent that uses AMD client |
| `backend/api/routes.py` | API endpoints including `/api/v1/amd/status` |
| `backend/.env.example` | Template for environment configuration |

### API Endpoint: GET /api/v1/amd/status

Returns safe, non-secret information about AMD agent status:

```json
{
  "success": true,
  "data": {
    "amd_configured": true,
    "mode": "configured_stub",
    "model_name": "Qwen/Qwen2.5-7B-Instruct",
    "endpoint_configured": false,
    "gpu_target": "AMD MI300X",
    "api_key_masked": "abcd...wxyz",
    "fallback_enabled": true,
    "note": "AMD Cloud configured; inference running in safe stub mode until AMD_MODEL_ENDPOINT is set."
  }
}
```

**Security Note:** The full API key is NEVER exposed. Only a masked version (first 4 and last 4 characters) is shown.

### How to Enable Live AMD Inference

To switch from stub mode to live AMD inference:

1. Copy `backend/.env.example` to `backend/.env`
2. Add your AMD Cloud API credentials:
   ```bash
   AMD_API_KEY=your_actual_amd_api_key_here
   AMD_MODEL_ENDPOINT=https://your-amd-endpoint.com/v1/completions
   ```
3. Restart the backend server
4. The `/api/v1/amd/status` endpoint will show `"mode": "live"`

**Important:** Never commit `backend/.env` to git. It's in `.gitignore` for security.

## Mexico Avocado Network Integration

### Data Files

- **Frontend:** `frontend/lib/mexicoAvocadoNetwork.ts`
- **Backend:** `backend/data/mexico_avocado_regions.json`

### Features Implemented

#### 1. Globe Visualization (GlobeCommandView.tsx)

The Cesium globe now displays:

- **Michoacán Avocado Belt Boundary** - Cyan outline showing the production region
- **8 Production Municipalities** - Markers with stress level colors:
  - Tancítaro (Rank #1, 30,000 hectares)
  - Uruapan (Rank #2, 20,000 hectares)
  - Salvador Escalante, Ario de Rosales, Peribán, Ziracuaretiro, Tacámbaro, Zitácuaro
- **5 Production Clusters** - Circular regions showing cluster boundaries
- **15 Synthetic Orchards** - Generated across clusters with realistic metrics

#### 2. AI Command Parser (aiCommandParser.ts)

New commands supported:

| Command | Action |
|---------|--------|
| "show avocado belt" | Displays belt boundary and municipalities |
| "show production clusters" | Shows cluster regions |
| "create avocado orchard network in Michoacán" | Generates synthetic orchards |
| "navigate to Tancítaro" | Flies to Tancítaro municipality |
| "navigate to Uruapan" | Flies to Uruapan municipality |
| "navigate to Peribán" | Flies to Peribán municipality |
| "navigate to Tacámbaro" | Flies to Tacámbaro municipality |
| "navigate to Ziracuaretiro" | Flies to Ziracuaretiro municipality |
| "navigate to Salvador Escalante" | Flies to Salvador Escalante municipality |
| "navigate to Ario de Rosales" | Flies to Ario de Rosales municipality |
| "navigate to Zitácuaro" | Flies to Zitácuaro municipality |
| "show highest production municipality" | Flies to Tancítaro (highest production) |
| "find highest stress orchard in the avocado belt" | Selects highest-risk synthetic orchard |
| "compare Tancítaro and Uruapan" | Shows comparison panel |
| "enter 3D twin for the highest risk orchard" | Opens 3D twin for selected orchard |

#### 3. Analytics Panel (AnalyticsSummaryPanel.tsx)

Now includes Mexico data:

- Total orchards: Original network + 15 synthetic Mexico orchards
- Total trees: Combined count including estimated Mexico trees
- Highest stress orchard: Prioritizes Mexico data
- Profit at risk: Uses Mexico projected profit risk ($1.24M)

#### 4. Backend API Endpoints

New endpoints added to `backend/api/routes.py`:

##### GET /api/v1/orchard-network/mexico

Returns complete Mexico avocado network data including:
- Belt boundaries
- Municipalities with production metrics
- Clusters with risk assessments
- Supported agent commands

##### GET /api/v1/orchard-network/mexico/analytics

Returns calculated analytics:
- Total estimated hectares
- Average NDVI across municipalities
- Top production municipality
- Highest risk municipality
- Projected profit at risk

##### POST /api/v1/agent/command

Processes natural language commands:
```json
{
  "command": "show avocado belt",
  "context": {}
}
```

Returns:
```json
{
  "success": true,
  "command": "show avocado belt",
  "understood": true,
  "action": "show_avocado_belt",
  "message": "Displaying Michoacán avocado belt boundary and municipalities."
}
```

### Data Generation

Synthetic orchards are generated deterministically (no Math.random during initial render):

- Uses `deterministicOffset()` function with seed-based positioning
- 3 orchards per cluster (15 total)
- Realistic metrics: acres, trees, NDVI, stress levels, soil moisture, projected yields
- Each orchard has 3 sections (North, Central, South blocks)

### UI Components Updated

1. **GlobeCommandView.tsx** - Renders Mexico data on Cesium globe
2. **AIAdvisorPanel.tsx** - Processes Mexico-specific commands
3. **AnalyticsSummaryPanel.tsx** - Includes Mexico analytics
4. **AMDStatusPanel.tsx** - Shows real-time AMD agent status from backend

### Type Definitions

New command types added to `frontend/types/uiCommands.ts`:

- `ShowAvocadoBeltCommand`
- `ShowProductionClustersCommand`
- `CreateOrchardNetworkCommand`
- `NavigateToMunicipalityCommand`
- `SelectOrchardCommand`
- `CompareMunicipalitiesCommand`

## Testing the Implementation

### Acceptance Tests

1. **Show Avocado Belt**
   - Type: "show avocado belt"
   - Expected: Belt boundary appears, municipalities marked, camera flies to center

2. **Create Orchard Network**
   - Type: "create avocado orchard network in Michoacán"
   - Expected: 15 synthetic orchards appear across 5 clusters

3. **Navigate to Municipality**
   - Type: "navigate to Tancítaro"
   - Expected: Camera flies to Tancítaro, marker highlighted

4. **Show Highest Production**
   - Type: "show highest production municipality"
   - Expected: Flies to Tancítaro (30,000 hectares)

5. **Find Highest Stress**
   - Type: "find highest stress orchard in the avocado belt"
   - Expected: Selects and highlights highest-risk synthetic orchard

6. **Compare Municipalities**
   - Type: "compare Tancítaro and Uruapan"
   - Expected: Comparison data shown in analytics panel

7. **AMD Status Check**
   - Navigate to AMD Status Panel
   - Expected: Shows "Configured (Stub)" mode, model name, masked API key

8. **Backend API Test**
   ```bash
   curl http://localhost:8000/api/v1/amd/status
   curl http://localhost:8000/api/v1/orchard-network/mexico
   curl http://localhost:8000/api/v1/orchard-network/mexico/analytics
   ```

## Summary

### AMD Agent Status: STUB MODE ✓

- **Mode:** Configured Stub (deterministic logic)
- **Model:** Qwen/Qwen2.5-7B-Instruct (configured but not called)
- **Endpoint:** Not set (causes stub mode)
- **Fallback:** Enabled
- **Status Visibility:** Clear in UI and API

### Mexico Integration: COMPLETE ✓

- **Frontend:** Globe visualization, command parser, analytics
- **Backend:** 3 new endpoints, Mexico data loaded
- **Commands:** 14 Mexico-specific commands supported
- **Data:** 8 municipalities, 5 clusters, 15 synthetic orchards
- **Rendering:** No Math.random during initial render

### Honest Status Display ✓

The app clearly shows:
- "AMD Cloud configured; inference running in safe stub mode until AMD_MODEL_ENDPOINT is set."
- Agent mode badge: "Configured (Stub)" or "AMD Live"
- Model name and GPU target visible
- API key safely masked

**The application does not claim real AMD inference is running unless the backend is actually calling a live endpoint.**

---

Made with Bob - May 6, 2026