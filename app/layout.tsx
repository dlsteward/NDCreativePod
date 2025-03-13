import type { Metadata } from "next";
import { Roboto, Roboto_Mono, Fredoka } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-geist-sans',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-fredoka-one',
});

export const metadata: Metadata = {
  title: "ND Creative Pod Penpals",
  description: "Join our penpal directory for creative exchanges and friendships.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${robotoMono.variable} ${fredoka.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}