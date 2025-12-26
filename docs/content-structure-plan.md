# Content Structure Plan - Claude Code Agent Builder

## 1. Material Inventory
**Strategic Foundation:**
- `claude_code_agent_builder_strategy.md`: Core features, personas, architecture.
- `docs/claude_code_research.md`: Optimization techniques, `claude.md` best practices.

**Key Assets (Conceptual):**
- **Nodes Library**: Action nodes (File Ops, Git, MCP), Role nodes (Architect, Reviewer).
- **Templates**: TDD, Visual Iteration, Headless CI/CD.
- **Data**: Evaluation metrics, Context usage stats.

## 2. Platform Structure
**Type:** SPA (Single Page Application) with complex state
**Reasoning:** The "Builder" nature requires a persistent, desktop-like environment with immediate feedback loops, drag-and-drop interactions, and real-time state management (React Flow).

## 3. Screen & Flow Breakdown

### 1. Dashboard (`/`)
**Purpose**: Entry point, project management, and template selection.
**Content Mapping:**
| Section | Component Pattern | Content Source | Visual Asset |
|---------|-------------------|----------------|--------------|
| Header | Global Nav | Strategy §4 | Logo, User Avatar |
| Welcome/Onboarding | Hero Pattern | Strategy §3 | "Build your first agent" |
| Recent Projects | Card Grid | User Data | Status indicators |
| Template Gallery | Card Grid | Strategy §4 | Template icons (TDD, CI/CD) |

### 2. The Agent Builder (`/builder/[id]`)
**Purpose**: The core IDE-like environment for constructing and configuring agents.
**Layout**: Three-pane layout (Sidebar, Canvas, Config Panel).

**Content Mapping:**
| Section | Component Pattern | Content Source | Visual Asset |
|---------|-------------------|----------------|--------------|
| **Left Sidebar** | Tool/Node Palette | Strategy §5 | Icons for Roles, Actions, Logic |
| **Main Canvas** | React Flow Canvas | Strategy §5 | Node visual representations |
| **Right Panel** | Configuration Tabs | Strategy §5 | `claude.md` Editor, Tool Config |
| **Bottom Panel** | Terminal/Logs | Strategy §6 | Streaming logs, Eval results |
| **Top Bar** | Toolbar | Strategy §5 | Run, Deploy, Save, Context Meter |

### 3. Claude.md Visual Editor (`/builder/[id]/config`)
**Purpose**: Specialized view for crafting the perfect system prompt (Context Optimization).
**Content Mapping:**
| Section | Component Pattern | Content Source | Visual Asset |
|---------|-------------------|----------------|--------------|
| **Project Identity** | Form Group | Research §2 | Name, Description |
| **Section: WHAT** | Rich Text / Wizard | Research §2 | Stack definitions, constraints |
| **Section: WHY** | Rich Text / Wizard | Research §2 | Business goals, domain info |
| **Section: HOW** | Rich Text / Wizard | Research §2 | Verification steps, best practices |
| **Preview** | Code Block | Research §2 | Live `claude.md` preview |

### 4. Evaluation & Testing (`/builder/[id]/eval`)
**Purpose**: Running simulations and checking quality gates.
**Content Mapping:**
| Section | Component Pattern | Content Source | Visual Asset |
|---------|-------------------|----------------|--------------|
| **Test Cases** | Table / List | Strategy §4 | Input/Output pairs |
| **Run Controls** | Action Bar | Strategy §4 | "Run All", "Run Selected" |
| **Results View** | Data Viz | Strategy §4 | Pass/Fail charts, Diff view |

### 5. Governance & Settings (`/settings`)
**Purpose**: Enterprise controls, RBAC, Secrets.
**Content Mapping:**
| Section | Component Pattern | Content Source | Visual Asset |
|---------|-------------------|----------------|--------------|
| **Team Members** | List | Strategy §4 | Role tags (Admin, Editor) |
| **Secrets/Env** | Table (Masked) | Strategy §6 | API Keys, Tokens |
| **Audit Logs** | Data Table | Strategy §6 | Timestamp, User, Action |

## 4. Content Analysis
**Information Density:** High
**Content Balance:**
- **Interactive UI**: 70% (Canvas, Forms, Editors)
- **Text/Code**: 20% (Instructions, Logs)
- **Data Viz**: 10% (Context usage, Eval scores)

**Critical Complexity**: The UI must balance the simplicity of drag-and-drop with the depth of `claude.md` text editing and MCP tool configuration. "Progressive Disclosure" is the key design pattern.
