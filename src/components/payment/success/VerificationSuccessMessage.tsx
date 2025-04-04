
import React from 'react';

interface VerificationSuccessMessageProps {
  isVerified: boolean;
  updateSuccess: boolean;
}

const VerificationSuccessMessage = ({ isVerified, updateSuccess }: VerificationSuccessMessageProps) => {
  if (!isVerified && !updateSuccess) return null;
  
  return (
    <div className="mt-4 p-3 bg-green-50 rounded text-green-700 text-sm">
      تم التحقق من حالة الاشتراك وتفعيله بنجاح
    </div>
  );
};

export default VerificationSuccessMessage;
