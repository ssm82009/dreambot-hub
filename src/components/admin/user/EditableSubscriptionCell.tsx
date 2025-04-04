
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditableSubscriptionCellProps {
  value: string | null;
  onSave: (newValue: string) => Promise<void>;
}

const EditableSubscriptionCell: React.FC<EditableSubscriptionCellProps> = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || 'free');
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editValue !== value) {
      setIsLoading(true);
      try {
        await onSave(editValue);
        setIsLoading(false);
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving value:', error);
        setIsLoading(false);
        setEditValue(value || 'free');
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value || 'free');
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Select
          value={editValue}
          onValueChange={setEditValue}
          disabled={isLoading}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="نوع الاشتراك" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">مجاني</SelectItem>
            <SelectItem value="premium">مميز</SelectItem>
            <SelectItem value="pro">احترافي</SelectItem>
          </SelectContent>
        </Select>
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
      className="cursor-pointer py-1 px-2 -mx-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
    >
      <SubscriptionBadge subscriptionType={value} />
    </div>
  );
};

// نستخدم نفس مكون عرض الاشتراك الموجود مسبقًا
const SubscriptionBadge = ({ subscriptionType }: { subscriptionType: string | null }) => {
  let badgeClass = "px-2 py-1 text-xs rounded-full";
  let badgeText = "غير محدد";

  switch (subscriptionType) {
    case "premium":
      badgeClass += " bg-amber-100 text-amber-800";
      badgeText = "مميز";
      break;
    case "pro":
      badgeClass += " bg-purple-100 text-purple-800";
      badgeText = "احترافي";
      break;
    case "free":
    default:
      badgeClass += " bg-gray-100 text-gray-800";
      badgeText = "مجاني";
  }

  return (
    <span className={badgeClass}>
      {badgeText}
    </span>
  );
};

export default EditableSubscriptionCell;
