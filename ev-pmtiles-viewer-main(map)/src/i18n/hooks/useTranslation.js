import i18n from '../index.js';

/**
 * React-like hook for using translations in components
 */
export function useTranslation() {
  const listeners = new Set();

  return {
    t: (key, params) => {
      // If translations aren't loaded yet, return the key
      if (!i18n.translationsLoaded) {
        return key;
      }
      return i18n.translate(key, params);
    },
    currentLanguage: i18n.getCurrentLanguage(),
    setLanguage: language => i18n.setLanguage(language),
    availableLanguages: i18n.getAvailableLanguages(),
    translationsLoaded: () => i18n.translationsLoaded,
    waitForTranslations: () => i18n.waitForTranslations(),

    onLanguageChange: callback => {
      const unsubscribe = i18n.subscribe(callback);
      listeners.add(unsubscribe);
      return unsubscribe;
    },

    cleanup: () => {
      listeners.forEach(unsubscribe => unsubscribe());
      listeners.clear();
    }
  };
}
