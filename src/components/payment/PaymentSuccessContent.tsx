
import React from 'react';
import PaymentVerificationLoader from './success/PaymentVerificationLoader';
import PaymentSuccessCard from './success/PaymentSuccessCard';
import { useSubscriptionName } from './success/useSubscriptionName';
import { usePaymentStatus } from './success/usePaymentStatus';
import { useDisplayPlan } from './success/useDisplayPlan';

interface PaymentSuccessContentProps {
  transactionIdentifier: string;
  isVerified?: boolean;
  isVerifying?: boolean;
  paymentData?: any;
  paymentSession?: any;
}

const PaymentSuccessContent = ({ 
  transactionIdentifier, 
  isVerified = false, 
  isVerifying = false,
  paymentData,
  paymentSession
}: PaymentSuccessContentProps) => {
  // Custom hooks for different functionalities
  const { subscriptionName } = useSubscriptionName(paymentSession, paymentData);
  const { updateSuccess, normalizedStatus } = usePaymentStatus(paymentData, transactionIdentifier);
  const { getDisplayPlan } = useDisplayPlan(subscriptionName, paymentData, paymentSession);
  
  const planName = getDisplayPlan();
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-green-500 text-center">
        {isVerifying ? (
          <PaymentVerificationLoader />
        ) : (
          <PaymentSuccessCard
            paymentData={paymentData}
            transactionIdentifier={transactionIdentifier}
            planName={planName}
            normalizedStatus={normalizedStatus}
            isVerified={isVerified}
            updateSuccess={updateSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessContent;
