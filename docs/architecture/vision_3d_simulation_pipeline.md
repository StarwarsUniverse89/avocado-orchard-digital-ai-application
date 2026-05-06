# Vision/3D/Simulation Pipeline Architecture

## Overview

This document describes the vision, 3D analysis, and simulation pipeline designed for AMD MI300X GPU acceleration. The current implementation uses deterministic stub models that will be replaced with GPU-accelerated deep learning models in production.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js/React)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 3D Twin View │  │ Globe View   │  │ Analytics    │      │
│  │ (Three.js)   │  │ (Cesium)     │  │ Panel        │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    visual_3d_parameters                      │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Backend API   │
                    │  (FastAPI)      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│ Vision/3D      │  │ Orchard         │  │ Satellite      │
│ Analysis       │  │ Service         │  │ Service        │
│ Service        │  │                 │  │                │
└───────┬────────┘  └─────────────────┘  └────────────────┘
        │
        │
┌───────▼──────────────────────────────────────────────────┐
│           ML Inference Layer (ml/inference/)              │
│  ┌──────────────────────────────────────────────────┐    │
│  │         vision_3d_analysis_stub.py               │    │
│  │  (Deterministic - Current Implementation)        │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │      Future: AMD MI300X GPU Models               │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │    │
│  │  │ Canopy CNN │  │ Fruit YOLO │  │ Health CNN │ │    │
│  │  └────────────┘  └────────────┘  └────────────┘ │    │
│  └──────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────┘
```

## Pipeline Components

### 1. Canopy Volume Estimation

**Current:** Deterministic stub based on NDVI and stress level
**Future:** CNN-based point cloud analysis on AMD MI300X

```python
# Stub output
{
  "canopy_volume_m3": 72.5,
  "confidence": 0.84,
  "model": "canopy_volume_cnn_stub"
}
```

**GPU Model Architecture (Future):**
- Input: 3D point cloud from LiDAR/photogrammetry
- Model: PointNet++ or similar 3D CNN
- Output: Canopy volume in m³
- Training: Supervised learning on labeled orchard scans
- Inference: ~50ms on AMD MI300X

### 2. Fruit Count Estimation

**Current:** Deterministic calculation from canopy volume
**Future:** YOLO-based object detection on AMD MI300X

```python
# Stub output
{
  "estimated_fruit_count": 1840,
  "fruit_density_per_m3": 25.4,
  "confidence": 0.82,
  "model": "fruit_detection_yolo_stub"
}
```

**GPU Model Architecture (Future):**
- Input: RGB images from drone/camera
- Model: YOLOv8 or YOLOv9 fine-tuned for avocados
- Output: Bounding boxes + count
- Training: Supervised learning on annotated images
- Inference: ~30ms per image on AMD MI300X

### 3. Fruit Size Classification

**Current:** Deterministic based on NDVI and soil moisture
**Future:** Classification CNN on AMD MI300X

```python
# Stub output
{
  "average_fruit_size_cm": 9.4,
  "size_distribution": {
    "small_7_9cm": 0.15,
    "medium_9_11cm": 0.50,
    "large_11_13cm": 0.35
  },
  "confidence": 0.88,
  "model": "fruit_size_classifier_stub"
}
```

**GPU Model Architecture (Future):**
- Input: Cropped fruit images from detection
- Model: ResNet50 or EfficientNet classifier
- Output: Size category + dimensions
- Training: Supervised learning on measured fruits
- Inference: ~10ms per fruit on AMD MI300X

### 4. Tree Structure Analysis

**Current:** Deterministic based on tree age and NDVI
**Future:** 3D point cloud analysis on AMD MI300X

```python
# Stub output
{
  "trunk_diameter_cm": 28.2,
  "tree_height_m": 5.8,
  "branch_density": 0.76,
  "canopy_spread_m": 4.9,
  "confidence": 0.85,
  "model": "tree_structure_pointcloud_stub"
}
```

**GPU Model Architecture (Future):**
- Input: 3D point cloud of individual tree
- Model: PointNet++ for structure extraction
- Output: Structural measurements
- Training: Supervised learning on measured trees
- Inference: ~40ms per tree on AMD MI300X

### 5. Tree Health Classification

**Current:** Deterministic based on NDVI, stress, and damage
**Future:** Multi-modal CNN on AMD MI300X

```python
# Stub output
{
  "health_status": "warning",
  "health_score": 72.5,
  "confidence": 0.90,
  "model": "tree_health_multimodal_stub"
}
```

**GPU Model Architecture (Future):**
- Input: RGB + multispectral + thermal images
- Model: Multi-modal fusion CNN
- Output: Health classification + score
- Training: Supervised learning on expert-labeled data
- Inference: ~25ms per tree on AMD MI300X

## Visual 3D Parameters

The pipeline generates parameters that control 3D twin rendering:

```typescript
interface Visual3DParameters {
  canopy_scale: number;      // 0.8-1.3 (relative to base model)
  fruit_density: number;     // 0.0-1.0 (visible fruit count)
  fruit_scale: number;       // 0.7-1.2 (fruit size)
  trunk_scale: number;       // 0.8-1.3 (trunk thickness)
  branch_scale: number;      // 0.5-1.0 (branch density)
  height_scale: number;      // 0.7-1.3 (tree height)
  stress_color: string;      // "green" | "orange" | "red"
  leaf_color_tint: {
    r: number;               // 0.7-1.0
    g: number;               // 0.7-1.0
    b: number;               // 0.6-0.8
  };
}
```

These parameters are applied in the 3D twin to create realistic, data-driven visualizations.

## API Endpoints

### GET /api/v1/vision-3d/{orchard_id}

Get vision/3D analysis for an orchard using existing metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "orchard_id": "michoacan_orchard_01",
    "section_id": "central_block",
    "canopy_volume": 72.5,
    "estimated_fruit_count": 1840,
    "average_fruit_size_cm": 9.4,
    "trunk_diameter_cm": 28.2,
    "branch_density": 0.76,
    "tree_height_m": 5.8,
    "health_status": "warning",
    "confidence": 0.84,
    "visual_3d_parameters": { ... },
    "mode": "stub"
  }
}
```

### POST /api/v1/vision-3d/analyze

Analyze with custom parameters.

**Request:**
```json
{
  "orchard_id": "michoacan_orchard_01",
  "section_id": "central_block",
  "ndvi": 0.68,
  "stress_level": "medium",
  "soil_moisture": 55.0,
  "leaf_damage": 12.0,
  "tree_age_years": 8
}
```

**Response:** Same as GET endpoint

## Training Pipeline (Future)

### Data Collection

1. **Drone Imagery**
   - RGB cameras (4K resolution)
   - Multispectral cameras (5-band)
   - Thermal cameras (FLIR)
   - LiDAR scanners

2. **Ground Truth**
   - Manual fruit counts
   - Measured fruit sizes
   - Tree structure measurements
   - Expert health assessments

3. **Annotation**
   - Bounding boxes for fruits
   - Segmentation masks for canopy
   - Point cloud labels
   - Health classifications

### Model Training on AMD MI300X

```bash
# Example training command
python ml/training/train_fruit_count_model.py \
  --data-dir /data/orchards \
  --model yolov8x \
  --epochs 100 \
  --batch-size 32 \
  --device rocm \
  --gpu-id 0
```

**Training Performance (Estimated):**
- YOLOv8 Fruit Detection: ~6 hours on MI300X
- ResNet50 Size Classifier: ~3 hours on MI300X
- PointNet++ Canopy Analysis: ~8 hours on MI300X
- Multi-modal Health CNN: ~10 hours on MI300X

### Model Deployment

1. **Export to ONNX**
   ```python
   torch.onnx.export(model, dummy_input, "model.onnx")
   ```

2. **Optimize for ROCm**
   ```bash
   python -m onnxruntime.tools.convert_onnx_models_to_ort \
     --optimization_level 99 \
     model.onnx
   ```

3. **Deploy to Inference Server**
   - Use vLLM or Triton Inference Server
   - Load models on AMD MI300X
   - Expose REST API endpoints

4. **Update Service**
   ```python
   # In vision_3d_analysis_service.py
   if GPU_MODELS_AVAILABLE:
       result = call_gpu_model(orchard_data)
   else:
       result = analyze_orchard_section_complete(orchard_data)
   ```

## Performance Targets

### Current (Stub Mode)
- Latency: <5ms (deterministic calculation)
- Throughput: Unlimited (no GPU required)
- Accuracy: N/A (synthetic data)

### Future (GPU Mode)
- Latency: <200ms (all models combined)
- Throughput: ~50 orchards/second on single MI300X
- Accuracy: 
  - Fruit count: ±5% error
  - Fruit size: ±0.5cm error
  - Health classification: >90% accuracy
  - Canopy volume: ±10% error

## Integration with 3D Twin

The 3D twin (OrchardTwin3D.tsx) will consume visual_3d_parameters:

```typescript
// In OrchardTwin3D.tsx
useEffect(() => {
  if (visual3DParams) {
    // Update canopy size
    canopyMesh.scale.set(
      visual3DParams.canopy_scale,
      visual3DParams.height_scale,
      visual3DParams.canopy_scale
    );
    
    // Update fruit visibility
    setFruitCount(Math.floor(2000 * visual3DParams.fruit_density));
    
    // Update colors
    if (visual3DParams.stress_color === 'red') {
      canopyMaterial.color.set(0xff6b6b);
    } else if (visual3DParams.stress_color === 'orange') {
      canopyMaterial.color.set(0xffa500);
    } else {
      canopyMaterial.color.set(0x4a7c59);
    }
  }
}, [visual3DParams]);
```

## Fallback Strategy

The system maintains a robust fallback hierarchy:

1. **Primary:** GPU-accelerated models on AMD MI300X
2. **Secondary:** CPU-based models (slower but functional)
3. **Tertiary:** Deterministic stub (always available)

This ensures the application always provides analysis, even if GPU models are unavailable.

## Cost Analysis

### Development Costs
- Data collection: $50,000
- Annotation: $30,000
- Model training: $10,000 (GPU time)
- Deployment: $5,000
- **Total:** $95,000

### Operational Costs (per month)
- AMD MI300X instance: $2,000-4,000
- Storage: $500
- Bandwidth: $200
- **Total:** $2,700-4,700/month

### ROI
- Improved yield predictions: +5-10% accuracy
- Reduced manual inspection: -50% labor
- Early problem detection: -20% crop loss
- **Estimated value:** $50,000-100,000/year per large orchard

## Roadmap

### Phase 1: Stub Implementation (Current)
- ✅ Deterministic models
- ✅ API endpoints
- ✅ Visual parameter generation
- ✅ Frontend integration ready

### Phase 2: Data Collection (Q2 2026)
- Drone imagery collection
- Ground truth measurements
- Data annotation pipeline
- Dataset preparation

### Phase 3: Model Training (Q3 2026)
- Train fruit detection model
- Train size classification model
- Train health assessment model
- Train canopy analysis model

### Phase 4: GPU Deployment (Q4 2026)
- Deploy models on AMD MI300X
- Performance optimization
- A/B testing vs stub
- Production rollout

### Phase 5: Continuous Improvement (2027+)
- Model retraining with new data
- Multi-season adaptation
- Multi-variety support
- Real-time inference optimization

## Summary

The vision/3D/simulation pipeline is designed for future AMD MI300X GPU acceleration while maintaining full functionality with deterministic stubs today. The architecture supports seamless transition from stub to GPU models without frontend changes.

---

Made with Bob - May 6, 2026