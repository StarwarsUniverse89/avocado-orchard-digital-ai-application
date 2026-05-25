"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DeckGL from "@deck.gl/react";
import { PathLayer, PolygonLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import maplibregl, { type Map, type StyleSpecification } from "maplibre-gl";
import { archiveManualBoundary } from "@/lib/api";

type StressLevel = "low" | "medium" | "high";

type OrchardBlock = {
  block_id: string;
  name: string;
  municipality_id: string;
  polygon: number[][];
  center: [number, number];
  stress_level: StressLevel;
  estimated_hectares: number;
  tree_count_estimate: number;
  confidence_score: number;
  boundary_source: string;
};

type TreeSample = {
  id: string;
  position: [number, number];
  status: "healthy" | "warning" | "high";
  block_id: string;
};

type PriorityZone = {
  id: string;
  polygon: number[][];
  priority: "medium" | "high";
};

type Props = {
  selectedBlockId?: string | null;
  onBlockSelected?: (block: OrchardBlock) => void;
  className?: string;
};

const initialViewState = {
  longitude: -102.36,
  latitude: 19.42,
  zoom: 12,
  pitch: 45,
  bearing: -25,
};

const satelliteStyle: StyleSpecification = {
  version: 8,
  sources: {
    "esri-world-imagery": {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Tiles © Esri",
    },
  },
  layers: [
    {
      id: "esri-world-imagery-layer",
      type: "raster",
      source: "esri-world-imagery",
    },
  ],
};

const orchardBlocks: OrchardBlock[] = [
  {
    block_id: "tancitaro-7a",
    name: "Los Reyes Block 7A",
    municipality_id: "tancitaro",
    polygon: [
      [-102.3908, 19.3528],
      [-102.3834, 19.3562],
      [-102.3745, 19.3534],
      [-102.3761, 19.3459],
      [-102.3869, 19.3447],
      [-102.3908, 19.3528],
    ],
    center: [-102.3823, 19.3508],
    stress_level: "high",
    estimated_hectares: 2.14,
    tree_count_estimate: 612,
    confidence_score: 0.91,
    boundary_source: "esri_satellite_ai",
  },
  {
    block_id: "tancitaro-8c",
    name: "Tancitaro Block 8C",
    municipality_id: "tancitaro",
    polygon: [
      [-102.3534, 19.3336],
      [-102.3462, 19.3374],
      [-102.3375, 19.3332],
      [-102.3398, 19.3258],
      [-102.3509, 19.3265],
      [-102.3534, 19.3336],
    ],
    center: [-102.3459, 19.3316],
    stress_level: "medium",
    estimated_hectares: 1.78,
    tree_count_estimate: 486,
    confidence_score: 0.88,
    boundary_source: "esri_satellite_ai",
  },
  {
    block_id: "tancitaro-4b",
    name: "Periban Edge 4B",
    municipality_id: "tancitaro",
    polygon: [
      [-102.3275, 19.374],
      [-102.3185, 19.3768],
      [-102.3112, 19.3719],
      [-102.3154, 19.3643],
      [-102.3249, 19.3661],
      [-102.3275, 19.374],
    ],
    center: [-102.3197, 19.3709],
    stress_level: "low",
    estimated_hectares: 2.62,
    tree_count_estimate: 734,
    confidence_score: 0.93,
    boundary_source: "esri_satellite_ai",
  },
];

const manualBoundaries = [
  {
    id: "manual-archive-01",
    polygon: [
      [-102.4102, 19.4076],
      [-102.4028, 19.4114],
      [-102.3955, 19.4072],
      [-102.3971, 19.3991],
      [-102.4068, 19.3985],
      [-102.4102, 19.4076],
    ],
  },
];

const droneRoute = [
  [-102.414, 19.43],
  [-102.397, 19.414],
  [-102.382, 19.391],
  [-102.352, 19.363],
  [-102.327, 19.374],
  [-102.309, 19.392],
];

const priorityZones: PriorityZone[] = [
  {
    id: "priority-high-7a",
    priority: "high",
    polygon: [
      [-102.3864, 19.3524],
      [-102.3809, 19.3537],
      [-102.3786, 19.3502],
      [-102.3822, 19.3478],
      [-102.3864, 19.3524],
    ],
  },
  {
    id: "priority-medium-8c",
    priority: "medium",
    polygon: [
      [-102.3496, 19.3348],
      [-102.3435, 19.3349],
      [-102.3418, 19.3301],
      [-102.3471, 19.3281],
      [-102.3496, 19.3348],
    ],
  },
];

function closeRing(points: number[][]) {
  if (points.length === 0) return points;
  const first = points[0];
  const last = points[points.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return points;
  return [...points, first];
}

function stressFill(stress: StressLevel): [number, number, number, number] {
  if (stress === "high") return [239, 68, 68, 88];
  if (stress === "medium") return [250, 204, 21, 76];
  return [16, 185, 129, 70];
}

function stressLine(stress: StressLevel): [number, number, number, number] {
  if (stress === "high") return [248, 113, 113, 230];
  if (stress === "medium") return [253, 224, 71, 225];
  return [110, 231, 183, 220];
}

function createTreeSamples(): TreeSample[] {
  return orchardBlocks.flatMap((block, blockIndex) =>
    Array.from({ length: 24 }).map((_, index) => {
      const angle = index * 2.399 + blockIndex * 0.4;
      const radius = 0.0011 + (index % 6) * 0.00034;
      const lng = block.center[0] + Math.cos(angle) * radius;
      const lat = block.center[1] + Math.sin(angle) * radius * 0.8;
      return {
        id: `${block.block_id}-tree-${index}`,
        position: [lng, lat],
        status: index % 11 === 0 ? "high" : index % 7 === 0 ? "warning" : "healthy",
        block_id: block.block_id,
      };
    })
  );
}

function dashedSegments(path: number[][]) {
  const segments: Array<{ id: string; path: number[][] }> = [];
  for (let index = 0; index < path.length - 1; index += 1) {
    if (index % 2 === 0) {
      segments.push({ id: `route-segment-${index}`, path: [path[index], path[index + 1]] });
    }
  }
  return segments;
}

export default function GoogleCommandMapView({ selectedBlockId, onBlockSelected, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [viewState, setViewState] = useState(initialViewState);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualDraft, setManualDraft] = useState<number[][]>([]);
  const [manualStatus, setManualStatus] = useState("Click Draw Boundary to add points.");
  const [localSelectedBlockId, setLocalSelectedBlockId] = useState(selectedBlockId || orchardBlocks[0].block_id);

  useEffect(() => {
    if (selectedBlockId) setLocalSelectedBlockId(selectedBlockId);
  }, [selectedBlockId]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: satelliteStyle,
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
      pitch: initialViewState.pitch,
      bearing: initialViewState.bearing,
      attributionControl: false,
      interactive: false,
    });

    mapRef.current = map;
    map.on("load", () => {
      console.log("GoogleCommandMapView map load", {
        center: map.getCenter().toArray(),
        zoom: map.getZoom(),
        source: "esri-world-imagery",
      });
      setMapLoaded(true);
    });
    map.on("styledata", () => {
      console.log("GoogleCommandMapView styledata", {
        hasEsriSource: Boolean(map.getSource("esri-world-imagery")),
      });
    });
    map.on("sourcedata", (event) => {
      const sourceEvent = event as maplibregl.MapSourceDataEvent;
      if (sourceEvent.sourceId === "esri-world-imagery") {
        console.log("GoogleCommandMapView sourcedata", {
          sourceId: sourceEvent.sourceId,
          sourceDataType: sourceEvent.sourceDataType,
          isSourceLoaded: sourceEvent.isSourceLoaded,
        });
      }
    });
    map.on("error", (event) => {
      const sourceEvent = event as maplibregl.ErrorEvent & { sourceId?: string; tile?: unknown };
      const message = sourceEvent.error?.message || "MapLibre satellite render error";
      console.error("GoogleCommandMapView error", {
        message,
        sourceId: sourceEvent.sourceId,
        tile: sourceEvent.tile,
        error: sourceEvent.error,
      });
      setMapError(`${message}${sourceEvent.sourceId ? ` (source: ${sourceEvent.sourceId})` : ""}`);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    mapRef.current?.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing,
    });
  }, [viewState]);

  const treeSamples = useMemo(() => createTreeSamples(), []);
  const routeSegments = useMemo(() => dashedSegments(droneRoute), []);

  const selectedBlock = orchardBlocks.find((block) => block.block_id === localSelectedBlockId) || orchardBlocks[0];
  const labelData = useMemo(
    () =>
      orchardBlocks.map((block) => ({
        ...block,
        label: `${block.block_id}\n${block.stress_level.toUpperCase()} · ${block.estimated_hectares} ha`,
      })),
    []
  );

  const deckLayers = useMemo(
    () => [
      new PolygonLayer<PriorityZone>({
        id: "priority-zones",
        data: priorityZones,
        getPolygon: (zone) => closeRing(zone.polygon),
        getFillColor: (zone) => (zone.priority === "high" ? [239, 68, 68, 76] : [251, 146, 60, 70]),
        getLineColor: (zone) => (zone.priority === "high" ? [248, 113, 113, 220] : [251, 191, 36, 210]),
        getLineWidth: 2,
        lineWidthUnits: "pixels",
        stroked: true,
        filled: true,
        pickable: false,
      }),
      new PolygonLayer<OrchardBlock>({
        id: "orchard-block-polygons",
        data: orchardBlocks,
        getPolygon: (block) => closeRing(block.polygon),
        getFillColor: (block) => stressFill(block.stress_level),
        getLineColor: (block) => (block.block_id === localSelectedBlockId ? [103, 232, 249, 255] : stressLine(block.stress_level)),
        getLineWidth: (block) => (block.block_id === localSelectedBlockId ? 4 : 1.6),
        lineWidthUnits: "pixels",
        stroked: true,
        filled: true,
        pickable: true,
        autoHighlight: true,
        highlightColor: [103, 232, 249, 70],
        onClick: ({ object }) => {
          if (!object || manualMode) return false;
          setLocalSelectedBlockId(object.block_id);
          onBlockSelected?.(object);
          setViewState((current) => ({ ...current, longitude: object.center[0], latitude: object.center[1], zoom: Math.max(current.zoom, 13.5) }));
          return true;
        },
      }),
      new PolygonLayer<{ id: string; polygon: number[][] }>({
        id: "manual-boundaries",
        data: manualBoundaries,
        getPolygon: (boundary) => closeRing(boundary.polygon),
        getFillColor: [6, 182, 212, 28],
        getLineColor: [103, 232, 249, 225],
        getLineWidth: 2,
        lineWidthUnits: "pixels",
        stroked: true,
        filled: true,
        pickable: false,
      }),
      new ScatterplotLayer<TreeSample>({
        id: "tree-samples",
        data: treeSamples,
        visible: viewState.zoom >= 11,
        getPosition: (sample) => sample.position,
        getRadius: (sample) => (sample.status === "high" ? 20 : sample.status === "warning" ? 16 : 12),
        radiusUnits: "meters",
        getFillColor: (sample) => (sample.status === "high" ? [248, 113, 113, 210] : sample.status === "warning" ? [250, 204, 21, 205] : [134, 239, 172, 190]),
        getLineColor: [4, 16, 12, 220],
        lineWidthUnits: "pixels",
        getLineWidth: 1,
        stroked: true,
        pickable: false,
      }),
      new PathLayer<{ id: string; path: number[][] }>({
        id: "drone-route-shadow",
        data: [{ id: "drone-route-shadow", path: droneRoute }],
        getPath: (route) => route.path as any,
        getColor: [0, 0, 0, 160],
        getWidth: 5,
        widthUnits: "pixels",
        pickable: false,
      }),
      new PathLayer<{ id: string; path: number[][] }>({
        id: "drone-route-dashes",
        data: routeSegments,
        getPath: (route) => route.path as any,
        getColor: [240, 249, 255, 238],
        getWidth: 3,
        widthUnits: "pixels",
        pickable: false,
      }),
      new PolygonLayer<{ id: string; polygon: number[][] }>({
        id: "manual-draft-polygon",
        data: manualDraft.length >= 3 ? [{ id: "manual-draft", polygon: manualDraft }] : [],
        getPolygon: (draft) => closeRing(draft.polygon),
        getFillColor: [6, 182, 212, 34],
        getLineColor: [103, 232, 249, 255],
        getLineWidth: 2.4,
        lineWidthUnits: "pixels",
        stroked: true,
        filled: true,
        pickable: false,
      }),
      new PathLayer<{ id: string; path: number[][] }>({
        id: "manual-draft-line",
        data: manualDraft.length >= 2 ? [{ id: "manual-draft-line", path: manualDraft }] : [],
        getPath: (draft) => draft.path as any,
        getColor: [103, 232, 249, 245],
        getWidth: 3,
        widthUnits: "pixels",
        pickable: false,
      }),
      new ScatterplotLayer<{ position: [number, number] }>({
        id: "manual-draft-points",
        data: manualDraft.map((position) => ({ position: position as [number, number] })),
        getPosition: (point) => point.position,
        getRadius: 26,
        radiusUnits: "meters",
        getFillColor: [103, 232, 249, 235],
        getLineColor: [2, 6, 23, 220],
        getLineWidth: 1,
        lineWidthUnits: "pixels",
        stroked: true,
        pickable: false,
      }),
      new TextLayer<(typeof labelData)[number]>({
        id: "block-labels",
        data: labelData,
        getPosition: (block) => block.center,
        getText: (block) => block.label,
        getSize: 12,
        sizeUnits: "pixels",
        getColor: [240, 249, 255, 235],
        getAngle: 0,
        getTextAnchor: "middle",
        getAlignmentBaseline: "center",
        background: true,
        getBackgroundColor: [2, 6, 23, 170],
        backgroundPadding: [5, 3],
        pickable: false,
      }),
    ],
    [labelData, localSelectedBlockId, manualDraft, manualMode, onBlockSelected, routeSegments, treeSamples, viewState.zoom]
  );

  const archiveDraft = async () => {
    if (manualDraft.length < 3) {
      setManualStatus("Add at least three points before archiving.");
      return;
    }

    setManualStatus("Archiving boundary...");
    const res = await archiveManualBoundary({
      municipality_id: "tancitaro",
      label_type: "orchard_block",
      polygon: closeRing(manualDraft),
      manual_metadata: {
        crop_type: "avocado",
        estimated_hectares: 2.1,
        tree_count_estimate: 580,
        notes: "Esri satellite command center manual boundary",
        created_by: "operator",
      },
      ml_training_label: true,
    });

    if (!res.success) {
      setManualStatus(res.error || "Manual boundary archive failed.");
      return;
    }

    setManualDraft([]);
    setManualMode(false);
    setManualStatus("Manual boundary archived for ML label memory.");
  };

  return (
    <div className={`relative h-full min-h-[600px] overflow-hidden rounded-lg bg-black ${className || ""}`}>
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%", minHeight: "600px" }}
      />
      <DeckGL
        layers={deckLayers}
        viewState={viewState}
        controller
        deviceProps={{
          type: "webgl",
          webgl: { alpha: true, antialias: true },
        }}
        onViewStateChange={({ viewState: nextViewState }) => {
          const next = nextViewState as typeof initialViewState;
          setViewState({
            longitude: next.longitude,
            latitude: next.latitude,
            zoom: next.zoom,
            pitch: next.pitch,
            bearing: next.bearing,
          });
        }}
        onClick={(info) => {
          if (!manualMode || !info.coordinate) return;
          const nextPoint: [number, number] = [info.coordinate[0], info.coordinate[1]];
          setManualDraft((prev) => {
            const next = [...prev, nextPoint];
            setManualStatus(next.length >= 3 ? "Boundary preview active. Archive when ready." : "Add at least three points.");
            return next;
          });
        }}
        style={{ position: "absolute", inset: "0", background: "transparent" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_45%,rgba(0,0,0,0.42)_100%)]" />

      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/72 backdrop-blur-sm">
          <div className="rounded-lg border border-cyan-300/25 bg-black/70 px-5 py-4 text-center shadow-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Loading satellite command map</div>
            <div className="mt-2 text-[11px] text-gray-500">Esri World Imagery and deck.gl overlays are initializing.</div>
          </div>
        </div>
      )}

      <div className="absolute left-4 top-4 z-10 rounded-lg border border-white/10 bg-black/70 px-4 py-3 shadow-2xl backdrop-blur-md">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Satellite Command Center</div>
        <div className="mt-1 text-sm font-semibold text-white">Michoacan / Tancitaro avocado belt</div>
        <div className="mt-2 grid grid-cols-3 gap-3 text-[10px] text-gray-400">
          <span><b className="text-gray-100">3</b> blocks</span>
          <span><b className="text-amber-200">2</b> zones</span>
          <span><b className="text-cyan-200">72</b> samples</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded border border-emerald-300/20 bg-emerald-300/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-200">Provider: Esri World Imagery</span>
          <span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-200">Renderer: MapLibre + deck.gl</span>
          <span className="rounded border border-amber-300/20 bg-amber-300/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-200">Production Safe Map</span>
        </div>
      </div>

      <div className="pointer-events-none absolute right-4 top-4 z-10 w-64 rounded-lg border border-white/10 bg-black/70 p-4 shadow-2xl backdrop-blur-md">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
          Selected Block - <span className={selectedBlock.stress_level === "high" ? "text-red-300" : selectedBlock.stress_level === "medium" ? "text-amber-300" : "text-emerald-300"}>{selectedBlock.stress_level}</span>
        </div>
        <div className="mt-2 text-sm font-semibold text-white">{selectedBlock.name}</div>
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between border-b border-white/5 pb-1.5"><span className="text-gray-500">Area</span><b className="text-gray-100">{selectedBlock.estimated_hectares} ha</b></div>
          <div className="flex justify-between border-b border-white/5 pb-1.5"><span className="text-gray-500">Tree Count</span><b className="text-gray-100">{selectedBlock.tree_count_estimate}</b></div>
          <div className="flex justify-between border-b border-white/5 pb-1.5"><span className="text-gray-500">Confidence</span><b className="text-cyan-200">{Math.round(selectedBlock.confidence_score * 100)}%</b></div>
          <div className="flex justify-between"><span className="text-gray-500">Boundary Source</span><b className="text-gray-100">satellite</b></div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-white/10 bg-black/70 p-3 backdrop-blur-md">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">Manual Boundary</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setManualMode((value) => !value);
              setManualStatus(manualMode ? "Manual drawing paused." : "Click the map to add boundary points.");
            }}
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${manualMode ? "border-cyan-300 bg-cyan-300 text-gray-950" : "border-white/10 bg-white/[0.06] text-gray-300 hover:border-cyan-300/35 hover:text-cyan-200"}`}
          >
            Draw Boundary
          </button>
          <button
            type="button"
            onClick={archiveDraft}
            className="rounded-md border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-300/15"
          >
            Archive
          </button>
          <button
            type="button"
            onClick={() => {
              setManualDraft([]);
              setManualStatus("Boundary draft cleared.");
            }}
            className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-200"
          >
            Clear
          </button>
        </div>
        <div className="mt-2 max-w-xs text-[10px] text-gray-500">{manualStatus}</div>
      </div>

      <div className="absolute right-4 bottom-4 z-10 rounded-md border border-white/10 bg-black/65 p-2.5 text-[10px] text-gray-400 backdrop-blur-md">
        <div className="mb-1.5 font-semibold uppercase tracking-[0.14em] text-gray-300">Layers</div>
        <div className="space-y-1">
          <div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-white" />orchard polygons + labels</div>
          <div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-300" />manual boundaries / drone route</div>
          <div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-300" />tree samples</div>
          <div><span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-400" />priority zones</div>
        </div>
      </div>

      {mapError && (
        <div className="absolute right-4 top-4 z-20 max-w-sm rounded-md border border-red-300/25 bg-red-500/15 px-3 py-2 text-xs text-red-100 backdrop-blur">
          {mapError}
        </div>
      )}
    </div>
  );
}
