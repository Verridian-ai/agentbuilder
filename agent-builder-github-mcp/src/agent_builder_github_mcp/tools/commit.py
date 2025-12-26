"""
Commit Management Tools

This module provides comprehensive commit management capabilities including:
- Commit history and statistics
- Commit diff and file changes
- Commit status and checks
- Commit message templates
"""

from typing import Any, Dict, List, Optional
from src.agent_builder_github_mcp.tools import BaseGitHubTool
from src.agent_builder_github_mcp.utils import GitHubAPIClient


class CommitTools(BaseGitHubTool):
    """Commit management tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
    
    async def get_commit(self, owner: str, repo: str, sha: str) -> Dict[str, Any]:
        """Get commit details"""
        try:
            endpoint = f"repos/{owner}/{repo}/commits/{sha}"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint)
                return {"success": True, "commit": result, "message": "Commit retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_commit")
            return {"success": False, "error": str(e), "message": "Failed to get commit"}
    
    async def list_commits(self, owner: str, repo: str, sha: Optional[str] = None, 
                          path: Optional[str] = None, author: Optional[str] = None,
                          since: Optional[str] = None, until: Optional[str] = None,
                          per_page: int = 30, page: int = 1) -> Dict[str, Any]:
        """List commits"""
        try:
            params = {"per_page": per_page, "page": page}
            if sha: params["sha"] = sha
            if path: params["path"] = path
            if author: params["author"] = author
            if since: params["since"] = since
            if until: params["until"] = until
            
            endpoint = f"repos/{owner}/{repo}/commits"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                return {"success": True, "commits": result, "total_count": len(result), "message": "Commits listed successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "list_commits")
            return {"success": False, "error": str(e), "message": "Failed to list commits"}
    
    async def get_commit_diff(self, owner: str, repo: str, sha: str) -> Dict[str, Any]:
        """Get commit diff"""
        try:
            endpoint = f"repos/{owner}/{repo}/commits/{sha}"
            headers = {"Accept": "application/vnd.github.v3.diff"}
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, headers=headers)
                return {"success": True, "diff": result, "message": "Commit diff retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_commit_diff")
            return {"success": False, "error": str(e), "message": "Failed to get commit diff"}
    
    async def create_commit_status(self, owner: str, repo: str, sha: str, state: str, 
                                  target_url: Optional[str] = None, description: Optional[str] = None,
                                  context: Optional[str] = None) -> Dict[str, Any]:
        """Create commit status"""
        try:
            data = {"state": state}
            if target_url: data["target_url"] = target_url
            if description: data["description"] = description
            if context: data["context"] = context
            
            endpoint = f"repos/{owner}/{repo}/statuses/{sha}"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                return {"success": True, "status": result, "message": "Commit status created successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "create_commit_status")
            return {"success": False, "error": str(e), "message": "Failed to create commit status"}
    
    async def get_file_history(self, owner: str, repo: str, path: str, sha: Optional[str] = None) -> Dict[str, Any]:
        """Get file history"""
        try:
            params = {}
            if sha: params["sha"] = sha
            
            endpoint = f"repos/{owner}/{repo}/commits"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params={**params, "path": path})
                return {"success": True, "history": result, "message": "File history retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_file_history")
            return {"success": False, "error": str(e), "message": "Failed to get file history"}