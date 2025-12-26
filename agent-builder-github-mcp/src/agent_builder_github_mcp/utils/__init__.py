"""
Utility modules for the Agent Builder GitHub MCP Server

This module provides essential utilities for:
- Configuration management
- Logging and monitoring
- Rate limiting
- Error handling
- Authentication
- Validation helpers
"""

import asyncio
import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timedelta
from functools import wraps
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Type, Union
import json
import os
from urllib.parse import urljoin

import httpx
from pydantic import BaseModel, Field, validator
from pydantic_settings import BaseSettings


class Logger:
    """Enhanced logging configuration"""
    
    _loggers = {}
    
    @classmethod
    def get_logger(cls, name: str) -> logging.Logger:
        """Get a logger instance"""
        if name not in cls._loggers:
            logger = logging.getLogger(name)
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
            logger.setLevel(logging.INFO)
            cls._loggers[name] = logger
        
        return cls._loggers[name]


class Config(BaseModel):
    """Base configuration class"""
    
    def get_env_value(self, key: str, default: Any = None) -> Any:
        """Get environment variable with fallback to default"""
        return os.getenv(key, default)
    
    def validate_required(self, **kwargs):
        """Validate that required configuration values are present"""
        missing = []
        for key, value in kwargs.items():
            if value is None or value == "":
                missing.append(key)
        
        if missing:
            raise ValueError(f"Missing required configuration: {', '.join(missing)}")


class RateLimiter:
    """Rate limiter for GitHub API calls"""
    
    def __init__(self, max_requests: int = 5000, time_window: int = 3600):
        """Initialize rate limiter
        
        Args:
            max_requests: Maximum requests per time window
            time_window: Time window in seconds (default: 1 hour)
        """
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = []
    
    async def acquire(self) -> bool:
        """Acquire a rate limit token"""
        now = time.time()
        
        # Remove old requests outside the time window
        self.requests = [req_time for req_time in self.requests 
                        if now - req_time < self.time_window]
        
        # Check if we can make a request
        if len(self.requests) >= self.max_requests:
            return False
        
        # Add current request
        self.requests.append(now)
        return True
    
    async def wait_for_slot(self):
        """Wait for an available rate limit slot"""
        while not await self.acquire():
            # Wait for the oldest request to expire
            if self.requests:
                oldest_request = min(self.requests)
                wait_time = self.time_window - (time.time() - oldest_request) + 1
                await asyncio.sleep(wait_time)
            else:
                await asyncio.sleep(1)


class ErrorHandler:
    """Centralized error handling"""
    
    def __init__(self, auth_manager = None):  # Will be AuthManager but avoid forward reference
        self.logger = Logger.get_logger(__name__)
        self.auth_manager = auth_manager
    
    def handle_github_error(self, response: httpx.Response) -> Exception:
        """Handle GitHub API errors"""
        error_data = {}
        try:
            error_data = response.json()
        except:
            pass
        
        status_code = response.status_code
        
        if status_code == 401:
            return ValueError("GitHub authentication failed. Check your token.")
        elif status_code == 403:
            return ValueError("GitHub API rate limit exceeded or insufficient permissions.")
        elif status_code == 404:
            return ValueError("GitHub resource not found.")
        elif status_code == 422:
            message = error_data.get("message", "Validation failed")
            return ValueError(f"GitHub API validation error: {message}")
        else:
            message = error_data.get("message", "Unknown GitHub API error")
            return ValueError(f"GitHub API error ({status_code}): {message}")
    
    def log_error(self, error: Exception, context: str = ""):
        """Log an error with context"""
        self.logger.error(f"Error in {context}: {error}")
    
    def handle_async_error(self, context: str = ""):
        """Decorator for handling async function errors"""
        def decorator(func: Callable):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    self.log_error(e, context or func.__name__)
                    raise
            return wrapper
        return decorator


class AuthManager:
    """Authentication manager for GitHub API"""
    
    def __init__(self, token: str):
        """Initialize authentication manager"""
        self.token = token
        self.logger = Logger.get_logger(__name__)
    
    def get_headers(self) -> Dict[str, str]:
        """Get authentication headers"""
        return {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Agent-Builder-GitHub-MCP/1.0.0"
        }
    
    async def make_request(self, client: httpx.AsyncClient, method: str, 
                          url: str, **kwargs) -> httpx.Response:
        """Make authenticated request to GitHub API"""
        headers = self.get_headers()
        
        response = await client.request(
            method=method,
            url=url,
            headers=headers,
            **kwargs
        )
        
        if response.status_code >= 400:
            raise ErrorHandler().handle_github_error(response)
        
        return response


class ValidationHelper:
    """Validation utilities"""
    
    @staticmethod
    def validate_repo_name(repo_name: str) -> bool:
        """Validate repository name"""
        import re
        pattern = r'^[a-zA-Z0-9._-]+$'
        return bool(re.match(pattern, repo_name)) and len(repo_name) <= 100
    
    @staticmethod
    def validate_branch_name(branch_name: str) -> bool:
        """Validate branch name"""
        import re
        pattern = r'^[a-zA-Z0-9._/-]+$'
        return bool(re.match(pattern, branch_name)) and len(branch_name) <= 100
    
    @staticmethod
    def validate_file_path(file_path: str) -> bool:
        """Validate file path"""
        import re
        pattern = r'^[a-zA-Z0-9._/-]+$'
        return bool(re.match(pattern, file_path)) and len(file_path) <= 400
    
    @staticmethod
    def validate_owner_repo(owner: str, repo: str) -> bool:
        """Validate owner/repo format"""
        import re
        pattern = r'^[a-zA-Z0-9._-]+$'
        return (bool(re.match(pattern, owner)) and len(owner) <= 39 and
                bool(re.match(pattern, repo)) and len(repo) <= 100)


class GitHubAPIClient:
    """GitHub API client wrapper"""
    
    def __init__(self, config: 'GitHubMCPConfig', auth_manager: AuthManager, 
                 rate_limiter: RateLimiter, error_handler: ErrorHandler):
        self.config = config
        self.auth_manager = auth_manager
        self.rate_limiter = rate_limiter
        self.error_handler = error_handler
        self.logger = Logger.get_logger(__name__)
    
    async def __aenter__(self):
        self.client = httpx.AsyncClient(
            base_url=self.config.github_api_base_url,
            timeout=self.config.github_timeout
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if hasattr(self, 'client'):
            await self.client.aclose()
    
    async def get(self, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make GET request to GitHub API"""
        await self.rate_limiter.wait_for_slot()
        url = urljoin(self.config.github_api_base_url + "/", endpoint)
        
        async with GitHubAPIClient(self.config, self.auth_manager, 
                                  self.rate_limiter, self.error_handler) as client:
            response = await client.auth_manager.make_request(
                client.client, "GET", url, **kwargs
            )
            return response.json()
    
    async def post(self, endpoint: str, data: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Make POST request to GitHub API"""
        await self.rate_limiter.wait_for_slot()
        url = urljoin(self.config.github_api_base_url + "/", endpoint)
        
        async with GitHubAPIClient(self.config, self.auth_manager, 
                                  self.rate_limiter, self.error_handler) as client:
            response = await client.auth_manager.make_request(
                client.client, "POST", url, json=data, **kwargs
            )
            return response.json()
    
    async def put(self, endpoint: str, data: Dict[str, Any] = None, **kwargs) -> Dict[str, Any]:
        """Make PUT request to GitHub API"""
        await self.rate_limiter.wait_for_slot()
        url = urljoin(self.config.github_api_base_url + "/", endpoint)
        
        async with GitHubAPIClient(self.config, self.auth_manager, 
                                  self.rate_limiter, self.error_handler) as client:
            response = await client.auth_manager.make_request(
                client.client, "PUT", url, json=data, **kwargs
            )
            return response.json()
    
    async def delete(self, endpoint: str, **kwargs) -> bool:
        """Make DELETE request to GitHub API"""
        await self.rate_limiter.wait_for_slot()
        url = urljoin(self.config.github_api_base_url + "/", endpoint)
        
        async with GitHubAPIClient(self.config, self.auth_manager, 
                                  self.rate_limiter, self.error_handler) as client:
            response = await client.auth_manager.make_request(
                client.client, "DELETE", url, **kwargs
            )
            return response.status_code == 204


class CacheManager:
    """Simple cache manager for API responses"""
    
    def __init__(self, default_ttl: int = 300):
        self.cache = {}
        self.default_ttl = default_ttl
        self.logger = Logger.get_logger(__name__)
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached value"""
        if key in self.cache:
            value, expiry = self.cache[key]
            if datetime.now() < expiry:
                return value
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, value: Any, ttl: int = None):
        """Set cached value"""
        ttl = ttl or self.default_ttl
        expiry = datetime.now() + timedelta(seconds=ttl)
        self.cache[key] = (value, expiry)
    
    def clear(self):
        """Clear all cached values"""
        self.cache.clear()


class MetricsCollector:
    """Collect and track metrics"""
    
    def __init__(self):
        self.metrics = {}
        self.logger = Logger.get_logger(__name__)
    
    def increment(self, metric_name: str, value: int = 1):
        """Increment a metric"""
        if metric_name not in self.metrics:
            self.metrics[metric_name] = 0
        self.metrics[metric_name] += value
    
    def gauge(self, metric_name: str, value: float):
        """Set a gauge metric"""
        self.metrics[metric_name] = value
    
    def timer(self, metric_name: str):
        """Timer context manager"""
        class TimerContext:
            def __init__(self, collector, name):
                self.collector = collector
                self.name = name
                self.start_time = None
            
            def __enter__(self):
                self.start_time = time.time()
                return self
            
            def __exit__(self, exc_type, exc_val, exc_tb):
                duration = time.time() - self.start_time
                self.collector.gauge(f"{self.name}_duration", duration)
        
        return TimerContext(self, metric_name)
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get all metrics"""
        return self.metrics.copy()
    
    def reset(self):
        """Reset all metrics"""
        self.metrics.clear()


class GitHubMCPConfig(BaseSettings):
    """Configuration for the GitHub MCP Server"""
    
    # GitHub Configuration
    github_token: Optional[str] = Field(default=None, description="GitHub Personal Access Token", env="GITHUB_TOKEN")
    github_api_base_url: str = Field(default="https://api.github.com", description="GitHub API base URL")
    github_timeout: int = Field(default=30, description="GitHub API timeout in seconds")
    github_rate_limit: int = Field(default=5000, description="GitHub API rate limit per hour")
    
    # Agent Builder Platform Configuration
    neon_db_url: Optional[str] = Field(default=None, description="Neon DB connection URL", env="NEON_DB_URL")
    neon_db_token: Optional[str] = Field(default=None, description="Neon DB authentication token", env="NEON_DB_TOKEN")
    openrouter_api_key: Optional[str] = Field(default=None, description="OpenRouter API key", env="OPENROUTER_API_KEY")
    claude_code_path: Optional[str] = Field(default=None, description="Claude Code CLI path", env="CLAUDE_CODE_PATH")
    cloud_ide_sync_path: Optional[str] = Field(default=None, description="Cloud IDE sync directory path", env="CLOUD_IDE_SYNC_PATH")
    
    # Deployment Configuration
    auto_deploy_enabled: bool = Field(default=False, description="Enable automated deployment workflows", env="AUTO_DEPLOY_ENABLED")
    webhook_secret: Optional[str] = Field(default=None, description="GitHub webhook secret", env="WEBHOOK_SECRET")
    deployment_environment: str = Field(default="development", description="Deployment environment", env="DEPLOYMENT_ENVIRONMENT")
    
    # Advanced Features
    enable_real_time_sync: bool = Field(default=True, description="Enable real-time synchronization", env="ENABLE_REAL_TIME_SYNC")
    enable_analytics: bool = Field(default=True, description="Enable repository analytics", env="ENABLE_ANALYTICS")
    enable_collaboration: bool = Field(default=True, description="Enable real-time collaboration features", env="ENABLE_COLLABORATION")
    cache_ttl: int = Field(default=300, description="Cache TTL in seconds", env="CACHE_TTL")
    
    class Config:
        env_prefix = "AGENT_BUILDER_GITHUB_"
        env_nested_delimiter = "__"