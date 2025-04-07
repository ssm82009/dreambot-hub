
import React from 'react';
import { Link } from 'react-router-dom';

interface NavLogoProps {
  logoText?: string;
  fontSize?: number;
  slug?: string;
}

const NavLogo: React.FC<NavLogoProps> = ({ 
  logoText = "تفسير", 
  fontSize = 28,
  slug = "تفسير الأحلام عبر الذكاء الاصطناعي"
}) => {
  const textStyle = {
    fontSize: `${fontSize}px`,
  };

  return (
    <Link to="/" className="flex-shrink-0 flex flex-col items-center group">
      <span 
        className="font-aref gradient-text transition-all duration-300 group-hover:scale-105" 
        style={textStyle}
      >
        {logoText}
      </span>
      {slug && (
        <span className="text-muted-foreground text-xs mt-1 transition-opacity duration-300 group-hover:opacity-100 opacity-80">
          {slug}
        </span>
      )}
    </Link>
  );
};

export default NavLogo;
