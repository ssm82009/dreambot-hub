
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get display name from user email
 * Returns first part of email if no name is found
 */
export const useUserDisplayName = (): string => {
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        setDisplayName('');
        return;
      }
      
      const email = session.user.email;
      if (!email) {
        setDisplayName('');
        return;
      }

      // Default display name from email (before the @ symbol)
      const defaultName = email.split('@')[0];
      setDisplayName(defaultName);

      // Try to fetch full name from database
      try {
        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('email', email)
          .single();

        if (error) {
          console.error('Error fetching user name:', error);
          return;
        }

        if (data && data.full_name) {
          setDisplayName(data.full_name);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserDetails();
  }, []);

  return displayName;
};
