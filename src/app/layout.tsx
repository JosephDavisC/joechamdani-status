import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Status | Joseph Davis Chamdani",
  description:
    "Real-time status and uptime monitoring for joechamdani.com services.",
  metadataBase: new URL("https://status.joechamdani.com"),
  authors: [{ name: "Joseph Davis Chamdani", url: "https://joechamdani.com" }],
  creator: "Joseph Davis Chamdani",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "https://status.joechamdani.com",
    title: "Status | Joseph Davis Chamdani",
    description:
      "Real-time status and uptime monitoring for joechamdani.com services.",
    siteName: "Joseph Davis Chamdani Status",
  },
  twitter: {
    card: "summary_large_image",
    title: "Status | Joseph Davis Chamdani",
    description:
      "Real-time status and uptime monitoring for joechamdani.com services.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Status | Joseph Davis Chamdani",
  url: "https://status.joechamdani.com",
  description:
    "Real-time status and uptime monitoring for joechamdani.com services.",
  author: {
    "@type": "Person",
    name: "Joseph Davis Chamdani",
    url: "https://joechamdani.com",
    sameAs: [
      "https://linkedin.com/in/joseph-chamdani",
      "https://github.com/JosephDavisC",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://status.joechamdani.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${manrope.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
