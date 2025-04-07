
import React from 'react';
import Navbar, { NAVBAR_HEIGHT } from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { FileText, Shield } from 'lucide-react';

const Terms = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16" style={{ paddingTop: `${NAVBAR_HEIGHT + 64}px` }}>
        <Card className="shadow-lg rtl">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">شروط الاستخدام</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">مقدمة</h2>
              <p className="leading-relaxed">
                مرحباً بك في منصة تفسير الأحلام. باستخدامك لهذه المنصة، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية.
              </p>

              <h2 className="text-xl font-semibold mt-6">قبول الشروط</h2>
              <p className="leading-relaxed">
                من خلال الوصول إلى هذا الموقع واستخدامه، فإنك توافق على الالتزام بهذه الشروط والأحكام وسياسة الخصوصية المطبقة. إذا كنت لا توافق على أي جزء من هذه الشروط، فلا يجوز لك استخدام خدماتنا.
              </p>

              <h2 className="text-xl font-semibold mt-6">التسجيل والحسابات</h2>
              <p className="leading-relaxed">
                عند إنشاء حساب على منصتنا، فإنك مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور، وكذلك عن تقييد الوصول إلى جهاز الكمبيوتر الخاص بك. وتوافق على تحمل المسؤولية عن جميع الأنشطة التي تتم من خلال حسابك.
              </p>
              
              <h2 className="text-xl font-semibold mt-6">الخدمات والدفع</h2>
              <p className="leading-relaxed">
                تقدم منصة تفسير الأحلام مجموعة من الخطط والباقات بأسعار مختلفة. يجب الدفع مقدمًا لجميع الخطط المدفوعة. نحتفظ بالحق في تغيير أسعارنا في أي وقت.
              </p>
              
              <h2 className="text-xl font-semibold mt-6">حقوق الملكية الفكرية</h2>
              <p className="leading-relaxed">
                محتوى الموقع، بما في ذلك النصوص والرسومات والشعارات والصور، هو ملك للمنصة ومحمي بموجب قوانين حقوق النشر والملكية الفكرية.
              </p>
              
              <h2 className="text-xl font-semibold mt-6">المسؤولية عن المحتوى</h2>
              <p className="leading-relaxed">
                تستخدم منصتنا نماذج الذكاء الاصطناعي لتقديم تفسيرات للأحلام. نحن لا نضمن دقة أو اكتمال هذه التفسيرات، ويجب ألا تعتمد عليها كبديل عن المشورة المهنية.
              </p>
              
              <h2 className="text-xl font-semibold mt-6">الإنهاء</h2>
              <p className="leading-relaxed">
                يمكننا إنهاء أو تعليق وصولك إلى الخدمة فورًا، دون سابق إنذار أو مسؤولية، لأي سبب، بما في ذلك على سبيل المثال لا الحصر، خرق الشروط.
              </p>
              
              <h2 className="text-xl font-semibold mt-6">التواصل معنا</h2>
              <p className="leading-relaxed">
                إذا كان لديك أي أسئلة حول شروط الاستخدام هذه، يرجى التواصل معنا عبر نموذج الاتصال الموجود على موقعنا.
              </p>
              
              <div className="bg-muted p-4 rounded-md mt-6">
                <p className="text-sm text-muted-foreground">
                  تم التحديث الأخير: {new Date().toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-6 border-t mt-6">
              <Link to="/privacy" className="text-primary hover:underline flex items-center">
                <Shield className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
                سياسة الخصوصية
              </Link>
              <Link to="/" className="text-primary hover:underline">العودة للرئيسية</Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
