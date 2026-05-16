"""
Mission Memory Service
Persists drone missions and inspection history using MongoDB.
Enables Agentic reasoning over historical orchard conditions.
"""
import datetime
import logging
from typing import List, Dict, Any, Optional
from core.config import config

try:
    from pymongo import MongoClient, DESCENDING
    MONGO_AVAILABLE = True
except ImportError:
    MONGO_AVAILABLE = False

logger = logging.getLogger(__name__)

class MissionMemoryService:
    """
    Handles persistence and retrieval of historical mission data.
    In a Google Rapid Agents context, this serves as the 'Long-term Memory' for the agent.
    
    Note for future MCP (Model Context Protocol) integration:
    This service can be exposed as an MCP Resource, allowing any Gemini-based agent 
    to query historical trends via standardized tool calls.
    """
    
    def __init__(self):
        self.client = None
        self.db = None
        self.enabled = False
        self.local_memory: List[Dict[str, Any]] = []
        
        if MONGO_AVAILABLE and config.MONGODB_URI:
            try:
                self.client = MongoClient(config.MONGODB_URI, serverSelectionTimeoutMS=2000)
                # Trigger connection check
                self.client.server_info()
                self.db = self.client[config.MONGODB_DATABASE]
                self.enabled = True
                logger.info("✅ MongoDB Mission Memory connected.")
            except Exception as e:
                logger.warning(f"⚠️ MongoDB connection failed, using Mock Memory: {e}")

    def save_mission(self, mission_data: Dict[str, Any]):
        """Store a planned drone mission."""
        if not self.enabled:
            self.local_memory.append({
                **mission_data,
                "type": mission_data.get("type", "mission_plan"),
                "created_at": datetime.datetime.utcnow().isoformat(),
                "memory_status": "local_fallback",
            })
            return
        
        record = {
            **mission_data,
            "type": mission_data.get("type", "mission_plan"),
            "created_at": datetime.datetime.utcnow()
        }
        self.db.missions.insert_one(record)

    def save_segmentation_correction(self, correction_data: Dict[str, Any]) -> str:
        """Store human segmentation correction in MongoDB or local fallback memory."""
        record = {
            **correction_data,
            "type": "segmentation_correction",
            "created_at": datetime.datetime.utcnow()
        }

        if not self.enabled:
            self.local_memory.append({
                **record,
                "created_at": record["created_at"].isoformat(),
                "memory_status": "local_fallback",
            })
            return "local_fallback"

        self.db.segmentation_corrections.insert_one(record)
        return "saved_to_mongodb"

    def save_manual_boundary(self, boundary_data: Dict[str, Any]) -> str:
        """Store a human-labeled orchard boundary for operational use and ML label archive prep."""
        record = {
            **boundary_data,
            "type": "manual_orchard_boundary",
            "created_at": datetime.datetime.utcnow()
        }

        if not self.enabled:
            self.local_memory.append({
                **record,
                "created_at": record["created_at"].isoformat(),
                "memory_status": "local_fallback",
            })
            return "local_fallback"

        self.db.manual_boundaries.insert_one(record)
        return "saved_to_mongodb"

    def get_manual_boundaries(self, municipality_id: str) -> List[Dict[str, Any]]:
        """Retrieve human-labeled boundaries for a municipality."""
        if not self.enabled:
            return [
                item for item in self.local_memory
                if item.get("type") == "manual_orchard_boundary"
                and item.get("municipality_id") == municipality_id
            ]

        cursor = self.db.manual_boundaries.find(
            {"municipality_id": municipality_id},
            {"_id": 0}
        ).sort("created_at", DESCENDING)
        boundaries = list(cursor)
        for boundary in boundaries:
            if isinstance(boundary.get("created_at"), datetime.datetime):
                boundary["created_at"] = boundary["created_at"].isoformat()
        return boundaries

    def save_inspection_analysis(self, analysis_data: Dict[str, Any]):
        """Store the results of a high-res drone scan analysis."""
        if not self.enabled: return
        
        record = {
            **analysis_data,
            "type": "inspection_analysis",
            "created_at": datetime.datetime.utcnow()
        }
        self.db.history.insert_one(record)

    def get_recent_orchard_history(self, orchard_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Retrieve operational history for a specific orchard."""
        if not self.enabled:
            # Graceful Mock Fallback
            return [{
                "mission_id": "mock_historical",
                "status": "completed",
                "severity": "low",
                "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=7),
                "gemini_analysis_summary": "Historical mock data: No previous major stress detected."
            }]

        cursor = self.db.history.find(
            {"orchard_id": orchard_id},
            {"_id": 0}
        ).sort("created_at", DESCENDING).limit(limit)
        
        history = list(cursor)
        
        # Calculate simplistic severity trend
        # In a real agentic workflow, we would pass this list to Gemini to 
        # generate a "Condition Trend Narrative".
        for idx, entry in enumerate(history):
            if isinstance(entry.get("created_at"), datetime.datetime):
                entry["created_at"] = entry["created_at"].isoformat()
                
        return history

mission_memory = MissionMemoryService()
