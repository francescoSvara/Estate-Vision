/**
 * Inventario Assets Layer Configuration
 * Provides MVT layer setup for Italian asset inventory data from API
 */

export class InventarioAssetsLayer {
  constructor() {
    this.layerName = 'inventario-assets';
    this.layerState = true; // Default visible state
    this.layerInToc = true; // Include in Table of Contents
    this.layerColor = '#007cbf'; // Blue color for assets
    this.apiBaseUrl =
      import.meta.env.VITE_X_API_URL ||
      'https://vm-neural-01.duckdns.org/ev-api';
    this.apiKey = import.meta.env.VITE_X_API_KEY || '';
    this.sourceLayer = 'pt_inventario_assets_251010';
  }

  /**
   * Add the inventario-assets layer to a MapLibre GL map
   * @param {Map} map - MapLibre GL map instance
   */
  async addToMap(map) {
    try {
      // Add error handling for source
      map.on('sourcedata', e => {
        if (e.sourceId === 'inventario-assets' && e.isSourceLoaded) {
          // _onsole.log('✓ Inventario Assets MVT source loaded successfully');
        }
      });

      map.on('error', e => {
        if (e.error && e.error.message.includes('inventario-assets')) {
          console.error('❌ Inventario Assets layer error:', e.error);
        }
      });

      // Generate UI toggle button for this layer
      const toggleButton = document.querySelector(
        `[data-layer="${this.layerName}"]`
      );
      if (toggleButton) {
        toggleButton.style.display = 'flex';
        toggleButton.style.gap = '0.5rem';
        toggleButton.style.alignItems = 'center';
        toggleButton.style.marginBottom = '0.5rem';

        // Initialize button state to match layer state
        if (this.layerState) {
          toggleButton.classList.add('active');
        } else {
          toggleButton.classList.remove('active');
        }

        // Find and setup the title
        const titleSpan = toggleButton.querySelector('.layer-toggle-title');
        if (titleSpan) {
          titleSpan.textContent = 'Assets';
        }

        // Find and setup the icon
        const iconSpan = toggleButton.querySelector('.layer-toggle-icon');
        if (iconSpan) {
          // Create custom SVG icon with dynamic layer color
          const icon = this.createIconElement();
          iconSpan.appendChild(icon);
        }
      }

      // Add the MVT source with API endpoint
      const mvtUrl = `${this.apiBaseUrl}/inventario_assets/mvt/{z}/{x}/{y}.pbf`;
      const urlWithApiKey = this.apiKey
        ? `${mvtUrl}?apikey=${this.apiKey}`
        : mvtUrl;

      map.addSource('inventario-assets', {
        type: 'vector',
        tiles: [urlWithApiKey],
        minzoom: 0,
        maxzoom: 18
      });

      // Add the circle layer for asset points
      map.addLayer(
        {
          id: 'inventario-assets-points',
          type: 'circle',
          source: 'inventario-assets',
          'source-layer': this.sourceLayer,
          layout: {
            visibility: this.layerState ? 'visible' : 'none'
          },
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8,
              3, // At zoom 8, radius 3px
              12,
              6, // At zoom 12, radius 6px
              16,
              10 // At zoom 16, radius 10px
            ],
            'circle-color': this.layerColor,
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-opacity': 0.9
          }
        },
        'place_hamlet'
      );

      // Add hover effect
      map.on('mouseenter', 'inventario-assets-points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'inventario-assets-points', () => {
        map.getCanvas().style.cursor = '';
      });

      // _onsole.log('✓ Inventario Assets MVT layer added successfully');
    } catch (error) {
      console.error('❌ Failed to add inventario-assets MVT layer:', error);
    }
  }

  /**
   * Toggle layer visibility
   * @param {Map} map - MapLibre GL map instance
   * @param {boolean} visible - Whether the layer should be visible
   */
  setVisibility(map, visible) {
    const visibility = visible ? 'visible' : 'none';

    if (map.getLayer('inventario-assets-points')) {
      map.setLayoutProperty(
        'inventario-assets-points',
        'visibility',
        visibility
      );
    }
  }

  /**
   * Show the inventario-assets layers
   * @param {Map} map - MapLibre GL map instance
   */
  showLayers(map) {
    this.setVisibility(map, true);
  }

  /**
   * Hide the inventario-assets layers
   * @param {Map} map - MapLibre GL map instance
   */
  hideLayers(map) {
    this.setVisibility(map, false);
  }

  /**
   * Check if the inventario-assets layers are currently visible
   * @param {Map} map - MapLibre GL map instance
   * @returns {boolean} True if layers are visible
   */
  isVisible(map) {
    const pointsLayer = map.getLayer('inventario-assets-points');
    if (pointsLayer) {
      const visibility = map.getLayoutProperty(
        'inventario-assets-points',
        'visibility'
      );
      return visibility !== 'none';
    }
    return false;
  }

  /**
   * Get the current state from the sidebar's layerStates
   * @param {LeftSidebar} sidebar - The sidebar instance
   * @returns {boolean} True if layer is enabled in sidebar
   */
  getLayerState(sidebar) {
    return this.layerState;
  }

  /**
   * Set the layer state and update visibility
   * @param {boolean} newState - New visibility state
   * @param {Map} map - MapLibre GL map instance
   * @param {LeftSidebar} sidebar - The sidebar instance
   */
  setLayerState(newState, map, sidebar) {
    this.layerState = newState;
    this.setVisibility(map, newState);
    if (sidebar) {
      sidebar.updateLayerToggleButton(this.layerName, newState);
    }
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
   * @param {Map} map - MapLibre GL map instance (optional, for future use)
   */
  setLayerColor(newColor, map = null) {
    this.layerColor = newColor;

    // Update the icon if it exists
    const toggleButton = document.querySelector(
      `[data-layer="${this.layerName}"]`
    );
    if (toggleButton) {
      const iconSpan = toggleButton.querySelector('.layer-toggle-icon');
      if (iconSpan) {
        // Clear existing icon
        iconSpan.innerHTML = '';

        // Create new icon with updated color
        const icon = this.createIconElement();
        iconSpan.appendChild(icon);
      }
    }

    // Update map layer colors if map is provided
    if (map && map.getLayer('inventario-assets-points')) {
      map.setPaintProperty(
        'inventario-assets-points',
        'circle-color',
        this.layerColor
      );
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
   * Generate SVG icon with current layer color (circle icon for points)
   * @returns {string} SVG markup string
   */
  generateSVGIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="${this.layerColor}" stroke="#ffffff" stroke-width="2" opacity="0.8"/><circle cx="8" cy="8" r="2" fill="#ffffff" opacity="0.9"/></svg>`;
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
   * Get popup content for a clicked feature
   * @param {Object} feature - MapLibre feature object
   * @returns {Object|null} Popup content object or null
   */
  getPopupContent(feature) {
    if (!feature || !feature.properties) {
      return null;
    }

    const props = feature.properties;

    return {
      title: 'Asset Information',
      content: `
        <div class="popup-content">
          <div class="popup-section">
            <h4>Address</h4>
            <p><strong>Street:</strong> ${props.indirizzo || 'N/A'}</p>
            <p><strong>Municipality:</strong> ${props.comune || 'N/A'}</p>
            <p><strong>Province:</strong> ${props.provincia || 'N/A'}</p>
            <p><strong>Region:</strong> ${props.regione || 'N/A'}</p>
          </div>
          <div class="popup-section">
            <h4>Location</h4>
            <p><strong>Coordinates:</strong> ${props.latitude?.toFixed(6) || 'N/A'}, ${props.longitude?.toFixed(6) || 'N/A'}</p>
            <p><strong>Asset ID:</strong> ${props.pid || 'N/A'}</p>
          </div>
        </div>
      `,
      coordinates: feature.geometry ? feature.geometry.coordinates : null
    };
  }
}
