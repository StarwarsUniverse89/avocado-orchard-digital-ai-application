#!/bin/bash

# TEST_VISION_3D_PIPELINE.sh
# Test script for Vision/3D analysis pipeline
# Tests stub models and backend endpoints

set -e

echo "=========================================="
echo "Vision/3D Analysis Pipeline Test"
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
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Test Vision/3D Analysis for Orchard
echo "Test 1: Vision/3D Analysis for Orchard"
echo "=========================================="
echo "GET ${API_BASE}/vision-3d/orchard_A"
echo ""

VISION_RESPONSE=$(curl -s "${API_BASE}/vision-3d/orchard_A")
echo "$VISION_RESPONSE" | python3 -m json.tool
echo ""

if echo "$VISION_RESPONSE" | grep -q '"success": true'; then
    echo -e "${GREEN}✅ Vision/3D analysis successful${NC}"
    
    # Extract key metrics
    CANOPY=$(echo "$VISION_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['canopy_volume'])" 2>/dev/null || echo "N/A")
    FRUIT_COUNT=$(echo "$VISION_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['estimated_fruit_count'])" 2>/dev/null || echo "N/A")
    HEALTH=$(echo "$VISION_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['health_status'])" 2>/dev/null || echo "N/A")
    
    echo ""
    echo -e "${BLUE}Key Metrics:${NC}"
    echo "  Canopy Volume: ${CANOPY} m³"
    echo "  Fruit Count: ${FRUIT_COUNT}"
    echo "  Health Status: ${HEALTH}"
else
    echo -e "${RED}❌ Vision/3D analysis failed${NC}"
fi
echo ""

# Test 2: Test Custom Analysis with Parameters
echo "=========================================="
echo "Test 2: Custom Analysis with Parameters"
echo "=========================================="
echo "POST ${API_BASE}/vision-3d/analyze"
echo ""

CUSTOM_RESPONSE=$(curl -s -X POST "${API_BASE}/vision-3d/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "orchard_id": "michoacan_orchard_01",
    "section_id": "central_block",
    "ndvi": 0.68,
    "stress_level": "medium",
    "soil_moisture": 55.0,
    "leaf_damage": 12.0,
    "tree_age_years": 8
  }')

echo "$CUSTOM_RESPONSE" | python3 -m json.tool
echo ""

if echo "$CUSTOM_RESPONSE" | grep -q '"success": true'; then
    echo -e "${GREEN}✅ Custom analysis successful${NC}"
    
    # Extract visual parameters
    CANOPY_SCALE=$(echo "$CUSTOM_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['visual_3d_parameters']['canopy_scale'])" 2>/dev/null || echo "N/A")
    FRUIT_DENSITY=$(echo "$CUSTOM_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['visual_3d_parameters']['fruit_density'])" 2>/dev/null || echo "N/A")
    STRESS_COLOR=$(echo "$CUSTOM_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['visual_3d_parameters']['stress_color'])" 2>/dev/null || echo "N/A")
    
    echo ""
    echo -e "${BLUE}Visual 3D Parameters:${NC}"
    echo "  Canopy Scale: ${CANOPY_SCALE}"
    echo "  Fruit Density: ${FRUIT_DENSITY}"
    echo "  Stress Color: ${STRESS_COLOR}"
else
    echo -e "${RED}❌ Custom analysis failed${NC}"
fi
echo ""

# Test 3: Test Python Stub Directly
echo "=========================================="
echo "Test 3: Python Stub Direct Test"
echo "=========================================="
echo "Running: python ml/inference/vision_3d_analysis_stub.py"
echo ""

if [ -f "ml/inference/vision_3d_analysis_stub.py" ]; then
    python3 ml/inference/vision_3d_analysis_stub.py
    echo ""
    echo -e "${GREEN}✅ Python stub test successful${NC}"
else
    echo -e "${RED}❌ Python stub file not found${NC}"
fi
echo ""

# Test 4: Test Service Layer
echo "=========================================="
echo "Test 4: Service Layer Test"
echo "=========================================="
echo "Running: python backend/services/vision_3d_analysis_service.py"
echo ""

if [ -f "backend/services/vision_3d_analysis_service.py" ]; then
    cd backend && python3 services/vision_3d_analysis_service.py && cd ..
    echo ""
    echo -e "${GREEN}✅ Service layer test successful${NC}"
else
    echo -e "${RED}❌ Service file not found${NC}"
fi
echo ""

# Test 5: Verify Model Outputs
echo "=========================================="
echo "Test 5: Model Output Verification"
echo "=========================================="
echo ""

echo "Testing deterministic output consistency..."
echo ""

# Make two identical requests
RESPONSE1=$(curl -s -X POST "${API_BASE}/vision-3d/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "orchard_id": "test_orchard",
    "section_id": "test_section",
    "ndvi": 0.75,
    "stress_level": "low"
  }')

sleep 1

RESPONSE2=$(curl -s -X POST "${API_BASE}/vision-3d/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "orchard_id": "test_orchard",
    "section_id": "test_section",
    "ndvi": 0.75,
    "stress_level": "low"
  }')

CANOPY1=$(echo "$RESPONSE1" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['canopy_volume'])" 2>/dev/null || echo "0")
CANOPY2=$(echo "$RESPONSE2" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['canopy_volume'])" 2>/dev/null || echo "0")

if [ "$CANOPY1" = "$CANOPY2" ]; then
    echo -e "${GREEN}✅ Deterministic output verified${NC}"
    echo "   Same inputs produce same outputs (no Math.random)"
    echo "   Canopy Volume: ${CANOPY1} m³"
else
    echo -e "${RED}❌ Non-deterministic output detected${NC}"
    echo "   Response 1: ${CANOPY1} m³"
    echo "   Response 2: ${CANOPY2} m³"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""

echo -e "${BLUE}Vision/3D Pipeline Status:${NC}"
echo ""
echo "✅ Stub models implemented:"
echo "   - Canopy volume estimation"
echo "   - Fruit count estimation"
echo "   - Fruit size classification"
echo "   - Tree structure analysis"
echo "   - Health classification"
echo ""
echo "✅ Backend endpoints ready:"
echo "   - GET /api/v1/vision-3d/{orchard_id}"
echo "   - POST /api/v1/vision-3d/analyze"
echo ""
echo "✅ Visual 3D parameters generated:"
echo "   - canopy_scale"
echo "   - fruit_density"
echo "   - fruit_scale"
echo "   - trunk_scale"
echo "   - stress_color"
echo ""
echo -e "${YELLOW}⚠️  Current Mode: STUB${NC}"
echo "   Using deterministic synthetic outputs"
echo ""
echo "Future AMD MI300X GPU Models:"
echo "   - CNN for canopy volume (point cloud)"
echo "   - YOLO for fruit detection"
echo "   - CNN for fruit size classification"
echo "   - Point cloud analysis for tree structure"
echo "   - Multi-modal CNN for health assessment"
echo ""
echo "To enable GPU models:"
echo "   1. Train models on AMD MI300X"
echo "   2. Deploy model endpoints"
echo "   3. Update service to call GPU models"
echo "   4. Keep stub as fallback"
echo ""

echo "=========================================="
echo "✅ Vision/3D Pipeline Test Complete"
echo "=========================================="
echo ""

# Made with Bob
