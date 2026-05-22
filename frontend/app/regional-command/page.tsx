import IntegratedCommandCenterPage from "@/components/IntegratedCommandCenterPage";

export default function RegionalCommandPage() {
  return (
    <IntegratedCommandCenterPage
      eyebrow="Regional Command"
      title="Michoacan Avocado Belt Risk Operations"
      description="Municipality ranking, regional stress exposure, recommended missions, and operational network readiness for avocado field execution."
      signals={["Regional Risk Map", "Municipality Rankings", "Recommended Next Mission"]}
      outcome="Regional Command turns scan results into a municipality-level mission queue before operators drill into orchard blocks on the Cesium command surface."
      metrics={[
        ["142K ha", "Monitored", "Avocado belt"],
        ["8", "Municipalities", "Covered"],
        ["3", "High Risk Zones", "Needs mission"],
      ]}
      records={[
        ["Tancitaro", "High stress", "Focus orchard cluster", "Priority 1"],
        ["Uruapan", "Medium stress", "Segment selected municipality", "Priority 2"],
        ["Los Reyes", "Medium risk", "Schedule inspection", "Priority 3"],
        ["Periban", "Healthy", "Continue monitoring", "Live"],
      ]}
      modules={[
        ["Gemini", "Live / Mock", "Regional reasoning"],
        ["Segmentation", "Review Required", "Boundary confidence queue"],
        ["Mission Control", "Ready", "Drone route planning"],
      ]}
    />
  );
}
