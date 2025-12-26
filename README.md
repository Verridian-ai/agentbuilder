# Agent Builder Platform

<div align="center">

![Agent Builder Platform](https://img.shields.io/badge/Agent%20Builder-Platform-orange?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Build](https://img.shields.io/badge/build-passing-success?style=for-the-badge)

**A comprehensive cloud-hosted platform for creating, configuring, and deploying optimized Claude AI agents**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation)

</div>

---

## 🎯 Overview

The **Agent Builder Platform** is a production-ready, mobile-first Progressive Web App (PWA) for managing Claude AI agent configurations. Built with modern web technologies and deployed on Google Cloud infrastructure.

### Key Highlights

- 🎨 **Visual Node-Based Editor** - Intuitive drag-and-drop interface
- 📱 **Mobile-First Design** - iOS-style interface optimized for touch
- ☁️ **Cloud IDE Integration** - Full VS Code experience in browser
- 🔗 **GitHub Integration** - 96 specialized MCP tools
- 🤖 **AI-Powered** - Integrated with OpenRouter API
- 🚀 **Production-Ready** - Comprehensive error handling

---

## ✨ Features

### Core Platform
- Visual Workflow Editor with node-based interface
- Claude.md Optimization for token efficiency
- Plugin Management without MCP overhead
- Template Library for common configurations
- Export auto-setup scripts for deployment

### GitHub Integration (96 MCP Tools)
- Repository Management
- File Operations & Atomic Commits
- Branch Management
- Pull Requests with AI descriptions
- Issue Tracking
- GitHub Actions
- Security Scanning
- Analytics & Insights

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0+
- npm 9.0+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/Verridian-ai/agentbuilder.git
cd agentbuilder

# Install dependencies
npm install
cd backend && npm install && cd ..

# Configure environment
cp .env.example .env

# Start development
npm run dev          # Frontend (localhost:5173)
cd backend && npm start  # Backend (localhost:8080)
```

### Live Demo

🌐 **URL**: https://agent-builder-339807712198.australia-southeast1.run.app

---

## 🏗 Architecture

### Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js 20 LTS, Express.js 4.18+ |
| Database | Neon DB (Serverless PostgreSQL) |
| Infrastructure | Google Cloud Run |

---

## 📚 API Documentation

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### File Operations
```http
GET    /api/files
POST   /api/files/write
DELETE /api/files/delete
```

### AI Services
```http
POST /api/ai/generate
POST /api/ai/analyze
```

---

## 🔗 GitHub MCP Integration

96 specialized tools for complete GitHub workflow automation.

```bash
cd agent-builder-github-mcp
pip install -r requirements.txt
./run.sh
```

---

## 📁 Project Structure

```
agentbuilder/
├── backend/                 # Node.js API server
├── src/                     # React frontend
├── public/                  # Static assets (PWA)
├── agent-builder-github-mcp/ # GitHub MCP server
├── docs/                    # Documentation
└── research/                # Research documents
```

---

## 📄 License

**Copyright © 2025 Verridian AI. All rights reserved.**

---

## 📞 Support

- **Website**: https://verridian.ai
- **Email**: support@verridian.ai
- **GitHub**: https://github.com/Verridian-ai

---

<div align="center">

**Built with ❤️ by Verridian AI**

</div>