import './map.css';
import {
  fetchMunicipalitiesInBbox,
  formatBoundsForApi
} from '../../services/api/index.js';
import { logMunicipalityApiResponse } from '../../utils/municipality/index.js';

// _onsole.log('🚀 Map component loaded, imports:', {
//  fetchMunicipalitiesInBbox,
//  formatBoundsForApi,
//  logMunicipalityApiResponse
// });

export class MapComponent {
  constructor() {
    // _onsole.log('🏗️ MapComponent constructor called');
    this.element = null;
    this.map = null;
    this.maplibregl = null;
    this.pmtilesLoaded = false;
  }

  render() {
    const mapHTML = `
      <div class="map-component">
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = mapHTML;
    this.element = wrapper.firstElementChild;

    // Initialize the map after the element is created
    this.initializeMap();

    return this.element;
  }

  async initializeMap() {
    // Dynamically import MapLibre GL and PMTiles for better code splitting
    const [maplibreModule, pmtilesModule] = await Promise.all([
      import('maplibre-gl'),
      import('pmtiles')
    ]);

    // Import CSS dynamically
    await import('maplibre-gl/dist/maplibre-gl.css');

    this.maplibregl = maplibreModule.default;
    const { PMTiles, Protocol } = pmtilesModule;

    // Register PMTiles protocol
    const protocol = new Protocol();
    this.maplibregl.addProtocol('pmtiles', protocol.tile);
    this.pmtilesLoaded = true;

    // Wait for the element to be mounted to the DOM
    setTimeout(() => {
      const mapContainer = this.element?.querySelector('#map');
      const loadingIndicator = this.element?.querySelector('.map-loading');

      if (mapContainer && !this.map) {
        this.map = new maplibregl.Map({
          container: 'map',
          style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', // Carto Voyager style
          center: [12.4964, 41.9028], // Rome, Italy coordinates [lng, lat]
          zoom: 10, // Starting zoom level for Rome
          bearing: 0, // Initial bearing (rotation)
          pitch: 0, // Initial pitch (tilt)
          interactive: true, // Disable all default map interactions (pan, zoom, rotate)
          dragPan: true, // Disable panning by dragging
          dragRotate: false, // Disable rotation by dragging
          scrollZoom: true, // Disable zoom with scroll wheel
          boxZoom: false, // Disable zoom with box selection
          doubleClickZoom: false, // Disable zoom on double click
          touchZoomRotate: true, // Disable zoom and rotation with touch gestures
          touchPitch: false, // Disable touch pitch on mobile
          keyboard: false, // Disable keyboard navigation
          pitchWithRotate: false // Disable pitch when rotating
        });

        // Navigation controls are disabled to maintain a static map view
        // this.map.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Hide loading indicator and log when map is ready
        this.map.on('load', () => {
          if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
          }

          // Call bbox municipality API on initial load
          // _onsole.log('🚀 Calling municipality API on map load...');
          this.callBboxMunicipalityAPI();
        });

        // Add event listeners for map movement and zoom end
        this.map.on('moveend', () => {
          this.callBboxMunicipalityAPI();
        });

        this.map.on('zoomend', () => {
          this.callBboxMunicipalityAPI();
        });

        // Handle errors
        this.map.on('error', e => {
          console.error('Map error:', e);
          if (loadingIndicator) {
            loadingIndicator.textContent = 'Failed to load map';
            loadingIndicator.style.color = 'var(--color-red)';
          }
        });
      }
    }, 100);
  }

  // Method to add click event to a layer for popups
  addClickEventToLayer(layerId) {
    if (!this.map) return;

    // Change cursor to pointer when hovering over the layer
    this.map.on('mouseenter', layerId, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    // Change cursor back when leaving the layer
    this.map.on('mouseleave', layerId, () => {
      this.map.getCanvas().style.cursor = '';
    });

    // Add click event
    this.map.on('click', layerId, e => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const coordinates = e.lngLat;
        console.log('Feature clicked:', feature);
        // Create popup content with all feature properties
        const popupContent = this.createPopupContent(feature);

        // Create and show popup
        if (this.maplibregl) {
          new this.maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(this.map);
        }
      }
    });
  }

  // Method to create popup content from feature properties
  createPopupContent(feature) {
    const properties = feature.properties || {};

    if (Object.keys(properties).length === 0) {
      return '<div class="popup-content"><p>No properties available</p></div>';
    }

    let content = '<div class="popup-content">';
    content += '<h3>Feature Properties</h3>';
    content += '<table class="popup-table">';

    // Sort properties alphabetically for better readability
    const sortedProperties = Object.keys(properties).sort();

    sortedProperties.forEach(key => {
      const value = properties[key];
      // Format the value (handle null, undefined, long strings, etc.)
      let displayValue = value;

      if (value === null || value === undefined) {
        displayValue = '<em>null</em>';
      } else if (typeof value === 'string' && value.length > 50) {
        displayValue = value.substring(0, 47) + '...';
      } else if (typeof value === 'object') {
        displayValue = JSON.stringify(value);
      }

      content += '<tr>';
      content += `<td class="popup-key">${key}</td>`;
      content += `<td class="popup-value">${displayValue}</td>`;
      content += '</tr>';
    });

    content += '</table>';
    content += `<div class="popup-footer">Geometry: ${feature.geometry?.type || 'Unknown'}</div>`;
    content += '</div>';

    return content;
  }

  // Method to set map center and zoom (useful for customization)
  setView(center, zoom) {
    if (this.map) {
      this.map.setCenter(center);
      this.map.setZoom(zoom);
    }
  }

  // Method to add a source to the map
  addSource(id, source) {
    if (this.map) {
      this.map.addSource(id, source);
    }
  }

  // Method to add a layer to the map
  addLayer(layer) {
    if (this.map) {
      this.map.addLayer(layer);
    }
  }

  // Method to get the map instance (for advanced usage)
  getMap() {
    return this.map;
  }
}
