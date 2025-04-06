
#!/bin/bash

# سكريبت النشر على سيرفر أباتشي
echo "بدء عملية النشر على سيرفر أباتشي..."

# بناء التطبيق للإنتاج
echo "جاري بناء التطبيق..."
npm run build

# إنشاء مجلد النشر إذا لم يكن موجوداً
DEPLOY_DIR="/var/www/html/taweel"
sudo mkdir -p $DEPLOY_DIR

# نسخ الملفات إلى مجلد النشر
echo "جاري نسخ الملفات..."
sudo cp -r dist/* $DEPLOY_DIR/
sudo cp .htaccess $DEPLOY_DIR/

# ضبط الصلاحيات
echo "جاري ضبط الصلاحيات..."
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR

echo "تم النشر بنجاح على $DEPLOY_DIR"
echo "يمكنك الوصول إلى التطبيق عبر: http://your-domain.com"
