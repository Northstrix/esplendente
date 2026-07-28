import type { Metadata } from 'next';
import './globals.css';
import { Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Esplendente',
  description: 'Build your Spanish vocabulary with the spaced repetition method — it\'s free, intuitive, and doesn\'t require sign-up. Give it a try!',
  icons: {
    icon: [
      {
        rel: 'icon',
        url: '/logo.webp',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <Suspense fallback={null}>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </Suspense>
      </body>
    </html>
  );
}
