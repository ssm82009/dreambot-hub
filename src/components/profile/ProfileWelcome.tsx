
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/types/database';
import SubscriptionBadge from '@/components/admin/user/SubscriptionBadge';
import { formatDate } from '@/lib/utils';
import { getSubscriptionStatus } from '@/components/admin/user/SubscriptionBadge';
import { getSubscriptionName } from '@/utils/subscription';
import { supabase } from '@/integrations/supabase/client';

interface ProfileWelcomeProps {
  userData: User & {
    dreams_count: number;
    email: string;
  };
}

const ProfileWelcome: React.FC<ProfileWelcomeProps> = ({ userData }) => {
  const [subscriptionName, setSubscriptionName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchSubscriptionName = async () => {
      if (userData?.subscription_type) {
        try {
          // Fetch pricing settings
          const { data: settings } = await supabase
            .from('pricing_settings')
            .select('*')
            .limit(1)
            .single();
            
          const name = await getSubscriptionName(userData.subscription_type, settings);
          setSubscriptionName(name);
        } catch (error) {
          console.error('Error getting subscription name:', error);
          const name = await getSubscriptionName(userData.subscription_type);
          setSubscriptionName(name);
        } finally {
          setLoading(false);
        }
      } else {
        // Default to free plan
        try {
          const { data: settings } = await supabase
            .from('pricing_settings')
            .select('free_plan_name')
            .limit(1)
            .single();
            
          setSubscriptionName(settings?.free_plan_name || 'الباقة المجانية');
        } catch (error) {
          setSubscriptionName('الباقة المجانية');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchSubscriptionName();
  }, [userData?.subscription_type]);
  
  // Add a safety check for null userData
  if (!userData) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center p-4">
            <p className="text-muted-foreground">جاري تحميل بيانات الملف الشخصي...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Get subscription status
  const subscriptionStatus = getSubscriptionStatus(userData);

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">مرحباً، {userData.full_name || 'مستخدم'}</h3>
            <p className="text-muted-foreground mb-4">{userData.email}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">نوع العضوية:</span>
                <span className="font-medium">{userData.role === 'admin' ? 'مشرف' : 'مستخدم'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">الباقة:</span>
                <SubscriptionBadge user={userData} />
              </div>
              
              {userData.subscription_expires_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ انتهاء الباقة:</span>
                  <span className="font-medium">{formatDate(userData.subscription_expires_at)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد الأحلام المسجلة:</span>
                <span className="font-medium">{userData.dreams_count}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center md:justify-end">
            <div className="text-center md:text-right space-y-2">
              <h4 className="text-lg font-medium">ملخص الحساب</h4>
              <p className="text-muted-foreground">
                تاريخ الانضمام: {formatDate(userData.created_at)}
              </p>
              
              {subscriptionStatus.isActive && userData.subscription_type && userData.subscription_type !== 'free' ? (
                <div className="mt-4 p-3 bg-primary/10 rounded-md">
                  <p className="font-medium text-primary">
                    {loading ? 
                      'جاري تحميل معلومات الباقة...' : 
                      `أنت مشترك في ${subscriptionName}`
                    }
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="font-medium">
                    {loading ? 
                      'جاري تحميل معلومات الباقة...' : 
                      `أنت مشترك في ${subscriptionName}`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileWelcome;
