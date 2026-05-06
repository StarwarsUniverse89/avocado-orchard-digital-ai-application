"""
AMD Cloud Model Client
Connects to AMD Cloud API for LLM inference
Returns stub responses if API keys are not configured
"""

import os
import sys
from typing import Dict, Any, Optional
import json

# Add backend to path for config import
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

try:
    from core.config import config
    CONFIG_AVAILABLE = True
except ImportError:
    CONFIG_AVAILABLE = False
    print("⚠️  Config not available, using environment variables directly")


class AMDModelClient:
    """Client for AMD Cloud LLM inference"""
    
    def __init__(self):
        """Initialize AMD Cloud client"""
        if CONFIG_AVAILABLE:
            self.api_key = config.AMD_API_KEY
            self.api_url = config.AMD_API_URL
            self.model_endpoint = config.AMD_MODEL_ENDPOINT
            self.model_name = config.MODEL_NAME
        else:
            self.api_key = os.getenv("AMD_API_KEY")
            self.api_url = os.getenv("AMD_API_URL", "https://api.amd.cloud/v1")
            self.model_endpoint = os.getenv("AMD_MODEL_ENDPOINT")
            self.model_name = os.getenv("MODEL_NAME", "Qwen/Qwen2.5-7B-Instruct")
        
        self.is_configured = bool(self.api_key and self.api_url)
        
        if not self.is_configured:
            print("⚠️  AMD Cloud API not configured")
            print("   To use AMD Cloud:")
            print("   1. Copy backend/.env.example to backend/.env")
            print("   2. Add your AMD_API_KEY to backend/.env")
            print("   3. Never commit backend/.env to git")
            print("   Using stub responses for now...")
    
    def get_masked_key(self) -> str:
        """Return masked API key for safe logging"""
        if not self.api_key:
            return "NOT_SET"
        if len(self.api_key) < 8:
            return "***"
        return f"{self.api_key[:4]}...{self.api_key[-4:]}"
    
    def generate_recommendation(
        self, 
        orchard_state: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI recommendation for orchard management
        
        Args:
            orchard_state: Current orchard metrics and conditions
            context: Additional context (satellite data, vision output, etc.)
        
        Returns:
            AI recommendation with reasoning and impact prediction
        """
        if not self.is_configured:
            return self._generate_stub_recommendation(orchard_state, context)
        
        try:
            # TODO: Implement actual AMD Cloud API call
            # For now, return stub even if configured (until we test on AMD Cloud)
            print(f"🔧 AMD Cloud API configured (Key: {self.get_masked_key()})")
            print(f"   Model: {self.model_name}")
            print(f"   Endpoint: {self.api_url}")
            print("   Real API call not yet implemented - using stub")
            return self._generate_stub_recommendation(orchard_state, context)
        
        except Exception as e:
            print(f"❌ Error calling AMD Cloud API: {e}")
            print("   Falling back to stub response")
            return self._generate_stub_recommendation(orchard_state, context)
    
    def _generate_stub_recommendation(
        self,
        orchard_state: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate deterministic stub recommendation based on orchard state"""
        
        # Extract key metrics
        temperature = orchard_state.get("temperature", 25)
        soil_moisture = orchard_state.get("soil_moisture", 60)
        health_status = orchard_state.get("health_status", "healthy")
        ndvi = orchard_state.get("ndvi", 0.75)
        
        # Determine primary issue
        issues = []
        if temperature > 32:
            issues.append("heat_stress")
        if soil_moisture < 40:
            issues.append("water_stress")
        if ndvi < 0.6:
            issues.append("vegetation_stress")
        if health_status == "risk":
            issues.append("health_risk")
        
        # Generate recommendation based on issues
        if "water_stress" in issues:
            recommendation = "Increase irrigation frequency"
            reason = f"Soil moisture at {soil_moisture:.1f}% is below optimal range (50-70%). NDVI at {ndvi:.2f} indicates vegetation stress."
            action_type = "moisture_recovery"
            yield_impact = "+8-12%"
            profit_impact = "+$4,500"
        elif "heat_stress" in issues:
            recommendation = "Activate shade systems and increase irrigation"
            reason = f"Temperature at {temperature:.1f}°C exceeds optimal range (20-28°C). Risk of heat damage to fruit and canopy."
            action_type = "heat_mitigation"
            yield_impact = "+5-8%"
            profit_impact = "+$3,200"
        elif "health_risk" in issues:
            recommendation = "Apply integrated pest management protocol"
            reason = "Multiple trees showing health decline. Early intervention can prevent spread."
            action_type = "pest_treatment"
            yield_impact = "+10-15%"
            profit_impact = "+$6,800"
        else:
            recommendation = "Maintain current management practices"
            reason = f"Orchard conditions are optimal. Temperature: {temperature:.1f}°C, Moisture: {soil_moisture:.1f}%, NDVI: {ndvi:.2f}"
            action_type = "monitoring"
            yield_impact = "0%"
            profit_impact = "$0"
        
        return {
            "recommendation": recommendation,
            "reason": reason,
            "confidence": 0.85,
            "impact": {
                "yield_change": yield_impact,
                "profit_change": profit_impact
            },
            "visual_action": {
                "type": action_type,
                "duration": 3000,
                "target_section": orchard_state.get("section", "all")
            },
            "model": "stub_deterministic",
            "amd_cloud_ready": self.is_configured,
            "note": "Using deterministic logic. Connect AMD Cloud API for LLM-powered recommendations."
        }
    
    def test_connection(self) -> Dict[str, Any]:
        """Test AMD Cloud API connection"""
        if not self.is_configured:
            return {
                "status": "not_configured",
                "message": "AMD Cloud API keys not set",
                "instructions": [
                    "Copy backend/.env.example to backend/.env",
                    "Add AMD_API_KEY from AMD Developer Cloud",
                    "Add AMD_API_URL and AMD_MODEL_ENDPOINT",
                    "Never commit .env file"
                ]
            }
        
        try:
            # TODO: Implement actual connection test
            return {
                "status": "configured",
                "api_key": self.get_masked_key(),
                "api_url": self.api_url,
                "model": self.model_name,
                "message": "API configured but connection test not yet implemented",
                "ready_for_testing": True
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }


# Create singleton instance
amd_client = AMDModelClient()


def get_ai_recommendation(
    orchard_state: Dict[str, Any],
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Convenience function to get AI recommendation
    
    Args:
        orchard_state: Current orchard metrics
        context: Additional context
    
    Returns:
        AI recommendation
    """
    return amd_client.generate_recommendation(orchard_state, context)


# CLI test
if __name__ == "__main__":
    print("\n" + "="*60)
    print("AMD Model Client Test")
    print("="*60)
    
    # Test connection
    connection_status = amd_client.test_connection()
    print(f"\nConnection Status: {json.dumps(connection_status, indent=2)}")
    
    # Test recommendation generation
    test_orchard_state = {
        "orchard_id": "test_orchard",
        "temperature": 34,
        "soil_moisture": 35,
        "health_status": "warning",
        "ndvi": 0.58,
        "section": "B2"
    }
    
    print(f"\nTest Orchard State: {json.dumps(test_orchard_state, indent=2)}")
    
    recommendation = amd_client.generate_recommendation(test_orchard_state)
    print(f"\nGenerated Recommendation: {json.dumps(recommendation, indent=2)}")
    
    print("\n" + "="*60)
    print("✅ Test complete")
    print("="*60 + "\n")

# Made with Bob