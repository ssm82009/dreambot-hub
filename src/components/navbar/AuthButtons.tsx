
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface AuthButtonsProps {
  isMobile?: boolean;
  onClick?: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ isMobile, onClick }) => {
  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <Link to="/login" onClick={onClick}>
        <Button variant="ghost" size="sm" className="flex items-center">
          <LogIn className="ml-2 rtl:rotate-180 h-4 w-4" />
          تسجيل الدخول
        </Button>
      </Link>
      <Link to="/register" onClick={onClick}>
        <Button size="sm">إنشاء حساب</Button>
      </Link>
    </div>
  );
};

export default AuthButtons;
