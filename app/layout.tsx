import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "./globals.css";
import Providers from "@/components/Providers";
import LayoutContent from "@/components/LayoutContent";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://expensee-mate.vercel.app"),
  title: {
    default: "ExpenseMate — Smart Personal Expense Tracker & Budgeting",
    template: "%s | ExpenseMate",
  },
  description:
    "Master your money with effortless clarity. ExpenseMate transforms daily spending into actionable intelligence with smart category heatmaps, real-time budget guardrails, and automated savings targets.",
  keywords: [
    "expense tracker",
    "budgeting app",
    "personal finance",
    "money management",
    "spending heatmap",
    "financial analytics",
    "savings goals",
    "ExpenseMate",
  ],
  authors: [{ name: "ExpenseMate Team" }],
  creator: "ExpenseMate",
  publisher: "ExpenseMate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://expensee-mate.vercel.app",
    siteName: "ExpenseMate",
    title: "ExpenseMate — Smart Personal Expense Tracker & Budgeting",
    description:
      "Transform your daily spending into actionable financial intelligence with real-time budget guardrails and automated savings targets.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "ExpenseMate Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExpenseMate — Smart Personal Expense Tracker & Budgeting",
    description:
      "Transform your daily spending into actionable financial intelligence with real-time budget guardrails and automated savings targets.",
    images: ["/icon.png"],
    creator: "@ExpenseMate",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://expensee-mate.vercel.app",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <LayoutContent>
            {children}
          </LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
