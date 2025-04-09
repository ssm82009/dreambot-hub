
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NotificationStatsProps {
  subscribersCount: number;
  loading: boolean;
  error: string | null;
}

const NotificationStats: React.FC<NotificationStatsProps> = ({ 
  subscribersCount, 
  loading, 
  error 
}) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>إحصائيات الإشعارات</CardTitle>
        <CardDescription>تفاصيل عن المشتركين في الإشعارات</CardDescription>
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
            <span className="text-muted-foreground">عدد المشتركين</span>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {subscribersCount}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">حول الإشعارات</h4>
          <p className="text-sm text-muted-foreground">
            يمكنك إرسال إشعارات مباشرة للمستخدمين المشتركين في خدمة الإشعارات.
            يجب أن يكون المستخدمون قد فعّلوا الإشعارات من متصفحاتهم لاستلامها.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationStats;
