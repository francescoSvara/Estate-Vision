# EV PMTiles Viewer - AI Coding Agent Instructions

## Agent Behavior Rules

**CRITICAL - Documentation Policy**:
- ❌ DO NOT create documentation files during implementation (no README.md, IMPLEMENTATION.md, CHANGELOG.md, etc.)
- ❌ DO NOT generate summary documents or implementation reports
- ✅ DO make code changes directly and explain them concisely in chat
- ✅ DO update existing documentation ONLY if explicitly asked
- ✅ DO add inline code comments for complex logic only when necessary

**When implementing features**:
1. Make the code changes first
2. Provide a brief summary in the chat (2-3 lines max)
3. Stop - don't create additional files unless explicitly requested

## Project Overview

A **modular MapLibre GL JS map viewer** for Italian real estate/census data visualization. Built with Vite, vanilla JavaScript ES6+, and class-based component architecture. Features PMTiles vector layers, multi-language support (EN/IT), and integrated API data fetching.

**Workspace structure**: Two related projects - `ev-pmtiles-viewer` (frontend) and `ev-api-node` (backend Express API)

## Core Architecture

### Component System
- **Self-contained components**: Each component = 1 class + 1 CSS file (e.g., `left-sidebar/left-sidebar.js` + `left-sidebar.css`)
- **No framework**: Vanilla JS with manual DOM manipulation via `createElement()` and template strings
- **Lifecycle pattern**: `render()` → `attachEventListeners()` → `destroy()` (optional cleanup)
- **Communication**: Parent-child via callbacks in constructors (e.g., `new MunicipalitySelector(onSelectionChange)`)

**Component re-rendering**: When language changes, components call `reRenderWithTranslations()`:
```javascript
reRenderWithTranslations() {
  const parent = this.element.parentNode;
  const wasVisible = this.isVisible;
  parent.removeChild(this.element);
  const newElement = this.render(); // Re-render with new translations
  parent.appendChild(newElement);
  if (wasVisible) this.show();
}
```

### Layer Architecture
- **Pattern**: All layers are classes with common properties (no inheritance currently)
- **Required properties**: `layerName`, `layerState`, `layerInToc`, `layerColor`, `pmtilesUrl`, `sourceLayer`
- **Layer lifecycle**: Constructor → `addToMap(map)` → visibility toggles via `setVisibility(map, visible)`
- **PMTiles protocol**: Registered globally ONCE in `parcels-m00.js` via `maplibregl.addProtocol('pmtiles', protocol.tile)` - check `window.pmtilesProtocolRegistered` flag

**Adding a new layer** (see `src/components/layers/parcels-m00.js`):
1. Create class with required properties
2. Implement `addToMap(map)` - fetch PMTiles metadata, add source + layer(s)
3. Add instance to `layers` object in `main.js` (e.g., `'parcels-m11': new ParcelsM11Layer()`)
4. Layer automatically appears in left sidebar TOC if `layerInToc: true`

**MapLibre layer IDs**: Use pattern `{layerName}-{type}` (e.g., `parcels-m00-fill`, `parcels-m00-line`)

**Source layer discovery**: Layers fetch PMTiles metadata to determine `sourceLayer`:
```javascript
const pmtiles = new PMTiles(this.pmtilesUrl);
const metadata = await pmtiles.getMetadata();
if (metadata?.vector_layers?.length > 0) {
  this.sourceLayer = metadata.vector_layers[0].id;
}
```

### Data Flow

```
Map Load → Bbox API Call → Update Municipality Selector
                          ↓
User Selects Municipality → Update Parcel Zone Selector
                          ↓
User Selects Parcel Zone → Enable Parcel Blocks Search
                          ↓
User Searches Block → Zoom to Geometry + Popup with Census/OMI Data
```

**Popup system** (`popup-content-manager.js`):
1. Click → `PopupContentManager.getPopupContent(coords, event)`
2. Check `event.features` for layer intersections via `checkLayerIntersections()`
3. Match features to layer instances using multiple strategies:
   - Source name: `feature.source === layerInstance.layerName`
   - Layer ID: `feature.layer.id.startsWith(layerName + '-')`
   - Source layer: `feature.sourceLayer === layerInstance.sourceLayer`
4. Generate HTML with placeholders for async data
5. Async fetch census data (`/single_bt_pg_r00_21/{sez21_id}`) + OMI real estate data (`/single_omi_qi_20242_valori_fixed/{comuneAmm}/{zona}`)
6. Update DOM via `document.getElementById()` when data arrives

## Environment Variables (Critical!)

**Security requirement**: ALL API configuration uses Vite env vars - NEVER hardcode API keys

```javascript
// ✅ Correct
import.meta.env.VITE_X_API_URL || 'https://vm-neural-01.duckdns.org/ev-api'
import.meta.env.VITE_X_API_KEY || ''

// ❌ Never hardcode
'ev-api-secret-key-2025' // Security violation - API keys must come from .env
```

**Setup**: `cp .env.example .env` → Edit values → **RESTART dev server** (Vite limitation)

**Usage locations**:
- `right-sidebar/right-sidebar.js` - API health checks (`/ev-api/hello`, `/ev-api/core-secure/db-status`)
- `popup/popup-content-manager.js` - Census/OMI data fetching
- `services/api/api-service.js` - Base API client

## API Integration Pattern

**Service pattern** (`src/services/api/api-service.js`):
```javascript
// Constructor merges default headers with per-request headers
const apiService = new ApiService(import.meta.env.VITE_X_API_URL, {
  'X-API-Key': import.meta.env.VITE_X_API_KEY
});

// GET with additional headers
await apiService.get('/endpoint', { 
  headers: { 'Host': 'vm-neural-01.duckdns.org' } 
});
```

**Backend integration**: Node.js Express API at `ev-api-node/` (separate workspace folder)
- Base path: `/ev-api/`
- Public endpoints: `/hello`, `/api`
- Secured endpoints: `/core-secure/*` (require `X-API-Key` header)
- Database: PostgreSQL with `pg` module, connection pooling configured in `src/config/index.js`
- Route loading: Dynamic via `loadRoutes(app, BASE_PATH)` in `src/routes/index.js`

**API response format**: `{ status: 'success', data: [...], timestamp: ... }` (for successful responses)

## Internationalization (i18n)

**Custom lightweight system** (NOT react-i18n) - Singleton pattern with async loading:

**Setup** (`src/i18n/index.js`):
- Loads translations from `public/i18n/translations/{en,it}.json` on init
- Detects language: localStorage → browser locale → 'en' (default)
- Pub/sub pattern: `i18n.subscribe(listener)` for language changes

**Usage** (`src/i18n/hooks/useTranslation.js`):
```javascript
const { t, setLanguage, currentLanguage } = useTranslation();
t('sidebar.right.analytics') // Nested key navigation
```

**Critical**: Translation loading is async - must `await waitForTranslations()` before initial render:
```javascript
// In main.js
document.addEventListener('DOMContentLoaded', async () => {
  await waitForTranslations();
  const app = new PMTilesViewerApp();
  app.init();
});
```

**Language switching**: Call `setLanguage('it')` → triggers listeners → components call `reRenderWithTranslations()`

**Translation keys**: Nested structure (e.g., `sidebar.right.analytics`) with interpolation support (`{{param}}`)

## Key Development Workflows

**Dev server**: `npm run dev` (Vite, port 5173, host 0.0.0.0 for network access)
**Build**: `npm run build` → `dist/` folder
**Build + Deploy**: `npm run build:deploy` (runs `./deploy.sh` after build)

**Deployment**: 
- Vite base: `/pmtiles-viewer/` (affects asset loading)
- Target: `vm-neural-01.duckdns.org/pmtiles-viewer/` (HTTPS only)

**Testing**: No automated tests - manual testing via browser console
- App instance: `window.pmtilesApp`
- Map: `window.pmtilesApp.getMap()`
- Toggle layer: `window.pmtilesApp.layers['parcels-m00'].toggleLayerState(map, sidebar)`
- Add layer: `window.pmtilesApp.addLayer('new-id', layerInstance)`

**Debugging**:
- Console logs are minimal (many commented with `// _onsole.log` - intentional typo to disable)
- Check `window.pmtilesProtocolRegistered` for PMTiles protocol
- Map errors: `map.on('error', ...)` in layer implementations
- Source loading: `map.on('sourcedata', ...)` to verify PMTiles loading

## Critical Conventions

1. **Component naming**: Kebab-case folders, PascalCase classes (`left-sidebar/` → `LeftSidebar`)
2. **CSS scoping**: Each component CSS file uses class names matching folder (`.left-sidebar { }`)
3. **Global state**: App at `window.pmtilesApp`, map at `window.pmtilesApp.getMap()`
4. **Layer registration**: Add to `this.layers` object in `main.js` - sidebar auto-populates from `layerInToc: true`
5. **MapLibre layer IDs**: `{layerName}-{type}` (e.g., `parcels-m00-fill`, `parcels-m00-line`)
6. **Source layers**: Extract from PMTiles metadata - DON'T assume 'default'
7. **API responses**: Expect `{ status: 'success', data: [...], timestamp: ... }`
8. **Popup updates**: Use `document.getElementById('census-fam21-${id}')` to update async data in existing popup HTML
9. **Translation keys**: Nested like `sidebar.right.analytics` (NOT flat like `sidebar_right_analytics`)
10. **Vite env vars**: MUST restart dev server after `.env` changes

## Integration Points

**PMTiles sources**: Google Cloud Storage (`storage.googleapis.com/space-neural-02/tiles/pmtiles/`)
- Naming: `pg_parcels_251001_m{00-10|99}.pmtile` (11 parcel layers)
- Access: Public read via HTTPS, CORS configured

**Base map**: Carto Voyager (`basemaps.cartocdn.com/gl/voyager-gl-style/style.json`)

**Backend API**: `vm-neural-01.duckdns.org/ev-api` (HTTPS only, nginx proxy to Express on port 3000)

## Common Gotchas

1. **Vite env vars**: Must prefix with `VITE_` to expose to client code
2. **PMTiles protocol**: Only register once globally, check `window.pmtilesProtocolRegistered` before calling `addProtocol()`
3. **Async rendering**: Translation loading is async, wrap initial calls in `waitForTranslations()`
4. **Map initialization**: Layers must wait for `map.on('load')` event
5. **Layer visibility**: Use MapLibre's `setLayoutProperty(id, 'visibility', 'visible'|'none')` - NOT CSS display
6. **Component re-rendering**: Must reattach event listeners in `addEventListeners()` after DOM replacement
7. **CSS custom properties**: Theme uses vars like `--color-green`, `--text-primary` (defined in `style.css`)
8. **Deployment path**: Vite base `/pmtiles-viewer/` affects asset loading - verify in production build
9. **API headers**: Secured endpoints need both `X-API-Key` AND `Content-Type: application/json` headers
10. **PMTiles source layer**: Always fetch metadata to get correct `sourceLayer` name - don't hardcode 'default'

## Backend API (ev-api-node)

**Service management** (systemd):
- Service: `ev-node-api.service`
- Restart: `sudo systemctl restart ev-node-api`
- Logs: `sudo journalctl -u ev-node-api -f`

**Key endpoints**:
- `/ev-api/hello` - Health check (no auth)
- `/ev-api/core-secure/db-status` - Database status (requires API key)
- `/ev-api/single_bt_pg_r00_21/{sez21_id}` - Census section data
- `/ev-api/single_omi_qi_20242_valori_fixed/{comuneAmm}/{zona}` - OMI real estate data
- `/ev-api/search_parcels_blocks` - Parcel blocks search

**Database**: PostgreSQL with two separate configs:
- Primary DB: General data (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
- GIS DB: Spatial data (`GIS_DB_HOST`, `GIS_DB_NAME`, etc.)
- Connection pooling: max 20 connections, 30s idle timeout

**Port fallback**: If port 3000 is in use, tries 9000, 9001, 9002 sequentially
