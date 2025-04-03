
import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeSettings } from '@/hooks/useThemeSettings';

const Footer = () => {
  const { themeSettings } = useThemeSettings();

  const footerStyle = {
    backgroundColor: themeSettings.footerColor || 'var(--secondary)',
  };

  return (
    <footer className="text-secondary-foreground py-12" style={footerStyle}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 rtl">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">تفسير<span className="text-accent">الأحلام</span></h3>
            <p className="text-secondary-foreground/80 max-w-xs">
              منصة متخصصة في تفسير الأحلام باستخدام تقنيات الذكاء الاصطناعي المتقدمة استناداً إلى المراجع الإسلامية الموثوقة.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-secondary-foreground/80 hover:text-accent transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-secondary-foreground/80 hover:text-accent transition-colors">
                  عن الخدمة
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-secondary-foreground/80 hover:text-accent transition-colors">
                  الأسعار
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-secondary-foreground/80 hover:text-accent transition-colors">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-secondary-foreground/80 hover:text-accent transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">تواصل معنا</h3>
            <p className="text-secondary-foreground/80">
              لأي استفسارات أو مساعدة، لا تتردد في التواصل معنا
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              {themeSettings.socialLinks.twitter && (
                <a 
                  href={themeSettings.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                </a>
              )}
              {themeSettings.socialLinks.facebook && (
                <a 
                  href={themeSettings.socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
              )}
              {themeSettings.socialLinks.instagram && (
                <a 
                  href={themeSettings.socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-secondary-foreground/10 mt-8 pt-8 text-center rtl">
          <p className="text-secondary-foreground/80">
            {themeSettings.footerText || `&copy; ${new Date().getFullYear()} تفسير الأحلام. جميع الحقوق محفوظة.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
