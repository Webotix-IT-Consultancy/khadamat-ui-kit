export const images: Record<string, string> = {
  khadamatLogo: '/src/assets/images/khadamat-logo.png',
  webotixLogo: '/src/assets/images/webotix-logo.png',
  successIcon: '/src/assets/images/icons/animated/success-icon.gif',
  successDecoration: '/src/assets/images/success-decoration.png',
  walletDecoration: '/src/assets/images/wallet-decoration.png',
  sidebarPattern: '/src/assets/images/sidebar-pattern.png',
};

export const getImagePath = (imageName: string) => {
  return images[imageName] || null;
};

export default images;
