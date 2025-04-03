
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface AuthButtonsProps {
  isMobile?: boolean;
  onClick?: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ isMobile, onClick }) => {
  return (
    <>
      <Link to="/login" onClick={onClick}>
        <Button variant="ghost">تسجيل الدخول</Button>
      </Link>
      <Link to="/register" onClick={onClick}>
        <Button>إنشاء حساب</Button>
      </Link>
    </>
  );
};

export default AuthButtons;
