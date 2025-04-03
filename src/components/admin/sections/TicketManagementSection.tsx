
import React from 'react';
import { TicketCheck } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import TicketManagement from '@/components/admin/TicketManagement';
import { useAdmin } from '@/contexts/admin';

const TicketManagementSection = () => {
  const { activeSections, toggleSection } = useAdmin();

  return (
    <AdminSection 
      title="إدارة التذاكر" 
      description="إدارة تذاكر الدعم الفني والشكاوى"
      icon={TicketCheck}
      isOpen={activeSections.ticketManagement}
      onToggle={() => toggleSection('ticketManagement')}
    >
      <TicketManagement />
    </AdminSection>
  );
};

export default TicketManagementSection;
