
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { InterpretationSettings } from '@/types/database';

type InterpretationSettingsFormValues = {
  maxInputWords: number;
  minOutputWords: number;
  maxOutputWords: number;
  systemInstructions: string;
};

type InterpretationSettingsFormProps = {
  initialData: InterpretationSettingsFormValues;
  onSubmit: (data: InterpretationSettingsFormValues) => Promise<void>;
};

const InterpretationSettingsForm: React.FC<InterpretationSettingsFormProps> = ({ initialData, onSubmit }) => {
  const form = useForm<InterpretationSettingsFormValues>({
    defaultValues: initialData
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>الحد الأقصى لعدد كلمات المدخلات</Label>
        <Input 
          type="number" 
          {...form.register("maxInputWords", { valueAsNumber: true })} 
        />
        <p className="text-sm text-muted-foreground">
          الحد الأقصى لعدد الكلمات المسموح بها في وصف الحلم
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>الحد الأدنى لعدد كلمات المخرجات</Label>
        <Input 
          type="number" 
          {...form.register("minOutputWords", { valueAsNumber: true })} 
        />
        <p className="text-sm text-muted-foreground">
          الحد الأدنى لعدد الكلمات في تفسير الحلم
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>الحد الأقصى لعدد كلمات المخرجات</Label>
        <Input 
          type="number" 
          {...form.register("maxOutputWords", { valueAsNumber: true })} 
        />
        <p className="text-sm text-muted-foreground">
          الحد الأقصى لعدد الكلمات في تفسير الحلم
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>توجيهات النظام</Label>
        <Textarea 
          placeholder="أدخل توجيهات النظام هنا..." 
          rows={4}
          {...form.register("systemInstructions")}
        />
        <p className="text-sm text-muted-foreground">
          توجيهات النظام التي ستُرسل إلى نموذج الذكاء الاصطناعي
        </p>
      </div>
      
      <Button type="submit">حفظ الإعدادات</Button>
    </form>
  );
};

export default InterpretationSettingsForm;
