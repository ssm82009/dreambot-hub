
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get display name from user email
 * Returns first part of email if no name is found
 */
export const useUserDisplayName = (email: string): string => {
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    if (!email) {
      setDisplayName('');
      return;
    }

    // Default display name from email (before the @ symbol)
    const defaultName = email.split('@')[0];
    setDisplayName(defaultName);

    // Try to fetch full name from database
    const fetchUserName = async () => {
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

    fetchUserName();
  }, [email]);

  return displayName;
};
