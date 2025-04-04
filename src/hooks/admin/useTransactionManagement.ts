import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { normalizePaymentStatus } from '@/utils/payment/statusNormalizer';

export const useTransactionManagement = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;
  
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, full_name, subscription_expires_at')
        .order('created_at', { ascending: false });
      
      if (usersError) throw usersError;
      
      const usersMap = (usersData || []).reduce((acc, user) => ({
        ...acc,
        [user.id]: user
      }), {});
      
      setUsers(usersMap);
      
      const { data: transactionsData, error } = await supabase
        .from('payment_invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Fetched transactions:", transactionsData?.length || 0);
      
      if (transactionsData && transactionsData.length > 0) {
        const formattedTransactions = transactionsData.map(transaction => {
          const normalizedStatus = normalizePaymentStatus(transaction.status);
          const user = usersMap[transaction.user_id] || {};
          
          return {
            ...transaction,
            status: normalizedStatus,
            expires_at: user.subscription_expires_at || null
          };
        });
        
        console.log("Transactions after normalization:", formattedTransactions);
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
    setCurrentPage(1);
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

  const filteredTransactions = transactions.filter((transaction) => {
    const user = users[transaction.user_id] || {};
    const searchString = searchTerm.toLowerCase().trim();
    
    if (!searchString) return true;
    
    const userEmail = (user.email || '').toLowerCase();
    if (userEmail.includes(searchString)) return true;
    
    const userName = (user.full_name || '').toLowerCase();
    if (userName.includes(searchString)) return true;
    
    const invoiceId = (transaction.invoice_id || '').toLowerCase();
    if (invoiceId.includes(searchString)) return true;
    
    const planName = (transaction.plan_name || '').toLowerCase();
    if (planName.includes(searchString)) return true;
    
    if ('مميز'.includes(searchString) && (planName.includes('premium') || planName.includes('مميز'))) return true;
    if ('احترافي'.includes(searchString) && (planName.includes('pro') || planName.includes('احترافي'))) return true;
    if ('مجاني'.includes(searchString) && (planName.includes('free') || planName.includes('مجاني'))) return true;
    
    const paymentMethod = (transaction.payment_method || '').toLowerCase();
    if (paymentMethod.includes(searchString)) return true;
    
    if ('باي بال'.includes(searchString) && paymentMethod.includes('paypal')) return true;
    if ('باي لينك'.includes(searchString) && paymentMethod.includes('paylink')) return true;
    
    const status = (transaction.status || '').toLowerCase();
    if (status.includes(searchString)) return true;
    
    if ('مدفوع'.includes(searchString) && (status.includes('paid') || status.includes('مدفوع'))) return true;
    if ('قيد الانتظار'.includes(searchString) && (status.includes('pending') || status.includes('قيد الانتظار'))) return true;
    if ('فشل'.includes(searchString) && (status.includes('failed') || status.includes('فشل'))) return true;
    if ('مسترجع'.includes(searchString) && (status.includes('refunded') || status.includes('مسترجع'))) return true;
    
    const amount = String(transaction.amount || '');
    if (amount.includes(searchString)) return true;
    
    return false;
  });

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredTransactions.length / rowsPerPage)));
    if (currentPage > Math.ceil(filteredTransactions.length / rowsPerPage)) {
      setCurrentPage(1);
    }
  }, [filteredTransactions, rowsPerPage]);

  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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
