# MongoDB MCP Integration: Operational Memory

The Gemini Orchard Operations Agent utilizes **MongoDB** as its primary "Operational Memory" layer. This integration follows the **Model Context Protocol (MCP)** patterns to give the agent historical awareness.

## Why MongoDB?
Avocado farming is a longitudinal challenge. By using MongoDB to store mission history and inspection outcomes, the agent can recognize recurring stress patterns (e.g., specific quadrants failing every dry season) that satellite data alone might miss.

## MCP Tooling Interface
The system exposes several tool concepts that map directly to MongoDB operations:

1. `get_recent_orchard_history`: Retrieves the last N analyses to establish health trends.
2. `save_drone_mission`: Persists flight strategies for future audit and comparison.
3. `save_inspection_analysis`: Stores AI-generated findings and recommended actions.
4. `retrieve_risk_trends`: Aggregates historical severity scores for regional reporting.

## Implementation
- **Schema**: Flexible document structure in MongoDB allows for varying inspection metadata (NDVI, thermal, vision results).
- **MCP Connector**: The agent uses the `MissionMemoryService` as an MCP-compliant interface to query and update state.
- **Fallback**: Supports local JSON/Mock storage to ensure reliability during demo environments where live MongoDB connectivity may be restricted.

## Operational Reasoning
With MongoDB MCP, the agent's reasoning transforms:
*   **Stateless**: "I see stress in Section B."
*   **MongoDB-Aware**: "I see stress in Section B. MongoDB records show this section was treated for Persea Mites 14 days ago. The treatment appears ineffective; I recommend a manual inspection of the irrigation valves."

---
*Partner Track: MongoDB*