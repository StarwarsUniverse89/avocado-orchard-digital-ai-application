"""
Vision/3D Analysis Service
Backend service for vision and 3D analysis of orchard sections
Uses stub models until AMD MI300X GPU models are deployed
"""

import sys
import os
from typing import Dict, Any, Optional

# Add ml/inference to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ml', 'inference'))

try:
    from vision_3d_analysis_stub import analyze_orchard_section_complete
    VISION_STUB_AVAILABLE = True
except ImportError:
    VISION_STUB_AVAILABLE = False
    print("⚠️  Vision/3D analysis stub not available")


def get_vision_3d_analysis(
    orchard_id: str,
    section_id: Optional[str] = None,
    ndvi: float = 0.72,
    stress_level: str = "medium",
    soil_moisture: float = 60.0,
    leaf_damage: float = 8.0,
    tree_age_years: int = 7
) -> Dict[str, Any]:
    """
    Get vision/3D analysis for an orchard or section
    
    Args:
        orchard_id: Orchard identifier
        section_id: Section identifier (optional, defaults to "main")
        ndvi: NDVI value (0.0-1.0)
        stress_level: "low", "medium", or "high"
        soil_moisture: Soil moisture percentage (0-100)
        leaf_damage: Leaf damage percentage (0-100)
        tree_age_years: Average tree age in years
    
    Returns:
        Complete vision/3D analysis with visual parameters
    """
    if not VISION_STUB_AVAILABLE:
        return {
            "error": "Vision/3D analysis not available",
            "orchard_id": orchard_id,
            "section_id": section_id or "main"
        }
    
    section = section_id or "main"
    
    try:
        result = analyze_orchard_section_complete(
            orchard_id=orchard_id,
            section_id=section,
            ndvi=ndvi,
            stress_level=stress_level,
            soil_moisture=soil_moisture,
            leaf_damage=leaf_damage,
            tree_age_years=tree_age_years
        )
        return result
    
    except Exception as e:
        return {
            "error": f"Vision/3D analysis failed: {str(e)}",
            "orchard_id": orchard_id,
            "section_id": section
        }


def analyze_orchard_from_metrics(orchard_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze orchard using existing metrics
    
    Args:
        orchard_data: Dictionary with orchard metrics
            - orchard_id (required)
            - section_id (optional)
            - ndvi (optional)
            - stress_level (optional)
            - soil_moisture (optional)
            - leaf_damage (optional)
            - tree_age_years (optional)
    
    Returns:
        Vision/3D analysis result
    """
    orchard_id = orchard_data.get("orchard_id")
    if not orchard_id:
        return {"error": "orchard_id is required"}
    
    return get_vision_3d_analysis(
        orchard_id=orchard_id,
        section_id=orchard_data.get("section_id"),
        ndvi=orchard_data.get("ndvi", 0.72),
        stress_level=orchard_data.get("stress_level", "medium"),
        soil_moisture=orchard_data.get("soil_moisture", 60.0),
        leaf_damage=orchard_data.get("leaf_damage", 8.0),
        tree_age_years=orchard_data.get("tree_age_years", 7)
    )


def get_visual_3d_parameters_only(
    orchard_id: str,
    section_id: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Get only the visual 3D parameters for rendering
    
    Returns:
        visual_3d_parameters dictionary suitable for 3D twin
    """
    result = get_vision_3d_analysis(orchard_id, section_id, **kwargs)
    
    if "error" in result:
        # Return default parameters on error
        return {
            "canopy_scale": 1.0,
            "fruit_density": 0.7,
            "fruit_scale": 1.0,
            "trunk_scale": 1.0,
            "branch_scale": 0.75,
            "height_scale": 1.0,
            "stress_color": "green",
            "leaf_color_tint": {"r": 0.8, "g": 1.0, "b": 0.7}
        }
    
    return result.get("visual_3d_parameters", {})


def batch_analyze_sections(orchard_id: str, sections: list) -> Dict[str, Any]:
    """
    Analyze multiple sections of an orchard
    
    Args:
        orchard_id: Orchard identifier
        sections: List of section dictionaries with metrics
    
    Returns:
        Dictionary mapping section_id to analysis results
    """
    results = {}
    
    for section in sections:
        section_id = section.get("id") or section.get("section_id", "unknown")
        
        analysis = get_vision_3d_analysis(
            orchard_id=orchard_id,
            section_id=section_id,
            ndvi=section.get("ndvi", 0.72),
            stress_level=section.get("stress_level", "medium"),
            soil_moisture=section.get("soil_moisture", 60.0),
            leaf_damage=section.get("leaf_damage", 8.0),
            tree_age_years=section.get("tree_age_years", 7)
        )
        
        results[section_id] = analysis
    
    return {
        "orchard_id": orchard_id,
        "sections_analyzed": len(sections),
        "results": results
    }


# CLI test
if __name__ == "__main__":
    print("\n" + "="*60)
    print("Vision/3D Analysis Service Test")
    print("="*60)
    
    # Test single section analysis
    print("\n1. Single Section Analysis:")
    result = get_vision_3d_analysis(
        orchard_id="test_orchard_01",
        section_id="north_block",
        ndvi=0.75,
        stress_level="low",
        soil_moisture=68.0,
        leaf_damage=5.0,
        tree_age_years=6
    )
    
    print(f"   Canopy Volume: {result.get('canopy_volume')} m³")
    print(f"   Fruit Count: {result.get('estimated_fruit_count')}")
    print(f"   Health Status: {result.get('health_status')}")
    print(f"   Confidence: {result.get('confidence')}")
    
    # Test visual parameters extraction
    print("\n2. Visual 3D Parameters:")
    params = get_visual_3d_parameters_only(
        orchard_id="test_orchard_01",
        section_id="south_block",
        ndvi=0.62,
        stress_level="high"
    )
    
    print(f"   Canopy Scale: {params.get('canopy_scale')}")
    print(f"   Fruit Density: {params.get('fruit_density')}")
    print(f"   Stress Color: {params.get('stress_color')}")
    
    # Test batch analysis
    print("\n3. Batch Section Analysis:")
    sections = [
        {"id": "north", "ndvi": 0.78, "stress_level": "low"},
        {"id": "central", "ndvi": 0.70, "stress_level": "medium"},
        {"id": "south", "ndvi": 0.58, "stress_level": "high"}
    ]
    
    batch_result = batch_analyze_sections("test_orchard_02", sections)
    print(f"   Sections Analyzed: {batch_result.get('sections_analyzed')}")
    
    for section_id, analysis in batch_result.get('results', {}).items():
        print(f"   {section_id}: Health={analysis.get('health_status')}, "
              f"Fruit={analysis.get('estimated_fruit_count')}")
    
    print("\n" + "="*60)
    print("✅ Service test complete")
    print("="*60 + "\n")

# Made with Bob