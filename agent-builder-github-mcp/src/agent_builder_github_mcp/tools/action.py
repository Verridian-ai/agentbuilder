"""
GitHub Actions Management Tools

This module provides comprehensive GitHub Actions capabilities including:
- Workflow management and execution
- Action run monitoring and logs
- Artifact management
- Workflow dispatch and status
"""

from typing import Any, Dict, List, Optional
from src.agent_builder_github_mcp.tools import BaseGitHubTool
from src.agent_builder_github_mcp.utils import GitHubAPIClient


class ActionTools(BaseGitHubTool):
    """GitHub Actions tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
    
    async def list_workflows(self, owner: str, repo: str) -> Dict[str, Any]:
        """List repository workflows"""
        try:
            endpoint = f"repos/{owner}/{repo}/actions/workflows"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint)
                return {"success": True, "workflows": result.get("workflows", []), "message": "Workflows listed successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "list_workflows")
            return {"success": False, "error": str(e), "message": "Failed to list workflows"}
    
    async def get_workflow(self, owner: str, repo: str, workflow_id: str) -> Dict[str, Any]:
        """Get workflow details"""
        try:
            endpoint = f"repos/{owner}/{repo}/actions/workflows/{workflow_id}"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint)
                return {"success": True, "workflow": result, "message": "Workflow retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_workflow")
            return {"success": False, "error": str(e), "message": "Failed to get workflow"}
    
    async def run_workflow(self, owner: str, repo: str, workflow_id: str, ref: str = "main", 
                          inputs: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Trigger workflow"""
        try:
            data = {"ref": ref}
            if inputs: data["inputs"] = inputs
            
            endpoint = f"repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                return {"success": True, "message": "Workflow triggered successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "run_workflow")
            return {"success": False, "error": str(e), "message": "Failed to trigger workflow"}
    
    async def list_workflow_runs(self, owner: str, repo: str, workflow_id: Optional[str] = None,
                               status: Optional[str] = None, per_page: int = 30, page: int = 1) -> Dict[str, Any]:
        """List workflow runs"""
        try:
            params = {"per_page": per_page, "page": page}
            if status: params["status"] = status
            
            endpoint = f"repos/{owner}/{repo}/actions/runs" if not workflow_id else f"repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                return {"success": True, "runs": result.get("workflow_runs", []), "total_count": len(result.get("workflow_runs", [])), "message": "Workflow runs listed successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "list_workflow_runs")
            return {"success": False, "error": str(e), "message": "Failed to list workflow runs"}
    
    async def get_workflow_run(self, owner: str, repo: str, run_id: int) -> Dict[str, Any]:
        """Get workflow run details"""
        try:
            endpoint = f"repos/{owner}/{repo}/actions/runs/{run_id}"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint)
                return {"success": True, "run": result, "message": "Workflow run retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_workflow_run")
            return {"success": False, "error": str(e), "message": "Failed to get workflow run"}
    
    async def cancel_workflow_run(self, owner: str, repo: str, run_id: int) -> Dict[str, Any]:
        """Cancel workflow run"""
        try:
            endpoint = f"repos/{owner}/{repo}/actions/runs/{run_id}/cancel"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint)
                return {"success": True, "message": "Workflow run cancelled successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "cancel_workflow_run")
            return {"success": False, "error": str(e), "message": "Failed to cancel workflow run"}
    
    async def get_workflow_run_logs(self, owner: str, repo: str, run_id: int) -> Dict[str, Any]:
        """Get workflow run logs URL"""
        try:
            endpoint = f"repos/{owner}/{repo}/actions/runs/{run_id}/logs"
            headers = {"Accept": "application/vnd.github.v3+json"}
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, headers=headers)
                return {"success": True, "logs_url": result.get("logs_url"), "message": "Workflow logs URL retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_workflow_run_logs")
            return {"success": False, "error": str(e), "message": "Failed to get workflow logs"}
    
    async def create_workflow_dispatch(self, owner: str, repo: str, workflow_file: str, ref: str = "main",
                                     inputs: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Create workflow dispatch"""
        try:
            data = {"ref": ref}
            if inputs: data["inputs"] = inputs
            
            endpoint = f"repos/{owner}/{repo}/actions/workflows/{workflow_file}/dispatches"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                return {"success": True, "message": "Workflow dispatch created successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "create_workflow_dispatch")
            return {"success": False, "error": str(e), "message": "Failed to create workflow dispatch"}