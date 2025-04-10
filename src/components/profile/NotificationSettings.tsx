import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const NotificationSettings: React.FC = () => {
  const { 
    supported, 
    granted, 
    subscription, 
    subscribing,
    firebaseReady,
    requestPermission, 
    subscribeToNotifications, 
    unsubscribeFromNotifications 
  } = useNotifications();

  const [fcmTokenCount, setFcmTokenCount] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch FCM token count for current user
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      setUserId(session.user.id);
      
      try {
        // Use direct query instead of RPC
        const { data, error } = await supabase
          .from('fcm_tokens')
          .select('id')
          .eq('user_id', session.user.id);
          
        if (error) {
          console.error('Error fetching FCM token data:', error);
          return;
        }
        
        setFcmTokenCount(data?.length || 0);
      } catch (error) {
        console.error('Error fetching FCM token data:', error);
      }
    };
    
    fetchUserData();
  }, []);

  const handleSubscribe = async () => {
    try {
      console.log("Starting notification subscription process");
      
      if (Notification.permission === 'denied') {
        alert('Notifications have been denied by the browser. Please enable notifications in browser settings.');
        return;
      }
      
      if (Notification.permission !== 'granted') {
        const permission = await requestPermission();
        if (!permission) return;
      }
      
      await subscribeToNotifications();
      
      // Update FCM token count after subscription
      if (userId) {
        const { data, error } = await supabase
          .from('fcm_tokens')
          .select('id')
          .eq('user_id', userId);
          
        if (!error) {
          setFcmTokenCount(data?.length || 0);
        }
      }
    } catch (error) {
      console.error("Error during notification subscription:", error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      console.log("Starting notification unsubscription process");
      await unsubscribeFromNotifications();
      
      // Update FCM token count after unsubscription
      if (userId) {
        const { data, error } = await supabase
          .from('fcm_tokens')
          .select('id')
          .eq('user_id', userId);
          
        if (!error) {
          setFcmTokenCount(data?.length || 0);
        }
      }
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
          {Notification.permission === 'denied' && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                تم رفض الإشعارات من قبل المتصفح. يرجى السماح بالإشعارات من إعدادات المتصفح ثم المحاولة مرة أخرى.
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
              {firebaseReady && (
                <p className="text-xs text-emerald-600 mt-1">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
                  دعم Firebase نشط
                  {fcmTokenCount > 0 && ` (${fcmTokenCount} جهاز)`}
                </p>
              )}
            </div>
            {subscription ? (
              <Button
                variant="outline"
                onClick={handleUnsubscribe}
                disabled={subscribing}
              >
                {subscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <>
                    <BellOff className="h-4 w-4 ml-2" />
                    إيقاف
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleSubscribe}
                disabled={subscribing || Notification.permission === 'denied'}
              >
                {subscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <>
                    <Bell className="h-4 w-4 ml-2" />
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
