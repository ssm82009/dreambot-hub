
import { 
  AiSettingsFormValues, 
  InterpretationSettingsFormValues,
  PricingSettingsFormValues, 
  PaymentSettingsFormValues,
  ThemeSettingsFormValues, 
  SeoSettingsFormValues,
  HomeSectionItem,
  ActiveSections
} from './types';

export const initialAiSettings: AiSettingsFormValues = {
  model: 'meta-llama/Llama-3-8b-chat-hf',
  provider: 'together',
  apiKey: ''
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
  premiumPlanFeatures: 'تفسيرات أحلام غير محدودة\nتفسيرات مفصلة ومعمقة\nأرشيف لتفسيرات أحلامك السابقة\nنصائح وتوجيهات شخصية\nدعم فني على مدار الساعة',
  proPlanName: 'الاحترافي',
  proPlanPrice: 99,
  proPlanInterpretations: -1,
  proPlanFeatures: 'كل مميزات الخطة المميزة\nاستشارات شخصية مع خبراء تفسير الأحلام\nتقارير تحليلية شهرية\nإمكانية إضافة 5 حسابات فرعية\nواجهة برمجة التطبيقات API'
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
  instagramLink: ''
};

export const initialSeoSettings: SeoSettingsFormValues = {
  metaTitle: 'تفسير الأحلام - موقع تفسير الرؤى والأحلام',
  metaDescription: 'موقع متخصص في تفسير الأحلام والرؤى وفق المراجع الإسلامية والعلمية. احصل على تفسير حلمك الآن.',
  slug: 'تفسير الأحلام عبر الذكاء الاصطناعي',
  keywords: 'تفسير الأحلام, تفسير الرؤى, تفسير حلم, تفسير منام, رؤيا في المنام',
  googleAnalyticsId: '',
  customHeadTags: '',
  enableOpenGraph: true,
  enableTwitterCards: true,
  enableCanonicalUrls: true,
  enableRobotsTxt: true,
  enableSitemap: true
};

export const initialHomeSections: HomeSectionItem[] = [
  { id: 'hero', title: 'قسم الترحيب (Hero)', order: 1, visible: true },
  { id: 'tryIt', title: 'قسم تجربة الخدمة', order: 2, visible: true },
  { id: 'howItWorks', title: 'قسم كيف يعمل', order: 3, visible: true }
];

export const initialActiveSections: ActiveSections = {
  aiSettings: false,
  interpretationSettings: false,
  pricingSettings: false,
  paymentSettings: false,
  transactions: false,
  users: false,
  pages: false,
  navbar: false,
  tickets: false,
  theme: false,
  seo: false,
  homeSections: false
};
