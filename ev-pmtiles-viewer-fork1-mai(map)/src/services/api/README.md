# API Services

This directory contains all API service modules for the EV PMTiles Viewer application.

## Structure

```
src/services/api/
├── index.js                 # Main export point for all API services
├── api-service.js          # Base ApiService class with common functionality
├── municipality-api.js     # Municipality-specific API functions
└── README.md              # This documentation
```

## Usage

### Base API Service

The `ApiService` class provides a foundation for making HTTP requests:

```javascript
import { ApiService } from './services/api';

const apiService = new ApiService('https://api.example.com', {
  Authorization: 'Bearer token',
  'Content-Type': 'application/json'
});

// GET request
const data = await apiService.get('/endpoint');

// POST request
const result = await apiService.post('/endpoint', { data: 'value' });
```

### Municipality API

Specialized functions for Italian municipality data:

```javascript
import {
  fetchMunicipalitiesInBbox,
  checkMunicipalitiesApiHealth,
  formatBoundsForApi
} from './services/api';

// Check API health
const health = await checkMunicipalitiesApiHealth();

// Fetch municipalities in bounding box
const bounds = { xmin: 12, ymin: 41, xmax: 13, ymax: 42 };
const municipalities = await fetchMunicipalitiesInBbox(bounds);

// Format MapLibre bounds for API
const mapBounds = map.getBounds();
const formattedBounds = formatBoundsForApi(mapBounds);
```

### Map Integration

The municipality API is integrated with MapLibre GL JS for real-time updates:

```javascript
import { MapComponent } from './components/map/map.js';

const mapComponent = new MapComponent();
const mapElement = mapComponent.render();

// API calls are automatically triggered on:
// - Map load
// - Map move end
// - Map zoom end
```

## API Endpoints

### Municipality Bbox API

- **Endpoint**: `/bbox_ca_pg_com2021/:xmin/:ymin/:xmax/:ymax`
- **Method**: GET
- **Authentication**: x-api-key header required
- **Response**: JSON with municipalities data (max 20 results, ordered by population DESC)

### Health Check

- **Endpoint**: `/bbox_ca_pg_com2021/health`
- **Method**: GET
- **Authentication**: x-api-key header required
- **Response**: Health status and database connection info

## Configuration

API configuration is centralized in `municipality-api.js`:

```javascript
const API_CONFIG = {
  baseUrl: 'https://vm-neural-01.duckdns.org/ev-api',
  apiKey: 'ev-api-secret-key-2025',
  endpoints: {
    bboxMunicipalities: 'bbox_ca_pg_com2021'
  }
};
```

## Error Handling

All API services include comprehensive error handling:

- Network errors are caught and logged
- HTTP errors include status codes and messages
- Validation errors for invalid parameters
- Graceful degradation in UI components

## Logging

The municipality API includes detailed console logging:

- 📡 Request initiation with URL
- ✅ Successful responses with item count
- 🏛️ Formatted municipality data display
- ❌ Error details and stack traces

## Performance

- Uses native `fetch` API for requests
- Coordinate precision limited to 6 decimal places
- Results limited to 20 municipalities per request
- Spatial queries use optimized centroid geometry
