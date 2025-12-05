/**
 * Parcels M99 Layer Configuration
 * Provides PMTiles layer setup for parcels data
 */

import { PMTiles, Protocol } from 'pmtiles';
import maplibregl from 'maplibre-gl';

export class ParcelsM99Layer {
  constructor() {
    this.layerName = 'parcels-m99';
    this.layerState = true; // Default visible state
    this.layerInToc = true; // Include in Table of Contents
    this.layerColor = '#696969'; // Dim gray color for other/miscellaneous areas
    this.pmtilesUrl =
      'https://storage.googleapis.com/space-neural-02/tiles/pmtiles/pg_parcels_251001_m99.pmtile';
    this.sourceLayer = 'default'; // Default source layer, will be updated from metadata
  }

  /**
   * Add the parcels-m99 layer to a MapLibre GL map
   * @param {Map} map - MapLibre GL map instance
   */
  async addToMap(map) {
    try {
      // Add error handling for source
      map.on('sourcedata', e => {
        if (e.sourceId === 'parcels-m99' && e.isSourceLoaded) {
          // _onsole.log('✓ Parcels M99 PMTiles source loaded successfully');
        }
      });

      map.on('error', e => {
        if (e.error && e.error.message.includes('parcels-m99')) {
          console.error('❌ Parcels M99 layer error:', e.error);
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
          titleSpan.textContent = 'ALTRO';
        }

        // Find and setup the icon
        const iconSpan = toggleButton.querySelector('.layer-toggle-icon');
        if (iconSpan) {
          // Create custom SVG icon with dynamic layer color
          const icon = this.createIconElement();
          iconSpan.appendChild(icon);
        }
      }

      // Register PMTiles protocol globally if not already registered
      if (!window.pmtilesProtocolRegistered) {
        const protocol = new Protocol();
        maplibregl.addProtocol('pmtiles', protocol.tile);
        window.pmtilesProtocolRegistered = true;
        // _onsole.log('✓ PMTiles protocol registered globally');
      }

      // Get the layer information to determine the correct source-layer
      const pmtiles = new PMTiles(this.pmtilesUrl);
      const metadata = await pmtiles.getMetadata();
      // _onsole.log('PMTiles metadata:', metadata);

      // Extract source layer from metadata if available
      if (
        metadata &&
        metadata.vector_layers &&
        metadata.vector_layers.length > 0
      ) {
        this.sourceLayer = metadata.vector_layers[0].id;
        // _onsole.log(`✓ Using source layer: ${this.sourceLayer}`);
      } else {
        console.log(`⚠ Using default source layer: ${this.sourceLayer}`);
      }

      // Add the PMTiles source with pmtiles:// protocol
      map.addSource('parcels-m99', {
        type: 'vector',
        url: `pmtiles://${this.pmtilesUrl}`
      });

      // Add the fill layer for parcels polygons with red color
      map.addLayer(
        {
          id: 'parcels-m99-fill',
          type: 'fill',
          source: 'parcels-m99',
          'source-layer': this.sourceLayer,
          minzoom: 14, // change parcels zoom visibility
          paint: {
            'fill-color': this.layerColor,
            'fill-opacity': 0.2
          }
        },
        'place_hamlet'
      );

      // Add the highlight layer for selected parcels (red outline)
      map.addLayer(
        {
          id: 'parcels-m99-highlight',
          type: 'line',
          source: 'parcels-m99',
          'source-layer': this.sourceLayer,
          minzoom: 14,
          paint: {
            'line-color': '#ff0000',
            'line-width': 3,
            'line-opacity': 1
          },
          filter: ['==', ['get', 'pid_parcels_251001'], ''] // Empty filter by default
        },
        'place_hamlet'
      );

      // Add the selected layer for persistent selections (blue outline)
      map.addLayer(
        {
          id: 'parcels-m99-selected',
          type: 'line',
          source: 'parcels-m99',
          'source-layer': this.sourceLayer,
          minzoom: 14,
          paint: {
            'line-color': '#1900ff',
            'line-width': 2,
            'line-opacity': 1
          },
          filter: ['==', ['get', 'pid_pg_parcels_251001'], ''] // Empty filter by default
        },
        'place_hamlet'
      );

      // _onsole.log('✓ Parcels M99 PMTiles layer added successfully');
    } catch (error) {
      console.error('❌ Failed to add parcels-m99 PMTiles layer:', error);
    }
  }

  /**
   * Toggle layer visibility
   * @param {Map} map - MapLibre GL map instance
   * @param {boolean} visible - Whether the layer should be visible
   */
  setVisibility(map, visible) {
    const visibility = visible ? 'visible' : 'none';

    if (map.getLayer('parcels-m99-fill')) {
      map.setLayoutProperty('parcels-m99-fill', 'visibility', visibility);
    }
    if (map.getLayer('parcels-m99-highlight')) {
      map.setLayoutProperty('parcels-m99-highlight', 'visibility', visibility);
    }
    if (map.getLayer('parcels-m99-selected')) {
      map.setLayoutProperty('parcels-m99-selected', 'visibility', visibility);
    }
  }

  /**
   * Show the parcels-m99 layers
   * @param {Map} map - MapLibre GL map instance
   */
  showLayers(map) {
    this.setVisibility(map, true);
  }

  /**
   * Hide the parcels-m99 layers
   * @param {Map} map - MapLibre GL map instance
   */
  hideLayers(map) {
    this.setVisibility(map, false);
  }

  /**
   * Check if the parcels-m99 layers are currently visible
   * @param {Map} map - MapLibre GL map instance
   * @returns {boolean} True if layers are visible
   */
  isVisible(map) {
    const fillLayer = map.getLayer('parcels-m99-fill');
    if (fillLayer) {
      const visibility = map.getLayoutProperty(
        'parcels-m99-fill',
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
    if (map && map.getLayer('parcels-m99-fill')) {
      map.setPaintProperty('parcels-m99-fill', 'fill-color', this.layerColor);
    }
  }

  /**
   * Darken a hex color by a given factor
   * @param {string} color - Hex color (e.g., '#ff0000')
   * @param {number} factor - Factor to darken by (0-1)
   * @returns {string} Darkened hex color
   */
  darkenColor(color, factor) {
    // Remove # if present
    color = color.replace('#', '');

    // Parse RGB values
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    // Darken each component
    const newR = Math.round(r * (1 - factor));
    const newG = Math.round(g * (1 - factor));
    const newB = Math.round(b * (1 - factor));

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Get the current layer color
   * @returns {string} Current layer color in hex format
   */
  getLayerColor() {
    return this.layerColor;
  }

  /**
   * Generate SVG icon with current layer color
   * @returns {string} SVG markup string
   */
  generateSVGIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="${this.layerColor}" d="M13.094 6.516c-.211-.093-.429-.118-.645-.187a1.6 1.6 0 0 1-.502-.263c-.343-.265-.758-.807-.758-1.966c0-1.619-1.19-2.395-2.198-2.747A6.5 6.5 0 0 0 6.963 1c-1.55 0-2.728.437-3.609 1.12c-.873.68-1.42 1.577-1.762 2.447a9 9 0 0 0-.548 2.37c-.227 2.376.257 5.14 2.26 6.661C4.714 14.671 6.595 15 8.5 15c1.734 0 3.345-.28 4.538-1.033c1.23-.777 1.962-2.025 1.962-3.8c0-1.593-.52-2.553-1.108-3.114a2.8 2.8 0 0 0-.8-.537m-9.186 6.286c-1.526-1.16-1.926-3.26-1.907-5.076c.002-.166.01-.405.038-.694c.055-.58.186-1.343.483-2.099c.297-.755.752-1.483 1.446-2.023c1.295-1.007 3.17-1.145 4.693-.613c.854.298 1.528.822 1.528 1.803c0 1.44.537 2.286 1.147 2.757c.564.436 1.34.417 1.867.92c1.467 1.4.92 4.323-.698 5.344c-.96.607-2.348.879-4.004.879c-1.82 0-3.438-.32-4.593-1.198" stroke-width="0.5" stroke="${this.layerColor}"/></svg>`;
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
}
