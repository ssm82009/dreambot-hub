
import React from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';

/**
 * SeoManager component
 * This component doesn't render anything visible
 * It just applies SEO settings to the document
 */
const SeoManager: React.FC = () => {
  // Use the hook to manage page metadata
  usePageMeta();
  
  // This component doesn't render anything
  return null;
};

export default SeoManager;
