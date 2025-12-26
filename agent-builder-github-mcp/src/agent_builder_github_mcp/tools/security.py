"""
Security Tools - Code Scanning, Secret Scanning, Dependabot

This module provides comprehensive security capabilities including:
- Code scanning alerts and management
- Secret scanning and protection
- Dependabot security alerts
- Security advisory management
"""

from typing import Any, Dict, List, Optional
from src.agent_builder_github_mcp.tools import BaseGitHubTool
from src.agent_builder_github_mcp.utils import GitHubAPIClient


class SecurityTools(BaseGitHubTool):
    """Security management tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
    
    async def get_code_scanning_alerts(self, owner: str, repo: str, state: str = "open", 
                                     tool_name: Optional[str] = None, severity: Optional[str] = None) -> Dict[str, Any]:
        """Get code scanning alerts"""
        try:
            params = {"state": state}
            if tool_name: params["tool_name"] = tool_name
            if severity: params["severity"] = severity
            
            endpoint = f"repos/{owner}/{repo}/code-scanning/alerts"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                return {"success": True, "alerts": result, "total_count": len(result), "message": "Code scanning alerts retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_code_scanning_alerts")
            return {"success": False, "error": str(e), "message": "Failed to get code scanning alerts"}
    
    async def get_secret_scanning_alerts(self, owner: str, repo: str, state: str = "open") -> Dict[str, Any]:
        """Get secret scanning alerts"""
        try:
            params = {"state": state}
            endpoint = f"repos/{owner}/{repo}/secret-scanning/alerts"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                return {"success": True, "alerts": result, "total_count": len(result), "message": "Secret scanning alerts retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_secret_scanning_alerts")
            return {"success": False, "error": str(e), "message": "Failed to get secret scanning alerts"}
    
    async def get_dependabot_alerts(self, owner: str, repo: str, state: str = "open", 
                                  severity: Optional[str] = None) -> Dict[str, Any]:
        """Get Dependabot security alerts"""
        try:
            params = {"state": state}
            if severity: params["severity"] = severity
            
            endpoint = f"repos/{owner}/{repo}/dependabot/alerts"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                return {"success": True, "alerts": result, "total_count": len(result), "message": "Dependabot alerts retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_dependabot_alerts")
            return {"success": False, "error": str(e), "message": "Failed to get Dependabot alerts"}
    
    async def create_security_advisory(self, ghsa_id: str, summary: str, description: str,
                                     severity: str, affected_range: str, fixed_versions: str) -> Dict[str, Any]:
        """Create security advisory"""
        try:
            data = {
                "ghsa_id": ghsa_id,
                "summary": summary,
                "description": description,
                "severity": severity,
                "affected_range": affected_range,
                "fixed_versions": fixed_versions
            }
            endpoint = "security-advisories"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                return {"success": True, "advisory": result, "message": "Security advisory created successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "create_security_advisory")
            return {"success": False, "error": str(e), "message": "Failed to create security advisory"}
    
    async def enable_code_scanning(self, owner: str, repo: str) -> Dict[str, Any]:
        """Enable code scanning for repository"""
        try:
            endpoint = f"repos/{owner}/{repo}/code-scanning/alerts"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint)
                return {"success": True, "message": "Code scanning enabled successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "enable_code_scanning")
            return {"success": False, "error": str(e), "message": "Failed to enable code scanning"}