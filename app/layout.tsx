import type { Metadata, Viewport } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-scorecard",
});

export const metadata: Metadata = {
  title: "Brewers Jersey Bingo",
  description: "Spot the jersey, stamp the square. A room-based bingo game for the ballpark.",
};

export const viewport: Viewport = {
  themeColor: "#0A1F3D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={oswald.variable}>
      <body>{children}</body>
    </html>
  );
}
