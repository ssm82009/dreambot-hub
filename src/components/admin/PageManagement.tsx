
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CustomPage } from '@/types/database';
import PageManagementForm from './PageManagementForm';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

type PageManagementProps = {
  pages: CustomPage[];
  onPageSave: (page: Partial<CustomPage>) => Promise<void>;
  onPageDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
};

const PageManagement: React.FC<PageManagementProps> = ({ pages, onPageSave, onPageDelete, isLoading }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeletePage = async (id: string) => {
    try {
      await onPageDelete(id);
      toast.success('تم حذف الصفحة بنجاح');
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('حدث خطأ أثناء حذف الصفحة');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <Input 
          placeholder="بحث عن صفحة..." 
          className="w-full sm:max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <PageManagementForm onPageSave={onPageSave} mode="create" />
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <svg className="animate-spin h-8 w-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري التحميل...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPages && filteredPages.length > 0 ? (
              filteredPages.map((page, index) => (
                <TableRow key={page.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    {page.title}
                  </TableCell>
                  <TableCell>/{page.slug}</TableCell>
                  <TableCell>{page.status === 'published' ? 'منشورة' : 'مسودة'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <PageManagementForm 
                        onPageSave={onPageSave} 
                        page={page} 
                        mode="edit" 
                      />
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={page.slug === 'home' || page.slug === 'terms' || page.slug === 'privacy'}
                          >
                            حذف
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من رغبتك في حذف صفحة "{page.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeletePage(page.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              تأكيد الحذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  {searchTerm ? 'لا توجد نتائج بحث مطابقة' : 'لا يوجد صفحات مخصصة حتى الآن'}
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
