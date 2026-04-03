import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { NavDirectionProvider } from "@/lib/nav-direction";
import { PageShell } from "@/components/PageShell";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["300", "600", "800"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LearnPod",
  description: "Gamified micro-learning from your knowledge vault",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LearnPod",
  },
};

export const viewport: Viewport = {
  themeColor: "#13100d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>
        <NavDirectionProvider>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <PageShell>
            <div className="page-content" id="main-content">{children}</div>
          </PageShell>
          <BottomNav />
        </NavDirectionProvider>
      </body>
    </html>
  );
}
