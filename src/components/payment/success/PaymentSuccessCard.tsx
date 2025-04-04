
import React from 'react';
import PaymentSuccessHeader from './PaymentSuccessHeader';
import PaymentSuccessMessage from './PaymentSuccessMessage';
import PaymentDetailsCard from './PaymentDetailsCard';
import TransactionIdentifier from './TransactionIdentifier';
import ProfileNavigationButton from './ProfileNavigationButton';
import VerificationSuccessMessage from './VerificationSuccessMessage';

interface PaymentData {
  invoice_id: string;
  amount: number;
  status: string;
  plan_name: string;
}

interface PaymentSuccessCardProps {
  paymentData: PaymentData | null;
  transactionIdentifier: string;
  planName: string;
  normalizedStatus: string;
  isVerified: boolean;
  updateSuccess: boolean;
}

const PaymentSuccessCard = ({
  paymentData,
  transactionIdentifier,
  planName,
  normalizedStatus,
  isVerified,
  updateSuccess
}: PaymentSuccessCardProps) => {
  return (
    <>
      <PaymentSuccessHeader />
      <PaymentSuccessMessage planName={planName} />
      
      <PaymentDetailsCard 
        paymentData={paymentData} 
        planName={planName} 
        normalizedStatus={normalizedStatus} 
      />
      
      {!paymentData && <TransactionIdentifier transactionIdentifier={transactionIdentifier} />}
      
      <div className="space-y-3">
        <ProfileNavigationButton />
      </div>
      
      <VerificationSuccessMessage isVerified={isVerified} updateSuccess={updateSuccess} />
    </>
  );
};

export default PaymentSuccessCard;
