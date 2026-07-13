import React from 'react';
import dirhamsIcon from '../../assets/images/icons/dirhams-icon.svg';

interface DirhamProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const DirhamIcon: React.FC<DirhamProps> = ({ size = 24, ...props }) => {
  return (
    <img src={dirhamsIcon} width={size} height={size} alt="DirhamIcon" />

  );
};

export default DirhamIcon;
