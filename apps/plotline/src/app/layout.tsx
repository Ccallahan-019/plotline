import type { Metadata } from "next";

import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono, Lora, Merriweather } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

import "./globals.css";

const merriweatherHeading = Merriweather({
  subsets: ["latin"],
  variable: "--font-heading",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  description:
    "Track what you watch, build watchlists, and discover your viewing habits.",
  title: {
    default: "Plotline",
    template: "%s · Plotline",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        className={cn(
          "h-full antialiased",
          geistSans.variable,
          geistMono.variable,
          "font-serif",
          lora.variable,
          merriweatherHeading.variable,
        )}
        lang="en"
      >
        <body className="flex min-h-full flex-col bg-background text-foreground">
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
