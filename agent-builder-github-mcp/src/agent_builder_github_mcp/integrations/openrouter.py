"""
OpenRouter API Integration Tools

This module provides OpenRouter integration capabilities including:
- AI-powered code review generation
- Repository analysis and insights
- PR description generation
- Code quality assessment
"""

from typing import Any, Dict, List, Optional
from src.agent_builder_github_mcp.tools import BaseGitHubTool
import httpx


class OpenRouterTools(BaseGitHubTool):
    """OpenRouter API integration tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
        self.api_key = config.openrouter_api_key
        self.base_url = "https://openrouter.ai/api/v1"
    
    async def initialize(self):
        """Initialize OpenRouter API client"""
        if not self.api_key:
            self.logger.warning("OpenRouter API key not configured")
        else:
            self.logger.info("OpenRouter API client initialized")
    
    async def generate_code_review(self, code_diff: str, context: str = "") -> Dict[str, Any]:
        """Generate AI-powered code review"""
        try:
            if not self.api_key:
                return {"success": False, "error": "OpenRouter API key not configured", "message": "OpenRouter integration not available"}
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://agent-builder-github-mcp",
                "X-Title": "Agent Builder GitHub MCP"
            }
            
            prompt = f"""
            Please review the following code changes and provide a comprehensive code review:
            
            Code Changes:
            {code_diff}
            
            Context:
            {context}
            
            Provide feedback on:
            1. Code quality and best practices
            2. Potential bugs or issues
            3. Performance considerations
            4. Security concerns
            5. Suggestions for improvement
            6. Overall assessment and recommendation
            """
            
            data = {
                "model": "anthropic/claude-3.5-sonnet",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 2000,
                "temperature": 0.3
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.base_url}/chat/completions", 
                                           headers=headers, json=data, timeout=30)
                response.raise_for_status()
                
                result = response.json()
                review = result["choices"][0]["message"]["content"]
                
                return {
                    "success": True,
                    "review": review,
                    "model": "anthropic/claude-3.5-sonnet",
                    "message": "Code review generated successfully"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "generate_code_review")
            return {"success": False, "error": str(e), "message": "Failed to generate code review"}
    
    async def analyze_repository(self, repository_info: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze repository and provide insights"""
        try:
            if not self.api_key:
                return {"success": False, "error": "OpenRouter API key not configured", "message": "OpenRouter integration not available"}
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://agent-builder-github-mcp",
                "X-Title": "Agent Builder GitHub MCP"
            }
            
            prompt = f"""
            Analyze the following repository and provide insights:
            
            Repository Information:
            {json.dumps(repository_info, indent=2)}
            
            Please analyze:
            1. Project structure and organization
            2. Code quality indicators
            3. Technology stack assessment
            4. Development maturity
            5. Potential improvements
            6. Risk assessment
            7. Recommendations for optimization
            """
            
            data = {
                "model": "anthropic/claude-3.5-sonnet",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 2000,
                "temperature": 0.3
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.base_url}/chat/completions", 
                                           headers=headers, json=data, timeout=30)
                response.raise_for_status()
                
                result = response.json()
                analysis = result["choices"][0]["message"]["content"]
                
                return {
                    "success": True,
                    "analysis": analysis,
                    "model": "anthropic/claude-3.5-sonnet",
                    "message": "Repository analysis completed"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "analyze_repository")
            return {"success": False, "error": str(e), "message": "Failed to analyze repository"}
    
    async def generate_pr_description(self, pr_changes: Dict[str, Any]) -> Dict[str, Any]:
        """Generate PR description using AI"""
        try:
            if not self.api_key:
                return {"success": False, "error": "OpenRouter API key not configured", "message": "OpenRouter integration not available"}
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://agent-builder-github-mcp",
                "X-Title": "Agent Builder GitHub MCP"
            }
            
            prompt = f"""
            Generate a professional pull request description for the following changes:
            
            PR Changes:
            {json.dumps(pr_changes, indent=2)}
            
            Please create:
            1. Clear and concise title
            2. Detailed description explaining the changes
            3. List of files modified
            4. Breaking changes section (if applicable)
            5. Testing instructions
            6. Screenshots/examples (placeholder)
            7. Checklist for reviewers
            """
            
            data = {
                "model": "anthropic/claude-3.5-sonnet",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 1500,
                "temperature": 0.4
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.base_url}/chat/completions", 
                                           headers=headers, json=data, timeout=30)
                response.raise_for_status()
                
                result = response.json()
                description = result["choices"][0]["message"]["content"]
                
                return {
                    "success": True,
                    "description": description,
                    "model": "anthropic/claude-3.5-sonnet",
                    "message": "PR description generated successfully"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "generate_pr_description")
            return {"success": False, "error": str(e), "message": "Failed to generate PR description"}