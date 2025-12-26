"""
Branch Management Tools

This module provides comprehensive branch management capabilities including:
- Branch creation, deletion, and listing
- Branch protection and policies
- Branch comparison and statistics
"""

from typing import Any, Dict, List, Optional
from src.agent_builder_github_mcp.tools import BaseGitHubTool
from src.agent_builder_github_mcp.utils import GitHubAPIClient, ValidationHelper


class BranchTools(BaseGitHubTool):
    """Branch management tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
    
    async def create_branch(self, owner: str, repo: str, branch_name: str, from_branch: str = "main") -> Dict[str, Any]:
        """Create a new branch"""
        try:
            if not ValidationHelper.validate_branch_name(branch_name):
                raise ValueError("Invalid branch name")
            
            # Get the SHA of the source branch
            endpoint = f"repos/{owner}/{repo}/git/refs/heads/{from_branch}"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                source_ref = await client.get(endpoint)
                sha = source_ref["object"]["sha"]
            
            # Create new branch
            data = {
                "ref": f"refs/heads/{branch_name}",
                "sha": sha
            }
            endpoint = f"repos/{owner}/{repo}/git/refs"
            
            result = await client.post(endpoint, data)
            self.logger.info(f"Created branch: {branch_name}")
            return {"success": True, "branch": result, "message": "Branch created successfully"}
            
        except Exception as e:
            self.error_handler.log_error(e, "create_branch")
            return {"success": False, "error": str(e), "message": "Failed to create branch"}
    
    async def delete_branch(self, owner: str, repo: str, branch_name: str) -> Dict[str, Any]:
        """Delete a branch"""
        try:
            endpoint = f"repos/{owner}/{repo}/git/refs/heads/{branch_name}"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                success = await client.delete(endpoint)
                self.logger.warning(f"Deleted branch: {branch_name}")
                return {"success": True, "message": "Branch deleted successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "delete_branch")
            return {"success": False, "error": str(e), "message": "Failed to delete branch"}
    
    async def get_branch(self, owner: str, repo: str, branch_name: str) -> Dict[str, Any]:
        """Get branch information"""
        try:
            endpoint = f"repos/{owner}/{repo}/branches/{branch_name}"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint)
                return {"success": True, "branch": result, "message": "Branch retrieved successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "get_branch")
            return {"success": False, "error": str(e), "message": "Failed to get branch"}
    
    async def list_branches(self, owner: str, repo: str) -> Dict[str, Any]:
        """List all branches"""
        try:
            endpoint = f"repos/{owner}/{repo}/branches"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint)
                return {"success": True, "branches": result, "total_count": len(result), "message": "Branches listed successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "list_branches")
            return {"success": False, "error": str(e), "message": "Failed to list branches"}
    
    async def update_branch_protection(self, owner: str, repo: str, branch_name: str, 
                                     required_status_checks: Optional[Dict] = None,
                                     enforce_admins: bool = False,
                                     required_pull_request_reviews: Optional[Dict] = None,
                                     restrictions: Optional[Dict] = None) -> Dict[str, Any]:
        """Update branch protection settings"""
        try:
            data = {
                "enforce_admins": enforce_admins,
                "required_status_checks": required_status_checks or {"strict": True, "checks": []},
                "required_pull_request_reviews": required_pull_request_reviews or {"required_approving_review_count": 1},
                "restrictions": restrictions
            }
            
            endpoint = f"repos/{owner}/{repo}/branches/{branch_name}/protection"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.put(endpoint, data)
                return {"success": True, "protection": result, "message": "Branch protection updated successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "update_branch_protection")
            return {"success": False, "error": str(e), "message": "Failed to update branch protection"}