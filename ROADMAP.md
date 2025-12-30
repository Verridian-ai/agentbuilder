# Agent Builder Roadmap

This document outlines the planned features and improvements for Agent Builder.

---

## Current Version: 1.0.0

### Completed Features
- Visual Workflow Builder with drag-and-drop nodes
- Cloud IDE integration (code-server)
- AI integration via OpenRouter (Claude, GPT-4, Gemini)
- MCP Server Builder with templates
- Network automation for Cisco/Juniper
- AI-powered research tools
- JWT authentication with rate limiting
- Google Cloud Run deployment

---

## High Priority

### 1. Backend Integration Completion
**Status:** Planned
**Effort:** High
**Impact:** Critical

Many frontend features currently use mock data. Complete integration needed:
- Connect project persistence to Neon DB
- Implement real file sync between frontend and backend
- Enable actual workflow execution
- Connect all CRUD operations

**Files to modify:**
- `src/lib/api.ts`
- `backend/server.js`

---

### 2. Undo/Redo for Workflow Builder
**Status:** Planned
**Effort:** Medium
**Impact:** High

The visual workflow builder lacks undo/redo capability:
- Add undo/redo stack (50 actions max)
- Implement keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- Add history visualization panel

**Files to modify:**
- `src/store/index.ts`
- `src/pages/Builder.tsx`

---

### 3. Real-Time Collaboration (WebSocket)
**Status:** Planned
**Effort:** High
**Impact:** High

Enable real-time multi-user editing:
- WebSocket server implementation
- Presence indicators (who's online)
- Conflict resolution for simultaneous edits
- Cursor positions and selections

**Files to modify:**
- `backend/server.js` (add WebSocket support)
- `src/lib/api.ts`
- `src/pages/CloudIDE.tsx`

---

### 4. Test Coverage
**Status:** Planned
**Effort:** High
**Impact:** High

Current test coverage is 0%. Target 70%:
- Add Vitest for unit tests
- Add Playwright for E2E tests
- Set up CI pipeline for automated testing
- Add coverage reporting

**New files:**
- `vitest.config.ts`
- `src/**/*.test.ts`
- `e2e/**/*.spec.ts`

---

## Medium Priority

### 5. Performance Optimization
**Status:** Planned
**Effort:** Medium

- Code splitting for routes (lazy loading)
- Virtual scrolling for long lists
- API response caching (React Query)
- Bundle size optimization

---

### 6. Enhanced Error Handling
**Status:** Planned
**Effort:** Medium

- Standardized error response format
- Error boundary improvements
- Retry mechanisms for failed requests
- User-friendly error messages

---

### 7. Light Mode Support
**Status:** Planned
**Effort:** Low

- Add theme toggle
- CSS custom properties for theming
- System preference detection
- Persist preference in localStorage

---

### 8. Offline Support (PWA)
**Status:** Planned
**Effort:** Medium

- Service worker implementation
- Offline-first data caching
- Background sync for pending changes
- Install prompt for mobile

---

## Lower Priority

### 9. Internationalization (i18n)
**Status:** Future
**Effort:** Medium

- Multi-language support
- Translation management
- RTL support

---

### 10. Custom Theming
**Status:** Future
**Effort:** Low

- User-defined color schemes
- Custom accent colors
- Theme sharing

---

### 11. Analytics Dashboard
**Status:** Future
**Effort:** Medium

- Usage statistics
- Project metrics
- API usage tracking
- Performance monitoring

---

### 12. Plugin Marketplace
**Status:** Future
**Effort:** High

- Plugin discovery and installation
- Plugin versioning
- Community contributions
- Plugin ratings/reviews

---

## Architecture Improvements

### Backend Refactoring
**Status:** Planned
**Priority:** High

Current `server.js` is 1,528 lines. Split into:
```
backend/
├── src/
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sessions.js
│   │   ├── files.js
│   │   └── ai.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── fileService.js
│   │   └── aiService.js
│   ├── db/
│   │   ├── client.js
│   │   └── schema.js
│   └── server.js
```

---

### Frontend State Management
**Status:** Planned
**Priority:** Medium

Split monolithic Zustand store (38+ properties) into:
```
src/store/
├── projectStore.ts
├── workflowStore.ts
├── cloudIDEStore.ts
├── authStore.ts
└── uiStore.ts
```

---

### CloudIDE Component Refactor
**Status:** Planned
**Priority:** Medium

Split 1,016-line `CloudIDE.tsx` into:
```
src/pages/CloudIDE/
├── index.tsx
├── FileExplorer.tsx
├── CodeEditor.tsx
├── Terminal.tsx
├── Sidebar.tsx
└── Toolbar.tsx
```

---

## Security Improvements

### Already Fixed (v1.0.0)
- Path traversal validation
- JWT algorithm specification (HS256)
- Removed hardcoded API keys
- Protected sensitive endpoints
- Added rate limiting

### Planned
- HTTPS redirect middleware
- Enhanced input validation (Zod)
- Comprehensive audit logging
- Two-factor authentication

---

## Timeline

### Q1 2025
- Backend integration completion
- Undo/redo functionality
- Test infrastructure setup

### Q2 2025
- Real-time collaboration
- Performance optimizations
- Light mode support

### Q3 2025
- Offline PWA support
- Plugin marketplace (beta)
- i18n support

### Q4 2025
- Enterprise features
- Custom theming
- Analytics dashboard

---

## Contributing

Want to help with any of these features? See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

---

## Feedback

Have suggestions for the roadmap? Open an issue with the `roadmap` label or start a discussion.
