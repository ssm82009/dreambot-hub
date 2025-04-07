
import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { Moon, Stars, SunMoon, ExternalLink } from 'lucide-react';

const Footer = () => {
  const { themeSettings } = useThemeSettings();
  const currentYear = new Date().getFullYear();

  const footerStyle = {
    backgroundColor: themeSettings.footerColor || 'var(--secondary)',
  };

  return (
    <footer className="text-secondary-foreground py-12 relative overflow-hidden" style={footerStyle}>
      {/* تأثيرات الخلفية */}
      <div className="absolute top-10 right-10 text-white/5 animate-float" style={{animationDelay: '0.8s'}}>
        <Stars size={60} />
      </div>
      <div className="absolute bottom-20 left-20 text-white/5 animate-float" style={{animationDelay: '1.2s'}}>
        <Moon size={80} />
      </div>
      <div className="absolute top-30 left-30 text-white/5 animate-float" style={{animationDelay: '2s'}}>
        <SunMoon size={50} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 rtl">
          <div className="space-y-4">
            <h3 className="title-font text-2xl font-bold">تفسير<span className="text-accent">الأحلام</span></h3>
            <p className="text-secondary-foreground/80 max-w-xs">
              منصة متخصصة في تفسير الأحلام باستخدام تقنيات الذكاء الاصطناعي المتقدمة استناداً إلى المراجع الإسلامية الموثوقة.
            </p>
            <div className="pt-4 flex items-center space-x-4 rtl:space-x-reverse">
              {themeSettings.twitterLink && (
                <a 
                  href={themeSettings.twitterLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors p-2 border border-secondary-foreground/20 rounded-full hover:border-accent"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                </a>
              )}
              {themeSettings.facebookLink && (
                <a 
                  href={themeSettings.facebookLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors p-2 border border-secondary-foreground/20 rounded-full hover:border-accent"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
              )}
              {themeSettings.instagramLink && (
                <a 
                  href={themeSettings.instagramLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors p-2 border border-secondary-foreground/20 rounded-full hover:border-accent"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-secondary-foreground/80 hover:text-accent transition-colors flex items-center gap-2 group">
                  <span className="inline-block transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </span>
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-secondary-foreground/80 hover:text-accent transition-colors flex items-center gap-2 group">
                  <span className="inline-block transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </span>
                  عن الخدمة
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-secondary-foreground/80 hover:text-accent transition-colors flex items-center gap-2 group">
                  <span className="inline-block transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </span>
                  الأسعار
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-secondary-foreground/80 hover:text-accent transition-colors flex items-center gap-2 group">
                  <span className="inline-block transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </span>
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-secondary-foreground/80 hover:text-accent transition-colors flex items-center gap-2 group">
                  <span className="inline-block transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </span>
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
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-3 text-secondary-foreground/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <a href="tel:+123456789" className="hover:text-accent transition-colors">+123 456 789</a>
              </div>
              <div className="flex items-center gap-3 text-secondary-foreground/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <a href="mailto:info@taweel.com" className="hover:text-accent transition-colors">info@taweel.com</a>
              </div>
              <div className="flex items-center gap-3 text-secondary-foreground/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>المملكة العربية السعودية، الرياض</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-secondary-foreground/10 mt-8 pt-8 text-center rtl">
          <p className="text-secondary-foreground/70">
            {themeSettings.footerText || `جميع الحقوق محفوظة © ${currentYear} تفسير الأحلام.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
