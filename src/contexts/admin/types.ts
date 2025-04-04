
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
};
