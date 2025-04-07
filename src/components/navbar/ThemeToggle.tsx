
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
      className="mr-2 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all duration-300 rounded-full"
      aria-label={isDarkMode ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-gold animate-pulse-glow" />
      ) : (
        <Moon className="h-5 w-5 text-royal" />
      )}
    </Button>
  );
};

export default ThemeToggle;
