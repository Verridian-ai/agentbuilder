# Claude Code Architecture, Optimal Configurations, and Best Practices

## Executive Summary and Key Findings

Claude Code is a terminal-first, agentic coding tool that emphasizes direct action, composability, and enterprise readiness. It integrates into existing developer workflows, executes commands, edits files, and automates repetitive tasks, while preserving guardrails for system modifications. Its design aligns with the Unix philosophy: small, composable utilities, scriptable patterns, and predictable behaviors. Compared with chat-only assistants, Claude Code prioritizes “give the agent a computer” as its core operating principle—enabling autonomous file edits, shell execution, and iterative verification loops that mirror how engineers work day to day[^1][^4][^6].

At the heart of Claude Code’s architecture is a simple agent loop augmented by safety checks, sub-agent dispatch, and progressive context compaction. This simplicity enables robust performance without the overhead of complex orchestration frameworks. The loop gathers context (file reads, search, sub-agent outputs), takes actions (edits, commands, MCP tool invocations), and verifies results (tests, linters, visual checks), repeating until the agent completes the task or reaches a stopping condition[^4][^7]. Tool usage is deliberately conservative by default, requiring permission for potentially sensitive actions; teams can customize allowlists, slash commands, and MCP servers to fit their workflows and governance standards[^6].

Top five actionable recommendations for immediate impact:
1. Curate an allowlist of tools and permissions by environment (project vs global), reducing context overhead while preserving safety[^6].
2. Keep CLAUDE.md concise and universally applicable; prefer progressive disclosure with companion docs and Skills to avoid instruction overstuffing[^8][^6].
3. Use Model Context Protocol (MCP) for discovery-driven, multi-tool workflows; reserve direct APIs for deterministic, latency-sensitive, or bulk operations; design for hybrid integration[^9][^4][^10].
4. Institutionalize proven workflows—Explore–Plan–Code–Commit, Test-Driven Development (TDD), and Visual Target Iteration—to drive predictable outcomes with fewer retries[^6].
5. Adopt headless mode (claude -p) with streaming JSON for CI/CD automations, fan-out migrations, and pipelined tasks, governed by explicit tool permissions and output contracts[^6].

Taken together, these practices produce measurable improvements: fewer permission prompts, lower context usage, higher success rates on the first attempt, and better alignment with security and governance. Teams should expect faster iteration cycles, clearer separation of concerns (writing vs verifying agents), and more reliable automation pipelines.

Information gaps to acknowledge:
- No official, quantified performance benchmarks comparing MCP versus direct APIs across representative workloads.
- No comprehensive, standardized metrics for CLAUDE.md length thresholds across model sizes; guidance is based on best practices and field experience.
- Limited quantitative evidence on sub-agent dispatch trade-offs (parallelization gains versus orchestration overhead) across different repositories.
- Detailed internal behavior of security checks (e.g., Haiku usage) beyond high-level descriptions is not publicly documented.
- Enterprise-grade MCP server security patterns with audit and governance beyond general best practices remain under-documented.

These gaps suggest future work in standardized evaluations and security blueprints, especially for large-scale, regulated environments[^6][^7][^9][^10].


## Claude Code Agent Architecture: From Loop to Execution

Claude Code’s operational model centers on a terminal-first experience. It lives where developers work—in the shell—and can read, edit, and execute code, interact with version control, and automate tasks across the software development lifecycle. Beyond local usage, it extends into IDEs, CI/CD, and external systems via Model Context Protocol (MCP), making it an agentic harness rather than a chat interface. This design supports autonomy while preserving control through permission prompts and conservative defaults[^1][^6].

### Core Agent Loop and Context Management

The agent loop is straightforward: gather context, take action, verify, and repeat. Context gathering spans file reads, shell-based search, sub-agent outputs, and external data via MCP. Actions include edits, command execution, and tool invocations. Verification uses tests, linters, and visual checks (screenshots) to confirm fit-to-purpose. The loop halts when the model returns no tool calls, signaling completion or the need for human input[^4][^7].

For long-running sessions, Claude Code employs progressive compaction—summarizing prior messages to preserve critical context when approaching token limits. Developers can trigger compaction manually and instruct the agent to retain specific decisions or artifacts (e.g., authentication flow, database schema), maintaining continuity without filling the context window with exhaustive history[^4][^6]. Clear checkpoints and periodic resets (e.g., /clear) keep the conversation focused and reduce drift[^6].

### Safety and Permission Model

Claude Code is conservative by default. It asks for permission before performing actions that modify the system—file writes, many bash commands, and MCP tool invocations. Users can customize an allowlist to “always allow” safe actions, and teams can manage project-level and global settings to enforce consistent governance. This model reduces accidental changes and aligns with enterprise requirements for auditable, controlled automation[^6].

### Sub-agent Dispatch and Isolation

Sub-agents serve two primary purposes: context isolation and parallelization. By dispatching focused tasks to sub-agents, the orchestrator prevents its own context from bloating with details unrelated to the current goal. Parallel sub-agents accelerate work by tackling independent tasks simultaneously. Sub-agents receive the same system hints and prompts but operate within isolated context windows; outputs are trimmed to the essentials before returning to the orchestrator[^4][^7]. This pattern keeps the main agent’s state clean while exploiting concurrency for speed.

### Security Checks and Command Authorization

Security checks run alongside the loop to prevent risky actions. Before executing certain bash commands, Claude Code leverages a smaller, faster model to perform structured analysis of command intent and potential file impacts. This design speeds up safety decisions without burdening the primary model. Users still approve commands, and the checks inform whether approval is needed based on whether files will be read or modified, and whether output will display content[^7]. The trade-off is explicit: faster, more targeted safety processing at the cost of transparency beyond high-level descriptions.

### Terminal-First Execution and Tool Access

Claude Code inherits the developer’s environment and tools. It reads and edits files, runs shell commands, and automates Git and GitHub interactions. It composes naturally with pipelines—operating headlessly, streaming structured outputs, and integrating with CI/CD. The result is a power tool that fits into existing workflows while extending them with agentic capabilities[^1][^6].


## Optimal CLAUDE.md Instruction Structures

CLAUDE.md is included automatically at the start of every session, serving as the project’s onboarding brief. Effective files follow three principles: define the project’s WHAT (structure, stack), WHY (purpose, domain), and HOW (tools, verification steps). Keep instructions concise, universally applicable, and bias toward progressive disclosure rather than encyclopedic detail[^8][^6].

### Principles and Placement

Because large language models are largely stateless across sessions, CLAUDE.md is your primary mechanism for injecting durable context. It should live at the repository root for broad visibility and can also exist at organizational, project, or subdirectory levels to tailor guidance where needed. In monorepos, hierarchical files let you scope instructions to specific components while preserving a shared foundation. Above all, avoid overstuffing: include only essentials that apply broadly, and rely on companion docs, Skills, and slash commands for the rest[^8][^6].

### Progressive Disclosure Pattern

Progressive disclosure keeps CLAUDE.md lean. Store detailed, task-specific instructions in separate Markdown files—architecture notes, test runbooks, code conventions—and reference them from CLAUDE.md. When a task requires deeper context, the agent can read the relevant companion file on demand. This approach mirrors good documentation practice: teach the agent where to find truth rather than embedding every truth directly[^8].

### Style and Formatting Guardrails

Do not turn CLAUDE.md into a style guide. Linters and formatters are faster and more reliable for formatting rules. Use stop hooks to run formatters automatically and present deterministic errors for the agent to fix; rely on slash commands to bundle repeatable workflows. This separation keeps the LLM focused on decisions and logic rather than rote formatting tasks[^8][^6].

To illustrate a practical structure, the following blueprint maps the recommended sections to their purpose and examples.

Table 1: CLAUDE.md Section Blueprint

| Section                | Purpose                                         | Example Content                                                                 |
|------------------------|-------------------------------------------------|---------------------------------------------------------------------------------|
| WHAT                   | Project structure and stack                     | Monorepo layout; apps vs shared packages; primary languages and frameworks     |
| WHY                    | Purpose and domain context                      | Business goals; critical domains; key constraints and non-goals                 |
| HOW                    | Universal operating rules and verification      | Preferred package manager; test commands; verification steps before commit      |
| Progressive Disclosure | Pointers to companion docs and Skills           | docs/service_architecture.md; .claude/skills/update_changelog.md; /review docs |
| Permissions            | Tool allowlist guidance                         | Allowlist Edit and Bash(git commit:*) in CI; require prompts for MCP tools     |

The significance of this structure lies in its economy: it anchors the agent without overwhelming it, and it scales as projects grow. Teams should treat CLAUDE.md as a living artifact—reviewed, refined, and kept short.


## Tool Configuration Strategies for Minimal Context Usage

Claude Code’s tools are prominent in the context window, shaping the agent’s conception of possible actions. Therefore, configuring the right tools and permissions—and reducing unnecessary context—directly affects reliability and speed. The strategies below minimize noise while preserving capability.

### Allowlist Design and Permissions

Start conservative and expand deliberately. Allowlist tools based on environment: project-level settings for repo-specific actions (e.g., Edit, Bash with constrained git commit patterns), and global settings for universal tools. Use session flags for one-off tasks, and capture recurring permissions in settings files to ensure consistency across runs. This discipline reduces permission prompts and prevents the agent from exploring irrelevant tools[^6].

### MCP Servers and Tool Filtering

Configure MCP servers at project and global levels, and consider checked-in configuration for team-wide tools (e.g., browser automation). MCP’s standardized interface enables discovery-driven tool use, but it also introduces context cost via tool descriptions and schemas. Apply filtering and name prefixing where available to reduce noise, especially when connecting multiple servers. Clear tool descriptions and error messages guide the agent and reduce misfires[^10][^6].

### Custom Slash Commands and Skills

Slash commands encapsulate repeatable workflows as prompt templates with parameters, accessible via the “/” menu. Skills package instructions and optional code into reusable capabilities. Both patterns reduce the need for verbose prompting, shrink context usage, and standardize team processes. Because they are stored as Markdown, they align with progressive disclosure and are easy to version and share[^6].

### Headless Mode and Streaming

Headless mode (claude -p) integrates Claude Code into CI/CD and automation pipelines. Streaming JSON outputs make results machine-friendly and composable. Headless invocations should define explicit output contracts (“return OK or FAIL”) and constrain allowed tools to minimize risk and context. This approach enables fan-out tasks—large migrations,批量 analyses—while preserving governance[^6].

To summarize the permission channels and their best uses:

Table 2: Permission and Configuration Channels

| Channel                | Scope            | Best Use Cases                                                         |
|------------------------|------------------|------------------------------------------------------------------------|
| Prompt-time “always allow” | Session-specific | Quickly approving safe, frequent actions during development            |
| /permissions command   | Session          | Dynamic allowlist adjustments; targeted tool approval per task         |
| Settings files (.claude/settings.json, ~/.claude.json) | Project, global | Durable governance; team-wide permissions; consistent behavior         |
| CLI --allowedTools     | Session          | Headless/CI runs; constrained permissions for automation               |

And for MCP configuration patterns:

Table 3: MCP Configuration Patterns

| Level              | Pros                                              | Cons                                               | Typical Tools                         |
|--------------------|---------------------------------------------------|----------------------------------------------------|---------------------------------------|
| Project config     | Team-shared, version-controlled, predictable      | May add context noise if many tools are exposed    | Puppeteer, Sentry, issue trackers     |
| Global config      | Universal access across repos, convenient         | Risk of over-broad permissions                     | Shell helpers, generic search         |
| Checked-in .mcp.json | Shared via source control, auditable              | Requires discipline to keep list focused           | Browser automation, CI integrations   |

The takeaway: control the surface area. Allowlists and focused MCP configurations reduce cognitive load on the model and keep the agent on task[^6][^10].


## MCP vs Direct Tool Integration

Model Context Protocol (MCP) and direct API integrations serve different needs. MCP standardizes tool discovery and enables agents to reason about which tools to use. Direct APIs offer deterministic performance and tight control. The most effective systems combine both, exploiting MCP’s flexibility while offloading heavy or sensitive operations to direct, well-governed API calls[^9][^4][^10].

### Definitions and Core Differences

MCP is a standardized wire protocol that wraps existing APIs and resources, exposing them to the model through discoverable tools with schemas and metadata. It emphasizes dynamic selection and autonomous iteration. Direct APIs are fixed integrations where tool usage is defined at design time, and calls are deterministic. MCP’s reasoning layer adds latency but unlocks flexibility; direct APIs minimize latency but require explicit orchestration logic[^9].

### When to Choose MCP

Favor MCP when the agent must decide among multiple tools at runtime, explore multi-tool workflows, or prototype rapidly without bespoke integration code. It shines in scenarios where the agent’s path is not known upfront—for example, querying a dataset, exploring project management tools, or interacting with design assets. MCP’s standardized discovery lowers the cost of adding new tools and helps the agent learn “what’s available”[^9][^4].

### When Direct APIs Are Better

Use direct APIs for performance-critical operations, deterministic actions, and bulk data handling. Direct calls avoid the overhead of tool selection reasoning and are easier to secure, audit, and rate-limit. They are also more reliable for pagination and large transformations, where MCP-driven iteration can become costly and brittle. For regulated operations, the governance features of traditional API management provide enforceable control points[^9].

### Hybrid Patterns and Design Tips

Combine MCP with direct APIs strategically. Let MCP handle flexible exploration and small-scale queries, while direct APIs perform bulk operations or enforce policy. Offer clear, concise tool descriptions, parameter constraints, and error semantics regardless of the approach. Design APIs with AI consumption in mind—well-documented, predictable, and resilient to pagination and filtering[^9][^10].

The comparison below summarizes selection guidance:

Table 4: MCP vs Direct API Comparison

| Dimension           | MCP                                              | Direct API                                        | Recommended Use Cases                                      |
|--------------------|--------------------------------------------------|---------------------------------------------------|------------------------------------------------------------|
| Latency            | Higher (reasoning layer for tool selection)      | Lower (deterministic calls)                       | Real-time monitoring vs exploratory queries                |
| Context Cost       | Higher (tool schemas, discovery metadata)        | Lower (defined inputs/outputs)                    | Small tool sets vs bulk data pipelines                     |
| Autonomy           | High (runtime discovery and iteration)           | Low (design-time control)                         | Multi-tool workflows vs fixed workflows                    |
| Security/Gov       | Requires strong server-side controls             | Leverages mature API management                   | Flexible agent actions vs regulated operations             |
| Performance        | Adequate for small-scale, iterative tasks        | Optimized for heavy, deterministic workloads      | Prototyping vs production data processing                  |

The hybrid stance is pragmatic: use MCP where it adds capability without compromising performance or control, and fall back to APIs for the heavy lifting[^9][^10].


## Performance Optimization Techniques for Claude Code Setups

Performance is a function of clarity, context, and iteration. Claude Code performs best when given specific targets and guided through disciplined workflows. The following techniques shorten time-to-success and reduce context bloat.

### Context Management Discipline

Reset frequently with /clear to keep the window focused. For long sessions, use /compact to summarize while preserving critical decisions. Scope chats to single features or projects; avoid mixing unrelated tasks. Provide specific files and URLs when relevant, and interrupt early if direction is off—pressing Escape halts thinking or tool calls, preserving context for correction[^6].

### Specificity, Targets, and Iteration

Claude’s success rate improves with precise instructions and clear targets. In TDD, write tests first, confirm failure, and only then implement; in Visual Target Iteration, provide screenshots or mocks and iterate until the output matches. These targets anchor the agent and reduce thrashing. Images are particularly effective for UI work; screenshots help the agent evaluate layout, hierarchy, and responsiveness[^6][^4].

### Multi-Claude and Parallelization

Separate writing and verification agents to improve reliability: one writes code, another reviews, and a third edits based on feedback. Use Git worktrees to check out multiple branches in parallel, running independent Claude instances per worktree. This design removes context-switching overhead and enables true parallel progress on different tasks[^6].

### Headless Automation and CI/CD

Use claude -p with streaming JSON outputs for automations. Fan-out patterns generate task lists and call Claude per item with constrained tools and explicit output contracts; pipelining integrates Claude into data processing flows. Headless runs should define permissions narrowly and avoid persistence between invocations, making each run self-contained[^6].

To connect optimization levers to outcomes:

Table 5: Optimization Levers and Outcomes

| Lever                     | Expected Impact on Latency, Cost, Reliability         | Supporting Practices                                      |
|---------------------------|--------------------------------------------------------|-----------------------------------------------------------|
| Specificity in prompts    | Lower latency, fewer retries, higher first-pass success | Provide edge cases, constraints, verification steps       |
| /clear and /compact       | Lower context bloat, sustained focus                   | Reset between tasks; summarize preserving critical context|
| TDD and Visual targets    | Higher reliability, faster convergence                 | Write tests first; provide mocks/screenshots              |
| Multi-Claude (write vs verify) | Improved quality, controlled cost via focused agents  | Separate concerns; use scratchpads for communication      |
| Git worktrees             | Parallel speedup, reduced orchestration overhead       | One tab per worktree; consistent naming                   |
| Headless streaming (claude -p) | CI/CD integration, structured outputs, lower overhead | Constrain tools; define OK/FAIL contracts                 |

The common thread is target-driven iteration: give the agent a clear goal and the right context, then iterate with disciplined resets and focused sub-agents[^6][^4].


## Common Patterns for Successful Claude Code Agents

Certain workflows consistently produce strong results across codebases and teams. They share a reliance on explicit targets, verification, and progressive context strategies.

### Explore–Plan–Code–Commit

Begin by gathering context without committing changes. Use sub-agents to investigate edge cases or dependencies. Produce a plan—optionally saved as a document or issue—and confirm it before implementation. Implement with explicit verification steps, then commit and open a PR. This pattern prevents premature coding and reduces rework[^6].

### Test-Driven Development (TDD)

Write tests that capture expected behavior, confirm they fail, and only then implement. Instruct the agent not to modify tests during implementation; iterate until all tests pass. Independent sub-agents can verify the solution is not overfitting specific cases. TDD anchors iteration and delivers measurable progress[^6].

### Visual Target Iteration

Provide visual mocks or screenshots and ask the agent to implement accordingly. Iterate with screenshots to verify layout and styling. Claude’s outputs improve significantly within two to three iterations. This approach is especially effective for UI changes where visual fidelity matters[^6].

### Git and GitHub Interactions

Automate git operations—search history for design rationale, compose commit messages, resolve merge conflicts, and create PRs. Use GitHub integrations for triage, labeling, and fixing simple code review comments. These patterns remove friction from routine tasks and standardize team workflows[^6].

### Headless CI/CD Patterns

Run Claude headlessly for issue triage, linting beyond style (e.g., identifying stale comments or misleading names), and fan-out migrations. Streaming JSON outputs make results machine-friendly. Headless runs should constrain tools, enforce permissions, and return clear success/failure signals for downstream handling[^6].

To guide pattern selection:

Table 6: Pattern Selection Guide

| Scenario                              | Recommended Workflow                 | Success Metrics                                       |
|---------------------------------------|--------------------------------------|-------------------------------------------------------|
| New feature with unclear scope        | Explore–Plan–Code–Commit             | Plan approval time; fewer implementation retries      |
| Bug fix with clear expected behavior  | TDD                                  | Tests pass; reduced regression rate                   |
| UI overhaul or new screen             | Visual Target Iteration              | Screenshot match rate; iteration count                |
| Routine maintenance (changelog, docs) | Headless automation + Slash commands | Completion time; PR quality; error rates              |
| Large-scale migration                 | Headless fan-out + routing           | Items processed per hour; failure rate; rollback count|


## Implementation Playbook: From Zero to Production

A pragmatic playbook turns best practices into daily operations.

### Project Setup and Configuration

Install the CLI per platform and configure MCP servers where needed. Define CLAUDE.md using the WHAT/WHY/HOW structure and progressive disclosure pointers. Establish an initial allowlist of tools and permissions, tuned to environment (project vs global). These steps anchor subsequent work in clarity and control[^1][^6][^8].

### Environment Tuning and Context Strategy

Curate tools and slash commands for common workflows. Use Skills for repeatable actions and to encapsulate cross-team procedures. Set up stop hooks for lint/format enforcement, and implement compaction and clearing strategies to keep context windows focused. Document conventions and refer to them via CLAUDE.md rather than embedding everything directly[^6][^8].

### Automation and CI/CD Integration

Use headless mode with streaming JSON to integrate into CI/CD. For fan-out workloads, generate task lists and call Claude per item with constrained tools and explicit output contracts. In pipelined flows, consume and produce structured JSON to ensure composability. Govern permissions tightly and ensure each invocation is self-contained[^6].

### Observability and Evals

Build representative test sets based on real usage. Instrument tool usage and error handling. Analyze outputs and iterate on prompts, tools, and rules to close gaps. Treat the harness—CLAUDE.md, commands, Skills, MCP configuration—as a living system, continuously refined through evidence[^4].

A setup checklist consolidates these steps:

Table 7: Setup Checklist

| Area             | Action Items                                                          |
|------------------|-----------------------------------------------------------------------|
| Tools            | Configure allowlist; define project/global settings; session flags    |
| MCP              | Set project/global/.mcp.json; filter tools; write clear descriptions  |
| Commands/Skills  | Create slash commands for common workflows; author Skills as needed   |
| Hooks            | Add stop hooks for linters/formatters; enforce deterministic fixes    |
| Documentation    | Write CLAUDE.md (WHAT/WHY/HOW); link companion docs; version and review|
| CI/CD            | Enable headless mode; streaming JSON; define output contracts         |
| Governance       | Scope permissions; audit MCP servers; document team conventions       |


## Risk, Governance, and Security Considerations

Agentic coding introduces risk that must be managed through configuration, permissions, and operational discipline. The goal is to preserve autonomy without sacrificing control.

### Permission Management

Start with conservative defaults and add allowlist entries only as needed. Use project-level settings to enforce team-wide rules, and global settings for universal tools. Session flags enable temporary expansions for specific tasks. Document permission changes and review them during code reviews to maintain visibility and accountability[^6].

### MCP Server Hardening

Secure MCP servers with strong authentication, clear authorization boundaries, and comprehensive auditing. Enforce rate limiting and input validation server-side. Provide concise tool descriptions and deterministic error handling to reduce misuse. Since MCP introduces autonomy, server-side controls are essential to prevent unintended actions and to maintain compliance[^9][^10].

### Headless Risk Controls

Constrain permissions in headless runs, use containerization for safe “YOLO” tasks (e.g., bulk linting), and avoid internet access where possible. Define clear output contracts and treat each invocation as ephemeral to minimize side effects. Headless automations should be auditable, with logs capturing tool calls and outcomes for post-mortem analysis[^6].


## Appendices: Reference Configurations and Patterns

This appendix provides concrete configurations and references to accelerate adoption and standardize practices across teams.

### MCP Server Configuration Templates

Configure MCP servers at project and global levels, and consider checked-in .mcp.json for shared tools. Apply tool filtering and name prefixing to reduce noise and avoid collisions. Clear descriptions and error semantics help the agent use tools correctly. Transport options include stdio, streamable HTTP, and Server-Sent Events (SSE), each suitable for different deployment contexts[^10][^6].

### Slash Commands and Skills Library Patterns

Organize prompt templates under .claude/commands with parameters for reuse (e.g., /review, /fix-github-issue). Author Skills in .claude/skills as reusable Markdown capabilities that may include instructions and code. Both patterns support progressive disclosure and shrink context usage by standardizing repeatable workflows[^6].

### Example Headless Invocations and CI/CD Pipelines

Use claude -p with streaming JSON outputs for automated triage and migration tasks. Fan-out scripts generate task lists and call Claude per item with constrained tools and success/failure contracts. Pipelined flows consume and emit structured JSON for downstream processing. Ensure each run is permission-scoped and self-contained[^6].

For quick lookup, the following cheat sheet summarizes CLI flags and common workflows:

Table 8: CLI Flags and Use Cases Cheat Sheet

| Flag/Command                         | Purpose                                  | Typical Workflows                                        |
|--------------------------------------|------------------------------------------|----------------------------------------------------------|
| claude --dangerously-skip-permissions | Bypass prompts for safe, automated tasks | Bulk linting; boilerplate generation in containers       |
| claude -p                            | Headless mode for automation             | CI/CD triage; migrations; pipelined processing           |
| --output-format stream-json          | Machine-friendly streaming                | Consume results in scripts; structured post-processing   |
| --verbose                            | Debugging invocation details             | Development; troubleshooting                             |
| --allowedTools                       | Constrain tool usage per session         | Headless runs; governed automation                       |
| --mcp-debug                          | Debug MCP configuration and connectivity | Setting up MCP servers; resolving tool discovery issues  |

These configurations and patterns provide a baseline to build upon, tailored to your organization’s governance and operational needs[^6][^10].


## References

[^1]: Claude Code overview – Claude Code Docs. https://code.claude.com/docs/en/overview  
[^4]: Building agents with the Claude Agent SDK – Anthropic. https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk  
[^6]: Claude Code: Best practices for agentic coding – Anthropic. https://www.anthropic.com/engineering/claude-code-best-practices  
[^7]: Agent design lessons from Claude Code – Jannes’ Blog. https://jannesklaas.github.io/ai/2025/07/20/claude-code-agent-design.html  
[^8]: Writing a good CLAUDE.md – HumanLayer Blog. https://www.humanlayer.dev/blog/writing-a-good-claude-md  
[^9]: MCP vs APIs: When to Use Which for AI Agent Development – Tinybird. https://www.tinybird.co/blog/mcp-vs-apis-when-to-use-which-for-ai-agent-development  
[^10]: Model Context Protocol (MCP) Tools – Strands Agents. https://strandsagents.com/latest/documentation/docs/user-guide/concepts/tools/mcp-tools/  
[^11]: Building Effective AI Agents – Anthropic. https://www.anthropic.com/research/building-effective-agents
