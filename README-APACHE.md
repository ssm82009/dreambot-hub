
# تشغيل تطبيق تأويل على سيرفر أباتشي

هذا الدليل يوضح كيفية تشغيل تطبيق تأويل على سيرفر أباتشي (Apache).

## متطلبات النظام

- أباتشي 2.4 أو أعلى
- PHP 7.4 أو أعلى (اختياري، مطلوب فقط إذا كنت بحاجة إلى خدمات الواجهة الخلفية PHP)
- وحدات أباتشي المطلوبة:
  - mod_rewrite
  - mod_headers
  - mod_deflate
  - mod_mime

## خطوات التثبيت

### 1. تثبيت وتكوين أباتشي

```bash
# تثبيت أباتشي على أوبونتو/ديبيان
sudo apt update
sudo apt install apache2

# تفعيل الوحدات المطلوبة
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod deflate
sudo a2enmod mime
sudo systemctl restart apache2
```

### 2. نشر التطبيق

يمكنك استخدام سكريبت النشر المضمن:

```bash
# جعل السكريبت قابل للتنفيذ
chmod +x deploy.sh

# تنفيذ سكريبت النشر
./deploy.sh
```

أو يمكنك اتباع هذه الخطوات يدوياً:

1. قم ببناء التطبيق:
```bash
npm run build
```

2. انسخ محتويات مجلد `dist` إلى مجلد الويب الخاص بك:
```bash
sudo mkdir -p /var/www/html/taweel
sudo cp -r dist/* /var/www/html/taweel/
sudo cp .htaccess /var/www/html/taweel/
```

3. اضبط الصلاحيات:
```bash
sudo chown -R www-data:www-data /var/www/html/taweel
sudo chmod -R 755 /var/www/html/taweel
```

### 3. إعداد Virtual Host

1. انسخ ملف `apache-vhost.conf` إلى مجلد تكوين أباتشي:
```bash
sudo cp apache-vhost.conf /etc/apache2/sites-available/taweel.conf
```

2. قم بتعديل الملف لاستخدام اسم المجال الخاص بك.

3. قم بتفعيل الموقع وإعادة تشغيل أباتشي:
```bash
sudo a2ensite taweel.conf
sudo systemctl restart apache2
```

### 4. اختبار التثبيت

يمكنك التحقق من إعدادات PHP عن طريق الوصول إلى:
```
http://yourdomain.com/php_info.php
```

لا تنس حذف هذا الملف بعد الاختبار لأسباب أمنية:
```bash
sudo rm /var/www/html/taweel/php_info.php
```

## ملاحظات هامة

1. تأكد من تعديل ملف `.htaccess` إذا كنت بحاجة إلى إعدادات مخصصة.
2. قد تحتاج إلى تعديل إعدادات CSP في `.htaccess` بناءً على متطلبات التطبيق.
3. للمواقع الإنتاجية، يوصى بشدة بتكوين HTTPS باستخدام Let's Encrypt أو شهادة SSL أخرى.

## إعداد HTTPS (موصى به)

```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

سيقوم Certbot تلقائياً بتكوين أباتشي لاستخدام HTTPS وتجديد الشهادة عند الحاجة.
