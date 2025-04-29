
import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface NotificationStatsProps {
  subscribersCount: number;
  loading: boolean;
  error: string | null;
  refreshData?: () => void;
}

const NotificationStats: React.FC<NotificationStatsProps> = ({ 
  subscribersCount, 
  loading, 
  error,
  refreshData
}) => {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>إحصائيات الإشعارات</CardTitle>
          <CardDescription>تفاصيل عن المشتركين في الإشعارات</CardDescription>
        </div>
        {refreshData && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={refreshData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>تحديث البيانات</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col space-y-2 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">عدد المشتركين في OneSignal</span>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Badge variant="outline" className={`${subscribersCount > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {subscribersCount}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">حول الإشعارات</h4>
          <p className="text-sm text-muted-foreground">
            يمكنك إرسال إشعارات مباشرة للمستخدمين المشتركين في خدمة الإشعارات من OneSignal.
            يجب أن يكون المستخدمون قد فعّلوا الإشعارات من متصفحاتهم لاستلامها.
          </p>
          {subscribersCount === 0 && (
            <Alert variant="warning" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                لا يوجد مشتركين في الإشعارات حالياً. يجب على المستخدمين تفعيل الإشعارات من متصفحاتهم أولاً.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationStats;
