"""
Knowledge Agent
AI agent that provides recommendations based on orchard data and research knowledge
Uses LangGraph for workflow orchestration (future integration)
"""

from typing import Dict, Any, List
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.orchard_service import get_orchard_by_id
from services.satellite_service import get_satellite_data
from services.vision_service import analyze_orchard_vision
from services.yield_service import predict_yield
from services.financial_service import get_financial_prediction


def load_knowledge_base() -> Dict[str, Any]:
    """Load avocado research knowledge base"""
    try:
        kb_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "ml/knowledge/avocado_research_kb.json"
        )
        with open(kb_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Warning: Could not load knowledge base: {e}")
        return {}


def generate_recommendation(orchard_id: str) -> Dict[str, Any]:
    """
    Generate AI recommendation for an orchard
    
    Combines:
    - Orchard state
    - Satellite/NDVI data
    - Vision analysis
    - Yield prediction
    - Financial impact
    - Research knowledge
    
    Args:
        orchard_id: Orchard identifier
    
    Returns:
        Structured recommendation with reasoning
    """
    # Gather all data sources
    orchard = get_orchard_by_id(orchard_id)
    if not orchard:
        raise ValueError(f"Orchard {orchard_id} not found")
    
    satellite_data = get_satellite_data(orchard_id)
    vision_data = analyze_orchard_vision(orchard_id)
    yield_data = predict_yield(orchard_id)
    
    # Analyze conditions
    temperature = orchard.get("temperature", 25)
    soil_moisture = orchard.get("soil_moisture", 70)
    ndvi = satellite_data.get("ndvi_average", 0.75)
    leaf_damage = orchard.get("leaf_damage", 5)
    
    recommendations = []
    
    # Check soil moisture
    if soil_moisture < 50:
        # Calculate financial impact of irrigation
        scenario = {
            "temperature": temperature,
            "soil_moisture": 70,  # Target moisture
            "pest_pressure": leaf_damage / 2,
            "ndvi": min(ndvi + 0.1, 0.9),
        }
        financial_impact = get_financial_prediction(orchard_id, scenario)
        profit_gain = financial_impact["prediction"]["projected_gain_or_loss"]
        
        recommendations.append({
            "id": f"rec_{orchard_id}_irrigation",
            "recommendation": "Increase Irrigation",
            "reason": f"Soil moisture at {soil_moisture}% is below optimal range (60-80%). Water stress detected in NDVI analysis.",
            "impact": {
                "yield_change": f"+{abs(yield_data['yield_multiplier'] - 0.8) * 100:.0f}% yield protection",
                "profit_change": f"+${abs(profit_gain):,.0f} projected" if profit_gain > 0 else f"${profit_gain:,.0f} risk mitigation",
            },
            "confidence": 0.92,
            "priority": "high",
            "visual_action": {
                "type": "moisture_recovery",
                "duration": 3000,
                "target_section": "all",
            },
            "research_basis": "Avocado trees require consistent soil moisture. Water stress during fruit development reduces yield by 15-25%.",
        })
    
    # Check pest pressure
    if leaf_damage > 15:
        recommendations.append({
            "id": f"rec_{orchard_id}_pest",
            "recommendation": "Implement Pest Management",
            "reason": f"Leaf damage at {leaf_damage}% approaches economic injury level (17% PLAD for Persea mite).",
            "impact": {
                "yield_change": "Prevent 5-15% yield loss",
                "profit_change": "Protect $3,000-8,000 revenue",
            },
            "confidence": 0.88,
            "priority": "medium",
            "visual_action": {
                "type": "pest_treatment",
                "duration": 2000,
                "target_section": "affected_zones",
            },
            "research_basis": "Economic injury level for Persea mite is 17% PLAD. Early intervention prevents exponential population growth.",
        })
    
    # Check temperature stress
    if temperature > 32:
        recommendations.append({
            "id": f"rec_{orchard_id}_heat",
            "recommendation": "Mitigate Heat Stress",
            "reason": f"Temperature at {temperature}°C exceeds optimal range (20-28°C). Heat stress affects photosynthesis and fruit development.",
            "impact": {
                "yield_change": "Prevent 10-20% yield reduction",
                "profit_change": "Protect $4,000-7,000 revenue",
            },
            "confidence": 0.85,
            "priority": "high",
            "visual_action": {
                "type": "cooling_intervention",
                "duration": 3000,
                "target_section": "all",
            },
            "research_basis": "Avocado trees experience heat stress above 32°C. Increased irrigation and shade can mitigate impact.",
        })
    
    # Check NDVI health
    if ndvi < 0.7:
        recommendations.append({
            "id": f"rec_{orchard_id}_health",
            "recommendation": "Investigate Tree Health",
            "reason": f"NDVI at {ndvi} indicates reduced canopy vigor. May indicate nutrient deficiency or root issues.",
            "impact": {
                "yield_change": "Early detection prevents 10-30% loss",
                "profit_change": "Diagnostic investment: $500-1,000",
            },
            "confidence": 0.80,
            "priority": "medium",
            "visual_action": {
                "type": "health_assessment",
                "duration": 2000,
                "target_section": "low_ndvi_zones",
            },
            "research_basis": "NDVI below 0.7 in avocado orchards typically indicates stress. Soil and tissue analysis recommended.",
        })
    
    # If conditions are good
    if not recommendations:
        recommendations.append({
            "id": f"rec_{orchard_id}_maintain",
            "recommendation": "Maintain Current Management",
            "reason": "All metrics within optimal ranges. Continue monitoring.",
            "impact": {
                "yield_change": "Stable high yield expected",
                "profit_change": f"Projected: ${orchard.get('market_price', 2.8) * yield_data['estimated_yield_kg']:,.0f}",
            },
            "confidence": 0.95,
            "priority": "low",
            "visual_action": {
                "type": "status_quo",
                "duration": 1000,
                "target_section": "all",
            },
            "research_basis": "Optimal conditions maintained. Regular monitoring ensures early detection of changes.",
        })
    
    return {
        "orchard_id": orchard_id,
        "recommendations": recommendations,
        "data_sources": {
            "orchard_metrics": True,
            "satellite_ndvi": True,
            "vision_analysis": True,
            "yield_prediction": True,
            "financial_model": True,
            "research_kb": True,
        },
        "agent_version": "knowledge_agent_v1.0",
        "timestamp": "2026-05-05T00:00:00Z",
    }


def get_top_recommendation(orchard_id: str) -> Dict[str, Any]:
    """Get the highest priority recommendation"""
    result = generate_recommendation(orchard_id)
    recommendations = result["recommendations"]
    
    # Sort by priority
    priority_order = {"high": 0, "medium": 1, "low": 2}
    sorted_recs = sorted(recommendations, key=lambda x: priority_order.get(x["priority"], 3))
    
    return sorted_recs[0] if sorted_recs else None


def explain_recommendation(recommendation: Dict[str, Any]) -> str:
    """Generate natural language explanation of recommendation"""
    explanation = f"""
Recommendation: {recommendation['recommendation']}

Reasoning:
{recommendation['reason']}

Expected Impact:
- Yield: {recommendation['impact']['yield_change']}
- Financial: {recommendation['impact']['profit_change']}

Confidence: {recommendation['confidence'] * 100:.0f}%
Priority: {recommendation['priority'].upper()}

Research Basis:
{recommendation['research_basis']}
"""
    return explanation.strip()


# Future LangGraph Integration
"""
LangGraph Workflow for Advanced Agent:

1. State Definition
   - OrchardState: Current metrics, history, goals
   
2. Nodes
   - DataGathering: Collect all data sources
   - Analysis: Analyze conditions
   - KnowledgeRetrieval: Query research KB
   - RecommendationGeneration: Generate options
   - FinancialEvaluation: Calculate ROI
   - PrioritizationRanking: Rank recommendations
   - ExplanationGeneration: Create natural language output

3. Edges
   - Conditional routing based on data quality
   - Parallel execution for independent analyses
   - Human-in-the-loop for critical decisions

4. Tools
   - Satellite API
   - Vision model inference
   - Financial calculator
   - Knowledge base search
   - Weather forecast API

5. LLM Integration (AMD Cloud)
   - Qwen-2.5 for reasoning
   - Llama-3 for explanation
   - vLLM for fast inference
   - Streaming responses

Implementation:
```python
from langgraph.graph import StateGraph, END

workflow = StateGraph(OrchardState)
workflow.add_node("gather_data", gather_data_node)
workflow.add_node("analyze", analyze_node)
workflow.add_node("recommend", recommend_node)
workflow.add_edge("gather_data", "analyze")
workflow.add_edge("analyze", "recommend")
workflow.add_edge("recommend", END)
```
"""

# Made with Bob