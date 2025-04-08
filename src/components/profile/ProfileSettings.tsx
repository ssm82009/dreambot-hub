
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import NotificationSettings from './NotificationSettings';

interface ProfileSettingsProps {
  userId: string;
  userEmail: string;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userId, userEmail }) => {
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', userId);
        
      if (error) throw error;
      
      // update local storage
      localStorage.setItem('userName', fullName);
      
      toast.success("تم تحديث معلومات الملف الشخصي");
    } catch (error) {
      console.error("خطأ في حفظ الملف الشخصي:", error);
      toast.error("حدث خطأ أثناء تحديث الملف الشخصي");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>معلومات الملف الشخصي</CardTitle>
          <CardDescription>
            تحديث المعلومات الشخصية الخاصة بك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              value={userEmail || ''}
              disabled
              className="bg-muted/30"
            />
            <p className="text-xs text-muted-foreground">
              لا يمكن تغيير البريد الإلكتروني
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input
              id="name"
              placeholder="أدخل اسمك الكامل"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="ml-2 h-4 w-4" />
            )}
            حفظ التغييرات
          </Button>
        </CardFooter>
      </Card>

      <NotificationSettings />
    </div>
  );
};

export default ProfileSettings;
