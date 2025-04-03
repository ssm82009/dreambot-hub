import React from 'react';

const NavLinks: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  return (
    <div className="flex items-center space-x-6 rtl:space-x-reverse">
      <a
        href="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        الرئيسية
      </a>
      <a
        href="/pricing"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        الأسعار
      </a>
      <a
        href="/about"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        حول الموقع
      </a>
      <a
        href="/tickets"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        الدعم الفني
      </a>
      {isAdmin && (
        <a
          href="/admin"
          className="text-sm font-medium transition-colors hover:text-primary text-blue-500"
        >
          لوحة التحكم
        </a>
      )}
    </div>
  );
};

export default NavLinks;
