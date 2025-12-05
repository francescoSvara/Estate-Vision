/**
 * Municipality Utilities
 * Helper functions for handling municipality data and logging
 */

/**
 * Logs municipality API response in a formatted way
 * @param {Object} apiResponse - The API response from municipality bbox endpoint
 * @param {Object} bounds - The bounding box coordinates used for the request
 */
export function logMunicipalityApiResponse(apiResponse, bounds) {
  if (!apiResponse || !apiResponse.data) {
    console.warn('⚠️ Invalid API response received');
    return;
  }

  const { data, count, timestamp, search_type, fallback_used } = apiResponse;

  // _onsole.group('🏛️ Municipality API Response');

  // Log request info
  // _onsole.log('🗺️ Current map bounds:', bounds);
  // _onsole.log(`� Search type: ${search_type || 'bbox'}`);
  if (fallback_used) {
    // _onsole.log('⚠️ No municipalities found in bbox - showing closest municipalities');
  }
  // _onsole.log(`�📊 Found ${count} municipalities ${search_type === 'closest' ? '(closest to center)' : 'in current view'}`);
  // _onsole.log(`⏰ Response timestamp: ${timestamp}`);

  if (count > 0) {
    const sortLabel =
      search_type === 'closest'
        ? 'municipalities by distance:'
        : 'municipalities by population:';
    // _onsole.log(`🏙️ Top ${sortLabel}`);

    // Log top 5 municipalities with better formatting
    data.slice(0, Math.min(5, count)).forEach((municipality, index) => {
      const populationFormatted = municipality.pop21?.toLocaleString() || 'N/A';
      const distanceInfo = municipality.distance_km
        ? ` - Distance: ${parseFloat(municipality.distance_km).toFixed(1)}km`
        : '';
      // _onsole.log(`  ${index + 1}. ${municipality.comune} (${municipality.pro_com}) - Pop: ${populationFormatted}${distanceInfo}`);
    });

    if (count > 5) {
      // _onsole.log(`  ... and ${count - 5} more municipalities`);
    }
  } else {
    console.log('🚫 No municipalities found in current map bounds');
  }

  // Log full response for debugging (collapsed)
  // _onsole.groupCollapsed('🔍 Full API response (click to expand)');
  // _onsole.log(apiResponse);
  // _onsole.groupEnd();

  // _onsole.groupEnd();
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
