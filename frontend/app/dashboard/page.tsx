import IntegratedCommandCenterPage from "@/components/IntegratedCommandCenterPage";

export default function DashboardPage() {
  return (
    <IntegratedCommandCenterPage
      eyebrow="Regional Command"
      title="Dashboard Integrated In Command Center"
      description="The regional overview, operational network setup, segmentation state, mission memory, and priority zones are consolidated inside the premium three-panel Command Center."
      signals={["Regional Command", "Operational Memory", "Mission Control"]}
      outcome="Regional operators see belt-wide scan status, municipality context, segmentation review, and active workflow state without leaving the command surface."
    />
  );
}
