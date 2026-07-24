// import apiClient from "@/lib/apiClient";
import { Service } from "@/types/services";
import apiClient from "@/lib/apiClient";

export const servicesService = {
  // GET all services
  async getServices(): Promise<Service[]> {
    const { data } = await apiClient.get<Service[]>(`/services`);
    // console.log(data, "data");
    return data;
  },

  // GET service by slug
  async getServiceBySlug(slug: string): Promise<Service> {
    const { data } = await apiClient.get<Service>(`/services/${slug}`);
    return data;
  },

  async getFeaturedServices(): Promise<Service> {
    const { data } = await apiClient.get<Service>(`/services/featured`);
    return data;
  },
};
