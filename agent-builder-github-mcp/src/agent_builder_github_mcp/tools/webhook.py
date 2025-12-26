"""
Webhook Management Tools

This module provides comprehensive webhook capabilities including:
- Webhook creation and management
- Event monitoring and handling
- Webhook security and verification
- Real-time event processing
"""

from typing import Any, Dict, List, Optional
from src.agent_builder_github_mcp.tools import BaseGitHubTool
from src.agent_builder_github_mcp.utils import GitHubAPIClient


class WebhookTools(BaseGitHubTool):
    """Webhook management tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
    
    async def create_webhook(self, owner: str, repo: str, config: Dict[str, Any], 
                           events: List[str] = ["push"], active: bool = True) -> Dict[str, Any]:
        """Create a repository webhook"""
        try:
            data = {
                "config": config,
                "events": events,
                "active": active
            }
            
            endpoint = f"repos/{owner}/{repo}/hooks"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                return {"success": True, "webhook": result, "message": "Webhook created successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "create_webhook")
            return {"success": False, "error": str(e), "message": "Failed to create webhook"}
    
    async def list_webhooks(self, owner: str, repo: str) -> Dict[str, Any]:
        """List repository webhooks"""
        try:
            endpoint = f"repos/{owner}/{repo}/hooks"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint)
                return {"success": True, "webhooks": result, "total_count": len(result), "message": "Webhooks listed successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "list_webhooks")
            return {"success": False, "error": str(e), "message": "Failed to list webhooks"}
    
    async def update_webhook(self, owner: str, repo: str, hook_id: int, 
                           config: Optional[Dict[str, Any]] = None,
                           events: Optional[List[str]] = None, active: Optional[bool] = None) -> Dict[str, Any]:
        """Update webhook configuration"""
        try:
            data = {}
            if config: data["config"] = config
            if events: data["events"] = events
            if active is not None: data["active"] = active
            
            endpoint = f"repos/{owner}/{repo}/hooks/{hook_id}"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.patch(endpoint, data)
                return {"success": True, "webhook": result, "message": "Webhook updated successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "update_webhook")
            return {"success": False, "error": str(e), "message": "Failed to update webhook"}
    
    async def delete_webhook(self, owner: str, repo: str, hook_id: int) -> Dict[str, Any]:
        """Delete webhook"""
        try:
            endpoint = f"repos/{owner}/{repo}/hooks/{hook_id}"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                success = await client.delete(endpoint)
                return {"success": True, "message": "Webhook deleted successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "delete_webhook")
            return {"success": False, "error": str(e), "message": "Failed to delete webhook"}
    
    async def get_webhook_events(self, owner: str, repo: str, hook_id: int) -> Dict[str, Any]:
        """Get webhook delivery events"""
        try:
            endpoint = f"repos/{owner}/{repo}/hooks/{hook_id}/deliveries"
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint)
                return {"success": True, "deliveries": result, "total_count": len(result), "message": "Webhook events retrieved successfully"}
                
        except Exception as e:
            self.error_handler.log_error(e, "get_webhook_events")
            return {"success": False, "error": str(e), "message": "Failed to get webhook events"}