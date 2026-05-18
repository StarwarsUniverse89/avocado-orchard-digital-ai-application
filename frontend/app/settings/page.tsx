import IntegratedCommandCenterPage from "@/components/IntegratedCommandCenterPage";

export default function SettingsPage() {
  return (
    <IntegratedCommandCenterPage
      eyebrow="Settings / Integrations"
      title="Integrations Managed In Command Center"
      description="Gemini status, MongoDB memory mode, human approval controls, Cesium routes, and ML label archive readiness are surfaced in the Command Center without changing backend workflows."
      signals={["Gemini Live / Mock", "MongoDB Memory", "Human Approval Required"]}
      outcome="Settings are presented as operational readiness signals for Gemini reasoning, mission memory, field task approval, and ML label archive preparation."
    />
  );
}
