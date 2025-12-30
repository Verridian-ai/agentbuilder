#!/bin/bash
set -e

PROJECT_ID="${GOOGLE_CLOUD_PROJECT_ID:-agent-builder-platform}"
REGION="${REGION:-australia-southeast1}"
SERVICE_NAME="code-server"

echo "🚀 Deploying VS Code Server to Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"

# Build and push container
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME --project $PROJECT_ID

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --concurrency 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production" \
  --project $PROJECT_ID

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format 'value(status.url)')
echo ""
echo "✅ Deployment complete!"
echo "📍 Service URL: $SERVICE_URL"
echo ""
echo "To map custom domain agent-builder.verridian.ai:"
echo "1. Run: gcloud run domain-mappings create --service $SERVICE_NAME --domain agent-builder.verridian.ai --region $REGION"
echo "2. Add DNS A record pointing to the IP provided"
