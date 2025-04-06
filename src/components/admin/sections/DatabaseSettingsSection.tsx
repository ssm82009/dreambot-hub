
import React, { useState } from 'react';
import { Database } from 'lucide-react';
import { useDatabaseSettings } from '@/hooks/admin/useDatabaseSettings';
import AdminSection from '@/components/admin/AdminSection';
import { useAdmin } from '@/contexts/admin';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const DatabaseSettingsSection = () => {
  const { activeSections, toggleSection } = useAdmin();
  const { 
    useMySQL, 
    setUseMySQL, 
    mysqlStatus, 
    supabaseStatus, 
    isLoading, 
    isSyncing,
    syncProgress,
    testConnections,
    syncDatabases
  } = useDatabaseSettings();

  const [syncDirection, setSyncDirection] = useState<'mysql-to-supabase' | 'supabase-to-mysql'>('mysql-to-supabase');

  // التبديل بين قواعد البيانات
  const handleDatabaseToggle = async (checked: boolean) => {
    const success = await setUseMySQL(checked);
    if (success) {
      toast.success(checked ? 'تم تفعيل استخدام قاعدة بيانات MySQL' : 'تم تفعيل استخدام قاعدة بيانات Supabase');
    } else {
      toast.error('حدث خطأ أثناء تغيير قاعدة البيانات');
    }
  };

  // اختبار الاتصال بقواعد البيانات
  const handleTestConnections = async () => {
    toast.info('جاري اختبار الاتصال...');
    await testConnections();
  };

  // بدء عملية المزامنة
  const handleSync = async () => {
    try {
      toast.info(`بدء المزامنة من ${syncDirection === 'mysql-to-supabase' ? 'MySQL إلى Supabase' : 'Supabase إلى MySQL'}`);
      await syncDatabases(syncDirection);
      toast.success('تمت المزامنة بنجاح');
    } catch (error) {
      toast.error('فشلت عملية المزامنة');
      console.error('خطأ في المزامنة:', error);
    }
  };

  return (
    <AdminSection 
      title="إعدادات قاعدة البيانات" 
      description="إدارة وتكوين اتصالات قواعد البيانات والمزامنة بينها"
      icon={Database}
      isOpen={activeSections.database}
      onToggle={() => toggleSection('database')}
    >
      <div className="space-y-6">
        {/* قسم اختيار قاعدة البيانات */}
        <Card>
          <CardHeader>
            <CardTitle>قاعدة البيانات النشطة</CardTitle>
            <CardDescription>
              اختر قاعدة البيانات التي تريد استخدامها. يمكنك التبديل بين قاعدة بيانات MySQL المحلية أو Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">استخدام قاعدة بيانات MySQL</div>
                <div className="text-sm text-muted-foreground">
                  {useMySQL ? 'نشطة حالياً: MySQL' : 'نشطة حالياً: Supabase'}
                </div>
              </div>
              <Switch 
                checked={useMySQL} 
                onCheckedChange={handleDatabaseToggle} 
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* قسم حالة الاتصال */}
        <Card>
          <CardHeader>
            <CardTitle>حالة الاتصال</CardTitle>
            <CardDescription>
              التحقق من حالة اتصال قواعد البيانات واختبار الاتصال.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* حالة اتصال MySQL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">MySQL</div>
                <div className={`text-sm ${mysqlStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                  {mysqlStatus.success ? 'متصل' : 'غير متصل'}
                </div>
              </div>
              {mysqlStatus.message && (
                <Alert variant={mysqlStatus.success ? "default" : "destructive"} className="text-sm py-2">
                  <AlertDescription>
                    {mysqlStatus.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* حالة اتصال Supabase */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Supabase</div>
                <div className={`text-sm ${supabaseStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                  {supabaseStatus.success ? 'متصل' : 'غير متصل'}
                </div>
              </div>
              {supabaseStatus.message && (
                <Alert variant={supabaseStatus.success ? "default" : "destructive"} className="text-sm py-2">
                  <AlertDescription>
                    {supabaseStatus.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleTestConnections} 
              disabled={isLoading}
              className="w-full"
            >
              اختبار الاتصال
            </Button>
          </CardFooter>
        </Card>

        {/* قسم المزامنة */}
        <Card>
          <CardHeader>
            <CardTitle>مزامنة البيانات</CardTitle>
            <CardDescription>
              مزامنة البيانات بين قواعد البيانات MySQL و Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={syncDirection === 'mysql-to-supabase' ? 'default' : 'outline'}
                onClick={() => setSyncDirection('mysql-to-supabase')}
                disabled={isSyncing}
                className="w-full"
              >
                من MySQL إلى Supabase
              </Button>
              <Button
                variant={syncDirection === 'supabase-to-mysql' ? 'default' : 'outline'}
                onClick={() => setSyncDirection('supabase-to-mysql')}
                disabled={isSyncing}
                className="w-full"
              >
                من Supabase إلى MySQL
              </Button>
            </div>

            {isSyncing && (
              <div className="space-y-2">
                <div className="text-sm text-center mb-1">جاري المزامنة... {syncProgress}%</div>
                <Progress value={syncProgress} className="h-2" />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSync} 
              disabled={isSyncing}
              className="w-full"
            >
              بدء المزامنة
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminSection>
  );
};

export default DatabaseSettingsSection;
