#!/bin/bash

# TEST_LIVE_AMD_INFERENCE.sh
# Test script for AMD MI300X live vLLM inference
# Run this after setting up vLLM on AMD MI300X instance

set -e

echo "=========================================="
echo "AMD MI300X Live Inference Test"
echo "=========================================="
echo ""

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
API_BASE="${BACKEND_URL}/api/v1"

echo "Backend URL: $BACKEND_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check AMD Status
echo "Test 1: Checking AMD Status..."
echo "GET ${API_BASE}/amd/status"
echo ""

AMD_STATUS=$(curl -s "${API_BASE}/amd/status")
echo "$AMD_STATUS" | python3 -m json.tool

# Extract mode
MODE=$(echo "$AMD_STATUS" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['mode'])" 2>/dev/null || echo "unknown")

echo ""
if [ "$MODE" = "live" ]; then
    echo -e "${GREEN}✅ AMD Status: LIVE MODE${NC}"
    echo "   vLLM endpoint is configured and reachable"
elif [ "$MODE" = "configured_stub" ]; then
    echo -e "${YELLOW}⚠️  AMD Status: CONFIGURED STUB MODE${NC}"
    echo "   AMD_API_KEY is set but AMD_MODEL_ENDPOINT is missing"
    echo "   Set AMD_MODEL_ENDPOINT in backend/.env to enable live mode"
elif [ "$MODE" = "stub" ]; then
    echo -e "${YELLOW}⚠️  AMD Status: STUB MODE${NC}"
    echo "   AMD Cloud not configured"
    echo "   Configure backend/.env to enable AMD inference"
else
    echo -e "${RED}❌ AMD Status: UNKNOWN${NC}"
fi
echo ""

# Test 2: Test Agent Command Processing
echo "=========================================="
echo "Test 2: Agent Command Processing"
echo "=========================================="
echo "POST ${API_BASE}/agent/command"
echo ""

COMMAND_RESPONSE=$(curl -s -X POST "${API_BASE}/agent/command" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "show avocado belt",
    "context": {}
  }')

echo "$COMMAND_RESPONSE" | python3 -m json.tool
echo ""

if echo "$COMMAND_RESPONSE" | grep -q '"success": true'; then
    echo -e "${GREEN}✅ Agent command processed successfully${NC}"
else
    echo -e "${RED}❌ Agent command failed${NC}"
fi
echo ""

# Test 3: Test AI Recommendation (uses vLLM if in live mode)
echo "=========================================="
echo "Test 3: AI Recommendation Generation"
echo "=========================================="
echo "POST ${API_BASE}/agent"
echo ""

RECOMMENDATION_RESPONSE=$(curl -s -X POST "${API_BASE}/agent" \
  -H "Content-Type: application/json" \
  -d '{
    "orchard_id": "orchard_A"
  }')

echo "$RECOMMENDATION_RESPONSE" | python3 -m json.tool
echo ""

# Check if response contains model info
if echo "$RECOMMENDATION_RESPONSE" | grep -q "vLLM on AMD MI300X"; then
    echo -e "${GREEN}✅ Live vLLM inference detected!${NC}"
    echo "   Recommendation generated using AMD MI300X GPU"
elif echo "$RECOMMENDATION_RESPONSE" | grep -q "stub"; then
    echo -e "${YELLOW}⚠️  Stub mode detected${NC}"
    echo "   Recommendation generated using deterministic logic"
else
    echo -e "${YELLOW}⚠️  Could not determine inference mode${NC}"
fi
echo ""

# Test 4: Test Mexico Orchard Network
echo "=========================================="
echo "Test 4: Mexico Orchard Network"
echo "=========================================="
echo "GET ${API_BASE}/orchard-network/mexico/analytics"
echo ""

MEXICO_RESPONSE=$(curl -s "${API_BASE}/orchard-network/mexico/analytics")
echo "$MEXICO_RESPONSE" | python3 -m json.tool
echo ""

if echo "$MEXICO_RESPONSE" | grep -q '"success": true'; then
    echo -e "${GREEN}✅ Mexico network data loaded${NC}"
else
    echo -e "${RED}❌ Mexico network data failed${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""

if [ "$MODE" = "live" ]; then
    echo -e "${GREEN}✅ AMD MI300X Live Mode Active${NC}"
    echo ""
    echo "Your setup is ready for production inference!"
    echo ""
    echo "Next steps:"
    echo "  1. Monitor vLLM server logs for performance"
    echo "  2. Test with various orchard scenarios"
    echo "  3. Benchmark inference latency"
    echo "  4. Scale up if needed (multi-GPU)"
elif [ "$MODE" = "configured_stub" ]; then
    echo -e "${YELLOW}⚠️  AMD Configured but in Stub Mode${NC}"
    echo ""
    echo "To enable live vLLM inference:"
    echo "  1. Start vLLM server on AMD MI300X instance"
    echo "  2. Set AMD_MODEL_ENDPOINT in backend/.env"
    echo "     Example: AMD_MODEL_ENDPOINT=http://your-mi300x-ip:8000"
    echo "  3. Restart backend server"
    echo "  4. Run this test again"
else
    echo -e "${YELLOW}⚠️  AMD Not Configured - Stub Mode${NC}"
    echo ""
    echo "To enable AMD MI300X inference:"
    echo "  1. Copy backend/.env.example to backend/.env"
    echo "  2. Set AMD_API_KEY and AMD_MODEL_ENDPOINT"
    echo "  3. Restart backend server"
    echo "  4. Run this test again"
fi
echo ""

# Exit with appropriate code
if [ "$MODE" = "live" ]; then
    exit 0
else
    exit 1
fi

# Made with Bob
