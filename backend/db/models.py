# Copyright 2026 F Melgoza
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""SQLAlchemy models for PostgreSQL persistence."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.db.database import Base


class OrchardArchive(Base):
    """Archived orchard parcel detected from satellite imagery."""
    
    __tablename__ = "orchard_archive"
    
    id = Column(Integer, primary_key=True, index=True)
    archive_id = Column(String(100), unique=True, index=True, nullable=False)
    orchard_id = Column(String(100), index=True, nullable=False)
    municipality_id = Column(String(50), index=True, nullable=False)
    name = Column(String(200))
    
    # Location
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    boundary_coordinates = Column(JSON, nullable=False)  # Array of [lat, lng] pairs
    
    # Metrics
    estimated_hectares = Column(Float)
    estimated_acres = Column(Float)
    estimated_tree_count = Column(Integer)
    ndvi_average = Column(Float)
    stress_level = Column(String(20))  # low, medium, high
    confidence = Column(Float)
    
    # Detection metadata
    detection_method = Column(String(50))  # ndvi, ml_model, manual
    imagery_source = Column(String(100))  # sentinel-2, landsat-8, etc.
    scan_source = Column(String(50))  # municipality_scan, manual_upload
    source_image_id = Column(String(200), nullable=True)
    
    # Pattern analysis
    row_pattern_detected = Column(String(20), nullable=True)  # yes, no, partial
    row_spacing_m = Column(Float, nullable=True)
    crown_density = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    vision_analyses = relationship("VisionAnalysisResult", back_populates="orchard", cascade="all, delete-orphan")
    network_memberships = relationship("OrchardNetworkMember", back_populates="orchard", cascade="all, delete-orphan")


class OrchardNetwork(Base):
    """Company or grower orchard network/portfolio."""
    
    __tablename__ = "orchard_network"
    
    id = Column(Integer, primary_key=True, index=True)
    network_id = Column(String(100), unique=True, index=True, nullable=False)
    company_name = Column(String(200), nullable=False)
    network_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    members = relationship("OrchardNetworkMember", back_populates="network", cascade="all, delete-orphan")


class OrchardNetworkMember(Base):
    """Membership linking archived orchards to networks."""
    
    __tablename__ = "orchard_network_member"
    
    id = Column(Integer, primary_key=True, index=True)
    network_id = Column(String(100), ForeignKey("orchard_network.network_id"), nullable=False, index=True)
    archive_id = Column(String(100), ForeignKey("orchard_archive.archive_id"), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    network = relationship("OrchardNetwork", back_populates="members")
    orchard = relationship("OrchardArchive", back_populates="network_memberships")


class VisionAnalysisResult(Base):
    """Vision/3D analysis results for archived orchards."""
    
    __tablename__ = "vision_analysis_result"
    
    id = Column(Integer, primary_key=True, index=True)
    archive_id = Column(String(100), ForeignKey("orchard_archive.archive_id"), nullable=False, index=True)
    orchard_id = Column(String(100), nullable=False)
    
    # 3D metrics
    canopy_volume = Column(Float)
    estimated_fruit_count = Column(Integer)
    average_fruit_size_cm = Column(Float)
    trunk_diameter_cm = Column(Float)
    branch_density = Column(Float)
    tree_height_m = Column(Float)
    
    # Health assessment
    health_status = Column(String(20))  # healthy, stressed, diseased
    confidence = Column(Float)
    
    # 3D visualization parameters
    visual_3d_parameters = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    orchard = relationship("OrchardArchive", back_populates="vision_analyses")

# Made with Bob
