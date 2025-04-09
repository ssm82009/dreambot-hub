import React, { useState, useEffect } from 'react';
import { Book, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSection from '@/components/admin/AdminSection';
import { useAdmin } from '@/contexts/admin';
import { supabase } from '@/integrations/supabase/client';
import { Dream } from '@/types/database';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Loader2 } from 'lucide-react';

const DreamManagementSection = () => {
  const { activeSections, toggleSection } = useAdmin();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDreams, setTotalDreams] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const pageSize = 10;
  const navigate = useNavigate();

  const fetchDreamsCount = async () => {
    try {
      const { count, error } = await supabase
        .from('dreams')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching dreams count:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error in fetchDreamsCount:', error);
      return 0;
    }
  };

  const fetchDreams = async (page = 1) => {
    setLoading(true);
    try {
      const count = await fetchDreamsCount();
      setTotalDreams(count);
      setTotalPages(Math.max(1, Math.ceil(count / pageSize)));

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: dreamsData, error: dreamsError } = await supabase
        .from('dreams')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });

      if (dreamsError) {
        console.error('Error fetching dreams:', dreamsError);
        toast.error('حدث خطأ أثناء تحميل الأحلام');
        return;
      }

      setDreams(dreamsData || []);

      const userIds = dreamsData
        ?.map(dream => dream.user_id)
        .filter(id => id !== null && id !== undefined) as string[];

      if (userIds.length > 0) {
        const uniqueUserIds = [...new Set(userIds)];
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, full_name')
          .in('id', uniqueUserIds);

        if (usersError) {
          console.error('Error fetching users:', usersError);
        } else if (usersData) {
          const emailLookup: Record<string, string> = {};
          const nameLookup: Record<string, string> = {};
          
          usersData.forEach(user => {
            emailLookup[user.id] = user.email;
            nameLookup[user.id] = user.full_name || '';
          });
          
          setUserEmails(emailLookup);
          setUserNames(nameLookup);
        }
      }
    } catch (error) {
      console.error('Error in fetchDreams:', error);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchDreams(currentPage);
    toast.success('تم تحديث قائمة الأحلام بنجاح');
  };

  useEffect(() => {
    if (activeSections.dreams) {
      fetchDreams(currentPage);
    }
  }, [activeSections.dreams, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const truncateText = (text: string, maxLength = 50) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getUserDisplayName = (userId: string | null) => {
    if (!userId) return 'غير معروف';
    
    if (userNames[userId]) {
      return userNames[userId];
    }
    
    if (userEmails[userId]) {
      return userEmails[userId];
    }
    
    return 'غير معروف';
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <PaginationLink className="cursor-default">...</PaginationLink>
                </PaginationItem>
              )}
            </>
          )}
          
          {pages}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink className="cursor-default">...</PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const viewDream = (dreamId: string) => {
    navigate(`/dream/${dreamId}`);
  };

  return (
    <AdminSection 
      title="إدارة الأحلام" 
      description="عرض وإدارة جميع الأحلام المسجلة في النظام"
      icon={Book}
      isOpen={activeSections.dreams}
      onToggle={() => toggleSection('dreams')}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            إجمالي عدد الأحلام: {totalDreams}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            className="flex items-center gap-1"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span>تحديث البيانات</span>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : dreams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد أحلام مسجلة
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>محتوى الحلم</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dreams.map((dream) => (
                  <TableRow key={dream.id}>
                    <TableCell>
                      {getUserDisplayName(dream.user_id)}
                    </TableCell>
                    <TableCell>{truncateText(dream.dream_text)}</TableCell>
                    <TableCell>{formatDate(dream.created_at)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => viewDream(dream.id)}
                      >
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {totalPages > 1 && renderPagination()}
      </div>
    </AdminSection>
  );
};

export default DreamManagementSection;
