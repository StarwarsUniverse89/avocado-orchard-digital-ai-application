# Running Live vLLM Inference on AMD MI300X

This guide explains how to set up and run live vLLM inference on an AMD MI300X GPU instance.

## Prerequisites

- AMD MI300X GPU instance (cloud or on-premise)
- ROCm 5.7+ installed
- Python 3.10+
- Access to Hugging Face models

## Step 1: Install vLLM with ROCm Support

On your AMD MI300X instance:

```bash
# Install ROCm-compatible vLLM
pip install vllm

# Or build from source for latest ROCm optimizations
git clone https://github.com/vllm-project/vllm.git
cd vllm
pip install -e .
```

## Step 2: Download Model

```bash
# Install Hugging Face CLI
pip install huggingface-hub

# Login (optional, for gated models)
huggingface-cli login

# Download Qwen2.5-7B-Instruct
huggingface-cli download Qwen/Qwen2.5-7B-Instruct --local-dir /models/Qwen2.5-7B-Instruct
```

## Step 3: Start vLLM Server

```bash
# Start vLLM with OpenAI-compatible API
python -m vllm.entrypoints.openai.api_server \
  --model /models/Qwen2.5-7B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --tensor-parallel-size 1 \
  --gpu-memory-utilization 0.9 \
  --max-model-len 4096 \
  --dtype float16

# For multi-GPU setup (if you have multiple MI300X GPUs):
python -m vllm.entrypoints.openai.api_server \
  --model /models/Qwen2.5-7B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --tensor-parallel-size 4 \
  --gpu-memory-utilization 0.9 \
  --max-model-len 8192 \
  --dtype float16
```

### vLLM Server Options

| Option | Description | Recommended Value |
|--------|-------------|-------------------|
| `--model` | Path to model or HF model ID | `/models/Qwen2.5-7B-Instruct` |
| `--host` | Server host | `0.0.0.0` (all interfaces) |
| `--port` | Server port | `8000` |
| `--tensor-parallel-size` | Number of GPUs for tensor parallelism | `1` (single GPU) or `4` (quad GPU) |
| `--gpu-memory-utilization` | GPU memory usage fraction | `0.9` (90%) |
| `--max-model-len` | Maximum sequence length | `4096` or `8192` |
| `--dtype` | Model data type | `float16` (faster) or `bfloat16` |

## Step 4: Test vLLM Server

```bash
# Test with curl
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is the capital of France?"}
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }'
```

Expected response:
```json
{
  "id": "cmpl-...",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "Qwen/Qwen2.5-7B-Instruct",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 8,
    "total_tokens": 28
  }
}
```

## Step 5: Configure Backend

On your application server (can be same or different machine):

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit backend/.env
nano backend/.env
```

Set these variables:

```bash
# AMD vLLM Configuration
AMD_API_KEY=your_secure_api_key_here
AMD_MODEL_ENDPOINT=http://your-mi300x-ip:8000
AMD_MODEL_NAME=Qwen/Qwen2.5-7B-Instruct
AMD_GPU_TARGET=AMD MI300X
```

### Security Notes

- **Never commit backend/.env to git** (it's in .gitignore)
- Use a strong API key for production
- Use HTTPS in production (set up reverse proxy with SSL)
- Restrict firewall access to vLLM port

## Step 6: Start Backend

```bash
cd backend
python main.py
```

The backend will:
1. Load AMD configuration from `.env`
2. Detect that `AMD_MODEL_ENDPOINT` is set
3. Switch to **live mode**
4. Call vLLM for AI recommendations

## Step 7: Verify Live Mode

Check the status endpoint:

```bash
curl http://localhost:8000/api/v1/amd/status
```

Expected response:
```json
{
  "success": true,
  "data": {
    "amd_configured": true,
    "mode": "live",
    "model_name": "Qwen/Qwen2.5-7B-Instruct",
    "endpoint_configured": true,
    "gpu_target": "AMD MI300X",
    "api_key_masked": "your...here",
    "fallback_enabled": true,
    "note": "Live inference from AMD MI300X"
  }
}
```

**Key indicator:** `"mode": "live"` means vLLM is being called.

## Step 8: Test Live Inference

```bash
# Test agent recommendation
curl -X POST http://localhost:8000/api/v1/agent \
  -H "Content-Type: application/json" \
  -d '{
    "orchard_id": "orchard_A"
  }'
```

The response will include:
```json
{
  "success": true,
  "data": {
    "recommendations": [{
      "recommendation": "...",
      "reason": "...",
      "model": "Qwen/Qwen2.5-7B-Instruct (vLLM on AMD MI300X)",
      "mode": "live",
      "note": "Live inference from AMD MI300X"
    }]
  }
}
```

## Troubleshooting

### vLLM Server Won't Start

```bash
# Check ROCm installation
rocm-smi

# Check GPU visibility
export ROCR_VISIBLE_DEVICES=0
python -c "import torch; print(torch.cuda.is_available())"

# Check vLLM installation
python -c "import vllm; print(vllm.__version__)"
```

### Backend Can't Connect

```bash
# Test vLLM endpoint directly
curl http://your-mi300x-ip:8000/v1/models

# Check firewall
sudo ufw status
sudo ufw allow 8000/tcp

# Check vLLM logs
journalctl -u vllm -f
```

### Slow Inference

```bash
# Increase GPU memory utilization
--gpu-memory-utilization 0.95

# Use smaller max length
--max-model-len 2048

# Enable KV cache quantization
--kv-cache-dtype fp8
```

## Performance Tuning

### Single MI300X GPU

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-7B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --tensor-parallel-size 1 \
  --gpu-memory-utilization 0.95 \
  --max-model-len 4096 \
  --dtype float16 \
  --enable-prefix-caching \
  --max-num-seqs 256
```

### Quad MI300X GPUs

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-7B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --tensor-parallel-size 4 \
  --gpu-memory-utilization 0.95 \
  --max-model-len 8192 \
  --dtype float16 \
  --enable-prefix-caching \
  --max-num-seqs 512
```

## Alternative Models

### Llama 3.1 8B

```bash
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Meta-Llama-3.1-8B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --tensor-parallel-size 1 \
  --gpu-memory-utilization 0.9
```

Update `backend/.env`:
```bash
AMD_MODEL_NAME=meta-llama/Meta-Llama-3.1-8B-Instruct
```

### Qwen 2.5 14B (requires more VRAM)

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-14B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --tensor-parallel-size 2 \
  --gpu-memory-utilization 0.95
```

## Production Deployment

### Using systemd

Create `/etc/systemd/system/vllm.service`:

```ini
[Unit]
Description=vLLM OpenAI API Server
After=network.target

[Service]
Type=simple
User=vllm
WorkingDirectory=/opt/vllm
Environment="ROCR_VISIBLE_DEVICES=0"
ExecStart=/usr/bin/python3 -m vllm.entrypoints.openai.api_server \
  --model /models/Qwen2.5-7B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --tensor-parallel-size 1 \
  --gpu-memory-utilization 0.9 \
  --max-model-len 4096 \
  --dtype float16
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable vllm
sudo systemctl start vllm
sudo systemctl status vllm
```

### Using Docker

```dockerfile
FROM rocm/pytorch:rocm5.7_ubuntu22.04_py3.10_pytorch_2.0.1

RUN pip install vllm

EXPOSE 8000

CMD ["python", "-m", "vllm.entrypoints.openai.api_server", \
     "--model", "/models/Qwen2.5-7B-Instruct", \
     "--host", "0.0.0.0", \
     "--port", "8000"]
```

Run:
```bash
docker run -d \
  --name vllm \
  --device=/dev/kfd \
  --device=/dev/dri \
  --group-add video \
  -v /models:/models \
  -p 8000:8000 \
  vllm-rocm:latest
```

## Monitoring

### Check GPU Usage

```bash
# AMD GPU monitoring
watch -n 1 rocm-smi

# vLLM metrics endpoint
curl http://localhost:8000/metrics
```

### Check Inference Latency

```bash
# Time a request
time curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 50
  }'
```

Expected latency:
- First token: 50-100ms
- Subsequent tokens: 10-20ms each
- Total for 50 tokens: ~500-1000ms

## Summary

Once vLLM is running on AMD MI300X and `AMD_MODEL_ENDPOINT` is set:

✅ Backend switches to **live mode**
✅ AI recommendations use real LLM inference
✅ Status endpoint shows `"mode": "live"`
✅ UI displays "AMD Live" badge
✅ Fallback to stub mode if vLLM is unreachable

---

Made with Bob - May 6, 2026