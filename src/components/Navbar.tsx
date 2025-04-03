
import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLogoutHandler } from '@/hooks/settings/useLogoutHandler';

import NavLogo from './navbar/NavLogo';
import NavLinks from './navbar/NavLinks';
import ThemeToggle from './navbar/ThemeToggle';
import UserMenu from './navbar/UserMenu';
import AuthButtons from './navbar/AuthButtons';
import MobileMenuToggle from './navbar/MobileMenuToggle';
import MobileMenu from './navbar/MobileMenu';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState('');
  const isMobile = useIsMobile();
  const { handleLogout } = useLogoutHandler();

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

  return (
    <nav className="bg-background/80 backdrop-blur-md fixed w-full top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row-reverse justify-between h-16 items-center">
          <div className="flex items-center">
            <NavLogo />
          </div>

          {/* Desktop Menu */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-6 flex-row-reverse rtl:space-x-reverse">
              <NavLinks isAdmin={isAdmin} />
              
              <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

              <div className="flex items-center space-x-3 flex-row-reverse rtl:space-x-reverse">
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

      {/* Mobile Menu */}
      {isMobile && (
        <MobileMenu 
          isOpen={isMenuOpen}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          onToggle={toggleMenu}
          onLogout={handleLogout}
        />
      )}
    </nav>
  );
};

export default Navbar;
