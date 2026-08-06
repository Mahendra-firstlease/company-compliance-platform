import { describe, expect, it } from "vitest";
import { getPostLoginPath } from "../auth-redirect";

describe("getPostLoginPath", () => {
  it("sends admin users to the admin dashboard", () => {
    expect(getPostLoginPath("ADMIN")).toBe("/admin");
    expect(getPostLoginPath("EXECUTIVE")).toBe("/admin");
  });

  it("honors admin callback URLs for staff users", () => {
    expect(getPostLoginPath("ADMIN", "/admin/applications")).toBe(
      "/admin/applications",
    );
  });

  it("sends client users to dashboard or a safe callback URL", () => {
    expect(getPostLoginPath("CLIENT")).toBe("/dashboard");
    expect(getPostLoginPath("CLIENT", "/profile")).toBe("/profile");
    expect(getPostLoginPath("CLIENT", "/admin")).toBe("/dashboard");
  });

  it("falls back to dashboard when role is not yet known", () => {
    expect(getPostLoginPath(null, "/dashboard")).toBe("/dashboard");
    expect(getPostLoginPath()).toBe("/dashboard");
  });
});
