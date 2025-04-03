
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const AuthButtons = () => {
  return (
    <>
      <Link to="/login">
        <Button variant="ghost">تسجيل الدخول</Button>
      </Link>
      <Link to="/register">
        <Button>إنشاء حساب</Button>
      </Link>
    </>
  );
};

export default AuthButtons;
