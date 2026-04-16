import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Expense Tracker",
  description: "Track family expenses, contributions and settlements",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-950 text-gray-100 min-h-screen font-sora antialiased">
        {children}
      </body>
    </html>
  );
}
