import apiFetch from "@/lib/apiClient";
import { ApplicationCase } from "@/types";

export const applicationService = {
  // GET all applications
  async getApplications(): Promise<ApplicationCase[]> {
    return apiFetch<ApplicationCase[]>("/applications");
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
    return apiFetch<ApplicationCase>("/applications", {
      method: "POST",
      body: JSON.stringify(app),
    });
  },

  // PATCH update application
  async updateApplication(
    id: string,
    updates: Partial<ApplicationCase>
  ): Promise<ApplicationCase> {
    return apiFetch<ApplicationCase>(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  // DELETE application
  async deleteApplication(id: string): Promise<void> {
    await apiFetch(`/applications/${id}`, {
      method: "DELETE",
    });
  },
};
