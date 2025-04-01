
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 rtl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 gradient-text">عن منصة تفسير الأحلام</h1>
              <p className="text-xl text-foreground/80">
                تعرف على منصتنا وكيف نستخدم الذكاء الاصطناعي لتفسير الأحلام بدقة
              </p>
            </div>
            
            <div className="prose prose-lg prose-blue max-w-none">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">مرحبًا بك في منصة تفسير الأحلام</h2>
              <p className="mb-6 text-foreground/80">
                منصة تفسير الأحلام هي خدمة مبتكرة تجمع بين المعرفة التقليدية لتفسير الأحلام والتكنولوجيا الحديثة للذكاء الاصطناعي. 
                نحن نهدف إلى تقديم تفسيرات دقيقة ومفيدة للأحلام استنادًا إلى المراجع الإسلامية الموثوقة ومصادر التفسير المعتمدة.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 mt-10 text-foreground">رؤيتنا</h2>
              <p className="mb-6 text-foreground/80">
                نسعى لأن نكون المنصة الرائدة في مجال تفسير الأحلام بالذكاء الاصطناعي، مع الحفاظ على الأصالة والموثوقية في التفسيرات المقدمة.
                هدفنا هو مساعدة الناس على فهم أحلامهم بشكل أفضل وتقديم رؤى قيمة يمكن أن تساعدهم في حياتهم اليومية.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 mt-10 text-foreground">كيف يعمل نظامنا</h2>
              <p className="mb-4 text-foreground/80">
                يستخدم نظامنا الذكاء الاصطناعي المتقدم الذي تم تدريبه على آلاف التفسيرات من المصادر الإسلامية الموثوقة مثل:
              </p>
              <ul className="list-disc list-inside mb-6 text-foreground/80">
                <li>تفسير ابن سيرين</li>
                <li>تفسير النابلسي</li>
                <li>تفسير ابن شاهين</li>
                <li>وغيرها من كتب التفسير المعتمدة</li>
              </ul>
              <p className="mb-6 text-foreground/80">
                عندما تقوم بإدخال حلمك، يقوم النظام بتحليل العناصر الرئيسية في الحلم ومقارنتها مع قاعدة البيانات الخاصة بنا، 
                ثم يقدم تفسيرًا شاملًا ودقيقًا يتناسب مع سياق الحلم والرموز الموجودة فيه.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 mt-10 text-foreground">فريق العمل</h2>
              <p className="mb-6 text-foreground/80">
                يتكون فريقنا من خبراء في مجال الذكاء الاصطناعي ومتخصصين في علم النفس وعلماء دين متخصصين في تفسير الأحلام. 
                نعمل معًا لضمان تقديم أفضل خدمة ممكنة لمستخدمينا.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4 mt-10 text-foreground">التزامنا</h2>
              <p className="mb-6 text-foreground/80">
                نحن ملتزمون بتقديم خدمة عالية الجودة وتحسين نظامنا باستمرار. نأخذ ملاحظات المستخدمين على محمل الجد ونعمل على تطوير المنصة بناءً على احتياجاتهم.
                كما نلتزم بالحفاظ على خصوصية مستخدمينا وأمان بياناتهم.
              </p>
              
              <blockquote className="border-r-4 border-primary pr-6 my-8 italic">
                <p className="text-foreground/80">"الرؤيا جزء من ستة وأربعين جزءًا من النبوة"</p>
                <footer className="text-foreground/60">- حديث شريف</footer>
              </blockquote>
              
              <h2 className="text-2xl font-semibold mb-4 mt-10 text-foreground">ابدأ اليوم</h2>
              <p className="mb-6 text-foreground/80">
                نحن ندعوك لتجربة منصتنا والاستفادة من خدماتنا. سواء كنت تبحث عن تفسير لحلم واحد أو ترغب في الاشتراك في خطة مستمرة، 
                لدينا الخيار المناسب لك.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
