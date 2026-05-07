/**
 * Selection Context Resolver
 * 
 * Resolves the current user selection context in priority order:
 * 1. selectedOrchardCandidate (detected parcel)
 * 2. selectedArchivedOrchard (saved parcel)
 * 3. selectedMunicipality (municipality)
 * 4. Mexico network analytics (fallback)
 */

import { getMexicoAvocadoAnalytics, mexicoAvocadoMunicipalities } from './mexicoAvocadoNetwork';

export type ContextType = 'orchard_candidate' | 'archived_orchard' | 'municipality' | 'network';

export interface SelectionContext {
  context_type: ContextType;
  id: string;
  name: string;
  municipality_id?: string;
  archive_id?: string;
  center_lat: number;
  center_lng: number;
  estimated_hectares?: number;
  estimated_acres?: number;
  estimated_tree_count?: number;
  ndvi_average?: number;
  stress_level?: 'low' | 'medium' | 'high';
  confidence?: number;
  projected_profit_usd?: number;
  projected_profit_at_risk_usd?: number;
  source: string;
  raw_data?: any;
}

export interface SelectionState {
  selectedOrchardCandidate?: any;
  selectedArchivedOrchard?: any;
  selectedMunicipality?: any;
}

/**
 * Resolve the current selection context
 */
export function resolveSelectionContext(state: SelectionState): SelectionContext {
  // Priority 1: Selected orchard candidate (detected parcel)
  if (state.selectedOrchardCandidate) {
    const candidate = state.selectedOrchardCandidate;
    return {
      context_type: 'orchard_candidate',
      id: candidate.orchard_id || candidate.id,
      name: candidate.name || `Detected Parcel ${candidate.orchard_id}`,
      municipality_id: candidate.municipality_id,
      archive_id: candidate.archive_id,
      center_lat: candidate.center_lat || candidate.lat,
      center_lng: candidate.center_lng || candidate.lng,
      estimated_hectares: candidate.estimated_hectares,
      estimated_acres: candidate.estimated_acres,
      estimated_tree_count: candidate.estimated_tree_count || candidate.tree_count,
      ndvi_average: candidate.ndvi_average || candidate.ndvi,
      stress_level: candidate.stress_level,
      confidence: candidate.confidence,
      projected_profit_usd: candidate.projected_profit_usd,
      source: 'detected_parcel',
      raw_data: candidate,
    };
  }

  // Priority 2: Selected archived orchard
  if (state.selectedArchivedOrchard) {
    const archived = state.selectedArchivedOrchard;
    return {
      context_type: 'archived_orchard',
      id: archived.archive_id || archived.id,
      name: archived.name || `Archived Orchard ${archived.archive_id}`,
      municipality_id: archived.municipality_id,
      archive_id: archived.archive_id,
      center_lat: archived.center_lat || archived.lat,
      center_lng: archived.center_lng || archived.lng,
      estimated_hectares: archived.estimated_hectares,
      estimated_acres: archived.estimated_acres,
      estimated_tree_count: archived.estimated_tree_count || archived.tree_count,
      ndvi_average: archived.ndvi_average || archived.ndvi,
      stress_level: archived.stress_level,
      confidence: archived.confidence,
      projected_profit_usd: archived.projected_profit_usd,
      source: 'archived_orchard',
      raw_data: archived,
    };
  }

  // Priority 3: Selected municipality
  if (state.selectedMunicipality) {
    const municipality = state.selectedMunicipality;
    const municipalityData = mexicoAvocadoMunicipalities.find(
      m => m.id === municipality.id || m.name === municipality.name
    );

    if (municipalityData) {
      return {
        context_type: 'municipality',
        id: municipalityData.id,
        name: municipalityData.name,
        municipality_id: municipalityData.id,
        center_lat: municipalityData.lat,
        center_lng: municipalityData.lng,
        estimated_hectares: municipalityData.estimated_hectares,
        ndvi_average: municipalityData.ndvi_average,
        stress_level: municipalityData.stress_level,
        projected_profit_usd: municipalityData.projected_profit_usd,
        source: 'municipality',
        raw_data: municipalityData,
      };
    }
  }

  // Priority 4: Mexico network analytics (fallback)
  const analytics = getMexicoAvocadoAnalytics();
  return {
    context_type: 'network',
    id: 'michoacan_avocado_belt',
    name: 'Michoacán Avocado Belt',
    center_lat: 19.4,
    center_lng: -102.0,
    estimated_hectares: analytics.total_estimated_hectares,
    estimated_tree_count: analytics.total_estimated_trees,
    ndvi_average: analytics.average_ndvi,
    projected_profit_at_risk_usd: analytics.projected_profit_at_risk_usd,
    source: 'network_analytics',
    raw_data: analytics,
  };
}

/**
 * Get context display name
 */
export function getContextDisplayName(context: SelectionContext): string {
  switch (context.context_type) {
    case 'orchard_candidate':
      return context.archive_id || context.name;
    case 'archived_orchard':
      return context.archive_id || context.name;
    case 'municipality':
      return `${context.name} Municipality`;
    case 'network':
      return 'Mexico Avocado Network';
    default:
      return context.name;
  }
}

/**
 * Check if context has sufficient data for financial analysis
 */
export function canCalculateFinancialImpact(context: SelectionContext): boolean {
  return !!(
    context.estimated_hectares ||
    context.estimated_acres ||
    context.estimated_tree_count
  );
}

/**
 * Get recommended workflow steps based on context
 */
export function getRecommendedWorkflow(
  context: SelectionContext,
  action: 'financial_impact' | 'analytics_summary' | 'vision_analysis'
): Array<{ step: string; status: 'completed' | 'ready' | 'needs_selection'; action?: string }> {
  const workflows = {
    financial_impact: {
      orchard_candidate: [
        { step: 'Load parcel metrics', status: 'completed' as const },
        { step: 'Calculate profit/yield risk', status: 'ready' as const },
        { step: 'Show Financial Impact panel', status: 'ready' as const, action: 'open_panel' },
      ],
      archived_orchard: [
        { step: 'Load archived orchard', status: 'completed' as const },
        { step: 'Calculate financial impact', status: 'ready' as const },
        { step: 'Show Financial Impact panel', status: 'ready' as const, action: 'open_panel' },
      ],
      municipality: [
        { step: 'Scan municipality for parcels', status: 'needs_selection' as const, action: 'scan_municipality' },
        { step: 'Select parcel', status: 'needs_selection' as const },
        { step: 'Show financial impact', status: 'needs_selection' as const },
      ],
      network: [
        { step: 'Select municipality', status: 'needs_selection' as const, action: 'select_municipality' },
        { step: 'Scan Area for Orchards', status: 'needs_selection' as const },
        { step: 'Select parcel', status: 'needs_selection' as const },
        { step: 'Show financial impact', status: 'needs_selection' as const },
      ],
    },
    analytics_summary: {
      orchard_candidate: [
        { step: 'Load selected parcel', status: 'completed' as const },
        { step: 'Load vision/3D analysis if available', status: 'ready' as const },
        { step: 'Generate analytics summary', status: 'ready' as const, action: 'open_panel' },
      ],
      archived_orchard: [
        { step: 'Load archived orchard', status: 'completed' as const },
        { step: 'Generate analytics summary', status: 'ready' as const, action: 'open_panel' },
      ],
      municipality: [
        { step: 'Load municipality data', status: 'completed' as const },
        { step: 'Generate municipality analytics', status: 'ready' as const, action: 'open_panel' },
      ],
      network: [
        { step: 'Load network analytics', status: 'completed' as const },
        { step: 'Generate network summary', status: 'ready' as const, action: 'open_panel' },
      ],
    },
    vision_analysis: {
      orchard_candidate: [
        { step: 'Confirm selected parcel', status: 'completed' as const },
        { step: 'Run Vision/3D Analysis', status: 'ready' as const, action: 'run_vision' },
        { step: 'View tree-level insights', status: 'needs_selection' as const },
      ],
      archived_orchard: [
        { step: 'Load archived orchard', status: 'completed' as const },
        { step: 'Run Vision/3D Analysis', status: 'ready' as const, action: 'run_vision' },
        { step: 'View tree-level insights', status: 'needs_selection' as const },
      ],
      municipality: [
        { step: 'Scan municipality for parcels', status: 'needs_selection' as const, action: 'scan_municipality' },
        { step: 'Select parcel', status: 'needs_selection' as const },
        { step: 'Run Vision/3D Analysis', status: 'needs_selection' as const },
      ],
      network: [
        { step: 'Select municipality', status: 'needs_selection' as const },
        { step: 'Scan for orchards', status: 'needs_selection' as const },
        { step: 'Select parcel', status: 'needs_selection' as const },
        { step: 'Run Vision/3D Analysis', status: 'needs_selection' as const },
      ],
    },
  };

  return workflows[action][context.context_type] || [];
}

// Made with Bob
