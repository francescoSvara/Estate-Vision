import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PopupContentManager, PopupModal } from '../popup/index.js';
import { AbbyAssistant } from '../nemo-assistant/nemo-assistant.js';
import {
  fetchMunicipalitiesInBbox,
  formatBoundsForApi
} from '../../services/api/index.js';
import { logMunicipalityApiResponse } from '../../utils/municipality/index.js';
import { MapLayerService } from '../../services/map/map-layer-service.js';
import { MapButtonService } from '../../services/map/map-button-service.js';
import { mainMapManager } from '../../services/map/main-map-manager.js';

export class MainMap {
  constructor(containerId = 'map', leftSidebar = null, rightSidebar = null) {
    this.containerId = containerId;
    this.map = null;
    this.leftSidebar = leftSidebar;
    this.rightSidebar = rightSidebar;
    this.layerControls = null; // Direct reference to LayerControls
    this.buttonGroup = null; // Reference to auxiliary button group for map-dependent buttons
    this.popupContentManager = null;
    this.popupModal = null;
    this.nemoAssistant = null; // Abby AI Assistant
    this.portfolioFeatures = null; // Store portfolio features for re-centering

    // Initialize map services internally
    this.mapLayerService = new MapLayerService();
    const { layers, layerConfig } = this.mapLayerService.initializeLayers();
    this.layers = layers;
    this.layerConfig = layerConfig;

    this.mapButtonService = new MapButtonService();
  }

  /**
   * Set auxiliary button group reference
   * @param {Object} buttonGroup - Auxiliary button group instance
   */
  setAuxiliaryButtonGroup(buttonGroup) {
    this.buttonGroup = buttonGroup;
    // Configure map button service when button group is set
    this.mapButtonService.setMainMap(this);
    this.mapButtonService.setAuxiliaryButtonGroup(buttonGroup);
  }

  /**
   * Initialize the map with the given container
   */
  async init() {
    const mapContainer = document.getElementById(this.containerId);
    if (!mapContainer) {
      throw new Error(`Map container with ID '${this.containerId}' not found`);
    }

    // Remove existing map if it exists
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Remove any existing map from MainMapManager
    if (mainMapManager.isInitialized()) {
      const existingMap = mainMapManager.getMapInstance();
      if (existingMap) {
        const existingContainer = existingMap.getContainer();
        if (existingContainer && existingContainer.parentNode) {
          existingContainer.parentNode.removeChild(existingContainer);
        }
        existingMap.remove();
      }
    }

    // Create new map instance
    this.map = new maplibregl.Map({
      container: this.containerId,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // Carto Dark Matter style
      center: [9.1900, 45.4642], // Duomo, Milan
      zoom: 14, // Start slightly zoomed out for fly-in effect
      bearing: 20,
      pitch: 45, // Start with tilt
      minZoom: 5.5, // Prevent zooming out too far (keeps Italy in focus)
      maxZoom: 20, // Maximum zoom level
      maxBounds: [
        [6.2, 36.0], // Southwest coordinates (Pantelleria/Lampedusa islands)
        [18.8, 47.5]  // Northeast coordinates (Trieste/South Tyrol)
      ],
      interactive: true, // Enable map interactions (pan, zoom, rotate)
      dragPan: true, // Enable panning by dragging
      dragRotate: true, // Enable rotation
      scrollZoom: true, // Enable zoom with scroll wheel
      boxZoom: true, // Enable zoom with box selection
      doubleClickZoom: true, // Enable zoom on double click
      touchZoomRotate: true, // Enable zoom and rotation with touch gestures
      touchPitch: true, // Enable touch pitch
      keyboard: true, // Enable keyboard navigation
      pitchWithRotate: true // Enable pitch when rotating
    });

    // Register map instance with MainMapManager for global access
    mainMapManager.setMapInstance(this.map);

    // Add cinematic fly-in effect on load
    this.map.on('load', () => {
      // Log all map layers to console for debugging
      console.log('🗺️ Map Layers Order:', this.map.getStyle().layers.map(l => ({ id: l.id, type: l.type })));

      // Add 3D Buildings Layer
      // NOTE: We need to place this layer appropriately.
      // Usually below labels but above base map.
      // However, to ensure parcel interactions (which are likely filled polygons) work,
      // the parcel layers need to be rendered ABOVE the 3D buildings if they overlap,
      // or we need to ensure the building layer doesn't block events if it's on top.
      
      // Since 3D buildings are tall, they might occlude 2D parcel layers.
      // To fix selection:
      // 1. We should add parcel layers (which happens in addLayersToMap) AFTER buildings.
      // 2. Or ensuring addLayersToMap inserts them at the top.
      
      if (!this.map.getLayer('3d-buildings')) {
          // Find the first symbol layer to place buildings below labels
          const layers = this.map.getStyle().layers;
          let labelLayerId;
          for (let i = 0; i < layers.length; i++) {
              if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                  labelLayerId = layers[i].id;
                  break;
              }
          }

          // Check if 'composite' source exists before adding layer
          const sources = this.map.getStyle().sources;
          if (sources && sources['composite']) {
            this.map.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 14,
                'paint': {
                    'fill-extrusion-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'height'],
                        0, '#1e2127',
                        50, '#3e4452',
                        100, '#E5C07B' // Gold/Yellow highlight for tall buildings
                    ],
                    'fill-extrusion-height': ['get', 'height'],
                    'fill-extrusion-base': ['get', 'min_height'],
                    'fill-extrusion-opacity': 0.8
                }
            }, labelLayerId); // Add below labels
          } else {
             console.warn('⚠️ Source "composite" not found. Skipping 3D buildings layer.');
          }
      }

      this.map.flyTo({
        zoom: 15.5,
        pitch: 60,
        bearing: -30,
        duration: 4000,
        essential: true,
        easing: t => t * (2 - t)
      });
    });

    // Initialize popup modal
    if (!this.popupModal) {
      this.popupModal = new PopupModal();
      const mapContainer = document.getElementById(this.containerId);
      if (mapContainer && mapContainer.parentElement) {
        // Append to map's parent container for relative positioning
        mapContainer.parentElement.appendChild(this.popupModal.render());
      } else {
        // Fallback to body if parent not found
        document.body.appendChild(this.popupModal.render());
      }

      // Set modal close handler to clear parcel highlights
      this.popupModal.setOnClose(() => {
        if (this.layers['parcels']) {
          this.layers['parcels'].clearParcelHighlight(this.map);
        }
      });
    }

    // Initialize Abby Assistant
    this.nemoAssistant = new AbbyAssistant(this.map);
    this.nemoAssistant.render();

    // Setup map event handlers and layers when map loads
    this.map.on('load', async () => {
      await this.onMapLoad();
    });

    // Add navigation controls
    this.map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Setup map movement and zoom event listeners
    this.setupMapEventListeners();

    return this.map;
  }

  /**
   * Handle map load event
   */
  async onMapLoad() {
    // Initialize map buttons first, then notify that map is ready
    if (this.buttonGroup) {
      // Initialize map buttons using internal map button service
      await this.mapButtonService.initializeMapButtons();
      // Notify button group that map is ready
      this.buttonGroup.setMapReady(true);
    }

    // Set parcels layer on parcel analytics manager for selection management
    if (this.rightSidebar && this.rightSidebar.parcelAnalyticsManager) {
      if (this.layers['parcels']) {
        this.rightSidebar.parcelAnalyticsManager.setParcelsLayer(
          this.layers['parcels']
        );
      }
    }

    // Initialize popup content manager
    this.popupContentManager = new PopupContentManager(this.layers);

    // Call municipality API on initial load
    this.callBboxMunicipalityAPI();

    // Register layer toggle callbacks with left sidebar
    this.setupLayerCallbacks();

    // Ensure 3D buildings are added first (if not already) so parcels render on top
    // The load event handler handles buildings, but addLayersToMap is called here in onMapLoad
    // which is also called from load event.
    // If we want parcels ON TOP of buildings, we are fine as addLayersToMap simply appends.
    // If we want parcels INTERLEAVED or BELOW specific things, we need control.
    // By default, MapLibre adds new layers on top.
    // So: Buildings added -> then Parcels added = Parcels on top of Buildings.
    
    // Add layers to the map
    await this.addLayersToMap();

    // Setup map click event handler
    this.setupMapClickHandler();
  }

  /**
   * Setup layer toggle callbacks with layer controls
   */
  setupLayerCallbacks() {
    if (this.layerControls) {
      Object.entries(this.layers).forEach(([layerId, layerInstance]) => {
        this.layerControls.registerLayerCallback(layerId, () => {
          if (layerInstance.toggleLayerState) {
            layerInstance.toggleLayerState(this.map, this.layerControls);

            // If this is an individual parcel layer, sync the parcels group manager
            if (layerId.startsWith('parcels-') && this.layers['parcels']) {
              this.layers['parcels'].syncStateFromLayers();
            }
          } else {
            console.log(`Toggle layer: ${layerId}`);
          }
        });
      });
    }
  }

  /**
   * Add all layers to the map
   */
  async addLayersToMap() {
    const layerInstances = Object.values(this.layers);
    if (layerInstances.length > 0) {
      for (const layerInstance of layerInstances) {
        if (layerInstance.addToMap) {
          await layerInstance.addToMap(this.map);
        }
      }

      // Update popup content manager with loaded layers
      if (this.popupContentManager) {
        this.popupContentManager.updateLayers(this.layers);
      }
    } else {
      console.log(
        'ℹ️ No layers configured. Use app.addLayer() to add PMTiles layers.'
      );
    }
  }

  /**
   * Setup map click event handler
   */
  setupMapClickHandler() {
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

      // Clear previous parcel highlight
      if (this.layers['parcels']) {
        this.layers['parcels'].clearParcelHighlight(this.map);
      }

      // Highlight the clicked parcel if found
      let parcelSelected = false;
      // Note: Map click returns properties from the vector tile.
      // We check both 'pid_pg_parcels_251001' (API property name) and 'pid_parcels_251001' (Tile/Layer Filter property name)
      // The individual layers are configured with 'pid_parcels_251001' in their filter.
      
      const parcelFeature = enhancedClickEvent.features.find(f => f.layer.id.startsWith('parcels-'));
      const pid = parcelFeature?.properties?.pid_pg_parcels_251001 || parcelFeature?.properties?.pid_parcels_251001;

      // Handle Double Click Logic
      // Check if this click is within a short time window of the previous click on the same location
      const currentTime = new Date().getTime();
      const clickThreshold = 300; // 300ms for double click
      
      if (this.lastClickTime && (currentTime - this.lastClickTime < clickThreshold)) {
          // Double click detected!
          // Trigger NEMO Assistant instead of static PopupModal
          if (contentData.html && contentData.actionData) {
              const parcelData = JSON.parse(contentData.actionData.fullParcel);
              // Pass address if available
              if (contentData.actionData.address) {
                  parcelData.address = contentData.actionData.address;
              }
              // Pass geometry if available
              if (contentData.actionData.geometry) {
                  parcelData.geometry = contentData.actionData.geometry;
              }
              this.nemoAssistant.analyzeAsset(parcelData, coordinates);
          }
          this.lastClickTime = null; // Reset
      } else {
          // Single click logic
          this.lastClickTime = currentTime;
          
          if (parcelFeature && pid) {
            if (this.layers['parcels']) {
              this.layers['parcels'].highlightParcelByPid(
                this.map,
                pid
              );
              parcelSelected = true;
            }
          }
      }
    });
  }

  /**
   * Setup map movement and zoom event listeners
   */
  setupMapEventListeners() {
    this.map.on('moveend', () => {
      this.callBboxMunicipalityAPI();
    });

    this.map.on('zoomend', () => {
      this.callBboxMunicipalityAPI();
    });
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

  /**
   * Reset map view to initial position and zoom
   */
  resetView() {
    if (this.map) {
      this.map.flyTo({
        center: [11.8, 45.5],
        zoom: 10,
        duration: 1000
      });
    }
  }

  /**
   * Zoom in the map
   */
  zoomIn() {
    if (this.map) {
      this.map.zoomIn({ duration: 300 });
    }
  }

  /**
   * Zoom out the map
   */
  zoomOut() {
    if (this.map) {
      this.map.zoomOut({ duration: 300 });
    }
  }

  /**
   * Calls the municipality bbox API with current map bounds
   * Fetches municipalities within the current map viewport and logs the results
   */
  async callBboxMunicipalityAPI() {
    if (!this.map) {
      console.warn('⚠️ Map not initialized, skipping API call');
      return;
    }

    try {
      // Get current map bounds and format for API
      const mapBounds = this.map.getBounds();
      const formattedBounds = formatBoundsForApi(mapBounds);

      // Fetch municipalities within bounds
      const apiResponse = await fetchMunicipalitiesInBbox(formattedBounds);

      // Log the response in a formatted way
      logMunicipalityApiResponse(apiResponse);

      // Update left sidebar with municipality data
      if (this.leftSidebar && apiResponse && apiResponse.data) {
        this.leftSidebar.cadastralSearch?.updateMunicipalities(
          apiResponse.data
        );
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

  /**
   * Set the left sidebar reference
   */
  setLeftSidebar(leftSidebar) {
    this.leftSidebar = leftSidebar;

    // Configure both components directly with layer data
    if (leftSidebar) {
      // Update layer controls component
      if (leftSidebar.layerControls) {
        leftSidebar.layerControls.updateLayerConfig(
          this.layerConfig,
          this.layers
        );
      }

      // Update cadastral search layer instances
      if (leftSidebar.cadastralSearch) {
        leftSidebar.cadastralSearch.updateLayerInstances(this.layers);
      }

      // Update sidebar's layer instances property
      leftSidebar.layerInstances = this.layers;
    }

    // Get LayerControls reference directly
    if (leftSidebar && leftSidebar.layerControls) {
      this.layerControls = leftSidebar.layerControls;
    }

    // Re-setup layer callbacks if map is already initialized
    if (this.map) {
      this.setupLayerCallbacks();
    }
  }

  /**
   * Set the LayerControls reference directly
   * @param {LayerControls} layerControls - LayerControls instance
   */
  setLayerControls(layerControls) {
    this.layerControls = layerControls;

    // Re-setup layer callbacks if map is already initialized
    if (this.map) {
      this.setupLayerCallbacks();
    }
  }

  /**
   * Set the right sidebar reference
   */
  setRightSidebar(rightSidebar) {
    this.rightSidebar = rightSidebar;
    // Set parcels layer reference if available
    if (
      rightSidebar &&
      rightSidebar.parcelAnalyticsManager &&
      this.layers['parcels']
    ) {
      rightSidebar.parcelAnalyticsManager.setParcelsLayer(
        this.layers['parcels']
      );
    }
  }

  /**
   * Toggle Portfolio assets layer visibility
   */
  togglePortfolioLayer() {
    if (!this.map) {
      console.warn('Map not initialized');
      return;
    }

    const layerId = 'portfolio-assets-layer';
    const sourceId = 'portfolio-assets-source';

    // Check if layer already exists
    if (this.map.getLayer(layerId)) {
      // Toggle visibility
      const visibility = this.map.getLayoutProperty(layerId, 'visibility');
      if (visibility === 'visible') {
        this.map.setLayoutProperty(layerId, 'visibility', 'none');
        console.log('Portfolio layer hidden');
      } else {
        this.map.setLayoutProperty(layerId, 'visibility', 'visible');
        console.log('Portfolio layer shown - re-centering to assets');
        
        // Always zoom to fit assets when showing the layer
        if (this.portfolioFeatures && this.portfolioFeatures.length > 0) {
          this.fitBoundsToAssets(this.portfolioFeatures);
        } else {
          console.warn('No portfolio features available for zoom');
        }
      }
    } else {
      // Create portfolio layer (this will zoom automatically on creation)
      this.createPortfolioLayer();
    }
  }

  /**
   * Create and display portfolio assets on the map
   */
  createPortfolioLayer() {
    if (!this.map) return;

    // Get portfolio data from localStorage
    const userOwners = JSON.parse(localStorage.getItem('user-owners') || '[]');
    const parcelData = JSON.parse(localStorage.getItem('parcels') || '[]');
    const userAssets = JSON.parse(localStorage.getItem('user-assets') || '[]');

    // Combine all asset sources
    const allAssets = [...parcelData, ...userAssets];

    if (allAssets.length === 0) {
      console.warn('No portfolio assets to display');
      alert('No assets in your portfolio to display. Please add assets first.');
      return;
    }

    // Create GeoJSON features from asset data
    const features = allAssets.map((asset, index) => {
      let coordinates = null;
      let properties = {};

      // Check if asset has direct coordinates (address-based import)
      if (asset.coordinates && Array.isArray(asset.coordinates) && asset.coordinates.length === 2) {
        coordinates = asset.coordinates;
        properties = {
          id: asset.id || `asset-${index}`,
          address: asset.address || 'N/A',
          comune: asset.comune || 'N/A',
          provincia: asset.provincia || '',
          regione: asset.regione || '',
          type: asset.type || 'address-based'
        };
      }
      // Otherwise extract from geometry (parcel-based)
      else if (asset.geometry) {
        if (asset.geometry.type === 'MultiPolygon') {
          const firstPolygon = asset.geometry.coordinates[0][0];
          if (firstPolygon && firstPolygon.length > 0) {
            const lngSum = firstPolygon.reduce((sum, coord) => sum + coord[0], 0);
            const latSum = firstPolygon.reduce((sum, coord) => sum + coord[1], 0);
            coordinates = [lngSum / firstPolygon.length, latSum / firstPolygon.length];
          }
        } else if (asset.geometry.type === 'Polygon') {
          const coords = asset.geometry.coordinates[0];
          if (coords && coords.length > 0) {
            const lngSum = coords.reduce((sum, coord) => sum + coord[0], 0);
            const latSum = coords.reduce((sum, coord) => sum + coord[1], 0);
            coordinates = [lngSum / coords.length, latSum / coords.length];
          }
        }
        
        properties = {
          id: asset.id || `asset-${index}`,
          particella: asset.particella || 'N/A',
          foglio: asset.foglio || 'N/A',
          comune: asset.comune || 'N/A',
          type: 'parcel-based'
        };
      }

      if (!coordinates) {
        return null;
      }

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        properties: properties
      };
    }).filter(f => f !== null);

    if (features.length === 0) {
      console.warn('No valid coordinates found for portfolio assets');
      return;
    }

    // Store features for re-centering on toggle
    this.portfolioFeatures = features;

    const geojson = {
      type: 'FeatureCollection',
      features: features
    };

    const sourceId = 'portfolio-assets-source';
    const layerId = 'portfolio-assets-layer';

    // Add source
    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: geojson
      });
    }

    // Add layer
    if (!this.map.getLayer(layerId)) {
      this.map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 8,
          'circle-color': '#00ff87', // Green color for portfolio assets
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8
        }
      });

      // Add click handler for portfolio assets
      this.map.on('click', layerId, (e) => {
        const feature = e.features[0];
        const coordinates = feature.geometry.coordinates.slice();
        const properties = feature.properties;

        // Create popup content based on asset type
        let popupHTML = '';
        if (properties.type === 'address-based') {
          popupHTML = `
            <div style="padding: 0.5rem;">
              <h4 style="margin: 0 0 0.5rem 0; color: #00ff87;">Portfolio Asset</h4>
              <p style="margin: 0.25rem 0;"><strong>Address:</strong> ${properties.address}</p>
              <p style="margin: 0.25rem 0;"><strong>Municipality:</strong> ${properties.comune}</p>
              ${properties.provincia ? `<p style="margin: 0.25rem 0;"><strong>Province:</strong> ${properties.provincia}</p>` : ''}
              ${properties.regione ? `<p style="margin: 0.25rem 0;"><strong>Region:</strong> ${properties.regione}</p>` : ''}
            </div>
          `;
        } else {
          popupHTML = `
            <div style="padding: 0.5rem;">
              <h4 style="margin: 0 0 0.5rem 0; color: #00ff87;">Portfolio Asset</h4>
              <p style="margin: 0.25rem 0;"><strong>Particella:</strong> ${properties.particella}</p>
              <p style="margin: 0.25rem 0;"><strong>Foglio:</strong> ${properties.foglio}</p>
              <p style="margin: 0.25rem 0;"><strong>Comune:</strong> ${properties.comune}</p>
            </div>
          `;
        }

        new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(popupHTML)
          .addTo(this.map);
      });

      // Change cursor on hover
      this.map.on('mouseenter', layerId, () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });

      this.map.on('mouseleave', layerId, () => {
        this.map.getCanvas().style.cursor = '';
      });

      console.log(`Portfolio layer created with ${features.length} assets`);
      
      // Zoom to fit all portfolio assets with smooth animation
      this.fitBoundsToAssets(features);
    }
  }

  /**
   * Fit map bounds to show all portfolio assets
   */
  fitBoundsToAssets(features) {
    if (!features || features.length === 0) return;

    // Calculate bounds from all features
    const coordinates = features.map(f => f.geometry.coordinates);
    
    // Create bounds object
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

    // Animate to fit bounds with padding
    this.map.fitBounds(bounds, {
      padding: {
        top: 100,
        bottom: 100,
        left: 100,
        right: 100
      },
      duration: 1500, // Smooth 1.5 second animation
      pitch: 45,
      bearing: 20,
      maxZoom: 16, // Don't zoom in too close when fitting bounds
      essential: true // Animation will happen even if user has reduced motion preference
    });

    console.log(`Zoomed to fit ${features.length} portfolio assets`);
  }

  /**
   * Destroy the map instance and clean up resources
   */
  destroy() {
    // Notify button group that map is no longer available
    if (this.buttonGroup) {
      this.buttonGroup.setMapReady(false);
    }

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Clear map instance from MainMapManager
    mainMapManager.clearMapInstance();

    this.popupContentManager = null;

    // Clean up popup modal
    if (this.popupModal) {
      this.popupModal.destroy();
      this.popupModal = null;
    }
  }
}
