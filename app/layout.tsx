/**
 * VIB34D Design System - Root Layout
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */
import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'VIB34D Design System',
  description: 'Paul Phillips holographic UI design system management interface.'
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
