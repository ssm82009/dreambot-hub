
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import SubscriptionBadge from './SubscriptionBadge';
import { User } from '@/types/database';

interface EditableSubscriptionCellProps {
  value: string | null;
  onSave: (newValue: string) => Promise<void>;
}

const EditableSubscriptionCell: React.FC<EditableSubscriptionCellProps> = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || 'free');
  const [isLoading, setIsLoading] = useState(false);
  const [planNames, setPlanNames] = useState<Record<string, string>>({
    free: 'الباقة المجانية',
    premium: 'الباقة المميزة',
    pro: 'الباقة الاحترافية'
  });
  
  React.useEffect(() => {
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
        }
      } catch (error) {
        console.error('Error fetching plan names:', error);
      }
    };
    
    fetchPlanNames();
  }, []);

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
            <SelectItem value="free">{planNames.free}</SelectItem>
            <SelectItem value="premium">{planNames.premium}</SelectItem>
            <SelectItem value="pro">{planNames.pro}</SelectItem>
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

  // Create a mock user object just for displaying the subscription
  const mockUser: User = {
    id: '',
    email: '',
    role: 'user',
    subscription_type: value,
    full_name: null,
    subscription_expires_at: null,
    created_at: null,
    updated_at: null
  };

  return (
    <div
      onClick={handleEdit}
      className="cursor-pointer py-1 px-2 -mx-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
    >
      <SubscriptionBadge user={mockUser} variant="pill" />
    </div>
  );
};

export default EditableSubscriptionCell;
