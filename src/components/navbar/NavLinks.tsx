
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard } from "lucide-react";

interface NavLinksProps {
  isAdmin: boolean;
}

const NavLinks: React.FC<NavLinksProps> = ({ isAdmin }) => {
  return (
    <div className="hidden md:flex items-center space-x-6 flex-row-reverse rtl:space-x-reverse">
      <Link to="/" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium">
        الرئيسية
      </Link>
      <Link to="/about" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium">
        عن الخدمة
      </Link>
      <Link to="/pricing" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium">
        الأسعار
      </Link>
      
      {isAdmin && (
        <Link to="/admin" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium flex items-center">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          لوحة التحكم
        </Link>
      )}
    </div>
  );
};

export default NavLinks;
