
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function usePaymentData() {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    // التحقق من أن المستخدم وصل للصفحة عن طريق صفحة الأسعار
    if (!location.state || !location.state.plan || !location.state.price) {
      navigate('/pricing');
      return;
    }

    // تعيين الخطة والمبلغ بناءً على البيانات المرسلة من صفحة الأسعار
    const selectedPlan = location.state.plan;
    const selectedPrice = location.state.price;
    
    setPlan(selectedPlan);
    setAmount(selectedPrice);
    
    console.log(`تم اختيار الباقة: ${selectedPlan} بسعر: ${selectedPrice} ريال`);
  }, [location, navigate]);

  return { plan, amount };
}
