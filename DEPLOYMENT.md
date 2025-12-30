# Agent Builder - Production Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    agent-builder.verridian.ai                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Frontend   │  │   Backend    │  │   VS Code Server     │  │
│  │  (React/Vite)│  │  (Express)   │  │   (code-server)      │  │
│  │  Cloud Run   │  │  Cloud Run   │  │   Cloud Run          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         │                │                     │                │
│         └────────────────┼─────────────────────┘                │
│                          │                                      │
│                  ┌───────┴───────┐                              │
│                  │  Neon PostgreSQL │                           │
│                  │  (Database)      │                           │
│                  └──────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed and configured
3. **Neon Database** account with connection string
4. **OpenRouter API Key** for AI features
5. **Domain** verridian.ai with DNS access

## Required Environment Variables

### Backend (.env)
```bash
# REQUIRED
JWT_SECRET=your-strong-random-secret-minimum-32-chars
NEON_DB_CONNECTION_STRING=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
ALLOWED_ORIGINS=https://agent-builder.verridian.ai,https://agent-builder-frontend-xxx.run.app

# OPTIONAL
OPENROUTER_API_KEY=sk-or-v1-xxx
GOOGLE_CLOUD_PROJECT_ID=your-project-id
CLOUD_STORAGE_BUCKET=agent-builder-ide-files
GITHUB_TOKEN=ghp_xxx
NODE_ENV=production
REGION=australia-southeast1
```

### Frontend (.env)
```bash
VITE_API_BASE=https://agent-builder-backend-xxx.run.app
VITE_WS_URL=wss://agent-builder-backend-xxx.run.app
VITE_ENABLE_AI=true
VITE_ENABLE_GITHUB=true
VITE_ENABLE_CLOUD_IDE=true
```

## Deployment Steps

### Step 1: Set GCP Project
```bash
export GOOGLE_CLOUD_PROJECT_ID=your-project-id
export REGION=australia-southeast1

gcloud config set project $GOOGLE_CLOUD_PROJECT_ID
gcloud config set run/region $REGION
```

### Step 2: Enable Required APIs
```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com
```

### Step 3: Create Secrets (Recommended)
```bash
# Store secrets in Secret Manager
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "your-neon-connection-string" | gcloud secrets create neon-db-connection --data-file=-
echo -n "your-openrouter-key" | gcloud secrets create openrouter-api-key --data-file=-
```

### Step 4: Deploy Backend
```bash
cd backend

gcloud run deploy agent-builder-backend \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars "NODE_ENV=production,REGION=$REGION" \
  --set-secrets "JWT_SECRET=jwt-secret:latest,NEON_DB_CONNECTION_STRING=neon-db-connection:latest,OPENROUTER_API_KEY=openrouter-api-key:latest"

# Get the backend URL
BACKEND_URL=$(gcloud run services describe agent-builder-backend --region $REGION --format 'value(status.url)')
echo "Backend URL: $BACKEND_URL"
```

### Step 5: Initialize Database
```bash
curl -X POST $BACKEND_URL/api/db/init
```

### Step 6: Deploy Frontend
```bash
cd ../

# Update .env with backend URL
echo "VITE_API_BASE=$BACKEND_URL" > .env.production

gcloud run deploy agent-builder-frontend \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1

FRONTEND_URL=$(gcloud run services describe agent-builder-frontend --region $REGION --format 'value(status.url)')
echo "Frontend URL: $FRONTEND_URL"
```

### Step 7: Deploy VS Code Server
```bash
cd code-server

gcloud run deploy code-server \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --concurrency 1

CODE_SERVER_URL=$(gcloud run services describe code-server --region $REGION --format 'value(status.url)')
echo "VS Code Server URL: $CODE_SERVER_URL"
```

### Step 8: Update CORS Origins
```bash
# Update backend with correct origins
gcloud run services update agent-builder-backend \
  --region $REGION \
  --set-env-vars "ALLOWED_ORIGINS=$FRONTEND_URL,https://agent-builder.verridian.ai"
```

## Custom Domain Setup (agent-builder.verridian.ai)

### Step 1: Verify Domain Ownership
```bash
gcloud domains verify verridian.ai
```

### Step 2: Create Domain Mapping
```bash
gcloud run domain-mappings create \
  --service agent-builder-frontend \
  --domain agent-builder.verridian.ai \
  --region $REGION
```

### Step 3: Get DNS Records
```bash
gcloud run domain-mappings describe \
  --domain agent-builder.verridian.ai \
  --region $REGION
```

This will output something like:
```
resourceRecords:
- name: agent-builder
  rrdata: ghs.googlehosted.com.
  type: CNAME
```

### Step 4: Configure DNS at Your Registrar

Add these DNS records for `verridian.ai`:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | agent-builder | ghs.googlehosted.com. | 300 |

**OR** if using apex domain, add A records:
| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 216.239.32.21 | 300 |
| A | @ | 216.239.34.21 | 300 |
| A | @ | 216.239.36.21 | 300 |
| A | @ | 216.239.38.21 | 300 |

### Step 5: Wait for SSL Certificate
Google automatically provisions an SSL certificate. This takes 15-30 minutes.

Check status:
```bash
gcloud run domain-mappings describe \
  --domain agent-builder.verridian.ai \
  --region $REGION \
  --format 'value(status.conditions)'
```

## Verification

### Test Endpoints
```bash
# Health check
curl https://agent-builder.verridian.ai/health

# Backend health
curl $BACKEND_URL/health

# VS Code Server
open $CODE_SERVER_URL
```

## Troubleshooting

### Domain Mapping Stuck
- Ensure DNS records are correct
- Wait up to 24 hours for propagation
- Check: `dig agent-builder.verridian.ai`

### SSL Certificate Not Provisioning
- Verify domain ownership
- Check DNS records point to Google
- Ensure no Cloudflare proxy (orange cloud) is enabled

### CORS Errors
- Update `ALLOWED_ORIGINS` in backend
- Redeploy backend service

## Service URLs (After Deployment)

| Service | URL |
|---------|-----|
| Frontend | https://agent-builder.verridian.ai |
| Backend API | https://agent-builder-backend-xxx.run.app |
| VS Code Server | https://code-server-xxx.run.app |

---

## Quick Deploy Script

```bash
./deploy-all.sh
```

This script deploys all services and outputs the URLs.
