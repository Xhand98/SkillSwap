import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import locale from "@/locales/root.json";
import "./globals.css";
import ThemeProvider from "@/components/theme/theme-provider";
import { AuthProvider } from "@/lib/AuthContext";
import { ToastProvider } from "@/components/toast-provider";

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
        <meta name="theme-color" content="#5f21db" />
        <link rel="icon" type="image/x-icon" href="/images/icons/favicon.ico" />
      </head>
      <body
        className={cn(
          "min-h-screen max-w-screen overflow-x-hidden bg-background text-foreground dark",
          inter.className
        )}
      >
        {" "}
        <ThemeProvider
          attribute={"class"}
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ToastProvider>
              <Header />
              {children}
              <Footer />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
