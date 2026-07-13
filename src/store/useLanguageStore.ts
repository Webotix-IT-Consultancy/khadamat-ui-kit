import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'ar';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',

      setLanguage: (lang) => {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        set({ language: lang });
      },
    }),
    {
      name: 'app-language', // localStorage key
    }
  )
);
