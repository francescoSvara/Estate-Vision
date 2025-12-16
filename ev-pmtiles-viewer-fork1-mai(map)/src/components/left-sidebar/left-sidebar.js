import './left-sidebar.css';
import { useTranslation } from '../../i18n/hooks/useTranslation.js';

export class LeftSidebar {
  constructor(onPortfolioClick = null, onGraphClick = null) {
    this.element = null;
    this.translation = useTranslation();
    this.onPortfolioClick = onPortfolioClick;
    this.onGraphClick = onGraphClick;
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
          <div class="sidebar-portfolio-link" style="padding: 1rem; border-top: 1px solid var(--bg-current-line, #dee2e6); display: flex; flex-direction: column; gap: 0.5rem;">
             <button id="sidebar-portfolio-btn" class="sidebar-nav-btn">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <rect x="3" y="3" width="7" height="7"></rect>
                 <rect x="14" y="3" width="7" height="7"></rect>
                 <rect x="14" y="14" width="7" height="7"></rect>
                 <rect x="3" y="14" width="7" height="7"></rect>
               </svg>
               ${t('Portfolio Analysis') || 'Portfolio'}
             </button>
             
             <button id="sidebar-graph-btn" class="sidebar-nav-btn">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <circle cx="18" cy="5" r="3"></circle>
                 <circle cx="6" cy="12" r="3"></circle>
                 <circle cx="18" cy="19" r="3"></circle>
                 <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                 <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
               </svg>
               ${t('Relationship Graph') || 'Graph'}
             </button>
          </div>
        </main>
        
        <footer class="sidebar-footer">
          <div class="app-info">
            <span class="version">v1.0.1</span>
          </div>
        </footer>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = sidebarHTML;
    this.element = wrapper.firstElementChild;

    // Setup language change listener
    this.setupLanguageListener();

    // Attach portfolio button listener
    const portfolioBtn = this.element.querySelector('#sidebar-portfolio-btn');
    if (portfolioBtn && this.onPortfolioClick) {
      portfolioBtn.addEventListener('click', () => {
        this.onPortfolioClick();
      });
    }

    // Attach graph button listener
    const graphBtn = this.element.querySelector('#sidebar-graph-btn');
    if (graphBtn && this.onGraphClick) {
      graphBtn.addEventListener('click', () => {
        this.onGraphClick();
      });
    }

    return this.element;
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
      // Re-render the sidebar
      const oldElement = this.element;
      this.element = null;

      const newElement = this.render();
      oldElement.parentNode.replaceChild(newElement, oldElement);
    }
  }
}
