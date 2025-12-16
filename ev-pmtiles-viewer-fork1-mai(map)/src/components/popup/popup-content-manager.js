/**
 * Popup Content Manager
 * Manages popup content based on layer intersections and coordinates
 */

import { ApiService } from '../../services/api/api-service.js';
import { mainMapManager } from '../../services/map/main-map-manager.js';

export class PopupContentManager {
  constructor(layers = {}) {
    this.layers = layers;

    // Initialize API service for census data
    this.apiService = new ApiService(
      import.meta.env.VITE_X_API_URL ||
        'https://vm-neural-01.duckdns.org/ev-api',
      {
        'X-API-Key': import.meta.env.VITE_X_API_KEY || '',
        Host: 'vm-neural-01.duckdns.org'
      }
    );
  }

  /**
   * Update layers reference
   * @param {Object} layers - Object containing layer instances
   */
  updateLayers(layers) {
    this.layers = layers;
  }

  /**
   * Get popup content based on click coordinates and layer intersections
   * @param {Array} coordinates - [lng, lat] coordinates of the click
   * @param {Object} clickEvent - MapLibre click event object
   * @returns {Object} Content object with HTML and type
   */
  getPopupContent(coordinates, clickEvent) {
    const [lng, lat] = coordinates;

    // Check for layer intersections
    const intersectedLayers = this.checkLayerIntersections(clickEvent);

    if (intersectedLayers.length > 0) {
      // Return layer intersection content
      const content = this.generateLayerContent(intersectedLayers);
      
      // Extract action data if it's a single parcel
      let actionData = null;
      if (intersectedLayers.length === 1 && intersectedLayers[0].layerId.startsWith('parcels-m')) {
          const p = intersectedLayers[0].properties;
          const geometry = intersectedLayers[0].feature.geometry;
          
          // Get address from click event if available (from TopSearch simulation)
          const searchAddress = clickEvent?.originalEvent?.address;
          
          actionData = {
              parcelId: p.pid_pg_parcels_251001 || p.pid_parcels_251001,
              fullParcel: JSON.stringify(p).replace(/'/g, '&apos;'),
              coordinates: { lng, lat },
              address: searchAddress,
              geometry: geometry
          };
      }

      return {
        type: 'layer',
        html: content,
        layers: intersectedLayers,
        actionData: actionData
      };
    } else {
      // Return coordinate content (fallback)
      return {
        type: 'coordinates',
        html: this.generateCoordinatesContent(lng, lat),
        coordinates: { lng, lat }
      };
    }
  }

  /**
   * Check for layer intersections at click point
   * @param {Object} clickEvent - MapLibre click event object
   * @returns {Array} Array of intersected layer information
   */
  checkLayerIntersections(clickEvent) {
    const intersectedLayers = [];

    if (!clickEvent || !clickEvent.features) {
      return intersectedLayers;
    }

    // Get features at click point
    const features = clickEvent.features || [];

    // Process each feature and match with our layers
    features.forEach(feature => {
      // Find matching layer from our layer instances
      Object.entries(this.layers).forEach(([layerId, layerInstance]) => {
        if (this.isFeatureFromLayer(feature, layerInstance)) {
          // if layerId: 'parcels' skip
          if (layerId === 'parcels') {
            console.log('Skipping group layer "parcels"');
            return;
          }

          intersectedLayers.push({
            layerId: layerId,
            layerName: layerInstance.name || layerInstance.layerName || layerId,
            layerInstance: layerInstance,
            feature: feature,
            properties: feature.properties || {}
          });
        }
      });
    });

    return intersectedLayers;
  }

  /**
   * Check if a feature belongs to a specific layer
   * @param {Object} feature - MapLibre feature object
   * @param {Object} layerInstance - Layer instance
   * @returns {boolean} True if feature belongs to the layer
   */
  isFeatureFromLayer(feature, layerInstance) {
    const layerName = layerInstance.layerName || layerInstance.id;

    // Skip group layers (like 'parcels') that don't render features
    // Group layers are container layers that manage multiple child layers
    if (layerInstance.constructor.name === 'ParcelsLayers') {
      return false;
    }

    // Check by source name (most common case for PMTiles layers)
    if (feature.source && layerName && feature.source === layerName) {
      return true;
    }

    // Check layer ID from MapLibre (for fill/line layers)
    if (feature.layer && feature.layer.id && layerName) {
      // Special case for parcels layers: 'parcels-m00-fill' should match 'parcels-m00'
      if (feature.layer.id.startsWith(layerName + '-')) {
        return true;
      }
      // Exact match for layer ID
      if (feature.layer.id === layerName) {
        return true;
      }
    }

    // Check if feature source matches layer name exactly
    if (feature.source && layerName && feature.source === layerName) {
      return true;
    }

    // PMTiles sourceLayer matching
    if (
      feature.sourceLayer &&
      layerInstance.sourceLayer &&
      feature.sourceLayer === layerInstance.sourceLayer
    ) {
      return true;
    }

    return false;
  }

  /**
   * Generate HTML content for layer intersections
   * @param {Array} intersectedLayers - Array of intersected layer info
   * @returns {string} HTML content
   */
  generateLayerContent(intersectedLayers) {
    if (intersectedLayers.length === 0) {
      return '<div class="popup-error">No layer information available</div>';
    }

    let content = '<div class="popup-layer-info">';
    console.log('Intersected Layers:', intersectedLayers);
    if (intersectedLayers.length === 1) {
      // Single layer intersection
      const layerInfo = intersectedLayers[0];
      const p = intersectedLayers[0].properties;

      if (layerInfo.layerId.startsWith('parcels-m')) {
        content += `
          <div class="popup-layer-single">
            <div class="layer-header-info">
               <span class="layer-type-badge">Parcel Data</span>
               <span class="layer-value" style="font-size: 0.8rem; opacity: 0.7;">${p.pid_pg_parcels_251001 || p.pid_parcels_251001 || 'N/A'}</span>
            </div>

            <div class="layer-details-grid">
              <div class="layer-section-title">Location</div>
              <div class="layer-item">
                <span class="layer-label">Particella</span>
                <span class="layer-value highlight">${p.particella || 'N/A'}</span>
              </div>
              <div class="layer-item">
                <span class="layer-label">Zona O.M.I.</span>
                <span class="layer-value">${p.municipality_zona_omi || 'N/A'}</span>
              </div>
               <div class="layer-item">
                  <span class="layer-label">Local ID 2</span>
                  <span class="layer-value">${p.inspireid_localid_2 || 'N/A'}</span>
               </div>
               <div class="layer-item">
                  <span class="layer-label">Local ID 3</span>
                  <span class="layer-value">${p.inspireid_localid_3 || 'N/A'}</span>
               </div>
            </div>

            <div class="layer-details-grid">
               <div class="layer-section-title">Census Data</div>
               <div class="layer-item">
                  <span class="layer-label">ISTAT Sez. ID</span>
                  <span class="layer-value" style="font-size: 0.85rem;">${p.bt_pg_r00_21_sez21_id || 'N/A'}</span>
               </div>
                <div class="layer-item">
                  <span class="layer-label">Pop/SqKm (2021)</span>
                  <span class="layer-value">${p.pop21_sqkm ? parseFloat(p.pop21_sqkm).toFixed(1) : 'N/A'}</span>
                </div>
                <div class="layer-item" id="census-fam21-${p.bt_pg_r00_21_sez21_id}">
                  <span class="layer-label">Families (FAM21)</span>
                  <span class="layer-value">Loading...</span>
                </div>
                <div class="layer-item" id="census-edi21-${p.bt_pg_r00_21_sez21_id}">
                  <span class="layer-label">Buildings (EDI21)</span>
                  <span class="layer-value">Loading...</span>
                </div>
            </div>

            <div class="layer-details-grid">
               <div class="layer-section-title">Market Values</div>
               <div id="omi-data-${p.bt_pg_r00_21_sez21_id}" class="omi-data-container">
                  <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 0.5rem;">Loading OMI data...</div>
               </div>
            </div>
          </div>
        `;

        // Fetch census section data from API
        if (p.bt_pg_r00_21_sez21_id) {
          this.apiService
            .get(`/single_bt_pg_r00_21/${p.bt_pg_r00_21_sez21_id}`)
            .then(response => {
              // _onsole.log('Census section data:', response);

              // Update the placeholder values with API data
              if (response.status === 'success' && response.data) {
                const fam21Element = document.getElementById(
                  `census-fam21-${p.bt_pg_r00_21_sez21_id}`
                );
                const edi21Element = document.getElementById(
                  `census-edi21-${p.bt_pg_r00_21_sez21_id}`
                );

                if (fam21Element) {
                  const valueSpan = fam21Element.querySelector('.layer-value');
                  if (valueSpan)
                    valueSpan.textContent = response.data.fam21 || 'N/A';
                }

                if (edi21Element) {
                  const valueSpan = edi21Element.querySelector('.layer-value');
                  if (valueSpan)
                    valueSpan.textContent = response.data.edi21 || 'N/A';
                }
              }
            })
            .catch(error => {
              console.error('Error fetching census section data:', error);

              // Update placeholders with error state
              const fam21Element = document.getElementById(
                `census-fam21-${p.bt_pg_r00_21_sez21_id}`
              );
              const edi21Element = document.getElementById(
                `census-edi21-${p.bt_pg_r00_21_sez21_id}`
              );

              if (fam21Element) {
                const valueSpan = fam21Element.querySelector('.layer-value');
                if (valueSpan) valueSpan.textContent = 'Error';
              }

              if (edi21Element) {
                const valueSpan = edi21Element.querySelector('.layer-value');
                if (valueSpan) valueSpan.textContent = 'Error';
              }
            });
        }

        // Fetch OMI real estate data from API
        if (p.municipality_zona_omi) {
          // Parse municipality_zona_omi (format: "H501|C5|019408")
          const omiParts = p.municipality_zona_omi.split('|');
          if (omiParts.length >= 2) {
            const comuneAmm = omiParts[0]; // e.g., "H501"
            const zona = omiParts[1]; // e.g., "C5"

            this.apiService
              .get(`/single_omi_qi_20242_valori_fixed/${comuneAmm}/${zona}`)
              .then(response => {
                // _onsole.log('OMI real estate data:', response);

                const omiDataElement = document.getElementById(
                  `omi-data-${p.bt_pg_r00_21_sez21_id}`
                );
                if (
                  omiDataElement &&
                  response.status === 'success' &&
                  response.data &&
                  response.data.length > 0
                ) {
                  // Generate OMI data HTML - show only first 4 property types
                  let omiHtml = '';

                  // Limit to first 4 records
                  const recordsToShow = response.data.slice(0, 4);

                  recordsToShow.forEach(record => {
                    // Format price range - convert to k format if >= 1000
                    const formatPrice = (min, max) => {
                      if (!min || !max) return 'N/A';
                      const minNum = parseFloat(min);
                      const maxNum = parseFloat(max);

                      if (minNum >= 1000 || maxNum >= 1000) {
                        const minK = (minNum / 1000)
                          .toFixed(1)
                          .replace('.0', '');
                        const maxK = (maxNum / 1000)
                          .toFixed(1)
                          .replace('.0', '');
                        return `€${minK}-${maxK}k/m²`;
                      } else {
                        return `€${min}-${max}/m²`;
                      }
                    };

                    const purchaseRange = formatPrice(
                      record.compr_min,
                      record.compr_max
                    );

                    omiHtml += `
                      <div class="layer-item">
                        <span class="layer-label" style="margin-right: 0.5rem;">${record.descr_tipologia}</span>
                        <span class="layer-value">${purchaseRange}</span>
                      </div>
                    `;
                  });

                  omiDataElement.innerHTML = omiHtml;
                } else if (omiDataElement) {
                  // No data available - leave empty or show minimal message
                  omiDataElement.innerHTML = '';
                }
              })
              .catch(error => {
                console.error('Error fetching OMI real estate data:', error);

                const omiDataElement = document.getElementById(
                  `omi-data-${p.bt_pg_r00_21_sez21_id}`
                );
                if (omiDataElement) {
                  // Error - leave empty
                  omiDataElement.innerHTML = '';
                }
              });
          }
        }
      } else if (layerInfo.layerId === 'inventario-assets') {
        // Handle inventario assets layer
        content += `
          <div class="popup-layer-single">
            <strong>Asset Information</strong>
            <div class="layer-details">
              <div class="layer-item">
                <span class="layer-label" style="margin-right: 0.5rem;">Asset ID:</span>
                <span class="layer-value">${p.pid || 'N/A'}</span>
              </div>
              <div class="layer-item">
                <span class="layer-label" style="margin-right: 0.5rem;">Address:</span>
                <span class="layer-value">${p.indirizzo || 'N/A'}</span>
              </div>
              <div class="layer-item">
                <span class="layer-label" style="margin-right: 0.5rem;">Municipality:</span>
                <span class="layer-value">${p.comune || 'N/A'}</span>
              </div>
              <div class="layer-item">
                <span class="layer-label" style="margin-right: 0.5rem;">Province:</span>
                <span class="layer-value">${p.provincia || 'N/A'}</span>
              </div>
              <div class="layer-item">
                <span class="layer-label" style="margin-right: 0.5rem;">Region:</span>
                <span class="layer-value">${p.regione || 'N/A'}</span>
              </div>
              <div class="layer-item">
                <span class="layer-label" style="margin-right: 0.5rem;">Coordinates:</span>
                <span class="layer-value">${p.latitude?.toFixed(6) || 'N/A'}, ${p.longitude?.toFixed(6) || 'N/A'}</span>
              </div>
            </div>
          </div>
        `;
      } else {
        content += `
          <div class="popup-layer-single">
            <strong>Layer Information</strong>
            <div class="layer-details">
              <div class="layer-item">
                <span class="layer-label" style="margin-right: 0.5rem;">Layer ID:</span>
                <span class="layer-value">${layerInfo.layerId}</span>
              </div>
              <div class="layer-item">
                <span class="layer-label" style="margin-right: 0.5rem;">Layer Name:</span>
                <span class="layer-value">${layerInfo.layerName}</span>
              </div>
            </div>
          </div>
        `;
      }
    } else {
      // Multiple layer intersections
      content += `
        <div class="popup-layer-multiple">
          <strong>Multiple Layers (${intersectedLayers.length})</strong>
          <div class="layer-list">
      `;

      intersectedLayers.forEach((layerInfo, index) => {
        content += `
          <div class="layer-item">
            <span class="layer-index">${index + 1}.</span>
            <span class="layer-name">${layerInfo.layerName}</span>
            <span class="layer-id">(${layerInfo.layerId})</span>
          </div>
        `;
      });

      content += `
          </div>
        </div>
      `;
    }

    content += '</div>';
    return content;
  }

  /**
   * Generate HTML content for coordinates (fallback)
   * @param {number} lng - Longitude
   * @param {number} lat - Latitude
   * @returns {string} HTML content
   */
  generateCoordinatesContent(lng, lat) {
    return `
      <div class="popup-coordinates">
        <strong>Coordinates</strong>
        <div class="coordinates-info">
          <div class="coordinate-item">
            <span class="coordinate-label">Longitude:</span>
            <span class="coordinate-value">${lng.toFixed(6)}</span>
          </div>
          <div class="coordinate-item">
            <span class="coordinate-label">Latitude:</span>
            <span class="coordinate-value">${lat.toFixed(6)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Format feature properties for display (utility method)
   * @param {Object} properties - Feature properties
   * @returns {string} Formatted HTML string
   */
  formatProperties(properties) {
    if (!properties || Object.keys(properties).length === 0) {
      return '<div class="no-properties">No properties available</div>';
    }

    let content = '<div class="feature-properties">';
    Object.entries(properties).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        content += `
          <div class="property-item">
            <span class="property-label">${key}:</span>
            <span class="property-value">${value}</span>
          </div>
        `;
      }
    });
    content += '</div>';

    return content;
  }
}
