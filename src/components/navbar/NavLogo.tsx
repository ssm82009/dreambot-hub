
import React from 'react';
import { Link } from 'react-router-dom';

const NavLogo = () => {
  return (
    <Link to="/" className="flex-shrink-0 flex items-center">
      <span className="text-2xl font-bold text-primary">تفسير<span className="text-accent">الأحلام</span></span>
    </Link>
  );
};

export default NavLogo;
