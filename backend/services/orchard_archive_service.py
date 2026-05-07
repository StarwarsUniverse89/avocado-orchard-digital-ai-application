# Copyright 2026 F Melgoza
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
Orchard Archive Service
Stores and retrieves detected orchard parcels using PostgreSQL or JSON fallback

Archive structure:
- archive_id: unique identifier (MX-MICH-{MUNICIPALITY}-PARCEL-{index})
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
from datetime import datetime

# Try to import database dependencies
try:
    from backend.db.database import SessionLocal, is_db_available
    from backend.db.models import OrchardArchive as OrchardArchiveModel
    from sqlalchemy.orm import Session
    DB_AVAILABLE = True
except ImportError:
    DB_AVAILABLE = False
    SessionLocal = None
    OrchardArchiveModel = None


class OrchardArchiveService:
    """Service for archiving detected orchard parcels with PostgreSQL or JSON fallback"""
    
    def __init__(self):
        # Check if database is available
        self.use_db = DB_AVAILABLE and is_db_available()
        
        if self.use_db:
            print("✅ Using PostgreSQL for orchard archive persistence")
        else:
            print("⚠️  Using JSON file storage for orchard archive (DATABASE_URL not set)")
            # JSON fallback storage
            self.archive: Dict[str, Dict[str, Any]] = {}
            self.archive_dir = Path("backend/data/orchard_archive")
            self.archive_dir.mkdir(parents=True, exist_ok=True)
            self._load_archive()
    
    def _load_archive(self):
        """Load archive from JSON file (fallback mode only)"""
        if self.use_db:
            return
        
        archive_file = self.archive_dir / "archive.json"
        if archive_file.exists():
            try:
                with open(archive_file, 'r') as f:
                    self.archive = json.load(f)
                print(f"✅ Loaded {len(self.archive)} archived orchards from JSON")
            except Exception as e:
                print(f"⚠️  Could not load archive: {e}")
    
    def _save_archive(self):
        """Save archive to JSON file (fallback mode only)"""
        if self.use_db:
            return
        
        archive_file = self.archive_dir / "archive.json"
        try:
            with open(archive_file, 'w') as f:
                json.dump(self.archive, f, indent=2)
        except Exception as e:
            print(f"⚠️  Could not save archive: {e}")
    
    def _model_to_dict(self, model: Any) -> Dict[str, Any]:
        """Convert SQLAlchemy model to dictionary"""
        return {
            "archive_id": model.archive_id,
            "orchard_id": model.orchard_id,
            "municipality_id": model.municipality_id,
            "name": model.name,
            "center_lat": model.center_lat,
            "center_lng": model.center_lng,
            "boundary_coordinates": model.boundary_coordinates,
            "estimated_hectares": model.estimated_hectares,
            "estimated_acres": model.estimated_acres,
            "estimated_tree_count": model.estimated_tree_count,
            "ndvi_average": model.ndvi_average,
            "stress_level": model.stress_level,
            "confidence": model.confidence,
            "detection_method": model.detection_method,
            "imagery_source": model.imagery_source,
            "scan_source": model.scan_source,
            "source_image_id": model.source_image_id,
            "row_pattern_detected": model.row_pattern_detected,
            "row_spacing_m": model.row_spacing_m,
            "crown_density": model.crown_density,
            "created_at": model.created_at.timestamp() if model.created_at else None,
            "updated_at": model.updated_at.timestamp() if model.updated_at else None,
        }
    
    def _generate_stable_archive_id(self, municipality_id: str, db: Optional[Session] = None) -> str:
        """Generate stable archive ID: MX-MICH-{MUNICIPALITY}-PARCEL-{index}"""
        municipality_id = municipality_id.upper()
        
        if self.use_db and db:
            # Count existing parcels in database
            count = db.query(OrchardArchiveModel).filter(
                OrchardArchiveModel.municipality_id == municipality_id
            ).count()
            index = count + 1
        else:
            # Count existing parcels in JSON
            existing_parcels = [
                k for k in self.archive.keys()
                if k.startswith(f"MX-MICH-{municipality_id}-PARCEL-")
            ]
            index = len(existing_parcels) + 1
        
        return f"MX-MICH-{municipality_id}-PARCEL-{index:03d}"
    
    def save_orchard(self, orchard_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save detected orchard to archive with stable ID pattern
        
        Args:
            orchard_data: Orchard parcel data with boundary, metadata, etc.
        
        Returns:
            Saved orchard with archive_id
        """
        if self.use_db:
            return self._save_orchard_db(orchard_data)
        else:
            return self._save_orchard_json(orchard_data)
    
    def _save_orchard_db(self, orchard_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save orchard to PostgreSQL database"""
        db = SessionLocal()
        try:
            municipality_id = orchard_data.get("municipality_id", "unknown").upper()
            
            # Generate stable archive_id if not provided
            archive_id = orchard_data.get("archive_id")
            if not archive_id:
                archive_id = self._generate_stable_archive_id(municipality_id, db)
                orchard_data["archive_id"] = archive_id
            
            # Check if orchard already exists
            existing = db.query(OrchardArchiveModel).filter(
                OrchardArchiveModel.archive_id == archive_id
            ).first()
            
            if existing:
                # Update existing orchard
                for key, value in orchard_data.items():
                    if hasattr(existing, key) and key not in ['id', 'created_at']:
                        setattr(existing, key, value)
                existing.updated_at = datetime.utcnow()
                is_update = True
                message = f"Orchard {archive_id} updated in archive"
            else:
                # Create new orchard
                new_orchard = OrchardArchiveModel(
                    archive_id=archive_id,
                    orchard_id=orchard_data.get("orchard_id", archive_id),
                    municipality_id=municipality_id,
                    name=orchard_data.get("name"),
                    center_lat=orchard_data.get("center_lat"),
                    center_lng=orchard_data.get("center_lng"),
                    boundary_coordinates=orchard_data.get("boundary_coordinates"),
                    estimated_hectares=orchard_data.get("estimated_hectares"),
                    estimated_acres=orchard_data.get("estimated_acres"),
                    estimated_tree_count=orchard_data.get("estimated_tree_count"),
                    ndvi_average=orchard_data.get("ndvi_average"),
                    stress_level=orchard_data.get("stress_level"),
                    confidence=orchard_data.get("confidence"),
                    detection_method=orchard_data.get("detection_method"),
                    imagery_source=orchard_data.get("imagery_source"),
                    scan_source=orchard_data.get("scan_source"),
                    source_image_id=orchard_data.get("source_image_id"),
                    row_pattern_detected=orchard_data.get("row_pattern_detected"),
                    row_spacing_m=orchard_data.get("row_spacing_m"),
                    crown_density=orchard_data.get("crown_density"),
                )
                db.add(new_orchard)
                existing = new_orchard
                is_update = False
                message = f"Orchard {archive_id} saved to archive"
            
            db.commit()
            db.refresh(existing)
            
            return {
                "success": True,
                "archive_id": archive_id,
                "orchard": self._model_to_dict(existing),
                "is_update": is_update,
                "message": message
            }
        except Exception as e:
            db.rollback()
            return {
                "success": False,
                "error": f"Failed to save orchard: {str(e)}"
            }
        finally:
            db.close()
    
    def _save_orchard_json(self, orchard_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save orchard to JSON file (fallback)"""
        municipality_id = orchard_data.get("municipality_id", "unknown").upper()
        
        # Generate stable archive_id if not provided
        archive_id = orchard_data.get("archive_id")
        if not archive_id:
            archive_id = self._generate_stable_archive_id(municipality_id)
            orchard_data["archive_id"] = archive_id
        
        # Check for duplicate and update if exists
        import time
        now = time.time()
        is_update = archive_id in self.archive
        
        if is_update:
            # Update existing orchard
            existing = self.archive[archive_id]
            orchard_data["created_at"] = existing.get("created_at", now)
            orchard_data["updated_at"] = now
            message = f"Orchard {archive_id} updated in archive"
        else:
            # Create new orchard
            orchard_data["created_at"] = now
            orchard_data["updated_at"] = now
            message = f"Orchard {archive_id} saved to archive"
        
        # Save to archive
        self.archive[archive_id] = orchard_data
        self._save_archive()
        
        return {
            "success": True,
            "archive_id": archive_id,
            "orchard": orchard_data,
            "is_update": is_update,
            "message": message
        }
    
    def get_orchard(self, archive_id: str) -> Optional[Dict[str, Any]]:
        """
        Get orchard from archive by ID
        
        Args:
            archive_id: Archive identifier
        
        Returns:
            Orchard data or None if not found
        """
        if self.use_db:
            db = SessionLocal()
            try:
                orchard = db.query(OrchardArchiveModel).filter(
                    OrchardArchiveModel.archive_id == archive_id
                ).first()
                return self._model_to_dict(orchard) if orchard else None
            finally:
                db.close()
        else:
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
        if self.use_db:
            return self._list_orchards_db(municipality_id, stress_level, min_hectares, max_hectares)
        else:
            return self._list_orchards_json(municipality_id, stress_level, min_hectares, max_hectares)
    
    def _list_orchards_db(
        self,
        municipality_id: Optional[str],
        stress_level: Optional[str],
        min_hectares: Optional[float],
        max_hectares: Optional[float]
    ) -> List[Dict[str, Any]]:
        """List orchards from PostgreSQL database"""
        db = SessionLocal()
        try:
            query = db.query(OrchardArchiveModel)
            
            # Apply filters
            if municipality_id:
                query = query.filter(OrchardArchiveModel.municipality_id == municipality_id)
            
            if stress_level:
                query = query.filter(OrchardArchiveModel.stress_level == stress_level)
            
            if min_hectares is not None:
                query = query.filter(OrchardArchiveModel.estimated_hectares >= min_hectares)
            
            if max_hectares is not None:
                query = query.filter(OrchardArchiveModel.estimated_hectares <= max_hectares)
            
            # Sort by updated_at descending
            query = query.order_by(OrchardArchiveModel.updated_at.desc())
            
            orchards = query.all()
            return [self._model_to_dict(o) for o in orchards]
        finally:
            db.close()
    
    def _list_orchards_json(
        self,
        municipality_id: Optional[str],
        stress_level: Optional[str],
        min_hectares: Optional[float],
        max_hectares: Optional[float]
    ) -> List[Dict[str, Any]]:
        """List orchards from JSON file (fallback)"""
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
        if self.use_db:
            db = SessionLocal()
            try:
                orchard = db.query(OrchardArchiveModel).filter(
                    OrchardArchiveModel.archive_id == archive_id
                ).first()
                
                if orchard:
                    db.delete(orchard)
                    db.commit()
                    return {
                        "success": True,
                        "message": f"Orchard {archive_id} deleted from archive"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Orchard {archive_id} not found in archive"
                    }
            finally:
                db.close()
        else:
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
        if self.use_db:
            db = SessionLocal()
            try:
                orchard = db.query(OrchardArchiveModel).filter(
                    OrchardArchiveModel.archive_id == archive_id
                ).first()
                
                if not orchard:
                    return {
                        "success": False,
                        "error": f"Orchard {archive_id} not found in archive"
                    }
                
                # Update fields
                for key, value in updates.items():
                    if hasattr(orchard, key) and key not in ['id', 'archive_id', 'created_at']:
                        setattr(orchard, key, value)
                
                orchard.updated_at = datetime.utcnow()
                db.commit()
                db.refresh(orchard)
                
                return {
                    "success": True,
                    "archive_id": archive_id,
                    "orchard": self._model_to_dict(orchard),
                    "message": "Orchard updated in archive"
                }
            finally:
                db.close()
        else:
            if archive_id not in self.archive:
                return {
                    "success": False,
                    "error": f"Orchard {archive_id} not found in archive"
                }
            
            # Update fields
            import time
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
        orchards = self.list_orchards()
        
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
