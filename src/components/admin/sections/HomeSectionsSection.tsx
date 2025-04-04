
import React, { useState } from 'react';
import { LayoutDashboard, EditIcon } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import { useAdmin } from '@/contexts/admin';
import { HomeSectionItem, HomeSectionContentItem } from '@/contexts/admin/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const HomeSectionsSection = () => {
  const { homeSectionsForm, setHomeSectionsForm, activeSections, toggleSection, setDbLoading } = useAdmin();
  const [sections, setSections] = useState<HomeSectionItem[]>(homeSectionsForm.sections);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Handle section order change
  const moveSection = (id: string, direction: 'up' | 'down') => {
    const sectionsCopy = [...sections];
    const index = sectionsCopy.findIndex(section => section.id === id);
    
    if (direction === 'up' && index > 0) {
      // Swap with previous item
      [sectionsCopy[index - 1], sectionsCopy[index]] = [sectionsCopy[index], sectionsCopy[index - 1]];
      
      // Update order numbers
      sectionsCopy[index].order = index + 1;
      sectionsCopy[index - 1].order = index;
    } else if (direction === 'down' && index < sectionsCopy.length - 1) {
      // Swap with next item
      [sectionsCopy[index], sectionsCopy[index + 1]] = [sectionsCopy[index + 1], sectionsCopy[index]];
      
      // Update order numbers
      sectionsCopy[index].order = index + 1;
      sectionsCopy[index + 1].order = index + 2;
    }
    
    setSections(sectionsCopy);
  };

  // Handle visibility toggle
  const toggleVisibility = (id: string) => {
    const sectionsCopy = [...sections];
    const index = sectionsCopy.findIndex(section => section.id === id);
    sectionsCopy[index].visible = !sectionsCopy[index].visible;
    setSections(sectionsCopy);
  };

  // Save changes to database
  const saveChanges = async () => {
    setDbLoading(true);
    try {
      // أولاً، نحدث الحالة المحلية
      setHomeSectionsForm({ sections });
      
      // ثم نحفظ البيانات في قاعدة البيانات
      const { error } = await supabase
        .from('site_settings' as any)
        .update({ home_sections: JSON.stringify(sections) })
        .eq('id', 'home_sections');
      
      if (error) throw error;
      
      toast.success('تم حفظ إعدادات الصفحة الرئيسية بنجاح');
    } catch (error) {
      console.error('Error saving home sections:', error);
      toast.error('حدث خطأ أثناء حفظ إعدادات الصفحة الرئيسية');
    } finally {
      setDbLoading(false);
    }
  };

  // تعديل محتوى القسم
  const updateSectionContent = (sectionId: string, field: string, value: string) => {
    const sectionsCopy = [...sections];
    const index = sectionsCopy.findIndex(section => section.id === sectionId);
    
    if (index !== -1) {
      if (!sectionsCopy[index].content) {
        sectionsCopy[index].content = {};
      }
      sectionsCopy[index].content![field] = value;
      setSections(sectionsCopy);
    }
  };

  // Form components for different sections
  const renderHeroForm = (section: HomeSectionItem) => {
    const content = section.content || {};
    
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">عنوان القسم الرئيسي</label>
          <Input 
            value={content.title || 'تفسير الأحلام بالذكاء الاصطناعي'} 
            onChange={(e) => updateSectionContent(section.id, 'title', e.target.value)}
            className="rtl"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">النص التوضيحي</label>
          <Textarea 
            value={content.subtitle || 'فسّر أحلامك بدقة عالية باستخدام أحدث تقنيات الذكاء الاصطناعي واستنادًا إلى مراجع التفسير الإسلامية الموثوقة.'} 
            onChange={(e) => updateSectionContent(section.id, 'subtitle', e.target.value)}
            className="min-h-[100px] rtl"
          />
        </div>
      </div>
    );
  };

  const renderTryItForm = (section: HomeSectionItem) => {
    const content = section.content || {};
    
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">عنوان القسم</label>
          <Input 
            value={content.title || 'جرب خدمة تفسير الأحلام'} 
            onChange={(e) => updateSectionContent(section.id, 'title', e.target.value)}
            className="rtl"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">النص التوضيحي</label>
          <Textarea 
            value={content.subtitle || 'أدخل تفاصيل حلمك واحصل على تفسير فوري من نظام الذكاء الاصطناعي الخاص بنا'} 
            onChange={(e) => updateSectionContent(section.id, 'subtitle', e.target.value)}
            className="min-h-[100px] rtl"
          />
        </div>
      </div>
    );
  };

  const renderHowItWorksForm = (section: HomeSectionItem) => {
    const content = section.content || {};
    
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">عنوان القسم</label>
          <Input 
            value={content.title || 'كيف يعمل تفسير الأحلام بالذكاء الاصطناعي؟'} 
            onChange={(e) => updateSectionContent(section.id, 'title', e.target.value)}
            className="rtl"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">النص التوضيحي</label>
          <Textarea 
            value={content.subtitle || 'نستخدم تقنيات الذكاء الاصطناعي المتقدمة مع مراجع التفسير الإسلامية الموثوقة'} 
            onChange={(e) => updateSectionContent(section.id, 'subtitle', e.target.value)}
            className="min-h-[100px] rtl"
          />
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-md font-medium mb-4">خطوات العملية</h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">عنوان الخطوة الأولى</label>
              <Input 
                value={content.step1_title || '1. أدخل تفاصيل حلمك'} 
                onChange={(e) => updateSectionContent(section.id, 'step1_title', e.target.value)}
                className="rtl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">وصف الخطوة الأولى</label>
              <Textarea 
                value={content.step1_text || 'قم بكتابة جميع تفاصيل حلمك، كلما كانت التفاصيل أكثر كان التفسير أدق.'} 
                onChange={(e) => updateSectionContent(section.id, 'step1_text', e.target.value)}
                className="rtl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">عنوان الخطوة الثانية</label>
              <Input 
                value={content.step2_title || '2. معالجة الذكاء الاصطناعي'} 
                onChange={(e) => updateSectionContent(section.id, 'step2_title', e.target.value)}
                className="rtl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">وصف الخطوة الثانية</label>
              <Textarea 
                value={content.step2_text || 'يقوم نظامنا بتحليل حلمك ومقارنته بآلاف التفسيرات من المراجع الموثوقة.'} 
                onChange={(e) => updateSectionContent(section.id, 'step2_text', e.target.value)}
                className="rtl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">عنوان الخطوة الثالثة</label>
              <Input 
                value={content.step3_title || '3. احصل على التفسير'} 
                onChange={(e) => updateSectionContent(section.id, 'step3_title', e.target.value)}
                className="rtl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">وصف الخطوة الثالثة</label>
              <Textarea 
                value={content.step3_text || 'استلم تفسيراً دقيقاً لحلمك مع نصائح وتوجيهات مفيدة.'} 
                onChange={(e) => updateSectionContent(section.id, 'step3_text', e.target.value)}
                className="rtl"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">الاقتباس</label>
                <Textarea 
                  value={content.quote || '"الرؤيا الصالحة من الله، والحلم من الشيطان، فإذا حلم أحدكم حلماً يخافه فليتفل عن يساره، وليستعذ بالله من شره، فإنه لا يضره"'} 
                  onChange={(e) => updateSectionContent(section.id, 'quote', e.target.value)}
                  className="rtl"
                />
              </div>
              
              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium">مصدر الاقتباس</label>
                <Input 
                  value={content.quote_author || '- حديث شريف'} 
                  onChange={(e) => updateSectionContent(section.id, 'quote_author', e.target.value)}
                  className="rtl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminSection 
      title="أقسام الصفحة الرئيسية" 
      description="ترتيب وإظهار/إخفاء وتعديل محتوى أقسام الصفحة الرئيسية"
      icon={LayoutDashboard}
      isOpen={activeSections.homeSections}
      onToggle={() => toggleSection('homeSections')}
    >
      <div className="space-y-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-4">
            يمكنك ترتيب الأقسام في الصفحة الرئيسية من خلال تحريك القسم لأعلى أو لأسفل، كما يمكنك إظهار أو إخفاء القسم وتعديل محتواه.
          </p>
          
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="border rounded-md overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center text-foreground/80 mr-3">
                      {section.order}
                    </div>
                    <div>
                      <p className="font-medium">{section.title}</p>
                      <p className="text-xs text-muted-foreground">ID: {section.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <span className="text-sm">إظهار</span>
                      <Switch 
                        checked={section.visible} 
                        onCheckedChange={() => toggleVisibility(section.id)} 
                      />
                    </div>

                    <div className="flex flex-col">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveSection(section.id, 'up')}
                        disabled={section.order === 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m18 15-6-6-6 6"/>
                        </svg>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveSection(section.id, 'down')}
                        disabled={section.order === sections.length}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {editingSection === section.id && (
                  <div className="p-2 bg-background">
                    {section.id === 'hero' && renderHeroForm(section)}
                    {section.id === 'tryIt' && renderTryItForm(section)}
                    {section.id === 'howItWorks' && renderHowItWorksForm(section)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={saveChanges}>حفظ التغييرات</Button>
        </div>
      </div>
    </AdminSection>
  );
};

export default HomeSectionsSection;
