/**
 * API Services Index
 * Central export point for all API services
 */

// Export base API service
export { ApiService } from './api-service.js';

// Export municipality-specific services
export {
  fetchMunicipalitiesInBbox,
  checkMunicipalitiesApiHealth,
  roundCoordinate,
  formatBoundsForApi,
  API_CONFIG
} from './municipality-api.js';

// Export parcel zone-specific services
export {
  fetchParcelZonesByMunicipality,
  checkParcelZonesApiHealth,
  formatParcelZonesForDisplay
} from './parcel-zone-api.js';

// Export geocoding service
export { geocodingApi } from './geocoding-api.js';
