"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { orchardSections, OrchardSection, getSatelliteData, SatelliteData } from "@/lib/mockData";

interface SatelliteOrchardViewProps {
  onSectionSelect: (sectionId: string) => void;
}

export default function SatelliteOrchardView({ onSectionSelect }: SatelliteOrchardViewProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [showNDVI, setShowNDVI] = useState(true);
  const [showStressZones, setShowStressZones] = useState(true);
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(null);

  useEffect(() => {
    // Load satellite data
    const data = getSatelliteData("orchard_A");
    setSatelliteData(data);
  }, []);

  const handleSectionClick = (section: OrchardSection) => {
    setSelectedSection(section.id);
    onSectionSelect(section.id);
  };

  // Get color based on NDVI value (0-1 scale)
  const getNDVIColor = (ndvi: number, opacity: number = 0.4) => {
    if (ndvi >= 0.75) return `rgba(0, 255, 136, ${opacity})`; // Healthy green
    if (ndvi >= 0.65) return `rgba(170, 255, 0, ${opacity})`; // Light green
    if (ndvi >= 0.55) return `rgba(255, 200, 0, ${opacity})`; // Yellow
    if (ndvi >= 0.45) return `rgba(255, 140, 0, ${opacity})`; // Orange
    return `rgba(255, 68, 68, ${opacity})`; // Red
  };

  // Get color based on stress level (0-100 scale)
  const getStressColor = (stressLevel: number, opacity: number = 0.5) => {
    if (stressLevel < 20) return `rgba(0, 255, 136, ${opacity})`; // Low stress
    if (stressLevel < 40) return `rgba(255, 200, 0, ${opacity})`; // Moderate stress
    if (stressLevel < 60) return `rgba(255, 140, 0, ${opacity})`; // High stress
    return `rgba(255, 68, 68, ${opacity})`; // Critical stress
  };

  const getSectionColor = (section: OrchardSection) => {
    if (showNDVI && showStressZones) {
      // Blend NDVI and stress visualization
      return getStressColor(section.stress_level, 0.4);
    } else if (showNDVI) {
      return getNDVIColor(section.ndvi, 0.4);
    } else if (showStressZones) {
      return getStressColor(section.stress_level, 0.5);
    }
    // Fallback to health status
    switch (section.health_status) {
      case "healthy":
        return "rgba(0, 255, 136, 0.3)";
      case "warning":
        return "rgba(255, 170, 0, 0.3)";
      case "risk":
        return "rgba(255, 68, 68, 0.3)";
      default:
        return "rgba(0, 212, 255, 0.3)";
    }
  };

  const getSectionBorderColor = (section: OrchardSection) => {
    if (showNDVI) {
      return section.ndvi >= 0.75 ? "#00ff88" : section.ndvi >= 0.65 ? "#aaff00" : section.ndvi >= 0.55 ? "#ffc800" : "#ff8c00";
    }
    switch (section.health_status) {
      case "healthy":
        return "#00ff88";
      case "warning":
        return "#ffaa00";
      case "risk":
        return "#ff4444";
      default:
        return "#00d4ff";
    }
  };

  return (
    <div className="glass-elevated rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-1">
            Satellite Orchard View
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select a section to view digital twin • NDVI Avg: {satelliteData?.ndvi_average.toFixed(2) || "N/A"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Overlay Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNDVI(!showNDVI)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showNDVI
                  ? "bg-primary text-gray-950"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
              }`}
            >
              NDVI
            </button>
            <button
              onClick={() => setShowStressZones(!showStressZones)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showStressZones
                  ? "bg-warning text-gray-950"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
              }`}
            >
              Stress
            </button>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-2 text-xs border-l border-gray-700 pl-3">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-gray-600 dark:text-gray-400">Healthy</span>
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-gray-600 dark:text-gray-400">Warning</span>
            <div className="w-3 h-3 rounded-full bg-error"></div>
            <span className="text-gray-600 dark:text-gray-400">Risk</span>
          </div>
        </div>
      </div>

      {/* Satellite View Container */}
      <div className="relative bg-gray-900 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-700 dark:border-gray-800">
        {/* Background Image */}
        <div className="relative w-full" style={{ paddingBottom: "60%" }}>
          <Image
            src="/assets/ui/avocado_orchard_aerialview.webp"
            alt="Orchard Aerial View"
            fill
            className="object-cover opacity-70"
            priority
          />

          {/* SVG Overlay for Sections */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {orchardSections.map((section) => {
              const isSelected = selectedSection === section.id;
              const isHovered = hoveredSection === section.id;
              const fillColor = getSectionColor(section);
              const borderColor = getSectionBorderColor(section);

              return (
                <g key={section.id}>
                  {/* Section Rectangle */}
                  <rect
                    x={section.bounds.x}
                    y={section.bounds.y}
                    width={section.bounds.width}
                    height={section.bounds.height}
                    fill={fillColor}
                    stroke={borderColor}
                    strokeWidth={isSelected ? "1" : isHovered ? "0.8" : "0.5"}
                    className="cursor-pointer transition-all duration-300"
                    style={{
                      opacity: isSelected ? 0.8 : isHovered ? 0.6 : 0.4,
                    }}
                    onMouseEnter={() => setHoveredSection(section.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                    onClick={() => handleSectionClick(section)}
                  />

                  {/* Section Label */}
                  {(isHovered || isSelected) && (
                    <>
                      <text
                        x={section.bounds.x + section.bounds.width / 2}
                        y={section.bounds.y + section.bounds.height / 2 - 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs font-bold fill-white pointer-events-none"
                        style={{ fontSize: "4px" }}
                      >
                        {section.name}
                      </text>
                      <text
                        x={section.bounds.x + section.bounds.width / 2}
                        y={section.bounds.y + section.bounds.height / 2 + 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs fill-white pointer-events-none"
                        style={{ fontSize: "3px" }}
                      >
                        NDVI: {section.ndvi.toFixed(2)}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Section Info Overlay */}
        {selectedSection && (
          <div className="absolute bottom-4 left-4 right-4 glass rounded-lg p-4">
            {orchardSections
              .filter((s) => s.id === selectedSection)
              .map((section) => (
                <div key={section.id}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-50 mb-1">
                        {section.name}
                      </h3>
                      <p className="text-xs text-gray-300">
                        {section.tree_count} trees • Status:{" "}
                        <span
                          className={
                            section.health_status === "healthy"
                              ? "text-success"
                              : section.health_status === "warning"
                              ? "text-warning"
                              : "text-error"
                          }
                        >
                          {section.health_status.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => onSectionSelect(section.id)}
                      className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-gray-950 text-sm font-semibold transition-colors"
                    >
                      View 3D Twin
                    </button>
                  </div>
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-3 pt-3 border-t border-gray-700">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">NDVI</p>
                      <p className="text-sm font-semibold text-gray-50">{section.ndvi.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Stress</p>
                      <p className="text-sm font-semibold text-gray-50">{section.stress_level}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Moisture</p>
                      <p className="text-sm font-semibold text-gray-50">{section.soil_moisture}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Temp</p>
                      <p className="text-sm font-semibold text-gray-50">{section.temperature.toFixed(1)}°C</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {orchardSections.map((section) => {
          const isSelected = selectedSection === section.id;
          const borderColor = getSectionBorderColor(section);

          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? "bg-gray-800/50 dark:bg-gray-800/50"
                  : "bg-gray-900/30 dark:bg-gray-900/30 hover:bg-gray-800/30 dark:hover:bg-gray-800/30"
              }`}
              style={{ borderColor: isSelected ? borderColor : "transparent" }}
            >
              <div className="text-left">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  {section.name}
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      {section.tree_count} trees
                    </span>
                    <span
                      className={
                        section.health_status === "healthy"
                          ? "text-success"
                          : section.health_status === "warning"
                          ? "text-warning"
                          : "text-error"
                      }
                    >
                      {section.health_status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      NDVI: {section.ndvi.toFixed(2)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Stress: {section.stress_level}%
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Made with Bob
