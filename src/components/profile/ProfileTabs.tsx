
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSubscription from '@/components/profile/ProfileSubscription';
import ProfilePayments from '@/components/profile/ProfilePayments';
import ProfileDreams from '@/components/profile/ProfileDreams';
import ProfileSettings from '@/components/profile/ProfileSettings';

interface ProfileTabsProps {
  userData: any;
  payments: any[];
  onTabChange: (value: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userData, payments, onTabChange }) => {
  return (
    <Tabs defaultValue="subscription" className="w-full" onValueChange={onTabChange}>
      <TabsList className="grid grid-cols-4 mb-8 flex-row-reverse">
        <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        <TabsTrigger value="dreams">الأحلام</TabsTrigger>
        <TabsTrigger value="payments">المدفوعات</TabsTrigger>
        <TabsTrigger value="subscription">الاشتراك</TabsTrigger>
      </TabsList>
      
      <TabsContent value="subscription">
        <ProfileSubscription userData={userData} />
      </TabsContent>
      
      <TabsContent value="payments">
        <ProfilePayments payments={payments} />
      </TabsContent>
      
      <TabsContent value="dreams">
        <ProfileDreams userId={userData?.id} dreamsCount={userData?.dreams_count} />
      </TabsContent>
      
      <TabsContent value="settings">
        <ProfileSettings userId={userData?.id} userEmail={userData?.email} />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
