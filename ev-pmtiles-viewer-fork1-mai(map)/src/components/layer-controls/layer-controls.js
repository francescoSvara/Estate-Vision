/**
 * Layer Controls Component
 * Manages layer toggle buttons and group controls for the left sidebar
 */

import './layer-controls.css';

export class LayerControls {
  constructor(layerConfig = [], translation = null) {
    this.element = null;
    this.layerCallbacks = {};
    this.pendingLayers = []; // Store layers added before component is rendered
    this.pendingCallbacks = {}; // Store callbacks added before component is rendered
    this.translation = translation;
    this.containerElement = null;
    this.sidebarElement = null;
    this.layerInstances = null;

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
   * Set translation instance
   * @param {Object} translation - Translation instance
   */
  setTranslation(translation) {
    this.translation = translation;
  }

  /**
   * Set sidebar element reference
   * @param {HTMLElement} sidebarElement - Reference to parent sidebar element
   */
  setSidebarElement(sidebarElement) {
    this.sidebarElement = sidebarElement;
  }

  /**
   * Set layer instances reference
   * @param {Object} layerInstances - Layer instances object
   */
  setLayerInstances(layerInstances) {
    this.layerInstances = layerInstances;
  }

  /**
   * Initialize the component by inserting into container
   * @param {HTMLElement|string} container - Container element, selector, or null to auto-find
   * @param {number} retryCount - Internal retry counter
   * @returns {Promise<boolean>} Success status
   */
  async init(container = null, retryCount = 0) {
    const maxRetries = 10;

    const containerElement =
      this.sidebarElement?.querySelector('.layer-controls-container') ||
      document.getElementById('layer-controls-container');

    if (!containerElement && retryCount < maxRetries) {
      return new Promise(resolve => {
        setTimeout(async () => {
          const result = await this.init(container, retryCount + 1);
          resolve(result);
        }, 200);
      });
    }

    const existingLayerControls =
      containerElement?.querySelector('.layer-controls');
    if (existingLayerControls) {
      console.warn(
        '🔄 Layer controls already exist in container, skipping insertion'
      );
      return false;
    }

    this.containerElement = containerElement;
    if (containerElement) {
      containerElement.appendChild(this.element);
    }

    return true;
  }

  /**
   * Render the layer controls component
   * @returns {HTMLElement} The rendered component element
   */
  render() {
    if (!this.translation) {
      console.warn('LayerControls: Translation not set, using fallback text');
    }

    const t = this.translation?.t || (key => key);

    const layerControlsHTML = `
      <div class="layer-controls">
        <h2 class="section-title">${t('sidebar.left.dataLayers')}</h2>
        ${this.generateLayerToggles()}
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = layerControlsHTML;
    this.element = wrapper.firstElementChild;

    // Process any pending layers and callbacks now that component is rendered
    this.processPendingLayers();
    this.processPendingCallbacks();

    this.attachEventListeners();

    return this.element;
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

    const t = this.translation?.t || (key => key);
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

  /**
   * Attach event listeners to layer toggle buttons
   */
  attachEventListeners() {
    if (!this.element) return;

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

  /**
   * Toggle a layer
   * @param {string} layerName - The layer name to toggle
   */
  toggleLayer(layerName) {
    if (this.layerCallbacks[layerName]) {
      this.layerCallbacks[layerName]();
    }
  }

  /**
   * Toggle all layers in a group
   * @param {string} groupKey - The group key ('parcels', etc.)
   */
  toggleAllLayersInGroup(groupKey) {
    const group = this.layerGroups[groupKey];
    if (!group) return;

    // Toggle the group layer manager if it has a callback
    if (this.layerCallbacks[groupKey]) {
      this.layerCallbacks[groupKey]();
      return;
    }

    // Fallback: toggle individual layers
    const activeLayersInGroup = group.filter(layer => {
      const toggleButton = this.element?.querySelector(
        `[data-layer="${layer.id}"]`
      );
      return toggleButton && toggleButton.classList.contains('active');
    });

    const shouldActivate = activeLayersInGroup.length === 0;

    group.forEach(layer => {
      const toggleButton = this.element?.querySelector(
        `[data-layer="${layer.id}"]`
      );
      const isCurrentlyActive =
        toggleButton && toggleButton.classList.contains('active');

      if (shouldActivate && !isCurrentlyActive) {
        this.toggleLayer(layer.id);
      } else if (!shouldActivate && isCurrentlyActive) {
        this.toggleLayer(layer.id);
      }
    });

    this.updateToggleButtonState(
      `.toggle-all-parcels[data-group="${groupKey}"]`,
      shouldActivate
    );
  }

  /**
   * Register layer toggle callback
   * @param {string} layerName - Layer name
   * @param {Function} callback - Callback function
   */
  registerLayerCallback(layerName, callback) {
    if (this.element) {
      this.layerCallbacks[layerName] = callback;
    } else {
      // Store for later if component not yet rendered
      this.pendingCallbacks[layerName] = callback;
    }
  }

  /**
   * Update toggle button visual state
   * @param {string} selector - CSS selector for the button
   * @param {boolean} isActive - Whether the button should be active
   */
  updateToggleButtonState(selector, isActive) {
    const toggleButton = this.element?.querySelector(selector);

    if (toggleButton) {
      if (isActive) {
        toggleButton.classList.add('active');
      } else {
        toggleButton.classList.remove('active');
      }
    }
  }

  /**
   * Update layer toggle button state
   * @param {string} layerName - Layer name
   * @param {boolean} isVisible - Whether the layer is visible
   */
  updateLayerToggleButton(layerName, isVisible) {
    this.updateToggleButtonState(`[data-layer="${layerName}"]`, isVisible);

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
      const toggleButton = this.element?.querySelector(
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

  /**
   * Add a new layer to the controls
   * @param {string} layerId - The layer identifier
   * @param {string} title - Display title for the layer
   */
  addLayer(layerId, title = null) {
    const existingLayer = this.layers.find(layer => layer.id === layerId);
    if (!existingLayer) {
      this.layers.push({ id: layerId, title: title || layerId });
      this.layerGroups = this.groupLayers(this.layers);

      // Re-render if already rendered
      if (this.element) {
        this.reRenderToggles();
      } else {
        // Store for later if component not yet rendered
        this.pendingLayers.push({ layerId, title });
      }
    }
  }

  /**
   * Update layer configuration and optionally layer instances
   * @param {Array} layerConfig - New layer configuration
   * @param {Object} layerInstances - Optional layer instances object
   */
  updateLayerConfig(layerConfig, layerInstances = null) {
    this.layers = layerConfig.map(config => ({
      id: config.id,
      title: config.title || config.layerName || config.id
    }));

    if (layerInstances) {
      this.layerInstances = layerInstances;
    }

    this.layerGroups = this.groupLayers(this.layers);

    if (this.element) {
      this.reRenderToggles();
    }
  }

  /**
   * Re-render only the layer toggles section
   */
  reRenderToggles() {
    if (!this.element) return;

    const togglesContainer = this.element.querySelector(
      '.layer-toggles-container'
    );
    if (togglesContainer) {
      togglesContainer.innerHTML = this.generateLayerToggles();
    } else {
      // If no container exists, update the whole content
      const sectionTitle = this.element.querySelector('.section-title');
      if (sectionTitle && sectionTitle.nextSibling) {
        // Remove all content after section title
        while (sectionTitle.nextSibling) {
          sectionTitle.nextSibling.remove();
        }
        // Add new toggles
        const togglesHTML = this.generateLayerToggles();
        const wrapper = document.createElement('div');
        wrapper.innerHTML = togglesHTML;
        while (wrapper.firstChild) {
          sectionTitle.parentNode.appendChild(wrapper.firstChild);
        }
      }
    }

    this.attachEventListeners();
  }

  /**
   * Process any pending layers that were added before component was rendered
   */
  processPendingLayers() {
    if (this.pendingLayers.length > 0) {
      this.pendingLayers.forEach(({ layerId, title }) => {
        const existingLayer = this.layers.find(layer => layer.id === layerId);
        if (!existingLayer) {
          this.layers.push({ id: layerId, title: title || layerId });
        }
      });
      this.layerGroups = this.groupLayers(this.layers);
      this.pendingLayers = []; // Clear pending layers
    }
  }

  /**
   * Process any pending callbacks that were added before component was rendered
   */
  processPendingCallbacks() {
    if (Object.keys(this.pendingCallbacks).length > 0) {
      Object.keys(this.pendingCallbacks).forEach(layerName => {
        this.layerCallbacks[layerName] = this.pendingCallbacks[layerName];
      });
      this.pendingCallbacks = {}; // Clear pending callbacks
    }
  }

  /**
   * Re-render component with updated translations
   */
  reRenderWithTranslations() {
    if (this.element && this.element.parentNode) {
      const parent = this.element.parentNode;

      // Store current states
      const currentStates = {};
      this.layers.forEach(layer => {
        const button = this.element.querySelector(`[data-layer="${layer.id}"]`);
        if (button) {
          currentStates[layer.id] = button.classList.contains('active');
        }
      });

      // Re-render
      const oldElement = this.element;
      this.element = null;

      const newElement = this.render();
      parent.replaceChild(newElement, oldElement);

      // Restore states
      Object.keys(currentStates).forEach(layerId => {
        this.updateLayerToggleButton(layerId, currentStates[layerId]);
      });
    }
  }
}
