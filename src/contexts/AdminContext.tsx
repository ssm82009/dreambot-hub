
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  AiSettings, 
  InterpretationSettings, 
  PricingSettings, 
  PaymentSettings, 
  ThemeSettings, 
  User, 
  CustomPage
} from '@/types/database';

type AiSettingsFormValues = {
  provider: string;
  apiKey: string;
  model: string;
};

type InterpretationSettingsFormValues = {
  maxInputWords: number;
  minOutputWords: number;
  maxOutputWords: number;
  systemInstructions: string;
};

type PricingSettingsFormValues = {
  freePlan: {
    price: number;
    interpretationsPerMonth: number;
    features: string;
  };
  premiumPlan: {
    price: number;
    interpretationsPerMonth: number;
    features: string;
  };
  proPlan: {
    price: number;
    interpretationsPerMonth: number;
    features: string;
  };
};

type PaymentSettingsFormValues = {
  paylink: {
    enabled: boolean;
    apiKey: string;
    secretKey: string;
  };
  paypal: {
    enabled: boolean;
    clientId: string;
    secret: string;
    sandbox: boolean;
  };
};

type ThemeSettingsFormValues = {
  primaryColor: string;
  buttonColor: string;
  textColor: string;
  backgroundColor: string;
  logoText: string;
  logoFontSize: number;
  headerColor: string;
  footerColor: string;
  footerText: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
  };
};

type AdminContextType = {
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
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  pages: CustomPage[];
  setPages: React.Dispatch<React.SetStateAction<CustomPage[]>>;
  aiSettingsForm: AiSettingsFormValues;
  setAiSettingsForm: React.Dispatch<React.SetStateAction<AiSettingsFormValues>>;
  interpretationSettingsForm: InterpretationSettingsFormValues;
  setInterpretationSettingsForm: React.Dispatch<React.SetStateAction<InterpretationSettingsFormValues>>;
  pricingSettingsForm: PricingSettingsFormValues;
  setPricingSettingsForm: React.Dispatch<React.SetStateAction<PricingSettingsFormValues>>;
  paymentSettingsForm: PaymentSettingsFormValues;
  setPaymentSettingsForm: React.Dispatch<React.SetStateAction<PaymentSettingsFormValues>>;
  themeSettingsForm: ThemeSettingsFormValues;
  setThemeSettingsForm: React.Dispatch<React.SetStateAction<ThemeSettingsFormValues>>;
  activeSections: Record<string, boolean>;
  setActiveSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  toggleSection: (section: string) => void;
};

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dbLoading, setDbLoading] = useState(true);
  const [dreams, setDreams] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [subscriptions, setSubscriptions] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  const [pages, setPages] = useState<CustomPage[]>([]);

  // Settings form values
  const [aiSettingsForm, setAiSettingsForm] = useState<AiSettingsFormValues>({
    provider: "together",
    apiKey: "",
    model: "meta-llama/Llama-3-8b-chat-hf",
  });
  
  const [interpretationSettingsForm, setInterpretationSettingsForm] = useState<InterpretationSettingsFormValues>({
    maxInputWords: 500,
    minOutputWords: 300,
    maxOutputWords: 1000,
    systemInstructions: "أنت مفسر أحلام خبير. يجب أن تقدم تفسيرات دقيقة وشاملة استناداً إلى المراجع الإسلامية والعلمية."
  });
  
  const [pricingSettingsForm, setPricingSettingsForm] = useState<PricingSettingsFormValues>({
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
  });
  
  const [paymentSettingsForm, setPaymentSettingsForm] = useState<PaymentSettingsFormValues>({
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
  });
  
  const [themeSettingsForm, setThemeSettingsForm] = useState<ThemeSettingsFormValues>({
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
  });

  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({
    aiSettings: false,
    interpretationSettings: false,
    pricingSettings: false,
    paymentSettings: false,
    userManagement: true,
    pageManagement: false,
    themeSettings: false,
  });

  // Toggle section function
  const toggleSection = (section: string) => {
    setActiveSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        setIsAdmin,
        adminEmail,
        setAdminEmail,
        isLoading,
        setIsLoading,
        dbLoading,
        setDbLoading,
        dreams,
        setDreams,
        userCount,
        setUserCount,
        subscriptions,
        setSubscriptions,
        users,
        setUsers,
        pages,
        setPages,
        aiSettingsForm,
        setAiSettingsForm,
        interpretationSettingsForm,
        setInterpretationSettingsForm,
        pricingSettingsForm,
        setPricingSettingsForm,
        paymentSettingsForm,
        setPaymentSettingsForm,
        themeSettingsForm,
        setThemeSettingsForm,
        activeSections,
        setActiveSections,
        toggleSection
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
