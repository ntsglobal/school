# Docker Deployment Guide - NTS Language Learning Platform

## 🐳 Docker Configuration Overview

This project includes comprehensive Docker configurations for both development and production environments.

### File Structure
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment
- `backend/Dockerfile` - Backend API container configuration
- `frontend/Dockerfile` - Frontend application container (multi-stage)
- `frontend/nginx.conf` - Nginx configuration for production
- `.env.prod.example` - Production environment template

## 🔧 Development Environment

### Quick Start
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services
- **Frontend**: React + Vite development server (http://localhost:5173)
- **Backend**: Node.js + Express API (http://localhost:5000)
- **MongoDB**: Database server (localhost:27017)
- **Redis**: Cache server (localhost:6379)

### Features
- ✅ Hot reload for both frontend and backend
- ✅ Volume mounts for live code changes
- ✅ Development-optimized builds
- ✅ Debug-friendly configurations

## 🚀 Production Environment

### Setup
1. Copy production environment template:
   ```bash
   cp .env.prod.example .env.prod
   ```

2. Configure production values in `.env.prod`:
   - Database credentials
   - JWT secrets
   - Domain configurations
   - SSL certificates (if applicable)

3. Ensure backend `.env` is configured

### Deployment Options

#### Option 1: Using Deployment Script (Recommended)
```bash
# Linux/macOS
chmod +x deploy-production.sh
./deploy-production.sh

# Windows PowerShell
.\deploy-production.ps1
```

#### Option 2: Manual Deployment
```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Production Services
- **Frontend**: Nginx-served React build (http://localhost:80)
- **Backend**: Node.js API with production optimizations
- **MongoDB**: Authenticated database with security
- **Redis**: Password-protected cache

### Production Features
- ✅ Multi-stage Docker builds for optimization
- ✅ Nginx reverse proxy with security headers
- ✅ Non-root user containers for security
- ✅ Health checks for all services
- ✅ Proper signal handling with dumb-init
- ✅ Gzip compression and caching
- ✅ API and Socket.IO proxying

## 🔒 Security Features

### Container Security
- Non-root user execution
- Minimal Alpine Linux base images
- Security headers in Nginx
- Proper file permissions

### Network Security
- Isolated Docker network
- Internal service communication
- Configurable CORS origins
- Rate limiting support

### Data Security
- MongoDB authentication
- Redis password protection
- JWT token validation
- Environment variable isolation

## 🛠️ Maintenance Commands

### Development
```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Execute commands in containers
docker-compose exec backend npm run seed
docker-compose exec frontend npm install

# Clean up
docker-compose down -v  # Remove volumes
docker system prune     # Clean unused resources
```

### Production
```bash
# Update production deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build

# Backup database
docker-compose -f docker-compose.prod.yml exec mongodb mongodump

# Scale services (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale backend=2
```

## 📊 Monitoring

### Health Checks
All production services include health checks:
- Backend: Custom Node.js health endpoint
- Frontend: Nginx status check
- Database: Built-in MongoDB health

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Production logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :5000
   
   # Use different ports in docker-compose.yml
   ports:
     - "5001:5000"
   ```

2. **Permission issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   chmod +x deploy-production.sh
   ```

3. **Build cache issues**
   ```bash
   # Clear build cache
   docker-compose build --no-cache
   docker system prune -a
   ```

4. **Database connection issues**
   ```bash
   # Check database logs
   docker-compose logs mongodb
   
   # Verify connection string
   docker-compose exec backend node -e "console.log(process.env.MONGODB_URI)"
   ```

## 🔄 Environment Migration

### From Development to Production
1. Export development data (if needed)
2. Configure production environment files
3. Run production deployment
4. Import data to production database
5. Verify all services are healthy

### Backup and Restore
```bash
# Backup
docker-compose exec mongodb mongodump --out /data/backup

# Restore
docker-compose exec mongodb mongorestore /data/backup
```

## 📈 Performance Optimization

### Production Optimizations
- Multi-stage builds reduce image size
- Nginx caching for static assets
- Gzip compression enabled
- Connection pooling for database
- Redis caching for sessions

### Scaling Considerations
- Use load balancer for multiple backend instances
- Implement database sharding if needed
- Consider CDN for static assets
- Monitor resource usage and scale accordingly

## 🔧 Customization

### Adding New Services
1. Add service to `docker-compose.yml`
2. Configure networking and dependencies
3. Add to production configuration
4. Update documentation

### Environment Variables
- Development: Set in `docker-compose.yml`
- Production: Use `.env.prod` file
- Backend-specific: Use `backend/.env`
- Frontend-specific: Use `VITE_` prefix

This Docker setup provides a robust foundation for both development and production deployment of the NTS Language Learning Platform.
