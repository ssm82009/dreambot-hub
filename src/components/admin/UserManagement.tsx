
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User } from '@/types/database';

type UserManagementProps = {
  users: User[];
};

const UserManagement: React.FC<UserManagementProps> = ({ users }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <Input placeholder="بحث عن مستخدم..." className="w-full sm:max-w-md" />
        <Button>إضافة مستخدم جديد</Button>
      </div>
      
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">الرقم</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>نوع العضوية</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name || '-'}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>نشط</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">تعديل</Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">حذف</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  لا يوجد مستخدمين حتى الآن
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 border rounded-md mt-6">
        <h3 className="text-lg font-semibold mb-4">أنواع الصلاحيات</h3>
        <div className="space-y-4">
          <div className="p-3 border rounded-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-semibold">مشرف</span>
              </div>
              <Button variant="outline" size="sm">تعديل</Button>
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
              <Button variant="outline" size="sm">تعديل</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              يمكنه الوصول إلى طلبات تفسير الأحلام وتقديم تفسيرات لها
            </p>
          </div>
          
          <div className="p-3 border rounded-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-semibold">عضو مميز</span>
              </div>
              <Button variant="outline" size="sm">تعديل</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              عضوية مدفوعة تتيح طلب عدد غير محدود من التفسيرات والوصول إلى المزايا المتقدمة
            </p>
          </div>
          
          <div className="p-3 border rounded-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-semibold">عضو مجاني</span>
              </div>
              <Button variant="outline" size="sm">تعديل</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              عضوية مجانية تتيح طلب عدد محدود من التفسيرات
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
