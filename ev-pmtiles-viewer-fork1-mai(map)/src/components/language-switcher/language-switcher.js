import './language-switcher.css';
import { useTranslation } from '../../i18n/hooks/useTranslation.js';

export class LanguageSwitcher {
  constructor() {
    this.element = null;
    this.translation = useTranslation();
  }

  render() {
    const switcherHTML = `
      <div class="language-switcher">
        <select class="language-select" aria-label="Select language">
          <option value="en" ${this.translation.currentLanguage === 'en' ? 'selected' : ''}>EN</option>
          <option value="it" ${this.translation.currentLanguage === 'it' ? 'selected' : ''}>IT</option>
        </select>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = switcherHTML;
    this.element = wrapper.firstElementChild;

    this.addEventListeners();

    return this.element;
  }

  addEventListeners() {
    if (!this.element) return;

    const selectElement = this.element.querySelector('.language-select');
    if (selectElement) {
      selectElement.addEventListener('change', e => {
        const newLanguage = e.target.value;
        this.translation.setLanguage(newLanguage);
        console.log(`Language changed to: ${newLanguage}`);
      });
    }
  }

  destroy() {
    if (this.translation.cleanup) {
      this.translation.cleanup();
    }
  }
}
