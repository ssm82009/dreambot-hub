
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePaymentProcess() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paylinkApiKey, setPaylinkApiKey] = useState<string>('');
  const [paylinkSecretKey, setPaylinkSecretKey] = useState<string>('');
  const [paypalClientId, setPaypalClientId] = useState<string>('');
  const [paypalSandbox, setPaypalSandbox] = useState<boolean>(false);
  const [paypalSecret, setPaypalSecret] = useState<string>('');

  useEffect(() => {
    // استرجاع إعدادات الدفع من النظام
    const fetchPaymentSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_settings')
          .select('*')
          .limit(1)
          .single();

        if (error) {
          console.error("خطأ في جلب إعدادات الدفع:", error);
          return;
        }

        if (data) {
          // إعدادات PayLink
          if (data.paylink_enabled) {
            if (data.paylink_api_key && data.paylink_secret_key) {
              setPaylinkApiKey(data.paylink_api_key);
              setPaylinkSecretKey(data.paylink_secret_key);
              console.log("تم تحميل بيانات اعتماد PayLink بنجاح");
            } else {
              console.warn("بيانات اعتماد PayLink غير متوفرة");
            }
          }

          // إعدادات PayPal
          if (data.paypal_enabled) {
            if (data.paypal_client_id) {
              setPaypalClientId(data.paypal_client_id);
              setPaypalSandbox(data.paypal_sandbox);
              setPaypalSecret(data.paypal_secret || '');
              console.log("تم تحميل بيانات اعتماد PayPal بنجاح");
            } else {
              console.warn("بيانات اعتماد PayPal غير متوفرة");
            }
          }
        }
      } catch (error) {
        console.error("خطأ غير متوقع:", error);
      }
    };

    fetchPaymentSettings();
  }, []);

  return {
    isProcessing,
    setIsProcessing,
    paylinkApiKey,
    paylinkSecretKey,
    paypalClientId,
    paypalSandbox,
    paypalSecret
  };
}
