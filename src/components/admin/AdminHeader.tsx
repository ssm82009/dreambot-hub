
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import { useLogoutHandler } from '@/hooks/useSettingsHandlers';

const AdminHeader: React.FC = () => {
  const { adminEmail } = useAdmin();
  const { handleLogout } = useLogoutHandler();

  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 rtl">
      <div>
        <h1 className="text-3xl font-bold">لوحة تحكم المشرف</h1>
        <p className="text-muted-foreground">مرحباً بك، {adminEmail}</p>
      </div>
      <Button variant="outline" onClick={handleLogout} className="mt-4 md:mt-0">تسجيل الخروج</Button>
    </div>
  );
};

export default AdminHeader;
