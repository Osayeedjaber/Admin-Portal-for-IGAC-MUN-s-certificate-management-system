import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "IGAC Admin Portal - Certificate Management",
  description: "Admin dashboard for managing IGAC MUN certificates via Google Sheets integration",
  keywords: ["IGAC", "MUN", "certificates", "admin", "management", "Model United Nations"],
  authors: [{ name: "IGAC" }],
  openGraph: {
    title: "IGAC Admin Portal",
    description: "Certificate Management System for IGAC MUN",
    type: "website",
    siteName: "IGAC Admin",
  },
  twitter: {
    card: "summary",
    title: "IGAC Admin Portal",
    description: "Certificate Management System for IGAC MUN",
  },
  icons: {
    icon: "/logo (2).png",
    shortcut: "/logo (2).png",
    apple: "/logo (2).png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
