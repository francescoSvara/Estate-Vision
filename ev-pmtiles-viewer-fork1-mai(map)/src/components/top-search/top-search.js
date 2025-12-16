/**
 * Top Search Component
 * Floating search bar for the map
 */

import './top-search.css';
import { geocodingApi } from '../../services/api/index.js';
import { mainMapManager } from '../../services/map/main-map-manager.js';
import maplibregl from 'maplibre-gl';

export class TopSearch {
  constructor(onSelectionChange = null) {
    this.element = null;
    this.searchValue = '';
    this.onSelectionChange = onSelectionChange;
    this.debounceTimer = null;
    this.debounceDelay = 300; // 300ms debounce for search
    this.currentMarker = null; // Store reference to current marker
  }

  /**
   * Render the top search component
   * @returns {HTMLElement} The rendered component element
   */
  render() {
    const searchHTML = `
      <div class="top-search-container">
        <div class="top-search-input-wrapper">
          <div class="top-search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input 
            type="text" 
            id="top-search-input" 
            class="top-search-input"
            placeholder="Search address, place..."
            autocomplete="off"
          />
          <button class="top-search-clear" id="top-search-clear" style="display: none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="top-search-results" id="top-search-results" style="display: none;">
          <!-- Search results will be displayed here -->
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = searchHTML;
    this.element = wrapper.firstElementChild;

    this.attachEventListeners();

    return this.element;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (!this.element) return;

    const searchInput = this.element.querySelector('#top-search-input');
    const clearButton = this.element.querySelector('#top-search-clear');

    if (searchInput) {
      // Input event
      searchInput.addEventListener('input', e => {
        const value = e.target.value;
        this.handleSearchInput(value);
        
        // Show/hide clear button
        if (clearButton) {
          clearButton.style.display = value.length > 0 ? 'flex' : 'none';
        }
      });

      // Focus event
      searchInput.addEventListener('focus', () => {
        if (this.searchValue.length > 0) {
          this.showResults();
        }
      });
      
      // Blur event (delayed)
      searchInput.addEventListener('blur', () => {
        setTimeout(() => {
          this.hideResults();
        }, 200);
      });
    }

    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearSearch();
      });
    }

    // Global ESC handler
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.clearMarker();
        this.hideResults();
        // Optional: clear input focus
        const searchInput = this.element.querySelector('#top-search-input');
        if (searchInput && document.activeElement === searchInput) {
            searchInput.blur();
        }
      }
    });
  }

  /**
   * Clear the current map marker
   */
  clearMarker() {
    if (this.currentMarker) {
      this.currentMarker.remove();
      this.currentMarker = null;
    }
  }

  /**
   * Handle search input with debouncing
   * @param {string} value - The search input value
   */
  handleSearchInput(value) {
    this.searchValue = value;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.performSearch(value);
    }, this.debounceDelay);
  }

  /**
   * Perform the actual search
   * @param {string} value - The search value
   */
  async performSearch(value) {
    if (value.trim().length === 0) {
      this.hideResults();
      return;
    }

    try {
      const results = await geocodingApi.searchAddress(value);
      this.updateResults(results);
      this.showResults();
    } catch (error) {
      console.error('Search failed:', error);
      // Optionally show error state
    }
  }

  /**
   * Update search results display
   * @param {Array} results - Array of search results
   */
  updateResults(results) {
    const resultsContainer = this.element.querySelector('#top-search-results');
    if (!resultsContainer) return;

    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
      return;
    }

    const resultsHTML = results.map(result => `
      <div class="top-search-result-item" data-id="${result.id}">
        <div class="result-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="result-text">${result.address}</div>
      </div>
    `).join('');

    resultsContainer.innerHTML = resultsHTML;

    // Attach click handlers
    const items = resultsContainer.querySelectorAll('.top-search-result-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        // Loose comparison because ID might be string/number depending on API
        const result = results.find(r => r.id == id);
        this.handleResultSelection(result);
      });
    });
  }

  /**
   * Handle result selection
   * @param {Object} result - Selected result
   */
  handleResultSelection(result) {
    if (!result) return;
    
    // Save search to history
    this.saveSearchHistory(result);
    
    // Update input value
    const searchInput = this.element.querySelector('#top-search-input');
    if (searchInput) {
      searchInput.value = result.address;
      this.searchValue = result.address;
    }

    // Fly to location
    const map = mainMapManager.getMapInstance();
    if (map) {
      // Remove existing marker if any
      this.clearMarker();

      // Determine coordinates
      let lng, lat;
      if (result.bbox) {
        // Use center of bbox
        lng = (parseFloat(result.bbox[2]) + parseFloat(result.bbox[3])) / 2;
        lat = (parseFloat(result.bbox[0]) + parseFloat(result.bbox[1])) / 2;
      } else {
        lng = parseFloat(result.lon);
        lat = parseFloat(result.lat);
      }

      // Add a red pin (marker)
      this.currentMarker = new maplibregl.Marker({ color: '#ff0000' })
        .setLngLat([lng, lat])
        .addTo(map);

      // Use bbox if available, otherwise fly to point
      if (result.bbox) {
        // Nominatim returns [south, north, west, east]
        // MapLibre expects [west, south, east, north] or [[west, south], [east, north]]
        // result.bbox is [minLat, maxLat, minLon, maxLon]
        const bounds = [
          [result.bbox[2], result.bbox[0]], // [minLon, minLat]
          [result.bbox[3], result.bbox[1]]  // [maxLon, maxLat]
        ];
        
        map.fitBounds(bounds, {
          padding: 100,
          maxZoom: 18,
          duration: 2000
        });
      } else {
        map.flyTo({
          center: [lng, lat],
          zoom: 18, // Zoom in closer to see parcels
          duration: 2000
        });
      }

      // After movement, simulate a single click to select the parcel
      // We use 'once' to ensure it only fires for this specific move
      map.once('moveend', () => {
        // Simulate click at the center coordinates
        const point = map.project([lng, lat]);
        map.fire('click', {
          lngLat: { lng, lat },
          point: point,
          originalEvent: {
              address: result.address
          }
        });
      });
    }

    // Callback
    if (this.onSelectionChange) {
      this.onSelectionChange(result);
    }
    
    // Dispatch event
    const event = new CustomEvent('addressSelected', {
      detail: { address: result },
      bubbles: true
    });
    this.element.dispatchEvent(event);

    this.hideResults();
  }

  /**
   * Show results
   */
  showResults() {
    const resultsContainer = this.element.querySelector('#top-search-results');
    if (resultsContainer) {
      resultsContainer.style.display = 'block';
    }
  }

  /**
   * Hide results
   */
  hideResults() {
    const resultsContainer = this.element.querySelector('#top-search-results');
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
    }
  }

  /**
   * Clear search
   */
  clearSearch() {
    const searchInput = this.element.querySelector('#top-search-input');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    this.searchValue = '';
    
    const clearButton = this.element.querySelector('#top-search-clear');
    if (clearButton) {
      clearButton.style.display = 'none';
    }
    
    this.hideResults();
  }

  /**
   * Save search to history in localStorage
   * @param {Object} result - Search result object
   */
  saveSearchHistory(result) {
    try {
      const searchLog = JSON.parse(localStorage.getItem('search-history') || '[]');
      
      // Create log entry
      const logEntry = {
        query: result.address,
        address: result.address,
        timestamp: new Date().toISOString(),
        coordinates: {
          lat: result.lat,
          lng: result.lon
        }
      };
      
      // Add to beginning of array (most recent first)
      searchLog.unshift(logEntry);
      
      // Keep only last 50 searches
      const trimmedLog = searchLog.slice(0, 50);
      
      localStorage.setItem('search-history', JSON.stringify(trimmedLog));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }
}

