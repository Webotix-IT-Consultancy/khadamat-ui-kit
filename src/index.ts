// Convenience root exports for the most commonly used cross-cutting pieces.
// Components are not re-exported here — import them by their existing deep
// path, e.g. `@khadamat/ui-kit/components/Button/Button`, matching how they
// were imported inside the original monorepo (just swap `@/` for the
// package name).

export { createAppI18n, getInitialLanguage } from './i18n/createAppI18n';
export type { CreateAppI18nOptions } from './i18n/createAppI18n';

export { ToastProvider, useToast } from './context/ToastContext';

export { useLanguageStore } from './store/useLanguageStore';
export type { Language } from './store/useLanguageStore';
export { usePageStore } from './store/usePageStore';
export { useSidebarStore } from './store/useSidebarStore';

export { usePageTitle } from './hooks/usePageTitle';

export { cn } from './lib/utils';

export * from './utils/exportTable';
export * from './utils/receiptGenerator';
export * from './utils/phone';
