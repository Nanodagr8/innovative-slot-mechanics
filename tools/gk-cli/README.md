# GitKraken CLI

The GitKraken CLI (`gk`) is a powerful command-line tool that brings GitKraken's comprehensive Git and DevOps workflow capabilities to your terminal. It provides seamless integration with GitHub, GitLab, Bitbucket, Azure DevOps, Jira, and other popular platforms, along with a Model Context Protocol (MCP) server for AI-powered development workflows.

## Overview

The GitKraken CLI combines:

- **Git Operations**: Full-featured Git command execution with enhanced UI
- **Issue Management**: Track and manage issues across multiple platforms (Jira, GitHub, GitLab, etc.)
- **Pull Request Workflows**: Create, review, and manage pull requests
- **Workspace Management**: Organize and sync repositories across teams
- **MCP Server**: Provide AI agents with access to Git operations and DevOps tools
- **Cloud Sync**: Sync settings and workspaces across machines

## Quick Start

### Installation

Install via npm:

```bash
npm install -g @gitkraken/gk
```

### Authentication

Authenticate with GitKraken services:

```bash
gk auth login
```

### Basic Commands

```bash
# View git status with enhanced UI
gk status

# List issues assigned to you
gk issue list

# Create a pull request
gk pr create

# List your workspaces
gk workspace list

# Start the MCP server
gk mcp
```

## Project Structure

This is a Go-based CLI application with a modular architecture:

```
gkcli/
├── cmd/                    # Command entry points
│   ├── main.go            # Main CLI entry point
│   ├── gk/                # Cobra CLI commands
│   ├── mcp-tester/        # MCP testing server
│   ├── gk_debug_wrapper/  # VS Code debugging helper
│   └── docs/              # Documentation generator
├── internal/              # Internal packages
│   ├── actions/           # Business logic layer
│   ├── mcp/              # Model Context Protocol server
│   ├── git/              # Git operations
│   ├── gkio/             # I/O and data access
│   ├── cache/            # BadgerDB caching
│   ├── net/              # HTTP and GraphQL clients
│   ├── tui/              # Terminal UI components
│   ├── models/           # Data models
│   └── providers/        # Git provider integrations
├── e2e/                  # End-to-end Playwright tests
├── tests/                # Unit tests and mocks
└── npm/                  # NPM distribution package
```

## Development Setup

### Prerequisites

- **Go 1.25.3+**: Install from [golang.org](https://golang.org/dl/)
- **Node.js 18+**: (Optional) For e2e tests
- **Git**: Required for git operations
- **Make**: For build commands

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/gitkraken/gkcli.git
   cd gkcli
   ```

2. **Install development dependencies**:
   ```bash
   make install-dev-deps
   ```

3. **Build the project**:
   ```bash
   make build
   ```
   This creates the binary at `target/gk` (or `target/gk.exe` on Windows).

4. **Run the CLI**:
   ```bash
   ./target/gk --help
   ```

### Development Commands

```bash
# Build
make build                    # Build for current platform
make build-macos-arm64       # Build for macOS ARM64
make build-linux-amd64       # Build for Linux AMD64
make build-windows           # Build for Windows

# Code Quality
make lint                    # Run linter (revive)
make vet                     # Run go vet
make imports                 # Format imports with goimports
make imports-check           # Check import formatting
make struct-align            # Fix struct field alignment
make struct-align-check      # Check struct field alignment
make static-check            # Run all static checks

# Testing
make test                    # Run unit tests with coverage
make test-e2e               # Run end-to-end tests
make mocks                   # Generate test mocks

# Utilities
make clean                   # Remove build artifacts
make docs                    # Generate CLI documentation
make cache-key-id           # Generate cache key identifier
```

## Architecture

### Core Technologies

- **CLI Framework**: [Cobra](https://github.com/spf13/cobra) for command structure
- **Configuration**: [Viper](https://github.com/spf13/viper) for config management
- **UI**: [PTerm](https://github.com/pterm/pterm) and [Lipgloss](https://github.com/charmbracelet/lipgloss) for terminal UI
- **Database**: [BadgerDB](https://github.com/dgraph-io/badger) for local caching
- **MCP**: [mcp-go](https://github.com/mark3labs/mcp-go) for Model Context Protocol
- **Git**: [go-git](https://github.com/go-git/go-git) with native Git fallback

### Key Packages

- **`internal/actions`**: Business logic for all commands (workspace, issues, PRs, git operations)
- **`internal/mcp`**: MCP server implementation with tools for Git, GitHub, GitLab, Jira, etc.
- **`internal/git`**: Git operations abstraction layer
- **`internal/gkio`**: Data access layer for workspaces, settings, and cloud sync
- **`internal/cache`**: BadgerDB-based caching for API responses and metadata
- **`internal/net`**: HTTP and GraphQL client implementations
- **`internal/tui`**: Reusable terminal UI components

### Data Flow

1. **CLI Command** (Cobra) → parses flags and arguments
2. **Action Layer** (`internal/actions`) → coordinates business logic
3. **I/O Layer** (`internal/gkio`) → handles data access and API calls
4. **Cache Layer** (`internal/cache`) → stores responses in `~/.gkcli/.cache`
5. **Provider Layer** (`internal/providers`) → integrates with external services

## MCP Server

The GitKraken MCP Server enables AI agents to interact with Git repositories and DevOps platforms.

### Features

- **Git Operations**: status, diff, commit, push, branch management, etc.
- **Pull Requests**: Create, review, and manage PRs across platforms
- **Issues**: Track and update issues in Jira, GitHub, GitLab, etc.
- **Repository Access**: Read file contents from remote repositories
- **Workspace Management**: List and organize GitKraken workspaces

### Installation & Usage

See the [MCP Server README](./npm/README.md) for installation instructions and the [MCP Tools README](./internal/mcp/README.md) for detailed tool documentation.

### Testing the MCP Server

Use the MCP tester for local development:

```bash
# Start the test server
go run -tags=test cmd/mcp-tester/main.go

# Test a tool
curl -X POST http://localhost:8080/mcp/tools/git_status \
  -H "Content-Type: application/json" \
  -d '{"directory": "/path/to/repo"}'
```

See [MCP Tester README](./cmd/mcp-tester/README.md) for more details.

## Testing

### Unit Tests

```bash
make test
```

Tests use:
- **testify/assert**: Assertions
- **go.uber.org/mock**: Mock generation
- **Race detector**: Enabled by default

### End-to-End Tests

```bash
make test-e2e
```

E2E tests use Playwright to test the compiled binary. See [E2E README](./e2e/README.md) for details.

### Debugging

Use the debug wrapper for VS Code debugging:

1. Copy the configuration from [Debug Wrapper README](./cmd/gk_debug_wrapper/README.md)
2. Add to `.vscode/launch.json`
3. Set breakpoints and debug with F5

## Code Style

### Guidelines

- **Imports**: Use `goimports` for formatting (stdlib → external → internal)
- **Linting**: Revive configuration in `revive.toml`
- **Error Handling**: Custom error types in `internal/errors/`
- **Context**: Always pass `context.Context` as first parameter for blocking operations
- **Naming**: Follow standard Go conventions
- **Testing**: Test files end with `_test.go`, use table-driven tests where appropriate

### Before Committing

```bash
make static-check   # Run all checks
make test          # Run tests
```

## Additional Documentation

- **[AGENTS.md](./AGENTS.md)**: Guidelines for AI agents contributing to the project
- **[MCP Tools](./internal/mcp/README.md)**: Complete MCP tool documentation
- **[MCP Server Distribution](./npm/README.md)**: NPM package documentation
- **[E2E Tests](./e2e/README.md)**: End-to-end testing guide
- **[MCP Tester](./cmd/mcp-tester/README.md)**: Local MCP testing server
- **[Debug Wrapper](./cmd/gk_debug_wrapper/README.md)**: VS Code debugging setup

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes following the code style guidelines
3. Run tests: `make static-check && make test`
4. Commit your changes: `git commit -am 'Add my feature'`
5. Push to the branch: `git push origin feature/my-feature`
6. Submit a pull request

## Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/gitkraken/gkcli/issues)

