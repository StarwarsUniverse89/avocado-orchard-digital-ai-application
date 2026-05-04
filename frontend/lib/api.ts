// API client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

// Made with Bob
