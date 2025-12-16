/**
 * Parcel Zone API Service
 * Service for fetching parcel zone data from the API
 */

import { ApiService } from './api-service.js';

// API Configuration - using the same config as municipality API
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_X_API_URL || 'fall-back-url-if-needed',
  apiKey: import.meta.env.VITE_X_API_KEY || 'fall-back-key-if-needed'
};

// Create API Service instance (similar to right-sidebar pattern)
const apiService = new ApiService(API_CONFIG.baseUrl || '');

/**
 * Fetch parcel zone list for a specific municipality
 * @param {string} procom - The municipality code (pro_com_ca_com2021)
 * @returns {Promise<Object>} - API response with parcel zone data
 */
export async function fetchParcelZonesByMunicipality(procom) {
  try {
    const endpoint = '/list_parcels_zone';
    const response = await apiService.get(`${endpoint}/${procom}`, {
      headers: {
        'X-API-Key': API_CONFIG.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 'success') {
      return {
        success: true,
        data: response.data,
        timestamp: response.timestamp
      };
    } else {
      throw new Error(response.message || 'Failed to fetch parcel zones');
    }
  } catch (error) {
    console.error('❌ Error fetching parcel zones:', error);

    // Return a structured error response
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Health check for the parcel zones API
 * @returns {Promise<Object>} - Health status
 */
export async function checkParcelZonesApiHealth() {
  try {
    console.log('🏥 Checking parcel zones API health...');
    const endpoint = '/list_parcels_zone/health';
    const response = await apiService.get(endpoint, {
      headers: {
        'X-API-Key': API_CONFIG.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 'success') {
      return {
        success: true,
        status: response.status,
        data: response
      };
    }
  } catch (error) {
    console.error('❌ Parcel Zones API health check failed:', error);
    return {
      success: false,
      error: error.message,
      status: 'unhealthy'
    };
  }
}

/**
 * Format parcel zone data for display
 * @param {Array} parcelZones - Array of parcel zone objects with inspireid_localid_2 and inspireid_localid_3
 * @returns {Array} - Formatted parcel zone data with display names
 */
export function formatParcelZonesForDisplay(parcelZones) {
  if (!Array.isArray(parcelZones)) return [];

  return parcelZones.map(parcelZone => {
    // Handle both old format (string) and new format (object)
    if (typeof parcelZone === 'string') {
      return {
        id: parcelZone,
        inspireid_localid_2: null,
        inspireid_localid_3: parcelZone,
        displayName: `${parcelZone}`,
        shortName: parcelZone.split('.').pop() || parcelZone
      };
    }

    // New format with both inspireid_localid_2 and inspireid_localid_3
    return {
      id: parcelZone.inspireid_localid_3,
      inspireid_localid_2: parcelZone.inspireid_localid_2,
      inspireid_localid_3: parcelZone.inspireid_localid_3,
      displayName: `${parcelZone.inspireid_localid_3}`,
      shortName:
        parcelZone.inspireid_localid_3.split('.').pop() ||
        parcelZone.inspireid_localid_3
    };
  });
}
