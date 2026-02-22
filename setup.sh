#!/bin/bash

# Personal Website Setup Script
# This script sets up the development environment for the personal website

set -e

echo "================================================"
echo "  Personal Website - Development Setup"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check for required tools
check_requirements() {
    echo ""
    echo "Checking requirements..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_status "Docker found"

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_status "Docker Compose found"
}

# Setup environment files
setup_env() {
    echo ""
    echo "Setting up environment files..."

    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_status "Created backend/.env from .env.example"
    else
        print_warning "backend/.env already exists, skipping"
    fi

    # Frontend .env.local
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.local << EOF
# Django Backend URL
DJANGO_API_URL=http://localhost:8000

# MAPBOX_ACCESS_TOKEN is set via Dokploy environment variables
EOF
        print_status "Created frontend/.env.local"
    else
        print_warning "frontend/.env.local already exists, skipping"
    fi
}

# Start with Docker Compose
start_docker() {
    echo ""
    echo "Starting services with Docker Compose..."

    # Build and start containers
    docker compose up -d --build

    print_status "Docker containers started"

    # Wait for database to be ready
    echo "Waiting for database to be ready..."
    sleep 5

    # Run migrations
    echo "Running database migrations..."
    docker compose exec backend python manage.py migrate
    print_status "Migrations completed"

    # Create admin user
    echo "Creating admin user..."
    docker compose exec backend python manage.py create_admin
    print_status "Admin user created (admin@example.com / admin)"

    # Seed data
    echo "Seeding database with sample data..."
    docker compose exec backend python manage.py seed_data
    print_status "Sample data seeded"
}

# Start without Docker (local development)
start_local() {
    echo ""
    echo "Starting local development environment..."

    # Check for Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed."
        exit 1
    fi

    # Check for Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed."
        exit 1
    fi

    # Check for PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL CLI not found. Make sure PostgreSQL is running."
    fi

    # Setup backend
    echo "Setting up backend..."
    cd backend

    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_status "Created Python virtual environment"
    fi

    source venv/bin/activate
    pip install -r requirements.txt
    print_status "Installed Python dependencies"

    # Update .env for local PostgreSQL
    if [ -f ".env" ]; then
        sed -i '' 's/POSTGRES_HOST=db/POSTGRES_HOST=localhost/' .env 2>/dev/null || true
    fi

    python manage.py migrate
    python manage.py create_admin
    python manage.py seed_data
    print_status "Database setup complete"

    cd ..

    # Setup frontend
    echo "Setting up frontend..."
    cd frontend
    npm install
    print_status "Installed Node.js dependencies"
    cd ..

    echo ""
    print_status "Local setup complete!"
    echo ""
    echo "To start the servers:"
    echo "  Backend:  cd backend && source venv/bin/activate && python manage.py runserver"
    echo "  Frontend: cd frontend && npm run dev"
}

# Print final instructions
print_instructions() {
    echo ""
    echo "================================================"
    echo "  Setup Complete!"
    echo "================================================"
    echo ""
    echo "Services are running at:"
    echo "  Frontend:     http://localhost:3000"
    echo "  Backend API:  http://localhost:8000"
    echo "  API Docs:     http://localhost:8000/api/docs/"
    echo "  Django Admin: http://localhost:8000/admin/"
    echo ""
    echo "Admin credentials:"
    echo "  Email:    admin@example.com"
    echo "  Password: admin"
    echo ""
    echo "Useful commands:"
    echo "  docker compose logs -f        # View logs"
    echo "  docker compose down            # Stop services"
    echo "  docker compose restart         # Restart services"
    echo ""
    echo "API Endpoints:"
    echo "  GET  /api/auth/login/          # Login"
    echo "  GET  /api/auth/mapbox-token/   # Get Mapbox token"
    echo "  GET  /api/projects/            # List projects"
    echo "  GET  /api/research/            # List research articles"
    echo "  GET  /api/research/visualizations/  # List visualizations"
    echo ""
}

# Main execution
main() {
    check_requirements
    setup_env

    # Check for --local flag
    if [ "$1" == "--local" ]; then
        start_local
    else
        start_docker
        print_instructions
    fi
}

main "$@"
