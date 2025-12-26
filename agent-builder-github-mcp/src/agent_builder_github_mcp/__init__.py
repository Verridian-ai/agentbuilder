"""
Agent Builder GitHub MCP Server

A comprehensive Model Context Protocol (MCP) server providing full GitHub integration
for the agent builder platform.

This package provides:
- Complete GitHub API integration
- Neon DB integration for metadata storage
- OpenRouter API integration for AI features
- Claude Code CLI integration
- File synchronization capabilities
- Real-time collaboration features
- Automated deployment workflows
- Comprehensive analytics and insights

Usage:
    from agent_builder_github_mcp import AgentBuilderGitHubMCP
    from agent_builder_github_mcp.config import GitHubMCPConfig
    
    config = GitHubMCPConfig(github_token="your_token")
    server = AgentBuilderGitHubMCP(config)
    server.start()
"""

__version__ = "1.0.0"
__author__ = "Agent Builder Team"
__description__ = "Comprehensive GitHub MCP Server for Agent Builder Platform"

from .tools import *
from .integrations import *
from .utils import *

__all__ = [
    "GitHubMCPConfig",
]