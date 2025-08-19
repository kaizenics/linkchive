import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'overview | linkchive.',
  description: 'Manage your links with ease.',
};

export default function CustomerInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}