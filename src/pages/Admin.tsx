import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Settings, 
  PenSquare, 
  CreditCard, 
  Users, 
  FileText, 
  Palette, 
  Brain, 
  DollarSign, 
  Layers
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useForm } from 'react-hook-form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';

type AiModel = {
  id: string;
  name: string;
  description: string;
  availability: 'free' | 'paid';
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

const AdminSection = ({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  isOpen, 
  onToggle 
}: { 
  title: string, 
  description: string, 
  icon: React.ElementType, 
  children: React.ReactNode,
  isOpen: boolean,
  onToggle: () => void
}) => {
  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon className="ml-2 h-5 w-5 text-primary" />
                <CardTitle>{title}</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? 'إغلاق' : 'عرض'}
              </Button>
            </div>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4 border-t">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({
    aiSettings: false,
    interpretationSettings: false,
    pricingSettings: false,
    paymentSettings: false,
    userManagement: true,
    pageManagement: false,
    themeSettings: false,
  });

  const aiSettingsForm = useForm<AiSettingsFormValues>({
    defaultValues: {
      provider: "together",
      apiKey: "",
      model: "meta-llama/Llama-3-8b-chat-hf",
    }
  });
  
  const interpretationSettingsForm = useForm<InterpretationSettingsFormValues>({
    defaultValues: {
      maxInputWords: 500,
      minOutputWords: 300,
      maxOutputWords: 1000,
      systemInstructions: "أنت مفسر أحلام خبير. يجب أن تقدم تفسيرات دقيقة وشاملة استناداً إلى المراجع الإسلامية والعلمية."
    }
  });
  
  const pricingSettingsForm = useForm<PricingSettingsFormValues>({
    defaultValues: {
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
    }
  });
  
  const paymentSettingsForm = useForm<PaymentSettingsFormValues>({
    defaultValues: {
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
    }
  });
  
  const themeSettingsForm = useForm<ThemeSettingsFormValues>({
    defaultValues: {
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
    }
  });

  const toggleSection = (section: string) => {
    setActiveSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdminLoggedIn') === 'true';
    const email = localStorage.getItem('userEmail') || '';
    
    setIsAdmin(adminStatus);
    setAdminEmail(email);
    setIsLoading(false);

    if (!adminStatus && !isLoading) {
      toast.error("يجب تسجيل الدخول كمشرف للوصول إلى لوحة التحكم");
      navigate('/login');
    }
  }, [navigate, isLoading]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('userEmail');
    toast.success("تم تسجيل الخروج بنجاح");
    navigate('/login');
  };

  const handleAiSettingsSubmit = (data: AiSettingsFormValues) => {
    console.log("AI Settings saved:", data);
    localStorage.setItem('aiSettings', JSON.stringify(data));
    toast.success("تم حفظ إعدادات الذكاء الاصطناعي بنجاح");
  };

  const handleInterpretationSettingsSubmit = (data: InterpretationSettingsFormValues) => {
    console.log("Interpretation Settings saved:", data);
    localStorage.setItem('interpretationSettings', JSON.stringify(data));
    toast.success("تم حفظ إعدادات التفسير بنجاح");
  };

  const handlePricingSettingsSubmit = (data: PricingSettingsFormValues) => {
    console.log("Pricing Settings saved:", data);
    localStorage.setItem('pricingSettings', JSON.stringify(data));
    toast.success("تم حفظ إعدادات الخطط والأسعار بنجاح");
  };

  const handlePaymentSettingsSubmit = (data: PaymentSettingsFormValues) => {
    console.log("Payment Settings saved:", data);
    localStorage.setItem('paymentSettings', JSON.stringify(data));
    toast.success("تم حفظ إعدادات بوابات الدفع بنجاح");
  };

  const handleThemeSettingsSubmit = (data: ThemeSettingsFormValues) => {
    console.log("Theme Settings saved:", data);
    localStorage.setItem('themeSettings', JSON.stringify(data));
    toast.success("تم حفظ إعدادات المظهر بنجاح");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>جاري التحميل...</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 rtl mb-8">
            <Card>
              <CardHeader>
                <CardTitle>الأحلام المقدمة</CardTitle>
                <CardDescription>إجمالي عدد الأحلام المقدمة للتفسير</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المستخدمين</CardTitle>
                <CardDescription>إجمالي عدد المستخدمين المسجلين</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الاشتراكات</CardTitle>
                <CardDescription>عدد الاشتراكات النشطة</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">0</p>
              </CardContent>
            </Card>
          </div>

          <div className="rtl">
            <h2 className="text-2xl font-bold mb-6">إعدادات النظام</h2>
            
            <AdminSection 
              title="إعدادات مزود خدمة الذكاء الاصطناعي" 
              description="تكوين مزود خدمة الذكاء الاصطناعي ومفاتيح API"
              icon={Brain}
              isOpen={activeSections.aiSettings}
              onToggle={() => toggleSection('aiSettings')}
            >
              <Form {...aiSettingsForm}>
                <form onSubmit={aiSettingsForm.handleSubmit(handleAiSettingsSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={aiSettingsForm.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مزود الخدمة</FormLabel>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Checkbox 
                                id="together" 
                                checked={field.value === "together"}
                                onCheckedChange={() => field.onChange("together")}
                              />
                              <label htmlFor="together" className="text-sm">Together.ai</label>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Checkbox 
                                id="openai" 
                                checked={field.value === "openai"}
                                onCheckedChange={() => field.onChange("openai")}
                              />
                              <label htmlFor="openai" className="text-sm">OpenAI</label>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Checkbox 
                                id="anthropic" 
                                checked={field.value === "anthropic"}
                                onCheckedChange={() => field.onChange("anthropic")}
                              />
                              <label htmlFor="anthropic" className="text-sm">Anthropic</label>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Checkbox 
                                id="gemini" 
                                checked={field.value === "gemini"}
                                onCheckedChange={() => field.onChange("gemini")}
                              />
                              <label htmlFor="gemini" className="text-sm">Gemini</label>
                            </div>
                          </div>
                          <FormDescription>
                            Together.ai يوفر وصولاً إلى مجموعة واسعة من نماذج مختلفة عبر مفتاح API واحد
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={aiSettingsForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مفتاح API</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={field.value === "together" ? "tok_..." : field.value === "openai" ? "sk-..." : ""}
                              dir="ltr" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            يمكنك الحصول على مفتاح Together.ai من لوحة التحكم الخاصة بك على{" "}
                            <a href="https://api.together.xyz/settings/api-keys" className="text-primary underline" target="_blank" rel="noopener noreferrer">
                              together.xyz
                            </a>
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    {aiSettingsForm.watch("provider") === "together" && (
                      <FormField
                        control={aiSettingsForm.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>النموذج</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر النموذج" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent dir="rtl">
                                {togetherModels.map((model) => (
                                  <SelectItem 
                                    key={model.id} 
                                    value={model.id}
                                  >
                                    <div className="flex justify-between items-center w-full">
                                      <span>{model.name}</span>
                                      <span className={`text-xs ${model.availability === 'free' ? 'text-green-500' : 'text-amber-500'}`}>
                                        {model.availability === 'free' ? 'مجاني' : 'مدفوع'}
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">{model.description}</div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              اختر النموذج الذي تريد استخدامه لتفسير الأحلام
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    )}

                    {aiSettingsForm.watch("provider") === "openai" && (
                      <FormField
                        control={aiSettingsForm.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نموذج OpenAI</FormLabel>
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Checkbox 
                                  id="gpt-4o" 
                                  checked={field.value === "gpt-4o"}
                                  onCheckedChange={() => field.onChange("gpt-4o")}
                                />
                                <label htmlFor="gpt-4o" className="text-sm">GPT-4o</label>
                              </div>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Checkbox 
                                  id="gpt-4" 
                                  checked={field.value === "gpt-4"}
                                  onCheckedChange={() => field.onChange("gpt-4")}
                                />
                                <label htmlFor="gpt-4" className="text-sm">GPT-4</label>
                              </div>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Checkbox 
                                  id="gpt-3.5" 
                                  checked={field.value === "gpt-3.5"}
                                  onCheckedChange={() => field.onChange("gpt-3.5")}
                                />
                                <label htmlFor="gpt-3.5" className="text-sm">GPT-3.5</label>
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  <Button type="submit">حفظ الإعدادات</Button>
                </form>
              </Form>
            </AdminSection>
            
            <AdminSection 
              title="إعدادات التفسير" 
              description="إعدادات عدد الكلمات المسموح بها للمدخلات والمخرجات"
              icon={PenSquare}
              isOpen={activeSections.interpretationSettings}
              onToggle={() => toggleSection('interpretationSettings')}
            >
              <form onSubmit={interpretationSettingsForm.handleSubmit(handleInterpretationSettingsSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>الحد الأقصى لعدد كلمات المدخلات</Label>
                  <Input 
                    type="number" 
                    {...interpretationSettingsForm.register("maxInputWords", { valueAsNumber: true })} 
                  />
                  <p className="text-sm text-muted-foreground">
                    الحد الأقصى لعدد الكلمات المسموح بها في وصف الحلم
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>الحد الأدنى لعدد كلمات المخرجات</Label>
                  <Input 
                    type="number" 
                    {...interpretationSettingsForm.register("minOutputWords", { valueAsNumber: true })} 
                  />
                  <p className="text-sm text-muted-foreground">
                    الحد الأدنى لعدد الكلمات في تفسير الحلم
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>الحد الأقصى لعدد كلمات المخرجات</Label>
                  <Input 
                    type="number" 
                    {...interpretationSettingsForm.register("maxOutputWords", { valueAsNumber: true })} 
                  />
                  <p className="text-sm text-muted-foreground">
                    الحد الأقصى لعدد الكلمات في تفسير الحلم
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>توجيهات النظام</Label>
                  <Textarea 
                    placeholder="أدخل توجيهات النظام هنا..." 
                    rows={4}
                    {...interpretationSettingsForm.register("systemInstructions")}
                  />
                  <p className="text-sm text-muted-foreground">
                    توجيهات النظام التي ستُرسل إلى نموذج الذكاء الاصطناعي
                  </p>
                </div>
                
                <Button type="submit">حفظ الإعدادات</Button>
              </form>
            </AdminSection>
            
            <AdminSection 
              title="إعدادات الخطط والأسعار" 
              description="تكوين خطط الاشتراك والأسعار"
              icon={DollarSign}
              isOpen={activeSections.pricingSettings}
              onToggle={() => toggleSection('pricingSettings')}
            >
              <form onSubmit={pricingSettingsForm.handleSubmit(handlePricingSettingsSubmit)} className="space-y-6">
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-3">الخطة المجانية</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>السعر (ريال)</Label>
                      <Input 
                        type="number" 
                        value="0" 
                        readOnly 
                        {...pricingSettingsForm.register("freePlan.price", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>عدد التفسيرات الشهرية</Label>
                      <Input 
                        type="number" 
                        {...pricingSettingsForm.register("freePlan.interpretationsPerMonth", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>المميزات</Label>
                      <Textarea 
                        placeholder="أدخل المميزات هنا..."
                        rows={3}
                        {...pricingSettingsForm.register("freePlan.features")}
                      />
                      <p className="text-sm text-muted-foreground">أدخل كل ميزة في سطر منفصل</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-3">الخطة المميزة</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>السعر (ريال)</Label>
                      <Input 
                        type="number" 
                        {...pricingSettingsForm.register("premiumPlan.price", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>عدد التفسيرات الشهرية</Label>
                      <Input 
                        type="number" 
                        {...pricingSettingsForm.register("premiumPlan.interpretationsPerMonth", { valueAsNumber: true })}
                      />
                      <p className="text-sm text-muted-foreground">استخدم -1 لعدد غير محدود</p>
                    </div>
                    <div className="space-y-2">
                      <Label>المميزات</Label>
                      <Textarea 
                        placeholder="أدخل المميزات هنا..."
                        rows={5}
                        {...pricingSettingsForm.register("premiumPlan.features")}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-3">الخطة الاحترافية</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>السعر (ريال)</Label>
                      <Input 
                        type="number" 
                        {...pricingSettingsForm.register("proPlan.price", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>عدد التفسيرات الشهرية</Label>
                      <Input 
                        type="number" 
                        {...pricingSettingsForm.register("proPlan.interpretationsPerMonth", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>المميزات</Label>
                      <Textarea 
                        placeholder="أدخل المميزات هنا..."
                        rows={5}
                        {...pricingSettingsForm.register("proPlan.features")}
                      />
                    </div>
                  </div>
                </div>
                
                <Button type="submit">حفظ الإعدادات</Button>
              </form>
            </AdminSection>
            
            <AdminSection 
              title="إعدادات بوابات الدفع" 
              description="تكوين بوابات الدفع PayLink.sa و PayPal"
              icon={CreditCard}
              isOpen={activeSections.paymentSettings}
              onToggle={() => toggleSection('paymentSettings')}
            >
              <form onSubmit={paymentSettingsForm.handleSubmit(handlePaymentSettingsSubmit)} className="space-y-6">
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-3">PayLink.sa</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>تفعيل PayLink.sa</Label>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox 
                          id="enable-paylink" 
                          checked={paymentSettingsForm.watch("paylink.enabled")}
                          onCheckedChange={(checked) => 
                            paymentSettingsForm.setValue("paylink.enabled", checked as boolean)
                          }
                        />
                        <label htmlFor="enable-paylink" className="text-sm">تفعيل</label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>مفتاح API</Label>
                      <Input 
                        placeholder="أدخل مفتاح API لـ PayLink.sa" 
                        dir="ltr" 
                        {...paymentSettingsForm.register("paylink.apiKey")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>المفتاح السري</Label>
                      <Input 
                        placeholder="أدخل المفتاح السري لـ PayLink.sa" 
                        dir="ltr" 
                        type="password" 
                        {...paymentSettingsForm.register("paylink.secretKey")}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-3">PayPal</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>تفعيل PayPal</Label>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox 
                          id="enable-paypal" 
                          checked={paymentSettingsForm.watch("paypal.enabled")}
                          onCheckedChange={(checked) => 
                            paymentSettingsForm.setValue("paypal.enabled", checked as boolean)
                          }
                        />
                        <label htmlFor="enable-paypal" className="text-sm">تفعيل</label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>معرف العميل</Label>
                      <Input 
                        placeholder="أدخل معرف العميل لـ PayPal" 
                        dir="ltr" 
                        {...paymentSettingsForm.register("paypal.clientId")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>السر</Label>
                      <Input 
                        placeholder="أدخل السر لـ PayPal" 
                        dir="ltr" 
                        type="password" 
                        {...paymentSettingsForm.register("paypal.secret")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>وضع الاختبار</Label>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox 
                          id="paypal-sandbox" 
                          checked={paymentSettingsForm.watch("paypal.sandbox")}
                          onCheckedChange={(checked) => 
                            paymentSettingsForm.setValue("paypal.sandbox", checked as boolean)
                          }
                        />
                        <label htmlFor="paypal-sandbox" className="text-sm">تفعيل وضع الاختبار</label>
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mt-2">
                      <p className="text-sm text-yellow-800">
                        <strong>ملاحظة:</strong> عند استخدام PayPal سيتم تحويل المبلغ من الريال السعودي إلى الدولار الأمريكي بسعر الصرف الحالي.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button type="submit">حفظ الإعدادات</Button>
              </form>
            </AdminSection>
            
            <AdminSection 
              title="إدارة الأعضاء والصلاحيات" 
              description="إدارة المستخدمين وتعيين الصلاحيات"
              icon={Users}
              isOpen={activeSections.userManagement}
              onToggle={() => toggleSection('userManagement')}
            >
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                  <Input placeholder="بحث عن مستخدم..." className="w-full sm:max-w-md" />
                  <Button>إضافة مستخدم جديد</Button>
                </div>
                
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">الرقم</TableHead>
                        <TableHead>البريد الإلكتروني</TableHead>
                        <TableHead>الاسم</TableHead>
                        <TableHead>نوع العضوية</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>56eeer@gmail.com</TableCell>
                        <TableCell>المشرف</TableCell>
                        <TableCell>مشرف</TableCell>
                        <TableCell>نشط</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">تعديل</Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">حذف</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          لا يوجد مستخدمين آخرين حتى الآن
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div className="p-4 border rounded-md mt-6">
                  <h3 className="text-lg font-semibold mb-4">أنواع الصلاحيات</h3>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-md">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="font-semibold">مشرف</span>
                        </div>
                        <Button variant="outline" size="sm">تعديل</Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        يملك جميع الصلاحيات بما في ذلك الوصول إلى لوحة التحكم وإدارة المستخدمين والإعدادات
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="font-semibold">مفسر</span>
                        </div>
                        <Button variant="outline" size="sm">تعديل</Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        يمكنه الوصول إلى طلبات تفسير الأحلام وتقديم تفسيرات لها
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="font-semibold">عضو مميز</span>
                        </div>
                        <Button variant="outline" size="sm">تعديل</Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        عضوية مدفوعة تتيح طلب عدد غير محدود من التفسيرات والوصول إلى المزايا المتقدمة
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-md">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="font-semibold">عضو مجاني</span>
                        </div>
                        <Button variant="outline" size="sm">تعديل</Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        عضوية مجانية تتيح طلب عدد محدود من التفسيرات
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AdminSection>
            
            <AdminSection 
              title="إدارة الصفحات" 
              description="إدارة محتوى صفحات الموقع"
              icon={FileText}
              isOpen={activeSections.pageManagement}
              onToggle={() => toggleSection('pageManagement')}
            >
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                  <Input placeholder="بحث عن صفحة..." className="w-full sm:max-w-md" />
                  <Button>إضافة صفحة جديدة</Button>
                </div>
                
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">الرقم</TableHead>
                        <TableHead>عنوان الصفحة</TableHead>
                        <TableHead>المسار</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>الرئيسية</TableCell>
                        <TableCell>/</TableCell>
                        <TableCell>منشورة</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">تعديل</Button>
                            <Button variant="outline" size="sm" disabled>حذف</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2</TableCell>
                        <TableCell>عن الخدمة</TableCell>
                        <TableCell>/about</TableCell>
                        <TableCell>منشورة</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">تعديل</Button>
                            <Button variant="outline" size="sm">حذف</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>3</TableCell>
                        <TableCell>الأسعار</TableCell>
                        <TableCell>/pricing</TableCell>
                        <TableCell>منشورة</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">تعديل</Button>
                            <Button variant="outline" size="sm">حذف</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>4</TableCell>
                        <TableCell>سياسة الخصوصية</TableCell>
                        <TableCell>/privacy</TableCell>
                        <TableCell>مسودة</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">تعديل</Button>
                            <Button variant="outline" size="sm">حذف</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </AdminSection>
            
            <AdminSection 
              title="إعدادات المظهر" 
              description="تخصيص ألوان الموقع واللوجو والهيدر والفوتر"
              icon={Palette}
              isOpen={activeSections.themeSettings}
              onToggle={() => toggleSection('themeSettings')}
            >
              <form onSubmit={themeSettingsForm.handleSubmit(handleThemeSettingsSubmit)} className="space-y-6">
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-3">الألوان الرئيسية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>اللون الرئيسي</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="color" 
                          className="w-12 h-10 p-1" 
                          {...themeSettingsForm.register("primaryColor")}
                          onChange={(e) => themeSettingsForm.setValue("primaryColor", e.target.value)}
                        />
                        <Input 
                          className="flex-1" 
                          dir="ltr" 
                          {...themeSettingsForm.register("primaryColor")}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>لون الأزرار</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="color" 
                          className="w-12 h-10 p-1" 
                          {...themeSettingsForm.register("buttonColor")}
                          onChange={(e) => themeSettingsForm.setValue("buttonColor", e.target.value)}
                        />
                        <Input 
                          className="flex-1" 
                          dir="ltr" 
                          {...themeSettingsForm.register("buttonColor")}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>لون النص</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="color" 
                          className="w-12 h-10 p-1" 
                          {...themeSettingsForm.register("textColor")}
                          onChange={(e) => themeSettingsForm.setValue("textColor", e.target.value)}
                        />
                        <Input 
                          className="flex-1" 
                          dir="ltr" 
                          {...themeSettingsForm.register("textColor")}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>لون الخلفية</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="color" 
                          className="w-12 h-10 p-1" 
                          {...themeSettingsForm.register("backgroundColor")}
                          onChange={(e) => themeSettingsForm.setValue("backgroundColor", e.target.value)}
                        />
                        <Input 
                          className="flex-1" 
                          dir="ltr" 
                          {...themeSettingsForm.register("backgroundColor")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-3">الشعار</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>صورة الشعار</Label>
                      <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-md">
                        <div className="text-center">
                          <div className="mt-4 flex flex-col sm:flex-row text-sm leading-6 text-muted-foreground justify-center">
                            <label htmlFor="logo-upload" className="relative cursor-pointer bg-background rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary">
                              <span>تحميل ملف</span>
                              <input id="logo-upload" name="logo-upload" type="file" className="sr-only" />
                            </label>
                            <p className="sm:pr-1 mt-1 sm:mt-0">أو اسحب وأفلت</p>
                          </div>
                          <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, SVG حتى 2MB</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>نص الشعار</Label>
                      <Input 
                        placeholder="تفسير الأحلام" 
                        {...themeSettingsForm.register("logoText")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>حجم خط الشعار</Label>
                      <Input 
                        type="number" 
                        {...themeSettingsForm.register("logoFontSize", { valueAsNumber: true })}
                      />
                      <p className="text-sm text-muted-foreground">الحجم بوحدة البكسل</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-3">الهيدر والفوتر</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>لون خلفية الهيدر</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="color" 
                          className="w-12 h-10 p-1" 
                          {...themeSettingsForm.register("headerColor")}
                          onChange={(e) => themeSettingsForm.setValue("headerColor", e.target.value)}
                        />
                        <Input 
                          className="flex-1" 
                          dir="ltr" 
                          {...themeSettingsForm.register("headerColor")}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>لون خلفية الفوتر</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="color" 
                          className="w-12 h-10 p-1" 
                          {...themeSettingsForm.register("footerColor")}
                          onChange={(e) => themeSettingsForm.setValue("footerColor", e.target.value)}
                        />
                        <Input 
                          className="flex-1" 
                          dir="ltr" 
                          {...themeSettingsForm.register("footerColor")}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>نص الفوتر</Label>
                      <Input 
                        placeholder="جميع الحقوق محفوظة ©" 
                        {...themeSettingsForm.register("footerText")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>روابط التواصل الاجتماعي</Label>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <Label className="min-w-24">تويتر</Label>
                          <Input 
                            placeholder="https://twitter.com/..." 
                            dir="ltr" 
                            {...themeSettingsForm.register("socialLinks.twitter")}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <Label className="min-w-24">فيسبوك</Label>
                          <Input 
                            placeholder="https://facebook.com/..." 
                            dir="ltr" 
                            {...themeSettingsForm.register("socialLinks.facebook")}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <Label className="min-w-24">انستغرام</Label>
                          <Input 
                            placeholder="https://instagram.com/..." 
                            dir="ltr" 
                            {...themeSettingsForm.register("socialLinks.instagram")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button type="submit">حفظ الإعدادات</Button>
              </form>
            </AdminSection>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
