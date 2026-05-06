# AMD Cloud API Key Management
## Avocado Orchard Digital AI Application

## Overview

This document explains how to securely manage AMD Cloud API keys and other sensitive credentials for the Avocado Orchard Digital AI application.

**⚠️ CRITICAL: Never commit API keys to git**

---

## Quick Start

### 1. Copy the example environment file

```bash
cd backend
cp .env.example .env
```

### 2. Get your AMD Cloud API key

1. Go to [AMD Developer Cloud](https://www.amd.com/en/developer/resources/developer-cloud.html)
2. Sign in or create an account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key immediately (you won't see it again)

### 3. Add your API key to .env

Open `backend/.env` and add your keys:

```env
# AMD Cloud API Configuration
AMD_API_KEY=your_actual_amd_api_key_here
AMD_API_URL=https://api.amd.cloud/v1
AMD_MODEL_ENDPOINT=your_model_endpoint_here

# vLLM Configuration (if using vLLM)
VLLM_API_KEY=your_vllm_key_here
VLLM_API_URL=your_vllm_url_here
VLLM_MODEL_NAME=Qwen/Qwen2.5-7B-Instruct

# HuggingFace Token (for model downloads)
HUGGINGFACE_TOKEN=your_hf_token_here
```

### 4. Verify .env is in .gitignore

Check that `.gitignore` includes:

```
.env
backend/.env
frontend/.env.local
```

### 5. Test the configuration

```bash
cd backend
python -c "from core.config import config; config.print_config_status()"
```

You should see:

```
✅ AMD Cloud API: Configured
  - API Key: abcd...xyz
  - API URL: https://api.amd.cloud/v1
```

---

## Environment Variables Reference

### Required for AMD Cloud

| Variable | Description | Example |
|----------|-------------|---------|
| `AMD_API_KEY` | Your AMD Cloud API key | `amd_dev_1234567890abcdef` |
| `AMD_API_URL` | AMD Cloud API base URL | `https://api.amd.cloud/v1` |
| `AMD_MODEL_ENDPOINT` | Specific model endpoint | `/models/qwen-2.5-7b/generate` |

### Optional for vLLM

| Variable | Description | Example |
|----------|-------------|---------|
| `VLLM_API_KEY` | vLLM API key | `vllm_key_abc123` |
| `VLLM_API_URL` | vLLM server URL | `http://localhost:8000` |
| `VLLM_MODEL_NAME` | Model name | `Qwen/Qwen2.5-7B-Instruct` |

### Optional for HuggingFace

| Variable | Description | Example |
|----------|-------------|---------|
| `HUGGINGFACE_TOKEN` | HF access token | `hf_abcdefghijklmnop` |

---

## Security Best Practices

### ✅ DO:

- Store API keys in `backend/.env` file
- Keep `.env` in `.gitignore`
- Use environment variables in code
- Rotate keys regularly
- Use different keys for dev/staging/prod
- Mask keys in logs (show only first/last 4 chars)
- Destroy AMD Cloud instances after testing
- Set billing alerts

### ❌ DON'T:

- Commit `.env` files to git
- Hardcode API keys in source code
- Share API keys in chat/email
- Log full API keys
- Leave GPU instances running
- Use production keys in development
- Store keys in frontend code
- Push keys to public repositories

---

## How the Backend Reads Keys

The backend uses `backend/core/config.py` to load environment variables:

```python
from core.config import config

# Access AMD Cloud API key
api_key = config.AMD_API_KEY

# Check if configured
if config.is_amd_cloud_configured():
    # Use AMD Cloud
    pass
else:
    # Use stub/fallback
    pass
```

The config module:
1. Loads `backend/.env` if it exists
2. Falls back to system environment variables
3. Provides safe access to all configuration
4. Never logs full API keys

---

## Testing AMD Cloud Connection

### Test from Python

```bash
cd ml/inference
python amd_model_client.py
```

Expected output:

```
AMD Model Client Test
============================================================

Connection Status: {
  "status": "configured",
  "api_key": "amd_...xyz",
  "api_url": "https://api.amd.cloud/v1",
  "model": "Qwen/Qwen2.5-7B-Instruct",
  "ready_for_testing": true
}
```

### Test from Backend API

```bash
cd backend
python main.py
```

Then visit: `http://localhost:8000/api/v1/amd/status`

---

## AMD Cloud Instance Management

### Before Starting Instance

1. ✅ Have all code ready
2. ✅ Test locally first
3. ✅ Set time limit (max 3 hours)
4. ✅ Set billing alerts
5. ✅ Document tasks to complete

### During Instance Use

1. ✅ Monitor cost every 30 minutes
2. ✅ Save results incrementally
3. ✅ Take screenshots as you go
4. ✅ Keep terminal logs

### After Testing

1. ✅ Download all results
2. ✅ Download all logs
3. ✅ **TERMINATE INSTANCE**
4. ✅ Verify termination in dashboard
5. ✅ Check billing stopped

### Cost Control

**Set billing alerts at:**
- $25 (25% of budget)
- $50 (50% of budget)
- $75 (75% of budget)

**If cost exceeds $40:**
- Stop work immediately
- Download critical results
- Terminate instance
- Investigate cause

---

## Troubleshooting

### "AMD Cloud API not configured"

**Problem:** Backend can't find API keys

**Solution:**
1. Check `backend/.env` exists
2. Verify `AMD_API_KEY` is set
3. Restart backend server
4. Run config test: `python -c "from core.config import config; config.print_config_status()"`

### "API key invalid"

**Problem:** API key is incorrect or expired

**Solution:**
1. Generate new key from AMD Developer Cloud
2. Update `backend/.env`
3. Restart backend
4. Test connection

### "Instance won't terminate"

**Problem:** AMD Cloud instance stuck

**Solution:**
1. Try dashboard termination again
2. Try CLI termination
3. Contact AMD Cloud support immediately
4. Document with screenshots
5. Monitor billing closely

---

## Key Rotation

Rotate API keys:
- Every 90 days (recommended)
- After team member leaves
- If key is compromised
- Before production deployment

**Steps:**
1. Generate new key in AMD Cloud dashboard
2. Update `backend/.env`
3. Test new key works
4. Revoke old key
5. Update documentation

---

## Production Deployment (Future)

For production, use:
- AWS Secrets Manager
- Azure Key Vault
- Google Cloud Secret Manager
- HashiCorp Vault

**Never use `.env` files in production**

---

## Emergency Contacts

**AMD Cloud Support:**
- Dashboard: https://www.amd.com/en/developer/resources/developer-cloud.html
- Email: developer-cloud@amd.com

**Billing Issues:**
- Check AMD Cloud billing dashboard
- Contact support with instance ID
- Request usage report

---

## Checklist for May 8 Demo

Before demo:
- [ ] AMD Cloud API key is set in `backend/.env`
- [ ] `.env` is in `.gitignore`
- [ ] Config test passes
- [ ] Backend starts without errors
- [ ] AMD model client test passes
- [ ] No API keys in git history
- [ ] Billing alerts are set
- [ ] Instance termination procedure is documented

After demo:
- [ ] All AMD Cloud instances terminated
- [ ] Billing has stopped
- [ ] Total cost documented
- [ ] Results saved locally
- [ ] API keys rotated (if needed)

---

**Last Updated:** May 5, 2026  
**Status:** Ready for use  
**Security Level:** High - API keys required

---

# Made with Bob