
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/database';
import { useSubscriptionStatus } from '@/hooks/admin/useSubscriptionStatus';

type SubscriptionBadgeProps = {
  user: User;
  variant?: 'badge' | 'pill';
};

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ 
  user, 
  variant = 'badge' 
}) => {
  const { displayName, statusColor, isActive } = useSubscriptionStatus(user);

  if (variant === 'badge') {
    return (
      <Badge variant={statusColor}>
        {displayName}
      </Badge>
    );
  }
  
  // Pill variant (used in EditableSubscriptionCell)
  let badgeClass = "px-2 py-1 text-xs rounded-full";
  
  switch (statusColor) {
    case "secondary":
      badgeClass += " bg-amber-100 text-amber-800";
      break;
    case "default":
      badgeClass += " bg-purple-100 text-purple-800";
      break;
    case "destructive":
      badgeClass += " bg-red-100 text-red-800";
      break;
    case "outline":
    default:
      badgeClass += " bg-gray-100 text-gray-800";
  }

  return (
    <span className={badgeClass}>
      {displayName}
    </span>
  );
};

export default SubscriptionBadge;
