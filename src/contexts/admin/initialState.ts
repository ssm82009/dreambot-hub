
import {
  AiSettingsFormValues,
  InterpretationSettingsFormValues,
  PricingSettingsFormValues,
  PaymentSettingsFormValues,
  ThemeSettingsFormValues,
  SeoSettingsFormValues,
  ActiveSections,
  HomeSectionItem
} from './types';

export const initialAiSettings: AiSettingsFormValues = {
  apiKey: '',
  model: 'meta-llama/Llama-3-8b-chat-hf',
  provider: 'together'
};

export const initialInterpretationSettings: InterpretationSettingsFormValues = {
  maxInputWords: 500,
  minOutputWords: 300,
  maxOutputWords: 1000,
  systemInstructions: 'أنت مفسر أحلام خبير. يجب أن تقدم تفسيرات دقيقة وشاملة استناداً إلى المراجع الإسلامية والعلمية.'
};

export const initialPricingSettings: PricingSettingsFormValues = {
  freePlanName: 'المجاني',
  freePlanPrice: 0,
  freePlanInterpretations: 3,
  freePlanFeatures: 'تفسير أساسي للأحلام\nدعم عبر البريد الإلكتروني',
  premiumPlanName: 'المميز',
  premiumPlanPrice: 49,
  premiumPlanInterpretations: -1,
  premiumPlanFeatures: 'تفسيرات أحلام غير محدودة\nتفسيرات مفصلة ومعمقة',
  proPlanName: 'الاحترافي',
  proPlanPrice: 99,
  proPlanInterpretations: -1,
  proPlanFeatures: 'كل مميزات الخطة المميزة\nاستشارات شخصية مع خبراء'
};

export const initialPaymentSettings: PaymentSettingsFormValues = {
  paylinkEnabled: true,
  paylinkApiKey: '',
  paylinkSecretKey: '',
  paypalEnabled: false,
  paypalSandbox: true,
  paypalClientId: '',
  paypalSecret: ''
};

export const initialThemeSettings: ThemeSettingsFormValues = {
  primaryColor: '#9b87f5',
  buttonColor: '#9b87f5',
  textColor: '#1A1F2C',
  backgroundColor: '#F9F9F9',
  headerColor: '#FFFFFF',
  footerColor: '#1A1F2C',
  logoText: 'تفسير الأحلام',
  logoFontSize: 24,
  footerText: 'جميع الحقوق محفوظة © 2024 تفسير الأحلام',
  twitterLink: '',
  facebookLink: '',
  instagramLink: '',
  slug: 'تفسير الأحلام عبر الذكاء الاصطناعي'
};

export const initialSeoSettings: SeoSettingsFormValues = {
  metaTitle: 'تفسير الأحلام - موقع تفسير الرؤى والأحلام',
  metaDescription: 'موقع متخصص في تفسير الأحلام والرؤى وفق المراجع الإسلامية والعلمية. احصل على تفسير حلمك الآن.',
  slug: 'تفسير-الاحلام',
  keywords: 'تفسير الأحلام, تفسير الرؤى, تفسير حلم, تفسير منام, رؤيا في المنام',
  googleAnalyticsId: '',
  customHeadTags: '',
  enableOpenGraph: true,
  enableTwitterCards: true,
  enableCanonicalUrls: true,
  enableRobotsTxt: true,
  enableSitemap: true
};

// Add the initialHomeSections export
export const initialHomeSections: HomeSectionItem[] = [
  {
    id: 'hero',
    title: 'القسم الرئيسي',
    order: 1,
    visible: true,
    content: {
      title: 'تفسير الأحلام بالذكاء الاصطناعي',
      subtitle: 'فسّر أحلامك بدقة عالية باستخدام أحدث تقنيات الذكاء الاصطناعي واستنادًا إلى مراجع التفسير الإسلامية الموثوقة.'
    }
  },
  {
    id: 'tryIt',
    title: 'جرب الخدمة',
    order: 2,
    visible: true,
    content: {
      title: 'جرب خدمة تفسير الأحلام',
      subtitle: 'أدخل تفاصيل حلمك واحصل على تفسير فوري من نظام الذكاء الاصطناعي الخاص بنا'
    }
  },
  {
    id: 'howItWorks',
    title: 'كيف يعمل',
    order: 3,
    visible: true,
    content: {
      title: 'كيف يعمل تفسير الأحلام بالذكاء الاصطناعي؟',
      subtitle: 'نستخدم تقنيات الذكاء الاصطناعي المتقدمة مع مراجع التفسير الإسلامية الموثوقة',
      step1_title: '1. أدخل تفاصيل حلمك',
      step1_text: 'قم بكتابة جميع تفاصيل حلمك، كلما كانت التفاصيل أكثر كان التفسير أدق.',
      step2_title: '2. معالجة الذكاء الاصطناعي',
      step2_text: 'يقوم نظامنا بتحليل حلمك ومقارنته بآلاف التفسيرات من المراجع الموثوقة.',
      step3_title: '3. احصل على التفسير',
      step3_text: 'استلم تفسيراً دقيقاً لحلمك مع نصائح وتوجيهات مفيدة.',
      quote: '"الرؤيا الصالحة من الله، والحلم من الشيطان، فإذا حلم أحدكم حلماً يخافه فليتفل عن يساره، وليستعذ بالله من شره، فإنه لا يضره"',
      quote_author: '- حديث شريف'
    }
  }
];

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
