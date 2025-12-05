# GitHub Copilot Instructions "ev-pmtiles-viewer"

NO human explanations. NO setup instructions. Code only.

## Purpose

**Audience**: GitHub Copilot / Coding Agents  
**Format**: Machine-readable specifications  
**Usage**: Reference for automated code generation and deployment

---

## Project Context

**Repository**: https://github.com/piergiorgio-roveda/ev-pmtiles-viewer  
**Purpose**: Main Dashboard EV  
**Status**: In development

## Repository Structure

```
- `.github/`: GitHub configuration (copilot-instructions.md)
- `.vscode/`: VSCode tasks and settings
- `docs/`: Documentation and API specs (LOCAL_WORKFLOW.md, endpoints/)
- `scripts/`: Deployment and security automation
  - `local-security-check.js`: Security scan (secrets, audit, vulnerabilities)
  - `accessibility-check.js`: A11y scan (HTML, ARIA, contrast, keyboard)
  - `e2e-test-check.js`: E2E test runner with reporting
  - `e2e-production-verify.js`: Post-deployment E2E verification
  - `sync-to-production.js`: Deploy to production server
  - `verify-deployment.js`: Verify deployment success
- `src/`: Source code (components, services, map layers)
- `tests/`: Playwright E2E tests
  - `app.spec.js`: Application load and accessibility tests
  - `map.spec.js`: MapLibre GL map functionality tests
  - `components.spec.js`: UI component tests
  - `api.spec.js`: API integration tests
  - `production.spec.js`: Production deployment verification tests
  - `playwright-patterns.spec.js`: Best practices reference
- `public/`: Static assets and i18n translations
```

### Security & Quality Tools

**Local Checks** (No GitHub automation):

- VSCode tasks: Security Check, Accessibility Check, E2E Tests, Full Quality Check
- Manual execution: `npm run security:check`, `npm run a11y:check`, `npm run test:e2e`

**Security Checks Include**:

- npm audit (moderate level)
- ESLint validation
- Hardcoded secrets detection (api_key, password, secret, token, private_key)
- Wildcard version detection in package.json

**Accessibility Checks Include**:

- HTML semantics (lang, title, meta charset, viewport)
- ARIA attributes usage
- Color contrast patterns
- Keyboard navigation support (tabindex, keyboard events)

**E2E Testing (Playwright)**:

- Application load and initialization
- Map functionality (MapLibre GL interactions)
- UI component rendering and behavior
- API integration and error handling
- Production deployment verification
- Accessibility validation (keyboard navigation)

### Development Flow

**Note**: All security, fixes, checks to keep code secure, clean and updated are done inside this Development Flow.

#### Development

- `npm run dev` - Development server (localhost:5173)
- `npm run build` - Production build to `dist/`
- `npm run preview` - Preview production build

#### Code Quality

- `npm run lint` - Check code style
- `npm run lint:fix` - Auto-fix code style
- `npm run format` - Format with Prettier
- `npm run format:check` - Check formatting without changes

#### Quality Checks

- `npm run check` - Run all checks (lint + format)
- `npm run check:full` - Run all checks + security

#### Security & Accessibility

- `npm run security:check` - Local security scan (secrets, audit, lint) - Instead of CodeQL
- `npm run security:audit` - npm audit only
- `npm run a11y:check` - Accessibility check (HTML semantics, ARIA, contrast, keyboard nav) - also WCAG 2.1 AA compliant

#### E2E Testing

- `npm run test:e2e` - Run E2E tests (headless)
- `npm run test:e2e:headed` - Run E2E tests (visible browser)
- `npm run test:e2e:ui` - Open Playwright UI mode (interactive)
- `npm run test:e2e:debug` - Run E2E tests in debug mode
- `npm run test:e2e:check` - Run E2E tests with reporting
- `npm run test:e2e:production` - Verify production deployment via E2E
- `npm run test:report` - View last test report

**Playwright Best Practices**: See `tests/playwright-patterns.spec.js`

**Test Files Location**: `tests/*.spec.js`

**Configuration**: `playwright.config.js`

**VSCode Tasks**: Available in Command Palette → "Tasks: Run Task"

#### Deployment

- `npm run deploy:quick` - Full checks + build + deploy to production

## Integration Points

### Production Deployment

- **Server**: ssh:vm-neural-01
- **Path**: `/var/www/html/pmtiles-viewer/`
- **URL**: `https://vm-neural-01.duckdns.org/pmtiles-viewer/`
- **Deploy**: `npm run deploy:quick`

### Related Repositories (Read-Only Context)

- `ev-api-node`: Backend API for data serving

### Data Sources

- **API Base**: `https://vm-neural-01.duckdns.org/ev-api/`
- **PMTiles**: Remote and local sources
- **Layers**: Cadastral parcels, inventory assets, municipalities

## Error Handling

### Common Errors (Machine-Readable)

```json
{
  "API_UNAUTHORIZED_401": { "code": 1, "action": "verify_api_key" },
  "API_NOT_FOUND_404": { "code": 2, "action": "check_endpoint_path" },
  "API_SERVER_ERROR_500": { "code": 3, "action": "check_backend_logs" },
  "DEPLOY_PERMISSION_DENIED": { "code": 4, "action": "verify_ssh_access" },
  "DEPLOY_TARGET_NOT_FOUND": { "code": 5, "action": "verify_remote_path" },
  "PMTILES_CORS_ERROR": { "code": 6, "action": "check_cors_headers" }
}
```

## Tech Stack

- **Framework**: Vanilla JS + Vite
- **Map**: MapLibre GL JS + PMTiles
- **Styling**: CSS (custom components) + Milligram
- **i18n**: Custom i18n implementation
- **Icons**: Lucide
- **Tables**: Tabulator

## Context7 MCP Usage

**Purpose**: Retrieve **latest stable documentation** from external library sources (not from this codebase).

**Note**: Context7 fetches current official docs that may differ from AI training data. Always use for external dependencies to ensure accuracy.

**When to Use**:

1. Before implementing features with external dependencies (MapLibre GL JS, PMTiles, Vite, etc.)
2. When API signatures or library behavior may have changed since training data
3. To verify current best practices for third-party integrations
4. When troubleshooting external library usage
5. To check if current library versions support specific features
6. To find breaking changes or migration guides

**Workflow**:

```json
{
  "step_1": "mcp_upstash_conte_resolve-library-id",
  "input": "library_name (e.g., 'maplibre-gl', 'pmtiles')",
  "output": "context7_id (e.g., '/maplibre/maplibre-gl-js')"
}
```

```json
{
  "step_2": "mcp_upstash_conte_get-library-docs",
  "input": "context7_id + optional topic",
  "output": "current documentation and code examples"
}
```

**Do Not Use For**:

- Project-specific code (use `semantic_search`, `read_file`, `grep_search`)
- Internal APIs or services
- Custom components in `src/components/`
