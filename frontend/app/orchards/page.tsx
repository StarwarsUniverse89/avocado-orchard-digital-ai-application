import IntegratedCommandCenterPage from "@/components/IntegratedCommandCenterPage";

export default function OrchardsPage() {
  return (
    <IntegratedCommandCenterPage
      eyebrow="Owner Workspace"
      title="Owner Workspace And Boundary Operations"
      description="AI segmentation, manual orchard outlining, human-labeled boundary archive, and operational digital twin calibration are operated from the Cesium command surface."
      signals={["Segmentation Review", "Manual Boundary Archive", "Operational Digital Twin"]}
      outcome="Operators can use AI first-pass boundaries, outline reliable human-labeled orchards, and use those boundaries immediately for inspection, ROI, and tasking."
      metrics={[
        ["847", "Blocks", "Active monitoring"],
        ["91%", "Confidence", "Segmentation model"],
        ["Ready", "ML Labels", "Archive export"],
      ]}
      records={[
        ["Block 7A", "High stress", "Open in Command Center", "Review"],
        ["Tancitaro West", "Human-labeled", "Use boundary as truth", "Ready"],
        ["Uruapan North", "Medium risk", "Dispatch drone route", "Queued"],
        ["Los Reyes 12", "Healthy", "Monitor next scan", "Live"],
      ]}
      modules={[
        ["Risk Filter", "High / Medium / Low", "Orchard inventory"],
        ["Municipality Filter", "Tancitaro / Uruapan", "Regional scope"],
        ["Owner Filter", "Owner Workspace", "Demo role mode"],
      ]}
    />
  );
}
