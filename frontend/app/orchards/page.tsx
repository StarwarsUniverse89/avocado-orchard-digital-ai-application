import IntegratedCommandCenterPage from "@/components/IntegratedCommandCenterPage";

export default function OrchardsPage() {
  return (
    <IntegratedCommandCenterPage
      eyebrow="Owner Workspace"
      title="Orchard Workspace Integrated In Command Center"
      description="AI segmentation, manual orchard outlining, human-labeled boundary archive, and operational digital twin calibration are operated from the Cesium command surface."
      signals={["Segmentation Review", "Manual Boundary Archive", "Operational Digital Twin"]}
      outcome="Operators can use AI first-pass boundaries, outline reliable human-labeled orchards, and use those boundaries immediately for inspection, ROI, and tasking."
    />
  );
}
