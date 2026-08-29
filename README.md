# VideoCreator AI

AI-powered short-form video creation platform. Create viral videos with AI-generated scripts, natural voiceovers, and auto-generated captions.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- FFmpeg (for video processing)

### Setup with Docker

```bash
# Clone the repository
git clone https://github.com/n55952211-sketch/videocreator-ai.git
cd videocreator-ai

# Start all services
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# MinIO Console: http://localhost:9001 (admin/admin)
```

### Local Development

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup database
alembic upgrade head

# Start server
uvicorn main:app --reload

# In another terminal, start Celery worker
celery -A app.tasks.celery_app worker --loglevel=info
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── tasks/        # Celery background tasks
│   │   ├── integrations/ # Third-party integrations
│   │   ├── websocket/    # WebSocket connections
│   │   └── core/         # Config and database
│   ├── main.py           # FastAPI application
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js app directory
│   │   ├── components/   # React components
│   │   ├── lib/          # Utility functions
│   │   └── styles/       # CSS styles
│   └── package.json      # Node dependencies
└── docker-compose.yml    # Docker services
```

## Features

### Core Features
- 🎬 **AI Script Generation** - Generate viral video scripts automatically
- 🎤 **Natural Voiceovers** - Multiple AI voices powered by ElevenLabs
- 📝 **Auto-Captions** - Automatic subtitle generation with customization
- 🎥 **Video Export** - Export in multiple formats and resolutions
- 🔄 **Background Processing** - Asynchronous video rendering with Celery
- 💾 **Cloud Storage** - S3-compatible storage with MinIO

### Technical Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS, TypeScript
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Task Queue**: Celery with Redis
- **Storage**: MinIO (S3-compatible)
- **Video Processing**: FFmpeg
- **Real-time Updates**: WebSocket
- **Authentication**: JWT

## API Documentation

API documentation available at `http://localhost:8000/docs` (Swagger UI)

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

#### Projects
- `GET /api/projects/` - List user projects
- `POST /api/projects/` - Create new project
- `GET /api/projects/{project_id}` - Get project details
- `PUT /api/projects/{project_id}` - Update project
- `DELETE /api/projects/{project_id}` - Delete project

#### Scripts
- `GET /api/scripts/` - List scripts
- `POST /api/scripts/` - Create script
- `PUT /api/scripts/{script_id}` - Update script

#### Voiceovers
- `GET /api/voiceover/` - List voiceovers
- `POST /api/voiceover/generate` - Generate voiceover

#### Captions
- `GET /api/captions/` - List captions

#### Exports
- `GET /api/projects/{project_id}/exports` - List exports
- `POST /api/projects/{project_id}/exports` - Create export
- `GET /api/exports/{export_id}` - Get export details

#### WebSocket
- `WS /ws/{token}` - Real-time updates

## Environment Variables

### Backend (.env)

```env
ENVIRONMENT=development
DATABASE_URL=postgresql://user:password@localhost/dbname
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
S3_ENDPOINT_URL=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=videocreator
S3_REGION=us-east-1
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development Workflow

### Making Changes

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. For backend: Test with `pytest`
4. For frontend: Test with `npm test`
5. Commit: `git commit -am 'Add my feature'`
6. Push: `git push origin feature/my-feature`
7. Create Pull Request

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Add new column"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Performance Considerations

- **Video Rendering**: Uses FFmpeg with multi-threading for optimal performance
- **Task Queue**: Celery with Redis for asynchronous processing
- **Caching**: Redis caching layer for frequent queries
- **Storage**: S3-compatible MinIO for scalable file storage
- **Frontend**: Next.js static generation and incremental static regeneration

## Troubleshooting

### Docker Issues

```bash
# View logs
docker-compose logs backend
docker-compose logs celery_worker

# Restart services
docker-compose restart

# Full reset (careful!)
docker-compose down -v
docker-compose up -d
```

### Backend Issues

```bash
# Check database connection
python -c "from app.core.database import engine; engine.connect()"

# Check Redis connection
redis-cli ping

# View Celery tasks
celery -A app.tasks.celery_app inspect active
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Update documentation
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/n55952211-sketch/videocreator-ai/issues
- Discord: [Community Link]
- Email: support@videocreator-ai.com

## Roadmap

- [ ] Advanced script customization templates
- [ ] Multi-language support
- [ ] Custom background music library
- [ ] Real-time video preview
- [ ] Batch video processing
- [ ] Analytics dashboard
- [ ] API rate limiting and quotas
- [ ] Mobile app (React Native)
- [ ] Webhook support for integrations
- [ ] Video monetization features
