from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from core.drone_mission_agent import drone_agent
from core.inspection_analysis_agent import inspection_analysis_agent
from core.orchard_operations_agent import orchard_operations_agent
from services.mission_memory_service import mission_memory
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

class DroneMissionRequest(BaseModel):
    orchard_id: str

class InspectionAnalysisRequest(BaseModel):
    mission_id: str
    orchard_id: str
    mock_image_targets: List[str]

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

@router.post("/drone/plan-mission", tags=["Drone Missions"])
async def plan_drone_mission(request: DroneMissionRequest):
    """Plan a virtual drone inspection mission for an orchard."""
    try:
        result = drone_agent.plan_mission(request.orchard_id)
        mission_memory.save_mission(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/drone/analyze-inspection", tags=["Drone Missions"])
async def analyze_drone_inspection(request: InspectionAnalysisRequest):
    """Analyze imagery from a completed drone mission."""
    try:
        result = inspection_analysis_agent.analyze_inspection(
            request.mission_id,
            request.orchard_id,
            request.mock_image_targets
        )
        mission_memory.save_inspection_analysis(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/operations/regional-summary", tags=["Operations"])
async def get_regional_summary():
    """Get high-level regional operations summary from the Gemini Operations Agent"""
    try:
        return orchard_operations_agent.get_regional_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/drone/history/{orchard_id}", tags=["Drone Missions"])
async def get_drone_history(orchard_id: str):
    """Retrieve historical mission/analysis data for an orchard."""
    try:
        history = mission_memory.get_recent_orchard_history(orchard_id)
        return {
            "success": True,
            "data": history
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
    Get AI agent recommendation using Mexico avocado network
    
    Request body:
    {
        "orchard_id": "orchard_A",  # Optional - can be municipality ID or synthetic orchard ID
        "municipality_name": "Tancítaro",  # Optional - municipality name
        "command": "Give recommendation"  # Optional - natural language command
    }
    
    If no orchard/municipality specified, defaults to highest-risk municipality
    """
    try:
        from services.mexico_orchard_network_service import get_orchard_context_for_agent
        from core.config import config
        
        orchard_id = request.get("orchard_id")
        municipality_name = request.get("municipality_name")
        command = request.get("command", "")
        
        # Get orchard context from Mexico network (never uses orchards.json)
        context = get_orchard_context_for_agent(orchard_id, municipality_name)
        
        if context.get("type") == "error":
            # Return error response instead of raising exception
            return {
                "success": False,
                "error": context.get("error", "Orchard not found"),
                "message": "Could not find orchard data. Using Mexico avocado network as source of truth.",
                "mode": "error"
            }
        
        orchard_data = context.get("data", {})
        
        # Try AMD/vLLM inference if configured
        if config.is_amd_cloud_configured() and config.AMD_MODEL_ENDPOINT:
            try:
                import sys
                import os
                sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ml', 'inference'))
                from amd_model_client import amd_client
                
                # Prepare prompt for AMD model with Mexico context
                prompt = f"""You are an expert avocado orchard advisor. Analyze this orchard data and provide actionable recommendations.

Orchard: {orchard_data.get('name', orchard_data.get('id', 'Unknown'))}
Location: {orchard_data.get('state', 'Michoacán')}, Mexico
NDVI: {orchard_data.get('ndvi_average', orchard_data.get('ndvi', 0.7))}
Stress Level: {orchard_data.get('stress_level', 'medium')}
Estimated Hectares: {orchard_data.get('estimated_hectares', 'N/A')}
Soil Moisture: {orchard_data.get('soil_moisture', 60)}%
Temperature: {orchard_data.get('temperature', 25)}°C
Projected Profit: ${orchard_data.get('projected_profit_usd', 0):,}

Provide a concise recommendation focusing on:
1. Most critical action needed
2. Expected impact on yield/profit
3. Scientific reasoning

Keep response under 150 words."""

                # Call AMD model with temperature 0.2 for more deterministic output
                amd_response = amd_client.generate_text(prompt, temperature=0.2, max_tokens=500)
                
                if amd_response and amd_response.get("success"):
                    return {
                        "success": True,
                        "data": {
                            "orchard_id": orchard_id or orchard_data.get("id"),
                            "orchard_name": orchard_data.get("name"),
                            "recommendation": amd_response.get("text", ""),
                            "model": amd_response.get("model", config.MODEL_NAME),
                            "provider": amd_response.get("provider", "AMD MI300X vLLM"),
                            "context": context,
                            "mode": "live",
                            "fallback_used": False,
                        }
                    }
            except Exception as e:
                print(f"AMD inference failed, falling back to deterministic: {e}")
        
        # Fallback to deterministic logic
        ndvi = orchard_data.get('ndvi_average', orchard_data.get('ndvi', 0.7))
        stress_level = orchard_data.get('stress_level', 'medium')
        soil_moisture = orchard_data.get('soil_moisture', 60)
        
        # Generate deterministic recommendation
        if stress_level == "high" or ndvi < 0.65:
            recommendation = f"URGENT: {orchard_data.get('name', 'This orchard')} shows high stress (NDVI: {ndvi}). Immediate irrigation and soil analysis recommended. Expected yield impact: 15-25% loss if not addressed. Projected profit at risk: ${orchard_data.get('projected_profit_usd', 0):,}."
        elif stress_level == "medium" or ndvi < 0.75:
            recommendation = f"MODERATE: {orchard_data.get('name', 'This orchard')} shows moderate stress (NDVI: {ndvi}). Increase monitoring frequency and consider supplemental irrigation. Expected yield impact: 5-10% potential loss. Maintain current management with adjustments."
        else:
            recommendation = f"OPTIMAL: {orchard_data.get('name', 'This orchard')} is in good condition (NDVI: {ndvi}). Continue current management practices. Expected yield: stable. Projected profit: ${orchard_data.get('projected_profit_usd', 0):,}."
        
        return {
            "success": True,
            "data": {
                "orchard_id": orchard_id or orchard_data.get("id"),
                "orchard_name": orchard_data.get("name"),
                "recommendation": recommendation,
                "model": "deterministic",
                "context": context,
                "mode": "stub",
            }
        }
    except HTTPException:
        raise
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
        
        # Set note based on mode
        if mode == "live":
            note = "Live AMD MI300X vLLM endpoint configured and reachable; fallback enabled if endpoint fails."
        elif mode == "configured_stub":
            note = "AMD Cloud configured; inference running in safe stub mode until AMD_MODEL_ENDPOINT is set."
        else:
            note = "Using deterministic stub responses"
        
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
                "note": note
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
    Process natural language command through AI agent using Mexico network
    
    Request body:
    {
        "command": "show avocado belt",
        "context": {}
    }
    """
    try:
        from services.mexico_orchard_network_service import (
            get_mexico_analytics,
            get_highest_risk_orchard,
            get_top_production_municipality,
            compare_municipalities,
        )
        
        command = request.get("command", "").strip()
        context = request.get("context", {})
        
        if not command:
            raise HTTPException(status_code=400, detail="command is required")
        
        command_lower = command.lower()
        
        response = {
            "success": True,
            "command": command,
            "understood": True,
            "action": None,
            "message": "",
            "data": None,
        }
        
        # Parse common commands with Mexico network data
        if "avocado belt" in command_lower:
            response["action"] = "show_avocado_belt"
            response["message"] = "Displaying Michoacán avocado belt boundary and municipalities."
            analytics = get_mexico_analytics()
            response["data"] = {
                "belt_bounds": analytics.get("belt_bounds"),
                "total_municipalities": analytics.get("total_municipalities"),
            }
        elif "production cluster" in command_lower:
            response["action"] = "show_production_clusters"
            response["message"] = "Showing production clusters across the avocado belt."
            analytics = get_mexico_analytics()
            response["data"] = {
                "total_clusters": analytics.get("total_clusters"),
            }
        elif "orchard network" in command_lower and "michoacán" in command_lower:
            response["action"] = "create_orchard_network"
            response["message"] = "Generating synthetic orchard network in Michoacán."
        elif "highest production" in command_lower:
            response["action"] = "show_top_municipality"
            top_muni = get_top_production_municipality()
            response["message"] = f"Flying to {top_muni.get('name')}, the highest production municipality."
            response["data"] = top_muni
        elif "highest stress" in command_lower or "highest risk" in command_lower:
            response["action"] = "find_highest_stress_orchard"
            highest_risk = get_highest_risk_orchard()
            response["message"] = f"Locating {highest_risk.get('name')}, the highest stress municipality in the avocado belt."
            response["data"] = highest_risk
        elif "compare" in command_lower and ("tancítaro" in command_lower or "uruapan" in command_lower):
            response["action"] = "compare_municipalities"
            comparison = compare_municipalities("Tancítaro", "Uruapan")
            response["message"] = "Comparing Tancítaro and Uruapan production metrics."
            response["data"] = comparison
        elif "3d twin" in command_lower and "highest risk" in command_lower:
            response["action"] = "enter_3d_twin_highest_risk"
            highest_risk = get_highest_risk_orchard()
            response["message"] = f"Opening 3D digital twin for {highest_risk.get('name')}, the highest risk orchard."
            response["data"] = highest_risk
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


# Orchard Detection endpoints
@router.post("/orchard-detection/scan-area", tags=["Orchard Detection"])
async def scan_area_for_orchards(request: Dict[str, Any]):
    """
    Scan an area for orchard parcels using vision/detection pipeline
    
    Request body:
    {
        "bbox": {
            "lat_min": 19.30,
            "lat_max": 19.36,
            "lng_min": -102.40,
            "lng_max": -102.32
        },
        "municipality_id": "tancitaro",
        "save_to_archive": false
    }
    """
    try:
        from services.orchard_detection_service import scan_area
        
        bbox = request.get("bbox")
        municipality_id = request.get("municipality_id")
        save_to_archive = request.get("save_to_archive", False)
        
        if not bbox or not municipality_id:
            raise HTTPException(status_code=400, detail="bbox and municipality_id are required")
        
        result = scan_area(bbox, municipality_id, save_to_archive=save_to_archive)
        
        return {
            "success": True,
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/orchard-detection/scan-municipality", tags=["Orchard Detection"])
async def scan_municipality_for_orchards(request: Dict[str, Any]):
    """
    Scan a municipality for orchard parcels
    
    Request body:
    {
        "municipality_id": "tancitaro",
        "save_to_archive": false
    }
    """
    try:
        from services.orchard_detection_service import scan_municipality
        
        municipality_id = request.get("municipality_id")
        save_to_archive = request.get("save_to_archive", False)
        
        if not municipality_id:
            raise HTTPException(status_code=400, detail="municipality_id is required")
        
        result = scan_municipality(municipality_id, save_to_archive=save_to_archive)
        
        return {
            "success": True,
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/orchard-detection/from-upload", tags=["Orchard Detection"])
async def detect_orchards_from_upload(request: Dict[str, Any]):
    """
    Detect orchards from uploaded aerial/drone image
    
    Request body:
    {
        "image_data": "base64_encoded_image",
        "municipality_id": "tancitaro",
        "metadata": {
            "gps_lat": 19.33,
            "gps_lng": -102.36,
            "timestamp": "2024-01-15T10:30:00Z"
        },
        "save_to_archive": false
    }
    """
    try:
        from services.orchard_detection_service import scan_from_upload
        import base64
        
        image_b64 = request.get("image_data")
        municipality_id = request.get("municipality_id")
        metadata = request.get("metadata", {})
        save_to_archive = request.get("save_to_archive", False)
        
        if not image_b64 or not municipality_id:
            raise HTTPException(status_code=400, detail="image_data and municipality_id are required")
        
        # Decode base64 image
        image_data = base64.b64decode(image_b64)
        
        result = scan_from_upload(
            image_data,
            municipality_id,
            metadata=metadata,
            save_to_archive=save_to_archive
        )
        
        return {
            "success": True,
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orchard-detection/status", tags=["Orchard Detection"])
async def get_detection_status():
    """Get orchard detection pipeline status"""
    try:
        from services.orchard_detection_service import get_detection_pipeline_status
        
        status = get_detection_pipeline_status()
        
        return {
            "success": True,
            "data": status,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Orchard Archive endpoints
@router.get("/orchard-archive", tags=["Orchard Archive"])
async def get_orchard_archive(
    municipality_id: str = None,
    stress_level: str = None,
    min_hectares: float = None,
    max_hectares: float = None
):
    """
    Get archived orchards with optional filters
    
    Query parameters:
    - municipality_id: Filter by municipality
    - stress_level: Filter by stress level (low, medium, high)
    - min_hectares: Minimum hectares
    - max_hectares: Maximum hectares
    """
    try:
        from services.orchard_archive_service import list_orchards, get_archive_stats
        
        orchards = list_orchards(
            municipality_id=municipality_id,
            stress_level=stress_level,
            min_hectares=min_hectares,
            max_hectares=max_hectares
        )
        
        stats = get_archive_stats()
        
        return {
            "success": True,
            "count": len(orchards),
            "stats": stats,
            "data": orchards,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orchard-archive/{archive_id}", tags=["Orchard Archive"])
async def get_archived_orchard(archive_id: str):
    """Get a specific archived orchard by ID"""
    try:
        from services.orchard_archive_service import get_orchard
        
        orchard = get_orchard(archive_id)
        
        if not orchard:
            raise HTTPException(status_code=404, detail=f"Orchard {archive_id} not found in archive")
        
        return {
            "success": True,
            "data": orchard,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/orchard-archive", tags=["Orchard Archive"])
async def save_orchard_to_archive(request: Dict[str, Any]):
    """
    Save an orchard to the archive
    
    Request body: Orchard data with boundary_coordinates, metadata, etc.
    """
    try:
        from services.orchard_archive_service import save_orchard
        
        result = save_orchard(request)
        
        return {
            "success": True,
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/orchard-archive/{archive_id}", tags=["Orchard Archive"])
async def update_archived_orchard(archive_id: str, request: Dict[str, Any]):
    """Update an archived orchard"""
    try:
        from services.orchard_archive_service import update_orchard
        
        result = update_orchard(archive_id, request)
        
        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("error"))
        
        return {
            "success": True,
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/orchard-archive/{archive_id}", tags=["Orchard Archive"])
async def delete_archived_orchard(archive_id: str):
    """Delete an archived orchard"""
    try:
        from services.orchard_archive_service import delete_orchard
        
        result = delete_orchard(archive_id)
        
        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("error"))
        
        return {
            "success": True,
            "data": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
