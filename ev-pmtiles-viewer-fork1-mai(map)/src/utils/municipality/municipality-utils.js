/**
 * Municipality Utilities
 * Helper functions for handling municipality data and logging
 */

/**
 * Logs municipality API response in a formatted way
 * @param {Object} apiResponse - The API response from municipality bbox endpoint
 */
export function logMunicipalityApiResponse(apiResponse) {
  if (!apiResponse || !apiResponse.data) {
    // Invalid API response received
    return;
  }

  const { count } = apiResponse;

  if (apiResponse.fallback_used) {
    // Fallback to closest municipalities used
  }

  if (count > 0) {
    // Process municipality data for display
  } else {
    // No municipalities found in current map bounds
  }
}

/**
 * Formats municipality data for display
 * @param {Object} municipality - Municipality object from API
 * @returns {Object} - Formatted municipality data
 */
export function formatMunicipalityData(municipality) {
  return {
    code: municipality.pro_com,
    name: municipality.comune,
    population: municipality.pop21,
    populationFormatted: municipality.pop21?.toLocaleString() || 'N/A'
  };
}

/**
 * Filters municipalities by minimum population
 * @param {Array} municipalities - Array of municipality objects
 * @param {number} minPopulation - Minimum population threshold
 * @returns {Array} - Filtered municipalities
 */
export function filterMunicipalitiesByPopulation(
  municipalities,
  minPopulation = 0
) {
  return municipalities.filter(
    municipality => municipality.pop21 && municipality.pop21 >= minPopulation
  );
}

/**
 * Gets the top N municipalities by population
 * @param {Array} municipalities - Array of municipality objects
 * @param {number} limit - Number of top municipalities to return
 * @returns {Array} - Top municipalities
 */
export function getTopMunicipalitiesByPopulation(municipalities, limit = 10) {
  return municipalities
    .sort((a, b) => (b.pop21 || 0) - (a.pop21 || 0))
    .slice(0, limit);
}
