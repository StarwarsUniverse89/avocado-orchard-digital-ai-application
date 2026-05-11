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
        if not self.enabled: return
        
        record = {
            **mission_data,
            "type": "mission_plan",
            "created_at": datetime.datetime.utcnow()
        }
        self.db.missions.insert_one(record)

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