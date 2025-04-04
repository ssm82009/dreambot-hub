
import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSubscriptionName } from '@/utils/subscription';
import { supabase } from '@/integrations/supabase/client';

interface EditableSubscriptionCellProps {
  value: string | null;
  onSave: (newValue: string) => Promise<void>;
}

const EditableSubscriptionCell: React.FC<EditableSubscriptionCellProps> = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || 'free');
  const [isLoading, setIsLoading] = useState(false);
  const [planNames, setPlanNames] = useState<Record<string, string>>({});
  const [displayName, setDisplayName] = useState('');
  
  useEffect(() => {
    // Fetch pricing settings to get plan names
    const fetchPlanNames = async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_settings')
          .select('free_plan_name, premium_plan_name, pro_plan_name')
          .limit(1)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setPlanNames({
            free: data.free_plan_name || 'الباقة المجانية',
            premium: data.premium_plan_name || 'الباقة المميزة',
            pro: data.pro_plan_name || 'الباقة الاحترافية'
          });
          
          // Set the display name based on the value
          if (value === 'free') {
            setDisplayName(data.free_plan_name || 'الباقة المجانية');
          } else if (value === 'premium') {
            setDisplayName(data.premium_plan_name || 'الباقة المميزة');
          } else if (value === 'pro') {
            setDisplayName(data.pro_plan_name || 'الباقة الاحترافية');
          } else {
            setDisplayName(value || 'الباقة المجانية');
          }
        }
      } catch (error) {
        console.error('Error fetching plan names:', error);
        
        // Fallback to default names
        setPlanNames({
          free: 'الباقة المجانية',
          premium: 'الباقة المميزة',
          pro: 'الباقة الاحترافية'
        });
        
        // Set default display name
        if (value === 'free') {
          setDisplayName('الباقة المجانية');
        } else if (value === 'premium') {
          setDisplayName('الباقة المميزة');
        } else if (value === 'pro') {
          setDisplayName('الباقة الاحترافية');
        } else {
          setDisplayName(value || 'الباقة المجانية');
        }
      }
    };
    
    fetchPlanNames();
  }, [value]);

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
            <SelectValue placeholder="الباقة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">{planNames.free || 'الباقة المجانية'}</SelectItem>
            <SelectItem value="premium">{planNames.premium || 'الباقة المميزة'}</SelectItem>
            <SelectItem value="pro">{planNames.pro || 'الباقة الاحترافية'}</SelectItem>
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
      <SubscriptionBadge subscriptionType={value} displayName={displayName} />
    </div>
  );
};

// نعرض اسم الباقة وليس النوع فقط
const SubscriptionBadge = ({ 
  subscriptionType, 
  displayName 
}: { 
  subscriptionType: string | null,
  displayName: string
}) => {
  let badgeClass = "px-2 py-1 text-xs rounded-full";
  
  switch (subscriptionType) {
    case "premium":
      badgeClass += " bg-amber-100 text-amber-800";
      break;
    case "pro":
      badgeClass += " bg-purple-100 text-purple-800";
      break;
    case "free":
    default:
      badgeClass += " bg-gray-100 text-gray-800";
  }

  return (
    <span className={badgeClass}>
      {displayName || 'الباقة المجانية'}
    </span>
  );
};

export default EditableSubscriptionCell;
