
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';

interface EditableCellProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditValue(value);
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
        // Revert to original value on error
        setEditValue(value);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 w-full"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave();
            } else if (e.key === 'Escape') {
              handleCancel();
            }
          }}
        />
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
      className="cursor-pointer py-1 px-2 -mx-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
    >
      {value || '-'}
    </div>
  );
};

export default EditableCell;
