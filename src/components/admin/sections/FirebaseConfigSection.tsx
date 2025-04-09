
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FirebaseConfigForm from '../notifications/FirebaseConfigForm';

const FirebaseConfigSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">تكوين Firebase</h2>
          <p className="text-muted-foreground">
            قم بإعداد Firebase للإشعارات وخدمات الرسائل
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <FirebaseConfigForm />
        
        <Card>
          <CardHeader>
            <CardTitle>حساب خدمة Firebase</CardTitle>
            <CardDescription>
              رفع ملف JSON لحساب الخدمة (مطلوب للإشعارات)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md">
              <p className="text-sm">
                لإعداد حساب خدمة Firebase، قم بما يلي:
              </p>
              <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                <li>افتح مشروع Firebase وانتقل إلى إعدادات المشروع &gt; حسابات الخدمة</li>
                <li>اختر "إنشاء مفتاح جديد" وقم بتنزيل ملف JSON</li>
                <li>قم بتخزين محتوى هذا الملف كسر في Supabase وتكوين وظيفة Edge Function</li>
              </ol>
            </div>
            
            <div className="p-4 border border-dashed rounded-md flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  قم بتكوين السر FIREBASE_SERVICE_ACCOUNT في إعدادات وظائف Supabase Edge Functions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FirebaseConfigSection;
