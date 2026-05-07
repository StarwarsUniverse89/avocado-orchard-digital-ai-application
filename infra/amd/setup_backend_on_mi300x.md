# Backend Setup on AMD MI300X Droplet

This guide explains how to set up the FastAPI backend on an Ubuntu AMD MI300X droplet.

## Prerequisites

- Ubuntu AMD MI300X droplet with ROCm installed
- vLLM running on port 8000
- Root or sudo access

## Architecture

- **vLLM Server**: Port 8000 (LLM inference)
- **FastAPI Backend**: Port 8001 (API endpoints)
- **Communication**: Backend calls vLLM at `http://localhost:8000/v1/chat/completions`

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd /root/avocado-orchard-digital-ai-application
```

### 2. Install Python and Dependencies

```bash
# Update package list
apt update

# Install Python 3 with venv support
apt install -y python3-full python3-venv python3-pip

# Remove old virtual environment if it exists
rm -rf backend/venv

# Create new virtual environment
python3 -m venv backend/venv

# Activate virtual environment
source backend/venv/bin/activate
```

### 3. Install Python Packages

```bash
# Upgrade pip
pip install --upgrade pip

# Install all backend dependencies
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy example environment file
cp backend/.env.example backend/.env

# Edit the .env file
nano backend/.env
```

Set these values in `backend/.env`:

```env
ENVIRONMENT=production
API_HOST=0.0.0.0
API_PORT=8001
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

AMD_API_KEY=your_amd_api_key_here
AMD_API_URL=https://api.amd.cloud/v1
AMD_MODEL_ENDPOINT=http://localhost:8000/v1/chat/completions
AMD_MODEL_NAME=Qwen/Qwen3-32B
AMD_GPU_TARGET=AMD MI300X

VLLM_API_KEY=
VLLM_API_URL=http://localhost:8000
VLLM_MODEL_NAME=Qwen/Qwen3-32B
VLLM_ENABLED=true

AMD_GPU_ENABLED=true
ROCM_VERSION=6.2
MODEL_NAME=Qwen/Qwen3-32B
LOG_LEVEL=INFO
```

**Model Configuration Notes:**
- **Primary Model**: Qwen/Qwen3-32B (recommended for AMD MI300X)
- **Fallback Model**: Qwen/Qwen2.5-32B-Instruct (if Qwen3-32B unavailable)
- The LLM is used for agent reasoning and command interpretation
- Orchard detection uses dedicated computer vision services, not the LLM

### 5. Start the Backend Server

#### Option A: Direct Python Execution

```bash
cd backend
source venv/bin/activate
python3 main.py
```

The backend will read `API_PORT` from `.env` and start on port 8001.

#### Option B: Using Uvicorn (Recommended for Production)

```bash
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8001
```

#### Option C: Background Process with nohup

```bash
cd backend
source venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8001 > backend.log 2>&1 &
```

### 6. Verify Backend is Running

```bash
# Check if backend is listening on port 8001
curl http://localhost:8001/health

# Expected response:
# {"status":"healthy","services":{"api":"operational",...}}
```

### 7. Test AMD Status

```bash
curl http://localhost:8001/api/v1/amd/status
```

Expected response should show:
- `"mode": "live"` (if vLLM is running)
- `"amd_configured": true`
- `"endpoint_configured": true`

### 8. Test Mexico Network Endpoints

```bash
# Test Mexico analytics
curl http://localhost:8001/api/v1/orchard-network/mexico/analytics

# Test agent command
curl -X POST http://localhost:8001/api/v1/agent/command \
  -H "Content-Type: application/json" \
  -d '{"command": "show avocado belt"}'

# Test agent recommendation
curl -X POST http://localhost:8001/api/v1/agent \
  -H "Content-Type: application/json" \
  -d '{"municipality_name": "Tancítaro"}'
```

## Running the Live Test Script

```bash
# Set backend URL
export API_BASE_URL=http://localhost:8001

# Run the test script
bash TEST_LIVE_AMD_INFERENCE.sh
```

Expected output:
- ✅ AMD Status: LIVE MODE
- ✅ Agent command processed successfully
- ✅ Mexico network data loaded
- All tests passing

## Troubleshooting

### Backend Won't Start

**Issue**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
source backend/venv/bin/activate
pip install -r requirements.txt
```

### Port Already in Use

**Issue**: `Address already in use`

**Solution**:
```bash
# Find process using port 8001
lsof -i :8001

# Kill the process
kill -9 <PID>

# Or use a different port
uvicorn main:app --host 0.0.0.0 --port 8002
```

### vLLM Connection Failed

**Issue**: Backend can't connect to vLLM

**Solution**:
```bash
# Verify vLLM is running
curl http://localhost:8000/v1/models

# Check vLLM logs
journalctl -u vllm -f

# Restart vLLM if needed
systemctl restart vllm
```

### Missing Mexico Network Data

**Issue**: `/api/v1/agent` returns 404 or error

**Solution**:
```bash
# Verify data file exists
ls -la backend/data/mexico_avocado_regions.json

# Check file permissions
chmod 644 backend/data/mexico_avocado_regions.json
```

## Production Deployment

### Using systemd Service

Create `/etc/systemd/system/avocado-backend.service`:

```ini
[Unit]
Description=Avocado Orchard Backend API
After=network.target vllm.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/avocado-orchard-digital-ai-application/backend
Environment="PATH=/root/avocado-orchard-digital-ai-application/backend/venv/bin"
ExecStart=/root/avocado-orchard-digital-ai-application/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
systemctl daemon-reload
systemctl enable avocado-backend
systemctl start avocado-backend
systemctl status avocado-backend
```

### Monitoring Logs

```bash
# Follow backend logs
journalctl -u avocado-backend -f

# Or if using nohup
tail -f backend/backend.log
```

## Performance Tuning

### Increase Workers for Production

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4
```

### Enable Access Logging

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --access-log
```

## Security Notes

1. **Never commit `.env` file** - Contains sensitive API keys
2. **Use firewall rules** - Restrict port 8001 access if needed
3. **Enable HTTPS** - Use nginx reverse proxy for production
4. **Rotate API keys** - Regularly update AMD_API_KEY

## Next Steps

1. Set up nginx reverse proxy for HTTPS
2. Configure domain name and SSL certificate
3. Set up monitoring and alerting
4. Configure automated backups
5. Test failover scenarios

## Support

For issues or questions:
- Check logs: `journalctl -u avocado-backend -f`
- Verify vLLM status: `systemctl status vllm`
- Test endpoints: `bash TEST_LIVE_AMD_INFERENCE.sh`
- Review AMD integration docs: `docs/AMD_AGENT_STATUS.md`