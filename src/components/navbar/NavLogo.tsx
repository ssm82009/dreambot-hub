
import React from 'react';
import { Link } from 'react-router-dom';

interface NavLogoProps {
  logoText?: string;
  fontSize?: number;
  slug?: string;
}

const NavLogo: React.FC<NavLogoProps> = ({ 
  logoText = "تأويل", 
  fontSize = 24,
  slug = "تفسير الأحلام"
}) => {
  return (
    <Link to="/" className="flex items-center">
      <div className="flex flex-col">
        <h1 
          className="title-font font-bold gradient-text"
          style={{ fontSize: `${fontSize}px` }}
        >
          {logoText}
        </h1>
        {slug && (
          <span className="text-xs text-foreground/70 -mt-1 font-tajawal">
            {slug}
          </span>
        )}
      </div>
    </Link>
  );
};

export default NavLogo;
