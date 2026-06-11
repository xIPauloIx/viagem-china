import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const noto = Noto_Sans_SC({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-noto' });

export const metadata: Metadata = {
  title: '🇨🇳 China 2026',
  description: 'Planejamento da viagem à China — 30/set a 20/out de 2026',
};

export const viewport: Viewport = {
  themeColor: '#b3242a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${noto.variable} antialiased text-zinc-800`}
        style={{ fontFamily: 'var(--font-inter), var(--font-noto), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
