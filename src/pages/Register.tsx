import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { checkIfAdminEmail } from '@/hooks/useAdminCheck';

const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Check if the email is a designated admin email
  const isAdminEmail = checkIfAdminEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من تطابق كلمتي المرور
    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    
    // التحقق من قبول الشروط والأحكام
    if (!termsAccepted) {
      toast.error("يجب الموافقة على شروط الاستخدام وسياسة الخصوصية");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // تسجيل المستخدم في Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // إضافة المستخدم إلى جدول المستخدمين
      if (data?.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            full_name: `${firstName} ${lastName}`,
            role: isAdminEmail ? 'admin' : 'user' // Set role as admin if it's an admin email
          });
          
        if (insertError) {
          console.error('خطأ في إضافة بيانات المستخدم:', insertError);
        }
        
        // Log admin creation
        if (isAdminEmail) {
          console.log('تم إنشاء حساب مشرف جديد:', email);
        }
      }
      
      toast.success(isAdminEmail ? "تم إنشاء حساب المشرف بنجاح" : "تم إنشاء الحساب بنجاح");
      navigate('/login');
    } catch (error: any) {
      console.error('خطأ في التسجيل:', error.message);
      
      // رسائل خطأ محددة
      if (error.message.includes('email already')) {
        toast.error("البريد الإلكتروني مستخدم بالفعل");
      } else {
        toast.error("حدث خطأ في إنشاء الحساب، يرجى المحاولة مرة أخرى");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4 dream-pattern">
        <Card className="w-full max-w-md shadow-xl rtl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center">إنشاء حساب جديد</CardTitle>
            <CardDescription className="text-center">
              قم بإنشاء حساب للاستفادة من خدمات تفسير الأحلام المتقدمة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input 
                    id="firstName" 
                    placeholder="الاسم الأول" 
                    required 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">الاسم الأخير</Label>
                  <Input 
                    id="lastName" 
                    placeholder="الاسم الأخير" 
                    required 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="أدخل بريدك الإلكتروني" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="أدخل كلمة المرور" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="أعد إدخال كلمة المرور" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm font-normal">
                  أوافق على{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    شروط الاستخدام
                  </Link>{' '}
                  و{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    سياسة الخصوصية
                  </Link>
                </Label>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-center text-sm text-foreground/70">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-primary hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
