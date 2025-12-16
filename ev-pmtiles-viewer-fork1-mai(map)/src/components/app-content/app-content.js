import './app-content.css';
import '../popup/popup-modal.css';
// import { LeftSidebar } from '../left-sidebar/left-sidebar.js'; // Removed LeftSidebar
// import { RightSidebar } from '../right-sidebar/right-sidebar.js'; // Removed RightSidebar
import { AuxiliaryButtonGroup } from '../auxiliary-button-group/auxiliary-button-group.js';
import { InfoModal } from '../info-modal/info-modal.js';
import { MainMap } from '../map/map.js';
import { TopSearch } from '../top-search/top-search.js';
import { PortfolioView } from '../portfolio-view/portfolio-view.js';
import { AssetDetailsView } from '../asset-details-view/asset-details-view.js';
import { ZoneAnalyticsView } from '../zone-analytics-view/zone-analytics-view.js';
import { GraphView } from '../graph-view/graph-view.js';
import { ProfileView } from '../profile-view/profile-view.js';

export class AppContent {
  constructor() {
    this.element = null;
    this.portfolioView = null;
    this.assetDetailsView = null;
    this.zoneAnalyticsView = null; // New View
    this.graphView = null;
    this.profileView = null; // New Profile View
    this.currentView = 'map'; // 'map', 'assets', 'details', 'inspector', 'zone-analytics', 'profile'
    this.lastView = 'map';

    // Create map instance internally - it will handle everything internally
    this.mainMap = new MainMap('map');

    // Create auxiliary button group first so it can be passed to map
    this.auxiliaryButtonGroup = new AuxiliaryButtonGroup();

    // Create top search component
    this.topSearch = new TopSearch();

    // Create info modal
    this.infoModal = new InfoModal();

    // Removed LeftSidebar initialization
    this.leftSidebar = null;
    // this.rightSidebar = new RightSidebar(); // Removed RightSidebar

    // References for external components
    // this.rightToggleButton = null; // Removed
  }

  init() {
    // Get the app container
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container with ID "app" not found');
    }

    // Clear the app container
    appContainer.innerHTML = '';
    
    // Create and mount main content (now includes header)
    const appContentElement = this.render();
    appContainer.appendChild(appContentElement);

    const mapContainer = document.getElementById('map');
    if (mapContainer && this.mainMap) {
      this.mainMap
        .init()
        .then(() => {
          console.log('✓ AppContent: Map initialized successfully');

          // Create and mount right sidebar (initially hidden) - Removed
          // const rightSidebarElement = this.rightSidebar.render();
          // document.body.appendChild(rightSidebarElement); // Append to body for fixed positioning

          // Update map with sidebar references
          if (this.mainMap) {
            // this.mainMap.setLeftSidebar(this.leftSidebar); // Removed
            // this.mainMap.setRightSidebar(this.rightSidebar); // Removed
            this.mainMap.setAuxiliaryButtonGroup(this.auxiliaryButtonGroup);
            // Set LayerControls reference directly for cleaner architecture - Removed as LeftSidebar is gone
            // this.mainMap.setLayerControls(this.leftSidebar.layerControls);
          }

          // Initialize components after all HTML elements are ready
          // this.auxiliaryButtonGroup.setRightSidebar(this.rightSidebar); // Removed
          this.auxiliaryButtonGroup.init();
          // this.rightSidebar.setAuxiliaryButtonGroup(this.auxiliaryButtonGroup); // Removed
          this.infoModal.init();
          this.infoModal.setAuxiliaryButtonGroup(this.auxiliaryButtonGroup);

          // Add event listener for custom navigation events from the map
          const mapElement = document.getElementById('map');
          if (mapElement) {
              mapElement.addEventListener('navigate', (e) => {
                  if (e.detail && e.detail.view) {
                      this.setView(e.detail.view, e.detail.data);
                  }
              });
          }
        })
        .catch(error => {
          console.error('❌ Failed to initialize map:', error);
        });
    } else {
      // Retry after 200ms if not ready
      setTimeout(() => {
        this.init();
        console.log('Retrying AppContent initialization...');
      }, 200);
    }
  }

  render() {
    const baseUrl = import.meta.env.BASE_URL;
    const mainContentHTML = `
      <div class="main-content">
        <header class="app-header">
            <div class="header-logo" style="cursor: pointer;">
                <img src="${baseUrl}i18n/translations/EstateVision_LogoEsteso_Bianco.png" alt="EV Dashboard" class="header-logo-img" />
            </div>
            <nav class="header-nav">
                <button class="nav-link" data-view="assets">ASSETS</button>
                <button class="nav-link" data-view="inspector">INSPECTOR</button>
                <button class="nav-link" data-view="map">MAP</button>
                <button class="support-btn" id="support-btn" aria-label="Supporto" style="margin-left:1.5rem;display:flex;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;padding:0.25rem 0.5rem;border-radius:50%;transition:background 0.2s;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </button>
                <div class="header-profile">
                    <button class="nav-link profile-btn" data-view="profile" aria-label="Profile">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </button>
                </div>
            </nav>
        </header>
        <main>
          <div id="map"></div>
          <div id="top-search-mount-point"></div>
          <div id="auxiliary-button-group-container"></div>
          <div id="portfolio-view-container" style="display: none;"></div>
          <div id="asset-details-view-container" style="display: none;"></div>
          <div id="zone-analytics-view-container" style="display: none;"></div>
          <div id="graph-view-container" style="display: none;"></div>
          <div id="profile-view-container" style="display: none;"></div>
        </main>
      </div>
    `;
    // Support button listener: mostra modale di supporto
    setTimeout(() => {
      const supportBtn = this.element.querySelector('#support-btn');
      if (supportBtn) {
        let supportModal = null;
        const legendHTML = `
          <div class="map-legend" style="max-width: 480px; margin: 0 auto; background: #23272f; border-radius: 12px; box-shadow: 0 2px 12px #0002; padding: 2rem 1.5rem; font-size: 1.1rem; color: #fff;">
            <div id="legend-dropdown-toggle" style="cursor:pointer;display:flex;align-items:center;gap:0.5rem;user-select:none;">
              <span style="font-size:1.4rem;font-weight:bold;letter-spacing:0.5px;">Map Legend</span>
              <span id="legend-arrow" style="transition:transform 0.2s;font-size:1.2rem;">&#9660;</span>
            </div>
            <div id="legend-dropdown-content" style="margin-top:1.2rem;max-height:0;overflow:hidden;transition:max-height 0.35s cubic-bezier(.4,0,.2,1),opacity 0.3s;opacity:0;">
              <div style="display: flex; align-items: flex-start; gap: 0.7rem; margin-bottom: 1.1rem;">
                <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#228B22;margin-top:2px;"></span>
                <div><b>Natural Areas</b><br><span style='font-size:12px;color:#888;'>Forests, parks, and protected green zones.</span></div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 0.7rem; margin-bottom: 1.1rem;">
                <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#32CD32;margin-top:2px;"></span>
                <div><b>Agriculture</b><br><span style='font-size:12px;color:#888;'>Fields and cultivated land for crops or livestock.</span></div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 0.7rem; margin-bottom: 1.1rem;">
                <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#1E90FF;margin-top:2px;"></span>
                <div><b>Water Facilities</b><br><span style='font-size:12px;color:#888;'>Water plants, reservoirs, and aqueducts.</span></div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 0.7rem; margin-bottom: 1.1rem;">
                <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#90EE90;margin-top:2px;"></span>
                <div><b>Cultural Interest</b><br><span style='font-size:12px;color:#888;'>Areas of historical or cultural value.</span></div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 0.7rem; margin-bottom: 1.1rem;">
                <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#00CED1;margin-top:2px;"></span>
                <div><b>Wetlands & Water Zones</b><br><span style='font-size:12px;color:#888;'>Lakes, rivers, marshes, and wetland habitats.</span></div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 0.7rem; margin-bottom: 1.1rem;">
                <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#696969;margin-top:2px;"></span>
                <div><b>Other</b><br><span style='font-size:12px;color:#888;'>Miscellaneous or undefined land use.</span></div>
              </div>
            </div>
          </div>
        `;
        supportBtn.addEventListener('click', () => {
          if (!supportModal) {
            import('../main-modal/main-modal.js').then(({ MainModal }) => {
              supportModal = new MainModal('Support & FAQ', legendHTML);
              document.body.appendChild(supportModal.render());
              supportModal.show();
              setTimeout(() => {
                const toggle = document.getElementById('legend-dropdown-toggle');
                const content = document.getElementById('legend-dropdown-content');
                const arrow = document.getElementById('legend-arrow');
                if (toggle && content && arrow) {
                  let open = false;
                  toggle.addEventListener('click', () => {
                    open = !open;
                    if (open) {
                      content.style.maxHeight = content.scrollHeight + 'px';
                      content.style.opacity = '1';
                      arrow.style.transform = 'rotate(180deg)';
                    } else {
                      content.style.maxHeight = '0';
                      content.style.opacity = '0';
                      arrow.style.transform = 'rotate(0deg)';
                    }
                  });
                }
              }, 100);
            });
          } else {
            supportModal.setTitle('Support & FAQ');
            supportModal.setContent(legendHTML);
            supportModal.show();
            setTimeout(() => {
              const toggle = document.getElementById('legend-dropdown-toggle');
              const content = document.getElementById('legend-dropdown-content');
              const arrow = document.getElementById('legend-arrow');
              if (toggle && content && arrow) {
                let open = false;
                toggle.addEventListener('click', () => {
                  open = !open;
                  if (open) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.opacity = '1';
                    arrow.style.transform = 'rotate(180deg)';
                  } else {
                    content.style.maxHeight = '0';
                    content.style.opacity = '0';
                    arrow.style.transform = 'rotate(0deg)';
                  }
                });
              }
            }, 100);
          }
        });
      }
    }, 0);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = mainContentHTML;
    this.element = wrapper.firstElementChild;

    // Attach Header Navigation Listeners
    const navLinks = this.element.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const btn = e.currentTarget; // Ensure we get the button, not inner SVG
            const view = btn.getAttribute('data-view');
            if (view) this.setView(view);
        });
    });

    // Make Logo Clickable
    const logo = this.element.querySelector('.header-logo');
    if (logo) {
        logo.addEventListener('click', () => {
            this.setView('map');
        });
    }

    // Mount Top Search
    const topSearchMountPoint = this.element.querySelector('#top-search-mount-point');
    if (topSearchMountPoint) {
      const topSearchElement = this.topSearch.render();
      topSearchMountPoint.appendChild(topSearchElement);
    }

    // Initialize Portfolio View
    this.portfolioView = new PortfolioView(() => this.setView('map'));
    const portfolioContainer = this.element.querySelector('#portfolio-view-container');
    if (portfolioContainer) {
      portfolioContainer.appendChild(this.portfolioView.render());
    }
    
    // Set callback for asset selection
    this.portfolioView.onAssetSelect = (assetData) => {
        this.setView('details', assetData);
    };


    // Initialize Asset Details View
    this.assetDetailsView = new AssetDetailsView(() => this.setView(this.lastView === 'assets' ? 'assets' : 'map'));
    const detailsContainer = this.element.querySelector('#asset-details-view-container');
    if (detailsContainer) {
      detailsContainer.appendChild(this.assetDetailsView.render());
    }

    // Initialize Zone Analytics View
    this.zoneAnalyticsView = new ZoneAnalyticsView(() => this.setView('map'));
    const zoneContainer = this.element.querySelector('#zone-analytics-view-container');
    if (zoneContainer) {
      zoneContainer.appendChild(this.zoneAnalyticsView.render());
    }

    // Initialize Graph View
    this.graphView = new GraphView(() => this.setView('map'));
    const graphContainer = this.element.querySelector('#graph-view-container');
    if (graphContainer) {
      graphContainer.appendChild(this.graphView.render());
    }

    // Initialize Profile View
    this.profileView = new ProfileView(() => this.setView('map'));
    const profileContainer = this.element.querySelector('#profile-view-container');
    if (profileContainer) {
      profileContainer.appendChild(this.profileView.render());
    }

    return this.element;
  }

  setView(viewName, data = null) {
    const isViewChange = (this.currentView !== viewName);
    
    if (isViewChange) {
        this.lastView = this.currentView;
        this.currentView = viewName;
    }

    const mapContainer = this.element.querySelector('#map');
    const topSearch = this.element.querySelector('#top-search-mount-point');
    const auxButtons = this.element.querySelector('#auxiliary-button-group-container');
    
    const portfolioContainer = this.element.querySelector('#portfolio-view-container');
    const detailsContainer = this.element.querySelector('#asset-details-view-container');
    const zoneContainer = this.element.querySelector('#zone-analytics-view-container');
    const graphContainer = this.element.querySelector('#graph-view-container');
    const profileContainer = this.element.querySelector('#profile-view-container');

    // Reset visibility
    if (mapContainer) mapContainer.style.visibility = 'hidden';
    if (topSearch) topSearch.style.display = 'none';
    if (auxButtons) auxButtons.style.display = 'none';
    if (portfolioContainer) portfolioContainer.style.display = 'none';
    if (detailsContainer) detailsContainer.style.display = 'none';
    if (zoneContainer) zoneContainer.style.display = 'none';
    if (graphContainer) graphContainer.style.display = 'none';
    if (profileContainer) profileContainer.style.display = 'none';
    // Removed sidebar visibility toggle

    // Clear any "pinned" assets or search markers when switching views or resetting map
    if (viewName === 'map') {
        if (this.topSearch) {
            this.topSearch.clearMarker();
            this.topSearch.clearSearch();
        }
        if (this.mainMap && this.mainMap.layers && this.mainMap.layers['parcels']) {
             this.mainMap.layers['parcels'].clearParcelHighlight(this.mainMap.map);
        }
    }

    switch (viewName) {
      case 'map':
        if (mapContainer) mapContainer.style.visibility = 'visible';
        if (topSearch) topSearch.style.display = 'block';
        if (auxButtons) auxButtons.style.display = 'block';
        break;
      
      case 'assets':
        if (portfolioContainer) portfolioContainer.style.display = 'block';
        // Only refresh if it's a view change, not clicking the same button
        if (this.portfolioView && isViewChange) {
          this.portfolioView.refresh();
        }
        break;

      case 'details':
        if (detailsContainer) detailsContainer.style.display = 'block';
        if (this.assetDetailsView && data) this.assetDetailsView.setAsset(data);
        break;

      case 'zone-analytics':
        if (zoneContainer) zoneContainer.style.display = 'block';
        if (this.zoneAnalyticsView && data) this.zoneAnalyticsView.setZoneData(data);
        break;

      case 'inspector':
      case 'graph': // Support both names for compatibility
        if (graphContainer) graphContainer.style.display = 'block';
        if (this.graphView && data && data.assetData) {
          this.graphView.inspectAsset(data.assetData);
        }
        break;

      case 'profile':
        if (profileContainer) profileContainer.style.display = 'block';
        break;
    }

    // Update active state on nav links
    this.updateNavActiveState(viewName);
  }

  updateNavActiveState(activeView) {
    const navLinks = this.element.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const linkView = link.getAttribute('data-view');
      if (linkView === activeView) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Legacy support for previous refactor
  togglePortfolioMode(show) {
      this.setView(show ? 'assets' : 'map');
  }
}
