
import React from 'react';
import { Link } from 'react-router-dom';

interface NavLogoProps {
  logoText?: string;
  fontSize?: number;
  slug?: string;
}

const NavLogo: React.FC<NavLogoProps> = ({ 
  logoText = "تفسير", 
  fontSize = 24,
  slug = "تفسير الأحلام عبر الذكاء الاصطناعي"
}) => {
  const textStyle = {
    fontSize: `${fontSize}px`,
  };

  return (
    <Link to="/" className="flex-shrink-0 flex flex-col items-center">
      <span className="font-bold text-primary" style={textStyle}>
        {logoText}
      </span>
      {slug && (
        <span className="text-muted-foreground text-xs mt-1">
          {slug}
        </span>
      )}
    </Link>
  );
};

export default NavLogo;
