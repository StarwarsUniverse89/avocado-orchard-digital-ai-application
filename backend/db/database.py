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

"""Database connection and session management."""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

# Read DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Create base class for models
Base = declarative_base()

# Global engine and session maker
engine = None
SessionLocal = None

def init_db():
    """Initialize database connection and create tables."""
    global engine, SessionLocal
    
    if not DATABASE_URL:
        print("⚠️  DATABASE_URL not set. PostgreSQL persistence disabled. Using JSON fallback.")
        return False
    
    try:
        # Create engine with connection pooling
        engine = create_engine(
            DATABASE_URL,
            poolclass=NullPool,  # Disable pooling for development
            echo=False,  # Set to True for SQL query logging in development
        )
        
        # Create session maker
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Import models to register them with Base
        from backend.db import models
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ PostgreSQL database initialized successfully")
        return True
        
    except Exception as e:
        print(f"❌ Failed to initialize PostgreSQL database: {e}")
        print("⚠️  Falling back to JSON file storage")
        engine = None
        SessionLocal = None
        return False

def get_db():
    """Get database session. Use as dependency in FastAPI routes."""
    if SessionLocal is None:
        return None
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def is_db_available():
    """Check if database is available."""
    return engine is not None and SessionLocal is not None

# Made with Bob
