
import React, { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import { useAdmin } from '@/contexts/admin';
import { HomeSectionItem } from '@/contexts/admin/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const HomeSectionsSection = () => {
  const { homeSectionsForm, setHomeSectionsForm, activeSections, toggleSection, setDbLoading } = useAdmin();
  const [sections, setSections] = useState<HomeSectionItem[]>(homeSectionsForm.sections);

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
        .from('site_settings')
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

  return (
    <AdminSection 
      title="أقسام الصفحة الرئيسية" 
      description="ترتيب وإظهار/إخفاء أقسام الصفحة الرئيسية"
      icon={LayoutDashboard}
      isOpen={activeSections.homeSections}
      onToggle={() => toggleSection('homeSections')}
    >
      <div className="space-y-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-4">
            يمكنك ترتيب الأقسام في الصفحة الرئيسية من خلال تحريك القسم لأعلى أو لأسفل، كما يمكنك إظهار أو إخفاء القسم.
          </p>
          
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center justify-between p-3 border rounded-md">
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
                </div>
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
