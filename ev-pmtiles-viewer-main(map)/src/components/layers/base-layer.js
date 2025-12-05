/**
 * Base layer class for EV Dashboard
 */

export class BaseLayer {
  constructor(id, name, options = {}) {
    this.id = id;
    this.name = name;
    this.isVisible = false;
    this.options = {
      layerInToc: true, // Show in table of contents (sidebar)
      ...options
    };
  }

  /**
   * Add layer to map - to be implemented by subclasses
   */
  async addToMap(map) {
    throw new Error('addToMap method must be implemented by subclass');
  }

  /**
   * Show layer on map
   */
  showLayers(map) {
    if (map && map.getLayer && map.getLayer(this.id)) {
      map.setLayoutProperty(this.id, 'visibility', 'visible');
      this.isVisible = true;
    }
  }

  /**
   * Hide layer on map
   */
  hideLayers(map) {
    if (map && map.getLayer && map.getLayer(this.id)) {
      map.setLayoutProperty(this.id, 'visibility', 'none');
      this.isVisible = false;
    }
  }

  /**
   * Toggle layer visibility
   */
  toggleLayerState(map, sidebar = null) {
    if (this.isVisible) {
      this.hideLayers(map);
    } else {
      this.showLayers(map);
    }

    // Update sidebar button state if provided
    if (sidebar && sidebar.updateLayerToggleButton) {
      sidebar.updateLayerToggleButton(this.id, this.isVisible);
    }

    console.log(`Layer '${this.name}' ${this.isVisible ? 'shown' : 'hidden'}`);
  }

  /**
   * Check if layer exists in map
   */
  existsInMap(map) {
    return map && map.getLayer && map.getLayer(this.id) !== undefined;
  }

  /**
   * Remove layer from map
   */
  removeFromMap(map) {
    if (this.existsInMap(map)) {
      map.removeLayer(this.id);

      // Also remove source if it exists and no other layers use it
      if (map.getSource(this.id)) {
        map.removeSource(this.id);
      }
    }
  }

  // Getters for layer properties (for backward compatibility)
  get layerName() {
    return this.name;
  }

  get layerInToc() {
    return this.options.layerInToc;
  }
}
