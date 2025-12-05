import './styles/style.css';
import './styles/button.css';
import './styles/form.css';
import { LeftSidebar } from './components/left-sidebar/left-sidebar.js';
import { RightSidebar } from './components/right-sidebar/right-sidebar.js';
import { MainContent } from './components/main-content/main-content.js';
import { ToggleButton } from './components/toggle-button/toggle-button.js';
import { ButtonGroupTopRight } from './components/button-group-topright/button-group-topright.js';
import { Modal } from './components/modal/modal.js';
import { ModalButton } from './components/modal-button/modal-button.js';

// Import layer initialization
import { initializeLayers } from './components/layers/index.js';

// Application class to manage the enhanced EV Dashboard
class PMTilesViewerApp {
  constructor() {
    // Initialize layers by calling the centralized function
    this.layers = initializeLayers();

    // Create layer configuration for sidebar
    this.layerConfig = this.buildLayerConfig();

    // Initialize components with layer information
    this.leftSidebar = new LeftSidebar(this.layerConfig, null, this.layers);
    this.rightSidebar = new RightSidebar();
    this.mainContent = new MainContent(
      this.leftSidebar,
      this.rightSidebar,
      this.layers
    );
    this.appContainer = document.getElementById('app');

    // Create toggle button for right sidebar
    this.rightToggleButton = new ToggleButton('right', () =>
      this.toggleRightSidebar()
    );

    // Create button group for organizing buttons
    this.buttonGroup = new ButtonGroupTopRight();

    // Create sample modal and button
    this.sampleModal = new Modal(
      'PMTiles Info',
      '<p>This is a sample modal for EV Dashboard.</p>'
    );
    this.sampleModalButton = new ModalButton(
      () => this.openSampleModal(),
      '',
      true,
      'Information',
      'info-button'
    );

    // Create map control buttons
    this.homeButton = new ModalButton(
      () => this.resetMapView(),
      '',
      'home',
      'Reset map view',
      'home-button'
    );

    this.zoomInButton = new ModalButton(
      () => this.zoomIn(),
      '',
      'zoom-in',
      'Zoom in',
      'zoom-in-button'
    );

    this.zoomOutButton = new ModalButton(
      () => this.zoomOut(),
      '',
      'zoom-out',
      'Zoom out',
      'zoom-out-button'
    );
  }

  /**
   * Build layer configuration based on layer instances
   */
  buildLayerConfig() {
    return Object.entries(this.layers)
      .filter(([, layerInstance]) => layerInstance.layerInToc === true)
      .map(([layerId, layerInstance]) => ({
        id: layerId,
        layerName: layerInstance.layerName,
        title: layerInstance.layerName
      }));
  }

  toggleRightSidebar() {
    const isVisible = this.rightSidebar.toggle();

    // Update toggle button state to reflect sidebar visibility
    this.rightToggleButton.updateState(isVisible);

    // Show/hide buttons based on sidebar visibility
    if (isVisible) {
      this.buttonGroup.hideButtons(); // Hide all buttons except toggle
    } else {
      this.buttonGroup.showButtons(); // Show all buttons
    }

    return isVisible;
  }

  openSampleModal() {
    this.sampleModal.show();
  }

  /**
   * Reset map view to initial position and zoom
   */
  resetMapView() {
    const map = this.getMap();
    if (map) {
      map.flyTo({
        center: [11.8, 45.5],
        zoom: 10,
        duration: 1000
      });
    }
  }

  /**
   * Zoom in the map
   */
  zoomIn() {
    const map = this.getMap();
    if (map) {
      map.zoomIn({ duration: 300 });
    }
  }

  /**
   * Zoom out the map
   */
  zoomOut() {
    const map = this.getMap();
    if (map) {
      map.zoomOut({ duration: 300 });
    }
  }

  /**
   * Get a button from the button group by name
   */
  getButtonByName(name) {
    return this.buttonGroup.getButtonByName(name);
  }

  init() {
    // Clear the app container
    this.appContainer.innerHTML = '';

    // Create and mount left sidebar
    const leftSidebarElement = this.leftSidebar.render();
    this.appContainer.appendChild(leftSidebarElement);

    // Create and mount main content
    const mainContentElement = this.mainContent.render();
    this.appContainer.appendChild(mainContentElement);

    // Create and mount right sidebar (initially hidden)
    const rightSidebarElement = this.rightSidebar.render();
    document.body.appendChild(rightSidebarElement); // Append to body for fixed positioning

    // Set close callback for right sidebar
    this.rightSidebar.setOnClose(() => this.toggleRightSidebar());

    // Create and mount button group with all buttons
    const buttonGroupElement = this.buttonGroup.render();
    document.body.appendChild(buttonGroupElement);

    // Add buttons to the group
    const toggleButtonElement = this.rightToggleButton.render();
    const sampleModalButtonElement = this.sampleModalButton.render();
    const homeButtonElement = this.homeButton.render();
    const zoomInButtonElement = this.zoomInButton.render();
    const zoomOutButtonElement = this.zoomOutButton.render();

    this.buttonGroup.addButton(
      toggleButtonElement,
      'Toggle Right Sidebar',
      true
    );
    this.buttonGroup.addButton(sampleModalButtonElement, 'Info', false);
    this.buttonGroup.addButton(homeButtonElement, 'Home', false);
    this.buttonGroup.addButton(zoomInButtonElement, 'Zoom In', false);
    this.buttonGroup.addButton(zoomOutButtonElement, 'Zoom Out', false);

    // Initialize Lucide icons after DOM is ready
    setTimeout(() => {
      import('lucide').then(
        ({
          createIcons,
          PanelRightOpen,
          PanelRightClose,
          Info,
          Home,
          ZoomIn,
          ZoomOut
        }) => {
          createIcons({
            icons: {
              PanelRightOpen,
              PanelRightClose,
              Info,
              Home,
              ZoomIn,
              ZoomOut
            },
            attrs: {
              width: 16,
              height: 16,
              'stroke-width': 2
            }
          });
        }
      );
    }, 0);

    // Add modal to body
    const sampleModalElement = this.sampleModal.render();
    document.body.appendChild(sampleModalElement);

    // _onsole.log('✓ EV Dashboard with enhanced UI initialized successfully');
  }

  // Method to get map instance for external use
  getMap() {
    return this.mainContent ? this.mainContent.getMap() : null;
  }

  // Method to add new layers dynamically
  addLayer(layerId, layerInstance) {
    this.layers[layerId] = layerInstance;
    this.layerConfig = this.buildLayerConfig();

    // Add to sidebar if it exists
    if (this.leftSidebar) {
      this.leftSidebar.addLayer(layerId, layerInstance.layerName);
    }

    // Update main content with new layers for popup system
    if (this.mainContent) {
      this.mainContent.updateLayers(this.layers);
    }
  }
}

import { waitForTranslations } from './i18n/index.js';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for translations to load first
  await waitForTranslations();

  const app = new PMTilesViewerApp();
  app.init();

  // Make app globally available for debugging/customization
  window.pmtilesApp = app;
});
