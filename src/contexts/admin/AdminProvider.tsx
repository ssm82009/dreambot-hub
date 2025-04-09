
import React, { useState } from 'react';
import { AdminContext } from './AdminContext';
import { AdminProviderProps, ThemeSettingsFormValues, ActiveSections } from './types';
import { User, CustomPage, NavLink } from '@/types/database';
import {
  initialAiSettings,
  initialInterpretationSettings,
  initialPricingSettings,
  initialPaymentSettings,
  initialThemeSettings,
  initialSeoSettings,
  initialHomeSections,
  initialActiveSections
} from './initialState';

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  // Auth and loading states
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dbLoading, setDbLoading] = useState(true);
  
  // Dashboard statistics
  const [dreams, setDreams] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [subscriptions, setSubscriptions] = useState<number>(0);
  const [openTickets, setOpenTickets] = useState<number>(0);
  
  // Data collections
  const [users, setUsers] = useState<User[]>([]);
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);

  // Settings form values
  const [aiSettingsForm, setAiSettingsForm] = useState(initialAiSettings);
  const [interpretationSettingsForm, setInterpretationSettingsForm] = useState(initialInterpretationSettings);
  const [pricingSettingsForm, setPricingSettingsForm] = useState(initialPricingSettings);
  const [paymentSettingsForm, setPaymentSettingsForm] = useState(initialPaymentSettings);
  const [themeSettingsForm, setThemeSettingsForm] = useState(initialThemeSettings);
  const [seoSettingsForm, setSeoSettingsForm] = useState(initialSeoSettings);
  const [homeSectionsForm, setHomeSectionsForm] = useState<typeof initialHomeSections>(initialHomeSections);
  
  // UI state
  const [activeSections, setActiveSections] = useState<ActiveSections>(initialActiveSections);

  // Toggle section function
  const toggleSection = (section: keyof ActiveSections) => {
    setActiveSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        setIsAdmin,
        adminEmail,
        setAdminEmail,
        isLoading,
        setIsLoading,
        dbLoading,
        setDbLoading,
        dreams,
        setDreams,
        userCount,
        setUserCount,
        subscriptions,
        setSubscriptions,
        openTickets,
        setOpenTickets,
        users,
        setUsers,
        pages,
        setPages,
        navLinks,
        setNavLinks,
        aiSettingsForm,
        setAiSettingsForm,
        interpretationSettingsForm,
        setInterpretationSettingsForm,
        pricingSettingsForm,
        setPricingSettingsForm,
        paymentSettingsForm,
        setPaymentSettingsForm,
        themeSettingsForm,
        setThemeSettingsForm: (settings: Partial<ThemeSettingsFormValues>) => {
          setThemeSettingsForm(prev => ({ ...prev, ...settings }));
        },
        seoSettingsForm,
        setSeoSettingsForm,
        homeSectionsForm,
        setHomeSectionsForm,
        activeSections,
        setActiveSections: (sections) => {
          setActiveSections(prev => ({ ...prev, ...sections }));
        },
        toggleSection
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
