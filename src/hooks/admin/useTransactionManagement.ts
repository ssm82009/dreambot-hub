
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useTransactionManagement = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data: transactionsData, error } = await supabase
        .from('payment_invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // الحصول على قائمة معرفات المستخدمين الفريدة
      const userIds = [...new Set(transactionsData?.map(t => t.user_id).filter(Boolean))];
      
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, full_name')
          .in('id', userIds);
        
        if (usersError) throw usersError;
        
        // تحويل بيانات المستخدمين إلى كائن للوصول السريع
        const usersMap = (usersData || []).reduce((acc, user) => ({
          ...acc,
          [user.id]: user
        }), {});
        
        setUsers(usersMap);
      }
      
      setTransactions(transactionsData || []);
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
    const searchString = searchTerm.toLowerCase();
    
    return (
      user.email?.toLowerCase().includes(searchString) ||
      user.full_name?.toLowerCase().includes(searchString) ||
      transaction.invoice_id?.toLowerCase().includes(searchString) ||
      transaction.plan_name?.toLowerCase().includes(searchString) ||
      transaction.payment_method?.toLowerCase().includes(searchString) ||
      transaction.status?.toLowerCase().includes(searchString)
    );
  });

  return {
    transactions: filteredTransactions,
    users,
    loading,
    searchTerm,
    editingTransaction,
    handleSearch,
    handleEditClick,
    handleEditClose,
    handleEditSuccess,
    isEmpty: filteredTransactions.length === 0
  };
};
