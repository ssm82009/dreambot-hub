
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User } from '@/types/database';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import RoleBadge from './user/RoleBadge';
import EditableCell from './user/EditableCell';
import EditableSubscriptionCell from './user/EditableSubscriptionCell';
import EditableExpiryDateCell from './user/EditableExpiryDateCell';
import ExpiryDate from './user/ExpiryDate';
import UserActions from './user/UserActions';
import RoleExplanation from './user/RoleExplanation';
import { useAdmin } from '@/contexts/admin';

type UserManagementProps = {
  users: User[];
};

const UserManagement: React.FC<UserManagementProps> = ({ users: initialUsers }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUsers: setAdminUsers } = useAdmin();

  // Refresh user data when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');

        if (error) {
          console.error('Error fetching users:', error);
          toast.error('حدث خطأ في جلب بيانات المستخدمين');
        } else {
          console.log('Fetched users in UserManagement:', data);
          setUsers(data || []);
          setAdminUsers(data || []);
        }
      } catch (error) {
        console.error('Error in fetchUsers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // If we don't have any users initially, fetch them
    if (initialUsers.length === 0) {
      fetchUsers();
    }
  }, [initialUsers, setAdminUsers]);

  const filteredUsers = searchTerm
    ? users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())))
    : users;

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setAdminUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast.success(`تم تحديث دور المستخدم بنجاح إلى "${newRole}"`);
    } catch (error) {
      console.error('خطأ في تحديث دور المستخدم:', error);
      toast.error('حدث خطأ في تحديث دور المستخدم');
    }
  };

  const handleNameChange = async (userId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: newName })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, full_name: newName } : user
      ));
      setAdminUsers(users.map(user => 
        user.id === userId ? { ...user, full_name: newName } : user
      ));

      toast.success('تم تحديث اسم المستخدم بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث اسم المستخدم:', error);
      toast.error('حدث خطأ في تحديث اسم المستخدم');
      throw error;
    }
  };

  const handleEmailChange = async (userId: string, newEmail: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ email: newEmail })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, email: newEmail } : user
      ));
      setAdminUsers(users.map(user => 
        user.id === userId ? { ...user, email: newEmail } : user
      ));

      toast.success('تم تحديث البريد الإلكتروني بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث البريد الإلكتروني:', error);
      toast.error('حدث خطأ في تحديث البريد الإلكتروني');
      throw error;
    }
  };

  const handleSubscriptionChange = async (userId: string, newSubscription: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ subscription_type: newSubscription })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, subscription_type: newSubscription } : user
      ));
      setAdminUsers(users.map(user => 
        user.id === userId ? { ...user, subscription_type: newSubscription } : user
      ));

      toast.success('تم تحديث نوع الاشتراك بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث نوع الاشتراك:', error);
      toast.error('حدث خطأ في تحديث نوع الاشتراك');
      throw error;
    }
  };

  const handleExpiryDateChange = async (userId: string, newExpiryDate: string | null) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ subscription_expires_at: newExpiryDate })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, subscription_expires_at: newExpiryDate } : user
      ));
      setAdminUsers(users.map(user => 
        user.id === userId ? { ...user, subscription_expires_at: newExpiryDate } : user
      ));

      toast.success('تم تحديث تاريخ انتهاء الاشتراك بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث تاريخ انتهاء الاشتراك:', error);
      toast.error('حدث خطأ في تحديث تاريخ انتهاء الاشتراك');
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <Input 
          placeholder="بحث عن مستخدم..." 
          className="w-full sm:max-w-md" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">جاري تحميل بيانات المستخدمين...</p>
          </div>
        </div>
      ) : (
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
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <EditableCell 
                        value={user.email} 
                        onSave={(newValue) => handleEmailChange(user.id, newValue)}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell 
                        value={user.full_name || ''} 
                        onSave={(newValue) => handleNameChange(user.id, newValue)}
                      />
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <EditableSubscriptionCell 
                        value={user.subscription_type} 
                        onSave={(newValue) => handleSubscriptionChange(user.id, newValue)}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableExpiryDateCell 
                        value={user.subscription_expires_at} 
                        onSave={(newValue) => handleExpiryDateChange(user.id, newValue)}
                      />
                    </TableCell>
                    <TableCell>
                      <UserActions 
                        userId={user.id} 
                        currentRole={user.role} 
                        onRoleChange={handleRoleChange} 
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
      )}
      
      <RoleExplanation />
    </div>
  );
};

export default UserManagement;
