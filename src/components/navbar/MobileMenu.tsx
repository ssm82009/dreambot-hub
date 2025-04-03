
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, User } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  isLoggedIn,
  isAdmin,
  onToggle,
  onLogout
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="md:hidden bg-background/95 backdrop-blur-md shadow-lg p-4">
      <div className="flex flex-col space-y-3 text-right">
        <Link to="/" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium" onClick={onToggle}>
          الرئيسية
        </Link>
        <Link to="/about" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium" onClick={onToggle}>
          عن الخدمة
        </Link>
        <Link to="/pricing" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium" onClick={onToggle}>
          الأسعار
        </Link>
        
        {isLoggedIn && (
          <Link to="/profile" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium flex items-center justify-end" onClick={onToggle}>
            <User className="ml-2 h-4 w-4" />
            الملف الشخصي
          </Link>
        )}
        
        {isAdmin && (
          <Link to="/admin" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium flex items-center justify-end" onClick={onToggle}>
            <LayoutDashboard className="ml-2 h-4 w-4" />
            لوحة التحكم
          </Link>
        )}
        
        <div className="flex flex-col pt-4 space-y-3">
          {isLoggedIn ? (
            <Button variant="outline" className="w-full" onClick={() => {
              onLogout();
              onToggle();
            }}>
              تسجيل الخروج
            </Button>
          ) : (
            <>
              <Link to="/login" onClick={onToggle}>
                <Button variant="outline" className="w-full">تسجيل الدخول</Button>
              </Link>
              <Link to="/register" onClick={onToggle}>
                <Button className="w-full">إنشاء حساب</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
