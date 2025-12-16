/**
 * Municipality Selector Component
 * Dropdown selector for municipalities returned by bbox API
 */

import './municipality-selector.css';

export class MunicipalitySelector {
  constructor(onSelectionChange = null) {
    this.element = null;
    this.municipalities = [];
    this.selectedMunicipality = null;
    this.onSelectionChange = onSelectionChange;
  }

  /**
   * Update the municipalities list from API response
   * @param {Array} municipalities - Array of municipality objects from API
   */
  updateMunicipalities(municipalities) {
    this.municipalities = municipalities || [];
    // Note: We keep selectedMunicipality and label visible until user explicitly clears it
    // This allows the label to persist when map moves and dropdown refreshes

    if (this.element) {
      // Update existing content without re-rendering
      this.updateContent();

      // If there was a selected municipality, keep the label visible
      if (this.selectedMunicipality) {
        this.showSelectedMunicipalityLabel(this.selectedMunicipality);
      }
    }
  }

  /**
   * Generate options HTML for the select dropdown
   * @returns {string} HTML string for select options
   */
  generateOptionsHTML() {
    if (this.municipalities.length === 0) {
      return '<option value="" disabled>No municipalities available</option>';
    }

    const placeholderOption =
      '<option value="" disabled selected>Select Municipality</option>';

    const municipalityOptions = this.municipalities
      .map(municipality => {
        const populationText = municipality.pop21
          ? ` (${municipality.pop21.toLocaleString()})`
          : '';
        const distanceText = municipality.distance_km
          ? ` - ${parseFloat(municipality.distance_km).toFixed(1)}km`
          : '';
        const displayName = `${municipality.comune}${populationText}${distanceText}`;

        return `<option value="${municipality.pro_com}">${displayName}</option>`;
      })
      .join('');

    return placeholderOption + municipalityOptions;
  }

  /**
   * Render the municipality selector component
   * @returns {HTMLElement} The rendered component element
   */
  render() {
    if (this.element) {
      // Just update the content, don't recreate the element
      this.updateContent();
      return this.element;
    } else {
      // Create new element for the first time
      const selectorHTML = `
        <div>
          <div>
            <select id="municipality-select" class="municipality-select">
              ${this.generateOptionsHTML()}
            </select>
          </div>
          <div id="municipality-selected-label" class="municipality-selected-label" style="display: none;">
            <span class="selected-municipality-name"></span>
            <button class="clear-municipality-btn" aria-label="Clear municipality selection">×</button>
          </div>
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

    // Update municipality count
    const countElement = this.element.querySelector('.municipality-count');
    if (countElement) {
      countElement.textContent = `(${this.municipalities.length})`;
    }

    // Update select options
    const selectElement = this.element.querySelector('.municipality-select');
    if (selectElement) {
      selectElement.innerHTML = this.generateOptionsHTML();
    }
  }

  /**
   * Attach event listeners to the select dropdown
   */
  attachEventListeners() {
    if (!this.element) return;

    const selectElement = this.element.querySelector('.municipality-select');
    if (selectElement) {
      selectElement.addEventListener('change', e => {
        const selectedProCom = e.target.value;
        const selectedMunicipality = this.municipalities.find(
          m => m.pro_com === selectedProCom
        );

        this.selectedMunicipality = selectedMunicipality;

        // Update the selected municipality label (will replace previous one)
        this.showSelectedMunicipalityLabel(selectedMunicipality);

        // Call the selection change callback if provided
        if (this.onSelectionChange && selectedMunicipality) {
          this.onSelectionChange(selectedMunicipality);
        }

        console.log('🏛️ Municipality selected:', selectedMunicipality);
      });
    }

    // Attach event listener to the clear button
    const clearBtn = this.element.querySelector('.clear-municipality-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', e => {
        e.preventDefault();
        this.handleClearSelection();
      });
    }
  }

  /**
   * Get the currently selected municipality
   * @returns {Object|null} Selected municipality object or null
   */
  getSelectedMunicipality() {
    return this.selectedMunicipality;
  }

  /**
   * Show the selected municipality label
   * @param {Object} municipality - The selected municipality object
   */
  showSelectedMunicipalityLabel(municipality) {
    if (!municipality || !this.element) return;

    const labelElement = this.element.querySelector(
      '#municipality-selected-label'
    );
    const nameElement = this.element.querySelector(
      '.selected-municipality-name'
    );

    if (labelElement && nameElement) {
      const populationText = municipality.pop21
        ? ` (${municipality.pop21.toLocaleString()})`
        : '';
      const distanceText = municipality.distance_km
        ? ` - ${parseFloat(municipality.distance_km).toFixed(1)}km`
        : '';
      nameElement.textContent = `${municipality.comune}${populationText}${distanceText}`;
      labelElement.style.display = 'flex';
    }
  }

  /**
   * Hide the selected municipality label
   */
  hideSelectedMunicipalityLabel() {
    if (!this.element) return;

    const labelElement = this.element.querySelector(
      '#municipality-selected-label'
    );
    if (labelElement) {
      labelElement.style.display = 'none';
    }
  }

  /**
   * Handle clearing the municipality selection
   */
  handleClearSelection() {
    console.log('🧹 Clearing municipality selection');

    // Clear the selection
    this.clearSelection();

    // Hide the label
    this.hideSelectedMunicipalityLabel();

    // Call the selection change callback with null to reset dependent selectors
    if (this.onSelectionChange) {
      this.onSelectionChange(null);
    }
  }

  /**
   * Clear the current selection
   */
  clearSelection() {
    this.selectedMunicipality = null;
    const selectElement = this.element?.querySelector('.municipality-select');
    if (selectElement) {
      selectElement.selectedIndex = 0; // Reset to placeholder
    }
  }

  /**
   * Get the total count of municipalities
   * @returns {number} Number of municipalities
   */
  getMunicipalityCount() {
    return this.municipalities.length;
  }
}
