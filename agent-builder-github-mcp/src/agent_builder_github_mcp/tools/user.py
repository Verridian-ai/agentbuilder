"""
User and Organization Management Tools

This module provides comprehensive user and organization capabilities including:
- User profile management
- Organization administration
- Team and membership management
- Repository permissions
"""

from typing import Any, Dict, List, Optional
from src.agent_builder_github_mcp.tools import BaseGitHubTool
from src.agent_builder_github_mcp.utils import GitHubAPIClient


class UserTools(BaseGitHubTool):
    """User management tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
    
    async def get_user_profile(self, username: Optional[str] = None) -> Dict[str, Any]:
        """Get user profile"""
        try:
            endpoint = f"users/{username}" if username else "user"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint)
                return {"success": True, "user": result, "message": "User profile retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_user_profile")
            return {"success": False, "error": str(e), "message": "Failed to get user profile"}
    
    async def update_user_profile(self, name: Optional[str] = None, bio: Optional[str] = None,
                                company: Optional[str] = None, location: Optional[str] = None,
                                email: Optional[str] = None, hireable: Optional[bool] = None) -> Dict[str, Any]:
        """Update user profile"""
        try:
            data = {}
            if name: data["name"] = name
            if bio: data["bio"] = bio
            if company: data["company"] = company
            if location: data["location"] = location
            if email: data["email"] = email
            if hireable is not None: data["hireable"] = hireable
            
            endpoint = "user"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.patch(endpoint, data)
                return {"success": True, "user": result, "message": "User profile updated successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "update_user_profile")
            return {"success": False, "error": str(e), "message": "Failed to update user profile"}
    
    async def get_user_repositories(self, username: Optional[str] = None, type: str = "all",
                                  sort: str = "updated", per_page: int = 30, page: int = 1) -> Dict[str, Any]:
        """Get user repositories"""
        try:
            params = {"type": type, "sort": sort, "per_page": per_page, "page": page}
            endpoint = f"users/{username}/repos" if username else "user/repos"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                return {"success": True, "repositories": result, "total_count": len(result), "message": "User repositories retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_user_repositories")
            return {"success": False, "error": str(e), "message": "Failed to get user repositories"}
    
    async def get_user_gists(self, username: Optional[str] = None, per_page: int = 30, page: int = 1) -> Dict[str, Any]:
        """Get user gists"""
        try:
            params = {"per_page": per_page, "page": page}
            endpoint = f"users/{username}/gists" if username else "gists"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                return {"success": True, "gists": result, "total_count": len(result), "message": "User gists retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_user_gists")
            return {"success": False, "error": str(e), "message": "Failed to get user gists"}


class OrganizationTools(BaseGitHubTool):
    """Organization management tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
    
    async def get_organization(self, org: str) -> Dict[str, Any]:
        """Get organization details"""
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
                                    per_page: int = 30, page: int = 1) -> Dict[str, Any]:
        """List organization repositories"""
        try:
            params = {"type": type, "sort": sort, "per_page": per_page, "page": page}
            endpoint = f"orgs/{org}/repos"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                return {"success": True, "repositories": result, "total_count": len(result), "message": "Organization repositories listed successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "list_organization_repos")
            return {"success": False, "error": str(e), "message": "Failed to list organization repositories"}
    
    async def get_organization_members(self, org: str, role: str = "all",
                                     per_page: int = 30, page: int = 1) -> Dict[str, Any]:
        """Get organization members"""
        try:
            params = {"role": role, "per_page": per_page, "page": page}
            endpoint = f"orgs/{org}/members"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                return {"success": True, "members": result, "total_count": len(result), "message": "Organization members retrieved successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "get_organization_members")
            return {"success": False, "error": str(e), "message": "Failed to get organization members"}
    
    async def create_organization_webhook(self, org: str, config: Dict[str, Any], 
                                        events: List[str] = ["push"]) -> Dict[str, Any]:
        """Create organization webhook"""
        try:
            data = {
                "config": config,
                "events": events
            }
            endpoint = f"orgs/{org}/hooks"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                return {"success": True, "webhook": result, "message": "Organization webhook created successfully"}
        except Exception as e:
            self.error_handler.log_error(e, "create_organization_webhook")
            return {"success": False, "error": str(e), "message": "Failed to create organization webhook"}