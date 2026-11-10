import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://coreerp.in"),
  title: "Core — Education Operating System for Schools, Colleges & Universities",
  description:
    "Unified institutional operating system for K-12 Schools, Degree Colleges, Universities, and Coaching Academies. Automated multi-head fee ledgers, zero-downtime offline sync, and complete Indian statutory compliance.",
  applicationName: "Core",
  authors: [{ name: "Core Engineering" }],
  keywords: [
    "Core",
    "School ERP",
    "College ERP",
    "University ERP",
    "Coaching Management System",
    "Education OS",
    "Offline ERP",
    "DPDPA 2023",
    "NEP 2020",
    "Automated Fee Ledgers",
    "APAAR ID",
  ],
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/occo-logo.jpg", type: "image/jpeg" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
      { url: "/brand/occo-logo.jpg", type: "image/jpeg" },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "Core — The Education Operating System",
    description:
      "Enterprise management platform for Indian educational institutions with offline roll call sync, automated fee ledgers, and full statutory compliance.",
    url: "https://coreerp.in",
    siteName: "Core",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/brand/occo-logo.jpg",
        width: 1024,
        height: 1024,
        alt: "Core Education Operating System Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Core — Education Operating System",
    description: "580+ features, offline-first sync, multi-tenant white-labeling, DPDPA 2023 Indian statutory compliance.",
    images: ["/brand/occo-logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-blue-600/10 selection:text-blue-900 overflow-x-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
