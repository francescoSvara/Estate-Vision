/**
 * Parcels Layers Manager
 * Centralized management for all parcel layers (group toggle button)
 */

export class ParcelsLayers {
  constructor(parcelLayerInstances = []) {
    this.layerName = 'parcels';
    this.layerInToc = true;
    this.layerColor = '#98c379'; // Updated to Neon Green
    this.parcelLayers = parcelLayerInstances;

    // Sync initial state with individual layers (all parcels start visible)
    this.layerState = this.parcelLayers.every(
      layer => layer && layer.layerState === true
    );
  }

  /**
   * Add the parcels group toggle to sidebar
   */
  async addToMap() {
    try {
      const toggleButton = document.querySelector(
        `[data-group="${this.layerName}"]`
      );
      if (toggleButton) {
        toggleButton.style.display = 'flex';
        toggleButton.style.gap = '0.5rem';
        toggleButton.style.alignItems = 'center';
        toggleButton.style.marginBottom = '0.5rem';

        if (this.layerState) {
          toggleButton.classList.add('active');
        } else {
          toggleButton.classList.remove('active');
        }

        const titleSpan = toggleButton.querySelector('.layer-toggle-title');
        if (titleSpan) {
          titleSpan.textContent = 'All Parcels';
        }

        const iconSpan = toggleButton.querySelector('.layer-toggle-icon');
        if (iconSpan) {
          const icon = this.createIconElement();
          iconSpan.appendChild(icon);
        }
      }
    } catch {
      // TODO(agent): add proper error handling
    }
  }

  /**
   * Set visibility for all parcel layers
   * @param {Map} map - MapLibre GL map instance
   * @param {boolean} visible - Whether the layers should be visible
   */
  setVisibility(map, visible) {
    this.parcelLayers.forEach(layer => {
      if (layer && typeof layer.setVisibility === 'function') {
        layer.setVisibility(map, visible);
      }
    });
  }

  /**
   * Show all parcel layers
   * @param {Map} map - MapLibre GL map instance
   */
  showLayers(map) {
    this.setVisibility(map, true);
  }

  /**
   * Hide all parcel layers
   * @param {Map} map - MapLibre GL map instance
   */
  hideLayers(map) {
    this.setVisibility(map, false);
  }

  /**
   * Check if any parcel layer is visible
   * @param {Map} map - MapLibre GL map instance
   * @returns {boolean} True if any layer is visible
   */
  isVisible(map) {
    return this.parcelLayers.some(layer => {
      if (layer && typeof layer.isVisible === 'function') {
        return layer.isVisible(map);
      }
      return false;
    });
  }

  /**
   * Get the current state
   * @returns {boolean} True if layer group is enabled
   */
  getLayerState() {
    return this.layerState;
  }

  /**
   * Set the layer state and update visibility for all parcel layers
   * @param {boolean} newState - New visibility state
   * @param {Map} map - MapLibre GL map instance
   * @param {LeftSidebar} sidebar - The sidebar instance
   */
  setLayerState(newState, map, sidebar) {
    this.layerState = newState;

    this.parcelLayers.forEach(layer => {
      if (layer && typeof layer.setLayerState === 'function') {
        layer.setLayerState(newState, map, sidebar);
      }
    });

    this.updateButtonState(newState);
  }

  /**
   * Update the group toggle button state
   * @param {boolean} isActive - Whether the button should be active
   */
  updateButtonState(isActive) {
    const toggleButton = document.querySelector(
      `[data-group="${this.layerName}"]`
    );
    if (toggleButton) {
      if (isActive) {
        toggleButton.classList.add('active');
      } else {
        toggleButton.classList.remove('active');
      }
    }
  }

  /**
   * Sync state with individual parcel layers
   * Updates the group button based on whether all individual layers are active
   */
  syncStateFromLayers() {
    const allActive = this.parcelLayers.every(
      layer => layer && layer.layerState === true
    );
    this.layerState = allActive;
    this.updateButtonState(allActive);
  }

  /**
   * Toggle the layer state
   * @param {Map} map - MapLibre GL map instance
   * @param {LeftSidebar} sidebar - The sidebar instance
   */
  toggleLayerState(map, sidebar) {
    this.setLayerState(!this.layerState, map, sidebar);
  }

  /**
   * Update the layer color and refresh the icon
   * @param {string} newColor - New color in hex format (e.g., '#ff0000')
   */
  setLayerColor(newColor) {
    this.layerColor = newColor;

    const toggleButton = document.querySelector(
      `[data-group="${this.layerName}"]`
    );
    if (toggleButton) {
      const iconSpan = toggleButton.querySelector('.layer-toggle-icon');
      if (iconSpan) {
        iconSpan.innerHTML = '';
        const icon = this.createIconElement();
        iconSpan.appendChild(icon);
      }
    }
  }

  /**
   * Get the current layer color
   * @returns {string} Current layer color in hex format
   */
  getLayerColor() {
    return this.layerColor;
  }

  /**
   * Generate SVG icon with current layer color (simple red dot)
   * @returns {string} SVG markup string
   */
  generateSVGIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><circle cx="8" cy="8" r="4" fill="${this.layerColor}"/></svg>`;
  }

  /**
   * Create and style the icon element
   * @returns {HTMLElement} Styled icon element
   */
  createIconElement() {
    const icon = document.createElement('div');
    icon.innerHTML = this.generateSVGIcon();
    icon.style.width = '14px';
    icon.style.height = '14px';
    icon.style.display = 'inline-flex';
    icon.style.alignItems = 'center';
    return icon;
  }

  /**
   * Clear the current parcel highlight
   * @param {Map} map - MapLibre GL map instance
   */
  clearParcelHighlight(map) {
    if (!map) {
      return;
    }

    const highlightLayers = [
      'parcels-m00-highlight',
      'parcels-m01-highlight',
      'parcels-m02-highlight',
      'parcels-m03-highlight',
      'parcels-m04-highlight',
      'parcels-m05-highlight',
      'parcels-m06-highlight',
      'parcels-m07-highlight',
      'parcels-m08-highlight',
      'parcels-m09-highlight',
      'parcels-m10-highlight',
      'parcels-m99-highlight'
    ];

    highlightLayers.forEach(layerId => {
      try {
        if (map.getLayer(layerId)) {
          // Check if we need to use pid_pg_parcels_251001 or pid_pg_parcels_251001
          // Based on the grep results, the layers are using 'pid_pg_parcels_251001'
          map.setFilter(layerId, ['==', ['get', 'pid_pg_parcels_251001'], '']);
        }
      } catch {
        // TODO(agent): silently ignore missing layers
      }
    });
  }

  /**
   * Highlight a parcel by PID
   * @param {Map} map - MapLibre GL map instance
   * @param {number|string} pid - Parcel PID to highlight
   */
  highlightParcelByPid(map, pid) {
    if (!map || !pid) {
      return;
    }

    const highlightLayers = [
      'parcels-m00-highlight',
      'parcels-m01-highlight',
      'parcels-m02-highlight',
      'parcels-m03-highlight',
      'parcels-m04-highlight',
      'parcels-m05-highlight',
      'parcels-m06-highlight',
      'parcels-m07-highlight',
      'parcels-m08-highlight',
      'parcels-m09-highlight',
      'parcels-m10-highlight',
      'parcels-m99-highlight'
    ];

    const pidValue = typeof pid === 'string' ? parseInt(pid, 10) : pid;

    highlightLayers.forEach(layerId => {
      try {
        if (map.getLayer(layerId)) {
          // Check if we need to use pid_pg_parcels_251001 or pid_pg_parcels_251001
          // Based on the grep results, the layers are using 'pid_pg_parcels_251001'
          map.setFilter(layerId, [
            '==',
            ['get', 'pid_pg_parcels_251001'],
            pidValue
          ]);
        }
      } catch {
        // TODO(agent): silently ignore missing layers
      }
    });
  }

  /**
   * Update selected layers with array of PIDs
   * @param {Map} map - MapLibre GL map instance
   * @param {Array<number|string>} pids - Array of parcel PIDs to show as selected
   */
  updateSelectedParcels(map, pids) {
    if (!map) {
      return;
    }

    const selectedLayers = [
      'parcels-m00-selected',
      'parcels-m01-selected',
      'parcels-m02-selected',
      'parcels-m03-selected',
      'parcels-m04-selected',
      'parcels-m05-selected',
      'parcels-m06-selected',
      'parcels-m07-selected',
      'parcels-m08-selected',
      'parcels-m09-selected',
      'parcels-m10-selected',
      'parcels-m99-selected'
    ];

    if (!pids || pids.length === 0) {
      selectedLayers.forEach(layerId => {
        try {
          if (map.getLayer(layerId)) {
            map.setFilter(layerId, [
              '==',
              ['get', 'pid_pg_parcels_251001'],
              ''
            ]);
          }
        } catch {
          // TODO(agent): silently ignore missing layers
        }
      });
      return;
    }

    const pidValues = pids.map(pid =>
      typeof pid === 'string' ? parseInt(pid, 10) : pid
    );

    selectedLayers.forEach(layerId => {
      try {
        if (map.getLayer(layerId)) {
          map.setFilter(layerId, [
            'in',
            ['get', 'pid_pg_parcels_251001'],
            ['literal', pidValues]
          ]);
        }
      } catch {
        // TODO(agent): silently ignore missing layers
      }
    });
  }
}
