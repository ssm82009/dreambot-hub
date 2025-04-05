
import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Safely try to access the admin context without throwing an error
const safeUseAdmin = () => {
  try {
    // Using require to prevent import hoisting which could cause circular dependencies
    const { useAdmin } = require('@/contexts/admin');
    return useAdmin();
  } catch (error) {
    // Return default values if not in an AdminProvider context
    return {
      seoSettingsForm: {
        metaTitle: 'تأويل | تفسير فوري لـ الرؤى والأحلام',
        metaDescription: '',
        keywords: '',
        enableOpenGraph: false,
        enableTwitterCards: false,
        enableCanonicalUrls: false,
        googleAnalyticsId: '',
        customHeadTags: ''
      }
    };
  }
};

/**
 * Hook to manage page meta tags including title, description, and other SEO elements
 */
export const usePageMeta = () => {
  const { seoSettingsForm } = safeUseAdmin();
  const location = useLocation();

  // Use useLayoutEffect to update title as early as possible to prevent flickering
  useLayoutEffect(() => {
    // Update page title
    if (seoSettingsForm.metaTitle) {
      document.title = seoSettingsForm.metaTitle;
    }
  }, [seoSettingsForm.metaTitle]);

  useEffect(() => {
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    
    if (seoSettingsForm.metaDescription) {
      metaDescription.setAttribute('content', seoSettingsForm.metaDescription);
    }

    // Update keywords
    if (seoSettingsForm.keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', seoSettingsForm.keywords);
    }

    // Update Open Graph tags if enabled
    if (seoSettingsForm.enableOpenGraph) {
      // Update OG title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', seoSettingsForm.metaTitle || 'تفسير الأحلام');

      // Update OG description
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', seoSettingsForm.metaDescription || '');

      // Set OG URL to current URL
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', window.location.href);
    }

    // Twitter cards
    if (seoSettingsForm.enableTwitterCards) {
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
      twitterTitle.setAttribute('content', seoSettingsForm.metaTitle || 'تفسير الأحلام');

      // Twitter description
      let twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (!twitterDesc) {
        twitterDesc = document.createElement('meta');
        twitterDesc.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDesc);
      }
      twitterDesc.setAttribute('content', seoSettingsForm.metaDescription || '');
    }

    // Add canonical URL if enabled
    if (seoSettingsForm.enableCanonicalUrls) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', window.location.href);
    }

    // Add Google Analytics if provided
    if (seoSettingsForm.googleAnalyticsId && !document.querySelector(`script[src*="googletagmanager.com"]`)) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${seoSettingsForm.googleAnalyticsId}`;
      document.head.appendChild(gaScript);

      const gaConfig = document.createElement('script');
      gaConfig.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${seoSettingsForm.googleAnalyticsId}');
      `;
      document.head.appendChild(gaConfig);
    }

    // Add custom head tags if provided
    if (seoSettingsForm.customHeadTags) {
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = seoSettingsForm.customHeadTags;
      
      // Get all elements from the parsed HTML
      Array.from(tempDiv.children).forEach(element => {
        // Check if this element already exists with the same attributes
        // For simplicity, we'll just append it
        document.head.appendChild(element);
      });
    }

    // When unmounting, clean up any dynamically added elements
    return () => {
      // No cleanup needed for title since it's part of the document already
      // For advanced cleanup, you would need to keep track of which elements were added dynamically
    };
  }, [seoSettingsForm, location.pathname]);

  return null;
};
