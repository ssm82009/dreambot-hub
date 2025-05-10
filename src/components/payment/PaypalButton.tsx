
import React, { useEffect, useRef, useState } from 'react';
import { loadScript } from '@paypal/paypal-js';
import { Loader2 } from 'lucide-react';
import { sarToUsd } from '@/utils/currency';

interface PaypalButtonProps {
  amount: number;
  onApprove: (data: any) => void;
  onError: (error: any) => void;
  isDisabled?: boolean;
  clientId: string;
  sandbox?: boolean;
}

const PaypalButton: React.FC<PaypalButtonProps> = ({
  amount,
  onApprove,
  onError,
  isDisabled = false,
  clientId,
  sandbox = true
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // تحويل المبلغ من الريال السعودي إلى الدولار الأمريكي
  const usdAmount = sarToUsd(amount);

  useEffect(() => {
    if (!clientId || isDisabled) return;

    const initPayPal = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (paypalRef.current) {
          paypalRef.current.innerHTML = '';
        }

        // تحميل سكربت PayPal بالخيارات الصحيحة وفقًا للأنواع
        const paypal = await loadScript({
          clientId,
          currency: "USD",
          intent: "capture",
          dataClientToken: "abc123xyz",
          enableFunding: 'paypal',
          disableFunding: 'paylater,venmo,card',
          dataSdkIntegrationSource: 'button-factory',
          components: "buttons",
          ...(sandbox ? { buyerCountry: 'US' } : {})
        });

        if (paypal && paypal.Buttons && paypalRef.current) {
          const buttons = paypal.Buttons({
            style: {
              shape: 'rect',
              color: 'gold',
              layout: 'vertical',
              label: 'paypal',
              height: 40
            },
            
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: usdAmount.toString(),
                    currency_code: 'USD'
                  }
                }]
              });
            },
            
            onApprove: async (data: any, actions: any) => {
              try {
                const orderDetails = await actions.order.capture();
                console.log("PayPal transaction completed:", orderDetails);
                onApprove({
                  orderId: orderDetails.id,
                  payerId: orderDetails.payer.payer_id,
                  status: orderDetails.status,
                  ...data
                });
              } catch (error) {
                console.error("Error capturing PayPal order:", error);
                onError(error);
              }
            },
            
            onError: (err: any) => {
              console.error("PayPal error:", err);
              setError("حدث خطأ في معالجة PayPal. يرجى المحاولة مرة أخرى.");
              onError(err);
            }
          });
          
          if (buttons.isEligible()) {
            await buttons.render(paypalRef.current);
          } else {
            setError("PayPal غير متاح في منطقتك أو متصفحك.");
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to load PayPal JS SDK:", error);
        setError("فشل تحميل واجهة برمجة تطبيقات PayPal");
        setLoading(false);
        onError(error);
      }
    };

    initPayPal();
  }, [clientId, amount, onApprove, onError, isDisabled, usdAmount, sandbox]);

  if (isDisabled) {
    return null;
  }

  return (
    <div className="w-full mt-4">
      {loading && (
        <div className="flex justify-center items-center p-4 border border-gray-200 rounded bg-gray-50">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>جاري تحميل PayPal...</span>
        </div>
      )}
      
      {error && (
        <div className="p-3 text-center text-red-700 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      <div 
        ref={paypalRef} 
        className={`paypal-button-container ${loading ? 'hidden' : 'block'}`}
        style={{ minHeight: loading ? '0' : '150px' }}
      />
    </div>
  );
};

export default PaypalButton;
