import {
  AiSettingsFormValues,
  InterpretationSettingsFormValues,
  PricingSettingsFormValues,
  PaymentSettingsFormValues,
  ThemeSettingsFormValues,
  SeoSettingsFormValues,
  HomeSectionsFormValues,
  ActiveSections
} from './types';

export const initialAiSettings: AiSettingsFormValues = {
  apiKey: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 200,
  presencePenalty: 0.0,
  frequencyPenalty: 0.0,
};

export const initialInterpretationSettings: InterpretationSettingsFormValues = {
  introText: '',
  outroText: '',
  symbolIntroText: '',
  symbolOutroText: '',
};

export const initialPricingSettings: PricingSettingsFormValues = {
  freeCredits: 5,
  monthlySubscriptionPrice: 20,
  monthlyCredits: 100,
  yearlySubscriptionPrice: 180,
  yearlyCredits: 1200,
};

export const initialPaymentSettings: PaymentSettingsFormValues = {
  stripeSecretKey: '',
  stripePublishableKey: '',
  currency: 'USD',
};

export const initialThemeSettings: ThemeSettingsFormValues = {
  primaryColor: '#22c55e',
  secondaryColor: '#f43f5e',
  accentColor: '#bae6ff',
  backgroundColor: '#f8fafc',
  textColor: '#0f172a',
  fontFamily: 'Arial, sans-serif',
  borderRadius: 0.5,
  borderWidth: 1,
};

export const initialSeoSettings: SeoSettingsFormValues = {
  siteTitle: 'Taweel',
  siteDescription: 'تطبيق تفسير الأحلام بالذكاء الاصطناعي',
  keywords: 'تفسير الأحلام, الذكاء الاصطناعي, رؤى',
  author: 'Taweel Team',
};

export const initialHomeSections: HomeSectionsFormValues = {
  heroTitle: 'استكشف عالم الأحلام',
  heroDescription: 'اكتشف المعاني الخفية وراء أحلامك مع تأويل',
  featuresTitle: 'مميزات التطبيق',
  featuresDescription: 'تعرف على المميزات التي تجعل تأويل الخيار الأمثل لتفسير الأحلام',
  testimonialsTitle: 'آراء المستخدمين',
  testimonialsDescription: 'اطلع على تجارب المستخدمين الآخرين مع تأويل',
  ctaTitle: 'ابدأ رحلتك الآن',
  ctaDescription: 'انضم إلى مجتمع تأويل وابدأ في فهم أحلامك بشكل أفضل',
};

export const initialActiveSections: ActiveSections = {
  dashboard: true,
  aiSettings: false,
  interpretationSettings: false,
  pricingSettings: false,
  paymentSettings: false,
  users: false,
  pages: false,
  navbar: false,
  transactions: false,
  tickets: false,
  theme: false,
  seo: false,
  homeSections: false,
  database: false
};
