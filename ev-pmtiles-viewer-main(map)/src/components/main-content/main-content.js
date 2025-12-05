import './main-content.css';
import '../popup/popup.css';
import { PopupContentManager } from '../popup/index.js';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  fetchMunicipalitiesInBbox,
  formatBoundsForApi
} from '../../services/api/index.js';
import { logMunicipalityApiResponse } from '../../utils/municipality/index.js';

// _onsole.log('🚀 MainContent loaded with municipality API imports:', {
//   fetchMunicipalitiesInBbox,
//   formatBoundsForApi,
//   logMunicipalityApiResponse
// });

export class MainContent {
  constructor(leftSidebar = null, rightSidebar = null, layers = {}) {
    this.element = null;
    this.map = null;
    this.leftSidebar = leftSidebar;
    this.rightSidebar = rightSidebar;
    this.layers = layers;
    this.popupContentManager = null;
  }

  render() {
    const mainContentHTML = `
      <div class="main-content">
        <main>
          <div id="map"></div>
        </main>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = mainContentHTML;
    this.element = wrapper.firstElementChild;

    // Initialize the map after the element is created
    this.initializeMap();

    return this.element;
  }

  initializeMap() {
    // Wait for the element to be mounted to the DOM
    setTimeout(() => {
      const mapContainer = this.element?.querySelector('#map');
      if (mapContainer && !this.map) {
        // Get the current MapComponent if it exists and transfer the map
        if (window.pmtilesApp && window.pmtilesApp.getMap) {
          const existingMap = window.pmtilesApp.getMap();
          if (existingMap) {
            // Remove existing map container
            const existingContainer = existingMap.getContainer();
            if (existingContainer && existingContainer.parentNode) {
              existingContainer.parentNode.removeChild(existingContainer);
            }
            existingMap.remove();
          }
        }

        this.map = new maplibregl.Map({
          container: 'map',
          style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', // Carto Voyager style
          center: [12.4964, 41.9028], // Rome, Italy coordinates [lng, lat]
          zoom: 10, // Starting zoom level
          bearing: 0,
          pitch: 0,
          interactive: true, // Enable map interactions (pan, zoom, rotate)
          dragPan: true, // Enable panning by dragging
          dragRotate: false, // Disable rotation by dragging
          scrollZoom: true, // Enable zoom with scroll wheel
          boxZoom: true, // Enable zoom with box selection
          doubleClickZoom: true, // Enable zoom on double click
          touchZoomRotate: true, // Enable zoom and rotation with touch gestures
          touchPitch: false, // Disable touch pitch on mobile
          keyboard: true, // Enable keyboard navigation
          pitchWithRotate: false // Disable pitch when rotating
        });

        // Log when map is ready
        this.map.on('load', async () => {
          // _onsole.log('✓ Map initialized successfully in main content');

          // Pass map instance to left sidebar for parcel blocks search zoom functionality
          if (this.leftSidebar && this.leftSidebar.setMapInstance) {
            this.leftSidebar.setMapInstance(this.map);
          }

          // Set map instance and parcels layer on right sidebar for selection management
          if (this.rightSidebar) {
            this.rightSidebar.setMap(this.map);
            if (this.layers['parcels']) {
              this.rightSidebar.setParcelsLayer(this.layers['parcels']);
            }
          }

          // Initialize popup content manager
          this.popupContentManager = new PopupContentManager(
            this.map,
            this.layers
          );

          // Call municipality API on initial load
          // _onsole.log('🚀 Calling municipality API on map load...');
          this.callBboxMunicipalityAPI();

          // Register layer toggle callbacks with left sidebar
          if (this.leftSidebar) {
            Object.entries(this.layers).forEach(([layerId, layerInstance]) => {
              this.leftSidebar.registerLayerCallback(layerId, () => {
                if (layerInstance.toggleLayerState) {
                  layerInstance.toggleLayerState(this.map, this.leftSidebar);

                  // If this is an individual parcel layer, sync the parcels group manager
                  if (
                    layerId.startsWith('parcels-') &&
                    this.layers['parcels']
                  ) {
                    this.layers['parcels'].syncStateFromLayers();
                  }
                } else {
                  console.log(`Toggle layer: ${layerId}`);
                }
              });
            });
          }

          // Add layers to the map
          const layerInstances = Object.values(this.layers);
          if (layerInstances.length > 0) {
            for (const layerInstance of layerInstances) {
              if (layerInstance.addToMap) {
                await layerInstance.addToMap(this.map);
              }
            }
            // _onsole.log(`✓ Added ${layerInstances.length} layer(s) to map`);

            // Update popup content manager with loaded layers
            this.popupContentManager.updateLayers(this.layers);
          } else {
            console.log(
              'ℹ️ No layers configured. Use app.addLayer() to add PMTiles layers.'
            );
          }

          // Map on click - show popup with layer intersection or coordinates
          this.map.on('click', e => {
            const coordinates = [e.lngLat.lng, e.lngLat.lat];

            // Query features at the click point explicitly
            const queriedFeatures = this.map.queryRenderedFeatures(e.point);

            // Create enhanced click event with queried features
            const enhancedClickEvent = {
              ...e,
              features:
                queriedFeatures.length > 0 ? queriedFeatures : e.features || []
            };

            // Get popup content based on layer intersections
            const contentData = this.popupContentManager.getPopupContent(
              coordinates,
              enhancedClickEvent
            );

            this.layers['parcels'].clearParcelHighlight(this.map);
            const popup = new maplibregl.Popup()
              .setLngLat(coordinates)
              .setHTML(contentData.html)
              .addTo(this.map);

            popup.on('close', () => {
              if (this.layers['parcels']) {
                this.layers['parcels'].clearParcelHighlight(this.map);
              }
            });

            // Add event listener for DETAILS button if it exists
            setTimeout(() => {
              const detailsButton = document.querySelector(
                '.popup-details-button'
              );
              if (detailsButton) {
                detailsButton.addEventListener('click', e => {
                  const parcelId = e.target.dataset.parcelId;
                  const sezId = e.target.dataset.sezId;

                  // Get full parcel data from the intersected layers
                  if (contentData.layers && contentData.layers.length > 0) {
                    const parcelLayer = contentData.layers.find(layer =>
                      layer.layerId.startsWith('parcels-m')
                    );
                    if (parcelLayer && parcelLayer.properties) {
                      // Display parcel info in right sidebar
                      if (
                        this.rightSidebar &&
                        this.rightSidebar.displayParcellaInfo
                      ) {
                        this.rightSidebar.displayParcellaInfo(
                          parcelLayer.properties
                        );
                      }
                    }
                  }
                });
              }
            }, 0);

            // Find first feature with layer.id starting with 'parcels-m'
            const parcelFeature = enhancedClickEvent.features.find(feature =>
              feature.layer.id.startsWith('parcels-m')
            );

            // Highlight the clicked parcel if found
            if (
              parcelFeature &&
              parcelFeature.properties.pid_pg_parcels_251001
            ) {
              if (this.layers['parcels']) {
                this.layers['parcels'].highlightParcelByPid(
                  this.map,
                  parcelFeature.properties.pid_pg_parcels_251001
                );
              }
            }
          });
        });

        // Add event listeners for map movement and zoom end
        this.map.on('moveend', () => {
          this.callBboxMunicipalityAPI();
        });

        this.map.on('zoomend', () => {
          this.callBboxMunicipalityAPI();
        });

        // Add navigation controls for interactive map
        this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
      }
    }, 100);
  }

  getMap() {
    return this.map;
  }

  /**
   * Update layers reference for popup content manager
   * @param {Object} layers - Updated layers object
   */
  updateLayers(layers) {
    this.layers = layers;
    if (this.popupContentManager) {
      this.popupContentManager.updateLayers(layers);
    }
  }

  mount(container) {
    if (container && this.element) {
      container.appendChild(this.element);
    }
  }

  /**
   * Calls the municipality bbox API with current map bounds
   * Fetches municipalities within the current map viewport and logs the results
   */
  async callBboxMunicipalityAPI() {
    // _onsole.log('🔧 callBboxMunicipalityAPI method called');

    if (!this.map) {
      console.warn('⚠️ Map not initialized, skipping API call');
      return;
    }

    try {
      // _onsole.log('🗺️ Getting map bounds...');

      // Get current map bounds and format for API
      const mapBounds = this.map.getBounds();
      // _onsole.log('Raw map bounds:', mapBounds);

      const formattedBounds = formatBoundsForApi(mapBounds);
      // _onsole.log('Formatted bounds:', formattedBounds);

      // Fetch municipalities within bounds
      // _onsole.log('📞 Fetching municipalities...');
      const apiResponse = await fetchMunicipalitiesInBbox(formattedBounds);
      // _onsole.log('📦 API response received:', apiResponse);

      // Log the response in a formatted way
      logMunicipalityApiResponse(apiResponse, formattedBounds);

      // Update left sidebar with municipality data
      if (this.leftSidebar && apiResponse && apiResponse.data) {
        // _onsole.log('🔄 Updating left sidebar with municipalities:', apiResponse.data.length);
        this.leftSidebar.updateMunicipalities(apiResponse.data);
      }

      // Return the response for potential use by other components
      return apiResponse;
    } catch (error) {
      console.error('❌ Error in callBboxMunicipalityAPI:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);

      // Re-throw for potential error handling by calling code
      throw error;
    }
  }
}
