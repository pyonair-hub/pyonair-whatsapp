#!/bin/bash
# ===========================================
# Pyonair WhatsApp - Initialization Script
# ===========================================
# Sets up Pyonair WhatsApp with sensible defaults
# Usage: ./scripts/pyonair-init.sh [--production]

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PRODUCTION=false
if [[ "${1:-}" == "--production" ]]; then
    PRODUCTION=true
fi

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  Pyonair WhatsApp - Setup${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed.${NC}"; exit 1; }
command -v docker compose >/dev/null 2>&1 || command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Docker Compose is required but not installed.${NC}"; exit 1; }
echo -e "${GREEN}  Docker found${NC}"

# Create .env if not exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env from Pyonair template...${NC}"
    cp .env.pyonair .env

    # Generate secure defaults
    API_KEY=$(openssl rand -hex 32)
    DB_PASS=$(openssl rand -base64 24 | tr -d '=+/')

    sed -i "s/CHANGE_ME_GENERATE_WITH_openssl_rand_hex_32/${API_KEY}/" .env
    sed -i "s/CHANGE_ME_GENERATE_STRONG_PASSWORD/${DB_PASS}/" .env

    echo -e "${GREEN}  .env created with secure random keys${NC}"
    echo -e "${GREEN}  API Key: ${API_KEY}${NC}"
    echo -e "${YELLOW}  Save this API key - you'll need it to connect instances${NC}"
else
    echo -e "${GREEN}  .env already exists, skipping${NC}"
fi

# Set production URL if provided
if [ "$PRODUCTION" = true ]; then
    echo -e "${YELLOW}Production mode: updating settings...${NC}"

    if [ -z "${PYONAIR_DOMAIN:-}" ]; then
        read -p "Enter your domain (e.g., wa.client.pyonair.com): " PYONAIR_DOMAIN
    fi

    sed -i "s|PYONAIR_WHATSAPP_URL=.*|PYONAIR_WHATSAPP_URL=https://${PYONAIR_DOMAIN}|" .env
    echo -e "${GREEN}  URL set to https://${PYONAIR_DOMAIN}${NC}"
fi

# Build and start
echo ""
echo -e "${YELLOW}Starting Pyonair WhatsApp...${NC}"

COMPOSE_CMD="docker compose"
command -v docker-compose >/dev/null 2>&1 && COMPOSE_CMD="docker-compose"

$COMPOSE_CMD -f docker-compose.pyonair.yml up -d --build

echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}  Pyonair WhatsApp is starting up!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo -e "  API:     http://localhost:8080"
echo -e "  Manager: http://localhost:3000"
echo -e "  Docs:    http://localhost:8080/docs"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Open the Manager UI at http://localhost:3000"
echo "  2. Enter your API key to connect"
echo "  3. Create an instance and scan the QR code with WhatsApp"
echo "  4. Configure webhooks to connect with Pyonair Support"
echo ""
echo -e "${BLUE}Documentation: https://pyonair.com/docs/whatsapp${NC}"
