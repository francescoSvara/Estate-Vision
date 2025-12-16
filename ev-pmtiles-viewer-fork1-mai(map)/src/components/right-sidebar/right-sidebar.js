import './right-sidebar.css';
import { useTranslation } from '../../i18n/hooks/useTranslation.js';
import { toggleButton } from '../toggle-button/toggle-button.js';
import { HealthIndicators } from '../health-indicators/health-indicators.js';
import { ParcelAnalyticsManager } from '../parcel-analytics-manager/parcel-analytics-manager.js';
import { mainMapManager } from '../../services/map/main-map-manager.js';

export class RightSidebar {
  constructor() {
    this.element = null;
    this.isVisible = false;
    this.onClose = null;
    this.onOpen = null;
    this.toggleButtonInstance = null;
    this.translation = useTranslation();
    this.healthIndicators = null;
    this.parcelAnalyticsManager = null;
    this.auxiliaryButtonGroup = null;

    this._initializeComponents();
  }

  /**
   * Initialize component after render - consistent with LeftSidebar pattern
   */
  init() {
    // Initialize toggle button if not already done
    this.initializeToggleButton();
  }

  _initializeComponents() {
    // Initialize ParcelAnalyticsManager
    this.parcelAnalyticsManager = new ParcelAnalyticsManager(null);

    // Toggle button will be initialized later via initializeToggleButton()
  }

  /**
   * Create and setup toggle button for the right sidebar using direct skeleton access
   */
  createToggleButton() {
    console.log('Creating toggle button...');

    // Find the skeleton element directly in the DOM
    const skeletonElement = document.getElementById(
      'skeleton-toggle-right-sidebar'
    );
    if (!skeletonElement) {
      console.warn('Toggle sidebar skeleton not found in DOM');
      return;
    }

    console.log('Found skeleton element:', skeletonElement);

    // Create toggle button instance
    this.toggleButtonInstance = new toggleButton('right', () => this.toggle());
    console.log('Toggle button instance created');

    // Render the button and replace skeleton content
    const buttonElement = this.toggleButtonInstance.render();
    skeletonElement.innerHTML = '';
    skeletonElement.appendChild(buttonElement);
    skeletonElement.style.display = ''; // Show the populated skeleton

    console.log('Toggle button created and skeleton populated');
  }

  /**
   * Initialize the toggle button after skeletons are ready
   */
  initializeToggleButton() {
    console.log('Initializing right sidebar toggle button...');
    if (!this.toggleButtonInstance) {
      this.createToggleButton();
      console.log('Toggle button created and populated');
    } else {
      console.log('Toggle button already exists');
    }
  }

  render() {
    const { t } = this.translation;
    const sidebarHTML = `
      <div class="right-sidebar" style="display: none;">
        <header class="sidebar-header">
          <div class="sidebar-header-content">
            <div class="sidebar-title-section">
              <h3 class="analytics-title">${t('sidebar.right.analytics')}</h3>
              <p class="sidebar-subtitle">${t('sidebar.right.dataMeta')}</p>
            </div>
            <div class="sidebar-header-controls">
            </div>
          </div>
        </header>
        
        <main class="sidebar-body" id="parcel-analytics-container">
          <!-- Parcel analytics workspace will be inserted here -->
        </main>
        
        <footer class="sidebar-footer">
          <div class="app-info">
            <div id="health-indicators-container"></div>
            <p class="copyright">${t('sidebar.right.copyright')}</p>
          </div>
        </footer>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = sidebarHTML;
    this.element = wrapper.firstElementChild;

    // Setup event listeners and language handling
    this.addEventListeners();
    this.setupLanguageListener();

    // Initialize post-render operations
    this._initializePostRender();

    return this.element;
  }

  _initializePostRender() {
    // Initialize health indicators component
    const healthContainer = this.element?.querySelector(
      '#health-indicators-container'
    );
    if (healthContainer) {
      this.healthIndicators = new HealthIndicators();
      const healthElement = this.healthIndicators.render();
      healthContainer.appendChild(healthElement);
    }

    // Initialize parcel analytics manager
    const analyticsContainer = this.element?.querySelector(
      '#parcel-analytics-container'
    );
    if (analyticsContainer && this.parcelAnalyticsManager) {
      this.parcelAnalyticsManager.renderTo(analyticsContainer);
    }

    // Post-render initialization following LeftSidebar pattern
    // Wait for translations before checking API/DB status to ensure proper error messages
    if (this.translation.translationsLoaded()) {
      this._performAsyncInitialization();
    } else {
      this.translation.waitForTranslations().then(() => {
        this._performAsyncInitialization();
      });
    }
  }

  _performAsyncInitialization() {
    // Perform async operations after translations are loaded
    if (this.healthIndicators) {
      this.healthIndicators.init();
    }
    if (this.parcelAnalyticsManager) {
      this.parcelAnalyticsManager.init();
    }
  }

  addEventListeners() {
    if (!this.element) return;

    // Close button functionality
    const closeButton = this.element.querySelector('.sidebar-close-btn');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        if (this.onClose) {
          this.onClose();
        }
      });
    }
  }

  show() {
    if (this.element) {
      this.element.style.display = 'flex';
      this.isVisible = true;

      // Update toggle button state
      if (this.toggleButtonInstance) {
        this.toggleButtonInstance.updateState(true);
      }

      // Hide non-persistent buttons when sidebar opens
      if (this.auxiliaryButtonGroup) {
        this.auxiliaryButtonGroup.hideButtons();
      }

      if (this.onOpen) {
        this.onOpen();
      }
    }
  }

  hide() {
    if (this.element) {
      this.element.style.display = 'none';
      this.isVisible = false;

      // Update toggle button state
      if (this.toggleButtonInstance) {
        this.toggleButtonInstance.updateState(false);
      }

      // Show all buttons when sidebar closes
      if (this.auxiliaryButtonGroup) {
        this.auxiliaryButtonGroup.showButtons();
      }
    }
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
    return this.isVisible;
  }

  setOnClose(callback) {
    this.onClose = callback;
  }

  setOnOpen(callback) {
    this.onOpen = callback;
  }

  setAuxiliaryButtonGroup(buttonGroup) {
    this.auxiliaryButtonGroup = buttonGroup;
  }

  setupLanguageListener() {
    // Subscribe to language changes and re-render when language changes
    this.languageUnsubscribe = this.translation.onLanguageChange(() => {
      this.reRenderWithTranslations();
      if (this.healthIndicators) {
        this.healthIndicators.updateTranslations();
      }
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
      // Store current state for preservation
      const wasVisible = this.isVisible;

      // Re-render the sidebar
      const oldElement = this.element;
      this.element = null;

      const newElement = this.render();
      oldElement.parentNode.replaceChild(newElement, oldElement);

      // Restore visibility
      if (wasVisible) {
        this.show();
      }

      // Update toggle button state if it exists
      if (this.toggleButtonInstance) {
        this.toggleButtonInstance.updateState(wasVisible);
      }

      // Update parcel analytics manager translations
      if (this.parcelAnalyticsManager) {
        this.parcelAnalyticsManager.reRenderWithTranslations();
      }
    }
  }

  destroy() {
    // Cleanup language listener
    if (this.languageUnsubscribe) {
      this.languageUnsubscribe();
      this.languageUnsubscribe = null;
    }

    // Cleanup toggle button
    if (this.toggleButtonInstance && this.toggleButtonInstance.destroy) {
      this.toggleButtonInstance.destroy();
      this.toggleButtonInstance = null;
    }

    // Cleanup health indicators
    if (this.healthIndicators && this.healthIndicators.destroy) {
      this.healthIndicators.destroy();
      this.healthIndicators = null;
    }

    // Cleanup parcel analytics manager
    if (this.parcelAnalyticsManager && this.parcelAnalyticsManager.destroy) {
      this.parcelAnalyticsManager.destroy();
      this.parcelAnalyticsManager = null;
    }

    // Cleanup translation subscription if needed
    if (this.translation.cleanup) {
      this.translation.cleanup();
    }

    // Clear element reference
    this.element = null;
  }
}
