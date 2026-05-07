# 🥑 Avocado Orchard Digital AI Application

## Overview

This project is a high-performance AI agent system that models avocado orchards as a digital twin, enabling real-time analysis, simulation, and decision-making with satellite-based orchard detection capabilities.

It combines:

- **Interactive digital twin visualization** with Cesium globe integration
- **AI-driven decision support** with natural language commands
- **Satellite-based orchard detection** using NDVI and ML analysis
- **Research-based simulation models** for yield prediction
- **GPU-accelerated computation** on AMD MI300X infrastructure
- **Vision/3D analysis pipeline** for tree-level insights

---

## Key Features

### 🌍 Globe View & Orchard Network
- Interactive Cesium globe showing Mexico's Michoacán avocado belt
- Real-time municipality and orchard visualization
- Stress level indicators and production metrics
- Synthetic orchard network generation

### 🛰️ Orchard Detection Pipeline
- **Satellite imagery analysis** for orchard parcel detection
- **NDVI-based vegetation analysis** with stress level classification
- **Boundary detection** with GPS coordinate mapping
- **Tree count estimation** using crown density analysis
- **Orchard archive system** for saving detected parcels
- **Vision/3D analysis** for detailed tree-level metrics

### 🤖 AI Command Center
- Natural language command interface
- Commands for navigation, scanning, and analysis
- Automated orchard detection workflows
- Real-time recommendations and insights

### 🎮 3D Digital Twin
- Tree-level visualization with health indicators
- Scenario simulation (weather, soil moisture, pest impact)
- Before/after comparison views
- GPU-accelerated rendering

### 📊 Analytics & Predictions
- Financial impact analysis
- Yield forecasting
- Risk assessment
- Network-wide analytics summaries

---

## Architecture

### Frontend Stack
- **Next.js 14** - React framework with App Router
- **Cesium** - 3D globe and geospatial visualization
- **Three.js** - 3D orchard scene rendering
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

### Backend Stack
- **FastAPI** - High-performance Python API (Port 8001)
- **vLLM** - LLM inference server (Port 8000)
- **AMD MI300X GPU** - Hardware acceleration
- **ROCm** - AMD GPU compute platform

### ML/AI Layer
- **Orchard Detection** - NDVI analysis + ML classification
- **Vision/3D Analysis** - Tree detection and health assessment
- **Knowledge Agent** - Research-grounded recommendations
- **LLM Integration** - Qwen3-32B (primary) / Qwen2.5-32B-Instruct (fallback) on AMD MI300X

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- AMD GPU with ROCm (optional, falls back to CPU)

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Add your Cesium Ion token to .env.local
npm run dev
```

Frontend runs on: http://localhost:3000

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure AMD API key if using AMD Cloud
uvicorn main:app --reload --port 8001
```

Backend API runs on: http://localhost:8001

### Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_CESIUM_ION_TOKEN=your_cesium_token
NEXT_PUBLIC_API_URL=http://localhost:8001
```

**Backend (.env):**
```
AMD_API_KEY=your_amd_api_key
AMD_MODEL_ENDPOINT=http://localhost:8000/v1/chat/completions
AMD_MODEL_NAME=Qwen/Qwen3-32B
AMD_GPU_TARGET=AMD MI300X
VLLM_ENDPOINT=http://localhost:8000
```

### vLLM Model Configuration

**Primary Model: Qwen3-32B** (Recommended for AMD MI300X)
```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen3-32B \
  --host 0.0.0.0 \
  --port 8000 \
  --max-model-len 32768
```

**Fallback Model: Qwen2.5-32B-Instruct**
```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-32B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --max-model-len 32768
```

**LLM Usage:**
The LLM handles agent reasoning and command interpretation:
- Natural language command parsing
- UI/backend action selection
- Orchard detection result summarization
- Vision/3D analysis explanation
- Financial impact reasoning
- Grower action recommendations

**Note:** Orchard detection uses dedicated computer vision services, not the LLM:
- `orchard_detection_service` - Detection pipeline coordination
- `satellite_imagery_service` - Satellite data processing
- `orchard_detector` - NDVI analysis and ML classification
- `vision_3d_analysis_service` - Tree-level 3D analysis

---

## Usage Guide

### 1. Globe View Navigation
- View the Michoacán avocado belt and municipalities
- Click municipalities to zoom in
- See production metrics and stress levels

### 2. Orchard Detection
```
Commands:
- "Scan Tancítaro for orchards"
- "Detect orchard parcels near Uruapan"
- "Select largest orchard candidate"
- "Select highest stress parcel"
```

When a municipality is selected, click **"Scan Area for Orchards"** to:
- Analyze satellite imagery
- Detect orchard boundaries
- Calculate NDVI and stress levels
- Estimate tree counts and area

### 3. Orchard Analysis
After detection, click on any orchard parcel to:
- View detailed metrics (GPS, area, trees, NDVI, stress)
- **Save to Archive** - Store for future reference
- **Run Vision/3D Analysis** - Get tree-level insights
- **Generate 3D Twin** - Create interactive 3D view

### 4. AI Commands
Use natural language in the AI Advisor panel:
```
Navigation:
- "Navigate to Tancítaro"
- "Show highest production municipality"
- "Find highest stress orchard in the avocado belt"

Detection:
- "Scan Uruapan for orchards"
- "Save selected orchard to archive"
- "Run vision pipeline"
- "Generate 3D twin from selected orchard"

Analysis:
- "Show financial impact"
- "Create analytics summary"
- "Compare Tancítaro and Uruapan"
```

---

## API Endpoints

### Orchard Detection
- `POST /api/v1/orchard-detection/scan-municipality` - Scan municipality for orchards
- `POST /api/v1/orchard-detection/scan-area` - Scan specific area
- `GET /api/v1/orchard-detection/status` - Get detection status

### Orchard Archive
- `GET /api/v1/orchard-archive` - List archived orchards
- `POST /api/v1/orchard-archive` - Save orchard to archive
- `GET /api/v1/orchard-archive/{id}` - Get archived orchard

### Vision/3D Analysis
- `POST /api/v1/vision-3d/analyze` - Run vision analysis on orchard

### AI Agent
- `POST /api/v1/agent/command` - Send natural language command
- `POST /api/v1/agent` - Get AI recommendation

---

## AMD Integration

### GPU Acceleration
- **AMD MI300X** for model inference and simulation
- **ROCm** compatibility for GPU compute
- **vLLM** for efficient LLM serving
- **HIP kernels** for custom compute workloads

### Model Support
- **Qwen models** for agricultural knowledge
- **Llama models** for general reasoning
- **Custom vision models** for orchard analysis

### Performance Benefits
- 10x faster inference vs CPU
- Real-time simulation capabilities
- Scalable multi-orchard processing

---

## Development

### Project Structure
```
├── frontend/                 # Next.js application
│   ├── components/          # React components
│   ├── lib/                # Utilities and API clients
│   └── app/                # App Router pages
├── backend/                 # FastAPI application
│   ├── api/                # API routes
│   ├── services/           # Business logic
│   └── agents/             # AI agents
├── ml/                     # ML models and inference
│   ├── inference/          # Model inference code
│   └── datasets/           # Training data
└── docs/                   # Documentation
```

### Key Components
- **GlobeCommandView** - Cesium globe with orchard detection
- **OrchardCandidatePanel** - Detected orchard details and actions
- **AIAdvisorPanel** - Natural language command interface
- **OrchardScene3D** - 3D digital twin visualization

### Adding New Commands
1. Add patterns to `frontend/lib/aiCommandParser.ts`
2. Implement handler logic
3. Add UI command mapping in components
4. Test with AI Advisor panel

---

## Research Foundation

Based on peer-reviewed research in:
- Precision agriculture and remote sensing
- NDVI analysis for crop health assessment
- Machine learning for agricultural applications
- Digital twin technology for farming

---

## License

MIT License - See LICENSE file for details

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Made with ❤️ for sustainable agriculture and AI innovation**