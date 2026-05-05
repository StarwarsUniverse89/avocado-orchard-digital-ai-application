# Bob May 8 Implementation Prompt
## Avocado Orchard Digital AI Application

## Role

You are acting as a senior full-stack engineer, React/Three.js frontend engineer, backend engineer, AI engineer, and AMD Cloud implementation lead.

Your job is not to rebuild the app from scratch.

Your job is to:

1. Analyze the current repo.
2. Preserve what already works.
3. Fix current runtime/build errors.
4. Improve the existing frontend so the demo looks excellent.
5. Complete only the missing backend/AI/financial/AMD pieces needed for the May 8 demo.
6. Create AMD Cloud docs/stubs where real cloud work is not yet possible.

---

## Deadline

This must be demo-ready by **May 8**.

Do not plan in weeks. Do not create an 8-week roadmap.

We need visible, working improvements now.

Prioritize:
- working demo
- React frontend polish
- 3D orchard scene stability
- simulation controls
- financial prediction
- AI recommendation output
- AMD Cloud integration plan/stubs
- clear run instructions
- perfect 3D realism 

Avoid:
- full production auth
- long ML training
- complex deployment
- rewriting working code without reason
- breaking the existing app

---

## First Task: Analyze the Current Repo

Before coding, inspect:

```text
README.md
SETUP.md
docker-compose.yml
requirements.txt
.gitignore

frontend/
backend/
ml/
infra/amd/
docs/
assets/ui/
```

Then report briefly:

```text
1. What already exists
2. What is currently broken
3. What files you will modify
4. What files you will create
5. What is local-only
6. What is intended for AMD Cloud
```

Then implement.

---

## Current Known Issues to Fix First

### 1. React Three Fiber import issue

The correct package is:

```text
@react-three/fiber
```

Not:

```text
@react-three/react-fiber
```

Search the frontend and fix any bad imports:

```text
@react-three/react-fiber
```

Replace with:

```text
@react-three/fiber
```

### 2. Next.js hydration mismatch in OrchardMap

`frontend/components/OrchardMap.tsx` was using `Math.random()` during render.

Do not use `Math.random()` during SSR/client initial render.

Use deterministic tree data based on row/column/index or generate random values only after mount.

### 3. React Three Fiber runtime error

The app showed:

```text
R3F: Div is not part of the THREE namespace
```

Fix this in `frontend/components/OrchardScene3D.tsx`.

Do not render raw HTML elements such as `<div>`, `<span>`, or `<button>` inside `<Canvas>`.

Inside `<Canvas>`, only use Three.js/R3F elements or use:

```tsx
import { Html } from "@react-three/drei";
```

for any HTML overlay inside the canvas.

If necessary, change:

```tsx
<Suspense fallback={<LoadingFallback />}>
```

to:

```tsx
<Suspense fallback={null}>
```

or make `LoadingFallback` use `<Html center>`.

### 4. Do not commit junk files

Do not commit:

```text
backend/venv/
__pycache__/
*.pyc
frontend/.next/
.env
```

Make sure `.gitignore` includes them.

---

## Main Demo Flow

The May 8 demo must show this:

```text
Satellite/aerial orchard view
→ select orchard or section
→ 3D orchard digital twin
→ run simulation
→ AI recommendation
→ financial prediction
→ yield/profit impact
→ visual update in UI
→ AMD Cloud/vision/fine-tuning story
```

---

# Frontend Requirements

## Frontend must look excellent

The React/Next.js frontend is the most visible part of the demo.

Make it feel like:

```text
Manus / Cursor / Grok-style enterprise AI command center
```

Do not make it look like a basic dashboard.

### Visual direction

```text
- enterprise command center
- light/dark mode
- default dark mode
- dark charcoal / near-black backgrounds
- blue/cyan/teal accents
- clean typography
- strong spacing
- subtle glass panels
- polished cards
- no playful styling
```

---

## Required frontend features

Create/improve these:

```text
frontend/app/command-center/page.tsx
frontend/app/page.tsx
frontend/components/OrchardScene3D.tsx
frontend/components/3d/AvocadoTree.tsx
frontend/components/OrchardMap.tsx
frontend/components/SimulationControls.tsx
frontend/components/FinancialPredictionPanel.tsx
frontend/components/AIAdvisorPanel.tsx
frontend/components/AMDStatusPanel.tsx
frontend/components/SatelliteOrchardView.tsx
frontend/types/orchard3d.ts
frontend/lib/mockData.ts
frontend/lib/api.ts
```

If the files already exist, improve them. Do not duplicate.

---

## React Three Fiber / Three.js / GSAP

Use:

```text
React / Next.js
Three.js
@react-three/fiber
@react-three/drei
GSAP
Tailwind CSS
```

Make sure dependencies are in `frontend/package.json`:

```bash
npm install three @react-three/fiber @react-three/drei gsap
```

---

## 3D Orchard Scene Minimum

The 3D scene must render without errors.

It should show:

```text
- ground plane
- orchard rows
- multiple tree objects
- trunks
- canopies
- avocado fruit objects
- healthy/warning/risk visual states
- camera controls
- lighting
- shadows if stable
```

### Visual states

```text
healthy = green/cyan canopy
warning = yellow/orange canopy
risk = red canopy
fruit_stage small = small fruit objects
fruit_stage medium = medium fruit objects
fruit_stage large = larger fruit objects
```

### Simulation buttons

Simulation controls should visibly change the scene:

```text
Heat Stress
Water Stress
Pest Risk
Apply AI Recommendation
Reset
```

When clicked, update:

```text
tree colors
fruit stage
health status
yield metric
profit metric
AI recommendation
visual_action
```

---

## Satellite / Aerial Entry

Create or improve the satellite entry panel.

It should show:

```text
- aerial/satellite-style orchard image
- section selector
- selected section highlight
- button to enter 3D twin
- smooth GSAP transition or fade/zoom
```

If real satellite data is not ready, use synthetic data and local assets.

Expected assets:

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

If filenames differ, map existing assets to expected names or create fallback placeholders.

The frontend must not break if an asset is missing.

---

# Backend Requirements

Make sure FastAPI runs.

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

If the current project uses `/api/v1`, keep that convention consistent.

Create/improve:

```text
backend/main.py
backend/api/routes.py
backend/services/orchard_service.py
backend/services/satellite_service.py
backend/services/vision_service.py
backend/services/yield_service.py
backend/services/financial_service.py
backend/agents/orchard_agent.py
backend/simulation/engine.py
backend/simulation/economics.py
backend/realtime/stream.py
```

---

# Financial Prediction Model

This is required for the demo.

The system should show business value, not only plant health.

Create/improve:

```text
backend/services/financial_service.py
backend/simulation/economics.py
ml/inference/financial_prediction_stub.py
ml/training/train_financial_model.py
frontend/components/FinancialPredictionPanel.tsx
```

## Minimum deterministic logic

Use this first:

```text
estimated_yield = yield_per_tree × trees_per_acre
revenue = estimated_yield × market_price
profit = revenue - production_cost
projected_gain_or_loss = scenario_profit - baseline_profit
roi = profit / production_cost
```

## Financial prediction endpoint

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

## Financial panel

The frontend panel must show:

```text
baseline revenue
scenario revenue
baseline profit
scenario profit
projected gain/loss
ROI
risk level
AI explanation
```

---

# Satellite Service

For May 8, synthetic satellite/NDVI output is acceptable.

Create/improve:

```text
backend/services/satellite_service.py
```

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

Also document future real pipeline:

```text
Sentinel-2
Landsat 8/9
SMAP
MODIS
Google Earth Engine
NDVI = (NIR - Red) / (NIR + Red)
```

Do not implement full real satellite automation unless the demo already works.

---

# Vision Service

For May 8, synthetic vision output is acceptable.

Create/improve:

```text
backend/services/vision_service.py
ml/inference/vision_inference_stub.py
```

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

# AI Agent

Use deterministic logic first if no LLM is connected.

Optional: use LangGraph for orchestration if practical.

The AI agent should combine:

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

Design it so it can later call AMD-hosted Qwen/Llama inference.

---

# AMD Cloud Implementation

Create only what is necessary for May 8.

Do not attempt full cloud deployment unless the local demo already works.

Create/improve:

```text
ml/inference/amd_model_client.py
infra/amd/amd_cloud_usage_plan.md
infra/amd/cost_control_checklist.md
infra/amd/run_model_inference.md
infra/amd/run_vision_model_test.md
infra/amd/run_tiny_training_pipeline.md
infra/amd/run_financial_model_test.md
```

## AMD credits

We have $100 AMD Developer Cloud credits.

Use them for:

```text
Qwen/Llama/Mistral inference test for the AI agent
vision model inference test on orchard/tree/fruit images
tiny financial/yield model training or inference test if time allows
```

Do not use credits for:

```text
frontend hosting
basic backend hosting
large dataset storage
long training
idle GPU instances
```

## API key management

Add docs and example env files only.

Do not commit real keys.

Create or improve:

```text
backend/.env.example
infra/amd/api_key_management.md
```

Example variables:

```env
AMD_API_KEY=
AMD_API_URL=
AMD_MODEL_ENDPOINT=
VLLM_API_KEY=
VLLM_API_URL=
VLLM_MODEL_NAME=
HUGGINGFACE_TOKEN=
```

Add documentation explaining:

```text
keys live in .env locally
never commit .env
backend reads keys from environment variables
AMD Cloud instance should be destroyed after tests
```

---

# Training Pipeline Stubs

Create/improve:

```text
ml/training/train_health_classifier.py
ml/training/train_yield_model.py
ml/training/train_financial_model.py
```

These do not need full training.

They should include:

```text
dataset loading placeholder
model choice
training function stub
AMD GPU note
output path for saved model
```

---

# Git Hygiene

Before commit:

```text
Do not commit backend/venv
Do not commit __pycache__
Do not commit frontend/.next
Do not commit .env
Do not commit huge zip datasets
```

Update `.gitignore` if needed.

Commit only useful source/docs.

---

# Success Criteria by May 8

The app must show:

```text
React/Next.js frontend that looks excellent
Light/dark enterprise command center
Satellite/aerial orchard view
Selectable orchard/section
3D or pseudo-3D digital twin
Simulation controls
AI recommendation panel
Financial prediction panel
Yield/revenue/profit impact
Visual changes based on simulation
AMD Cloud plan or working inference stub
Vision model stub or simple test output
Fine-tuning/training pipeline stub
No runtime/build errors
```

---

# Final Instruction

Start by analyzing the current repo.

Then fix current errors first.

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

Do not stop at analysis. Implement visible changes.

At the end, report:

```text
Files changed
How to run frontend
How to run backend
What is still mocked
What uses AMD Cloud later
What to test before recording demo
```
