import { Service } from "@/types";
import apiFetch from "@/lib/apiClient";

export const servicesService = {
  // GET all services
  async getServices(): Promise<Service[]> {
    return apiFetch<Service[]>("/services");
  },

  // GET service by slug
  async getServiceBySlug(slug: string): Promise<Service> {
    return apiFetch<Service>(`/services/${slug}`);
  },

  // GET featured services
  async getFeaturedServices(): Promise<Service> {
    return apiFetch<Service>("/services/featured");
  },
};
