
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dream } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface DreamTableProps {
  dreams: Dream[];
}

const DreamTable: React.FC<DreamTableProps> = ({ dreams }) => {
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'yyyy/MM/dd HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString || '-';
    }
  };

  const handleViewDream = (dream: Dream) => {
    setSelectedDream(dream);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="h-8 text-xs">
              <TableHead className="whitespace-nowrap px-1 py-1">التاريخ</TableHead>
              <TableHead className="whitespace-nowrap px-1 py-1">المستخدم</TableHead>
              <TableHead className="whitespace-nowrap px-1 py-1">نص الحلم</TableHead>
              <TableHead className="whitespace-nowrap px-1 py-1">التفسير</TableHead>
              <TableHead className="whitespace-nowrap px-1 py-1">العلامات</TableHead>
              <TableHead className="whitespace-nowrap px-1 py-1">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dreams.map((dream) => (
              <TableRow key={dream.id} className="h-8 text-xs">
                <TableCell className="whitespace-nowrap px-1 py-1">
                  {formatDate(dream.created_at)}
                </TableCell>
                <TableCell className="whitespace-nowrap px-1 py-1">
                  {dream.user_id || 'غير مسجل'}
                </TableCell>
                <TableCell className="px-1 py-1 max-w-[200px]">
                  {truncateText(dream.dream_text)}
                </TableCell>
                <TableCell className="px-1 py-1 max-w-[200px]">
                  {truncateText(dream.interpretation)}
                </TableCell>
                <TableCell className="whitespace-nowrap px-1 py-1">
                  {dream.tags ? dream.tags.join(', ') : '-'}
                </TableCell>
                <TableCell className="whitespace-nowrap px-1 py-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-xs" 
                    onClick={() => handleViewDream(dream)}
                  >
                    <Eye className="h-3 w-3 ml-1" />
                    عرض
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedDream && (
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl mb-2">تفاصيل الحلم</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                تاريخ الإضافة: {formatDate(selectedDream.created_at)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="font-semibold mb-2">نص الحلم:</h3>
                <div className="bg-muted/30 rounded-md p-3 text-sm whitespace-pre-line">
                  {selectedDream.dream_text}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">التفسير:</h3>
                <div className="bg-primary/5 border border-primary/10 rounded-md p-3 text-sm whitespace-pre-line">
                  {selectedDream.interpretation}
                </div>
              </div>
              
              {selectedDream.tags && selectedDream.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">العلامات:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDream.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-muted text-xs rounded-full px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold mb-2">معلومات إضافية:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted/20 p-2 rounded-md">
                    <span className="font-semibold">معرف المستخدم:</span> {selectedDream.user_id || 'غير مسجل'}
                  </div>
                  <div className="bg-muted/20 p-2 rounded-md">
                    <span className="font-semibold">معرف الحلم:</span> {selectedDream.id}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default DreamTable;
