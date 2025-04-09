
import React from 'react';
import { Input } from '@/components/ui/input';

interface DreamSearchProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DreamSearch: React.FC<DreamSearchProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <div className="mt-4">
      <Input
        placeholder="البحث في الأحلام..."
        value={searchTerm}
        onChange={onSearchChange}
        className="max-w-md"
      />
    </div>
  );
};

export default DreamSearch;
