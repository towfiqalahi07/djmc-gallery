import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DJMC 35 Student Gallery',
  description: 'Dark minimal student profile gallery for DJMC Batch 35'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
