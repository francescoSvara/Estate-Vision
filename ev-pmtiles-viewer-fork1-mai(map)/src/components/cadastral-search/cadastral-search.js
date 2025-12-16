import { MunicipalitySelector } from './municipality-selector/municipality-selector.js';
import { ParcelZoneSelector } from './parcel-zone-selector/parcel-zone-selector.js';
import { ParcelBlocksSearch } from './parcel-blocks-search/parcel-blocks-search.js';

export class CadastralSearch {
  constructor(callbacks = {}, layerInstances = null) {
    this.element = null;
    this.sidebarElement = null;
    this.layerInstances = layerInstances;

    // Store callbacks
    this.callbacks = {
      onMunicipalitySelected: callbacks.onMunicipalitySelected || null,
      onParcelZoneSelected: callbacks.onParcelZoneSelected || null,
      onParcelBlockSelected: callbacks.onParcelBlockSelected || null
    };

    // Initialize sub-components
    this.municipalitySelector = new MunicipalitySelector(
      selectedMunicipality => {
        this.onMunicipalitySelected(selectedMunicipality);
      }
    );

    this.parcelZoneSelector = new ParcelZoneSelector(
      (selectedParcelZone, municipality) => {
        this.onParcelZoneSelected(selectedParcelZone, municipality);
      }
    );

    const parcelsLayersInstance = layerInstances?.parcels || null;
    this.parcelBlocksSearch = new ParcelBlocksSearch(
      (selectedParcelBlock, parcelZone, municipality) => {
        this.onParcelBlockSelected(
          selectedParcelBlock,
          parcelZone,
          municipality
        );
      },
      parcelsLayersInstance
    );
  }

  /**
   * Render the cadastral search component structure
   * @returns {HTMLElement} The component element
   */
  render() {
    const cadastralSearchHTML = `
      <div class="cadastral-search">
        <div class="municipality-section" id="cadastral-municipality-section">
          <!-- Municipality selector will be inserted here -->
        </div>
        <div class="parcel-zone-section" id="cadastral-parcel-zone-section">
          <!-- Parcel zone selector will be inserted here -->
        </div>
        <div class="parcel-blocks-section" id="cadastral-parcel-blocks-section">
          <!-- Parcel blocks search will be inserted here -->
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = cadastralSearchHTML;
    this.element = wrapper.firstElementChild;

    return this.element;
  }

  /**
   * Initialize the component by inserting sub-components into their containers
   */
  init() {
    if (!this.element) {
      console.error('CadastralSearch: render() must be called before init()');
      return;
    }

    // Insert this component into the cadastral search container in the sidebar
    if (this.sidebarElement) {
      const container = this.sidebarElement.querySelector(
        '#cadastral-search-container'
      );
      if (container) {
        // Clear existing content and insert this component
        container.innerHTML = '';
        container.appendChild(this.element);
      }
    }

    // Insert sub-components into their internal containers
    this.insertMunicipalitySelector();
    this.insertParcelZoneSelector();
    this.insertParcelBlocksSearch();
  }

  /**
   * Set the sidebar element reference (for event dispatching)
   * @param {HTMLElement} sidebarElement - The sidebar element
   */
  setSidebarElement(sidebarElement) {
    this.sidebarElement = sidebarElement;
  }

  /**
   * Insert the municipality selector into the cadastral search
   */
  insertMunicipalitySelector() {
    const municipalitySection = this.element.querySelector(
      '#cadastral-municipality-section'
    );
    if (municipalitySection && this.municipalitySelector) {
      // Check if selector is already inserted
      const existingSelector = municipalitySection.querySelector(
        '.municipality-selector'
      );
      if (existingSelector) {
        console.log(
          '🔄 Municipality selector already exists, skipping insertion'
        );
        return;
      }

      const selectorElement = this.municipalitySelector.render();
      municipalitySection.appendChild(selectorElement);
    }
  }

  /**
   * Insert the parcel zone selector into the cadastral search
   */
  insertParcelZoneSelector() {
    const parcelZoneSection = this.element.querySelector(
      '#cadastral-parcel-zone-section'
    );
    if (parcelZoneSection && this.parcelZoneSelector) {
      // Check if selector is already inserted
      const existingSelector = parcelZoneSection.querySelector(
        '.parcel-zone-selector'
      );
      if (existingSelector) {
        console.log(
          '🔄 Parcel zone selector already exists, skipping insertion'
        );
        return;
      }

      const selectorElement = this.parcelZoneSelector.render();
      parcelZoneSection.appendChild(selectorElement);
    }
  }

  /**
   * Insert the parcel blocks search into the cadastral search
   */
  insertParcelBlocksSearch() {
    const parcelBlocksSection = this.element.querySelector(
      '#cadastral-parcel-blocks-section'
    );
    if (parcelBlocksSection && this.parcelBlocksSearch) {
      // Check if search is already inserted
      const existingSearch = parcelBlocksSection.querySelector(
        '.parcel-blocks-search'
      );
      if (existingSearch) {
        console.log(
          '🔄 Parcel blocks search already exists, skipping insertion'
        );
        return;
      }

      const searchElement = this.parcelBlocksSearch.render();
      parcelBlocksSection.appendChild(searchElement);
    }
  }

  /**
   * Handle municipality selection
   * @param {Object} municipality - Selected municipality object (or null to reset)
   */
  onMunicipalitySelected(municipality) {
    if (!municipality) {
      // Reset parcel zone selector and parcel blocks search
      console.log('🧹 Resetting parcel zone and blocks search');

      if (this.parcelZoneSelector) {
        this.parcelZoneSelector.clearParcelZones();
      }

      if (this.parcelBlocksSearch) {
        this.parcelBlocksSearch.disableSearch();
      }

      // Call external callback if provided
      if (this.callbacks.onMunicipalitySelected) {
        this.callbacks.onMunicipalitySelected(municipality);
      }

      return;
    }

    console.log('🏛️ Municipality selected in cadastral search:', municipality);

    // Update parcel zone selector with new municipality
    if (this.parcelZoneSelector) {
      this.parcelZoneSelector.updateParcelZonesForMunicipality(municipality);
    }

    // Call external callback if provided
    if (this.callbacks.onMunicipalitySelected) {
      this.callbacks.onMunicipalitySelected(municipality);
    }

    // Emit custom event for other components to listen to
    if (this.sidebarElement) {
      const event = new CustomEvent('municipalitySelected', {
        detail: { municipality },
        bubbles: true
      });
      this.sidebarElement.dispatchEvent(event);
    }
  }

  /**
   * Handle parcel zone selection
   * @param {Object} parcelZone - Selected parcel zone object
   * @param {Object} municipality - Municipality object
   */
  onParcelZoneSelected(parcelZone, municipality) {
    console.log(
      '🏠 Parcel Zone selected in cadastral search:',
      parcelZone,
      'for municipality:',
      municipality
    );

    // Enable parcel blocks search when parcel zone is selected
    if (this.parcelBlocksSearch) {
      this.parcelBlocksSearch.enableSearch(municipality, parcelZone);
    }

    // Call external callback if provided
    if (this.callbacks.onParcelZoneSelected) {
      this.callbacks.onParcelZoneSelected(parcelZone, municipality);
    }

    // Emit custom event for other components to listen to
    if (this.sidebarElement) {
      const event = new CustomEvent('parcelZoneSelected', {
        detail: { parcelZone, municipality },
        bubbles: true
      });
      this.sidebarElement.dispatchEvent(event);
    }
  }

  /**
   * Handle parcel block selection
   * @param {Object} parcelBlock - Selected parcel block object
   * @param {Object} parcelZone - Parcel zone object
   * @param {Object} municipality - Municipality object
   */
  onParcelBlockSelected(parcelBlock, parcelZone, municipality) {
    console.log(
      '📍 Parcel Block selected in cadastral search:',
      parcelBlock,
      'Zone:',
      parcelZone,
      'Municipality:',
      municipality
    );

    // Call external callback if provided
    if (this.callbacks.onParcelBlockSelected) {
      this.callbacks.onParcelBlockSelected(
        parcelBlock,
        parcelZone,
        municipality
      );
    }

    // Emit custom event for other components to listen to
    if (this.sidebarElement) {
      const event = new CustomEvent('parcelBlockSelected', {
        detail: { parcelBlock, parcelZone, municipality },
        bubbles: true
      });
      this.sidebarElement.dispatchEvent(event);
    }
  }

  /**
   * Update municipalities in the selector
   * @param {Array} municipalities - Array of municipality objects from API
   */
  updateMunicipalities(municipalities) {
    if (this.municipalitySelector) {
      this.municipalitySelector.updateMunicipalities(municipalities);
    }
  }

  /**
   * Get the municipality selector instance
   * @returns {MunicipalitySelector} The municipality selector component
   */
  getMunicipalitySelector() {
    return this.municipalitySelector;
  }

  /**
   * Get the parcel zone selector instance
   * @returns {ParcelZoneSelector} The parcel zone selector component
   */
  getParcelZoneSelector() {
    return this.parcelZoneSelector;
  }

  /**
   * Get the parcel blocks search instance
   * @returns {ParcelBlocksSearch} The parcel blocks search component
   */
  getParcelBlocksSearch() {
    return this.parcelBlocksSearch;
  }

  /**
   * Update layer instances
   * @param {Object} layerInstances - Layer instances object
   */
  updateLayerInstances(layerInstances) {
    this.layerInstances = layerInstances;

    // Update parcel blocks search with new layer instances
    if (this.parcelBlocksSearch && layerInstances?.parcels) {
      this.parcelBlocksSearch.parcelsLayers = layerInstances.parcels;
    }
  }
}
