
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

export interface PlanFeature {
  text: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: PlanFeature[];
  isPopular?: boolean;
}

interface PricingPlanCardProps {
  plan: PricingPlan;
  onSubscribe: (planId: string) => void;
}

const PricingPlanCard = ({ plan, onSubscribe }: PricingPlanCardProps) => {
  return (
    <Card className={`border-2 ${plan.isPopular ? 'border-primary' : 'border-border/50'} relative shadow-lg`}>
      {plan.isPopular && (
        <div className="absolute top-0 right-0 left-0 bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
          الأكثر شعبية
        </div>
      )}
      <CardHeader className={`text-center pb-8 ${plan.isPopular ? 'pt-10' : ''}`}>
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <div className="mt-4 mb-2">
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className="text-foreground/70 mr-1">ريال</span>
          {plan.price > 0 && <span className="text-foreground/50 text-sm">/شهرياً</span>}
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
            <p className="text-foreground/80">{feature.text}</p>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button 
          variant={plan.isPopular ? "default" : "outline"} 
          className="w-full"
          onClick={() => onSubscribe(plan.id)}
        >
          {plan.price === 0 ? 'ابدأ مجاناً' : 'اشترك الآن'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingPlanCard;
