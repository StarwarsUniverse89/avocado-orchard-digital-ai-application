// Synthetic orchard network data with real geographic coordinates
// These represent avocado orchards across major growing regions

export interface OrchardLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  altitude?: number;
  region: string;
  acres: number;
  treeCount: number;
  variety: string;
  healthScore: number;
  stressLevel: 'low' | 'medium' | 'high';
  sections: OrchardSection[];
}

export interface OrchardSection {
  id: string;
  name: string;
  bounds: [number, number][];  // [lat, lng] polygon
  ndvi: number;  // 0-1 vegetation index
  stressLevel: 'low' | 'medium' | 'high';
  treeCount: number;
  lastInspection: string;
}

export const orchardNetwork: OrchardLocation[] = [
  {
    id: 'orchard-001',
    name: 'Fallbrook Premium Orchard',
    lat: 33.3764,
    lng: -117.2514,
    altitude: 200,
    region: 'Southern California',
    acres: 45,
    treeCount: 1200,
    variety: 'Hass',
    healthScore: 92,
    stressLevel: 'low',
    sections: [
      {
        id: 'section-001-a',
        name: 'North Block',
        bounds: [
          [33.3774, -117.2524],
          [33.3774, -117.2504],
          [33.3754, -117.2504],
          [33.3754, -117.2524],
        ],
        ndvi: 0.85,
        stressLevel: 'low',
        treeCount: 400,
        lastInspection: '2026-05-05T10:00:00Z',
      },
      {
        id: 'section-001-b',
        name: 'South Block',
        bounds: [
          [33.3754, -117.2524],
          [33.3754, -117.2504],
          [33.3734, -117.2504],
          [33.3734, -117.2524],
        ],
        ndvi: 0.78,
        stressLevel: 'medium',
        treeCount: 400,
        lastInspection: '2026-05-05T10:30:00Z',
      },
      {
        id: 'section-001-c',
        name: 'East Block',
        bounds: [
          [33.3774, -117.2504],
          [33.3774, -117.2484],
          [33.3754, -117.2484],
          [33.3754, -117.2504],
        ],
        ndvi: 0.88,
        stressLevel: 'low',
        treeCount: 400,
        lastInspection: '2026-05-05T11:00:00Z',
      },
    ],
  },
  {
    id: 'orchard-002',
    name: 'Ventura Coastal Grove',
    lat: 34.2746,
    lng: -119.2290,
    altitude: 150,
    region: 'Ventura County',
    acres: 62,
    treeCount: 1650,
    variety: 'Hass',
    healthScore: 88,
    stressLevel: 'medium',
    sections: [
      {
        id: 'section-002-a',
        name: 'Coastal Block',
        bounds: [
          [34.2756, -119.2300],
          [34.2756, -119.2280],
          [34.2736, -119.2280],
          [34.2736, -119.2300],
        ],
        ndvi: 0.82,
        stressLevel: 'low',
        treeCount: 550,
        lastInspection: '2026-05-04T14:00:00Z',
      },
      {
        id: 'section-002-b',
        name: 'Inland Block',
        bounds: [
          [34.2736, -119.2300],
          [34.2736, -119.2280],
          [34.2716, -119.2280],
          [34.2716, -119.2300],
        ],
        ndvi: 0.72,
        stressLevel: 'high',
        treeCount: 550,
        lastInspection: '2026-05-04T14:30:00Z',
      },
      {
        id: 'section-002-c',
        name: 'Valley Block',
        bounds: [
          [34.2756, -119.2280],
          [34.2756, -119.2260],
          [34.2736, -119.2260],
          [34.2736, -119.2280],
        ],
        ndvi: 0.80,
        stressLevel: 'medium',
        treeCount: 550,
        lastInspection: '2026-05-04T15:00:00Z',
      },
    ],
  },
  {
    id: 'orchard-003',
    name: 'Temecula Valley Estate',
    lat: 33.4936,
    lng: -117.1484,
    altitude: 450,
    region: 'Riverside County',
    acres: 38,
    treeCount: 950,
    variety: 'Fuerte',
    healthScore: 95,
    stressLevel: 'low',
    sections: [
      {
        id: 'section-003-a',
        name: 'Upper Terrace',
        bounds: [
          [33.4946, -117.1494],
          [33.4946, -117.1474],
          [33.4926, -117.1474],
          [33.4926, -117.1494],
        ],
        ndvi: 0.90,
        stressLevel: 'low',
        treeCount: 475,
        lastInspection: '2026-05-05T09:00:00Z',
      },
      {
        id: 'section-003-b',
        name: 'Lower Terrace',
        bounds: [
          [33.4926, -117.1494],
          [33.4926, -117.1474],
          [33.4906, -117.1474],
          [33.4906, -117.1494],
        ],
        ndvi: 0.87,
        stressLevel: 'low',
        treeCount: 475,
        lastInspection: '2026-05-05T09:30:00Z',
      },
    ],
  },
  {
    id: 'orchard-004',
    name: 'Santa Barbara Highland Ranch',
    lat: 34.4208,
    lng: -119.6982,
    altitude: 300,
    region: 'Santa Barbara County',
    acres: 55,
    treeCount: 1450,
    variety: 'Hass',
    healthScore: 85,
    stressLevel: 'medium',
    sections: [
      {
        id: 'section-004-a',
        name: 'Highland North',
        bounds: [
          [34.4218, -119.6992],
          [34.4218, -119.6972],
          [34.4198, -119.6972],
          [34.4198, -119.6992],
        ],
        ndvi: 0.75,
        stressLevel: 'medium',
        treeCount: 485,
        lastInspection: '2026-05-03T11:00:00Z',
      },
      {
        id: 'section-004-b',
        name: 'Highland South',
        bounds: [
          [34.4198, -119.6992],
          [34.4198, -119.6972],
          [34.4178, -119.6972],
          [34.4178, -119.6992],
        ],
        ndvi: 0.70,
        stressLevel: 'high',
        treeCount: 485,
        lastInspection: '2026-05-03T11:30:00Z',
      },
      {
        id: 'section-004-c',
        name: 'Highland East',
        bounds: [
          [34.4218, -119.6972],
          [34.4218, -119.6952],
          [34.4198, -119.6952],
          [34.4198, -119.6972],
        ],
        ndvi: 0.82,
        stressLevel: 'low',
        treeCount: 480,
        lastInspection: '2026-05-03T12:00:00Z',
      },
    ],
  },
  {
    id: 'orchard-005',
    name: 'Escondido Premium Grove',
    lat: 33.1192,
    lng: -117.0864,
    altitude: 350,
    region: 'San Diego County',
    acres: 50,
    treeCount: 1300,
    variety: 'Hass',
    healthScore: 90,
    stressLevel: 'low',
    sections: [
      {
        id: 'section-005-a',
        name: 'West Block',
        bounds: [
          [33.1202, -117.0874],
          [33.1202, -117.0854],
          [33.1182, -117.0854],
          [33.1182, -117.0874],
        ],
        ndvi: 0.86,
        stressLevel: 'low',
        treeCount: 650,
        lastInspection: '2026-05-05T08:00:00Z',
      },
      {
        id: 'section-005-b',
        name: 'East Block',
        bounds: [
          [33.1202, -117.0854],
          [33.1202, -117.0834],
          [33.1182, -117.0834],
          [33.1182, -117.0854],
        ],
        ndvi: 0.84,
        stressLevel: 'low',
        treeCount: 650,
        lastInspection: '2026-05-05T08:30:00Z',
      },
    ],
  },
];

// Helper function to get orchard by ID
export function getOrchardById(id: string): OrchardLocation | undefined {
  return orchardNetwork.find((orchard) => orchard.id === id);
}

// Helper function to get section by ID
export function getSectionById(
  orchardId: string,
  sectionId: string
): OrchardSection | undefined {
  const orchard = getOrchardById(orchardId);
  return orchard?.sections.find((section) => section.id === sectionId);
}

// Helper function to calculate network statistics
export function getNetworkStats() {
  return {
    totalOrchards: orchardNetwork.length,
    totalAcres: orchardNetwork.reduce((sum, o) => sum + o.acres, 0),
    totalTrees: orchardNetwork.reduce((sum, o) => sum + o.treeCount, 0),
    averageHealth: Math.round(
      orchardNetwork.reduce((sum, o) => sum + o.healthScore, 0) /
        orchardNetwork.length
    ),
    highStressOrchards: orchardNetwork.filter((o) => o.stressLevel === 'high')
      .length,
  };
}

// Made with Bob
