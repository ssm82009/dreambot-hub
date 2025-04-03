
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { FileText, Shield } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <Card className="shadow-lg rtl">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">سياسة الخصوصية</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">مقدمة</h2>
              <p className="leading-relaxed">
                تصف سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات الشخصية التي تقدمها عند استخدام منصة تفسير الأحلام.
              </p>

              <h2 className="text-xl font-semibold mt-6">المعلومات التي نجمعها</h2>
              <p className="leading-relaxed">
                نجمع معلومات شخصية مثل اسمك وعنوان بريدك الإلكتروني عند التسجيل. كما نقوم بتخزين الأحلام التي تقوم بإدخالها للحصول على تفسير.
              </p>

              <h2 className="text-xl font-semibold mt-6">كيف نستخدم معلوماتك</h2>
              <p className="leading-relaxed">
                نستخدم المعلومات التي نجمعها لتوفير وتحسين خدماتنا، وللتواصل معك فيما يتعلق بحسابك، وتقديم الدعم، وتحسين تجربة المستخدم.
              </p>
              
              <h2 className="text-xl font-semibold mt-6">حماية البيانات</h2>
              <p className="leading-relaxed">
                نحن نتخذ تدابير أمنية مناسبة لحماية معلوماتك الشخصية من الوصول أو الكشف أو الاستخدام غير المصرح به.
              </p>
              
              <h2 className="text-xl font-semibold mt-6">ملفات تعريف الارتباط</h2>
              <p className="leading-relaxed">
                نستخدم ملفات تعريف الارتباط لتحسين تجربة المستخدم وتحليل استخدام الموقع. يمكنك ضبط متصفحك لرفض ملفات تعريف الارتباط، ولكن قد يؤثر ذلك على وظائف معينة.
              </p>
              
              <h2 className="text-xl font-semibold mt-6">مشاركة المعلومات</h2>
              <p className="leading-relaxed">
                لن نبيع أو نتاجر بمعلوماتك الشخصية مع أطراف ثالثة. قد نشارك البيانات مع مزودي الخدمات الذين يساعدوننا في تشغيل موقعنا وتقديم خدماتنا.
              </p>
              
              <h2 className="text-xl font-semibold mt-6">حقوقك</h2>
              <p className="leading-relaxed">
                لديك الحق في الوصول إلى بياناتك الشخصية، وتصحيحها، وطلب حذفها. يمكنك أيضًا الاعتراض على معالجة بياناتك وطلب تقييد هذه المعالجة.
              </p>
              
              <h2 className="text-xl font-semibold mt-6">تغييرات على سياسة الخصوصية</h2>
              <p className="leading-relaxed">
                قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات جوهرية عن طريق نشر السياسة الجديدة على هذه الصفحة.
              </p>
              
              <h2 className="text-xl font-semibold mt-6">التواصل معنا</h2>
              <p className="leading-relaxed">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر نموذج الاتصال على موقعنا.
              </p>
              
              <div className="bg-muted p-4 rounded-md mt-6">
                <p className="text-sm text-muted-foreground">
                  تم التحديث الأخير: {new Date().toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-6 border-t mt-6">
              <Link to="/terms" className="text-primary hover:underline flex items-center">
                <FileText className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
                شروط الاستخدام
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

export default Privacy;
