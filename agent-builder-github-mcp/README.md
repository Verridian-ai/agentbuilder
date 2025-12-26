# Agent Builder GitHub MCP Server

A comprehensive Model Context Protocol (MCP) server providing full GitHub integration capabilities for the agent builder platform. This server enables AI agents to perform extensive GitHub operations, integrate with third-party services, and provide enhanced features like analytics and real-time collaboration.

## Features

### Core GitHub Operations
- **Repository Management**: Create, clone, fork, delete repositories
- **File Operations**: Read, write, update, delete files across repositories
- **Branch Management**: Create, switch, merge branches with conflict resolution
- **Pull Request Operations**: Create, review, merge pull requests
- **Issue Management**: Create, update, close, comment on issues
- **Commit Operations**: View commit history, create commits with detailed metadata
- **Repository Settings**: Manage permissions, collaborators, and security settings

### Agent Builder Integration
- **Neon DB Integration**: Store and manage repository metadata in PostgreSQL
- **OpenRouter API Support**: Leverage existing OpenRouter integration
- **Claude Code CLI Tools**: Connect to Claude development tools
- **File Synchronization**: Sync files between GitHub repositories and cloud IDE
- **Automated Deployment**: Trigger deployment workflows from repository events

### Enhanced Features
- **Rate Limiting**: Intelligent GitHub API rate limiting and retry logic
- **Webhook Support**: Real-time repository event handling
- **GitHub Actions**: Manage workflows and CI/CD pipelines
- **Repository Analytics**: Generate insights and usage statistics
- **Multi-Repository Support**: Handle multiple repositories simultaneously
- **Authentication Management**: Secure token handling and rotation

## Quick Start

### Prerequisites
- Python 3.10+
- GitHub Personal Access Token
- Neon DB account (for metadata storage)
- OpenRouter API access (for existing integrations)

### Installation

1. **Clone and Setup**:
   ```bash
   cd agent-builder-github-mcp
   ```

2. **Install Dependencies**:
   ```bash
   rye sync
   ```

3. **Configure Environment**:
   ```bash
   export GITHUB_TOKEN="your_github_pat_here"
   export NEON_DB_URL="your_neon_db_connection_string"
   export OPENROUTER_API_KEY="your_openrouter_api_key"
   export CLOUD_IDE_URL="https://agent-builder-339807712198.australia-southeast1.run.app"
   ```

4. **Run Server**:
   ```bash
   ./run.sh
   ```

## Usage

### Available Tools

The MCP server provides the following tool categories:

#### Repository Tools
- `create_repository`: Create new GitHub repositories
- `clone_repository`: Clone repositories with specific options
- `fork_repository`: Fork repositories to user's account
- `delete_repository`: Delete repositories with confirmation
- `get_repository_info`: Retrieve detailed repository information
- `update_repository_settings`: Modify repository configurations

#### File Operations
- `read_file`: Read file contents from repositories
- `write_file`: Create or update files
- `delete_file`: Remove files with commit history
- `list_directory`: Browse repository file structure
- `search_files`: Find files using GitHub search

#### Branch Management
- `create_branch`: Create new branches from existing ones
- `switch_branch`: Change active branch
- `merge_branch`: Merge branches with conflict detection
- `delete_branch`: Remove branches safely
- `list_branches`: View all repository branches

#### Pull Request Tools
- `create_pull_request`: Create PRs with detailed descriptions
- `review_pull_request`: Add reviews and comments
- `merge_pull_request`: Merge PRs with merge strategies
- `close_pull_request`: Close PRs without merging
- `list_pull_requests`: Filter and list PRs

#### Issue Management
- `create_issue`: Create issues with labels and assignees
- `update_issue`: Modify issue status, labels, descriptions
- `close_issue`: Close issues with resolution notes
- `comment_on_issue`: Add comments and discussions
- `list_issues`: Filter issues by various criteria

### Integration Examples

#### Neon DB Integration
```python
# Store repository metadata
from src.agent_builder_github_mcp.integrations.neon_db import NeonDBIntegration

neon = NeonDBIntegration()
neon.store_repository_metadata("owner/repo", {
    "last_sync": "2025-12-26T19:18:28Z",
    "collaborators": ["user1", "user2"],
    "status": "active"
})
```

#### OpenRouter Integration
```python
# Use existing OpenRouter API
from src.agent_builder_github_mcp.integrations.openrouter import OpenRouterIntegration

openrouter = OpenRouterIntegration()
result = await openrouter.process_repository_request("owner/repo", "analyze_code")
```

#### Cloud IDE Synchronization
```python
# Sync files with cloud IDE
from src.agent_builder_github_mcp.integrations.cloud_ide import CloudIDEIntegration

ide = CloudIDEIntegration()
await ide.sync_repository_files("owner/repo", "main")
```

## Architecture

### Project Structure
```
agent-builder-github-mcp/
├── src/agent_builder_github_mcp/
│   ├── tools/           # GitHub API tool implementations
│   ├── integrations/    # Third-party service integrations
│   └── utils/           # Shared utilities and helpers
├── tests/              # Comprehensive test suite
├── examples/           # Usage examples and demonstrations
├── server.py           # Main MCP server entry point
├── run.sh              # Server startup script
└── mcp-server.json     # MCP server configuration
```

### Key Components

#### Tools Module
- **Repository Tools**: `repository.py` - Full repository lifecycle management
- **File Operations**: `file_sync.py` - File management and synchronization
- **Branch Management**: `branch.py` - Branch operations and workflows
- **Pull Requests**: `pull_request.py` - PR creation, review, and merging
- **Issues**: `issue.py` - Issue tracking and management
- **Analytics**: `analytics.py` - Repository insights and metrics
- **Security**: `security.py` - Security scanning and compliance
- **Collaboration**: `collaboration.py` - Multi-user collaboration features
- **Deployment**: `deployment.py` - CI/CD and deployment management
- **Webhooks**: `webhook.py` - Event handling and notifications

#### Integrations Module
- **Neon DB**: PostgreSQL database integration for metadata storage
- **OpenRouter**: Existing API integration for enhanced capabilities
- **Claude Code**: Development tools and CLI integration
- **Cloud IDE**: IDE synchronization and real-time collaboration

## Configuration

### Environment Variables
```bash
# Required
GITHUB_TOKEN=your_personal_access_token

# Optional (for enhanced features)
NEON_DB_URL=postgresql://user:pass@host/db
OPENROUTER_API_KEY=your_api_key
CLOUD_IDE_URL=https://your-cloud-ide.run.app
CLAUDE_API_KEY=your_claude_key

# Development
LOG_LEVEL=INFO
DEBUG=false
```

### MCP Server Configuration
The server is configured via `mcp-server.json` with the following capabilities:
- **Type**: MCP Server (Type 3)
- **Transport**: STDIO for local tool integration
- **Tools**: 50+ GitHub operations and integrations
- **Resources**: Repository metadata and analytics
- **Prompts**: GitHub workflow templates and automation

## Security

### Authentication
- **GitHub Personal Access Token**: Secure token-based authentication
- **Token Rotation**: Automatic token refresh and validation
- **Rate Limiting**: Respect GitHub API rate limits
- **Error Handling**: Graceful degradation on API failures

### Data Protection
- **Input Validation**: All inputs validated using Pydantic models
- **Error Sanitization**: Sensitive information removed from error logs
- **Secure Storage**: Credentials stored in environment variables
- **Audit Logging**: Comprehensive operation logging

## Testing

### Running Tests
```bash
# Run all tests
rye test

# Run specific test categories
rye test tests/unit/
rye test tests/integration/
rye test tests/e2e/

# Run with coverage
rye test --cov=src
```

### Test Categories
- **Unit Tests**: Individual function and class testing
- **Integration Tests**: Service integration validation
- **End-to-End Tests**: Complete workflow testing
- **Performance Tests**: Load and stress testing

## Deployment

### Production Deployment
1. **Environment Setup**: Configure production environment variables
2. **Database Migration**: Set up Neon DB schema and initial data
3. **Service Deployment**: Deploy using the provided run.sh script
4. **Monitoring**: Enable logging and monitoring integration
5. **Health Checks**: Verify service health and dependencies

### Scaling Considerations
- **Horizontal Scaling**: Multiple server instances for load distribution
- **Caching**: Redis caching for frequently accessed data
- **Queue Management**: Background job processing for heavy operations
- **Database Optimization**: Connection pooling and query optimization

## API Reference

### Rate Limiting
- **GitHub API**: 5000 requests/hour for authenticated users
- **Retry Logic**: Exponential backoff with jitter
- **Circuit Breaker**: Automatic service degradation on failures
- **Queue Management**: Request queuing for high-traffic scenarios

### Error Handling
- **Structured Errors**: Consistent error format across all operations
- **Error Codes**: Detailed error codes for different failure scenarios
- **Logging**: Comprehensive error logging with context
- **Recovery**: Automatic retry and recovery mechanisms

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

### Code Standards
- **Python**: Follow PEP 8 style guidelines
- **Type Hints**: Use comprehensive type annotations
- **Documentation**: Docstrings for all public methods
- **Testing**: Maintain >90% test coverage

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For support and questions:
- **Documentation**: This README and inline code documentation
- **Issues**: GitHub Issues for bug reports and feature requests
- **Community**: Join our developer community for discussions

---

**Built for the Agent Builder Platform**  
*Enabling intelligent GitHub operations through AI-powered automation*