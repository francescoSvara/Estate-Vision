/**
 * Geocoding API Service
 * Uses OpenStreetMap Nominatim for address search
 */

import { ApiService } from './api-service.js';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

class GeocodingApiService extends ApiService {
  constructor() {
    super(NOMINATIM_BASE_URL);
  }

  /**
   * Search for an address
   * @param {string} query - Address to search for
   * @returns {Promise<Array>} List of results
   */
  async searchAddress(query) {
    if (!query || query.length < 3) return [];

    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: 1,
      limit: 5,
      countrycodes: 'it' // Limit to Italy as requested
    });

    try {
      // Nominatim requires a User-Agent header
      const results = await this.get(`/search?${params.toString()}`);
      return results.map(item => ({
        id: item.place_id,
        address: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        bbox: item.boundingbox ? item.boundingbox.map(parseFloat) : null,
        type: item.type,
        class: item.class
      }));
    } catch (error) {
      console.error('Geocoding search error:', error);
      return [];
    }
  }
}

export const geocodingApi = new GeocodingApiService();

