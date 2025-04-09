
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import AdminSection from '@/components/admin/AdminSection';
import DreamTable from '@/components/admin/dream/DreamTable';
import DreamSearch from '@/components/admin/dream/DreamSearch';
import DreamPagination from '@/components/admin/dream/DreamPagination';
import { Dream } from '@/types/database';

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
      
      setDreams(data || []);
      setTotalDreams(count || 0);
    } catch (error) {
      console.error('Error fetching dreams:', error);
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
  
  return (
    <AdminSection
      title="إدارة الأحلام"
      description="عرض وإدارة جميع الأحلام المقدمة من المستخدمين"
      icon={() => <Loader2 className="h-5 w-5" />}
      isOpen={true}
      onToggle={() => {}}
    >
      <div className="space-y-4">
        <DreamSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        
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
          <DreamPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
          />
        )}
      </div>
    </AdminSection>
  );
};

export default DreamManagementSection;
