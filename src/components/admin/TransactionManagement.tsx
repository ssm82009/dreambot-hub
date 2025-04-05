
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTransactionManagement } from '@/hooks/admin/useTransactionManagement';
import { useRevenueStats } from '@/hooks/admin/useRevenueStats';
import TransactionSearch from './transaction/TransactionSearch';
import TransactionsTable from './transaction/TransactionsTable';
import TransactionStateDisplay from './transaction/TransactionStateDisplay';
import TransactionEditForm from './transaction/TransactionEditForm';
import TransactionPagination from './transaction/TransactionPagination';
import RevenueStats from './transaction/RevenueStats';

const TransactionManagement: React.FC = () => {
  const {
    transactions,
    users,
    loading,
    searchTerm,
    editingTransaction,
    isEmpty,
    pagination,
    handleSearch,
    handleEditClick,
    handleEditClose,
    handleEditSuccess
  } = useTransactionManagement();

  const {
    dailyRevenue,
    monthlyRevenue,
    yearlyRevenue,
    totalRevenue,
    revenueByPlan,
    loading: revenueLoading
  } = useRevenueStats();

  return (
    <Card className="w-full max-w-[calc(100vw-18rem)]">
      <CardHeader>
        <CardTitle>إدارة المعاملات والمدفوعات</CardTitle>
        <CardDescription>عرض وتحديث سجلات المعاملات والمدفوعات</CardDescription>
        <TransactionSearch 
          searchTerm={searchTerm} 
          onSearchChange={handleSearch} 
        />
      </CardHeader>
      <CardContent className="px-1 md:px-4">
        {!revenueLoading && (
          <RevenueStats 
            dailyRevenue={dailyRevenue}
            monthlyRevenue={monthlyRevenue}
            yearlyRevenue={yearlyRevenue}
            totalRevenue={totalRevenue}
            revenueByPlan={revenueByPlan}
          />
        )}
        
        <TransactionStateDisplay 
          loading={loading} 
          isEmpty={isEmpty} 
          searchTerm={searchTerm} 
        />
        
        {!loading && !isEmpty && (
          <>
            <div className="w-full overflow-auto">
              <TransactionsTable 
                transactions={transactions} 
                users={users} 
                onEditClick={handleEditClick} 
              />
            </div>
            <div className="mt-4">
              <TransactionPagination 
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.goToPage}
                onNextPage={pagination.nextPage}
                onPreviousPage={pagination.previousPage}
              />
            </div>
          </>
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
