import React from 'react';
import './Loader.css';

const Loader: React.FC<{size?: string; fullPage?: boolean}> = ({ size = 'medium', fullPage = false }) => {
  return (
    <div className={`loader-wrapper ${fullPage ? 'loader-full-page' : ''}`}>
      <div className={`loader loader-${size}`}>
        <div className="loader-spinner"></div>
      </div>
    </div>
  );
};

export default Loader;
