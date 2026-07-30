'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import {
  firstAllowedPath,
  moduleForPathname,
  parseModulePermissions,
} from '@/lib/module-permissions';

type ModuleAccessGuardProps = {
  children: ReactNode;
  role: string;
  modulePermissions?: string;
};

export function ModuleAccessGuard({ children, role, modulePermissions }: ModuleAccessGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const permissions = parseModulePermissions(modulePermissions, role);
  const requiredPermission = moduleForPathname(pathname);
  const isAllowed = !requiredPermission || permissions[requiredPermission];
  const redirectPath = firstAllowedPath(permissions);

  useEffect(() => {
    if (!isAllowed) router.replace(redirectPath);
  }, [isAllowed, redirectPath, router]);

  if (!isAllowed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md rounded-3xl border border-amber-500/30 bg-slate-900/90 p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-400" />
          <h1 className="mt-4 text-lg font-bold text-slate-100">لا تملك صلاحية الوصول إلى هذا القسم</h1>
          <p className="mt-2 text-sm leading-7 text-slate-400">سيتم توجيهك إلى أول قسم متاح في مساحة عملك.</p>
        </div>
      </div>
    );
  }

  return children;
}
