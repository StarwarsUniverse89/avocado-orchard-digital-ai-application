import uuid
from typing import List, Dict, Any
from services.gemini_service import gemini_service

class TaskDelegationAgent:
    """
    Task Delegation Agent
    Prepares actionable messages for farm owners, operators, or field workers
    based on AI-driven inspection analysis.
    """

    def draft_task(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Drafts a communication task for human approval.
        Designed for Google Rapid Agents Hackathon.
        """
        task_id = f"task_{uuid.uuid4().hex[:8]}"
        
        # Determine priority based on severity
        severity = data.get("severity", "medium").lower()
        priority = "emergency" if severity == "high" else "urgent" if severity == "medium" else "standard"
        
        # Use Gemini to generate the message
        task_message = gemini_service.generate_task_delegation_message({
            "orchard_id": data.get("orchard_id"),
            "mission_id": data.get("mission_id"),
            "recipient_role": data.get("recipient_role"),
            "recommended_actions": data.get("recommended_actions"),
            "estimated_financial_impact": data.get("estimated_financial_impact")
        })

        # Future integration points:
        # - Twilio: self.sms_service.prepare(to, task_message)
        # - SendGrid: self.email_service.prepare(to, task_message)
        # - WhatsApp: integration via Meta for Business API
        
        return {
            "task_id": task_id,
            "status": "drafted",
            "recipient_role": data.get("recipient_role"),
            "priority": priority,
            "task_title": f"Treatment Protocol: {data.get('orchard_id').upper()}",
            "task_message": task_message,
            "approval_required": True,
            "delivery_channels": ["sms", "email", "whatsapp"],
            "gemini_task_summary": f"Human-in-the-loop task drafted for {data.get('recipient_role')}. Priority: {priority}."
        }

task_delegation_agent = TaskDelegationAgent()