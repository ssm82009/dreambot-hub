
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User } from '@/types/database';
import { Loader2 } from 'lucide-react';
import EditableCell from './EditableCell';
import EditableSubscriptionCell from './EditableSubscriptionCell';
import EditableExpiryDateCell from './EditableExpiryDateCell';
import RoleBadge from './RoleBadge';
import UserActions from './UserActions';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onEmailChange: (userId: string, newEmail: string) => Promise<void>;
  onNameChange: (userId: string, newName: string) => Promise<void>;
  onSubscriptionChange: (userId: string, newSubscription: string) => Promise<void>;
  onExpiryDateChange: (userId: string, newExpiryDate: string | null) => Promise<void>;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  onEmailChange,
  onNameChange,
  onSubscriptionChange,
  onExpiryDateChange,
  onRoleChange
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">جاري تحميل بيانات المستخدمين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">الرقم</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>الاسم</TableHead>
            <TableHead>الصلاحية</TableHead>
            <TableHead>الباقة</TableHead>
            <TableHead>تاريخ الانتهاء</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users && users.length > 0 ? (
            users.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <EditableCell 
                    value={user.email} 
                    onSave={(newValue) => onEmailChange(user.id, newValue)}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell 
                    value={user.full_name || ''} 
                    onSave={(newValue) => onNameChange(user.id, newValue)}
                  />
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <EditableSubscriptionCell 
                    value={user.subscription_type} 
                    onSave={(newValue) => onSubscriptionChange(user.id, newValue)}
                  />
                </TableCell>
                <TableCell>
                  <EditableExpiryDateCell 
                    value={user.subscription_expires_at} 
                    onSave={(newValue) => onExpiryDateChange(user.id, newValue)}
                  />
                </TableCell>
                <TableCell>
                  <UserActions 
                    userId={user.id} 
                    currentRole={user.role} 
                    onRoleChange={onRoleChange} 
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                لا يوجد مستخدمين حتى الآن
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
