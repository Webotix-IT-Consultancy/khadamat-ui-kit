import React from 'react';
import './AuthSidebar.css';
import khadamatLogo from '../../assets/images/khadamat-logo.png';
import webotixLogo from '../../assets/images/webotix-logo.png';
import { useTranslation } from 'react-i18next';

interface AuthSidebarProps {
  background?: string;
}

const AuthSidebar: React.FC<AuthSidebarProps> = ({ background }) => {
  const { t } = useTranslation(['auth', 'common']);

  return (
    <div className="sidebar auth-sidebar">
    {/* <div className="sidebar auth-sidebar" style={background ? { background: `url(${background})
      center / cover no-repeat,linear-gradient(
      180deg,
      hsl(var(--primary-200)) 0%,
      hsl(var(--primary-200)) 100%
    )` } : undefined}> */}
      <div className="sidebar-content">
        <div className="logo-container">
          <img
            src={khadamatLogo}
            alt="Khadamat Logo"
            className="logo-image"
          />
        </div>

        <h2 className="sidebar-title">{t('auth:layout.sidebar.title')}</h2>

        <div className="features-container">
          <div className="wallet-icon-wrapper">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/8feb48350b5607eac66df81098cdf5027ff55359?width=256"
              alt="Wallet"
              className="wallet-decoration"
            />
          </div>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.9165 19.1667H44.0832M5.74984 7.66675H40.2498C42.3669 7.66675 44.0832 9.38299 44.0832 11.5001V34.5001C44.0832 36.6172 42.3669 38.3334 40.2498 38.3334H5.74984C3.63275 38.3334 1.9165 36.6172 1.9165 34.5001V11.5001C1.9165 9.38299 3.63275 7.66675 5.74984 7.66675Z"
                    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="feature-text">
                <h3 className="feature-title">{t('auth:layout.sidebar.features.secureWallet.title')}</h3>
                <p className="feature-description">{t('auth:layout.sidebar.features.secureWallet.desc')}</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44.0832 7.66677V19.1668M44.0832 19.1668H32.5832M44.0832 19.1668L35.1898 10.8101C33.1299 8.74914 30.5815 7.24358 27.7823 6.43392C24.9831 5.62426 22.0245 5.53688 19.1824 6.17993C16.3403 6.82299 13.7075 8.17552 11.5295 10.1113C9.35151 12.0471 7.69941 14.5031 6.72734 17.2501M1.9165 38.3334V26.8334M1.9165 26.8334H13.4165M1.9165 26.8334L10.8098 35.1901C12.8698 37.2511 15.4182 38.7566 18.2174 39.5663C21.0166 40.376 23.9752 40.4633 26.8173 39.8203C29.6594 39.1772 32.2922 37.8247 34.4702 35.8889C36.6482 33.9531 38.3003 31.4971 39.2723 28.7501"
                    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="feature-text">
                <h3 className="feature-title">{t('auth:layout.sidebar.features.realTimeSync.title')}</h3>
                <p className="feature-description">
                  {t('auth:layout.sidebar.features.realTimeSync.desc')}
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M26.3158 40.2499C25.9789 40.8308 25.4952 41.313 24.9133 41.6482C24.3313 41.9834 23.6716 42.1598 23 42.1598C22.3284 42.1598 21.6687 41.9834 21.0867 41.6482C20.5048 41.313 20.0211 40.8308 19.6842 40.2499M34.5 15.3333C34.5 12.2833 33.2884 9.35819 31.1317 7.20152C28.9751 5.04486 26.05 3.83325 23 3.83325C19.95 3.83325 17.0249 5.04486 14.8683 7.20152C12.7116 9.35819 11.5 12.2833 11.5 15.3333C11.5 28.7499 5.75 32.5833 5.75 32.5833H40.25C40.25 32.5833 34.5 28.7499 34.5 15.3333Z"
                    stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="feature-text">
                <h3 className="feature-title">{t('auth:layout.sidebar.features.notifications.title')}</h3>
                <p className="feature-description">{t('auth:layout.sidebar.features.notifications.desc')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="footer-links">
            <a href="#support" className="footer-link">{t('auth:layout.sidebar.footer.support')}</a>
            <span className="footer-dot"></span>
            <a href="#privacy" className="footer-link">{t('auth:layout.sidebar.footer.privacy')}</a>
            <span className="footer-dot"></span>
            <a href="#terms" className="footer-link">{t('auth:layout.sidebar.footer.terms')}</a>
          </div>

          <div className="footer-credits">
            <span>{t('common:sidebar.developedBy')}</span>
            <img
              src={webotixLogo}
              alt="Webotix"
              className="credits-logo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSidebar;
