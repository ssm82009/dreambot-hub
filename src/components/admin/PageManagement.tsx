
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CustomPage } from '@/types/database';

type PageManagementProps = {
  pages: CustomPage[];
};

const PageManagement: React.FC<PageManagementProps> = ({ pages }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <Input placeholder="بحث عن صفحة..." className="w-full sm:max-w-md" />
        <Button>إضافة صفحة جديدة</Button>
      </div>
      
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">الرقم</TableHead>
              <TableHead>عنوان الصفحة</TableHead>
              <TableHead>المسار</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages && pages.length > 0 ? (
              pages.map((page, index) => (
                <TableRow key={page.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{page.title}</TableCell>
                  <TableCell>/{page.slug}</TableCell>
                  <TableCell>{page.status === 'published' ? 'منشورة' : 'مسودة'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">تعديل</Button>
                      <Button variant="outline" size="sm" disabled={page.slug === 'home'}>حذف</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  لا يوجد صفحات مخصصة حتى الآن
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PageManagement;
