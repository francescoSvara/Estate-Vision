import { initializeLayers } from '../../components/layers/index.js';

/**
 * Map Layer Service
 * Manages layer initialization and configuration for the map system
 */
export class MapLayerService {
  constructor() {
    this.layers = {};
    this.layerConfig = [];
  }

  /**
   * Initialize all layers
   */
  initializeLayers() {
    // Initialize layers by calling the centralized function
    this.layers = initializeLayers();

    // Build layer configuration for sidebar
    this.layerConfig = this.buildLayerConfig();

    return {
      layers: this.layers,
      layerConfig: this.layerConfig
    };
  }

  /**
   * Build layer configuration based on layer instances
   */
  buildLayerConfig() {
    return Object.entries(this.layers)
      .filter(([, layerInstance]) => layerInstance.layerInToc === true)
      .map(([layerId, layerInstance]) => ({
        id: layerId,
        layerName: layerInstance.layerName,
        title: layerInstance.layerName
      }));
  }

  /**
   * Get all layers
   * @returns {Object} All layer instances
   */
  getLayers() {
    return this.layers;
  }

  /**
   * Get layer configuration
   * @returns {Array} Layer configuration for UI components
   */
  getLayerConfig() {
    return this.layerConfig;
  }

  /**
   * Get a specific layer by ID
   * @param {string} layerId - Layer identifier
   * @returns {Object|null} Layer instance or null if not found
   */
  getLayer(layerId) {
    return this.layers[layerId] || null;
  }

  /**
   * Add a new layer dynamically
   * @param {string} layerId - Unique layer identifier
   * @param {Object} layerInstance - Layer instance
   */
  addLayer(layerId, layerInstance) {
    this.layers[layerId] = layerInstance;
    this.layerConfig = this.buildLayerConfig();

    return {
      layers: this.layers,
      layerConfig: this.layerConfig
    };
  }

  /**
   * Remove a layer
   * @param {string} layerId - Layer identifier to remove
   * @returns {boolean} Success status
   */
  removeLayer(layerId) {
    if (this.layers[layerId]) {
      delete this.layers[layerId];
      this.layerConfig = this.buildLayerConfig();
      return true;
    }
    return false;
  }

  /**
   * Update layers reference
   * @param {Object} layers - Updated layers object
   */
  updateLayers(layers) {
    this.layers = layers;
    this.layerConfig = this.buildLayerConfig();

    return {
      layers: this.layers,
      layerConfig: this.layerConfig
    };
  }
}
