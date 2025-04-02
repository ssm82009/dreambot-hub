
import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type ExpiryDateProps = {
  expiryDate: string | null;
};

export const formatExpiryDate = (dateString: string | null) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ar });
  } catch (error) {
    return '-';
  }
};

const ExpiryDate: React.FC<ExpiryDateProps> = ({ expiryDate }) => {
  return (
    <div className="flex items-center gap-1">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span>{formatExpiryDate(expiryDate)}</span>
    </div>
  );
};

export default ExpiryDate;
