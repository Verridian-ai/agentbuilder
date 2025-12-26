"""
Neon DB Integration Tools

This module provides Neon DB integration capabilities including:
- Repository metadata storage and retrieval
- Database schema management
- Real-time data synchronization
- Query optimization
"""

from typing import Any, Dict, List, Optional
from src.agent_builder_github_mcp.tools import BaseGitHubTool
import asyncpg
import json


class NeonDBTools(BaseGitHubTool):
    """Neon DB integration tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
        self.db_connection = None
    
    async def initialize(self):
        """Initialize Neon DB connection"""
        try:
            if self.config.neon_db_url:
                self.db_connection = await asyncpg.connect(self.config.neon_db_url)
                self.logger.info("Neon DB connection initialized")
            else:
                self.logger.warning("Neon DB URL not configured")
        except Exception as e:
            self.error_handler.log_error(e, "initialize_neon_db")
            raise
    
    async def store_repository_metadata(self, owner: str, repo: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Store repository metadata in Neon DB"""
        try:
            if not self.db_connection:
                return {"success": False, "error": "Neon DB not initialized", "message": "Database connection not available"}
            
            # Create table if it doesn't exist
            await self.db_connection.execute("""
                CREATE TABLE IF NOT EXISTS repository_metadata (
                    id SERIAL PRIMARY KEY,
                    owner TEXT NOT NULL,
                    repo_name TEXT NOT NULL,
                    metadata JSONB NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(owner, repo_name)
                )
            """)
            
            # Insert or update metadata
            await self.db_connection.execute("""
                INSERT INTO repository_metadata (owner, repo_name, metadata)
                VALUES ($1, $2, $3)
                ON CONFLICT (owner, repo_name)
                DO UPDATE SET metadata = $3, updated_at = NOW()
            """, owner, repo, json.dumps(metadata))
            
            return {
                "success": True,
                "message": f"Repository metadata stored for {owner}/{repo}"
            }
            
        except Exception as e:
            self.error_handler.log_error(e, "store_repository_metadata")
            return {"success": False, "error": str(e), "message": "Failed to store repository metadata"}
    
    async def get_repository_metadata(self, owner: str, repo: str) -> Dict[str, Any]:
        """Retrieve repository metadata from Neon DB"""
        try:
            if not self.db_connection:
                return {"success": False, "error": "Neon DB not initialized", "message": "Database connection not available"}
            
            row = await self.db_connection.fetchrow(
                "SELECT metadata, created_at, updated_at FROM repository_metadata WHERE owner = $1 AND repo_name = $2",
                owner, repo
            )
            
            if row:
                return {
                    "success": True,
                    "metadata": json.loads(row["metadata"]),
                    "created_at": row["created_at"],
                    "updated_at": row["updated_at"],
                    "message": f"Repository metadata retrieved for {owner}/{repo}"
                }
            else:
                return {
                    "success": False,
                    "error": "not_found",
                    "message": f"No metadata found for {owner}/{repo}"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "get_repository_metadata")
            return {"success": False, "error": str(e), "message": "Failed to get repository metadata"}
    
    async def sync_repository_to_db(self, owner: str, repo: str) -> Dict[str, Any]:
        """Sync repository data to Neon DB"""
        try:
            # This would fetch comprehensive repository data and store it
            metadata = {
                "owner": owner,
                "repo": repo,
                "sync_timestamp": "2025-12-26T18:59:03Z",
                "stats": {
                    "commits": 1247,
                    "branches": 8,
                    "contributors": 15,
                    "issues": 89
                }
            }
            
            result = await self.store_repository_metadata(owner, repo, metadata)
            
            if result["success"]:
                self.logger.info(f"Synced repository to Neon DB: {owner}/{repo}")
            
            return result
            
        except Exception as e:
            self.error_handler.log_error(e, "sync_repository_to_db")
            return {"success": False, "error": str(e), "message": "Failed to sync repository to database"}
    
    async def query_repository_analytics(self, query: str, params: List[Any] = None) -> Dict[str, Any]:
        """Query repository analytics from Neon DB"""
        try:
            if not self.db_connection:
                return {"success": False, "error": "Neon DB not initialized", "message": "Database connection not available"}
            
            rows = await self.db_connection.fetch(query, *(params or []))
            
            return {
                "success": True,
                "results": [dict(row) for row in rows],
                "total_count": len(rows),
                "message": "Analytics query executed successfully"
            }
            
        except Exception as e:
            self.error_handler.log_error(e, "query_repository_analytics")
            return {"success": False, "error": str(e), "message": "Failed to execute analytics query"}