
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, LogOut, Key, TicketIcon } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { toast } from 'sonner';
import { useUserDisplayName } from '@/hooks/useUserDisplayName';
import NotificationBell from './NotificationBell';

export const UserMenu = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Fix: correctly use the useAdminCheck hook which returns { isAdmin }
  const { isAdmin } = useAdminCheck();
  const displayName = useUserDisplayName();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    toast.success('تم تسجيل الخروج بنجاح');
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  if (isLoading) return null;

  if (!isLoggedIn) return null;

  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : 'مس';

  return (
    <div className="flex items-center gap-2">
      <NotificationBell className="mr-2" />
      
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar className="cursor-pointer border hover:opacity-80">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2 text-sm font-medium text-center text-muted-foreground">
            {displayName || 'مستخدم'}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer flex w-full items-center">
              <User className="ml-2 h-4 w-4" />
              الملف الشخصي
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/tickets" className="cursor-pointer flex w-full items-center">
              <TicketIcon className="ml-2 h-4 w-4" />
              التذاكر والدعم
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer flex w-full items-center">
                <Settings className="ml-2 h-4 w-4" />
                لوحة التحكم
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
