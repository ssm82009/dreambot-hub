
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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

// Define form types for each section
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

  // Initialize form methods for each section
  const aiSettingsForm = useForm<AiSettingsFormValues>();
  const interpretationSettingsForm = useForm<InterpretationSettingsFormValues>({
    defaultValues: {
      maxInputWords: 500,
      minOutputWords: 300,
      maxOutputWords: 1000,
      systemInstructions: "أنت مفسر أحلام خبير. يجب أن تقدم تفسيرات دقيقة وشاملة استناداً إلى المراجع الإسلامية والعلمية."
    }
  });
  const pricingSettingsForm = useForm<PricingSettingsFormValues>();
  const paymentSettingsForm = useForm<PaymentSettingsFormValues>();
  const themeSettingsForm = useForm<ThemeSettingsFormValues>();

  const toggleSection = (section: string) => {
    setActiveSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    // Check if admin is logged in
    const adminStatus = localStorage.getItem('isAdminLoggedIn') === 'true';
    const email = localStorage.getItem('userEmail') || '';
    
    setIsAdmin(adminStatus);
    setAdminEmail(email);
    setIsLoading(false);

    // Redirect non-admin users
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
          <div className="flex justify-between items-center mb-8 rtl">
            <div>
              <h1 className="text-3xl font-bold">لوحة تحكم المشرف</h1>
              <p className="text-muted-foreground">مرحباً بك، {adminEmail}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>تسجيل الخروج</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rtl mb-8">
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
            
            {/* 1. AI Provider Settings */}
            <AdminSection 
              title="إعدادات مزود خدمة الذكاء الاصطناعي" 
              description="تكوين مزود خدمة الذكاء الاصطناعي ومفاتيح API"
              icon={Brain}
              isOpen={activeSections.aiSettings}
              onToggle={() => toggleSection('aiSettings')}
            >
              <Form {...aiSettingsForm}>
                <form onSubmit={aiSettingsForm.handleSubmit(console.log)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>مزود الخدمة</Label>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox id="openai" />
                        <label htmlFor="openai" className="text-sm">OpenAI</label>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox id="anthropic" />
                        <label htmlFor="anthropic" className="text-sm">Anthropic</label>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox id="gemini" />
                        <label htmlFor="gemini" className="text-sm">Gemini</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>مفتاح OpenAI API</Label>
                    <Input placeholder="sk-..." dir="ltr" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>نموذج OpenAI</Label>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox id="gpt-4o" defaultChecked />
                        <label htmlFor="gpt-4o" className="text-sm">GPT-4o</label>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox id="gpt-4" />
                        <label htmlFor="gpt-4" className="text-sm">GPT-4</label>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox id="gpt-3.5" />
                        <label htmlFor="gpt-3.5" className="text-sm">GPT-3.5</label>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit">حفظ الإعدادات</Button>
                </form>
              </Form>
            </AdminSection>
            
            {/* 2. Interpretation Settings */}
            <AdminSection 
              title="إعدادات التفسير" 
              description="إعدادات عدد الكلمات المسموح بها للمدخلات والمخرجات"
              icon={PenSquare}
              isOpen={activeSections.interpretationSettings}
              onToggle={() => toggleSection('interpretationSettings')}
            >
              <Form {...interpretationSettingsForm}>
                <form onSubmit={interpretationSettingsForm.handleSubmit(console.log)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>الحد الأقصى لعدد كلمات المدخلات</Label>
                    <Input 
                      type="number" 
                      defaultValue="500" 
                      {...interpretationSettingsForm.register("maxInputWords")} 
                    />
                    <p className="text-sm text-muted-foreground">
                      الحد الأقصى لعدد الكلمات المسموح بها في وصف الحلم
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>الحد الأدنى لعدد كلمات المخرجات</Label>
                    <Input 
                      type="number" 
                      defaultValue="300" 
                      {...interpretationSettingsForm.register("minOutputWords")} 
                    />
                    <p className="text-sm text-muted-foreground">
                      الحد الأدنى لعدد الكلمات في تفسير الحلم
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>الحد الأقصى لعدد كلمات المخرجات</Label>
                    <Input 
                      type="number" 
                      defaultValue="1000" 
                      {...interpretationSettingsForm.register("maxOutputWords")} 
                    />
                    <p className="text-sm text-muted-foreground">
                      الحد الأقصى لعدد الكلمات في تفسير الحلم
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>توجيهات النظام</Label>
                    <Textarea 
                      placeholder="أدخل توجيهات النظام هنا..." 
                      defaultValue="أنت مفسر أحلام خبير. يجب أن تقدم تفسيرات دقيقة وشاملة استناداً إلى المراجع الإسلامية والعلمية."
                      rows={4}
                      {...interpretationSettingsForm.register("systemInstructions")}
                    />
                    <p className="text-sm text-muted-foreground">
                      توجيهات النظام التي ستُرسل إلى نموذج الذكاء الاصطناعي
                    </p>
                  </div>
                  
                  <Button type="submit">حفظ الإعدادات</Button>
                </form>
              </Form>
            </AdminSection>
            
            {/* 3. Pricing Plans Settings */}
            <AdminSection 
              title="إعدادات الخطط والأسعار" 
              description="تكوين خطط الاشتراك والأسعار"
              icon={DollarSign}
              isOpen={activeSections.pricingSettings}
              onToggle={() => toggleSection('pricingSettings')}
            >
              <Form {...pricingSettingsForm}>
                <form onSubmit={pricingSettingsForm.handleSubmit(console.log)} className="space-y-6">
                  <div className="p-4 border rounded-md">
                    <h3 className="text-lg font-semibold mb-3">الخطة المجانية</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>السعر (ريال)</Label>
                        <Input type="number" defaultValue="0" readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>عدد التفسيرات الشهرية</Label>
                        <Input type="number" defaultValue="3" />
                      </div>
                      <div className="space-y-2">
                        <Label>المميزات</Label>
                        <Textarea 
                          placeholder="أدخل المميزات هنا..."
                          defaultValue="تفسير أساسي للأحلام&#10;دعم عبر البريد الإلكتروني"
                          rows={3}
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
                        <Input type="number" defaultValue="49" />
                      </div>
                      <div className="space-y-2">
                        <Label>عدد التفسيرات الشهرية</Label>
                        <Input type="number" defaultValue="-1" />
                        <p className="text-sm text-muted-foreground">استخدم -1 لعدد غير محدود</p>
                      </div>
                      <div className="space-y-2">
                        <Label>المميزات</Label>
                        <Textarea 
                          placeholder="أدخل المميزات هنا..."
                          defaultValue="تفسيرات أحلام غير محدودة&#10;تفسيرات مفصلة ومعمقة&#10;أرشيف لتفسيرات أحلامك السابقة&#10;نصائح وتوجيهات شخصية&#10;دعم فني على مدار الساعة"
                          rows={5}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h3 className="text-lg font-semibold mb-3">الخطة الاحترافية</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>السعر (ريال)</Label>
                        <Input type="number" defaultValue="99" />
                      </div>
                      <div className="space-y-2">
                        <Label>عدد التفسيرات الشهرية</Label>
                        <Input type="number" defaultValue="-1" />
                      </div>
                      <div className="space-y-2">
                        <Label>المميزات</Label>
                        <Textarea 
                          placeholder="أدخل المميزات هنا..."
                          defaultValue="كل مميزات الخطة المميزة&#10;استشارات شخصية مع خبراء تفسير الأحلام&#10;تقارير تحليلية شهرية&#10;إمكانية إضافة 5 حسابات فرعية&#10;واجهة برمجة التطبيقات API"
                          rows={5}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit">حفظ الإعدادات</Button>
                </form>
              </Form>
            </AdminSection>
            
            {/* 4. Payment Gateways Settings */}
            <AdminSection 
              title="إعدادات بوابات الدفع" 
              description="تكوين بوابات الدفع PayLink.sa و PayPal"
              icon={CreditCard}
              isOpen={activeSections.paymentSettings}
              onToggle={() => toggleSection('paymentSettings')}
            >
              <Form {...paymentSettingsForm}>
                <form onSubmit={paymentSettingsForm.handleSubmit(console.log)} className="space-y-6">
                  <div className="p-4 border rounded-md">
                    <h3 className="text-lg font-semibold mb-3">PayLink.sa</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>تفعيل PayLink.sa</Label>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Checkbox id="enable-paylink" defaultChecked />
                          <label htmlFor="enable-paylink" className="text-sm">تفعيل</label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>مفتاح API</Label>
                        <Input placeholder="أدخل مفتاح API لـ PayLink.sa" dir="ltr" />
                      </div>
                      <div className="space-y-2">
                        <Label>المفتاح السري</Label>
                        <Input placeholder="أدخل المفتاح السري لـ PayLink.sa" dir="ltr" type="password" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h3 className="text-lg font-semibold mb-3">PayPal</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>تفعيل PayPal</Label>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Checkbox id="enable-paypal" />
                          <label htmlFor="enable-paypal" className="text-sm">تفعيل</label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>معرف العميل</Label>
                        <Input placeholder="أدخل معرف العميل لـ PayPal" dir="ltr" />
                      </div>
                      <div className="space-y-2">
                        <Label>السر</Label>
                        <Input placeholder="أدخل السر لـ PayPal" dir="ltr" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label>وضع الاختبار</Label>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Checkbox id="paypal-sandbox" defaultChecked />
                          <label htmlFor="paypal-sandbox" className="text-sm">تفعيل وضع الاختبار</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit">حفظ الإعدادات</Button>
                </form>
              </Form>
            </AdminSection>
            
            {/* 5. User Management */}
            <AdminSection 
              title="إدارة الأعضاء والصلاحيات" 
              description="إدارة المستخدمين وتعيين الصلاحيات"
              icon={Users}
              isOpen={activeSections.userManagement}
              onToggle={() => toggleSection('userManagement')}
            >
              <div className="space-y-4">
                <div className="flex justify-between mb-4">
                  <Input placeholder="بحث عن مستخدم..." className="max-w-md" />
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
                          <div className="flex space-x-2 rtl:space-x-reverse">
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
                      <div className="flex items-center justify-between">
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
                      <div className="flex items-center justify-between">
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
                      <div className="flex items-center justify-between">
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
                      <div className="flex items-center justify-between">
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
            
            {/* 6. Page Management */}
            <AdminSection 
              title="إدارة الصفحات" 
              description="إدارة محتوى صفحات الموقع"
              icon={FileText}
              isOpen={activeSections.pageManagement}
              onToggle={() => toggleSection('pageManagement')}
            >
              <div className="space-y-4">
                <div className="flex justify-between mb-4">
                  <Input placeholder="بحث عن صفحة..." className="max-w-md" />
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
                          <div className="flex space-x-2 rtl:space-x-reverse">
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
                          <div className="flex space-x-2 rtl:space-x-reverse">
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
                          <div className="flex space-x-2 rtl:space-x-reverse">
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
                          <div className="flex space-x-2 rtl:space-x-reverse">
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
            
            {/* 7. Theme Settings */}
            <AdminSection 
              title="إعدادات المظهر" 
              description="تخصيص ألوان الموقع واللوجو والهيدر والفوتر"
              icon={Palette}
              isOpen={activeSections.themeSettings}
              onToggle={() => toggleSection('themeSettings')}
            >
              <Form {...themeSettingsForm}>
                <form onSubmit={themeSettingsForm.handleSubmit(console.log)} className="space-y-6">
                  <div className="p-4 border rounded-md">
                    <h3 className="text-lg font-semibold mb-3">الألوان الرئيسية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>اللون الرئيسي</Label>
                        <div className="flex items-center">
                          <Input type="color" defaultValue="#9b87f5" className="w-12 h-10 p-1" />
                          <Input defaultValue="#9b87f5" className="flex-1 mr-2" dir="ltr" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>لون الأزرار</Label>
                        <div className="flex items-center">
                          <Input type="color" defaultValue="#9b87f5" className="w-12 h-10 p-1" />
                          <Input defaultValue="#9b87f5" className="flex-1 mr-2" dir="ltr" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>لون النص</Label>
                        <div className="flex items-center">
                          <Input type="color" defaultValue="#1A1F2C" className="w-12 h-10 p-1" />
                          <Input defaultValue="#1A1F2C" className="flex-1 mr-2" dir="ltr" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>لون الخلفية</Label>
                        <div className="flex items-center">
                          <Input type="color" defaultValue="#F9F9F9" className="w-12 h-10 p-1" />
                          <Input defaultValue="#F9F9F9" className="flex-1 mr-2" dir="ltr" />
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
                            <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                              <label htmlFor="logo-upload" className="relative cursor-pointer bg-background rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary">
                                <span>تحميل ملف</span>
                                <input id="logo-upload" name="logo-upload" type="file" className="sr-only" />
                              </label>
                              <p className="pr-1">أو اسحب وأفلت</p>
                            </div>
                            <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, SVG حتى 2MB</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>نص الشعار</Label>
                        <Input placeholder="تفسير الأحلام" defaultValue="تفسير الأحلام" />
                      </div>
                      <div className="space-y-2">
                        <Label>حجم خط الشعار</Label>
                        <Input type="number" defaultValue="24" />
                        <p className="text-sm text-muted-foreground">الحجم بوحدة البكسل</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h3 className="text-lg font-semibold mb-3">الهيدر والفوتر</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>لون خلفية الهيدر</Label>
                        <div className="flex items-center">
                          <Input type="color" defaultValue="#FFFFFF" className="w-12 h-10 p-1" />
                          <Input defaultValue="#FFFFFF" className="flex-1 mr-2" dir="ltr" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>لون خلفية الفوتر</Label>
                        <div className="flex items-center">
                          <Input type="color" defaultValue="#1A1F2C" className="w-12 h-10 p-1" />
                          <Input defaultValue="#1A1F2C" className="flex-1 mr-2" dir="ltr" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>نص الفوتر</Label>
                        <Input placeholder="جميع الحقوق محفوظة ©" defaultValue="جميع الحقوق محفوظة © 2024 تفسير الأحلام" />
                      </div>
                      <div className="space-y-2">
                        <Label>روابط التواصل الاجتماعي</Label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Label className="min-w-24">تويتر</Label>
                            <Input placeholder="https://twitter.com/..." dir="ltr" />
                          </div>
                          <div className="flex items-center">
                            <Label className="min-w-24">فيسبوك</Label>
                            <Input placeholder="https://facebook.com/..." dir="ltr" />
                          </div>
                          <div className="flex items-center">
                            <Label className="min-w-24">انستغرام</Label>
                            <Input placeholder="https://instagram.com/..." dir="ltr" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit">حفظ الإعدادات</Button>
                </form>
              </Form>
            </AdminSection>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
