# Cesium Globe Command Center Setup

## Overview

The Cesium Globe Command Center provides a real-world satellite view of the orchard network using Cesium Ion's 3D globe and satellite imagery. This replaces the previous mock satellite view with actual geographic data.

## Features

- **Real Cesium Globe**: Uses Cesium Ion for authentic satellite imagery and 3D terrain
- **Orchard Network**: 5 synthetic orchards across California with real lat/lng coordinates
- **Interactive Markers**: Click orchards to view details and fly to location
- **NDVI Overlays**: Color-coded section polygons showing vegetation health
- **Stress Zones**: Visual indicators for low/medium/high stress areas
- **3D Twin Integration**: Seamless transition from globe view to 3D digital twin
- **AI Commands**: AI Advisor can trigger UI actions like navigation and selection
- **Fallback Mode**: Gracefully falls back to previous view if token is missing

## Setup Instructions

### 1. Get Cesium Ion Token

1. Create account at https://ion.cesium.com/
2. Go to Access Tokens
3. Create a new token with scopes:
   - `assets:read`
   - `geocode`
4. Copy the token

### 2. Configure Environment

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_CESIUM_ION_TOKEN=your_token_here
NEXT_PUBLIC_MAP_PROVIDER=cesium
```

**Important**: 
- Do NOT commit `frontend/.env.local` (already in .gitignore)
- The token is already excluded from git
- Use `.env.local.example` as a template

### 3. Install Dependencies

Already installed:
```bash
npm install cesium resium
```

### 4. Run the Application

```bash
cd frontend
npm run dev
```

Navigate to: http://localhost:3000/command-center

## Orchard Network

The system includes 5 synthetic orchards:

1. **Fallbrook Premium Orchard** (San Diego County)
   - Location: 33.3764°N, 117.2514°W
   - 45 acres, 1,200 trees
   - Health: 92% (Low stress)

2. **Ventura Coastal Grove** (Ventura County)
   - Location: 34.2746°N, 119.2290°W
   - 62 acres, 1,650 trees
   - Health: 88% (Medium stress)

3. **Temecula Valley Estate** (Riverside County)
   - Location: 33.4936°N, 117.1484°W
   - 38 acres, 950 trees
   - Health: 95% (Low stress)

4. **Santa Barbara Highland Ranch** (Santa Barbara County)
   - Location: 34.4208°N, 119.6982°W
   - 55 acres, 1,450 trees
   - Health: 85% (Medium stress)

5. **Escondido Premium Grove** (San Diego County)
   - Location: 33.1192°N, 117.0864°W
   - 50 acres, 1,300 trees
   - Health: 90% (Low stress)

Each orchard has 2-3 sections with individual NDVI values and stress levels.

## UI Commands

The AI Advisor can trigger these commands:

### Navigation Commands
- `navigate_to_orchard: orchard-001` - Fly to specific orchard
- `show_network` - Reset to global view
- `show_stress_zones` - Display NDVI overlays

### Selection Commands
- `select_section: orchard-001, section-001-a` - Select specific section
- `enter_3d_twin: orchard-001` - Enter 3D digital twin view

### Control Commands
- `reset_view` - Reset camera to home position
- `run_simulation: irrigation` - Run scenario simulation
- `apply_recommendation: rec-001` - Apply AI recommendation

## Component Architecture

### GlobeCommandView
Main component that renders the Cesium globe:
- `frontend/components/GlobeCommandView.tsx`
- Handles orchard markers, section polygons, camera controls
- Implements fallback to SatelliteOrchardView if token missing

### Orchard Network Data
Synthetic orchard data with real coordinates:
- `frontend/lib/orchardNetwork.ts`
- Contains 5 orchards with lat/lng, sections, NDVI values

### UI Command System
Type-safe command system for AI integration:
- `frontend/types/uiCommands.ts`
- Defines command types and parser
- Enables AI to control UI programmatically

### AI Advisor Integration
Updated to support UI commands:
- `frontend/components/AIAdvisorPanel.tsx`
- Recommendations can trigger navigation/selection
- Click "Apply" to execute command

## Fallback Behavior

If `NEXT_PUBLIC_CESIUM_ION_TOKEN` is not set:
1. Component detects missing token
2. Shows warning message: "Cesium token missing, using fallback satellite panel."
3. Renders previous `SatelliteOrchardView` component
4. Application continues to function normally

## NDVI Color Coding

Sections are colored by NDVI (Normalized Difference Vegetation Index):
- **Dark Green** (0.8-1.0): Healthy vegetation
- **Green** (0.6-0.8): Good vegetation
- **Yellow** (0.4-0.6): Stressed vegetation
- **Red** (0.0-0.4): Severely stressed

## Stress Level Indicators

Orchard markers show stress levels:
- **Green**: Low stress (healthy)
- **Yellow**: Medium stress (monitor)
- **Red**: High stress (action needed)

## Camera Controls

- **Click Marker**: Fly to orchard (5km altitude)
- **Click Section**: Fly to section (1km altitude)
- **Home Button**: Return to global view
- **Mouse**: Rotate, pan, zoom globe
- **Scroll**: Zoom in/out

## Integration with 3D Twin

When a section is selected:
1. Click "Enter 3D Digital Twin" button
2. View transitions from globe to 3D scene
3. Trees are rendered for selected section
4. Can return to globe view via toggle

## Performance Notes

- Cesium loads satellite imagery on-demand
- Initial load may take a few seconds
- Imagery quality depends on zoom level
- GPU acceleration recommended for smooth rendering

## Troubleshooting

### Token Issues
- Verify token has correct scopes
- Check token is not expired
- Ensure no extra spaces in .env.local

### Display Issues
- Clear browser cache
- Check browser console for errors
- Verify Cesium CSS is loaded

### Performance Issues
- Reduce number of visible sections
- Lower terrain quality in Cesium settings
- Use hardware acceleration in browser

## Future Enhancements

- Real satellite imagery integration
- Historical NDVI data visualization
- Weather overlay layers
- Drone flight path planning
- Multi-temporal analysis
- Real-time sensor data overlay

## References

- Cesium Ion: https://cesium.com/platform/cesium-ion/
- Resium: https://resium.reearth.io/
- Cesium Documentation: https://cesium.com/docs/