"""
Pull Request Management Tools

This module provides comprehensive pull request management capabilities including:
- PR creation, updating, and merging
- PR commenting and reviewing
- PR diff and file management
- Automated code review integration
"""

from typing import Any, Dict, List, Optional
from src.agent_builder_github_mcp.tools import BaseGitHubTool
from src.agent_builder_github_mcp.utils import GitHubAPIClient


class PullRequestTools(BaseGitHubTool):
    """Pull Request management tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
    
    async def create_pull_request(
        self,
        owner: str,
        repo: str,
        title: str,
        body: Optional[str] = None,
        head: str = "feature",
        base: str = "main",
        draft: bool = False,
        maintainer_can_modify: bool = True
    ) -> Dict[str, Any]:
        """Create a pull request"""
        try:
            data = {
                "title": title,
                "body": body,
                "head": head,
                "base": base,
                "draft": draft,
                "maintainer_can_modify": maintainer_can_modify
            }
            
            endpoint = f"repos/{owner}/{repo}/pulls"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                
                self.logger.info(f"Created PR: {title}")
                return {"success": True, "pull_request": result, "message": "PR created successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "create_pull_request")
            return {"success": False, "error": str(e), "message": "Failed to create PR"}
    
    async def get_pull_request(self, owner: str, repo: str, pull_number: int) -> Dict[str, Any]:
        """Get pull request details"""
        try:
            endpoint = f"repos/{owner}/{repo}/pulls/{pull_number}"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint)
                
                return {"success": True, "pull_request": result, "message": "PR retrieved successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "get_pull_request")
            return {"success": False, "error": str(e), "message": "Failed to get PR"}
    
    async def update_pull_request(
        self, owner: str, repo: str, pull_number: int,
        title: Optional[str] = None, body: Optional[str] = None, state: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update pull request"""
        try:
            data = {}
            if title: data["title"] = title
            if body: data["body"] = body
            if state: data["state"] = state
            
            endpoint = f"repos/{owner}/{repo}/pulls/{pull_number}"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.patch(endpoint, data)
                
                return {"success": True, "pull_request": result, "message": "PR updated successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "update_pull_request")
            return {"success": False, "error": str(e), "message": "Failed to update PR"}
    
    async def list_pull_requests(
        self, owner: str, repo: str, state: str = "open", per_page: int = 30, page: int = 1
    ) -> Dict[str, Any]:
        """List pull requests"""
        try:
            params = {"state": state, "per_page": per_page, "page": page}
            endpoint = f"repos/{owner}/{repo}/pulls"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                
                return {"success": True, "pull_requests": result, "total_count": len(result), "message": "PRs listed successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "list_pull_requests")
            return {"success": False, "error": str(e), "message": "Failed to list PRs"}
    
    async def merge_pull_request(
        self, owner: str, repo: str, pull_number: int,
        merge_method: str = "merge", commit_title: Optional[str] = None, commit_message: Optional[str] = None
    ) -> Dict[str, Any]:
        """Merge pull request"""
        try:
            data = {
                "merge_method": merge_method,
                "commit_title": commit_title,
                "commit_message": commit_message
            }
            
            endpoint = f"repos/{owner}/{repo}/pulls/{pull_number}/merge"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.put(endpoint, data)
                
                return {"success": True, "merge_result": result, "message": "PR merged successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "merge_pull_request")
            return {"success": False, "error": str(e), "message": "Failed to merge PR"}
    
    async def close_pull_request(self, owner: str, repo: str, pull_number: int) -> Dict[str, Any]:
        """Close pull request"""
        return await self.update_pull_request(owner, repo, pull_number, state="closed")
    
    async def add_pr_comment(self, owner: str, repo: str, pull_number: int, body: str) -> Dict[str, Any]:
        """Add comment to pull request"""
        try:
            data = {"body": body}
            endpoint = f"repos/{owner}/{repo}/pulls/{pull_number}/comments"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                
                return {"success": True, "comment": result, "message": "Comment added successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "add_pr_comment")
            return {"success": False, "error": str(e), "message": "Failed to add comment"}
    
    async def request_pr_review(self, owner: str, repo: str, pull_number: int, reviewers: List[str]) -> Dict[str, Any]:
        """Request pull request review"""
        try:
            data = {"reviewers": reviewers}
            endpoint = f"repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                
                return {"success": True, "reviewers": result, "message": "Reviewers requested successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "request_pr_review")
            return {"success": False, "error": str(e), "message": "Failed to request reviewers"}
    
    async def get_pr_diff(self, owner: str, repo: str, pull_number: int) -> Dict[str, Any]:
        """Get pull request diff"""
        try:
            endpoint = f"repos/{owner}/{repo}/pulls/{pull_number}"
            headers = {"Accept": "application/vnd.github.v3.diff"}
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, headers=headers)
                
                return {"success": True, "diff": result, "message": "PR diff retrieved successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "get_pr_diff")
            return {"success": False, "error": str(e), "message": "Failed to get PR diff"}
    
    async def get_pr_files(self, owner: str, repo: str, pull_number: int, per_page: int = 30, page: int = 1) -> Dict[str, Any]:
        """Get pull request files"""
        try:
            params = {"per_page": per_page, "page": page}
            endpoint = f"repos/{owner}/{repo}/pulls/{pull_number}/files"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                
                return {"success": True, "files": result, "total_count": len(result), "message": "PR files retrieved successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "get_pr_files")
            return {"success": False, "error": str(e), "message": "Failed to get PR files"}