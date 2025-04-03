
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from '@/types/database';
import { getSubscriptionStatus } from '@/components/admin/user/SubscriptionBadge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';

interface ProfileSubscriptionProps {
  userData: User & {
    dreams_count: number;
  };
}

const ProfileSubscription: React.FC<ProfileSubscriptionProps> = ({ userData }) => {
  const navigate = useNavigate();
  const [pricingSettings, setPricingSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usedInterpretations, setUsedInterpretations] = useState(0);
  
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
  }, [userData?.id]);
  
  const subscriptionStatus = getSubscriptionStatus(userData);
  
  // Get subscription name in Arabic
  const getSubscriptionName = () => {
    switch (userData?.subscription_type?.toLowerCase()) {
      case 'premium':
        return 'الباقة المميزة';
      case 'pro':
        return 'الباقة الاحترافية';
      default:
        return 'الباقة المجانية';
    }
  };
  
  console.log("ProfileSubscription - User data:", userData);
  console.log("ProfileSubscription - Subscription status:", subscriptionStatus);
  
  // Calculate remaining interpretations based on the subscription type
  const getTotalInterpretations = () => {
    if (!pricingSettings) return 0;
    
    switch (userData?.subscription_type) {
      case 'premium':
        return pricingSettings.premium_plan_interpretations;
      case 'pro':
        return pricingSettings.pro_plan_interpretations;
      default:
        return pricingSettings.free_plan_interpretations;
    }
  };
  
  const totalInterpretations = getTotalInterpretations();
  // If total is -1, it means unlimited
  const isUnlimited = totalInterpretations === -1;
  
  // Remaining interpretations
  const remainingInterpretations = isUnlimited ? -1 : Math.max(0, totalInterpretations - usedInterpretations);
  
  // Progress percentage
  const progressPercentage = isUnlimited ? 100 : Math.min(100, (usedInterpretations / totalInterpretations) * 100);
  
  const formatPlanFeatures = (featuresText: string) => {
    return featuresText.split('\n').filter(line => line.trim() !== '');
  };
  
  const getCurrentPlanFeatures = () => {
    if (!pricingSettings) return [];
    
    switch (userData?.subscription_type) {
      case 'premium':
        return formatPlanFeatures(pricingSettings.premium_plan_features);
      case 'pro':
        return formatPlanFeatures(pricingSettings.pro_plan_features);
      default:
        return formatPlanFeatures(pricingSettings.free_plan_features);
    }
  };
  
  const handleUpgrade = () => {
    navigate('/pricing');
  };
  
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
            <h3 className="text-lg font-medium">تفاصيل الاشتراك الحالي</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">نوع الاشتراك:</span>
                <span className="font-medium">
                  {getSubscriptionName()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">حالة الاشتراك:</span>
                <span className="font-medium">
                  {subscriptionStatus.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
              
              {userData?.subscription_expires_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ انتهاء الاشتراك:</span>
                  <span className="font-medium">{formatDate(userData.subscription_expires_at)}</span>
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <h4 className="font-medium mb-3">المميزات المتاحة:</h4>
              <ul className="space-y-2">
                {getCurrentPlanFeatures().map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 ml-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium">التفسيرات المتاحة</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">التفسيرات المستخدمة:</span>
                  <span className="font-medium">
                    {isUnlimited ? 
                      `${usedInterpretations} / غير محدود` : 
                      `${usedInterpretations} / ${totalInterpretations}`}
                  </span>
                </div>
                
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">التفسيرات المتبقية:</span>
                <span className="font-medium">{isUnlimited ? 'غير محدود' : remainingInterpretations}</span>
              </div>
            </div>
            
            {!subscriptionStatus.isActive || userData?.subscription_type === 'free' ? (
              <div className="pt-4">
                <div className="bg-primary/10 p-4 rounded-md mb-4">
                  <p className="text-sm">
                    قم بترقية اشتراكك للحصول على مزيد من التفسيرات والمميزات الإضافية.
                  </p>
                </div>
                
                <Button onClick={handleUpgrade} className="w-full">
                  ترقية الاشتراك
                </Button>
              </div>
            ) : null}
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
