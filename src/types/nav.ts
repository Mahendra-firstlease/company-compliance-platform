/**
 * Navigation & Menu Layout Types
 */

export interface NavLink {
  label: string;
  href: string;
  badge?: string;
  description?: string;
}

export interface NavItem {
  label: string;
  href?: string;
  mega?: boolean;
  megaMenu?: boolean;
  links?: NavLink[];
}
