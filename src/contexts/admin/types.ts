
import { User, CustomPage, NavLink } from '@/types/database';

export type HomeSectionItem = {
  id: string;
  title: string;
  order: number;
  visible: boolean;
  content?: Record<string, string>;
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

export type ActiveSections = {
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
};

export type AdminProviderProps = {
  children: React.ReactNode;
};
