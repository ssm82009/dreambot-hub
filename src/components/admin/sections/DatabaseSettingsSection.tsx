
import React, { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import { useDatabaseSettings } from '@/hooks/admin/useDatabaseSettings';
import AdminSection from '@/components/admin/AdminSection';
import { useAdmin } from '@/contexts/admin';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getDatabaseConfig, updateDatabaseConfig } from '@/integrations/mysql/config';

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
  const [mysqlConfig, setMysqlConfig] = useState({
    host: '',
    port: 3306,
    user: '',
    password: '',
    database: '',
    connectionLimit: 10
  });

  // جلب إعدادات قاعدة البيانات عند تحميل المكون
  useEffect(() => {
    try {
      const config = getDatabaseConfig();
      setMysqlConfig({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        connectionLimit: config.connectionLimit
      });
    } catch (error) {
      console.error('خطأ في جلب إعدادات قاعدة البيانات:', error);
    }
  }, []);

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

  // تحديث إعدادات MySQL
  const handleConfigUpdate = () => {
    try {
      // تحديث الإعدادات
      updateDatabaseConfig(mysqlConfig);
      toast.success('تم تحديث إعدادات قاعدة البيانات بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث إعدادات قاعدة البيانات');
      console.error('خطأ في تحديث إعدادات قاعدة البيانات:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setMysqlConfig(prev => ({
      ...prev,
      [field]: value
    }));
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

        {/* قسم إعدادات MySQL */}
        <Card>
          <CardHeader>
            <CardTitle>إعدادات اتصال MySQL</CardTitle>
            <CardDescription>
              تعديل إعدادات الاتصال بقاعدة بيانات MySQL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mysql-host">عنوان الخادم (Host)</Label>
                <Input 
                  id="mysql-host" 
                  value={mysqlConfig.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  placeholder="مثال: localhost أو 173.249.0.2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysql-port">رقم المنفذ (Port)</Label>
                <Input 
                  id="mysql-port" 
                  type="number"
                  value={mysqlConfig.port}
                  onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 3306)}
                  placeholder="3306"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysql-user">اسم المستخدم</Label>
                <Input 
                  id="mysql-user" 
                  value={mysqlConfig.user}
                  onChange={(e) => handleInputChange('user', e.target.value)}
                  placeholder="اسم المستخدم"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysql-password">كلمة المرور</Label>
                <Input 
                  id="mysql-password" 
                  type="password"
                  value={mysqlConfig.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="كلمة المرور"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysql-database">اسم قاعدة البيانات</Label>
                <Input 
                  id="mysql-database" 
                  value={mysqlConfig.database}
                  onChange={(e) => handleInputChange('database', e.target.value)}
                  placeholder="اسم قاعدة البيانات"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mysql-connection-limit">حد الاتصالات</Label>
                <Input 
                  id="mysql-connection-limit" 
                  type="number"
                  value={mysqlConfig.connectionLimit}
                  onChange={(e) => handleInputChange('connectionLimit', parseInt(e.target.value) || 10)}
                  placeholder="10"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleConfigUpdate} 
              className="w-full"
            >
              حفظ إعدادات الاتصال
            </Button>
          </CardFooter>
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
              {mysqlStatus.details && (
                <div className="bg-muted p-2 rounded-md text-xs">
                  <pre className="whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(mysqlStatus.details, null, 2)}
                  </pre>
                </div>
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
