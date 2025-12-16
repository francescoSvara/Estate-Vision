/**
 * Popup Modal Component
 * Dedicated modal for displaying map click information
 * Replaces MapLibre GL Popup with more flexible modal dialog
 */

import './popup-modal.css';

export class PopupModal {
  constructor() {
    this.element = null;
    this.isVisible = false;
    this.onClose = null;
    this.coordinates = null;
  }

  render() {
    const modalHTML = `
      <div class="popup-modal-overlay" style="display: none;">
        <div class="popup-modal-container" style="background-color: var(--bg-secondary, #0e0d11);">
          <header class="popup-modal-header">
            <h3 class="popup-modal-title">Parcel Information</h3>
            <button class="popup-modal-close-btn" type="button" aria-label="Close popup modal">
              <span class="close-icon">×</span>
            </button>
          </header>
          <main class="popup-modal-body">
            <div class="popup-modal-content"></div>
          </main>
          <footer class="popup-modal-footer">
            <button class="popup-modal-action-btn" type="button" disabled>
              <span>View Full Analytics</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </button>
          </footer>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHTML;
    this.element = wrapper.firstElementChild;

    this.addEventListeners();

    return this.element;
  }

  addEventListeners() {
    if (!this.element) return;

    // Close button
    const closeBtn = this.element.querySelector('.popup-modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Stop propagation on container to prevent map clicks
    const container = this.element.querySelector('.popup-modal-container');
    if (container) {
      container.addEventListener('click', e => {
        e.stopPropagation();
      });
      container.addEventListener('mousedown', e => {
        e.stopPropagation();
      });
      container.addEventListener('mouseup', e => {
        e.stopPropagation();
      });
    }

    // Overlay click to close
    this.element.addEventListener('click', e => {
      if (e.target === this.element) {
        this.hide();
      }
    });

    // Escape key to close
    this.escapeHandler = e => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
  }

  show(content, coordinates = null, actionData = null) {
    if (!this.element) {
      this.render();
      document.body.appendChild(this.element);
    }

    this.coordinates = coordinates;
    this.setContent(content, actionData);
    this.element.style.display = 'flex';
    this.isVisible = true;
  }

  hide() {
    if (this.element) {
      this.element.style.display = 'none';
      this.isVisible = false;
      if (this.onClose) {
        this.onClose();
      }
    }
  }

  setContent(content, actionData = null) {
    if (this.element) {
      const contentElement = this.element.querySelector('.popup-modal-content');
      if (contentElement) {
        contentElement.innerHTML = content;
      }

      // Handle Action Button
      const actionBtn = this.element.querySelector('.popup-modal-action-btn');
      if (actionBtn) {
        if (actionData) {
            actionBtn.disabled = false;
            // Store data on button for click handler
            actionBtn.dataset.parcelId = actionData.parcelId;
            actionBtn.dataset.fullParcel = actionData.fullParcel;
            
            // Remove old listener
            const newBtn = actionBtn.cloneNode(true);
            actionBtn.parentNode.replaceChild(newBtn, actionBtn);
            
            newBtn.addEventListener('click', () => {
                // Dispatch custom navigate event from the modal element
                const event = new CustomEvent('navigate', {
                    detail: { 
                        view: 'details',
                        data: {
                            id: actionData.parcelId,
                            ...JSON.parse(actionData.fullParcel || '{}'),
                            coordinates: actionData.coordinates,
                            address: actionData.address
                        }
                    },
                    bubbles: true
                });
                // We dispatch from document.getElementById('map') usually, but since the modal is in body,
                // we can dispatch from map container if we can find it, or dispatch globally on window/document.
                // However, AppContent listens on 'map' element.
                const mapElement = document.getElementById('map');
                if (mapElement) {
                    mapElement.dispatchEvent(event);
                }
                this.hide();
            });
        } else {
            actionBtn.disabled = true;
            actionBtn.dataset.parcelId = '';
            actionBtn.dataset.fullParcel = '';
        }
      }
    }
  }

  setTitle(title) {
    if (this.element) {
      const titleElement = this.element.querySelector('.popup-modal-title');
      if (titleElement) {
        titleElement.textContent = title;
      }
    }
  }

  setOnClose(callback) {
    this.onClose = callback;
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
    }
  }
}
