
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Arabic display utilities
export const ArDisplay = {
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Intl.DateTimeFormat('ar-SA', options).format(date);
  },

  // Format number with Arabic numerals
  formatNumber(num: number): string {
    return new Intl.NumberFormat('ar-SA').format(num);
  }
};
