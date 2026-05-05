# Bob Repo-Aware Implementation Prompt
## Avocado Orchard Digital AI Application

## Your Role

You are acting as a senior full-stack engineer, React frontend engineer, backend engineer, AI/ML engineer, and AMD Cloud implementation lead.

Your job is **not** to rebuild the project from scratch.

Your job is to:

1. Analyze what is already in the repo.
2. Preserve what is already working.
3. Improve incomplete areas.
4. Add only the missing pieces needed for the May 8 demo.
5. Create the files/code/docs needed for AMD Cloud usage.
6. Keep the app demo-focused, polished, and runnable.

---

## Deadline

The project must be demo-ready by **May 8**.

Do not plan in weeks. We only have days.

Prioritize:
- working demo
- polished React UI
- clean backend APIs
- financial prediction
- AI recommendation flow
- AMD Cloud story/stubs

Avoid:
- overengineering
- full production auth
- perfect 3D realism
- long model training
- complex cloud deployment
- rewriting working code unnecessarily

---

## First Task: Analyze the Repo

Before making changes, inspect the current repository.

Look at:

```text
README.md
SETUP.md
docker-compose.yml
requirements.txt

frontend/
backend/
ml/
infra/amd/
docs/
assets/ui/
```

Then report:

```text
1. What already exists and works
2. What exists but is incomplete
3. What is missing
4. What files should be updated
5. What files should be created
6. What should run locally
7. What should run on AMD Cloud
```

Do not duplicate existing files if they already exist. Update them only if needed.

---

## Current Project Direction

This is a high-performance AI digital twin application for avocado orchards.

The demo should show:

```text
Satellite/aerial orchard view
→ select orchard or section
→ 3D or pseudo-3D digital twin
→ simulate condition change
→ AI agent recommendation
→ financial prediction
→ yield/profit impact
→ visual update in UI
```

The project targets all 3 AMD tracks:

```text
Track 1: AI Agents & Agentic Workflows
Track 2: Fine-Tuning / AMD GPU model work
Track 3: Vision & Multimodal AI
```

---

## Highest Priority: React Frontend Must Look Excellent

The frontend is extremely important.

The UI should feel like an enterprise AI command center, inspired by Manus/Cursor/Grok-style interfaces, but not copied.

Requirements:

```text
- React / Next.js frontend
- Light/dark mode
- Default dark mode
- Premium enterprise look
- Command-center layout
- Dark charcoal / black backgrounds
- Blue/cyan/teal accents
- Clean typography
- Strong spacing
- Smooth interactions
- Not playful
- Not basic
```

### Frontend should include:

```text
Satellite/aerial orchard view
Orchard/section selector
3D or pseudo-3D digital twin panel
AI advisor panel
Financial prediction panel
Metrics cards
Simulation controls
AMD/GPU status panel
Light/dark mode toggle
```

### Create or improve these files if needed:

```text
frontend/app/page.tsx
frontend/app/layout.tsx
frontend/app/globals.css

frontend/components/CommandCenter.tsx
frontend/components/SatelliteOrchardView.tsx
frontend/components/OrchardTwin3D.tsx
frontend/components/AIAdvisorPanel.tsx
frontend/components/MetricsPanel.tsx
frontend/components/SimulationControls.tsx
frontend/components/FinancialPredictionPanel.tsx
frontend/components/AMDStatusPanel.tsx
frontend/components/ThemeToggle.tsx

frontend/lib/api.ts
frontend/lib/mockData.ts
frontend/lib/websocket.ts
```

If some of these already exist, improve them instead of replacing everything.

If full Three.js is risky before May 8, create a strong pseudo-3D fallback that still looks impressive and can later be replaced by Three.js.

---

## Assets

Use the current assets in:

```text
assets/ui/
```

Expected asset names for the frontend:

```text
assets/ui/orchard-aerial.jpg
assets/ui/orchard-map-overlay.png
assets/ui/avocado-tree-healthy.png
assets/ui/avocado-tree-warning.png
assets/ui/avocado-tree-risk.png
assets/ui/avocado-fruit-small.png
assets/ui/avocado-fruit-medium.png
assets/ui/avocado-fruit-large.png
```

If assets already exist with different names, do one of the following:

```text
1. Map existing filenames to expected names
2. Copy/rename the best matching files
3. Add fallback placeholders
4. Document missing assets
```

The frontend must not break if an image is missing.

---

## Backend Goal

Make the backend runnable and useful for the frontend.

Do not overbuild. Create clean demo-ready APIs.

Required endpoints:

```text
GET /api/health
GET /api/orchards
GET /api/orchards/{id}
POST /api/simulate
POST /api/agent
GET /api/satellite/{orchard_id}
GET /api/vision/{orchard_id}
GET /api/yield/{orchard_id}
GET /api/financial/{orchard_id}
POST /api/financial/predict
GET /api/amd/status
```

If the repo currently uses `/api/v1`, keep that convention consistent.

### Backend files to inspect/update/create:

```text
backend/main.py
backend/api/routes.py

backend/services/orchard_service.py
backend/services/satellite_service.py
backend/services/vision_service.py
backend/services/yield_service.py
backend/services/financial_service.py

backend/agents/orchard_agent.py
backend/agents/knowledge_agent.py

backend/simulation/engine.py
backend/simulation/economics.py
backend/realtime/stream.py
```

---

## Data and Synthetic Live Data

Use existing data if available.

If real data is not ready, create synthetic demo data.

Required fields:

```text
orchard_id
name
location
section
temperature
soil_moisture
pest_pressure
ndvi
fruit_size
canopy_size
yield_per_tree
trees_per_acre
market_price
production_cost
revenue
profit
health_status
harvest_days
financial_risk
```

The UI should behave like the data is live, even if the backend is returning synthetic updates.

---

## Satellite Service

Create or improve:

```text
backend/services/satellite_service.py
```

For demo, synthetic satellite/NDVI data is acceptable.

Return:

```json
{
  "orchard_id": "orchard_A",
  "source": "synthetic_sentinel2",
  "ndvi_average": 0.74,
  "ndvi_min": 0.48,
  "ndvi_max": 0.88,
  "stress_zones": [
    {
      "section": "B2",
      "severity": "warning",
      "ndvi": 0.52,
      "recommendation": "Inspect irrigation and leaf health"
    }
  ],
  "satellite_layer": {
    "type": "aerial",
    "asset": "/assets/ui/orchard-aerial.jpg"
  }
}
```

Document future real satellite sources:

```text
Sentinel-2
Landsat 8/9
SMAP
MODIS
Google Earth Engine
NDVI = (NIR - Red) / (NIR + Red)
```

---

## Vision Service

Create or improve:

```text
backend/services/vision_service.py
ml/inference/vision_inference_stub.py
```

For demo, synthetic vision model outputs are acceptable.

Return:

```json
{
  "orchard_id": "orchard_A",
  "model": "vision_inference_stub",
  "tree_health": "warning",
  "fruit_stage": "medium",
  "canopy_condition": "moderate",
  "stress_risk": "medium",
  "confidence": 0.84,
  "detected_assets": {
    "tree_state": "avocado-tree-warning.png",
    "fruit_state": "avocado-fruit-medium.png"
  }
}
```

Document future model options:

```text
EfficientNet-B3
ResNet50
MobileNet-V3
Vision Transformer
Qwen-VL / Llama Vision
```

---

# Financial Prediction Model

This is required.

The system should not only show plant health. It should show business impact.

Create or improve:

```text
backend/services/financial_service.py
backend/simulation/economics.py
ml/inference/financial_prediction_stub.py
ml/training/train_financial_model.py
frontend/components/FinancialPredictionPanel.tsx
```

## Minimum Financial Logic

Use deterministic calculations first:

```text
estimated_yield = yield_per_tree × trees_per_acre
revenue = estimated_yield × market_price
profit = revenue - production_cost
projected_gain_or_loss = scenario_profit - baseline_profit
roi = profit / production_cost
```

## Required Endpoint

```text
POST /api/financial/predict
```

Input:

```json
{
  "orchard_id": "orchard_A",
  "scenario": {
    "temperature": 36,
    "soil_moisture": 32,
    "pest_pressure": 7,
    "ndvi": 0.52
  }
}
```

Output:

```json
{
  "orchard_id": "orchard_A",
  "baseline": {
    "estimated_yield": 18000,
    "revenue": 50400,
    "profit": 45200
  },
  "scenario": {
    "estimated_yield": 16200,
    "revenue": 45360,
    "profit": 40160
  },
  "prediction": {
    "projected_gain_or_loss": -5040,
    "roi": 7.72,
    "risk_level": "medium",
    "message": "Heat and moisture stress may reduce profit by approximately $5,040."
  }
}
```

## Frontend Financial Panel

Create or improve:

```text
frontend/components/FinancialPredictionPanel.tsx
```

Display:

```text
Baseline revenue
Scenario revenue
Baseline profit
Scenario profit
Projected gain/loss
Risk level
ROI
AI explanation
```

This panel is important because it turns the project into a business decision system, not just a visual demo.

---

## Yield Service

Create or improve:

```text
backend/services/yield_service.py
ml/training/train_yield_model.py
```

Use simple rule-based prediction first.

Inputs:

```text
temperature
soil_moisture
pest_pressure
ndvi
canopy_size
fruit_size
trees_per_acre
yield_per_tree
```

Return:

```json
{
  "estimated_yield_kg": 18000,
  "yield_per_tree_kg": 120,
  "yield_risk": "medium",
  "harvest_days": 7
}
```

---

## AI Agent

Use LangGraph as the preferred workflow orchestrator if practical.

LangChain can be used underneath for prompts/model calls/retrieval.

The agent should combine:

```text
orchard state
satellite/NDVI output
vision output
simulation output
financial prediction output
research knowledge
```

Return structured JSON:

```json
{
  "recommendation": "Increase irrigation",
  "reason": "Soil moisture and NDVI indicate water stress in section B2.",
  "impact": {
    "yield_change": "-10% risk avoided",
    "profit_change": "+$4,500 projected protection"
  },
  "confidence": 0.82,
  "visual_action": {
    "type": "moisture_recovery",
    "duration": 3000,
    "target_section": "B2"
  }
}
```

If no real LLM is connected, use deterministic logic or a mock response.

Design the agent so it can later call AMD-hosted Qwen/Llama inference.

---

## AMD Cloud Work

Create only what is necessary for AMD Cloud usage.

Do not attempt a full cloud deployment unless the demo already works.

Create or improve:

```text
ml/inference/amd_model_client.py

infra/amd/amd_cloud_usage_plan.md
infra/amd/cost_control_checklist.md
infra/amd/run_model_inference.md
infra/amd/run_vision_model_test.md
infra/amd/run_tiny_training_pipeline.md
infra/amd/run_financial_model_test.md
```

## AMD Credits

We have **$100 AMD Developer Cloud credits**.

Use them for:

```text
Qwen/Llama/Mistral inference test for the AI agent
Vision model inference test on orchard/tree/fruit images
Tiny financial/yield model training or inference test if time allows
```

Do not use them for:

```text
frontend hosting
basic backend hosting
large dataset storage
long training
idle GPU instances
```

## AMD Cost Control

Document clearly:

```text
Start GPU only when ready
Clone repo
Run inference/training test
Save logs/screenshots
Stop work
Destroy instance
Confirm billing stopped
```

---

## Training Pipeline Stubs

Create or improve:

```text
ml/training/train_health_classifier.py
ml/training/train_yield_model.py
ml/training/train_financial_model.py
```

These do not need full training yet.

They should include:

```text
dataset loading placeholder
model choice
training function stub
AMD GPU note
output path for saved model
```

This supports Track 2.

---

## README / Docs

Update docs only if needed.

Do not overwrite good documentation.

Add concise docs for:

```text
How to run frontend
How to run backend
How to test endpoints
How AMD Cloud will be used
How the financial prediction model works
```

---

## Success Criteria by May 8

The app must show:

```text
React/Next.js frontend that looks excellent
Light/dark enterprise command center
Satellite/aerial orchard view
Selectable orchard/section
3D or pseudo-3D digital twin
Synthetic live data updates
Simulation controls
AI recommendation panel
Financial prediction panel
Yield/revenue/profit impact
Visual state changes based on simulation
AMD Cloud plan or working inference stub
Vision model stub or simple test output
Fine-tuning/training pipeline stub
```

---

## Do Not Overbuild

Do not spend time on:

```text
full auth
full production deployment
perfect 3D realism
full satellite data automation
long ML training
complex cloud orchestration
heavy fine-tuning before the demo works
rewriting working code without reason
```

---

## Final Instruction

Start by analyzing the current repo.

Then improve what already exists and create only the missing pieces needed to support:

```text
satellite view
→ orchard selection
→ digital twin
→ simulation
→ AI recommendation
→ financial prediction
→ visual update
→ AMD/vision/fine-tuning story
```

Commit changes with clear messages.
