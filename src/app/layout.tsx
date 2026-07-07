import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OverridesProvider } from "@/components/overrides-provider";
import { Footer } from "@/components/footer";
import { Toaster } from "sonner";
import { PWARegister } from "@/components/pwa-register";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { DeployRefreshNotifier } from "@/components/deploy-refresh-notifier";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frame Hub - Warframe Build Planner",
  description: "Plan and optimize your Warframe weapon and warframe builds with real-time stat calculations.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Frame Hub",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a1a",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(){var m=localStorage.getItem('framehub_mode')||'dark';if(m==='dark')document.documentElement.classList.add('dark');var t=localStorage.getItem('framehub_theme');if(t&&t!=='void')document.documentElement.classList.add('theme-'+t);})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <TooltipProvider>
          <OverridesProvider>
          <Toaster theme="dark" position="bottom-right" richColors closeButton />
          <PWARegister />
          <PWAInstallPrompt />
          <DeployRefreshNotifier />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
          </OverridesProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
