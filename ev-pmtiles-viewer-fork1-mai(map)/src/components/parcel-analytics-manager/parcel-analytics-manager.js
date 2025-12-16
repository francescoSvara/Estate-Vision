import './parcel-analytics-manager.css';
import { ApiService } from '../../services/api/api-service.js';
import { useTranslation } from '../../i18n/hooks/useTranslation.js';
import { ParcelAnalyticsCard } from './parcel-analytics-card.js';
import { mainMapManager } from '../../services/map/main-map-manager.js';

/**
 * ParcelAnalyticsManager
 * Manages a collection of selected parcels with expandable analytics
 * Similar to a booking cart/dashboard for map-selected items
 */
export class ParcelAnalyticsManager {
  constructor() {
    this.element = null;
    this.parcelsLayer = null;
    this.selectedParcelsRegistry = this.loadFromStorage();
    this.translation = useTranslation();
    this.apiService = new ApiService(import.meta.env.VITE_X_API_URL || '');
    this.languageUnsubscribe = null;
  }

  /**
   * Load selected parcels from localStorage
   * @returns {Array} Array of parcel objects
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('ev-selected-parcels');
      if (!stored) return [];
      const parsed = JSON.parse(stored);

      // Migrate legacy array of strings to array of objects
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        typeof parsed[0] !== 'object'
      ) {
        return parsed.map(id => ({ id: id }));
      }
      return parsed;
    } catch (error) {
      console.error('Error loading parcels from storage:', error);
      return [];
    }
  }

  /**
   * Save selected parcels to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(
        'ev-selected-parcels',
        JSON.stringify(this.selectedParcelsRegistry)
      );
    } catch (error) {
      console.error('Error saving parcels to storage:', error);
    }
  }

  /**
   * Add a parcel to the registry
   * @param {Object|string} parcelData - Parcel data object or ID
   * @returns {boolean} True if added, false if already exists
   */
  addParcel(parcelData) {
    const parcelId =
      typeof parcelData === 'object'
        ? parcelData.pid_pg_parcels_251001
        : parcelData;

    // Use loose equality to handle string/number differences
    const existingIndex = this.selectedParcelsRegistry.findIndex(
      p => p.id == parcelId
    );

    if (existingIndex === -1) {
      const newParcel =
        typeof parcelData === 'object'
          ? {
              id: parcelId,
              ...parcelData
            }
          : { id: parcelId };

      this.selectedParcelsRegistry.push(newParcel);
      this.saveToStorage();
      this.updateMapSelectedLayers();
      return true;
    }
    return false;
  }

  /**
   * Remove a parcel from the registry
   * @param {string|number} parcelId - Parcel ID to remove
   * @returns {boolean} True if removed, false if not found
   */
  removeParcel(parcelId) {
    const index = this.selectedParcelsRegistry.findIndex(p => p.id == parcelId);
    if (index !== -1) {
      this.selectedParcelsRegistry.splice(index, 1);
      this.saveToStorage();
      this.updateMapSelectedLayers();
      return true;
    }
    return false;
  }

  /**
   * Update parcel data in registry (enrich existing data)
   * @param {string|number} parcelId - Parcel ID
   * @param {Object} newData - New data to merge
   * @returns {boolean} True if updated, false if not found
   */
  updateParcel(parcelId, newData) {
    const index = this.selectedParcelsRegistry.findIndex(p => p.id == parcelId);
    if (index !== -1) {
      this.selectedParcelsRegistry[index] = {
        ...this.selectedParcelsRegistry[index],
        ...newData
      };
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Get parcel data from registry
   * @param {string|number} parcelId - Parcel ID
   * @returns {Object|null} Parcel data or null if not found
   */
  getParcel(parcelId) {
    return this.selectedParcelsRegistry.find(p => p.id == parcelId) || null;
  }

  /**
   * Update map layers with selected parcels
   */
  updateMapSelectedLayers() {
    const map = mainMapManager.getMapInstance();
    if (map && this.parcelsLayer && this.parcelsLayer.updateSelectedParcels) {
      const pids = this.selectedParcelsRegistry.map(p => p.id);
      this.parcelsLayer.updateSelectedParcels(map, pids);
    }
  }

  /**
   * Set parcels layer reference
   * @param {Object} parcelsLayer - Parcels layer instance
   */
  setParcelsLayer(parcelsLayer) {
    this.parcelsLayer = parcelsLayer;
  }

  /**
   * Initialize the component after rendering
   */
  init() {
    this.setupLanguageListener();
    this.renderAllCards();
    this.updateMapSelectedLayers();
  }

  /**
   * Render the analytics workspace container
   * @returns {HTMLElement} The rendered element
   */
  render() {
    const { t } = this.translation;
    const workspaceHTML = `
      <div class="parcel-analytics-workspace" id="parcel-analytics-workspace">
        <div class="analytics-section" style="display: none;">
          <h4 class="analytics-section-title" style="margin-bottom: 1rem; color: var(--color-primary); font-size: 0.9rem; font-weight: 600; text-transform: uppercase;">
            ${t('sidebar.right.selectedParcels') || 'SELECTED PARCELS'}
          </h4>
          <div class="parcel-cards-list" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = workspaceHTML;
    this.element = wrapper.firstElementChild;

    return this.element;
  }

  /**
   * Render and append to container
   * @param {HTMLElement} container - Container to append the element to
   * @returns {HTMLElement} The rendered element
   */
  renderTo(container) {
    if (!container) {
      console.warn('ParcelAnalyticsManager: No container provided');
      return null;
    }

    const element = this.render();
    container.appendChild(element);
    return element;
  }

  /**
   * Display parcel analytics in the workspace
   * Called when a parcel is selected on the map
   * @param {Object} parcelData - Parcel data from map interaction
   */
  displayParcelAnalytics(parcelData) {
    if (!this.element) return;

    const parcelId = parcelData.pid_pg_parcels_251001;
    if (!parcelId) {
      console.warn('No parcel ID found in parcel data');
      return;
    }

    const analyticsSection = this.element.querySelector('.analytics-section');
    if (!analyticsSection) return;

    // Show section if hidden
    if (analyticsSection.style.display === 'none') {
      analyticsSection.style.display = 'block';
    }

    const cardsList = analyticsSection.querySelector('.parcel-cards-list');
    if (!cardsList) return;

    const existingIndex = this.selectedParcelsRegistry.findIndex(
      p => p.id == parcelId
    );

    if (existingIndex !== -1) {
      // Check if we need to enrich data for existing items
      const stored = this.selectedParcelsRegistry[existingIndex];
      if (!stored.particella && parcelData.particella) {
        console.log('Updating stored parcel with new data:', parcelId);
        this.updateParcel(parcelId, parcelData);
        this.renderAllCards();
      } else {
        console.log('Parcel already in analytics:', parcelId);
      }
      return;
    }

    // Add new parcel and render its card
    this.addParcel(parcelData);
    const storedParcel = this.getParcel(parcelId);
    this.renderCard(cardsList, storedParcel);
  }

  /**
   * Render a single parcel analytics card
   * @param {HTMLElement} container - Container to append card to
   * @param {Object} parcelData - Parcel data to render
   */
  renderCard(container, parcelData) {
    const card = new ParcelAnalyticsCard(
      parcelData,
      this.apiService,
      this.translation,
      parcelId => this.handleRemoveCard(parcelId, container)
    );

    const cardElement = card.render();
    container.appendChild(cardElement);
  }

  /**
   * Handle card removal
   * @param {string|number} parcelId - Parcel ID to remove
   * @param {HTMLElement} container - Cards container
   */
  handleRemoveCard(parcelId, container) {
    this.removeParcel(parcelId);

    // Remove card element
    const cardElement = container.querySelector(
      `[data-parcel-id="${parcelId}"]`
    );
    if (cardElement) {
      cardElement.remove();
    }

    // Hide section if no cards left
    if (container.children.length === 0) {
      const analyticsSection = this.element.querySelector('.analytics-section');
      if (analyticsSection) {
        analyticsSection.style.display = 'none';
      }
    }
  }

  /**
   * Render all parcel cards from registry
   */
  renderAllCards() {
    if (!this.element) return;

    const analyticsSection = this.element.querySelector('.analytics-section');
    if (!analyticsSection) return;

    const cardsList = analyticsSection.querySelector('.parcel-cards-list');
    if (!cardsList) return;

    // Clear existing cards
    cardsList.innerHTML = '';

    if (this.selectedParcelsRegistry.length === 0) {
      analyticsSection.style.display = 'none';
      return;
    }

    // Show section and render all cards
    analyticsSection.style.display = 'block';
    this.selectedParcelsRegistry.forEach(parcelData => {
      this.renderCard(cardsList, parcelData);
    });
  }

  /**
   * Setup language change listener
   */
  setupLanguageListener() {
    this.languageUnsubscribe = this.translation.onLanguageChange(() => {
      this.reRenderWithTranslations();
    });

    if (!this.translation.translationsLoaded()) {
      this.translation.waitForTranslations().then(() => {
        this.reRenderWithTranslations();
      });
    }
  }

  /**
   * Re-render component with updated translations
   */
  reRenderWithTranslations() {
    if (this.element && this.element.parentNode) {
      const currentRegistry = [...this.selectedParcelsRegistry];

      const oldElement = this.element;
      this.element = null;

      const newElement = this.render();
      oldElement.parentNode.replaceChild(newElement, oldElement);

      this.selectedParcelsRegistry = currentRegistry;
      this.renderAllCards();
    }
  }

  /**
   * Cleanup and destroy component
   */
  destroy() {
    if (this.languageUnsubscribe) {
      this.languageUnsubscribe();
      this.languageUnsubscribe = null;
    }

    this.element = null;
    this.parcelsLayer = null;
  }
}
