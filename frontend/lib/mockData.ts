// Mock data for demo - simulates live orchard data

export interface OrchardData {
  id: string;
  name: string;
  location: string;
  temperature: number;
  soil_moisture: number;
  pest_pressure: number;
  ndvi: number;
  fruit_size: number;
  canopy_size: number;
  yield_per_tree: number;
  revenue: number;
  profit: number;
  health_status: "healthy" | "warning" | "risk";
  harvest_days: number;
  trees_count: number;
}

export interface TreeData {
  id: string;
  x: number;
  y: number;
  z: number;
  health: number;
  moisture: number;
  temperature: number;
  fruit_count: number;
  fruit_size: "small" | "medium" | "large";
  health_status: "healthy" | "warning" | "risk";
}

export interface AIRecommendation {
  id: string;
  recommendation: string;
  reason: string;
  impact: {
    yield_change: string;
    profit_change: string;
  };
  confidence: number;
  visual_action: {
    type: string;
    duration: number;
  };
  priority: "high" | "medium" | "low";
}

// Base orchard data
export const mockOrchards: OrchardData[] = [
  {
    id: "orchard_A",
    name: "North Valley Orchard",
    location: "California, USA",
    temperature: 24.5,
    soil_moisture: 65,
    pest_pressure: 12,
    ndvi: 0.85,
    fruit_size: 85,
    canopy_size: 92,
    yield_per_tree: 130,
    revenue: 54600,
    profit: 32400,
    health_status: "healthy",
    harvest_days: 45,
    trees_count: 150,
  },
  {
    id: "orchard_B",
    name: "South Ridge Orchard",
    location: "California, USA",
    temperature: 28.2,
    soil_moisture: 42,
    pest_pressure: 28,
    ndvi: 0.72,
    fruit_size: 68,
    canopy_size: 78,
    yield_per_tree: 105,
    revenue: 42000,
    profit: 24000,
    health_status: "warning",
    harvest_days: 52,
    trees_count: 140,
  },
];

// Generate tree grid for 3D visualization
export function generateTreeGrid(rows: number = 10, cols: number = 15): TreeData[] {
  const trees: TreeData[] = [];
  const spacing = 6; // meters between trees

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const health = 70 + Math.random() * 30;
      const moisture = 40 + Math.random() * 40;
      
      trees.push({
        id: `tree-${row}-${col}`,
        x: col * spacing,
        y: 0,
        z: row * spacing,
        health,
        moisture,
        temperature: 20 + Math.random() * 10,
        fruit_count: Math.floor(80 + Math.random() * 50),
        fruit_size: health > 85 ? "large" : health > 70 ? "medium" : "small",
        health_status: health >= 85 ? "healthy" : health >= 60 ? "warning" : "risk",
      });
    }
  }

  return trees;
}

// Simulate live data updates
export function simulateLiveUpdate(orchard: OrchardData): OrchardData {
  const variation = 0.02; // 2% variation
  
  return {
    ...orchard,
    temperature: orchard.temperature + (Math.random() - 0.5) * 2,
    soil_moisture: Math.max(0, Math.min(100, orchard.soil_moisture + (Math.random() - 0.5) * 3)),
    pest_pressure: Math.max(0, Math.min(100, orchard.pest_pressure + (Math.random() - 0.5) * 2)),
    ndvi: Math.max(0, Math.min(1, orchard.ndvi + (Math.random() - 0.5) * 0.02)),
  };
}

// Apply simulation scenario
export function applySimulation(
  orchard: OrchardData,
  scenario: {
    heat_change?: number;
    moisture_change?: number;
    pest_change?: number;
  }
): OrchardData {
  let updated = { ...orchard };

  if (scenario.heat_change) {
    updated.temperature += scenario.heat_change;
  }

  if (scenario.moisture_change) {
    updated.soil_moisture = Math.max(0, Math.min(100, updated.soil_moisture + scenario.moisture_change));
  }

  if (scenario.pest_change) {
    updated.pest_pressure = Math.max(0, Math.min(100, updated.pest_pressure + scenario.pest_change));
  }

  // Recalculate health status
  const healthScore = 
    (updated.soil_moisture / 100) * 0.4 +
    (1 - updated.pest_pressure / 100) * 0.3 +
    (updated.ndvi) * 0.3;

  updated.health_status = healthScore > 0.75 ? "healthy" : healthScore > 0.5 ? "warning" : "risk";

  // Recalculate yield and profit
  const yieldImpact = healthScore * 1.2;
  updated.yield_per_tree = Math.round(orchard.yield_per_tree * yieldImpact);
  updated.revenue = Math.round(updated.yield_per_tree * updated.trees_count * 2.8);
  updated.profit = Math.round(updated.revenue * 0.6);

  return updated;
}

// Generate AI recommendations based on orchard state
export function generateRecommendations(orchard: OrchardData): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  // Check soil moisture
  if (orchard.soil_moisture < 50) {
    recommendations.push({
      id: `rec-moisture-${orchard.id}`,
      recommendation: "Increase Irrigation",
      reason: `Soil moisture at ${orchard.soil_moisture.toFixed(1)}% is below optimal threshold (60-70%). Risk of water stress during fruit development.`,
      impact: {
        yield_change: "+12% yield protection",
        profit_change: `+$${Math.round(orchard.profit * 0.12).toLocaleString()} projected`,
      },
      confidence: 0.92,
      visual_action: {
        type: "moisture_recovery",
        duration: 3000,
      },
      priority: "high",
    });
  }

  // Check pest pressure
  if (orchard.pest_pressure > 20) {
    recommendations.push({
      id: `rec-pest-${orchard.id}`,
      recommendation: "Implement Pest Management",
      reason: `Pest pressure at ${orchard.pest_pressure.toFixed(1)}% is approaching economic injury level (17% PLAD). Persea mite activity detected.`,
      impact: {
        yield_change: "Prevent 5-15% yield loss",
        profit_change: `+$${Math.round(orchard.profit * 0.10).toLocaleString()} protection`,
      },
      confidence: 0.88,
      visual_action: {
        type: "pest_treatment",
        duration: 2500,
      },
      priority: "medium",
    });
  }

  // Check temperature
  if (orchard.temperature > 30) {
    recommendations.push({
      id: `rec-temp-${orchard.id}`,
      recommendation: "Heat Stress Mitigation",
      reason: `Temperature at ${orchard.temperature.toFixed(1)}°C exceeds optimal range (18-25°C). Risk of reduced photosynthesis and fruit quality.`,
      impact: {
        yield_change: "Prevent 8% quality loss",
        profit_change: `+$${Math.round(orchard.profit * 0.08).toLocaleString()} protection`,
      },
      confidence: 0.85,
      visual_action: {
        type: "cooling_strategy",
        duration: 3500,
      },
      priority: "medium",
    });
  }

  // Optimal harvest timing
  if (orchard.harvest_days <= 60 && orchard.health_status === "healthy") {
    recommendations.push({
      id: `rec-harvest-${orchard.id}`,
      recommendation: "Optimal Harvest Window Approaching",
      reason: `Based on fruit size (${orchard.fruit_size}%) and market conditions, optimal harvest window is ${orchard.harvest_days} days. Current health status supports extended maturation.`,
      impact: {
        yield_change: "+8% fruit weight potential",
        profit_change: `+$${Math.round(orchard.profit * 0.08).toLocaleString()} revenue opportunity`,
      },
      confidence: 0.91,
      visual_action: {
        type: "harvest_planning",
        duration: 2000,
      },
      priority: "low",
    });
  }

  return recommendations;
}

// Orchard sections for satellite view
export interface OrchardSection {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  health_status: "healthy" | "warning" | "risk";
  tree_count: number;
  ndvi: number;
  stress_level: number; // 0-100, higher is more stress
  soil_moisture: number;
  temperature: number;
}

export const orchardSections: OrchardSection[] = [
  {
    id: "section-north",
    name: "North Section",
    bounds: { x: 0, y: 0, width: 50, height: 30 },
    health_status: "healthy",
    tree_count: 45,
    ndvi: 0.82,
    stress_level: 15,
    soil_moisture: 68,
    temperature: 24.2,
  },
  {
    id: "section-central",
    name: "Central Section",
    bounds: { x: 0, y: 30, width: 50, height: 30 },
    health_status: "warning",
    tree_count: 52,
    ndvi: 0.64,
    stress_level: 42,
    soil_moisture: 45,
    temperature: 27.8,
  },
  {
    id: "section-south",
    name: "South Section",
    bounds: { x: 0, y: 60, width: 50, height: 30 },
    health_status: "healthy",
    tree_count: 48,
    ndvi: 0.78,
    stress_level: 22,
    soil_moisture: 62,
    temperature: 25.1,
  },
  {
    id: "section-east",
    name: "East Section",
    bounds: { x: 50, y: 0, width: 50, height: 50 },
    health_status: "healthy",
    tree_count: 55,
    ndvi: 0.85,
    stress_level: 12,
    soil_moisture: 72,
    temperature: 23.5,
  },
  {
    id: "section-west",
    name: "West Section",
    bounds: { x: 50, y: 50, width: 50, height: 50 },
    health_status: "risk",
    tree_count: 38,
    ndvi: 0.58,
    stress_level: 65,
    soil_moisture: 38,
    temperature: 29.2,
  },
];

// Satellite data interface
export interface SatelliteData {
  orchard_id: string;
  timestamp: string;
  ndvi_average: number;
  stress_zones: StressZone[];
  satellite_layer: {
    type: string;
    asset: string;
  };
}

export interface StressZone {
  section_id: string;
  severity: "low" | "medium" | "high";
  ndvi: number;
  recommendation: string;
}

// Generate synthetic satellite data
export function getSatelliteData(orchardId: string): SatelliteData {
  const stressZones: StressZone[] = orchardSections
    .filter(section => section.stress_level > 30)
    .map(section => ({
      section_id: section.id,
      severity: section.stress_level > 60 ? "high" : section.stress_level > 40 ? "medium" : "low",
      ndvi: section.ndvi,
      recommendation: section.stress_level > 60
        ? "Immediate irrigation and inspection required"
        : "Monitor closely and adjust irrigation schedule",
    }));

  const avgNdvi = orchardSections.reduce((sum, s) => sum + s.ndvi, 0) / orchardSections.length;

  return {
    orchard_id: orchardId,
    timestamp: new Date().toISOString(),
    ndvi_average: Math.round(avgNdvi * 100) / 100,
    stress_zones: stressZones,
    satellite_layer: {
      type: "aerial",
      asset: "/assets/ui/avocado_orchard_aerialview.webp",
    },
  };
}

// Made with Bob
