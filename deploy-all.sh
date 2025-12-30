#!/bin/bash
set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT_ID:-agent-builder-platform}"
REGION="${REGION:-australia-southeast1}"

echo "================================================"
echo "  AGENT BUILDER - FULL DEPLOYMENT"
echo "================================================"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Deploy Backend
echo "Deploying Backend API..."
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/agent-builder-backend --project $PROJECT_ID
gcloud run deploy agent-builder-backend \
  --image gcr.io/$PROJECT_ID/agent-builder-backend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars "NODE_ENV=production,REGION=$REGION" \
  --project $PROJECT_ID

BACKEND_URL=$(gcloud run services describe agent-builder-backend --region $REGION --project $PROJECT_ID --format 'value(status.url)')
echo "Backend deployed: $BACKEND_URL"
cd ..

# Deploy Frontend
echo ""
echo "Deploying Frontend..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/agent-builder-frontend --project $PROJECT_ID
gcloud run deploy agent-builder-frontend \
  --image gcr.io/$PROJECT_ID/agent-builder-frontend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars "VITE_API_BASE=$BACKEND_URL" \
  --project $PROJECT_ID

FRONTEND_URL=$(gcloud run services describe agent-builder-frontend --region $REGION --project $PROJECT_ID --format 'value(status.url)')
echo "Frontend deployed: $FRONTEND_URL"

# Deploy Code Server
echo ""
echo "Deploying VS Code Server..."
cd code-server
gcloud builds submit --tag gcr.io/$PROJECT_ID/code-server --project $PROJECT_ID
gcloud run deploy code-server \
  --image gcr.io/$PROJECT_ID/code-server \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --concurrency 1 \
  --project $PROJECT_ID

CODE_SERVER_URL=$(gcloud run services describe code-server --region $REGION --project $PROJECT_ID --format 'value(status.url)')
echo "Code Server deployed: $CODE_SERVER_URL"
cd ..

echo ""
echo "================================================"
echo "  DEPLOYMENT COMPLETE"
echo "================================================"
echo ""
echo "Service URLs:"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"
echo "   VS Code:  $CODE_SERVER_URL"
echo ""
echo "Next Steps - Custom Domain Setup:"
echo ""
echo "1. Map domain to frontend:"
echo "   gcloud run domain-mappings create --service agent-builder-frontend --domain agent-builder.verridian.ai --region $REGION"
echo ""
echo "2. Add these DNS records at your registrar:"
echo "   (Records will be shown after running the domain-mapping command)"
echo ""
