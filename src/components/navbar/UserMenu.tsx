
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface UserMenuProps {
  userEmail: string;
  isAdmin: boolean;
  handleLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ userEmail, isAdmin, handleLogout }) => {
  // Get initials for avatar
  const getInitials = () => {
    if (!userEmail) return 'U';
    return userEmail.substring(0, 2).toUpperCase();
  };

  return (
    <NavigationMenu dir="rtl">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="gap-1 px-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-56 p-2">
              <div className="mb-2 px-2 py-1.5 text-sm font-medium">
                {userEmail}
              </div>
              <NavigationMenuLink asChild>
                <Link
                  to="/profile"
                  className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent"
                >
                  الملف الشخصي
                </Link>
              </NavigationMenuLink>
              {isAdmin && (
                <NavigationMenuLink asChild>
                  <Link
                    to="/admin"
                    className="block px-2 py-1.5 text-sm rounded-sm hover:bg-accent"
                  >
                    لوحة التحكم
                  </Link>
                </NavigationMenuLink>
              )}
              <div className="mt-2 border-t pt-1.5">
                <button
                  onClick={handleLogout}
                  className="block w-full text-right px-2 py-1.5 text-sm text-destructive rounded-sm hover:bg-accent"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default UserMenu;
