
import React from 'react';
import { Input } from '@/components/ui/input';

interface UserSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
      <Input 
        placeholder="بحث عن مستخدم..." 
        className="w-full sm:max-w-md" 
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default UserSearch;
