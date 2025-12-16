import './map-button.css';
import { createIcons, Home, ZoomIn, ZoomOut } from 'lucide';

export class MapButton {
  constructor(
    onClick = null,
    text = '',
    icon = null,
    ariaLabel = '',
    className = '',
    requiresMap = true
  ) {
    this.element = null;
    this.onClick = onClick;
    this.text = text;
    this.icon = icon;
    this.ariaLabel = ariaLabel;
    this.className = className;
    this.requiresMap = requiresMap; // Whether this button requires map to be loaded
    this.isMapReady = false; // Track map readiness
    this.isEnabled = !requiresMap; // Initially enabled only if doesn't require map
  }

  render() {
    const iconName =
      typeof this.icon === 'string' ? this.icon : this.icon ? 'home' : '';
    const iconHTML = this.icon
      ? `<span class="map-button-icon" data-lucide="${iconName}"></span>`
      : '';
    const textHTML =
      this.text && !this.icon
        ? `<span class="map-button-text">${this.text}</span>`
        : '';

    const classes = `map-button ${this.className} ${this.icon && !this.text ? 'icon-only' : ''}`;

    const buttonHTML = `
      <button class="${classes}" type="button" aria-label="${this.ariaLabel}" ${!this.isEnabled ? 'disabled' : ''}>
        ${iconHTML}
        ${textHTML}
      </button>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = buttonHTML;
    this.element = wrapper.firstElementChild;

    // Initialize Lucide icon if provided
    if (this.icon) {
      createIcons({
        root: this.element,
        icons: {
          Home,
          ZoomIn,
          ZoomOut
        },
        attrs: {
          width: 16,
          height: 16,
          'stroke-width': 2
        }
      });
    }

    // Add click event listener
    this.setupClickHandler();

    return this.element;
  }

  setupClickHandler() {
    if (this.element && this.onClick) {
      this.element.addEventListener('click', e => {
        // Only execute if button is enabled
        if (this.isEnabled && !this.element.disabled) {
          this.onClick(e);
        }
      });
    }
  }

  /**
   * Set the map readiness state
   * @param {boolean} isReady - Whether the map is ready
   */
  setMapReady(isReady) {
    this.isMapReady = isReady;
    this.updateButtonState();
  }

  /**
   * Update button enabled/disabled state based on requirements
   */
  updateButtonState() {
    if (this.requiresMap) {
      this.isEnabled = this.isMapReady;
    } else {
      this.isEnabled = true; // Non-map buttons are always enabled
    }

    if (this.element) {
      this.element.disabled = !this.isEnabled;
    }
  }

  /**
   * Enable the button
   */
  enable() {
    this.isEnabled = true;
    if (this.element) {
      this.element.disabled = false;
    }
  }

  /**
   * Disable the button
   */
  disable() {
    this.isEnabled = false;
    if (this.element) {
      this.element.disabled = true;
    }
  }

  /**
   * Set new click handler
   * @param {Function} callback - The click handler function
   */
  setOnClick(callback) {
    this.onClick = callback;
    if (this.element) {
      // Remove old listener and add new one
      this.setupClickHandler();
    }
  }

  /**
   * Set button text
   * @param {string} text - The new text
   */
  setText(text) {
    this.text = text;
    if (this.element) {
      const textElement = this.element.querySelector('.map-button-text');
      if (textElement) {
        textElement.textContent = text;
      }
    }
  }

  /**
   * Check if button requires map
   * @returns {boolean}
   */
  getRequiresMap() {
    return this.requiresMap;
  }

  /**
   * Check if button is enabled
   * @returns {boolean}
   */
  getIsEnabled() {
    return this.isEnabled;
  }
}
