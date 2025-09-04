/**
 * VIB3CODE-0 Root Layout
 * 
 * Provides global providers, fonts, and base styling for the
 * holographic AI blog interface
 */

import type { Metadata } from 'next';
import { Orbitron } from 'next/font/google';
import './globals.css';

// Orbitron font for futuristic typography (as specified in PDF)
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-orbitron',
});

export const metadata: Metadata = {
  title: 'VIB3CODE-0 | Holographic AI Blog',
  description: 'Agentic research-and-writing powered blog with holographic transitions and 4D visualizations',
  keywords: ['holographic', 'AI', 'blog', 'VIB34D', 'WebGL', '4D visualization', 'agentic content'],
  authors: [{ name: 'VIB3CODE Research Division' }],
  openGraph: {
    title: 'VIB3CODE-0 Holographic AI Blog',
    description: 'Experience the future of AI content through advanced holographic interfaces',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VIB3CODE-0 Holographic AI Blog',
    description: 'Agentic AI blog with holographic transitions and 4D visualizations',
  },
};

// Modern Next.js viewport configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${orbitron.variable}`}>
      <head>
        {/* Performance hints for Google Fonts */}
        
        {/* Viewport meta for mobile optimization */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Performance hints */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${orbitron.className} antialiased`}>
        {/* Global loading indicator for holographic initialization */}
        <div id="global-loading" className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="holographic-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-text font-orbitron text-cyan-400">
              Initializing Holographic Interface...
            </div>
          </div>
        </div>
        
        {/* Main application content */}
        <main className="relative min-h-screen overflow-hidden">
          {children}
        </main>
        
        {/* Performance monitoring script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring for WebGL contexts
              window.vib3perf = {
                webglContexts: 0,
                maxContexts: 4,
                startTime: Date.now(),
                log: function(msg) {
                  if (typeof console !== 'undefined') {
                    console.log('[VIB3PERF]', msg);
                  }
                }
              };
              
              // Hide loading when DOM is ready
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                  const loading = document.getElementById('global-loading');
                  if (loading) {
                    loading.style.opacity = '0';
                    setTimeout(() => loading.style.display = 'none', 1000);
                  }
                }, 2000);
              });
            `,
          }}
        />
      </body>
    </html>
  );
}