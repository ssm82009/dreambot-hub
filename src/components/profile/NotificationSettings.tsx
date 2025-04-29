
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const NotificationSettings: React.FC = () => {
  const { 
    supported, 
    granted, 
    subscription, 
    subscribing,
    requestPermission, 
    subscribeToNotifications, 
    unsubscribeFromNotifications 
  } = useNotifications();

  const handleSubscribe = async () => {
    try {
      console.log("Starting notification subscription process");
      
      if (!supported) {
        alert('متصفحك لا يدعم الإشعارات');
        return;
      }
      
      if (!granted) {
        const permission = await requestPermission();
        if (!permission) return;
      }
      
      await subscribeToNotifications();
    } catch (error) {
      console.error("Error during notification subscription:", error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      console.log("Starting notification unsubscription process");
      await unsubscribeFromNotifications();
    } catch (error) {
      console.error("Error during notification unsubscription:", error);
    }
  };

  if (!supported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>إشعارات التطبيق</CardTitle>
          <CardDescription>إعدادات الإشعارات والتنبيهات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="p-4 border rounded-lg bg-muted/10">
              <p className="text-center text-muted-foreground">
                متصفحك لا يدعم الإشعارات
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إشعارات التطبيق</CardTitle>
        <CardDescription>
          إعدادات إشعارات الحساب والتنبيهات المهمة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {!granted && !subscription && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                يرجى تفعيل الإشعارات للحصول على تحديثات مهمة حول حسابك وطلباتك.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium">الإشعارات الفورية</h3>
                {subscription ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    مفعلة
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    غير مفعلة
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                استلام إشعارات حول حالة الاشتراك، التذاكر، والمدفوعات
              </p>
            </div>
            {subscription ? (
              <Button
                variant="outline"
                onClick={handleUnsubscribe}
                disabled={subscribing}
              >
                {subscribing ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <BellOff className="ml-2 h-4 w-4" />
                    إيقاف
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleSubscribe}
                disabled={subscribing}
              >
                {subscribing ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Bell className="ml-2 h-4 w-4" />
                    تفعيل
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="p-4 border rounded-lg bg-muted/10">
            <h4 className="font-medium mb-2">الإشعارات التي ستصلك:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                تأكيد عمليات الدفع والاشتراك
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                تذكير بانتهاء الاشتراك
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                الردود على تذاكر الدعم
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
