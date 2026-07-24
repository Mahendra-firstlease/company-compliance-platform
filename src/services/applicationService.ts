import apiClient from "@/lib/apiClient";
import { ApplicationCase } from "@/lib/applications";

export const applicationService = {
  // GET all applications
  async getApplications(): Promise<ApplicationCase[]> {
    const { data } =
      await apiClient.get<ApplicationCase[]>("/applications");
    return data;
  },

  // GET application by ID
  async getApplicationById(id: string): Promise<ApplicationCase | null> {
    const list = await this.getApplications();
    return list.find((item) => item.id === id) || null;
  },

  // GET application by Slug
  async getApplicationBySlug(slug: string): Promise<ApplicationCase | null> {
    const list = await this.getApplications();
    const matches = list.filter((item) => item.serviceSlug === slug);
    if (matches.length === 0) return null;

    matches.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return matches[0];
  },

  // POST create/save application
  async saveApplication(app: ApplicationCase): Promise<ApplicationCase> {
    const { data } = await apiClient.post<ApplicationCase>(
      "/applications",
      app,
    );
    return data;
  },

  // PATCH update application
  async updateApplication(
    id: string,
    updates: Partial<ApplicationCase>,
  ): Promise<ApplicationCase> {
    const { data } = await apiClient.patch<ApplicationCase>(
      `/applications/${id}`,
      updates,
    );
    return data;
  },

  // DELETE application
  async deleteApplication(id: string): Promise<void> {
    await apiClient.delete(`/applications/${id}`);
  },
};
