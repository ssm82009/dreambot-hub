
import React from 'react';

interface TransactionIdentifierProps {
  transactionIdentifier: string;
}

const TransactionIdentifier = ({ transactionIdentifier }: TransactionIdentifierProps) => {
  if (!transactionIdentifier) return null;
  
  return (
    <p className="mb-6 text-sm text-gray-500">
      رقم العملية: {transactionIdentifier}
    </p>
  );
};

export default TransactionIdentifier;
