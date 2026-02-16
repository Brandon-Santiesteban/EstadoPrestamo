import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estado de Préstamos y Nómina',
  description: 'Gestión de préstamos, nómina, PDF y envío masivo por correo.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
