
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X, LayoutDashboard, User } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState('');
  const isMobile = useIsMobile();

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

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('userEmail');
    // Refresh the page to update state
    window.location.reload();
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!userEmail) return 'U';
    
    return userEmail.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-background/80 backdrop-blur-md fixed w-full top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row-reverse justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">تفسير<span className="text-accent">الأحلام</span></span>
            </Link>
          </div>

          {/* Desktop Menu */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-6 flex-row-reverse rtl:space-x-reverse">
              <Link to="/" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium">
                الرئيسية
              </Link>
              <Link to="/about" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium">
                عن الخدمة
              </Link>
              <Link to="/pricing" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium">
                الأسعار
              </Link>
              
              {/* Admin Dashboard Link - Only visible to admins */}
              {isAdmin && (
                <Link to="/admin" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  لوحة التحكم
                </Link>
              )}

              <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="mr-2">
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <div className="flex items-center space-x-3 flex-row-reverse rtl:space-x-reverse">
                {isLoggedIn ? (
                  <NavigationMenu dir="rtl">
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="gap-1 px-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials()}</AvatarFallback>
                          </Avatar>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="w-56 p-2">
                            <div className="mb-2 px-2 py-1.5 text-sm font-medium">
                              {userEmail}
                            </div>
                            <NavigationMenuLink asChild>
                              <Link
                                to="/profile"
                                className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent"
                              >
                                الملف الشخصي
                              </Link>
                            </NavigationMenuLink>
                            {isAdmin && (
                              <NavigationMenuLink asChild>
                                <Link
                                  to="/admin"
                                  className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent"
                                >
                                  لوحة التحكم
                                </Link>
                              </NavigationMenuLink>
                            )}
                            <div className="mt-2 border-t pt-1.5">
                              <button
                                onClick={handleLogout}
                                className="block w-full text-right px-2 py-1.5 text-sm text-destructive rounded-sm hover:bg-accent"
                              >
                                تسجيل الخروج
                              </button>
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost">تسجيل الدخول</Button>
                    </Link>
                    <Link to="/register">
                      <Button>إنشاء حساب</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="ml-2">
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              {isLoggedIn && (
                <Link to="/profile" className="ml-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md shadow-lg p-4">
          <div className="flex flex-col space-y-3 text-right">
            <Link to="/" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
              الرئيسية
            </Link>
            <Link to="/about" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
              عن الخدمة
            </Link>
            <Link to="/pricing" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
              الأسعار
            </Link>
            
            {isLoggedIn && (
              <Link to="/profile" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium flex items-center justify-end" onClick={() => setIsMenuOpen(false)}>
                <User className="ml-2 h-4 w-4" />
                الملف الشخصي
              </Link>
            )}
            
            {/* Admin Dashboard Link in Mobile Menu - Only visible to admins */}
            {isAdmin && (
              <Link to="/admin" className="text-foreground/90 hover:text-primary px-3 py-2 font-medium flex items-center justify-end" onClick={() => setIsMenuOpen(false)}>
                <LayoutDashboard className="ml-2 h-4 w-4" />
                لوحة التحكم
              </Link>
            )}
            
            <div className="flex flex-col pt-4 space-y-3">
              {isLoggedIn ? (
                <Button variant="outline" className="w-full" onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}>
                  تسجيل الخروج
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">تسجيل الدخول</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">إنشاء حساب</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
