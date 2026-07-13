import React from 'react';
import whatsappIcon from '../../assets/images/icons/whatsapp-outline.svg';

interface WhatsAppIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({ size = 24, ...props }) => {
  return (
    <img src={whatsappIcon} width={size} height={size} alt="WhatsAppIcon" />

  );
};

export default WhatsAppIcon;
