
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';

interface SeoSubmitButtonProps {
  isUpdating: boolean;
  isSuccess: boolean;
}

const SeoSubmitButton: React.FC<SeoSubmitButtonProps> = ({ isUpdating, isSuccess }) => {
  return (
    <Button type="submit" className="w-full md:w-auto" disabled={isUpdating}>
      {isUpdating ? (
        <>
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          جاري الحفظ...
        </>
      ) : isSuccess ? (
        <>
          <Check className="ml-2 h-4 w-4" />
          تم الحفظ
        </>
      ) : (
        'حفظ الإعدادات'
      )}
    </Button>
  );
};

export default SeoSubmitButton;
