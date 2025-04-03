import React from 'react';
import AdminSection from '@/components/admin/AdminSection';
import { 
  Brain, 
  PenSquare, 
  CreditCard, 
  Users, 
  FileText, 
  Palette, 
  DollarSign,
  TicketCheck
} from 'lucide-react';
import { useAdmin } from '@/contexts/admin';
import { toast } from 'sonner';
import AiSettingsForm from '@/components/admin/AiSettingsForm';
import InterpretationSettingsForm from '@/components/admin/InterpretationSettingsForm';
import PricingSettingsForm from '@/components/admin/PricingSettingsForm';
import PaymentSettingsForm from '@/components/admin/PaymentSettingsForm';
import UserManagement from '@/components/admin/UserManagement';
import PageManagement from '@/components/admin/PageManagement';
import TicketManagement from '@/components/admin/TicketManagement';
import ThemeSettingsForm from '@/components/admin/ThemeSettingsForm';
import { 
  useAiSettingsHandler, 
  useInterpretationSettingsHandler, 
  usePricingSettingsHandler, 
  usePaymentSettingsHandler, 
  useThemeSettingsHandler 
} from '@/hooks/useSettingsHandlers';
import { supabase } from '@/integrations/supabase/client';
import { CustomPage } from '@/types/database';

const AdminSections: React.FC = () => {
  const { 
    aiSettingsForm,
    interpretationSettingsForm,
    pricingSettingsForm,
    paymentSettingsForm,
    themeSettingsForm,
    users,
    pages,
    setPages,
    activeSections,
    toggleSection,
    setDbLoading
  } = useAdmin();

  const { handleAiSettingsSubmit } = useAiSettingsHandler();
  const { handleInterpretationSettingsSubmit } = useInterpretationSettingsHandler();
  const { handlePricingSettingsSubmit } = usePricingSettingsHandler();
  const { handlePaymentSettingsSubmit } = usePaymentSettingsHandler();
  const { handleThemeSettingsSubmit } = useThemeSettingsHandler();

  const handlePageSave = async (page: Partial<CustomPage>) => {
    setDbLoading(true);
    try {
      if (page.id) {
        const { error } = await supabase
          .from('custom_pages')
          .update({
            title: page.title,
            slug: page.slug,
            content: page.content,
            status: page.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', page.id);
        
        if (error) throw error;
        
        setPages(prev => prev.map(p => p.id === page.id ? { ...p, ...page } : p));
        toast.success('تم تحديث الصفحة بنجاح');
      } else {
        const { data, error } = await supabase
          .from('custom_pages')
          .insert({
            title: page.title,
            slug: page.slug,
            content: page.content,
            status: page.status
          })
          .select()
          .single();
        
        if (error) throw error;
        
        setPages(prev => [...prev, data as CustomPage]);
        toast.success('تم إنشاء الصفحة بنجاح');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('حدث خطأ أثناء حفظ الصفحة');
    } finally {
      setDbLoading(false);
    }
  };

  const handlePageDelete = async (id: string) => {
    setDbLoading(true);
    try {
      const { error } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setPages(prev => prev.filter(p => p.id !== id));
      toast.success('تم حذف الصفحة بنجاح');
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('حدث خطأ أثناء حذف الصفحة');
    } finally {
      setDbLoading(false);
    }
  };

  const togetherModels = [
    { id: 'meta-llama/Llama-3-70b-chat-hf', name: 'Llama 3 70B Chat', description: 'أقوى نموذج مفتوح المصدر للمحادثة', availability: 'paid' as const },
    { id: 'meta-llama/Llama-3-8b-chat-hf', name: 'Llama 3 8B Chat', description: 'نموذج متوسط الحجم مثالي للتطبيقات العامة', availability: 'free' as const },
    { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', description: 'نموذج مزيج قوي بتكلفة منخفضة', availability: 'free' as const },
    { id: 'codellama/CodeLlama-70b-Instruct-hf', name: 'CodeLlama 70B', description: 'متخصص في فهم وتوليد التعليمات المعقدة', availability: 'paid' as const },
    { id: 'meta-llama/Meta-Llama-3-8B-Instruct', name: 'Meta Llama 3 8B', description: 'نموذج تعليمات متوازن', availability: 'free' as const },
    { id: 'upstage/SOLAR-10.7B-Instruct-v1.0', name: 'SOLAR 10.7B', description: 'نموذج محسن للغة العربية', availability: 'free' as const },
    { id: 'togethercomputer/StripedHyena-Nous-7B', name: 'StripedHyena 7B', description: 'نموذج خفيف وسريع', availability: 'free' as const },
  ];

  return (
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
        <PageManagement 
          pages={pages} 
          onPageSave={handlePageSave}
          onPageDelete={handlePageDelete}
          isLoading={false}
        />
      </AdminSection>
      
      <AdminSection 
        title="إدارة التذاكر" 
        description="إدارة تذاكر الدعم الفني والشكاوى"
        icon={TicketCheck}
        isOpen={activeSections.ticketManagement}
        onToggle={() => toggleSection('ticketManagement')}
      >
        <TicketManagement />
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
  );
};

export default AdminSections;
