
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useUser } from '@/contexts/user';
import { getSubscriptionName } from '@/utils/subscription';

const ProfileWelcome = () => {
  const { userData } = useUser();
  const [subscriptionName, setSubscriptionName] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionName = async () => {
      if (userData?.subscription_type) {
        const name = await getSubscriptionName(userData?.subscription_type, null);
        setSubscriptionName(name);
      } else {
        setSubscriptionName('الباقة المجانية');
      }
    };

    fetchSubscriptionName();
  }, [userData?.subscription_type]);

  const initials = userData?.name ? userData.name.slice(0, 2).toUpperCase() : 'مستخدم';

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <Avatar className="mr-4 h-12 w-12">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-2xl font-bold">{userData?.name || 'مستخدم'}</CardTitle>
          <CardDescription>
            {subscriptionName ? `مشترك في باقة ${subscriptionName}` : 'مشترك في الباقة المجانية'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p>
          مرحباً بك في حسابك الشخصي. يمكنك هنا إدارة معلوماتك الشخصية، والاشتراك في باقات مميزة،
          ومتابعة حالة طلبات الدعم الفني.
        </p>
      </CardContent>
    </Card>
  );
};

export default ProfileWelcome;
