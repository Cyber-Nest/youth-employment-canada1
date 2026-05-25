import type { Metadata } from 'next';
import '@/styles/globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: "Youth Employment Canada - Canada's Youth Employment Network",
  description:
    'Youth Employment Canada connects young Canadians with inclusive employers nationwide. Find jobs, post opportunities, and launch your next career.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
