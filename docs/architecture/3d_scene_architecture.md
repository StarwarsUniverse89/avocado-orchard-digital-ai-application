# 3D Orchard Digital Twin Architecture

## Overview
Enterprise AI command center with cinematic satellite-to-3D digital twin experience using React Three Fiber, Three.js, Drei, and GSAP.

## Technology Stack

### Core 3D Libraries
- **React Three Fiber**: React renderer for Three.js
- **Three.js**: 3D graphics library
- **@react-three/drei**: Helper components (OrbitControls, Camera, etc.)
- **GSAP**: Animation library for smooth transitions

### UI Framework
- **Next.js 16**: React framework with App Router
- **Tailwind CSS**: Utility-first styling for enterprise UI
- **TypeScript**: Type safety

## Architecture Layers

### 1. Scene Container Layer
**Component**: `OrchardScene3D.tsx`
- Canvas setup with React Three Fiber
- Camera configuration (perspective, position, FOV)
- Renderer settings (shadows, tone mapping, color management)
- Responsive sizing and pixel ratio

### 2. Lighting System
**Component**: `SceneLighting.tsx`
- Ambient light for base illumination
- Directional light for sun simulation with shadows
- Hemisphere light for sky/ground color gradient
- Optional spotlight for dramatic effects

### 3. Environment Layer
**Component**: `OrchardEnvironment.tsx`
- Ground plane with texture (grass/soil)
- Sky gradient or skybox
- Fog for depth perception
- Grid helper (optional, for debugging)

### 4. Orchard Grid System
**Component**: `OrchardGrid.tsx`
- Procedural tree placement in rows
- Realistic spacing (5-7m between trees, 6-8m between rows)
- Section-based organization (A1, A2, B1, B2, etc.)
- Dynamic tree generation based on backend data

### 5. Tree Components (Procedural)

#### Tree Structure
**Component**: `AvocadoTree.tsx`
- **Trunk**: Cylinder geometry with brown material
- **Canopy**: Sphere or custom geometry with green material
- **Fruits**: Small sphere instances positioned on canopy
- Health-based color variations
- LOD (Level of Detail) for performance

#### Tree States
```typescript
interface TreeState {
  health_status: 'healthy' | 'warning' | 'risk';
  fruit_stage: 'small' | 'medium' | 'large';
  canopy_size: number; // 0.5 - 1.0
  moisture_level: number; // 0 - 100
  pest_infestation: boolean;
}
```

### 6. Camera System
**Component**: `CameraController.tsx`
- OrbitControls from Drei for user interaction
- GSAP-animated camera transitions
- Predefined camera positions:
  - Satellite view (high altitude, top-down)
  - Section view (medium altitude, angled)
  - Tree view (close-up, ground level)

### 7. Animation System (GSAP)
**Hook**: `useOrchardAnimations.ts`

#### Transition Types
1. **Satellite-to-3D Zoom**
   - Camera position interpolation
   - FOV animation
   - Target focus change
   - Duration: 2-3 seconds

2. **Visual Actions**
   - Moisture recovery: Blue wave effect
   - Pest treatment: Particle system
   - Pruning: Canopy size reduction
   - Fertilization: Green glow effect

3. **State Changes**
   - Health color transitions
   - Fruit size morphing
   - Canopy expansion/contraction

### 8. Interaction Layer
**Component**: `TreeInteraction.tsx`
- Raycasting for tree selection
- Hover effects (outline, glow)
- Click handlers for tree details
- Section highlighting

### 9. Overlay UI Layer
**Components**: 
- `MetricsOverlay.tsx`: HUD-style metrics around 3D scene
- `TreeInfoPanel.tsx`: Selected tree details
- `SectionLabel.tsx`: 3D text labels for sections

## Data Flow

### Backend → Frontend
```typescript
interface OrchardState {
  sections: Section[];
  trees: TreeData[];
  simulation_result?: {
    health_status: string;
    fruit_stage: string;
    canopy_size: number;
    yield_prediction: number;
    profit_prediction: number;
    visual_action?: {
      type: string;
      target_section: string;
      duration: number;
    };
  };
}
```

### State Management
- React Context for global orchard state
- Local state for 3D scene interactions
- GSAP timeline refs for animation control

## Performance Optimization

### Techniques
1. **Instancing**: Use InstancedMesh for fruits (hundreds per tree)
2. **LOD**: Reduce geometry detail for distant trees
3. **Frustum Culling**: Automatic with Three.js
4. **Texture Optimization**: Compressed textures, mipmaps
5. **Shadow Optimization**: Limited shadow-casting objects
6. **Lazy Loading**: Load tree models on-demand

### Target Performance
- 60 FPS on desktop (1000+ trees)
- 30 FPS on mobile (500+ trees)
- Smooth GSAP transitions (no jank)

## Stage 1 Implementation (Current)

### Components to Build
1. ✅ Install dependencies
2. 🔄 `OrchardScene3D.tsx` - Main 3D canvas
3. 🔄 `AvocadoTree.tsx` - Procedural tree component
4. 🔄 `OrchardGrid.tsx` - Tree layout system
5. 🔄 `SceneLighting.tsx` - Lighting setup
6. 🔄 `OrchardEnvironment.tsx` - Ground and sky
7. 🔄 `CameraController.tsx` - Camera with OrbitControls

### Features
- Simple procedural trees (cylinder trunk, sphere canopy, sphere fruits)
- Realistic orchard spacing
- Basic lighting with shadows
- Camera controls
- Ground plane with texture
- Health-based coloring

## Stage 2 Implementation (Next)

### Enhanced Realism
- Canopy variation (noise-based deformation)
- Fruit clusters (instanced positioning)
- Stress visual effects (color gradients, particles)
- Moisture heatmap overlay (shader-based)
- GSAP visual_action animations

## Stage 3 Implementation (Future)

### Advanced Features
- GLB/GLTF tree model support
- Realistic tree textures
- Wind animation (vertex shader)
- Seasonal variations
- Weather effects (rain, sun rays)

## AMD Cloud Integration Points

### 1. AI Inference Pipeline
```
Frontend → Backend API → AMD Cloud (Qwen/Llama)
                      ↓
                  Recommendation + visual_action
                      ↓
                  Frontend (GSAP animation)
```

### 2. Vision Model Integration
```
Image Upload → Backend → AMD Cloud (Vision Model)
                      ↓
                  Tree health classification
                      ↓
                  3D scene state update
```

### 3. Simulation Data
```
Simulation Request → Backend → AMD Cloud (Compute)
                             ↓
                         Orchard state prediction
                             ↓
                         3D scene rendering
```

### 4. Future: 3D Asset Generation
- AMD Cloud GPU-accelerated model inference
- Procedural tree generation with ML
- Texture synthesis
- LOD generation

## File Structure

```
frontend/
├── components/
│   ├── 3d/
│   │   ├── OrchardScene3D.tsx          # Main 3D canvas
│   │   ├── AvocadoTree.tsx             # Tree component
│   │   ├── OrchardGrid.tsx             # Grid layout
│   │   ├── SceneLighting.tsx           # Lights
│   │   ├── OrchardEnvironment.tsx      # Ground/sky
│   │   ├── CameraController.tsx        # Camera system
│   │   ├── TreeInteraction.tsx         # Raycasting/selection
│   │   └── effects/
│   │       ├── MoistureOverlay.tsx     # Heatmap shader
│   │       ├── PestEffect.tsx          # Particle system
│   │       └── StressIndicator.tsx     # Visual stress
│   ├── SatelliteOrchardView.tsx        # Satellite view
│   └── ui/
│       ├── MetricsOverlay.tsx          # HUD metrics
│       └── TreeInfoPanel.tsx           # Tree details
├── hooks/
│   ├── useOrchardAnimations.ts         # GSAP animations
│   ├── useOrchardState.ts              # State management
│   └── useTreeSelection.ts             # Selection logic
├── lib/
│   ├── three/
│   │   ├── materials.ts                # Custom materials
│   │   ├── geometries.ts               # Custom geometries
│   │   └── shaders.ts                  # Custom shaders
│   └── api.ts                          # Backend API client
└── types/
    └── orchard.ts                      # TypeScript types
```

## Next Steps

1. Create base 3D scene with React Three Fiber
2. Build procedural tree component
3. Implement orchard grid layout
4. Add lighting and shadows
5. Setup camera controls
6. Create ground plane
7. Integrate with existing satellite view
8. Add GSAP transitions

---

**Status**: Stage 1 in progress
**Last Updated**: 2026-05-05
**Author**: Bob (AI Software Engineer)