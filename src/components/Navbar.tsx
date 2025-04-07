
import React, { useEffect } from 'react';
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

import { CSSProperties } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState('');
  const isMobile = useIsMobile();
  const { handleLogout } = useLogoutHandler();
  const { themeSettings, loading } = useThemeSettings();

  useEffect(() => {
    // Check if user is logged in
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true' || 
                        localStorage.getItem('isAdminLoggedIn') === 'true';
    const adminStatus = localStorage.getItem('isAdminLoggedIn') === 'true';
    const email = localStorage.getItem('userEmail') || '';
    
    setIsLoggedIn(loginStatus);
    setIsAdmin(adminStatus);
    setUserEmail(email);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // إعداد أسلوب النافبار
  const headerStyle: CSSProperties = loading 
    ? { opacity: 0 } // إخفاء النافبار أثناء التحميل
    : {
        backgroundColor: themeSettings.headerColor || 'bg-background/80',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid' as 'solid',
        borderBottomColor: themeSettings.navbarBorderColor || '#e5e7eb',
        transition: 'opacity 0.3s ease-in-out, background-color 0.3s ease-in-out'
      };

  return (
    <nav 
      className={`backdrop-blur-md fixed w-full top-0 z-50 shadow-sm rtl navbar-transition ${loading ? 'navbar-loading' : 'navbar-loaded'}`}
      style={headerStyle}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <NavLogo 
              logoText={themeSettings.logoText} 
              fontSize={themeSettings.logoFontSize}
              slug={themeSettings.slug}
              isLoading={loading}
            />
          </div>

          {/* Desktop Menu */}
          {!isMobile && (
            <div className={`hidden md:flex items-center space-x-6 rtl:space-x-reverse transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
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

          {/* Mobile Menu Button */}
          {isMobile && (
            <div className={`flex items-center transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
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

      {/* Mobile Menu */}
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
