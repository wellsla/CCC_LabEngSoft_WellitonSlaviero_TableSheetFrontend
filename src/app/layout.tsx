
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tablesheet.app'),
  title: {
    default: 'TableSheet - Seu Companheiro de RPG',
    template: '%s | TableSheet',
  },
  description: 'Seu companheiro digital definitivo para gerenciar personagens, regras, e jogos para suas aventuras de RPG de mesa.',
  openGraph: {
    title: 'TableSheet - Seu Companheiro de RPG',
    description: 'Gerencie suas fichas de personagem e campanhas de RPG com facilidade.',
    url: 'https://tablesheet.app',
    siteName: 'TableSheet',
    images: [
      {
        url: 'https://tablesheet.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TableSheet - Seu Companheiro de RPG',
    description: 'Gerencie suas fichas de personagem e campanhas de RPG com facilidade.',
  },
};

export default async function RootLayout({
                                           children,
                                         }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
    <body className={`${geistSans.variable} font-sans`}>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
        </div>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
    </body>
    </html>
  );
}
