
import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dream } from '@/types/database';

interface DreamTableProps {
  dreams: Dream[];
}

const DreamTable: React.FC<DreamTableProps> = ({ dreams }) => {
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

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="h-8 text-xs">
            <TableHead className="whitespace-nowrap px-1 py-1">التاريخ</TableHead>
            <TableHead className="whitespace-nowrap px-1 py-1">المستخدم</TableHead>
            <TableHead className="whitespace-nowrap px-1 py-1">نص الحلم</TableHead>
            <TableHead className="whitespace-nowrap px-1 py-1">التفسير</TableHead>
            <TableHead className="whitespace-nowrap px-1 py-1">العلامات</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DreamTable;
