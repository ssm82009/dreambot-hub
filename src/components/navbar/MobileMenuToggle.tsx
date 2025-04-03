
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from 'react-router-dom';

interface MobileMenuToggleProps {
  isOpen: boolean;
  toggleMenu: () => void;
  isLoggedIn: boolean;
  userEmail: string;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({ 
  isOpen, 
  toggleMenu, 
  isLoggedIn, 
  userEmail 
}) => {
  // Get initials for avatar
  const getInitials = () => {
    if (!userEmail) return 'U';
    return userEmail.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center">
      {isLoggedIn && (
        <Link to="/profile" className="ml-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Link>
      )}
      <Button variant="ghost" size="icon" onClick={toggleMenu}>
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default MobileMenuToggle;
