
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import DreamForm from '@/components/DreamForm';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <section id="try-it" className="py-16 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 rtl">
              <h2 className="text-3xl font-bold mb-4">جرب خدمة تفسير الأحلام</h2>
              <p className="text-foreground/80 max-w-2xl mx-auto">
                أدخل تفاصيل حلمك واحصل على تفسير فوري من نظام الذكاء الاصطناعي الخاص بنا
              </p>
            </div>
            <DreamForm />
          </div>
        </section>
        
        <section className="py-20 rtl">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">كيف يعمل تفسير الأحلام بالذكاء الاصطناعي؟</h2>
              <p className="text-foreground/80 max-w-2xl mx-auto">
                نستخدم تقنيات الذكاء الاصطناعي المتقدمة مع مراجع التفسير الإسلامية الموثوقة
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 9h10" />
                    <path d="M7 12h5" />
                    <path d="M7 15h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">1. أدخل تفاصيل حلمك</h3>
                <p className="text-foreground/70">قم بكتابة جميع تفاصيل حلمك، كلما كانت التفاصيل أكثر كان التفسير أدق.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 16.7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-2m16-6-8-4-8 4m16 0-1.9 5.7a3 3 0 0 1-2.9 2.3H7.8a3 3 0 0 1-2.9-2.3L3 8.7m16 0v-.7a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v.7" />
                    <rect width="8" height="3" x="8" y="12" rx="1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">2. معالجة الذكاء الاصطناعي</h3>
                <p className="text-foreground/70">يقوم نظامنا بتحليل حلمك ومقارنته بآلاف التفسيرات من المراجع الموثوقة.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">3. احصل على التفسير</h3>
                <p className="text-foreground/70">استلم تفسيراً دقيقاً لحلمك مع نصائح وتوجيهات مفيدة.</p>
              </div>
            </div>
            
            <div className="text-center mt-16">
              <p className="text-foreground/80 italic max-w-3xl mx-auto">
                "الرؤيا الصالحة من الله، والحلم من الشيطان، فإذا حلم أحدكم حلماً يخافه فليتفل عن يساره، وليستعذ بالله من شره، فإنه لا يضره"
              </p>
              <p className="mt-2 text-foreground/60">- حديث شريف</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
