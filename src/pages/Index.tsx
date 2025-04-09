
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import DreamForm from '@/components/DreamForm';
import { supabase } from '@/integrations/supabase/client';
import { HomeSectionItem } from '@/contexts/admin/types';

const Index = () => {
  const [sections, setSections] = useState<HomeSectionItem[]>([
    { id: 'hero', title: 'قسم الترحيب (Hero)', order: 1, visible: true },
    { id: 'tryIt', title: 'قسم تجربة الخدمة', order: 2, visible: true },
    { id: 'howItWorks', title: 'قسم كيف يعمل', order: 3, visible: true }
  ]);

  useEffect(() => {
    const fetchHomeSections = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'home_sections')
          .single();

        if (error) {
          console.error('Error fetching home sections:', error);
          return;
        }

        if (data && data.home_sections) {
          const parsedSections = typeof data.home_sections === 'string' 
            ? JSON.parse(data.home_sections)
            : data.home_sections;
          
          setSections(parsedSections);
        }
      } catch (error) {
        console.error('Error parsing home sections:', error);
      }
    };

    fetchHomeSections();
  }, []);

  // رتب الأقسام حسب الترتيب المحدد
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // تحقق من وجود كل قسم وإمكانية رؤيته
  const isVisible = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.visible : true;
  };

  // الحصول على محتوى القسم إن وجد
  const getSectionContent = (sectionId: string, field: string, defaultValue: string = '') => {
    const section = sections.find(s => s.id === sectionId);
    return section && section.content && section.content[field] ? section.content[field] : defaultValue;
  };

  // الحصول على نمط القسم (الألوان) إن وجد
  const getSectionStyle = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section && section.style ? section.style : {};
  };

  const heroStyle = getSectionStyle('hero');
  const tryItStyle = getSectionStyle('tryIt');
  const howItWorksStyle = getSectionStyle('howItWorks');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {isVisible('hero') && <Hero 
          title={getSectionContent('hero', 'title', 'فَسِّرْ حُلْمَكَ الآنَ!')}
          subtitle={getSectionContent('hero', 'subtitle', '~')}
          style={heroStyle}
        />}
        
        {isVisible('tryIt') && (
          <section 
            id="try-it" 
            className="py-16"
            style={{
              backgroundColor: tryItStyle.backgroundColor || '#f3f4f6',
              color: tryItStyle.textColor || '#000000'
            }}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 rtl">
                <h2 className="text-3xl font-bold mb-4">{getSectionContent('tryIt', 'title', '.  .  .')}</h2>
                <p className="max-w-2xl mx-auto" style={{ color: tryItStyle.textColor || '#000000' }}>
                  {getSectionContent('tryIt', 'subtitle', 'أدخل تفاصيل حلمك بالعربية الفصحى، واحصل على تفسير فوري باستخدام نموذج الذكاء الاصطناعي الخاص بنا "تأويل"')}
                </p>
              </div>
              <DreamForm />
            </div>
          </section>
        )}
        
        {isVisible('howItWorks') && (
          <section 
            className="py-20 rtl"
            style={{
              backgroundColor: howItWorksStyle.backgroundColor || '#ffffff',
              color: howItWorksStyle.textColor || '#000000'
            }}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">{getSectionContent('howItWorks', 'title', 'كيف يعمل تفسير الأحلام بالذكاء الاصطناعي؟')}</h2>
                <p className="max-w-2xl mx-auto" style={{ color: howItWorksStyle.textColor || '#000000' }}>
                  {getSectionContent('howItWorks', 'subtitle', 'نستخدم تقنيات الذكاء الاصطناعي المتقدمة مع مراجع التفسير الإسلامية الموثوقة')}
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
                  <h3 className="text-xl font-semibold mb-2">{getSectionContent('howItWorks', 'step1_title', '1. أدخل تفاصيل حلمك')}</h3>
                  <p style={{ color: howItWorksStyle.textColor || '#000000' }}>{getSectionContent('howItWorks', 'step1_text', 'قم بكتابة جميع تفاصيل حلمك، كلما كانت التفاصيل أكثر كان التفسير أدق.')}</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 16.7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-2m16-6-8-4-8 4m16 0-1.9 5.7a3 3 0 0 1-2.9 2.3H7.8a3 3 0 0 1-2.9-2.3L3 8.7m16 0v-.7a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v.7" />
                      <rect width="8" height="3" x="8" y="12" rx="1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{getSectionContent('howItWorks', 'step2_title', '2. معالجة الذكاء الاصطناعي')}</h3>
                  <p style={{ color: howItWorksStyle.textColor || '#000000' }}>{getSectionContent('howItWorks', 'step2_text', 'يقوم نظامنا بتحليل حلمك ومقارنته بآلاف التفسيرات من المراجع الموثوقة.')}</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{getSectionContent('howItWorks', 'step3_title', '3. احصل على التفسير')}</h3>
                  <p style={{ color: howItWorksStyle.textColor || '#000000' }}>{getSectionContent('howItWorks', 'step3_text', 'استلم تفسيراً دقيقاً لحلمك مع نصائح وتوجيهات مفيدة.')}</p>
                </div>
              </div>
              
              <div className="text-center mt-16">
                <p className="italic max-w-3xl mx-auto" style={{ color: howItWorksStyle.textColor || '#000000' }}>
                  {getSectionContent('howItWorks', 'quote', '"الرؤيا الصالحة من الله، والحلم من الشيطان، فإذا حلم أحدكم حلماً يخافه فليتفل عن يساره، وليستعذ بالله من شره، فإنه لا يضره"')}
                </p>
                <p className="mt-2" style={{ color: `${howItWorksStyle.textColor ? howItWorksStyle.textColor + '99' : '#00000099'}` }}>{getSectionContent('howItWorks', 'quote_author', '- حديث شريف')}</p>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
