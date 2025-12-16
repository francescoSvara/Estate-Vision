import './main-modal.css';

export class MainModal {
  constructor(title = 'Modal', content = '') {
    this.element = null;
    this.title = title;
    this.content = content;
    this.isVisible = false;
    this.onClose = null;
  }

  render() {
    const modalHTML = `
      <div class="modal-overlay" style="display: none;">
        <div class="modal-container">
          <header class="modal-header">
            <h3 class="modal-title">${this.title}</h3>
            <button class="modal-close-btn" type="button" aria-label="Close modal">
              <span class="close-icon" style="color:#fff;font-size:1.7rem;line-height:1;">&times;</span>
            </button>
          </header>
          <main class="modal-body">
            ${this.content}
          </main>
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
    const closeBtn = this.element.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hide();
      });
    }

    // Overlay click to close
    this.element.addEventListener('click', e => {
      if (e.target === this.element) {
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

  show() {
    if (this.element) {
      this.element.style.display = 'flex';
      this.isVisible = true;
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  }

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

  setContent(content) {
    this.content = content;
    if (this.element) {
      const bodyElement = this.element.querySelector('.modal-body');
      if (bodyElement) {
        bodyElement.innerHTML = content;
      }
    }
  }

  setTitle(title) {
    this.title = title;
    if (this.element) {
      const titleElement = this.element.querySelector('.modal-title');
      if (titleElement) {
        titleElement.textContent = title;
      }
    }
  }

  setOnClose(callback) {
    this.onClose = callback;
  }
}
