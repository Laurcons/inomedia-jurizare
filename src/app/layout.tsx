import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Concursul „Inomedia. Interferențe Spirituale”',
  description: 'Platformă de votare pentru Inomedia',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
