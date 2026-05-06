import json
import os
from pathlib import Path

def load_orchards():
    """
    Load orchard data with fallback to Mexico network
    
    Priority:
    1. Try ml/datasets/orchards.json (legacy)
    2. Fall back to synthetic orchards from Mexico network
    """
    # Try legacy orchards.json first
    legacy_path = Path("ml/datasets/orchards.json")
    if legacy_path.exists():
        try:
            with open(legacy_path) as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load legacy orchards.json: {e}")
    
    # Fallback to Mexico network synthetic orchards
    try:
        from services.mexico_orchard_network_service import create_synthetic_orchards_from_clusters
        synthetic_orchards = create_synthetic_orchards_from_clusters()
        print(f"Using {len(synthetic_orchards)} synthetic orchards from Mexico network")
        return synthetic_orchards
    except Exception as e:
        print(f"Warning: Could not load Mexico network data: {e}")
        # Return empty list as last resort
        return []

def get_orchard_by_id(orchard_id):
    """
    Get orchard by ID with fallback to Mexico network
    
    Supports:
    - Legacy orchard IDs (orchard_A, orchard_B)
    - Municipality IDs (tancitaro, uruapan, etc.)
    - Synthetic orchard IDs (cluster_xxx_orchard_1, etc.)
    """
    # Try legacy orchards first
    orchards = load_orchards()
    for o in orchards:
        if o.get("id") == orchard_id:
            return o
    
    # Try Mexico network municipalities
    try:
        from services.mexico_orchard_network_service import get_municipality_by_id
        municipality = get_municipality_by_id(orchard_id)
        if municipality:
            # Convert municipality to orchard format
            return {
                "id": municipality.get("id"),
                "name": municipality.get("name"),
                "temperature": 25,
                "soil_moisture": 60,
                "leaf_damage": 8,
                "ndvi": municipality.get("ndvi_average", 0.7),
                "yield_per_tree": 120,
                "trees_per_acre": 150,
                "market_price": 2.8,
                "production_cost": 5000,
                "stress_level": municipality.get("stress_level", "medium"),
                "estimated_hectares": municipality.get("estimated_hectares", 0),
                "lat": municipality.get("lat"),
                "lng": municipality.get("lng"),
            }
    except Exception as e:
        print(f"Warning: Could not check Mexico network: {e}")
    
    return None

# Made with Bob