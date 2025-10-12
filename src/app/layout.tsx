import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import "remixicon/fonts/remixicon.css";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import { ChatProvider } from "./context/chatcontext"; 

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Campeco",
  description: "Explore Campsites Confidently",
  icons: {
    icon: "/icons/ecolens-icon.svg",
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
      <body className={`${roboto.variable} antialiased`}>
        <ChatProvider> 
          <Navbar />
          {children}
          <Chatbot />
          <Footer />
        </ChatProvider>
      </body>
    </html>
  );
}
