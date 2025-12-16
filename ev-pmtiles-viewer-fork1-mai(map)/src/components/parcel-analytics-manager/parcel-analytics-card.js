/**
 * ParcelAnalyticsCard
 * Individual expandable card for displaying parcel analytics
 * Handles UI rendering and detail fetching for a single parcel
 */
export class ParcelAnalyticsCard {
  constructor(parcelData, apiService, translation, onRemove) {
    this.parcelData = parcelData;
    this.apiService = apiService;
    this.translation = translation;
    this.onRemove = onRemove;
    this.element = null;
    this.detailsExpanded = false;
  }

  /**
   * Render the card element
   * @returns {HTMLElement} The rendered card element
   */
  render() {
    const parcelId = this.parcelData.id;
    const { t } = this.translation;

    const cardHTML = `
      <div class="parcel-analytics-card" data-parcel-id="${parcelId}" style="display: flex; flex-direction: column; padding: 0.75rem; background: rgba(255,255,255,0.08); border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span class="parcel-id" style="font-weight: 500; color: white; font-size: 0.85rem; flex: 1;">
            ${parcelId}
          </span>
          <div class="card-actions" style="display: flex; gap: 0.5rem;">
            <button class="card-action-btn expand-details-btn" data-action="expand" 
              style="height:24px; padding: 0.25rem 0.5rem; background: var(--color-primary); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: 600;"
              title="${t('sidebar.right.expandDetails') || 'Expand Details'}">
              +
            </button>
            <button class="card-action-btn remove-card-btn" data-action="remove" 
              style="height:24px; padding: 0.25rem 0.5rem; background: var(--color-red); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: 600;"
              title="${t('sidebar.right.removeParcel') || 'Remove'}">
              🗑
            </button>
          </div>
        </div>
        <div class="card-details" style="display: none; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.8rem;">
          <div class="details-loading">${t('sidebar.right.loadingDetails') || 'Loading details...'}</div>
          <div class="details-content"></div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = cardHTML;
    this.element = wrapper.firstElementChild;

    this.attachEventListeners();

    return this.element;
  }

  /**
   * Attach event listeners to card buttons
   */
  attachEventListeners() {
    if (!this.element) return;

    const expandBtn = this.element.querySelector('[data-action="expand"]');
    const removeBtn = this.element.querySelector('[data-action="remove"]');
    const detailsContainer = this.element.querySelector('.card-details');

    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        this.toggleDetails(detailsContainer, expandBtn);
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (this.onRemove) {
          this.onRemove(this.parcelData.id);
        }
      });
    }
  }

  /**
   * Toggle card details expansion
   * @param {HTMLElement} detailsContainer - Details container element
   * @param {HTMLElement} expandBtn - Expand button element
   */
  toggleDetails(detailsContainer, expandBtn) {
    const isHidden = detailsContainer.style.display === 'none';
    detailsContainer.style.display = isHidden ? 'block' : 'none';
    expandBtn.textContent = isHidden ? '-' : '+';
    this.detailsExpanded = isHidden;

    if (isHidden && !this.detailsFetched) {
      this.fetchAndDisplayDetails();
    }
  }

  /**
   * Fetch and display detailed analytics for the parcel
   */
  async fetchAndDisplayDetails() {
    if (!this.element) return;

    const detailsContent = this.element.querySelector('.details-content');
    const loadingIndicator = this.element.querySelector('.details-loading');
    const { t } = this.translation;

    if (!detailsContent || !loadingIndicator) return;

    try {
      let html = '';

      // Basic info from stored data
      if (this.parcelData.particella) {
        html += `<div style="margin-bottom: 4px;"><span style="opacity: 0.7;">${t('sidebar.right.particella') || 'Particella'}:</span> ${this.parcelData.particella}</div>`;
      }
      if (this.parcelData.municipality_zona_omi) {
        html += `<div style="margin-bottom: 4px;"><span style="opacity: 0.7;">${t('sidebar.right.zonaOmi') || 'Zona OMI'}:</span> ${this.parcelData.municipality_zona_omi}</div>`;
      }

      // Fetch Census Data
      if (this.parcelData.bt_pg_r00_21_sez21_id) {
        try {
          const response = await this.apiService.get(
            `/single_bt_pg_r00_21/${this.parcelData.bt_pg_r00_21_sez21_id}`
          );
          if (response.status === 'success' && response.data) {
            html += `<div style="margin-top: 8px; font-weight: 600; color: var(--color-primary);">${t('sidebar.right.censusData') || 'Census Data'}</div>`;
            html += `<div style="margin-bottom: 4px;"><span style="opacity: 0.7;">${t('sidebar.right.families') || 'Families'}:</span> ${response.data.fam21 || 'N/A'}</div>`;
            html += `<div style="margin-bottom: 4px;"><span style="opacity: 0.7;">${t('sidebar.right.buildings') || 'Buildings'}:</span> ${response.data.edi21 || 'N/A'}</div>`;
          }
        } catch (e) {
          console.error('Error fetching census data', e);
        }
      }

      // Fetch OMI Data (Real Estate Values)
      if (this.parcelData.municipality_zona_omi) {
        const omiParts = this.parcelData.municipality_zona_omi.split('|');
        if (omiParts.length >= 2) {
          const comuneAmm = omiParts[0];
          const zona = omiParts[1];
          try {
            const response = await this.apiService.get(
              `/single_omi_qi_20242_valori_fixed/${comuneAmm}/${zona}`
            );
            if (
              response.status === 'success' &&
              response.data &&
              response.data.length > 0
            ) {
              html += `<div style="margin-top: 8px; font-weight: 600; color: var(--color-primary);">${t('sidebar.right.realEstateOmi') || 'Real Estate (OMI)'}</div>`;
              const records = response.data.slice(0, 3); // Show top 3
              records.forEach(r => {
                html += `<div style="margin-bottom: 2px; font-size: 0.75rem;">${r.descr_tipologia}</div>`;
                html += `<div style="margin-bottom: 4px; opacity: 0.8;">€${r.compr_min}-${r.compr_max}/m²</div>`;
              });
            }
          } catch (e) {
            console.error('Error fetching OMI data', e);
          }
        }
      }

      detailsContent.innerHTML =
        html ||
        `<div style="opacity: 0.7; font-style: italic; font-size: 0.75rem;">${t('sidebar.right.noAdditionalDetails') || 'No additional details available. Try clicking the parcel on the map again to update data.'}</div>`;
      loadingIndicator.style.display = 'none';
      this.detailsFetched = true;
    } catch (error) {
      console.error('Error fetching details:', error);
      detailsContent.innerHTML =
        t('sidebar.right.errorLoadingDetails') || 'Error loading details.';
      loadingIndicator.style.display = 'none';
    }
  }

  /**
   * Update card with new translations
   */
  updateTranslations() {
    // Re-render if needed when language changes
    if (this.element && this.element.parentNode) {
      const parent = this.element.parentNode;
      const newElement = this.render();
      parent.replaceChild(newElement, this.element);

      // Restore expanded state if was expanded
      if (this.detailsExpanded) {
        const detailsContainer = this.element.querySelector('.card-details');
        const expandBtn = this.element.querySelector('[data-action="expand"]');
        if (detailsContainer && expandBtn) {
          detailsContainer.style.display = 'block';
          expandBtn.textContent = '-';
        }
      }
    }
  }

  /**
   * Destroy card and cleanup
   */
  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
