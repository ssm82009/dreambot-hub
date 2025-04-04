
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

/**
 * Formats a date string to Arabic locale with appropriate formatting
 * @param dateString - ISO date string to format
 * @returns Formatted date string in Arabic
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // تنسيق التاريخ بالعربية
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}
