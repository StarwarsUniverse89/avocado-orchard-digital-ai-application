"""
Orchard Detection Service
Orchestrates orchard parcel detection pipeline

Coordinates:
- Satellite imagery service (fetch imagery)
- Orchard detector (ML/CV detection)
- Orchard archive service (store results)
- Vision/3D analysis service (detailed analysis)
"""

from typing import Dict, Any, Optional, List
import sys
import os

# Add ml/inference to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ml', 'inference'))

from satellite_imagery_service import fetch_imagery_for_bbox
from orchard_archive_service import save_orchard, list_orchards
try:
    from orchard_detector import detect_orchard_parcels, get_detection_status
    DETECTOR_AVAILABLE = True
except ImportError:
    DETECTOR_AVAILABLE = False
    print("⚠️  Orchard detector not available")


class OrchardDetectionService:
    """Service for detecting orchard parcels"""
    
    def __init__(self):
        self.detector_available = DETECTOR_AVAILABLE
    
    def scan_area(
        self,
        bbox: Dict[str, float],
        municipality_id: str,
        save_to_archive: bool = False
    ) -> Dict[str, Any]:
        """
        Scan an area for orchard parcels
        
        Args:
            bbox: {"lat_min": float, "lat_max": float, "lng_min": float, "lng_max": float}
            municipality_id: Municipality identifier
            save_to_archive: Whether to save detected parcels to archive
        
        Returns:
            Detection results with parcels
        """
        if not self.detector_available:
            return {
                "success": False,
                "error": "Orchard detector not available",
                "note": "Check ml/inference/orchard_detector.py"
            }
        
        # Fetch imagery (if available)
        imagery_result = fetch_imagery_for_bbox(bbox, municipality_id)
        
        # Detect orchard parcels
        parcels = detect_orchard_parcels(
            bbox=bbox,
            municipality_id=municipality_id,
            ndvi_data=None,  # TODO: Extract from imagery
            imagery=None     # TODO: Pass imagery data
        )
        
        # Optionally save to archive
        if save_to_archive:
            for parcel in parcels:
                save_orchard(parcel)
        
        return {
            "success": True,
            "bbox": bbox,
            "municipality_id": municipality_id,
            "parcels_detected": len(parcels),
            "parcels": parcels,
            "imagery_info": imagery_result,
            "saved_to_archive": save_to_archive,
        }
    
    def scan_municipality(
        self,
        municipality_id: str,
        municipality_data: Optional[Dict[str, Any]] = None,
        save_to_archive: bool = False
    ) -> Dict[str, Any]:
        """
        Scan a municipality for orchard parcels
        
        Args:
            municipality_id: Municipality identifier
            municipality_data: Optional municipality data with lat/lng
            save_to_archive: Whether to save detected parcels
        
        Returns:
            Detection results
        """
        if not municipality_data:
            # Try to load from Mexico network
            try:
                from services.mexico_orchard_network_service import get_municipality_by_id
                municipality_data = get_municipality_by_id(municipality_id)
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Could not load municipality data: {e}"
                }
        
        if not municipality_data:
            return {
                "success": False,
                "error": f"Municipality {municipality_id} not found"
            }
        
        # Create bounding box around municipality
        # Use approximate 10km radius
        lat = municipality_data.get("lat", 0)
        lng = municipality_data.get("lng", 0)
        radius_deg = 0.09  # ~10km
        
        bbox = {
            "lat_min": lat - radius_deg,
            "lat_max": lat + radius_deg,
            "lng_min": lng - radius_deg,
            "lng_max": lng + radius_deg,
        }
        
        return self.scan_area(bbox, municipality_id, save_to_archive)
    
    def scan_from_upload(
        self,
        image_data: bytes,
        municipality_id: str,
        metadata: Optional[Dict[str, Any]] = None,
        save_to_archive: bool = False
    ) -> Dict[str, Any]:
        """
        Detect orchards from uploaded image
        
        Args:
            image_data: Raw image bytes
            municipality_id: Municipality identifier
            metadata: Optional metadata (GPS, timestamp, etc.)
            save_to_archive: Whether to save detected parcels
        
        Returns:
            Detection results
        """
        # TODO: Implement image-based detection
        # - Process uploaded image
        # - Extract GPS coordinates if available
        # - Run detection on image
        # - Return parcels
        
        return {
            "success": False,
            "error": "Image-based detection not yet implemented",
            "note": "Upload processing coming soon"
        }
    
    def get_detection_pipeline_status(self) -> Dict[str, Any]:
        """Get detection pipeline status"""
        if not self.detector_available:
            return {
                "detector_available": False,
                "status": "Detector not available",
                "note": "Check ml/inference/orchard_detector.py"
            }
        
        return get_detection_status()


# Create singleton instance
orchard_detection_service = OrchardDetectionService()


# Convenience functions
def scan_area(bbox: Dict[str, float], municipality_id: str, **kwargs) -> Dict[str, Any]:
    """Scan area for orchards"""
    return orchard_detection_service.scan_area(bbox, municipality_id, **kwargs)


def scan_municipality(municipality_id: str, **kwargs) -> Dict[str, Any]:
    """Scan municipality for orchards"""
    return orchard_detection_service.scan_municipality(municipality_id, **kwargs)


def scan_from_upload(image_data: bytes, municipality_id: str, **kwargs) -> Dict[str, Any]:
    """Detect orchards from uploaded image"""
    return orchard_detection_service.scan_from_upload(image_data, municipality_id, **kwargs)


def get_detection_pipeline_status() -> Dict[str, Any]:
    """Get detection pipeline status"""
    return orchard_detection_service.get_detection_pipeline_status()


# Made with Bob