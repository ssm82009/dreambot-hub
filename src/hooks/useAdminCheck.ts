
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// This hook checks if a user is an admin
export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if user is admin by email or by role in users table
      const adminEmails = ['ssm4all@gmail.com'];
      if (adminEmails.includes(session.user.email || '')) {
        setIsAdmin(true);
        return;
      }

      // Check user table for admin role
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (data && data.role === 'admin') {
        setIsAdmin(true);
      }
    };

    checkAdminStatus();
  }, []);

  return { isAdmin };
}

// This alternate version accepts an email parameter for checking if that email is admin
export function checkIfAdminEmail(email: string): boolean {
  if (!email) return false;
  const adminEmails = ['ssm4all@gmail.com'];
  return adminEmails.includes(email.toLowerCase());
}
