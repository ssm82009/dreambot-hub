
import React, { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import { useDatabaseSettings } from '@/hooks/admin/useDatabaseSettings';
import { DatabaseType } from '@/integrations/database';
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
import { getDatabaseConfig as getMysqlConfig, updateDatabaseConfig as updateMysqlConfig } from '@/integrations/mysql/config';
import { getDatabaseConfig as getPgsqlConfig, updateDatabaseConfig as updatePgsqlConfig } from '@/integrations/pgsql/config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const DatabaseSettingsSection = () => {
  const { activeSections, toggleSection } = useAdmin();
  const { 
    activeDatabase, 
    setDatabaseType, 
    mysqlStatus, 
    pgsqlStatus,
    supabaseStatus, 
    isLoading, 
    isSyncing,
    syncProgress,
    testConnections,
    syncDatabases
  } = useDatabaseSettings();

  const [syncDirection, setSyncDirection] = useState<'secondary-to-supabase' | 'supabase-to-secondary'>('secondary-to-supabase');
  const [mysqlConfig, setMysqlConfig] = useState({
    host: '',
    port: 3306,
    user: '',
    password: '',
    database: '',
    connectionLimit: 10
  });

  const [pgsqlConfig, setPgsqlConfig] = useState({
    host: '',
    port: 5432,
    user: '',
    password: '',
    database: '',
    ssl: false
  });

  // جلب إعدادات قاعدة البيانات عند تحميل المكون
  useEffect(() => {
    try {
      const mysqlCfg = getMysqlConfig();
      setMysqlConfig({
        host: mysqlCfg.host,
        port: mysqlCfg.port,
        user: mysqlCfg.user,
        password: mysqlCfg.password === "********" ? '' : mysqlCfg.password,
        database: mysqlCfg.database,
        connectionLimit: 10
      });

      const pgsqlCfg = getPgsqlConfig();
      setPgsqlConfig({
        host: pgsqlCfg.host,
        port: pgsqlCfg.port,
        user: pgsqlCfg.user,
        password: pgsqlCfg.password === "********" ? '' : pgsqlCfg.password,
        database: pgsqlCfg.database,
        ssl: pgsqlCfg.ssl || false
      });
    } catch (error) {
      console.error('خطأ في جلب إعدادات قاعدة البيانات:', error);
    }
  }, []);

  // التبديل بين قواعد البيانات
  const handleDatabaseChange = async (value: DatabaseType) => {
    const success = await setDatabaseType(value);
    if (success) {
      let dbName = '';
      if (value === 'mysql') dbName = 'MySQL';
      else if (value === 'pgsql') dbName = 'PostgreSQL';
      else dbName = 'Supabase';

      toast.success(`تم تفعيل استخدام قاعدة بيانات ${dbName}`);
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
      const secondaryDb = activeDatabase === 'supabase' ? 
        (pgsqlStatus.success ? 'PostgreSQL' : 'MySQL') : 
        (activeDatabase === 'pgsql' ? 'PostgreSQL' : 'MySQL');
        
      toast.info(`بدء المزامنة من ${syncDirection === 'secondary-to-supabase' ? secondaryDb + ' إلى Supabase' : 'Supabase إلى ' + secondaryDb}`);
      await syncDatabases(syncDirection);
      toast.success('تمت المزامنة بنجاح');
    } catch (error) {
      toast.error('فشلت عملية المزامنة');
      console.error('خطأ في المزامنة:', error);
    }
  };

  // تحديث إعدادات MySQL
  const handleMySqlConfigUpdate = () => {
    try {
      // تحديث الإعدادات
      updateMysqlConfig(mysqlConfig);
      toast.success('تم تحديث إعدادات قاعدة بيانات MySQL بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث إعدادات قاعدة البيانات');
      console.error('خطأ في تحديث إعدادات قاعدة البيانات:', error);
    }
  };

  // تحديث إعدادات PostgreSQL
  const handlePgSqlConfigUpdate = () => {
    try {
      // تحديث الإعدادات
      updatePgsqlConfig(pgsqlConfig);
      toast.success('تم تحديث إعدادات قاعدة بيانات PostgreSQL بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث إعدادات قاعدة البيانات');
      console.error('خطأ في تحديث إعدادات قاعدة البيانات:', error);
    }
  };

  const handleMysqlInputChange = (field: string, value: string | number) => {
    setMysqlConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePgsqlInputChange = (field: string, value: string | number | boolean) => {
    setPgsqlConfig(prev => ({
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
              اختر قاعدة البيانات التي تريد استخدامها. يمكنك التبديل بين قواعد البيانات المختلفة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={activeDatabase} 
              onValueChange={(value) => handleDatabaseChange(value as DatabaseType)} 
              className="space-y-4"
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <RadioGroupItem value="supabase" id="supabase" disabled={isLoading} />
                <Label htmlFor="supabase" className="flex flex-col">
                  <span className="font-medium">Supabase</span>
                  <span className="text-sm text-muted-foreground">
                    قاعدة بيانات سحابية مع واجهات برمجة تطبيقات جاهزة (الافتراضية)
                  </span>
                </Label>
                <div className={`mr-auto text-sm ${supabaseStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                  {supabaseStatus.success ? 'متصل' : 'غير متصل'}
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <RadioGroupItem value="mysql" id="mysql" disabled={isLoading} />
                <Label htmlFor="mysql" className="flex flex-col">
                  <span className="font-medium">MySQL</span>
                  <span className="text-sm text-muted-foreground">
                    قاعدة بيانات MySQL العلائقية
                  </span>
                </Label>
                <div className={`mr-auto text-sm ${mysqlStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                  {mysqlStatus.success ? 'متصل' : 'غير متصل'}
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <RadioGroupItem value="pgsql" id="pgsql" disabled={isLoading} />
                <Label htmlFor="pgsql" className="flex flex-col">
                  <span className="font-medium">PostgreSQL</span>
                  <span className="text-sm text-muted-foreground">
                    قاعدة بيانات PostgreSQL العلائقية المتقدمة
                  </span>
                </Label>
                <div className={`mr-auto text-sm ${pgsqlStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                  {pgsqlStatus.success ? 'متصل' : 'غير متصل'}
                </div>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleTestConnections} 
              disabled={isLoading}
              className="w-full"
            >
              اختبار الاتصال بجميع قواعد البيانات
            </Button>
          </CardFooter>
        </Card>

        {/* إعدادات قواعد البيانات */}
        <Tabs defaultValue="mysql">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="mysql">إعدادات MySQL</TabsTrigger>
            <TabsTrigger value="pgsql">إعدادات PostgreSQL</TabsTrigger>
          </TabsList>
          
          {/* قسم إعدادات MySQL */}
          <TabsContent value="mysql">
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
                      onChange={(e) => handleMysqlInputChange('host', e.target.value)}
                      placeholder="مثال: localhost أو 173.249.0.2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mysql-port">رقم المنفذ (Port)</Label>
                    <Input 
                      id="mysql-port" 
                      type="number"
                      value={mysqlConfig.port}
                      onChange={(e) => handleMysqlInputChange('port', parseInt(e.target.value) || 3306)}
                      placeholder="3306"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mysql-user">اسم المستخدم</Label>
                    <Input 
                      id="mysql-user" 
                      value={mysqlConfig.user}
                      onChange={(e) => handleMysqlInputChange('user', e.target.value)}
                      placeholder="اسم المستخدم"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mysql-password">كلمة المرور</Label>
                    <Input 
                      id="mysql-password" 
                      type="password"
                      value={mysqlConfig.password}
                      onChange={(e) => handleMysqlInputChange('password', e.target.value)}
                      placeholder="كلمة المرور"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mysql-database">اسم قاعدة البيانات</Label>
                    <Input 
                      id="mysql-database" 
                      value={mysqlConfig.database}
                      onChange={(e) => handleMysqlInputChange('database', e.target.value)}
                      placeholder="اسم قاعدة البيانات"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleMySqlConfigUpdate} 
                  className="w-full"
                >
                  حفظ إعدادات MySQL
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* قسم إعدادات PostgreSQL */}
          <TabsContent value="pgsql">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات اتصال PostgreSQL</CardTitle>
                <CardDescription>
                  تعديل إعدادات الاتصال بقاعدة بيانات PostgreSQL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pgsql-host">عنوان الخادم (Host)</Label>
                    <Input 
                      id="pgsql-host" 
                      value={pgsqlConfig.host}
                      onChange={(e) => handlePgsqlInputChange('host', e.target.value)}
                      placeholder="مثال: localhost أو 127.0.0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pgsql-port">رقم المنفذ (Port)</Label>
                    <Input 
                      id="pgsql-port" 
                      type="number"
                      value={pgsqlConfig.port}
                      onChange={(e) => handlePgsqlInputChange('port', parseInt(e.target.value) || 5432)}
                      placeholder="5432"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pgsql-user">اسم المستخدم</Label>
                    <Input 
                      id="pgsql-user" 
                      value={pgsqlConfig.user}
                      onChange={(e) => handlePgsqlInputChange('user', e.target.value)}
                      placeholder="اسم المستخدم"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pgsql-password">كلمة المرور</Label>
                    <Input 
                      id="pgsql-password" 
                      type="password"
                      value={pgsqlConfig.password}
                      onChange={(e) => handlePgsqlInputChange('password', e.target.value)}
                      placeholder="كلمة المرور"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pgsql-database">اسم قاعدة البيانات</Label>
                    <Input 
                      id="pgsql-database" 
                      value={pgsqlConfig.database}
                      onChange={(e) => handlePgsqlInputChange('database', e.target.value)}
                      placeholder="اسم قاعدة البيانات"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pgsql-ssl">استخدام SSL</Label>
                      <Switch 
                        id="pgsql-ssl"
                        checked={pgsqlConfig.ssl} 
                        onCheckedChange={(checked) => handlePgsqlInputChange('ssl', checked)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      تمكين اتصال آمن عبر SSL
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handlePgSqlConfigUpdate} 
                  className="w-full"
                >
                  حفظ إعدادات PostgreSQL
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* قسم حالة الاتصال */}
        <Card>
          <CardHeader>
            <CardTitle>حالة الاتصال</CardTitle>
            <CardDescription>
              التحقق من حالة اتصال قواعد البيانات.
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

            {/* حالة اتصال PostgreSQL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">PostgreSQL</div>
                <div className={`text-sm ${pgsqlStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                  {pgsqlStatus.success ? 'متصل' : 'غير متصل'}
                </div>
              </div>
              {pgsqlStatus.message && (
                <Alert variant={pgsqlStatus.success ? "default" : "destructive"} className="text-sm py-2">
                  <AlertDescription>
                    {pgsqlStatus.message}
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
              مزامنة البيانات بين قواعد البيانات.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={syncDirection === 'secondary-to-supabase' ? 'default' : 'outline'}
                onClick={() => setSyncDirection('secondary-to-supabase')}
                disabled={isSyncing}
                className="w-full"
              >
                من {activeDatabase === 'supabase' ? (pgsqlStatus.success ? 'PostgreSQL' : 'MySQL') : (activeDatabase === 'pgsql' ? 'PostgreSQL' : 'MySQL')} إلى Supabase
              </Button>
              <Button
                variant={syncDirection === 'supabase-to-secondary' ? 'default' : 'outline'}
                onClick={() => setSyncDirection('supabase-to-secondary')}
                disabled={isSyncing}
                className="w-full"
              >
                من Supabase إلى {activeDatabase === 'supabase' ? (pgsqlStatus.success ? 'PostgreSQL' : 'MySQL') : (activeDatabase === 'pgsql' ? 'PostgreSQL' : 'MySQL')}
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
              disabled={isSyncing || (!pgsqlStatus.success && !mysqlStatus.success) || !supabaseStatus.success}
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
