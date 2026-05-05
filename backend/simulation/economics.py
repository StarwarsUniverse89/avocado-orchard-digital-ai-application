"""
Financial and Economic Simulation Module
Calculates yield, revenue, profit, and ROI based on orchard conditions
"""

from typing import Dict, Any


def calculate_yield_impact(
    baseline_yield: float,
    temperature: float,
    soil_moisture: float,
    pest_pressure: float,
    ndvi: float,
) -> float:
    """
    Calculate yield impact based on environmental conditions
    
    Args:
        baseline_yield: Base yield per tree in kg
        temperature: Temperature in Celsius
        soil_moisture: Soil moisture percentage (0-100)
        pest_pressure: Pest pressure level (0-10)
        ndvi: Normalized Difference Vegetation Index (0-1)
    
    Returns:
        Adjusted yield per tree
    """
    yield_multiplier = 1.0
    
    # Temperature impact (optimal: 20-28°C)
    if temperature < 15:
        yield_multiplier *= 0.7  # Cold stress
    elif temperature < 20:
        yield_multiplier *= 0.85
    elif temperature <= 28:
        yield_multiplier *= 1.0  # Optimal
    elif temperature <= 32:
        yield_multiplier *= 0.9
    else:
        yield_multiplier *= 0.75  # Heat stress
    
    # Soil moisture impact (optimal: 60-80%)
    if soil_moisture < 30:
        yield_multiplier *= 0.6  # Severe water stress
    elif soil_moisture < 50:
        yield_multiplier *= 0.8
    elif soil_moisture <= 80:
        yield_multiplier *= 1.0  # Optimal
    else:
        yield_multiplier *= 0.95  # Slight over-watering
    
    # Pest pressure impact (0 = no pests, 10 = severe)
    pest_impact = 1.0 - (pest_pressure * 0.05)  # 5% loss per pest level
    yield_multiplier *= max(0.5, pest_impact)
    
    # NDVI impact (0.7-0.9 is healthy)
    if ndvi < 0.5:
        yield_multiplier *= 0.7
    elif ndvi < 0.7:
        yield_multiplier *= 0.85
    elif ndvi <= 0.9:
        yield_multiplier *= 1.0  # Optimal
    else:
        yield_multiplier *= 0.98
    
    return baseline_yield * yield_multiplier


def calculate_financial_metrics(
    yield_per_tree: float,
    trees_per_acre: int,
    market_price: float,
    production_cost: float,
) -> Dict[str, float]:
    """
    Calculate financial metrics
    
    Args:
        yield_per_tree: Yield per tree in kg
        trees_per_acre: Number of trees per acre
        market_price: Market price per kg
        production_cost: Total production cost
    
    Returns:
        Dictionary with financial metrics
    """
    estimated_yield = yield_per_tree * trees_per_acre
    revenue = estimated_yield * market_price
    profit = revenue - production_cost
    roi = (profit / production_cost * 100) if production_cost > 0 else 0
    
    return {
        "estimated_yield": round(estimated_yield, 2),
        "revenue": round(revenue, 2),
        "profit": round(profit, 2),
        "roi": round(roi, 2),
    }


def predict_financial_scenario(
    orchard_data: Dict[str, Any],
    scenario: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Predict financial impact of a scenario
    
    Args:
        orchard_data: Current orchard data
        scenario: Scenario parameters (temperature, soil_moisture, pest_pressure, ndvi)
    
    Returns:
        Financial prediction with baseline and scenario comparison
    """
    # Extract baseline data
    baseline_yield = orchard_data.get("yield_per_tree", 120)
    trees_per_acre = orchard_data.get("trees_per_acre", 150)
    market_price = orchard_data.get("market_price", 2.8)
    production_cost = orchard_data.get("production_cost", 5200)
    
    # Calculate baseline metrics
    baseline_metrics = calculate_financial_metrics(
        baseline_yield, trees_per_acre, market_price, production_cost
    )
    
    # Calculate scenario yield
    scenario_yield = calculate_yield_impact(
        baseline_yield,
        scenario.get("temperature", orchard_data.get("temperature", 25)),
        scenario.get("soil_moisture", orchard_data.get("soil_moisture", 70)),
        scenario.get("pest_pressure", orchard_data.get("pest_pressure", 3)),
        scenario.get("ndvi", orchard_data.get("ndvi", 0.85)),
    )
    
    # Calculate scenario metrics
    scenario_metrics = calculate_financial_metrics(
        scenario_yield, trees_per_acre, market_price, production_cost
    )
    
    # Calculate differences
    profit_change = scenario_metrics["profit"] - baseline_metrics["profit"]
    yield_change_pct = (
        (scenario_yield - baseline_yield) / baseline_yield * 100
        if baseline_yield > 0
        else 0
    )
    
    # Determine risk level
    if profit_change < -3000:
        risk_level = "high"
        message = f"Severe conditions may reduce profit by ${abs(profit_change):,.0f}."
    elif profit_change < -1000:
        risk_level = "medium"
        message = f"Suboptimal conditions may reduce profit by ${abs(profit_change):,.0f}."
    elif profit_change < 0:
        risk_level = "low"
        message = f"Minor impact expected, profit may decrease by ${abs(profit_change):,.0f}."
    elif profit_change < 1000:
        risk_level = "low"
        message = f"Conditions are stable, profit change: ${profit_change:,.0f}."
    else:
        risk_level = "opportunity"
        message = f"Favorable conditions may increase profit by ${profit_change:,.0f}."
    
    return {
        "orchard_id": orchard_data.get("id", "unknown"),
        "baseline": baseline_metrics,
        "scenario": scenario_metrics,
        "prediction": {
            "projected_gain_or_loss": round(profit_change, 2),
            "yield_change_percent": round(yield_change_pct, 2),
            "roi": scenario_metrics["roi"],
            "risk_level": risk_level,
            "message": message,
        },
    }


def calculate_roi_scenarios(
    orchard_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Calculate ROI for multiple scenarios
    
    Args:
        orchard_data: Current orchard data
    
    Returns:
        ROI analysis for different scenarios
    """
    scenarios = {
        "optimal": {
            "temperature": 24,
            "soil_moisture": 70,
            "pest_pressure": 1,
            "ndvi": 0.85,
        },
        "heat_stress": {
            "temperature": 36,
            "soil_moisture": 40,
            "pest_pressure": 5,
            "ndvi": 0.65,
        },
        "water_stress": {
            "temperature": 28,
            "soil_moisture": 30,
            "pest_pressure": 3,
            "ndvi": 0.70,
        },
        "pest_outbreak": {
            "temperature": 26,
            "soil_moisture": 65,
            "pest_pressure": 8,
            "ndvi": 0.60,
        },
    }
    
    results = {}
    for scenario_name, scenario_params in scenarios.items():
        results[scenario_name] = predict_financial_scenario(
            orchard_data, scenario_params
        )
    
    return results


# Made with Bob