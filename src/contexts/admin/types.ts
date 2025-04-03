import { ReactNode } from 'react';
import { User, CustomPage, NavLink } from '@/types/database';

export type AiSettingsFormValues = {
  provider: string;
  apiKey: string;
  model: string;
};

export type InterpretationSettingsFormValues = {
  maxInputWords: number;
  minOutputWords: number;
  maxOutputWords: number;
  systemInstructions: string;
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

export type PaymentSettingsFormValues = {
  paylink: {
    enabled: boolean;
    apiKey: string;
    secretKey: string;
  };
  paypal: {
    enabled: boolean;
    clientId: string;
    secret: string;
    sandbox: boolean;
  }
};

export type ThemeSettingsFormValues = {
  primaryColor: string;
  buttonColor: string;
  textColor: string;
  backgroundColor: string;
  logoText: string;
  logoFontSize: number;
  headerColor: string;
  footerColor: string;
  footerText: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
  };
  slug: string;
};

export type SeoSettingsFormValues = {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  enableSitemap: boolean;
  enableRobotsTxt: boolean;
  enableCanonicalUrls: boolean;
  enableOpenGraph: boolean;
  enableTwitterCards: boolean;
  googleAnalyticsId: string;
  customHeadTags: string;
};

export type AdminContextType = {
  isAdmin: boolean;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  adminEmail: string;
  setAdminEmail: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  dbLoading: boolean;
  setDbLoading: React.Dispatch<React.SetStateAction<boolean>>;
  dreams: number;
  setDreams: React.Dispatch<React.SetStateAction<number>>;
  userCount: number;
  setUserCount: React.Dispatch<React.SetStateAction<number>>;
  subscriptions: number;
  setSubscriptions: React.Dispatch<React.SetStateAction<number>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  pages: CustomPage[];
  setPages: React.Dispatch<React.SetStateAction<CustomPage[]>>;
  navLinks: NavLink[];
  setNavLinks: React.Dispatch<React.SetStateAction<NavLink[]>>;
  aiSettingsForm: AiSettingsFormValues;
  setAiSettingsForm: React.Dispatch<React.SetStateAction<AiSettingsFormValues>>;
  interpretationSettingsForm: InterpretationSettingsFormValues;
  setInterpretationSettingsForm: React.Dispatch<React.SetStateAction<InterpretationSettingsFormValues>>;
  pricingSettingsForm: PricingSettingsFormValues;
  setPricingSettingsForm: React.Dispatch<React.SetStateAction<PricingSettingsFormValues>>;
  paymentSettingsForm: PaymentSettingsFormValues;
  setPaymentSettingsForm: React.Dispatch<React.SetStateAction<PaymentSettingsFormValues>>;
  themeSettingsForm: ThemeSettingsFormValues;
  setThemeSettingsForm: React.Dispatch<React.SetStateAction<ThemeSettingsFormValues>>;
  seoSettingsForm: SeoSettingsFormValues;
  setSeoSettingsForm: React.Dispatch<React.SetStateAction<SeoSettingsFormValues>>;
  activeSections: Record<string, boolean>;
  setActiveSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  toggleSection: (section: string) => void;
};

export type AdminProviderProps = {
  children: ReactNode;
};
