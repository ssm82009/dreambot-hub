
import { User, CustomPage, NavLink } from '@/types/database';

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
  users: User[];
  setUsers: (users: User[]) => void;
  pages: CustomPage[];
  setPages: (pages: CustomPage[]) => void;
  navLinks: NavLink[];
  setNavLinks: (links: NavLink[]) => void;
  aiSettingsForm: AiSettingsForm;
  setAiSettingsForm: (settings: AiSettingsForm) => void;
  interpretationSettingsForm: InterpretationSettingsForm;
  setInterpretationSettingsForm: (settings: InterpretationSettingsForm) => void;
  pricingSettingsForm: PricingSettingsFormValues;
  setPricingSettingsForm: (settings: PricingSettingsFormValues) => void;
  paymentSettingsForm: PaymentSettingsFormValues;
  setPaymentSettingsForm: (settings: PaymentSettingsFormValues) => void;
  themeSettingsForm: ThemeSettingsFormValues;
  setThemeSettingsForm: (settings: Partial<ThemeSettingsFormValues>) => void;
  seoSettingsForm: SeoSettingsFormValues;
  setSeoSettingsForm: (settings: SeoSettingsFormValues) => void;
  activeSections: ActiveSections;
  setActiveSections: (sections: ActiveSections) => void;
  toggleSection: (section: string) => void;
};

export type ActiveSections = {
  aiSettings: boolean;
  interpretationSettings: boolean;
  pricingSettings: boolean;
  paymentSettings: boolean;
  themeSettings: boolean;
  seoSettings: boolean;
  userManagement: boolean;
  pageManagement: boolean;
  navbarManagement: boolean;
  ticketManagement: boolean;
  transactionManagement: boolean;
  [key: string]: boolean;
};

export type AdminProviderProps = {
  children: React.ReactNode;
};

export type AiSettingsForm = {
  provider: string;
  apiKey: string;
  model: string;
};

export type InterpretationSettingsForm = {
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
  };
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
  // Make slug property required to match the implementation
  slug: string;
};

export type SeoSettingsFormValues = {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  enableTwitterCards: boolean;
  enableOpenGraph: boolean;
  enableCanonicalUrls: boolean;
  enableRobotsTxt: boolean;
  enableSitemap: boolean;
  googleAnalyticsId: string;
  customHeadTags: string;
};
