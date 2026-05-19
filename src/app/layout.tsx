import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond, Cormorant_SC } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const cormorantSC = Cormorant_SC({
  variable: "--font-cormorant-sc",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "GunDog Exchange — The Marketplace for Working Dogs",
  description: "Buy and sell trained bird dogs with verified sellers, secure payment, and hunt test data. Built for hunters.",
  openGraph: {
    title: "GunDog Exchange — The Marketplace for Working Dogs",
    description: "Buy and sell trained bird dogs with verified sellers, secure payment, and hunt test data.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${cormorant.variable} ${cormorantSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
