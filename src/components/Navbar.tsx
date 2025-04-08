
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
import { Skeleton } from './ui/skeleton';

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

  // إعداد أسلوب النافبار - سيكون دائمًا مرئيًا الآن
  const headerStyle: CSSProperties = {
    backgroundColor: themeSettings.headerColor || 'bg-background/80',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid' as 'solid',
    borderBottomColor: themeSettings.navbarBorderColor || '#e5e7eb',
    transition: 'background-color 0.3s ease-in-out',
    height: `${NAVBAR_HEIGHT}px`
  };

  // Don't render authentication-dependent elements until we know the auth state
  const shouldRenderAuthUI = isLoggedIn !== null;

  return (
    <nav 
      className="backdrop-blur-md fixed w-full top-0 z-50 shadow-sm rtl"
      style={headerStyle}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between h-full items-center">
          <div className="flex items-center">
            {loading ? (
              <Skeleton className="h-8 w-32 bg-muted rounded" />
            ) : (
              <NavLogo 
                logoText={themeSettings.logoText} 
                fontSize={themeSettings.logoFontSize}
                slug={themeSettings.slug}
                isLoading={false}
              />
            )}
          </div>

          {/* Desktop Menu */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
              {loading ? (
                <div className="flex items-center space-x-6 rtl:space-x-reverse">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-4 w-16 bg-muted rounded" />
                  ))}
                </div>
              ) : shouldRenderAuthUI && (
                <>
                  <NavLinks isAdmin={isAdmin} isLoggedIn={isLoggedIn} />
                  {isLoggedIn === false && <AuthButtons />}
                  <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                  {isLoggedIn && (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <NotificationBell className="ml-2" />
                      <UserMenu />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <div className="flex items-center">
              <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              
              {loading ? (
                <Skeleton className="ml-2 h-8 w-8 bg-muted rounded-full" />
              ) : (
                <>
                  {isLoggedIn && shouldRenderAuthUI && (
                    <NotificationBell className="mr-2" />
                  )}
                  {isLoggedIn === false && !isMenuOpen && shouldRenderAuthUI && (
                    <div className="mr-2">
                      <Link to="/login">
                        <Button variant="ghost" size="sm">
                          <LogIn className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                  <MobileMenuToggle 
                    isOpen={isMenuOpen} 
                    toggleMenu={toggleMenu} 
                    isLoggedIn={isLoggedIn || false}
                    userEmail={userEmail}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && shouldRenderAuthUI && !loading && (
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
