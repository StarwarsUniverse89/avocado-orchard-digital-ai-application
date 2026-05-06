# Satellite Data Architecture

## Overview
The satellite data system provides geospatial visualization and NDVI (Normalized Difference Vegetation Index) analysis for avocado orchards. This document outlines the data flow, caching strategy, and future integration plans.

## Current Implementation (May 2026)

### Data Flow
```
Satellite Source (Synthetic) 
    ↓
Backend Satellite Service
    ↓
NDVI/Stress Processing
    ↓
Cached Output (In-Memory)
    ↓
REST API Endpoints
    ↓
Frontend Map Overlay
```

### Components

#### 1. Backend Service (`backend/services/satellite_service.py`)
- **Purpose**: Generate and serve satellite/NDVI data
- **Current State**: Synthetic data generation for demo
- **Functions**:
  - `get_satellite_data(orchard_id)`: Main satellite data with NDVI metrics
  - `get_ndvi_timeseries(orchard_id, days)`: Historical NDVI trends
  - `get_stress_heatmap(orchard_id)`: Grid-based stress visualization
  - `calculate_ndvi(nir, red)`: NDVI calculation formula

#### 2. API Endpoints (`backend/api/routes.py`)
- `GET /api/v1/satellite/{orchard_id}`: Full satellite data package
- `GET /api/v1/satellite/{orchard_id}/ndvi?days=30`: Time series data
- `GET /api/v1/satellite/{orchard_id}/heatmap`: Stress heatmap grid

#### 3. Frontend Component (`frontend/components/SatelliteOrchardView.tsx`)
- **Features**:
  - Aerial imagery base layer
  - NDVI overlay visualization
  - Stress zone highlighting
  - Section selection/geofencing
  - Interactive controls (NDVI/Stress toggles)
  - Real-time metrics display

#### 4. Data Models (`frontend/lib/mockData.ts`)
```typescript
interface OrchardSection {
  id: string;
  name: string;
  bounds: { x, y, width, height };
  health_status: "healthy" | "warning" | "risk";
  tree_count: number;
  ndvi: number;              // 0-1 scale
  stress_level: number;      // 0-100 scale
  soil_moisture: number;
  temperature: number;
}

interface SatelliteData {
  orchard_id: string;
  timestamp: string;
  ndvi_average: number;
  stress_zones: StressZone[];
  satellite_layer: {
    type: string;
    asset: string;
  };
}
```

## NDVI Visualization

### Color Mapping
- **0.80-1.00**: Bright Green (Healthy, vigorous vegetation)
- **0.65-0.79**: Light Green (Good health)
- **0.55-0.64**: Yellow (Moderate stress)
- **0.45-0.54**: Orange (High stress)
- **0.00-0.44**: Red (Critical stress/bare soil)

### Stress Level Mapping
- **0-20%**: Low stress (Green)
- **20-40%**: Moderate stress (Yellow)
- **40-60%**: High stress (Orange)
- **60-100%**: Critical stress (Red)

## Caching Strategy

### Current (Demo Phase)
- **Type**: In-memory, per-request generation
- **TTL**: N/A (synthetic data)
- **Storage**: None

### Production Plan

#### Level 1: API Response Cache
```python
# Redis cache for processed satellite data
cache_key = f"satellite:{orchard_id}:{date}"
ttl = 3600  # 1 hour for recent data
ttl_historical = 86400 * 7  # 7 days for historical
```

#### Level 2: Processed Imagery Cache
```python
# S3/Cloud Storage for processed tiles
path = f"s3://orchard-satellite/{orchard_id}/{date}/ndvi_tiles/"
# Store pre-processed NDVI tiles for fast serving
```

#### Level 3: Raw Satellite Cache
```python
# Archive raw satellite imagery
path = f"s3://orchard-satellite-raw/{orchard_id}/{date}/"
# Keep raw bands for reprocessing if needed
```

### Cache Invalidation
- **Trigger**: New satellite pass detected
- **Strategy**: Lazy invalidation with background refresh
- **Priority**: Recent data (last 30 days) > Historical data

## Future: Real Satellite Integration

### Data Sources

#### 1. Sentinel-2 (ESA Copernicus)
- **Resolution**: 10m (visible/NIR), 20m (red edge)
- **Revisit**: 5 days
- **Bands**: 13 spectral bands
- **Access**: Free via Copernicus Open Access Hub
- **API**: `sentinelsat` Python library

```python
from sentinelsat import SentinelAPI

api = SentinelAPI(user, password, 'https://scihub.copernicus.eu/dhus')
products = api.query(
    area=orchard_polygon,
    date=('20260401', '20260501'),
    platformname='Sentinel-2',
    cloudcoverpercentage=(0, 20)
)
```

#### 2. Landsat 8/9 (NASA/USGS)
- **Resolution**: 30m (visible/NIR)
- **Revisit**: 16 days
- **Access**: Free via USGS Earth Explorer
- **API**: `landsatxplore` Python library

#### 3. Google Earth Engine
- **Advantage**: Cloud processing, multiple satellite sources
- **API**: Python SDK available
- **Cost**: Free for research/non-commercial

```python
import ee

ee.Initialize()
collection = ee.ImageCollection('COPERNICUS/S2_SR') \
    .filterBounds(orchard_geometry) \
    .filterDate('2026-04-01', '2026-05-01') \
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
```

### Processing Pipeline

```
1. Satellite Data Acquisition
   ↓
2. Cloud Masking & Atmospheric Correction
   ↓
3. NDVI Calculation: (NIR - Red) / (NIR + Red)
   ↓
4. Spatial Aggregation (per orchard section)
   ↓
5. Time Series Analysis
   ↓
6. Anomaly Detection (stress zones)
   ↓
7. Cache & Serve to Frontend
```

### NDVI Calculation
```python
def calculate_ndvi(nir_band, red_band):
    """
    NDVI = (NIR - Red) / (NIR + Red)
    
    Sentinel-2 bands:
    - NIR: Band 8 (842nm)
    - Red: Band 4 (665nm)
    """
    ndvi = (nir_band - red_band) / (nir_band + red_band + 1e-10)
    return np.clip(ndvi, -1, 1)
```

## MapLibre GL Integration (Future)

### Why MapLibre GL?
- Open-source alternative to Mapbox GL
- WebGL-based rendering (60fps)
- Vector tiles support
- Custom layer support for overlays
- No API key required for self-hosted tiles

### Implementation Plan

#### 1. Install Dependencies
```bash
npm install maplibre-gl @types/maplibre-gl
```

#### 2. Component Structure
```typescript
// frontend/components/SatelliteOrchardView.tsx
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const map = new maplibregl.Map({
  container: mapRef.current,
  style: 'https://demotiles.maplibre.org/style.json',
  center: [orchard_lng, orchard_lat],
  zoom: 16
});

// Add NDVI raster layer
map.addLayer({
  id: 'ndvi-layer',
  type: 'raster',
  source: {
    type: 'raster',
    tiles: [`/api/tiles/ndvi/{z}/{x}/{y}.png`],
    tileSize: 256
  },
  paint: {
    'raster-opacity': 0.7
  }
});

// Add orchard section polygons
map.addLayer({
  id: 'sections',
  type: 'fill',
  source: {
    type: 'geojson',
    data: orchardSectionsGeoJSON
  },
  paint: {
    'fill-color': ['get', 'color'],
    'fill-opacity': 0.4
  }
});
```

#### 3. Tile Server
```python
# backend/services/tile_service.py
from mercantile import tile

@router.get("/tiles/ndvi/{z}/{x}/{y}.png")
async def get_ndvi_tile(z: int, x: int, y: int):
    """Serve NDVI tiles in Web Mercator projection"""
    bounds = tile_bounds(x, y, z)
    ndvi_data = get_ndvi_for_bounds(bounds)
    tile_image = render_ndvi_tile(ndvi_data)
    return Response(content=tile_image, media_type="image/png")
```

### Fallback Strategy
- **Phase 1 (Current)**: Static aerial image with SVG overlays
- **Phase 2**: MapLibre GL with static tiles
- **Phase 3**: MapLibre GL with dynamic satellite tiles
- **Phase 4**: Real-time satellite integration

## Performance Considerations

### Frontend
- Lazy load satellite imagery
- Use WebGL for rendering (MapLibre)
- Implement viewport-based tile loading
- Cache tiles in browser IndexedDB

### Backend
- Pre-generate tiles for common zoom levels
- Use CDN for tile serving
- Implement tile pyramid (multiple resolutions)
- Background processing for new satellite data

### Database
- Store processed NDVI values per section
- Index by orchard_id and timestamp
- Partition by date for efficient queries

## Monitoring & Alerts

### Satellite Data Freshness
- Alert if no new data in 14 days
- Track cloud cover percentage
- Monitor processing pipeline health

### NDVI Anomalies
- Detect sudden NDVI drops (>0.15 in 7 days)
- Flag sections with NDVI < 0.55
- Generate automatic recommendations

## Security

### API Access
- Rate limiting on tile endpoints
- Authentication for satellite data access
- Restrict orchard data to authorized users

### Data Privacy
- Anonymize orchard locations in public demos
- Encrypt satellite imagery in storage
- Audit log for data access

## Cost Optimization

### Satellite Data
- Use free sources (Sentinel-2, Landsat) first
- Cache aggressively to minimize API calls
- Process only changed areas (delta processing)

### Storage
- Compress tiles (WebP, AVIF)
- Use object storage lifecycle policies
- Archive old data to cold storage

### Compute
- Batch process multiple orchards
- Use spot instances for processing
- Implement processing queue with priorities

## Testing Strategy

### Unit Tests
- NDVI calculation accuracy
- Color mapping functions
- Cache hit/miss scenarios

### Integration Tests
- End-to-end satellite data flow
- API endpoint responses
- Frontend rendering

### Performance Tests
- Tile serving latency (<100ms)
- Concurrent user load
- Cache effectiveness

## Roadmap

### Q2 2026 (Current)
- ✅ Synthetic satellite data
- ✅ NDVI visualization
- ✅ Stress zone overlays
- ✅ Section selection

### Q3 2026
- [ ] MapLibre GL integration
- [ ] Sentinel-2 API connection
- [ ] Redis caching layer
- [ ] Tile server implementation

### Q4 2026
- [ ] Real-time satellite processing
- [ ] Historical NDVI trends
- [ ] Anomaly detection
- [ ] Mobile optimization

### Q1 2027
- [ ] Multi-spectral analysis
- [ ] Predictive modeling
- [ ] Integration with IoT sensors
- [ ] Advanced analytics dashboard

---

**Last Updated**: May 6, 2026  
**Status**: Active Development  
**Owner**: Engineering Team