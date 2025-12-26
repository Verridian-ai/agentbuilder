"""
Issue Management Tools

This module provides comprehensive issue management capabilities including:
- Issue creation, updating, and closing
- Issue commenting and labeling
- Issue assignment and filtering
- Issue template management
"""

from typing import Any, Dict, List, Optional, Union
from src.agent_builder_github_mcp.tools import BaseGitHubTool
from src.agent_builder_github_mcp.utils import GitHubAPIClient, ValidationHelper


class IssueTools(BaseGitHubTool):
    """Issue management tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
    
    async def create_issue(
        self,
        owner: str,
        repo: str,
        title: str,
        body: Optional[str] = None,
        assignees: Optional[List[str]] = None,
        milestone: Optional[str] = None,
        labels: Optional[List[str]] = None,
        draft: bool = False
    ) -> Dict[str, Any]:
        """Create a new issue
        
        Args:
            owner: Repository owner
            repo: Repository name
            title: Issue title
            body: Issue body content
            assignees: List of usernames to assign
            milestone: Milestone number or title
            labels: List of labels to apply
            draft: Create as draft issue
        
        Returns:
            Created issue data
        """
        try:
            data = {
                "title": title,
                "body": body,
                "draft": draft
            }
            
            if assignees:
                data["assignees"] = assignees
            if milestone:
                data["milestone"] = milestone
            if labels:
                data["labels"] = labels
            
            endpoint = f"repos/{owner}/{repo}/issues"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                
                self.logger.info(f"Created issue: {title} in {owner}/{repo}")
                return {
                    "success": True,
                    "issue": result,
                    "message": f"Issue '{title}' created successfully"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "create_issue")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to create issue '{title}'"
            }
    
    async def get_issue(
        self,
        owner: str,
        repo: str,
        issue_number: int
    ) -> Dict[str, Any]:
        """Get issue details
        
        Args:
            owner: Repository owner
            repo: Repository name
            issue_number: Issue number
        
        Returns:
            Issue data
        """
        try:
            endpoint = f"repos/{owner}/{repo}/issues/{issue_number}"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint)
                
                return {
                    "success": True,
                    "issue": result,
                    "message": f"Retrieved issue #{issue_number}"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "get_issue")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to get issue #{issue_number}"
            }
    
    async def update_issue(
        self,
        owner: str,
        repo: str,
        issue_number: int,
        title: Optional[str] = None,
        body: Optional[str] = None,
        state: Optional[str] = None,
        assignees: Optional[List[str]] = None,
        milestone: Optional[str] = None,
        labels: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Update an issue
        
        Args:
            owner: Repository owner
            repo: Repository name
            issue_number: Issue number
            title: New issue title
            body: New issue body
            state: New state (open, closed)
            assignees: New assignees list
            milestone: New milestone
            labels: New labels list
        
        Returns:
            Updated issue data
        """
        try:
            data = {}
            if title is not None:
                data["title"] = title
            if body is not None:
                data["body"] = body
            if state is not None:
                data["state"] = state
            if assignees is not None:
                data["assignees"] = assignees
            if milestone is not None:
                data["milestone"] = milestone
            if labels is not None:
                data["labels"] = labels
            
            endpoint = f"repos/{owner}/{repo}/issues/{issue_number}"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.patch(endpoint, data)
                
                self.logger.info(f"Updated issue #{issue_number}")
                return {
                    "success": True,
                    "issue": result,
                    "message": f"Issue #{issue_number} updated successfully"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "update_issue")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to update issue #{issue_number}"
            }
    
    async def list_issues(
        self,
        owner: str,
        repo: str,
        state: str = "open",
        labels: Optional[List[str]] = None,
        sort: str = "created",
        direction: str = "desc",
        since: Optional[str] = None,
        assignee: Optional[str] = None,
        creator: Optional[str] = None,
        mentioned: Optional[str] = None,
        milestone: Optional[str] = None,
        per_page: int = 30,
        page: int = 1
    ) -> Dict[str, Any]:
        """List repository issues
        
        Args:
            owner: Repository owner
            repo: Repository name
            state: Issue state (open, closed, all)
            labels: Filter by labels
            sort: Sort by (created, updated, comments)
            direction: Sort direction (asc, desc)
            since: Only issues updated after this date
            assignee: Filter by assignee
            creator: Filter by creator
            mentioned: Filter by mentioned user
            milestone: Filter by milestone
            per_page: Results per page
            page: Page number
        
        Returns:
            List of issues
        """
        try:
            params = {
                "state": state,
                "sort": sort,
                "direction": direction,
                "per_page": per_page,
                "page": page
            }
            
            if labels:
                params["labels"] = ",".join(labels)
            if since:
                params["since"] = since
            if assignee:
                params["assignee"] = assignee
            if creator:
                params["creator"] = creator
            if mentioned:
                params["mentioned"] = mentioned
            if milestone:
                params["milestone"] = milestone
            
            endpoint = f"repos/{owner}/{repo}/issues"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                
                return {
                    "success": True,
                    "issues": result,
                    "total_count": len(result),
                    "page": page,
                    "per_page": per_page,
                    "message": f"Retrieved {len(result)} issues"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "list_issues")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to list issues"
            }
    
    async def close_issue(
        self,
        owner: str,
        repo: str,
        issue_number: int
    ) -> Dict[str, Any]:
        """Close an issue
        
        Args:
            owner: Repository owner
            repo: Repository name
            issue_number: Issue number
        
        Returns:
            Issue closure result
        """
        return await self.update_issue(owner, repo, issue_number, state="closed")
    
    async def add_issue_comment(
        self,
        owner: str,
        repo: str,
        issue_number: int,
        body: str
    ) -> Dict[str, Any]:
        """Add a comment to an issue
        
        Args:
            owner: Repository owner
            repo: Repository name
            issue_number: Issue number
            body: Comment body
        
        Returns:
            Comment data
        """
        try:
            data = {"body": body}
            endpoint = f"repos/{owner}/{repo}/issues/{issue_number}/comments"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                
                self.logger.info(f"Added comment to issue #{issue_number}")
                return {
                    "success": True,
                    "comment": result,
                    "message": "Comment added successfully"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "add_issue_comment")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to add comment"
            }
    
    async def get_issue_comments(
        self,
        owner: str,
        repo: str,
        issue_number: int,
        since: Optional[str] = None,
        per_page: int = 30,
        page: int = 1
    ) -> Dict[str, Any]:
        """Get issue comments
        
        Args:
            owner: Repository owner
            repo: Repository name
            issue_number: Issue number
            since: Only comments updated after this date
            per_page: Comments per page
            page: Page number
        
        Returns:
            List of comments
        """
        try:
            params = {
                "per_page": per_page,
                "page": page
            }
            
            if since:
                params["since"] = since
            
            endpoint = f"repos/{owner}/{repo}/issues/{issue_number}/comments"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                
                return {
                    "success": True,
                    "comments": result,
                    "total_count": len(result),
                    "page": page,
                    "per_page": per_page,
                    "message": f"Retrieved {len(result)} comments"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "get_issue_comments")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to get comments"
            }
    
    async def label_issue(
        self,
        owner: str,
        repo: str,
        issue_number: int,
        labels: List[str]
    ) -> Dict[str, Any]:
        """Label an issue
        
        Args:
            owner: Repository owner
            repo: Repository name
            issue_number: Issue number
            labels: List of labels to apply
        
        Returns:
            Updated issue data
        """
        return await self.update_issue(owner, repo, issue_number, labels=labels)
    
    async def assign_issue(
        self,
        owner: str,
        repo: str,
        issue_number: int,
        assignees: List[str]
    ) -> Dict[str, Any]:
        """Assign an issue
        
        Args:
            owner: Repository owner
            repo: Repository name
            issue_number: Issue number
            assignees: List of usernames to assign
        
        Returns:
            Updated issue data
        """
        return await self.update_issue(owner, repo, issue_number, assignees=assignees)
    
    async def create_issue_template(
        self,
        owner: str,
        repo: str,
        template_name: str,
        title: str,
        body: str,
        labels: Optional[List[str]] = None,
        assignees: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Create an issue template
        
        Args:
            owner: Repository owner
            repo: Repository name
            template_name: Template filename
            title: Template title
            body: Template body
            labels: Default labels
            assignees: Default assignees
        
        Returns:
            Template creation result
        """
        try:
            import os
            
            # Create template directory if it doesn't exist
            template_dir = ".github/ISSUE_TEMPLATE"
            
            # Create template content
            template_content = f"""---
name: {title}
about: {body}
title: ''
labels: {', '.join(labels) if labels else ''}
assignees: {', '.join(assignees) if assignees else ''}
---

<!-- Provide a general summary of the issue in the Title above -->

## Expected Behavior
<!-- Describe what you expected to happen -->

## Actual Behavior
<!-- Describe what actually happened -->

## Steps to Reproduce
<!-- List the steps to reproduce the issue -->
1. 
2. 
3. 

## Environment
<!-- Any relevant environment information -->
"""
            
            # Create the template file in the repository
            result = await self.create_or_update_file(
                owner=owner,
                repo=repo,
                path=f"{template_dir}/{template_name}.md",
                content=template_content,
                message=f"Add issue template: {title}",
                branch="main"
            )
            
            if result["success"]:
                self.logger.info(f"Created issue template: {template_name}")
            
            return result
            
        except Exception as e:
            self.error_handler.log_error(e, "create_issue_template")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to create issue template"
            }