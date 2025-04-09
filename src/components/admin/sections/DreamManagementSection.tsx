
import React, { useState, useEffect } from 'react';
import { Loader2, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import AdminSection from '@/components/admin/AdminSection';
import DreamTable from '@/components/admin/dream/DreamTable';
import DreamSearch from '@/components/admin/dream/DreamSearch';
import DreamPagination from '@/components/admin/dream/DreamPagination';
import { Dream } from '@/types/database';
import { toast } from 'sonner';

const DreamManagementSection: React.FC = () => {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalDreams, setTotalDreams] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const dreamsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(totalDreams / dreamsPerPage));
  
  useEffect(() => {
    fetchDreams();
  }, [currentPage, searchTerm]);
  
  const fetchDreams = async () => {
    setLoading(true);
    try {
      // Calculate pagination
      const from = (currentPage - 1) * dreamsPerPage;
      const to = from + dreamsPerPage - 1;
      
      console.log(`Fetching dreams from ${from} to ${to}, search term: "${searchTerm}"`);
      
      // Create base query
      let query = supabase
        .from('dreams')
        .select('*', { count: 'exact' });
      
      // Add search filter if exists
      if (searchTerm) {
        query = query.ilike('dream_text', `%${searchTerm}%`);
      }
      
      // Get paginated results
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      console.log(`Retrieved ${data?.length} dreams. Total count: ${count}`);
      console.log('Dreams data:', data);
      
      setDreams(data || []);
      setTotalDreams(count || 0);
    } catch (error) {
      console.error('Error fetching dreams:', error);
      toast.error('حدث خطأ أثناء جلب الأحلام');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  const handleRefresh = () => {
    fetchDreams();
  };
  
  return (
    <AdminSection
      title="إدارة الأحلام"
      description="عرض وإدارة جميع الأحلام المقدمة من المستخدمين"
      icon={() => <BookOpen className="h-5 w-5" />}
      isOpen={true}
      onToggle={() => {}}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <DreamSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
          <button 
            onClick={handleRefresh} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            تحديث البيانات
          </button>
        </div>
        
        <Card className="overflow-hidden border rounded-md">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : dreams.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              {searchTerm ? 'لا توجد نتائج تطابق البحث' : 'لا توجد أحلام مسجلة'}
            </div>
          ) : (
            <DreamTable dreams={dreams} />
          )}
        </Card>
        
        {totalDreams > 0 && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              إجمالي الأحلام: {totalDreams}
            </div>
            <DreamPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onNextPage={handleNextPage}
              onPreviousPage={handlePreviousPage}
            />
          </div>
        )}
      </div>
    </AdminSection>
  );
};

export default DreamManagementSection;
