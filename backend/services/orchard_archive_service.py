"""
Orchard Archive Service
Stores and retrieves detected orchard parcels

Archive structure:
- archive_id: unique identifier
- orchard_id: orchard identifier
- municipality_id: municipality
- boundary_coordinates: GPS polygon
- detection_metadata: detection method, confidence, etc.
- imagery_metadata: source, date, resolution
- analysis_results: NDVI, stress, tree count, etc.
- created_at: timestamp
- updated_at: timestamp
"""

from typing import Dict, Any, Optional, List
import json
from pathlib import Path
import time


class OrchardArchiveService:
    """Service for archiving detected orchard parcels"""
    
    def __init__(self):
        # In-memory storage for now
        # TODO: Replace with database (SQLite, PostgreSQL, etc.)
        self.archive: Dict[str, Dict[str, Any]] = {}
        self.archive_dir = Path("backend/data/orchard_archive")
        self.archive_dir.mkdir(parents=True, exist_ok=True)
        self._load_archive()
    
    def _load_archive(self):
        """Load archive from disk"""
        archive_file = self.archive_dir / "archive.json"
        if archive_file.exists():
            try:
                with open(archive_file, 'r') as f:
                    self.archive = json.load(f)
                print(f"✅ Loaded {len(self.archive)} archived orchards")
            except Exception as e:
                print(f"⚠️  Could not load archive: {e}")
    
    def _save_archive(self):
        """Save archive to disk"""
        archive_file = self.archive_dir / "archive.json"
        try:
            with open(archive_file, 'w') as f:
                json.dump(self.archive, f, indent=2)
        except Exception as e:
            print(f"⚠️  Could not save archive: {e}")
    
    def save_orchard(self, orchard_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save detected orchard to archive
        
        Args:
            orchard_data: Orchard parcel data with boundary, metadata, etc.
        
        Returns:
            Saved orchard with archive_id
        """
        archive_id = orchard_data.get("archive_id")
        if not archive_id:
            # Generate archive ID if not provided
            municipality_id = orchard_data.get("municipality_id", "unknown")
            index = len([k for k in self.archive.keys() if municipality_id in k]) + 1
            archive_id = f"orchard_{municipality_id}_{index:03d}_{int(time.time())}"
            orchard_data["archive_id"] = archive_id
        
        # Add timestamps
        now = time.time()
        if archive_id not in self.archive:
            orchard_data["created_at"] = now
        orchard_data["updated_at"] = now
        
        # Save to archive
        self.archive[archive_id] = orchard_data
        self._save_archive()
        
        return {
            "success": True,
            "archive_id": archive_id,
            "orchard": orchard_data,
            "message": "Orchard saved to archive"
        }
    
    def get_orchard(self, archive_id: str) -> Optional[Dict[str, Any]]:
        """
        Get orchard from archive by ID
        
        Args:
            archive_id: Archive identifier
        
        Returns:
            Orchard data or None if not found
        """
        return self.archive.get(archive_id)
    
    def list_orchards(
        self,
        municipality_id: Optional[str] = None,
        stress_level: Optional[str] = None,
        min_hectares: Optional[float] = None,
        max_hectares: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        List archived orchards with optional filters
        
        Args:
            municipality_id: Filter by municipality
            stress_level: Filter by stress level
            min_hectares: Minimum hectares
            max_hectares: Maximum hectares
        
        Returns:
            List of matching orchards
        """
        orchards = list(self.archive.values())
        
        # Apply filters
        if municipality_id:
            orchards = [o for o in orchards if o.get("municipality_id") == municipality_id]
        
        if stress_level:
            orchards = [o for o in orchards if o.get("stress_level") == stress_level]
        
        if min_hectares is not None:
            orchards = [o for o in orchards if o.get("estimated_hectares", 0) >= min_hectares]
        
        if max_hectares is not None:
            orchards = [o for o in orchards if o.get("estimated_hectares", 0) <= max_hectares]
        
        # Sort by updated_at descending
        orchards.sort(key=lambda o: o.get("updated_at", 0), reverse=True)
        
        return orchards
    
    def delete_orchard(self, archive_id: str) -> Dict[str, Any]:
        """
        Delete orchard from archive
        
        Args:
            archive_id: Archive identifier
        
        Returns:
            Success status
        """
        if archive_id in self.archive:
            del self.archive[archive_id]
            self._save_archive()
            return {
                "success": True,
                "message": f"Orchard {archive_id} deleted from archive"
            }
        else:
            return {
                "success": False,
                "error": f"Orchard {archive_id} not found in archive"
            }
    
    def update_orchard(self, archive_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update orchard in archive
        
        Args:
            archive_id: Archive identifier
            updates: Fields to update
        
        Returns:
            Updated orchard data
        """
        if archive_id not in self.archive:
            return {
                "success": False,
                "error": f"Orchard {archive_id} not found in archive"
            }
        
        # Update fields
        self.archive[archive_id].update(updates)
        self.archive[archive_id]["updated_at"] = time.time()
        self._save_archive()
        
        return {
            "success": True,
            "archive_id": archive_id,
            "orchard": self.archive[archive_id],
            "message": "Orchard updated in archive"
        }
    
    def get_archive_stats(self) -> Dict[str, Any]:
        """Get archive statistics"""
        orchards = list(self.archive.values())
        
        if not orchards:
            return {
                "total_orchards": 0,
                "total_hectares": 0,
                "total_trees": 0,
                "municipalities": [],
            }
        
        total_hectares = sum(o.get("estimated_hectares", 0) for o in orchards)
        total_trees = sum(o.get("estimated_tree_count", 0) for o in orchards)
        municipalities = list(set(o.get("municipality_id") for o in orchards if o.get("municipality_id")))
        
        # Stress level distribution
        stress_dist = {"low": 0, "medium": 0, "high": 0}
        for o in orchards:
            stress = o.get("stress_level", "medium")
            stress_dist[stress] = stress_dist.get(stress, 0) + 1
        
        return {
            "total_orchards": len(orchards),
            "total_hectares": round(total_hectares, 2),
            "total_trees": total_trees,
            "municipalities": municipalities,
            "stress_distribution": stress_dist,
            "average_hectares": round(total_hectares / len(orchards), 2) if orchards else 0,
            "average_trees_per_orchard": int(total_trees / len(orchards)) if orchards else 0,
        }


# Create singleton instance
orchard_archive_service = OrchardArchiveService()


# Convenience functions
def save_orchard(orchard_data: Dict[str, Any]) -> Dict[str, Any]:
    """Save orchard to archive"""
    return orchard_archive_service.save_orchard(orchard_data)


def get_orchard(archive_id: str) -> Optional[Dict[str, Any]]:
    """Get orchard from archive"""
    return orchard_archive_service.get_orchard(archive_id)


def list_orchards(**filters) -> List[Dict[str, Any]]:
    """List archived orchards"""
    return orchard_archive_service.list_orchards(**filters)


def delete_orchard(archive_id: str) -> Dict[str, Any]:
    """Delete orchard from archive"""
    return orchard_archive_service.delete_orchard(archive_id)


def update_orchard(archive_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update orchard in archive"""
    return orchard_archive_service.update_orchard(archive_id, updates)


def get_archive_stats() -> Dict[str, Any]:
    """Get archive statistics"""
    return orchard_archive_service.get_archive_stats()


# Made with Bob