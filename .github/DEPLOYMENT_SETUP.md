# Deployment Setup Guide

This guide explains how to configure GitHub Actions for automated deployment to Google Cloud Run.

## Required GitHub Secrets

Go to your repository's **Settings > Secrets and variables > Actions** and add these secrets:

### 1. `GOOGLE_CLOUD_PROJECT_ID`
Your Google Cloud project ID (e.g., `agent-builder-platform`)

### 2. `GOOGLE_CLOUD_SA_KEY`
Service account key JSON for deployment. Create it with:

```bash
# Create service account
gcloud iam service-accounts create github-deployer \
  --display-name="GitHub Actions Deployer"

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Create and download key
gcloud iam service-accounts keys create ~/github-deployer-key.json \
  --iam-account=github-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Copy the contents of ~/github-deployer-key.json to the secret
```

## Required Google Cloud Secrets

The backend expects these secrets in Google Cloud Secret Manager:

### 1. `neon-db-connection`
```bash
echo "postgresql://neondb_owner:password@ep-xxx.aws.neon.tech/neondb?sslmode=require" | \
  gcloud secrets create neon-db-connection --data-file=-
```

### 2. `openrouter-api-key`
```bash
echo "sk-or-v1-your-key" | \
  gcloud secrets create openrouter-api-key --data-file=-
```

### 3. `jwt-secret`
```bash
echo "your-super-secret-jwt-key-min-32-chars" | \
  gcloud secrets create jwt-secret --data-file=-
```

## Grant Secret Access to Cloud Run Service Account

```bash
# Get the default compute service account
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant access to secrets
for secret in neon-db-connection openrouter-api-key jwt-secret; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
done
```

## Triggering Deployment

Deployment happens automatically when:
1. Code is pushed to `main` branch
2. Code is pushed to any `claude/*` branch
3. Changes are made to `backend/**` files

You can also manually trigger a deployment from the Actions tab.

## Verifying Deployment

After deployment, the workflow will:
1. Run all tests
2. Build the Docker image
3. Push to Google Container Registry
4. Deploy to Cloud Run
5. Initialize the database
6. Run a health check

Check the Actions tab for the deployment URL in the job summary.

## Quick Commands

```bash
# Get the deployed service URL
gcloud run services describe agent-builder-backend \
  --region=australia-southeast1 \
  --format='value(status.url)'

# View logs
gcloud run logs read --service=agent-builder-backend --region=australia-southeast1

# Manual deployment (without GitHub Actions)
cd backend && ./deploy.sh
```
