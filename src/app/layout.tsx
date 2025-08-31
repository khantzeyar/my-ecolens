import type { Metadata } from "next";
import {Roboto} from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import "remixicon/fonts/remixicon.css"; 
import Footer from "./components/Footer";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "MyEcoLens",
  description: "Explore Campsites Confidently",
  icons: {
    icon: "/icons/ecolens-icon.svg", // path relative to public folder
    shortcut: "/icons/ecolens-icon.svg",
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
        className={`${roboto.variable} antialiased`}
      >
        <Navbar></Navbar>
        {children}
        <Footer></Footer>
      </body>
    </html>
  );
}
