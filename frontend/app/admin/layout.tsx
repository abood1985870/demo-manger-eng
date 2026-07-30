import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSession, hasPermission } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  
  if (!hasPermission(session.role, ['ADMIN', 'SYSTEM_ADMIN', 'SUPER_ADMIN'])) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200" dir="rtl">
        <h1 className="text-4xl font-bold mb-4 text-red-500">403</h1>
        <p className="text-xl">ليس لديك صلاحية للوصول إلى هذه الصفحة.</p>
      </div>
    );
  }

  return <>{children}</>;
}
