/**
 * Parcel Blocks Search Component
 * Autocomplete search input for parcel blocks (particella)
 * Enabled when municipality and parcel zone are selected
 */

import './parcel-blocks-search.css';
import {
  searchParcelBlocks,
  formatParcelBlocksForDisplay
} from '../../../services/api/parcel-blocks-api.js';
import { mainMapManager } from '../../../services/map/main-map-manager.js';

export class ParcelBlocksSearch {
  constructor(onSelectionChange = null, parcelsLayersInstance = null) {
    this.element = null;
    this.parcelBlocks = [];
    this.formattedParcelBlocks = [];
    this.selectedParcelBlock = null;
    this.selectedMunicipality = null;
    this.selectedParcelZone = null;
    this.onSelectionChange = onSelectionChange;
    this.parcelsLayers = parcelsLayersInstance;
    this.isLoading = false;
    this.isDisabled = true;
    this.debounceTimer = null;
    this.debounceDelay = 300;
    this.minSearchLength = 1;
    this.currentSearchValue = '';
    this.zoomLevel = 18;
    this.highlightedParcelPid = null;
  }

  /**
   * Enable the search input when municipality and parcel zone are selected
   * @param {Object} municipality - Selected municipality object with inspireid_localid_2
   * @param {Object} parcelZone - Selected parcel zone object with id (inspireid_localid_3)
   */
  enableSearch(municipality, parcelZone) {
    if (!municipality || !parcelZone) {
      console.warn(
        '⚠️ Invalid municipality or parcel zone provided to parcel blocks search'
      );
      this.disableSearch();
      return;
    }

    this.selectedMunicipality = municipality;
    this.selectedParcelZone = parcelZone;
    this.isDisabled = false;
    this.clearResults();

    console.log(
      `🔍 Parcel Blocks Search enabled for: ${municipality.comune} / Zone ${parcelZone.id}`
    );

    // Update UI to enable input
    if (this.element) {
      this.updateContent();
      // Focus the input
      const inputElement = this.element.querySelector('.parcel-blocks-input');
      if (inputElement) {
        inputElement.focus();
      }
    }
  }

  /**
   * Disable the search input and clear data
   */
  disableSearch() {
    this.isDisabled = true;
    this.selectedMunicipality = null;
    this.selectedParcelZone = null;
    this.clearResults();

    if (this.element) {
      this.updateContent();
    }
  }

  /**
   * Clear search results and selection
   */
  clearResults() {
    this.parcelBlocks = [];
    this.formattedParcelBlocks = [];
    this.selectedParcelBlock = null;
    this.currentSearchValue = '';
    this.clearParcelHighlight();

    if (this.element) {
      const inputElement = this.element.querySelector('.parcel-blocks-input');
      if (inputElement) {
        inputElement.value = '';
      }
      this.hideResultsList();
    }
  }

  /**
   * Perform search for parcel blocks
   * @param {string} searchValue - The partial particella value to search for
   */
  async performSearch(searchValue) {
    // Validate search value
    if (!searchValue || searchValue.length < this.minSearchLength) {
      this.clearResults();
      this.hideResultsList();
      return;
    }

    // Validate that we have municipality and parcel zone
    if (!this.selectedMunicipality || !this.selectedParcelZone) {
      console.warn(
        '⚠️ Cannot search: municipality or parcel zone not selected'
      );
      return;
    }

    // Extract inspireid_localid_2 and inspireid_localid_3 from parcel zone
    const inspireidLocalid2 = this.selectedParcelZone.inspireid_localid_2;
    const inspireidLocalid3 = this.selectedParcelZone.inspireid_localid_3;

    this.isLoading = true;
    this.currentSearchValue = searchValue;

    // Update UI to show loading state
    if (this.element) {
      this.updateLoadingState(true);
    }

    // _onsole.log(`🔎 Searching parcel blocks with: ${inspireidLocalid2}/${inspireidLocalid3}/${searchValue}`);

    try {
      // Fetch parcel blocks from the API
      const response = await searchParcelBlocks(
        inspireidLocalid2,
        inspireidLocalid3,
        searchValue
      );

      if (response.success && response.data && response.data.features) {
        this.parcelBlocks = response.data.features;
        this.formattedParcelBlocks = formatParcelBlocksForDisplay(
          response.data
        );

        // _onsole.log(`✅ Found ${this.formattedParcelBlocks.length} parcel blocks matching "${searchValue}"`);

        // Show results list
        if (this.element) {
          this.showResultsList();
        }
      } else {
        console.warn('⚠️ No parcel blocks found or API error:', response.error);
        this.parcelBlocks = [];
        this.formattedParcelBlocks = [];
        this.hideResultsList();
      }
    } catch (error) {
      console.error('❌ Error searching parcel blocks:', error);
      this.parcelBlocks = [];
      this.formattedParcelBlocks = [];
      this.hideResultsList();
    } finally {
      this.isLoading = false;

      // Update UI after loading
      if (this.element) {
        this.updateLoadingState(false);
      }
    }
  }

  /**
   * Handle input change with debouncing
   * @param {string} value - Current input value
   */
  handleInputChange(value) {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer for debounced search
    this.debounceTimer = setTimeout(() => {
      this.performSearch(value);
    }, this.debounceDelay);
  }

  /**
   * Handle selection of a parcel block from results
   * @param {Object} parcelBlock - Selected parcel block object
   */
  selectParcelBlock(parcelBlock) {
    this.selectedParcelBlock = parcelBlock;

    // Update input with selected value
    const inputElement = this.element?.querySelector('.parcel-blocks-input');
    if (inputElement) {
      inputElement.value = parcelBlock.particella;
    }

    // Hide results list
    this.hideResultsList();

    // Zoom to parcel block coordinates if map is available
    this.zoomToParcelBlock(parcelBlock);

    // Call the selection change callback if provided
    if (this.onSelectionChange && parcelBlock) {
      this.onSelectionChange(
        parcelBlock,
        this.selectedParcelZone,
        this.selectedMunicipality
      );
    }

    console.log('📍 Parcel Block selected:', parcelBlock);
  }

  /**
   * Zoom the map to the selected parcel block coordinates
   * @param {Object} parcelBlock - Parcel block object with geometry
   */
  zoomToParcelBlock(parcelBlock) {
    // Get map instance from MainMapManager
    const map = mainMapManager.getMapInstance();
    if (!map) {
      console.warn('⚠️ Map instance not available for zooming');
      return;
    }

    // Find the full feature with geometry from the parcelBlocks array
    const fullFeature = this.parcelBlocks.find(
      feature =>
        feature.properties.particella === parcelBlock.particella &&
        (feature.properties.pid_pg_parcels_251001 === parcelBlock.pid || feature.properties.pid_parcels_251001 === parcelBlock.pid)
    );

    if (
      !fullFeature ||
      !fullFeature.geometry ||
      !fullFeature.geometry.coordinates
    ) {
      console.warn(
        '⚠️ No coordinates found for selected parcel block:',
        parcelBlock
      );
      return;
    }
    // fullFeature
    // {
    //     "type": "Feature",
    //     "properties": {
    //         "pid_parcels_251001": "70154894",
    //         "particella": "1",
    //         "inspireid_localid_2": "H501",
    //         "inspireid_localid_3": "000100"
    //     },
    //     "geometry": {...}
    // }
    const coordinates = fullFeature.geometry.coordinates;
    const [lng, lat] = coordinates;

    // _onsole.log(`🗺️ Zooming to parcel block coordinates: [${lng}, ${lat}] at zoom level ${this.zoomLevel}`);

    // Use flyTo for smooth animation to the coordinates
    try {
      map.flyTo({
        center: [lng, lat],
        zoom: this.zoomLevel,
        essential: true, // This animation is essential with respect to prefers-reduced-motion
        duration: 1500 // Animation duration in milliseconds
      });

      // _onsole.log('✅ Map zoomed to parcel block successfully');
    } catch (error) {
      console.error('❌ Error zooming to parcel block:', error);

      // Fallback to setCenter and setZoom if flyTo fails
      try {
        map.setCenter([lng, lat]);
        map.setZoom(this.zoomLevel);
        // _onsole.log('✅ Map centered on parcel block using fallback method');
      } catch (fallbackError) {
        console.error('❌ Fallback zoom method also failed:', fallbackError);
      }
    }

    // Highlight the parcel with red outline
    this.highlightParcel(fullFeature);

    // Simulate click event on the map to trigger app logic (like sidebar updates, etc.)
    // We only simulate click if we have valid coordinates and map
    if (map && coordinates) {
      // Small timeout to ensure zoom finishes or at least starts
      setTimeout(() => {
        // Create a synthetic point for the click
        const point = map.project(coordinates);
        
        // Fire a click event on the map
        // We include originalEvent to mimic a real mouse event
        map.fire('click', {
          lngLat: { lng: coordinates[0], lat: coordinates[1] },
          point: point,
          originalEvent: {} // Empty object as placeholder
        });
      }, 500); // 500ms delay to let map settle a bit
    }
  }

  /**
   * Generate HTML for search results list
   * @returns {string} HTML string for results
   */
  generateResultsListHTML() {
    if (this.formattedParcelBlocks.length === 0) {
      if (this.currentSearchValue.length >= this.minSearchLength) {
        return '<li class="result-item no-results">No parcel blocks found</li>';
      }
      return '';
    }

    return this.formattedParcelBlocks
      .map(block => {
        return `
          <li class="result-item" data-pid="${block.pid}" data-particella="${block.particella}">
            <span class="particella-number">${block.particella}</span>
            <span class="pid-info">PID: ${block.pid}</span>
          </li>
        `;
      })
      .join('');
  }

  /**
   * Show the results list
   */
  showResultsList() {
    const resultsList = this.element?.querySelector('.results-list');
    if (resultsList) {
      resultsList.innerHTML = this.generateResultsListHTML();
      resultsList.classList.add('visible');
    }
  }

  /**
   * Hide the results list
   */
  hideResultsList() {
    const resultsList = this.element?.querySelector('.results-list');
    if (resultsList) {
      resultsList.classList.remove('visible');
      resultsList.innerHTML = '';
    }
  }

  /**
   * Update loading state in UI
   * @param {boolean} loading - Whether loading or not
   */
  updateLoadingState(loading) {
    const loadingIndicator = this.element?.querySelector('.loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = loading ? 'block' : 'none';
    }
  }

  /**
   * Render the parcel blocks search component
   * @returns {HTMLElement} The rendered component element
   */
  render() {
    if (this.element) {
      this.updateContent();
      return this.element;
    } else {
      const searchHTML = `
        <div class="${this.isDisabled ? 'disabled' : ''}">
          <!--<label for="parcel-blocks-input" class="search-label">
            <span class="label-text">Search Parcel Blocks (Particella)</span>
            <span class="results-count">${this.formattedParcelBlocks.length > 0 ? `(${this.formattedParcelBlocks.length})` : ''}</span>
          </label>-->
          <div class="search-input-wrapper">
            <input
              type="text"
              id="parcel-blocks-input"
              class="parcel-blocks-input"
              placeholder="${this.isDisabled ? '' : 'Search Parcel...'}"
              autocomplete="off"
              ${this.isDisabled ? 'disabled' : ''}
            />
            <span class="loading-indicator" style="display: none;">🔄</span>
          </div>
          <ul class="results-list"></ul>
          <div class="search-info">
            ${
              this.isDisabled
                ? '<small>Please select a municipality and parcel zone first</small>'
                : '<small>Type at least 1 character to search</small>'
            }
          </div>
        </div>
      `;

      const wrapper = document.createElement('div');
      wrapper.innerHTML = searchHTML;
      this.element = wrapper.firstElementChild;

      this.attachEventListeners();
      return this.element;
    }
  }

  /**
   * Update the content of existing element without recreating it
   */
  updateContent() {
    if (!this.element) return;

    // Update disabled state
    this.element.className = `${this.isDisabled ? 'disabled' : ''}`;

    // Update results count
    const countElement = this.element.querySelector('.results-count');
    if (countElement) {
      countElement.textContent =
        this.formattedParcelBlocks.length > 0
          ? `(${this.formattedParcelBlocks.length})`
          : '';
    }

    // Update input disabled state and placeholder
    const inputElement = this.element.querySelector('.parcel-blocks-input');
    if (inputElement) {
      inputElement.disabled = this.isDisabled;
      inputElement.placeholder = this.isDisabled
        ? 'Select parcel zone first'
        : 'Type to search...';
    }

    // Update info text
    const infoElement = this.element.querySelector('.search-info small');
    if (infoElement) {
      infoElement.textContent = this.isDisabled
        ? 'Please select a municipality and parcel zone first'
        : 'Type at least 1 character to search';
    }
  }

  /**
   * Attach event listeners to the search input
   */
  attachEventListeners() {
    if (!this.element) return;

    const inputElement = this.element.querySelector('.parcel-blocks-input');
    if (inputElement) {
      // Input event for autocomplete
      inputElement.addEventListener('input', e => {
        this.handleInputChange(e.target.value);
      });

      // Focus event to show results if available
      inputElement.addEventListener('focus', () => {
        if (this.formattedParcelBlocks.length > 0) {
          this.showResultsList();
        }
      });

      // Clear selection when user starts typing again
      inputElement.addEventListener('keydown', () => {
        this.selectedParcelBlock = null;
      });
    }

    // Event delegation for results list clicks
    const resultsList = this.element.querySelector('.results-list');
    if (resultsList) {
      resultsList.addEventListener('click', e => {
        const resultItem = e.target.closest('.result-item');
        if (resultItem && !resultItem.classList.contains('no-results')) {
          const particella = resultItem.dataset.particella;
          const pid = resultItem.dataset.pid;

          const parcelBlock = this.formattedParcelBlocks.find(
            b => b.particella === particella && b.pid === pid
          );

          if (parcelBlock) {
            this.selectParcelBlock(parcelBlock);
          }
        }
      });
    }

    // Close results list when clicking outside
    document.addEventListener('click', e => {
      if (this.element && !this.element.contains(e.target)) {
        this.hideResultsList();
      }
    });
  }

  /**
   * Highlight a parcel with a red outline
   * @param {Object} fullFeature - Full feature object with properties and geometry
   */
  highlightParcel(fullFeature) {
    if (!fullFeature || !fullFeature.properties) {
      return;
    }
    // We try to get pid from either property name, preferring the one from API
    const pid = fullFeature.properties.pid_pg_parcels_251001 || fullFeature.properties.pid_parcels_251001;

    if (!pid) {
      console.warn('⚠️ Missing PID for highlight');
      return;
    }

    // Clear any existing highlight first
    this.clearParcelHighlight();

    // Use centralized highlight method
    const map = mainMapManager.getMapInstance();
    if (this.parcelsLayers && map) {
      this.parcelsLayers.highlightParcelByPid(map, pid);
      this.highlightedParcelPid = pid;
    }
  }

  /**
   * Clear the current parcel highlight
   */
  clearParcelHighlight() {
    const map = mainMapManager.getMapInstance();
    if (this.parcelsLayers && map) {
      this.parcelsLayers.clearParcelHighlight(map);
      this.highlightedParcelPid = null;
    }
  }

  /**
   * Get the currently selected parcel block
   * @returns {Object|null} Selected parcel block object or null
   */
  getSelectedParcelBlock() {
    return this.selectedParcelBlock;
  }

  /**
   * Get the total count of found parcel blocks
   * @returns {number} Number of parcel blocks
   */
  getParcelBlockCount() {
    return this.formattedParcelBlocks.length;
  }

  /**
   * Check if the search is currently loading
   * @returns {boolean} Loading state
   */
  isLoadingState() {
    return this.isLoading;
  }

  /**
   * Check if the search is currently disabled
   * @returns {boolean} Disabled state
   */
  isDisabledState() {
    return this.isDisabled;
  }
}
