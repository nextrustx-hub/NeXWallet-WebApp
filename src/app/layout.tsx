import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#10b981" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "NeXWallet — Enterprise Digital Wallet",
    template: "%s | NeXWallet",
  },
  description:
    "Plataforma financeira digital enterprise para gestão de pagamentos, exchanges B2B, links de pagamento PIX/SEPA e carteira crypto. Segurança de ponta a ponta.",
  keywords: [
    "NeXWallet",
    "NeXTrustX",
    "fintech",
    "digital wallet",
    "carteira digital",
    "payments",
    "pagamentos",
    "crypto",
    "Bitcoin",
    "USDT",
    "TRC-20",
    "PIX",
    "SEPA",
    "B2B",
    "SaaS",
    "checkout",
    "links de pagamento",
    "exchange",
    "swap",
    "wallet",
  ],
  authors: [
    { name: "NeXWallet by NeXTrustX", url: "https://www.nextrustx.com" },
  ],
  creator: "NeXTrustX Tecnologia",
  publisher: "NeXTrustX Tecnologia",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://wallet.nextrustx.com"),
  alternates: {
    canonical: "https://wallet.nextrustx.com",
    urls: {
      "https://wallet.nextrustx.com": "NeXWallet Web App",
      "https://app.nexwallet.digital": "NeXWallet App",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://wallet.nextrustx.com",
    siteName: "NeXWallet",
    title: "NeXWallet — Enterprise Digital Wallet",
    description:
      "Plataforma financeira digital enterprise para gestão de pagamentos, exchanges B2B, links de pagamento PIX/SEPA e carteira crypto.",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "NeXWallet Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "NeXWallet — Enterprise Digital Wallet",
    description:
      "Plataforma financeira digital enterprise para gestão de pagamentos.",
    images: ["/android-chrome-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/android-chrome-512x512.png",
        color: "#10b981",
      },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NeXWallet",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NeXWallet" />
        <meta name="application-name" content="NeXWallet" />
        <meta name="msapplication-TileColor" content="#10b981" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
            <PwaRegister />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
