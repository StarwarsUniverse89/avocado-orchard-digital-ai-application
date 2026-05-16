import uuid
from typing import List, Dict, Any
from services.gemini_service import gemini_service

class InterventionROIAgent:
    """
    Intervention ROI Agent
    Calculates the financial impact of recommended actions vs. the risk of delay.
    Represents the 'Strategic Reasoning' core of the Operations Agent.
    """

    def simulate_roi(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates ROI metrics based on severity and detected issues.
        Designed for Google Rapid Agents Hackathon.
        """
        roi_id = f"roi_{uuid.uuid4().hex[:8]}"
        
        # Base operational logic for ROI estimation
        severity = data.get("severity", "medium").lower()
        is_high = severity == "high"
        
        # Mock financial model for operational decision support
        recovery_percent = 15 if is_high else 8
        intervention_cost = 24000 if is_high else 12000
        avoided_loss = 320000 if is_high else 145000
        
        # Delay risk factors
        spread_risk = 22 if is_high else 12
        additional_exposure = avoided_loss * 2.1 if is_high else avoided_loss * 1.5

        # Generate Gemini reasoning for the ROI
        reasoning = gemini_service.generate_roi_reasoning(data)

        return {
            "roi_id": roi_id,
            "orchard_id": data.get("orchard_id"),
            "mission_id": data.get("mission_id"),
            "recommended_intervention": "Targeted Canapoy Treatment & Irrigation Pulse",
            "estimated_intervention_cost": intervention_cost,
            "estimated_yield_recovery_percent": recovery_percent,
            "avoided_loss_estimate": avoided_loss,
            "delay_14_day_risk": {
                "spread_risk_increase_percent": spread_risk,
                "additional_exposure": additional_exposure
            },
            "roi_summary": f"Intervention provides {recovery_percent}% yield recovery. Immediate action avoids ${avoided_loss:,} in loss.",
            "gemini_roi_reasoning": reasoning
        }

intervention_roi_agent = InterventionROIAgent()