
import { useState, useEffect } from 'react';
import { User } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdmin } from '@/contexts/admin';

export const useUserManagement = (initialUsers: User[]) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUsers: setAdminUsers } = useAdmin();

  // Refresh user data when the component mounts
  useEffect(() => {
    if (initialUsers.length === 0) {
      fetchUsers();
    }
  }, [initialUsers]);

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
        console.log('Fetched users in useUserManagement:', data);
        setUsers(data || []);
        setAdminUsers(data || []);
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Filter users based on search term
  const filteredUsers = searchTerm
    ? users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())))
    : users;

  return {
    users: filteredUsers,
    isLoading,
    searchTerm,
    setSearchTerm,
    handleRoleChange,
    handleNameChange,
    handleEmailChange,
    handleSubscriptionChange,
    handleExpiryDateChange
  };
};
