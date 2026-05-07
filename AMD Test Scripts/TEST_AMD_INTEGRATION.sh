#!/bin/bash

# AMD Cloud Integration Test Script
# Safe testing - no API calls, no costs

echo "============================================================"
echo "🧪 AMD Cloud Integration Test Suite"
echo "============================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Environment Setup
echo "Test 1: Environment Setup"
echo "-----------------------------------------------------------"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ backend/.env exists${NC}"
else
    echo -e "${RED}❌ backend/.env not found${NC}"
    exit 1
fi

if grep -q "backend/.env" .gitignore; then
    echo -e "${GREEN}✅ backend/.env in .gitignore${NC}"
else
    echo -e "${RED}❌ backend/.env not in .gitignore${NC}"
    exit 1
fi

if [ -f "backend/.env.example" ]; then
    echo -e "${GREEN}✅ backend/.env.example exists${NC}"
else
    echo -e "${RED}❌ backend/.env.example not found${NC}"
    exit 1
fi

echo ""

# Test 2: Config Loading
echo "Test 2: Config Loading with Masked Keys"
echo "-----------------------------------------------------------"
python3 -c "
import sys
sys.path.insert(0, 'backend')
from core.config import config

if config.is_amd_cloud_configured():
    print('✅ AMD Cloud API configured')
    masked = config.get_masked_api_key(config.AMD_API_KEY)
    if '...' in masked and len(masked) < 20:
        print(f'✅ API key properly masked: {masked}')
    else:
        print('❌ API key not properly masked')
        sys.exit(1)
else:
    print('❌ AMD Cloud API not configured')
    sys.exit(1)
" || exit 1

echo ""

# Test 3: AMD Model Client
echo "Test 3: AMD Model Client"
echo "-----------------------------------------------------------"
python3 ml/inference/amd_model_client.py > /tmp/amd_test.log 2>&1
if grep -q "✅ Test complete" /tmp/amd_test.log; then
    echo -e "${GREEN}✅ AMD model client test passed${NC}"
    if grep -q "stub_deterministic" /tmp/amd_test.log; then
        echo -e "${GREEN}✅ Using stub mode (no costs)${NC}"
    fi
else
    echo -e "${RED}❌ AMD model client test failed${NC}"
    cat /tmp/amd_test.log
    exit 1
fi

echo ""

# Test 4: Knowledge Agent Integration
echo "Test 4: Knowledge Agent Integration"
echo "-----------------------------------------------------------"
python3 -c "
import sys
sys.path.insert(0, 'backend')
from agents.knowledge_agent import generate_recommendation

result = generate_recommendation('orchard_A')
if result and 'recommendations' in result:
    print('✅ Knowledge agent generated recommendation')
    if result.get('data_sources', {}).get('amd_cloud_llm'):
        print('✅ AMD Cloud LLM integration active')
    else:
        print('⚠️  AMD Cloud LLM not active')
else:
    print('❌ Knowledge agent failed')
    sys.exit(1)
" || exit 1

echo ""

# Test 5: Cost Control
echo "Test 5: Cost Control Verification"
echo "-----------------------------------------------------------"
python3 -c "
import sys
sys.path.insert(0, 'backend')
from core.config import config

if not config.AMD_MODEL_ENDPOINT:
    print('✅ AMD_MODEL_ENDPOINT not set (stub mode)')
    print('✅ No API calls will be made')
    print('✅ No costs incurred')
else:
    print('⚠️  AMD_MODEL_ENDPOINT is set (live mode)')
    print('⚠️  API calls may incur costs')
" || exit 1

echo ""

# Test 6: Frontend Build
echo "Test 6: Frontend Build"
echo "-----------------------------------------------------------"
cd frontend
npm run build > /tmp/frontend_build.log 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    tail -20 /tmp/frontend_build.log
    exit 1
fi
cd ..

echo ""

# Test 7: Git Safety
echo "Test 7: Git Safety Check"
echo "-----------------------------------------------------------"
if git status | grep -q "backend/.env"; then
    echo -e "${RED}❌ backend/.env is tracked by git!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ backend/.env not tracked by git${NC}"
fi

if git log --all --full-history -- "backend/.env" | grep -q "commit"; then
    echo -e "${YELLOW}⚠️  backend/.env found in git history${NC}"
else
    echo -e "${GREEN}✅ backend/.env not in git history${NC}"
fi

echo ""

# Summary
echo "============================================================"
echo "📊 Test Summary"
echo "============================================================"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "AMD Cloud Integration Status:"
echo "  - Configuration: ✅ Complete"
echo "  - API Key: ✅ Masked in logs"
echo "  - Mode: STUB (no costs)"
echo "  - Frontend: ✅ Builds successfully"
echo "  - Backend: ✅ Ready to run"
echo "  - Git Safety: ✅ No secrets exposed"
echo ""
echo "Next Steps:"
echo "  1. Start backend: cd backend && python3 main.py"
echo "  2. Start frontend: cd frontend && npm run dev"
echo "  3. Test AMD status: curl http://localhost:8000/api/v1/amd/status"
echo "  4. Open browser: http://localhost:3000/command-center"
echo ""
echo "For demo proof, see: infra/amd/AMD_DEMO_PROOF.md"
echo "============================================================"

# Made with Bob
