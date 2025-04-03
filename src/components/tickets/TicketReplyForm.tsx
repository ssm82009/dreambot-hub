
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

type TicketReplyFormProps = {
  isClosed: boolean;
  isSubmitting: boolean;
  onAddReply: (content: string) => Promise<boolean>;
};

const TicketReplyForm: React.FC<TicketReplyFormProps> = ({
  isClosed,
  isSubmitting,
  onAddReply,
}) => {
  const [newReply, setNewReply] = useState('');

  const handleSubmit = async () => {
    if (await onAddReply(newReply)) {
      setNewReply('');
    }
  };

  if (isClosed) {
    return (
      <div className="text-center py-4 text-muted-foreground border-t">
        تم إغلاق هذه التذكرة ولا يمكن إضافة ردود جديدة
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-medium">إضافة رد</h3>
      <Textarea
        value={newReply}
        onChange={(e) => setNewReply(e.target.value)}
        placeholder="اكتب ردك هنا..."
        rows={4}
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !newReply.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            'إرسال الرد'
          )}
        </Button>
      </div>
    </div>
  );
};

export default TicketReplyForm;
