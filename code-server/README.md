# VS Code Server (code-server) for Google Cloud Run

A containerized VS Code Server deployment for Google Cloud Run, providing a browser-based development environment.

## Features

- **VS Code in the Browser**: Full VS Code experience accessible from any device
- **Pre-installed Tools**: Node.js 20, Python 3, Git, pnpm, TypeScript
- **VS Code Extensions**: Python, ESLint, Prettier, Tailwind CSS, Docker
- **Cloud Run Optimized**: Auto-scaling, pay-per-use, serverless deployment

## Prerequisites

1. **Google Cloud SDK** installed and configured
2. **Google Cloud Project** with billing enabled
3. **APIs Enabled**:
   - Cloud Run API
   - Cloud Build API
   - Container Registry API

Enable required APIs:
```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com
```

## Quick Deploy

### Option 1: Using deploy.sh (Recommended)

```bash
# Set your project ID (optional, defaults to agent-builder-platform)
export GOOGLE_CLOUD_PROJECT_ID="your-project-id"
export REGION="australia-southeast1"

# Make script executable and run
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Using Cloud Build

```bash
# Submit build and deploy
gcloud builds submit --config cloudbuild.yaml --project your-project-id
```

### Option 3: Manual Deployment

```bash
# Build the container
docker build -t gcr.io/your-project-id/code-server .

# Push to Container Registry
docker push gcr.io/your-project-id/code-server

# Deploy to Cloud Run
gcloud run deploy code-server \
  --image gcr.io/your-project-id/code-server \
  --platform managed \
  --region australia-southeast1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PASSWORD` | Password for authentication | Empty (no auth) |
| `HASHED_PASSWORD` | Hashed password for authentication | Empty |
| `NODE_ENV` | Node.js environment | production |

### Resource Settings

The default configuration allocates:
- **Memory**: 2GB
- **CPU**: 2 vCPUs
- **Timeout**: 3600s (1 hour)
- **Concurrency**: 1 (single user per instance)
- **Instances**: 0-10 (auto-scaling)

### Adding Authentication

To enable password authentication, update the Dockerfile ENTRYPOINT:

```dockerfile
# With password
ENTRYPOINT ["/usr/bin/entrypoint.sh", "--bind-addr", "0.0.0.0:8080", "--auth", "password", "/home/coder/workspace"]
```

Then set the PASSWORD environment variable in Cloud Run:
```bash
gcloud run services update code-server \
  --set-env-vars "PASSWORD=your-secure-password" \
  --region australia-southeast1
```

## Custom Domain Setup

To map the custom domain `agent-builder.verridian.ai`:

1. **Create domain mapping**:
```bash
gcloud run domain-mappings create \
  --service code-server \
  --domain agent-builder.verridian.ai \
  --region australia-southeast1
```

2. **Configure DNS**: Add the A/AAAA records provided by Cloud Run to your DNS provider.

3. **Verify**: Wait for DNS propagation and SSL certificate provisioning (may take up to 24 hours).

## Pre-installed Extensions

- **ms-python.python**: Python language support
- **dbaeumer.vscode-eslint**: ESLint integration
- **esbenp.prettier-vscode**: Prettier code formatter
- **bradlc.vscode-tailwindcss**: Tailwind CSS IntelliSense
- **ms-azuretools.vscode-docker**: Docker support

## Adding More Extensions

Modify the Dockerfile to include additional extensions:

```dockerfile
RUN code-server --install-extension publisher.extension-name
```

Or install at runtime through the Extensions panel in VS Code.

## Persistent Storage

By default, Cloud Run instances are ephemeral. For persistent storage:

1. **Cloud Storage FUSE**: Mount a GCS bucket as a file system
2. **Git Integration**: Push changes to a remote repository
3. **Cloud Filestore**: For more demanding workloads

Example with Cloud Storage FUSE (requires additional setup):
```bash
gcloud run services update code-server \
  --add-cloudsql-instances your-instance \
  --set-env-vars "GCS_BUCKET=your-bucket"
```

## Local Development

Build and run locally:

```bash
# Build
docker build -t code-server .

# Run
docker run -p 8080:8080 code-server

# Access at http://localhost:8080
```

## Troubleshooting

### Container fails to start
- Check Cloud Run logs: `gcloud run logs read code-server --region australia-southeast1`
- Ensure port 8080 is exposed in Dockerfile

### Extensions not loading
- Extensions are installed at build time
- Check extension IDs are correct
- View extension logs in VS Code's Output panel

### Timeout issues
- Increase timeout in deploy command
- Consider using `--cpu-boost` for faster startup

## Security Considerations

- **Authentication**: Enable password authentication for production use
- **Network**: Consider using Cloud IAM or Identity-Aware Proxy (IAP) for access control
- **Secrets**: Use Secret Manager for sensitive environment variables

```bash
# Example: Using Secret Manager for password
gcloud run services update code-server \
  --set-secrets "PASSWORD=code-server-password:latest" \
  --region australia-southeast1
```

## Cost Optimization

- **Min instances = 0**: Only pay when actively using
- **Concurrency = 1**: Each user gets dedicated resources
- **CPU allocation**: Only charged during request processing

Estimated cost: ~$0.10-0.50/hour when actively running

## Support

For issues related to:
- **code-server**: https://github.com/coder/code-server
- **Cloud Run**: https://cloud.google.com/run/docs
- **This deployment**: Open an issue in the project repository
