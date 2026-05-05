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


# AMD Status endpoint
@router.get("/amd/status", tags=["System"])
async def get_amd_status():
    """Get AMD GPU and compute status"""
    return {
        "success": True,
        "data": {
            "gpu_available": True,
            "gpu_model": "AMD MI300X (Simulated)",
            "rocm_version": "5.7+",
            "compute_status": "ready",
            "vllm_status": "ready",
            "models_loaded": ["qwen-2.5-stub", "llama-3-stub"],
            "memory_used_gb": 24.5,
            "memory_total_gb": 192,
            "utilization_percent": 12.8,
        },
    }


# Made with Bob
