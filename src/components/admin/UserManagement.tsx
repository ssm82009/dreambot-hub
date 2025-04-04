
import React from 'react';
import { User } from '@/types/database';
import UserTable from './user/UserTable';
import UserSearch from './user/UserSearch';
import RoleExplanation from './user/RoleExplanation';
import { useUserManagement } from '@/hooks/admin/useUserManagement';

type UserManagementProps = {
  users: User[];
};

const UserManagement: React.FC<UserManagementProps> = ({ users: initialUsers }) => {
  const {
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    handleRoleChange,
    handleNameChange,
    handleEmailChange,
    handleSubscriptionChange,
    handleExpiryDateChange
  } = useUserManagement(initialUsers);

  return (
    <div className="space-y-4">
      <UserSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />
      
      <UserTable
        users={users}
        isLoading={isLoading}
        onEmailChange={handleEmailChange}
        onNameChange={handleNameChange}
        onSubscriptionChange={handleSubscriptionChange}
        onExpiryDateChange={handleExpiryDateChange}
        onRoleChange={handleRoleChange}
      />
      
      <RoleExplanation />
    </div>
  );
};

export default UserManagement;
