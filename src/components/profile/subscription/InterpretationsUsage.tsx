
import React, { useState, useEffect } from 'react';
import { User } from '@/types/database';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTotalInterpretations } from '@/utils/subscription';

interface InterpretationsUsageProps {
  userData: User & { dreams_count?: number } | null;
}

const InterpretationsUsage: React.FC<InterpretationsUsageProps> = ({ userData }) => {
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<{
    used: number;
    total: number | null;
    isUnlimited: boolean;
  }>({
    used: 0,
    total: null,
    isUnlimited: false
  });
  
  useEffect(() => {
    const fetchUsageData = async () => {
      if (!userData?.id) {
        setLoading(false);
        return;
      }
      
      try {
        // Get usage data
        setLoading(true);
        
        // Get total interpretations available based on plan
        const { data: pricingSettings } = await supabase
          .from('pricing_settings')
          .select('*')
          .limit(1)
          .single();
        
        if (!pricingSettings) {
          throw new Error('Failed to fetch pricing settings');
        }
        
        // Get current usage from subscription_usage table
        const { data: usageRecord } = await supabase
          .rpc('get_current_subscription_usage', { 
            user_id: userData.id 
          });
        
        // Calculate used and total interpretations
        const dreamsCount = userData.dreams_count || 0;
        
        const totalInterpretations = await getTotalInterpretations(userData, pricingSettings);
        const isUnlimited = totalInterpretations === -1;
        
        setUsageData({
          used: dreamsCount,
          total: isUnlimited ? null : totalInterpretations,
          isUnlimited: isUnlimited
        });
        
      } catch (error) {
        console.error('Error fetching usage data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsageData();
  }, [userData?.id, userData?.subscription_type, userData?.dreams_count]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-5 w-5 animate-spin ml-2" />
        <span>جاري تحميل البيانات...</span>
      </div>
    );
  }
  
  if (!userData) {
    return (
      <Alert>
        <AlertDescription>لم يتم العثور على بيانات المستخدم</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {usageData.isUnlimited ? (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">التفسيرات المستخدمة:</span>
          <span className="text-sm font-medium">{usageData.used} / غير محدود</span>
        </div>
      ) : (
        <>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">التفسيرات المستخدمة:</span>
            <span className="text-sm font-medium">{usageData.used} / {usageData.total}</span>
          </div>
          <Progress 
            value={usageData.total ? (usageData.used / usageData.total) * 100 : 0} 
            className="h-2" 
          />
          <p className="text-xs text-muted-foreground mt-1">
            {usageData.total && usageData.used >= usageData.total 
              ? 'لقد استخدمت كل التفسيرات المتاحة في باقتك الحالية' 
              : `تبقى لديك ${usageData.total ? usageData.total - usageData.used : 0} تفسيرات`
            }
          </p>
        </>
      )}
    </div>
  );
};

export default InterpretationsUsage;
