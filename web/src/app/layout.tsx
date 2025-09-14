import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import PageReveal from "@/components/ux/PageReveal";
import PageWrapper from "@/components/ux/PageWrapper";
import FloatingOrbs from "@/components/ux/FloatingOrbs";
import RouteLoader from "@/components/ux/RouteLoader";

export const metadata: Metadata = {
  title: {
    default: "Gym Fonty — Fitness, Nutrizione, Servizi e Shop",
    template: "%s · Gym Fonty",
  },
  description:
    "Piattaforma omnicanale Gym Fonty: servizi di allenamento e alimentazione, e‑commerce di prodotti e integratori, prenotazioni eventi e area account.",
  metadataBase: new URL("https://www.gymfonty.example"),
  openGraph: {
    title: "Gym Fonty",
    description:
      "Servizi di fitness e nutrizione, shop e prenotazioni eventi — online e in sede.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/fonty.png",
        width: 512,
        height: 512,
        alt: "Gym Fonty",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gym Fonty",
    description:
      "Servizi di fitness e nutrizione, shop e prenotazioni eventi — online e in sede.",
    images: ["/fonty.png"],
  },
  icons: {
    icon: "/fonty.png",
    shortcut: "/fonty.png",
    apple: "/fonty.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <RouteLoader />
              <FloatingOrbs />
              <PageReveal />
              <Header />
              <PageWrapper>
                <main className="container-page py-8 sm:py-12">{children}</main>
              </PageWrapper>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
