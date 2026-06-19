import type { Metadata } from "next";

import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import { Geist, IBM_Plex_Sans } from "next/font/google";

import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/features/navigation/header/Header";
import { AppSidebar } from "@/features/navigation/side-nav/components/Sidebar";
import { ThemeProvider } from "@/features/theme/providers/ThemeProvider";
import { QueryProvider } from "@/lib/query/providers/QueryProvider";
import { cn } from "@/lib/utils";

const geistHeading = Geist({ subsets: ["latin"], variable: "--font-heading" });

const ibmPlexSans = IBM_Plex_Sans({subsets:['latin'],variable:'--font-sans'});

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
        className={cn("font-sans", ibmPlexSans.variable, geistHeading.variable)}
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
              <Toaster richColors />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
