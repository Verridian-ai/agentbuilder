# Agent Configuration Patterns and Optimization Strategies for Claude

## Executive Summary

Claude-based agents deliver their highest value when configuration is treated as an engineering discipline—combining concise, universal onboarding instructions, a minimal-viable toolset, progressive disclosure of detail, and disciplined context management. In practice, this means writing CLAUDE.md as an always-on, universally applicable primer; selecting and documenting only the tools Claude must have; structuring prompts with explicit success criteria and guardrails; integrating Model Context Protocol (MCP) tools with clear contracts and permissions; optimizing context usage through compaction, memory, and subagents; and instituting operational guardrails that prevent repeated failure patterns. Teams that implement these patterns report lower token consumption, fewer cycles of rework, and more predictable outcomes across coding, research, and workflow automation tasks.[^1][^2][^3]

Top five recommendations, prioritized by impact and feasibility:

1. Write a crisp CLAUDE.md that encodes universal, persistent context only (what the project is, why it exists, and how to work in it), and place task-specific guidance in separate files with pointers in CLAUDE.md.[^1][^5][^8]
2. Curate a minimal toolset: prefer deterministic tools (linters, formatters, test runners) over instruction-heavy style guides; document the few custom scripts or MCP servers Claude must use.[^1][^2][^6]
3. Structure prompts to be explicit about success criteria, desired action vs. advice, and output format; enforce with role and Assistant priming, and a “think then act” pattern for complex tasks.[^4][^13]
4. Integrate MCP tools with clear parameter schemas, token-efficient responses, and scoped permissions (project vs. global vs. managed), using hooks and slash commands for repeatability.[^1][^6][^12]
5. Manage context for quality over quantity: encourage earlier compaction, use memory to preserve critical facts, and isolate deep search in subagents that return distilled summaries.[^3][^9][^10]

Expected outcomes include materially lower token usage, faster cycle times, higher adherence to project conventions, and more reliable session continuity across long-horizon work.[^1][^3]

## Foundations: Configuration Layers and Context Engineering for Claude

Claude’s behavior emerges from layered instructions and tools that collectively shape its “operating system.” In agentic workflows, the model’s platform-level guidelines and developer system prompts are augmented by user and project rules, tool specifications, and request-level instructions. Effective configuration aligns these layers so Claude can consistently act with intent, avoid context bloat, and preserve working memory for reasoning.[^11][^3]

### Configuration Layers and Effective Context Anatomy

An agent’s guidance stack typically includes platform-level rules, developer system prompts, user-level rules (for example, global CLAUDE.md), project-level CLAUDE.md files, the current request, and tool specifications. Each layer has authority and scope. Misalignment—redundant instructions, ambiguous guidance, or overstuffed tool descriptions—creates confusion and waste. In contrast, a minimal, well-structured system prompt and focused tool contracts give Claude the right degree of freedom: enough to exercise judgment, but not so much that instruction-following degrades.[^11][^3]

The anatomy of effective context rests on three pillars. First, system prompts should be concise, using simple language and sectioning (XML tags or Markdown headings) for role, priorities, guardrails, and tool guidance. Second, tools should expose clear contracts—unambiguous parameter names, robust error handling, and token-efficient responses. Third, few-shot examples should be curated to canonical behaviors rather than laundry lists of edge cases.[^3]

To clarify roles and scope across layers, Table 1 summarizes the configuration hierarchy and the tokens at stake.

To illustrate the interplay of these layers and how to prevent cross-talk or redundancy, the following table distills authority and scope across the prompt stack.

Table 1. Prompt and configuration layers: authority and scope

| Layer | Typical content | Authority and scope | Token impact | Notes |
|---|---|---|---|---|
| Platform-level | Safety, identity, broad behavioral constraints | Highest precedence; global | Low but persistent | Not directly editable by teams; shapes baseline behavior[^11] |
| Developer system prompt | Engineering patterns, tool use guardrails, orchestration policies | High; defines agent’s “operating system” | Moderate | Often extensive; should be well-structured and minimal[^11] |
| User-level rules | Global preferences and conventions (e.g., ~/.claude/CLAUDE.md) | Applies to all sessions for a user | Low–moderate | Keep universal and concise[^1] |
| Project-level rules | Project map, build/test commands, repository etiquette (CLAUDE.md) | Applies within project scope | Moderate | Use progressive disclosure; avoid task-specific detail[^1][^5] |
| Request-level | Specific task instructions, success criteria | Narrow; ephemeral | Variable | Be explicit; tie to clear outcomes[^4] |
| Tool specifications | Tool names, parameters, examples, constraints | Narrow; triggers tool use | Moderate when overstuffed | Keep descriptions succinct and focused[^3] |

The significance of this structure is practical: by reducing duplication and ambiguity across layers, Claude experiences higher signal-to-noise per token and can reason more effectively within its working memory.[^3]

### CLAUDE.md Placement and Imports

CLAUDE.md is the primary vehicle for persistent, universally applicable context. Its placement determines scope: root for broad project coverage, subdirectory for localized guidance, and home directory for user-wide preferences. Monorepos benefit from multiple CLAUDE.md files, each scoped to its subtree, with imports used to reference companion docs rather than embed content. In all cases, progressive disclosure—pointing to separate, task-specific files rather than stuffing every command into CLAUDE.md—keeps always-on context lean and universally relevant.[^1][^8]

To make these choices concrete, Table 2 summarizes placement options and their typical content focus.

Table 2. CLAUDE.md placement options and scope

| Location | Scope | Typical content | Use case |
|---|---|---|---|
| ~/.claude/CLAUDE.md | User-wide | Global preferences, shell setup, universal conventions | Personal harness across repos[^1] |
| repo root CLAUDE.md | Project-wide | What/why/how of the project, build/test/run, repo etiquette, pointers to agent_docs | Onboarding Claude to the codebase[^1][^5] |
| subdirectory CLAUDE.md | Subtree | Local conventions, commands, boundary notes | Monorepo apps or packages[^8] |
| CLAUDE.local.md | Local overrides | Personal shortcuts and notes (ignored in VCS) | Individual workflow tuning[^8] |

Importantly, imports are not evaluated inside code spans or blocks, recursive imports are capped, and you can list companion files (for example, agent_docs/building.md) with short descriptions and ask Claude to decide which to read or to ask for approval before loading larger docs.[^8] This pattern is the cornerstone of progressive disclosure and keeps always-on tokens high-signal.[^5][^8]

## Structuring CLAUDE.md for Maximum Effectiveness

The most effective CLAUDE.md files answer three questions: What is the project (tech stack, structure, map of monorepo apps and packages)? Why does it exist (purpose, key architectural decisions)? How should Claude work in it (standard commands for build/test/run, repository etiquette, how to verify changes)? Universal guidance belongs in CLAUDE.md; task-specific detail should live in separate files and be referenced by pointer.[^5][^1][^8]

Instruction count matters. Frontier models follow more instructions than smaller models, but instruction-following quality declines as count increases across the board. Claude Code’s system prompt already includes a sizable instruction set; therefore, keep CLAUDE.md’s instruction count as low as possible and bias toward universally applicable guidance. Focus on quality and specificity: precise commands, clear success criteria, and actionable guardrails.[^5]

To prevent bloat and keep Claude’s always-on context focused, adopt progressive disclosure. Use concise pointers to companion docs and instruct Claude to read the minimum necessary files before starting work. Prefer file:line references to authoritative sources over embedded snippets, which risk becoming stale.[^5][^8]

Deterministic tools should handle style and formatting. Linters, formatters, and type checkers outperform prompting for style enforcement and reduce instruction count. Use hooks to run linters/formatters automatically and present findings to Claude for substantive fixes, and use slash commands to make repeated workflows available as templates.[^5]

To illustrate a minimal-yet-complete structure, Table 3 offers a template map with section purpose and concise examples.

Table 3. Template sections and purpose

| Section | Purpose | Example content |
|---|---|---|
| Project map | Orient Claude to structure and purpose | “This is a monorepo with app/web (React) and app/api (Node/Express); shared/pkg/ui contains design system.”[^5] |
| Build/test/run | Provide canonical commands | “Use bun install; run tests via bun test; start dev via bun dev.”[^1] |
| Repository etiquette | Encode team conventions | “Branch naming: feat/ID-description; rebase before merging; no force-push to main.”[^1] |
| Protected areas | Define “do not touch” zones | “Do not edit tests/, migrations/, or security-critical code without explicit approval.”[^8] |
| Pointers to task docs | Progressive disclosure | “For building: see agent_docs/building.md; for tests: agent_docs/tests.md; for releases: agent_docs/release.md.”[^5][^8] |

### Content Architecture and Instruction Limits

Concentrate on universal instructions: project map, canonical commands, repository etiquette, and pointers to companion docs. Avoid task-specific schemas, long code snippets, and detailed style rules that apply only occasionally. The guiding principle is less (instructions) is more; keep always-on guidance concise so Claude can follow it reliably.[^5]

### Progressive Disclosure and Import Patterns

List companion files with short descriptions and encourage Claude to ask for approval before reading large documents. Prefer file:line references to authoritative context rather than embedding content that can drift. Be aware of import limitations: no evaluation inside code spans/blocks and a cap on recursive import depth.[^8][^5]

### Deterministic Tooling Over Linting Prompts

Configure linters and formatters to enforce style, and run them via hooks. Use slash commands to expose repeated workflows and code guidelines, and separate formatting from implementation concerns. This reduces token cost and improves adherence compared to asking Claude to be an expensive linter.[^5]

## Tool Selection and Configuration for Minimal Context Overhead

A minimal-viable toolset yields better reliability and lower maintenance burden. Prefer standard tools and deterministic scripts with clear contracts; avoid bloated tool descriptions and ambiguous decision points. Document tool usage succinctly in CLAUDE.md with examples and encourage the use of --help to pull documentation at runtime rather than embedding lengthy manuals.[^3][^1]

Permissions should be curated to reduce repeated prompts. Use allowlists for specific tools, document frequently used tools in CLAUDE.md, and configure MCP servers in project, global, or managed scopes. Hooks can automate lifecycle tasks, and slash commands can expose repeatable workflows as templates.[^1][^12]

To compare tool categories by token cost and risk, Table 4 provides a selection matrix.

Table 4. Tool selection matrix

| Category | Token cost | Decision risk | Recommended usage |
|---|---|---|---|
| Bash utilities (grep, fd, git) | Low | Low | Document common commands in CLAUDE.md; encourage --help usage[^1] |
| Linters/formatters (Biome, eslint) | Low | Low | Run via hooks; present findings to Claude for substantive fixes[^5] |
| Test runners (bun test, pytest) | Low–moderate | Low | Use deterministic verification; test early and often[^1] |
| Custom scripts (bespoke glue) | Moderate | Moderate | Keep contracts clear; document in CLAUDE.md with examples[^8] |
| MCP servers (GitHub, Sentry, Puppeteer) | Moderate | Variable | Scope permissions; keep tool descriptions concise[^1][^6] |

Permissions strategies and scopes matter for frictionless operation. Table 5 summarizes common approaches and their trade-offs.

Table 5. Permissions strategies and scope

| Strategy | Scope | Pros | Cons |
|---|---|---|---|
| Allowlist specific tools | Project/user | Reduces prompts; precise control | Requires maintenance as tools evolve[^1] |
| Project MCP (.mcp.json) | Project | Shared, reproducible configuration | May drift if not reviewed; scoped to repo[^12] |
| Global MCP (~/.claude.json) | User | Convenience across repos | Risk of over-permissioning in some projects[^12] |
| Managed MCP (enterprise) | Org | Central policy and SSO alignment | Operational overhead; governance required[^12] |

### Minimal-Viable Toolset and Contracts

Favor tools that return token-efficient information and handle errors robustly. Define contracts with unambiguous parameter names, explicit types, and clear usage constraints. Avoid covering too much functionality in one tool; split responsibilities to reduce ambiguity and token footprint.[^3]

### Permissions and MCP Configuration

Use /permissions and settings files to curate allowlists. Check in .mcp.json for shared servers, use global configuration for convenience, and adopt managed configurations in enterprises to align with policy. When diagnosing MCP issues, run with debug flags and monitor configuration across scopes to prevent drift.[^1][^12]

## Prompt Engineering Patterns for Agent Behavior

Agent prompts differ from chatbot prompts: they must steer continuous action and tool use under uncertainty. Claude 4.x models respond best to explicit instructions, structured tags, role priming, and success criteria. A “think then act” pattern encourages reflection after tool calls, and clear guardrails minimize over-engineering and hallucinations.[^4][^13][^11]

Explicit instructions and success criteria reduce ambiguity. Tell Claude what to do and how to verify success, specify output formats, and differentiate between “implement changes” vs. “recommend.” Use XML-like tags to separate instructions from input and expected outputs. Assign a role and seed the Assistant message to anchor the desired style from the first token. For complex tasks, instruct Claude to think before acting and reflect on tool results to plan next steps.[^4][^13]

To choose patterns deliberately, Table 6 maps prompt patterns to outcomes and sample triggers.

Table 6. Prompt patterns mapped to outcomes

| Outcome | Pattern | Sample trigger | Effect |
|---|---|---|---|
| Proactive implementation | “By default, implement changes; infer intent and proceed with tools” | Feature implementation in known codebase | Reduces back-and-forth; speeds delivery[^4] |
| Conservative guidance | “Do not edit unless explicitly asked; research and recommend” | Unclear requirements or sensitive code | Prevents accidental changes; improves safety[^4] |
| Structured output | Role + Assistant priming + format tags | Reports, PR descriptions, JSON | Enforces consistent format and style[^13] |
| Reflection and planning | “Think then act”; post-tool reflection | Complex debugging or multi-step tasks | Improves reasoning and next-step selection[^4] |
| Parallel execution | “Run independent tool calls in parallel” | Reading multiple files, running disjoint checks | Cuts latency; increases throughput[^4] |

### Action vs. Advice: Controlling Proactivity

Claude’s default stance can be tuned via prompts. When the goal is delivery, use proactive patterns that instruct Claude to implement changes and infer missing details through tool use. When risks are high or requirements are unclear, use conservative patterns that privilege research and recommendations over edits. This control prevents unintended changes while preserving momentum when action is appropriate.[^4]

### Structured Outputs and Reflection

Use XML tags to delineate sections and seed the Assistant message to anchor style. For complex tasks, instruct Claude to think through the problem, reflect on tool results, and then act. This pattern improves reasoning and reduces thrashing by ensuring plans are data-driven before implementation.[^13][^4]

## Plugin/Tool Integration Patterns that Work Best with Claude

Model Context Protocol (MCP) standardizes tool integration through a client-server architecture. MCP hosts (e.g., Claude Desktop, IDEs) run clients that connect to servers exposing tools, resources, and prompts. Transports include local stdio and remote HTTP with Server-Sent Events. In enterprise contexts, MCP adoption patterns emphasize security, SSO alignment, and centralized governance through managed configurations.[^6][^12]

Good MCP integrations expose concise tools with clear parameter schemas and token-efficient responses. They document usage patterns and provide examples in CLAUDE.md. Governance matters: align project, global, and managed scopes with organizational policies; use allowlists and debug flags to maintain stability and traceability.[^1][^12]

To make roles explicit, Table 7 summarizes MCP components and responsibilities.

Table 7. MCP components and roles

| Component | Role | Examples | Notes |
|---|---|---|---|
| Host | Environment where MCP runs | Claude Desktop, VS Code, Cursor | Provides client runtime[^6] |
| Client | Maintains connection to servers | Built into host | JSON-RPC 2.0 messaging[^6] |
| Server | Exposes tools/resources/prompts | GitHub MCP, Slack MCP, Postgres MCP | Contracts and auth live here[^6] |
| Transport | Communication layer | stdio (local), HTTP+SSE (remote) | Reliability and latency trade-offs[^6] |

### MCP Server Design and Contracts

Design tools with minimal parameters, clear types, and explicit usage constraints. Keep descriptions succinct and avoid time-sensitive content; prefer pointers to documentation that Claude can fetch at runtime. Ensure robust error handling and predictable outputs to minimize retries and token waste.[^6]

### Enterprise Governance and Security

Align MCP configurations with enterprise policies using managed settings and SSO. Centralize tool access, monitor configuration drift, and adopt governance processes that ensure consistency across teams. The enterprise challenge is visibility and control; managed MCP and gateway patterns bring tool access under policy while preserving developer velocity.[^12]

## Optimizing Context Usage in Agent Configurations

Quality beats quantity in context management. Recent improvements in Claude Code center on protecting working memory by triggering auto-compaction earlier and clearing stale tool outputs while preserving critical facts. Leaving 25–35% of the context window free for reasoning maintains quality and prevents compaction failures that can corrupt sessions.[^9]

Compaction, memory, and subagents are the primary levers. Compaction summarizes and clears low-signal content near limits; memory persists important facts outside the context window; subagents isolate deep search and return distilled summaries to the main agent. Hybrid retrieval—preloading minimal upfront context and fetching just-in-time—reduces bloat while preserving speed.[^3][^9]

To connect techniques to scenarios, Table 8 maps context strategies to use cases.

Table 8. Context techniques and when to use them

| Technique | Best used when | Why it works |
|---|---|---|
| Early compaction | Sessions approach 64–75% usage | Preserves working memory; prevents failures[^9] |
| Memory tool | Critical facts must persist across windows | Reduces repeated mistakes; maintains continuity[^10] |
| Subagents | Deep search or exploration is needed | Isolates detail; returns distilled summaries[^3] |
| Hybrid retrieval | Mix of static and dynamic content | Lean upfront load; fetch on demand[^3] |

Community observations emphasize token-wasting anti-patterns such as implementing without checking existing code, parallel agent collisions, and overengineering. Table 9 summarizes these patterns and practical fixes.[^14]

Table 9. Token-wasting patterns, costs, and fixes

| Pattern | Wasted tokens (example) | Fix |
|---|---|---|
| Implement without checking existing code | ~70K | Grep/search first; read relevant files before building[^14] |
| Swarm without coordination | ~300K | Use one agent or explicit handoffs; sequentialize conflicts[^14] |
| Build without testing | ~124K | Test after small changes; run verification early[^14] |
| Parallel collisions | ~15K | Lock files or coordinate changes; avoid concurrent edits[^14] |
| Overengineering | ~112K | Encode “do only what’s asked”; enforce minimalism[^14] |
| Compaction amnesia | ~80K+/repeat | Persist critical preferences in memory/CLAUDE.md; read on start[^14] |

### Compaction and Working Memory

Triggering auto-compaction earlier preserves free space for reasoning and avoids failures when the system must compact but lacks room. After compaction, preserve critical facts in memory or persistent files to prevent repeating past mistakes and to maintain continuity in long sessions.[^9]

### Memory and Subagents

Persist notes and key decisions using memory tools and files, and instruct Claude to consult memory at session start. Subagents explore broadly but return compact summaries to the main agent, preserving working memory and reducing pollution from detailed search logs.[^10][^3]

## Common Failure Patterns and How to Avoid Them

Failure patterns cluster around over-instruction in CLAUDE.md, overengineering, lack of testing, swarm coordination failures, and compaction amnesia. The mitigations are practical: check first and build second, test immediately and often, persist critical context to memory, and encode “do only what’s asked” to avoid scope creep. Structured logging and monitoring help detect patterns early; hooks and commands make workflows deterministic.[^14][^7][^5]

To make detection and remediation actionable, Table 10 catalogs common anti-patterns with indicators, root causes, and fixes.

Table 10. Anti-patterns, indicators, and remediations

| Anti-pattern | Indicators | Root cause | Remediation |
|---|---|---|---|
| Over-instruction in CLAUDE.md | Declining adherence; ignores guidance | Too many non-universal instructions | Trim to universal guidance; use progressive disclosure[^5] |
| Overengineering | Delivery of unrequested features | Ambiguous scope; lack of guardrails | “Do only what’s asked”; encode minimalism[^4][^14] |
| No testing | Large debugging sessions; late failures | Testing deferred too long | Test after small changes; verify early[^14] |
| Swarm chaos | Conflicts; repeated errors | Parallel agents with no coordination | Use single agent or explicit handoffs[^14] |
| Compaction amnesia | Repeating past mistakes; lost preferences | Critical context not persisted | Use memory/CLAUDE.md to persist facts; read at start[^14] |
| Permission fatigue | Repeated prompts | Broad tool permissions | Curate allowlists; configure MCP scopes[^1][^12] |
| Installation/auth issues | Hangs; login failures | Misconfigured Node/nvm; stale auth | Follow troubleshooting guide; reset auth; native install[^7] |

### Anti-Patterns and Pragmatic Fixes

Check first, build second: always search for existing implementations before writing new code. Test immediately to avoid large debug sessions. Persist critical facts to memory or CLAUDE.md and instruct Claude to read them at session start. Encode minimalism: do only what is asked and avoid adding features “just in case.” These practices cut token waste and accelerate delivery.[^14]

### Operational Guardrails and Recovery

Use hooks to run deterministic checks and slash commands for repeatability. Monitor token usage and context status; summarize and prune mid-session when needed. For installations and authentication issues, follow official remediation steps and consider native installation methods to avoid Node/npm pitfalls.[^7]

## Implementation Playbooks and Checklists

Translating patterns into practice requires scaffolding: a minimal CLAUDE.md, curated tools and permissions, prompt templates for common outcomes, context operations, and MCP governance. The playbooks below are designed for drop-in use with team-specific details.

### Team-ready CLAUDE.md playbook

Structure the file with a Project Map, Build/Test/Run, Repository Etiquette, Protected Areas, and Pointers to task-specific docs. Keep instruction count low and language specific. Encode universal guidance only and prefer pointers to detailed, task-specific docs that Claude can load on demand.[^5][^8]

Table 11. Playbook scaffolds and where to place them

| Artifact | Placement | Purpose |
|---|---|---|
| Minimal CLAUDE.md | Repo root | Universal onboarding (what/why/how)[^1][^5] |
| Subtree CLAUDE.md | Monorepo subdir | Local guidance and boundaries[^8] |
| agent_docs/*.md | Repo docs | Task-specific instructions; loaded via pointers[^5] |
| .claude/commands/* | Project or home | Slash command templates for repeatability[^1] |
| .mcp.json | Repo root | Shared MCP servers and tools[^12] |
| settings.json | .claude/ or ~/.claude | Project/user permissions and hooks[^1] |

### Prompt template library

Use role + Assistant priming, explicit tags, and “think then act” for complex tasks. Choose proactive or conservative patterns depending on risk and clarity. Instruct parallel tool execution when calls are independent; otherwise, sequence dependencies.[^4][^13]

Table 12. Prompt templates by goal

| Goal | Template elements | Expected effect |
|---|---|---|
| Implement changes | Role + “implement by default” + success criteria + verification | Faster delivery; fewer clarification turns[^4] |
| Research and recommend | Role + “do not edit unless asked” + structure output | Safety in sensitive contexts; clearer plans[^4] |
| Structured reporting | Tags (<prose>, <input>) + Assistant seed + format rules | Consistent outputs; less post-editing[^13] |
| Complex debugging | “Think then act” + post-tool reflection | Better reasoning; fewer thrashes[^4] |
| Parallel reads/checks | “Run independent tool calls in parallel” | Lower latency; higher throughput[^4] |

### Context operations checklist

Monitor context usage and summarize/prune when heavy; persist progress notes and critical facts to memory; design subagent handoffs with distilled returns. Encourage early compaction and avoid fighting auto-compact buffers.[^3][^9][^10]

### MCP governance checklist

Scope servers appropriately (project vs. global vs. managed), manage permissions via allowlists, and monitor configuration drift. Align enterprise tool access with SSO and policy, and adopt managed settings to ensure consistent governance across teams.[^12]

## Appendices: Resources and Further Reading

Teams can accelerate adoption by studying canonical examples and community learnings. For instance, Armin Ronacher’s experience underscores the value of expert control in producing good code with AI tools, and community issue analyses highlight token-wasting patterns and pragmatic fixes. Use these resources to refine local practices and inform configuration decisions.[^15][^14][^1]

## Acknowledged Information Gaps

- Official, model-specific instruction limits for Claude 4.5 beyond community observations remain unquantified; teams should validate locally.
- Some context management thresholds and behaviors vary by client or version; validate in your environment.
- MCP enterprise adoption metrics are drawn from community reports; corroborate for your organization.
- Comparative performance data for specific tool configurations across diverse codebases is limited; run targeted evaluations.
- Long-horizon, multi-agent coordination benchmarks are still emerging; pilot patterns before broad rollout.

## References

[^1]: Claude Code: Best practices for agentic coding - Anthropic. https://www.anthropic.com/engineering/claude-code-best-practices
[^2]: Skill authoring best practices - Claude Docs. https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
[^3]: Effective context engineering for AI agents - Anthropic. https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
[^4]: Prompting best practices - Claude Docs. https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-4-best-practices
[^5]: Writing a good CLAUDE.md | HumanLayer Blog. https://www.humanlayer.dev/blog/writing-a-good-claude-md
[^6]: Model Context Protocol—Deep Dive (Part 2/3) — Architecture. https://abvijaykumar.medium.com/model-context-protocol-deep-dive-part-2-3-architecture-53fe35b75684
[^7]: Troubleshooting - Claude Code Docs. https://code.claude.com/docs/en/troubleshooting
[^8]: Notes on CLAUDE.md Structure and Best Practices - callmephilip. https://callmephilip.com/posts/notes-on-claude-md-structure-and-best-practices/
[^9]: How Claude Code Got Better by Protecting More Context - Hyperdev. https://hyperdev.matsuoka.com/p/how-claude-code-got-better-by-protecting
[^10]: Manage Claude's memory - Claude Code Docs. https://code.claude.com/docs/en/memory
[^11]: Prompting agents: What works and why - Speakeasy. https://www.speakeasy.com/blog/prompting-agents-what-works-and-why
[^12]: Model Context Protocol (MCP) Guide: Enterprise Adoption 2025. https://guptadeepak.com/the-complete-guide-to-model-context-protocol-mcp-enterprise-adoption-market-trends-and-implementation-strategies/
[^13]: 12 prompt engineering tips to boost Claude's output quality - Vellum AI. https://www.vellum.ai/blog/prompt-engineering-tips-for-claude
[^14]: Community Learnings: 7 Critical Token-Wasting Patterns (700K+ tokens). https://github.com/anthropics/claude-code/issues/13579
[^15]: My first AI library (Armin Ronacher) — CLAUDE.md example and writeup. https://lucumr.pocoo.org/2025/6/21/my-first-ai-library/