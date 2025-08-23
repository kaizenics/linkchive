import type { Metadata } from "next";
import { Press_Start_2P, Manrope } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { Toaster } from "sonner";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start-2p",
  subsets: ["latin"],
  weight: "400"
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "linkchive.",
  description: "The bookmark manager with privacy at its core.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Linkchive",
  },
  icons: {
    apple: "/apple-touch-icon.svg",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Linkchive",
    "application-name": "Linkchive",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${pressStart2P.variable} ${manrope.variable} antialiased font-sans`}
        >
          <TRPCProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
