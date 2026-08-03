import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerTwin — Mentor de carreira com inteligência artificial",
  description:
    "CareerTwin ajuda profissionais brasileiros de tecnologia, produto e design a entender seu perfil e sua aderência a oportunidades, com clareza e evidências.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="overflow-x-hidden font-sans antialiased">
        <NextTopLoader color="hsl(16, 95%, 50%)" height={3} showSpinner={false} />
        <div className="mx-auto max-w-content">{children}</div>
      </body>
    </html>
  );
}
