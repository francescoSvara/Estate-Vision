/**
 * Map Button Service
 * Manages map-related buttons following the auxiliary-button-group pattern
 */
export class MapButtonService {
  constructor(mainMap = null, auxiliaryButtonGroup = null) {
    this.mainMap = mainMap;
    this.auxiliaryButtonGroup = auxiliaryButtonGroup;
    this.mapButtons = new Map();
  }

  /**
   * Set map instance reference
   * @param {Object} mainMap - Main map instance
   */
  setMainMap(mainMap) {
    this.mainMap = mainMap;
  }

  /**
   * Set auxiliary button group reference
   * @param {Object} auxiliaryButtonGroup - Auxiliary button group instance
   */
  setAuxiliaryButtonGroup(auxiliaryButtonGroup) {
    this.auxiliaryButtonGroup = auxiliaryButtonGroup;
  }

  /**
   * Initialize map buttons when map is ready
   */
  async initializeMapButtons() {
    if (!this.auxiliaryButtonGroup) {
      console.warn('Auxiliary button group not set');
      return;
    }

    try {
      // Dynamic import of MapButton component
      const { MapButton } = await import(
        '../../components/map-button/map-button.js'
      );

      // Create and configure map buttons
      // this.createHomeButton(MapButton); // Removed
      // this.createZoomButtons(MapButton); // Removed
      this.createZoneAnalysisButton(MapButton); // Add Zone Analysis Button
      this.createShowPortfolioButton(MapButton); // Add Show Portfolio Button

      // Initialize Lucide icons for map buttons
      this.initializeLucideIcons();
    } catch (error) {
      console.error('❌ Failed to initialize map buttons:', error);
    }
  }

  /**
   * Create home/reset view button
   * @param {Class} MapButton - MapButton component class
   */
  createHomeButton(MapButton) {
    const homeButton = new MapButton(
      () => this.resetMapView(),
      '',
      'home',
      'Reset map view',
      'home-button',
      true // Requires map
    );

    const homeElement = homeButton.render();
    this.auxiliaryButtonGroup.populateSkeleton(
      'home-button',
      homeElement,
      homeButton
    );

    this.mapButtons.set('home-button', homeButton);
  }

  /**
   * Create zoom in and zoom out buttons
   * @param {Class} MapButton - MapButton component class
   */
  createZoomButtons(MapButton) {
    // Zoom in button
    const zoomInButton = new MapButton(
      () => this.zoomIn(),
      '',
      'zoom-in',
      'Zoom in',
      'zoom-in-button',
      true // Requires map
    );

    const zoomInElement = zoomInButton.render();
    this.auxiliaryButtonGroup.populateSkeleton(
      'zoom-in-button',
      zoomInElement,
      zoomInButton
    );

    // Zoom out button
    const zoomOutButton = new MapButton(
      () => this.zoomOut(),
      '',
      'zoom-out',
      'Zoom out',
      'zoom-out-button',
      true // Requires map
    );

    const zoomOutElement = zoomOutButton.render();
    this.auxiliaryButtonGroup.populateSkeleton(
      'zoom-out-button',
      zoomOutElement,
      zoomOutButton
    );

    this.mapButtons.set('zoom-in-button', zoomInButton);
    this.mapButtons.set('zoom-out-button', zoomOutButton);
  }

  /**
   * Create Zone Analysis button
   * @param {Class} MapButton - MapButton component class
   */
  createZoneAnalysisButton(MapButton) {
    const zoneAnalysisButton = new MapButton(
      () => this.triggerZoneAnalysis(),
      '',
      'scan-line', // Lucide icon name
      'Zone Analysis',
      'zone-analysis-button',
      true // Requires map
    );

    const buttonElement = zoneAnalysisButton.render();
    this.auxiliaryButtonGroup.populateSkeleton(
      'zone-analysis-button',
      buttonElement,
      zoneAnalysisButton
    );

    this.mapButtons.set('zone-analysis-button', zoneAnalysisButton);
  }

  /**
   * Create Show Portfolio button
   * @param {Class} MapButton - MapButton component class
   */
  createShowPortfolioButton(MapButton) {
    const portfolioButton = new MapButton(
      () => this.togglePortfolio(),
      '',
      'briefcase', // Lucide icon name
      'Show Portfolio',
      'show-portfolio-button',
      true // Requires map
    );

    const buttonElement = portfolioButton.render();
    this.auxiliaryButtonGroup.populateSkeleton(
      'show-portfolio-button',
      buttonElement,
      portfolioButton
    );

    this.mapButtons.set('show-portfolio-button', portfolioButton);
  }

  /**
   * Trigger Zone Analysis in Abby
   */
  triggerZoneAnalysis() {
    if (this.mainMap && this.mainMap.nemoAssistant) {
        this.mainMap.nemoAssistant.startZoneSelection();
    } else {
        console.warn('Abby Assistant not available for Zone Analysis');
    }
  }

  /**
   * Toggle Portfolio assets visibility on map
   */
  togglePortfolio() {
    if (this.mainMap && this.mainMap.togglePortfolioLayer) {
        this.mainMap.togglePortfolioLayer();
    } else {
        console.warn('Portfolio layer toggle not available');
    }
  }

  /**
   * Initialize Lucide icons for map buttons
   */
  initializeLucideIcons() {
    setTimeout(async () => {
      try {
        const { createIcons, ScanLine, Briefcase } = await import('lucide');
        createIcons({
          icons: { ScanLine, Briefcase },
          attrs: { width: 20, height: 20, 'stroke-width': 2 }
        });
      } catch (error) {
        console.warn('⚠️ Failed to load Lucide icons:', error);
      }
    }, 0);
  }

  /**
   * Reset map view to initial position and zoom
   */
  resetMapView() {
    if (this.mainMap && this.mainMap.resetView) {
      this.mainMap.resetView();
    } else {
      console.warn('Main map instance not available for resetView');
    }
  }

  /**
   * Zoom in the map
   */
  zoomIn() {
    if (this.mainMap && this.mainMap.zoomIn) {
      this.mainMap.zoomIn();
    } else {
      console.warn('Main map instance not available for zoomIn');
    }
  }

  /**
   * Zoom out the map
   */
  zoomOut() {
    if (this.mainMap && this.mainMap.zoomOut) {
      this.mainMap.zoomOut();
    } else {
      console.warn('Main map instance not available for zoomOut');
    }
  }

  /**
   * Get a specific map button instance
   * @param {string} buttonId - Button identifier
   * @returns {Object|null} Button instance or null if not found
   */
  getButton(buttonId) {
    return this.mapButtons.get(buttonId) || null;
  }

  /**
   * Get all map button instances
   * @returns {Map} Map of button instances
   */
  getAllButtons() {
    return this.mapButtons;
  }

  /**
   * Add a custom map button
   * @param {string} buttonId - Unique button identifier
   * @param {Object} buttonInstance - Button instance
   */
  addButton(buttonId, buttonInstance) {
    this.mapButtons.set(buttonId, buttonInstance);
  }

  /**
   * Remove a map button
   * @param {string} buttonId - Button identifier to remove
   */
  removeButton(buttonId) {
    return this.mapButtons.delete(buttonId);
  }
}
