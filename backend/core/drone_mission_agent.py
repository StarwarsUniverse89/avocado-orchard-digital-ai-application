import uuid
from typing import List, Dict, Any, Optional
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.orchard_service import get_orchard_by_id
from services.gemini_service import gemini_service

class DroneMissionAgent:
    """
    Drone Mission Agent
    Responsible for planning aerial inspection missions over avocado orchards.
    
    This agent bridges the gap between regional satellite stress data and 
    high-resolution 3D digital twin visualization.
    """
    
    def plan_mission(self, orchard_id: str, stress_zones: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Generate a mission plan for a drone scan.
        Designed for Google Rapid Agents Hackathon.
        """
        orchard = get_orchard_by_id(orchard_id)
        if not orchard:
            return {"error": f"Orchard {orchard_id} not found in Mexico network archive."}

        # Generate agentic reasoning via Gemini Service
        reasoning = gemini_service.generate_mission_reasoning({
            "name": orchard.get("name", "Unknown Orchard"),
            "stress_level": orchard.get("stress_level", "unknown")
        })

        # Base coordinates from orchard location
        center_lat = orchard.get("lat", 19.33)
        center_lng = orchard.get("lng", -102.36)
        
        # Priority mapping: areas that need high-res vision analysis
        priority_zones = stress_zones or []
        if not priority_zones and orchard.get("stress_level") in ["high", "medium"]:
             priority_zones.append({
                 "id": "stress-detected-via-satellite",
                 "lat": center_lat,
                 "lng": center_lng,
                 "severity": orchard.get("stress_level")
             })

        # Cesium-compatible Waypoints (for route visualization)
        # altitude (alt) is in meters above ground level
        waypoints = [
            {"lat": center_lat + 0.0004, "lng": center_lng + 0.0004, "alt": 45},
            {"lat": center_lat + 0.0004, "lng": center_lng - 0.0004, "alt": 45},
            {"lat": center_lat - 0.0004, "lng": center_lng - 0.0004, "alt": 45},
            {"lat": center_lat - 0.0004, "lng": center_lng + 0.0004, "alt": 45},
            {"lat": center_lat, "lng": center_lng, "alt": 15}, # Low pass for high-res vision analysis
        ]

        mission_id = f"dm_{uuid.uuid4().hex[:8]}"
        
        return {
            "mission_id": mission_id,
            "orchard_id": orchard_id,
            "status": "planned",
            "waypoints": waypoints,
            "priority_zones": priority_zones,
            "estimated_duration_minutes": 18,
            "battery_estimate_percent": 88,
            "inspection_targets": [
                "NDVI Anomaly Zone B",
                "Thermal Stress Hotspot",
                "Tree Health Sample #42"
            ],
            "mock_image_targets": [
                "/assets/drone/scan_001.jpg",
                "/assets/drone/scan_002.jpg"
            ],
            "human_approval_required": orchard.get("stress_level") == "high",
            "agent_reasoning_summary": reasoning
        }

drone_agent = DroneMissionAgent()