
import React from 'react';
import { Input } from '@/components/ui/input';

interface TransactionSearchProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TransactionSearch: React.FC<TransactionSearchProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <div className="mt-4">
      <Input
        placeholder="البحث حسب البريد الإلكتروني، اسم المستخدم، رقم الفاتورة..."
        value={searchTerm}
        onChange={onSearchChange}
        className="max-w-md"
      />
    </div>
  );
};

export default TransactionSearch;
