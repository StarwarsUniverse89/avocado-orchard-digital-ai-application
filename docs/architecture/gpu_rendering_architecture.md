# GPU-Accelerated Real-Time 3D Rendering Architecture
## Avocado Orchard Digital Twin - AMD MI300X Powered

**Core Vision:** Every AI decision and simulation result immediately visualized in real-time 3D, with physics-based animations driven by agricultural models running on GPU.

---

## SYSTEM ARCHITECTURE OVERVIEW

```
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
```

---

## 1. REAL-TIME METRIC-DRIVEN RENDERING

### 1.1 Data Flow: AI Decision → 3D Update

```
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
```

### 1.2 Metric-to-Visual Mapping

```typescript
// Backend sends raw metrics
interface MetricUpdate {
  orchard_id: string;
  timestamp: number;
  metrics: {
    soil_moisture: number[];      // per tree (0-100%)
    temperature: number;           // °C
    pest_damage: number[];        // per tree (0-100%)
    ndvi: number[];               // per tree (0-1)
    yield_prediction: number[];   // per tree (kg)
  };
}

// Frontend maps to visual properties
interface TreeVisuals {
  position: Vector3;
  scale: Vector3;
  color: Color;
  opacity: number;
  emissive: Color;
  particleEmission: number;
}

// Mapping function (GPU-accelerated)
function metricsToVisuals(metrics: MetricUpdate): TreeVisuals[] {
  return metrics.metrics.soil_moisture.map((moisture, idx) => ({
    // Size based on yield prediction
    scale: new Vector3(
      1 + (metrics.metrics.yield_prediction[idx] / 200),
      1 + (metrics.metrics.yield_prediction[idx] / 200),
      1 + (metrics.metrics.yield_prediction[idx] / 200)
    ),
    
    // Color based on health (combination of moisture + pest damage)
    color: interpolateHealthColor(
      moisture,
      metrics.metrics.pest_damage[idx],
      metrics.metrics.temperature
    ),
    
    // Opacity based on NDVI (vegetation index)
    opacity: 0.5 + (metrics.metrics.ndvi[idx] * 0.5),
    
    // Glow based on pest damage
    emissive: metrics.metrics.pest_damage[idx] > 20 
      ? new Color(0xff6b6b)  // Red glow for pest damage
      : new Color(0x000000),
    
    // Particle emission for pest visualization
    particleEmission: metrics.metrics.pest_damage[idx] / 100
  }));
}

// Health color gradient (GPU shader)
function interpolateHealthColor(moisture: number, pests: number, temp: number): Color {
  // Green (healthy) → Yellow (stress) → Red (critical)
  let healthScore = (moisture / 100) * 0.5;  // Moisture contributes 50%
  healthScore += ((100 - pests) / 100) * 0.3;  // Pest resistance 30%
  healthScore += (temp >= 18 && temp <= 25 ? 1 : 0.5) * 0.2;  // Temperature 20%
  
  if (healthScore > 0.7) return new Color(0x22c55e);  // Green
  if (healthScore > 0.5) return new Color(0xeab308);  // Yellow
  if (healthScore > 0.3) return new Color(0xf97316);  // Orange
  return new Color(0xef4444);  // Red
}
```

### 1.3 Real-Time Update Pipeline (Backend)

```python
# backend/realtime/renderer.py
from fastapi import WebSocket
import asyncio
from typing import Dict, List

class RealtimeRenderer:
    def __init__(self, db, simulation_engine, llm_agent):
        self.db = db
        self.simulation_engine = simulation_engine
        self.llm_agent = llm_agent
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def broadcast_metrics_update(self, orchard_id: str):
        """
        Fetch latest metrics and broadcast to all connected clients
        Runs every 500ms (20 FPS for smooth animation)
        """
        # Get latest metrics from database
        metrics = await self.db.get_latest_metrics(orchard_id)
        
        # Get latest decision
        latest_decision = await self.db.get_latest_decision(orchard_id)
        
        # Prepare WebSocket message
        message = {
            "event": "metrics_update",
            "orchard_id": orchard_id,
            "timestamp": time.time() * 1000,
            "metrics": {
                "soil_moisture": metrics.soil_moisture_per_tree,
                "temperature": metrics.temperature,
                "pest_damage": metrics.pest_damage_per_tree,
                "ndvi": metrics.ndvi_per_tree,
                "yield_prediction": metrics.yield_per_tree,
            },
            "latest_decision": {
                "recommendation": latest_decision.recommendation,
                "confidence": latest_decision.confidence,
                "status": latest_decision.status,
            },
            "animation": {
                "duration": 500,  # 500ms smooth transition
                "easing": "easeInOutQuad",
            }
        }
        
        # Broadcast to all connected clients
        if orchard_id in self.active_connections:
            for websocket in self.active_connections[orchard_id]:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Failed to send update: {e}")
    
    async def broadcast_decision_event(self, orchard_id: str, decision_id: str):
        """
        Broadcast when AI makes a new decision
        Includes animation instructions for visual feedback
        """
        decision = await self.db.get_decision(decision_id)
        
        # Run quick simulation to show predicted outcome
        predicted_metrics = await self.simulation_engine.simulate_action(
            orchard_id,
            decision.action,
            duration_days=7  # Show 7-day prediction
        )
        
        message = {
            "event": "decision_executed",
            "decision_id": decision_id,
            "action": decision.action,
            "confidence": decision.confidence,
            "predicted_outcome": {
                "yield_improvement": predicted_metrics.yield_delta,
                "moisture_change": predicted_metrics.moisture_delta,
                "pest_reduction": predicted_metrics.pest_delta,
            },
            "animation": {
                "type": "decision_highlight",
                "duration": 2000,
                "effect": "pulse"  // Pulse effect on affected trees
            }
        }
        
        if orchard_id in self.active_connections:
            for websocket in self.active_connections[orchard_id]:
                await websocket.send_json(message)
    
    async def start_metrics_stream(self, orchard_id: str):
        """
        Start continuous metric broadcasting (20 FPS)
        """
        while True:
            try:
                await self.broadcast_metrics_update(orchard_id)
                await asyncio.sleep(0.05)  # 20 FPS
            except Exception as e:
                logger.error(f"Metrics stream error: {e}")
                break
```

---

## 2. SIMULATION ANIMATION (PROGRESSION OVER TIME)

### 2.1 Simulation Playback Architecture

```typescript
// frontend/components/SimulationPlayer.tsx
import * as THREE from 'three';

interface SimulationFrame {
  timestamp: number;
  metrics: {
    soil_moisture: number[];
    temperature: number;
    pest_damage: number[];
    yield_prediction: number[];
  };
  weather: {
    rainfall: number;
    wind_speed: number;
  };
}

class SimulationPlayer {
  private frames: SimulationFrame[] = [];
  private currentFrameIndex: number = 0;
  private isPlaying: boolean = false;
  private playbackSpeed: number = 1.0;  // 1x = real-time, 10x = 10x speed
  private renderer: OrchardRenderer;
  
  constructor(renderer: OrchardRenderer) {
    this.renderer = renderer;
  }
  
  async loadSimulation(simulationId: string) {
    /**
     * Load pre-computed simulation frames from backend
     * Each frame represents one day of simulation
     * 30-day simulation = 30 frames
     */
    const response = await fetch(`/api/simulations/${simulationId}/frames`);
    this.frames = await response.json();
    this.currentFrameIndex = 0;
  }
  
  play() {
    this.isPlaying = true;
    this.animationLoop();
  }
  
  pause() {
    this.isPlaying = false;
  }
  
  setPlaybackSpeed(speed: number) {
    this.playbackSpeed = speed;
  }
  
  seekToFrame(frameIndex: number) {
    this.currentFrameIndex = Math.max(0, Math.min(frameIndex, this.frames.length - 1));
    this.renderFrame(this.frames[this.currentFrameIndex]);
  }
  
  private async animationLoop() {
    /**
     * Main animation loop
     * Renders each frame with smooth interpolation
     */
    const frameTime = 1000 / 30;  // 30 FPS target
    let lastTime = Date.now();
    
    const loop = async () => {
      if (!this.isPlaying) return;
      
      const now = Date.now();
      const deltaTime = now - lastTime;
      lastTime = now;
      
      // Advance frame based on playback speed
      const frameAdvance = (deltaTime / frameTime) * this.playbackSpeed;
      this.currentFrameIndex += frameAdvance;
      
      // Clamp to simulation bounds
      if (this.currentFrameIndex >= this.frames.length) {
        this.isPlaying = false;
        this.currentFrameIndex = this.frames.length - 1;
        return;
      }
      
      // Interpolate between frames for smooth animation
      const frameFloor = Math.floor(this.currentFrameIndex);
      const frameCeil = Math.min(frameFloor + 1, this.frames.length - 1);
      const interpolation = this.currentFrameIndex - frameFloor;
      
      const currentFrame = this.frames[frameFloor];
      const nextFrame = this.frames[frameCeil];
      
      const interpolatedFrame = this.interpolateFrames(
        currentFrame,
        nextFrame,
        interpolation
      );
      
      // Render with GPU acceleration
      await this.renderer.renderFrame(interpolatedFrame);
      
      // Update UI (day counter, metrics display)
      this.updateUI(frameFloor + 1, this.frames.length);
      
      requestAnimationFrame(loop);
    };
    
    loop();
  }
  
  private interpolateFrames(
    frame1: SimulationFrame,
    frame2: SimulationFrame,
    t: number
  ): SimulationFrame {
    /**
     * Smooth interpolation between simulation frames
     * Uses easing function for natural motion
     */
    const easeInOutQuad = (x: number) => {
      return x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x;
    };
    
    const easedT = easeInOutQuad(t);
    
    return {
      timestamp: frame1.timestamp + (frame2.timestamp - frame1.timestamp) * easedT,
      metrics: {
        soil_moisture: frame1.metrics.soil_moisture.map((v, i) =>
          v + (frame2.metrics.soil_moisture[i] - v) * easedT
        ),
        temperature: frame1.metrics.temperature +
          (frame2.metrics.temperature - frame1.metrics.temperature) * easedT,
        pest_damage: frame1.metrics.pest_damage.map((v, i) =>
          v + (frame2.metrics.pest_damage[i] - v) * easedT
        ),
        yield_prediction: frame1.metrics.yield_prediction.map((v, i) =>
          v + (frame2.metrics.yield_prediction[i] - v) * easedT
        ),
      },
      weather: {
        rainfall: frame1.weather.rainfall +
          (frame2.weather.rainfall - frame1.weather.rainfall) * easedT,
        wind_speed: frame1.weather.wind_speed +
          (frame2.weather.wind_speed - frame1.weather.wind_speed) * easedT,
      }
    };
  }
  
  private updateUI(currentDay: number, totalDays: number) {
    // Update day counter, progress bar, metrics display
    document.getElementById('day-counter').textContent = 
      `Day ${currentDay} / ${totalDays}`;
    
    document.getElementById('progress-bar').style.width = 
      `${(currentDay / totalDays) * 100}%`;
  }
}
```

### 2.2 Backend Simulation Frame Generation

```python
# backend/simulation/frame_generator.py
import numpy as np
from typing import List

class SimulationFrameGenerator:
    def __init__(self, simulation_engine, gpu_compute):
        self.simulation_engine = simulation_engine
        self.gpu_compute = gpu_compute
    
    async def generate_simulation_frames(
        self,
        orchard_id: str,
        scenario: ScenarioParams,
        duration_days: int = 30
    ) -> List[SimulationFrame]:
        """
        Generate frame-by-frame simulation data
        Each frame represents one day
        GPU-accelerated computation for 1000s of trees
        """
        
        # Initialize orchard state
        orchard_state = await self.get_orchard_state(orchard_id)
        
        frames = []
        current_state = orchard_state.copy()
        
        for day in range(duration_days):
            # Get weather for this day
            weather = scenario.get_weather_for_day(day)
            
            # Run one day of simulation (GPU-accelerated)
            next_state = await self.gpu_compute.simulate_day(
                current_state=current_state,
                weather=weather,
                num_trees=orchard_state.num_trees
            )
            
            # Extract metrics for this frame
            frame = SimulationFrame(
                timestamp=orchard_state.start_date + timedelta(days=day),
                metrics={
                    'soil_moisture': next_state.soil_moisture_per_tree,  # GPU output
                    'temperature': weather.temperature,
                    'pest_damage': next_state.pest_damage_per_tree,  # GPU output
                    'yield_prediction': next_state.yield_per_tree,  # GPU output
                },
                weather={
                    'rainfall': weather.rainfall,
                    'wind_speed': weather.wind_speed,
                }
            )
            
            frames.append(frame)
            current_state = next_state
        
        return frames
    
    async def get_orchard_state(self, orchard_id: str):
        """Get current orchard state from database"""
        return await self.db.get_orchard_state(orchard_id)
```

### 2.3 GPU Compute Kernel (HIP/ROCm)

```cpp
// backend/gpu_kernels/simulate_day.hip
// Simulates one day for all trees in parallel on GPU

#include <hip/hip_runtime.h>
#include <math.h>

__global__ void simulate_day_kernel(
    float* soil_moisture,      // Input/Output: per-tree moisture (0-100)
    float* pest_damage,        // Input/Output: per-tree pest damage (0-100)
    float* yield_prediction,   // Input/Output: per-tree yield (kg)
    float temperature,         // Input: ambient temperature
    float rainfall,            // Input: daily rainfall (mm)
    int num_trees
) {
    int tree_id = blockIdx.x * blockDim.x + threadIdx.x;
    
    if (tree_id >= num_trees) return;
    
    // Current state
    float moisture = soil_moisture[tree_id];
    float pests = pest_damage[tree_id];
    float yield_val = yield_prediction[tree_id];
    
    // ===== MOISTURE DYNAMICS =====
    // Evapotranspiration (increases with temperature)
    float et_rate = 2.0f + (temperature - 20.0f) * 0.1f;  // mm/day
    
    // Rainfall increases moisture
    float moisture_change = rainfall - et_rate;
    moisture = fminf(100.0f, fmaxf(0.0f, moisture + moisture_change));
    
    // ===== PEST DYNAMICS =====
    // Pest growth rate depends on temperature (optimal: 25°C)
    float pest_growth_rate = 0.05f * expf(-powf((temperature - 25.0f) / 5.0f, 2.0f));
    
    // Pest damage increases with moisture (optimal: 70%)
    float moisture_factor = 1.0f - powf((moisture - 70.0f) / 30.0f, 2.0f);
    moisture_factor = fmaxf(0.0f, moisture_factor);
    
    // Update pest damage
    pests = pests * (1.0f + pest_growth_rate * moisture_factor);
    pests = fminf(100.0f, pests);
    
    // ===== YIELD DYNAMICS =====
    // Yield decreases with pest damage (threshold: 17%)
    float pest_impact = pests > 17.0f ? (pests - 17.0f) * 0.5f : 0.0f;
    
    // Yield decreases with moisture stress
    float moisture_stress = 0.0f;
    if (moisture < 30.0f) {
        moisture_stress = (30.0f - moisture) * 0.5f;  // Dry stress
    } else if (moisture > 85.0f) {
        moisture_stress = (moisture - 85.0f) * 0.3f;  // Wet stress
    }
    
    // Temperature stress (optimal: 18-25°C)
    float temp_stress = 0.0f;
    if (temperature < 15.0f || temperature > 30.0f) {
        temp_stress = 5.0f;
    } else if (temperature < 18.0f || temperature > 25.0f) {
        temp_stress = 2.0f;
    }
    
    // Apply stresses to yield
    float total_stress = pest_impact + moisture_stress + temp_stress;
    yield_val = yield_val * (1.0f - total_stress / 100.0f);
    yield_val = fmaxf(0.0f, yield_val);
    
    // Write back results
    soil_moisture[tree_id] = moisture;
    pest_damage[tree_id] = pests;
    yield_prediction[tree_id] = yield_val;
}

// Wrapper function
extern "C" void simulate_day(
    float* d_soil_moisture,
    float* d_pest_damage,
    float* d_yield_prediction,
    float temperature,
    float rainfall,
    int num_trees
) {
    int block_size = 256;
    int grid_size = (num_trees + block_size - 1) / block_size;
    
    hipLaunchKernelGGL(
        simulate_day_kernel,
        dim3(grid_size),
        dim3(block_size),
        0, 0,
        d_soil_moisture,
        d_pest_damage,
        d_yield_prediction,
        temperature,
        rainfall,
        num_trees
    );
    
    hipDeviceSynchronize();
}
```

---

## 3. BEFORE/AFTER COMPARISON VIEW

### 3.1 Split-Screen Comparison

```typescript
// frontend/components/ComparisonView.tsx

interface ComparisonScenario {
  baseline: SimulationFrame[];  // Current trajectory
  intervention: SimulationFrame[];  // With AI recommendation
}

class ComparisonView {
  private baselineRenderer: OrchardRenderer;
  private interventionRenderer: OrchardRenderer;
  private syncedPlayback: boolean = true;
  
  constructor(container: HTMLElement) {
    // Create split-screen layout
    const leftContainer = document.createElement('div');
    const rightContainer = document.createElement('div');
    
    leftContainer.style.width = '50%';
    rightContainer.style.width = '50%';
    
    container.appendChild(leftContainer);
    container.appendChild(rightContainer);
    
    // Initialize renderers
    this.baselineRenderer = new OrchardRenderer(leftContainer);
    this.interventionRenderer = new OrchardRenderer(rightContainer);
  }
  
  async loadComparison(
    orchardId: string,
    recommendedAction: string
  ) {
    /**
     * Load two simulations:
     * 1. Baseline: No action (business as usual)
     * 2. Intervention: Apply recommended action
     */
    
    // Baseline simulation (no action)
    const baselineFrames = await fetch(
      `/api/simulations?orchard_id=${orchardId}&scenario=baseline`
    ).then(r => r.json());
    
    // Intervention simulation (with action)
    const interventionFrames = await fetch(
      `/api/simulations?orchard_id=${orchardId}&scenario=intervention&action=${recommendedAction}`
    ).then(r => r.json());
    
    // Render both
    this.baselineRenderer.loadFrames(baselineFrames);
    this.interventionRenderer.loadFrames(interventionFrames);
    
    // Add labels
    this.addLabel(this.baselineRenderer, 'Current Path (No Action)');
    this.addLabel(this.interventionRenderer, `With: ${recommendedAction}`);
    
    // Sync playback
    this.syncPlayback(this.baselineRenderer, this.interventionRenderer);
  }
  
  private syncPlayback(
    renderer1: OrchardRenderer,
    renderer2: OrchardRenderer
  ) {
    /**
     * Keep both renderers in sync during playback
     */
    renderer1.onFrameChange((frameIndex) => {
      renderer2.seekToFrame(frameIndex);
    });
  }
  
  private addLabel(renderer: OrchardRenderer, label: string) {
    const labelElement = document.createElement('div');
    labelElement.textContent = label;
    labelElement.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-weight: bold;
    `;
    renderer.container.appendChild(labelElement);
  }
  
  async generateComparison(
    orchardId: string,
    action: string
  ): Promise<ComparisonMetrics> {
    /**
     * Generate comparison metrics (deltas)
     */
    const baseline = await this.getSimulation(orchardId, 'baseline');
    const intervention = await this.getSimulation(orchardId, 'intervention', action);
    
    const finalBaseline = baseline[baseline.length - 1];
    const finalIntervention = intervention[intervention.length - 1];
    
    return {
      yield_improvement: this.calculateDelta(
        finalIntervention.metrics.yield_prediction,
        finalBaseline.metrics.yield_prediction
      ),
      moisture_improvement: this.calculateDelta(
        finalIntervention.metrics.soil_moisture,
        finalBaseline.metrics.soil_moisture
      ),
      pest_reduction: this.calculateDelta(
        finalBaseline.metrics.pest_damage,  // Note: reversed (lower is better)
        finalIntervention.metrics.pest_damage
      ),
      economic_impact: this.calculateEconomicImpact(
        finalIntervention,
        finalBaseline
      ),
    };
  }
  
  private calculateDelta(intervention: number[], baseline: number[]): number {
    const avgIntervention = intervention.reduce((a, b) => a + b) / intervention.length;
    const avgBaseline = baseline.reduce((a, b) => a + b) / baseline.length;
    return ((avgIntervention - avgBaseline) / avgBaseline) * 100;
  }
  
  private calculateEconomicImpact(
    intervention: SimulationFrame,
    baseline: SimulationFrame
  ): EconomicImpact {
    const yieldDelta = this.calculateDelta(
      intervention.metrics.yield_prediction,
      baseline.metrics.yield_prediction
    );
    
    const pricePerKg = 2.8;  // Market price
    const treesPerHectare = 150;
    
    const yieldImprovement = yieldDelta * treesPerHectare * pricePerKg / 100;
    
    return {
      revenue_increase: yieldImprovement,
      cost_of_action: 50,  // Estimated cost of intervention
      net_benefit: yieldImprovement - 50,
      roi_percent: ((yieldImprovement - 50) / 50) * 100,
    };
  }
}
```

---

## 4. GPU-ACCELERATED PARTICLE SYSTEMS

### 4.1 Pest Population Visualization

```glsl
// frontend/shaders/pest_particles.glsl

// Vertex Shader
#version 300 es
precision highp float;

in vec3 position;
in vec3 velocity;
in float age;
in float pest_density;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform float time;

out vec4 vColor;
out float vAlpha;

void main() {
    // Update position based on velocity and time
    vec3 newPosition = position + velocity * time;
    
    // Oscillate around tree position (swarm behavior)
    newPosition += vec3(
        sin(time * 2.0 + position.x) * 0.5,
        cos(time * 1.5 + position.y) * 0.3,
        sin(time * 1.8 + position.z) * 0.5
    );
    
    // Color based on pest density (red = high damage)
    float intensity = pest_density / 100.0;
    vColor = vec4(
        1.0,                    // Red channel
        0.2 * (1.0 - intensity),  // Green channel (decreases with pests)
        0.2 * (1.0 - intensity),  // Blue channel
        1.0
    );
    
    // Fade out particles over time
    vAlpha = 1.0 - (age / 100.0);
    
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(newPosition, 1.0);
    gl_PointSize = 3.0 + intensity * 5.0;  // Size based on pest density
}

// Fragment Shader
#version 300 es
precision highp float;

in vec4 vColor;
in float vAlpha;

out vec4 fragColor;

void main() {
    // Soft particle (circular)
    vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
    float r = dot(circCoord, circCoord);
    
    if (r > 1.0) discard;
    
    fragColor = vec4(vColor.rgb, vAlpha * (1.0 - r));
}
```

### 4.2 GPU Compute Shader (WebGPU)

```wgsl
// frontend/shaders/pest_compute.wgsl

struct Particle {
    position: vec3f,
    velocity: vec3f,
    age: f32,
    pest_density: f32,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: vec4f;  // time, dt, num_particles, pest_intensity

@compute @workgroup_size(256)
fn update_particles(@builtin(global_invocation_id) global_id: vec3u) {
    let idx = global_id.x;
    
    if (idx >= u32(params.z)) {
        return;
    }
    
    var p = particles[idx];
    
    // Update position
    p.position += p.velocity * params.y;  // dt
    
    // Swarm behavior (particles attracted to tree center)
    let tree_center = vec3f(0.0);
    let to_center = tree_center - p.position;
    let distance = length(to_center);
    
    if (distance > 0.1) {
        p.velocity += normalize(to_center) * 0.01;
    }
    
    // Random walk component
    let random_offset = vec3f(
        sin(params.x * 0.1 + f32(idx)) * 0.1,
        cos(params.x * 0.15 + f32(idx)) * 0.1,
        sin(params.x * 0.12 + f32(idx)) * 0.1
    );
    p.velocity += random_offset;
    
    // Damping
    p.velocity *= 0.95;
    
    // Age particles
    p.age += params.y;
    
    // Respawn old particles
    if (p.age > 100.0) {
        p.position = vec3f(
            sin(params.x * 0.1 + f32(idx)) * 2.0,
            cos(params.x * 0.15 + f32(idx)) * 2.0,
            sin(params.x * 0.12 + f32(idx)) * 2.0
        );
        p.age = 0.0;
        p.velocity = vec3f(0.0);
    }
    
    particles[idx] = p;
}
```

---

## 5. DIRECT MODEL-TO-VISUAL MAPPING

### 5.1 Unified Data Flow

```typescript
// frontend/systems/ModelVisualMapper.ts

/**
 * Direct mapping from agricultural models to visual properties
 * Every visual change is driven by model outputs
 */

class ModelVisualMapper {
  private treeModels: TreeModel[] = [];
  private heatmaps: HeatmapLayer[] = [];
  private particleSystems: ParticleSystem[] = [];
  
  mapMetricsToVisuals(metrics: OrchardMetrics) {
    /**
     * Temperature Model → Color Intensity
     */
    this.mapTemperature(metrics.temperature);
    
    /**
     * Soil Moisture Model → Tree Scale & Opacity
     */
    this.mapSoilMoisture(metrics.soil_moisture_per_tree);
    
    /**
     * Pest Damage Model → Particle Emission & Color
     */
    this.mapPestDamage(metrics.pest_damage_per_tree);
    
    /**
     * Yield Prediction Model → Tree Size & Fruit Indicators
     */
    this.mapYieldPrediction(metrics.yield_prediction_per_tree);
    
    /**
     * NDVI Model → Vegetation Density & Opacity
     */
    this.mapNDVI(metrics.ndvi_per_tree);
  }
  
  private mapTemperature(temperature: number) {
    /**
     * Temperature → Overall scene lighting & heatmap
     */
    
    // Create temperature heatmap
    const heatmapTexture = this.generateHeatmapTexture(
      temperature,
      18,    // Min optimal
      25,    // Max optimal
      35     // Critical
    );
    
    // Apply to scene
    this.heatmaps[0].setTexture(heatmapTexture);
    
    // Adjust lighting
    const lightIntensity = temperature > 30 ? 1.2 : 1.0;
    this.scene.lights[0].intensity = lightIntensity;
  }
  
  private mapSoilMoisture(moisturePerTree: number[]) {
    /**
     * Soil Moisture → Tree Scale & Wilting Effect
     * 
     * Model: Optimal moisture = 70%
     * Visual: Scale 1.0 at optimal, 0.7 at critical dry, 0.9 at wet
     */
    
    moisturePerTree.forEach((moisture, treeIdx) => {
      const tree = this.treeModels[treeIdx];
      
      // Calculate stress factor
      let stressFactor = 1.0;
      if (moisture < 30) {
        stressFactor = 0.7 + (moisture / 30) * 0.3;  // Wilting
      } else if (moisture > 85) {
        stressFactor = 0.9 + ((moisture - 85) / 15) * 0.1;  // Waterlogged
      } else {
        stressFactor = 1.0;  // Healthy
      }
      
      // Apply scale
      tree.scale.multiplyScalar(stressFactor);
      
      // Wilting animation (drooping leaves)
      if (moisture < 30) {
        tree.rotation.z += (30 - moisture) * 0.001;
      }
      
      // Update heatmap
      this.updateMoistureHeatmap(treeIdx, moisture);
    });
  }
  
  private mapPestDamage(pestDamagePerTree: number[]) {
    /**
     * Pest Damage → Particle Emission & Color
     * 
     * Model: Economic Injury Level = 17%
     * Visual: No particles < 17%, intense swarms > 35%
     */
    
    pestDamagePerTree.forEach((damage, treeIdx) => {
      const tree = this.treeModels[treeIdx];
      const particles = this.particleSystems[treeIdx];
      
      // Particle emission rate
      const emissionRate = Math.max(0, (damage - 17) / 83) * 100;  // 0-100 particles/sec
      particles.setEmissionRate(emissionRate);
      
      // Color intensity (red for damage)
      const damageColor = new THREE.Color(
        1.0,                    // Red
        1.0 - (damage / 100),   // Green decreases
        1.0 - (damage / 100)    // Blue decreases
      );
      tree.material.color = damageColor;
      
      // Add glow effect for high damage
      if (damage > 50) {
        tree.material.emissive = new THREE.Color(0xff0000);
        tree.material.emissiveIntensity = (damage - 50) / 50;
      }
    });
  }
  
  private mapYieldPrediction(yieldPerTree: number[]) {
    /**
     * Yield Prediction → Tree Size & Fruit Indicators
     * 
     * Model: Base yield = 130 kg/tree
     * Visual: Scale 0.8-1.2 based on yield
     */
    
    yieldPerTree.forEach((yield_val, treeIdx) => {
      const tree = this.treeModels[treeIdx];
      
      // Scale based on yield (130 kg = 1.0 scale)
      const yieldScale = 0.8 + (yield_val / 130) * 0.4;
      tree.scale.multiplyScalar(yieldScale);
      
      // Fruit indicators (spheres around tree)
      const fruitCount = Math.floor((yield_val / 130) * 50);  // 0-50 fruits
      this.updateFruitIndicators(treeIdx, fruitCount);
    });
  }
  
  private mapNDVI(ndviPerTree: number[]) {
    /**
     * NDVI (Vegetation Index) → Opacity & Green Intensity
     * 
     * Model: NDVI 0-1 (0 = no vegetation, 1 = dense)
     * Visual: Opacity 0.3-1.0, green intensity 0.2-1.0
     */
    
    ndviPerTree.forEach((ndvi, treeIdx) => {
      const tree = this.treeModels[treeIdx];
      
      // Opacity based on vegetation density
      tree.material.opacity = 0.3 + ndvi * 0.7;
      
      // Green color intensity
      const greenIntensity = ndvi;
      tree.material.color.multiplyScalar(greenIntensity);
    });
  }
}
```

---

## 6. PERFORMANCE OPTIMIZATION FOR REAL-TIME RENDERING

### 6.1 GPU Memory Management

```typescript
// frontend/systems/GPUMemoryManager.ts

class GPUMemoryManager {
  private maxTrees: number = 10000;
  private treeBuffers: GPUBuffer[] = [];
  private particleBuffers: GPUBuffer[] = [];
  
  async allocateTreeBuffers(device: GPUDevice, numTrees: number) {
    /**
     * Pre-allocate GPU buffers for tree data
     * Reduces allocation overhead during real-time updates
     */
    
    // Tree position buffer (3 floats per tree)
    this.treeBuffers[0] = device.createBuffer({
      size: numTrees * 3 * 4,  // 3 floats * 4 bytes
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    
    // Tree color buffer (4 floats per tree: RGBA)
    this.treeBuffers[1] = device.createBuffer({
      size: numTrees * 4 * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    
    // Tree scale buffer (3 floats per tree: XYZ)
    this.treeBuffers[2] = device.createBuffer({
      size: numTrees * 3 * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
  }
  
  async updateTreeData(
    device: GPUDevice,
    queue: GPUQueue,
    metrics: OrchardMetrics
  ) {
    /**
     * Efficient GPU memory update
     * Uses staging buffers to avoid blocking
     */
    
    const numTrees = metrics.soil_moisture_per_tree.length;
    
    // Prepare data on CPU
    const colorData = new Float32Array(numTrees * 4);
    const scaleData = new Float32Array(numTrees * 3);
    
    for (let i = 0; i < numTrees; i++) {
      // Calculate color from metrics
      const health = this.calculateHealth(
        metrics.soil_moisture_per_tree[i],
        metrics.pest_damage_per_tree[i],
        metrics.temperature
      );
      
      const color = this.healthToColor(health);
      colorData[i * 4] = color.r;
      colorData[i * 4 + 1] = color.g;
      colorData[i * 4 + 2] = color.b;
      colorData[i * 4 + 3] = 1.0;
      
      // Calculate scale from yield
      const scale = 0.8 + (metrics.yield_prediction_per_tree[i] / 130) * 0.4;
      scaleData[i * 3] = scale;
      scaleData[i * 3 + 1] = scale;
      scaleData[i * 3 + 2] = scale;
    }
    
    // Copy to GPU
    queue.writeBuffer(this.treeBuffers[1], 0, colorData);
    queue.writeBuffer(this.treeBuffers[2], 0, scaleData);
  }
}
```

### 6.2 Instancing & LOD (Level of Detail)

```typescript
// frontend/rendering/TreeRenderer.ts

class TreeRenderer {
  private instancedMesh: THREE.InstancedMesh;
  private lodLevels: THREE.Mesh[] = [];  // Different detail levels
  
  constructor(scene: THREE.Scene, numTrees: number) {
    // Create base tree geometry (high detail)
    const geometry = this.createTreeGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x22c55e });
    
    // Create instanced mesh (renders all trees efficiently)
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, numTrees);
    scene.add(this.instancedMesh);
    
    // Create LOD versions
    this.lodLevels[0] = this.createTreeGeometry(0.8);  // 80% detail
    this.lodLevels[1] = this.createTreeGeometry(0.5);  // 50% detail
    this.lodLevels[2] = this.createTreeGeometry(0.2);  // 20% detail (far away)
  }
  
  updateInstanceData(
    treeIdx: number,
    position: THREE.Vector3,
    scale: number,
    color: THREE.Color
  ) {
    /**
     * Update single tree instance
     * Efficient: only updates changed data
     */
    
    // Update position & scale
    const matrix = new THREE.Matrix4();
    matrix.compose(position, new THREE.Quaternion(), new THREE.Vector3(scale, scale, scale));
    this.instancedMesh.setMatrixAt(treeIdx, matrix);
    
    // Update color
    this.instancedMesh.setColorAt(treeIdx, color);
    
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    this.instancedMesh.instanceColor.needsUpdate = true;
  }
  
  updateLOD(camera: THREE.Camera) {
    /**
     * Update LOD based on camera distance
     * Reduces draw calls for distant trees
     */
    
    const cameraPos = camera.position;
    
    for (let i = 0; i < this.instancedMesh.count; i++) {
      const treePos = new THREE.Vector3();
      this.instancedMesh.getMatrixAt(i, new THREE.Matrix4()).decompose(
        treePos,
        new THREE.Quaternion(),
        new THREE.Vector3()
      );
      
      const distance = cameraPos.distanceTo(treePos);
      
      // Select LOD level based on distance
      let lodLevel = 0;
      if (distance > 50) lodLevel = 2;
      else if (distance > 25) lodLevel = 1;
      
      // Update geometry if LOD changed
      // (Implementation depends on LOD system)
    }
  }
}
```

---

## 7. IMPLEMENTATION TIMELINE (REVISED)

### Phase 3 : Frontend & 3D Rendering

**Week 9:** Next.js setup + component structure + API client  
**Week 10:** Mapbox integration + orchard map  
**Week 11:** Three.js 3D digital twin + real-time metric mapping  
**Week 12:** WebSocket integration + simulation player + comparison view

### Phase 2 : GPU Optimization (REVISED)

**Week 5:** ROCm setup + GPU compute kernels (simulation)  
**Week 6:** Batch processing + particle systems (HIP/ROCm)  
**Week 7:** Kubernetes + GPU deployment  
**Week 8:** Performance monitoring + benchmarking

---

## 8. DEMO STRATEGY FOR AMD DEVELOPER COMPETITION

### Real-Time Decision-Making Demo

```
1. Show current orchard state (3D visualization)
   - Trees color-coded by health
   - Metrics overlay (temperature, moisture, pests)
   
2. AI agent analyzes and makes decision
   - "Increase irrigation by 20%"
   - Show reasoning in UI
   
3. Real-time 3D update
   - Soil moisture heatmap changes
   - Tree colors transition (stressed → healthy)
   - Particle systems reduce (fewer pests)
   - Yield indicators increase
   - All within 2-3 seconds
   
4. Show 30-day simulation
   - Play animation of predicted outcomes
   - Compare baseline vs. intervention (split screen)
   - Display economic impact
   
5. Highlight GPU performance
   - Show MI300X utilization (>80%)
   - Inference latency (<500ms)
   - Throughput (100+ decisions/sec)
   - Power efficiency metrics
```

---

## CONCLUSION

This architecture delivers:

✅ **Real-time 3D visualization** driven by AI decisions  
✅ **GPU-accelerated physics** for accurate simulations  
✅ **Smooth animations** with 60 FPS target  
✅ **Scalable to 1000s of orchards** via instancing & LOD  
✅ **Direct model-to-visual mapping** (every visual change = model output)  
✅ **Before/after comparison** for decision validation  
✅ **AMD MI300X optimized** (HIP kernels, ROCm, vLLM)  

**Key Differentiator:** The 3D visualization is not decorative—it's the primary interface for understanding AI decisions and their predicted outcomes.
