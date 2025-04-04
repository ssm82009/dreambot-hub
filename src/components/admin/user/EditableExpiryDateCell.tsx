
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface EditableExpiryDateCellProps {
  value: string | null;
  onSave: (newValue: string | null) => Promise<void>;
}

const EditableExpiryDateCell: React.FC<EditableExpiryDateCellProps> = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const newValue = date ? date.toISOString() : null;
    const oldValue = value;
    
    if (newValue !== oldValue) {
      setIsLoading(true);
      try {
        await onSave(newValue);
        setIsLoading(false);
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving date:', error);
        setIsLoading(false);
        setDate(oldValue ? new Date(oldValue) : undefined);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDate(value ? new Date(value) : undefined);
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    setIsCalendarOpen(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Input
              value={formattedDate || ''}
              readOnly
              className="h-8 w-full cursor-pointer"
              onClick={() => setIsCalendarOpen(true)}
              placeholder="اختر التاريخ"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              locale={ar}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          <button
            onClick={handleSave}
            className="p-1 text-green-600 hover:text-green-800 rounded-sm"
            disabled={isLoading}
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-red-600 hover:text-red-800 rounded-sm"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleEdit}
      className="cursor-pointer py-1 px-2 -mx-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {displayExpiryDate(value)}
    </div>
  );
};

// دالة لعرض تاريخ انتهاء الاشتراك بتنسيق مناسب
const displayExpiryDate = (dateString: string | null) => {
  if (!dateString) return 'غير محدد';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'تاريخ غير صالح';
    
    const now = new Date();
    const isExpired = date < now;
    
    const formattedDate = format(date, 'yyyy-MM-dd', { locale: ar });
    
    if (isExpired) {
      return <span className="text-red-600">{formattedDate} (منتهي)</span>;
    }
    
    return formattedDate;
  } catch (error) {
    return 'تاريخ غير صالح';
  }
};

export default EditableExpiryDateCell;
