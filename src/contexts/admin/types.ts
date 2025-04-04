
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
  pricingSettingsForm: PricingSettingsForm;
  setPricingSettingsForm: (settings: PricingSettingsForm) => void;
  paymentSettingsForm: PaymentSettingsForm;
  setPaymentSettingsForm: (settings: PaymentSettingsForm) => void;
  themeSettingsForm: ThemeSettingsForm;
  setThemeSettingsForm: (settings: ThemeSettingsForm) => void;
  seoSettingsForm: SeoSettingsForm;
  setSeoSettingsForm: (settings: SeoSettingsForm) => void;
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

export type PricingSettingsForm = {
  freePlanPrice: number;
  freePlanInterpretations: number;
  freePlanFeatures: string;
  premiumPlanPrice: number;
  premiumPlanInterpretations: number;
  premiumPlanFeatures: string;
  proPlanPrice: number;
  proPlanInterpretations: number;
  proPlanFeatures: string;
};

export type PaymentSettingsForm = {
  paylinkEnabled: boolean;
  paylinkApiKey: string;
  paylinkSecretKey: string;
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalSecret: string;
  paypalSandbox: boolean;
};

export type ThemeSettingsForm = {
  primaryColor: string;
  buttonColor: string;
  textColor: string;
  backgroundColor: string;
  logoText: string;
  logoFontSize: number;
  headerColor: string;
  footerColor: string;
  footerText: string;
  twitterLink: string;
  facebookLink: string;
  instagramLink: string;
};

export type SeoSettingsForm = {
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
