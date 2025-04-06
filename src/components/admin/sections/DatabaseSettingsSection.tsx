
import React, { useState, useEffect } from 'react';
import { Database, ArrowRightLeft, DatabaseBackup, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useDatabaseSettings } from '@/hooks/admin/useDatabaseSettings';

const DatabaseSettingsSection: React.FC = () => {
  const { 
    useMySQL, 
    setUseMySQL, 
    mysqlStatus,
    supabaseStatus,
    isLoading,
    testConnections,
    syncDatabases,
    syncProgress,
    isSyncing
  } = useDatabaseSettings();

  useEffect(() => {
    // اختبار الاتصال عند تحميل المكون
    testConnections();
  }, []);

  const handleDatabaseToggle = async () => {
    try {
      await setUseMySQL(!useMySQL);
      toast.success(`تم تغيير قاعدة البيانات إلى ${!useMySQL ? 'MySQL' : 'Supabase'}`);
    } catch (error) {
      console.error('خطأ في تغيير قاعدة البيانات:', error);
      toast.error('حدث خطأ في تغيير قاعدة البيانات');
    }
  };

  const handleSyncToMySQL = async () => {
    try {
      await syncDatabases('supabase-to-mysql');
      toast.success('تم مزامنة البيانات من Supabase إلى MySQL بنجاح');
    } catch (error) {
      console.error('خطأ في المزامنة:', error);
      toast.error('حدث خطأ في مزامنة البيانات');
    }
  };

  const handleSyncToSupabase = async () => {
    try {
      await syncDatabases('mysql-to-supabase');
      toast.success('تم مزامنة البيانات من MySQL إلى Supabase بنجاح');
    } catch (error) {
      console.error('خطأ في المزامنة:', error);
      toast.error('حدث خطأ في مزامنة البيانات');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            إعدادات قاعدة البيانات
          </CardTitle>
          <CardDescription>
            تحكم في اختيار وإعدادات قاعدة البيانات المستخدمة في الموقع
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* قسم اختيار قاعدة البيانات */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">اختيار قاعدة البيانات</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">استخدام MySQL</div>
                <p className="text-sm text-muted-foreground">
                  عند التفعيل، سيستخدم النظام قاعدة بيانات MySQL الخاصة بالسيرفر
                </p>
              </div>
              <Switch 
                checked={useMySQL} 
                onCheckedChange={handleDatabaseToggle}
                disabled={isLoading || isSyncing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">استخدام Supabase</div>
                <p className="text-sm text-muted-foreground">
                  عند التفعيل، سيستخدم النظام قاعدة بيانات Supabase السحابية
                </p>
              </div>
              <Switch 
                checked={!useMySQL} 
                onCheckedChange={handleDatabaseToggle}
                disabled={isLoading || isSyncing}
              />
            </div>
          </div>

          <Separator />

          {/* قسم حالة الاتصال */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">حالة الاتصال</h3>
            
            <div className="space-y-4">
              <Alert variant={mysqlStatus.success ? "default" : "destructive"}>
                <Database className="h-4 w-4" />
                <AlertTitle>قاعدة بيانات MySQL</AlertTitle>
                <AlertDescription>
                  {mysqlStatus.success ? (
                    <span className="text-green-600 font-medium">متصل</span>
                  ) : (
                    <span className="text-red-600 font-medium">غير متصل: {mysqlStatus.message || 'لا يمكن الاتصال'}</span>
                  )}
                </AlertDescription>
              </Alert>
              
              <Alert variant={supabaseStatus.success ? "default" : "destructive"}>
                <Database className="h-4 w-4" />
                <AlertTitle>قاعدة بيانات Supabase</AlertTitle>
                <AlertDescription>
                  {supabaseStatus.success ? (
                    <span className="text-green-600 font-medium">متصل</span>
                  ) : (
                    <span className="text-red-600 font-medium">غير متصل: {supabaseStatus.message || 'لا يمكن الاتصال'}</span>
                  )}
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={testConnections}
                  disabled={isLoading || isSyncing}
                >
                  <Eye className="ml-2 h-4 w-4" />
                  اختبار الاتصال
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* قسم نسخ ومزامنة البيانات */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">مزامنة ونسخ البيانات</h3>
            <p className="text-sm text-muted-foreground">
              يمكنك مزامنة البيانات بين قاعدتي البيانات MySQL و Supabase. تأكد من الاتصال بكلتا قاعدتي البيانات قبل المزامنة.
            </p>

            {isSyncing && (
              <Alert>
                <DatabaseBackup className="h-4 w-4" />
                <AlertTitle>جاري المزامنة...</AlertTitle>
                <AlertDescription>
                  اكتمال المزامنة: {syncProgress}%
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1"
                onClick={handleSyncToMySQL} 
                disabled={!supabaseStatus.success || !mysqlStatus.success || isLoading || isSyncing}
              >
                <ArrowRightLeft className="ml-2 h-4 w-4" />
                نسخ من Supabase إلى MySQL
              </Button>
              
              <Button 
                className="flex-1"
                onClick={handleSyncToSupabase}
                disabled={!supabaseStatus.success || !mysqlStatus.success || isLoading || isSyncing}
              >
                <ArrowRightLeft className="ml-2 h-4 w-4" />
                نسخ من MySQL إلى Supabase
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert variant="warning" className="mt-6">
        <AlertTitle className="text-amber-600">ملاحظة مهمة</AlertTitle>
        <AlertDescription className="text-amber-700">
          <p>عمليات MySQL تعمل فقط على الخادم وليس في المتصفح. الإعدادات هنا تحدد ماذا ستستخدم تطبيقات الخادم.</p>
          <p className="mt-2">في بيئة التطوير، سيتم استخدام Supabase دائمًا نظرًا لعدم وجود خادم MySQL متاح في المتصفح.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DatabaseSettingsSection;
