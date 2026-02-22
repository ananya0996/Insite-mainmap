import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Insite - Housing Market Intelligence for Builders",
  description:
    "Discover profitable housing zip codes across the US with data-driven insights on household income, demographics, employment, and population trends.",
};

export const viewport: Viewport = {
  themeColor: "#ebeef4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      style={{ backgroundColor: "#e8ecf3", color: "#232a36" }}
    >
      <body
        className="font-sans antialiased"
        style={{ backgroundColor: "#e8ecf3", color: "#232a36" }}
      >
        {children}
      </body>
    </html>
  );
}
