import type { Metadata } from "next";
import { Libre_Baskerville } from 'next/font/google';
import localFont from 'next/font/local';
import "./globals.css";
import StoreProvider from "@/store/Provider";
import ThemeWrapper from "@/components/ThemeWrapper";

const helvena = localFont({
  src: './fonts/Helvena.otf',
  variable: '--font-helvena',
  display: 'swap',
});

const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-libre',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Edvara",
  description: "Enterprise EdTech Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${helvena.variable} ${libreBaskerville.variable}`}>
      <body className="font-helvena antialiased">
        <StoreProvider>
          {/* ThemeWrapper now handles the Navbar and Main layout logic */}
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
        </StoreProvider>
      </body>
    </html>
  );
}