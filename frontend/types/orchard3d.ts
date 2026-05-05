// TypeScript types for 3D Orchard Digital Twin

import { Vector3 } from 'three';

// Tree health and state
export type HealthStatus = 'healthy' | 'warning' | 'risk';
export type FruitStage = 'small' | 'medium' | 'large';

// Tree data structure
export interface TreeData {
  id: string;
  position: [number, number, number]; // x, y, z in 3D space
  section: string; // e.g., "A1", "B2"
  
  // Health metrics
  health: number; // 0-100
  health_status: HealthStatus;
  moisture: number; // 0-100
  temperature: number; // Celsius
  
  // Growth data
  canopy_size: number; // 0.5 - 1.5 (multiplier)
  trunk_height: number; // meters
  trunk_radius: number; // meters
  
  // Fruit data
  fruit_count: number;
  fruit_stage: FruitStage;
  fruit_clusters: FruitCluster[];
  
  // Visual state
  stress_level: number; // 0-100
  pest_infestation: boolean;
  disease_present: boolean;
}

// Fruit cluster positioning
export interface FruitCluster {
  position: [number, number, number]; // relative to tree center
  count: number; // fruits in this cluster
  stage: FruitStage;
}

// Orchard section
export interface OrchardSection {
  id: string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  trees: TreeData[];
  health_status: HealthStatus;
  tree_count: number;
}

// Visual action from AI recommendation
export interface VisualAction {
  type: 'moisture_recovery' | 'pest_treatment' | 'pruning' | 'fertilization' | 'harvest';
  target_section?: string;
  target_tree_ids?: string[];
  duration: number; // milliseconds
  intensity: number; // 0-1
  color?: string; // hex color for effect
}

// Simulation result from backend
export interface SimulationResult {
  health_status: HealthStatus;
  fruit_stage: FruitStage;
  canopy_size: number;
  yield_prediction: number;
  profit_prediction: number;
  visual_action?: VisualAction;
  affected_trees?: string[];
}

// Camera preset positions
export interface CameraPreset {
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

// Orchard grid configuration
export interface OrchardGridConfig {
  rows: number;
  cols: number;
  tree_spacing: number; // meters between trees in row
  row_spacing: number; // meters between rows
  offset_x: number; // grid offset
  offset_z: number; // grid offset
}

// Tree appearance configuration
export interface TreeAppearance {
  trunk_color: string;
  canopy_color: string;
  fruit_color: string;
  canopy_segments: number; // geometry detail
  trunk_segments: number;
  fruit_segments: number;
}

// Animation timeline
export interface AnimationTimeline {
  id: string;
  type: 'camera' | 'tree_state' | 'visual_action';
  duration: number;
  delay?: number;
  ease?: string;
  onComplete?: () => void;
}

// Heatmap overlay data
export interface HeatmapData {
  type: 'moisture' | 'temperature' | 'health' | 'yield';
  values: number[][]; // 2D grid of values
  min: number;
  max: number;
  colorScale: string[]; // array of hex colors
}

// 3D scene state
export interface Scene3DState {
  camera_mode: 'satellite' | 'section' | 'tree' | 'free';
  selected_section: string | null;
  selected_tree: string | null;
  hovered_tree: string | null;
  show_labels: boolean;
  show_grid: boolean;
  show_shadows: boolean;
  show_heatmap: boolean;
  heatmap_type: HeatmapData['type'] | null;
  animation_playing: boolean;
}

// Props for main 3D scene component
export interface OrchardScene3DProps {
  sections: OrchardSection[];
  onTreeSelect?: (tree: TreeData) => void;
  onSectionSelect?: (section: OrchardSection) => void;
  simulationResult?: SimulationResult;
  cameraMode?: Scene3DState['camera_mode'];
}

// Props for tree component
export interface AvocadoTreeProps {
  data: TreeData;
  selected?: boolean;
  hovered?: boolean;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

// Props for orchard grid
export interface OrchardGridProps {
  config: OrchardGridConfig;
  trees: TreeData[];
  onTreeClick?: (tree: TreeData) => void;
}

// Props for lighting
export interface SceneLightingProps {
  intensity?: number;
  shadowsEnabled?: boolean;
  timeOfDay?: 'morning' | 'noon' | 'evening';
}

// Props for environment
export interface OrchardEnvironmentProps {
  groundSize?: number;
  groundColor?: string;
  skyColor?: string;
  fogEnabled?: boolean;
  fogDensity?: number;
}

// Props for camera controller
export interface CameraControllerProps {
  preset?: CameraPreset;
  enableOrbit?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  minDistance?: number;
  maxDistance?: number;
  onCameraChange?: (position: Vector3, target: Vector3) => void;
}

// Backend API response types
export interface OrchardStateResponse {
  sections: OrchardSection[];
  total_trees: number;
  health_summary: {
    healthy: number;
    warning: number;
    risk: number;
  };
  last_updated: string;
}

export interface SimulationRequest {
  orchard_id: string;
  scenario: {
    heat_change?: number;
    moisture_change?: number;
    pest_change?: number;
    duration_days?: number;
  };
}

export interface AIRecommendationResponse {
  recommendations: Array<{
    id: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    impact: string;
    visual_action?: VisualAction;
  }>;
}

// Utility type for 3D positions
export type Position3D = [number, number, number];

// Utility type for RGB colors
export type RGBColor = [number, number, number];

// Tree LOD (Level of Detail) configuration
export interface TreeLODConfig {
  distance_near: number; // full detail
  distance_medium: number; // reduced detail
  distance_far: number; // minimal detail
  segments_near: number;
  segments_medium: number;
  segments_far: number;
}

// Performance metrics
export interface PerformanceMetrics {
  fps: number;
  draw_calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  memory_mb: number;
}

export default {
  // Export all types
};

// Made with Bob
