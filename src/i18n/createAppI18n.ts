import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import arCommon from './locales/ar/common.json';
import arAuth from './locales/ar/auth.json';

type NamespaceResources = Record<string, any>;

export interface CreateAppI18nOptions {
  en?: NamespaceResources;
  ar?: NamespaceResources;
}

export const getInitialLanguage = (): 'en' | 'ar' => {
  try {
    const saved = localStorage.getItem('app-language');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.state?.language || 'en';
    }
  } catch (e) {
    console.error('Failed to parse saved language', e);
  }
  return 'en';
};

/**
 * Creates a portal-local i18next instance seeded with the shared `common`/`auth`
 * namespaces, merged with whatever portal-specific namespaces are passed in.
 * Each portal owns its own instance (separate bundles), so this always builds
 * a fresh one rather than relying on i18next's default singleton.
 */
export function createAppI18n(options: CreateAppI18nOptions = {}) {
  const initialLang = getInitialLanguage();
  document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = initialLang;

  const instance = i18n.createInstance();

  instance.use(initReactI18next).init({
    resources: {
      en: { common: enCommon, auth: enAuth, ...options.en },
      ar: { common: arCommon, auth: arAuth, ...options.ar },
    },
    lng: initialLang,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

  return instance;
}
