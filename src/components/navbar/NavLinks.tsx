
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { NavLink as NavLinkType } from '@/types/database';
import AuthButtons from './AuthButtons';
import { Skeleton } from '@/components/ui/skeleton';

interface NavLinksProps {
  isAdmin: boolean;
  isLoggedIn: boolean | null;
}

const NavLinks: React.FC<NavLinksProps> = ({ isAdmin, isLoggedIn }) => {
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
          // Convert data to NavLinkType
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
          // Fallback to default links if no data is returned
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
        // Fallback to default links if there's an error
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

    fetchNavLinks();
  }, []);

  if (isLoading) {
    // Show a skeleton loader while loading
    return (
      <div className="flex items-center space-x-6 rtl:space-x-reverse">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-4 w-16 bg-muted rounded" />
        ))}
      </div>
    );
  }

  // If we still have no links after loading, show fallback links
  if (links.length === 0) {
    return (
      <div className="flex items-center space-x-6 rtl:space-x-reverse">
        <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
          الرئيسية
        </Link>
        <Link to="/pricing" className="text-sm font-medium transition-colors hover:text-primary">
          الأسعار
        </Link>
        <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
          حول الموقع
        </Link>
        {isAdmin && (
          <Link to="/admin" className="text-sm font-medium transition-colors hover:text-primary text-blue-500">
            لوحة التحكم
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-6 rtl:space-x-reverse">
      {links.map((link) => {
        // Skip admin-only links if user is not an admin
        if (link.is_admin_only && !isAdmin) {
          return null;
        }

        return (
          <Link
            key={link.id}
            to={link.url}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              link.is_admin_only ? 'text-blue-500' : ''
            }`}
          >
            {link.title}
          </Link>
        );
      })}
    </div>
  );
};

export default NavLinks;
