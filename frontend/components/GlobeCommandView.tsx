'use client';

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  Viewer,
  Entity,
  PolygonGraphics,
  PointGraphics,
  LabelGraphics,
  PolylineGraphics,
  CameraFlyTo,
} from 'resium';
import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  Color,
  Ion,
  Viewer as CesiumViewer,
  Math as CesiumMath,
  HeightReference,
  VerticalOrigin,
  HorizontalOrigin,
  ScreenSpaceEventHandler as CesiumScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from 'cesium';
import {
  michoacanAvocadoBelt,
  mexicoAvocadoMunicipalities,
  michoacanAvocadoClusters,
  michoacanSyntheticOrchards,
  generateMichoacanOrchardNetwork,
  getHighestStressOrchard,
  getTopProductionMunicipality,
  getMexicoAvocadoAnalytics,
  AvocadoMunicipality,
  AvocadoCluster,
  SyntheticOrchardCandidate,
} from '@/lib/mexicoAvocadoNetwork';
import { UICommand, UICommandHandler } from '@/types/uiCommands';
import SatelliteOrchardView from './SatelliteOrchardView';
import OrchardCandidatePanel from './OrchardCandidatePanel';
import {
  archiveManualBoundary,
  getManualBoundaries,
  saveSegmentationCorrection,
  scanMunicipalityForOrchards,
} from '@/lib/api';

interface DetectedOrchard {
  archive_id: string;
  orchard_id: string;
  municipality_id: string;
  center_lat: number;
  center_lng: number;
  boundary_coordinates: number[][];
  estimated_hectares: number;
  estimated_acres: number;
  estimated_tree_count: number;
  ndvi_average: number;
  stress_level: string;
  confidence: number;
  detection_method: string;
  imagery_source: string;
}

interface GlobeCommandViewProps {
  onOrchardSelect?: (orchardId: string) => void;
  onSectionSelect?: (orchardId: string, sectionId: string) => void;
  onEnter3DTwin?: (orchardId: string, sectionId?: string) => void;
  selectedOrchardId?: string;
  selectedSectionId?: string;
  commandHandler?: UICommandHandler;
  onOrchardCandidateSelected?: (candidate: DetectedOrchard) => void;
  onMunicipalitySelected?: (municipality: any) => void;
  onDetectedOrchardsChanged?: (orchards: DetectedOrchard[]) => void;
  onVisionAnalysisCompleted?: (result: any) => void;
  plannedMission?: any;
  segmentedOrchardBlocks?: any[];
  selectedSegmentedBlockId?: string;
  onSegmentedBlockSelected?: (block: any) => void;
  className?: string;
}

export interface GlobeCommandViewRef {
  handleCommand: (command: UICommand) => void;
}

export const GlobeCommandView = forwardRef<GlobeCommandViewRef, GlobeCommandViewProps>(({
  onOrchardSelect,
  onSectionSelect,
  onEnter3DTwin,
  selectedOrchardId,
  selectedSectionId,
  commandHandler,
  onOrchardCandidateSelected,
  onMunicipalitySelected,
  onDetectedOrchardsChanged,
  onVisionAnalysisCompleted,
  plannedMission,
  segmentedOrchardBlocks,
  selectedSegmentedBlockId,
  onSegmentedBlockSelected,
  className,
}, ref) => {
  const viewerRef = useRef<CesiumViewer | null>(null);
  const [cesiumReady, setCesiumReady] = useState<boolean>(false);
  const [cesiumError, setCesiumError] = useState<boolean>(false);
  const [showAvocadoBelt, setShowAvocadoBelt] = useState(true);
  const [showProductionClusters, setShowProductionClusters] = useState(true);
  const [showMexicoOrchards, setShowMexicoOrchards] = useState(true);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | null>(null);
  const [selectedOrchardMexico, setSelectedOrchardMexico] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<{
    destination: Cartesian3;
    duration: number;
  } | null>(null);
  
  // Orchard detection state
  const [detectedOrchards, setDetectedOrchards] = useState<DetectedOrchard[]>([]);
  const [scanning, setScanning] = useState(false);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedOrchardCandidate, setSelectedOrchardCandidate] = useState<DetectedOrchard | null>(null);
  const [commandContext, setCommandContext] = useState<any>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [correctionDraft, setCorrectionDraft] = useState<any>({});
  const [correctionStatus, setCorrectionStatus] = useState<string | null>(null);
  const [showTreeCanopyPoints, setShowTreeCanopyPoints] = useState(true);
  const [manualBoundaryMode, setManualBoundaryMode] = useState(false);
  const [manualBoundaryPoints, setManualBoundaryPoints] = useState<Array<[number, number]>>([]);
  const [manualBoundaryFinished, setManualBoundaryFinished] = useState(false);
  const [manualBoundaries, setManualBoundaries] = useState<any[]>([]);
  const [manualForm, setManualForm] = useState({
    label_type: "orchard_block",
    crop_type: "avocado",
    estimated_hectares: "",
    tree_count_estimate: "",
    notes: "",
    ml_training_label: true,
  });
  const [manualArchiveStatus, setManualArchiveStatus] = useState<string | null>(null);
  const programmaticCameraMoveRef = useRef(false);
  const [userHasInteractedWithCamera, setUserHasInteractedWithCamera] = useState(false);
  const [hasPerformedInitialFlyTo, setHasPerformedInitialFlyTo] = useState(false);
  const [hasAutoFocusedSegmentation, setHasAutoFocusedSegmentation] = useState(false);
  
  // Get Mexico analytics
  const mexicoAnalytics = getMexicoAvocadoAnalytics();

  // Handle scan municipality for orchards
  const handleScanMunicipality = async () => {
    if (!selectedMunicipalityId) {
      console.error('No municipality selected');
      return;
    }
    
    console.log('🛰️ Starting orchard scan for municipality:', selectedMunicipalityId);
    setScanning(true);
    setScanError(null);
    
    try {
      console.log('🛰️ API Request:', {
        endpoint: 'POST /api/v1/orchard-detection/scan-municipality',
        body: {
          municipality_id: selectedMunicipalityId,
          save_to_archive: true  // Changed to true to save to archive
        }
      });
      
      const result = await scanMunicipalityForOrchards(selectedMunicipalityId, true);
      
      console.log('🛰️ Scan response:', result);
      
      if (result.success) {
        // Support all response shapes
        const resultAny = result as any;
        const parcels =
          resultAny.detected_orchards ||
          resultAny.parcels ||
          resultAny.data?.detected_orchards ||
          resultAny.data?.parcels ||
          [];
        
        console.log('🥑 Detected parcels:', parcels.length, parcels);
        setDetectedOrchards(parcels);
        // Notify parent component
        onDetectedOrchardsChanged?.(parcels);
        
        if (parcels.length > 0) {
          console.log(`✅ Scan successful! Detected ${parcels.length} orchard parcels`);
        } else {
          console.warn('⚠️ Scan completed but no parcels detected');
        }
      } else {
        const errorMsg = result.error || 'Failed to scan municipality';
        console.error('❌ Scan failed:', errorMsg);
        setScanError(errorMsg);
      }
    } catch (error) {
      console.error('❌ Scan error:', error);
      setScanError(String(error));
    } finally {
      setScanning(false);
    }
  };

  // Handle orchard parcel selection
  const handleOrchardParcelClick = (orchard: DetectedOrchard) => {
    console.log('🥑 Orchard parcel clicked:', {
      orchard_id: orchard.orchard_id,
      center: [orchard.center_lat, orchard.center_lng],
      hectares: orchard.estimated_hectares,
      stress_level: orchard.stress_level
    });
    
    setSelectedOrchardCandidate(orchard);
    onOrchardCandidateSelected?.(orchard);
    
    // Fly to the orchard
    if (viewerRef.current) {
      const destination = Cartesian3.fromDegrees(
        orchard.center_lng,
        orchard.center_lat,
        3000
      );
      setCameraTarget({ destination, duration: 1.5 });
    }
  };

  // Initialize Cesium token before rendering
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
    if (token && token.trim() !== '') {
      try {
        Ion.defaultAccessToken = token;
        console.log('Cesium Ion token set successfully');
        setCesiumReady(true);
      } catch (error) {
        console.error('Failed to set Cesium Ion token:', error);
        setCesiumError(true);
      }
    } else {
      console.warn('Cesium Ion token not found in environment variables, using fallback view');
      setCesiumError(true);
    }
  }, []);

  // Monitor Cesium viewer for errors
  useEffect(() => {
    if (viewerRef.current) {
      const viewer = viewerRef.current;
      const errorHandler = (error: any) => {
        console.error('Cesium error:', error);
        setCesiumError(true);
      };
      
      // Listen for scene render errors
      viewer.scene.renderError.addEventListener(errorHandler);
      
      return () => {
        viewer.scene.renderError.removeEventListener(errorHandler);
      };
    }
  }, [viewerRef.current]);

  useEffect(() => {
    if (!cameraTarget) return;
    programmaticCameraMoveRef.current = true;
    const timer = window.setTimeout(() => {
      programmaticCameraMoveRef.current = false;
    }, cameraTarget.duration * 1000 + 800);
    return () => window.clearTimeout(timer);
  }, [cameraTarget]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !cesiumReady) return;

    const markManualCameraControl = () => {
      if (!programmaticCameraMoveRef.current) {
        setUserHasInteractedWithCamera(true);
      }
    };

    viewer.camera.moveStart.addEventListener(markManualCameraControl);
    return () => {
      viewer.camera.moveStart.removeEventListener(markManualCameraControl);
    };
  }, [cesiumReady, viewerRef.current]);

  const orchardCameraOrientation = {
    heading: CesiumMath.toRadians(18),
    pitch: CesiumMath.toRadians(-47),
    roll: 0,
  };

  const flyToMichoacanRegion = useCallback((duration = 1.6) => {
    setCameraTarget({
      destination: Cartesian3.fromDegrees(-102.22, 19.39, 52000),
      duration,
    });
    setShowAvocadoBelt(true);
    setShowProductionClusters(true);
    setShowMexicoOrchards(true);
  }, []);

  const flyToTancitaroMunicipality = useCallback((duration = 1.4) => {
    const municipality = mexicoAvocadoMunicipalities.find((item) => item.id === "tancitaro");
    if (!municipality) return;
    setCameraTarget({
      destination: Cartesian3.fromDegrees(municipality.lng, municipality.lat, 13500),
      duration,
    });
    setSelectedMunicipalityId(municipality.id);
    onMunicipalitySelected?.(municipality);
    setShowAvocadoBelt(true);
    setShowProductionClusters(true);
    setShowMexicoOrchards(true);
  }, [onMunicipalitySelected]);

  const flyToOrchardCluster = useCallback((duration = 1.2) => {
    const cluster =
      michoacanAvocadoClusters.find((item) => item.id === "cluster_tancitaro_periban") ||
      michoacanAvocadoClusters[0];
    setCameraTarget({
      destination: Cartesian3.fromDegrees(cluster.center_lng, cluster.center_lat, 6200),
      duration,
    });
    setShowAvocadoBelt(true);
    setShowProductionClusters(true);
    setShowMexicoOrchards(true);
  }, []);

  const focusSelectedOrFirstBlock = useCallback((duration = 1.1) => {
    const block =
      segmentedOrchardBlocks?.find((item) => item.block_id === selectedSegmentedBlockId) ||
      segmentedOrchardBlocks?.[0];

    if (block?.center_lng && block?.center_lat) {
      setCameraTarget({
        destination: Cartesian3.fromDegrees(block.center_lng, block.center_lat, 5600),
        duration,
      });
      setCommandContext({ type: "orchard_block", ...block });
      return;
    }

    flyToOrchardCluster(duration);
  }, [flyToOrchardCluster, segmentedOrchardBlocks, selectedSegmentedBlockId]);

  // Set initial camera position to the operating region instead of global Earth.
  useEffect(() => {
    if (!viewerRef.current || !cesiumReady || hasPerformedInitialFlyTo) return;

    setHasPerformedInitialFlyTo(true);
    flyToMichoacanRegion(1.2);
    window.setTimeout(() => flyToTancitaroMunicipality(1.3), 1250);
    window.setTimeout(() => flyToOrchardCluster(1.2), 2600);
  }, [cesiumReady, flyToMichoacanRegion, flyToOrchardCluster, flyToTancitaroMunicipality, hasPerformedInitialFlyTo]);

  useEffect(() => {
    if (!segmentedOrchardBlocks?.length || hasAutoFocusedSegmentation || userHasInteractedWithCamera) return;
    setHasAutoFocusedSegmentation(true);
    const timer = window.setTimeout(() => focusSelectedOrFirstBlock(1.2), 450);
    return () => window.clearTimeout(timer);
  }, [focusSelectedOrFirstBlock, hasAutoFocusedSegmentation, segmentedOrchardBlocks?.length, userHasInteractedWithCamera]);

  // Fly to drone mission when planned
  useEffect(() => {
    if (plannedMission) {
      console.log("🛸 GlobeCommandView received plannedMission", plannedMission);
      
      if (plannedMission.waypoints && plannedMission.waypoints.length > 0) {
        const first = plannedMission.waypoints[0];
        if (viewerRef.current) {
          programmaticCameraMoveRef.current = true;
          viewerRef.current.camera.flyTo({
            destination: Cartesian3.fromDegrees(first.lng, first.lat, 8000),
            orientation: orchardCameraOrientation,
            duration: 1.5,
            complete: () => {
              programmaticCameraMoveRef.current = false;
            },
            cancel: () => {
              programmaticCameraMoveRef.current = false;
            },
          });
        }
      }
    }
  }, [plannedMission]);

  useEffect(() => {
    if (!selectedSegmentedBlockId || !segmentedOrchardBlocks?.length) return;
    const block = segmentedOrchardBlocks.find((item) => item.block_id === selectedSegmentedBlockId);
    if (block) {
      setCommandContext({ type: "orchard_block", ...block });
      if (!userHasInteractedWithCamera && block.center_lng && block.center_lat) {
        setCameraTarget({
          destination: Cartesian3.fromDegrees(block.center_lng, block.center_lat, 6200),
          duration: 0.9,
        });
      }
    }
  }, [selectedSegmentedBlockId, segmentedOrchardBlocks, userHasInteractedWithCamera]);

  useEffect(() => {
    const municipalityId = selectedMunicipalityId || "tancitaro";
    getManualBoundaries(municipalityId).then((res) => {
      if (res.success && res.data) {
        setManualBoundaries(res.data);
      }
    });
  }, [selectedMunicipalityId]);

  // Handle UI commands
  const handleCommand = useCallback(
    (command: UICommand) => {
      console.log('🎮 GlobeCommandView handling command:', command);
      
      switch (command.type) {
        case 'show_avocado_belt':
          setShowAvocadoBelt(true);
          setShowProductionClusters(false);
          setShowMexicoOrchards(false);
          // Fly to belt center
          if (viewerRef.current) {
            const centerLat = (michoacanAvocadoBelt.lat_min + michoacanAvocadoBelt.lat_max) / 2;
            const centerLng = (michoacanAvocadoBelt.lng_min + michoacanAvocadoBelt.lng_max) / 2;
            const destination = Cartesian3.fromDegrees(centerLng, centerLat, 52000);
            setCameraTarget({ destination, duration: 2 });
          }
          break;
        case 'show_production_clusters':
          setShowProductionClusters(true);
          setShowAvocadoBelt(true);
          break;
        case 'create_orchard_network':
          setShowMexicoOrchards(true);
          setShowProductionClusters(true);
          setShowAvocadoBelt(true);
          break;
        case 'navigate_to_municipality': {
          const municipality = mexicoAvocadoMunicipalities.find(
            (m) => m.id === command.args?.municipality_id
          );
          if (municipality) {
            console.log('🗺️ Flying to municipality:', municipality.name);
            const destination = Cartesian3.fromDegrees(
              municipality.lng,
              municipality.lat,
              15000
            );
            setCameraTarget({ destination, duration: 2 });
            setSelectedMunicipalityId(municipality.id);
            onMunicipalitySelected?.(municipality);
            setShowAvocadoBelt(true);
          }
          break;
        }
        case 'scan_municipality_orchards': {
          const municipalityId = command.args?.municipality_id;
          if (municipalityId) {
            console.log('🛰️ Scanning municipality for orchards:', municipalityId);
            // First navigate to the municipality
            const municipality = mexicoAvocadoMunicipalities.find(
              (m) => m.id === municipalityId
            );
            if (municipality) {
              const destination = Cartesian3.fromDegrees(
                municipality.lng,
                municipality.lat,
                15000
              );
              setCameraTarget({ destination, duration: 2 });
              setSelectedMunicipalityId(municipality.id);
              onMunicipalitySelected?.(municipality);
              setShowAvocadoBelt(true);
              
              // Then trigger the scan after a short delay
              setTimeout(() => {
                handleScanMunicipality();
              }, 2500);
            }
          }
          break;
        }
        case 'select_largest_orchard_candidate': {
          if (detectedOrchards.length > 0) {
            const largest = [...detectedOrchards].sort((a, b) =>
              b.estimated_hectares - a.estimated_hectares
            )[0];
            console.log('🥑 Selecting largest orchard:', largest.orchard_id);
            handleOrchardParcelClick(largest);
          }
          break;
        }
        case 'select_highest_stress_parcel': {
          if (detectedOrchards.length > 0) {
            const stressMap = { low: 1, medium: 2, high: 3 };
            const highestStress = [...detectedOrchards].sort((a, b) =>
              (stressMap[b.stress_level as keyof typeof stressMap] || 0) -
              (stressMap[a.stress_level as keyof typeof stressMap] || 0)
            )[0];
            console.log('⚠️ Selecting highest stress parcel:', highestStress.orchard_id);
            handleOrchardParcelClick(highestStress);
          }
          break;
        }
        case 'select_orchard': {
          const orchard = michoacanSyntheticOrchards.find(
            (o) => o.orchard_id === command.args?.orchard_id
          );
          if (orchard) {
            const destination = Cartesian3.fromDegrees(
              orchard.lng,
              orchard.lat,
              5000
            );
            setCameraTarget({ destination, duration: 2 });
            setSelectedOrchardMexico(orchard.orchard_id);
            setShowMexicoOrchards(true);
          }
          break;
        }
        case 'compare_municipalities':
          // Show both municipalities
          setShowAvocadoBelt(true);
          setSelectedMunicipalityId(null);
          break;
        case 'show_network':
          // Reset to Mexico view
          if (viewerRef.current) {
            const destination = Cartesian3.fromDegrees(-102.22, 19.39, 52000);
            setCameraTarget({ destination, duration: 2 });
          }
          break;
        case 'enter_3d_twin':
          onEnter3DTwin?.(command.orchardId, command.sectionId);
          break;
        case 'reset_view':
          if (viewerRef.current) {
            const destination = Cartesian3.fromDegrees(-102.22, 19.39, 52000);
            setCameraTarget({ destination, duration: 2 });
          }
          setShowAvocadoBelt(true);
          setShowProductionClusters(true);
          setShowMexicoOrchards(true);
          break;
      }
    },
    [onOrchardSelect, onSectionSelect, onEnter3DTwin, detectedOrchards, handleScanMunicipality, handleOrchardParcelClick]
  );

  // Expose handleCommand to parent via ref
  useImperativeHandle(ref, () => ({
    handleCommand
  }), [handleCommand]);

  // Register command handler
  useEffect(() => {
    if (commandHandler) {
      // This would be called by the AI advisor
      // For now, we just store the reference
    }
  }, [commandHandler]);

  const getStressColor = (stressLevel: string): Color => {
    switch (stressLevel) {
      case 'low':
        return Color.GREEN.withAlpha(0.5);
      case 'medium':
        return Color.YELLOW.withAlpha(0.5);
      case 'high':
        return Color.RED.withAlpha(0.5);
      default:
        return Color.WHITE.withAlpha(0.5);
    }
  };

  const getStressBaseColor = (stressLevel?: string): Color => {
    switch (stressLevel) {
      case 'low':
        return Color.LIME;
      case 'medium':
        return Color.YELLOW;
      case 'high':
        return Color.RED;
      default:
        return Color.WHITE;
    }
  };

  const getBlockPolygonDegrees = (block: any) =>
    (block.polygon || block.boundary_coordinates || []).flatMap((point: number[]) => [point[1], point[0]]);

  const getClosedBlockPolylineDegrees = (block: any) => {
    const polygon = block.polygon || block.boundary_coordinates || [];
    if (!polygon.length) return [];
    return [...polygon, polygon[0]].flatMap((point: number[]) => [point[1], point[0], 8]);
  };

  const getTreePointColor = (health?: string): Color => {
    switch (health) {
      case "healthy":
        return Color.LIME;
      case "stressed":
        return Color.ORANGE;
      case "diseased":
        return Color.RED;
      default:
        return Color.WHITE;
    }
  };

  const getManualBoundaryColor = (boundary: any): Color => {
    if (boundary.label_type === "non_orchard") return Color.GRAY;
    if (boundary.label_type === "needs_review") return Color.ORANGE;
    return Color.CYAN;
  };

  const getManualPolygonDegrees = (boundary: any) =>
    (boundary.polygon || []).flatMap((point: number[]) => [point[0], point[1]]);

  const getClosedManualPolylineDegrees = (boundary: any) => {
    const polygon = boundary.polygon || [];
    if (!polygon.length) return [];
    return [...polygon, polygon[0]].flatMap((point: number[]) => [point[0], point[1], 12]);
  };

  const manualBoundaryToBlock = (boundary: any) => {
    const polygon = boundary.polygon || [];
    const center = polygon.reduce(
      (acc: { lng: number; lat: number }, point: number[]) => ({
        lng: acc.lng + point[0],
        lat: acc.lat + point[1],
      }),
      { lng: 0, lat: 0 }
    );
    const count = polygon.length || 1;
    return {
      type: "orchard_block",
      block_id: boundary.archive_id || boundary.boundary_id,
      archive_id: boundary.archive_id,
      municipality_id: boundary.municipality_id,
      label_type: boundary.label_type,
      center_lng: center.lng / count,
      center_lat: center.lat / count,
      polygon: polygon.map((point: number[]) => [point[1], point[0]]),
      estimated_hectares: boundary.manual_metadata?.estimated_hectares || 0,
      tree_count_estimate: boundary.manual_metadata?.tree_count_estimate || 0,
      estimated_tree_count: boundary.manual_metadata?.tree_count_estimate || 0,
      stress_level: boundary.label_type === "needs_review" ? "medium" : "low",
      confidence_score: 1,
      orchard_feature_score: boundary.label_type === "non_orchard" ? 0.1 : 1,
      row_alignment_score: boundary.label_type === "non_orchard" ? 0.1 : 1,
      boundary_source: "human_labeled",
      ml_training_label: boundary.ml_training_label,
      manual_metadata: boundary.manual_metadata,
      requires_review: boundary.label_type === "needs_review",
    };
  };

  const getManualClickCartesian = useCallback((position?: Cartesian2) => {
    if (!viewerRef.current) return null;
    const viewer = viewerRef.current;
    const ellipsoid = viewer.scene.globe.ellipsoid;
    const canvas = viewer.scene.canvas;
    const clickPosition = position || new Cartesian2(
      canvas.clientWidth / 2,
      canvas.clientHeight / 2
    );

    const cartesian = viewer.camera.pickEllipsoid(clickPosition, ellipsoid);
    if (cartesian) return cartesian;

    console.warn("Manual boundary click picking failed; using current camera center fallback.");
    return viewer.camera.pickEllipsoid(
      new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2),
      ellipsoid
    );
  }, []);

  const handleManualMapClick = useCallback((event: any) => {
    if (!manualBoundaryMode) return;
    const cartesian = getManualClickCartesian(event?.position);
    if (!cartesian) {
      console.warn("Manual boundary point was not captured.");
      return;
    }
    const cartographic = Cartographic.fromCartesian(cartesian);
    const lng = CesiumMath.toDegrees(cartographic.longitude);
    const lat = CesiumMath.toDegrees(cartographic.latitude);
    const point: [number, number] = [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
    console.log("Manual boundary point clicked", point);
    setManualBoundaryPoints((prev) => {
      const next = [...prev, point];
      console.log("Manual boundary current polygon points", next);
      return next;
    });
    setManualBoundaryFinished(false);
    setManualArchiveStatus(null);
  }, [getManualClickCartesian, manualBoundaryMode]);

  useEffect(() => {
    if (!manualBoundaryMode || !viewerRef.current) return;
    const handler = new CesiumScreenSpaceEventHandler(viewerRef.current.scene.canvas);
    handler.setInputAction(handleManualMapClick, ScreenSpaceEventType.LEFT_CLICK);
    return () => {
      if (!handler.isDestroyed()) handler.destroy();
    };
  }, [handleManualMapClick, manualBoundaryMode]);

  const archiveCurrentManualBoundary = async () => {
    if (manualBoundaryPoints.length < 3) {
      setManualArchiveStatus("Add at least three points before archiving.");
      return;
    }
    const municipalityId = selectedMunicipalityId || "tancitaro";
    const payload = {
      municipality_id: municipalityId,
      label_type: manualForm.label_type as "orchard_block" | "orchard_cluster" | "non_orchard" | "needs_review",
      polygon: manualBoundaryPoints,
      manual_metadata: {
        crop_type: manualForm.crop_type || "avocado",
        estimated_hectares: manualForm.estimated_hectares ? Number(manualForm.estimated_hectares) : undefined,
        tree_count_estimate: manualForm.tree_count_estimate ? Number(manualForm.tree_count_estimate) : undefined,
        notes: manualForm.notes,
        created_by: "operator",
      },
      ml_training_label: manualForm.ml_training_label,
    };
    console.log("Manual boundary archive payload", payload);
    const res = await archiveManualBoundary(payload);
    console.log("Manual boundary archive response", res);
    if (res.success && res.data) {
      const boundary = res.data.boundary || {
        archive_id: res.data.archive_id,
        municipality_id: municipalityId,
        label_type: manualForm.label_type,
        polygon: manualBoundaryPoints,
        manual_metadata: {
          crop_type: manualForm.crop_type || "avocado",
          estimated_hectares: manualForm.estimated_hectares ? Number(manualForm.estimated_hectares) : undefined,
          tree_count_estimate: manualForm.tree_count_estimate ? Number(manualForm.tree_count_estimate) : undefined,
          notes: manualForm.notes,
          created_by: "operator",
        },
        boundary_source: "human_labeled",
        ml_training_label: manualForm.ml_training_label,
        status: "archived",
      };
      setManualBoundaries((prev) => [boundary, ...prev]);
      const block = manualBoundaryToBlock(boundary);
      setCommandContext(block);
      onSegmentedBlockSelected?.(block);
      setManualBoundaryPoints([]);
      setManualBoundaryFinished(false);
      setManualArchiveStatus(`${res.data.message} ${res.data.memory_status === "saved_to_mongodb" ? "Saved to MongoDB mission memory." : "Local fallback memory active."}`);
    } else {
      setManualArchiveStatus(res.error || "Manual boundary archive failed.");
    }
  };

  const openBlockContext = (block: any) => {
    setCommandContext({ type: "orchard_block", ...block });
    onSegmentedBlockSelected?.(block);
    if (block.center_lng && block.center_lat) {
      setCameraTarget({
        destination: Cartesian3.fromDegrees(block.center_lng, block.center_lat, 4500),
        duration: 1.2,
      });
    }
  };

  const openMunicipalityContext = (municipality: any) => {
    setCommandContext({ type: "municipality", ...municipality });
    setSelectedMunicipalityId(municipality.id);
    onMunicipalitySelected?.(municipality);
    setCameraTarget({
      destination: Cartesian3.fromDegrees(municipality.lng, municipality.lat, 15000),
      duration: 2,
    });
  };

  const saveCorrection = async () => {
    if (!commandContext?.block_id) return;
    const payload = {
      block_id: commandContext.block_id,
      municipality_id: commandContext.municipality_id || selectedMunicipalityId || "tancitaro",
      corrected_hectares: correctionDraft.hectares ? Number(correctionDraft.hectares) : undefined,
      corrected_tree_count: correctionDraft.tree_count ? Number(correctionDraft.tree_count) : undefined,
      corrected_canopy_density: correctionDraft.canopy_density || undefined,
      corrected_stress_level: correctionDraft.stress_level || undefined,
      notes: correctionDraft.notes || undefined,
    };
    const res = await saveSegmentationCorrection(payload);
    if (res.success) {
      setCorrectionStatus("Learning signal recorded");
      const corrected = {
        ...commandContext,
        estimated_hectares: payload.corrected_hectares ?? commandContext.estimated_hectares,
        estimated_tree_count: payload.corrected_tree_count ?? commandContext.estimated_tree_count,
        canopy_density: payload.corrected_canopy_density ?? commandContext.canopy_density,
        stress_level: payload.corrected_stress_level ?? commandContext.stress_level,
        boundary_source: "human_corrected",
        requires_review: false,
      };
      setCommandContext(corrected);
      onSegmentedBlockSelected?.(corrected);
    } else {
      setCorrectionStatus("Local fallback memory active");
    }
  };

  // Fallback if Cesium is not ready or has error
  if (!cesiumReady || cesiumError) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <div className="text-center text-white p-8">
          <div className="text-xl font-bold mb-2">
            {cesiumError ? '⚠️ Cesium Not Available' : '⏳ Loading Cesium...'}
          </div>
          <div className="text-sm opacity-75">
            {cesiumError ? 'Check NEXT_PUBLIC_CESIUM_ION_TOKEN in .env.local' : 'Initializing globe view...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-[500px] min-h-[500px] w-full overflow-hidden rounded-xl border border-cyan-500/30 bg-black ${className || ""}`}>
      {/* Status Badge */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          Gemini Orchard Operations OS · Cesium Live
        </div>
      </div>

      {/* Operational focus actions */}
      <div className="absolute top-16 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-lg border border-cyan-400/20 bg-black/75 p-1.5 text-xs shadow-2xl backdrop-blur-md">
        <button
          onClick={() => {
            setUserHasInteractedWithCamera(false);
            flyToMichoacanRegion(1);
          }}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-gray-200 hover:border-cyan-300/40 hover:text-cyan-200"
        >
          Jump to Region
        </button>
        <button
          onClick={() => {
            setUserHasInteractedWithCamera(false);
            flyToTancitaroMunicipality(1);
          }}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-gray-200 hover:border-cyan-300/40 hover:text-cyan-200"
        >
          Focus Municipality
        </button>
        <button
          onClick={() => {
            setUserHasInteractedWithCamera(false);
            focusSelectedOrFirstBlock(1);
          }}
          className="rounded-md bg-cyan-300 px-3 py-1.5 font-bold text-gray-950 hover:bg-cyan-200"
        >
          Focus Orchard
        </button>
        <button
          onClick={() => {
            setUserHasInteractedWithCamera(false);
            focusSelectedOrFirstBlock(0.9);
          }}
          className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 font-semibold text-cyan-200 hover:bg-cyan-300/15"
        >
          Recenter on Selected Orchard
        </button>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,transparent_46%,rgba(0,0,0,0.42)_100%),linear-gradient(180deg,rgba(0,0,0,0.10),rgba(0,0,0,0.28))]" />

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 max-w-[230px] rounded-lg border border-white/10 bg-black/70 p-3 text-white shadow-xl backdrop-blur-md">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Map Toolbar</h3>
        <div className="mt-2 space-y-1 text-[11px] text-gray-300">
          <div>Municipalities: {mexicoAvocadoMunicipalities.length}</div>
          <div>Synthetic Orchards: {michoacanSyntheticOrchards.length}</div>
          <div>Region: Michoacan Belt</div>
          {detectedOrchards.length > 0 && (
            <div className="font-semibold text-cyan-300">Detected Orchards: {detectedOrchards.length}</div>
          )}
          {segmentedOrchardBlocks && segmentedOrchardBlocks.length > 0 && (
            <div className="font-semibold text-cyan-300">Segmented Blocks: {segmentedOrchardBlocks.length}</div>
          )}
        </div>

        {segmentedOrchardBlocks && segmentedOrchardBlocks.length > 0 && (
          <label className="mt-2 flex cursor-pointer items-center gap-2 border-t border-white/10 pt-2 text-[11px] text-gray-300">
            <input
              type="checkbox"
              checked={showTreeCanopyPoints}
              onChange={(event) => setShowTreeCanopyPoints(event.target.checked)}
              className="accent-cyan-500"
            />
            Show Tree-Level Canopy Points
          </label>
        )}
        
        {/* Debug Info */}
        <div className="mt-2 space-y-1 border-t border-white/10 pt-2 text-[10px]">
          <div className="text-amber-300">
            Selected Municipality: {selectedMunicipalityId || 'None'}
          </div>
          {selectedOrchardCandidate && (
            <div className="text-emerald-300">
              Selected Orchard: {selectedOrchardCandidate.orchard_id}
            </div>
          )}
          {scanning && (
            <div className="text-blue-400 animate-pulse">
              Scanning in progress...
            </div>
          )}
        </div>
        
        {/* Scan Button - shown when municipality is selected */}
        {selectedMunicipalityId && (
          <div className="mt-2 border-t border-white/10 pt-2">
            <button
              onClick={handleScanMunicipality}
              disabled={scanning}
              className="w-full rounded bg-cyan-600 px-2 py-1.5 text-[11px] font-semibold transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-gray-600"
            >
              {scanning ? 'Scanning...' : 'Segment Selected Municipality'}
            </button>
            {scanError && (
              <div className="mt-2 text-xs text-red-400">{scanError}</div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-black/80 text-white p-4 rounded-lg space-y-2">
        <h4 className="font-bold">Stress Levels</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Manual Boundary Toolbar */}
      <div className="absolute bottom-4 left-4 z-20 w-[320px] max-w-[calc(100%-2rem)] overflow-hidden rounded-lg border border-cyan-500/40 bg-gray-950/95 text-white shadow-2xl">
        <div className="px-4 py-3 border-b border-gray-800 bg-cyan-950/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-cyan-300">Manual Boundary Toolbar</p>
            <p className="text-sm font-bold">Manual Boundary Mode: {manualBoundaryMode ? "ON" : "OFF"}</p>
          </div>
          <button
            onClick={() => {
              setManualBoundaryMode((prev) => !prev);
              setManualArchiveStatus(null);
            }}
            className={`px-3 py-1.5 rounded text-xs font-semibold ${
              manualBoundaryMode
                ? "bg-cyan-500 text-gray-950"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {manualBoundaryMode ? "ON" : "OFF"}
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Points selected</span>
            <span className="font-mono text-cyan-300">{manualBoundaryPoints.length}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setManualBoundaryFinished(true);
                setManualArchiveStatus("Boundary closed. Add metadata, then archive.");
              }}
              disabled={!manualBoundaryMode || manualBoundaryPoints.length < 3}
              className="py-1.5 rounded bg-cyan-700 disabled:bg-gray-800 disabled:text-gray-600 text-xs font-semibold"
            >
              Finish Boundary
            </button>
            <button
              onClick={() => {
                setManualBoundaryPoints([]);
                setManualBoundaryFinished(false);
                setManualArchiveStatus(null);
              }}
              disabled={manualBoundaryPoints.length === 0}
              className="py-1.5 rounded bg-gray-800 disabled:text-gray-600 text-xs font-medium"
            >
              Clear Boundary
            </button>
            <button
              onClick={archiveCurrentManualBoundary}
              disabled={!manualBoundaryMode || manualBoundaryPoints.length < 3}
              className="py-1.5 rounded bg-emerald-700 disabled:bg-gray-800 disabled:text-gray-600 text-xs font-semibold"
            >
              Archive Boundary
            </button>
          </div>

          {manualBoundaryMode && (
            <p className="text-[10px] text-gray-400">
              Click the globe to place cyan vertices. A preview polygon appears after three points.
            </p>
          )}

          {(manualBoundaryFinished || manualBoundaryPoints.length >= 3) && (
            <div className="space-y-2 pt-2 border-t border-gray-800">
              <select
                value={manualForm.label_type}
                onChange={(event) => setManualForm((prev) => ({ ...prev, label_type: event.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
              >
                <option value="orchard_block">orchard_block</option>
                <option value="orchard_cluster">orchard_cluster</option>
                <option value="non_orchard">non_orchard</option>
                <option value="needs_review">needs_review</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={manualForm.crop_type}
                  onChange={(event) => setManualForm((prev) => ({ ...prev, crop_type: event.target.value }))}
                  placeholder="crop type"
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
                />
                <input
                  value={manualForm.estimated_hectares}
                  onChange={(event) => setManualForm((prev) => ({ ...prev, estimated_hectares: event.target.value }))}
                  placeholder="estimated hectares"
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
                />
                <input
                  value={manualForm.tree_count_estimate}
                  onChange={(event) => setManualForm((prev) => ({ ...prev, tree_count_estimate: event.target.value }))}
                  placeholder="tree count estimate"
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
                />
                <label className="flex items-center gap-1 text-[10px] text-gray-300">
                  <input
                    type="checkbox"
                    checked={manualForm.ml_training_label}
                    onChange={(event) => setManualForm((prev) => ({ ...prev, ml_training_label: event.target.checked }))}
                    className="accent-cyan-500"
                  />
                  ML label archive
                </label>
              </div>
              <textarea
                value={manualForm.notes}
                onChange={(event) => setManualForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="notes"
                rows={2}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs resize-none"
              />
            </div>
          )}

          {manualArchiveStatus && (
            <p className="text-[10px] text-emerald-300">{manualArchiveStatus}</p>
          )}
        </div>
      </div>

      {/* Cesium Viewer */}
      <Viewer
        full
        ref={(ref) => {
          if (ref?.cesiumElement) {
            viewerRef.current = ref.cesiumElement;
          }
        }}
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={true}
        sceneModePicker={false}
        navigationHelpButton={false}
        infoBox={false}
        selectionIndicator={true}
      >
        {/* Camera fly-to animation */}
        {cameraTarget && (
          <CameraFlyTo
            destination={cameraTarget.destination}
            orientation={orchardCameraOrientation}
            duration={cameraTarget.duration}
            once
            onComplete={() => setCameraTarget(null)}
          />
        )}

        {/* Temporary manual boundary outline while operator clicks points */}
        {manualBoundaryPoints.length > 0 && (
          <React.Fragment>
            {manualBoundaryPoints.map((point, index) => (
              <Entity
                key={`manual-draft-point-${index}`}
                position={Cartesian3.fromDegrees(point[0], point[1])}
              >
                <PointGraphics
                  pixelSize={9}
                  color={Color.CYAN}
                  outlineColor={Color.BLACK}
                  outlineWidth={1}
                  heightReference={HeightReference.CLAMP_TO_GROUND}
                />
              </Entity>
            ))}
            {manualBoundaryPoints.length > 1 && (
              <Entity name="Manual boundary draft outline">
                <PolylineGraphics
                  positions={Cartesian3.fromDegreesArrayHeights(
                    [
                      ...manualBoundaryPoints,
                      ...(manualBoundaryPoints.length >= 3 ? [manualBoundaryPoints[0]] : []),
                    ].flatMap((point) => [point[0], point[1], 18])
                  )}
                  width={4}
                  material={Color.CYAN}
                  clampToGround
                />
              </Entity>
            )}
            {manualBoundaryPoints.length >= 3 && (
              <Entity name="Manual boundary draft polygon preview">
                <PolygonGraphics
                  hierarchy={Cartesian3.fromDegreesArray(
                    manualBoundaryPoints.flatMap((point) => [point[0], point[1]])
                  )}
                  material={Color.CYAN.withAlpha(0.18)}
                  outline={true}
                  outlineColor={Color.CYAN}
                  outlineWidth={3}
                  heightReference={HeightReference.CLAMP_TO_GROUND}
                />
              </Entity>
            )}
          </React.Fragment>
        )}

        {/* Render Planned Drone Mission Route */}
        {plannedMission && plannedMission.waypoints && (
          <Entity
            name={`Drone Mission: ${plannedMission.mission_id}`}
            description={`Status: ${plannedMission.status}`}
          >
            <PolylineGraphics
              positions={Cartesian3.fromDegreesArrayHeights(
                plannedMission.waypoints.flatMap((w: any) => [w.lng, w.lat, 500])
              )}
              width={8}
              material={Color.CYAN}
            />
          </Entity>
        )}

        {/* Render Drone Priority Zones */}
        {plannedMission && plannedMission.priority_zones && plannedMission.priority_zones.map((zone: any, i: number) => (
          <Entity
            key={`priority-${plannedMission.mission_id}-${i}`}
            position={Cartesian3.fromDegrees(zone.lng, zone.lat)}
            name={`Priority Zone: ${zone.id}`}
          >
            <PointGraphics
              pixelSize={15}
              color={Color.MAGENTA.withAlpha(0.6)}
              outlineColor={Color.WHITE}
              outlineWidth={2}
              heightReference={HeightReference.CLAMP_TO_GROUND}
            />
            <LabelGraphics
              text={`PRIORITY: ${zone.severity}`}
              font="10px sans-serif"
              fillColor={Color.WHITE}
              outlineColor={Color.BLACK}
              outlineWidth={2}
              pixelOffset={new Cartesian3(0, -20, 0)}
              heightReference={HeightReference.CLAMP_TO_GROUND}
            />
          </Entity>
        ))}

        {/* Render Mexico Avocado Belt boundary */}
        {showAvocadoBelt && (
          <Entity
            name={michoacanAvocadoBelt.name}
            description={`
              <div style="font-family: sans-serif;">
                <h3>${michoacanAvocadoBelt.name}</h3>
                <p>${michoacanAvocadoBelt.description}</p>
                <p><strong>State:</strong> ${michoacanAvocadoBelt.state}</p>
                <p><strong>Country:</strong> ${michoacanAvocadoBelt.country}</p>
              </div>
            `}
          >
            <PolygonGraphics
              hierarchy={Cartesian3.fromDegreesArray([
                michoacanAvocadoBelt.lng_min, michoacanAvocadoBelt.lat_min,
                michoacanAvocadoBelt.lng_max, michoacanAvocadoBelt.lat_min,
                michoacanAvocadoBelt.lng_max, michoacanAvocadoBelt.lat_max,
                michoacanAvocadoBelt.lng_min, michoacanAvocadoBelt.lat_max,
              ])}
              material={Color.CYAN.withAlpha(0.1)}
              outline={true}
              outlineColor={Color.CYAN}
              outlineWidth={3}
              heightReference={HeightReference.CLAMP_TO_GROUND}
            />
          </Entity>
        )}

        {/* Render Mexico municipalities */}
        {showAvocadoBelt && mexicoAvocadoMunicipalities.map((municipality) => {
          const isSelected = selectedMunicipalityId === municipality.id;
          const stressColor = municipality.stress_level === 'high' ? Color.RED :
                             municipality.stress_level === 'medium' ? Color.YELLOW :
                             Color.GREEN;
          
          return (
            <Entity
              key={municipality.id}
              name={municipality.name}
              description={`
                <div style="font-family: sans-serif;">
                  <h3>${municipality.name}</h3>
                  <p><strong>State:</strong> ${municipality.state}</p>
                  <p><strong>Estimated Hectares:</strong> ${municipality.estimated_hectares.toLocaleString()}</p>
                  <p><strong>Production Rank:</strong> ${municipality.production_rank || 'N/A'}</p>
                  <p><strong>Stress Level:</strong> ${municipality.stress_level}</p>
                  <p><strong>NDVI Average:</strong> ${municipality.ndvi_average.toFixed(2)}</p>
                  <p><strong>Projected Profit:</strong> $${municipality.projected_profit_usd.toLocaleString()}</p>
                  <p>${municipality.note}</p>
                </div>
              `}
              position={Cartesian3.fromDegrees(municipality.lng, municipality.lat)}
              onClick={() => {
                console.log('Municipality clicked:', municipality.id, municipality.name);
                openMunicipalityContext(municipality);
              }}
            >
              <PointGraphics
                pixelSize={isSelected ? 20 : 12}
                color={isSelected ? Color.CYAN : stressColor.withAlpha(0.8)}
                outlineColor={Color.WHITE}
                outlineWidth={2}
                heightReference={HeightReference.CLAMP_TO_GROUND}
              />
              <LabelGraphics
                text={municipality.name}
                font="12px sans-serif"
                fillColor={Color.WHITE}
                outlineColor={Color.BLACK}
                outlineWidth={2}
                style={0}
                verticalOrigin={VerticalOrigin.BOTTOM}
                horizontalOrigin={HorizontalOrigin.CENTER}
                pixelOffset={new Cartesian3(0, -15, 0)}
                heightReference={HeightReference.CLAMP_TO_GROUND}
              />
            </Entity>
          );
        })}

        {/* Render production clusters */}
        {showProductionClusters && michoacanAvocadoClusters.map((cluster) => (
          <Entity
            key={cluster.id}
            name={cluster.name}
            description={`
              <div style="font-family: sans-serif;">
                <h3>${cluster.name}</h3>
                <p><strong>Priority:</strong> ${cluster.priority}</p>
                <p><strong>Estimated Hectares:</strong> ${cluster.estimated_hectares.toLocaleString()}</p>
                <p><strong>NDVI Average:</strong> ${cluster.ndvi_average.toFixed(2)}</p>
                <p><strong>Stress Level:</strong> ${cluster.stress_level}</p>
                <p><strong>Profit at Risk:</strong> $${cluster.projected_profit_risk_usd.toLocaleString()}</p>
              </div>
            `}
          >
            <PolygonGraphics
              hierarchy={Cartesian3.fromDegreesArray(
                Array.from({ length: 32 }, (_, i) => {
                  const angle = (i / 32) * 2 * Math.PI;
                  const radiusInDegrees = cluster.radius_km / 111; // Approximate km to degrees
                  return [
                    cluster.center_lng + radiusInDegrees * Math.cos(angle),
                    cluster.center_lat + radiusInDegrees * Math.sin(angle),
                  ];
                }).flat()
              )}
              material={
                cluster.priority === 'high'
                  ? Color.ORANGE.withAlpha(0.2)
                  : Color.YELLOW.withAlpha(0.15)
              }
              outline={true}
              outlineColor={cluster.priority === 'high' ? Color.ORANGE : Color.YELLOW}
              outlineWidth={2}
              heightReference={HeightReference.CLAMP_TO_GROUND}
            />
          </Entity>
        ))}

        {/* Render synthetic orchards */}
        {showMexicoOrchards && michoacanSyntheticOrchards.map((orchard) => {
          const isSelected = selectedOrchardMexico === orchard.orchard_id;
          const stressColor = orchard.stress_level === 'high' ? Color.RED :
                             orchard.stress_level === 'medium' ? Color.YELLOW :
                             Color.GREEN;
          
          return (
            <Entity
              key={orchard.orchard_id}
              name={orchard.name}
              description={`
                <div style="font-family: sans-serif;">
                  <h3>${orchard.name}</h3>
                  <p><strong>Cluster:</strong> ${orchard.cluster_id}</p>
                  <p><strong>Acres:</strong> ${orchard.estimated_acres}</p>
                  <p><strong>Trees:</strong> ${orchard.estimated_trees.toLocaleString()}</p>
                  <p><strong>NDVI:</strong> ${orchard.ndvi_average.toFixed(2)}</p>
                  <p><strong>Stress Level:</strong> ${orchard.stress_level}</p>
                  <p><strong>Soil Moisture:</strong> ${orchard.soil_moisture}%</p>
                  <p><strong>Projected Yield:</strong> ${orchard.projected_yield_kg.toLocaleString()} kg</p>
                  <p><strong>Projected Revenue:</strong> $${orchard.projected_revenue_usd.toLocaleString()}</p>
                  <p><strong>Projected Profit:</strong> $${orchard.projected_profit_usd.toLocaleString()}</p>
                </div>
              `}
              position={Cartesian3.fromDegrees(orchard.lng, orchard.lat)}
              onClick={() => {
                setSelectedOrchardMexico(orchard.orchard_id);
              }}
            >
              <PointGraphics
                pixelSize={isSelected ? 12 : 8}
                color={isSelected ? Color.CYAN : stressColor.withAlpha(0.7)}
                outlineColor={Color.WHITE}
                outlineWidth={1}
                heightReference={HeightReference.CLAMP_TO_GROUND}
              />
            </Entity>
          );
        })}

        {/* Render archived human-labeled manual boundaries */}
        {manualBoundaries.map((boundary) => {
          const block = manualBoundaryToBlock(boundary);
          const color = getManualBoundaryColor(boundary);
          const isSelected = commandContext?.archive_id === boundary.archive_id;
          const polygonDegrees = getManualPolygonDegrees(boundary);
          const outlineDegrees = getClosedManualPolylineDegrees(boundary);
          if (!polygonDegrees.length) return null;

          return (
            <React.Fragment key={boundary.archive_id || boundary.boundary_id}>
              <Entity
                name={`Human-labeled boundary: ${boundary.archive_id || boundary.boundary_id}`}
                description={`
                  <div style="font-family: sans-serif;">
                    <h3>Human-Labeled Orchard Boundary</h3>
                    <p><strong>Archive ID:</strong> ${boundary.archive_id || boundary.boundary_id}</p>
                    <p><strong>Label:</strong> ${boundary.label_type}</p>
                    <p><strong>Crop:</strong> ${boundary.manual_metadata?.crop_type || "avocado"}</p>
                    <p><strong>ML Label Archive:</strong> ${boundary.ml_training_label ? "yes" : "no"}</p>
                    <p><strong>Source:</strong> human_labeled</p>
                  </div>
                `}
                onClick={() => {
                  setCommandContext(block);
                  onSegmentedBlockSelected?.(block);
                }}
              >
                <PolygonGraphics
                  hierarchy={Cartesian3.fromDegreesArray(polygonDegrees)}
                  material={color.withAlpha(boundary.label_type === "non_orchard" ? 0.08 : 0.16)}
                  outline={true}
                  outlineColor={color}
                  outlineWidth={isSelected ? 5 : 3}
                  heightReference={HeightReference.CLAMP_TO_GROUND}
                />
                <PolylineGraphics
                  positions={Cartesian3.fromDegreesArrayHeights(outlineDegrees)}
                  width={isSelected ? 6 : 4}
                  material={color}
                  clampToGround
                />
              </Entity>
              <Entity
                position={Cartesian3.fromDegrees(block.center_lng, block.center_lat)}
                onClick={() => {
                  setCommandContext(block);
                  onSegmentedBlockSelected?.(block);
                }}
              >
                <LabelGraphics
                  text={`Human-labeled · ${boundary.label_type}`}
                  font="bold 11px sans-serif"
                  fillColor={color}
                  outlineColor={Color.BLACK}
                  outlineWidth={3}
                  verticalOrigin={VerticalOrigin.CENTER}
                  horizontalOrigin={HorizontalOrigin.CENTER}
                  heightReference={HeightReference.CLAMP_TO_GROUND}
                />
              </Entity>
            </React.Fragment>
          );
        })}

        {/* Render AI segmented orchard blocks as command boundaries */}
        {segmentedOrchardBlocks?.map((block) => {
          const isSelected = selectedSegmentedBlockId === block.block_id || commandContext?.block_id === block.block_id;
          const isHovered = hoveredBlockId === block.block_id;
          const stressColor = getStressBaseColor(block.stress_level);
          const outlineColor = isSelected ? Color.CYAN : stressColor;
          const polygonDegrees = getBlockPolygonDegrees(block);
          const outlineDegrees = getClosedBlockPolylineDegrees(block);

          if (!polygonDegrees.length) return null;

          return (
            <React.Fragment key={block.block_id}>
              <Entity
                name={`Segmented Block: ${block.block_id}`}
                description={`
                  <div style="font-family: sans-serif;">
                    <h3>AI detected orchard row/canopy pattern</h3>
                    <p><strong>ID:</strong> ${block.block_id}</p>
                    <p><strong>Area:</strong> ${block.estimated_hectares} ha</p>
                    <p><strong>Trees:</strong> ${Number(block.tree_count_estimate || block.estimated_tree_count || 0).toLocaleString()}</p>
                    <p><strong>Stress Level:</strong> ${block.stress_level}</p>
                    <p><strong>Confidence:</strong> ${Math.round((block.confidence_score || block.confidence || 0.86) * 100)}%</p>
                    <p><strong>Orchard Feature Score:</strong> ${Math.round((block.orchard_feature_score || 0.86) * 100)}%</p>
                    <p><strong>Row Alignment Score:</strong> ${Math.round((block.row_alignment_score || 0.84) * 100)}%</p>
                    <p><strong>Boundary Source:</strong> ${block.boundary_source || "ai_generated"}</p>
                  </div>
                `}
                onClick={() => openBlockContext(block)}
                onMouseEnter={() => setHoveredBlockId(block.block_id)}
                onMouseLeave={() => setHoveredBlockId(null)}
              >
                <PolygonGraphics
                  hierarchy={Cartesian3.fromDegreesArray(polygonDegrees)}
                  material={stressColor.withAlpha(isSelected ? 0.26 : isHovered ? 0.22 : 0.14)}
                  outline={true}
                  outlineColor={outlineColor}
                  outlineWidth={isSelected ? 5 : isHovered ? 4 : 3}
                  heightReference={HeightReference.CLAMP_TO_GROUND}
                />
                {outlineDegrees.length > 0 && (
                  <PolylineGraphics
                    positions={Cartesian3.fromDegreesArrayHeights(outlineDegrees)}
                    width={isSelected ? 6 : isHovered ? 5 : 3}
                    material={outlineColor}
                    clampToGround
                  />
                )}
              </Entity>
              {showTreeCanopyPoints && (block.tree_points || []).map((tree: any) => (
                <Entity
                  key={tree.tree_id}
                  position={Cartesian3.fromDegrees(tree.lng, tree.lat)}
                  name={`Canopy point: ${tree.tree_id}`}
                  description={`
                    <div style="font-family: sans-serif;">
                      <h3>AI detected orchard row/canopy pattern</h3>
                      <p><strong>Tree sample:</strong> ${tree.tree_id}</p>
                      <p><strong>Health:</strong> ${tree.health}</p>
                      <p><strong>Canopy radius:</strong> ${tree.canopy_radius_m} m</p>
                    </div>
                  `}
                  onClick={() => openBlockContext(block)}
                >
                  <PointGraphics
                    pixelSize={isSelected ? 8 : 6}
                    color={getTreePointColor(tree.health).withAlpha(0.9)}
                    outlineColor={Color.BLACK}
                    outlineWidth={1}
                    heightReference={HeightReference.CLAMP_TO_GROUND}
                  />
                </Entity>
              ))}
              <Entity
                position={Cartesian3.fromDegrees(block.center_lng, block.center_lat)}
                onClick={() => openBlockContext(block)}
              >
                <LabelGraphics
                  text={`${block.block_id} · row/canopy pattern · ${block.estimated_hectares} ha`}
                  font={isSelected ? "bold 12px sans-serif" : "11px sans-serif"}
                  fillColor={isSelected ? Color.CYAN : Color.WHITE}
                  outlineColor={Color.BLACK}
                  outlineWidth={3}
                  verticalOrigin={VerticalOrigin.CENTER}
                  horizontalOrigin={HorizontalOrigin.CENTER}
                  heightReference={HeightReference.CLAMP_TO_GROUND}
                />
              </Entity>
            </React.Fragment>
          );
        })}

        {/* Render detected orchard parcels as polygons */}
        {detectedOrchards.map((orchard) => {
          const isSelected = selectedOrchardCandidate?.orchard_id === orchard.orchard_id;
          const stressColor = orchard.stress_level === 'high' ? Color.RED :
                             orchard.stress_level === 'medium' ? Color.YELLOW :
                             Color.GREEN;
          
          // Convert boundary coordinates to Cesium format
          const boundaryPositions = Cartesian3.fromDegreesArray(
            orchard.boundary_coordinates.flat()
          );
          
          return (
            <React.Fragment key={orchard.orchard_id}>
              {/* Polygon for orchard boundary */}
              <Entity
                name={`Detected: ${orchard.orchard_id}`}
                description={`
                  <div style="font-family: sans-serif;">
                    <h3>Detected Orchard Parcel</h3>
                    <p><strong>ID:</strong> ${orchard.orchard_id}</p>
                    <p><strong>Area:</strong> ${orchard.estimated_hectares} ha (${orchard.estimated_acres} acres)</p>
                    <p><strong>Trees:</strong> ${orchard.estimated_tree_count.toLocaleString()}</p>
                    <p><strong>NDVI:</strong> ${orchard.ndvi_average.toFixed(2)}</p>
                    <p><strong>Stress Level:</strong> ${orchard.stress_level}</p>
                    <p><strong>Confidence:</strong> ${(orchard.confidence * 100).toFixed(0)}%</p>
                    <p><strong>Detection:</strong> ${orchard.detection_method}</p>
                    <p><strong>Imagery:</strong> ${orchard.imagery_source}</p>
                  </div>
                `}
                onClick={() => handleOrchardParcelClick(orchard)}
              >
                <PolygonGraphics
                  hierarchy={boundaryPositions}
                  material={isSelected ? Color.CYAN.withAlpha(0.4) : stressColor.withAlpha(0.3)}
                  outline={true}
                  outlineColor={isSelected ? Color.CYAN : stressColor}
                  outlineWidth={isSelected ? 3 : 2}
                  heightReference={HeightReference.CLAMP_TO_GROUND}
                />
              </Entity>
              
              {/* Center point marker */}
              <Entity
                position={Cartesian3.fromDegrees(orchard.center_lng, orchard.center_lat)}
                onClick={() => handleOrchardParcelClick(orchard)}
              >
                <PointGraphics
                  pixelSize={isSelected ? 10 : 6}
                  color={isSelected ? Color.CYAN : stressColor}
                  outlineColor={Color.WHITE}
                  outlineWidth={1}
                  heightReference={HeightReference.CLAMP_TO_GROUND}
                />
              </Entity>
            </React.Fragment>
          );
        })}
      </Viewer>

      {/* Context details are rendered in the right intelligence panel in /command-center. */}
      {false && commandContext && (
        <div className="absolute bottom-4 left-4 z-10 w-[340px] max-w-[calc(100%-2rem)] bg-gray-950/92 text-white border border-cyan-500/30 rounded-lg shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 bg-cyan-950/30 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-cyan-300">
                {commandContext.type === "orchard_block" ? "Orchard Block Context" : "Municipality Context"}
              </p>
              <h3 className="text-sm font-bold mt-0.5">
                {commandContext.block_id || commandContext.name || commandContext.id}
              </h3>
              {commandContext.boundary_source === "human_corrected" && (
                <p className="text-[10px] text-emerald-300 mt-1">Human-corrected boundary active</p>
              )}
              {commandContext.boundary_source === "human_labeled" && (
                <p className="text-[10px] text-cyan-300 mt-1">Human-labeled boundary active · ML label archive</p>
              )}
            </div>
            <button
              onClick={() => setCommandContext(null)}
              className="text-gray-500 hover:text-white text-sm"
              aria-label="Close command context"
            >
              ×
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium capitalize">{commandContext.type?.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-gray-500">Hectares</p>
                <p className="font-medium">{(commandContext.estimated_hectares ?? commandContext.hectares ?? 0).toLocaleString()} ha</p>
              </div>
              <div>
                <p className="text-gray-500">Stress level</p>
                <p className={`font-medium capitalize ${
                  commandContext.stress_level === "high" ? "text-red-300" :
                  commandContext.stress_level === "medium" ? "text-yellow-300" :
                  "text-emerald-300"
                }`}>{commandContext.stress_level || "low"}</p>
              </div>
              <div>
                <p className="text-gray-500">Tree count estimate</p>
                <p className="font-medium">{Number(commandContext.tree_count_estimate || commandContext.estimated_tree_count || commandContext.estimated_trees || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Confidence</p>
                <p className="font-medium">{Math.round((commandContext.confidence_score || commandContext.confidence || 0.86) * 100)}%</p>
              </div>
              <div>
                <p className="text-gray-500">Orchard feature score</p>
                <p className="font-medium">{Math.round((commandContext.orchard_feature_score || 0.86) * 100)}%</p>
              </div>
              <div>
                <p className="text-gray-500">Row alignment score</p>
                <p className="font-medium">{Math.round((commandContext.row_alignment_score || 0.84) * 100)}%</p>
              </div>
              <div>
                <p className="text-gray-500">Sampled tree points</p>
                <p className="font-medium">{commandContext.tree_points?.length ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-500">Boundary source</p>
                <p className="font-medium">{commandContext.boundary_source || "ai_generated"}</p>
              </div>
              {commandContext.boundary_source === "human_labeled" && (
                <>
                  <div>
                    <p className="text-gray-500">Label type</p>
                    <p className="font-medium">{commandContext.label_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ML training label</p>
                    <p className="font-medium">{commandContext.ml_training_label ? "Yes" : "No"}</p>
                  </div>
                </>
              )}
            </div>

            {commandContext.type === "orchard_block" && (
              <p className="text-[10px] text-cyan-300">
                {commandContext.boundary_source === "human_labeled"
                  ? "Operator-labeled boundary is preferred as the operational target and retained for training dataset preparation."
                  : "AI detected orchard row/canopy pattern from sampled tree spacing, canopy density, and vegetation signals."}
              </p>
            )}

            <div className="grid grid-cols-2 gap-1.5">
              {[
                "Segment Orchards",
                "Reconstruct Twin",
                "Dispatch Drone",
                "Analyze Inspection",
                "Simulate ROI",
                "Draft Field Task",
              ].map((label) => (
                <button
                  key={label}
                  onClick={() => {
                    if (label === "Segment Orchards") handleScanMunicipality();
                    if (label === "Reconstruct Twin" && commandContext.block_id) onEnter3DTwin?.(commandContext.block_id);
                  }}
                  className="px-2 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-[10px] font-medium text-gray-200 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>

            {commandContext.type === "orchard_block" && (
              <div className="pt-3 border-t border-gray-800">
                <button
                  onClick={() => setReviewMode((value) => !value)}
                  className="w-full px-3 py-1.5 rounded bg-cyan-700/80 hover:bg-cyan-700 text-xs font-semibold transition-colors"
                >
                  {reviewMode ? "Close Segmentation Review" : "Segmentation Review Mode"}
                </button>

                {reviewMode && (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>Type: {commandContext.segmentation_type || "orchard_block_boundary"}</div>
                      <div>Review: {commandContext.requires_review ? "Required" : "Optional"}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="hectares"
                        defaultValue={commandContext.estimated_hectares}
                        onChange={(event) => setCorrectionDraft((prev: any) => ({ ...prev, hectares: event.target.value }))}
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[11px]"
                      />
                      <input
                        placeholder="tree count"
                        defaultValue={commandContext.estimated_tree_count}
                        onChange={(event) => setCorrectionDraft((prev: any) => ({ ...prev, tree_count: event.target.value }))}
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[11px]"
                      />
                      <input
                        placeholder="canopy density"
                        defaultValue={commandContext.canopy_density}
                        onChange={(event) => setCorrectionDraft((prev: any) => ({ ...prev, canopy_density: event.target.value }))}
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[11px]"
                      />
                      <select
                        defaultValue={commandContext.stress_level}
                        onChange={(event) => setCorrectionDraft((prev: any) => ({ ...prev, stress_level: event.target.value }))}
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[11px]"
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="notes"
                      onChange={(event) => setCorrectionDraft((prev: any) => ({ ...prev, notes: event.target.value }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[11px] resize-none"
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          setCorrectionDraft({});
                          setCorrectionStatus("Boundary accepted");
                        }}
                        className="py-1 rounded bg-emerald-800/80 text-[10px] font-medium"
                      >
                        Accept Boundary
                      </button>
                      <button
                        onClick={() => setCorrectionStatus("Manual calibration active")}
                        className="py-1 rounded bg-gray-800 text-[10px] font-medium"
                      >
                        Edit Boundary
                      </button>
                      <button
                        onClick={saveCorrection}
                        className="py-1 rounded bg-cyan-700/80 text-[10px] font-medium"
                      >
                        Save Correction
                      </button>
                      <button
                        onClick={() => setCorrectionDraft((prev: any) => ({ ...prev, notes: `${prev.notes || ""} Needs ground truth.`.trim() }))}
                        className="py-1 rounded bg-amber-800/80 text-[10px] font-medium"
                      >
                        Flag Needs Ground Truth
                      </button>
                    </div>
                    {correctionStatus && (
                      <p className="text-[10px] text-emerald-300">{correctionStatus}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candidate details are rendered by the command-center intelligence panel. */}
      {false && selectedOrchardCandidate && (
        <OrchardCandidatePanel
          candidate={selectedOrchardCandidate}
          onClose={() => setSelectedOrchardCandidate(null)}
          onSaveSuccess={(archiveId) => {
            console.log('Orchard saved to archive:', archiveId);
          }}
          onAnalysisComplete={(analysisData) => {
            console.log('Vision/3D analysis complete:', analysisData);
          }}
          onGenerate3DTwin={(candidate, analysisData) => {
            // Switch to 3D twin view
            onEnter3DTwin?.(candidate.orchard_id);
          }}
        />
      )}
    </div>
  );
});

GlobeCommandView.displayName = 'GlobeCommandView';

// Made with Bob
