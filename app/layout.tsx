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
  title: "chat programme",
  description: "실시간 웹소켓 채팅 애플리케이션",
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
