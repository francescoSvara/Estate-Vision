import './toggle-button.css';

export class toggleButton {
  constructor(position = 'right', onToggle = null) {
    this.element = null;
    this.position = position; // 'left' or 'right'
    this.onToggle = onToggle; // Callback function when button is clicked
    this.isOpen = false;
  }

  updateState(isOpen) {
    this.isOpen = isOpen;
    if (this.element) {
      this.updateButtonDisplay();
    }
  }

  updateButtonDisplay() {
    const iconContainer = this.element.querySelector('.toggle-icon');
    if (!iconContainer) return;

    if (this.position === 'right') {
      const iconName = this.isOpen ? 'panel-right-close' : 'panel-right-open';
      iconContainer.setAttribute('data-lucide', iconName);
      iconContainer.innerHTML = '';

      import('lucide').then(
        ({ createIcons, PanelRightOpen, PanelRightClose }) => {
          createIcons({
            root: this.element,
            icons: {
              PanelRightOpen,
              PanelRightClose
            },
            attrs: {
              width: 16,
              height: 16,
              'stroke-width': 2
            }
          });
        }
      );
    } else {
      iconContainer.removeAttribute('data-lucide');
      iconContainer.innerHTML = this.isOpen ? '→' : '←';
    }
  }

  render() {
    const buttonHTML = `
      <button class="toggle-button toggle-button-${this.position} icon-only button-group-item" type="button" aria-label="Toggle ${this.position} sidebar">
        <span class="toggle-icon" data-lucide="${this.position === 'right' ? 'panel-right-open' : ''}"></span>
      </button>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = buttonHTML;
    this.element = wrapper.firstElementChild;

    // Add click event listener
    this.element.addEventListener('click', () => {
      if (this.onToggle) {
        this.onToggle();
      }
    });

    // Set initial icon
    this.updateButtonDisplay();

    return this.element;
  }

  show() {
    if (this.element) {
      this.element.style.display = 'flex';
    }
  }

  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }
}
