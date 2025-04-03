
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

// Schema for the customer info form
export const customerInfoSchema = z.object({
  name: z.string().min(3, { message: "الاسم يجب أن يكون 3 أحرف على الأقل" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  phone: z.string().min(10, { message: "رقم الهاتف يجب أن يكون 10 أرقام على الأقل" })
});

export type CustomerInfoFormValues = z.infer<typeof customerInfoSchema>;

interface CustomerInfoFormProps {
  form: UseFormReturn<CustomerInfoFormValues>;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({ form }) => {
  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="name">الاسم الكامل</Label>
              <FormControl>
                <Input id="name" placeholder="أدخل اسمك الكامل" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <FormControl>
                <Input id="email" type="email" placeholder="أدخل بريدك الإلكتروني" dir="ltr" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <FormControl>
                <Input id="phone" type="tel" placeholder="05xxxxxxxx" dir="ltr" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
};

export default CustomerInfoForm;
