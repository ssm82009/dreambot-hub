
import React from 'react';
import { FileText } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import PageManagement from '@/components/admin/PageManagement';
import { useAdmin } from '@/contexts/admin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CustomPage } from '@/types/database';

const PageManagementSection = () => {
  const { pages, setPages, activeSections, toggleSection, setDbLoading } = useAdmin();

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

  return (
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
  );
};

export default PageManagementSection;
