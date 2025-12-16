/**
 * Parcel Zone Selector Component
 * Dropdown selector for parcel zones from selected municipality
 */

import './parcel-zone-selector.css';
import {
  fetchParcelZonesByMunicipality,
  formatParcelZonesForDisplay
} from '../../../services/api/parcel-zone-api.js';

export class ParcelZoneSelector {
  constructor(onSelectionChange = null) {
    this.element = null;
    this.parcelZones = [];
    this.formattedParcelZones = [];
    this.selectedParcelZone = null;
    this.selectedMunicipality = null;
    this.onSelectionChange = onSelectionChange;
    this.isLoading = false;
    this.isDisabled = true; // Disabled by default until municipality is selected
  }

  /**
   * Update the parcel zone list based on selected municipality
   * @param {Object} municipality - Selected municipality object with pro_com
   */
  async updateParcelZonesForMunicipality(municipality) {
    if (!municipality || !municipality.pro_com) {
      console.warn('⚠️ Invalid municipality provided to parcel zone selector');
      this.clearParcelZones();
      return;
    }

    this.selectedMunicipality = municipality;
    this.selectedParcelZone = null;
    this.isLoading = true;
    this.isDisabled = false;

    // Update UI to show loading state
    if (this.element) {
      this.updateContent();
    }

    // _onsole.log(`🏠 Loading parcel zones for municipality: ${municipality.comune} (${municipality.pro_com})`);

    try {
      // Fetch parcel zones from the API
      const response = await fetchParcelZonesByMunicipality(
        municipality.pro_com
      );

      if (response.success && response.data && response.data.parcels) {
        this.parcelZones = response.data.parcels;
        this.formattedParcelZones = formatParcelZonesForDisplay(
          this.parcelZones
        );

        // _onsole.log(`✅ Loaded ${this.parcelZones.length} parcel zones for ${municipality.comune}`);
      } else {
        console.warn('⚠️ No parcel zones found or API error:', response.error);
        this.parcelZones = [];
        this.formattedParcelZones = [];
      }
    } catch (error) {
      console.error('❌ Error loading parcel zones:', error);
      this.parcelZones = [];
      this.formattedParcelZones = [];
    } finally {
      this.isLoading = false;

      // Update UI after loading
      if (this.element) {
        this.updateContent();
      }
    }
  }

  /**
   * Clear parcel zones and disable the selector
   */
  clearParcelZones() {
    this.parcelZones = [];
    this.formattedParcelZones = [];
    this.selectedParcelZone = null;
    this.selectedMunicipality = null;
    this.isLoading = false;
    this.isDisabled = true;

    if (this.element) {
      this.updateContent();
    }
  }

  /**
   * Generate options HTML for the select dropdown
   * @returns {string} HTML string for select options
   */
  generateOptionsHTML() {
    if (this.isDisabled) {
      return '<option value="" disabled>Select a municipality first</option>';
    }

    if (this.isLoading) {
      return '<option value="" disabled>Loading parcel zones...</option>';
    }

    if (this.formattedParcelZones.length === 0) {
      const municipalityName =
        this.selectedMunicipality?.comune || 'this municipality';
      return `<option value="" disabled>No parcel zones found for ${municipalityName}</option>`;
    }

    const placeholderOption =
      '<option value="" disabled selected>Select Parcel Zone</option>';

    const parcelZoneOptions = this.formattedParcelZones
      .map(parcelZone => {
        return `<option value="${parcelZone.id}" 
                        data-inspireid-localid-2="${parcelZone.inspireid_localid_2 || ''}" 
                        title="${parcelZone.displayName}">${parcelZone.displayName}</option>`;
      })
      .join('');

    return placeholderOption + parcelZoneOptions;
  }

  /**
   * Render the parcel zone selector component
   * @returns {HTMLElement} The rendered component element
   */
  render() {
    if (this.element) {
      this.updateContent();
      return this.element;
    } else {
      const selectorHTML = `
        <div class="${this.isDisabled ? 'disabled' : ''}" style="margin-bottom: 0.5rem;">
          <!--<label for="parcel-zone-select" class="selector-label">
            <span class="label-text">Available Parcel Zones</span>
            <span class="parcel-zone-count">${this.isLoading ? '...' : `(${this.formattedParcelZones.length})`}</span>
          </label>-->
          <select id="parcel-zone-select" class="parcel-zone-select" ${this.isDisabled ? 'disabled' : ''}>
            ${this.generateOptionsHTML()}
          </select>
        </div>
      `;

      const wrapper = document.createElement('div');
      wrapper.innerHTML = selectorHTML;
      this.element = wrapper.firstElementChild;

      this.attachEventListeners();
      return this.element;
    }
  }

  /**
   * Update the content of existing element without recreating it
   */
  updateContent() {
    if (!this.element) return;

    // Update disabled state
    this.element.className = `${this.isDisabled ? 'disabled' : ''}`;

    // Update parcel zone count
    const countElement = this.element.querySelector('.parcel-zone-count');
    if (countElement) {
      countElement.textContent = this.isLoading
        ? '...'
        : `(${this.formattedParcelZones.length})`;
    }

    // Update select options and disabled state
    const selectElement = this.element.querySelector('.parcel-zone-select');
    if (selectElement) {
      selectElement.innerHTML = this.generateOptionsHTML();
      selectElement.disabled = this.isDisabled || this.isLoading;
    }
  }

  /**
   * Attach event listeners to the select dropdown
   */
  attachEventListeners() {
    if (!this.element) return;

    const selectElement = this.element.querySelector('.parcel-zone-select');
    if (selectElement) {
      selectElement.addEventListener('change', e => {
        const selectedParcelZoneId = e.target.value;
        const selectedParcelZone = this.formattedParcelZones.find(
          pz => pz.id === selectedParcelZoneId
        );

        this.selectedParcelZone = selectedParcelZone;

        // Call the selection change callback if provided
        if (this.onSelectionChange && selectedParcelZone) {
          this.onSelectionChange(selectedParcelZone, this.selectedMunicipality);
        }

        // _onsole.log('🏠 Parcel Zone selected:', selectedParcelZone);
      });
    }
  }

  /**
   * Get the currently selected parcel zone
   * @returns {Object|null} Selected parcel zone object or null
   */
  getSelectedParcelZone() {
    return this.selectedParcelZone;
  }

  /**
   * Get the currently selected municipality
   * @returns {Object|null} Selected municipality object or null
   */
  getSelectedMunicipality() {
    return this.selectedMunicipality;
  }

  /**
   * Clear the current selection
   */
  clearSelection() {
    this.selectedParcelZone = null;
    const selectElement = this.element?.querySelector('.parcel-zone-select');
    if (selectElement && !selectElement.disabled) {
      selectElement.selectedIndex = 0; // Reset to placeholder
    }
  }

  /**
   * Get the total count of parcel zones
   * @returns {number} Number of parcel zones
   */
  getParcelZoneCount() {
    return this.formattedParcelZones.length;
  }

  /**
   * Check if the selector is currently loading
   * @returns {boolean} Loading state
   */
  isLoadingState() {
    return this.isLoading;
  }

  /**
   * Check if the selector is currently disabled
   * @returns {boolean} Disabled state
   */
  isDisabledState() {
    return this.isDisabled;
  }
}
