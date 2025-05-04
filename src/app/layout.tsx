import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { HeroUIProvider } from "@heroui/react";
import { cn } from "@/lib/utils";
import locale from "@/locales/root.json";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: locale.WEBSITE.NAME,
  openGraph: {
    title: locale.WEBSITE.NAME,
    description: locale.WEBSITE.DESCRIPTION,
    images: ["/images/banner/pages/home.png"],
  },
  description: locale.WEBSITE.DESCRIPTION,
  metadataBase: new URL("https://acme.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-DO" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#6E34F3" />
        <link rel="icon" type="image/x-icon" href="/images/icons/favicon.ico" />
      </head>

      <body
        className={cn(
          "min-h-screen max-w-screen overflow-x-hidden bg-background text-foreground",
          inter.className
        )}
      >
        <HeroUIProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </HeroUIProvider>
      </body>
    </html>
  );
}
