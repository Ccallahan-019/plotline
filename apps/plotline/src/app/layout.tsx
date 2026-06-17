import type { Metadata } from "next";

import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import { Geist, Geist_Mono, Lora, Merriweather } from "next/font/google";

import { SidebarProvider } from "@/components/ui/sidebar";

import "./globals.css";
import { Header } from "@/features/navigation/header/Header";
import { AppSidebar } from "@/features/navigation/side-nav/components/Sidebar";
import { ThemeProvider } from "@/features/theme/providers/ThemeProvider";
import { QueryProvider } from "@/lib/query/providers/QueryProvider";
import { cn } from "@/lib/utils";

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
        suppressHydrationWarning
      >
        <body className="flex min-h-full flex-col bg-background text-foreground">
          <ThemeProvider>
            <QueryProvider>
              <SidebarProvider>
                <SignedIn>
                  <AppSidebar />
                </SignedIn>
                <main className="flex flex-1 flex-col">
                  <Header />
                  {children}
                </main>
              </SidebarProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
