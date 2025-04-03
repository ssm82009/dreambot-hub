
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { NavLink as NavLinkType } from '@/types/database';

const NavLinks: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
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

        setLinks(data as NavLinkType[] || []);
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
          <div key={i} className="h-4 w-16 bg-muted rounded animate-pulse"></div>
        ))}
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
