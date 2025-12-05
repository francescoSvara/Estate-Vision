import './modal-button.css';
import { createIcons, Info, Home, ZoomIn, ZoomOut } from 'lucide';

export class ModalButton {
  constructor(
    onClick = null,
    text = 'Open Modal',
    icon = null,
    ariaLabel = '',
    className = ''
  ) {
    this.element = null;
    this.onClick = onClick;
    this.text = text;
    this.icon = icon;
    this.ariaLabel = ariaLabel;
    this.className = className;
  }

  render() {
    const iconName =
      typeof this.icon === 'string' ? this.icon : this.icon ? 'info' : '';
    const iconHTML = this.icon
      ? `<span class="modal-button-icon" data-lucide="${iconName}"></span>`
      : '';
    const textHTML =
      this.text && !this.icon
        ? `<span class="modal-button-text">${this.text}</span>`
        : '';

    const classes = `modal-button ${this.className} ${this.icon && !this.text ? 'icon-only' : ''}`;

    const buttonHTML = `
      <button class="${classes}" type="button" aria-label="${this.ariaLabel}">
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
        icons: {
          Info,
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
    if (this.onClick) {
      this.element.addEventListener('click', this.onClick);
    }

    return this.element;
  }

  setOnClick(callback) {
    this.onClick = callback;
    if (this.element) {
      this.element.removeEventListener('click', this.onClick);
      this.element.addEventListener('click', callback);
    }
  }

  setText(text) {
    this.text = text;
    if (this.element) {
      const textElement = this.element.querySelector('.modal-button-text');
      if (textElement) {
        textElement.textContent = text;
      }
    }
  }
}
