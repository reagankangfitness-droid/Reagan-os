import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Reagan OS",
  description: "Atomic Habits-based daily execution and performance tracking for a solo founder-athlete.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-[#080a0f]">
        {children}
      </body>
    </html>
  );
}
