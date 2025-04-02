
import { useMemo } from 'react';

// This hook checks if an email is designated as an admin email
export const useAdminCheck = (email: string) => {
  const isAdminEmail = useMemo(() => {
    const adminEmails = ['ssm4all@gmail.com'];
    return adminEmails.includes(email.toLowerCase());
  }, [email]);

  return isAdminEmail;
};
