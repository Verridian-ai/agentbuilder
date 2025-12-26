"""
Deployment Management Tools

This module provides comprehensive deployment capabilities including:
- Deployment creation and management
- Deployment status tracking
- Environment management
- Automated deployment workflows
"""

from typing import Any, Dict, List, Optional
from src.agent_builder_github_mcp.tools import BaseGitHubTool
from src.agent_builder_github_mcp.utils import GitHubAPIClient


class DeploymentTools(BaseGitHubTool):
    """Deployment management tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
    
    async def create_deployment(self, owner: str, repo: str, ref: str, environment: str = "production",
                              description: Optional[str] = None, task: Optional[str] = None,
                              auto_merge: bool = False, required_contexts: Optional[List[str]] = None) -> Dict[str, Any]:
        """Create a deployment"""
        try:
            data = {
                "ref": ref,
                "environment": environment,
                "auto_merge": auto_merge
            }
            if description: data["description"] = description
            if task: data["task"] = task
            if required_contexts: data["required_contexts"] = required_contexts
            
            endpoint = f"repos/{owner}/{repo}/deployments"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                return {"success": True, "deployment": result, "message": "Deployment created successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "create_deployment")
            return {"success": False, "error": str(e), "message": "Failed to create deployment"}
    
    async def get_deployment_status(self, owner: str, repo: str, deployment_id: int) -> Dict[str, Any]:
        """Get deployment status"""
        try:
            endpoint = f"repos/{owner}/{repo}/deployments/{deployment_id}/statuses"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint)
                return {"success": True, "statuses": result, "total_count": len(result), "message": "Deployment status retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_deployment_status")
            return {"success": False, "error": str(e), "message": "Failed to get deployment status"}
    
    async def create_deployment_status(self, owner: str, repo: str, deployment_id: int, 
                                     state: str, environment_url: Optional[str] = None,
                                     log_url: Optional[str] = None, description: Optional[str] = None,
                                     auto_inactive: Optional[bool] = None) -> Dict[str, Any]:
        """Create deployment status"""
        try:
            data = {"state": state}
            if environment_url: data["environment_url"] = environment_url
            if log_url: data["log_url"] = log_url
            if description: data["description"] = description
            if auto_inactive is not None: data["auto_inactive"] = auto_inactive
            
            endpoint = f"repos/{owner}/{repo}/deployments/{deployment_id}/statuses"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                return {"success": True, "status": result, "message": "Deployment status created successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "create_deployment_status")
            return {"success": False, "error": str(e), "message": "Failed to create deployment status"}
    
    async def get_deployments(self, owner: str, repo: str, environment: Optional[str] = None,
                            per_page: int = 30, page: int = 1) -> Dict[str, Any]:
        """Get deployments"""
        try:
            params = {"per_page": per_page, "page": page}
            if environment: params["environment"] = environment
            
            endpoint = f"repos/{owner}/{repo}/deployments"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                return {"success": True, "deployments": result, "total_count": len(result), "message": "Deployments retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_deployments")
            return {"success": False, "error": str(e), "message": "Failed to get deployments"}
    
    async def delete_deployment(self, owner: str, repo: str, deployment_id: int) -> Dict[str, Any]:
        """Delete deployment"""
        try:
            endpoint = f"repos/{owner}/{repo}/deployments/{deployment_id}"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                success = await client.delete(endpoint)
                return {"success": True, "message": "Deployment deleted successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "delete_deployment")
            return {"success": False, "error": str(e), "message": "Failed to delete deployment"}