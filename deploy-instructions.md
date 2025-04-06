
# تعليمات نشر موقع تأويل على سيرفر أباتشي

## متطلبات النشر

- سيرفر أباتشي (Apache) مُثبت ومُعد
- وحدة mod_rewrite مُفعلة في أباتشي
- وحدة mod_headers مُفعلة في أباتشي (مهم لأنواع MIME)
- وحدة mod_mime مُفعلة في أباتشي (مهم لأنواع MIME)
- Node.js و npm مثبتان على جهازك المحلي أو السيرفر لبناء المشروع

## خطوات النشر

### 1. بناء المشروع للإنتاج

```bash
# تثبيت الاعتمادات
npm install

# بناء التطبيق للإنتاج
npm run build
```

بعد الانتهاء من هذه العملية، سيتم إنشاء مجلد `dist` يحتوي على الملفات اللازمة للنشر.

### 2. رفع الملفات إلى السيرفر

قم برفع جميع محتويات مجلد `dist` إلى المجلد المخصص للويب في سيرفر أباتشي (غالباً `/var/www/html` أو المجلد المحدد لدومينك).

### 3. التأكد من تفعيل الوحدات المطلوبة في أباتشي

تأكد من أن الوحدات الضرورية مفعلة في سيرفر أباتشي:

```bash
# تفعيل الوحدات المطلوبة
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod mime
sudo a2enmod expires
sudo a2enmod deflate

# إعادة تشغيل أباتشي
sudo systemctl restart apache2
```

### 4. تكوين ملف .htaccess

تم تضمين ملف `.htaccess` في مجلد `public` ضمن المشروع. تأكد من أنه تم نقله إلى المجلد الجذر لموقعك على السيرفر.

### 5. إعداد متغيرات البيئة (اختياري)

يمكنك ضبط متغيرات البيئة لتكوين الاتصال بقاعدة البيانات. 

#### طريقة 1: إنشاء ملف .env.local (للبيئة المحلية)

```bash
DB_HOST=localhost
DB_USER=taweel_1
DB_PASSWORD=TLtyrBxFn3F4Hb4y
DB_NAME=taweel_1
DB_PORT=3306
```

#### طريقة 2: ضبط المتغيرات في ملف PHP (للإنتاج)

يمكنك إنشاء ملف PHP في المجلد الجذر يحتوي على تعريف متغيرات البيئة:

```php
<?php
// env.php
putenv("DB_HOST=localhost");
putenv("DB_USER=taweel_1");
putenv("DB_PASSWORD=TLtyrBxFn3F4Hb4y");
putenv("DB_NAME=taweel_1");
putenv("DB_PORT=3306");
?>
```

ثم قم بتضمين هذا الملف في بداية index.php:

```php
<?php
include 'env.php';
?>
<!DOCTYPE html>
<html>
...
```

### 6. تكوين الاتصال بقاعدة البيانات MySQL

تأكد من أن قاعدة البيانات MySQL متاحة وأن معلومات الاتصال في ملف `src/integrations/mysql/client.ts` صحيحة. الإعدادات الافتراضية هي:

```javascript
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "taweel_1";
const DB_PASSWORD = process.env.DB_PASSWORD || "TLtyrBxFn3F4Hb4y";
const DB_NAME = process.env.DB_NAME || "taweel_1";
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
```

### 7. التأكد من استخدام MySQL بدلاً من Supabase

افتح ملف `src/integrations/database.ts` وتأكد من أن `USE_MYSQL` مضبوط على `true`.

### 8. إنشاء جداول قاعدة البيانات المطلوبة

قم بإنشاء جداول قاعدة البيانات الضرورية باستخدام SQL. يمكنك استخدام phpMyAdmin أو أي أداة أخرى لإدارة قاعدة البيانات MySQL.

### 9. اختبار التطبيق

بعد الانتهاء من جميع الخطوات السابقة، قم بفتح موقعك على المتصفح وتأكد من أنه يعمل بشكل صحيح.

## استكشاف الأخطاء وإصلاحها

إذا واجهتك مشاكل، تحقق مما يلي:

1. هل أذونات الملفات صحيحة؟ تأكد من أن جميع الملفات والمجلدات لها الأذونات المناسبة.
   ```bash
   sudo chown -R www-data:www-data /var/www/html
   sudo chmod -R 755 /var/www/html
   ```

2. هل تم تكوين AllowOverride بشكل صحيح؟ افتح ملف تكوين الموقع في أباتشي وتأكد من وجود:
   ```
   <Directory /var/www/html>
       AllowOverride All
   </Directory>
   ```

3. هل هناك أخطاء في سجلات أباتشي؟ تحقق من سجلات الخطأ:
   ```bash
   tail -f /var/log/apache2/error.log
   ```

4. إصلاح مشكلات MIME:
   - تأكد من أن أباتشي يقدم ملفات JavaScript مع نوع MIME الصحيح
   - إذا استمرت المشكلة، يمكنك إضافة تكوينات إضافية إلى ملف ".htaccess" المذكور أعلاه
   - يمكنك التحقق من أنواع MIME التي يستخدمها الخادم عن طريق أدوات المطور في المتصفح

5. مشكلات الاتصال بقاعدة البيانات:
   - تأكد من أن خادم MySQL يعمل: `sudo systemctl status mysql`
   - تحقق من صحة بيانات الاتصال
   - تأكد من أن المستخدم لديه صلاحيات الوصول من عنوان IP الخادم
