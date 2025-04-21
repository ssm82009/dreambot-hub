
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
    // eslint-disable-next-line
  }, [activeSections.dreams, currentPage]);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const truncateText = (text: string, maxLength = 50) =>
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  const getUserDisplayName = (userId: string | null) => {
    if (!userId) return 'غير معروف';
    if (userNames[userId]) return userNames[userId];
    if (userEmails[userId]) return userEmails[userId];
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
          <PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i}>
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
    navigate(`/dream/${dreamId}`, { state: { from: 'admin' } });
  };

  return (
    <AdminSection 
      title="إدارة الأحلام" 
      description="عرض وإدارة جميع الأحلام المسجلة في النظام"
      icon={Book}
      isOpen={activeSections.dreams}
      onToggle={() => toggleSection('dreams')}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            إجمالي عدد الأحلام: <span className="font-bold text-primary">{totalDreams}</span>
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
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : dreams.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground rounded-md bg-gray-100 dark:bg-gray-900">
            لا توجد أحلام مسجلة
          </div>
        ) : (
          <div className="shadow border rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800">
                  <TableHead className="w-32 text-center font-bold text-primary">المستخدم</TableHead>
                  <TableHead className="font-bold text-primary">الحلم</TableHead>
                  <TableHead className="font-bold text-primary">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-left font-bold text-primary">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dreams.map((dream) => (
                  <TableRow key={dream.id} className="hover:bg-primary/5 transition rounded group">
                    <TableCell className="text-right font-medium text-gray-900 dark:text-white">
                      {getUserDisplayName(dream.user_id)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md truncate text-gray-800 dark:text-gray-200">{truncateText(dream.dream_text, 80)}</div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-block px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-100">
                        {formatDate(dream.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => viewDream(dream.id)}
                        className="hover:bg-primary/10"
                      >
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* نص التنبيه الجديد */}
            <div className="p-4 border-t bg-yellow-100 dark:bg-yellow-800/30 mt-0">
              <p className="text-xs text-yellow-900 dark:text-yellow-100 text-right font-medium leading-relaxed">
                <span className="font-bold block mb-1">تنبيه وإخلاء مسؤولية:</span>
                تم تفسير هذا الحلم عبر تطبيق Taweel.app باستخدام خوارزميات الذكاء الاصطناعي لأغراض تعليمية ولا يُمكن اتخاذ أي قرارات حياتية بناءً عليه.
              </p>
            </div>
          </div>
        )}
        {totalPages > 1 && renderPagination()}
      </div>
    </AdminSection>
  );
};

export default DreamManagementSection;

