import type { Metadata } from "next";
import { Do_Hyeon } from "next/font/google";
import "./globals.css";

const doHyeon = Do_Hyeon({
  variable: "--font-do-hyeon",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chat Programme",
  description: "채팅 프로그램램",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${doHyeon.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
