# Agent Builder Backend - Google Cloud Run Deployment Guide

## Prerequisites

1. **Google Cloud SDK** - [Install](https://cloud.google.com/sdk/docs/install)
2. **Docker** - [Install](https://docs.docker.com/get-docker/)
3. **Neon PostgreSQL Account** - [Sign up](https://neon.tech)
4. **OpenRouter API Key** (optional) - [Get key](https://openrouter.ai/keys)

## Quick Deploy

### Option 1: Using deploy.sh (Recommended)

```bash
# Set your environment variables
export GOOGLE_CLOUD_PROJECT_ID="your-project-id"
export NEON_DB_CONNECTION_STRING="postgresql://user:pass@host/db?sslmode=require"
export OPENROUTER_API_KEY="sk-or-v1-..."  # Optional
export JWT_SECRET="your-secret-key"

# Make script executable and run
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment

```bash
# 1. Login to Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com

# 3. Create secrets
echo "YOUR_NEON_CONNECTION_STRING" | gcloud secrets create neon-db-connection --data-file=-
echo "YOUR_OPENROUTER_KEY" | gcloud secrets create openrouter-api-key --data-file=-
echo "YOUR_JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-

# 4. Build and push Docker image
docker build -t gcr.io/YOUR_PROJECT/agent-builder-backend .
gcloud auth configure-docker
docker push gcr.io/YOUR_PROJECT/agent-builder-backend

# 5. Deploy to Cloud Run
gcloud run deploy agent-builder-backend \
  --image gcr.io/YOUR_PROJECT/agent-builder-backend \
  --region australia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-secrets "NEON_DB_CONNECTION_STRING=neon-db-connection:latest"
```

### Option 3: Cloud Build (CI/CD)

```bash
# Submit build from backend directory
cd backend
gcloud builds submit --config cloudbuild.yaml .
```

## Post-Deployment Setup

### Initialize Database

After deployment, initialize the database tables:

```bash
# Get your service URL
SERVICE_URL=$(gcloud run services describe agent-builder-backend \
  --region australia-southeast1 \
  --format 'value(status.url)')

# Initialize database
curl -X POST "$SERVICE_URL/api/db/init"

# Check health
curl "$SERVICE_URL/health"
```

### Update Frontend

Update your frontend `.env` file:

```env
VITE_API_BASE=https://agent-builder-backend-xxxxx.run.app
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEON_DB_CONNECTION_STRING` | Yes | Neon PostgreSQL connection string |
| `OPENROUTER_API_KEY` | No | OpenRouter API key for AI features |
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `PORT` | No | Server port (default: 8080) |
| `REGION` | No | GCP region (default: australia-southeast1) |
| `GOOGLE_CLOUD_PROJECT_ID` | No | GCP project ID for Cloud Storage |
| `CLOUD_STORAGE_BUCKET` | No | GCS bucket name |

### Neon Database Setup

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the pooled connection string
4. Use format: `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`

## API Endpoints

Once deployed, the following endpoints are available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/status` | GET | Server status |
| `/api/db/init` | POST | Initialize database |
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/sessions` | GET/POST | IDE sessions |
| `/api/files` | GET/POST/DELETE | File operations |
| `/api/terminal/execute` | POST | Terminal commands |
| `/api/ai/chat` | POST | AI chat |
| `/api/ai/models` | GET | List AI models |

## Monitoring

### View Logs

```bash
gcloud run services logs read agent-builder-backend --region australia-southeast1
```

### View Metrics

Visit: https://console.cloud.google.com/run/detail/australia-southeast1/agent-builder-backend/metrics

## Scaling Configuration

The default configuration:
- **Min instances**: 0 (scale to zero)
- **Max instances**: 10
- **Memory**: 512Mi
- **CPU**: 1
- **Concurrency**: 80 requests per instance
- **Timeout**: 3600 seconds (60 minutes)

To modify:

```bash
gcloud run services update agent-builder-backend \
  --region australia-southeast1 \
  --min-instances 1 \
  --max-instances 20 \
  --memory 1Gi
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if secret exists
gcloud secrets describe neon-db-connection

# Update secret
echo "new-connection-string" | gcloud secrets versions add neon-db-connection --data-file=-

# Redeploy to pick up new secret
gcloud run services update agent-builder-backend --region australia-southeast1
```

### Container Issues

```bash
# View container logs
gcloud run services logs read agent-builder-backend --region australia-southeast1 --limit 100

# Check service status
gcloud run services describe agent-builder-backend --region australia-southeast1
```

### Permission Issues

```bash
# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding neon-db-connection \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Cost Estimation

With default settings (scale to zero):
- **Idle**: $0 (scales to zero when not in use)
- **Active**: ~$0.024/hour per instance
- **Requests**: $0.40 per million requests
- **Network**: Standard egress rates

Use the [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator) for detailed estimates.
