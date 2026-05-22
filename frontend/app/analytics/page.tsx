import IntegratedCommandCenterPage from "@/components/IntegratedCommandCenterPage";

export default function AnalyticsPage() {
  return (
    <IntegratedCommandCenterPage
      eyebrow="Operational Analytics"
      title="Operational Trends And ML Readiness"
      description="Mission counts, segmentation review velocity, inspection trends, and ML label archive readiness for the Michoacan avocado network."
      signals={["Mission Counts", "Segmentation Review Stats", "ML Label Archive Readiness"]}
      outcome="Analytics roll up operational memory into trends that help prioritize where the next scan, inspection, or human correction should happen."
      metrics={[
        ["12", "Missions", "This month"],
        ["34", "Reviews", "Segmentation queue"],
        ["Ready", "ML Archive", "GeoJSON export"],
      ]}
      records={[
        ["Segmentation Review", "34 labels", "Accept or correct boundaries", "Active"],
        ["Drone Missions", "12 flights", "Analyze inspection deltas", "Live"],
        ["ML Label Archive", "Ready", "Export GeoJSON dataset", "Ready"],
      ]}
    />
  );
}
