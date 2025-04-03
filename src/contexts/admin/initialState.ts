
export const initialAiSettings = {
  provider: 'together',
  model: 'meta-llama/Llama-3-8b-chat-hf',
  api_key: ''
};

export const initialInterpretationSettings = {
  max_input_words: 500,
  max_output_words: 1000,
  min_output_words: 300,
  system_instructions: 'أنت مفسر أحلام خبير. يجب أن تقدم تفسيرات دقيقة وشاملة استناداً إلى المراجع الإسلامية والعلمية.'
};

export const initialPricingSettings = {
  free_plan_price: 0,
  free_plan_interpretations: 3,
  free_plan_features: 'تفسير أساسي للأحلام\nدعم عبر البريد الإلكتروني',
  premium_plan_price: 49,
  premium_plan_interpretations: -1,
  premium_plan_features: 'تفسيرات أحلام غير محدودة\nتفسيرات مفصلة ومعمقة\nأرشيف لتفسيرات أحلامك السابقة\nنصائح وتوجيهات شخصية\nدعم فني على مدار الساعة',
  pro_plan_price: 99,
  pro_plan_interpretations: -1,
  pro_plan_features: 'كل مميزات الخطة المميزة\nاستشارات شخصية مع خبراء تفسير الأحلام\nتقارير تحليلية شهرية\nإمكانية إضافة 5 حسابات فرعية\nواجهة برمجة التطبيقات API'
};

export const initialPaymentSettings = {
  paylink_enabled: true,
  paylink_api_key: '',
  paylink_secret_key: '',
  paypal_enabled: false,
  paypal_client_id: '',
  paypal_secret: '',
  paypal_sandbox: true
};

export const initialThemeSettings = {
  primary_color: '#9b87f5',
  button_color: '#9b87f5',
  text_color: '#1A1F2C',
  background_color: '#F9F9F9',
  header_color: '#FFFFFF',
  footer_color: '#1A1F2C',
  logo_text: 'تفسير الأحلام',
  logo_font_size: 24,
  footer_text: 'جميع الحقوق محفوظة © 2024 تفسير الأحلام',
  twitter_link: '',
  facebook_link: '',
  instagram_link: ''
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
  themeSettings: false
};
