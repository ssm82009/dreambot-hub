
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types/database';
import { getSubscriptionStatus } from '@/utils/subscriptionStatus';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';
import SubscriptionDetails from './subscription/SubscriptionDetails';
import PlanFeatures from './subscription/PlanFeatures';
import InterpretationsUsage from './subscription/InterpretationsUsage';
import UpgradeSection from './subscription/UpgradeSection';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileSubscriptionProps {
  userData: (User & {
    dreams_count: number;
  }) | null;
}

const ProfileSubscription: React.FC<ProfileSubscriptionProps> = ({ userData }) => {
  const [pricingSettings, setPricingSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPricingSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_settings')
          .select('*')
          .limit(1)
          .single();
          
        if (error) throw error;
        setPricingSettings(data);
      } catch (error) {
        console.error('Error fetching pricing settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Debug log
    console.log("ProfileSubscription - User data:", userData);
    
    fetchPricingSettings();
  }, [userData?.id]);
  
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2">جاري تحميل معلومات الاشتراك...</span>
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>معلومات الاشتراك</CardTitle>
          <CardDescription>
            تفاصيل اشتراكك الحالي وحدود التفسيرات المتاحة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى أو التواصل مع الدعم الفني.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  const subscriptionStatus = getSubscriptionStatus(userData);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>معلومات الاشتراك</CardTitle>
        <CardDescription>
          تفاصيل اشتراكك الحالي وحدود التفسيرات المتاحة
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SubscriptionDetails userData={userData} pricingSettings={pricingSettings} />
            <PlanFeatures userData={userData} pricingSettings={pricingSettings} />
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium">التفسيرات المتاحة</h3>
            
            <InterpretationsUsage 
              userData={userData}
            />
            
            <UpgradeSection userData={userData} />
          </div>
        </div>
      </CardContent>
      
      {subscriptionStatus.isActive && userData?.subscription_type !== 'free' && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            يتجدد اشتراكك تلقائياً في {userData.subscription_expires_at ? formatDate(userData.subscription_expires_at) : 'تاريخ غير محدد'}
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProfileSubscription;
