
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTransactionManagement } from '@/hooks/admin/useTransactionManagement';
import TransactionSearch from './transaction/TransactionSearch';
import TransactionsTable from './transaction/TransactionsTable';
import TransactionStateDisplay from './transaction/TransactionStateDisplay';
import TransactionEditForm from './transaction/TransactionEditForm';

const TransactionManagement: React.FC = () => {
  const {
    transactions,
    users,
    loading,
    searchTerm,
    editingTransaction,
    isEmpty,
    handleSearch,
    handleEditClick,
    handleEditClose,
    handleEditSuccess
  } = useTransactionManagement();

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة المعاملات والمدفوعات</CardTitle>
        <CardDescription>عرض وتحديث سجلات المعاملات والمدفوعات</CardDescription>
        <TransactionSearch 
          searchTerm={searchTerm} 
          onSearchChange={handleSearch} 
        />
      </CardHeader>
      <CardContent>
        <TransactionStateDisplay 
          loading={loading} 
          isEmpty={isEmpty} 
          searchTerm={searchTerm} 
        />
        
        {!loading && !isEmpty && (
          <TransactionsTable 
            transactions={transactions} 
            users={users} 
            onEditClick={handleEditClick} 
          />
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
