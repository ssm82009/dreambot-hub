
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentDetails from './PaymentDetails';
import PaymentForm from './PaymentForm';
import PaymentActions from './PaymentActions';
import PaymentMethod from './PaymentMethod';
import PaypalButton from './PaypalButton';
import { CustomerInfo } from '@/types/payment';
import { handlePaypalApproval } from '@/services/paypal/paypalPayment';
import { supabase } from '@/integrations/supabase/client';

interface PaymentCardProps {
  plan: string;
  amount: number;
  onPayment: (customerInfo: CustomerInfo) => void;
  isProcessing: boolean;
}

const PaymentCard = ({ plan, amount, onPayment, isProcessing }: PaymentCardProps) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'paylink'
  });
  const [paypalConfig, setPaypalConfig] = useState<{
    clientId: string;
    sandbox: boolean;
    sessionId: string;
  } | null>(null);

  const handleCustomerInfoChange = (info: CustomerInfo) => {
    setCustomerInfo(info);
  };

  const handlePaymentMethodChange = (method: string) => {
    setCustomerInfo(prevInfo => ({
      ...prevInfo,
      paymentMethod: method
    }));
  };

  const handlePayment = async () => {
    if (customerInfo.paymentMethod === 'paypal') {
      try {
        // إعداد معلومات PayPal
        const { data: paymentSettings } = await supabase
          .from('payment_settings')
          .select('paypal_client_id, paypal_sandbox')
          .single();
          
        if (!paymentSettings?.paypal_client_id) {
          throw new Error("لم يتم تكوين إعدادات PayPal");
        }
        
        // إنشاء معرف جلسة دفع جديد
        const { data: { user } } = await supabase.auth.getUser();
        const sessionId = `PAYPAL-${Date.now()}`;
        
        // إنشاء سجل دفع أولي
        const { error: invoiceError } = await supabase
          .from('payment_invoices')
          .insert({
            invoice_id: sessionId,
            user_id: user?.id,
            plan_name: plan,
            amount: amount,
            status: 'Pending',
            payment_method: 'paypal'
          });
          
        if (invoiceError) {
          throw new Error("فشل في إنشاء سجل الدفع");
        }
        
        // تكوين PayPal
        setPaypalConfig({
          clientId: paymentSettings.paypal_client_id,
          sandbox: paymentSettings.paypal_sandbox || false,
          sessionId: sessionId
        });
      } catch (error) {
        console.error("خطأ في إعداد PayPal:", error);
      }
    } else {
      // استخدام الطريقة التقليدية لـ PayLink
      onPayment(customerInfo);
    }
  };
  
  const handlePaypalApprove = async (data: any) => {
    if (!paypalConfig?.sessionId) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    await handlePaypalApproval(
      data,
      user?.id,
      amount,
      plan,
      paypalConfig.sessionId
    );
  };
  
  const handlePaypalError = (error: any) => {
    console.error("PayPal error:", error);
  };

  // التحقق من صحة بيانات العميل
  const isFormValid = 
    amount === 0 || 
    customerInfo.paymentMethod === 'paypal' || 
    (customerInfo.name.trim() !== '' && 
     customerInfo.email.trim() !== '' && 
     customerInfo.phone.trim() !== '');

  return (
    <Card className="max-w-2xl mx-auto border-2 border-primary/50 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">تفاصيل الدفع</CardTitle>
        <CardDescription>يرجى مراجعة تفاصيل اشتراكك قبل المتابعة</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 1. نوع الباقة والمبلغ */}
        <PaymentDetails 
          plan={plan} 
          amount={amount} 
        />
        
        {amount > 0 && (
          <>
            {/* 2. اختيار طريقة الدفع */}
            <div className="border-t pt-4">
              <PaymentMethod 
                selectedMethod={customerInfo.paymentMethod} 
                onMethodChange={handlePaymentMethodChange} 
                availableMethods={[
                  { id: 'paylink', name: 'بطاقة بنكية', description: 'بطاقة الدفع الإلكتروني (مدى، فيزا، ماستركارد، أبل باي، stcPay)', enabled: true },
                  { id: 'paypal', name: 'PayPal', description: 'الدفع عبر حساب PayPal', enabled: true }
                ]}
              />
            </div>
            
            {/* 3. ادخال بيانات العميل - فقط إذا كانت طريقة الدفع هي بطاقة */}
            {customerInfo.paymentMethod === 'paylink' && (
              <div className="border-t pt-4">
                <PaymentForm onCustomerInfoChange={handleCustomerInfoChange} />
              </div>
            )}
            
            {/* عرض زر PayPal إذا تم تكوينه */}
            {customerInfo.paymentMethod === 'paypal' && paypalConfig && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-center mb-4">إكمال الدفع باستخدام PayPal</h3>
                <PaypalButton 
                  amount={amount}
                  onApprove={handlePaypalApprove}
                  onError={handlePaypalError}
                  clientId={paypalConfig.clientId}
                  sandbox={paypalConfig.sandbox}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        {/* 4. زر العودة أو اتمام الدفع */}
        <PaymentActions 
          amount={amount} 
          onPayment={handlePayment} 
          isDisabled={!isFormValid || isProcessing || (customerInfo.paymentMethod === 'paypal' && paypalConfig !== null)}
          isProcessing={isProcessing}
          paymentMethod={customerInfo.paymentMethod}
          showPaypalButton={customerInfo.paymentMethod === 'paypal' && paypalConfig === null}
        />
      </CardFooter>
    </Card>
  );
};

export default PaymentCard;
