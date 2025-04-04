
import { formatDate as formatDateFromUtils } from '@/lib/utils';

export function formatDate(dateString: string): string {
  return formatDateFromUtils(dateString);
}
