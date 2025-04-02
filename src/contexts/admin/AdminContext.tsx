
import { createContext, useContext } from 'react';
import { AdminContextType } from './types';

// Create the context with undefined as initial value
export const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Hook for consuming the admin context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
