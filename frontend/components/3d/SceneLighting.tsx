"use client";

import { useRef } from 'react';
import { DirectionalLight } from 'three';
import { useHelper } from '@react-three/drei';
import { DirectionalLightHelper } from 'three';

interface SceneLightingProps {
  intensity?: number;
  shadowsEnabled?: boolean;
  timeOfDay?: 'morning' | 'noon' | 'evening';
  showHelpers?: boolean;
}

export default function SceneLighting({
  intensity = 1,
  shadowsEnabled = true,
  timeOfDay = 'noon',
  showHelpers = false,
}: SceneLightingProps) {
  const directionalLightRef = useRef<DirectionalLight>(null);

  // Show light helper in development
  // Note: useHelper is disabled to avoid TypeScript issues with conditional refs
  // useHelper(showHelpers ? directionalLightRef : null, DirectionalLightHelper, 1);

  // Time of day configurations
  const timeConfigs = {
    morning: {
      sunPosition: [10, 15, 10] as [number, number, number],
      sunIntensity: 0.8,
      ambientIntensity: 0.3,
      skyColor: '#87CEEB',
      groundColor: '#8B7355',
    },
    noon: {
      sunPosition: [0, 20, 5] as [number, number, number],
      sunIntensity: 1.2,
      ambientIntensity: 0.4,
      skyColor: '#87CEEB',
      groundColor: '#654321',
    },
    evening: {
      sunPosition: [-10, 10, 10] as [number, number, number],
      sunIntensity: 0.6,
      ambientIntensity: 0.25,
      skyColor: '#FF6B35',
      groundColor: '#4A3728',
    },
  };

  const config = timeConfigs[timeOfDay];

  return (
    <>
      {/* Ambient Light - Base illumination */}
      <ambientLight intensity={config.ambientIntensity * intensity} />

      {/* Hemisphere Light - Sky and ground colors */}
      <hemisphereLight
        args={[config.skyColor, config.groundColor, 0.5 * intensity]}
        position={[0, 50, 0]}
      />

      {/* Directional Light - Sun simulation */}
      <directionalLight
        ref={directionalLightRef}
        position={config.sunPosition}
        intensity={config.sunIntensity * intensity}
        castShadow={shadowsEnabled}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
      />

      {/* Fill Light - Soften shadows */}
      <directionalLight
        position={[-5, 10, -5]}
        intensity={0.3 * intensity}
        castShadow={false}
      />
    </>
  );
}

// Made with Bob
