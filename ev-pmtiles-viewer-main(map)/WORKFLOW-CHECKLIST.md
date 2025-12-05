# Workflow Implementation Checklist

## Implementation Priority

1. **Code Quality & NPM Scripts** - Add meta-commands
2. **Security Workflow** - Create security scanner script
3. **VSCode Integration** - Add tasks.json for one-click execution
4. **E2E Testing** - Install Playwright, create test infrastructure
5. **Accessibility Workflow** - Create a11y checker script
6. **Deployment Automation** - Migrate deploy.sh to Node.js
7. **Documentation** - Machine-readable specs and workflow guides

## Development Flow

### Development

- [x] `npm run dev` - Development server (localhost:5173)
- [x] `npm run build` - Production build to `dist/`
- [x] `npm run preview` - Preview production build

### Code Quality

- [x] `npm run lint` - Check code style
- [x] `npm run lint:fix` - Auto-fix code style
- [x] `npm run format` - Format with Prettier
- [x] `npm run format:check` - Check formatting without changes

### Quality Checks

- [x] `npm run check` - Run all checks (lint + format)
- [x] `npm run check:full` - Run all checks + security

### Security & Accessibility

- [x] `npm run security:check` - Local security scan (secrets, audit, lint)
- [x] `npm run security:audit` - npm audit only
- [x] `npm run a11y:check` - Accessibility check (WCAG 2.1 AA)

### E2E Testing

- [x] `npm run test:e2e` - Run E2E tests (headless)
- [x] `npm run test:e2e:headed` - Run E2E tests (visible browser)
- [x] `npm run test:e2e:ui` - Open Playwright UI mode (interactive)
- [x] `npm run test:e2e:debug` - Run E2E tests in debug mode
- [x] `npm run test:e2e:check` - Run E2E tests with reporting
- [x] `npm run test:e2e:production` - Verify production deployment via E2E
- [x] `npm run test:report` - View last test report

### Deployment

- [x] `npm run deploy:quick` - Full checks + build + deploy to production

## Security & Quality Tools

### Configuration Files

- [x] `eslint.config.js`
- [x] `.prettierrc`
- [x] `.prettierignore`
- [x] `.editorconfig`
- [x] `.env.example` (if API keys required)
- [x] `playwright.config.js`
- [x] `.vscode/tasks.json`
- [x] `.vscode/settings.json`
- [x] `.vscode/.gitattributes` - Line endings for VSCode config files
- [x] `.github/copilot-instructions.md` - GitHub Copilot configuration
- [x] `.github/.gitattributes` - Line endings for GitHub config files
- [x] `.gitignore` - Add test-results/, playwright-report/, .playwright/
  - Remove `.github` and `.vscode` from ignore (versioned with security scan)

### Scripts Directory

- [x] `scripts/local-security-check.js` - Security scan
  - npm audit (moderate level)
  - ESLint validation
  - Hardcoded secrets detection (api_key, password, secret, token, private_key, AWS keys, GitHub tokens, SSH keys)
  - Wildcard version detection in package.json
  - Scans: `src/`, `scripts/`, `.github/`, `.vscode/` folders
- [x] `scripts/accessibility-check.js` - A11y scan (WCAG 2.1 AA)
  - HTML semantics (lang, title, meta charset, viewport)
  - ARIA attributes usage
  - Color contrast patterns
  - Keyboard navigation support (tabindex, keyboard events)
- [x] `scripts/e2e-test-check.js` - E2E test runner with reporting
- [x] `scripts/e2e-production-verify.js` - Post-deployment E2E verification
- [x] `scripts/sync-to-production.js` - Deploy to production server
- [x] `scripts/verify-deployment.js` - Verify deployment success

### Test Files (`tests/`)

- [x] `app.spec.js` - Application load and accessibility tests
- [x] `map.spec.js` - MapLibre GL map functionality tests
- [x] `components.spec.js` - UI component tests
- [x] `api.spec.js` - API integration tests
- [x] `production.spec.js` - Production deployment verification tests
- [x] `playwright-patterns.spec.js` - Best practices reference

### Dependencies

- [x] `@playwright/test`

### VSCode Tasks

Available in Command Palette → "Tasks: Run Task"

- [x] "Security Check"
- [x] "Accessibility Check"
- [x] "E2E Tests" (headless, headed, debug, UI mode)
- [x] "Full Check (Lint + Security + A11y)"
- [x] "Pre-Deploy Check"
- [x] "Full Quality Check (All Tests)"

## Documentation

### Machine-Readable Specs

- [x] `.github/copilot-instructions.md` - GitHub Copilot configuration
  - Project context, repository structure, development flow
  - Integration points, tech stack, Context7 MCP guidelines
- [x] `AGENTS.md` - Coding agent behavior rules
  - Output format, agent comments, behavior policies

### API Documentation (if applicable)

- [N/A] `docs/endpoints/` - API endpoint documentation
  - Not applicable: Project uses PMTiles (no separate API backend)

### Existing Documentation

- [ ] README.md, DEPLOYMENT_SUMMARY.md, PMTILES_CORS_SOLUTIONS.md, STYLING_README.md
- [ ] Update with new workflow references

## Complete NPM Scripts Reference

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint src/",
  "lint:fix": "eslint src/ --fix",
  "format": "prettier --write src/",
  "format:check": "prettier --check src/",
  "check": "npm run lint && npm run format:check",
  "check:full": "npm run lint && npm run format:check && npm run security:check",
  "security:check": "node scripts/local-security-check.js",
  "security:audit": "npm audit --audit-level=moderate",
  "a11y:check": "node scripts/accessibility-check.js",
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:check": "node scripts/e2e-test-check.js",
  "test:e2e:production": "node scripts/e2e-production-verify.js",
  "test:report": "playwright show-report",
  "sync": "node scripts/sync-to-production.js",
  "verify": "node scripts/verify-deployment.js",
  "predeploy:quick": "npm run check:full && npm run a11y:check && npm run build",
  "deploy:quick": "npm run sync && npm run verify"
}
```

## Notes

**Philosophy**: All security, fixes, checks to keep code secure, clean and updated are done locally (no GitHub automation required).

**Key Principles**:

- Local checks replace GitHub automation
- Cross-platform Node.js scripts (Windows/Linux/macOS)
- VSCode tasks provide one-click access to all quality checks
- Full pipeline: checks → build → deploy → verify
- `.github/` and `.vscode/` folders are versioned with automatic credential scanning

**Security for Configuration Folders**:

- `.github/` and `.vscode/` folders are **NOT ignored** in `.gitignore`
- Security scanner automatically checks these folders for credentials before commit
- Detected patterns: API keys, passwords, tokens, SSH keys, AWS credentials, GitHub tokens
- Run `npm run security:check` before committing changes to these folders
- Never commit: credentials, API keys, private keys, passwords, tokens

**Reference Implementation**: Copy structure and scripts from `google-streetview-vision-web-demo`

- Scripts: `scripts/*.js` (security, a11y, e2e, deployment)
- Tests: `tests/*.spec.js` (Playwright patterns)
- Config: `.vscode/tasks.json`, `playwright.config.js`, `.prettierignore`, `.editorconfig`
