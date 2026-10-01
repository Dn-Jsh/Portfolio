import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Silkscreen } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_URL } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${silkscreen.variable} antialiased min-h-screen`}
      >
        <ScrollProgress />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Sidebar />
          <MobileNav />
          <div className="lg:pl-56 min-h-dvh flex min-w-0 justify-center">
            <main id="main-content" className="site-content w-full min-w-0 max-w-4xl">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
