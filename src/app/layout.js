import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700','800','900'] });

export const metadata = {
  title: 'WebScope — Website Intelligence Analyzer',
  description: 'Scrape, analyze, and understand any website — SEO, tech stack, performance, content quality, security, accessibility, and more.',
  openGraph: {
    title: 'WebScope — Website Intelligence Analyzer',
    description: 'Free open-source website analysis tool',
    url: 'https://github.com/aurasqlm/webscope',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${inter.className} bg-transparent text-[#e4e4e7] min-h-screen antialiased`} suppressHydrationWarning>
        <div className="animated-bg"></div>
        {children}
      </body>
    </html>
  );
}
