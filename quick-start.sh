#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Vaishnav Vivaah Quick Start ===${NC}\n"

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Setting up Django Backend...${NC}"
cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate || . venv/Scripts/activate

# Install requirements
echo "Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Copy .env.example if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Run migrations
echo "Running migrations..."
python manage.py migrate > /dev/null 2>&1

# Seed database
echo "Seeding database..."
python manage.py seed_sampradays > /dev/null 2>&1
python manage.py seed_plans > /dev/null 2>&1

echo -e "${GREEN}✓ Backend setup complete!${NC}"

cd ..

echo -e "\n${YELLOW}Setting up Next.js Frontend...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install > /dev/null 2>&1
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
    echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" >> .env.local
fi

echo -e "${GREEN}✓ Frontend setup complete!${NC}"

echo -e "\n${YELLOW}=== Setup Complete ===${NC}"
echo -e "\n${GREEN}To start the application:${NC}"
echo -e "\n${YELLOW}Terminal 1 (Backend):${NC}"
echo "  cd backend"
echo "  source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "  python manage.py runserver"
echo ""
echo -e "${YELLOW}Terminal 2 (Frontend):${NC}"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Then visit:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  Admin:    http://localhost:8000/admin"
echo ""
echo -e "${YELLOW}Test credentials:${NC}"
echo "  Phone: Any 10-digit number"
echo "  OTP: Any 6-digit number (e.g., 123456)"
echo ""
echo -e "${GREEN}Happy matching! 🎉${NC}"
