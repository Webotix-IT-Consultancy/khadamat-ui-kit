import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { cn } from '../../../lib/utils';

const LanguageSwitcher = ({ actualCollapsed }: { actualCollapsed: boolean }) => {
    const { i18n } = useTranslation();
    const { language, setLanguage } = useLanguageStore();

    const switchLang = (lang: 'en' | 'ar') => {
        i18n.changeLanguage(lang);
        setLanguage(lang);
    };

    return (
        <div className={cn("language-toggle flex bg-white border border-primary rounded-full p-[2px] gap-2", actualCollapsed ? "flex-col" : "flex")}>
            <button
                className={` lang-button flex justify-center items-center w-[35px] h-[35px] px-3 py-1.5 rounded-[33px] border-none cursor-pointer font-poppins text-[13px] font-medium transition-all duration-200 ${language === 'ar'
                        ? 'bg-primary text-white'
                        : 'bg-white text-black'
                    }`}
                onClick={() => switchLang('ar')}
            >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 2.5C6.3 2.5 5.3125 3.4875 5.3125 4.6875C5.3125 5.26875 5.55 5.8 5.9375 6.19375C4.98125 6.81875 4.375 7.8875 4.375 9.0625C4.375 10.9563 5.91875 12.5 7.8125 12.5C8.9125 12.5 10 12.2125 10.9375 11.6625L10.3125 10.5813C9.55 11.0188 8.6875 11.25 7.8125 11.25C6.6 11.25 5.625 10.2812 5.625 9.0625C5.62389 8.58111 5.78206 8.11287 6.07486 7.73076C6.36766 7.34866 6.77864 7.07414 7.24375 6.95L10.5 6.075L10.175 4.86875L7.39375 5.625C6.925 5.5625 6.5625 5.175 6.5625 4.6875C6.5625 4.1625 6.975 3.75 7.5 3.75C7.6625 3.75 7.8125 3.79375 7.96875 3.875L8.59375 2.79375C8.2625 2.6 7.88125 2.5 7.5 2.5Z" fill="currentColor" />
                </svg>
            </button>
            <button
                className={`flex justify-center items-center w-[35px] h-[35px] px-3 py-1.5 rounded-[33px] border-none cursor-pointer font-poppins text-[13px] font-medium transition-all duration-200 ${language === 'en'
                        ? 'bg-primary text-white'
                        : 'bg-white text-black'
                    }`}
                onClick={() => switchLang('en')}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageSwitcher;
