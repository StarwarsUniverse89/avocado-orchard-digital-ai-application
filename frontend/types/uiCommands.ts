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
  | ResetViewCommand
  | ShowAvocadoBeltCommand
  | ShowProductionClustersCommand
  | CreateOrchardNetworkCommand
  | NavigateToMunicipalityCommand
  | SelectOrchardCommand
  | CompareMunicipalitiesCommand
  | ScanMunicipalityOrchardsCommand
  | SelectLargestOrchardCandidateCommand
  | SelectHighestStressParcelCommand
  | SaveOrchardToArchiveCommand
  | RunVisionPipelineCommand
  | Generate3DTwinFromOrchardCommand
  | ShowGPSBoundaryCommand
  | ShowOrchardArchiveCommand
  | ShowBeltMetricCommand
  | ShowMunicipalityMetricCommand
  | ShowDetectedOrchardsCommand
  | ShowArchivedOrchardsCommand
  | ShowHighStressParcelsCommand
  | ShowSelectedContextSummaryCommand;

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

// Mexico Avocado Network Commands
export interface ShowAvocadoBeltCommand {
  type: 'show_avocado_belt';
  belt?: any;
  municipalities?: any[];
}

export interface ShowProductionClustersCommand {
  type: 'show_production_clusters';
}

export interface CreateOrchardNetworkCommand {
  type: 'create_orchard_network';
  region?: string;
}

export interface NavigateToMunicipalityCommand {
  type: 'navigate_to_municipality';
  args?: {
    municipality_id: string;
    lat?: number;
    lng?: number;
    highlight?: boolean;
  };
}

export interface SelectOrchardCommand {
  type: 'select_orchard';
  args?: {
    orchard_id: string;
    lat?: number;
    lng?: number;
    highlight?: boolean;
  };
}

export interface CompareMunicipalitiesCommand {
  type: 'compare_municipalities';
  args?: {
    municipality_ids: string[];
    municipalities?: any[];
  };
}

// Orchard Detection Commands
export interface ScanMunicipalityOrchardsCommand {
  type: 'scan_municipality_orchards';
  args?: {
    municipality_id: string;
  };
}

export interface SelectLargestOrchardCandidateCommand {
  type: 'select_largest_orchard_candidate';
}

export interface SelectHighestStressParcelCommand {
  type: 'select_highest_stress_parcel';
}

export interface SaveOrchardToArchiveCommand {
  type: 'save_orchard_to_archive';
}

export interface RunVisionPipelineCommand {
  type: 'run_vision_pipeline';
}

export interface Generate3DTwinFromOrchardCommand {
  type: 'generate_3d_twin_from_orchard';
}

export interface ShowGPSBoundaryCommand {
  type: 'show_gps_boundary';
}

export interface ShowOrchardArchiveCommand {
  type: 'show_orchard_archive';
}

// Data Query Commands
export interface ShowBeltMetricCommand {
  type: 'show_belt_metric';
  metric: 'total_hectares' | 'total_trees' | 'average_ndvi' | 'profit_at_risk';
}

export interface ShowMunicipalityMetricCommand {
  type: 'show_municipality_metric';
  municipality_id?: string;
  metric: 'hectares' | 'ndvi' | 'stress_level' | 'projected_profit' | 'production_rank';
}

export interface ShowDetectedOrchardsCommand {
  type: 'show_detected_orchards';
  filter?: 'all' | 'high_stress' | 'medium_stress' | 'low_stress';
}

export interface ShowArchivedOrchardsCommand {
  type: 'show_archived_orchards';
}

export interface ShowHighStressParcelsCommand {
  type: 'show_high_stress_parcels';
}

export interface ShowSelectedContextSummaryCommand {
  type: 'show_selected_context_summary';
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
