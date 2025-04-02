
import React from 'react';

const RoleExplanation: React.FC = () => {
  return (
    <div className="p-4 border rounded-md mt-6">
      <h3 className="text-lg font-semibold mb-4">أنواع الصلاحيات</h3>
      <div className="space-y-4">
        <div className="p-3 border rounded-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="font-semibold">مشرف</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            يملك جميع الصلاحيات بما في ذلك الوصول إلى لوحة التحكم وإدارة المستخدمين والإعدادات
          </p>
        </div>
        
        <div className="p-3 border rounded-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="font-semibold">مفسر</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            يمكنه الوصول إلى طلبات تفسير الأحلام وتقديم تفسيرات لها
          </p>
        </div>
        
        <div className="p-3 border rounded-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="font-semibold">عضو</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            يمكنه طلب تفسير الأحلام حسب نوع العضوية
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleExplanation;
