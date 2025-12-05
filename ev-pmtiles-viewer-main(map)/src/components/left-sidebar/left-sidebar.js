import './left-sidebar.css';
import { useTranslation } from '../../i18n/hooks/useTranslation.js';
import { MunicipalitySelector } from '../cadastral-search/municipality-selector/municipality-selector.js';
import { ParcelZoneSelector } from '../cadastral-search/parcel-zone-selector/parcel-zone-selector.js';
import { ParcelBlocksSearch } from '../cadastral-search/parcel-blocks-search/parcel-blocks-search.js';
import { AddressSearch } from '../addresses-search/address-search/address-search.js';

export class LeftSidebar {
  constructor(layerConfig = [], mapInstance = null, layerInstances = null) {
    this.element = null;
    this.layerCallbacks = {};
    this.translation = useTranslation();
    this.map = mapInstance;
    this.layerInstances = layerInstances;

    this.searchMode = 'cadastral';

    this.addressSearch = new AddressSearch(selectedAddress => {
      this.onAddressSelected(selectedAddress);
    });

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
      mapInstance,
      parcelsLayersInstance
    );

    // Store layer configuration and group layers
    this.layers = layerConfig.map(config => ({
      id: config.id,
      title: config.title || config.layerName || config.id
    }));

    // Group layers by type
    this.layerGroups = this.groupLayers(this.layers);

    // Track accordion states
    this.accordionStates = {
      parcels: false // Start collapsed
    };
  }

  /**
   * Group layers by type (parcels vs others)
   * @param {Array} layers - Array of layer objects
   * @returns {Object} Grouped layers
   */
  groupLayers(layers) {
    const groups = {
      parcels: [],
      others: []
    };

    layers.forEach(layer => {
      if (layer.id.startsWith('parcels-')) {
        groups.parcels.push(layer);
      } else {
        groups.others.push(layer);
      }
    });

    return groups;
  }

  /**
   * Generate HTML for a toggle button (layer or group toggle)
   * @param {object} config - Configuration object
   * @param {string} config.type - 'layer' or 'group'
   * @param {string} config.id - Layer ID or group key
   * @param {string} config.title - Display title
   * @returns {string} HTML string for the toggle button
   */
  generateToggleButtonHTML({ type, id, title }) {
    const dataAttr =
      type === 'layer' ? `data-layer="${id}"` : `data-group="${id}"`;
    const typeClass = type === 'group' ? 'toggle-all-parcels' : '';

    return `
      <button type="button" class="layer-toggle btn-left ${typeClass}" ${dataAttr}>
        <span class="layer-toggle-icon"></span>
        <span class="layer-toggle-title">${title}</span>
      </button>`;
  }

  /**
   * Generate HTML for all layer toggles
   * @returns {string} HTML string for all toggles
   */
  generateLayerToggles() {
    if (this.layers.length === 0) {
      return `
        <div class="no-layers-message">
          <p style="color: var(--text-comment); font-style: italic; text-align: center; padding: 1rem;">
            No layers configured.<br>
            Edit <code>src/layers-config.js</code> to add PMTiles layers.
          </p>
        </div>
      `;
    }

    const { t } = this.translation;
    let html = '';

    const layer1 = this.layerGroups.others.find(
      layer => layer.id == 'inventario-assets'
    );
    if (layer1) {
      html += this.generateToggleButtonHTML({
        type: 'layer',
        id: layer1.id,
        title: layer1.title
      });
    }

    // Generate toggle all parcels button if there are parcel layers
    if (this.layerGroups.parcels.length > 0) {
      html += this.generateToggleButtonHTML({
        type: 'group',
        id: 'parcels',
        title: t('sidebar.left.toggleAllParcels')
      });
    }

    return html;
  }

  render() {
    const { t } = this.translation;
    const sidebarHTML = `
      <div class="left-sidebar">
        <header class="sidebar-header">
          <h1 class="sidebar-title">${t('sidebar.left.title')}</h1>
          <p class="sidebar-subtitle">${t('sidebar.left.subtitle')}</p>
        </header>
        
        <main class="sidebar-body">
          <div class="search-mode-section">
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" name="search-mode" value="cadastral" ${this.searchMode === 'cadastral' ? 'checked' : ''}>
                <span style="color: var(--text-primary);">${t('sidebar.left.searchForCadastral')}</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="search-mode" value="addresses" ${this.searchMode === 'addresses' ? 'checked' : ''}>
                <span style="color: var(--text-primary);">${t('sidebar.left.searchForAddresses')}</span>
              </label>
            </div>
          </div>
          
          <div class="address-search-section" id="address-search-section" style="display: none;">
            <!-- Address search will be inserted here -->
          </div>
          
          <div class="cadastral-search-section" 
            id="cadastral-search-section">
            <div class="municipality-section" id="municipality-section">
              <!-- Municipality selector will be inserted here -->
            </div>
            <div class="parcel-zone-section" id="parcel-zone-section">
              <!-- Parcel zone selector will be inserted here -->
            </div>
            <div class="parcel-blocks-section" id="parcel-blocks-section">
              <!-- Parcel blocks search will be inserted here -->
            </div>
          </div>
          
          <div class="layer-controls">
            <h2 class="section-title">${t('sidebar.left.dataLayers')}</h2>
            ${this.generateLayerToggles()}
          </div>
        </main>
        
        <footer class="sidebar-footer">
          <div class="app-info">
            <span class="version">v1.0.0</span>
          </div>
        </footer>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = sidebarHTML;
    this.element = wrapper.firstElementChild;

    // Insert address search
    this.insertAddressSearch();

    // Insert municipality selector
    this.insertMunicipalitySelector();

    // Insert parcel zone selector
    this.insertParcelZoneSelector();

    // Insert parcel blocks search
    this.insertParcelBlocksSearch();

    // Initialize button states to match layer states
    this.initializeButtonStates();

    // Attach event listeners for layer toggles
    this.attachEventListeners();

    // Setup language change listener
    this.setupLanguageListener();

    return this.element;
  }

  /**
   * Add a new layer to the sidebar
   * @param {string} layerId - The layer identifier
   * @param {string} title - Display title for the layer
   */
  addLayer(layerId, title = null) {
    const existingLayer = this.layers.find(layer => layer.id === layerId);
    if (!existingLayer) {
      this.layers.push({ id: layerId, title: title || layerId });
      // Re-group layers after adding
      this.layerGroups = this.groupLayers(this.layers);
    }
  }

  attachEventListeners() {
    if (!this.element) return;

    // Attach event listeners for search mode radio buttons
    const searchModeRadios = this.element.querySelectorAll(
      'input[name="search-mode"]'
    );
    searchModeRadios.forEach(radio => {
      radio.addEventListener('change', e => {
        this.handleSearchModeChange(e.target.value);
      });
    });

    // Add hover effects for radio options
    const radioOptions = this.element.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
      option.addEventListener('mouseenter', () => {
        option.style.background = 'var(--bg-hover, rgba(255, 255, 255, 0.05))';
      });
      option.addEventListener('mouseleave', () => {
        option.style.background = 'transparent';
      });
    });

    // Toggle all parcels button event listener
    const toggleAllParcelsButton = this.element.querySelector(
      '.toggle-all-parcels'
    );
    if (toggleAllParcelsButton) {
      toggleAllParcelsButton.addEventListener('click', e => {
        e.preventDefault();
        const groupKey = toggleAllParcelsButton.dataset.group;
        this.toggleAllLayersInGroup(groupKey);
      });
    }

    // Individual layer toggle event listeners (excluding toggle-all-parcels)
    const layerToggleButtons = this.element.querySelectorAll(
      '.layer-toggle:not(.toggle-all-parcels)'
    );
    layerToggleButtons.forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();
        const layerName = e.currentTarget.dataset.layer;
        this.toggleLayer(layerName);
      });
    });
  }

  toggleLayer(layerName) {
    // Call the registered callback for this layer
    if (this.layerCallbacks[layerName]) {
      this.layerCallbacks[layerName]();
    }

    // _onsole.log(`Layer '${layerName}' toggled`);
  }

  /**
   * Toggle all layers in a group
   * @param {string} groupKey - The group key ('parcels', etc.)
   */
  toggleAllLayersInGroup(groupKey) {
    const group = this.layerGroups[groupKey];
    if (!group) return;

    // Toggle the group layer manager (e.g., 'parcels') if it has a callback
    // This will handle toggling all individual layers internally
    if (this.layerCallbacks[groupKey]) {
      this.layerCallbacks[groupKey]();
      return; // Let the group manager handle everything
    }

    // Fallback: if no group manager exists, toggle individual layers
    // Check if any layers in the group are currently active
    const activeLayersInGroup = group.filter(layer => {
      const toggleButton = this.element.querySelector(
        `[data-layer="${layer.id}"]`
      );
      return toggleButton && toggleButton.classList.contains('active');
    });

    const shouldActivate = activeLayersInGroup.length === 0;

    // Toggle all layers in the group
    group.forEach(layer => {
      const toggleButton = this.element.querySelector(
        `[data-layer="${layer.id}"]`
      );
      const isCurrentlyActive =
        toggleButton && toggleButton.classList.contains('active');

      // Only toggle if the current state doesn't match the target state
      if (shouldActivate && !isCurrentlyActive) {
        this.toggleLayer(layer.id);
      } else if (!shouldActivate && isCurrentlyActive) {
        this.toggleLayer(layer.id);
      }
    });

    // Update toggle-all button visual state
    this.updateToggleButtonState(
      `.toggle-all-parcels[data-group="${groupKey}"]`,
      shouldActivate
    );
  }

  /**
   * Handle search mode change
   * @param {string} mode - The selected search mode ('addresses' or 'cadastral')
   */
  handleSearchModeChange(mode) {
    this.searchMode = mode;

    // Emit custom event for other components to listen to
    if (this.element) {
      const event = new CustomEvent('searchModeChanged', {
        detail: { mode },
        bubbles: true
      });
      this.element.dispatchEvent(event);
    }

    // Show/hide appropriate search components
    const addressSearchSection = this.element.querySelector(
      '#address-search-section'
    );
    const cadastralSearchSection = this.element.querySelector(
      '#cadastral-search-section'
    );

    if (mode === 'addresses') {
      // Show address search components
      if (addressSearchSection) addressSearchSection.style.display = 'block';
      // Hide cadastral search components
      if (cadastralSearchSection) cadastralSearchSection.style.display = 'none';
    } else {
      // Show cadastral search components
      if (cadastralSearchSection)
        cadastralSearchSection.style.display = 'block';
      // Hide address search components
      if (addressSearchSection) addressSearchSection.style.display = 'none';
    }
  }

  /**
   * Get the current search mode
   * @returns {string} The current search mode ('addresses' or 'cadastral')
   */
  getSearchMode() {
    return this.searchMode;
  }

  // Method to register layer toggle callbacks
  registerLayerCallback(layerName, callback) {
    this.layerCallbacks[layerName] = callback;
  }

  /**
   * Update toggle button visual state
   * @param {string} selector - CSS selector for the button
   * @param {boolean} isActive - Whether the button should be active
   */
  updateToggleButtonState(selector, isActive) {
    const toggleButton = this.element.querySelector(selector);

    if (toggleButton) {
      if (isActive) {
        toggleButton.classList.add('active');
      } else {
        toggleButton.classList.remove('active');
      }
    }
  }

  updateLayerToggleButton(layerName, isVisible) {
    this.updateToggleButtonState(`[data-layer="${layerName}"]`, isVisible);

    // Update toggle-all button state if this is a parcel layer
    const isParcelLayer = layerName.startsWith('parcels-');
    if (isParcelLayer) {
      this.updateToggleAllButtonStateFromLayers('parcels');
    }
  }

  /**
   * Update toggle-all button state based on individual layer states
   * @param {string} groupKey - The group key
   */
  updateToggleAllButtonStateFromLayers(groupKey) {
    const group = this.layerGroups[groupKey];
    if (!group) return;

    const activeCount = group.filter(layer => {
      const toggleButton = this.element.querySelector(
        `[data-layer="${layer.id}"]`
      );
      return toggleButton && toggleButton.classList.contains('active');
    }).length;

    const isAllActive = activeCount === group.length && group.length > 0;
    this.updateToggleButtonState(
      `.toggle-all-parcels[data-group="${groupKey}"]`,
      isAllActive
    );
  }

  initializeButtonStates() {
    // Button states will be managed by individual layer components
  }

  setupLanguageListener() {
    // Subscribe to language changes and re-render when language changes
    this.languageUnsubscribe = this.translation.onLanguageChange(() => {
      this.reRenderWithTranslations();
    });

    // Also listen for initial translation loading if not loaded yet
    if (!this.translation.translationsLoaded()) {
      this.translation.waitForTranslations().then(() => {
        this.reRenderWithTranslations();
      });
    }
  }

  reRenderWithTranslations() {
    if (this.element && this.element.parentNode) {
      const parent = this.element.parentNode;

      // Store current state before re-rendering
      const currentStates = {};
      this.layers.forEach(layer => {
        const button = this.element.querySelector(`[data-layer="${layer.id}"]`);
        if (button) {
          currentStates[layer.id] = button.classList.contains('active');
        }
      });

      // Store current accordion states
      const currentAccordionStates = { ...this.accordionStates };

      // Store current municipalities and parcels
      const currentMunicipalities = this.municipalitySelector
        ? this.municipalitySelector.municipalities
        : [];
      const currentSelectedMunicipality = this.municipalitySelector
        ? this.municipalitySelector.getSelectedMunicipality()
        : null;

      // Re-render the sidebar
      const oldElement = this.element;
      this.element = null;

      const newElement = this.render();
      oldElement.parentNode.replaceChild(newElement, oldElement);

      // Restore accordion states
      this.accordionStates = currentAccordionStates;
      Object.keys(this.accordionStates).forEach(groupKey => {
        if (this.accordionStates[groupKey]) {
          const content = this.element.querySelector(
            `[data-group-content="${groupKey}"]`
          );
          const icon = this.element.querySelector(
            `[data-accordion-toggle="${groupKey}"] .accordion-icon`
          );
          if (content && icon) {
            content.classList.add('visible');
            icon.classList.add('expanded');
          }
        }
      });

      // Restore municipalities
      if (this.municipalitySelector && currentMunicipalities.length > 0) {
        this.municipalitySelector.updateMunicipalities(currentMunicipalities);
      }

      // Restore selected municipality and parcel zones if any
      if (currentSelectedMunicipality && this.parcelZoneSelector) {
        this.parcelZoneSelector.updateParcelZonesForMunicipality(
          currentSelectedMunicipality
        );
      }

      // Restore layer states
      Object.keys(currentStates).forEach(layerId => {
        this.updateLayerToggleButton(layerId, currentStates[layerId]);
      });
    }
  }

  /**
   * Insert the address search into the sidebar
   */
  insertAddressSearch() {
    const addressSearchSection = this.element.querySelector(
      '#address-search-section'
    );
    if (addressSearchSection && this.addressSearch) {
      // Check if search is already inserted
      const existingSearch =
        addressSearchSection.querySelector('.address-search');
      if (existingSearch) {
        console.warn('🔄 Address search already exists, skipping insertion');
        return;
      }

      const searchElement = this.addressSearch.render();
      addressSearchSection.appendChild(searchElement);
      // _onsole.log('✅ Address search inserted successfully');
    }
  }

  /**
   * Handle address selection
   * @param {Object} address - Selected address object
   */
  onAddressSelected(address) {
    // Emit custom event for other components to listen to
    if (this.element) {
      const event = new CustomEvent('addressSelected', {
        detail: { address },
        bubbles: true
      });
      this.element.dispatchEvent(event);
    }
  }

  /**
   * Insert the municipality selector into the sidebar
   */
  insertMunicipalitySelector() {
    const municipalitySection = this.element.querySelector(
      '#municipality-section'
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
      // _onsole.log('✅ Municipality selector inserted successfully');
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

      return;
    }

    console.log('🏛️ Municipality selected in sidebar:', municipality);

    // Update parcel zone selector with new municipality
    if (this.parcelZoneSelector) {
      this.parcelZoneSelector.updateParcelZonesForMunicipality(municipality);
    }

    // Emit custom event for other components to listen to
    if (this.element) {
      const event = new CustomEvent('municipalitySelected', {
        detail: { municipality },
        bubbles: true
      });
      this.element.dispatchEvent(event);
    }
  }

  /**
   * Insert the parcel zone selector into the sidebar
   */
  insertParcelZoneSelector() {
    const parcelZoneSection = this.element.querySelector(
      '#parcel-zone-section'
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
      // _onsole.log('✅ Parcel zone selector inserted successfully');
    }
  }

  /**
   * Handle parcel zone selection
   * @param {Object} parcelZone - Selected parcel zone object
   * @param {Object} municipality - Municipality object
   */
  onParcelZoneSelected(parcelZone, municipality) {
    console.log(
      '🏠 Parcel Zone selected in sidebar:',
      parcelZone,
      'for municipality:',
      municipality
    );

    // Enable parcel blocks search when parcel zone is selected
    if (this.parcelBlocksSearch) {
      this.parcelBlocksSearch.enableSearch(municipality, parcelZone);
    }

    // Emit custom event for other components to listen to
    if (this.element) {
      const event = new CustomEvent('parcelZoneSelected', {
        detail: { parcelZone, municipality },
        bubbles: true
      });
      this.element.dispatchEvent(event);
    }
  }

  /**
   * Insert the parcel blocks search into the sidebar
   */
  insertParcelBlocksSearch() {
    const parcelBlocksSection = this.element.querySelector(
      '#parcel-blocks-section'
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
      // _onsole.log('✅ Parcel blocks search inserted successfully');
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
      '📍 Parcel Block selected in sidebar:',
      parcelBlock,
      'Zone:',
      parcelZone,
      'Municipality:',
      municipality
    );

    // Emit custom event for other components to listen to
    if (this.element) {
      const event = new CustomEvent('parcelBlockSelected', {
        detail: { parcelBlock, parcelZone, municipality },
        bubbles: true
      });
      this.element.dispatchEvent(event);
    }
  }

  /**
   * Get the address search instance
   * @returns {AddressSearch} The address search component
   */
  getAddressSearch() {
    return this.addressSearch;
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
   * Set the map instance for the parcel blocks search component
   * @param {Object} mapInstance - The MapLibre map instance
   */
  setMapInstance(mapInstance) {
    this.map = mapInstance;
    if (this.parcelBlocksSearch) {
      this.parcelBlocksSearch.map = mapInstance;
      // _onsole.log('🗺️ Map instance set for parcel blocks search');
    }
  }

  /**
   * Cleanup method to remove event listeners
   */
  cleanup() {
    // Remove sidebar-specific event listeners
    // Municipality selector, parcel zone selector, and parcel blocks search have their own cleanup if needed
    console.log('🧹 Left sidebar cleanup completed');
  }
}
