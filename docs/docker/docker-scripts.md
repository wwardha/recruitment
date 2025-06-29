# Docker Commands for HR Recruitment System

## 🚀 Quick Start Commands

### Development Mode

```bash
# Build and start development environment
docker-compose up --build -d

# View logs
docker-compose logs -f hr-recruitment

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build -d --force-recreate
```

### Production Mode

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f hr-recruitment

# Stop production services
docker-compose -f docker-compose.prod.yml down
```

## 🛠️ Database Operations

```bash
# Run migrations inside container
docker-compose exec hr-recruitment bun run db:migrate

# Seed database
docker-compose exec hr-recruitment bun run db:seed

# Access SQLite database
docker-compose exec hr-recruitment sqlite3 hr_recruitment.db

# Backup database
docker cp hr-recruitment-app:/app/hr_recruitment.db ./backup-$(date +%Y%m%d).db
```

## 🔍 Monitoring & Debugging

```bash
# Check service status
docker-compose ps

# View application logs
docker-compose logs -f hr-recruitment

# View Redis logs
docker-compose logs -f redis

# Access application shell
docker-compose exec hr-recruitment sh

# Monitor resource usage
docker stats hr-recruitment-app

# Health check
curl http://localhost:3000/health
```

## 🧹 Cleanup Commands

```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all

# Clean up unused Docker resources
docker system prune -a
```

## 📊 Useful Docker Commands

```bash
# List all containers
docker ps -a

# List all images
docker images

# View container logs
docker logs hr-recruitment-app

# Execute command in running container
docker exec -it hr-recruitment-app bun run test

# Copy files from container
docker cp hr-recruitment-app:/app/uploads ./local-uploads

# View container resource usage
docker stats --no-stream
```

## 🔧 Environment Setup

Create a `.env.docker` file for Docker-specific environment variables:

```bash
# Copy template
cp .env.example .env.docker

# Edit Docker-specific values
JWT_SECRET=your-production-jwt-secret-here
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM=noreply@yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

## 🚀 Production Deployment

```bash
# Set production environment variables
export JWT_SECRET="your-secure-jwt-secret"
export SENDGRID_API_KEY="your-sendgrid-key"
export EMAIL_FROM="noreply@yourdomain.com"
export CORS_ORIGIN="https://yourdomain.com"

# Deploy production stack
docker-compose -f docker-compose.prod.yml up -d --build

# Verify deployment
curl https://yourdomain.com/health
```