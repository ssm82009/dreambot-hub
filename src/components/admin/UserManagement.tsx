
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User } from '@/types/database';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import RoleBadge from './user/RoleBadge';
import SubscriptionBadge from './user/SubscriptionBadge';
import ExpiryDate from './user/ExpiryDate';
import UserActions from './user/UserActions';
import RoleExplanation from './user/RoleExplanation';

type UserManagementProps = {
  users: User[];
};

const UserManagement: React.FC<UserManagementProps> = ({ users: initialUsers }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
  }, [initialUsers]);

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

      toast.success(`تم تحديث دور المستخدم بنجاح إلى "${newRole}"`);
    } catch (error) {
      console.error('خطأ في تحديث دور المستخدم:', error);
      toast.error('حدث خطأ في تحديث دور المستخدم');
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
                <TableHead>الاشتراك</TableHead>
                <TableHead>تاريخ الانتهاء</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.full_name || '-'}</TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <SubscriptionBadge user={user} />
                    </TableCell>
                    <TableCell>
                      <ExpiryDate expiryDate={user.subscription_expires_at} />
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
