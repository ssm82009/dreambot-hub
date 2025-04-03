
import React from 'react';
import { Link } from 'react-router-dom';

interface NavLogoProps {
  logoText?: string;
  fontSize?: number;
}

const NavLogo: React.FC<NavLogoProps> = ({ 
  logoText = "تفسير", 
  fontSize = 24 
}) => {
  const textStyle = {
    fontSize: `${fontSize}px`,
  };

  return (
    <Link to="/" className="flex-shrink-0 flex items-center">
      <span className="font-bold text-primary" style={textStyle}>
        {logoText}<span className="text-accent">الأحلام</span>
      </span>
    </Link>
  );
};

export default NavLogo;
