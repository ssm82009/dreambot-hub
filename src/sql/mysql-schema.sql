
-- إنشاء جداول قاعدة بيانات MySQL مطابقة لجداول Supabase
-- هذا الملف يحتوي على كل تعريفات الجداول المطلوبة لتشغيل التطبيق على MySQL

-- إعدادات الذكاء الاصطناعي
CREATE TABLE IF NOT EXISTS `ai_settings` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `provider` VARCHAR(255) NOT NULL DEFAULT 'together',
  `api_key` TEXT NOT NULL,
  `model` VARCHAR(255) NOT NULL DEFAULT 'meta-llama/Llama-3-8b-chat-hf',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- الصفحات المخصصة
CREATE TABLE IF NOT EXISTS `custom_pages` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `title` TEXT NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `custom_pages_slug_unique` (`slug`)
);

-- رموز الأحلام
CREATE TABLE IF NOT EXISTS `dream_symbols` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `symbol` VARCHAR(255) NOT NULL,
  `interpretation` TEXT NOT NULL,
  `category` VARCHAR(255) NULL
);

-- الأحلام
CREATE TABLE IF NOT EXISTS `dreams` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NULL,
  `dream_text` TEXT NOT NULL,
  `interpretation` TEXT NOT NULL,
  `tags` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- إعدادات التفسير
CREATE TABLE IF NOT EXISTS `interpretation_settings` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `max_input_words` INT NOT NULL DEFAULT 500,
  `min_output_words` INT NOT NULL DEFAULT 300,
  `max_output_words` INT NOT NULL DEFAULT 1000,
  `system_instructions` TEXT NOT NULL DEFAULT 'أنت مفسر أحلام خبير. يجب أن تقدم تفسيرات دقيقة وشاملة استناداً إلى المراجع الإسلامية والعلمية.',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- روابط شريط التنقل
CREATE TABLE IF NOT EXISTS `navbar_links` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `title` TEXT NOT NULL,
  `url` TEXT NOT NULL,
  `order` INT NOT NULL,
  `is_admin_only` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- فواتير الدفع
CREATE TABLE IF NOT EXISTS `payment_invoices` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `invoice_id` VARCHAR(255) NOT NULL,
  `user_id` VARCHAR(36) NULL,
  `plan_name` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NULL
);

-- جلسات الدفع
CREATE TABLE IF NOT EXISTS `payment_sessions` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `plan_type` VARCHAR(50) NOT NULL,
  `session_id` VARCHAR(255) NULL,
  `completed` BOOLEAN NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL 1 HOUR),
  `transaction_identifier` VARCHAR(255) NULL,
  `status` VARCHAR(50) NULL DEFAULT 'pending'
);

-- إعدادات الدفع
CREATE TABLE IF NOT EXISTS `payment_settings` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `paylink_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `paylink_api_key` TEXT NULL,
  `paylink_secret_key` TEXT NULL,
  `paypal_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
  `paypal_client_id` TEXT NULL,
  `paypal_secret` TEXT NULL,
  `paypal_sandbox` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- إعدادات التسعير
CREATE TABLE IF NOT EXISTS `pricing_settings` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `free_plan_price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `free_plan_interpretations` INT NOT NULL DEFAULT 3,
  `free_plan_features` TEXT NOT NULL DEFAULT 'تفسير أساسي للأحلام
دعم عبر البريد الإلكتروني',
  `free_plan_name` VARCHAR(255) NOT NULL DEFAULT 'المجاني',
  `premium_plan_price` DECIMAL(10,2) NOT NULL DEFAULT 49,
  `premium_plan_interpretations` INT NOT NULL DEFAULT -1,
  `premium_plan_features` TEXT NOT NULL DEFAULT 'تفسيرات أحلام غير محدودة
تفسيرات مفصلة ومعمقة
أرشيف لتفسيرات أحلامك السابقة
نصائح وتوجيهات شخصية
دعم فني على مدار الساعة',
  `premium_plan_name` VARCHAR(255) NOT NULL DEFAULT 'المميز',
  `pro_plan_price` DECIMAL(10,2) NOT NULL DEFAULT 99,
  `pro_plan_interpretations` INT NOT NULL DEFAULT -1,
  `pro_plan_features` TEXT NOT NULL DEFAULT 'كل مميزات الخطة المميزة
استشارات شخصية مع خبراء تفسير الأحلام
تقارير تحليلية شهرية
إمكانية إضافة 5 حسابات فرعية
واجهة برمجة التطبيقات API',
  `pro_plan_name` VARCHAR(255) NOT NULL DEFAULT 'الاحترافي',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- إعدادات الموقع
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `home_sections` JSON NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- إعدادات المظهر والSEO
CREATE TABLE IF NOT EXISTS `theme_settings` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `primary_color` VARCHAR(50) NOT NULL DEFAULT '#9b87f5',
  `button_color` VARCHAR(50) NOT NULL DEFAULT '#9b87f5',
  `text_color` VARCHAR(50) NOT NULL DEFAULT '#1A1F2C',
  `background_color` VARCHAR(50) NOT NULL DEFAULT '#F9F9F9',
  `logo_text` VARCHAR(255) NOT NULL DEFAULT 'تفسير الأحلام',
  `logo_font_size` INT NOT NULL DEFAULT 24,
  `header_color` VARCHAR(50) NOT NULL DEFAULT '#FFFFFF',
  `footer_color` VARCHAR(50) NOT NULL DEFAULT '#1A1F2C',
  `footer_text` TEXT NOT NULL DEFAULT 'جميع الحقوق محفوظة © 2024 تفسير الأحلام',
  `twitter_link` TEXT NULL,
  `facebook_link` TEXT NULL,
  `instagram_link` TEXT NULL,
  `meta_title` TEXT NULL DEFAULT 'تفسير الأحلام - موقع تفسير الرؤى والأحلام',
  `meta_description` TEXT NULL DEFAULT 'موقع متخصص في تفسير الأحلام والرؤى وفق المراجع الإسلامية والعلمية. احصل على تفسير حلمك الآن.',
  `keywords` TEXT NULL DEFAULT 'تفسير الأحلام, تفسير الرؤى, تفسير حلم, تفسير منام, رؤيا في المنام',
  `google_analytics_id` TEXT NULL DEFAULT '',
  `slug` TEXT NULL DEFAULT 'تفسير الأحلام عبر الذكاء الاصطناعي',
  `enable_canonical_urls` BOOLEAN NULL DEFAULT TRUE,
  `enable_robots_txt` BOOLEAN NULL DEFAULT TRUE,
  `enable_sitemap` BOOLEAN NULL DEFAULT TRUE,
  `enable_twitter_cards` BOOLEAN NULL DEFAULT TRUE,
  `enable_open_graph` BOOLEAN NULL DEFAULT TRUE,
  `custom_head_tags` TEXT NULL DEFAULT '',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ردود التذاكر
CREATE TABLE IF NOT EXISTS `ticket_replies` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `ticket_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- التذاكر
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `title` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'open',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- المستخدمين
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'user',
  `subscription_type` VARCHAR(50) NULL DEFAULT 'free',
  `subscription_expires_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `users_email_unique` (`email`)
);

-- إضافة دالة للتعامل مع أحدث فواتير الدفع (مشابهة للدالة في Supabase)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS get_latest_payment_invoices()
BEGIN
    WITH latest_invoices AS (
        SELECT DISTINCT invoice_id, MAX(created_at) as max_date
        FROM payment_invoices
        GROUP BY invoice_id
    )
    SELECT pi.*
    FROM payment_invoices pi
    INNER JOIN latest_invoices li ON pi.invoice_id = li.invoice_id AND pi.created_at = li.max_date
    ORDER BY pi.created_at DESC;
END //
DELIMITER ;

