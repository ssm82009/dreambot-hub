
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') || '';
  
  useEffect(() => {
    const updateCancelledSession = async () => {
      if (sessionId) {
        try {
          // Get current user
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session?.user?.id) {
            console.error("No authenticated user found");
            return;
          }
          
          // تحديث حالة الفاتورة إلى "ملغي"
          const { error } = await supabase
            .from('payment_invoices')
            .update({
              status: 'ملغي'
            })
            .eq('invoice_id', sessionId)
            .eq('user_id', session.user.id);
            
          if (error) {
            console.error("Error updating payment invoice:", error);
          } else {
            console.log("Updated payment invoice status to cancelled");
          }
        } catch (error) {
          console.error("Error in payment cancellation process:", error);
        }
      }
    };
    
    updateCancelledSession();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 rtl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-red-300 text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">تم إلغاء عملية الدفع</h1>
            <p className="mb-6 text-gray-600">
              لقد تم إلغاء عملية الدفع. لم يتم خصم أي مبلغ من حسابك.
            </p>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/pricing')}
              >
                العودة لصفحة الأسعار
              </Button>
              <Button 
                className="w-full" 
                onClick={() => navigate('/')}
              >
                العودة للصفحة الرئيسية
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCancel;
