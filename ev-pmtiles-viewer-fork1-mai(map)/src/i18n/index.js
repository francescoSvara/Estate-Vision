/**
 * Lightweight i18n implementation for EV Dashboard
 */

const translations = {
  en: null, // Will be loaded dynamically
  it: null // Will be loaded dynamically
};

// Available languages
export const LANGUAGES = {
  EN: 'en',
  IT: 'it'
};

// Default language
const DEFAULT_LANGUAGE = LANGUAGES.EN;

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'pmtiles-viewer-language';

class I18n {
  constructor() {
    this.currentLanguage = this.detectLanguage();
    this.listeners = new Set();
    this.translationsLoaded = false;
    this.loadingPromise = this.loadTranslations();
  }

  async loadTranslations() {
    try {
      // Load English translations
      const enResponse = await fetch('./i18n/translations/en.json');
      translations.en = await enResponse.json();

      // Load Italian translations
      const itResponse = await fetch('./i18n/translations/it.json');
      translations.it = await itResponse.json();

      this.translationsLoaded = true;
      // _onsole.log('Translations loaded successfully');
    } catch (error) {
      console.warn('Could not load translations:', error);
      // Fallback translations
      translations.en = {
        sidebar: {
          left: {
            title: 'EV Dashboard',
            subtitle: 'Interactive map layers'
          }
        }
      };
      translations.it = translations.en; // Use English as fallback
      this.translationsLoaded = true;
    }

    // Notify all listeners that translations are loaded
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }

  async init() {
    await this.loadingPromise;
    return this.translationsLoaded;
  }

  /**
   * Detect the user's preferred language
   */
  detectLanguage() {
    // Check localStorage first
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage && Object.values(LANGUAGES).includes(storedLanguage)) {
      return storedLanguage;
    }

    // Check browser locale
    const browserLanguage = navigator.language?.split('-')[0];
    if (browserLanguage && Object.values(LANGUAGES).includes(browserLanguage)) {
      return browserLanguage;
    }

    // Fallback to default
    return DEFAULT_LANGUAGE;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  setLanguage(language) {
    if (!Object.values(LANGUAGES).includes(language)) {
      console.warn(`Language '${language}' not supported.`);
      return;
    }

    this.currentLanguage = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

    // Notify listeners
    this.listeners.forEach(listener => listener(language));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  translate(key, params = {}) {
    if (!translations[this.currentLanguage]) {
      return key; // Return key if translations not loaded
    }

    const keys = key.split('.');
    let translation = translations[this.currentLanguage];

    // Navigate through nested keys
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback to default language
        translation = translations[DEFAULT_LANGUAGE];
        for (const fallbackKey of keys) {
          if (
            translation &&
            typeof translation === 'object' &&
            fallbackKey in translation
          ) {
            translation = translation[fallbackKey];
          } else {
            return key; // Return the key itself as last resort
          }
        }
        break;
      }
    }

    // If translation is not a string, return the key
    if (typeof translation !== 'string') {
      return key;
    }

    // Simple interpolation: replace {{param}} with values
    return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  }

  getAvailableLanguages() {
    return Object.values(LANGUAGES);
  }
}

// Create singleton instance
const i18n = new I18n();

// Export the instance and utility functions
export default i18n;
export const t = (key, params) => i18n.translate(key, params);
export const getCurrentLanguage = () => i18n.getCurrentLanguage();
export const setLanguage = language => i18n.setLanguage(language);
export const subscribe = listener => i18n.subscribe(listener);
export const init = () => i18n.init();
