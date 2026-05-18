import IntegratedCommandCenterPage from "@/components/IntegratedCommandCenterPage";

export default function AnalyticsPage() {
  return (
    <IntegratedCommandCenterPage
      eyebrow="Financial Exposure"
      title="Analytics Integrated In Command Center"
      description="Inspection analysis, ROI simulation, financial exposure, and recommended next actions now live in the Active Intelligence panel so analysis stays tied to the selected orchard boundary."
      signals={["Inspection Analysis", "ROI Simulation", "Financial Exposure"]}
      outcome="Financial exposure is modeled against the selected orchard block so ROI, avoided loss, and recommended field action stay grounded in operational context."
    />
  );
}
