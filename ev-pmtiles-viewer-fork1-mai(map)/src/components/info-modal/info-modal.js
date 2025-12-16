import './info-modal.css';
import { ModalButton } from '../modal-button/modal-button.js';

export class InfoModal {
  constructor() {
    this.element = null;
    this.infoModalButton = null;
    this.buttonElement = null;
    this.isVisible = false;
    this.auxiliaryButtonGroup = null;
    this.title = 'PMTiles Info';
    this.onClose = null;
  }

  /**
   * Initialize the info modal and button
   */
  init(auxiliaryButtonGroup = null) {
    this.auxiliaryButtonGroup = auxiliaryButtonGroup;

    // Create info button
    this.infoModalButton = new ModalButton(
      () => this.show(),
      '',
      true,
      'Information',
      'info-button'
    );

    // Render modal and store reference
    this.element = this.render();

    // Render button
    this.buttonElement = this.infoModalButton.render();

    // Add modal to body
    document.body.appendChild(this.element);

    return this.element;
  }

  /**
   * Render the info modal
   */
  render() {
    const modalHTML = `
      <div class="modal-overlay" style="display: none;">
        <div class="modal-container">
          <header class="modal-header">
            <h3 class="modal-title">${this.title}</h3>
            <button class="modal-close-btn" type="button" aria-label="Close modal">
              <span class="close-icon">×</span>
            </button>
          </header>
          <main class="modal-body">
            ${this.getInfoContent()}
          </main>
          <footer class="modal-footer">
            <button class="modal-btn modal-btn-secondary" type="button">Cancel</button>
            <button class="modal-btn modal-btn-primary" type="button">OK</button>
          </footer>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHTML;
    const element = wrapper.firstElementChild;

    this.addEventListeners(element);

    return element;
  }

  /**
   * Add event listeners to modal
   */
  addEventListeners(element) {
    if (!element) return;

    // Close button
    const closeBtn = element.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Cancel button
    const cancelBtn = element.querySelector('.modal-btn-secondary');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hide());
    }

    // OK button
    const okBtn = element.querySelector('.modal-btn-primary');
    if (okBtn) {
      okBtn.addEventListener('click', () => this.hide());
    }

    // Overlay click to close
    element.addEventListener('click', e => {
      if (e.target === element) {
        this.hide();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  /**
   * Set auxiliary button group reference and populate skeleton
   */
  setAuxiliaryButtonGroup(auxiliaryButtonGroup) {
    this.auxiliaryButtonGroup = auxiliaryButtonGroup;

    if (
      this.auxiliaryButtonGroup &&
      this.buttonElement &&
      this.infoModalButton
    ) {
      // Populate skeleton with info button
      this.auxiliaryButtonGroup.populateSkeleton(
        'info-button',
        this.buttonElement,
        this.infoModalButton
      );
    }
  }

  /**
   * Get the info modal content
   */
  getInfoContent() {
    return `
      <div class="info-modal-content">
        <div class="info-section">
          <h4>EV PMTiles Viewer</h4>
          <p>This is the EV PMTiles Viewer application for visualizing cadastral data using PMTiles technology.</p>
        </div>
        
        <div class="info-section">
          <h4>Features</h4>
          <ul>
            <li>Interactive map visualization</li>
            <li>Cadastral parcel exploration</li>
            <li>Multi-language support</li>
            <li>Real-time data search</li>
          </ul>
        </div>
        
        <div class="info-section">
          <h4>Technology</h4>
          <p>Built with MapLibre GL JS and PMTiles for efficient vector tile delivery.</p>
        </div>
      </div>
    `;
  }

  /**
   * Show the info modal
   */
  show() {
    if (this.element) {
      this.element.style.display = 'flex';
      this.isVisible = true;
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  }

  /**
   * Hide the info modal
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
      this.isVisible = false;
      document.body.style.overflow = ''; // Restore scrolling
      if (this.onClose) {
        this.onClose();
      }
    }
  }

  /**
   * Check if modal is currently visible
   */
  isOpen() {
    return this.isVisible;
  }

  /**
   * Update the modal content
   */
  updateContent(content) {
    if (this.element) {
      const bodyElement = this.element.querySelector('.modal-body');
      if (bodyElement) {
        bodyElement.innerHTML = content;
      }
    }
  }

  /**
   * Update the modal title
   */
  updateTitle(title) {
    this.title = title;
    if (this.element) {
      const titleElement = this.element.querySelector('.modal-title');
      if (titleElement) {
        titleElement.textContent = title;
      }
    }
  }

  /**
   * Set close callback
   */
  setOnClose(callback) {
    this.onClose = callback;
  }

  /**
   * Get the modal element
   */
  getElement() {
    return this.element;
  }

  /**
   * Get the button element for external use
   */
  getButtonElement() {
    return this.buttonElement;
  }

  /**
   * Get the button instance
   */
  getButton() {
    return this.infoModalButton;
  }

  /**
   * Destroy the modal and clean up
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.infoModalButton = null;
    this.buttonElement = null;
    this.isVisible = false;
    this.auxiliaryButtonGroup = null;
  }
}
