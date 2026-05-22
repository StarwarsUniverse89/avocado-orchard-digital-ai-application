from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json
import asyncio
from typing import List
import uvicorn
import sys
import os

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.routes import router as api_router
from realtime.stream import ConnectionManager
from core.config import config

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Gemini Orchard Operations OS")
    print("🥑 Backend server initializing...")
    print("🔧 Gemini / Google Cloud primary path ready")
    print("🧩 Legacy AMD/vLLM optional fallback: disabled by default")
    yield
    # Shutdown
    print("👋 Shutting down gracefully...")

# Initialize FastAPI app
app = FastAPI(
    title="Gemini Orchard Operations OS API",
    description="Gemini and Google Cloud oriented operations agent API for orchard digital twin workflows",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
manager = ConnectionManager()

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Gemini Orchard Operations OS API",
        "version": "1.0.0",
        "status": "operational",
        "primary_ai_platform": "Gemini / Google Cloud Ready",
        "legacy_optional_fallback": "AMD/vLLM support disabled by default",
        "endpoints": {
            "api": "/api/v1",
            "docs": "/docs",
            "websocket": "/ws/{client_id}",
        },
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "api": "operational",
            "websocket": "operational",
            "primary_ai_platform": "Gemini / Google Cloud Ready",
            "legacy_optional_fallback": "AMD/vLLM support disabled by default",
        },
    }

# WebSocket endpoint for real-time updates
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        # Send initial connection message
        await manager.send_personal_message(
            {
                "type": "connection",
                "message": "Connected to Gemini Orchard Operations OS",
                "client_id": client_id,
            },
            websocket,
        )

        # Start sending periodic updates
        asyncio.create_task(send_periodic_updates(websocket, client_id))

        # Keep connection alive and handle incoming messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await manager.send_personal_message(
                    {"type": "pong", "timestamp": message.get("timestamp")},
                    websocket,
                )
            elif message.get("type") == "request_update":
                await send_orchard_update(websocket, client_id)
            else:
                # Echo back for now
                await manager.send_personal_message(
                    {"type": "echo", "data": message},
                    websocket,
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client {client_id} disconnected")
    except Exception as e:
        print(f"WebSocket error for client {client_id}: {e}")
        manager.disconnect(websocket)

# Send periodic updates to connected clients
async def send_periodic_updates(websocket: WebSocket, client_id: str):
    """Send periodic orchard updates every 5 seconds"""
    try:
        while True:
            await asyncio.sleep(5)
            await send_orchard_update(websocket, client_id)
    except Exception as e:
        print(f"Error sending periodic updates to {client_id}: {e}")

# Send orchard data update
async def send_orchard_update(websocket: WebSocket, client_id: str):
    """Send current orchard metrics and AI recommendations"""
    import random
    
    update_data = {
        "type": "orchard_update",
        "timestamp": asyncio.get_event_loop().time(),
        "metrics": {
            "temperature": round(20 + random.uniform(-5, 10), 1),
            "soil_moisture": round(50 + random.uniform(-20, 30), 1),
            "tree_health": round(85 + random.uniform(-10, 10), 1),
            "yield_forecast": round(18000 + random.uniform(-2000, 3000), 0),
        },
        "alerts": [
            {
                "level": "warning" if random.random() > 0.7 else "info",
                "message": "Soil moisture below optimal in Zone B",
                "timestamp": asyncio.get_event_loop().time(),
            }
        ] if random.random() > 0.5 else [],
    }
    
    await manager.send_personal_message(update_data, websocket)

# Run the application
if __name__ == "__main__":
    # Read host and port from environment variables
    host = config.API_HOST if hasattr(config, 'API_HOST') else os.getenv("API_HOST", "0.0.0.0")
    port = config.API_PORT if hasattr(config, 'API_PORT') else int(os.getenv("API_PORT", "8001"))
    
    print(f"🚀 Starting backend server on {host}:{port}")
    print(f"📍 API endpoints: http://{host}:{port}/api/v1")
    print(f"📚 API docs: http://{host}:{port}/docs")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info",
    )

# Made with Bob
