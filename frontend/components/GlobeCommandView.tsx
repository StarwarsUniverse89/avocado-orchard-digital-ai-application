'use client';

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  Viewer,
  Entity,
  PolygonGraphics,
  PointGraphics,
  LabelGraphics,
  CameraFlyTo,
} from 'resium';
import {
  Cartesian3,
  Color,
  Ion,
  Viewer as CesiumViewer,
  Math as CesiumMath,
  HeightReference,
  VerticalOrigin,
  HorizontalOrigin,
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
import { scanMunicipalityForOrchards } from '@/lib/api';

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
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedOrchardCandidate, setSelectedOrchardCandidate] = useState<DetectedOrchard | null>(null);
  
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

  // Set initial camera position to Michoacán, Mexico
  useEffect(() => {
    if (viewerRef.current && cesiumReady) {
      const destination = Cartesian3.fromDegrees(
        -102.0, // lng: center of Michoacán
        19.35,  // lat: center of Michoacán
        350000  // height: 350km
      );
      viewerRef.current.camera.flyTo({
        destination,
        duration: 2,
      });
    }
  }, [cesiumReady]);

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
            const destination = Cartesian3.fromDegrees(centerLng, centerLat, 150000);
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
            const destination = Cartesian3.fromDegrees(-102.0, 19.35, 350000);
            setCameraTarget({ destination, duration: 2 });
          }
          break;
        case 'enter_3d_twin':
          onEnter3DTwin?.(command.orchardId, command.sectionId);
          break;
        case 'reset_view':
          if (viewerRef.current) {
            const destination = Cartesian3.fromDegrees(-102.0, 19.35, 350000);
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
    <div className="relative h-[500px] min-h-[500px] w-full overflow-hidden rounded-xl border border-cyan-500/30 bg-black">
      {/* Status Badge */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          Globe Mode: Cesium Live
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 bg-black/80 text-white p-4 rounded-lg space-y-2 max-w-xs">
        <h3 className="font-bold text-lg">Mexico Avocado Network</h3>
        <div className="space-y-1 text-sm">
          <div>Total Municipalities: {mexicoAvocadoMunicipalities.length}</div>
          <div>Total Synthetic Orchards: {michoacanSyntheticOrchards.length}</div>
          <div>Region: Michoacán Avocado Belt</div>
          {detectedOrchards.length > 0 && (
            <div className="text-cyan-400 font-semibold">Detected Orchards: {detectedOrchards.length}</div>
          )}
        </div>
        
        {/* Debug Info */}
        <div className="pt-2 border-t border-gray-700 text-xs space-y-1">
          <div className="text-yellow-400">
            Selected Municipality: {selectedMunicipalityId || 'None'}
          </div>
          {selectedOrchardCandidate && (
            <div className="text-green-400">
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
          <div className="pt-2 border-t border-gray-700">
            <button
              onClick={handleScanMunicipality}
              disabled={scanning}
              className="w-full px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-semibold text-sm transition-colors"
            >
              {scanning ? 'Scanning...' : '🛰️ Scan Area for Orchards'}
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
            duration={cameraTarget.duration}
            once
            onComplete={() => setCameraTarget(null)}
          />
        )}

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
                setSelectedMunicipalityId(municipality.id);
                // Notify parent component
                onMunicipalitySelected?.(municipality);
                // Fly to municipality
                const destination = Cartesian3.fromDegrees(
                  municipality.lng,
                  municipality.lat,
                  15000
                );
                setCameraTarget({ destination, duration: 2 });
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

      {/* Orchard Candidate Panel */}
      {selectedOrchardCandidate && (
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
