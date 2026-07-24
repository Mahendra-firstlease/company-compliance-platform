import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationService } from "@/services/applicationService";
import { ApplicationCase } from "@/lib/applications";

// Hook for fetching all applications
export function useApplicationsQuery() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: () => applicationService.getApplications(),
  });
}

// Hook for fetching application by ID
export function useApplicationQuery(id: string) {
  return useQuery({
    queryKey: ["applications", id],
    queryFn: () => applicationService.getApplicationById(id),
    enabled: !!id,
  });
}

// Hook for fetching application by slug
export function useApplicationBySlugQuery(slug: string) {
  return useQuery({
    queryKey: ["applications", "slug", slug],
    queryFn: () => applicationService.getApplicationBySlug(slug),
    enabled: !!slug,
  });
}

// Hook for creating/saving application
export function useSaveApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (app: ApplicationCase) => applicationService.saveApplication(app),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["applications", "slug", data.serviceSlug] });
    },
  });
}

// Hook for updating application fields
export function useUpdateApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ApplicationCase> }) =>
      applicationService.updateApplication(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["applications", data.id] });
      queryClient.invalidateQueries({ queryKey: ["applications", "slug", data.serviceSlug] });
    },
  });
}
export function useDeleteApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationService.deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}
