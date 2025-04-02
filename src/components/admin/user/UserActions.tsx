
import React from 'react';
import { Button } from '@/components/ui/button';

type UserActionsProps = {
  userId: string;
  currentRole: string;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
};

const UserActions: React.FC<UserActionsProps> = ({ userId, currentRole, onRoleChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {currentRole !== 'admin' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onRoleChange(userId, 'admin')}
        >
          تعيين كمشرف
        </Button>
      )}
      {currentRole !== 'user' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onRoleChange(userId, 'user')}
        >
          تعيين كمستخدم
        </Button>
      )}
      {currentRole !== 'interpreter' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onRoleChange(userId, 'interpreter')}
        >
          تعيين كمفسر
        </Button>
      )}
    </div>
  );
};

export default UserActions;
