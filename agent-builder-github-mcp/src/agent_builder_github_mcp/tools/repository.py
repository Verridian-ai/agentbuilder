"""
Repository Management Tools

This module provides comprehensive repository management capabilities including:
- Repository creation, forking, deletion
- File operations (read, write, update, delete)
- Repository settings and permissions
- Repository analytics and insights
"""

from typing import Any, Dict, List, Optional, Union
from src.agent_builder_github_mcp.tools import BaseGitHubTool
from src.agent_builder_github_mcp.utils import GitHubAPIClient, ValidationHelper
from fastmcp import FastMCP

class RepositoryTools(BaseGitHubTool):
    """Repository management tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
    
    async def create_repository(
        self,
        name: str,
        description: Optional[str] = None,
        private: bool = False,
        auto_init: bool = True,
        gitignore_template: Optional[str] = None,
        license_template: Optional[str] = None,
        organization: Optional[str] = None,
        team_slug: Optional[str] = None,
        has_issues: bool = True,
        has_projects: bool = True,
        has_wiki: bool = True,
        is_template: bool = False,
        homepage: Optional[str] = None,
        allow_squash_merge: bool = True,
        allow_merge_commit: bool = True,
        allow_rebase_merge: bool = True,
        delete_branch_on_merge: bool = False,
        has_downloads: bool = True,
        allow_auto_merge: bool = False,
        vulnerability_alerts: bool = True,
        automated_security_fixes: bool = True,
        create_branch: bool = False,
        default_branch: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new GitHub repository
        
        Args:
            name: Repository name
            description: Repository description
            private: Whether repository should be private
            auto_init: Initialize with README
            gitignore_template: Gitignore template to use
            license_template: License template to use
            organization: Organization to create repo in
            team_slug: Team slug for permissions
            has_issues: Enable issues
            has_projects: Enable projects
            has_wiki: Enable wiki
            is_template: Enable as template repository
            homepage: Repository homepage URL
            allow_squash_merge: Allow squash merging
            allow_merge_commit: Allow merge commits
            allow_rebase_merge: Allow rebase merging
            delete_branch_on_merge: Delete branch on merge
            has_downloads: Enable downloads
            allow_auto_merge: Allow auto merge
            vulnerability_alerts: Enable vulnerability alerts
            automated_security_fixes: Enable automated security fixes
            create_branch: Create initial branch
            default_branch: Default branch name
        
        Returns:
            Created repository data
        """
        try:
            if not ValidationHelper.validate_repo_name(name):
                raise ValueError("Invalid repository name")
            
            data = {
                "name": name,
                "description": description,
                "private": private,
                "auto_init": auto_init,
                "has_issues": has_issues,
                "has_projects": has_projects,
                "has_wiki": has_wiki,
                "has_downloads": has_downloads,
                "allow_squash_merge": allow_squash_merge,
                "allow_merge_commit": allow_merge_commit,
                "allow_rebase_merge": allow_rebase_merge,
                "delete_branch_on_merge": delete_branch_on_merge,
                "allow_auto_merge": allow_auto_merge,
                "vulnerability_alerts": vulnerability_alerts,
                "automated_security_fixes": automated_security_fixes,
                "is_template": is_template
            }
            
            if gitignore_template:
                data["gitignore_template"] = gitignore_template
            if license_template:
                data["license_template"] = license_template
            if homepage:
                data["homepage"] = homepage
            if default_branch:
                data["default_branch"] = default_branch
            
            endpoint = f"user/repos" if not organization else f"orgs/{organization}/repos"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                
                self.logger.info(f"Created repository: {name}")
                return {
                    "success": True,
                    "repository": result,
                    "message": f"Repository '{name}' created successfully"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "create_repository")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to create repository '{name}'"
            }
    
    async def fork_repository(
        self,
        owner: str,
        repo: str,
        organization: Optional[str] = None,
        name: Optional[str] = None,
        description: Optional[str] = None,
        private: bool = False
    ) -> Dict[str, Any]:
        """Fork a repository
        
        Args:
            owner: Repository owner
            repo: Repository name
            organization: Organization to fork to
            name: Name for the fork
            description: Description for the fork
            private: Whether fork should be private
        
        Returns:
            Forked repository data
        """
        try:
            if not ValidationHelper.validate_owner_repo(owner, repo):
                raise ValueError("Invalid owner/repo format")
            
            data = {}
            if organization:
                data["organization"] = organization
            if name:
                data["name"] = name
            if description:
                data["description"] = description
            data["private"] = private
            
            endpoint = f"repos/{owner}/{repo}/forks"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.post(endpoint, data)
                
                fork_name = result.get("name", name or repo)
                self.logger.info(f"Forked repository {owner}/{repo} as {fork_name}")
                return {
                    "success": True,
                    "repository": result,
                    "message": f"Successfully forked {owner}/{repo}"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "fork_repository")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to fork repository {owner}/{repo}"
            }
    
    async def delete_repository(
        self,
        owner: str,
        repo: str,
        confirm: bool = False
    ) -> Dict[str, Any]:
        """Delete a repository
        
        Args:
            owner: Repository owner
            repo: Repository name
            confirm: Confirmation flag (must be True to proceed)
        
        Returns:
            Deletion result
        """
        try:
            if not confirm:
                return {
                    "success": False,
                    "error": "Deletion not confirmed",
                    "message": "Set confirm=True to delete repository"
                }
            
            if not ValidationHelper.validate_owner_repo(owner, repo):
                raise ValueError("Invalid owner/repo format")
            
            endpoint = f"repos/{owner}/{repo}"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                success = await client.delete(endpoint)
                
                self.logger.warning(f"Deleted repository: {owner}/{repo}")
                return {
                    "success": True,
                    "message": f"Repository {owner}/{repo} deleted successfully"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "delete_repository")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to delete repository {owner}/{repo}"
            }
    
    async def get_repository(
        self,
        owner: str,
        repo: str,
        ref: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get repository information
        
        Args:
            owner: Repository owner
            repo: Repository name
            ref: Git reference (branch, tag, or commit SHA)
        
        Returns:
            Repository data
        """
        try:
            if not ValidationHelper.validate_owner_repo(owner, repo):
                raise ValueError("Invalid owner/repo format")
            
            endpoint = f"repos/{owner}/{repo}"
            params = {}
            if ref:
                params["ref"] = ref
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                
                return {
                    "success": True,
                    "repository": result,
                    "message": f"Retrieved repository {owner}/{repo}"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "get_repository")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to get repository {owner}/{repo}"
            }
    
    async def list_repositories(
        self,
        owner: Optional[str] = None,
        org: Optional[str] = None,
        type: str = "all",
        sort: str = "updated",
        direction: str = "desc",
        per_page: int = 30,
        page: int = 1,
        visibility: Optional[str] = None,
        affiliation: Optional[str] = None,
        since: Optional[str] = None,
        exclude_gits: bool = False
    ) -> Dict[str, Any]:
        """List repositories
        
        Args:
            owner: Specific user/organization
            org: Organization name
            type: Type of repositories (all, owner, public, private, member)
            sort: Sort by (created, updated, pushed, full_name)
            direction: Sort direction (asc, desc)
            per_page: Results per page (max 100)
            page: Page number
            visibility: Repository visibility (all, public, private)
            affiliation: Comma-separated list (owner, collaborator, organization_member)
            since: Only repositories updated after this ISO 8601 timestamp
            exclude_gits: Exclude git repositories
        
        Returns:
            List of repositories
        """
        try:
            params = {
                "type": type,
                "sort": sort,
                "direction": direction,
                "per_page": per_page,
                "page": page
            }
            
            if visibility:
                params["visibility"] = visibility
            if affiliation:
                params["affiliation"] = affiliation
            if since:
                params["since"] = since
            if exclude_gits:
                params["exclude_gits"] = exclude_gits
            
            if owner:
                endpoint = f"users/{owner}/repos"
            elif org:
                endpoint = f"orgs/{org}/repos"
            else:
                endpoint = "user/repos"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                
                return {
                    "success": True,
                    "repositories": result,
                    "total_count": len(result),
                    "page": page,
                    "per_page": per_page,
                    "message": f"Retrieved {len(result)} repositories"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "list_repositories")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to list repositories"
            }
    
    async def update_repository(
        self,
        owner: str,
        repo: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        homepage: Optional[str] = None,
        private: Optional[bool] = None,
        has_issues: Optional[bool] = None,
        has_projects: Optional[bool] = None,
        has_wiki: Optional[bool] = None,
        has_downloads: Optional[bool] = None,
        is_template: Optional[bool] = None,
        default_branch: Optional[str] = None,
        allow_squash_merge: Optional[bool] = None,
        allow_merge_commit: Optional[bool] = None,
        allow_rebase_merge: Optional[bool] = None,
        delete_branch_on_merge: Optional[bool] = None,
        allow_auto_merge: Optional[bool] = None,
        vulnerability_alerts: Optional[bool] = None,
        automated_security_fixes: Optional[bool] = None,
        archived: Optional[bool] = None
    ) -> Dict[str, Any]:
        """Update repository settings
        
        Args:
            owner: Repository owner
            repo: Repository name
            name: New repository name
            description: New description
            homepage: New homepage URL
            private: Change privacy setting
            has_issues: Enable/disable issues
            has_projects: Enable/disable projects
            has_wiki: Enable/disable wiki
            has_downloads: Enable/disable downloads
            is_template: Enable/disable as template
            default_branch: Default branch name
            allow_squash_merge: Allow squash merging
            allow_merge_commit: Allow merge commits
            allow_rebase_merge: Allow rebase merging
            delete_branch_on_merge: Delete branch on merge
            allow_auto_merge: Allow auto merge
            vulnerability_alerts: Enable vulnerability alerts
            automated_security_fixes: Enable automated security fixes
            archived: Archive/unarchive repository
        
        Returns:
            Updated repository data
        """
        try:
            if not ValidationHelper.validate_owner_repo(owner, repo):
                raise ValueError("Invalid owner/repo format")
            
            data = {}
            if name is not None:
                if not ValidationHelper.validate_repo_name(name):
                    raise ValueError("Invalid repository name")
                data["name"] = name
            if description is not None:
                data["description"] = description
            if homepage is not None:
                data["homepage"] = homepage
            if private is not None:
                data["private"] = private
            if has_issues is not None:
                data["has_issues"] = has_issues
            if has_projects is not None:
                data["has_projects"] = has_projects
            if has_wiki is not None:
                data["has_wiki"] = has_wiki
            if has_downloads is not None:
                data["has_downloads"] = has_downloads
            if is_template is not None:
                data["is_template"] = is_template
            if default_branch is not None:
                data["default_branch"] = default_branch
            if allow_squash_merge is not None:
                data["allow_squash_merge"] = allow_squash_merge
            if allow_merge_commit is not None:
                data["allow_merge_commit"] = allow_merge_commit
            if allow_rebase_merge is not None:
                data["allow_rebase_merge"] = allow_rebase_merge
            if delete_branch_on_merge is not None:
                data["delete_branch_on_merge"] = delete_branch_on_merge
            if allow_auto_merge is not None:
                data["allow_auto_merge"] = allow_auto_merge
            if vulnerability_alerts is not None:
                data["vulnerability_alerts"] = vulnerability_alerts
            if automated_security_fixes is not None:
                data["automated_security_fixes"] = automated_security_fixes
            if archived is not None:
                data["archived"] = archived
            
            endpoint = f"repos/{owner}/{repo}"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.patch(endpoint, data)
                
                self.logger.info(f"Updated repository: {owner}/{repo}")
                return {
                    "success": True,
                    "repository": result,
                    "message": f"Repository {owner}/{repo} updated successfully"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "update_repository")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to update repository {owner}/{repo}"
            }
    
    async def get_repository_contents(
        self,
        owner: str,
        repo: str,
        path: str = "",
        ref: Optional[str] = None,
        per_page: int = 100,
        page: int = 1
    ) -> Dict[str, Any]:
        """Get repository contents (files and directories)
        
        Args:
            owner: Repository owner
            repo: Repository name
            path: Path within repository
            ref: Git reference (branch, tag, or commit SHA)
            per_page: Items per page (max 100)
            page: Page number
        
        Returns:
            Repository contents
        """
        try:
            if not ValidationHelper.validate_owner_repo(owner, repo):
                raise ValueError("Invalid owner/repo format")
            
            params = {
                "per_page": per_page,
                "page": page
            }
            
            if ref:
                params["ref"] = ref
            
            endpoint = f"repos/{owner}/{repo}/contents/{path}"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.get(endpoint, params=params)
                
                return {
                    "success": True,
                    "contents": result,
                    "path": path,
                    "total_count": len(result) if isinstance(result, list) else 1,
                    "message": f"Retrieved contents of {path or '/'}"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "get_repository_contents")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to get contents for {owner}/{repo}/{path}"
            }
    
    async def create_or_update_file(
        self,
        owner: str,
        repo: str,
        path: str,
        content: str,
        message: str,
        branch: str = "main",
        sha: Optional[str] = None,
        committer: Optional[Dict[str, str]] = None,
        author: Optional[Dict[str, str]] = None,
        encoding: str = "utf-8"
    ) -> Dict[str, Any]:
        """Create or update a file in repository
        
        Args:
            owner: Repository owner
            repo: Repository name
            path: File path
            content: File content
            commit: Commit message
            branch: Branch name
            sha: SHA of existing file (for updates)
            committer: Committer info (name, email)
            author: Author info (name, email)
            encoding: Content encoding
        
        Returns:
            File operation result
        """
        try:
            if not ValidationHelper.validate_owner_repo(owner, repo):
                raise ValueError("Invalid owner/repo format")
            
            if not ValidationHelper.validate_file_path(path):
                raise ValueError("Invalid file path")
            
            import base64
            encoded_content = base64.b64encode(content.encode(encoding)).decode('ascii')
            
            data = {
                "message": message,
                "content": encoded_content,
                "branch": branch
            }
            
            if sha:
                data["sha"] = sha
            if committer:
                data["committer"] = committer
            if author:
                data["author"] = author
            
            endpoint = f"repos/{owner}/{repo}/contents/{path}"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.put(endpoint, data)
                
                action = "updated" if sha else "created"
                self.logger.info(f"{action.title()} file: {owner}/{repo}/{path}")
                return {
                    "success": True,
                    "file": result,
                    "action": action,
                    "message": f"Successfully {action} file {path}"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "create_or_update_file")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to create/update file {path}"
            }
    
    async def delete_file(
        self,
        owner: str,
        repo: str,
        path: str,
        message: str,
        branch: str = "main",
        sha: Optional[str] = None,
        committer: Optional[Dict[str, str]] = None,
        author: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Delete a file from repository
        
        Args:
            owner: Repository owner
            repo: Repository name
            path: File path
            commit: Commit message
            branch: Branch name
            sha: SHA of file to delete
            committer: Committer info (name, email)
            author: Author info (name, email)
        
        Returns:
            File deletion result
        """
        try:
            if not ValidationHelper.validate_owner_repo(owner, repo):
                raise ValueError("Invalid owner/repo format")
            
            if not ValidationHelper.validate_file_path(path):
                raise ValueError("Invalid file path")
            
            # First, get the file to get its SHA
            if not sha:
                contents_result = await self.get_repository_contents(owner, repo, path)
                if contents_result["success"]:
                    file_info = contents_result["contents"]
                    if isinstance(file_info, list):
                        raise ValueError("Path is a directory, not a file")
                    sha = file_info.get("sha")
            
            if not sha:
                raise ValueError("File SHA is required")
            
            data = {
                "message": message,
                "sha": sha,
                "branch": branch
            }
            
            if committer:
                data["committer"] = committer
            if author:
                data["author"] = author
            
            endpoint = f"repos/{owner}/{repo}/contents/{path}"
            
            async with GitHubAPIClient(self.config, self.error_handler.auth_manager, 
                                      self.rate_limiter, self.error_handler) as client:
                result = await client.delete(endpoint, json=data)
                
                self.logger.warning(f"Deleted file: {owner}/{repo}/{path}")
                return {
                    "success": True,
                    "commit": result,
                    "message": f"Successfully deleted file {path}"
                }
                
        except Exception as e:
            self.error_handler.log_error(e, "delete_file")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to delete file {path}"
            }
    
    async def move_file(
        self,
        owner: str,
        repo: str,
        path: str,
        new_path: str,
        message: str,
        branch: str = "main",
        sha: Optional[str] = None,
        committer: Optional[Dict[str, str]] = None,
        author: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Move or rename a file in repository
        
        Args:
            owner: Repository owner
            repo: Repository name
            path: Current file path
            new_path: New file path
            commit: Commit message
            branch: Branch name
            sha: SHA of file to move
            committer: Committer info (name, email)
            author: Author info (name, email)
        
        Returns:
            File move result
        """
        try:
            if not ValidationHelper.validate_owner_repo(owner, repo):
                raise ValueError("Invalid owner/repo format")
            
            if not ValidationHelper.validate_file_path(path):
                raise ValueError("Invalid current file path")
            
            if not ValidationHelper.validate_file_path(new_path):
                raise ValueError("Invalid new file path")
            
            # First, get the file to get its content and SHA
            if not sha:
                contents_result = await self.get_repository_contents(owner, repo, path)
                if contents_result["success"]:
                    file_info = contents_result["contents"]
                    if isinstance(file_info, list):
                        raise ValueError("Path is a directory, not a file")
                    sha = file_info.get("sha")
                    content = file_info.get("content", "")
            
            if not sha or not content:
                raise ValueError("Unable to get file content and SHA")
            
            # Create the file at the new location
            create_result = await self.create_or_update_file(
                owner=owner,
                repo=repo,
                path=new_path,
                content=content,
                message=message,
                branch=branch,
                committer=committer,
                author=author
            )
            
            if not create_result["success"]:
                return create_result
            
            # Delete the old file
            delete_result = await self.delete_file(
                owner=owner,
                repo=repo,
                path=path,
                message=f"Delete {path} (moved to {new_path})",
                branch=branch,
                sha=sha,
                committer=committer,
                author=author
            )
            
            self.logger.info(f"Moved file: {owner}/{repo}/{path} -> {new_path}")
            return {
                "success": True,
                "new_file": create_result.get("file"),
                "old_file_deleted": delete_result["success"],
                "message": f"Successfully moved file {path} to {new_path}"
            }
            
        except Exception as e:
            self.error_handler.log_error(e, "move_file")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to move file from {path} to {new_path}"
            }