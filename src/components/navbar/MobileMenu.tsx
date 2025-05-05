
import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import AuthButtons from './AuthButtons';

interface MobileMenuProps {
  isOpen: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onToggle: () => void;
  onLogout: () => void;
  headerColor?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  isLoggedIn, 
  isAdmin, 
  onToggle, 
  onLogout,
  headerColor 
}) => {
  if (!isOpen) return null;

  const menuStyle = {
    backgroundColor: headerColor || 'var(--background)',
  };

  return (
    <div 
      className="md:hidden w-full border-t border-border rtl"
      style={menuStyle}
    >
      <div className="p-4 space-y-3">
        <Link to="/" className="block py-2" onClick={onToggle}>
          الرئيسية
        </Link>
        <Link to="/about" className="block py-2" onClick={onToggle}>
          عن الخدمة
        </Link>
        <Link to="/pricing" className="block py-2" onClick={onToggle}>
          الأسعار
        </Link>
        
        {isLoggedIn && (
          <>
            <Link to="/profile" className="block py-2" onClick={onToggle}>
              الملف الشخصي
            </Link>
            <Link to="/tickets" className="block py-2" onClick={onToggle}>
              الدعم الفني
            </Link>
            {isAdmin && (
              <Link to="/admin" className="block py-2" onClick={onToggle}>
                لوحة التحكم
              </Link>
            )}
            <button 
              onClick={() => {
                onLogout();
                onToggle();
              }} 
              className="flex items-center py-2 text-destructive"
            >
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </button>
          </>
        )}
        
        {!isLoggedIn && (
          <div className="pt-2">
            <AuthButtons isMobile onClick={onToggle} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
