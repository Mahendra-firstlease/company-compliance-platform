

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers,
  });

  // Global 401 Unauthorized handling on client
  if (response.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let message = errorData.error || errorData.message;
    if (typeof message !== "string") {
      message = undefined;
    }
    if (!message) {
      if (response.status >= 500) {
        message = "Service is temporarily unavailable. Please try again later.";
      } else if (response.status === 403) {
        message = "You do not have permission to perform this action.";
      } else if (response.status === 404) {
        message = "The requested resource could not be found.";
      } else {
        message = "Unable to complete request. Please try again.";
      }
    }
    throw new Error(message);
  }

  return response.json();
}

export default apiFetch;
