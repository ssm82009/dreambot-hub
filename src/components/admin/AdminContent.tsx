import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '@/contexts/admin';
import DashboardStats from '@/components/admin/DashboardStats';
import AdminSections from '@/components/admin/AdminSections';

const AdminContent: React.FC = () => {
  const { dbLoading } = useAdmin();

  return (
    <>
      <DashboardStats />
      
      {dbLoading ? (
        <div className="flex justify-center my-8">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">جاري تحميل الإعدادات...</p>
          </div>
        </div>
      ) : (
        <AdminSections />
      )}
    </>
  );
};

export default AdminContent;
