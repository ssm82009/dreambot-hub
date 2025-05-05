
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import AuthButtons from './AuthButtons';
import { supabase } from '@/integrations/supabase/client';
import { NavLink as NavLinkType } from '@/types/database';

interface MobileMenuProps {
  isOpen: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onToggle: () => void;
  onLogout: () => void;
  headerColor?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  isLoggedIn, 
  isAdmin, 
  onToggle, 
  onLogout,
  headerColor 
}) => {
  const [links, setLinks] = useState<NavLinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNavLinks = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('navbar_links')
          .select('*')
          .order('order', { ascending: true });

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const typedLinks: NavLinkType[] = data.map(link => ({
            id: String(link.id || ''),
            title: String(link.title || ''),
            url: String(link.url || ''),
            order: Number(link.order || 0),
            is_admin_only: Boolean(link.is_admin_only),
            created_at: String(link.created_at || new Date().toISOString())
          }));
          
          setLinks(typedLinks);
        } else {
          // Fallback to default links
          setLinks([
            { id: '1', title: 'الرئيسية', url: '/', order: 1, is_admin_only: false, created_at: new Date().toISOString() },
            { id: '2', title: 'الأسعار', url: '/pricing', order: 2, is_admin_only: false, created_at: new Date().toISOString() },
            { id: '3', title: 'حول الموقع', url: '/about', order: 3, is_admin_only: false, created_at: new Date().toISOString() },
            { id: '4', title: 'الدعم الفني', url: '/tickets', order: 4, is_admin_only: false, created_at: new Date().toISOString() },
            { id: '5', title: 'لوحة التحكم', url: '/admin', order: 5, is_admin_only: true, created_at: new Date().toISOString() }
          ]);
        }
      } catch (error) {
        console.error('Error fetching navbar links:', error);
        // Fallback to default links
        setLinks([
          { id: '1', title: 'الرئيسية', url: '/', order: 1, is_admin_only: false, created_at: new Date().toISOString() },
          { id: '2', title: 'الأسعار', url: '/pricing', order: 2, is_admin_only: false, created_at: new Date().toISOString() },
          { id: '3', title: 'حول الموقع', url: '/about', order: 3, is_admin_only: false, created_at: new Date().toISOString() },
          { id: '4', title: 'الدعم الفني', url: '/tickets', order: 4, is_admin_only: false, created_at: new Date().toISOString() },
          { id: '5', title: 'لوحة التحكم', url: '/admin', order: 5, is_admin_only: true, created_at: new Date().toISOString() }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchNavLinks();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const menuStyle = {
    backgroundColor: headerColor || 'var(--background)',
  };

  return (
    <div 
      className="md:hidden w-full border-t border-border rtl"
      style={menuStyle}
    >
      <div className="p-4 space-y-3">
        {isLoading ? (
          // Show loading placeholders
          <>
            <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
          </>
        ) : (
          // Show links from database or fallback links
          <>
            {links.map((link) => {
              // Skip admin-only links if user is not an admin
              if (link.is_admin_only && !isAdmin) {
                return null;
              }

              return (
                <Link 
                  key={link.id}
                  to={link.url} 
                  className="block py-2" 
                  onClick={onToggle}
                >
                  {link.title}
                </Link>
              );
            })}
            
            {/* Always show these links */}
            {isLoggedIn && (
              <>
                <Link to="/profile" className="block py-2" onClick={onToggle}>
                  الملف الشخصي
                </Link>
                
                <button 
                  onClick={() => {
                    onLogout();
                    onToggle();
                  }} 
                  className="flex items-center py-2 text-destructive"
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </button>
              </>
            )}
            
            {!isLoggedIn && (
              <div className="pt-2">
                <AuthButtons isMobile onClick={onToggle} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
