
import React from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun, Stars } from "lucide-react";

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleDarkMode} 
      className="mr-2 border-skyBlue/20 hover:border-skyBlue hover:bg-skyBlue/10 transition-all duration-300"
      aria-label={isDarkMode ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-gold" />
      ) : (
        <Moon className="h-5 w-5 text-skyBlue" />
      )}
    </Button>
  );
};

export default ThemeToggle;
