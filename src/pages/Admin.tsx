
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';
import { 
  Settings, 
  PenSquare, 
  CreditCard, 
  Users, 
  FileText, 
  Palette, 
  Brain, 
  DollarSign
} from 'lucide-react';

// استيراد المكونات والأنواع الجديدة
import AdminSection from '@/components/admin/AdminSection';
import DashboardStats from '@/components/admin/DashboardStats';
import AiSettingsForm from '@/components/admin/AiSettingsForm';
import InterpretationSettingsForm from '@/components/admin/InterpretationSettingsForm';
import PricingSettingsForm from '@/components/admin/PricingSettingsForm';
import PaymentSettingsForm from '@/components/admin/PaymentSettingsForm';
import ThemeSettingsForm from '@/components/admin/ThemeSettingsForm';
import UserManagement from '@/components/admin/UserManagement';
import PageManagement from '@/components/admin/PageManagement';
import { 
  AiSettings, 
  InterpretationSettings, 
  PricingSettings, 
  PaymentSettings, 
  ThemeSettings, 
  User, 
  CustomPage
} from '@/types/database';

type AiModel = {
  id: string;
  name: string;
  description: string;
  availability: 'free' | 'paid';
};

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

const togetherModels: AiModel[] = [
  { id: 'meta-llama/Llama-3-70b-chat-hf', name: 'Llama 3 70B Chat', description: 'أقوى نموذج مفتوح المصدر للمحادثة', availability: 'paid' },
  { id: 'meta-llama/Llama-3-8b-chat-hf', name: 'Llama 3 8B Chat', description: 'نموذج متوسط الحجم مثالي للتطبيقات العامة', availability: 'free' },
  { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', description: 'نموذج مزيج قوي بتكلفة منخفضة', availability: 'free' },
  { id: 'codellama/CodeLlama-70b-Instruct-hf', name: 'CodeLlama 70B', description: 'متخصص في فهم وتوليد التعليمات المعقدة', availability: 'paid' },
  { id: 'meta-llama/Meta-Llama-3-8B-Instruct', name: 'Meta Llama 3 8B', description: 'نموذج تعليمات متوازن', availability: 'free' },
  { id: 'upstage/SOLAR-10.7B-Instruct-v1.0', name: 'SOLAR 10.7B', description: 'نموذج محسن للغة العربية', availability: 'free' },
  { id: 'togethercomputer/StripedHyena-Nous-7B', name: 'StripedHyena 7B', description: 'نموذج خفيف وسريع', availability: 'free' },
];

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dbLoading, setDbLoading] = useState(true);
  const [dreams, setDreams] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [subscriptions, setSubscriptions] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  const [pages, setPages] = useState<CustomPage[]>([]);

  // قيم نماذج الإعدادات
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

  // وظيفة لتبديل حالة القسم (مفتوح/مغلق)
  const toggleSection = (section: string) => {
    setActiveSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // جلب البيانات من قاعدة البيانات عند تحميل الصفحة
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdminLoggedIn') === 'true';
    const email = localStorage.getItem('userEmail') || '';
    
    setIsAdmin(adminStatus);
    setAdminEmail(email);

    // إذا كان المستخدم مشرفًا، قم بجلب البيانات من قاعدة البيانات
    if (adminStatus) {
      fetchDashboardStats();
      fetchAllSettings();
    } else {
      setIsLoading(false);
      toast.error("يجب تسجيل الدخول كمشرف للوصول إلى لوحة التحكم");
      navigate('/login');
    }
  }, [navigate]);

  // وظيفة لجلب الإحصائيات لأجل لوحة المعلومات
  const fetchDashboardStats = async () => {
    try {
      // جلب عدد الأحلام
      const { count: dreamsCount, error: dreamsError } = await supabase
        .from('dreams')
        .select('*', { count: 'exact', head: true });
      
      if (dreamsError) {
        console.error("خطأ في جلب عدد الأحلام:", dreamsError);
      } else {
        setDreams(dreamsCount || 0);
      }

      // جلب عدد المستخدمين
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) {
        console.error("خطأ في جلب عدد المستخدمين:", usersError);
      } else {
        setUserCount(usersCount || 0);
      }

      // جلب عدد الاشتراكات النشطة
      const { count: subscriptionsCount, error: subscriptionsError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .neq('subscription_type', 'free')
        .gt('subscription_expires_at', new Date().toISOString());
      
      if (subscriptionsError) {
        console.error("خطأ في جلب عدد الاشتراكات:", subscriptionsError);
      } else {
        setSubscriptions(subscriptionsCount || 0);
      }

      // جلب المستخدمين
      const { data: usersData, error: fetchUsersError } = await supabase
        .from('users')
        .select('*');

      if (fetchUsersError) {
        console.error("خطأ في جلب المستخدمين:", fetchUsersError);
      } else {
        setUsers(usersData || []);
      }

      // جلب الصفحات
      const { data: pagesData, error: fetchPagesError } = await supabase
        .from('custom_pages')
        .select('*');

      if (fetchPagesError) {
        console.error("خطأ في جلب الصفحات:", fetchPagesError);
      } else {
        setPages(pagesData || []);
      }
    } catch (error) {
      console.error("خطأ في جلب الإحصائيات:", error);
    }
  };

  // وظيفة لجلب جميع الإعدادات من قاعدة البيانات
  const fetchAllSettings = async () => {
    setDbLoading(true);
    try {
      // جلب إعدادات الذكاء الاصطناعي
      const { data: aiData, error: aiError } = await supabase
        .from('ai_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (aiError) {
        console.error("خطأ في جلب إعدادات الذكاء الاصطناعي:", aiError);
      } else if (aiData) {
        setAiSettingsForm({
          provider: aiData.provider,
          apiKey: aiData.api_key,
          model: aiData.model
        });
      }

      // جلب إعدادات التفسير
      const { data: interpretationData, error: interpretationError } = await supabase
        .from('interpretation_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (interpretationError) {
        console.error("خطأ في جلب إعدادات التفسير:", interpretationError);
      } else if (interpretationData) {
        setInterpretationSettingsForm({
          maxInputWords: interpretationData.max_input_words,
          minOutputWords: interpretationData.min_output_words,
          maxOutputWords: interpretationData.max_output_words,
          systemInstructions: interpretationData.system_instructions
        });
      }

      // جلب إعدادات الخطط والأسعار
      const { data: pricingData, error: pricingError } = await supabase
        .from('pricing_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (pricingError) {
        console.error("خطأ في جلب إعدادات الخطط والأسعار:", pricingError);
      } else if (pricingData) {
        setPricingSettingsForm({
          freePlan: {
            price: Number(pricingData.free_plan_price),
            interpretationsPerMonth: pricingData.free_plan_interpretations,
            features: pricingData.free_plan_features
          },
          premiumPlan: {
            price: Number(pricingData.premium_plan_price),
            interpretationsPerMonth: pricingData.premium_plan_interpretations,
            features: pricingData.premium_plan_features
          },
          proPlan: {
            price: Number(pricingData.pro_plan_price),
            interpretationsPerMonth: pricingData.pro_plan_interpretations,
            features: pricingData.pro_plan_features
          }
        });
      }

      // جلب إعدادات بوابات الدفع
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (paymentError) {
        console.error("خطأ في جلب إعدادات بوابات الدفع:", paymentError);
      } else if (paymentData) {
        setPaymentSettingsForm({
          paylink: {
            enabled: paymentData.paylink_enabled,
            apiKey: paymentData.paylink_api_key || "",
            secretKey: paymentData.paylink_secret_key || ""
          },
          paypal: {
            enabled: paymentData.paypal_enabled,
            clientId: paymentData.paypal_client_id || "",
            secret: paymentData.paypal_secret || "",
            sandbox: paymentData.paypal_sandbox
          }
        });
      }

      // جلب إعدادات المظهر
      const { data: themeData, error: themeError } = await supabase
        .from('theme_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (themeError) {
        console.error("خطأ في جلب إعدادات المظهر:", themeError);
      } else if (themeData) {
        setThemeSettingsForm({
          primaryColor: themeData.primary_color,
          buttonColor: themeData.button_color,
          textColor: themeData.text_color,
          backgroundColor: themeData.background_color,
          logoText: themeData.logo_text,
          logoFontSize: themeData.logo_font_size,
          headerColor: themeData.header_color,
          footerColor: themeData.footer_color,
          footerText: themeData.footer_text,
          socialLinks: {
            twitter: themeData.twitter_link || "",
            facebook: themeData.facebook_link || "",
            instagram: themeData.instagram_link || ""
          }
        });
      }
    } catch (error) {
      console.error("خطأ في جلب الإعدادات:", error);
    } finally {
      setDbLoading(false);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('userEmail');
    toast.success("تم تسجيل الخروج بنجاح");
    navigate('/login');
  };

  // وظائف لحفظ الإعدادات في قاعدة البيانات
  const handleAiSettingsSubmit = async (data: AiSettingsFormValues) => {
    try {
      const { error } = await supabase
        .from('ai_settings')
        .update({
          provider: data.provider,
          api_key: data.apiKey,
          model: data.model,
          updated_at: new Date().toISOString()
        })
        .eq('id', await getAiSettingsId());
      
      if (error) {
        console.error("خطأ في حفظ إعدادات الذكاء الاصطناعي:", error);
        toast.error("حدث خطأ أثناء حفظ الإعدادات");
      } else {
        toast.success("تم حفظ إعدادات الذكاء الاصطناعي بنجاح");
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error("حدث خطأ غير متوقع");
    }
  };

  const handleInterpretationSettingsSubmit = async (data: InterpretationSettingsFormValues) => {
    try {
      const { error } = await supabase
        .from('interpretation_settings')
        .update({
          max_input_words: data.maxInputWords,
          min_output_words: data.minOutputWords,
          max_output_words: data.maxOutputWords,
          system_instructions: data.systemInstructions,
          updated_at: new Date().toISOString()
        })
        .eq('id', await getInterpretationSettingsId());
      
      if (error) {
        console.error("خطأ في حفظ إعدادات التفسير:", error);
        toast.error("حدث خطأ أثناء حفظ إعدادات التفسير");
      } else {
        toast.success("تم حفظ إعدادات التفسير بنجاح");
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error("حدث خطأ غير متوقع");
    }
  };

  const handlePricingSettingsSubmit = async (data: PricingSettingsFormValues) => {
    try {
      const { error } = await supabase
        .from('pricing_settings')
        .update({
          free_plan_price: data.freePlan.price,
          free_plan_interpretations: data.freePlan.interpretationsPerMonth,
          free_plan_features: data.freePlan.features,
          premium_plan_price: data.premiumPlan.price,
          premium_plan_interpretations: data.premiumPlan.interpretationsPerMonth,
          premium_plan_features: data.premiumPlan.features,
          pro_plan_price: data.proPlan.price,
          pro_plan_interpretations: data.proPlan.interpretationsPerMonth,
          pro_plan_features: data.proPlan.features,
          updated_at: new Date().toISOString()
        })
        .eq('id', await getPricingSettingsId());
      
      if (error) {
        console.error("خطأ في حفظ إعدادات الخطط والأسعار:", error);
        toast.error("حدث خطأ أثناء حفظ إعدادات الخطط والأسعار");
      } else {
        toast.success("تم حفظ إعدادات الخطط والأسعار بنجاح");
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error("حدث خطأ غير متوقع");
    }
  };

  const handlePaymentSettingsSubmit = async (data: PaymentSettingsFormValues) => {
    try {
      const { error } = await supabase
        .from('payment_settings')
        .update({
          paylink_enabled: data.paylink.enabled,
          paylink_api_key: data.paylink.apiKey,
          paylink_secret_key: data.paylink.secretKey,
          paypal_enabled: data.paypal.enabled,
          paypal_client_id: data.paypal.clientId,
          paypal_secret: data.paypal.secret,
          paypal_sandbox: data.paypal.sandbox,
          updated_at: new Date().toISOString()
        })
        .eq('id', await getPaymentSettingsId());
      
      if (error) {
        console.error("خطأ في حفظ إعدادات بوابات الدفع:", error);
        toast.error("حدث خطأ أثناء حفظ إعدادات بوابات الدفع");
      } else {
        toast.success("تم حفظ إعدادات بوابات الدفع بنجاح");
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error("حدث خطأ غير متوقع");
    }
  };

  const handleThemeSettingsSubmit = async (data: ThemeSettingsFormValues) => {
    try {
      const { error } = await supabase
        .from('theme_settings')
        .update({
          primary_color: data.primaryColor,
          button_color: data.buttonColor,
          text_color: data.textColor,
          background_color: data.backgroundColor,
          logo_text: data.logoText,
          logo_font_size: data.logoFontSize,
          header_color: data.headerColor,
          footer_color: data.footerColor,
          footer_text: data.footerText,
          twitter_link: data.socialLinks.twitter,
          facebook_link: data.socialLinks.facebook,
          instagram_link: data.socialLinks.instagram,
          updated_at: new Date().toISOString()
        })
        .eq('id', await getThemeSettingsId());
      
      if (error) {
        console.error("خطأ في حفظ إعدادات المظهر:", error);
        toast.error("حدث خطأ أثناء حفظ إعدادات المظهر");
      } else {
        toast.success("تم حفظ إعدادات المظهر بنجاح");
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error("حدث خطأ غير متوقع");
    }
  };

  // وظائف مساعدة للحصول على معرفات الإعدادات
  const getAiSettingsId = async (): Promise<string> => {
    const { data } = await supabase
      .from('ai_settings')
      .select('id')
      .limit(1)
      .single();
    return data?.id || '';
  };

  const getInterpretationSettingsId = async (): Promise<string> => {
    const { data } = await supabase
      .from('interpretation_settings')
      .select('id')
      .limit(1)
      .single();
    return data?.id || '';
  };

  const getPricingSettingsId = async (): Promise<string> => {
    const { data } = await supabase
      .from('pricing_settings')
      .select('id')
      .limit(1)
      .single();
    return data?.id || '';
  };

  const getPaymentSettingsId = async (): Promise<string> => {
    const { data } = await supabase
      .from('payment_settings')
      .select('id')
      .limit(1)
      .single();
    return data?.id || '';
  };

  const getThemeSettingsId = async (): Promise<string> => {
    const { data } = await supabase
      .from('theme_settings')
      .select('id')
      .limit(1)
      .single();
    return data?.id || '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16 px-4 dream-pattern">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 rtl">
            <div>
              <h1 className="text-3xl font-bold">لوحة تحكم المشرف</h1>
              <p className="text-muted-foreground">مرحباً بك، {adminEmail}</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="mt-4 md:mt-0">تسجيل الخروج</Button>
          </div>

          <DashboardStats 
            dreams={dreams} 
            userCount={userCount} 
            subscriptions={subscriptions} 
          />

          {dbLoading ? (
            <div className="flex justify-center my-8">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">جاري تحميل الإعدادات...</p>
              </div>
            </div>
          ) : (
            <div className="rtl">
              <h2 className="text-2xl font-bold mb-6">إعدادات النظام</h2>
              
              <AdminSection 
                title="إعدادات مزود خدمة الذكاء الاصطناعي" 
                description="تكوين مزود خدمة الذكاء الاصطناعي ومفاتيح API"
                icon={Brain}
                isOpen={activeSections.aiSettings}
                onToggle={() => toggleSection('aiSettings')}
              >
                <AiSettingsForm 
                  initialData={aiSettingsForm}
                  onSubmit={handleAiSettingsSubmit}
                  togetherModels={togetherModels}
                />
              </AdminSection>
              
              <AdminSection 
                title="إعدادات التفسير" 
                description="إعدادات عدد الكلمات المسموح بها للمدخلات والمخرجات"
                icon={PenSquare}
                isOpen={activeSections.interpretationSettings}
                onToggle={() => toggleSection('interpretationSettings')}
              >
                <InterpretationSettingsForm 
                  initialData={interpretationSettingsForm}
                  onSubmit={handleInterpretationSettingsSubmit}
                />
              </AdminSection>
              
              <AdminSection 
                title="إعدادات الخطط والأسعار" 
                description="تكوين خطط الاشتراك والأسعار"
                icon={DollarSign}
                isOpen={activeSections.pricingSettings}
                onToggle={() => toggleSection('pricingSettings')}
              >
                <PricingSettingsForm 
                  initialData={pricingSettingsForm}
                  onSubmit={handlePricingSettingsSubmit}
                />
              </AdminSection>
              
              <AdminSection 
                title="إعدادات بوابات الدفع" 
                description="تكوين بوابات الدفع PayLink.sa و PayPal"
                icon={CreditCard}
                isOpen={activeSections.paymentSettings}
                onToggle={() => toggleSection('paymentSettings')}
              >
                <PaymentSettingsForm 
                  initialData={paymentSettingsForm}
                  onSubmit={handlePaymentSettingsSubmit}
                />
              </AdminSection>
              
              <AdminSection 
                title="إدارة الأعضاء والصلاحيات" 
                description="إدارة المستخدمين وتعيين الصلاحيات"
                icon={Users}
                isOpen={activeSections.userManagement}
                onToggle={() => toggleSection('userManagement')}
              >
                <UserManagement users={users} />
              </AdminSection>
              
              <AdminSection 
                title="إدارة الصفحات" 
                description="إدارة محتوى صفحات الموقع"
                icon={FileText}
                isOpen={activeSections.pageManagement}
                onToggle={() => toggleSection('pageManagement')}
              >
                <PageManagement pages={pages} />
              </AdminSection>
              
              <AdminSection 
                title="إعدادات المظهر" 
                description="تخصيص ألوان الموقع واللوجو والهيدر والفوتر"
                icon={Palette}
                isOpen={activeSections.themeSettings}
                onToggle={() => toggleSection('themeSettings')}
              >
                <ThemeSettingsForm 
                  initialData={themeSettingsForm}
                  onSubmit={handleThemeSettingsSubmit}
                />
              </AdminSection>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
