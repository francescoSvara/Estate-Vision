import './right-sidebar.css';
import { ApiService } from '../../services/api/api-service.js';
import { useTranslation } from '../../i18n/hooks/useTranslation.js';

export class RightSidebar {
  constructor(map = null, parcelsLayer = null) {
    this.element = null;
    this.isVisible = false;
    this.onClose = null;
    this.apiService = new ApiService(import.meta.env.VITE_X_API_URL || '');
    this.translation = useTranslation();
    this.parcelsStore = this.loadParcelsFromStorage();
    this.map = map;
    this.parcelsLayer = parcelsLayer;
  }

  loadParcelsFromStorage() {
    try {
      const stored = localStorage.getItem('ev-selected-parcels');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading parcels from storage:', error);
      return [];
    }
  }

  saveParcelsToStorage() {
    try {
      localStorage.setItem(
        'ev-selected-parcels',
        JSON.stringify(this.parcelsStore)
      );
    } catch (error) {
      console.error('Error saving parcels to storage:', error);
    }
  }

  addParcelToStore(parcelId) {
    if (!this.parcelsStore.includes(parcelId)) {
      this.parcelsStore.push(parcelId);
      this.saveParcelsToStorage();
      this.updateMapSelectedLayers();
      return true;
    }
    return false;
  }

  removeParcelFromStore(parcelId) {
    const index = this.parcelsStore.indexOf(parcelId);
    if (index !== -1) {
      this.parcelsStore.splice(index, 1);
      this.saveParcelsToStorage();
      this.updateMapSelectedLayers();
      return true;
    }
    return false;
  }

  updateMapSelectedLayers() {
    if (
      this.map &&
      this.parcelsLayer &&
      this.parcelsLayer.updateSelectedParcels
    ) {
      this.parcelsLayer.updateSelectedParcels(this.map, this.parcelsStore);
    }
  }

  setMap(map) {
    this.map = map;
  }

  setParcelsLayer(parcelsLayer) {
    this.parcelsLayer = parcelsLayer;
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
        
        <main class="sidebar-body">
          <div class="tools-section">
            <h4 class="section-title">${t('sidebar.right.tools')}</h4>
            <div class="tools-content">
              <button class="tool-btn" id="fullscreen-btn">${t('sidebar.right.toggleFullscreen')}</button>
            </div>
          </div>
        </main>
        
        <footer class="sidebar-footer">
          <div class="app-info">
            <div class="version-with-status">
              <div class="status-icons">
                <div class="status-icon" id="db-status-icon" title="${t('sidebar.right.databaseStatus')}">
                  <svg class="icon-db" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/>
                    <path d="m3 5 0 14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
                    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
                  </svg>
                  <span class="status-indicator checking" id="db-indicator"></span>
                </div>
                <div class="status-icon" id="api-status-icon" title="${t('sidebar.right.apiStatus')}">
                  <svg class="icon-api" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
                  </svg>
                  <span class="status-indicator checking" id="api-indicator"></span>
                </div>
              </div>
            </div>
            <p class="copyright">${t('sidebar.right.copyright')}</p>
          </div>
        </footer>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = sidebarHTML;
    this.element = wrapper.firstElementChild;

    this.addEventListeners();
    this.setupLanguageListener();

    // Wait for translations before checking API/DB status to ensure proper error messages
    if (this.translation.translationsLoaded()) {
      this.checkApiStatus();
      this.checkDatabaseStatus();
      this.renderAllParcels();
      this.updateMapSelectedLayers();
    } else {
      this.translation.waitForTranslations().then(() => {
        this.checkApiStatus();
        this.checkDatabaseStatus();
        this.renderAllParcels();
        this.updateMapSelectedLayers();
      });
    }

    return this.element;
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

    // Tool buttons
    const fullscreenBtn = this.element.querySelector('#fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  show() {
    if (this.element) {
      this.element.style.display = 'flex';
      this.isVisible = true;
    }
  }

  hide() {
    if (this.element) {
      this.element.style.display = 'none';
      this.isVisible = false;
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

  async checkApiStatus() {
    const statusIndicator = this.element?.querySelector('#api-indicator');
    if (!statusIndicator) return;

    try {
      // Call the hello API endpoint
      const response = await this.apiService.get('/hello');

      if (response.status === 'ok') {
        statusIndicator.className = 'status-indicator ok';
        statusIndicator.style.backgroundColor = 'var(--color-green)';
      } else {
        statusIndicator.className = 'status-indicator warning';
        statusIndicator.style.backgroundColor = 'var(--color-orange)';
      }
    } catch (error) {
      console.error('Failed to check API status:', error);
      statusIndicator.className = 'status-indicator error';
      statusIndicator.style.backgroundColor = 'var(--color-red)';
    }
  }

  async checkDatabaseStatus() {
    const statusIndicator = this.element?.querySelector('#db-indicator');
    if (!statusIndicator) return;

    try {
      // Call the secure database status endpoint with API key using ApiService
      const data = await this.apiService.get('/core-secure/db-status', {
        headers: {
          'X-API-Key': import.meta.env.VITE_X_API_KEY || '',
          'Content-Type': 'application/json'
        }
      });

      if (data.status === 'healthy') {
        statusIndicator.className = 'status-indicator ok';
        statusIndicator.style.backgroundColor = 'var(--color-green)';
      } else if (data.status === 'degraded') {
        statusIndicator.className = 'status-indicator warning';
        statusIndicator.style.backgroundColor = 'var(--color-orange)';
      } else {
        statusIndicator.className = 'status-indicator error';
        statusIndicator.style.backgroundColor = 'var(--color-red)';
      }
    } catch (error) {
      console.error('Failed to check database status:', error);
      statusIndicator.className = 'status-indicator error';
      statusIndicator.style.backgroundColor = 'var(--color-red)';
    }
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

  /**
   * Display particella information in the sidebar
   * @param {Object} parcelData - Parcel data from popup
   */
  displayParcellaInfo(parcelData) {
    if (!this.element) return;

    const parcelId = parcelData.pid_pg_parcels_251001;
    if (!parcelId) {
      console.warn('No parcel ID found in parcel data');
      return;
    }

    this.show();

    const toolsSection = this.element.querySelector('.tools-section');
    if (!toolsSection) return;

    let particellaSection = this.element.querySelector('.particella-section');

    if (!particellaSection) {
      particellaSection = document.createElement('div');
      particellaSection.className = 'particella-section';
      particellaSection.style.cssText =
        'margin-top: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;';

      const { t } = this.translation;
      particellaSection.innerHTML = `
        <h4 class="section-title" style="margin-bottom: 1rem; color: var(--color-primary); font-size: 0.9rem; font-weight: 600; text-transform: uppercase;">
          ${t('sidebar.right.selectedParcels') || 'SELECTED PARCELS'}
        </h4>
        <div class="parcels-list" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
      `;

      toolsSection.parentNode.insertBefore(particellaSection, toolsSection);
    }

    const parcelsList = particellaSection.querySelector('.parcels-list');
    if (!parcelsList) return;

    if (this.parcelsStore.includes(parcelId)) {
      console.log('Parcel already in list:', parcelId);
      return;
    }

    this.addParcelToStore(parcelId);
    this.renderParcelItem(parcelsList, parcelId);
  }

  renderParcelItem(container, parcelId) {
    const parcelItem = document.createElement('div');
    parcelItem.className = 'parcel-item';
    parcelItem.dataset.parcelId = parcelId;
    parcelItem.style.cssText =
      'display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255,255,255,0.08); border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);';

    parcelItem.innerHTML = `
      <span class="parcel-id" style="font-weight: 500; color: white; font-size: 0.85rem; flex: 1;">${parcelId}</span>
      <div class="parcel-actions" style="display: flex; gap: 0.5rem;">
        <button class="parcel-btn parcel-btn-details" data-action="details" style="padding: 0.25rem 0.5rem; background: var(--color-primary); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: 600;">+</button>
        <button class="parcel-btn parcel-btn-remove" data-action="remove" style="padding: 0.25rem 0.5rem; background: var(--color-red); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: 600;">🗑</button>
      </div>
    `;

    const detailsBtn = parcelItem.querySelector('[data-action="details"]');
    const removeBtn = parcelItem.querySelector('[data-action="remove"]');

    detailsBtn.addEventListener('click', () => {
      console.log('Show details for parcel:', parcelId);
    });

    removeBtn.addEventListener('click', () => {
      this.removeParcelFromStore(parcelId);
      parcelItem.remove();

      if (container.children.length === 0) {
        const particellaSection = this.element.querySelector(
          '.particella-section'
        );
        if (particellaSection) {
          particellaSection.remove();
        }
      }
    });

    container.appendChild(parcelItem);
  }

  renderAllParcels() {
    if (!this.element) return;

    const toolsSection = this.element.querySelector('.tools-section');
    if (!toolsSection) return;

    const existingSection = this.element.querySelector('.particella-section');
    if (existingSection) {
      existingSection.remove();
    }

    if (this.parcelsStore.length === 0) return;

    const particellaSection = document.createElement('div');
    particellaSection.className = 'particella-section';
    particellaSection.style.cssText =
      'margin-top: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;';

    const { t } = this.translation;
    particellaSection.innerHTML = `
      <h4 class="section-title" style="margin-bottom: 1rem; color: var(--color-primary); font-size: 0.9rem; font-weight: 600; text-transform: uppercase;">
        ${t('sidebar.right.selectedParcels') || 'SELECTED PARCELS'}
      </h4>
      <div class="parcels-list" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
    `;

    toolsSection.parentNode.insertBefore(particellaSection, toolsSection);

    const parcelsList = particellaSection.querySelector('.parcels-list');
    this.parcelsStore.forEach(parcelId => {
      this.renderParcelItem(parcelsList, parcelId);
    });
  }

  reRenderWithTranslations() {
    if (this.element && this.element.parentNode) {
      const parent = this.element.parentNode;
      const wasVisible = this.isVisible;

      parent.removeChild(this.element);

      const newElement = this.render();
      parent.appendChild(newElement);

      if (wasVisible) {
        this.show();
      }
    }
  }

  destroy() {
    // Cleanup language listener
    if (this.languageUnsubscribe) {
      this.languageUnsubscribe();
    }
    // Cleanup translation subscription if needed
    if (this.translation.cleanup) {
      this.translation.cleanup();
    }
  }
}
