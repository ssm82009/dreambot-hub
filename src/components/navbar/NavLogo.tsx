
import React from 'react';
import { Link } from 'react-router-dom';

interface NavLogoProps {
  logoText?: string;
  fontSize?: number;
  slug?: string;
  isLoading?: boolean;
}

const NavLogo: React.FC<NavLogoProps> = ({ 
  logoText = "تفسير", 
  fontSize = 24,
  slug = "تفسير الأحلام عبر الذكاء الاصطناعي",
  isLoading = false
}) => {
  const textStyle = {
    fontSize: `${fontSize}px`,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoading ? 0 : 1,
  };

  return (
    <Link to="/" className="flex-shrink-0 flex flex-col items-center">
      <span className="font-bold text-primary logo-text" style={textStyle}>
        {logoText}
      </span>
      {slug && (
        <span className="text-muted-foreground text-xs mt-1" style={{
          transition: 'opacity 0.3s ease-in-out',
          opacity: isLoading ? 0 : 1,
        }}>
          {slug}
        </span>
      )}
    </Link>
  );
};

export default NavLogo;
