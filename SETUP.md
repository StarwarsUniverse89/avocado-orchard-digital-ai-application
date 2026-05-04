# 🥑 Avocado Orchard Digital AI - Setup Guide

## Quick Start

### Prerequisites
- Node.js 20+ (for frontend)
- Python 3.11+ (for backend)
- Docker & Docker Compose (optional, for containerized deployment)

---

## Local Development Setup

### 1. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Frontend will be available at http://localhost:3000
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r ../requirements.txt

# Run development server
python main.py

# Backend API will be available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

---

## Docker Deployment

### Run with Docker Compose

```bash
# From project root directory
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

### Stop services

```bash
docker-compose down
```

---

## Environment Configuration

### Frontend Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Backend Environment Variables

Create `backend/.env`:

```env
ENVIRONMENT=development
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## Project Structure

```
avocado-orchard-digital-ai-application/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js app directory
│   │   ├── page.tsx        # Main dashboard page
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles
│   ├── components/          # React components
│   │   ├── Header.tsx      # Navigation header
│   │   ├── MetricCard.tsx  # KPI metric cards
│   │   ├── AIAdvisorPanel.tsx  # AI recommendations
│   │   └── OrchardMap.tsx  # Digital twin visualization
│   └── package.json
│
├── backend/                 # FastAPI backend application
│   ├── main.py             # FastAPI app entry point
│   ├── api/
│   │   └── routes.py       # API endpoints
│   ├── services/
│   │   └── orchard_service.py  # Business logic
│   ├── realtime/
│   │   └── stream.py       # WebSocket manager
│   ├── agents/             # AI agent implementations
│   ├── simulation/         # Simulation engine
│   └── Dockerfile
│
├── ml/                      # Machine learning assets
│   ├── datasets/
│   │   └── orchards.json   # Sample orchard data
│   └── knowledge/
│       └── avocado_research_kb.json  # Research knowledge base
│
├── docs/                    # Documentation
│   └── architecture/
│
├── requirements.txt         # Python dependencies
├── docker-compose.yml       # Docker orchestration
└── README.md               # Project overview
```

---

## API Endpoints

### Orchards
- `GET /api/v1/orchards` - Get all orchards
- `GET /api/v1/orchards/{id}` - Get specific orchard
- `GET /api/v1/orchards/{id}/metrics` - Get orchard metrics

### AI Recommendations
- `GET /api/v1/ai/recommendations` - Get all recommendations
- `GET /api/v1/ai/recommendations/{orchard_id}` - Get orchard-specific recommendations

### Simulation
- `POST /api/v1/simulation/run` - Run simulation scenario
- `GET /api/v1/simulation/{id}/status` - Get simulation status

### Analytics
- `GET /api/v1/analytics/summary` - Get analytics summary

### System
- `GET /health` - Health check
- `GET /api/v1/system/status` - System status

### WebSocket
- `WS /ws/{client_id}` - Real-time data streaming

---

## Development Workflow

### Frontend Development

```bash
cd frontend

# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

### Backend Development

```bash
cd backend

# Run with auto-reload
python main.py

# Or use uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests (when implemented)
pytest

# Format code
black .

# Type checking
mypy .
```

---

## Testing the Application

### 1. Test Frontend
- Navigate to http://localhost:3000
- Verify dashboard loads with metrics
- Check orchard map visualization
- Review AI recommendations panel

### 2. Test Backend API
- Navigate to http://localhost:8000/docs
- Test API endpoints using Swagger UI
- Verify WebSocket connection at ws://localhost:8000/ws/test-client

### 3. Test Real-time Updates
- Open browser console
- Connect to WebSocket endpoint
- Observe periodic metric updates

---

## AMD GPU Integration (Production)

For AMD MI300X GPU support:

1. Uncomment ROCm dependencies in `requirements.txt`
2. Install ROCm drivers (see `infra/amd/rocm_setup.md`)
3. Configure GPU compute in backend
4. Deploy to AMD Developer Cloud

---

## Troubleshooting

### Frontend Issues

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Build errors:**
```bash
# Clear Next.js cache
rm -rf frontend/.next
npm run build
```

### Backend Issues

**Import errors:**
```bash
# Ensure you're in the backend directory
cd backend
# Reinstall dependencies
pip install -r ../requirements.txt
```

**Port already in use:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

---

## Next Steps

1. ✅ Frontend and backend are running
2. 🔄 Implement AI agent logic in `backend/agents/`
3. 🔄 Add simulation models in `backend/simulation/`
4. 🔄 Integrate AMD GPU compute
5. 🔄 Connect to real orchard data sources
6. 🔄 Deploy to production

---

## Support

For issues or questions:
- Check documentation in `/docs`
- Review architecture diagrams
- Consult AMD Developer Cloud documentation

---

**Built with ❤️ for precision agriculture and AI-driven decision making**