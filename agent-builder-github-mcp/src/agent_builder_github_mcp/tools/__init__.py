"""
Base tool class for all GitHub MCP tools
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from src.agent_builder_github_mcp.utils import Logger, RateLimiter, ErrorHandler


class BaseGitHubTool(ABC):
    """Base class for all GitHub tools"""
    
    def __init__(self, config, rate_limiter: RateLimiter, error_handler: ErrorHandler):
        self.config = config
        self.rate_limiter = rate_limiter
        self.error_handler = error_handler
        self.logger = Logger.get_logger(self.__class__.__name__)
    
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """Execute the tool operation (default implementation)"""
        return {"success": False, "error": "Method not implemented", "message": "This method should be overridden in subclasses"}