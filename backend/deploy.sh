#!/bin/bash
# Agent Builder Backend - Google Cloud Run Deployment Script
# This script deploys the backend to Google Cloud Run with Neon PostgreSQL

set -e

# Configuration
PROJECT_ID="${GOOGLE_CLOUD_PROJECT_ID:-agent-builder-platform}"
REGION="${REGION:-australia-southeast1}"
SERVICE_NAME="agent-builder-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       AGENT BUILDER - CLOUD RUN DEPLOYMENT                   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Install from: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites met${NC}"

# Check if logged in
echo -e "${YELLOW}Checking Google Cloud authentication...${NC}"
if ! gcloud auth print-access-token &> /dev/null; then
    echo -e "${YELLOW}Please log in to Google Cloud:${NC}"
    gcloud auth login
fi
echo -e "${GREEN}✓ Authenticated${NC}"

# Set project
echo -e "${YELLOW}Setting project to: ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com secretmanager.googleapis.com --quiet
echo -e "${GREEN}✓ APIs enabled${NC}"

# Check for environment variables
echo -e "${YELLOW}Checking environment variables...${NC}"

if [ -z "$NEON_DB_CONNECTION_STRING" ]; then
    echo -e "${RED}Warning: NEON_DB_CONNECTION_STRING is not set${NC}"
    echo "Set it with: export NEON_DB_CONNECTION_STRING='postgresql://...'"

    # Check if .env file exists
    if [ -f ".env" ]; then
        echo -e "${YELLOW}Loading from .env file...${NC}"
        export $(grep -v '^#' .env | xargs)
    fi
fi

if [ -z "$OPENROUTER_API_KEY" ]; then
    echo -e "${YELLOW}Warning: OPENROUTER_API_KEY is not set (AI features will be limited)${NC}"
fi

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t ${IMAGE_NAME}:latest .

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Docker build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker image built${NC}"

# Configure Docker for GCR
echo -e "${YELLOW}Configuring Docker for Google Container Registry...${NC}"
gcloud auth configure-docker --quiet
echo -e "${GREEN}✓ Docker configured${NC}"

# Push to Container Registry
echo -e "${YELLOW}Pushing image to Container Registry...${NC}"
docker push ${IMAGE_NAME}:latest

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to push image${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Image pushed to GCR${NC}"

# Create secrets in Secret Manager (if not exists)
echo -e "${YELLOW}Setting up secrets...${NC}"

if [ -n "$NEON_DB_CONNECTION_STRING" ]; then
    echo "$NEON_DB_CONNECTION_STRING" | gcloud secrets create neon-db-connection --data-file=- 2>/dev/null || \
    echo "$NEON_DB_CONNECTION_STRING" | gcloud secrets versions add neon-db-connection --data-file=-
    echo -e "${GREEN}✓ Database secret configured${NC}"
fi

if [ -n "$OPENROUTER_API_KEY" ]; then
    echo "$OPENROUTER_API_KEY" | gcloud secrets create openrouter-api-key --data-file=- 2>/dev/null || \
    echo "$OPENROUTER_API_KEY" | gcloud secrets versions add openrouter-api-key --data-file=-
    echo -e "${GREEN}✓ OpenRouter API key configured${NC}"
fi

if [ -n "$JWT_SECRET" ]; then
    echo "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=- 2>/dev/null || \
    echo "$JWT_SECRET" | gcloud secrets versions add jwt-secret --data-file=-
    echo -e "${GREEN}✓ JWT secret configured${NC}"
fi

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"

gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME}:latest \
    --region ${REGION} \
    --platform managed \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 3600 \
    --concurrency 80 \
    --port 8080 \
    --set-env-vars "NODE_ENV=production,REGION=${REGION}" \
    --set-secrets "NEON_DB_CONNECTION_STRING=neon-db-connection:latest" \
    --set-secrets "OPENROUTER_API_KEY=openrouter-api-key:latest" \
    --set-secrets "JWT_SECRET=jwt-secret:latest"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Deployment failed${NC}"
    echo -e "${YELLOW}Trying deployment without secrets...${NC}"

    gcloud run deploy ${SERVICE_NAME} \
        --image ${IMAGE_NAME}:latest \
        --region ${REGION} \
        --platform managed \
        --allow-unauthenticated \
        --memory 512Mi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --timeout 3600 \
        --port 8080 \
        --set-env-vars "NODE_ENV=production,REGION=${REGION},NEON_DB_CONNECTION_STRING=${NEON_DB_CONNECTION_STRING:-},OPENROUTER_API_KEY=${OPENROUTER_API_KEY:-},JWT_SECRET=${JWT_SECRET:-agent-builder-secret-2024}"
fi

echo -e "${GREEN}✓ Deployment complete!${NC}"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    DEPLOYMENT SUCCESSFUL!                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Service URL:${NC} ${SERVICE_URL}"
echo ""
echo -e "${YELLOW}Initialize the database:${NC}"
echo "  curl -X POST ${SERVICE_URL}/api/db/init"
echo ""
echo -e "${YELLOW}Test the health endpoint:${NC}"
echo "  curl ${SERVICE_URL}/health"
echo ""
echo -e "${YELLOW}Update your frontend .env:${NC}"
echo "  VITE_API_BASE=${SERVICE_URL}"
echo ""
