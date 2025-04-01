
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { AiSettings } from '@/types/database';

type AiModel = {
  id: string;
  name: string;
  description: string;
  availability: 'free' | 'paid';
};

type AiSettingsFormValues = {
  provider: string;
  apiKey: string;
  model: string;
};

type AiSettingsFormProps = {
  initialData: AiSettingsFormValues;
  onSubmit: (data: AiSettingsFormValues) => Promise<void>;
  togetherModels: AiModel[];
};

const AiSettingsForm: React.FC<AiSettingsFormProps> = ({ initialData, onSubmit, togetherModels }) => {
  const form = useForm<AiSettingsFormValues>({
    defaultValues: initialData
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مزود الخدمة</FormLabel>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox 
                      id="together" 
                      checked={field.value === "together"}
                      onCheckedChange={() => field.onChange("together")}
                    />
                    <label htmlFor="together" className="text-sm">Together.ai</label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox 
                      id="openai" 
                      checked={field.value === "openai"}
                      onCheckedChange={() => field.onChange("openai")}
                    />
                    <label htmlFor="openai" className="text-sm">OpenAI</label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox 
                      id="anthropic" 
                      checked={field.value === "anthropic"}
                      onCheckedChange={() => field.onChange("anthropic")}
                    />
                    <label htmlFor="anthropic" className="text-sm">Anthropic</label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox 
                      id="gemini" 
                      checked={field.value === "gemini"}
                      onCheckedChange={() => field.onChange("gemini")}
                    />
                    <label htmlFor="gemini" className="text-sm">Gemini</label>
                  </div>
                </div>
                <FormDescription>
                  Together.ai يوفر وصولاً إلى مجموعة واسعة من نماذج مختلفة عبر مفتاح API واحد
                </FormDescription>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مفتاح API</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={field.value === "together" ? "tok_..." : field.value === "openai" ? "sk-..." : ""}
                    dir="ltr" 
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  يمكنك الحصول على مفتاح Together.ai من لوحة التحكم الخاصة بك على{" "}
                  <a href="https://api.together.xyz/settings/api-keys" className="text-primary underline" target="_blank" rel="noopener noreferrer">
                    together.xyz
                  </a>
                </FormDescription>
              </FormItem>
            )}
          />
          
          {form.watch("provider") === "together" && (
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>النموذج</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النموذج" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      {togetherModels.map((model) => (
                        <SelectItem 
                          key={model.id} 
                          value={model.id}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span>{model.name}</span>
                            <span className={`text-xs ${model.availability === 'free' ? 'text-green-500' : 'text-amber-500'}`}>
                              {model.availability === 'free' ? 'مجاني' : 'مدفوع'}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{model.description}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    اختر النموذج الذي تريد استخدامه لتفسير الأحلام
                  </FormDescription>
                </FormItem>
              )}
            />
          )}

          {form.watch("provider") === "openai" && (
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نموذج OpenAI</FormLabel>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Checkbox 
                        id="gpt-4o" 
                        checked={field.value === "gpt-4o"}
                        onCheckedChange={() => field.onChange("gpt-4o")}
                      />
                      <label htmlFor="gpt-4o" className="text-sm">GPT-4o</label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Checkbox 
                        id="gpt-4" 
                        checked={field.value === "gpt-4"}
                        onCheckedChange={() => field.onChange("gpt-4")}
                      />
                      <label htmlFor="gpt-4" className="text-sm">GPT-4</label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Checkbox 
                        id="gpt-3.5" 
                        checked={field.value === "gpt-3.5"}
                        onCheckedChange={() => field.onChange("gpt-3.5")}
                      />
                      <label htmlFor="gpt-3.5" className="text-sm">GPT-3.5</label>
                    </div>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>
        
        <Button type="submit">حفظ الإعدادات</Button>
      </form>
    </Form>
  );
};

export default AiSettingsForm;
