import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { normalizePlanType, PAYMENT_STATUS, normalizePaymentStatus } from '@/utils/payment/statusNormalizer';

interface TransactionEditFormProps {
  transaction: any;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TransactionEditForm: React.FC<TransactionEditFormProps> = ({ transaction, open, onClose, onSuccess }) => {
  const [formState, setFormState] = useState({
    plan_name: transaction?.plan_name || '',
    payment_method: transaction?.payment_method || '',
    status: transaction?.status || '',
    expires_at: transaction?.expires_at ? new Date(transaction.expires_at) : undefined,
    isLoading: false,
  });

  const [planOptions, setPlanOptions] = useState<{ value: string; label: string }[]>([
    { value: 'free', label: 'المجانية' },
    { value: 'premium', label: 'المميزة' },
    { value: 'pro', label: 'الاحترافية' },
  ]);

  useEffect(() => {
    const fetchPlanNames = async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_settings')
          .select('free_plan_name, premium_plan_name, pro_plan_name')
          .limit(1)
          .single();

        if (error) throw error;

        if (data) {
          setPlanOptions([
            { value: 'free', label: data.free_plan_name || 'المجانية' },
            { value: 'premium', label: data.premium_plan_name || 'المميزة' },
            { value: 'pro', label: data.pro_plan_name || 'الاحترافية' },
          ]);
        }
      } catch (error) {
        console.error('❌ Error fetching plan names:', error);
      }
    };

    fetchPlanNames();
  }, []);

  useEffect(() => {
    setFormState({
      plan_name: transaction?.plan_name || '',
      payment_method: transaction?.payment_method || '',
      status: transaction?.status || '',
      expires_at: transaction?.expires_at ? new Date(transaction.expires_at) : undefined,
      isLoading: false,
    });
  }, [transaction]);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDateChange = useCallback((date: Date | undefined) => {
    setFormState((prev) => ({ ...prev, expires_at: date }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState((prev) => ({ ...prev, isLoading: true }));

    if (!transaction?.id) {
      toast.error('⚠ لا يوجد معرّف للمعاملة!');
      return;
    }

    try {
      const normalizedStatus = normalizePaymentStatus(formState.status);
      console.log('🚀 Updating transaction:', { ...formState, normalizedStatus });

      const { data, error } = await supabase
        .from('payment_invoices')
        .update({
          plan_name: formState.plan_name,
          payment_method: formState.payment_method,
          status: normalizedStatus,
          expires_at: formState.expires_at ? formState.expires_at.toISOString() : null,
        })
        .eq('id', transaction.id);

      if (error) throw error;

      if (transaction.user_id && normalizedStatus === PAYMENT_STATUS.PAID) {
        const expiryDate = formState.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const { error: userError } = await supabase
          .from('users')
          .update({
            subscription_type: formState.plan_name,
            subscription_expires_at: expiryDate.toISOString(),
          })
          .eq('id', transaction.user_id);

        if (userError) {
          console.error('❌ Error updating user subscription:', userError);
          toast.error('تم تحديث المعاملة ولكن فشل تحديث اشتراك المستخدم');
        }
      }

      toast.success('✅ تم تحديث المعاملة بنجاح');
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error updating transaction:', error);
      toast.error('حدث خطأ أثناء تحديث المعاملة');
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby="dialog-description" className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تعديل تفاصيل المعاملة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="plan_name">الباقة</Label>
              <Select value={formState.plan_name} onValueChange={(value) => handleSelectChange('plan_name', value)}>
                <SelectTrigger id="plan_name">
                  <SelectValue placeholder="اختر نوع الباقة" />
                </SelectTrigger>
                <SelectContent>
                  {planOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment_method">طريقة الدفع</Label>
              <Select value={formState.payment_method} onValueChange={(value) => handleSelectChange('payment_method', value)}>
                <SelectTrigger id="payment_method">
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paylink">باي لينك</SelectItem>
                  <SelectItem value="paypal">باي بال</SelectItem>
                  <SelectItem value="manual">يدوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expires_at">تاريخ انتهاء الاشتراك</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-right">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {formState.expires_at ? format(formState.expires_at, 'yyyy/MM/dd') : <span>اختر تاريخ</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={formState.expires_at} onSelect={handleDateChange} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={formState.isLoading}>
              {formState.isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionEditForm;
