# Contributing to Agent Builder

Thank you for your interest in contributing to Agent Builder! This document provides guidelines and instructions for contributing.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Be respectful and constructive in discussions
- Welcome newcomers and help them get started
- Focus on the issue, not the person
- Accept constructive criticism gracefully

---

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm (recommended) or npm
- Git
- Docker (optional, for containerized development)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/agent-builder.git
cd agent-builder
```

3. Add the upstream remote:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/agent-builder.git
```

---

## Development Setup

### Frontend

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The frontend runs at `http://localhost:5173`

### Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

The backend runs at `http://localhost:8080`

### Running Both

Open two terminals:
- Terminal 1: `pnpm dev` (frontend)
- Terminal 2: `cd backend && npm run dev` (backend)

---

## Making Changes

### Create a Branch

Create a feature branch from `main`:

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

### Make Your Changes

1. Write your code
2. Add or update tests as needed
3. Update documentation if applicable
4. Ensure all tests pass

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process or auxiliary tool changes |

### Examples

```bash
feat(builder): add undo/redo functionality

fix(auth): resolve token refresh race condition

docs(readme): update installation instructions

refactor(api): split api.ts into separate modules
```

### Commit Best Practices

- Keep commits focused and atomic
- Write clear, descriptive commit messages
- Reference issue numbers when applicable: `fix(auth): resolve login issue (#123)`

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks:**
   ```bash
   pnpm lint
   pnpm type-check
   pnpm test
   ```

3. **Update documentation** if you changed APIs or added features

### Creating the Pull Request

1. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template with:
   - Description of changes
   - Related issue numbers
   - Screenshots (for UI changes)
   - Testing instructions

### PR Requirements

- Passes all CI checks
- Has at least one approving review
- No merge conflicts with main
- Documentation updated if needed

### After Submission

- Respond to review feedback promptly
- Make requested changes in new commits
- Once approved, a maintainer will merge your PR

---

## Code Style

### TypeScript/React

- Use functional components with hooks
- Use TypeScript strict mode
- Prefer named exports
- Use async/await over promises

```typescript
// Good
export function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}

// Avoid
export default class UserProfile extends React.Component { ... }
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase with use prefix | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Types/Interfaces | PascalCase | `UserProfile` |

### File Organization

```
src/
├── components/
│   └── UserProfile/
│       ├── index.tsx       # Main component
│       ├── UserProfile.test.tsx
│       └── types.ts        # Component-specific types
├── hooks/
│   └── useAuth.ts
├── lib/
│   └── api.ts
└── pages/
    └── Dashboard.tsx
```

### ESLint & Prettier

The project uses ESLint and Prettier. Run before committing:

```bash
pnpm lint        # Check for issues
pnpm lint:fix    # Auto-fix issues
pnpm format      # Format with Prettier
```

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific file
pnpm test src/components/Button.test.tsx

# Watch mode
pnpm test:watch
```

### Writing Tests

Place tests next to the code they test:

```
src/components/Button/
├── Button.tsx
└── Button.test.tsx
```

Example test:

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### Test Coverage

We aim for 70% code coverage. Focus on:
- Critical business logic
- User interactions
- Edge cases
- Error handling

---

## Documentation

### Code Comments

- Use JSDoc for public APIs
- Explain "why" not "what"
- Keep comments up to date

```typescript
/**
 * Fetches user data from the API.
 * Returns null if user is not found.
 *
 * @param userId - The unique user identifier
 * @returns The user object or null
 */
export async function fetchUser(userId: string): Promise<User | null> {
  // ...
}
```

### README Updates

Update README.md if you:
- Add new features
- Change installation steps
- Modify environment variables
- Update API endpoints

### Inline Documentation

For complex logic:

```typescript
// Use binary search for performance with large datasets
// Time complexity: O(log n)
function findUser(users: User[], id: string): User | undefined {
  // ...
}
```

---

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Check existing issues before creating new ones

---

## Recognition

Contributors are recognized in:
- README.md acknowledgments
- Release notes
- GitHub contributors page

Thank you for contributing to Agent Builder!
