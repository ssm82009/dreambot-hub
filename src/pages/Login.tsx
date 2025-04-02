
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailNotConfirmed(false);
    
    try {
      // Initial login attempt
      let result = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // Handle "Email not confirmed" error specially
      if (result.error && result.error.message === 'Email not confirmed') {
        console.log('Email not confirmed, trying to update user...');
        
        // Set the emailNotConfirmed state to true to show the alert
        setEmailNotConfirmed(true);
        
        // Try to get magic link or auto-confirm the email
        const { error: updateError } = await supabase.auth.updateUser({
          email: email
        });
        
        if (updateError) {
          console.error('خطأ في تحديث المستخدم:', updateError.message);
          toast.error("لم يتم تأكيد البريد الإلكتروني، يرجى مراجعة بريدك الإلكتروني للتفعيل");
          setIsLoading(false);
          return;
        }
        
        // Try signing in again after update
        result = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        // If we still have an error after retry, throw it
        if (result.error) {
          throw result.error;
        }
      } else if (result.error) {
        // If we have an error from the initial attempt that's not about confirmation, throw it
        throw result.error;
      }
      
      // At this point, result.data contains our successful login data
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
      console.error('خطأ في تسجيل الدخول:', error.message);
      
      if (error.message === 'Email not confirmed') {
        setEmailNotConfirmed(true);
        toast.error("لم يتم تأكيد البريد الإلكتروني، يرجى مراجعة بريدك الإلكتروني للتفعيل");
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
      <main className="flex-1 flex items-center justify-center py-16 px-4 dream-pattern">
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
