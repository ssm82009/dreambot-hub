
import React from 'react';
import { Badge } from '@/components/ui/badge';

type RoleBadgeProps = {
  role: string;
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  let variant: 'default' | 'secondary' | 'outline' = 'outline';
  let displayText = 'عضو';
  
  if (role === 'admin') {
    variant = 'default';
    displayText = 'مشرف';
  } else if (role === 'interpreter') {
    variant = 'secondary';
    displayText = 'مفسر';
  }
  
  return (
    <Badge variant={variant}>
      {displayText}
    </Badge>
  );
};

export default RoleBadge;
