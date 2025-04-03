
import React from 'react';
import { Receipt } from 'lucide-react';
import AdminSection from './AdminSection';
import TransactionManagement from './TransactionManagement';
import { useAdmin } from '@/contexts/admin';

const TransactionManagementSection = () => {
  const { activeSections, toggleSection } = useAdmin();

  return (
    <AdminSection
      title="إدارة المعاملات والمدفوعات"
      description="عرض وتحديث سجلات المعاملات والاشتراكات"
      icon={Receipt}
      isOpen={activeSections.transactionManagement}
      onToggle={() => toggleSection('transactionManagement')}
    >
      <TransactionManagement />
    </AdminSection>
  );
};

export default TransactionManagementSection;
