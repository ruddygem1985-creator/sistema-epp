import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Gestión EPP - Seguridad y Salud Ocupacional",
  description: "Sistema interno para la gestión y control de entrega de Equipos de Protección Personal (EPP) para el departamento de Seguridad y Salud Ocupacional.",
  keywords: ["EPP", "Equipos de Protección Personal", "Seguridad", "Salud Ocupacional", "Gestión"],
  authors: [{ name: "Departamento de Seguridad y Salud Ocupacional" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Sistema de Gestión EPP",
    description: "Gestión y control de entrega de Equipos de Protección Personal",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
