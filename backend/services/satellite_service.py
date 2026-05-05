"""
Satellite Service
Provides satellite imagery and NDVI data for orchards
"""

from typing import Dict, Any, List
import random


def get_satellite_data(orchard_id: str) -> Dict[str, Any]:
    """
    Get satellite/NDVI data for an orchard
    
    For demo: Returns synthetic satellite data
    Future: Integrate with Sentinel-2, Landsat, Google Earth Engine
    
    Args:
        orchard_id: Orchard identifier
    
    Returns:
        Satellite data with NDVI metrics and stress zones
    """
    # Simulate NDVI values (0-1 scale, higher is healthier)
    base_ndvi = 0.75 + random.uniform(-0.1, 0.1)
    
    # Generate stress zones
    stress_zones = []
    if base_ndvi < 0.7:
        stress_zones.append({
            "section": "B2",
            "severity": "warning",
            "ndvi": round(base_ndvi - 0.15, 2),
            "recommendation": "Inspect irrigation and leaf health in this section",
        })
    
    if random.random() > 0.7:
        stress_zones.append({
            "section": "C1",
            "severity": "info",
            "ndvi": round(base_ndvi - 0.08, 2),
            "recommendation": "Monitor canopy development",
        })
    
    return {
        "orchard_id": orchard_id,
        "source": "synthetic_sentinel2",
        "timestamp": "2026-05-05T00:00:00Z",
        "ndvi_average": round(base_ndvi, 2),
        "ndvi_min": round(base_ndvi - 0.25, 2),
        "ndvi_max": round(min(base_ndvi + 0.15, 0.95), 2),
        "stress_zones": stress_zones,
        "satellite_layer": {
            "type": "aerial",
            "asset": "/assets/ui/avocado_orchard_aerialview.webp",
        },
        "coverage": {
            "cloud_cover": round(random.uniform(0, 15), 1),
            "resolution_m": 10,
            "bands": ["NIR", "Red", "Green", "Blue"],
        },
    }


def calculate_ndvi(nir: float, red: float) -> float:
    """
    Calculate NDVI from NIR and Red bands
    NDVI = (NIR - Red) / (NIR + Red)
    
    Args:
        nir: Near-infrared reflectance
        red: Red reflectance
    
    Returns:
        NDVI value (-1 to 1)
    """
    if (nir + red) == 0:
        return 0.0
    return (nir - red) / (nir + red)


def get_ndvi_timeseries(orchard_id: str, days: int = 30) -> Dict[str, Any]:
    """
    Get NDVI time series data
    
    Args:
        orchard_id: Orchard identifier
        days: Number of days of historical data
    
    Returns:
        Time series NDVI data
    """
    # Generate synthetic time series
    base_ndvi = 0.75
    timeseries = []
    
    for i in range(days):
        # Add some variation
        ndvi = base_ndvi + random.uniform(-0.05, 0.05)
        timeseries.append({
            "date": f"2026-{4 if i < 25 else 5}-{(5 + i) % 30 + 1:02d}",
            "ndvi": round(ndvi, 3),
        })
    
    return {
        "orchard_id": orchard_id,
        "period_days": days,
        "data": timeseries,
        "trend": "stable",
        "average": round(base_ndvi, 2),
    }


def get_stress_heatmap(orchard_id: str) -> Dict[str, Any]:
    """
    Generate stress heatmap data for visualization
    
    Args:
        orchard_id: Orchard identifier
    
    Returns:
        Heatmap data for frontend visualization
    """
    # Generate grid of stress values
    grid_size = 10
    heatmap_data = []
    
    for row in range(grid_size):
        row_data = []
        for col in range(grid_size):
            # Simulate stress levels (0-1, lower is more stress)
            stress = 0.7 + random.uniform(-0.3, 0.3)
            row_data.append(round(max(0, min(1, stress)), 2))
        heatmap_data.append(row_data)
    
    return {
        "orchard_id": orchard_id,
        "grid_size": grid_size,
        "data": heatmap_data,
        "legend": {
            "0.0-0.4": "High Stress",
            "0.4-0.6": "Moderate Stress",
            "0.6-0.8": "Low Stress",
            "0.8-1.0": "Healthy",
        },
    }


# Future integration notes
"""
Real Satellite Data Sources:

1. Sentinel-2 (ESA)
   - 10m resolution
   - 5-day revisit
   - Free access via Copernicus

2. Landsat 8/9 (NASA/USGS)
   - 30m resolution
   - 16-day revisit
   - Free access

3. Google Earth Engine
   - API access to multiple satellites
   - Cloud processing
   - Python SDK available

4. SMAP (Soil Moisture)
   - NASA soil moisture data
   - 9km resolution

5. MODIS
   - Daily coverage
   - 250m-1km resolution
   - Vegetation indices

Integration Steps:
1. Set up API credentials
2. Define area of interest (AOI) for each orchard
3. Query satellite data for date range
4. Calculate NDVI: (NIR - Red) / (NIR + Red)
5. Apply cloud masking
6. Store processed data
7. Update frontend with real imagery
"""

# Made with Bob