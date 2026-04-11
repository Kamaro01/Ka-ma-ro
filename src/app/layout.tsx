import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/index.css';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Ka-ma-ro Official Store',
    template: '%s | Ka-ma-ro',
  },
  description:
    'Shop smartphones and accessories from Ka-ma-ro with MTN and Airtel mobile money checkout in Rwanda.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
