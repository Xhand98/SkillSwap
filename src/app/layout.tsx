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
    <html lang="es-DO">
      <head>
        <meta name="theme-color" content="#6E34F3" />
        <link
          rel="icon"
          type="image/x-icon"
          href="/images/icons/favicon.ico4"
        />
      </head>

      <body
        className={cn(
          "max-w-screen overflow-x-hidden text-foreground",
          inter.className,
        )}
      >
        <HeroUIProvider>
          <Header />
          {children}
          <Footer />
        </HeroUIProvider>
      </body>
    </html>
  );
}
