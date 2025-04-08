
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
}

export interface NotificationDataState {
  subscribersCount: number;
  users: User[];
  loading: boolean;
}

export const useNotificationData = () => {
  const [state, setState] = useState<NotificationDataState>({
    subscribersCount: 0,
    users: [],
    loading: false,
  });

  // جلب عدد المشتركين وقائمة المستخدمين عند تحميل المكون
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        // استدعاء وظيفة Edge Function لإنشاء وظيفة العد
        await supabase.functions.invoke('create-rpc');
        
        // استدعاء العدد مباشرة من قاعدة البيانات
        // استخدام any لتجاوز مشكلة الأنواع
        const { data: countData, error: countError }: { data: number | null, error: any } = await supabase.rpc(
          'count_push_subscriptions' as any
        );

        if (countError) {
          toast.error('حدث خطأ في جلب عدد المشتركين');
          console.error('خطأ في جلب عدد المشتركين:', countError);
        } else {
          setState(prev => ({
            ...prev,
            subscribersCount: countData || 0
          }));
        }

        // جلب قائمة المستخدمين
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email');

        if (userError) {
          toast.error('حدث خطأ في جلب قائمة المستخدمين');
          console.error('خطأ في جلب قائمة المستخدمين:', userError);
          return;
        }

        setState(prev => ({
          ...prev,
          users: userData || [],
          loading: false
        }));
      } catch (error) {
        console.error('خطأ غير متوقع:', error);
        toast.error('حدث خطأ غير متوقع');
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  return state;
};
