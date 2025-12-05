/**
 * Address Search Component
 * Simple text input for searching addresses
 */

import './address-search.css';

export class AddressSearch {
  constructor(onSelectionChange = null) {
    this.element = null;
    this.searchValue = '';
    this.onSelectionChange = onSelectionChange;
    this.debounceTimer = null;
    this.debounceDelay = 300; // 300ms debounce for search
  }

  /**
   * Render the address search component
   * @returns {HTMLElement} The rendered component element
   */
  render() {
    const searchHTML = `
      <div class="address-search">
        <div class="address-search-container">
          <label for="address-search-input" class="address-search-label">
            Search for Address
          </label>
          <div class="address-search-input-wrapper">
            <input 
              type="text" 
              id="address-search-input" 
              class="address-search-input"
              placeholder="Enter an address..."
              autocomplete="off"
            />
            <div class="address-search-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 14L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div class="address-search-results" id="address-search-results" style="display: none;">
            <!-- Search results will be displayed here -->
          </div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = searchHTML;
    this.element = wrapper.firstElementChild;

    this.attachEventListeners();

    return this.element;
  }

  /**
   * Attach event listeners to the search input
   */
  attachEventListeners() {
    if (!this.element) return;

    const searchInput = this.element.querySelector('#address-search-input');
    if (searchInput) {
      // Input event for live search
      searchInput.addEventListener('input', e => {
        this.handleSearchInput(e.target.value);
      });

      // Focus event to show results
      searchInput.addEventListener('focus', () => {
        this.showResults();
      });

      // Blur event to hide results (with delay for click handling)
      searchInput.addEventListener('blur', () => {
        setTimeout(() => {
          this.hideResults();
        }, 200);
      });
    }
  }

  /**
   * Handle search input with debouncing
   * @param {string} value - The search input value
   */
  handleSearchInput(value) {
    this.searchValue = value;

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer for debounced search
    this.debounceTimer = setTimeout(() => {
      this.performSearch(value);
    }, this.debounceDelay);
  }

  /**
   * Perform the actual search
   * @param {string} value - The search value
   */
  performSearch(value) {
    console.log('TODO: Implement address search for:', value);

    // TODO: Implement actual address search logic here
    // This would typically involve:
    // 1. Call to a geocoding API (e.g., Nominatim, Google Places, etc.)
    // 2. Display results in the results container
    // 3. Handle result selection

    if (value.trim().length > 0) {
      this.showResults();
      this.updateResults([
        { id: 1, address: 'TODO: Sample Result 1' },
        { id: 2, address: 'TODO: Sample Result 2' }
      ]);
    } else {
      this.hideResults();
    }
  }

  /**
   * Update search results display
   * @param {Array} results - Array of search results
   */
  updateResults(results) {
    const resultsContainer = this.element?.querySelector(
      '#address-search-results'
    );
    if (!resultsContainer) return;

    if (results.length === 0) {
      resultsContainer.innerHTML =
        '<div class="no-results">No results found</div>';
      return;
    }

    const resultsHTML = results
      .map(
        result => `
        <div class="address-result-item" data-id="${result.id}">
          ${result.address}
        </div>
      `
      )
      .join('');

    resultsContainer.innerHTML = resultsHTML;

    // Attach click handlers to results
    const resultItems = resultsContainer.querySelectorAll(
      '.address-result-item'
    );
    resultItems.forEach(item => {
      item.addEventListener('click', () => {
        const resultId = item.dataset.id;
        this.handleResultSelection(resultId, results);
      });
    });
  }

  /**
   * Handle result selection
   * @param {string} resultId - The ID of the selected result
   * @param {Array} results - Array of all results
   */
  handleResultSelection(resultId, results) {
    const selectedResult = results.find(r => r.id.toString() === resultId);
    console.log('TODO: Handle address selection:', selectedResult);

    // Call the selection change callback if provided
    if (this.onSelectionChange && selectedResult) {
      this.onSelectionChange(selectedResult);
    }

    this.hideResults();
  }

  /**
   * Show the results container
   */
  showResults() {
    const resultsContainer = this.element?.querySelector(
      '#address-search-results'
    );
    if (resultsContainer) {
      resultsContainer.style.display = 'block';
    }
  }

  /**
   * Hide the results container
   */
  hideResults() {
    const resultsContainer = this.element?.querySelector(
      '#address-search-results'
    );
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
    }
  }

  /**
   * Clear the search input
   */
  clearSearch() {
    const searchInput = this.element?.querySelector('#address-search-input');
    if (searchInput) {
      searchInput.value = '';
      this.searchValue = '';
      this.hideResults();
    }
  }

  /**
   * Get the current search value
   * @returns {string} The current search value
   */
  getSearchValue() {
    return this.searchValue;
  }

  /**
   * Cleanup method to remove event listeners
   */
  cleanup() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    console.log('🧹 Address search cleanup completed');
  }
}
