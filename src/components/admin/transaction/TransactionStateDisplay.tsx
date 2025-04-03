
import React from 'react';
import { Loader2 } from 'lucide-react';

interface TransactionStateDisplayProps {
  loading: boolean;
  isEmpty: boolean;
  searchTerm: string;
}

const TransactionStateDisplay: React.FC<TransactionStateDisplayProps> = ({ 
  loading, 
  isEmpty, 
  searchTerm 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isEmpty) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {searchTerm ? 'لا توجد نتائج تطابق البحث' : 'لا توجد معاملات مسجلة'}
      </div>
    );
  }
  
  return null;
};

export default TransactionStateDisplay;
