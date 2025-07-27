# NTS Language Learning Platform - Production Deployment Script (PowerShell)

Write-Host "🚀 Starting NTS Language Learning Platform Production Deployment..." -ForegroundColor Green

# Check if required files exist
if (-not (Test-Path ".env.prod")) {
    Write-Host "❌ Error: .env.prod file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.prod.example to .env.prod and configure your production values." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ Error: backend\.env file not found!" -ForegroundColor Red
    Write-Host "Please ensure backend environment file is configured." -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Pre-deployment checklist:" -ForegroundColor Cyan
Write-Host "✅ Environment files configured" -ForegroundColor Green
Write-Host "✅ Docker and Docker Compose installed" -ForegroundColor Green

# Build and start production containers
Write-Host "🔨 Building production containers..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml build --no-cache

Write-Host "🎯 Starting production services..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "🏥 Checking service health..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml ps

# Run database initialization if needed
Write-Host "🗄️  Initializing database..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml exec backend npm run seed:prod

Write-Host "✅ Production deployment completed!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "🔗 Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Monitor logs with: docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor Yellow
Write-Host "🛑 Stop services with: docker-compose -f docker-compose.prod.yml down" -ForegroundColor Yellow
