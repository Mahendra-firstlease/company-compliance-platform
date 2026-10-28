export function getPostLoginPath(
  role?: string | null,
  callbackUrl?: string | null,
): string {
  const safeCallback =
    callbackUrl &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//")
      ? callbackUrl
      : null;

  if (role === "ADMIN") {
    if (safeCallback?.startsWith("/admin")) {
      return safeCallback;
    }
    return "/admin";
  }

  if (role) {
    if (safeCallback && !safeCallback.startsWith("/admin")) {
      return safeCallback;
    }
    return "/dashboard";
  }

  if (safeCallback) {
    return safeCallback;
  }

  return "/dashboard";
}
