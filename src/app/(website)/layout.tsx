"use client";

import Navbar from "@/components/layouts/Header/Header";
import Footer from "@/components/layouts/Footer/Footer";
import { usePathname } from "next/navigation";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Suppress public header and footer on dashboard, applications, and admin workspaces
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/applications");

  if (isDashboardRoute) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}