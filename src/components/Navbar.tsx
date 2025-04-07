
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLogoutHandler } from '@/hooks/settings/useLogoutHandler';
import { useThemeSettings } from '@/hooks/useThemeSettings';

import NavLogo from './navbar/NavLogo';
import NavLinks from './navbar/NavLinks';
import ThemeToggle from './navbar/ThemeToggle';
import UserMenu from './navbar/UserMenu';
import AuthButtons from './navbar/AuthButtons';
import MobileMenuToggle from './navbar/MobileMenuToggle';
import MobileMenu from './navbar/MobileMenu';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const { handleLogout } = useLogoutHandler();
  const { themeSettings } = useThemeSettings();

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true' || 
                        localStorage.getItem('isAdminLoggedIn') === 'true';
    const adminStatus = localStorage.getItem('isAdminLoggedIn') === 'true';
    const email = localStorage.getItem('userEmail') || '';
    
    setIsLoggedIn(loginStatus);
    setIsAdmin(adminStatus);
    setUserEmail(email);

    // التحقق من وضع الظلام
    const darkModeStatus = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModeStatus);
    if (darkModeStatus) {
      document.documentElement.classList.add('dark');
    }

    // إضافة مراقب التمرير
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // تطبيق لون وستايل الهيدر من الإعدادات
  const headerStyle = {
    backgroundColor: isScrolled ? themeSettings.headerColor : 'transparent',
    boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
    transition: 'all 0.3s ease-in-out'
  };

  return (
    <nav 
      className={`backdrop-blur-md fixed w-full top-0 z-50 rtl ${isScrolled ? 'shadow-subtle backdrop-blur-md bg-white/90 dark:bg-black/80' : 'bg-transparent'}`}
      style={headerStyle}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <NavLogo 
              logoText={themeSettings.logoText} 
              fontSize={themeSettings.logoFontSize}
              slug={themeSettings.slug} 
            />
          </div>

          {/* قائمة سطح المكتب */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
              <NavLinks isAdmin={isAdmin} />
              
              <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {isLoggedIn ? (
                  <UserMenu 
                    userEmail={userEmail} 
                    isAdmin={isAdmin} 
                    handleLogout={handleLogout} 
                  />
                ) : (
                  <AuthButtons />
                )}
              </div>
            </div>
          )}

          {/* زر القائمة للموبايل */}
          {isMobile && (
            <div className="flex items-center">
              <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              <MobileMenuToggle 
                isOpen={isMenuOpen} 
                toggleMenu={toggleMenu} 
                isLoggedIn={isLoggedIn}
                userEmail={userEmail}
              />
            </div>
          )}
        </div>
      </div>

      {/* قائمة الموبايل */}
      {isMobile && (
        <MobileMenu 
          isOpen={isMenuOpen}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          onToggle={toggleMenu}
          onLogout={handleLogout}
          headerColor={themeSettings.headerColor}
        />
      )}
    </nav>
  );
};

export default Navbar;
