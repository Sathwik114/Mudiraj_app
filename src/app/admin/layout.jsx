import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import AdminShell from '@/components/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const admin = await getAdminSession();
  if (!admin) {
    redirect('/login');
  }

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
