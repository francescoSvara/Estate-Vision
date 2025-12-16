import './auxiliary-button-group.css';

export class AuxiliaryButtonGroup {
  constructor() {
    this.element = null;
    this.buttons = [];
    this.mapButtons = []; // Track map-dependent buttons separately
    this.skeletons = new Map(); // Track skeleton placeholders by ID
    this.rightSidebar = null; // Store reference to right sidebar
  }

  /**
   * Create a skeleton placeholder for a button with an ID
   * @param {string} skeletonId - Unique identifier for the skeleton
   * @param {string} name - Display name for the skeleton
   * @param {boolean} persistent - Whether this skeleton should remain visible when others are hidden
   * @param {boolean} requiresMap - Whether this skeleton is for a map-dependent button
   */
  createSkeleton(
    skeletonId,
    name = '',
    persistent = false,
    requiresMap = false
  ) {
    if (!skeletonId || this.skeletons.has(skeletonId)) {
      console.warn(
        `Skeleton with ID '${skeletonId}' already exists or ID is invalid`
      );
      return null;
    }

    const skeletonElement = document.createElement('div');
    skeletonElement.className = 'button-group-skeleton';
    skeletonElement.id = `skeleton-${skeletonId}`;
    skeletonElement.setAttribute('data-skeleton-id', skeletonId);
    skeletonElement.setAttribute('data-skeleton-name', name);
    skeletonElement.style.display = 'none'; // Hidden by default until populated

    if (this.element) {
      this.element.appendChild(skeletonElement);
    }

    const skeletonObj = {
      element: skeletonElement,
      skeletonId: skeletonId,
      name: name,
      persistent: persistent,
      requiresMap: requiresMap,
      populated: false,
      buttonInstance: null
    };

    this.skeletons.set(skeletonId, skeletonObj);
    return skeletonElement;
  }

  /**
   * Populate a skeleton with an actual button
   * @param {string} skeletonId - The skeleton ID to populate
   * @param {HTMLElement} buttonElement - The button element to add
   * @param {Object} buttonInstance - Optional button instance for map dependency tracking
   */
  populateSkeleton(skeletonId, buttonElement, buttonInstance = null) {
    const skeleton = this.skeletons.get(skeletonId);
    if (!skeleton) {
      console.warn(`Skeleton with ID '${skeletonId}' not found`);
      return false;
    }

    if (skeleton.populated) {
      console.warn(`Skeleton with ID '${skeletonId}' is already populated`);
      return false;
    }

    // Configure the button element
    if (buttonElement) {
      // Remove any positioning classes from the button
      buttonElement.classList.remove(
        'toggle-button-right',
        'toggle-button-left'
      );
      buttonElement.classList.add('button-group-item');

      // Add identification attributes
      buttonElement.setAttribute('data-button-name', skeleton.name);
      buttonElement.setAttribute('aria-label', skeleton.name);

      // Remove fixed positioning
      buttonElement.style.position = 'relative';
      buttonElement.style.top = 'auto';
      buttonElement.style.right = 'auto';
      buttonElement.style.left = 'auto';
      buttonElement.style.bottom = 'auto';

      // Replace skeleton content with button
      skeleton.element.innerHTML = '';
      skeleton.element.appendChild(buttonElement);
      skeleton.element.style.display = 'flex';
      skeleton.populated = true;
      skeleton.buttonInstance = buttonInstance;

      // Add to buttons array for existing functionality
      const buttonObj = {
        element: buttonElement,
        name: skeleton.name,
        persistent: skeleton.persistent,
        instance: buttonInstance,
        skeletonId: skeletonId
      };

      this.buttons.push(buttonObj);

      // Track map-dependent buttons
      if (
        skeleton.requiresMap ||
        (buttonInstance &&
          buttonInstance.getRequiresMap &&
          buttonInstance.getRequiresMap())
      ) {
        this.mapButtons.push(buttonObj);
      }

      return true;
    }

    return false;
  }

  /**
   * Get a skeleton by ID
   * @param {string} skeletonId - The skeleton ID to find
   * @returns {Object|null} The skeleton object or null if not found
   */
  getSkeletonById(skeletonId) {
    return this.skeletons.get(skeletonId) || null;
  }

  /**
   * Setup skeleton placeholders for expected buttons
   * @param {Array} skeletonConfigs - Array of skeleton configuration objects
   * Each config should have: { id, name, persistent, requiresMap }
   */
  setupSkeletons(skeletonConfigs) {
    skeletonConfigs.forEach(config => {
      if (config.id) {
        this.createSkeleton(
          config.id,
          config.name || '',
          config.persistent || false,
          config.requiresMap || false
        );
      }
    });
  }

  /**
   * Add a button to the group (legacy method for backward compatibility)
   * @param {HTMLElement} buttonElement - The button element to add
   * @param {string} name - The name to identify this button
   * @param {boolean} persistent - Whether this button should remain visible when others are hidden
   * @param {Object} buttonInstance - Optional button instance for map dependency tracking
   */
  addButton(
    buttonElement,
    name = '',
    persistent = false,
    buttonInstance = null
  ) {
    if (buttonElement && this.element) {
      // Remove any positioning classes from the button
      buttonElement.classList.remove(
        'toggle-button-right',
        'toggle-button-left'
      );
      buttonElement.classList.add('button-group-item');

      // Add identification attributes
      if (name) {
        buttonElement.setAttribute('data-button-name', name);
        buttonElement.setAttribute('aria-label', name);
      }

      // Remove fixed positioning
      buttonElement.style.position = 'relative';
      buttonElement.style.top = 'auto';
      buttonElement.style.right = 'auto';
      buttonElement.style.left = 'auto';
      buttonElement.style.bottom = 'auto';

      this.element.appendChild(buttonElement);

      const buttonObj = {
        element: buttonElement,
        name: name,
        persistent: persistent,
        instance: buttonInstance
      };

      this.buttons.push(buttonObj);

      // Track map-dependent buttons
      if (
        buttonInstance &&
        buttonInstance.getRequiresMap &&
        buttonInstance.getRequiresMap()
      ) {
        this.mapButtons.push(buttonObj);
      }
    }
  }

  /**
   * Remove a button from the group
   * @param {Object} buttonInstance - The button instance to remove
   */
  removeButton(buttonInstance) {
    if (!buttonInstance) return;

    // Find and remove from buttons array
    const buttonIndex = this.buttons.findIndex(
      btn => btn.instance === buttonInstance
    );
    if (buttonIndex !== -1) {
      const buttonObj = this.buttons[buttonIndex];

      // Remove from DOM
      if (buttonObj.element && buttonObj.element.parentNode) {
        buttonObj.element.parentNode.removeChild(buttonObj.element);
      }

      // Remove from buttons array
      this.buttons.splice(buttonIndex, 1);

      // Remove from mapButtons array if it exists there
      const mapButtonIndex = this.mapButtons.findIndex(
        btn => btn.instance === buttonInstance
      );
      if (mapButtonIndex !== -1) {
        this.mapButtons.splice(mapButtonIndex, 1);
      }

      // Handle skeleton if this was populated from one
      if (buttonObj.skeletonId) {
        const skeleton = this.skeletons.get(buttonObj.skeletonId);
        if (skeleton) {
          skeleton.populated = false;
          skeleton.buttonInstance = null;
          skeleton.element.innerHTML = '';
          skeleton.element.style.display = 'none';
        }
      }
    }
  }

  /**
   * Get a button by name
   * @param {string} name - The name of the button to find
   * @returns {HTMLElement|null} The button element or null if not found
   */
  getButtonByName(name) {
    const buttonObj = this.buttons.find(btn => btn.name === name);
    return buttonObj ? buttonObj.element : null;
  }

  /**
   * Show the button group
   */
  show() {
    if (this.element) {
      this.element.classList.remove('hidden');
      this.element.style.display = 'flex';
      this.element.setAttribute('aria-hidden', 'false');
    }
  }

  /**
   * Hide the button group
   */
  hide() {
    if (this.element) {
      this.element.classList.add('hidden');
      this.element.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        if (this.element.classList.contains('hidden')) {
          this.element.style.display = 'none';
        }
      }, 300);
    }
  }

  /**
   * Show individual buttons in the group
   */
  showButtons() {
    this.buttons.forEach(buttonObj => {
      if (buttonObj.element && buttonObj.element.style) {
        buttonObj.element.style.display = 'flex';
      }
    });
  }

  /**
   * Hide individual buttons in the group (except persistent buttons)
   */
  hideButtons() {
    this.buttons.forEach(buttonObj => {
      if (
        !buttonObj.persistent &&
        buttonObj.element &&
        buttonObj.element.style
      ) {
        buttonObj.element.style.display = 'none';
      }
    });
  }

  render() {
    const containerHTML = `
      <div class="button-group-topright" role="toolbar" aria-label="Top right actions">
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = containerHTML;
    this.element = wrapper.firstElementChild;

    return this.element;
  }

  /**
   * Set map readiness state for all map-dependent buttons
   * @param {boolean} isReady - Whether the map is ready
   */
  setMapReady(isReady) {
    this.mapButtons.forEach(buttonObj => {
      if (buttonObj.instance && buttonObj.instance.setMapReady) {
        buttonObj.instance.setMapReady(isReady);
      }
    });
  }

  /**
   * Setup multiple buttons in the button group
   * @param {Array} buttonConfigs - Array of button configuration objects
   * Each config should have: { instance, label, persistent }
   */
  setupButtons(buttonConfigs) {
    buttonConfigs.forEach(config => {
      if (config.instance && config.label !== undefined) {
        const buttonElement = config.instance.render();
        this.addButton(
          buttonElement,
          config.label,
          config.persistent || false,
          config.instance
        );
      }
    });
  }

  /**
   * Get all map-dependent buttons
   * @returns {Array} Array of map button objects
   */
  getMapButtons() {
    return this.mapButtons;
  }

  /**
   * Setup skeleton placeholders for buttons in the auxiliary button group
   */
  setupButtonSkeletons() {
    // Define skeleton configurations
    const skeletonConfigs = [
      // {
      //   id: 'toggle-right-sidebar',
      //   name: 'Toggle Right Sidebar',
      //   persistent: true,
      //   requiresMap: false
      // }, // Removed Toggle Right Sidebar
      {
        id: 'zone-analysis-button',
        name: 'Zone Analysis',
        persistent: false,
        requiresMap: true
      },
      {
        id: 'show-portfolio-button',
        name: 'Show Portfolio',
        persistent: false,
        requiresMap: true
      }
    ];

    this.setupSkeletons(skeletonConfigs);
  }

  /**
   * Set the right sidebar instance reference
   * @param {Object} rightSidebar - The right sidebar instance
   */
  setRightSidebar(rightSidebar) {
    this.rightSidebar = rightSidebar;
  }

  /**
   * Initialize auxiliary button group in the designated container
   */
  init() {
    const containerElement = document.querySelector(
      '#auxiliary-button-group-container'
    );

    if (containerElement) {
      const buttonGroupElement = this.render();
      containerElement.appendChild(buttonGroupElement);

      // Setup button skeletons after button group is rendered
      this.setupButtonSkeletons();

      // Initialize right sidebar toggle button after button group is ready
      // if (this.rightSidebar && this.rightSidebar.initializeToggleButton) {
      //   this.rightSidebar.initializeToggleButton();
      // } // Removed initialization of right sidebar toggle button
    }
  }
}
