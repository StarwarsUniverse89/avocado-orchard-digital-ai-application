export type StressLevel = "low" | "medium" | "high";

export interface AvocadoBeltBounds {
  id: string;
  name: string;
  state: string;
  country: string;
  lat_min: number;
  lat_max: number;
  lng_min: number;
  lng_max: number;
  description: string;
}

export interface AvocadoMunicipality {
  id: string;
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  estimated_hectares: number;
  production_rank?: number;
  stress_level: StressLevel;
  ndvi_average: number;
  projected_profit_usd: number;
  note: string;
}

export interface AvocadoCluster {
  id: string;
  name: string;
  center_lat: number;
  center_lng: number;
  radius_km: number;
  priority: StressLevel;
  estimated_hectares: number;
  municipalities: string[];
  ndvi_average: number;
  stress_level: StressLevel;
  projected_profit_risk_usd: number;
}

export interface SyntheticOrchardCandidate {
  orchard_id: string;
  name: string;
  cluster_id: string;
  municipality_id: string;
  lat: number;
  lng: number;
  estimated_acres: number;
  estimated_trees: number;
  ndvi_average: number;
  stress_level: StressLevel;
  soil_moisture: number;
  pest_pressure: number;
  projected_yield_kg: number;
  projected_revenue_usd: number;
  projected_profit_usd: number;
  sections: {
    section_id: string;
    name: string;
    ndvi: number;
    stress_level: StressLevel;
    soil_moisture: number;
    health_score: number;
  }[];
}

export const michoacanAvocadoBelt: AvocadoBeltBounds = {
  id: "michoacan_avocado_belt",
  name: "Michoacán Avocado Belt",
  state: "Michoacán",
  country: "Mexico",
  lat_min: 18.75,
  lat_max: 20.0,
  lng_min: -103.2167,
  lng_max: -101.7833,
  description:
    "Primary avocado production belt in Michoacán, defined from approximately 18°45′ to 20°00′ N and 101°47′ to 103°13′ W.",
};

export const mexicoAvocadoMunicipalities: AvocadoMunicipality[] = [
  {
    id: "tancitaro",
    name: "Tancítaro",
    state: "Michoacán",
    country: "Mexico",
    lat: 19.33,
    lng: -102.36,
    estimated_hectares: 30000,
    production_rank: 1,
    stress_level: "medium",
    ndvi_average: 0.71,
    projected_profit_usd: 1850000,
    note: "Major avocado growing area near Pico de Tancítaro.",
  },
  {
    id: "uruapan",
    name: "Uruapan",
    state: "Michoacán",
    country: "Mexico",
    lat: 19.4138,
    lng: -102.0518,
    estimated_hectares: 20000,
    production_rank: 2,
    stress_level: "low",
    ndvi_average: 0.78,
    projected_profit_usd: 1420000,
    note: "Known as the Avocado Capital of the World.",
  },
  {
    id: "salvador_escalante",
    name: "Salvador Escalante",
    state: "Michoacán",
    country: "Mexico",
    lat: 19.38,
    lng: -101.71,
    estimated_hectares: 15000,
    production_rank: 3,
    stress_level: "medium",
    ndvi_average: 0.68,
    projected_profit_usd: 980000,
    note: "High-density avocado production area.",
  },
  {
    id: "ario_de_rosales",
    name: "Ario de Rosales",
    state: "Michoacán",
    country: "Mexico",
    lat: 19.21,
    lng: -101.71,
    estimated_hectares: 14000,
    production_rank: 4,
    stress_level: "high",
    ndvi_average: 0.59,
    projected_profit_usd: 820000,
    note: "Significant avocado-producing municipality.",
  },
  {
    id: "periban",
    name: "Peribán",
    state: "Michoacán",
    country: "Mexico",
    lat: 19.52,
    lng: -102.41,
    estimated_hectares: 12000,
    production_rank: 5,
    stress_level: "medium",
    ndvi_average: 0.66,
    projected_profit_usd: 760000,
    note: "One of the major avocado-producing municipalities.",
  },
  {
    id: "ziracuaretiro",
    name: "Ziracuaretiro",
    state: "Michoacán",
    country: "Mexico",
    lat: 19.423,
    lng: -101.914,
    estimated_hectares: 8500,
    stress_level: "medium",
    ndvi_average: 0.64,
    projected_profit_usd: 540000,
    note: "High demand for irrigation and satellite monitoring.",
  },
  {
    id: "tacambaro",
    name: "Tacámbaro",
    state: "Michoacán",
    country: "Mexico",
    lat: 19.23,
    lng: -101.46,
    estimated_hectares: 9000,
    stress_level: "medium",
    ndvi_average: 0.67,
    projected_profit_usd: 610000,
    note: "Significant high-altitude orchard density.",
  },
  {
    id: "zitacuaro",
    name: "Zitácuaro",
    state: "Michoacán",
    country: "Mexico",
    lat: 19.43,
    lng: -100.36,
    estimated_hectares: 6000,
    stress_level: "high",
    ndvi_average: 0.58,
    projected_profit_usd: 390000,
    note: "Eastern avocado production cluster.",
  },
];

export const michoacanAvocadoClusters: AvocadoCluster[] = [
  {
    id: "cluster_tancitaro_periban",
    name: "Tancítaro-Peribán Cluster",
    center_lat: 19.42,
    center_lng: -102.38,
    radius_km: 22,
    priority: "high",
    estimated_hectares: 42000,
    municipalities: ["tancitaro", "periban"],
    ndvi_average: 0.68,
    stress_level: "medium",
    projected_profit_risk_usd: 310000,
  },
  {
    id: "cluster_uruapan",
    name: "Uruapan Cluster",
    center_lat: 19.41,
    center_lng: -102.05,
    radius_km: 18,
    priority: "high",
    estimated_hectares: 20000,
    municipalities: ["uruapan"],
    ndvi_average: 0.78,
    stress_level: "low",
    projected_profit_risk_usd: 120000,
  },
  {
    id: "cluster_ziracuaretiro_escalante",
    name: "Ziracuaretiro-Salvador Escalante Cluster",
    center_lat: 19.4,
    center_lng: -101.82,
    radius_km: 20,
    priority: "high",
    estimated_hectares: 23500,
    municipalities: ["ziracuaretiro", "salvador_escalante"],
    ndvi_average: 0.66,
    stress_level: "medium",
    projected_profit_risk_usd: 240000,
  },
  {
    id: "cluster_tacambaro_ario",
    name: "Tacámbaro-Ario de Rosales Cluster",
    center_lat: 19.22,
    center_lng: -101.59,
    radius_km: 22,
    priority: "medium",
    estimated_hectares: 23000,
    municipalities: ["tacambaro", "ario_de_rosales"],
    ndvi_average: 0.62,
    stress_level: "high",
    projected_profit_risk_usd: 390000,
  },
  {
    id: "cluster_zitacuaro",
    name: "Zitácuaro Cluster",
    center_lat: 19.43,
    center_lng: -100.36,
    radius_km: 16,
    priority: "medium",
    estimated_hectares: 6000,
    municipalities: ["zitacuaro"],
    ndvi_average: 0.58,
    stress_level: "high",
    projected_profit_risk_usd: 180000,
  },
];

const stressLevels: StressLevel[] = ["low", "medium", "high"];

function deterministicOffset(seed: number, scale: number): number {
  const value = Math.sin(seed * 999) * 10000;
  return (value - Math.floor(value) - 0.5) * scale;
}

function getStressLevel(index: number, clusterStress: StressLevel): StressLevel {
  if (clusterStress === "high") {
    return index % 3 === 0 ? "high" : index % 3 === 1 ? "medium" : "high";
  }

  if (clusterStress === "medium") {
    return index % 3 === 0 ? "medium" : index % 3 === 1 ? "low" : "high";
  }

  return stressLevels[index % 2];
}

export function generateOrchardsForCluster(
  cluster: AvocadoCluster,
  count = 3
): SyntheticOrchardCandidate[] {
  const primaryMunicipality =
    mexicoAvocadoMunicipalities.find((municipality) =>
      cluster.municipalities.includes(municipality.id)
    ) ?? mexicoAvocadoMunicipalities[0];

  return Array.from({ length: count }).map((_, index) => {
    const latOffset = deterministicOffset(index + cluster.center_lat, 0.12);
    const lngOffset = deterministicOffset(index + Math.abs(cluster.center_lng), 0.12);
    const stressLevel = getStressLevel(index, cluster.stress_level);
    const ndviBase = cluster.ndvi_average - index * 0.025;
    const ndvi = Math.max(0.45, Math.min(0.86, Number(ndviBase.toFixed(2))));
    const estimatedAcres = 180 + index * 65 + cluster.radius_km * 4;
    const estimatedTrees = Math.round(estimatedAcres * 95);
    const projectedYieldKg = Math.round(estimatedTrees * (stressLevel === "high" ? 42 : stressLevel === "medium" ? 56 : 68));
    const projectedRevenueUsd = Math.round(projectedYieldKg * 2.8);
    const projectedProfitUsd = Math.round(projectedRevenueUsd * (stressLevel === "high" ? 0.38 : stressLevel === "medium" ? 0.52 : 0.62));

    return {
      orchard_id: `${cluster.id}_orchard_${index + 1}`,
      name: `${cluster.name} Orchard ${index + 1}`,
      cluster_id: cluster.id,
      municipality_id: primaryMunicipality.id,
      lat: Number((cluster.center_lat + latOffset).toFixed(5)),
      lng: Number((cluster.center_lng + lngOffset).toFixed(5)),
      estimated_acres: Math.round(estimatedAcres),
      estimated_trees: estimatedTrees,
      ndvi_average: ndvi,
      stress_level: stressLevel,
      soil_moisture: stressLevel === "high" ? 38 : stressLevel === "medium" ? 54 : 68,
      pest_pressure: stressLevel === "high" ? 72 : stressLevel === "medium" ? 44 : 21,
      projected_yield_kg: projectedYieldKg,
      projected_revenue_usd: projectedRevenueUsd,
      projected_profit_usd: projectedProfitUsd,
      sections: [
        {
          section_id: "north_block",
          name: "North Block",
          ndvi: Number(Math.min(0.88, ndvi + 0.03).toFixed(2)),
          stress_level: stressLevel === "high" ? "medium" : "low",
          soil_moisture: stressLevel === "high" ? 45 : 66,
          health_score: stressLevel === "high" ? 68 : 84,
        },
        {
          section_id: "central_block",
          name: "Central Block",
          ndvi,
          stress_level: stressLevel,
          soil_moisture: stressLevel === "high" ? 36 : 58,
          health_score: stressLevel === "high" ? 57 : 76,
        },
        {
          section_id: "south_block",
          name: "South Block",
          ndvi: Number(Math.max(0.42, ndvi - 0.04).toFixed(2)),
          stress_level: stressLevel === "low" ? "medium" : stressLevel,
          soil_moisture: stressLevel === "high" ? 32 : 51,
          health_score: stressLevel === "high" ? 49 : 72,
        },
      ],
    };
  });
}

export function generateMichoacanOrchardNetwork(): SyntheticOrchardCandidate[] {
  return michoacanAvocadoClusters.flatMap((cluster) =>
    generateOrchardsForCluster(cluster, 3)
  );
}

export const michoacanSyntheticOrchards = generateMichoacanOrchardNetwork();

export function getHighestStressOrchard() {
  return [...michoacanSyntheticOrchards].sort((a, b) => {
    const stressScore = { low: 1, medium: 2, high: 3 };
    return stressScore[b.stress_level] - stressScore[a.stress_level] || a.ndvi_average - b.ndvi_average;
  })[0];
}

export function getTopProductionMunicipality() {
  return [...mexicoAvocadoMunicipalities].sort(
    (a, b) => b.estimated_hectares - a.estimated_hectares
  )[0];
}

export function getMexicoAvocadoAnalytics() {
  const totalHectares = mexicoAvocadoMunicipalities.reduce(
    (sum, item) => sum + item.estimated_hectares,
    0
  );

  const averageNdvi =
    mexicoAvocadoMunicipalities.reduce((sum, item) => sum + item.ndvi_average, 0) /
    mexicoAvocadoMunicipalities.length;

  const highestRiskOrchard = getHighestStressOrchard();
  const topMunicipality = getTopProductionMunicipality();

  return {
    total_estimated_hectares: totalHectares,
    total_synthetic_orchards: michoacanSyntheticOrchards.length,
    total_estimated_trees: michoacanSyntheticOrchards.reduce(
      (sum, orchard) => sum + orchard.estimated_trees,
      0
    ),
    average_ndvi: Number(averageNdvi.toFixed(2)),
    top_production_municipality: topMunicipality,
    highest_risk_orchard: highestRiskOrchard,
    projected_profit_at_risk_usd: michoacanAvocadoClusters.reduce(
      (sum, cluster) => sum + cluster.projected_profit_risk_usd,
      0
    ),
  };
}