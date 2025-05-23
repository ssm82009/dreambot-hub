import { User, CustomPage, NavLink } from '@/types/database';

// Define Json type to match the Supabase Json type
export type Json = 
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type HomeSectionStyle = {
  backgroundColor?: string;
  textColor?: string;
  [key: string]: string | undefined; // Add index signature to make it compatible with Json
};

export type HomeSectionContent = {
  title?: string;
  subtitle?: string;
  [key: string]: any; // Already has index signature
};

export type HomeSectionItem = {
  id: string;
  title: string;
  order: number;
  visible: boolean;
  content?: HomeSectionContent;
  style?: HomeSectionStyle;
  [key: string]: any; // Add index signature to make it compatible with Json
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
  twitterLink?: string;
  facebookLink?: string;
  instagramLink?: string;
  slug: string;
  navbarBorderColor: string;
};

export type AiSettingsFormValues = {
  model: string;
  provider: string;
  apiKey: string;
};

export type InterpretationSettingsFormValues = {
  maxInputWords: number;
  minOutputWords: number;
  maxOutputWords: number;
  systemInstructions: string;
};

export type PricingSettingsFormValues = {
  freePlanName: string;
  freePlanPrice: number;
  freePlanInterpretations: number;
  freePlanFeatures: string;
  premiumPlanName: string;
  premiumPlanPrice: number;
  premiumPlanInterpretations: number;
  premiumPlanFeatures: string;
  proPlanName: string;
  proPlanPrice: number;
  proPlanInterpretations: number;
  proPlanFeatures: string;
};

export type PaymentSettingsFormValues = {
  paylinkEnabled: boolean;
  paylinkApiKey: string;
  paylinkSecretKey: string;
  paypalEnabled: boolean;
  paypalSandbox: boolean;
  paypalClientId: string;
  paypalSecret: string;
};

export type SeoSettingsFormValues = {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string;
  googleAnalyticsId: string;
  customHeadTags: string;
  enableOpenGraph: boolean;
  enableTwitterCards: boolean;
  enableCanonicalUrls: boolean;
  enableRobotsTxt: boolean;
  enableSitemap: boolean;
};

export interface ActiveSections {
  dashboard: boolean;
  aiSettings: boolean;
  interpretationSettings: boolean;
  pricingSettings: boolean;
  paymentSettings: boolean;
  transactions: boolean;
  users: boolean;
  pages: boolean;
  navbar: boolean;
  tickets: boolean;
  theme: boolean;
  seo: boolean;
  homeSections: boolean;
  notifications: boolean;
  dreams: boolean;
}

export type AdminProviderProps = {
  children: React.ReactNode;
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
  openTickets: number;
  setOpenTickets: React.Dispatch<React.SetStateAction<number>>;
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
  setThemeSettingsForm: (settings: Partial<ThemeSettingsFormValues>) => void;
  seoSettingsForm: SeoSettingsFormValues;
  setSeoSettingsForm: React.Dispatch<React.SetStateAction<SeoSettingsFormValues>>;
  homeSectionsForm: HomeSectionItem[];
  setHomeSectionsForm: (settings: any) => void;
  activeSections: ActiveSections;
  setActiveSections: (sections: Partial<ActiveSections>) => void;
  toggleSection: (section: keyof ActiveSections) => void;
};
