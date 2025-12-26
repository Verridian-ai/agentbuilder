#!/usr/bin/env python3
"""
Agent Builder GitHub MCP Server

A comprehensive Model Context Protocol (MCP) server providing full GitHub integration
for the agent builder platform with enhanced features including Neon DB integration,
OpenRouter API support, Claude Code CLI integration, and automated deployment workflows.

Features:
- Complete GitHub API coverage (repos, issues, PRs, actions, security, etc.)
- Neon DB integration for repository metadata storage
- OpenRouter API integration for AI-powered features
- Claude Code CLI tools integration
- File synchronization between GitHub and cloud IDE
- Automated deployment workflows
- Real-time collaboration support
- Multi-repository support
- Comprehensive error handling and rate limiting
"""

import asyncio
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import httpx
from fastmcp import FastMCP
from pydantic import BaseModel, Field

# Import our custom modules
from src.agent_builder_github_mcp.tools.repository import RepositoryTools
from src.agent_builder_github_mcp.tools.issue import IssueTools
from src.agent_builder_github_mcp.tools.pull_request import PullRequestTools
from src.agent_builder_github_mcp.tools.branch import BranchTools
from src.agent_builder_github_mcp.tools.commit import CommitTools
from src.agent_builder_github_mcp.tools.action import ActionTools
from src.agent_builder_github_mcp.tools.security import SecurityTools
from src.agent_builder_github_mcp.tools.user import UserTools
from src.agent_builder_github_mcp.tools.organization import OrganizationTools
from src.agent_builder_github_mcp.tools.deployment import DeploymentTools
from src.agent_builder_github_mcp.tools.file_sync import FileSyncTools
from src.agent_builder_github_mcp.tools.collaboration import CollaborationTools
from src.agent_builder_github_mcp.tools.analytics import AnalyticsTools
from src.agent_builder_github_mcp.tools.webhook import WebhookTools
from src.agent_builder_github_mcp.integrations.neon_db import NeonDBTools
from src.agent_builder_github_mcp.integrations.openrouter import OpenRouterTools
from src.agent_builder_github_mcp.integrations.claude_code import ClaudeCodeTools
from src.agent_builder_github_mcp.integrations.integration import IntegrationTools
from src.agent_builder_github_mcp.utils import (
    GitHubMCPConfig,
    Logger,
    RateLimiter,
    ErrorHandler,
    AuthManager,
    ValidationHelper,
)

# Configure logging
logger = Logger.get_logger(__name__)

class AgentBuilderGitHubMCP:
    """Main GitHub MCP Server for Agent Builder Platform"""
    
    def __init__(self, config: GitHubMCPConfig):
        """Initialize the GitHub MCP Server"""
        self.config = config
        self.mcp = FastMCP("Agent Builder GitHub Integration")
        
        # Initialize components
        self.rate_limiter = RateLimiter(config.github_rate_limit)
        self.auth_manager = AuthManager(config.github_token)
        self.error_handler = ErrorHandler(self.auth_manager)
        
        # Initialize tool modules
        self._initialize_tools()
        
        # Register tools
        self._register_tools()
        
        logger.info("GitHub MCP Server initialized successfully")
    
    def _initialize_tools(self):
        """Initialize all tool modules"""
        try:
            # Core GitHub tools
            self.repository_tools = RepositoryTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.issue_tools = IssueTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.pr_tools = PullRequestTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.branch_tools = BranchTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.commit_tools = CommitTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.action_tools = ActionTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.security_tools = SecurityTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.user_tools = UserTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.org_tools = OrganizationTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.deployment_tools = DeploymentTools(
                self.config, self.rate_limiter, self.error_handler
            )
            
            # Enhanced tools
            self.file_sync_tools = FileSyncTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.collaboration_tools = CollaborationTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.analytics_tools = AnalyticsTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.webhook_tools = WebhookTools(
                self.config, self.rate_limiter, self.error_handler
            )
            
            # Integration tools
            self.neon_db_tools = NeonDBTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.openrouter_tools = OpenRouterTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.claude_code_tools = ClaudeCodeTools(
                self.config, self.rate_limiter, self.error_handler
            )
            self.integration_tools = IntegrationTools(
                self.config, self.rate_limiter, self.error_handler
            )
            
            logger.info("All tool modules initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize tool modules: {e}")
            raise
    
    def _register_tools(self):
        """Register all MCP tools"""
        try:
            # Repository Management Tools
            self.mcp.tool(self.repository_tools.create_repository)
            self.mcp.tool(self.repository_tools.fork_repository)
            self.mcp.tool(self.repository_tools.delete_repository)
            self.mcp.tool(self.repository_tools.get_repository)
            self.mcp.tool(self.repository_tools.list_repositories)
            self.mcp.tool(self.repository_tools.update_repository)
            self.mcp.tool(self.repository_tools.get_repository_contents)
            self.mcp.tool(self.repository_tools.create_or_update_file)
            self.mcp.tool(self.repository_tools.delete_file)
            self.mcp.tool(self.repository_tools.move_file)
            
            # Branch Management Tools
            self.mcp.tool(self.branch_tools.create_branch)
            self.mcp.tool(self.branch_tools.delete_branch)
            self.mcp.tool(self.branch_tools.get_branch)
            self.mcp.tool(self.branch_tools.list_branches)
            self.mcp.tool(self.branch_tools.update_branch_protection)
            
            # Commit Tools
            self.mcp.tool(self.commit_tools.get_commit)
            self.mcp.tool(self.commit_tools.list_commits)
            self.mcp.tool(self.commit_tools.get_commit_diff)
            self.mcp.tool(self.commit_tools.create_commit_status)
            self.mcp.tool(self.commit_tools.get_file_history)
            
            # Issue Management Tools
            self.mcp.tool(self.issue_tools.create_issue)
            self.mcp.tool(self.issue_tools.get_issue)
            self.mcp.tool(self.issue_tools.update_issue)
            self.mcp.tool(self.issue_tools.list_issues)
            self.mcp.tool(self.issue_tools.close_issue)
            self.mcp.tool(self.issue_tools.add_issue_comment)
            self.mcp.tool(self.issue_tools.get_issue_comments)
            self.mcp.tool(self.issue_tools.label_issue)
            self.mcp.tool(self.issue_tools.assign_issue)
            self.mcp.tool(self.issue_tools.create_issue_template)
            
            # Pull Request Tools
            self.mcp.tool(self.pr_tools.create_pull_request)
            self.mcp.tool(self.pr_tools.get_pull_request)
            self.mcp.tool(self.pr_tools.update_pull_request)
            self.mcp.tool(self.pr_tools.list_pull_requests)
            self.mcp.tool(self.pr_tools.merge_pull_request)
            self.mcp.tool(self.pr_tools.close_pull_request)
            self.mcp.tool(self.pr_tools.add_pr_comment)
            self.mcp.tool(self.pr_tools.request_pr_review)
            self.mcp.tool(self.pr_tools.get_pr_diff)
            self.mcp.tool(self.pr_tools.get_pr_files)
            
            # GitHub Actions Tools
            self.mcp.tool(self.action_tools.list_workflows)
            self.mcp.tool(self.action_tools.get_workflow)
            self.mcp.tool(self.action_tools.run_workflow)
            self.mcp.tool(self.action_tools.list_workflow_runs)
            self.mcp.tool(self.action_tools.get_workflow_run)
            self.mcp.tool(self.action_tools.cancel_workflow_run)
            self.mcp.tool(self.action_tools.get_workflow_run_logs)
            self.mcp.tool(self.action_tools.create_workflow_dispatch)
            
            # Security Tools
            self.mcp.tool(self.security_tools.get_code_scanning_alerts)
            self.mcp.tool(self.security_tools.get_secret_scanning_alerts)
            self.mcp.tool(self.security_tools.get_dependabot_alerts)
            self.mcp.tool(self.security_tools.create_security_advisory)
            self.mcp.tool(self.security_tools.enable_code_scanning)
            
            # User and Organization Tools
            self.mcp.tool(self.user_tools.get_user_profile)
            self.mcp.tool(self.user_tools.update_user_profile)
            self.mcp.tool(self.user_tools.get_user_repositories)
            self.mcp.tool(self.user_tools.get_user_gists)
            self.mcp.tool(self.org_tools.get_organization)
            self.mcp.tool(self.org_tools.list_organization_repos)
            self.mcp.tool(self.org_tools.get_organization_members)
            self.mcp.tool(self.org_tools.create_organization_webhook)
            
            # Deployment Tools
            self.mcp.tool(self.deployment_tools.create_deployment)
            self.mcp.tool(self.deployment_tools.get_deployment_status)
            self.mcp.tool(self.deployment_tools.create_deployment_status)
            self.mcp.tool(self.deployment_tools.get_deployments)
            self.mcp.tool(self.deployment_tools.delete_deployment)
            
            # File Synchronization Tools
            self.mcp.tool(self.file_sync_tools.sync_repository_to_cloud)
            self.mcp.tool(self.file_sync_tools.sync_cloud_to_repository)
            self.mcp.tool(self.file_sync_tools.get_sync_status)
            self.mcp.tool(self.file_sync_tools.conflict_resolution)
            
            # Collaboration Tools
            self.mcp.tool(self.collaboration_tools.enable_realtime_collaboration)
            self.mcp.tool(self.collaboration_tools.get_collaboration_status)
            self.mcp.tool(self.collaboration_tools.share_repository)
            self.mcp.tool(self.collaboration_tools.create_shared_workspace)
            
            # Analytics Tools
            self.mcp.tool(self.analytics_tools.get_repository_analytics)
            self.mcp.tool(self.analytics_tools.get_commit_analytics)
            self.mcp.tool(self.analytics_tools.get_contributor_analytics)
            self.mcp.tool(self.analytics_tools.get_project_health_metrics)
            
            # Webhook Tools
            self.mcp.tool(self.webhook_tools.create_webhook)
            self.mcp.tool(self.webhook_tools.list_webhooks)
            self.mcp.tool(self.webhook_tools.update_webhook)
            self.mcp.tool(self.webhook_tools.delete_webhook)
            self.mcp.tool(self.webhook_tools.get_webhook_events)
            
            # Integration Tools
            self.mcp.tool(self.neon_db_tools.store_repository_metadata)
            self.mcp.tool(self.neon_db_tools.get_repository_metadata)
            self.mcp.tool(self.neon_db_tools.sync_repository_to_db)
            
            self.mcp.tool(self.openrouter_tools.generate_code_review)
            self.mcp.tool(self.openrouter_tools.analyze_repository)
            self.mcp.tool(self.openrouter_tools.generate_pr_description)
            
            self.mcp.tool(self.claude_code_tools.analyze_codebase)
            self.mcp.tool(self.claude_code_tools.refactor_code)
            self.mcp.tool(self.claude_code_tools.generate_tests)
            
            self.mcp.tool(self.integration_tools.trigger_automated_deployment)
            self.mcp.tool(self.integration_tools.monitor_deployment)
            self.mcp.tool(self.integration_tools.rollback_deployment)
            self.mcp.tool(self.integration_tools.setup_continuous_integration)
            
            logger.info("All MCP tools registered successfully")
            
        except Exception as e:
            logger.error(f"Failed to register MCP tools: {e}")
            raise
    
    def get_mcp_instance(self) -> FastMCP:
        """Get the FastMCP instance"""
        return self.mcp
    
    async def start(self):
        """Start the GitHub MCP Server"""
        try:
            logger.info("Starting Agent Builder GitHub MCP Server...")
            
            # Validate configuration
            await self._validate_configuration()
            
            # Initialize integrations
            await self._initialize_integrations()
            
            # Start background services
            await self._start_background_services()
            
            logger.info("GitHub MCP Server started successfully")
            
        except Exception as e:
            logger.error(f"Failed to start GitHub MCP Server: {e}")
            raise
    
    async def _validate_configuration(self):
        """Validate the server configuration"""
        # Validate GitHub token
        if not self.config.github_token:
            raise ValueError("GitHub token is required")
        
        # Validate required integrations
        if self.config.neon_db_url and not self.config.neon_db_token:
            logger.warning("Neon DB URL provided but no token - Neon DB integration will be disabled")
        
        if self.config.openrouter_api_key:
            logger.info("OpenRouter API integration enabled")
        
        if self.config.claude_code_path:
            logger.info("Claude Code CLI integration enabled")
        
        logger.info("Configuration validation completed")
    
    async def _initialize_integrations(self):
        """Initialize external integrations"""
        # Initialize Neon DB
        if self.config.neon_db_url and self.config.neon_db_token:
            await self.neon_db_tools.initialize()
            logger.info("Neon DB integration initialized")
        
        # Initialize OpenRouter
        if self.config.openrouter_api_key:
            await self.openrouter_tools.initialize()
            logger.info("OpenRouter API integration initialized")
        
        # Initialize Claude Code
        if self.config.claude_code_path:
            await self.claude_code_tools.initialize()
            logger.info("Claude Code CLI integration initialized")
        
        # Initialize file sync
        if self.config.cloud_ide_sync_path:
            await self.file_sync_tools.initialize()
            logger.info("Cloud IDE file sync integration initialized")
    
    async def _start_background_services(self):
        """Start background services"""
        if self.config.enable_real_time_sync:
            # Start real-time synchronization service
            asyncio.create_task(self.file_sync_tools.start_realtime_sync())
            logger.info("Real-time synchronization service started")
        
        if self.config.enable_analytics:
            # Start analytics collection service
            asyncio.create_task(self.analytics_tools.start_analytics_collection())
            logger.info("Analytics collection service started")
        
        if self.config.enable_collaboration:
            # Start collaboration service
            asyncio.create_task(self.collaboration_tools.start_collaboration_service())
            logger.info("Real-time collaboration service started")

def main():
    """Main entry point"""
    try:
        # Load configuration from environment variables
        config = GitHubMCPConfig()
        
        # Create and start the GitHub MCP server
        server = AgentBuilderGitHubMCP(config)
        
        # Run the server
        server.get_mcp_instance().run()
        
    except KeyboardInterrupt:
        logger.info("Shutting down GitHub MCP Server...")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()