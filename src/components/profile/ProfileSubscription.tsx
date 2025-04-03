
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types/database';
import { getSubscriptionStatus } from '@/components/admin/user/SubscriptionBadge';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';
import SubscriptionDetails from './subscription/SubscriptionDetails';
import PlanFeatures from './subscription/PlanFeatures';
import InterpretationsUsage from './subscription/InterpretationsUsage';
import UpgradeSection from './subscription/UpgradeSection';

interface ProfileSubscriptionProps {
  userData: User & {
    dreams_count: number;
  };
}

const ProfileSubscription: React.FC<ProfileSubscriptionProps> = ({ userData }) => {
  const [pricingSettings, setPricingSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usedInterpretations, setUsedInterpretations] = useState(0);
  const subscriptionStatus = getSubscriptionStatus(userData);
  
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
    
    const fetchDreamsCount = async () => {
      if (!userData?.id) return;
      try {
        const { count, error } = await supabase
          .from('dreams')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userData.id);
          
        if (error) throw error;
        setUsedInterpretations(count || 0);
      } catch (error) {
        console.error('Error fetching dreams count:', error);
      }
    };
    
    fetchPricingSettings();
    fetchDreamsCount();
    
    // Debug log
    console.log("ProfileSubscription - User data:", userData);
  }, [userData?.id]);
  
  if (loading) {
    return <div className="text-center p-8">جاري تحميل معلومات الاشتراك...</div>;
  }
  
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
            <SubscriptionDetails userData={userData} />
            <PlanFeatures userData={userData} pricingSettings={pricingSettings} />
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium">التفسيرات المتاحة</h3>
            
            <InterpretationsUsage 
              userData={userData} 
              pricingSettings={pricingSettings} 
              usedInterpretations={usedInterpretations} 
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
