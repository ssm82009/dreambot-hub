
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

// PaymentSettings form handler
export const usePaymentSettingsHandler = () => {
  const getPaymentSettingsId = async (): Promise<string> => {
    const { data } = await supabase
      .from('payment_settings')
      .select('id')
      .limit(1)
      .single();
    return data?.id || '';
  };

  const handlePaymentSettingsSubmit = async (data: {
    paylink: {
      enabled: boolean;
      apiKey: string;
      secretKey: string;
    };
    paypal: {
      enabled: boolean;
      clientId: string;
      secret: string;
      sandbox: boolean;
    };
  }) => {
    try {
      const { error } = await supabase
        .from('payment_settings')
        .update({
          paylink_enabled: data.paylink.enabled,
          paylink_api_key: data.paylink.apiKey,
          paylink_secret_key: data.paylink.secretKey,
          paypal_enabled: data.paypal.enabled,
          paypal_client_id: data.paypal.clientId,
          paypal_secret: data.paypal.secret,
          paypal_sandbox: data.paypal.sandbox,
          updated_at: new Date().toISOString()
        })
        .eq('id', await getPaymentSettingsId());
      
      if (error) {
        console.error("خطأ في حفظ إعدادات بوابات الدفع:", error);
        toast.error("حدث خطأ أثناء حفظ إعدادات بوابات الدفع");
      } else {
        toast.success("تم حفظ إعدادات بوابات الدفع بنجاح");
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error("حدث خطأ غير متوقع");
    }
  };

  return { handlePaymentSettingsSubmit };
};
