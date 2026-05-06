// UI Command types for AI Advisor to trigger UI actions

export type UICommand =
  | NavigateToOrchardCommand
  | ShowNetworkCommand
  | ShowStressZonesCommand
  | SelectSectionCommand
  | Enter3DTwinCommand
  | RunSimulationCommand
  | ApplyRecommendationCommand
  | ShowFinancialImpactCommand
  | CreateAnalyticsSummaryCommand
  | ResetViewCommand;

export interface NavigateToOrchardCommand {
  type: 'navigate_to_orchard';
  orchardId: string;
  flyDuration?: number; // seconds
}

export interface ShowNetworkCommand {
  type: 'show_network';
  highlightStress?: boolean;
}

export interface ShowStressZonesCommand {
  type: 'show_stress_zones';
  orchardId?: string;
  threshold?: 'low' | 'medium' | 'high';
}

export interface SelectSectionCommand {
  type: 'select_section';
  orchardId: string;
  sectionId: string;
}

export interface Enter3DTwinCommand {
  type: 'enter_3d_twin';
  orchardId: string;
  sectionId?: string;
}

export interface RunSimulationCommand {
  type: 'run_simulation';
  orchardId: string;
  scenarioType: 'irrigation' | 'fertilization' | 'pest_control' | 'harvest';
  parameters?: Record<string, any>;
}

export interface ApplyRecommendationCommand {
  type: 'apply_recommendation';
  orchardId: string;
  recommendationId: string;
  autoExecute?: boolean;
}

export interface ShowFinancialImpactCommand {
  type: 'show_financial_impact';
  focus?: boolean;
}

export interface CreateAnalyticsSummaryCommand {
  type: 'create_analytics_summary';
  include_all?: boolean;
}

export interface ResetViewCommand {
  type: 'reset_view';
  zoomLevel?: 'global' | 'regional' | 'orchard';
}

// Command handler type
export type UICommandHandler = (command: UICommand) => void | Promise<void>;

// Helper to parse command from AI text
export function parseUICommand(text: string): UICommand | null {
  const lowerText = text.toLowerCase();

  // Navigate to orchard
  const navMatch = text.match(/navigate[_\s]to[_\s]orchard[:\s]+([a-z0-9-]+)/i);
  if (navMatch) {
    return {
      type: 'navigate_to_orchard',
      orchardId: navMatch[1],
    };
  }

  // Show network
  if (lowerText.includes('show network') || lowerText.includes('show_network')) {
    return {
      type: 'show_network',
      highlightStress: lowerText.includes('stress'),
    };
  }

  // Show stress zones
  if (lowerText.includes('show stress') || lowerText.includes('show_stress')) {
    const orchardMatch = text.match(/orchard[:\s]+([a-z0-9-]+)/i);
    return {
      type: 'show_stress_zones',
      orchardId: orchardMatch?.[1],
    };
  }

  // Select section
  const sectionMatch = text.match(
    /select[_\s]section[:\s]+([a-z0-9-]+)[,\s]+([a-z0-9-]+)/i
  );
  if (sectionMatch) {
    return {
      type: 'select_section',
      orchardId: sectionMatch[1],
      sectionId: sectionMatch[2],
    };
  }

  // Enter 3D twin
  const twinMatch = text.match(/enter[_\s]3d[_\s]twin[:\s]+([a-z0-9-]+)/i);
  if (twinMatch || lowerText.includes('enter 3d') || lowerText.includes('enter_3d')) {
    const orchardMatch = text.match(/orchard[:\s]+([a-z0-9-]+)/i);
    return {
      type: 'enter_3d_twin',
      orchardId: orchardMatch?.[1] || '',
    };
  }

  // Run simulation
  const simMatch = text.match(/run[_\s]simulation[:\s]+([a-z_]+)/i);
  if (simMatch) {
    const orchardMatch = text.match(/orchard[:\s]+([a-z0-9-]+)/i);
    return {
      type: 'run_simulation',
      orchardId: orchardMatch?.[1] || '',
      scenarioType: simMatch[1] as any,
    };
  }

  // Apply recommendation
  const recMatch = text.match(/apply[_\s]recommendation[:\s]+([a-z0-9-]+)/i);
  if (recMatch) {
    const orchardMatch = text.match(/orchard[:\s]+([a-z0-9-]+)/i);
    return {
      type: 'apply_recommendation',
      orchardId: orchardMatch?.[1] || '',
      recommendationId: recMatch[1],
    };
  }

  // Reset view
  if (lowerText.includes('reset view') || lowerText.includes('reset_view')) {
    return {
      type: 'reset_view',
    };
  }

  return null;
}

// Made with Bob
