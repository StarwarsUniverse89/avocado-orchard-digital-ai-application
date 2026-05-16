# 🥑 Gemini Orchard Operations Agent (Operational Digital Twin)

> **A regional agricultural operations agent that prioritizes risk across thousands of hectares, simulates intervention ROI, and coordinates field tasks under human oversight.**

## 🚀 Hackathon Alignment
This project is a submission for the **Google Building Agents for Real-World Challenges** hackathon.

- **Core Brain**: Powered by **Gemini 1.5 Pro**.
- **Agent Architecture**: Designed for **Google Cloud Agent Builder** compatibility.
- **Partner Track**: Integrated with **MongoDB** for operational memory.
- **MCP Superpower**: Uses Model Context Protocol concepts to provide the agent with historical orchard intelligence.

## Overview
**Gemini Orchard Operations Agent** is a multi-step operational command center. 

### 🏛️ Honest Digital Twin Positioning
**Operational Digital Twin**: The current implementation prioritizes operational decision support over photorealistic reconstruction. The 3D twin acts as an operational visualization layer updated by satellite telemetry, drone inspections, mission memory, and Gemini reasoning. It is designed to answer "What is happening and what should I do?" rather than "What does this look like in a photo?"

## 📈 Business Value / ROI
- **Prioritize at Scale**: Growers can monitor and prioritize inspections across an entire regional network, focusing limited labor on high-value/high-risk zones first.
- **Reduce Broad Treatment**: Instead of spraying an entire block, drone-verified anomalies allow for targeted, precision interventions, reducing chemical costs by up to 60%.
- **Delay Risk Simulation**: The agent estimates the financial cost of action versus the cost of delay, supporting data-driven CAPEX approval.
- **Farm-to-Market Predictability**: More accurate yield recovery estimates support better harvest timing and market pricing negotiations.

**Monetization Examples:**
- **SaaS Tier**: Subscription per hectare/cluster for regional Monitoring & Drone Planning.
- **Enterprise**: Custom ROI modeling and export dashboard for packers and exporters.

The current implementation focuses on the Michoacán avocado belt in Mexico and combines:

- Cesium-based geospatial visualization
- FastAPI backend services
- AMD MI300X vLLM inference
- Qwen3-32B AI advisor support
- Orchard detection and archive workflows
- PostgreSQL-ready orchard persistence
- Financial and analytics summaries
- Vision/3D analysis and digital twin generation

---

## Key Features

### 🌍 Cesium Geospatial Command Center

- Interactive Cesium globe focused on the Michoacán avocado belt
- Municipality navigation for avocado-producing regions
- Production cluster visualization
- Orchard parcel polygon rendering
- Stress-level color coding
- GPS boundary and area display

### 🛰️ Orchard Detection Pipeline

The orchard detection workflow allows users to select a municipality or region and scan for orchard parcel candidates.

Detected parcels include:

- Archive ID
- Orchard ID
- Municipality ID
- GPS center coordinates
- Boundary coordinates
- Estimated hectares and acres
- Estimated tree count
- NDVI average
- Stress level
- Confidence score
- Detection method
- Imagery source

The detection pipeline is model-ready and supports fallback detection if satellite imagery, SAMGeo, OpenCV, or custom model dependencies are unavailable.

### 🗄️ Orchard Archive and Network System

Detected orchard parcels can be saved to an archive for future use. The archive is designed to support PostgreSQL persistence when `DATABASE_URL` is configured, with JSON fallback for local/demo use.

The archive system enables:

- Saving detected orchards
- Loading previously scanned orchards
- Selecting archived parcels
- Creating company/grower orchard networks
- Running analytics on a single orchard, municipality, or network

### ✍️ Human-Labeled Orchard Boundary Archive

AI segmentation gives a first pass for locating likely orchard blocks, but operators can manually outline orchards directly on the Cesium command globe when the model boundary needs correction or when a reliable operational target is needed immediately.

Manual Boundary Mode lets an operator click map points to create a polygon, label it as `orchard_block`, `orchard_cluster`, `non_orchard`, or `needs_review`, add field metadata, and archive it as a human-labeled boundary. These records are stored in MongoDB mission memory when available, or local fallback memory during demos.

Archived manual boundaries become part of the ML label archive for training dataset preparation. The system does not claim model training is already happening; it prepares durable human-labeled examples that can improve future orchard segmentation workflows while providing reliable targets for reconstruction, drone inspection, ROI analysis, and human-in-the-loop tasking today.

### 🧠 Operational ML Layer

The operational ML feedback loop is:

```text
AI prediction → human correction → archived label → training dataset → improved future model
```

AI segmentation creates first-pass orchard boundaries. Operators can correct those predictions or outline real orchards manually when the system needs more reliable ground truth. These human-corrected boundaries are saved as ML training labels in the manual boundary archive.

The dataset can be exported as GeoJSON through the training dataset endpoints for future model training or fine-tuning. The current system does not train a model automatically; it prepares an ML label archive and uses human-corrected labels immediately as operational truth for mission planning, reconstruction, inspection, ROI analysis, and human-in-the-loop tasking.

### 🤖 Gemini Operations Agent
The agent oversees the regional avocado network and prioritizes work across many orchards. It leverages MongoDB MCP to remember previous interventions and outcomes.

**Operational Flow:**
1. **Monitor**: Review the **Regional Operations Summary** for belt-wide risks.
2. **Analyze**: Select a municipality and scan for high-stress parcels.
3. **Plan**: Deploy a **Drone Mission Agent** to generate Cesium flight paths.
4. **Inspect**: Run the **Inspection Analysis** workflow on simulated imagery.
5. **Act**: Review Gemini's recommendations and financial exposure.
6. **Delegate**: Draft human-in-the-loop tasks for field operators.
7. **Remember**: All actions are stored in **MongoDB Memory** for future reasoning.

### 🤝 Human-in-the-loop task delegation
The agent does not directly perform real-world farm treatments. It drafts operational tasks for workers/operators, keeping humans in control. This ensures every automated insight is verified by a professional before physical intervention occurs.
Example commands:

```text
show highest production municipality
scan Tancítaro for orchards
select largest orchard candidate
show financial impact
create analytics summary
compare Tancítaro and Uruapan
run vision pipeline
generate 3D twin from selected orchard
```

The AI Advisor is powered by a live AMD MI300X vLLM endpoint running **Qwen3-32B** for reasoning, command interpretation, and grower recommendations.

### 🎮 3D Digital Twin Workflow

Selected orchard parcels can be passed into the Vision/3D pipeline to generate digital twin parameters such as:

- Canopy volume
- Estimated fruit count
- Average fruit size
- Tree height
- Trunk diameter
- Branch density
- Health status
- Stress color
- Visual 3D parameters

The 3D twin workflow supports interactive orchard visualization and scenario-based decision support.

### 📊 Financial and Analytics Intelligence

The application supports context-aware analytics for:

- Selected orchard parcels
- Archived orchards
- Municipalities
- Full Mexico avocado network
- Company orchard networks

Analytics include:

- Total hectares
- Estimated tree count
- NDVI
- Stress level
- Production rank
- Projected profit at risk
- Financial impact
- Recommended next actions

---

## Architecture

```text
Frontend: Next.js + Cesium + React/Three.js
        |
        | HTTP API
        v
Backend: FastAPI on port 8001
        |
        | OpenAI-compatible API
        v
vLLM: Qwen3-32B on AMD MI300X, port 8000
        |
        v
AI Advisor + Orchard Reasoning

Backend Services:
- Mexico avocado network service
- Orchard detection service
- Satellite imagery service
- Orchard archive service
- Company orchard network service
- Vision/3D analysis service
- Financial and yield services

Persistence:
- PostgreSQL when DATABASE_URL is configured
- JSON fallback for local/demo mode
```

---

## Technology Stack

### Frontend

- **Next.js** - React application framework
- **TypeScript** - Type-safe frontend development
- **Cesium** - 3D globe and geospatial visualization
- **Three.js / React Three Fiber** - 3D orchard digital twin rendering
- **Tailwind CSS** - UI styling
- **AI Advisor UI** - Natural language workflow controller

### Backend

- **FastAPI** - Python API server
- **SQLAlchemy** - PostgreSQL ORM layer
- **PostgreSQL** - Orchard archive and network persistence
- **vLLM** - OpenAI-compatible LLM serving
- **AMD MI300X** - GPU inference infrastructure
- **ROCm** - AMD GPU compute platform

### AI / ML

- **Qwen/Qwen3-32B** - Primary AI Advisor model
- **Qwen/Qwen2.5-32B-Instruct** - Fallback model
- **Orchard detection service** - Parcel detection and fallback logic
- **Vision/3D analysis service** - Tree-level simulation and digital twin parameters
- **NDVI/stress estimation** - Crop health and risk indicators

## 🛠️ Environment Variables
```env
GOOGLE_API_KEY=your_key_here
GEMINI_MODE=live
GOOGLE_GENAI_MODEL=gemini-1.5-pro
MONGODB_URI=your_mongodb_uri
MONGODB_DATABASE=avocado_ops
```

---

## Ports

| Service | Port |
|---|---:|
| Frontend | 3000 |
| vLLM model server | 8000 |
| FastAPI backend | 8001 |
| PostgreSQL | 5432 |

---

## Environment Variables

### Frontend: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
NEXT_PUBLIC_MAP_PROVIDER=cesium
NEXT_PUBLIC_CESIUM_ION_TOKEN=your_cesium_token_here
```

### Backend: `backend/.env`

```env
ENVIRONMENT=development
API_HOST=0.0.0.0
API_PORT=8001

AMD_API_KEY=your_amd_api_key_here
AMD_API_URL=https://api.amd.cloud/v1
AMD_MODEL_ENDPOINT=http://localhost:8000/v1/chat/completions
AMD_MODEL_NAME=Qwen/Qwen3-32B
AMD_GPU_TARGET=AMD MI300X

VLLM_API_URL=http://localhost:8000
VLLM_MODEL_NAME=Qwen/Qwen3-32B
VLLM_ENABLED=true

AMD_GPU_ENABLED=true
MODEL_NAME=Qwen/Qwen3-32B

DATABASE_URL=postgresql://avocado_user:<password>@localhost:5432/avocado_ai
LOG_LEVEL=INFO
```

Do not commit `.env` or `.env.local` files.

---

## Running the Application

### 1. Start vLLM on the AMD MI300X droplet

Primary model:

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen3-32B \
  --host 0.0.0.0 \
  --port 8000 \
  --max-model-len 32768
```

Fallback model:

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-32B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --max-model-len 32768
```

### 2. Start the FastAPI backend on the droplet

```bash
cd ~/avocado-orchard-digital-ai-application/backend
uvicorn main:app --host 0.0.0.0 --port 8001
```

### 3. Open SSH tunnel from local machine

```bash
ssh -i ~/.ssh/amd_cloud_key \
  -L 8000:localhost:8000 \
  -L 8001:localhost:8001 \
  root@<droplet-ip>
```

### 4. Verify AMD backend status

```bash
curl http://localhost:8001/api/v1/amd/status
```

Expected response includes:

```json
{
  "mode": "live",
  "model_name": "Qwen/Qwen3-32B",
  "gpu_target": "AMD MI300X"
}
```

### 5. Start frontend locally

```bash
cd ~/avocado-orchard-digital-ai-application/frontend
npm install
rm -rf .next
npm run dev
```

Open:

```text
http://localhost:3000/command-center
```

---

## PostgreSQL Setup

On the droplet:

```bash
apt update
apt install postgresql postgresql-contrib -y
sudo -u postgres psql
```

Inside `psql`:

```sql
CREATE DATABASE avocado_ai;
CREATE USER avocado_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE avocado_ai TO avocado_user;
\q
```

Grant schema permissions:

```bash
sudo -u postgres psql -d avocado_ai
```

```sql
GRANT ALL ON SCHEMA public TO avocado_user;
ALTER SCHEMA public OWNER TO avocado_user;
\q
```

Test connection:

```bash
psql "postgresql://avocado_user:<password>@localhost:5432/avocado_ai" -c "\dt"
```

---

## Main Demo Workflow

1. Open the command center.
2. Confirm AMD status shows live MI300X inference.
3. Type:

```text
show highest production municipality
```

4. The globe navigates to Tancítaro.
5. Type:

```text
scan Tancítaro for orchards
```

6. The system scans the municipality and displays orchard parcel polygons.
7. Select an orchard parcel.
8. View GPS, area, trees, NDVI, stress, confidence, and archive ID.
9. Type:

```text
show financial impact
```

10. Review parcel-level financial risk.
11. Type:

```text
create analytics summary
```

12. Review parcel, municipality, or network analytics.
13. Type:

```text
run vision pipeline
```

14. Generate Vision/3D analysis.
15. Type:

```text
generate 3D twin from selected orchard
```

16. View the orchard digital twin.

---

## API Endpoints

### AMD / AI

```text
GET  /api/v1/amd/status
POST /api/v1/agent
POST /api/v1/agent/command
```

### Mexico Orchard Network

```text
GET /api/v1/orchard-network/mexico
GET /api/v1/orchard-network/mexico/analytics
```

### Orchard Detection

```text
GET  /api/v1/orchard-detection/status
POST /api/v1/orchard-detection/scan-municipality
POST /api/v1/orchard-detection/scan-area
POST /api/v1/orchard-detection/from-upload
```

### Orchard Archive

```text
GET    /api/v1/orchard-archive
GET    /api/v1/orchard-archive/{archive_id}
POST   /api/v1/orchard-archive
PUT    /api/v1/orchard-archive/{archive_id}
DELETE /api/v1/orchard-archive/{archive_id}
```

### Orchard Networks

```text
GET    /api/v1/orchard-networks
GET    /api/v1/orchard-networks/{network_id}
POST   /api/v1/orchard-networks
POST   /api/v1/orchard-networks/{network_id}/members
DELETE /api/v1/orchard-networks/{network_id}/members/{archive_id}
GET    /api/v1/orchard-networks/{network_id}/analytics
```

### Vision / 3D

```text
POST /api/v1/vision-3d/analyze
```

---

## Testing

### Test AMD live inference

```bash
API_BASE_URL=http://localhost:8001 bash TEST_LIVE_AMD_INFERENCE.sh
```

### Test orchard detection

```bash
curl -X POST http://localhost:8001/api/v1/orchard-detection/scan-municipality \
  -H "Content-Type: application/json" \
  -d '{"municipality_id":"tancitaro","save_to_archive":true}'
```

### Test archive

```bash
curl http://localhost:8001/api/v1/orchard-archive
```

---

## Repository Structure

```text
.
├── backend/
│   ├── api/
│   ├── agents/
│   ├── core/
│   ├── db/
│   ├── realtime/
│   ├── services/
│   └── simulation/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── types/
├── ml/
│   └── inference/
├── infra/
│   └── amd/
├── docs/
└── README.md
```

---

## Current Status

Implemented:

- Cesium command center
- Mexico avocado network
- Municipality navigation
- Orchard parcel detection workflow
- Orchard archive workflow
- PostgreSQL-ready persistence
- AI Advisor command routing
- Financial impact analysis
- Analytics summaries
- Vision/3D analysis workflow
- AMD MI300X vLLM backend integration
- Qwen3-32B model configuration
- 3D digital twin workflow

Future enhancements:

- Real high-resolution satellite provider integration
- Fine-tuned avocado orchard segmentation model
- Drone image upload workflow
- Multi-company dashboard
- Advanced yield optimization
- Production authentication and user roles

---

## License

This project is licensed under the **Apache License, Version 2.0**.

Copyright 2026 F Melgoza

You may obtain a copy of the license at:

```text
http://www.apache.org/licenses/LICENSE-2.0
```

See the `LICENSE` file for details.

---

## Copyright

Copyright 2026 F Melgoza

Licensed under the Apache License, Version 2.0.
