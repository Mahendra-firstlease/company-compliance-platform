import type { Metadata, Viewport } from "next";
import { fontClassNames, fontVars } from "@/lib/fonts";
import "./globals.css";
import { Toaster } from "@/components/ui/notification/index";
import { ModalProvider } from "@/components/ui/overlay";
import { ThemeProvider } from "@/providers/ThemeProvider";
import AuthProvider from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import APP_CONFIG from "@/config/app-config";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://firstlease.com"),
  title: {
    default: "FirstLease — Enterprise Business Compliance Platform",
    template: "%s | FirstLease",
  },
  description: "Seamless statutory filing, GST, PAN, Trademark, MCA, and corporate compliance services.",
  keywords: ["GST Registration", "PAN Card", "Trademark Registration", "FSSAI Food License", "MCA Incorporation", "Corporate Compliance"],
  openGraph: {
    title: "FirstLease — Enterprise Business Compliance Platform",
    description: "Seamless statutory filing, GST, PAN, Trademark, MCA, and corporate compliance services.",
    url: "https://firstlease.com",
    siteName: "FirstLease",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FirstLease",
    url: "https://firstlease.com",
    logo: "https://firstlease.com/images/logo.png",
    description: "Enterprise Business Compliance & Statutory Registration Platform",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9876543210",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
  };

  return (
    <html lang="en" className={`${fontVars} ${fontClassNames}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`min-h-screen font-sans antialiased text-slate-900 bg-slate-50 ${fontClassNames}`}>
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
