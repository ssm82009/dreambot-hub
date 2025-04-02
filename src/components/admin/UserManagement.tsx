
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User } from '@/types/database';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

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

  // تنسيق تاريخ انتهاء الاشتراك
  const formatExpiryDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ar });
    } catch (error) {
      return '-';
    }
  };

  // الحصول على حالة الاشتراك
  const getSubscriptionStatus = (user: User) => {
    if (!user.subscription_type || user.subscription_type === 'free') {
      return { name: 'مجاني', color: 'outline' as const };
    }
    
    // التحقق من انتهاء صلاحية الاشتراك
    if (user.subscription_expires_at) {
      const expiryDate = new Date(user.subscription_expires_at);
      const now = new Date();
      
      if (expiryDate > now) {
        return { 
          name: user.subscription_type === 'premium' ? 'مميز' : 'احترافي',
          color: user.subscription_type === 'premium' ? 'secondary' as const : 'default' as const
        };
      } else {
        return { name: 'منتهي', color: 'destructive' as const };
      }
    }
    
    return { name: 'مجاني', color: 'outline' as const };
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
                filteredUsers.map((user, index) => {
                  const subscriptionStatus = getSubscriptionStatus(user);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.full_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'interpreter' ? 'secondary' : 'outline'}>
                          {user.role === 'admin' ? 'مشرف' : 
                           user.role === 'interpreter' ? 'مفسر' : 'عضو'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={subscriptionStatus.color}>
                          {subscriptionStatus.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatExpiryDate(user.subscription_expires_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.role !== 'admin' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRoleChange(user.id, 'admin')}
                            >
                              تعيين كمشرف
                            </Button>
                          )}
                          {user.role !== 'user' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRoleChange(user.id, 'user')}
                            >
                              تعيين كمستخدم
                            </Button>
                          )}
                          {user.role !== 'interpreter' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRoleChange(user.id, 'interpreter')}
                            >
                              تعيين كمفسر
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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
      
      <div className="p-4 border rounded-md mt-6">
        <h3 className="text-lg font-semibold mb-4">أنواع الصلاحيات</h3>
        <div className="space-y-4">
          <div className="p-3 border rounded-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-semibold">مشرف</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              يملك جميع الصلاحيات بما في ذلك الوصول إلى لوحة التحكم وإدارة المستخدمين والإعدادات
            </p>
          </div>
          
          <div className="p-3 border rounded-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-semibold">مفسر</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              يمكنه الوصول إلى طلبات تفسير الأحلام وتقديم تفسيرات لها
            </p>
          </div>
          
          <div className="p-3 border rounded-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-semibold">عضو</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              يمكنه طلب تفسير الأحلام حسب نوع العضوية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
