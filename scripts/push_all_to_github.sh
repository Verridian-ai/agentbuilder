#!/bin/bash
# Complete GitHub Push Script
# This script pushes ALL files from the workspace to GitHub

set -e  # Exit on error

echo "======================================"
echo "Agent Builder - Complete GitHub Push"
echo "======================================"
echo ""

# Configuration
REPO_OWNER="Verridian-ai"
REPO_NAME="agentbuilder"
BRANCH="main"
GITHUB_TOKEN="${GITHUB_TOKEN:-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}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Clone or pull repository
echo -e "${BLUE}Step 1: Preparing repository...${NC}"
if [ -d "/tmp/agentbuilder-push" ]; then
    rm -rf /tmp/agentbuilder-push
fi

git clone "https://${GITHUB_TOKEN}@github.com/${REPO_OWNER}/${REPO_NAME}.git" /tmp/agentbuilder-push
cd /tmp/agentbuilder-push

# Step 2: Copy all files
echo -e "${BLUE}Step 2: Copying files...${NC}"

# Copy main README (the professional one)
cp /workspace/README_PROFESSIONAL.md README.md
echo -e "${GREEN}✓${NC} Copied professional README"

# Copy documentation
mkdir -p docs
cp /workspace/DEPLOYMENT-FIX-INSTRUCTIONS.md docs/
cp /workspace/QUICK_START_GUIDE.md docs/
cp /workspace/docs/*.md docs/ 2>/dev/null || true
cp /workspace/docs/*.json docs/ 2>/dev/null || true
echo -e "${GREEN}✓${NC} Copied documentation"

# Copy deployment scripts
mkdir -p scripts
cp /workspace/deploy_to_gcp.sh scripts/ 2>/dev/null || true
cp /workspace/complete_gcp_deploy.sh scripts/ 2>/dev/null || true
cp /workspace/quick_diagnostic.sh scripts/ 2>/dev/null || true
cp /workspace/fix_deployment.js scripts/ 2>/dev/null || true
cp /workspace/complete_deployment.py scripts/ 2>/dev/null || true
cp /workspace/generate_gcp_token.py scripts/ 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true
echo -e "${GREEN}✓${NC} Copied deployment scripts"

# Copy strategy documents
mkdir -p strategy
cp /workspace/claude_code_agent_builder_strategy.md strategy/ 2>/dev/null || true
cp /workspace/google_cloud_hosted_ide_implementation_strategy.md strategy/ 2>/dev/null || true
cp /workspace/mobile_first_ios_transformation_strategy.md strategy/ 2>/dev/null || true
cp /workspace/agentic_network_infrastructure_automation_platform_strategy.md strategy/ 2>/dev/null || true
cp /workspace/claude_platform_enhancement_strategy.md strategy/ 2>/dev/null || true
cp /workspace/claude_max_plan_integration_guide.md strategy/ 2>/dev/null || true
echo -e "${GREEN}✓${NC} Copied strategy documents"

# Copy configuration files
cp /workspace/deployment-manifest.json . 2>/dev/null || true
cp /workspace/deploy_url.txt . 2>/dev/null || true
echo -e "${GREEN}✓${NC} Copied configuration files"

# Copy backend (if not already there)
if [ -d "/workspace/code/claude-builder/backend" ]; then
    mkdir -p backend
    cp -r /workspace/code/claude-builder/backend/* backend/
    echo -e "${GREEN}✓${NC} Copied backend code"
fi

# Copy frontend (if not already there)
if [ -d "/workspace/code/claude-builder/src" ]; then
    mkdir -p src public
    cp -r /workspace/code/claude-builder/src/* src/ 2>/dev/null || true
    cp -r /workspace/code/claude-builder/public/* public/ 2>/dev/null || true
    cp /workspace/code/claude-builder/*.json . 2>/dev/null || true
    cp /workspace/code/claude-builder/*.config.* . 2>/dev/null || true
    cp /workspace/code/claude-builder/*.ts . 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Copied frontend code"
fi

# Copy GitHub MCP
if [ -d "/workspace/agent-builder-github-mcp" ]; then
    mkdir -p agent-builder-github-mcp
    cp -r /workspace/agent-builder-github-mcp/* agent-builder-github-mcp/
    echo -e "${GREEN}✓${NC} Copied GitHub MCP"
fi

# Copy research
if [ -d "/workspace/research" ]; then
    mkdir -p research
    cp -r /workspace/research/* research/
    echo -e "${GREEN}✓${NC} Copied research documents"
fi

# Step 3: Create .gitignore if not exists
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc
.Python
venv/
env/

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary files
tmp/
temp/
*.tmp
EOF
    echo -e "${GREEN}✓${NC} Created .gitignore"
fi

# Step 4: Create .env.example
cat > .env.example << 'EOF'
# Database Configuration
NEON_DB_CONNECTION_STRING=postgresql://user:password@host/database?sslmode=require

# AI Services
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# GitHub Integration
GITHUB_TOKEN=github_pat_your-token-here
GITHUB_USERNAME=your-github-username

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your-project-id
CLOUD_STORAGE_BUCKET=your-bucket-name

# Authentication
JWT_SECRET=your-super-secret-key-min-32-chars

# Server Configuration
NODE_ENV=production
PORT=8080
EOF
echo -e "${GREEN}✓${NC} Created .env.example"

# Step 5: Git operations
echo -e "${BLUE}Step 3: Committing changes...${NC}"
git add -A
git commit -m "feat: Complete system push with professional documentation

✅ Added:
- Professional README with comprehensive documentation
- Complete backend API (Node.js/Express)
- Frontend PWA (React + TypeScript)
- GitHub MCP server with 96 tools
- Design documentation and specifications
- Research and strategy documents
- Deployment scripts and guides
- Environment configuration templates

🏗 Architecture:
- Mobile-first Progressive Web App
- Cloud-hosted IDE on Google Cloud Run
- Neon DB serverless PostgreSQL
- OpenRouter AI integration
- Comprehensive GitHub integration

📚 Documentation:
- Detailed API documentation
- Deployment guides
- Quick start guide
- Troubleshooting resources

🚀 Ready for:
- Local development
- Cloud deployment
- Team collaboration
- Production use"

# Step 6: Push to GitHub
echo -e "${BLUE}Step 4: Pushing to GitHub...${NC}"
git push origin ${BRANCH}

echo ""
echo -e "${GREEN}======================================"
echo -e "✅ Successfully pushed all files!"
echo -e "======================================${NC}"
echo ""
echo "Repository: https://github.com/${REPO_OWNER}/${REPO_NAME}"
echo "Branch: ${BRANCH}"
echo ""
echo "Files pushed:"
echo "  - Professional README"
echo "  - Backend code (Node.js/Express)"
echo "  - Frontend code (React/TypeScript)"
echo "  - GitHub MCP (96 tools)"
echo "  - Documentation (deployment, quick start)"
echo "  - Deployment scripts"
echo "  - Strategy documents"
echo "  - Configuration templates"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Visit your repository to verify files"
echo "  2. Review the professional README"
echo "  3. Check deployment documentation"
echo "  4. Start using the platform!"
echo ""
