"""
Organization Management Tools

This module provides organization management capabilities including:
- Organization information retrieval
- Organization repository management
- Organization member management
- Organization settings and policies
"""

from typing import Any, Dict, List, Optional
from src.agent_builder_github_mcp.tools import BaseGitHubTool
from src.agent_builder_github_mcp.utils import GitHubAPIClient


class OrganizationTools(BaseGitHubTool):
    """Organization management tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
    
    async def get_organization(self, org: str) -> Dict[str, Any]:
        """Get organization information"""
        try:
            endpoint = f"orgs/{org}"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint)
                return {"success": True, "organization": result, "message": "Organization retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_organization")
            return {"success": False, "error": str(e), "message": "Failed to get organization"}
    
    async def list_organization_repos(self, org: str, type: str = "all", sort: str = "updated", 
                                    direction: str = "desc", per_page: int = 30, page: int = 1) -> Dict[str, Any]:
        """List organization repositories"""
        try:
            params = {
                "type": type,
                "sort": sort,
                "direction": direction,
                "per_page": per_page,
                "page": page
            }
            endpoint = f"orgs/{org}/repos"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                return {"success": True, "repositories": result, "total_count": len(result), "message": "Organization repos listed successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "list_organization_repos")
            return {"success": False, "error": str(e), "message": "Failed to list organization repositories"}
    
    async def get_organization_members(self, org: str, filter: str = "all", role: Optional[str] = None, 
                                     per_page: int = 30, page: int = 1) -> Dict[str, Any]:
        """Get organization members"""
        try:
            params = {
                "filter": filter,
                "per_page": per_page,
                "page": page
            }
            if role:
                params["role"] = role
            endpoint = f"orgs/{org}/members"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                return {"success": True, "members": result, "total_count": len(result), "message": "Organization members retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_organization_members")
            return {"success": False, "error": str(e), "message": "Failed to get organization members"}
    
    async def create_organization_webhook(self, org: str, name: str, events: List[str], 
                                        config: Dict[str, Any]) -> Dict[str, Any]:
        """Create organization webhook"""
        try:
            data = {
                "name": name,
                "events": events,
                "config": config
            }
            endpoint = f"orgs/{org}/hooks"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                return {"success": True, "webhook": result, "message": "Organization webhook created successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "create_organization_webhook")
            return {"success": False, "error": str(e), "message": "Failed to create organization webhook"}