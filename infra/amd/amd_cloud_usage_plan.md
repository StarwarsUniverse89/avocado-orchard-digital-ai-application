# AMD Cloud Usage Plan
## Avocado Orchard Digital AI Application

## Overview

This document outlines how the Avocado Orchard Digital AI application will leverage AMD Developer Cloud resources, specifically targeting AMD MI300X GPU infrastructure for AI inference and model training.

---

## AMD Developer Cloud Credits

**Available Credits:** $100 USD  
**Expiration:** Check AMD Developer Cloud dashboard  
**Goal:** Maximize demo impact while staying within budget

---

## Planned Usage

### 1. AI Agent Inference (Priority 1)

**Purpose:** Run LLM-based recommendations using Qwen or Llama models

**Instance Type:** AMD MI300X GPU instance  
**Estimated Cost:** $2-4/hour  
**Planned Duration:** 2-3 hours total  
**Total Cost:** ~$8-12

**Tasks:**
- Deploy Qwen-2.5-7B or Llama-3-8B model
- Test agent recommendation generation
- Benchmark inference speed
- Capture screenshots and logs
- Generate 10-20 sample recommendations

**Setup:**
```bash
# SSH into AMD Cloud instance
ssh user@amd-instance

# Clone repository
git clone <repo-url>
cd avocado-orchard-digital-ai-application

# Install dependencies
pip install -r requirements.txt
pip install torch torchvision --index-url https://download.pytorch.org/whl/rocm5.7

# Run inference test
python ml/inference/amd_model_client.py --model qwen-2.5-7b --test
```

---

### 2. Vision Model Inference (Priority 2)

**Purpose:** Test computer vision models for tree health classification

**Instance Type:** AMD MI300X GPU instance  
**Estimated Cost:** $2-4/hour  
**Planned Duration:** 1-2 hours  
**Total Cost:** ~$4-8

**Tasks:**
- Load EfficientNet-B3 or ResNet50 model
- Run inference on sample orchard images
- Measure throughput (images/second)
- Compare CPU vs GPU performance
- Document results

**Test Images:**
- `assets/ui/avocado_leafhealth.jpg`
- `assets/ui/avocado_tree_growthtimeline.jpg`
- `assets/ui/Avocado_LeafComposite.avif`

---

### 3. Financial Model Training (Priority 3)

**Purpose:** Train or fine-tune yield/financial prediction model

**Instance Type:** AMD MI300X GPU instance  
**Estimated Cost:** $2-4/hour  
**Planned Duration:** 1-2 hours  
**Total Cost:** ~$4-8

**Tasks:**
- Load training data from `ml/datasets/`
- Train simple neural network for yield prediction
- Compare training time: CPU vs GPU
- Save trained model weights
- Document training metrics

**Dataset:**
- `ml/datasets/orchards.json`
- `ml/datasets/Data.xlsx`
- `ml/datasets/weights.csv`

---

### 4. Simulation Rendering (Optional - Priority 4)

**Purpose:** GPU-accelerated orchard simulation rendering

**Instance Type:** AMD MI300X GPU instance  
**Estimated Cost:** $2-4/hour  
**Planned Duration:** 1 hour  
**Total Cost:** ~$4

**Tasks:**
- Test GPU-accelerated particle systems
- Render heatmaps for NDVI visualization
- Benchmark frame generation speed
- Compare with CPU rendering

---

## Cost Breakdown

| Task | Duration | Cost/Hour | Total Cost |
|------|----------|-----------|------------|
| AI Agent Inference | 2-3 hours | $3 | $6-9 |
| Vision Model Inference | 1-2 hours | $3 | $3-6 |
| Financial Model Training | 1-2 hours | $3 | $3-6 |
| Simulation Rendering | 1 hour | $3 | $3 |
| **Total Estimated** | **5-8 hours** | - | **$15-24** |

**Buffer for testing:** $10-15  
**Total Budget Used:** ~$30-40 of $100

---

## Instance Configuration

### Recommended Instance

**GPU:** AMD MI300X (192GB HBM3)  
**CPU:** AMD EPYC (sufficient cores)  
**RAM:** 128GB+ system memory  
**Storage:** 500GB SSD  
**OS:** Ubuntu 22.04 LTS with ROCm 5.7+

### Software Stack

```
ROCm 5.7+
PyTorch 2.1+ with ROCm support
vLLM for LLM inference
Transformers library
FastAPI for serving
```

---

## Execution Timeline

### Phase 1: Setup (30 minutes)
- Provision AMD Cloud instance
- Install ROCm and dependencies
- Clone repository
- Verify GPU access

### Phase 2: AI Agent Testing (2 hours)
- Load Qwen/Llama model
- Run inference tests
- Generate recommendations
- Capture results

### Phase 3: Vision Model Testing (1 hour)
- Load vision model
- Process sample images
- Benchmark performance
- Document results

### Phase 4: Training Demo (1 hour)
- Load training data
- Run training script
- Save model weights
- Compare metrics

### Phase 5: Cleanup (15 minutes)
- Save all results
- Download logs and screenshots
- Terminate instance
- Verify billing stopped

---

## Success Criteria

✅ Successfully run LLM inference on AMD GPU  
✅ Generate AI recommendations with <2s latency  
✅ Process vision model inference at >10 images/sec  
✅ Train model with GPU acceleration (>5x speedup vs CPU)  
✅ Document all results with screenshots  
✅ Stay within $40 budget  
✅ Terminate all instances properly

---

## Risk Mitigation

### Cost Overruns
- Set billing alerts at $25, $50, $75
- Use spot instances if available
- Terminate instances immediately after testing
- Monitor usage in real-time

### Technical Issues
- Test locally with CPU first
- Have fallback to synthetic data
- Document all errors
- Keep backup of working code

### Time Management
- Allocate specific time blocks
- Use pre-written scripts
- Automate where possible
- Have clear exit criteria

---

## Documentation Requirements

For each test session, capture:

1. **Screenshots**
   - GPU utilization dashboard
   - Model inference output
   - Performance metrics
   - Cost dashboard

2. **Logs**
   - Inference latency
   - Throughput metrics
   - Error messages
   - Resource usage

3. **Results**
   - Model outputs
   - Recommendation examples
   - Training curves
   - Benchmark comparisons

4. **Code**
   - Inference scripts
   - Training scripts
   - Configuration files
   - Requirements

---

## Post-Demo Usage

After May 8 demo, remaining credits can be used for:

- Extended model training
- Hyperparameter tuning
- Larger dataset processing
- Performance optimization
- Additional model testing

---

## Contact & Support

**AMD Developer Cloud Support:** https://www.amd.com/en/developer/resources/developer-cloud.html  
**ROCm Documentation:** https://rocm.docs.amd.com/  
**PyTorch ROCm:** https://pytorch.org/get-started/locally/

---

**Last Updated:** May 5, 2026  
**Status:** Ready for execution  
**Budget Status:** $100 available, ~$30-40 planned

---

# Made with Bob