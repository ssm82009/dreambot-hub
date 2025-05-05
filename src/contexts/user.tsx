
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserContextType = {
  userData: any | null;
  refreshUserData: () => Promise<void>;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  userData: null,
  refreshUserData: async () => {},
  isLoading: true
});

export const useUser = () => useContext(UserContext);

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setUserData(null);
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
      } else {
        // Add email from session to userData
        setUserData({
          ...data,
          email: session.user.email
        });
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    refreshUserData();
  }, []);
  
  return (
    <UserContext.Provider value={{ userData, refreshUserData, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};
