// API client for backend communication

// Port 8001 is FastAPI backend, Port 8000 is vLLM
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Health check
export async function checkHealth(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Get all orchards
export async function getOrchards(): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orchards`);
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Get specific orchard
export async function getOrchard(id: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orchards/${id}`);
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Get orchard metrics
export async function getOrchardMetrics(id: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orchards/${id}/metrics`);
    const result = await response.json();
    return { success: true, data: result.metrics };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Get AI recommendations
export async function getRecommendations(orchardId?: string): Promise<ApiResponse<any[]>> {
  try {
    const url = orchardId
      ? `${API_BASE_URL}/api/v1/ai/recommendations/${orchardId}`
      : `${API_BASE_URL}/api/v1/ai/recommendations`;
    const response = await fetch(url);
    const result = await response.json();
    return { success: true, data: result.recommendations };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Run simulation
export async function runSimulation(scenario: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/simulation/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scenario),
    });
    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Get simulation status
export async function getSimulationStatus(id: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/simulation/${id}/status`);
    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Get analytics summary
export async function getAnalyticsSummary(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/analytics/summary`);
    const result = await response.json();
    return { success: true, data: result.summary };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Get system status
export async function getSystemStatus(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/system/status`);
    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Get satellite data for an orchard
export async function getSatelliteData(orchardId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/satellite/${orchardId}`);
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Get NDVI time series
export async function getNDVITimeseries(orchardId: string, days: number = 30): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/satellite/${orchardId}/ndvi?days=${days}`);
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Get stress heatmap
export async function getStressHeatmap(orchardId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/satellite/${orchardId}/heatmap`);
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Orchard Detection API

// Scan area for orchards
export async function scanAreaForOrchards(bbox: any, municipalityId: string, saveToArchive: boolean = false): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orchard-detection/scan-area`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bbox,
        municipality_id: municipalityId,
        save_to_archive: saveToArchive,
      }),
    });
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Scan municipality for orchards
export async function scanMunicipalityForOrchards(municipalityId: string, saveToArchive: boolean = false): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orchard-detection/scan-municipality`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        municipality_id: municipalityId,
        save_to_archive: saveToArchive,
      }),
    });
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Get detection status
export async function getDetectionStatus(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orchard-detection/status`);
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Orchard Archive API

// Get orchard archive
export async function getOrchardArchive(filters?: {
  municipalityId?: string;
  stressLevel?: string;
  minHectares?: number;
  maxHectares?: number;
}): Promise<ApiResponse<any>> {
  try {
    const params = new URLSearchParams();
    if (filters?.municipalityId) params.append("municipality_id", filters.municipalityId);
    if (filters?.stressLevel) params.append("stress_level", filters.stressLevel);
    if (filters?.minHectares) params.append("min_hectares", filters.minHectares.toString());
    if (filters?.maxHectares) params.append("max_hectares", filters.maxHectares.toString());
    
    const url = `${API_BASE_URL}/api/v1/orchard-archive${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await fetch(url);
    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Get archived orchard by ID
export async function getArchivedOrchard(archiveId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orchard-archive/${archiveId}`);
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Save orchard to archive
export async function saveOrchardToArchive(orchardData: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orchard-archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orchardData),
    });
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Vision/3D Analysis API

// Run vision/3D analysis on orchard parcel
export async function runVision3DAnalysis(orchardData: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/vision-3d/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orchardData),
    });
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// AMD Status API

// Get AMD status
export async function getAMDStatus(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/amd/status`);
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Mexico Network API

// Get Mexico analytics
export async function getMexicoAnalytics(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/orchard-network/mexico/analytics`);
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Agent Command API

// Send agent command
export async function sendAgentCommand(command: string, context?: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/agent/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command, context: context || {} }),
    });
    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Get agent recommendation
export async function getAgentRecommendation(municipalityName?: string, orchardId?: string, command?: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        municipality_name: municipalityName,
        orchard_id: orchardId,
        command: command,
      }),
    });
    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Drone Mission API
export async function planDroneMission(orchardId: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/drone/plan-mission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orchard_id: orchardId }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Drone Mission API Error (${response.status}):`, errorText);
      return { 
        success: false, 
        error: `Server error ${response.status}: ${errorText.substring(0, 50)}...` 
      };
    }
    
    const result = await response.json();
    console.log("Drone Mission Plan Received:", result);
    
    // Support both direct object return and wrapped { data: ... } format
    const missionData = result.data !== undefined ? result.data : result;
    return { success: true, data: missionData };
  } catch (error) {
    console.error("Drone Mission API Network Failure:", error);
    return { success: false, error: String(error) };
  }
}

export async function analyzeDroneInspection(payload: {
  mission_id: string;
  orchard_id: string;
  mock_image_targets: string[];
}): Promise<ApiResponse<any>> {
  console.log("📡 API: Posting to analyze-inspection", payload);
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/drone/analyze-inspection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }
    
    const result = await response.json();
    console.log("Drone Inspection Analysis Received:", result);
    
    // Support both direct object return and wrapped { data: ... } format
    const analysisData = result?.data ?? result;
    return { success: true, data: analysisData };
  } catch (error) {
    console.error("Drone Inspection API Network Failure:", error);
    return { success: false, error: String(error) };
  }
}

// Made with Bob
