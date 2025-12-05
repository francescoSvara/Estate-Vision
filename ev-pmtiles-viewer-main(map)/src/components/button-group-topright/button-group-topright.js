import './button-group-topright.css';

export class ButtonGroupTopRight {
  constructor() {
    this.element = null;
    this.buttons = [];
  }

  /**
   * Add a button to the group
   * @param {HTMLElement} buttonElement - The button element to add
   * @param {string} name - The name to identify this button
   * @param {boolean} persistent - Whether this button should remain visible when others are hidden
   */
  addButton(buttonElement, name = '', persistent = false) {
    if (buttonElement && this.element) {
      // Remove any positioning classes from the button
      buttonElement.classList.remove(
        'toggle-button-right',
        'toggle-button-left'
      );
      buttonElement.classList.add('button-group-item');

      // Add identification attributes
      if (name) {
        buttonElement.setAttribute('data-button-name', name);
        buttonElement.setAttribute('aria-label', name);
      }

      // Remove fixed positioning
      buttonElement.style.position = 'relative';
      buttonElement.style.top = 'auto';
      buttonElement.style.right = 'auto';
      buttonElement.style.left = 'auto';
      buttonElement.style.bottom = 'auto';

      this.element.appendChild(buttonElement);
      this.buttons.push({
        element: buttonElement,
        name: name,
        persistent: persistent
      });
    }
  }

  /**
   * Get a button by name
   * @param {string} name - The name of the button to find
   * @returns {HTMLElement|null} The button element or null if not found
   */
  getButtonByName(name) {
    const buttonObj = this.buttons.find(btn => btn.name === name);
    return buttonObj ? buttonObj.element : null;
  }

  /**
   * Show the button group
   */
  show() {
    if (this.element) {
      this.element.classList.remove('hidden');
      this.element.style.display = 'flex';
      this.element.setAttribute('aria-hidden', 'false');
    }
  }

  /**
   * Hide the button group
   */
  hide() {
    if (this.element) {
      this.element.classList.add('hidden');
      this.element.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        if (this.element.classList.contains('hidden')) {
          this.element.style.display = 'none';
        }
      }, 300);
    }
  }

  /**
   * Show individual buttons in the group
   */
  showButtons() {
    this.buttons.forEach(buttonObj => {
      if (buttonObj.element && buttonObj.element.style) {
        buttonObj.element.style.display = 'flex';
      }
    });
  }

  /**
   * Hide individual buttons in the group (except persistent buttons)
   */
  hideButtons() {
    this.buttons.forEach(buttonObj => {
      if (
        !buttonObj.persistent &&
        buttonObj.element &&
        buttonObj.element.style
      ) {
        buttonObj.element.style.display = 'none';
      }
    });
  }

  render() {
    const containerHTML = `
      <div class="button-group-topright" role="toolbar" aria-label="Top right actions">
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = containerHTML;
    this.element = wrapper.firstElementChild;

    return this.element;
  }
}
