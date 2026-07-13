// Image assets configuration
// This file maps image identifiers to their local paths
// Place all image files in the src/assets/images folder

export const images = {
  // Logo images
  khadamatLogo: '/src/assets/images/khadamat-logo.png',
  webotixLogo: '/src/assets/images/webotix-logo.png',
  
  // Success screen images
  successIcon: '/src/assets/images/icons/animated/success-icon.gif',
  successDecoration: '/src/assets/images/success-decoration.png',
  
  // Sidebar images
  walletDecoration: '/src/assets/images/wallet-decoration.png',
  sidebarPattern: '/src/assets/images/sidebar-pattern.png',
};

// Alternative: Using import for better tree-shaking
// You can also use direct imports:
// import khadamatLogo from './khadamat-logo.png';
// import successIcon from './success-icon.png';

export const getImagePath = (imageName) => {
  return images[imageName] || null;
};

export default images;
