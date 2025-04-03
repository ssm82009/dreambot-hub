
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useTransactionManagement = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;
  
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data: transactionsData, error } = await supabase
        .from('payment_invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Fetched transactions:", transactionsData?.length || 0);
      
      // الحصول على قائمة معرفات المستخدمين الفريدة
      const userIds = [...new Set(transactionsData?.map(t => t.user_id).filter(Boolean))];
      
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, full_name')
          .in('id', userIds);
        
        if (usersError) throw usersError;
        
        console.log("Fetched users:", usersData?.length || 0);
        
        // تحويل بيانات المستخدمين إلى كائن للوصول السريع
        const usersMap = (usersData || []).reduce((acc, user) => ({
          ...acc,
          [user.id]: user
        }), {});
        
        setUsers(usersMap);
      }
      
      // إذا تم استرجاع البيانات بنجاح، قم بتسجيلها
      if (transactionsData && transactionsData.length > 0) {
        // التحقق من حالات الدفع وتنسيقها
        const formattedTransactions = transactionsData.map(transaction => {
          // تطبيع حالة الدفع
          let status = transaction.status || '';
          if (typeof status === 'string') {
            const normalizedStatus = status.toLowerCase();
            if (normalizedStatus.includes('paid') || normalizedStatus.includes('مدفوع')) {
              status = 'مدفوع';
            } else if (normalizedStatus.includes('pending') || normalizedStatus.includes('قيد الانتظار')) {
              status = 'قيد الانتظار';
            } else if (normalizedStatus.includes('failed') || normalizedStatus.includes('فشل')) {
              status = 'فشل';
            } else if (normalizedStatus.includes('refunded') || normalizedStatus.includes('مسترجع')) {
              status = 'مسترجع';
            }
          }
          
          return {
            ...transaction,
            status
          };
        });
        
        setTransactions(formattedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('حدث خطأ أثناء تحميل بيانات المعاملات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  const handleEditClick = (transaction: any) => {
    setEditingTransaction(transaction);
  };
  
  const handleEditClose = () => {
    setEditingTransaction(null);
  };
  
  const handleEditSuccess = () => {
    fetchTransactions();
  };
  
  // تحسين وظيفة البحث لتكون أكثر شمولية
  const filteredTransactions = transactions.filter((transaction) => {
    const user = users[transaction.user_id] || {};
    const searchString = searchTerm.toLowerCase().trim();
    
    // إذا كان مصطلح البحث فارغًا، أعرض جميع المعاملات
    if (!searchString) return true;
    
    // بحث في بريد المستخدم
    const userEmail = (user.email || '').toLowerCase();
    if (userEmail.includes(searchString)) return true;
    
    // بحث في اسم المستخدم
    const userName = (user.full_name || '').toLowerCase();
    if (userName.includes(searchString)) return true;
    
    // بحث في رقم الفاتورة
    const invoiceId = (transaction.invoice_id || '').toLowerCase();
    if (invoiceId.includes(searchString)) return true;
    
    // بحث في نوع الخطة
    const planName = (transaction.plan_name || '').toLowerCase();
    if (planName.includes(searchString)) return true;
    
    // بحث في أسماء الخطط المترجمة
    if ('مميز'.includes(searchString) && (planName.includes('premium') || planName.includes('مميز'))) return true;
    if ('احترافي'.includes(searchString) && (planName.includes('pro') || planName.includes('احترافي'))) return true;
    if ('مجاني'.includes(searchString) && (planName.includes('free') || planName.includes('مجاني'))) return true;
    
    // بحث في طريقة الدفع
    const paymentMethod = (transaction.payment_method || '').toLowerCase();
    if (paymentMethod.includes(searchString)) return true;
    
    // بحث في أسماء طرق الدفع المترجمة
    if ('باي بال'.includes(searchString) && paymentMethod.includes('paypal')) return true;
    if ('باي لينك'.includes(searchString) && paymentMethod.includes('paylink')) return true;
    
    // بحث في الحالة
    const status = (transaction.status || '').toLowerCase();
    if (status.includes(searchString)) return true;
    
    // بحث في حالات الدفع المترجمة
    if ('مدفوع'.includes(searchString) && (status.includes('paid') || status.includes('مدفوع'))) return true;
    if ('قيد الانتظار'.includes(searchString) && (status.includes('pending') || status.includes('قيد الانتظار'))) return true;
    if ('فشل'.includes(searchString) && (status.includes('failed') || status.includes('فشل'))) return true;
    if ('مسترجع'.includes(searchString) && (status.includes('refunded') || status.includes('مسترجع'))) return true;
    
    // بحث في المبلغ
    const amount = String(transaction.amount || '');
    if (amount.includes(searchString)) return true;
    
    return false;
  });

  // Calculate pagination
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredTransactions.length / rowsPerPage)));
    if (currentPage > Math.ceil(filteredTransactions.length / rowsPerPage)) {
      setCurrentPage(1);
    }
  }, [filteredTransactions, rowsPerPage]);

  // Get current page transactions
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Pagination controls
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return {
    transactions: currentTransactions,
    allTransactions: filteredTransactions,
    users,
    loading,
    searchTerm,
    editingTransaction,
    pagination: {
      currentPage,
      totalPages,
      goToPage,
      nextPage,
      previousPage
    },
    handleSearch,
    handleEditClick,
    handleEditClose,
    handleEditSuccess,
    isEmpty: filteredTransactions.length === 0
  };
};
