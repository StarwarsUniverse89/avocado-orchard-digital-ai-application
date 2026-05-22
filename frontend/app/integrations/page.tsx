import IntegratedCommandCenterPage from "@/components/IntegratedCommandCenterPage";

export default function IntegrationsPage() {
  return (
    <IntegratedCommandCenterPage
      eyebrow="Integrations"
      title="Operational Systems And Provider Readiness"
      description="Gemini reasoning, MongoDB mission memory, Cesium geospatial rendering, drone provider placeholders, messaging provider controls, and API/webhook readiness."
      signals={["Gemini Status", "MongoDB MCP / Memory", "Cesium + Drone Provider Readiness"]}
      outcome="Integrations are presented as safe operational connectors. Messaging and drone dispatch remain human-approved in this demo workspace."
      metrics={[
        ["Gemini", "Live / Mock", "Reasoning"],
        ["MongoDB", "Live / Fallback", "Mission memory"],
        ["Cesium", "Ready", "Geospatial engine"],
      ]}
      records={[
        ["Gemini", "Live / Mock", "Operational reasoning", "Ready"],
        ["MongoDB Memory", "Live / Fallback", "Mission archive", "Ready"],
        ["Cesium", "Token configured", "Map command surface", "Live"],
        ["Drone Provider", "Placeholder", "Human dispatch only", "Pending"],
        ["Messaging", "Placeholder", "Approve before send", "Pending"],
        ["Webhooks", "API-ready", "Outbound disabled", "Safe"],
      ]}
      modules={[
        ["API", "Stable Contracts", "Existing backend preserved"],
        ["Webhooks", "Draft Ready", "No live sending"],
        ["Approval Gate", "Required", "Human-in-the-loop"],
      ]}
    />
  );
}
