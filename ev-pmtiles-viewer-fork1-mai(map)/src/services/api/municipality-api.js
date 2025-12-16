/**
 * Municipality API Service
 * Handles API calls related to Italian municipalities data
 */

import { ApiService } from './api-service.js';

// API Configuration
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_X_API_URL || 'fall-back-url-if-needed',
  apiKey: import.meta.env.VITE_X_API_KEY || 'fall-back-key-if-needed',
  endpoints: {
    bboxMunicipalities: 'bbox_ca_pg_com2021'
  }
};

// Create API Service instance (similar to right-sidebar pattern)
const apiService = new ApiService(API_CONFIG.baseUrl || '');

/**
 * Enhanced API request wrapper with municipality-specific logging
 * @param {string} endpoint - The API endpoint (relative to baseUrl)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - The response data
 */
async function makeMunicipalityApiRequest(endpoint, options = {}) {
  try {
    const data = await apiService.get(endpoint, {
      ...options,
      headers: {
        'X-API-Key': API_CONFIG.apiKey,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    return data;
  } catch (error) {
    console.error(`❌ Municipality API Request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Fetches municipalities within a bounding box
 * @param {Object} bounds - Bounding box coordinates
 * @param {number} bounds.xmin - Minimum longitude
 * @param {number} bounds.ymin - Minimum latitude
 * @param {number} bounds.xmax - Maximum longitude
 * @param {number} bounds.ymax - Maximum latitude
 * @returns {Promise<Object>} - API response with municipalities data
 */
export async function fetchMunicipalitiesInBbox(bounds) {
  const { xmin, ymin, xmax, ymax } = bounds;

  // Validate bounds
  if (!xmin || !ymin || !xmax || !ymax) {
    throw new Error(
      'Invalid bounding box: all coordinates (xmin, ymin, xmax, ymax) are required'
    );
  }

  if (xmin >= xmax || ymin >= ymax) {
    throw new Error(
      'Invalid bounding box: xmin must be < xmax and ymin must be < ymax'
    );
  }

  // Construct API endpoint
  const endpoint = `/bbox_ca_pg_com2021/${xmin}/${ymin}/${xmax}/${ymax}`;

  return await makeMunicipalityApiRequest(endpoint);
}

/**
 * Health check for the municipalities API
 * @returns {Promise<Object>} - Health status
 */
export async function checkMunicipalitiesApiHealth() {
  const endpoint = '/bbox_ca_pg_com2021/health';
  return await makeMunicipalityApiRequest(endpoint);
}

/**
 * Utility function to round coordinates to specified decimal places
 * @param {number} coordinate - The coordinate value
 * @param {number} decimals - Number of decimal places (default: 6)
 * @returns {number} - Rounded coordinate
 */
export function roundCoordinate(coordinate, decimals = 6) {
  const multiplier = Math.pow(10, decimals);
  return Math.round(coordinate * multiplier) / multiplier;
}

/**
 * Formats map bounds for API consumption
 * @param {Object} mapBounds - MapLibre bounds object
 * @returns {Object} - Formatted bounds object
 */
export function formatBoundsForApi(mapBounds) {
  const southwest = mapBounds.getSouthWest();
  const northeast = mapBounds.getNorthEast();

  return {
    xmin: roundCoordinate(southwest.lng),
    ymin: roundCoordinate(southwest.lat),
    xmax: roundCoordinate(northeast.lng),
    ymax: roundCoordinate(northeast.lat)
  };
}

// Export API config for other modules if needed
export { API_CONFIG };
