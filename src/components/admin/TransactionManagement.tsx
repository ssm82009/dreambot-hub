
import React, { useState, useEffect } from 'react';
import { Pencil, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import PaymentStatusBadge from './transaction/PaymentStatusBadge';
import TransactionEditForm from './transaction/TransactionEditForm';

const TransactionManagement: React.FC = () => {
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
  
  const getPlanLabel = (planName: string) => {
    switch (planName?.toLowerCase()) {
      case 'premium': return 'مميز';
      case 'pro': return 'احترافي';
      case 'free': return 'مجاني';
      default: return planName;
    }
  };
  
  const getPaymentMethodLabel = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'paylink': return 'باي لينك';
      case 'paypal': return 'باي بال';
      case 'manual': return 'يدوي';
      default: return method;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة المعاملات والمدفوعات</CardTitle>
        <CardDescription>عرض وتحديث سجلات المعاملات والمدفوعات</CardDescription>
        <div className="mt-4">
          <Input
            placeholder="البحث حسب البريد الإلكتروني، اسم المستخدم، رقم الفاتورة..."
            value={searchTerm}
            onChange={handleSearch}
            className="max-w-md"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            {searchTerm ? 'لا توجد نتائج تطابق البحث' : 'لا توجد معاملات مسجلة'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>الباقة</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>تاريخ الشراء</TableHead>
                  <TableHead>تاريخ الانتهاء</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const user = users[transaction.user_id] || {};
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {user.email || 'غير مسجل'}
                      </TableCell>
                      <TableCell>{transaction.invoice_id}</TableCell>
                      <TableCell>{getPlanLabel(transaction.plan_name)}</TableCell>
                      <TableCell>{getPaymentMethodLabel(transaction.payment_method)}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>
                        {transaction.created_at && format(new Date(transaction.created_at), 'yyyy/MM/dd')}
                      </TableCell>
                      <TableCell>
                        {transaction.expires_at && format(new Date(transaction.expires_at), 'yyyy/MM/dd')}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={transaction.status} />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditClick(transaction)}
                        >
                          <Pencil className="h-4 w-4 ml-1" />
                          تعديل
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        
        {editingTransaction && (
          <TransactionEditForm
            transaction={editingTransaction}
            open={!!editingTransaction}
            onClose={handleEditClose}
            onSuccess={handleEditSuccess}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionManagement;
