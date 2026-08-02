import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ModuleAccessGuard } from '@/components/layout/ModuleAccessGuard';
import CommandCenter from '@/components/layout/CommandCenter';
import { AiAssistantWidget } from '@/components/AiAssistantWidget';
import { getSession } from '@/lib/auth';

export default async function DeveloperLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="rusukh-shell">
      <Sidebar
        role={session.role}
        userName={session.name}
        modulePermissions={session.modulePermissions}
      />
      <div className="rusukh-workspace">
        <Topbar />
        <main className="rusukh-main subtle-scroll">
          <ModuleAccessGuard role={session.role} modulePermissions={session.modulePermissions}>
            {children}
          </ModuleAccessGuard>
        </main>
      </div>
      <CommandCenter />
      <AiAssistantWidget />
    </div>
  );
}
