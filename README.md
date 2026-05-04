# 🥑 Avocado Orchard Digital AI Application

## Overview

This project is a high-performance AI agent system that models avocado orchards as a digital twin, enabling real-time analysis, simulation, and decision-making.

It combines:

- Interactive digital twin visualization  
- AI-driven decision support  
- Research-based simulation models  
- GPU-accelerated computation on AMD infrastructure  

---

## Key Features

- Interactive orchard map with tree-level digital twin  
- Scenario simulation (weather, soil moisture, pest impact)  
- AI agent delivering actionable, explainable recommendations  
- Real-time updates via streaming architecture  
- Scalable design for multi-orchard environments  

---

## Architecture

- **Frontend:** Next.js (interactive UI + 3D visualization)  
- **Backend:** FastAPI (API, simulation engine, real-time streaming)  
- **AI Agents:** Knowledge-grounded + model-assisted (Qwen / Llama)  
- **ML Layer:** AMD GPU-powered inference and optional fine-tuning  

---

## AMD Integration

- Leverages AMD Developer Cloud for model inference  
- Designed for ROCm compatibility and GPU acceleration  
- Supports scalable, high-performance AI and simulation workloads  

---

## Goal

Transform agricultural data into real-time, AI-driven decisions by combining simulation, intelligence, and high-performance compute.

## SYSTEM ARCHITECTURE
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (AMD MI300X GPU)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  AI Agent Layer  │  │ Simulation Engine│  │ Model Inference  │ │
│  │  (LLM Decisions) │  │ (Physics Models) │  │ (vLLM on GPU)    │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘ │
│           │                     │                     │           │
│           └─────────────────────┼─────────────────────┘           │
│                                 │                                 │
│                    ┌────────────▼────────────┐                    │
│                    │  GPU-Accelerated       │                    │
│                    │  Compute Kernels       │                    │
│                    │  (HIP/ROCm)            │                    │
│                    │  - Particle systems    │                    │
│                    │  - Physics simulation  │                    │
│                    │  - Heatmap generation  │                    │
│                    └────────────┬────────────┘                    │
│                                 │                                 │
│                    ┌────────────▼────────────┐                    │
│                    │  Real-Time Data Stream │                    │
│                    │  (WebSocket + Kafka)   │                    │
│                    │  - Metrics updates     │                    │
│                    │  - Decision events     │                    │
│                    │  - Simulation frames   │                    │
│                    └────────────┬────────────┘                    │
│                                 │                                 │
└─────────────────────────────────┼─────────────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  WebSocket Broadcast      │
                    │  (Real-time frame data)   │
                    └─────────────┬──────────────┘
                                  │
┌─────────────────────────────────┼─────────────────────────────────┐
│                    FRONTEND (Browser GPU)                         │
├─────────────────────────────────┼─────────────────────────────────┤
│                                 │                                 │
│  ┌──────────────────────────────▼──────────────────────────────┐ │
│  │              WebGL/WebGPU Rendering Engine                 │ │
│  │  (Three.js + Custom Shaders + GPU Compute)                 │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌───────────┐ │ │
│  │  │ Tree Rendering │  │ Particle System│  │ Heatmaps  │ │ │
│  │  │ (Instancing)   │  │ (GPU Compute)  │  │ (Textures)│ │ │
│  │  └────────────────┘  └────────────────┘  └───────────┘ │ │
│  │                                                          │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌───────────┐ │ │
│  │  │ Animations     │  │ Interpolation  │  │ LOD System│ │ │
│  │  │ (Tweens)       │  │ (Smooth update)│  │ (Culling) │ │ │
│  │  └────────────────┘  └────────────────┘  └───────────┘ │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │         UI Layer (Decision Controls)                     │ │
│  │  - Apply recommendation button                           │ │
│  │  - Scenario selector                                     │ │
│  │  - Time scrubber (animation control)                     │ │
│  │  - Before/After comparison toggle                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘

## REAL-TIME METRIC-DRIVEN RENDERING
┌─────────────────────────────────────────────────────────────┐
│ Step 1: AI Agent Makes Decision                            │
│ ─────────────────────────────────────────────────────────── │
│ Input:  Current orchard metrics (temp, moisture, pests)    │
│ Process: LLM reasoning + simulation                        │
│ Output: Recommendation (e.g., "Increase irrigation")       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ Step 2: Backend Executes Recommendation                    │
│ ─────────────────────────────────────────────────────────── │
│ - Update database (action logged)                          │
│ - Trigger simulation (predict outcomes)                    │
│ - Calculate new metrics (soil moisture, yield, etc.)       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ Step 3: Broadcast Real-Time Data                           │
│ ─────────────────────────────────────────────────────────── │
│ WebSocket message:                                         │
│ {                                                          │
│   "event": "action_executed",                             │
│   "action": "irrigation_increased",                        │
│   "metrics": {                                             │
│     "soil_moisture": [72, 75, 78, ...],  // per tree      │
│     "temperature": 24.5,                                  │
│     "timestamp": 1714814400000                            │
│   },                                                       │
│   "animation": {                                           │
│     "duration": 3000,  // 3 second animation              │
│     "easing": "easeInOutQuad",                            │
│     "type": "soil_moisture_increase"                      │
│   }                                                        │
│ }                                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ Step 4: Frontend Receives & Renders                        │
│ ─────────────────────────────────────────────────────────── │
│ 1. Parse WebSocket message                                │
│ 2. Update tree color map (moisture → color gradient)      │
│ 3. Animate tree colors over 3 seconds                     │
│ 4. Update heatmap overlay                                 │
│ 5. Show notification: "Irrigation increased"              │
│ 6. Update metrics display                                 │
└─────────────────────────────────────────────────────────────┘