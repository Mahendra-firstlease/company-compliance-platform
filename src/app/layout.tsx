import type { Metadata } from "next";
import { fontVars } from "@/lib/fonts";
import "./globals.css";
import { Toaster } from "@/components/ui/notification/index";
import { ModalProvider } from "@/components/ui/overlay";
import { ThemeProvider } from "@/providers/ThemeProvider";
import AuthProvider from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import APP_CONFIG from "@/config/app-config";

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVars}>
      <head></head>
      <body className="min-h-screen font-sans">
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <ModalProvider>{children}</ModalProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
