/**
 * Common UI Component Props & Layout Types
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  basePath?: string;
}
