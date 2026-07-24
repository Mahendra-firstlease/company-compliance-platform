export interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

export interface ApplicationCase {
  id: string;
  userId?: string;
  userEmail?: string;
  serviceSlug: string;
  serviceTitle: string;
  status: "PAYMENT_CONFIRMED" | "DOCUMENTS_PENDING" | "UNDER_REVIEW" | "SUBMITTED" | "APPROVED";
  customerName: string;
  customerPhone: string;
  address: string;
  uploadedDocs: Record<string, UploadedFile>;
  query?: string;
  assignedExecutive?: string;
  governmentFee: number;
  professionalFee: number;
  totalFee: number;
  createdAt: string;
}

// GET all applications
export async function getApplications(): Promise<ApplicationCase[]> {
  const res = await fetch("/api/applications", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch applications: ${res.statusText}`);
  }
  return res.json();
}

// POST create/save application
export async function saveApplication(app: ApplicationCase): Promise<ApplicationCase> {
  const res = await fetch("/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(app),
  });
  if (!res.ok) {
    throw new Error(`Failed to save application: ${res.statusText}`);
  }
  return res.json();
}

// GET application by ID
export async function getApplicationById(id: string): Promise<ApplicationCase | null> {
  try {
    const res = await fetch(`/api/applications/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

// GET application by Slug (gets latest matching)
export async function getApplicationBySlug(slug: string): Promise<ApplicationCase | null> {
  const list = await getApplications();
  const matches = list.filter((item) => item.serviceSlug === slug);
  if (matches.length === 0) return null;
  
  // Sort by createdAt descending to return the latest filing case
  matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return matches[0];
}

// PATCH update application status/fields
export async function updateApplication(
  id: string,
  updates: Partial<ApplicationCase>
): Promise<ApplicationCase> {
  const res = await fetch(`/api/applications/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Failed to update application: ${res.statusText}`);
  }
  return res.json();
}
