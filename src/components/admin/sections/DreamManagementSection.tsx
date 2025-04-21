
import React, { useState, useEffect } from 'react';
import { Book, RefreshCw, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';

const DreamManagementSection = () => {
  const { activeSections, toggleSection } = useAdmin();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDreams, setTotalDreams] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [searchId, setSearchId] = useState('');
  const [searchResults, setSearchResults] = useState<Dream | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
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
      // Fetch total count of dreams
      const count = await fetchDreamsCount();
      console.log('Total dreams count:', count);
      setTotalDreams(count);
      setTotalPages(Math.max(1, Math.ceil(count / pageSize)));

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // طباعة معلومات الصفحة لأغراض التصحيح
      console.log(`فحص الأحلام: صفحة ${page}, من ${from} إلى ${to}`);

      // Fetch dreams for current page - ensuring we get all dreams regardless of user_id
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

      console.log('تم العثور على الأحلام:', dreamsData?.length);
      console.log('بيانات الأحلام:', dreamsData);
      setDreams(dreamsData || []);
      
      // تجميع جميع معرفات المستخدمين، بما في ذلك التعامل مع القيم الفارغة
      const userIds = dreamsData
        ?.map(dream => dream.user_id)
        .filter(id => id !== null && id !== undefined) as string[];
      
      console.log('معرفات المستخدمين المجمعة:', userIds);

      if (userIds && userIds.length > 0) {
        await fetchUserDetails(userIds);
      }
    } catch (error) {
      console.error('Error in fetchDreams:', error);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userIds: string[]) => {
    if (!userIds || userIds.length === 0) {
      console.log('لا توجد معرفات مستخدمين لجلب تفاصيلها');
      return;
    }

    try {
      const uniqueUserIds = [...new Set(userIds)];
      console.log('معرفات المستخدمين الفريدة:', uniqueUserIds.length);
      
      // Fetch user details for the collected user IDs
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .in('id', uniqueUserIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast.error('حدث خطأ أثناء جلب بيانات المستخدمين');
      } else if (usersData) {
        console.log('تم جلب بيانات المستخدمين:', usersData.length);
        
        const emailLookup: Record<string, string> = {};
        const nameLookup: Record<string, string> = {};
        
        usersData.forEach(user => {
          if (user.id) {
            emailLookup[user.id] = user.email || '';
            nameLookup[user.id] = user.full_name || '';
          }
        });
        
        setUserEmails(emailLookup);
        setUserNames(nameLookup);
        
        console.log('قاموس بريد المستخدمين:', emailLookup);
        console.log('قاموس أسماء المستخدمين:', nameLookup);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const searchDreamById = async () => {
    if (!searchId.trim()) {
      toast.error('الرجاء إدخال معرف الحلم للبحث');
      return;
    }

    setLoading(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      // تنظيف معرف الحلم من أي مسافات
      const cleanId = searchId.trim();
      console.log(`بحث عن الحلم بالمعرف: "${cleanId}"`);

      // فحص إذا كان المعرف صالحًا بتنسيق UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)) {
        console.log('معرف الحلم غير صحيح بتنسيق UUID');
        setSearchError('معرف الحلم غير صحيح. يجب أن يكون بتنسيق UUID.');
        toast.error('معرف الحلم غير صحيح');
        setLoading(false);
        return;
      }

      // جلب الحلم باستخدام معرف UUID
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('id', cleanId);

      console.log('نتيجة البحث عن الحلم:', data, 'خطأ:', error);

      if (error) {
        console.error('Error searching for dream:', error);
        setSearchError('حدث خطأ أثناء البحث عن الحلم');
        toast.error('حدث خطأ أثناء البحث عن الحلم');
      } else if (data && data.length > 0) {
        console.log('تم العثور على الحلم:', data[0]);
        setSearchResults(data[0]);
        
        // جلب بيانات المستخدم إذا كان الحلم له معرف مستخدم
        if (data[0].user_id) {
          await fetchUserDetails([data[0].user_id]);
        }
        
        toast.success('تم العثور على الحلم بنجاح');
      } else {
        console.log('لم يتم العثور على الحلم بهذا المعرف');
        setSearchError('لم يتم العثور على الحلم بهذا المعرف');
        toast.error('لم يتم العثور على الحلم بهذا المعرف');
      }
    } catch (error) {
      console.error('Error in searchDreamById:', error);
      setSearchError('حدث خطأ أثناء البحث عن الحلم');
      toast.error('حدث خطأ أثناء البحث عن الحلم');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setSearchResults(null);
    setSearchId('');
    setSearchError(null);
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
    if (!userId) return 'مستخدم مجهول';
    
    const userName = userNames[userId];
    const userEmail = userEmails[userId];
    
    if (userName) return userName;
    if (userEmail) return userEmail;
    
    return 'مستخدم غير معروف';
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

  const renderDreamTable = (dreamsList: Dream[]) => {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead className="w-32 text-right font-bold text-primary">المستخدم</TableHead>
              <TableHead className="font-bold text-primary">معرف الحلم</TableHead>
              <TableHead className="font-bold text-primary">الحلم</TableHead>
              <TableHead className="font-bold text-primary">تاريخ الإنشاء</TableHead>
              <TableHead className="text-left font-bold text-primary">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dreamsList.map((dream) => (
              <TableRow key={dream.id} className="hover:bg-primary/5 transition rounded group">
                <TableCell className="text-right font-medium text-gray-900 dark:text-white">
                  <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                    {getUserDisplayName(dream.user_id)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[150px] truncate text-xs bg-gray-50 dark:bg-gray-800 p-1 rounded">
                    {dream.id}
                  </div>
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
      </div>
    );
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
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            إجمالي عدد الأحلام: <span className="font-bold text-primary">{totalDreams}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Input
                placeholder="أدخل معرف الحلم للبحث"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full md:w-72"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={searchDreamById}
                disabled={loading || !searchId.trim()}
                className="shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
              className="flex items-center gap-1 shrink-0"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span>تحديث البيانات</span>
            </Button>
          </div>
        </div>

        {loading && !searchResults ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : searchResults ? (
          <div className="shadow border rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border-b">
              <h3 className="font-bold">نتيجة البحث عن الحلم</h3>
            </div>
            {renderDreamTable([searchResults])}
            <div className="p-4 text-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchResults(null);
                  setSearchId('');
                }}
              >
                العودة إلى قائمة الأحلام
              </Button>
            </div>
          </div>
        ) : searchError ? (
          <div className="text-center py-10 text-muted-foreground rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="mb-4 text-red-600 dark:text-red-400">{searchError}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchError(null);
                setSearchId('');
              }}
            >
              العودة إلى قائمة الأحلام
            </Button>
          </div>
        ) : dreams.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground rounded-md bg-gray-100 dark:bg-gray-900">
            لا توجد أحلام مسجلة
          </div>
        ) : (
          <div className="shadow border rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {renderDreamTable(dreams)}
            
            <div className="p-4 border-t bg-yellow-100 dark:bg-yellow-800/30 mt-0">
              <p className="text-xs text-yellow-900 dark:text-yellow-100 text-right font-medium leading-relaxed">
                <span className="font-bold block mb-1">تنبيه وإخلاء مسؤولية:</span>
                تم تفسير هذا الحلم عبر تطبيق Taweel.app باستخدام خوارزميات الذكاء الاصطناعي لأغراض تعليمية ولا يُمكن اتخاذ أي قرارات حياتية بناءً عليه.
              </p>
            </div>
          </div>
        )}
        {!searchResults && !searchError && totalPages > 1 && renderPagination()}
      </div>
    </AdminSection>
  );
};

export default DreamManagementSection;
