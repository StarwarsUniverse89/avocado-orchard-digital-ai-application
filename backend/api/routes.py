from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import json
from pathlib import Path
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.orchard_service import get_orchard_by_id, load_orchards
from services.financial_service import (
    get_financial_prediction,
    get_orchard_financial_summary,
    get_roi_analysis,
)

router = APIRouter()

# Orchards endpoints
@router.get("/orchards", tags=["Orchards"])
async def get_all_orchards():
    """Get all orchards with their current metrics"""
    try:
        orchards = load_orchards()
        return {
            "success": True,
            "count": len(orchards),
            "data": orchards,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orchards/{orchard_id}", tags=["Orchards"])
async def get_orchard(orchard_id: str):
    """Get a specific orchard by ID"""
    orchard = get_orchard_by_id(orchard_id)
    if orchard is None:
        raise HTTPException(status_code=404, detail=f"Orchard {orchard_id} not found")
    return {
        "success": True,
        "data": orchard,
    }


@router.get("/orchards/{orchard_id}/metrics", tags=["Orchards"])
async def get_orchard_metrics(orchard_id: str):
    """Get current metrics for a specific orchard"""
    orchard = get_orchard_by_id(orchard_id)
    if orchard is None:
        raise HTTPException(status_code=404, detail=f"Orchard {orchard_id} not found")
    
    return {
        "success": True,
        "orchard_id": orchard_id,
        "metrics": {
            "temperature": orchard.get("temperature"),
            "soil_moisture": orchard.get("soil_moisture"),
            "leaf_damage": orchard.get("leaf_damage"),
            "ndvi": orchard.get("ndvi"),
            "yield_per_tree": orchard.get("yield_per_tree"),
        },
    }


# AI Recommendations endpoints
@router.get("/ai/recommendations", tags=["AI"])
async def get_recommendations():
    """Get AI-generated recommendations for all orchards"""
    return {
        "success": True,
        "recommendations": [
            {
                "id": "rec_001",
                "orchard_id": "orchard_A",
                "title": "Maintain Current Irrigation",
                "description": "Soil moisture at optimal level (70%). Continue current irrigation schedule.",
                "priority": "low",
                "confidence": 0.95,
                "impact": "Maintain yield",
                "action": "monitor",
            },
            {
                "id": "rec_002",
                "orchard_id": "orchard_B",
                "title": "Increase Irrigation",
                "description": "Soil moisture below optimal (40%). Recommend 15% increase in irrigation.",
                "priority": "high",
                "confidence": 0.92,
                "impact": "+12% yield protection",
                "action": "increase_irrigation",
                "parameters": {"increase_percentage": 15},
            },
            {
                "id": "rec_003",
                "orchard_id": "orchard_B",
                "title": "Pest Monitoring Alert",
                "description": "Leaf damage at 20%, approaching economic injury level (17% PLAD).",
                "priority": "medium",
                "confidence": 0.88,
                "impact": "Prevent 5-15% yield loss",
                "action": "pest_treatment",
            },
        ],
    }


@router.get("/ai/recommendations/{orchard_id}", tags=["AI"])
async def get_orchard_recommendations(orchard_id: str):
    """Get AI recommendations for a specific orchard"""
    orchard = get_orchard_by_id(orchard_id)
    if orchard is None:
        raise HTTPException(status_code=404, detail=f"Orchard {orchard_id} not found")
    
    # Generate recommendations based on orchard metrics
    recommendations = []
    
    # Check soil moisture
    if orchard.get("soil_moisture", 0) < 50:
        recommendations.append({
            "id": f"rec_{orchard_id}_moisture",
            "title": "Increase Irrigation",
            "description": f"Soil moisture at {orchard.get('soil_moisture')}%. Recommend increasing irrigation.",
            "priority": "high",
            "confidence": 0.92,
            "impact": "+12% yield protection",
        })
    
    # Check leaf damage
    if orchard.get("leaf_damage", 0) > 15:
        recommendations.append({
            "id": f"rec_{orchard_id}_pest",
            "title": "Pest Treatment Required",
            "description": f"Leaf damage at {orchard.get('leaf_damage')}%, approaching economic injury level.",
            "priority": "medium",
            "confidence": 0.88,
            "impact": "Prevent 5-15% yield loss",
        })
    
    return {
        "success": True,
        "orchard_id": orchard_id,
        "recommendations": recommendations,
    }


# Simulation endpoints
@router.post("/simulation/run", tags=["Simulation"])
async def run_simulation(scenario: Dict[str, Any]):
    """Run a simulation scenario"""
    return {
        "success": True,
        "simulation_id": "sim_001",
        "status": "running",
        "message": "Simulation started successfully",
        "scenario": scenario,
    }


@router.get("/simulation/{simulation_id}/status", tags=["Simulation"])
async def get_simulation_status(simulation_id: str):
    """Get the status of a running simulation"""
    return {
        "success": True,
        "simulation_id": simulation_id,
        "status": "completed",
        "progress": 100,
        "results": {
            "yield_forecast": 19500,
            "revenue_projection": 54600,
            "risk_level": "medium",
        },
    }


# Analytics endpoints
@router.get("/analytics/summary", tags=["Analytics"])
async def get_analytics_summary():
    """Get overall analytics summary"""
    orchards = load_orchards()
    
    total_trees = sum(o.get("trees_per_acre", 0) for o in orchards)
    avg_yield = sum(o.get("yield_per_tree", 0) for o in orchards) / len(orchards) if orchards else 0
    avg_moisture = sum(o.get("soil_moisture", 0) for o in orchards) / len(orchards) if orchards else 0
    
    return {
        "success": True,
        "summary": {
            "total_orchards": len(orchards),
            "total_trees": total_trees,
            "average_yield_per_tree": round(avg_yield, 2),
            "average_soil_moisture": round(avg_moisture, 2),
            "system_status": "operational",
        },
    }


# System status endpoints
@router.get("/system/status", tags=["System"])
async def get_system_status():
    """Get system status and health"""
    return {
        "success": True,
        "status": "operational",
        "services": {
            "api": "online",
            "websocket": "online",
            "gpu_compute": "ready",
            "ai_models": "loaded",
            "database": "connected",
        },
        "metrics": {
            "uptime": "99.9%",
            "response_time": "45ms",
            "active_connections": 0,
        },
    }


# Financial endpoints
@router.get("/financial/{orchard_id}", tags=["Financial"])
async def get_financial_summary(orchard_id: str):
    """Get current financial summary for an orchard"""
    try:
        summary = get_orchard_financial_summary(orchard_id)
        return {
            "success": True,
            "data": summary,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/financial/predict", tags=["Financial"])
async def predict_financial_impact(request: Dict[str, Any]):
    """
    Predict financial impact of a scenario
    
    Request body:
    {
        "orchard_id": "orchard_A",
        "scenario": {
            "temperature": 36,
            "soil_moisture": 32,
            "pest_pressure": 7,
            "ndvi": 0.52
        }
    }
    """
    try:
        orchard_id = request.get("orchard_id")
        scenario = request.get("scenario", {})
        
        if not orchard_id:
            raise HTTPException(status_code=400, detail="orchard_id is required")
        
        prediction = get_financial_prediction(orchard_id, scenario)
        return {
            "success": True,
            "data": prediction,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/financial/{orchard_id}/roi-analysis", tags=["Financial"])
async def get_roi_scenarios(orchard_id: str):
    """Get ROI analysis for multiple scenarios"""
    try:
        analysis = get_roi_analysis(orchard_id)
        return {
            "success": True,
            "data": analysis,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Satellite endpoints
@router.get("/satellite/{orchard_id}", tags=["Satellite"])
async def get_satellite(orchard_id: str):
    """Get satellite/NDVI data for an orchard"""
    try:
        from services.satellite_service import get_satellite_data
        data = get_satellite_data(orchard_id)
        return {
            "success": True,
            "data": data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/satellite/{orchard_id}/ndvi", tags=["Satellite"])
async def get_ndvi_timeseries(orchard_id: str, days: int = 30):
    """Get NDVI time series data for an orchard"""
    try:
        from services.satellite_service import get_ndvi_timeseries
        data = get_ndvi_timeseries(orchard_id, days)
        return {
            "success": True,
            "data": data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/satellite/{orchard_id}/heatmap", tags=["Satellite"])
async def get_stress_heatmap_data(orchard_id: str):
    """Get stress heatmap data for an orchard"""
    try:
        from services.satellite_service import get_stress_heatmap
        data = get_stress_heatmap(orchard_id)
        return {
            "success": True,
            "data": data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Vision endpoints
@router.get("/vision/{orchard_id}", tags=["Vision"])
async def get_vision_analysis(orchard_id: str):
    """Get computer vision analysis for an orchard"""
    try:
        from services.vision_service import analyze_orchard_vision
        data = analyze_orchard_vision(orchard_id)
        return {
            "success": True,
            "data": data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Yield endpoints
@router.get("/yield/{orchard_id}", tags=["Yield"])
async def get_yield_prediction(orchard_id: str):
    """Get yield prediction for an orchard"""
    try:
        from services.yield_service import predict_yield
        data = predict_yield(orchard_id)
        return {
            "success": True,
            "data": data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Agent endpoints
@router.post("/agent", tags=["AI"])
async def get_agent_recommendation(request: Dict[str, Any]):
    """
    Get AI agent recommendation
    
    Request body:
    {
        "orchard_id": "orchard_A"
    }
    """
    try:
        from agents.knowledge_agent import generate_recommendation
        orchard_id = request.get("orchard_id")
        
        if not orchard_id:
            raise HTTPException(status_code=400, detail="orchard_id is required")
        
        recommendation = generate_recommendation(orchard_id)
        return {
            "success": True,
            "data": recommendation,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# AMD Cloud API Status endpoint
@router.get("/amd/status", tags=["System"])
async def get_amd_status():
    """Get AMD Cloud API configuration and status"""
    try:
        from core.config import config
        
        # Import AMD client safely
        try:
            sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ml', 'inference'))
            from amd_model_client import amd_client
            AMD_CLIENT_AVAILABLE = True
        except ImportError:
            AMD_CLIENT_AVAILABLE = False
            amd_client = None
        
        # Get connection status if client available
        connection_status = {}
        if AMD_CLIENT_AVAILABLE and amd_client:
            connection_status = amd_client.test_connection()
        
        # Determine mode
        mode = "stub"
        if config.is_amd_cloud_configured() and config.AMD_MODEL_ENDPOINT:
            mode = "live"
        elif config.is_amd_cloud_configured():
            mode = "configured_stub"
        
        return {
            "success": True,
            "data": {
                "amd_configured": config.is_amd_cloud_configured(),
                "mode": mode,
                "model_name": config.MODEL_NAME,
                "endpoint_configured": bool(config.AMD_MODEL_ENDPOINT),
                "gpu_target": "AMD MI300X",
                "api_key_masked": config.get_masked_api_key(config.AMD_API_KEY),
                "fallback_enabled": True,
                "api_url": config.AMD_API_URL,
                "connection_status": connection_status.get("status", "unknown"),
                "ready_for_testing": connection_status.get("ready_for_testing", False),
                "vllm_configured": config.is_vllm_configured(),
                "gpu_enabled": config.AMD_GPU_ENABLED,
                "note": "AMD Cloud configured; inference running in safe stub mode until AMD_MODEL_ENDPOINT is set." if mode == "configured_stub" else "Using deterministic stub responses"
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking AMD status: {str(e)}")


# Mexico Orchard Network endpoints
@router.get("/orchard-network/mexico", tags=["Mexico Network"])
async def get_mexico_orchard_network():
    """Get Mexico avocado orchard network data"""
    try:
        data_path = Path(__file__).parent.parent / "data" / "mexico_avocado_regions.json"
        with open(data_path, 'r') as f:
            data = json.load(f)
        
        return {
            "success": True,
            "data": data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orchard-network/mexico/analytics", tags=["Mexico Network"])
async def get_mexico_analytics():
    """Get analytics for Mexico avocado network"""
    try:
        data_path = Path(__file__).parent.parent / "data" / "mexico_avocado_regions.json"
        with open(data_path, 'r') as f:
            data = json.load(f)
        
        # Calculate analytics
        municipalities = data.get("municipalities", [])
        clusters = data.get("clusters", [])
        
        total_hectares = sum(m.get("estimated_hectares", 0) for m in municipalities)
        avg_ndvi = sum(m.get("ndvi_average", 0) for m in municipalities) / len(municipalities) if municipalities else 0
        
        # Find top production municipality
        top_municipality = max(municipalities, key=lambda m: m.get("estimated_hectares", 0)) if municipalities else None
        
        # Find highest risk municipality
        stress_map = {"low": 1, "medium": 2, "high": 3}
        highest_risk = max(
            municipalities,
            key=lambda m: (stress_map.get(m.get("stress_level", "low"), 0), -m.get("ndvi_average", 1))
        ) if municipalities else None
        
        # Calculate profit at risk
        profit_at_risk = sum(c.get("projected_profit_risk_usd", 0) for c in clusters)
        
        return {
            "success": True,
            "data": {
                "total_estimated_hectares": total_hectares,
                "total_municipalities": len(municipalities),
                "total_clusters": len(clusters),
                "average_ndvi": round(avg_ndvi, 2),
                "top_production_municipality": top_municipality,
                "highest_risk_municipality": highest_risk,
                "projected_profit_at_risk_usd": profit_at_risk,
                "belt_bounds": data.get("belt_bounds"),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/agent/command", tags=["AI"])
async def process_agent_command(request: Dict[str, Any]):
    """
    Process natural language command through AI agent
    
    Request body:
    {
        "command": "show avocado belt",
        "context": {}
    }
    """
    try:
        command = request.get("command", "").strip()
        context = request.get("context", {})
        
        if not command:
            raise HTTPException(status_code=400, detail="command is required")
        
        # Import agent
        from agents.knowledge_agent import generate_recommendation
        
        # Process command (simplified - in production would use LLM)
        command_lower = command.lower()
        
        response = {
            "success": True,
            "command": command,
            "understood": True,
            "action": None,
            "message": "",
        }
        
        # Parse common commands
        if "avocado belt" in command_lower:
            response["action"] = "show_avocado_belt"
            response["message"] = "Displaying Michoacán avocado belt boundary and municipalities."
        elif "production cluster" in command_lower:
            response["action"] = "show_production_clusters"
            response["message"] = "Showing production clusters across the avocado belt."
        elif "orchard network" in command_lower and "michoacán" in command_lower:
            response["action"] = "create_orchard_network"
            response["message"] = "Generating synthetic orchard network in Michoacán."
        elif "highest production" in command_lower:
            response["action"] = "show_top_municipality"
            response["message"] = "Flying to Tancítaro, the highest production municipality."
        elif "highest stress" in command_lower or "highest risk" in command_lower:
            response["action"] = "find_highest_stress_orchard"
            response["message"] = "Locating the highest stress orchard in the avocado belt."
        elif "compare" in command_lower and ("tancítaro" in command_lower or "uruapan" in command_lower):
            response["action"] = "compare_municipalities"
            response["message"] = "Comparing Tancítaro and Uruapan production metrics."
        elif "3d twin" in command_lower and "highest risk" in command_lower:
            response["action"] = "enter_3d_twin_highest_risk"
            response["message"] = "Opening 3D digital twin for the highest risk orchard."
        else:
            response["understood"] = False
            response["message"] = f"Command not recognized: {command}"
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Vision/3D Analysis endpoints
@router.get("/vision-3d/{orchard_id}", tags=["Vision/3D"])
async def get_vision_3d_analysis_endpoint(orchard_id: str, section_id: str = None):
    """Get vision/3D analysis for an orchard section"""
    try:
        from services.vision_3d_analysis_service import get_vision_3d_analysis
        
        # Get orchard data to extract metrics
        orchard = get_orchard_by_id(orchard_id)
        if not orchard:
            raise HTTPException(status_code=404, detail=f"Orchard {orchard_id} not found")
        
        result = get_vision_3d_analysis(
            orchard_id=orchard_id,
            section_id=section_id,
            ndvi=orchard.get("ndvi", 0.72),
            stress_level=orchard.get("stress_level", "medium"),
            soil_moisture=orchard.get("soil_moisture", 60.0),
            leaf_damage=orchard.get("leaf_damage", 8.0),
            tree_age_years=orchard.get("tree_age_years", 7)
        )
        
        return {
            "success": True,
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/vision-3d/analyze", tags=["Vision/3D"])
async def analyze_vision_3d_endpoint(request: Dict[str, Any]):
    """
    Analyze orchard section with custom parameters
    
    Request body:
    {
        "orchard_id": "orchard_A",
        "section_id": "north_block",
        "ndvi": 0.75,
        "stress_level": "low",
        "soil_moisture": 68.0,
        "leaf_damage": 5.0,
        "tree_age_years": 6
    }
    """
    try:
        from services.vision_3d_analysis_service import analyze_orchard_from_metrics
        
        result = analyze_orchard_from_metrics(request)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "success": True,
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Made with Bob
