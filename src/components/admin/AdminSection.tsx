
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type AdminSectionProps = { 
  title: string, 
  description: string, 
  icon: React.ElementType, 
  children: React.ReactNode,
  isOpen: boolean,
  onToggle: () => void
};

const AdminSection: React.FC<AdminSectionProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  isOpen, 
  onToggle 
}) => {
  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon className="ml-2 h-5 w-5 text-primary" />
                <CardTitle>{title}</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? 'إغلاق' : 'عرض'}
              </Button>
            </div>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4 border-t">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AdminSection;
