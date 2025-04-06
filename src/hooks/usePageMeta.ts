import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to manage page meta tags including title, description, and other SEO elements
 */
export const usePageMeta = () => {
  const location = useLocation();
  
  // محاولة استخدام سياق الإدارة، ولكن بطريقة تجنب الأخطاء إذا لم يكن موجوداً
  let seoSettings;
  try {
    // Import the admin context dynamically to prevent errors
    const { useAdmin } = require('@/contexts/admin');
    const adminContext = useAdmin();
    seoSettings = adminContext?.seoSettingsForm;
  } catch (error) {
    // إذا لم يكن السياق متاحاً، تابع التنفيذ دون أخطاء
    console.log('Admin context not available, using default SEO settings');
  }

  useEffect(() => {
    // تعيين عنوان الصفحة الافتراضي إذا لم يكن سياق الإدارة متاحاً
    const defaultTitle = 'تأويل | تفسير فوري لـ الرؤى والأحلام';
    const defaultDescription = 'موقع متخصص في تفسير الأحلام والرؤى وفق المراجع الإسلامية والعلمية.';
    
    // تحديث عنوان الصفحة
    document.title = seoSettings?.metaTitle || defaultTitle;

    // تحديث وصف الصفحة
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    
    metaDescription.setAttribute('content', seoSettings?.metaDescription || defaultDescription);

    // تحديث الكلمات المفتاحية
    if (seoSettings?.keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', seoSettings.keywords);
    }

    // تحديث علامات Open Graph إذا كانت مفعلة
    if (!seoSettings || seoSettings.enableOpenGraph) {
      // تحديث عنوان OG
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', seoSettings?.metaTitle || defaultTitle);

      // تحديث وصف OG
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', seoSettings?.metaDescription || defaultDescription);

      // تعيين رابط OG للصفحة الحالية
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', window.location.href);
    }

    // تحديث إعدادات بطاقات Twitter
    if (seoSettings?.enableTwitterCards) {
      // Set Twitter card type
      let twitterCard = document.querySelector('meta[name="twitter:card"]');
      if (!twitterCard) {
        twitterCard = document.createElement('meta');
        twitterCard.setAttribute('name', 'twitter:card');
        document.head.appendChild(twitterCard);
      }
      twitterCard.setAttribute('content', 'summary_large_image');

      // Twitter title
      let twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (!twitterTitle) {
        twitterTitle = document.createElement('meta');
        twitterTitle.setAttribute('name', 'twitter:title');
        document.head.appendChild(twitterTitle);
      }
      twitterTitle.setAttribute('content', seoSettings.metaTitle || 'تفسير الأحلام');

      // Twitter description
      let twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (!twitterDesc) {
        twitterDesc = document.createElement('meta');
        twitterDesc.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDesc);
      }
      twitterDesc.setAttribute('content', seoSettings.metaDescription || '');
    }

    // إضافة رابط الصفحة الحالي (canonical) إذا كان مفعلاً
    if (seoSettings?.enableCanonicalUrls) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', window.location.href);
    }

    // إضافة Google Analytics إذا تم توفير معرف
    if (seoSettings?.googleAnalyticsId && !document.querySelector(`script[src*="googletagmanager.com"]`)) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${seoSettings.googleAnalyticsId}`;
      document.head.appendChild(gaScript);

      const gaConfig = document.createElement('script');
      gaConfig.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${seoSettings.googleAnalyticsId}');
      `;
      document.head.appendChild(gaConfig);
    }

    // إضافة علامات HTML مخصصة إذا تم توفيرها
    if (seoSettings?.customHeadTags) {
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = seoSettings.customHeadTags;
      
      // Get all elements from the parsed HTML
      Array.from(tempDiv.children).forEach(element => {
        // Check if this element already exists with the same attributes
        // For simplicity, we'll just append it
        document.head.appendChild(element);
      });
    }

    // عند إلغاء تركيب المكون، نظف أي عناصر أُضيفت ديناميكياً
    return () => {
      // No cleanup needed for title since it's part of the document already
      // For advanced cleanup, you would need to keep track of which elements were added dynamically
    };
  }, [seoSettings, location.pathname]);

  return null;
};
