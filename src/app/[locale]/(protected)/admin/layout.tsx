import { isDemoWebsite } from '@/lib/demo';
import { getSession } from '@/lib/server';
import { notFound } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const isDemo = isDemoWebsite();
  const session = await getSession();
  if (!session || (session.user.role !== 'admin' && !isDemo)) {
    notFound();
  }

  return <>{children}</>;
}
