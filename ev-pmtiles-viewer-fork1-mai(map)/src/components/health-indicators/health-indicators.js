import './health-indicators.css';
import { ApiService } from '../../services/api/api-service.js';
import { useTranslation } from '../../i18n/hooks/useTranslation.js';

export class HealthIndicators {
  constructor() {
    this.element = null;
    this.apiService = new ApiService(import.meta.env.VITE_X_API_URL || '');
    this.translation = useTranslation();
    this.dbIndicator = null;
    this.apiIndicator = null;
  }

  render() {
    const { t } = this.translation;

    const container = document.createElement('div');
    container.className = 'health-indicators';

    container.innerHTML = `
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
    `;

    this.element = container;
    this._cacheIndicatorElements();

    return this.element;
  }

  _cacheIndicatorElements() {
    if (!this.element) return;

    this.dbIndicator = this.element.querySelector('#db-indicator');
    this.apiIndicator = this.element.querySelector('#api-indicator');
  }

  async init() {
    if (this.translation.translationsLoaded()) {
      await this._performHealthChecks();
    } else {
      await this.translation.waitForTranslations();
      await this._performHealthChecks();
    }
  }

  async _performHealthChecks() {
    await Promise.all([this.checkApiStatus(), this.checkDatabaseStatus()]);
  }

  async checkApiStatus() {
    if (!this.apiIndicator) return;

    try {
      const response = await this.apiService.get('/hello');

      if (response.status === 'ok') {
        this._setIndicatorStatus(this.apiIndicator, 'ok', 'var(--color-green)');
      } else {
        this._setIndicatorStatus(
          this.apiIndicator,
          'warning',
          'var(--color-orange)'
        );
      }
    } catch (error) {
      console.error('Failed to check API status:', error);
      this._setIndicatorStatus(this.apiIndicator, 'error', 'var(--color-red)');
    }
  }

  async checkDatabaseStatus() {
    if (!this.dbIndicator) return;

    try {
      const data = await this.apiService.get('/core-secure/db-status', {
        headers: {
          'X-API-Key': import.meta.env.VITE_X_API_KEY || '',
          'Content-Type': 'application/json'
        }
      });

      if (data.status === 'healthy') {
        this._setIndicatorStatus(this.dbIndicator, 'ok', 'var(--color-green)');
      } else if (data.status === 'degraded') {
        this._setIndicatorStatus(
          this.dbIndicator,
          'warning',
          'var(--color-orange)'
        );
      } else {
        this._setIndicatorStatus(this.dbIndicator, 'error', 'var(--color-red)');
      }
    } catch (error) {
      console.error('Failed to check database status:', error);
      this._setIndicatorStatus(this.dbIndicator, 'error', 'var(--color-red)');
    }
  }

  _setIndicatorStatus(indicator, status, color) {
    if (!indicator) return;

    indicator.className = `status-indicator ${status}`;
    indicator.style.backgroundColor = color;
  }

  updateTranslations() {
    if (!this.element) return;

    const { t } = this.translation;
    const dbIcon = this.element.querySelector('#db-status-icon');
    const apiIcon = this.element.querySelector('#api-status-icon');

    if (dbIcon) {
      dbIcon.setAttribute('title', t('sidebar.right.databaseStatus'));
    }
    if (apiIcon) {
      apiIcon.setAttribute('title', t('sidebar.right.apiStatus'));
    }
  }

  destroy() {
    this.element = null;
    this.dbIndicator = null;
    this.apiIndicator = null;
  }
}
