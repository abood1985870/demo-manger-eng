import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

/**
 * Root Layout for the Internal Legal Staff Interface.
 * Handles the application shell, RTL/LTR styling based on user locale,
 * and wraps pages in required authentication/entitlement checks.
 */
export default function LawyerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar role="lawyer" />
      
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Topbar />
        
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
