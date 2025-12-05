/**
 * Parcel Blocks API Service
 * Service for searching parcel blocks (particella) using autocomplete
 */

import { ApiService } from './api-service.js';

// API Configuration - using the same config as other services
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_X_API_URL || 'fall-back-url-if-needed',
  apiKey: import.meta.env.VITE_X_API_KEY || 'fall-back-key-if-needed'
};

// Create API Service instance (similar to right-sidebar pattern)
const apiService = new ApiService(API_CONFIG.baseUrl || '');

/**
 * Search parcel blocks by partial particella value (autocomplete)
 * @param {string} inspireidLocalid2 - The inspireid_localid_2 value (from municipality)
 * @param {string} inspireidLocalid3 - The inspireid_localid_3 value (from parcel zone)
 * @param {string} particellaPrefix - Partial particella value for autocomplete search
 * @returns {Promise<Object>} - API response with parcel blocks data
 */
export async function searchParcelBlocks(
  inspireidLocalid2,
  inspireidLocalid3,
  particellaPrefix
) {
  try {
    console.log(
      `🔍 Searching parcel blocks: ${inspireidLocalid2}/${inspireidLocalid3}/${particellaPrefix}`
    );

    const endpoint = '/search_parcels_blocks';
    const response = await apiService.get(
      `${endpoint}/${inspireidLocalid2}/${inspireidLocalid3}/${particellaPrefix}`,
      {
        headers: {
          'X-API-Key': API_CONFIG.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    // _onsole.log('📦 Parcel Blocks API response:', response);

    if (response.status === 'success') {
      return {
        success: true,
        data: response.data,
        queryParams: response.query_params,
        timestamp: response.timestamp
      };
    } else {
      throw new Error(response.message || 'Failed to search parcel blocks');
    }
  } catch (error) {
    console.error('❌ Error searching parcel blocks:', error);

    // Return a structured error response
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Health check for the parcel blocks search API
 * @returns {Promise<Object>} - Health status
 */
export async function checkParcelBlocksApiHealth() {
  try {
    console.log('🏥 Checking parcel blocks API health...');

    const endpoint = '/search_parcels_blocks/health';
    const response = await apiService.get(endpoint, {
      headers: {
        'X-API-Key': API_CONFIG.apiKey,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Parcel Blocks API health response:', response);
    return {
      success: true,
      status: response.status,
      data: response
    };
  } catch (error) {
    console.error('❌ Parcel Blocks API health check failed:', error);
    return {
      success: false,
      error: error.message,
      status: 'unhealthy'
    };
  }
}

/**
 * Format parcel blocks data for display
 * @param {Object} featureCollection - GeoJSON FeatureCollection from API
 * @returns {Array} - Formatted parcel blocks data
 */
export function formatParcelBlocksForDisplay(featureCollection) {
  if (!featureCollection || !featureCollection.features) return [];

  return featureCollection.features.map(feature => ({
    pid: feature.properties.pid_parcels_251001,
    particella: feature.properties.particella,
    inspireidLocalid2: feature.properties.inspireid_localid_2,
    inspireidLocalid3: feature.properties.inspireid_localid_3,
    coordinates: feature.geometry.coordinates,
    displayName: `Particella ${feature.properties.particella}`,
    fullData: feature
  }));
}
