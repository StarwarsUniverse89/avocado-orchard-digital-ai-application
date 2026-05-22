import IntegratedCommandCenterPage from "@/components/IntegratedCommandCenterPage";

export default function FinancialExposurePage() {
  return (
    <IntegratedCommandCenterPage
      eyebrow="Financial Exposure"
      title="ROI And Delay-Risk Scenario Planning"
      description="Avoided loss, intervention cost, delay scenarios, and municipality exposure modeling tied to selected orchard boundaries."
      signals={["ROI Cards", "Delay-Risk Scenarios", "Intervention Cost vs Avoided Loss"]}
      outcome="Financial Exposure keeps yield risk and field task cost visible before a human approves the recommended intervention."
      metrics={[
        ["$210K", "Exposure", "Modeled loss risk"],
        ["$38K", "Intervention", "Estimated cost"],
        ["5.5x", "ROI", "Avoided loss ratio"],
      ]}
      records={[
        ["Block 7A", "$42K exposure", "Approve irrigation task", "High"],
        ["Tancitaro West", "$67K exposure", "Dispatch drone validation", "High"],
        ["Uruapan North", "$28K exposure", "Run inspection analysis", "Medium"],
        ["Los Reyes", "$12K exposure", "Monitor trend", "Low"],
      ]}
      modules={[
        ["Human Approval", "Required", "No automatic send"],
        ["Operational Memory", "Saved", "ROI scenario history"],
        ["Field Tasking", "Drafted", "Owner/manager workflow"],
      ]}
    />
  );
}
