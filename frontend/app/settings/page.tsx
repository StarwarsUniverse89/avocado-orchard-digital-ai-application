import IntegratedCommandCenterPage from "@/components/IntegratedCommandCenterPage";

export default function SettingsPage() {
  return (
    <IntegratedCommandCenterPage
      eyebrow="Settings / Integrations"
      title="Operational Readiness And Integrations"
      description="Gemini status, MongoDB memory mode, human approval controls, Cesium routes, and ML label archive readiness are surfaced in the Command Center without changing backend workflows."
      signals={["Gemini Live / Mock", "MongoDB Memory", "Human Approval Required"]}
      outcome="Settings are presented as operational readiness signals for Gemini reasoning, mission memory, field task approval, and ML label archive preparation."
      metrics={[
        ["Gemini", "Live / Mock", "Reasoning layer"],
        ["Memory", "Live / Fallback", "Mission archive"],
        ["Approval", "Required", "Field tasking"],
      ]}
      records={[
        ["Tenant", "Gemini Orchard OS", "Workspace profile", "Configured"],
        ["Role Mode", "Regional Operator", "Demo access scope", "Active"],
        ["Data Sources", "Mock / Live ready", "No auth required", "Stable"],
        ["Human Approval", "Required", "Hold outbound messages", "Enabled"],
      ]}
      modules={[
        ["Gemini", "Live / Mock", "AI reasoning status"],
        ["MongoDB Memory", "Live / Fallback", "Operational memory"],
        ["ML Archive", "Ready", "Training dataset preparation"],
      ]}
    />
  );
}
