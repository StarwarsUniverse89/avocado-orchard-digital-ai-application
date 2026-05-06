# AMD MI300X GPU Workloads for Avocado Orchard Digital AI

## Overview

This document explains the two primary AMD MI300X GPU workloads for the Avocado Orchard Digital AI application:

1. **vLLM Agent Inference** - LLM-powered AI recommendations
2. **Vision/3D/Simulation Pipeline** - Computer vision and 3D analysis

## Workload 1: vLLM Agent Inference

### Purpose

The vLLM agent provides intelligent, context-aware recommendations for orchard management using large language models running on AMD MI300X GPUs.

### Use Cases

- **AI Recommendations:** Analyze orchard conditions and suggest actions
- **Natural Language Commands:** Parse and execute user commands
- **Analytics Explanation:** Generate human-readable insights
- **Decision Support:** Provide reasoning for management decisions

### Architecture

```
User Command → Backend API → AMD Model Client → vLLM Server (MI300X) → LLM Response
                                                      ↓
                                              Qwen/Llama Model
                                              (7B-70B parameters)
```

### Models Supported

| Model | Parameters | VRAM | Use Case |
|-------|-----------|------|----------|
| Qwen/Qwen2.5-7B-Instruct | 7B | ~16GB | Default, fast inference |
| Qwen/Qwen2.5-14B-Instruct | 14B | ~32GB | Better reasoning |
| meta-llama/Llama-3.1-8B | 8B | ~18GB | Alternative option |
| meta-llama/Llama-3.1-70B | 70B | ~140GB | Best quality (multi-GPU) |

### Current Status

**Mode:** Stub (deterministic logic)

The agent currently uses rule-based logic in `ml/inference/amd_model_client.py`. It analyzes:
- Temperature thresholds
- Soil moisture levels
- NDVI values
- Health indicators

**To Enable Live Mode:**

1. Start vLLM server on AMD MI300X:
   ```bash
   python -m vllm.entrypoints.openai.api_server \
     --model Qwen/Qwen2.5-7B-Instruct \
     --host 0.0.0.0 \
     --port 8000
   ```

2. Configure backend:
   ```bash
   # In backend/.env
   AMD_MODEL_ENDPOINT=http://your-mi300x-ip:8000
   AMD_MODEL_NAME=Qwen/Qwen2.5-7B-Instruct
   ```

3. Restart backend - mode switches to "live"

### Performance Targets

| Metric | Stub Mode | Live Mode (MI300X) |
|--------|-----------|-------------------|
| Latency | <5ms | 200-500ms |
| Throughput | Unlimited | 50-100 req/sec |
| Quality | Rule-based | LLM reasoning |
| Cost | $0 | ~$0.01 per request |

### API Format

The client uses OpenAI-compatible `/v1/chat/completions` format:

```python
{
  "model": "Qwen/Qwen2.5-7B-Instruct",
  "messages": [
    {"role": "system", "content": "You are an agricultural AI advisor..."},
    {"role": "user", "content": "Analyze this orchard: temp=34°C, moisture=35%..."}
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

### Example Output

**Stub Mode:**
```json
{
  "recommendation": "Increase irrigation frequency",
  "reason": "Soil moisture at 35% is below optimal range",
  "model": "stub_deterministic",
  "mode": "stub"
}
```

**Live Mode:**
```json
{
  "recommendation": "Implement emergency irrigation protocol",
  "reason": "Critical water stress detected. Temperature at 34°C combined with 35% soil moisture creates severe stress conditions. Immediate action required to prevent permanent damage to fruit development.",
  "model": "Qwen/Qwen2.5-7B-Instruct (vLLM on AMD MI300X)",
  "mode": "live"
}
```

### Fallback Strategy

```
1. Try vLLM on AMD MI300X
   ↓ (if fails)
2. Fall back to deterministic stub
   ↓ (always succeeds)
3. Return recommendation
```

This ensures the application always provides recommendations.

## Workload 2: Vision/3D/Simulation Pipeline

### Purpose

Computer vision and 3D analysis models for automated orchard assessment, running on AMD MI300X GPUs.

### Use Cases

- **Canopy Volume Estimation:** Calculate tree canopy size from point clouds
- **Fruit Count Estimation:** Detect and count avocados in images
- **Fruit Size Classification:** Classify fruit sizes for harvest planning
- **Tree Structure Analysis:** Measure trunk diameter, height, branch density
- **Health Classification:** Assess tree health from multi-modal imagery
- **3D Twin Rendering:** Generate realistic 3D visualizations

### Architecture

```
Drone/Camera Data → Backend API → Vision Service → GPU Models (MI300X) → Analysis Results
                                                          ↓
                                                   CNN / YOLO / PointNet++
                                                          ↓
                                                  Visual 3D Parameters
                                                          ↓
                                                   3D Twin Rendering
```

### Models Pipeline

| Model | Input | Output | Inference Time |
|-------|-------|--------|----------------|
| Canopy CNN | 3D point cloud | Volume (m³) | ~50ms |
| Fruit YOLO | RGB images | Bounding boxes + count | ~30ms |
| Size Classifier | Cropped fruits | Size category | ~10ms |
| Structure PointNet | Tree point cloud | Measurements | ~40ms |
| Health Multi-modal | RGB + multispectral | Health status | ~25ms |

**Total Pipeline:** ~155ms per tree section

### Current Status

**Mode:** Stub (deterministic synthetic outputs)

The pipeline currently uses `ml/inference/vision_3d_analysis_stub.py` which generates deterministic outputs based on:
- NDVI values
- Stress levels
- Soil moisture
- Tree age

**Example Stub Output:**
```json
{
  "canopy_volume": 72.5,
  "estimated_fruit_count": 1840,
  "average_fruit_size_cm": 9.4,
  "trunk_diameter_cm": 28.2,
  "health_status": "warning",
  "visual_3d_parameters": {
    "canopy_scale": 1.12,
    "fruit_density": 0.92,
    "stress_color": "orange"
  },
  "mode": "stub"
}
```

### Future GPU Models

#### 1. Canopy Volume CNN

**Architecture:** PointNet++ for 3D point cloud processing

```python
# Training
python ml/training/train_canopy_model.py \
  --data-dir /data/point_clouds \
  --epochs 100 \
  --batch-size 16 \
  --device rocm
```

**Dataset Requirements:**
- 10,000+ labeled point clouds
- Ground truth volume measurements
- Multiple tree varieties and ages

#### 2. Fruit Detection YOLO

**Architecture:** YOLOv8 or YOLOv9 fine-tuned for avocados

```python
# Training
python ml/training/train_fruit_count_model.py \
  --data-dir /data/fruit_images \
  --model yolov8x \
  --epochs 100 \
  --batch-size 32 \
  --device rocm
```

**Dataset Requirements:**
- 50,000+ annotated images
- Bounding boxes for each fruit
- Various lighting and angles

#### 3. Fruit Size Classifier

**Architecture:** ResNet50 or EfficientNet

```python
# Training
python ml/training/train_fruit_size_model.py \
  --data-dir /data/fruit_sizes \
  --model resnet50 \
  --epochs 50 \
  --batch-size 64 \
  --device rocm
```

**Dataset Requirements:**
- 20,000+ measured fruits
- Size labels (small/medium/large)
- Calibrated images

#### 4. Tree Health Classifier

**Architecture:** Multi-modal fusion CNN

```python
# Training
python ml/training/train_tree_health_model.py \
  --data-dir /data/health_assessment \
  --model multimodal_cnn \
  --epochs 80 \
  --batch-size 24 \
  --device rocm
```

**Dataset Requirements:**
- 15,000+ multi-modal images (RGB + multispectral + thermal)
- Expert health labels
- Disease annotations

### Performance Targets

| Metric | Stub Mode | GPU Mode (MI300X) |
|--------|-----------|-------------------|
| Latency | <5ms | ~155ms |
| Throughput | Unlimited | ~50 sections/sec |
| Accuracy | N/A | >90% |
| Cost | $0 | ~$0.001 per analysis |

### Visual 3D Parameters

The pipeline generates parameters for 3D twin rendering:

```typescript
{
  canopy_scale: 1.12,      // Scales canopy mesh
  fruit_density: 0.92,     // Controls visible fruit count
  fruit_scale: 0.94,       // Scales fruit size
  trunk_scale: 1.08,       // Scales trunk thickness
  branch_scale: 0.76,      // Controls branch density
  height_scale: 1.05,      // Scales tree height
  stress_color: "orange",  // Health indicator color
  leaf_color_tint: {       // Leaf color adjustment
    r: 1.0,
    g: 0.85,
    b: 0.7
  }
}
```

These parameters are consumed by the 3D twin (Three.js) to create realistic, data-driven visualizations.

## GPU Resource Allocation

### Single AMD MI300X (192GB HBM3)

**Option A: vLLM Only**
- Qwen 70B model: ~140GB
- Remaining: ~52GB for KV cache
- Throughput: 30-50 req/sec

**Option B: Balanced**
- Qwen 14B model: ~32GB
- Vision models: ~40GB
- Remaining: ~120GB for batch processing
- Throughput: 50-100 req/sec (agent), 50 sections/sec (vision)

**Option C: Vision Focus**
- Qwen 7B model: ~16GB
- Vision models: ~60GB
- Remaining: ~116GB for large batches
- Throughput: 100+ req/sec (agent), 100+ sections/sec (vision)

### Quad AMD MI300X (768GB HBM3)

**Recommended Configuration:**
- GPU 0-1: Qwen 70B (tensor parallel)
- GPU 2: Vision models (canopy + fruit detection)
- GPU 3: Vision models (size + health classification)

**Performance:**
- Agent: 100+ req/sec
- Vision: 200+ sections/sec
- Total cost: ~$8,000-12,000/month

## Deployment Checklist

### vLLM Agent

- [ ] AMD MI300X instance provisioned
- [ ] ROCm 5.7+ installed
- [ ] vLLM installed and tested
- [ ] Model downloaded (Qwen/Llama)
- [ ] vLLM server running
- [ ] Backend .env configured
- [ ] AMD_MODEL_ENDPOINT set
- [ ] Backend restarted
- [ ] Status endpoint shows "live"
- [ ] Test script passes

### Vision/3D Pipeline

- [ ] Training data collected
- [ ] Models trained on MI300X
- [ ] Models exported to ONNX
- [ ] Inference server deployed
- [ ] Backend service updated
- [ ] API endpoints tested
- [ ] 3D twin integration verified
- [ ] Performance benchmarked
- [ ] Fallback to stub tested

## Cost Analysis

### Development

| Item | Cost |
|------|------|
| MI300X instance (3 months) | $12,000 |
| Data collection | $50,000 |
| Annotation | $30,000 |
| Engineering | $80,000 |
| **Total** | **$172,000** |

### Operations (per month)

| Item | Cost |
|------|------|
| Single MI300X | $3,000-4,000 |
| Quad MI300X | $10,000-12,000 |
| Storage | $500 |
| Bandwidth | $200 |
| **Total** | **$3,700-12,700** |

### ROI

**Per Large Orchard (1000+ acres):**
- Improved yield: +5-10% = $50,000-100,000/year
- Reduced labor: -50% inspection = $30,000/year
- Early problem detection: -20% loss = $40,000/year
- **Total value:** $120,000-170,000/year

**Break-even:** 2-3 large orchards or 10-15 medium orchards

## Monitoring

### vLLM Metrics

```bash
# GPU utilization
watch -n 1 rocm-smi

# vLLM metrics
curl http://localhost:8000/metrics

# Request latency
curl -w "@curl-format.txt" http://localhost:8000/v1/chat/completions
```

### Vision Pipeline Metrics

```bash
# Model inference time
python -m cProfile -s cumtime backend/services/vision_3d_analysis_service.py

# GPU memory usage
rocm-smi --showmeminfo vram

# Throughput test
ab -n 1000 -c 10 http://localhost:8000/api/v1/vision-3d/orchard_A
```

## Summary

### Current State

✅ **vLLM Agent:** Stub mode, ready for live deployment
✅ **Vision Pipeline:** Stub mode, architecture defined
✅ **API Endpoints:** Implemented and tested
✅ **Frontend Integration:** Ready to consume GPU outputs
✅ **Fallback Strategy:** Robust stub fallbacks in place
✅ **Documentation:** Complete setup guides
✅ **Test Scripts:** Automated testing ready

### Next Steps

1. **Provision AMD MI300X instance**
2. **Deploy vLLM server**
3. **Configure backend for live mode**
4. **Collect training data for vision models**
5. **Train and deploy vision models**
6. **Performance optimization**
7. **Production rollout**

### Key Advantages of AMD MI300X

- **192GB HBM3:** Largest GPU memory for large models
- **ROCm Support:** Open-source, flexible deployment
- **Cost-Effective:** Better price/performance than alternatives
- **Scalability:** Easy multi-GPU scaling
- **vLLM Compatible:** Full OpenAI API compatibility

---

Made with Bob - May 6, 2026