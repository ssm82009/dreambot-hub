
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLogoutHandler } from '@/hooks/settings/useLogoutHandler';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { useAdminCheck } from '@/hooks/useAdminCheck';

import NavLogo from './navbar/NavLogo';
import NavLinks from './navbar/NavLinks';
import ThemeToggle from './navbar/ThemeToggle';
import UserMenu from './navbar/UserMenu';
import AuthButtons from './navbar/AuthButtons';
import MobileMenuToggle from './navbar/MobileMenuToggle';
import MobileMenu from './navbar/MobileMenu';
import NotificationBell from './navbar/NotificationBell';

import { CSSProperties } from 'react';
import { supabase } from '@/integrations/supabase/client';

// إضافة متغير لارتفاع النافبار
export const NAVBAR_HEIGHT = 80; // ارتفاع النافبار 80 بكسل

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean | null>(null); // Initialize as null to prevent flashing
  const [userEmail, setUserEmail] = React.useState('');
  const isMobile = useIsMobile();
  const { handleLogout } = useLogoutHandler();
  const { themeSettings, loading } = useThemeSettings();
  const { isAdmin } = useAdminCheck();

  useEffect(() => {
    // Check current auth status with Supabase
    const checkAuthStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Check if user is logged in either via Supabase session or localStorage
        const loginStatus = !!session || 
                          localStorage.getItem('isLoggedIn') === 'true' || 
                          localStorage.getItem('isAdminLoggedIn') === 'true';
        const email = localStorage.getItem('userEmail') || '';
        
        setIsLoggedIn(loginStatus);
        setUserEmail(email);
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Set to false in case of error to ensure buttons show up
        setIsLoggedIn(false);
      }
    };
    
    checkAuthStatus();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuthStatus();
    });
    
    return () => {
      subscription.unsubscribe();
    };
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
        transition: 'opacity 0.3s ease-in-out, background-color 0.3s ease-in-out',
        height: `${NAVBAR_HEIGHT}px`
      };

  // للتأكد من الحالة الصحيحة لتسجيل الدخول
  console.log('Auth status:', { isLoggedIn, userEmail });

  // Temporary navbar with login buttons while the main navbar is loading
  if (loading) {
    return (
      <nav className="backdrop-blur-md fixed w-full top-0 z-50 shadow-sm rtl" style={{ height: `${NAVBAR_HEIGHT}px` }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between h-full items-center">
            <div className="flex items-center">
              <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
            </div>
            
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
                <AuthButtons />
              </div>
            )}
            
            {isMobile && (
              <div className="flex items-center">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Don't render authentication-dependent elements until we know the auth state
  // This prevents the flash of buttons before they disappear
  const shouldRenderAuthUI = isLoggedIn !== null;

  return (
    <nav 
      className={`backdrop-blur-md fixed w-full top-0 z-50 shadow-sm rtl navbar-transition ${loading ? 'navbar-loading' : 'navbar-loaded'}`}
      style={headerStyle}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between h-full items-center">
          <div className="flex items-center">
            <NavLogo 
              logoText={themeSettings.logoText} 
              fontSize={themeSettings.logoFontSize}
              slug={themeSettings.slug}
              isLoading={loading}
            />
          </div>

          {/* Desktop Menu */}
          {!isMobile && shouldRenderAuthUI && (
            <div className={`hidden md:flex items-center space-x-6 rtl:space-x-reverse transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
              <NavLinks isAdmin={isAdmin} isLoggedIn={isLoggedIn} />
              
              <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

              {isLoggedIn && (
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <UserMenu />
                </div>
              )}
              
              {/* We no longer need this block as AuthButtons is now in NavLinks */}
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && shouldRenderAuthUI && (
            <div className={`flex items-center transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
              <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              
              {isLoggedIn && (
                <NotificationBell className="mr-2" />
              )}
              
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
      {isMobile && shouldRenderAuthUI && (
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
