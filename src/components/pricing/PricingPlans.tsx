
import React from 'react';
import PricingPlanCard, { PricingPlan } from './PricingPlanCard';

const pricingPlans: PricingPlan[] = [
  {
    id: 'المجاني',
    name: 'المجاني',
    price: 0,
    description: 'للاستخدام الأساسي',
    features: [
      { text: '3 تفسيرات أحلام شهرياً' },
      { text: 'تفسير أساسي للأحلام' },
      { text: 'دعم عبر البريد الإلكتروني' }
    ]
  },
  {
    id: 'المميز',
    name: 'المميز',
    price: 49,
    description: 'للمستخدمين النشطين',
    features: [
      { text: 'تفسيرات أحلام غير محدودة' },
      { text: 'تفسيرات مفصلة ومعمقة' },
      { text: 'أرشيف لتفسيرات أحلامك السابقة' },
      { text: 'نصائح وتوجيهات شخصية' },
      { text: 'دعم فني على مدار الساعة' }
    ],
    isPopular: true
  },
  {
    id: 'الاحترافي',
    name: 'الاحترافي',
    price: 99,
    description: 'للمؤسسات والمحترفين',
    features: [
      { text: 'كل مميزات الخطة المميزة' },
      { text: 'استشارات شخصية مع خبراء تفسير الأحلام' },
      { text: 'تقارير تحليلية شهرية' },
      { text: 'إمكانية إضافة 5 حسابات فرعية' },
      { text: 'واجهة برمجة التطبيقات API' }
    ]
  }
];

interface PricingPlansProps {
  onSubscribe: (planId: string) => void;
}

const PricingPlans = ({ onSubscribe }: PricingPlansProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {pricingPlans.map((plan) => (
        <PricingPlanCard 
          key={plan.id} 
          plan={plan} 
          onSubscribe={onSubscribe} 
        />
      ))}
    </div>
  );
};

export default PricingPlans;
