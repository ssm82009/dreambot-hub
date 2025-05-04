
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar, { NAVBAR_HEIGHT } from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailNotConfirmed(false);
    setConnectionError(false);
    setErrorDetails('');
    
    try {
      console.log('Attempting to sign in with:', email);
      
      // Initial login attempt
      let result = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Sign in result:', result);
      
      if (result.error) {
        console.error('Login error:', result.error);
        throw result.error;
      }
      
      // هنا تم تسجيل الدخول بنجاح
      // التحقق من دور المستخدم في جدول المستخدمين
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', result.data.user.id)
        .single();
      
      if (userError) {
        console.error('خطأ في جلب بيانات المستخدم:', userError);
        toast.error("حدث خطأ في جلب بيانات المستخدم");
      } else {
        console.log('User data after login:', userData);
        
        if (userData && userData.role === 'admin') {
          console.log('تم تسجيل دخول مشرف:', email);
          localStorage.setItem('isAdminLoggedIn', 'true');
        } else {
          localStorage.setItem('isAdminLoggedIn', 'false');
        }
      }
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      
      toast.success("تم تسجيل الدخول بنجاح");
      navigate('/');
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error);
      
      // التعامل مع أخطاء محددة
      if (error.message === 'Email not confirmed') {
        setEmailNotConfirmed(true);
        toast.error("لم يتم تأكيد البريد الإلكتروني، يرجى مراجعة بريدك الإلكتروني للتفعيل");
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || 
                 error?.name === 'AuthRetryableFetchError' || error?.status === 0) {
        // Handle connection errors specifically
        setConnectionError(true);
        setErrorDetails(JSON.stringify(error, null, 2));
        toast.error("حدث خطأ في الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى");
      } else {
        toast.error(error.message === 'Invalid login credentials' 
          ? "بيانات الدخول غير صحيحة" 
          : "حدث خطأ في تسجيل الدخول، يرجى المحاولة مرة أخرى"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4 dream-pattern" style={{ paddingTop: `calc(${NAVBAR_HEIGHT}px + 2rem)` }}>
        <Card className="w-full max-w-md shadow-xl rtl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">
              قم بتسجيل الدخول للوصول إلى حسابك والاستفادة من خدمات تفسير الأحلام
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailNotConfirmed && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  لم يتم تأكيد البريد الإلكتروني بعد. يرجى التحقق من بريدك الإلكتروني والضغط على رابط التفعيل.
                </AlertDescription>
              </Alert>
            )}
            
            {connectionError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.
                  {errorDetails && <pre className="mt-2 text-xs bg-gray-800 p-2 rounded overflow-x-auto">{errorDetails}</pre>}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="أدخل كلمة المرور" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-center text-sm text-foreground/70">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-primary hover:underline">
                إنشاء حساب جديد
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
