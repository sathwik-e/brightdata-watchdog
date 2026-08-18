import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Watchdog Dashboard',
  description: 'Real-time emergency supply price gouging detection and anomaly tracking',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
          <Sidebar />
          <main style={{ flex: 1, height: '100vh', overflowY: 'auto', position: 'relative' }}>
            <div className="dot-pattern" />
            <div style={{ position: 'relative', zIndex: 1, padding: '48px 32px', maxWidth: '960px', margin: '0 auto' }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
