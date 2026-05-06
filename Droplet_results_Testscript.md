oot@0:~/avocado-orchard-digital-ai-application# cd /root/avocado-orchard-digital-ai-application

sed -i 's/grep -q '\''"success": true'\''/grep -Eq '\''"success"[[:space:]]*:[[:space:]]*true'\''/g' TEST_LIVE_AMD_INFERENCE.sh
root@0:~/avocado-orchard-digital-ai-application# cd /root/avocado-orchard-digital-ai-application
API_BASE_URL=http://localhost:8001 bash TEST_LIVE_AMD_INFERENCE.sh
==========================================
AMD MI300X Live Inference Test
==========================================

Backend URL: http://localhost:8001
API Base: http://localhost:8001/api/v1

Test 1: Checking AMD Status...
GET http://localhost:8001/api/v1/amd/status

{
    "success": true,
    "data": {
        "amd_configured": true,
        "mode": "live",
        "model_name": "Qwen/Qwen2.5-7B-Instruct",
        "endpoint_configured": true,
        "gpu_target": "AMD MI300X",
        "api_key_masked": "dop_...ad2b",
        "fallback_enabled": true,
        "api_url": "https://api.amd.cloud/v1",
        "connection_status": "configured",
        "ready_for_testing": true,
        "vllm_configured": false,
        "gpu_enabled": true,
        "note": "Live AMD MI300X vLLM endpoint configured and reachable; fallback enabled if endpoint fails."
    }
}

✅ AMD Status: LIVE MODE
   vLLM endpoint is configured and reachable

==========================================
Test 2: Agent Command Processing
==========================================
POST http://localhost:8001/api/v1/agent/command

{
    "success": true,
    "command": "show avocado belt",
    "understood": true,
    "action": "show_avocado_belt",
    "message": "Displaying Michoac\u00e1n avocado belt boundary and municipalities.",
    "data": {
        "belt_bounds": {
            "id": "michoacan_avocado_belt",
            "name": "Michoac\u00e1n Avocado Belt",
            "lat_min": 18.75,
            "lat_max": 20.0,
            "lng_min": -103.2167,
            "lng_max": -101.7833,
            "description": "Primary avocado production belt in Michoac\u00e1n, defined from approximately 18\u00b045\u2032 to 20\u00b000\u2032 N and 101\u00b047\u2032 to 103\u00b013\u2032 W."
        },
        "total_municipalities": 8
    }
}

✅ Test 2: PASS - Agent command processed successfully

==========================================
Test 3: AI Recommendation Generation
==========================================
POST http://localhost:8001/api/v1/agent

{
    "success": true,
    "data": {
        "orchard_id": "tancitaro",
        "orchard_name": "Tanc\u00edtaro",
        "recommendation": "MODERATE: Tanc\u00edtaro shows moderate stress (NDVI: 0.71). Increase monitoring frequency and consider supplemental irrigation. Expected yield impact: 5-10% potential loss. Maintain current management with adjustments.",
        "model": "deterministic",
        "context": {
            "type": "municipality",
            "data": {
                "id": "tancitaro",
                "name": "Tanc\u00edtaro",
                "state": "Michoac\u00e1n",
                "country": "Mexico",
                "lat": 19.33,
                "lng": -102.36,
                "estimated_hectares": 30000,
                "production_rank": 1,
                "stress_level": "medium",
                "ndvi_average": 0.71,
                "projected_profit_usd": 1850000,
                "note": "Major avocado growing area near Pico de Tanc\u00edtaro."
            },
            "source": "mexico_avocado_network"
        },
        "mode": "stub"
    }
}

✅ Test 3: PASS - Agent recommendation generated successfully

==========================================
Test 4: Mexico Orchard Network Analytics
==========================================
GET http://localhost:8001/api/v1/orchard-network/mexico/analytics

{
    "success": true,
    "data": {
        "total_estimated_hectares": 114500,
        "total_municipalities": 8,
        "total_clusters": 5,
        "average_ndvi": 0.66,
        "top_production_municipality": {
            "id": "tancitaro",
            "name": "Tanc\u00edtaro",
            "state": "Michoac\u00e1n",
            "country": "Mexico",
            "lat": 19.33,
            "lng": -102.36,
            "estimated_hectares": 30000,
            "production_rank": 1,
            "stress_level": "medium",
            "ndvi_average": 0.71,
            "projected_profit_usd": 1850000,
            "note": "Major avocado growing area near Pico de Tanc\u00edtaro."
        },
        "highest_risk_municipality": {
            "id": "zitacuaro",
            "name": "Zit\u00e1cuaro",
            "state": "Michoac\u00e1n",
            "country": "Mexico",
            "lat": 19.43,
            "lng": -100.36,
            "estimated_hectares": 6000,
            "stress_level": "high",
            "ndvi_average": 0.58,
            "projected_profit_usd": 390000,
            "note": "Eastern avocado production cluster."
        },
        "projected_profit_at_risk_usd": 1240000,
        "belt_bounds": {
            "id": "michoacan_avocado_belt",
            "name": "Michoac\u00e1n Avocado Belt",
            "lat_min": 18.75,
            "lat_max": 20.0,
            "lng_min": -103.2167,
            "lng_max": -101.7833,
            "description": "Primary avocado production belt in Michoac\u00e1n, defined from approximately 18\u00b045\u2032 to 20\u00b000\u2032 N and 101\u00b047\u2032 to 103\u00b013\u2032 W."
        }
    }
}

✅ Test 4: PASS - Mexico network data loaded successfully
   Total municipalities: 8

==========================================
Test Summary
==========================================

✅ ALL TESTS PASSED

AMD MI300X Live Mode Active - All 4 tests passing:
  ✓ Test 1: AMD status returns mode 'live'
  ✓ Test 2: Agent command processes successfully
  ✓ Test 3: AI recommendation generated with live vLLM
  ✓ Test 4: Mexico network analytics loaded

Your setup is ready for production inference!

Next steps:
  1. Monitor vLLM server logs for performance
  2. Test with various orchard scenarios
  3. Benchmark inference latency
  4. Scale up if needed (multi-GPU)

Port Configuration:
  - vLLM Server: Port 8000
  - FastAPI Backend: Port 8001
  - Test Script: Using http://localhost:8001

root@0:~/avocado-orchard-digital-ai-application# root@0:~/avocado-orchard-digital-ai-application# cd /root/avocado-orchard-digital-ai-application
API_BASE_URL=http://localhost:8001 bash TEST_LIVE_AMD_INFERENCE.sh
==========================================
AMD MI300X Live Inference Test
==========================================

Backend URL: http://localhost:8001
API Base: http://localhost:8001/api/v1

Test 1: Checking AMD Status...
GET http://localhost:8001/api/v1/amd/status

{
    "success": true,
    "data": {
        "amd_configured": true,
        "mode": "live",
        "model_name": "Qwen/Qwen2.5-7B-Instruct",
        "endpoint_configured": true,
        "gpu_target": "AMD MI300X",
        "api_key_masked": "dop_...ad2b",
root@0:~/avocado-orchard-digital-ai-application# ^CLLMllyb000\u2032 N and 1
root@0:~/avocado-orchard-digital-ai-application# curl http://localhost:8000/v1/models
curl http://localhost:8001/api/v1/amd/status
API_BASE_URL=http://localhost:8001 bash TEST_LIVE_AMD_INFERENCE.sh
{"object":"list","data":[{"id":"Qwen/Qwen2.5-7B-Instruct","object":"model","created":1778098004,"owned_by":"vllm","root":"Qwen/Qwen2.5-7B-Instruct","parent":null,"max_model_len":32768,"permission":[{"id":"modelperm-9d853985c1510027","object":"model_permission","created":1778098004,"allow_create_engine":false,"allow_sampling":true,"allow_logprobs":true,"allow_search_indices":false,"allow_view":true,"allow_fine_tuning":false,"organization":"*","group":null,"is_blocking":false}]}]}{"success":true,"data":{"amd_configured":true,"mode":"live","model_name":"Qwen/Qwen2.5-7B-Instruct","endpoint_configured":true,"gpu_target":"AMD MI300X","api_key_masked":"dop_...ad2b","fallback_enabled":true,"api_url":"https://api.amd.cloud/v1","connection_status":"configured","ready_for_testing":true,"vllm_configured":false,"gpu_enabled":true,"note":"Live AMD MI300X vLLM endpoint configured and reachable; fallback enabled if endpoint fails."}}==========================================
AMD MI300X Live Inference Test
==========================================

Backend URL: http://localhost:8001
API Base: http://localhost:8001/api/v1

Test 1: Checking AMD Status...
GET http://localhost:8001/api/v1/amd/status

{
    "success": true,
    "data": {
        "amd_configured": true,
        "mode": "live",
        "model_name": "Qwen/Qwen2.5-7B-Instruct",
        "endpoint_configured": true,
        "gpu_target": "AMD MI300X",
        "api_key_masked": "dop_...ad2b",
        "fallback_enabled": true,
        "api_url": "https://api.amd.cloud/v1",
        "connection_status": "configured",
        "ready_for_testing": true,
        "vllm_configured": false,
        "gpu_enabled": true,
        "note": "Live AMD MI300X vLLM endpoint configured and reachable; fallback enabled if endpoint fails."
    }
}

✅ AMD Status: LIVE MODE
   vLLM endpoint is configured and reachable

==========================================
Test 2: Agent Command Processing
==========================================
POST http://localhost:8001/api/v1/agent/command

{
    "success": true,
    "command": "show avocado belt",
    "understood": true,
    "action": "show_avocado_belt",
    "message": "Displaying Michoac\u00e1n avocado belt boundary and municipalities.",
    "data": {
        "belt_bounds": {
            "id": "michoacan_avocado_belt",
            "name": "Michoac\u00e1n Avocado Belt",
            "lat_min": 18.75,
            "lat_max": 20.0,
            "lng_min": -103.2167,
            "lng_max": -101.7833,
            "description": "Primary avocado production belt in Michoac\u00e1n, defined from approximately 18\u00b045\u2032 to 20\u00b000\u2032 N and 101\u00b047\u2032 to 103\u00b013\u2032 W."
        },
        "total_municipalities": 8
    }
}

✅ Test 2: PASS - Agent command processed successfully

==========================================
Test 3: AI Recommendation Generation
==========================================
POST http://localhost:8001/api/v1/agent

{
    "success": true,
    "data": {
        "orchard_id": "tancitaro",
        "orchard_name": "Tanc\u00edtaro",
        "recommendation": "MODERATE: Tanc\u00edtaro shows moderate stress (NDVI: 0.71). Increase monitoring frequency and consider supplemental irrigation. Expected yield impact: 5-10% potential loss. Maintain current management with adjustments.",
        "model": "deterministic",
        "context": {
            "type": "municipality",
            "data": {
                "id": "tancitaro",
                "name": "Tanc\u00edtaro",
                "state": "Michoac\u00e1n",
                "country": "Mexico",
                "lat": 19.33,
                "lng": -102.36,
                "estimated_hectares": 30000,
                "production_rank": 1,
                "stress_level": "medium",
                "ndvi_average": 0.71,
                "projected_profit_usd": 1850000,
                "note": "Major avocado growing area near Pico de Tanc\u00edtaro."
            },
            "source": "mexico_avocado_network"
        },
        "mode": "stub"
    }
}

✅ Test 3: PASS - Agent recommendation generated successfully

==========================================
Test 4: Mexico Orchard Network Analytics
==========================================
GET http://localhost:8001/api/v1/orchard-network/mexico/analytics

{
    "success": true,
    "data": {
        "total_estimated_hectares": 114500,
        "total_municipalities": 8,
        "total_clusters": 5,
        "average_ndvi": 0.66,
        "top_production_municipality": {
            "id": "tancitaro",
            "name": "Tanc\u00edtaro",
            "state": "Michoac\u00e1n",
            "country": "Mexico",
            "lat": 19.33,
            "lng": -102.36,
            "estimated_hectares": 30000,
            "production_rank": 1,
            "stress_level": "medium",
            "ndvi_average": 0.71,
            "projected_profit_usd": 1850000,
            "note": "Major avocado growing area near Pico de Tanc\u00edtaro."
        },
        "highest_risk_municipality": {
            "id": "zitacuaro",
            "name": "Zit\u00e1cuaro",
            "state": "Michoac\u00e1n",
            "country": "Mexico",
            "lat": 19.43,
            "lng": -100.36,
            "estimated_hectares": 6000,
            "stress_level": "high",
            "ndvi_average": 0.58,
            "projected_profit_usd": 390000,
            "note": "Eastern avocado production cluster."
        },
        "projected_profit_at_risk_usd": 1240000,
        "belt_bounds": {
            "id": "michoacan_avocado_belt",
            "name": "Michoac\u00e1n Avocado Belt",
            "lat_min": 18.75,
            "lat_max": 20.0,
            "lng_min": -103.2167,
            "lng_max": -101.7833,
            "description": "Primary avocado production belt in Michoac\u00e1n, defined from approximately 18\u00b045\u2032 to 20\u00b000\u2032 N and 101\u00b047\u2032 to 103\u00b013\u2032 W."
        }
    }
}

✅ Test 4: PASS - Mexico network data loaded successfully
   Total municipalities: 8

==========================================
Test Summary
==========================================

✅ ALL TESTS PASSED

AMD MI300X Live Mode Active - All 4 tests passing:
  ✓ Test 1: AMD status returns mode 'live'
  ✓ Test 2: Agent command processes successfully
  ✓ Test 3: AI recommendation generated with live vLLM
  ✓ Test 4: Mexico network analytics loaded

Your setup is ready for production inference!

Next steps:
  1. Monitor vLLM server logs for performance
  2. Test with various orchard scenarios
  3. Benchmark inference latency
  4. Scale up if needed (multi-GPU)

Port Configuration:
  - vLLM Server: Port 8000
  - FastAPI Backend: Port 8001
  - Test Script: Using http://localhost:8001
