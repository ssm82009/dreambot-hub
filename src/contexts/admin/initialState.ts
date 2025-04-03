
export const initialAiSettings = {
  provider: 'together',
  model: 'meta-llama/Llama-3-8b-chat-hf',
  apiKey: ''
};

export const initialInterpretationSettings = {
  maxInputWords: 500,
  maxOutputWords: 1000,
  minOutputWords: 300,
  systemInstructions: 'أنت مفسر أحلام خبير. يجب أن تقدم تفسيرات دقيقة وشاملة استناداً إلى المراجع الإسلامية والعلمية.'
};

export const initialPricingSettings = {
  freePlan: {
    name: 'المجاني',
    price: 0,
    interpretationsPerMonth: 3,
    features: 'تفسير أساسي للأحلام\nدعم عبر البريد الإلكتروني'
  },
  premiumPlan: {
    name: 'المميز',
    price: 49,
    interpretationsPerMonth: -1,
    features: 'تفسيرات أحلام غير محدودة\nتفسيرات مفصلة ومعمقة\nأرشيف لتفسيرات أحلامك السابقة\nنصائح وتوجيهات شخصية\nدعم فني على مدار الساعة'
  },
  proPlan: {
    name: 'الاحترافي',
    price: 99,
    interpretationsPerMonth: -1,
    features: 'كل مميزات الخطة المميزة\nاستشارات شخصية مع خبراء تفسير الأحلام\nتقارير تحليلية شهرية\nإمكانية إضافة 5 حسابات فرعية\nواجهة برمجة التطبيقات API'
  }
};

export const initialPaymentSettings = {
  paylink: {
    enabled: true,
    apiKey: '',
    secretKey: ''
  },
  paypal: {
    enabled: false,
    clientId: '',
    secret: '',
    sandbox: true
  }
};

export const initialThemeSettings = {
  primaryColor: '#9b87f5',
  buttonColor: '#9b87f5',
  textColor: '#1A1F2C',
  backgroundColor: '#F9F9F9',
  headerColor: '#FFFFFF',
  footerColor: '#1A1F2C',
  logoText: 'تفسير الأحلام',
  logoFontSize: 24,
  footerText: 'جميع الحقوق محفوظة © 2024 تفسير الأحلام',
  socialLinks: {
    twitter: '',
    facebook: '',
    instagram: ''
  }
};

export const initialSeoSettings = {
  metaTitle: 'تفسير الأحلام - موقع تفسير الرؤى والأحلام',
  metaDescription: 'موقع متخصص في تفسير الأحلام والرؤى وفق المراجع الإسلامية والعلمية. احصل على تفسير حلمك الآن.',
  keywords: 'تفسير الأحلام, تفسير الرؤى, تفسير حلم, تفسير منام, رؤيا في المنام',
  enableSitemap: true,
  enableRobotsTxt: true,
  enableCanonicalUrls: true,
  enableOpenGraph: true,
  enableTwitterCards: true,
  googleAnalyticsId: '',
  customHeadTags: ''
};

export const initialActiveSections = {
  aiSettings: false,
  interpretationSettings: false,
  pricingSettings: false,
  paymentSettings: false,
  userManagement: false,
  pageManagement: false,
  navbarManagement: false,
  ticketManagement: false,
  transactionManagement: false,
  themeSettings: false,
  seoSettings: false
};
