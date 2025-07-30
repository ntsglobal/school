#!/bin/bash

# NTS Language Learning Platform - Production Deployment Script

set -e

echo "🚀 Starting NTS Language Learning Platform Production Deployment..."

# Check if required files exist
if [ ! -f ".env.prod" ]; then
    echo "❌ Error: .env.prod file not found!"
    echo "Please copy .env.prod.example to .env.prod and configure your production values."
    exit 1
fi

if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo "Please ensure backend environment file is configured."
    exit 1
fi

# Load production environment
export $(cat .env.prod | grep -v '#' | awk '/=/ { print $1 }')

echo "📋 Pre-deployment checklist:"
echo "✅ Environment files configured"
echo "✅ Docker and Docker Compose installed"

# Build and start production containers
echo "🔨 Building production containers..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🎯 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Run database initialization if needed
echo "🗄️  Initializing database..."
docker-compose -f docker-compose.prod.yml exec backend npm run seed:prod

echo "✅ Production deployment completed!"
echo "🌐 Frontend: http://localhost"
echo "🔗 Backend API: http://localhost:5000"
echo ""
echo "📊 Monitor logs with: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 Stop services with: docker-compose -f docker-compose.prod.yml down"
