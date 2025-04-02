
import { 
  AiSettingsFormValues, 
  InterpretationSettingsFormValues, 
  PricingSettingsFormValues, 
  PaymentSettingsFormValues, 
  ThemeSettingsFormValues
} from './types';

export const initialAiSettings: AiSettingsFormValues = {
  provider: "together",
  apiKey: "",
  model: "meta-llama/Llama-3-8b-chat-hf",
};

export const initialInterpretationSettings: InterpretationSettingsFormValues = {
  maxInputWords: 500,
  minOutputWords: 300,
  maxOutputWords: 1000,
  systemInstructions: "أنت مفسر أحلام خبير. يجب أن تقدم تفسيرات دقيقة وشاملة استناداً إلى المراجع الإسلامية والعلمية."
};

export const initialPricingSettings: PricingSettingsFormValues = {
  freePlan: {
    price: 0,
    interpretationsPerMonth: 3,
    features: "تفسير أساسي للأحلام\nدعم عبر البريد الإلكتروني"
  },
  premiumPlan: {
    price: 49,
    interpretationsPerMonth: -1,
    features: "تفسيرات أحلام غير محدودة\nتفسيرات مفصلة ومعمقة\nأرشيف لتفسيرات أحلامك السابقة\nنصائح وتوجيهات شخصية\nدعم فني على مدار الساعة"
  },
  proPlan: {
    price: 99,
    interpretationsPerMonth: -1,
    features: "كل مميزات الخطة المميزة\nاستشارات شخصية مع خبراء تفسير الأحلام\nتقارير تحليلية شهرية\nإمكانية إضافة 5 حسابات فرعية\nواجهة برمجة التطبيقات API"
  }
};

export const initialPaymentSettings: PaymentSettingsFormValues = {
  paylink: {
    enabled: true,
    apiKey: "",
    secretKey: ""
  },
  paypal: {
    enabled: false,
    clientId: "",
    secret: "",
    sandbox: true
  }
};

export const initialThemeSettings: ThemeSettingsFormValues = {
  primaryColor: "#9b87f5",
  buttonColor: "#9b87f5",
  textColor: "#1A1F2C",
  backgroundColor: "#F9F9F9",
  logoText: "تفسير الأحلام",
  logoFontSize: 24,
  headerColor: "#FFFFFF",
  footerColor: "#1A1F2C",
  footerText: "جميع الحقوق محفوظة © 2024 تفسير الأحلام",
  socialLinks: {
    twitter: "",
    facebook: "",
    instagram: ""
  }
};

export const initialActiveSections: Record<string, boolean> = {
  aiSettings: false,
  interpretationSettings: false,
  pricingSettings: false,
  paymentSettings: false,
  userManagement: true,
  pageManagement: false,
  themeSettings: false,
};
