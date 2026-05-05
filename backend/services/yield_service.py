"""
Yield Service
Predicts and analyzes crop yield based on environmental conditions
"""

from typing import Dict, Any
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.orchard_service import get_orchard_by_id


def predict_yield(orchard_id: str) -> Dict[str, Any]:
    """
    Predict yield for an orchard based on current conditions
    
    Args:
        orchard_id: Orchard identifier
    
    Returns:
        Yield prediction with risk assessment
    """
    orchard = get_orchard_by_id(orchard_id)
    if not orchard:
        raise ValueError(f"Orchard {orchard_id} not found")
    
    # Extract metrics
    temperature = orchard.get("temperature", 25)
    soil_moisture = orchard.get("soil_moisture", 70)
    ndvi = orchard.get("ndvi", 0.85)
    leaf_damage = orchard.get("leaf_damage", 5)
    base_yield = orchard.get("yield_per_tree", 120)
    trees_per_acre = orchard.get("trees_per_acre", 150)
    
    # Calculate yield multiplier based on conditions
    yield_multiplier = 1.0
    
    # Temperature impact (optimal: 20-28°C)
    if temperature < 15:
        yield_multiplier *= 0.7
    elif temperature < 20:
        yield_multiplier *= 0.85
    elif temperature <= 28:
        yield_multiplier *= 1.0
    elif temperature <= 32:
        yield_multiplier *= 0.9
    else:
        yield_multiplier *= 0.75
    
    # Soil moisture impact (optimal: 60-80%)
    if soil_moisture < 30:
        yield_multiplier *= 0.6
    elif soil_moisture < 50:
        yield_multiplier *= 0.8
    elif soil_moisture <= 80:
        yield_multiplier *= 1.0
    else:
        yield_multiplier *= 0.95
    
    # NDVI impact (healthy: 0.7-0.9)
    if ndvi < 0.5:
        yield_multiplier *= 0.7
    elif ndvi < 0.7:
        yield_multiplier *= 0.85
    elif ndvi <= 0.9:
        yield_multiplier *= 1.0
    else:
        yield_multiplier *= 0.98
    
    # Leaf damage impact (pest pressure)
    damage_impact = 1.0 - (leaf_damage * 0.01)  # 1% loss per 1% damage
    yield_multiplier *= max(0.5, damage_impact)
    
    # Calculate predicted yield
    predicted_yield_per_tree = base_yield * yield_multiplier
    total_yield = predicted_yield_per_tree * trees_per_acre
    
    # Determine risk level
    if yield_multiplier >= 0.95:
        yield_risk = "low"
        risk_message = "Conditions are optimal for high yield"
    elif yield_multiplier >= 0.85:
        yield_risk = "low"
        risk_message = "Conditions are favorable"
    elif yield_multiplier >= 0.75:
        yield_risk = "medium"
        risk_message = "Some stress factors present"
    else:
        yield_risk = "high"
        risk_message = "Multiple stress factors affecting yield"
    
    # Estimate harvest timing
    if yield_multiplier >= 0.9:
        harvest_days = 7
    elif yield_multiplier >= 0.8:
        harvest_days = 10
    else:
        harvest_days = 14
    
    return {
        "orchard_id": orchard_id,
        "estimated_yield_kg": round(total_yield, 0),
        "yield_per_tree_kg": round(predicted_yield_per_tree, 1),
        "yield_multiplier": round(yield_multiplier, 2),
        "yield_risk": yield_risk,
        "risk_message": risk_message,
        "harvest_days": harvest_days,
        "factors": {
            "temperature_impact": "optimal" if 20 <= temperature <= 28 else "suboptimal",
            "moisture_impact": "optimal" if 60 <= soil_moisture <= 80 else "suboptimal",
            "health_impact": "good" if ndvi >= 0.7 else "poor",
            "pest_impact": "low" if leaf_damage < 10 else "moderate" if leaf_damage < 20 else "high",
        },
    }


def get_yield_forecast(orchard_id: str, days: int = 90) -> Dict[str, Any]:
    """
    Get yield forecast for upcoming period
    
    Args:
        orchard_id: Orchard identifier
        days: Forecast period in days
    
    Returns:
        Yield forecast with confidence intervals
    """
    current_prediction = predict_yield(orchard_id)
    
    # Simulate forecast with uncertainty
    base_yield = current_prediction["estimated_yield_kg"]
    
    # Add seasonal variation
    forecast_data = []
    for week in range(days // 7):
        # Simulate weekly variation
        variation = 1.0 + (week * 0.02)  # Slight growth over time
        forecast_yield = base_yield * variation
        
        forecast_data.append({
            "week": week + 1,
            "estimated_yield": round(forecast_yield, 0),
            "confidence_low": round(forecast_yield * 0.9, 0),
            "confidence_high": round(forecast_yield * 1.1, 0),
        })
    
    return {
        "orchard_id": orchard_id,
        "forecast_period_days": days,
        "current_estimate": current_prediction["estimated_yield_kg"],
        "forecast": forecast_data,
        "trend": "increasing" if len(forecast_data) > 0 else "stable",
    }


def compare_yield_scenarios(orchard_id: str) -> Dict[str, Any]:
    """
    Compare yield under different scenarios
    
    Args:
        orchard_id: Orchard identifier
    
    Returns:
        Yield comparison across scenarios
    """
    orchard = get_orchard_by_id(orchard_id)
    if not orchard:
        raise ValueError(f"Orchard {orchard_id} not found")
    
    scenarios = {
        "current": predict_yield(orchard_id),
        "optimal": {
            "description": "Optimal conditions maintained",
            "estimated_yield_kg": orchard.get("yield_per_tree", 120) * orchard.get("trees_per_acre", 150) * 1.0,
        },
        "heat_stress": {
            "description": "Heat wave scenario",
            "estimated_yield_kg": orchard.get("yield_per_tree", 120) * orchard.get("trees_per_acre", 150) * 0.75,
        },
        "water_stress": {
            "description": "Drought scenario",
            "estimated_yield_kg": orchard.get("yield_per_tree", 120) * orchard.get("trees_per_acre", 150) * 0.70,
        },
    }
    
    return {
        "orchard_id": orchard_id,
        "scenarios": scenarios,
        "recommendation": "Maintain irrigation and monitor temperature",
    }


# Made with Bob