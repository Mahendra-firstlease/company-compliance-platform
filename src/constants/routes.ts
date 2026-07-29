/**
 * Centralized Application Navigation Routes
 */

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  SERVICES: "/services",
  APPLICATIONS: "/applications",
  DASHBOARD: {
    HOME: "/dashboard",
    DOCUMENTS: "/dashboard/documents",
  },
  PROFILE: "/profile",
  BUSINESS_PROFILE: "/business-profile",
  ADMIN: {
    DASHBOARD: "/admin",
    SERVICES: "/admin/services",
    DOCUMENTS: "/admin/documents",
  },
  AUTH: {
    LOGIN: "/login",
    SIGNUP: "/signup",
  },
} as const;

export default ROUTES;
