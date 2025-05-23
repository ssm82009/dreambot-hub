
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useNotificationData } from '@/hooks/notifications/useNotificationData';

interface NotificationHeaderProps {
  refreshData?: () => Promise<void>;
  title?: string;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({ refreshData, title = "إدارة الإشعارات" }) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      
      {refreshData && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshData}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          <span>تحديث البيانات</span>
        </Button>
      )}
    </div>
  );
};

export default NotificationHeader;
