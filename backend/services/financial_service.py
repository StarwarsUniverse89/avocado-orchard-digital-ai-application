"""
Financial Service
Handles financial predictions and economic analysis for orchards
"""

from typing import Dict, Any
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from simulation.economics import (
    predict_financial_scenario,
    calculate_roi_scenarios,
    calculate_financial_metrics,
)
from services.orchard_service import get_orchard_by_id


def get_financial_prediction(orchard_id: str, scenario: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get financial prediction for an orchard scenario
    
    Args:
        orchard_id: Orchard identifier
        scenario: Scenario parameters
    
    Returns:
        Financial prediction with baseline and scenario comparison
    """
    orchard = get_orchard_by_id(orchard_id)
    if not orchard:
        raise ValueError(f"Orchard {orchard_id} not found")
    
    # Add default pest_pressure if not in orchard data
    if "pest_pressure" not in orchard:
        orchard["pest_pressure"] = 3  # Default moderate pest pressure
    
    prediction = predict_financial_scenario(orchard, scenario)
    
    return prediction


def get_orchard_financial_summary(orchard_id: str) -> Dict[str, Any]:
    """
    Get current financial summary for an orchard
    
    Args:
        orchard_id: Orchard identifier
    
    Returns:
        Current financial metrics
    """
    orchard = get_orchard_by_id(orchard_id)
    if not orchard:
        raise ValueError(f"Orchard {orchard_id} not found")
    
    metrics = calculate_financial_metrics(
        orchard.get("yield_per_tree", 120),
        orchard.get("trees_per_acre", 150),
        orchard.get("market_price", 2.8),
        orchard.get("production_cost", 5200),
    )
    
    return {
        "orchard_id": orchard_id,
        "current_metrics": metrics,
        "market_price": orchard.get("market_price", 2.8),
        "production_cost": orchard.get("production_cost", 5200),
    }


def get_roi_analysis(orchard_id: str) -> Dict[str, Any]:
    """
    Get ROI analysis for multiple scenarios
    
    Args:
        orchard_id: Orchard identifier
    
    Returns:
        ROI analysis for different scenarios
    """
    orchard = get_orchard_by_id(orchard_id)
    if not orchard:
        raise ValueError(f"Orchard {orchard_id} not found")
    
    # Add default pest_pressure if not in orchard data
    if "pest_pressure" not in orchard:
        orchard["pest_pressure"] = 3
    
    scenarios = calculate_roi_scenarios(orchard)
    
    return {
        "orchard_id": orchard_id,
        "scenarios": scenarios,
    }


# Made with Bob