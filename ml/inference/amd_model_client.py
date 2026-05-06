"""
AMD Cloud Model Client
Connects to AMD Cloud API for LLM inference via vLLM
Supports OpenAI-compatible /v1/chat/completions format
Returns stub responses if endpoint is not configured or unreachable
Uses Python standard library urllib (no external dependencies)
"""

import os
import sys
from typing import Dict, Any, Optional, List
import json
import urllib.request
import urllib.error
import urllib.parse

# Add backend to path for config import
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

try:
    from core.config import config
    CONFIG_AVAILABLE = True
except ImportError:
    CONFIG_AVAILABLE = False
    print("⚠️  Config not available, using environment variables directly")


class AMDModelClient:
    """Client for AMD Cloud LLM inference via vLLM"""
    
    def __init__(self):
        """Initialize AMD Cloud client"""
        if CONFIG_AVAILABLE:
            self.api_key = config.AMD_API_KEY
            self.api_url = config.AMD_API_URL
            self.model_endpoint = config.AMD_MODEL_ENDPOINT
            self.model_name = config.MODEL_NAME
            self.gpu_target = getattr(config, 'AMD_GPU_TARGET', 'AMD MI300X')
        else:
            self.api_key = os.getenv("AMD_API_KEY")
            self.api_url = os.getenv("AMD_API_URL", "https://api.amd.cloud/v1")
            self.model_endpoint = os.getenv("AMD_MODEL_ENDPOINT")
            self.model_name = os.getenv("AMD_MODEL_NAME", os.getenv("MODEL_NAME", "Qwen/Qwen2.5-7B-Instruct"))
            self.gpu_target = os.getenv("AMD_GPU_TARGET", "AMD MI300X")
        
        self.is_configured = bool(self.api_key and self.model_endpoint)
        self.mode = "live" if self.is_configured else "stub"
        
        if not self.is_configured:
            print("⚠️  AMD Cloud vLLM endpoint not configured")
            print("   To use AMD MI300X live inference:")
            print("   1. Copy backend/.env.example to backend/.env")
            print("   2. Set AMD_API_KEY (for authentication)")
            print("   3. Set AMD_MODEL_ENDPOINT (vLLM server URL)")
            print("   4. Set AMD_MODEL_NAME (default: Qwen/Qwen2.5-7B-Instruct)")
            print("   5. Never commit backend/.env to git")
            print("   Using deterministic stub responses for now...")
    
    def get_masked_key(self) -> str:
        """Return masked API key for safe logging (never expose full key)"""
        if not self.api_key:
            return "NOT_SET"
        if len(self.api_key) < 8:
            return "***"
        return f"{self.api_key[:4]}...{self.api_key[-4:]}"
    
    def _call_vllm_chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> Optional[str]:
        """
        Call vLLM server using OpenAI-compatible /v1/chat/completions format
        Uses Python standard library urllib (no external dependencies)
        
        Args:
            messages: List of chat messages [{"role": "system/user/assistant", "content": "..."}]
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
        
        Returns:
            Generated text or None if call fails
        """
        if not self.is_configured:
            return None
        
        try:
            # Construct OpenAI-compatible request
            # AMD_MODEL_ENDPOINT should be full URL like http://localhost:8000/v1/chat/completions
            url = self.model_endpoint
            if not url.endswith('/v1/chat/completions'):
                url = f"{url}/v1/chat/completions" if not url.endswith('/') else f"{url}v1/chat/completions"
            
            # Prepare payload
            payload = {
                "model": self.model_name,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": False
            }
            
            # Convert payload to JSON bytes
            data = json.dumps(payload).encode('utf-8')
            
            # Create request with headers (do not log API key)
            req = urllib.request.Request(
                url,
                data=data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                },
                method='POST'
            )
            
            print(f"🚀 Calling vLLM endpoint: {url}")
            print(f"   Model: {self.model_name}")
            print(f"   GPU: {self.gpu_target}")
            
            # Make request with 30 second timeout
            with urllib.request.urlopen(req, timeout=30) as response:
                response_data = response.read().decode('utf-8')
                result = json.loads(response_data)
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                
                print(f"✅ vLLM inference successful")
                return content
            
        except urllib.error.HTTPError as e:
            print(f"❌ vLLM HTTP error {e.code}: {e.reason}")
            return None
        except urllib.error.URLError as e:
            print(f"🔌 Cannot connect to vLLM endpoint: {e.reason}")
            return None
        except TimeoutError:
            print(f"⏱️  vLLM request timeout after 30s")
            return None
        except Exception as e:
            print(f"❌ vLLM call failed: {e}")
            return None
    
    def generate_text(
        self,
        prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 500
    ) -> Dict[str, Any]:
        """
        Generate text from a prompt using vLLM
        
        Args:
            prompt: Text prompt
            temperature: Sampling temperature (default 0.2 for more deterministic)
            max_tokens: Maximum tokens to generate
        
        Returns:
            Dict with success, text, model info, or error
        """
        if not self.is_configured:
            return {
                "success": False,
                "error": "AMD vLLM endpoint not configured",
                "mode": "stub"
            }
        
        try:
            messages = [
                {"role": "system", "content": "You are an expert avocado orchard advisor. Provide concise, actionable recommendations."},
                {"role": "user", "content": prompt}
            ]
            
            response_text = self._call_vllm_chat_completion(messages, temperature, max_tokens)
            
            if response_text:
                return {
                    "success": True,
                    "text": response_text,
                    "model": self.model_name,
                    "provider": f"{self.gpu_target} vLLM",
                    "mode": "live",
                    "fallback_used": False
                }
            else:
                return {
                    "success": False,
                    "error": "vLLM call returned no content",
                    "mode": "stub",
                    "fallback_used": True
                }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "mode": "stub",
                "fallback_used": True
            }
    
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
        # Try live vLLM inference first if configured
        if self.is_configured:
            try:
                # Prepare prompt for LLM
                system_prompt = """You are an expert agricultural AI advisor specializing in avocado orchard management.
Analyze the provided orchard data and provide a specific, actionable recommendation with reasoning and projected impact.
Format your response as JSON with these fields:
- recommendation: Brief action to take
- reason: Detailed explanation
- yield_impact: Projected yield change (e.g., "+12%")
- profit_impact: Projected profit change (e.g., "+$4,500")
- action_type: One of [moisture_recovery, heat_mitigation, pest_treatment, monitoring]"""
                
                user_prompt = f"""Orchard State:
- Temperature: {orchard_state.get('temperature', 25)}°C
- Soil Moisture: {orchard_state.get('soil_moisture', 60)}%
- NDVI: {orchard_state.get('ndvi', 0.75)}
- Health Status: {orchard_state.get('health_status', 'healthy')}
- Leaf Damage: {orchard_state.get('leaf_damage', 5)}%

Provide recommendation as JSON."""
                
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
                
                response_text = self._call_vllm_chat_completion(messages)
                
                if response_text:
                    # Try to parse JSON response
                    try:
                        # Extract JSON from response (handle markdown code blocks)
                        json_start = response_text.find('{')
                        json_end = response_text.rfind('}') + 1
                        if json_start >= 0 and json_end > json_start:
                            json_str = response_text[json_start:json_end]
                            llm_result = json.loads(json_str)
                            
                            return {
                                "recommendation": llm_result.get("recommendation", "Continue monitoring"),
                                "reason": llm_result.get("reason", "Analysis complete"),
                                "confidence": 0.90,
                                "impact": {
                                    "yield_change": llm_result.get("yield_impact", "0%"),
                                    "profit_change": llm_result.get("profit_impact", "$0")
                                },
                                "visual_action": {
                                    "type": llm_result.get("action_type", "monitoring"),
                                    "duration": 3000,
                                    "target_section": orchard_state.get("section", "all")
                                },
                                "model": f"{self.model_name} (vLLM on {self.gpu_target})",
                                "amd_cloud_ready": True,
                                "mode": "live",
                                "note": f"Live inference from {self.gpu_target}"
                            }
                    except json.JSONDecodeError:
                        print("⚠️  Could not parse LLM JSON response, using text")
                        return {
                            "recommendation": "AI Analysis Complete",
                            "reason": response_text[:200],
                            "confidence": 0.85,
                            "impact": {
                                "yield_change": "Analysis provided",
                                "profit_change": "See details"
                            },
                            "visual_action": {
                                "type": "monitoring",
                                "duration": 3000,
                                "target_section": orchard_state.get("section", "all")
                            },
                            "model": f"{self.model_name} (vLLM on {self.gpu_target})",
                            "amd_cloud_ready": True,
                            "mode": "live",
                            "note": f"Live inference from {self.gpu_target}"
                        }
            
            except Exception as e:
                print(f"❌ Error in live vLLM inference: {e}")
                print("   Falling back to deterministic stub")
        
        # Fall back to deterministic stub
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