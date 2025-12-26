# Claude Code Ecosystem 2025: Tools, MCP Servers, Integrations, and Best Practices

## Executive Summary and Key Findings

Claude Code is Anthropic’s agentic coding assistant designed to work where developers already operate: the terminal and Visual Studio Code (VS Code). It couples a capable command-line interface (CLI) with a native VS Code extension to support code understanding, editing, testing, automation, and governance. In 2025, Claude Code is increasingly shaped by the Model Context Protocol (MCP), an open standard that decouples tools and data from any single AI client, enabling a many‑to‑many ecosystem of servers and hosts. This dynamic matters because it allows engineering teams to treat Claude Code as a configurable, extensible environment rather than a black‑box assistant, integrating exactly the tools and guardrails their workflows demand.[^1][^3][^4]

The core product surface includes the CLI for local agentic coding and the VS Code extension for in‑editor assistance. The extension supports inline diffs, plan review, and shared history with the CLI; some capabilities, such as full slash commands and MCP server configuration, are available through the CLI and then used inside the IDE.[^1] Terminal configuration directly affects day‑to‑day productivity: predictable line breaks (Shift+Enter or Option+Enter), notification hooks, and judicious handling of large inputs reduce friction and make sessions smoother.[^2]

MCP now anchors Claude Code’s extensibility. Hosts (Claude Desktop, VS Code with MCP support) connect to MCP servers that expose tools, resources, and prompts via a standardized protocol. For developers, this translates into concrete capabilities—searching the web, automating browsers, interacting with GitHub, running SQL, or coordinating sequential reasoning—without bespoke integrations per client. The shift from custom connectors to MCP reduces integration overhead and encourages reuse across teams and tools.[^3][^7][^11]

Three recommendations stand out. First, adopt curated “personas” and workflow patterns, such as explore‑plan‑code‑commit and test‑driven development (TDD), to standardize how teams plan, implement, and verify work. Second, govern permissions and configurations deliberately, using allowlists, hierarchy (global, project, local), and hooks to balance autonomy with control. Third, compose MCP servers judiciously, starting with a small set aligned to high‑value tasks—GitHub, web automation, search, and SQL—then scale as the team’s maturity grows.[^6][^11][^10]

## Scope, Methodology, and Source Quality

This report synthesizes official documentation from Anthropic and the VS Code extension marketplace, alongside curated lists and community guides for MCP servers. The primary lens is official Claude Code docs for VS Code and the terminal, Anthropic’s MCP announcement and engineering guidance, and the VS Code Marketplace listing for feature and version confirmation. Curated repositories and community guides supplement this baseline for MCP server selection and configuration practices.[^1][^5][^4]

The temporal baseline for “current” is December 26, 2025. Marketplace metadata (e.g., installs, version history) is used as a proxy for adoption and maturity, while community lists are treated as discovery aids rather than endorsements.[^5][^8] Official sources anchor claims about product features and configuration, while community sources illustrate practical usage and emerging ecosystem patterns. Where information is incomplete—such as exact permission matrices, enterprise policy fields, or MCP server security posture—gaps are acknowledged rather than filled with speculation.

## Claude Code Product Overview: CLI vs VS Code Extension

Claude Code’s value lies in an integrated, context‑aware experience that meets developers in their native environment. The CLI is the control plane for agentic workflows: it executes plans, runs commands, manages permissions, and configures MCP servers. The VS Code extension is the in‑editor surface: it brings conversation, diffs, and plan review directly to the IDE, with history synchronized to the CLI for continuity across contexts.[^1]

Core features include reviewing and editing plans before changes, diff‑based file edits with acceptance and refinement, @‑mentions to anchor context to files or line ranges, and customizable layouts (sidebar, editor tab, terminal mode). The extension’s command palette and status bar expose shortcuts for focusing input, opening new conversations, and inserting @‑mentions. While the CLI supports a broader set of slash commands, the extension offers a subset and a terminal mode for CLI‑style interactions inside VS Code.[^1]

To illustrate capability differences and overlapping features, the following comparison summarizes the CLI and VS Code extension at a glance.

Table 1. Feature parity and differences between Claude Code CLI and VS Code extension

| Feature Area                     | CLI                                              | VS Code Extension                                                |
|----------------------------------|--------------------------------------------------|------------------------------------------------------------------|
| Slash commands                   | Full set                                         | Subset available (type “/” to see options)                       |
| MCP server configuration         | Supported                                        | Configure via CLI; use within extension                          |
| Checkpoints                      | Available                                        | Coming soon                                                      |
| Bash shortcut (“!”)              | Supported                                        | Not available                                                    |
| Tab completion                   | Supported                                        | Not available                                                    |
| Inline diffs and plan review     | Supported via CLI integrations                   | Native in‑editor diffs and plan review                           |
| Shared conversation history      | Synchronized with extension                      | Synchronized with CLI                                            |
| Terminal mode                    | Native                                           | Available as a setting (“Use Terminal”)                          |
| IDE integration                  | Diff viewing, diagnostics via integrated terminal| Editor‑aware prompts, @‑mentions, layout customization           |

As shown in Table 1, the CLI remains the authoritative configuration surface and offers features like checkpoints and tab completion, while the extension optimizes for in‑editor workflows. Teams typically run the CLI in an integrated terminal and leverage extension features for code changes, then rely on the CLI for advanced configuration and automation.[^1][^5]

## Model Context Protocol (MCP): Architecture and Primitives

MCP addresses a long‑standing integration challenge: every AI assistant built custom connectors to every service, creating an N×M matrix of bespoke integrations. MCP flips this to N+M by defining a standard way for hosts (AI applications) to discover and call tools exposed by servers, read resources, and use prompts. The result is a more sustainable ecosystem where services are integrated once and reused across multiple clients.[^3][^7]

At its core, MCP uses JSON‑RPC 2.0 for bi‑directional, transport‑agnostic communication. Servers can run locally (stdio) or remotely (HTTP with Server‑Sent Events), allowing flexibility in deployment and security posture. This matters for developer workflows: a local filesystem server remains on‑machine, while a remote GitHub or search server can be shared across a team without per‑client custom code.[^7][^11]

To clarify how MCP primitives map to development tasks, Table 2 summarizes tools, resources, and prompts with examples.

Table 2. MCP primitives and examples mapped to development workflows

| Primitive  | Definition                                                                 | Examples                                                                                               |
|------------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| Tools      | Callable actions the host can invoke on the server                          | Create a GitHub issue, run a web search, navigate a browser, execute SQL, send a Slack message        |
| Resources  | Read‑only data sources the host can fetch for context                      | Repository metadata, commit history, database schema, file contents, dashboard summaries               |
| Prompts    | Predefined templates or instruction snippets to guide consistent behavior  | Bug triage template, PR description generator, refactoring checklist, code review rubric               |

These primitives encourage a modular approach to agentic development. A team can connect a filesystem resource for local code, a GitHub tool for repository operations, and a sequential thinking prompt to structure problem‑solving—all governed by server‑side security and rate limits. JSON‑RPC provides the message layer; stdio and SSE provide the transport; and the primitives give the AI a predictable surface to work with.[^7][^11][^3]

## MCP Servers Landscape for Development Workflows

The MCP ecosystem is broad and expanding, but certain servers are especially relevant to developer workflows. Official and reference servers cover core needs: GitHub operations, filesystem access, browser automation, sequential reasoning, web search and extraction, SQL interaction, and documentation retrieval. Curated lists and community guides help teams discover options and evaluate maturity.[^8][^9][^10]

Selection criteria should prioritize documentation quality, authentication and security model, transport (local vs remote), rate limits and error handling, and whether the server is officially maintained or community‑supported. Production teams often start with reference or official servers (e.g., GitHub, Filesystem, Fetch) and layer in specialized tools (Puppeteer, PostgreSQL, Notion) as workflows mature.[^8][^11][^10]

Table 3 summarizes a subset of MCP servers commonly used in development contexts.

Table 3. MCP servers summary and recommended use cases

| Server Name                 | Category                | Capabilities                                           | Typical Use Cases                                   | Transport   |
|----------------------------|-------------------------|--------------------------------------------------------|-----------------------------------------------------|-------------|
| GitHub (Official)          | Version control         | Issues, PRs, commits, CI triggers                      | Automate PR workflows, triage issues                | Remote HTTP |
| Filesystem (Reference)     | File operations         | Secure read/write/edit with controls                   | Local code changes, refactoring, log analysis       | Local stdio |
| Fetch (Reference)          | Web retrieval           | Fetch and convert web content                          | Documentation retrieval, spec reading               | Local stdio |
| Puppeteer (Reference)      | Browser automation      | Navigate, interact, screenshot                         | UI tests, visual verification, scraping             | Local stdio |
| Sequential Thinking (Ref.) | Reasoning               | Step‑by‑step task decomposition                        | Architecture planning, complex refactoring          | Local stdio |
| PostgreSQL (Community)     | Database                | Natural language to SQL, query execution               | Data analysis, report generation                    | Remote HTTP |
| Notion (Official)          | Documentation/Tasks     | Read/write docs and tasks                              | Spec updates, project tracking                      | Remote HTTP |
| mcp‑omnisearch (Community) | Search/Extract          | Web search, AI responses, content processing           | Research, context gathering                         | Local stdio |

As shown in Table 3, local stdio servers are well‑suited for secure on‑machine operations, while remote HTTP servers enable team‑shared capabilities. Combining servers—for example, GitHub tools with Fetch and Sequential Thinking—allows Claude Code to move from reading specs to planning changes to executing repository operations within a single session.[^8][^9][^10][^11]

## Claude Code Plugin and Configuration Architecture

Claude Code’s configuration architecture balances ease‑of‑use with governance. The primary configuration surfaces are CLAUDE.md files and settings.json, with MCP servers configured either via CLI wizards or direct file editing. The goal is to encode project context, permissions, and reusable commands so that Claude behaves consistently and safely across sessions and contributors.[^6][^12]

CLAUDE.md files act as persistent context: they capture coding standards, common commands, architectural notes, and workflow guidance. They can live in the repository root, subdirectories, home folder, or a local ignored file for personal preferences. settings.json defines technical behavior, including model selection, permissions allowlists and denylists, and hooks for automation. MCP servers can be added per‑project (including team‑checked .mcp.json), globally, or via direct editing of configuration files for better visibility and maintainability.[^6][^12]

Table 4 organizes configuration hierarchy and override precedence.

Table 4. Configuration hierarchy and override precedence

| Level                         | Scope                          | Use Case                                            | Override Precedence |
|------------------------------|--------------------------------|-----------------------------------------------------|---------------------|
| Enterprise policies          | Org‑wide                       | Security, compliance, audit                         | Highest             |
| Command‑line flags           | Single session                 | Temporary overrides (e.g., permissions)             | High                |
| Local project settings       | Developer‑specific project     | Personal preferences not committed to version control| Medium              |
| Shared project settings      | Team‑wide project              | Team standards, permissions, MCP configuration      | Medium              |
| Global user settings         | All projects                   | Personal defaults, reusable commands                | Lowest              |

In practice, teams commit shared settings and CLAUDE.md to version control to ensure consistency, then use local settings for personal overrides. This hierarchy, combined with CLI flags, enables fine‑grained control without duplicating configuration across contexts.[^6][^12]

## VS Code Integration Patterns for Claude Code

The VS Code extension streamlines day‑to‑day coding: install from the marketplace, restart if necessary, and open the Claude panel via the toolbar icon, status bar, or command palette. The extension provides diff‑based review for file edits, @‑mentions for precise context, multiple conversations with shared history, and customizable layouts (sidebar, editor tab, or terminal mode). Shortcuts and commands simplify navigation—focus input, open in new tab, insert @‑mention reference—making it straightforward to blend AI assistance with existing IDE workflows.[^1][^5]

Because some agentic features are configured via the CLI, teams commonly run Claude in the integrated terminal to set permissions, add MCP servers, and apply templates, then switch back to the extension for in‑editor diffs and plan review. This pattern ensures configuration remains authoritative while preserving the convenience of IDE‑native interactions.[^1]

Table 5 lists core VS Code commands and shortcuts.

Table 5. VS Code commands and shortcuts for Claude Code

| Command                          | Shortcut (Mac / Win/Linux)      | Description                                                |
|----------------------------------|----------------------------------|------------------------------------------------------------|
| Focus Input                      | Cmd+Esc / Ctrl+Esc               | Toggle focus between editor and Claude                     |
| Open in Side Bar                 | —                                | Open Claude in left sidebar                                |
| Open in Terminal                 | —                                | Open Claude in terminal mode                               |
| Open in New Tab                  | Cmd+Shift+Esc / Ctrl+Shift+Esc   | Open a new conversation as an editor tab                   |
| Open in New Window               | —                                | Open a new conversation in a separate window               |
| New Conversation                 | Cmd+N / Ctrl+N                   | Start a new conversation (when Claude is focused)          |
| Insert @‑Mention Reference       | Alt+K                            | Insert reference to current file (includes line numbers)   |
| Show Logs                        | —                                | View extension debug logs                                  |
| Logout                           | —                                | Sign out of Anthropic account                              |

These commands and shortcuts reduce context switching and make AI assistance feel native to the IDE. Combined with diff review and plan control, they allow teams to introduce agentic coding without sacrificing existing code review practices.[^1][^5]

## Terminal‑Based Setup and Configuration

Terminal setup significantly shapes the Claude Code experience. Keybinding choices—Shift+Enter or Option+Enter—determine how developers insert line breaks, which matters when drafting long prompts or multi‑step instructions. Running the built‑in `/terminal-setup` automates common configurations; enabling iTerm2 system notifications provides alerts when long‑running tasks complete; and notification hooks allow custom logic for status updates. Handling large inputs is best done via files rather than pasting into the terminal, which can truncate long content, especially in VS Code’s integrated terminal.[^2]

Claude Code also supports a useful subset of Vim keybindings. Developers can switch modes, navigate, and edit efficiently without abandoning familiar terminal patterns. Table 6 summarizes the supported subset.

Table 6. Vim mode supported subset

| Category        | Keybindings                                                     |
|-----------------|-----------------------------------------------------------------|
| Mode switching  | Esc (to NORMAL), i/I, a/A, o/O (to INSERT)                      |
| Navigation      | h/j/k/l, w/e/b, 0/$/^, gg/G                                     |
| Editing         | x, dw/de/db/dd/D, cw/ce/cb/cc/C, . (repeat)                     |

Configuring these ergonomics upfront reduces friction in daily use and makes terminal‑centric workflows—such as headless automation or CLI‑driven planning—feel natural and reliable.[^2]

## Best Practices for Agent Configuration and Governance

Governance begins with clarity. Be specific in instructions, ask for plans before code, and course‑correct early. Use `/clear` to reset context when switching tasks, checklists to manage large migrations, and images or URLs to anchor design or requirements. Give Claude the tools it needs—bash environment, MCP servers, custom slash commands—then constrain them with allowlists and hooks to balance autonomy with safety.[^6]

Permissions are central to trust. Allowlists can permit trusted actions (e.g., file editing, git commit) and specific MCP tools, while denylists can explicitly exclude sensitive scopes (e.g., environment files). The `/permissions` command helps adjust allowances during sessions; settings.json provides durable governance; and CLI flags enable session‑specific overrides when running automation. These mechanisms, used together, align agent behavior with team policies.[^6][^12]

Hooks extend governance by automating guardrails. For example, a post‑write hook can run a formatter or linter, or a pre‑commit hook can verify tests pass before allowing a commit. Documentation templates in CLAUDE.md capture conventions and common commands, while reusable slash commands encode standard workflows—TDD cycles, issue triage, or PR scaffolding—so teams repeat high‑quality patterns instead of reinventing them.[^6][^12]

Table 7 provides a governance checklist to operationalize these practices.

Table 7. Governance checklist for Claude Code configuration

| Area              | Recommended Practice                                                                |
|-------------------|--------------------------------------------------------------------------------------|
| Permissions       | Maintain allowlists for Edit, Bash, MCP tools; use denylists for sensitive scopes   |
| Configuration     | Commit shared settings and CLAUDE.md; use local settings for personal overrides     |
| Hooks             | Add post‑write formatters, pre‑commit test runners, lint validations                |
| Templates         | Encode TDD, triage, PR workflows as reusable slash commands                         |
| MCP servers       | Start with a minimal set; add incrementally; review auth, rate limits, transport    |
| Documentation     | Keep CLAUDE.md concise and current; include common commands and conventions         |

By instituting these controls, teams enable Claude Code to operate autonomously where appropriate while preserving predictability and safety across the software development lifecycle.[^6][^12]

## Common Workflow Patterns and Personas

Claude Code’s workflows benefit from structure. Four patterns recur in high‑performing teams: explore‑plan‑code‑commit, TDD, visual‑driven development, and safe YOLO mode for constrained tasks. Exploration establishes context without writing code; planning uses structured reasoning to define steps; implementation proceeds with verification and diff‑based review; and commits are accompanied by PRs and documentation updates where relevant.[^6]

TDD cycles start with writing failing tests, confirming failure, committing tests, then iteratively writing code to pass tests while avoiding modifications to the test suite. Visual‑driven development couples design mocks with browser automation or screenshot capture to iterate until outputs match the target UI. Safe YOLO mode uses `--dangerously-skip-permissions` for narrow tasks like fixing lints or generating boilerplate, ideally inside containers with restricted access to mitigate risk.[^6]

Personas help tailor assistance. A codebase Q&A persona answers architectural and implementation questions; a Git and GitHub persona manages commits, PRs, and issue triage; a notebook persona supports side‑by‑side analysis and aesthetic improvements for human viewing; and a multi‑Claude orchestration approach has one instance write while another verifies, cycling through git worktrees or headless runs to parallelize effort.[^6]

Table 8 summarizes these workflows and their primary tools.

Table 8. Workflow patterns and associated primary tools

| Pattern                      | Steps                                              | Primary Tools/Servers                                |
|-----------------------------|----------------------------------------------------|------------------------------------------------------|
| Explore‑Plan‑Code‑Commit    | Explore → Plan → Code → Commit/PR                  | Filesystem, Git/GitHub, Sequential Thinking          |
| TDD                         | Write tests → Confirm failure → Commit → Code      | Filesystem, Bash (tests), Git/GitHub                 |
| Visual‑Driven Development   | Provide mock → Implement → Screenshot → Iterate    | Puppeteer, Filesystem, Notion (for specs)            |
| Safe YOLO Mode              | Skip permissions for narrow tasks                  | Bash (lint/format), Filesystem (containerized)       |
| Codebase Q&A                | Ask architectural and specific questions           | Filesystem resources, Fetch (docs), Git (history)    |
| Git/GitHub Persona          | Commits, PRs, issue triage                         | GitHub (Official), Bash (git)                        |
| Notebook Persona            | Data exploration, visualization improvements       | Filesystem, Fetch (data sources), Notion (docs)      |
| Multi‑Claude Orchestration  | Write/verify loop; parallel worktrees              | Headless CLI, Bash (worktrees), Git/GitHub           |

These patterns encourage consistency and enable teams to scale agentic coding practices without sacrificing quality or control.[^6][^10]

## Creating Downloadable Setup Scripts for Claude Code

Setup scripts should be safe, repeatable, and transparent. They can scaffold directories (e.g., `.claude`), generate starter configuration files (settings.json, CLAUDE.md), add curated MCP servers via CLI or direct config edits, install recommended plugins or templates, and validate configurations. The `@schuettc/claude-code-setup` package exemplifies a plugin‑based approach: it provides an interactive wizard, curated expertise bundles (AWS, testing, security), hooks for guardrails, and command templates for reusable workflows.[^13][^12][^6]

Best practices for scripts include idempotence (running multiple times has the same effect as running once), clear user prompts with defaults, validation steps to catch misconfigurations, and safe mode toggles. Because the script may edit MCP server entries in configuration files, it should implement diffing and backup before changes, and offer a rollback path. Table 9 proposes a pragmatic blueprint.

Table 9. Setup script blueprint

| Phase          | Actions                                                                 | Outputs                                         | Validation Steps                                      |
|----------------|-------------------------------------------------------------------------|--------------------------------------------------|-------------------------------------------------------|
| Bootstrap      | Create `.claude` directory; set permissions                             | Directory structure, base permissions            | Verify owner/permissions; lint config files           |
| Config         | Generate settings.json, CLAUDE.md                                       | Shared and local configuration files             | JSON schema validation; template content checks       |
| MCP servers    | Add curated servers via CLI or direct config editing                    | Updated mcpServers section in config             | `--mcp-debug` or status command; connectivity tests   |
| Plugins        | Install plugin bundles (e.g., testing toolkit, security essentials)     | Plugin files and templates                       | Template availability; hook execution smoke tests     |
| Templates      | Install reusable slash commands (TDD, triage, PR)                       | Command files under `.claude/commands`           | Command registration and parameter substitution tests |
| Rollback       | Backup prior state; enable undo                                         | Backup files, undo operations                    | Restoration test; integrity checks                    |

Using a plugin system like `@schuettc/claude-code-setup` accelerates scaffolding and standardizes templates and hooks across projects, while direct config editing provides visibility and maintainability for MCP servers in complex environments.[^13][^12]

## Implementation Checklist and Rollout Plan

Adopting Claude Code effectively requires a phased rollout that aligns configuration, integration, and governance.

Phase 1 focuses on installing and configuring the VS Code extension and terminal ergonomics; Phase 2 establishes baseline configurations (CLAUDE.md, settings.json) and minimal MCP servers aligned to high‑value workflows; Phase 3 builds team workflows and reusable templates; and Phase 4 scales headless automations for CI/CD and governance with permissions and hooks.

Table 10 organizes the rollout into milestones.

Table 10. Rollout checklist by phase

| Phase | Tasks                                                                                   | Owner           | Success Criteria                                      | Rollback Plan                                  |
|-------|------------------------------------------------------------------------------------------|-----------------|-------------------------------------------------------|------------------------------------------------|
| 1     | Install VS Code extension; configure shortcuts; enable notifications; set Vim mode       | Developers      | Extension functional; ergonomic input and alerts      | Restore prior IDE settings                     |
| 2     | Create CLAUDE.md; define settings.json; add minimal MCP servers (GitHub, Fetch, FS)     | Tech lead/Eng   | Shared configs committed; MCP servers connected       | Revert config changes; disable MCP servers     |
| 3     | Add templates (TDD, triage, PR); implement hooks (format, test, lint); pilot workflows  | Team leads      | Reusable commands available; hooks firing reliably    | Disable hooks; remove templates                |
| 4     | Introduce headless automations; enforce permissions; audit and iterate                   | DevOps/Platform | CI/CD integrations working; governance metrics stable | Roll back permissions; pause automation        |

This plan balances rapid value delivery with governance. It embeds configuration into version control, iterates on workflows through templates and hooks, and introduces automation gradually, backed by permission controls and audits.[^1][^2][^6]

## Risks, Limitations, and Information Gaps

Several risks and gaps merit attention. Extension features are evolving; for example, checkpoints are indicated as “coming soon” in the extension while available in the CLI, and some agentic features remain CLI‑only. Teams should rely on the CLI for authoritative configuration and use the extension for in‑editor convenience.[^1]

Community MCP servers vary in maintenance quality, authentication handling, and security posture. Official and reference servers are generally safer starting points; when adopting community servers, teams should evaluate documentation, authentication flows, rate limits, and error handling, and prefer remote servers with standard HTTP auth for team reuse.[^8][^11]

Known marketplace issues note that the extension is an early release and may contain bugs or incomplete features. Pricing and usage limits for Claude Code depend on Anthropic plans and may vary by region and provider (e.g., direct, Bedrock, Vertex, Foundry), requiring organizational verification.[^5]

Beyond these, key information gaps remain:

- A comprehensive, official list of MCP servers specifically certified or supported by Anthropic beyond reference servers.
- Detailed enterprise policy configuration fields and permission matrices ( Edit, Bash, WebFetch) across environments.
- Authoritative guidance on MCP server security posture, authentication flows, and rate limits across community servers.
- Complete, up‑to‑date mapping of CLI vs VS Code extension features as the product evolves (e.g., checkpoints timeline).
- Pricing and usage limits for Claude Code across Anthropic plans and providers.
- Standardized setup script templates from official sources (most guidance is community‑driven).
- Clear best‑practice patterns for multi‑Claude orchestration and subagent configurations beyond high‑level examples.

Acknowledging these gaps prevents overcommitment and directs teams toward cautious adoption, iterative validation, and documentation of internal practices.

## References

[^1]: Use Claude Code in VS Code – Claude Code Docs. https://code.claude.com/docs/en/vs-code  
[^2]: Optimize your terminal setup – Claude Code Docs. https://code.claude.com/docs/en/terminal-config  
[^3]: Introducing the Model Context Protocol – Anthropic. https://www.anthropic.com/news/model-context-protocol  
[^4]: Code execution with MCP: building more efficient AI agents – Anthropic Engineering. https://www.anthropic.com/engineering/code-execution-with-mcp  
[^5]: Claude Code for VS Code – Visual Studio Marketplace. https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code  
[^6]: Claude Code: Best practices for agentic coding – Anthropic Engineering. https://www.anthropic.com/engineering/claude-code-best-practices  
[^7]: The Definitive Guide to Model Context Protocol (MCP) in 2025 – Data Science Dojo. https://datasciencedojo.com/blog/guide-to-model-context-protocol/  
[^8]: Awesome MCP Servers – GitHub. https://github.com/wong2/awesome-mcp-servers  
[^9]: The 10 Must‑Have MCP Servers for Claude Code (2025 Developer Edition) – Medium. https://roobia.medium.com/the-10-must-have-mcp-servers-for-claude-code-2025-developer-edition-43dc3c15c887  
[^10]: Top 10 Essential MCP Servers for Claude Code (2025) – Apidog. https://apidog.com/blog/top-10-mcp-servers-for-claude-code/  
[^11]: Use MCP servers in VS Code – VS Code Docs. https://code.visualstudio.com/docs/copilot/customization/mcp-servers  
[^12]: Configuring MCP Tools in Claude Code – The Better Way – Scott Spence. https://scottspence.com/posts/configuring-mcp-tools-in-claude-code  
[^13]: @schuettc/claude-code-setup – NPM. https://www.npmjs.com/package/@schuettc/claude-code-setup