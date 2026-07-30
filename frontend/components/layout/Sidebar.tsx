'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Building2,
  CalendarRange,
  ChevronLeft,
  CircleDollarSign,
  FileCheck2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { ModulePermissionKey, parseModulePermissions } from '@/lib/module-permissions';

const menuItems = [
  { name: 'نظرة تنفيذية', href: '/dashboard', icon: LayoutDashboard, permission: 'dashboard' },
  { name: 'المشاريع', href: '/matters', icon: Building2, permission: 'projects' },
  { name: 'الجدول الزمني', href: '/litigation', icon: CalendarRange, permission: 'timeline' },
  { name: 'التكاليف', href: '/billing', icon: WalletCards, permission: 'billing' },
  { name: 'المبيعات والتحصيل', href: '/clients', icon: CircleDollarSign, permission: 'clients' },
  { name: 'التراخيص والامتثال', href: '/compliance', icon: ShieldCheck, permission: 'compliance' },
  { name: 'العقود', href: '/contracts', icon: FileText, permission: 'contracts' },
  { name: 'المستندات والقوالب', href: '/templates', icon: FileCheck2, permission: 'documents' },
  { name: 'الفريق والصلاحيات', href: '/users', icon: Users, permission: 'team' },
  { name: 'التقارير', href: '/dashboard#reports', icon: BarChart3, permission: 'reports' },
  { name: 'الإعدادات', href: '/settings', icon: Settings, permission: 'settings' },
] satisfies Array<{
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  permission: ModulePermissionKey;
}>;

type SidebarProps = {
  role: string;
  userName: string;
  modulePermissions?: string;
};

export function Sidebar({ role, userName, modulePermissions }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const normalizedRole = role.toLowerCase();
  const permissions = parseModulePermissions(modulePermissions, role);
  const visibleMenuItems = menuItems
    .filter((item) => permissions[item.permission])
    .map((item) => (
      item.href === '/settings' && ['superadmin', 'super_admin'].includes(normalizedRole)
        ? { ...item, href: '/admin/settings' }
        : item
    ));

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    sessionStorage.clear();
    router.replace('/login');
  }

  return (
    <>
      <button
        type="button"
        aria-label="فتح القائمة"
        onClick={() => setMobileMenuOpen(true)}
        className="rusukh-mobile-menu"
      >
        <Menu />
      </button>
      {mobileMenuOpen ? (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={() => setMobileMenuOpen(false)}
          className="rusukh-sidebar-backdrop"
        />
      ) : null}
      <aside className={`rusukh-sidebar ${mobileMenuOpen ? 'rusukh-sidebar--open' : ''}`}>
        <div className="rusukh-brand">
          <Link href="/dashboard" aria-label="رُسوخ — النظرة التنفيذية">
            <span className="rusukh-brand-mark" aria-hidden="true"><Building2 /></span>
            <span><b>رُسوخ</b><small>قيادة التطوير العقاري</small></span>
          </Link>
          <button type="button" aria-label="إغلاق القائمة" onClick={() => setMobileMenuOpen(false)}>
            <X />
          </button>
        </div>

        <nav aria-label="التنقل الرئيسي">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.href.includes('#') && item.href === pathname;
            return (
              <Link
                key={`${item.permission}-${item.href}`}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={isActive ? 'active' : ''}
              >
                <Icon />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="rusukh-sidebar-footer">
          <div>
            <i>{userName.trim().charAt(0) || 'ر'}</i>
            <span>
              <b>{userName}</b>
              <small>بيئة الشركة الخاصة</small>
            </span>
          </div>
          <button type="button" onClick={() => void handleLogout()}>
            <LogOut /> تسجيل الخروج
          </button>
          <span>الإصدار 2.0 · بيئة محلية آمنة <ChevronLeft /></span>
        </div>
      </aside>
    </>
  );
}
