"""
Claude Code CLI Integration Tools

This module provides Claude Code CLI integration capabilities including:
- Code analysis and refactoring
- Test generation
- Documentation generation
- Code quality assessment
"""

from typing import Any, Dict, List, Optional
from src.agent_builder_github_mcp.tools import BaseGitHubTool
import subprocess
import tempfile
import os


class ClaudeCodeTools(BaseGitHubTool):
    """Claude Code CLI integration tools"""
    
    def __init__(self, config, rate_limiter, error_handler):
        super().__init__(config, rate_limiter, error_handler)
        self.claude_path = config.claude_code_path or "claude"
    
    async def initialize(self):
        """Initialize Claude Code CLI"""
        try:
            # Check if Claude CLI is available
            result = subprocess.run([self.claude_path, "--version"], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                self.logger.info(f"Claude Code CLI initialized: {result.stdout.strip()}")
            else:
                self.logger.warning("Claude Code CLI not found or not working")
        except Exception as e:
            self.error_handler.log_error(e, "initialize_claude_code")
            self.logger.warning("Failed to initialize Claude Code CLI")
    
    async def analyze_codebase(self, codebase_path: str, analysis_type: str = "general") -> Dict[str, Any]:
        """Analyze codebase using Claude Code CLI"""
        try:
            prompt = f"""
            Analyze the codebase at {codebase_path} and provide insights on:
            1. Code structure and organization
            2. Potential issues or bugs
            3. Performance bottlenecks
            4. Security vulnerabilities
            5. Code quality metrics
            6. Refactoring suggestions
            7. Documentation improvements needed
            
            Analysis type: {analysis_type}
            """
            
            # Create a temporary file with the prompt
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
                f.write(prompt)
                prompt_file = f.name
            
            try:
                result = subprocess.run([self.claude_code_path, prompt_file, codebase_path], 
                                      capture_output=True, text=True, timeout=60)
                
                if result.returncode == 0:
                    return {
                        "success": True,
                        "analysis": result.stdout,
                        "analysis_type": analysis_type,
                        "message": "Codebase analysis completed successfully"
                    }
                else:
                    return {
                        "success": False,
                        "error": result.stderr,
                        "message": "Failed to analyze codebase"
                    }
                    
            finally:
                os.unlink(prompt_file)
                
        except Exception as e:
            self.error_handler.log_error(e, "analyze_codebase")
            return {"success": False, "error": str(e), "message": "Failed to analyze codebase"}
    
    async def refactor_code(self, code_path: str, refactoring_type: str = "general", 
                          target_language: Optional[str] = None) -> Dict[str, Any]:
        """Refactor code using Claude Code CLI"""
        try:
            prompt = f"""
            Refactor the code in {code_path} with the following requirements:
            1. Refactoring type: {refactoring_type}
            2. Target language: {target_language or 'auto-detect'}
            3. Maintain functionality while improving:
               - Code readability
               - Performance
               - Maintainability
               - Best practices adherence
            
            Provide:
            1. Refactored code
            2. Summary of changes made
            3. Benefits of the refactoring
            4. Potential impact assessment
            """
            
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
                f.write(prompt)
                prompt_file = f.name
            
            try:
                result = subprocess.run([self.claude_code_path, prompt_file, code_path], 
                                      capture_output=True, text=True, timeout=120)
                
                if result.returncode == 0:
                    return {
                        "success": True,
                        "refactored_code": result.stdout,
                        "refactoring_type": refactoring_type,
                        "message": "Code refactoring completed successfully"
                    }
                else:
                    return {
                        "success": False,
                        "error": result.stderr,
                        "message": "Failed to refactor code"
                    }
                    
            finally:
                os.unlink(prompt_file)
                
        except Exception as e:
            self.error_handler.log_error(e, "refactor_code")
            return {"success": False, "error": str(e), "message": "Failed to refactor code"}
    
    async def generate_tests(self, code_path: str, test_framework: str = "pytest", 
                           coverage_target: str = "80%") -> Dict[str, Any]:
        """Generate test cases using Claude Code CLI"""
        try:
            prompt = f"""
            Generate comprehensive test cases for the code in {code_path}:
            1. Test framework: {test_framework}
            2. Coverage target: {coverage_target}
            3. Include:
               - Unit tests
               - Integration tests
               - Edge case tests
               - Error handling tests
               - Performance tests (if applicable)
            
            Provide:
            1. Complete test code
            2. Test coverage analysis
            3. Test execution instructions
            4. Mock/stub requirements
            5. Test data requirements
            """
            
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
                f.write(prompt)
                prompt_file = f.name
            
            try:
                result = subprocess.run([self.claude_code_path, prompt_file, code_path], 
                                      capture_output=True, text=True, timeout=120)
                
                if result.returncode == 0:
                    return {
                        "success": True,
                        "test_code": result.stdout,
                        "test_framework": test_framework,
                        "coverage_target": coverage_target,
                        "message": "Test generation completed successfully"
                    }
                else:
                    return {
                        "success": False,
                        "error": result.stderr,
                        "message": "Failed to generate tests"
                    }
                    
            finally:
                os.unlink(prompt_file)
                
        except Exception as e:
            self.error_handler.log_error(e, "generate_tests")
            return {"success": False, "error": str(e), "message": "Failed to generate tests"}