import type { Metadata } from 'next';
import './globals.css';
import './workspace.css';
export const metadata: Metadata = {
  title: 'Gestão de horas | Minsait',
  description:
    'Confira os apontamentos diários da equipe a partir dos PDFs do Dedicaciones.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
