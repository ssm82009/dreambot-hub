
import { ReactNode } from 'react';

export type AdminProviderProps = {
  children: ReactNode;
};

export type HomeSectionContentItem = {
  [key: string]: string;
};

export type HomeSectionItem = {
  id: string;
  title: string;
  order: number;
  visible: boolean;
  content?: HomeSectionContentItem;
};

export type HomeSectionsForm = {
  sections: HomeSectionItem[];
};

export type ThemeSettingsFormValues = {
  primaryColor: string;
  buttonColor: string;
  textColor: string;
  backgroundColor: string;
  headerColor: string;
  footerColor: string;
  logoText: string;
  logoFontSize: number;
  footerText: string;
  twitterLink: string;
  facebookLink: string;
  instagramLink: string;
  slug: string;
  socialLinks?: {
    twitter: string;
    facebook: string;
    instagram: string;
  };
};

export type SeoSettingsFormValues = {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  slug: string;
  googleAnalyticsId: string;
  enableOpenGraph: boolean;
  enableTwitterCards: boolean;
  enableCanonicalUrls: boolean;
  enableRobotsTxt: boolean;
  enableSitemap: boolean;
  customHeadTags: string;
};

export type PricingSettingsFormValues = {
  freePlan: {
    name: string;
    price: number;
    interpretationsPerMonth: number;
    features: string;
  };
  premiumPlan: {
    name: string;
    price: number;
    interpretationsPerMonth: number;
    features: string;
  };
  proPlan: {
    name: string;
    price: number;
    interpretationsPerMonth: number;
    features: string;
  };
};

export type ActiveSections = {
  ai: boolean;
  interpretation: boolean;
  pricing: boolean;
  payment: boolean;
  transactions: boolean;
  users: boolean;
  pages: boolean;
  navbar: boolean;
  tickets: boolean;
  theme: boolean;
  seo: boolean;
  homeSections: boolean;
  themeSettings: boolean;
};

export type AdminContextType = {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  adminEmail: string;
  setAdminEmail: (email: string) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  dbLoading: boolean;
  setDbLoading: (value: boolean) => void;
  dreams: number;
  setDreams: (value: number) => void;
  userCount: number;
  setUserCount: (value: number) => void;
  subscriptions: number;
  setSubscriptions: (value: number) => void;
  openTickets: number;
  setOpenTickets: (value: number) => void;
  users: any[];
  setUsers: (users: any[]) => void;
  pages: any[];
  setPages: (pages: any[]) => void;
  navLinks: any[];
  setNavLinks: (links: any[]) => void;
  aiSettingsForm: any;
  setAiSettingsForm: (settings: any) => void;
  interpretationSettingsForm: any;
  setInterpretationSettingsForm: (settings: any) => void;
  pricingSettingsForm: any;
  setPricingSettingsForm: (settings: any) => void;
  paymentSettingsForm: any;
  setPaymentSettingsForm: (settings: any) => void;
  themeSettingsForm: ThemeSettingsFormValues;
  setThemeSettingsForm: (settings: Partial<ThemeSettingsFormValues>) => void;
  seoSettingsForm: SeoSettingsFormValues;
  setSeoSettingsForm: (settings: SeoSettingsFormValues) => void;
  homeSectionsForm: HomeSectionsForm;
  setHomeSectionsForm: (settings: Partial<HomeSectionsForm>) => void;
  activeSections: ActiveSections;
  setActiveSections: (sections: Partial<ActiveSections>) => void;
  toggleSection: (section: keyof ActiveSections) => void;
};
