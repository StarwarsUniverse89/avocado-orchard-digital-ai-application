"""
Mexico Orchard Network Service
Provides access to Mexico avocado network data and analytics
Replaces dependency on ml/datasets/orchards.json
"""

from typing import Dict, Any, List, Optional
import json
from pathlib import Path


def load_mexico_network() -> Dict[str, Any]:
    """Load Mexico avocado network data"""
    try:
        data_path = Path(__file__).parent.parent / "data" / "mexico_avocado_regions.json"
        with open(data_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading Mexico network data: {e}")
        return {
            "municipalities": [],
            "clusters": [],
            "belt_bounds": {}
        }


def get_mexico_network() -> Dict[str, Any]:
    """Get complete Mexico avocado network"""
    return load_mexico_network()


def get_mexico_analytics() -> Dict[str, Any]:
    """Get analytics for Mexico avocado network"""
    data = load_mexico_network()
    
    municipalities = data.get("municipalities", [])
    clusters = data.get("clusters", [])
    
    if not municipalities:
        return {
            "error": "No municipality data available",
            "total_estimated_hectares": 0,
            "total_municipalities": 0,
            "total_clusters": 0,
        }
    
    total_hectares = sum(m.get("estimated_hectares", 0) for m in municipalities)
    avg_ndvi = sum(m.get("ndvi_average", 0) for m in municipalities) / len(municipalities)
    
    # Find top production municipality
    top_municipality = max(municipalities, key=lambda m: m.get("estimated_hectares", 0))
    
    # Find highest risk municipality
    stress_map = {"low": 1, "medium": 2, "high": 3}
    highest_risk = max(
        municipalities,
        key=lambda m: (stress_map.get(m.get("stress_level", "low"), 0), -m.get("ndvi_average", 1))
    )
    
    # Calculate profit at risk
    profit_at_risk = sum(c.get("projected_profit_risk_usd", 0) for c in clusters)
    
    return {
        "total_estimated_hectares": total_hectares,
        "total_municipalities": len(municipalities),
        "total_clusters": len(clusters),
        "average_ndvi": round(avg_ndvi, 2),
        "top_production_municipality": top_municipality,
        "highest_risk_municipality": highest_risk,
        "projected_profit_at_risk_usd": profit_at_risk,
        "belt_bounds": data.get("belt_bounds"),
    }


def get_highest_risk_orchard() -> Optional[Dict[str, Any]]:
    """
    Get the highest risk orchard/municipality in the network
    Returns municipality with highest stress level and lowest NDVI
    """
    data = load_mexico_network()
    municipalities = data.get("municipalities", [])
    
    if not municipalities:
        return None
    
    # Sort by stress level (high > medium > low) and NDVI (lower is worse)
    stress_map = {"low": 1, "medium": 2, "high": 3}
    highest_risk = max(
        municipalities,
        key=lambda m: (stress_map.get(m.get("stress_level", "low"), 0), -m.get("ndvi_average", 1))
    )
    
    return highest_risk


def get_top_production_municipality() -> Optional[Dict[str, Any]]:
    """Get the municipality with highest production (most hectares)"""
    data = load_mexico_network()
    municipalities = data.get("municipalities", [])
    
    if not municipalities:
        return None
    
    return max(municipalities, key=lambda m: m.get("estimated_hectares", 0))


def get_municipality_by_id(municipality_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific municipality by ID"""
    data = load_mexico_network()
    municipalities = data.get("municipalities", [])
    
    for municipality in municipalities:
        if municipality.get("id") == municipality_id:
            return municipality
    
    return None


def get_municipality_by_name(name: str) -> Optional[Dict[str, Any]]:
    """Get a municipality by name (case-insensitive)"""
    data = load_mexico_network()
    municipalities = data.get("municipalities", [])
    
    name_lower = name.lower()
    for municipality in municipalities:
        if municipality.get("name", "").lower() == name_lower:
            return municipality
    
    return None


def compare_municipalities(name_a: str, name_b: str) -> Dict[str, Any]:
    """Compare two municipalities"""
    muni_a = get_municipality_by_name(name_a)
    muni_b = get_municipality_by_name(name_b)
    
    if not muni_a or not muni_b:
        return {
            "error": f"Could not find municipalities: {name_a if not muni_a else ''} {name_b if not muni_b else ''}",
            "municipality_a": muni_a,
            "municipality_b": muni_b,
        }
    
    return {
        "municipality_a": muni_a,
        "municipality_b": muni_b,
        "comparison": {
            "hectares_difference": muni_a.get("estimated_hectares", 0) - muni_b.get("estimated_hectares", 0),
            "ndvi_difference": round(muni_a.get("ndvi_average", 0) - muni_b.get("ndvi_average", 0), 3),
            "profit_difference": muni_a.get("projected_profit_usd", 0) - muni_b.get("projected_profit_usd", 0),
            "larger_production": muni_a.get("name") if muni_a.get("estimated_hectares", 0) > muni_b.get("estimated_hectares", 0) else muni_b.get("name"),
            "healthier_ndvi": muni_a.get("name") if muni_a.get("ndvi_average", 0) > muni_b.get("ndvi_average", 0) else muni_b.get("name"),
        }
    }


def create_synthetic_orchards_from_clusters() -> List[Dict[str, Any]]:
    """
    Create synthetic orchard data from cluster information
    Useful for generating individual orchard points within clusters
    """
    data = load_mexico_network()
    clusters = data.get("clusters", [])
    
    synthetic_orchards = []
    
    for cluster in clusters:
        # Create 3-5 synthetic orchards per cluster
        num_orchards = min(5, max(3, cluster.get("estimated_hectares", 0) // 5000))
        
        for i in range(num_orchards):
            # Distribute orchards around cluster center
            lat_offset = (i - num_orchards // 2) * 0.02
            lng_offset = ((i * 2) % num_orchards - num_orchards // 2) * 0.02
            
            synthetic_orchard = {
                "id": f"{cluster.get('id')}_orchard_{i+1}",
                "name": f"{cluster.get('name')} - Orchard {i+1}",
                "cluster_id": cluster.get("id"),
                "lat": cluster.get("center_lat", 0) + lat_offset,
                "lng": cluster.get("center_lng", 0) + lng_offset,
                "estimated_hectares": cluster.get("estimated_hectares", 0) // num_orchards,
                "ndvi": cluster.get("ndvi_average", 0.7) + (i - num_orchards // 2) * 0.02,
                "stress_level": cluster.get("stress_level", "medium"),
                "soil_moisture": 60 + (i * 5) % 30,
                "temperature": 24 + (i * 2) % 10,
                "leaf_damage": 5 + (i * 3) % 15,
                "trees_per_acre": 150,
                "yield_per_tree": 120 - (i * 5),
                "market_price": 2.8,
                "production_cost": 5000 + (i * 200),
            }
            
            synthetic_orchards.append(synthetic_orchard)
    
    return synthetic_orchards


def get_orchard_context_for_agent(orchard_id: Optional[str] = None, municipality_name: Optional[str] = None) -> Dict[str, Any]:
    """
    Get orchard context for AI agent
    If orchard_id or municipality_name provided, use that
    Otherwise, default to highest-risk municipality
    """
    if municipality_name:
        municipality = get_municipality_by_name(municipality_name)
        if municipality:
            return {
                "type": "municipality",
                "data": municipality,
                "source": "mexico_avocado_network",
            }
    
    if orchard_id:
        # Try to find in synthetic orchards
        synthetic_orchards = create_synthetic_orchards_from_clusters()
        for orchard in synthetic_orchards:
            if orchard.get("id") == orchard_id:
                return {
                    "type": "synthetic_orchard",
                    "data": orchard,
                    "source": "mexico_avocado_network",
                }
        
        # Try to find as municipality ID
        municipality = get_municipality_by_id(orchard_id)
        if municipality:
            return {
                "type": "municipality",
                "data": municipality,
                "source": "mexico_avocado_network",
            }
    
    # Default to highest risk
    highest_risk = get_highest_risk_orchard()
    if highest_risk:
        return {
            "type": "municipality",
            "data": highest_risk,
            "source": "mexico_avocado_network",
            "note": "Defaulted to highest-risk municipality",
        }
    
    # Fallback
    return {
        "type": "error",
        "error": "No orchard data available",
        "source": "mexico_avocado_network",
    }


# Made with Bob